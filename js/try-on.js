import {
  FaceLandmarker,
  FilesetResolver,
} from "/assets/vendor/mediapipe/vision_bundle.js";

const TRACKING_HINT = "Move into the frame and look straight ahead";
const CAMERA_REQUEST_TIMEOUT_MS = 15000;
const CAMERA_FRAME_TIMEOUT_MS = 10000;
const TRACKER_TIMEOUT_MS = 30000;

const MASKS = [
  { id: "ruby-dune", asset: "/assets/ar/ruby-dune-mask.png", scale: 1.48, anchorY: .79, offsetX: 0, offsetY: -.02 },
  { id: "black-bird-eye", asset: "/assets/ar/black-bird-eye-mask.png", scale: 1.48, anchorY: .76, offsetX: 0, offsetY: -.02 },
  { id: "black-fire", asset: "/assets/ar/black-fire-mask.png", scale: 1.52, anchorY: .77, offsetX: 0, offsetY: -.03 },
  { id: "deep-ocean", asset: "/assets/ar/deep-ocean-mask.png", scale: 1.5, anchorY: .77, offsetX: 0, offsetY: -.02 },
  { id: "electric-fire", asset: "/assets/ar/electric-fire-mask.png", scale: 1.55, anchorY: .78, offsetX: 0, offsetY: -.03 },
  { id: "wine-heart", asset: "/assets/ar/wine-heart-mask.png", scale: 1.53, anchorY: .78, offsetX: .02, offsetY: -.03 },
];

const products = window.ASPECT_PRODUCTS || [];
const productById = new Map(products.map((product) => [product.id, product]));
const maskById = new Map(MASKS.map((mask) => [mask.id, mask]));

const canvas = document.getElementById("camera-canvas");
const ctx = canvas.getContext("2d", { alpha: true });
const video = document.getElementById("camera-video");
const permissionCard = document.getElementById("permission-card");
const startButton = document.getElementById("start-camera-btn");
const retryButton = document.getElementById("retry-camera-btn");
const errorPanel = document.getElementById("try-on-error");
const errorCopy = document.getElementById("try-on-error-copy");
const hint = document.getElementById("tracking-hint");
const picker = document.getElementById("mask-picker");
const selectedName = document.getElementById("selected-mask-name");
const captureButton = document.getElementById("capture-btn");
const androidCameraNote = document.getElementById("android-camera-note");

const isAndroid = /Android/i.test(navigator.userAgent);
const isEmbeddedBrowser = /; wv\)|Instagram|FBAN|FBAV|Telegram/i.test(navigator.userAgent);

if (isAndroid) androidCameraNote.hidden = false;

let faceLandmarker = null;
let stream = null;
let animationFrame = 0;
let selectedMask = null;
let selectedImage = null;
let lastVideoTime = -1;
let lastFaceSeenAt = 0;
let smoothPose = null;
let latestPose = null;

function productName(id) {
  return productById.get(id)?.name || id;
}

function productThumb(id) {
  const product = productById.get(id);
  const image = product?.media?.find((item) => item.type === "image" && item.src);
  return image ? `/assets/products/${id}/${image.src}` : "/assets/brand/og-cover.jpg";
}

function buildPicker() {
  picker.innerHTML = MASKS.map((mask) => `
    <button class="mask-option" type="button" data-mask-id="${mask.id}" aria-label="Try ${productName(mask.id)}">
      <img src="${productThumb(mask.id)}" alt="" loading="lazy" />
    </button>
  `).join("");

  picker.querySelectorAll(".mask-option").forEach((button) => {
    button.addEventListener("click", () => selectMask(button.dataset.maskId));
  });
}

async function selectMask(id) {
  const nextMask = maskById.get(id) || MASKS[0];
  selectedMask = nextMask;
  selectedName.textContent = productName(nextMask.id);
  picker.querySelectorAll(".mask-option").forEach((button) => {
    button.classList.toggle("active", button.dataset.maskId === nextMask.id);
  });

  const image = new Image();
  image.decoding = "async";
  image.src = nextMask.asset;
  try {
    await image.decode();
    if (selectedMask === nextMask) selectedImage = image;
  } catch (_error) {
    if (selectedMask === nextMask) selectedImage = null;
  }

  const url = new URL(location.href);
  url.searchParams.set("mask", nextMask.id);
  history.replaceState({}, "", url);
}

function showError(message) {
  permissionCard.hidden = true;
  errorCopy.textContent = message;
  errorPanel.hidden = false;
  stopCamera();
}

function withTimeout(promise, milliseconds, errorName, errorMessage) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      const error = new Error(errorMessage);
      error.name = errorName;
      reject(error);
    }, milliseconds);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
}

