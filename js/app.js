/* =========================================================================
   ASPECT — page logic (no build step, no dependencies, plain JS)
   ========================================================================= */

(function () {
  "use strict";

  const igLink = (extra) =>
    `https://ig.me/m/${encodeURIComponent(SITE.instagramUsername)}`;

  // ---------- GA4 + Meta Pixel event tracking ----------
  // Small guard wrappers: gtag / fbq may be missing (ad blocker, offline script load
  // failure) — never let analytics break the page.
  function track(name, params) {
    if (typeof window.gtag === "function") {
      window.gtag("event", name, params || {});
    }
  }
  // isStandard=true uses fbq('track', ...) for Meta's built-in event names (ViewContent,
  // InitiateCheckout, Contact, ...) — these feed Meta's ad tools (retargeting, lookalikes).
  // isStandard=false uses fbq('trackCustom', ...) for our own event names, mirroring the
  // GA4 events above one-for-one.
  function fbTrack(name, params, isStandard) {
    if (typeof window.fbq === "function") {
      window.fbq(isStandard ? "track" : "trackCustom", name, params || {});
    }
  }
  // pulls a plain number out of a price string like "$ 255" — used for Meta's value/currency
  // event params, which power ad-spend optimization
  function parsePrice(priceStr) {
    if (!priceStr) return undefined;
    const n = parseFloat(String(priceStr).replace(/[^0-9.]/g, ""));
    return isNaN(n) ? undefined : n;
  }

  // ---------- fill in text from config.js ----------
  document.getElementById("footer-ig-link").textContent = SITE.instagramHandleDisplay;
  document.getElementById("footer-ig-link").href = igLink();
  document.getElementById("footer-ig-link").addEventListener("click", () => {
    track("contact_click", { source: "footer" });
    fbTrack("Contact", { source: "footer" }, true);
  });
  document.getElementById("question-ig-link").href = igLink();
  document.getElementById("question-ig-link").addEventListener("click", () => {
    track("contact_click", {
      source: "product_modal",
      product_id: currentProduct ? currentProduct.id : null,
      product_name: currentProduct ? currentProduct.name : null,
    });
    fbTrack("Contact", {
      source: "product_modal",
      product_id: currentProduct ? currentProduct.id : null,
    }, true);
  });

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saveDataEnabled = Boolean(navigator.connection?.saveData);
  if (!prefersReducedMotion) document.documentElement.classList.add("motion-enabled");
  const heroMediaSlot = document.getElementById("hero-photo-img-slot");

  if (SITE.heroVideoMp4 && !prefersReducedMotion && !saveDataEnabled) {
    heroMediaSlot.innerHTML = `<video class="hero-video" autoplay muted loop playsinline preload="auto" poster="${SITE.heroPhoto || ""}" aria-label="Model wearing an ASPECT mask">
      ${SITE.heroVideoWebm ? `<source src="${SITE.heroVideoWebm}" type="video/webm" />` : ""}
      <source src="${SITE.heroVideoMp4}" type="video/mp4" />
    </video>`;
  } else if (SITE.heroPhoto) {
    heroMediaSlot.innerHTML =
      `<img class="hero-photo-frame is-active" src="${SITE.heroPhoto}" alt="Model wearing an ASPECT mask — eyes visible through the design" />`;
  }
  // else: leave the CSS placeholder (photo not shot yet) as-is

  document.getElementById("hero-title").textContent = SITE.heroTitle;
  document.getElementById("hero-subtitle").textContent = SITE.heroSubtitle;

  document.getElementById("hero-tagline-lines").innerHTML = SITE.heroTaglineLines
    .map((line) => `<p>${line}</p>`)
    .join("");

  document.getElementById("hero-scarcity-number").textContent = SITE.heroScarcityNumber;

  document.getElementById("order-title").textContent = SITE.orderPopupTitle;
  document.getElementById("order-explainer").textContent = SITE.orderPopupExplainer;

  const artistVideo = document.getElementById("artist-video");
  if (artistVideo && "IntersectionObserver" in window && !prefersReducedMotion && !saveDataEnabled) {
    const artistVideoObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) artistVideo.play().catch(() => {});
        else artistVideo.pause();
      });
    }, { threshold: 0.45 });
    artistVideoObserver.observe(artistVideo);
  }

  // ---------- sold archive + verified industry proof ----------
  const archiveItems = Array.isArray(window.ASPECT_ARCHIVE) ? window.ASPECT_ARCHIVE : [];
  const archiveGrid = document.getElementById("archive-grid");
  const archiveLightbox = document.getElementById("archive-lightbox");
  const archiveLightboxImage = document.getElementById("archive-lightbox-image");
  const archiveLightboxName = document.getElementById("archive-lightbox-name");

  function closeArchiveLightbox() {
    archiveLightbox?.classList.remove("open");
    archiveLightbox?.setAttribute("aria-hidden", "true");
    if (archiveLightboxImage) archiveLightboxImage.src = "";
  }

  if (archiveGrid && archiveItems.length) {
    archiveGrid.innerHTML = archiveItems.map((piece, index) => `
      <button class="archive-piece" type="button" data-archive-index="${index}">
        <img src="${piece.src}" width="${piece.width}" height="${piece.height}" alt="${piece.name}, a sold one-of-one ASPECT mask" loading="lazy" decoding="async" />
        <span>${piece.name}</span>
      </button>`).join("");

    archiveGrid.addEventListener("click", (event) => {
      const button = event.target.closest(".archive-piece");
      if (!button) return;
      const piece = archiveItems[Number(button.dataset.archiveIndex)];
      if (!piece) return;
      archiveLightboxImage.src = piece.src;
      archiveLightboxImage.alt = `${piece.name}, a sold one-of-one ASPECT mask`;
      archiveLightboxName.textContent = `${piece.name} · sold`;
      archiveLightbox.classList.add("open");
      archiveLightbox.setAttribute("aria-hidden", "false");
      track("archive_piece_open", { piece_name: piece.name });
    });
  } else {
    document.querySelector(".archive-section")?.setAttribute("hidden", "");
  }

  document.getElementById("archive-lightbox-close")?.addEventListener("click", closeArchiveLightbox);
  archiveLightbox?.addEventListener("click", (event) => {
    if (event.target === archiveLightbox) closeArchiveLightbox();
  });
  const asSeenModal = document.getElementById("as-seen-modal");
  const asSeenEmbed = document.getElementById("as-seen-embed");
  const asSeenInstagramLink = document.getElementById("as-seen-instagram-link");

  function closeAsSeenModal() {
    asSeenModal?.classList.remove("open");
    asSeenModal?.setAttribute("aria-hidden", "true");
    document.body.classList.remove("as-seen-modal-open");
    if (asSeenEmbed) asSeenEmbed.src = "";
  }

  document.querySelectorAll(".as-seen-card").forEach((card) => {
    card.addEventListener("click", () => {
      if (asSeenEmbed && asSeenModal) {
        asSeenEmbed.src = card.dataset.embed;
        asSeenEmbed.title = `${card.dataset.proof} on Instagram`;
        asSeenInstagramLink.href = card.dataset.instagramUrl;
        asSeenModal.classList.add("open");
        asSeenModal.setAttribute("aria-hidden", "false");
        document.body.classList.add("as-seen-modal-open");
      }
      track("as_seen_open", { proof_name: card.dataset.proof });
      fbTrack("AsSeenOpen", { proof_name: card.dataset.proof }, false);
    });
  });
  document.getElementById("as-seen-modal-close")?.addEventListener("click", closeAsSeenModal);
  asSeenModal?.addEventListener("click", (event) => {
    if (event.target === asSeenModal) closeAsSeenModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && asSeenModal?.classList.contains("open")) closeAsSeenModal();
  });

  // ---------- helpers ----------
  // Root-absolute so it resolves the same whether the current page is "/"
  // (homepage) or a nested static product page like "/products/<id>" —
  // see js/app.js routing changes, session #10 (2026-07-28).
  function mediaPath(productId, filename) {
    return `/assets/products/${productId}/${filename}`;
  }

  // Real per-product URL path, WITH trailing slash — matches what GitHub
  // Pages actually serves (products/<id>/index.html), so pushState/share
  // links never trigger the host's own no-slash→slash redirect (session
  // #12, 2026-07-29 trailing-slash cleanup; vercel.json — the old reasoning
  // for the no-slash form — was removed since GitHub Pages, not Vercel,
  // serves this site).
  function productPath(id) {
    return `/products/${id}/`;
  }

  // Returns the loading/fetchpriority attributes for a slide image: the FIRST slide is
  // what's on screen the instant the modal opens (the LCP candidate for this whole page),
  // so it must load eagerly and with high priority — loading="lazy" on it was actively
  // delaying LCP (PageSpeed Insights flagged this exact element, 2026-07-29: "Не
  // используйте loading=lazy для ресурсов LCP" / "Требуется fetchpriority=high"). Every
  // other slide keeps loading="lazy" as before, since it's genuinely off-screen at open.
  // FIX (2026-07-29, same day): the first version of this dropped decoding="async" for
  // the eager branch, which made the browser decode this (large, full-res) photo
  // SYNCHRONOUSLY on the main thread right as app.js is also busy building the whole
  // grid+modal DOM — measured on the live site via repeated PageSpeed Insights mobile
  // runs: LCP got WORSE after the fetchpriority fix shipped (4.9s baseline → consistently
  // 5.9-7.4s across 4 runs), while CLS's one bad reading (0.347) turned out to be lab
  // noise (layout-shift-culprits table showed only 0.006 total real shift, and reran at
  // 0.004 then 0 on two follow-up passes — no fix needed there). decoding="async" costs
  // nothing (doesn't affect fetch priority or when the image starts downloading) and
  // lets the browser paint without blocking on decode — restoring it here.
  function slideImgAttrs(isFirst) {
    return isFirst ? `fetchpriority="high" decoding="async"` : `loading="lazy" decoding="async"`;
  }

  function slideHTML(product, item, isFirst) {
    // "fit" slides: full-bleed on-mannequin photo with objection-handling bullets overlaid
    // at the bottom (fit / comfort / travel). Added 2026-08-08 — replaces the old hero-video
    // slot (slide 2) per Lena's new 8-slide card sequence, see
    // slide2-fit-slide-template-spec.md (Claude Project doc). Bullet copy is the same on
    // every product; the photo crop (scale + transform-origin) is calibrated per product,
    // same idea as text-slide's focusY — see that spec for how to calibrate a new product.
    if (item.type === "fit") {
      const bgSrc = item.src ? mediaPath(product.id, item.src) : null;
      const bullets = item.bullets || [];
      const scale = item.scale != null ? item.scale : 1.1;
      const originX = item.originX != null ? item.originX : 50;
      const originY = item.originY != null ? item.originY : 100;
      const photoStyle = ` style="transform:scale(${scale}); transform-origin:${originX}% ${originY}%;"`;
      return `<div class="carousel-slide"><div class="fit-slide">
        ${bgSrc ? `<img src="${bgSrc}" alt="${item.alt || `${product.name} — ${item.slot}`}"${photoStyle} ${slideImgAttrs(isFirst)} />` : ""}
        <div class="fit-slide-scrim"></div>
        <div class="fit-slide-content">
          ${bullets.length ? `<ul class="fit-slide-bullets">${bullets.map((b) => `<li><span class="fit-strong">${b.strong}</span><span class="fit-dim">${b.dim}</span></li>`).join("")}</ul>` : ""}
        </div>
      </div></div>`;
    }

    // "text" slides: photo strip up top (src, ~54% of slide height), then the "aspect" watermark,
    // then left-aligned bullets. Redesigned 2026-07-28 — heading/subheading dropped entirely.
    if (item.type === "text") {
      const bgSrc = item.src ? mediaPath(product.id, item.src) : null;
      const bullets = item.bullets || [];
      // focusY: per-photo eye-position calibration (see text-slide-template-spec.md).
      // Defaults to 41% (ruby-dune's value) when a product doesn't specify one.
      const focusY = item.focusY != null ? item.focusY : 41;
      // scale: normally the fixed 1.81 shared by every product — only override per-product
      // when a photo's composition genuinely needs a different crop tightness (explicit
      // per-item `scale` field on the text-slide entry in products.js).
      const scale = item.scale != null ? item.scale : 1.81;
      const focusStyle = ` style="object-position:center ${focusY}%; transform-origin:center ${focusY}%; transform:scale(${scale});"`;
      return `<div class="carousel-slide"><div class="text-slide">
        ${bgSrc ? `<div class="text-slide-photo"><img src="${bgSrc}" alt=""${focusStyle} /><div class="text-slide-photo-scrim"></div></div>` : ""}
        <img class="text-slide-watermark" src="/assets/brand/logo-mark.png" alt="" aria-hidden="true" />
        <div class="text-slide-content">
          ${bullets.length ? `<ul class="text-slide-bullets">${bullets.map((b) => `<li>${b}</li>`).join("")}</ul>` : ""}
        </div>
      </div></div>`;
    }

    // "proof" slides: full-bleed process photo (proof of handmade craft) with a short text
    // overlay at the bottom. Added 2026-07-28, sits right after the text slide. Same heading/
    // bodyLines on every product — only the background photo changes.
    if (item.type === "proof") {
      const bgSrc = item.src ? mediaPath(product.id, item.src) : null;
      if (!bgSrc) {
        return `<div class="carousel-slide"><div class="placeholder-slide">
          <span class="ph-icon">📷</span>
          <span class="ph-label">${item.slot}</span>
          <span>add file to<br>assets/products/${product.id}/</span>
        </div></div>`;
      }
      const bodyLines = item.bodyLines || [];
      return `<div class="carousel-slide"><div class="proof-slide">
        <img src="${bgSrc}" alt="${item.alt || `${product.name} — ${item.slot}`}" ${slideImgAttrs(isFirst)} />
        <div class="proof-slide-scrim"></div>
        <div class="proof-slide-content">
          ${item.heading ? `<p class="proof-slide-heading">${item.heading}</p>` : ""}
          <div class="proof-slide-body">${bodyLines.map((l) => `<p>${l}</p>`).join("")}</div>
        </div>
      </div></div>`;
    }

    if (!item.src) {
      return `<div class="carousel-slide"><div class="placeholder-slide">
        <span class="ph-icon">${item.type === "video" ? "🎬" : "📷"}</span>
        <span class="ph-label">${item.slot}</span>
        <span>add file to<br>assets/products/${product.id}/</span>
      </div></div>`;
    }
    const src = mediaPath(product.id, item.src);

    if (item.type === "cta") {
      return `<div class="carousel-slide"><div class="cta-slide">
        <img src="${src}" alt="${item.alt || `${product.name} — ${item.slot}`}" ${slideImgAttrs(isFirst)} />
        <div class="cta-slide-overlay">
          <p class="cta-slide-title">${item.ctaTitle || product.name}</p>
          <p class="cta-slide-sub">${item.ctaSub || "Tap “Order this piece” below to make it yours."}</p>
        </div>
      </div></div>`;
    }

    // Analytics-led final slide from Lena's 8-slide sequence. It shares the
    // early CTA layout and adds one quiet shipping reassurance at the end.
    if (item.type === "finalcta") {
      return `<div class="carousel-slide"><div class="cta-slide finalcta-slide">
        <img src="${src}" alt="${item.alt || `${product.name} — ${item.slot}`}" ${slideImgAttrs(isFirst)} />
        <div class="cta-slide-overlay">
          <p class="cta-slide-title">${item.ctaTitle || product.name}</p>
          <p class="cta-slide-sub">${item.ctaSub || ""}</p>
          ${item.caption ? `<p class="finalcta-slide-caption">${item.caption}</p>` : ""}
        </div>
      </div></div>`;
    }

    if (item.type === "video") {
      // offer webm (same filename, .webm) first for browsers that support it, mp4/H.264 as the
      // universally-compatible fallback (Safari/iOS in particular needs the mp4 source)
      const webmSrc = mediaPath(product.id, item.src.replace(/\.mp4$/i, ".webm"));
      // NOTE (speed audit, 2026-07-29): <source> tags are deliberately NOT rendered
      // here — see activateSlideMedia() below. Rendering every video's sources upfront
      // made all 3 video slides in the 14-slide carousel start downloading (autoplay)
      // the instant the modal opened, even ones the visitor hadn't scrolled to yet —
      // PageSpeed Insights measured ~20MB fetched on first paint of a product page,
      // almost entirely these unseen videos. activateSlideMedia() attaches the real
      // <source> only for the current slide ± 1 neighbor, so each video still starts
      // playing itself the moment it's reached (or the slide right before it) — the
      // visible experience is unchanged, only the network timing is fixed. No change
      // to picture/video quality, encoding, or card layout.
      return `<div class="carousel-slide"><video muted loop playsinline preload="none" data-webm="${webmSrc}" data-mp4="${src}"></video></div>`;
    }
    return `<div class="carousel-slide"><img src="${src}" alt="${item.alt || `${product.name} — ${item.slot}`}" ${slideImgAttrs(isFirst)} /></div>`;
  }

  // ---------- render product grid ----------
  const grid = document.getElementById("product-grid");
  const cardImageSets = new Map(PRODUCTS.map((product) => [
    product.id,
    product.media
      .filter((item) => item.src && item.type !== "video")
      .map((item) => mediaPath(product.id, item.src)),
  ]));

  grid.innerHTML = PRODUCTS.map((p, i) => {
    const cover = p.media.find((m) => m.src && m.type !== "video") || p.media[0];
    // All six initial covers are loaded behind the branded opening screen. This is a
    // deliberately small payload compared with the full galleries, and guarantees
    // that scrolling never reveals an empty product card after the site appears.
    const coverAttrs = i === 0
      ? `fetchpriority="high" loading="eager" decoding="async"`
      : `fetchpriority="low" loading="eager" decoding="async"`;
    const coverHTML = cover.src
      ? `<img class="card-photo is-active" src="${mediaPath(p.id, cover.src)}" alt="${p.name}" ${coverAttrs} />
         <img class="card-photo" alt="" aria-hidden="true" loading="lazy" decoding="async" />`
      : `<div class="placeholder-slide"><span class="ph-icon">📷</span><span class="ph-label">${cover.slot}</span></div>`;
    return `
      <div class="card" data-id="${p.id}">
        <div class="card-media">
          ${coverHTML}
          <div class="card-photo-scrim" aria-hidden="true"></div>
          <div class="card-info">
            <p class="card-name">${p.name}</p>
            ${p.price ? `<p class="card-price">${p.price}</p>` : ""}
            <button class="card-btn" type="button">view piece</button>
          </div>
        </div>
      </div>`;
  }).join("");

  // Cross-fade through every photo while the card is visible. Only the next
  // photo is loaded, keeping the mobile homepage light despite the full
  // editorial gallery behind each piece.
  function activateCardImageCycles() {
    if (prefersReducedMotion || saveDataEnabled || !("IntersectionObserver" in window)) return;
    const cardCycleStates = new WeakMap();

    function stopCardCycle(card) {
      const state = cardCycleStates.get(card);
      if (!state) return;
      state.visible = false;
      window.clearTimeout(state.timer);
    }

    function startCardCycle(card, order) {
      const images = cardImageSets.get(card.dataset.id) || [];
      if (images.length < 2) return;

      let state = cardCycleStates.get(card);
      if (!state) {
        state = { activeLayer: 0, index: 0, timer: 0, visible: false, busy: false };
        cardCycleStates.set(card, state);
      }
      if (state.visible) return;
      state.visible = true;

      const scheduleNext = (delay = 3000) => {
        window.clearTimeout(state.timer);
        state.timer = window.setTimeout(async () => {
          if (!state.visible || state.busy) return;
          state.busy = true;
          state.index = (state.index + 1) % images.length;

          const layers = card.querySelectorAll(".card-photo");
          const current = layers[state.activeLayer];
          const nextLayerIndex = state.activeLayer === 0 ? 1 : 0;
          const next = layers[nextLayerIndex];
          next.src = images[state.index];

          try { await next.decode(); } catch (_error) {}
          if (!state.visible) {
            state.busy = false;
            return;
          }

          next.classList.add("is-active");
          current.classList.remove("is-active");
          state.activeLayer = nextLayerIndex;
          state.busy = false;
          scheduleNext();
        }, delay);
      };

      scheduleNext(2500 + order * 220);
    }

    const cardObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const order = Number(entry.target.dataset.cardOrder || 0);
        if (entry.isIntersecting) startCardCycle(entry.target, order);
        else stopCardCycle(entry.target);
      });
    }, { threshold: 0.2 });

    grid.querySelectorAll(".card").forEach((card, order) => {
      card.dataset.cardOrder = String(order);
      cardObserver.observe(card);
    });
  }

  grid.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("click", () => {
      const product = PRODUCTS.find((p) => p.id === card.dataset.id);
      track("card_click", {
        product_id: card.dataset.id,
        product_name: product ? product.name : card.dataset.id,
      });
      fbTrack("CardClick", {
        product_id: card.dataset.id,
        product_name: product ? product.name : card.dataset.id,
      }, false);
      openProduct(card.dataset.id, true);
    });
  });

  // ---------- product modal ----------
  const productModal = document.getElementById("product-modal");
  const carouselEl = document.getElementById("modal-carousel");
  const dotsEl = document.getElementById("modal-dots");
  let currentProduct = null;
  // per-product-view carousel-progress tracking (for GA4 slide_view / product_view_end):
  // maxSlideIndex is the furthest slide (0-based) reached in the CURRENT modal viewing,
  // reset every time a product is opened. viewEndSent guards against firing the summary
  // event twice (explicit close + pagehide) for the same viewing.
  let maxSlideIndex = 0;
  let viewEndSent = true;

  function trackViewEnd() {
    if (viewEndSent || !currentProduct) return;
    viewEndSent = true;
    const total = currentProduct.media.length;
    const params = {
      product_id: currentProduct.id,
      product_name: currentProduct.name,
      max_slide_reached: maxSlideIndex + 1,
      slide_total: total,
      reached_end: maxSlideIndex >= total - 1,
    };
    track("product_view_end", params);
    fbTrack("ProductViewEnd", params, false);
  }
  // covers the case where the visitor closes the tab / navigates away without
  // tapping the ✕ — otherwise that viewing's drop-off point would never be recorded
  window.addEventListener("pagehide", trackViewEnd);

  function openProduct(id, updateUrl) {
    const product = PRODUCTS.find((p) => p.id === id);
    if (!product) return;
    trackViewEnd(); // flush the previous product's viewing, if any, before switching
    currentProduct = product;
    maxSlideIndex = 0;
    viewEndSent = false;

    // browser-tab title while this product's modal is open — reset to the
    // homepage default (SITE.homeTitle, not document.title at parse time —
    // on a standalone /products/<id> page the parsed title is already that
    // product's own SEO title, so capturing it here would be wrong to
    // restore on close) in closeProduct() below
    document.title = `${product.name} — ${SITE.brandName}`;

    carouselEl.innerHTML = product.media.map((m, i) => slideHTML(product, m, i === 0)).join("");
    dotsEl.innerHTML = product.media.map((_, i) => `<span class="${i === 0 ? "active" : ""}"></span>`).join("");
    carouselEl.scrollLeft = 0;
    activateSlideMedia(0); // load slide 1's video (if any) + preload the next slide, nothing further
    dotsEl.querySelectorAll("span").forEach((dot, i) => {
      dot.addEventListener("click", () => goToSlide(i));
    });

    document.getElementById("modal-name").textContent = product.name;
    document.getElementById("modal-tagline").textContent = product.tagline;
    document.getElementById("modal-price").textContent = product.price || "";
    document.getElementById("modal-price").style.display = product.price ? "block" : "none";

    productModal.classList.add("open");
    productModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    track("slide_view", {
      product_id: product.id,
      product_name: product.name,
      slide_index: 1,
      slide_total: product.media.length,
      slide_type: product.media[0] ? (product.media[0].type || "photo") : "photo",
    });
    fbTrack("SlideView", {
      product_id: product.id,
      product_name: product.name,
      slide_index: 1,
      slide_total: product.media.length,
    }, false);
    // Meta's standard "viewed a product" event — feeds retargeting/lookalike audiences
    fbTrack("ViewContent", {
      content_name: product.name,
      content_ids: [product.id],
      content_type: "product",
      value: parsePrice(product.price),
      currency: "USD",
    }, true);

    // wrapped in try/catch: some browsers (notably Safari on a file:// page,
    // e.g. a locally-saved preview opened straight from the Files app) refuse
    // to let history.pushState change the URL and throw a SecurityError —
    // the card/modal must still open even if the URL can't be updated
    if (updateUrl) {
      try { history.pushState({ product: id }, "", productPath(id)); } catch (e) {}
    }
  }

  function closeProduct(updateUrl) {
    trackViewEnd();
    productModal.classList.remove("open");
    productModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    document.title = SITE.homeTitle;
    if (updateUrl) {
      try { history.pushState({}, "", "/"); } catch (e) {}
    }
  }

  document.getElementById("modal-close").addEventListener("click", () => closeProduct(true));

  document.getElementById("try-on-btn").addEventListener("click", () => {
    if (!currentProduct) return;
    track("try_on_click", {
      product_id: currentProduct.id,
      product_name: currentProduct.name,
      source: "product_modal",
    });
    fbTrack("TryOnClick", {
      product_id: currentProduct.id,
      product_name: currentProduct.name,
    }, false);
    location.href = `/try-on/?mask=${encodeURIComponent(currentProduct.id)}`;
  });

  const stickyTryOn = document.getElementById("sticky-try-on");
  let stickyTryOnFrame = 0;

  function updateStickyTryOn() {
    stickyTryOnFrame = 0;
    stickyTryOn?.classList.toggle("is-visible", window.scrollY > 180);
  }

  function scheduleStickyTryOnUpdate() {
    if (stickyTryOnFrame) return;
    stickyTryOnFrame = requestAnimationFrame(updateStickyTryOn);
  }

  stickyTryOn?.addEventListener("click", () => {
    track("try_on_click", { source: "sticky_home_cta" });
    fbTrack("TryOnClick", { source: "sticky_home_cta" }, false);
  });
  window.addEventListener("scroll", scheduleStickyTryOnUpdate, { passive: true });
  updateStickyTryOn();

  // Attaches the real <source src> (and starts playback) for the video in slide `idx`
  // and its immediate neighbors, the first time each is reached — see the note in
  // slideHTML()'s "video" branch above for why this is deferred instead of eager.
  // Idempotent: already-activated slides are skipped, so this is safe to call on
  // every scroll tick.
  function activateSlideMedia(idx) {
    const slides = carouselEl.querySelectorAll(".carousel-slide");
    [idx - 1, idx, idx + 1].forEach((i) => {
      const slide = slides[i];
      if (!slide) return;
      const video = slide.querySelector("video[data-mp4]");
      if (!video || video.dataset.activated) return;
      video.dataset.activated = "1";
      if (video.dataset.webm) {
        const webmSource = document.createElement("source");
        webmSource.src = video.dataset.webm;
        webmSource.type = "video/webm";
        video.appendChild(webmSource);
      }
      const mp4Source = document.createElement("source");
      mp4Source.src = video.dataset.mp4;
      mp4Source.type = "video/mp4";
      video.appendChild(mp4Source);
      video.load();
      // muted, so autoplay is allowed by browser policy in the vast majority of cases —
      // still wrapped, since a handful of embedded/in-app browsers can refuse anyway
      video.play().catch(() => {});
    });
  }

  carouselEl.addEventListener("scroll", () => {
    const idx = Math.round(carouselEl.scrollLeft / carouselEl.clientWidth);
    dotsEl.querySelectorAll("span").forEach((d, i) => d.classList.toggle("active", i === idx));
    activateSlideMedia(idx);

    // fire slide_view only the first time a given slide index is reached in this
    // viewing (not on every back-and-forth swipe) — gives a clean per-product
    // "how far did they get" funnel in GA4
    if (currentProduct && idx > maxSlideIndex) {
      maxSlideIndex = idx;
      const item = currentProduct.media[idx];
      track("slide_view", {
        product_id: currentProduct.id,
        product_name: currentProduct.name,
        slide_index: idx + 1,
        slide_total: currentProduct.media.length,
        slide_type: item ? (item.type || "photo") : "photo",
      });
      fbTrack("SlideView", {
        product_id: currentProduct.id,
        product_name: currentProduct.name,
        slide_index: idx + 1,
        slide_total: currentProduct.media.length,
      }, false);
    }
  });

  // ---------- carousel prev/next arrows (mouse-friendly — swipe still works on touch) ----------
  function currentSlideIndex() {
    return Math.round(carouselEl.scrollLeft / carouselEl.clientWidth);
  }
  function goToSlide(i) {
    const slides = carouselEl.querySelectorAll(".carousel-slide").length;
    const clamped = Math.max(0, Math.min(slides - 1, i));
    carouselEl.scrollTo({ left: clamped * carouselEl.clientWidth, behavior: "smooth" });
  }
  document.getElementById("carousel-prev").addEventListener("click", () => goToSlide(currentSlideIndex() - 1));
  document.getElementById("carousel-next").addEventListener("click", () => goToSlide(currentSlideIndex() + 1));

  // ---------- routing: open the right product for the current URL ----------
  // Real per-product URLs (added session #10, 2026-07-28 — see
  // claude/seo-semantic-core-brief.md) so each mask is a separately
  // crawlable/shareable page: /products/<id>. A static copy of this same
  // page is generated at that path for every product (scripts/generate_product_pages.py)
  // with its own title/description/OG/JSON-LD — this routing logic is what
  // makes that static page actually open the right modal on load, and what
  // makes clicking a card from "/" navigate there without a full reload.
  function productIdFromPath() {
    const m = location.pathname.match(/^\/products\/([^\/]+)\/?$/);
    return m ? decodeURIComponent(m[1]) : null;
  }

  function openFromLocation() {
    const id = productIdFromPath();
    if (id) openProduct(id, false);
    else closeProduct(false);
  }

  // Back-compat: earlier versions of this site (before session #10) used
  // "#p-<id>" hash links for sharing/deep-linking instead of a real path —
  // upgrade any such link transparently to the new path so nothing anyone
  // already copied/sent stops working. Returns true if it handled (and
  // opened) a legacy link, so the caller knows not to also run the normal
  // path-based routing below.
  function upgradeLegacyHashLink() {
    const m = location.hash.match(/^#p-(.+)$/);
    if (m && location.pathname === "/") {
      const id = decodeURIComponent(m[1]);
      try { history.replaceState({}, "", productPath(id)); } catch (e) {}
      openProduct(id, false);
      return true;
    }
    return false;
  }

  window.addEventListener("popstate", openFromLocation);
  // covers the (rarer) case where a legacy "#p-<id>" link is pasted into the
  // address bar of a tab that already has the site open — same-document hash
  // navigation fires "hashchange", not "popstate"/a full reload, so the
  // one-time check at the bottom of this file wouldn't otherwise re-run
  window.addEventListener("hashchange", upgradeLegacyHashLink);

  if (!upgradeLegacyHashLink()) {
    openFromLocation();
  }

  // ---------- order popup ----------
  const orderModal = document.getElementById("order-modal");
  const copyField = document.getElementById("copy-field");
  const copyHint = document.getElementById("copy-hint");
  const orderIgBtn = document.getElementById("order-ig-btn");
  const orderWaBtn = document.getElementById("order-wa-btn");

  document.getElementById("order-btn").addEventListener("click", () => {
    if (!currentProduct) return;
    track("order_button_click", {
      product_id: currentProduct.id,
      product_name: currentProduct.name,
    });
    // Meta's standard "started a purchase flow" event — the highest-intent signal we have,
    // most useful one for ad-conversion optimization
    fbTrack("InitiateCheckout", {
      content_name: currentProduct.name,
      content_ids: [currentProduct.id],
      content_type: "product",
      value: parsePrice(currentProduct.price),
      currency: "USD",
    }, true);
    const url = `${location.origin}${productPath(currentProduct.id)}`;
    const message = `${currentProduct.name} — ${url}`;
    copyField.value = message;
    copyHint.classList.remove("show"); // reset — copying is now an explicit step the buyer taps below, not silent

    // name the exact piece being ordered — the whole point of this popup is copying
    // a link to THIS mask, so say so in both the title and the copy-step button
    document.getElementById("order-title").textContent = `Order the ${currentProduct.name}`;
    document.getElementById("copy-btn").textContent = `Tap to copy ${currentProduct.name} link`;

    orderIgBtn.href = igLink();
    if (SITE.whatsappNumber) {
      orderWaBtn.href = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`;
      orderWaBtn.style.display = "flex";
    } else {
      orderWaBtn.style.display = "none";
    }

    orderModal.classList.add("open");
    orderModal.setAttribute("aria-hidden", "false");
  });

  document.getElementById("copy-btn").addEventListener("click", () => {
    if (currentProduct) {
      const p = { product_id: currentProduct.id, product_name: currentProduct.name };
      track("order_copy_link_click", p);
      fbTrack("OrderStepClick", { ...p, step: "copy_link" }, false);
    }
  });
  orderIgBtn.addEventListener("click", () => {
    if (currentProduct) {
      const p = { product_id: currentProduct.id, product_name: currentProduct.name };
      track("order_instagram_click", p);
      fbTrack("OrderStepClick", { ...p, step: "instagram" }, false);
    }
  });
  orderWaBtn.addEventListener("click", () => {
    if (currentProduct) {
      const p = { product_id: currentProduct.id, product_name: currentProduct.name };
      track("order_whatsapp_click", p);
      fbTrack("OrderStepClick", { ...p, step: "whatsapp" }, false);
    }
  });

  function closeOrderModal() {
    orderModal.classList.remove("open");
    orderModal.setAttribute("aria-hidden", "true");
  }
  document.getElementById("order-modal-close").addEventListener("click", closeOrderModal);
  // tap the dimmed backdrop (not the sheet itself) to dismiss — standard bottom-sheet behavior
  orderModal.addEventListener("click", (e) => {
    if (e.target === orderModal) closeOrderModal();
  });

  document.getElementById("copy-btn").addEventListener("click", () => {
    copyToClipboard(copyField.value);
  });

  function copyToClipboard(text) {
    const done = () => {
      copyHint.classList.add("show");
      setTimeout(() => copyHint.classList.remove("show"), 1800);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
    } else {
      fallbackCopy(text, done);
    }
  }

  function fallbackCopy(text, done) {
    copyField.removeAttribute("readonly");
    copyField.select();
    try { document.execCommand("copy"); } catch (e) {}
    copyField.setAttribute("readonly", "readonly");
    done();
  }

  // ---------- polished opening + scroll reveals ----------
  function waitForImage(image) {
    if (!image || (image.complete && image.naturalWidth > 0)) return Promise.resolve();
    return new Promise((resolve) => {
      image.addEventListener("load", resolve, { once: true });
      image.addEventListener("error", resolve, { once: true });
    });
  }

  function waitForVideo(video) {
    if (!video || video.readyState >= 3) return Promise.resolve();
    return new Promise((resolve) => {
      video.addEventListener("canplay", resolve, { once: true });
      video.addEventListener("error", resolve, { once: true });
    });
  }

  function prepareRevealAnimations() {
    const targets = [
      document.querySelector(".hero .wrap"),
      ...document.querySelectorAll(".card"),
      document.querySelector(".archive-section .section-kicker"),
      document.querySelector(".archive-section .section-title"),
      document.querySelector(".archive-section .section-intro"),
      ...document.querySelectorAll(".archive-piece"),
      document.querySelector(".as-seen-section .section-kicker"),
      document.querySelector(".as-seen-section .section-title"),
      document.querySelector(".as-seen-section .section-intro"),
      ...document.querySelectorAll(".as-seen-card"),
      document.querySelector(".artist-media"),
      document.querySelector(".artist-copy"),
      document.querySelector(".site-footer"),
    ].filter(Boolean);

    targets.forEach((target) => target.classList.add("reveal-item"));
    document.querySelectorAll(".as-seen-card").forEach((card, index) => {
      card.style.setProperty("--reveal-delay", `${index * 90}ms`);
    });

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      return () => targets.forEach((target) => target.classList.add("is-revealed"));
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6%" });

    return () => targets.forEach((target) => observer.observe(target));
  }

  async function revealSiteWhenReady() {
    const loader = document.getElementById("site-loader");
    const startRevealAnimations = prepareRevealAnimations();
    const criticalImages = [
      ...document.querySelectorAll(".hero-photo-frame.is-active, .card-photo.is-active"),
      document.querySelector("#modal-carousel .carousel-slide:first-child img"),
    ].filter(Boolean);
    const heroVideo = document.querySelector(".hero-video");
    const fontReady = document.fonts?.ready || Promise.resolve();
    const visualReady = Promise.all([
      fontReady,
      waitForVideo(heroVideo),
      ...criticalImages.map(waitForImage),
    ]);
    const failsafe = new Promise((resolve) => window.setTimeout(resolve, 7500));
    const minimumBrandMoment = new Promise((resolve) => window.setTimeout(resolve, 650));

    await Promise.all([minimumBrandMoment, Promise.race([visualReady, failsafe])]);
    document.body.classList.remove("is-loading");
    document.body.classList.add("is-ready");
    loader?.setAttribute("aria-hidden", "true");
    activateCardImageCycles();
    requestAnimationFrame(startRevealAnimations);
    window.setTimeout(() => { if (loader) loader.hidden = true; }, 900);
  }

  revealSiteWhenReady();
})();