async function requestCamera() {
  // Start with the least restrictive constraints. Some Android camera stacks can
  // stall while negotiating an ideal resolution before returning a stream.
  const request = navigator.mediaDevices.getUserMedia({
    audio: false,
    video: { facingMode: { ideal: "user" } },
  });

  try {
    return await withTimeout(
      request,
      CAMERA_REQUEST_TIMEOUT_MS,
      "CameraRequestTimeoutError",
      "Camera permission was granted, but Android did not return a camera stream"
    );
  } catch (error) {
    if (error?.name === "CameraRequestTimeoutError") {
      // getUserMedia cannot be cancelled. Stop a stream if Android eventually
      // resolves the abandoned request after our timeout.
      request.then((lateStream) => {
        lateStream.getTracks().forEach((track) => track.stop());
      }).catch(() => {});
    }
    throw error;
  }
}

function waitForVideoFrame() {
  if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth > 0) {
    return Promise.resolve();
  }

  const ready = new Promise((resolve, reject) => {
    let pollId;
    let timeoutId;
    const events = ["loadedmetadata", "loadeddata", "canplay", "playing", "resize"];
    const cleanup = () => {
      clearInterval(pollId);
      clearTimeout(timeoutId);
      events.forEach((eventName) => video.removeEventListener(eventName, check));
      video.removeEventListener("error", fail);
    };
    const check = () => {
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth > 0) {
        cleanup();
        resolve();
      }
    };
    const fail = () => {
      cleanup();
      reject(video.error || new Error("The camera video element failed"));
    };

    events.forEach((eventName) => video.addEventListener(eventName, check));
    video.addEventListener("error", fail, { once: true });
    pollId = setInterval(check, 100);
    timeoutId = setTimeout(() => {
      const error = new Error("The camera opened, but no video frame arrived");
      error.name = "CameraFrameTimeoutError";
      cleanup();
      reject(error);
    }, CAMERA_FRAME_TIMEOUT_MS);
    check();
  });

  return ready;
}

function sizeCanvasToVideo() {
  const settings = stream?.getVideoTracks?.()[0]?.getSettings?.() || {};
  const width = video.videoWidth || settings.width || 720;
  const height = video.videoHeight || settings.height || 1280;
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
}

async function createTracker() {
  if (faceLandmarker) return faceLandmarker;
  const vision = await FilesetResolver.forVisionTasks(
    "/assets/vendor/mediapipe/wasm"
  );

  const options = {
    baseOptions: {
      modelAssetPath: "/assets/vendor/mediapipe/face_landmarker.task",
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numFaces: 1,
    minFaceDetectionConfidence: .55,
    minFacePresenceConfidence: .55,
    minTrackingConfidence: .55,
  };

  try {
    faceLandmarker = await FaceLandmarker.createFromOptions(vision, options);
  } catch (_gpuError) {
    options.baseOptions.delegate = "CPU";
    faceLandmarker = await FaceLandmarker.createFromOptions(vision, options);
  }
  return faceLandmarker;
}

async function startCamera() {
  let cameraStarted = false;
  startButton.disabled = true;
  startButton.textContent = "starting camera…";
  retryButton.disabled = true;
  errorPanel.hidden = true;

  if (!navigator.mediaDevices?.getUserMedia) {
    showError("This browser cannot access the camera. Open the preview in Safari or Chrome over HTTPS.");
    startButton.disabled = false;
    startButton.textContent = "enable camera";
    retryButton.disabled = false;
    return;
  }

  try {
    const cameraStream = await requestCamera();
    stream = cameraStream;
    cameraStarted = true;

    video.srcObject = stream;
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;
    document.getElementById("try-on-app").classList.add("camera-active");

    // On some Xiaomi/Android Chrome builds video.play() starts the camera (the
    // green privacy dot appears) but its Promise never resolves. Do not await
    // that Promise; wait for an actual decoded frame instead.
    const playResult = video.play();
    if (playResult?.catch) playResult.catch(() => {});

    permissionCard.hidden = true;
    captureButton.disabled = true;
    hint.textContent = "Starting camera…";
    hint.hidden = false;
    lastVideoTime = -1;
    smoothPose = null;
    latestPose = null;
    animationFrame = requestAnimationFrame(renderLoop);

    await waitForVideoFrame();
    if (!stream) return;
    sizeCanvasToVideo();
    hint.textContent = "Loading face tracking…";

    faceLandmarker = await withTimeout(
      createTracker(),
      TRACKER_TIMEOUT_MS,
      "TrackerTimeoutError",
      "Face tracker loading timed out"
    );
    if (!stream) return;
    captureButton.disabled = false;
    hint.textContent = TRACKING_HINT;
  } catch (error) {
    const denied = error?.name === "NotAllowedError" || error?.name === "PermissionDeniedError";
    const busy = error?.name === "NotReadableError" || error?.name === "AbortError";
    if (error?.name === "TrackerTimeoutError") {
      showError("Face tracking could not finish loading. Check your connection, reload the page, and try again.");
    } else if (error?.name === "CameraFrameTimeoutError") {
      showError("The camera opened, but Android did not send video frames. Close other apps using the camera, fully close Chrome, reopen it, and try again.");
    } else if (error?.name === "CameraRequestTimeoutError") {
      showError("Android did not finish opening the camera. Close other camera apps, reload Chrome, and try again.");
    } else if (cameraStarted || busy) {
      showError("The camera opened but could not start video. Close other apps using the camera, reload Chrome, and try again.");
    } else {
      showError(denied
        ? (isAndroid
          ? `Android blocked the camera prompt${isEmbeddedBrowser ? " in this in-app browser" : ""}. Close floating bubbles or Quick Ball, open this page in Chrome (menu ⋮ → Open in browser), then try again.`
          : "Camera access was declined. Allow camera access for this site in your browser settings, then try again.")
        : "We could not start the camera on this device. Close other camera apps and try again."
      );
    }
  } finally {
    startButton.disabled = false;
    startButton.textContent = "enable camera";
    retryButton.disabled = false;
  }
}

function lerpAngle(from, to, amount) {
  let delta = to - from;
  while (delta > Math.PI) delta -= Math.PI * 2;
  while (delta < -Math.PI) delta += Math.PI * 2;
  return from + delta * amount;
}

function smooth(next) {
  if (!smoothPose) {
    smoothPose = next;
    return next;
  }
  const amount = .34;
  smoothPose.x += (next.x - smoothPose.x) * amount;
  smoothPose.y += (next.y - smoothPose.y) * amount;
  smoothPose.width += (next.width - smoothPose.width) * amount;
  smoothPose.angle = lerpAngle(smoothPose.angle, next.angle, amount);
  return smoothPose;
}

function poseFromLandmarks(landmarks) {
  const leftCheek = landmarks[234];
  const rightCheek = landmarks[454];
  const leftEye = landmarks[33];
  const rightEye = landmarks[263];
  if (!leftCheek || !rightCheek || !leftEye || !rightEye) return null;

  const width = Math.hypot(
    (rightCheek.x - leftCheek.x) * canvas.width,
    (rightCheek.y - leftCheek.y) * canvas.height
  );
  return smooth({
    x: ((leftEye.x + rightEye.x) * .5) * canvas.width,
    y: ((leftEye.y + rightEye.y) * .5) * canvas.height,
    width,
    angle: Math.atan2(
      (rightEye.y - leftEye.y) * canvas.height,
      (rightEye.x - leftEye.x) * canvas.width
    ),
  });
}

function drawMask(pose) {
  if (!selectedImage || !selectedMask || !pose) return;
  const width = pose.width * selectedMask.scale;
  const height = width * (selectedImage.naturalHeight / selectedImage.naturalWidth);

  ctx.save();
  ctx.translate(
    pose.x + pose.width * selectedMask.offsetX,
    pose.y + pose.width * selectedMask.offsetY
  );
  ctx.rotate(pose.angle);
  ctx.drawImage(
    selectedImage,
    -width * .5,
    -height * selectedMask.anchorY,
    width,
    height
  );
  ctx.restore();
}

function renderLoop(now) {
  if (!stream || video.readyState < 2) {
    animationFrame = requestAnimationFrame(renderLoop);
    return;
  }

  sizeCanvasToVideo();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!faceLandmarker) {
    animationFrame = requestAnimationFrame(renderLoop);
    return;
  }
  if (video.currentTime !== lastVideoTime) {
    lastVideoTime = video.currentTime;
    const result = faceLandmarker.detectForVideo(video, now);
    const landmarks = result.faceLandmarks?.[0];
    if (landmarks) {
      latestPose = poseFromLandmarks(landmarks);
      if (latestPose) lastFaceSeenAt = now;
    } else if (now - lastFaceSeenAt > 180) {
      latestPose = null;
      smoothPose = null;
    }
  }

  drawMask(latestPose);
  const hasFace = Boolean(latestPose);
  hint.hidden = hasFace || now - lastFaceSeenAt < 450;
  animationFrame = requestAnimationFrame(renderLoop);
}

function stopCamera() {
  cancelAnimationFrame(animationFrame);
  animationFrame = 0;
  if (stream) stream.getTracks().forEach((track) => track.stop());
  stream = null;
  video.srcObject = null;
  document.getElementById("try-on-app").classList.remove("camera-active");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  latestPose = null;
  smoothPose = null;
  captureButton.disabled = true;
}

async function capturePhoto() {
  if (!stream) return;
  const output = document.createElement("canvas");
  output.width = canvas.width;
  output.height = canvas.height;
  const outputContext = output.getContext("2d");
  outputContext.translate(output.width, 0);
  outputContext.scale(-1, 1);
  outputContext.drawImage(video, 0, 0, output.width, output.height);
  outputContext.drawImage(canvas, 0, 0);

  const blob = await new Promise((resolve) => output.toBlob(resolve, "image/jpeg", .92));
  if (!blob) return;
  const file = new File([blob], `aspect-${selectedMask.id}-try-on.jpg`, { type: "image/jpeg" });
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: `${productName(selectedMask.id)} — ASPECT` });
      return;
    } catch (error) {
      if (error?.name === "AbortError") return;
    }
  }

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = file.name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

buildPicker();
const requestedMask = new URLSearchParams(location.search).get("mask");
selectMask(maskById.has(requestedMask) ? requestedMask : MASKS[0].id);

startButton.addEventListener("click", startCamera);
retryButton.addEventListener("click", startCamera);
captureButton.addEventListener("click", capturePhoto);
window.addEventListener("pagehide", stopCamera);
