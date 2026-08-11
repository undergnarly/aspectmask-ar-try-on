/* =========================================================================
   ASPECT — site settings
   Edit these values, everything on the page updates automatically.
   ========================================================================= */

const SITE = {
  brandName: "ASPECT",

  // Fixed strings used by js/app.js to restore the browser tab title when a
  // product modal is closed (client-side pushState navigation back to "/").
  // Keep these in sync with the <title>/<meta name="description"> in the
  // SEO-META block of index.html — added 2026-07-28 (session #10) when
  // product pages got their own real URLs (/products/<id>).
  homeTitle: "ASPECT — Handmade Designer Masks & Headpieces | In Stock, Ships Worldwide",
  homeDescription: "One-of-one handmade masks and headpieces for Burning Man, stage performance and red-carpet dress codes. In stock now, ships worldwide.",

  // Your Instagram username WITHOUT the @ — used to build the
  // one-tap "message us" link (https://ig.me/m/<username>)
  instagramUsername: "aspect_mask", // confirmed real handle — instagram.com/aspect_mask

  // Shown in the header/footer as a fallback contact line
  instagramHandleDisplay: "@aspect_mask",

  whatsappNumber: "", // optional, e.g. "15551234567" — leave "" to hide the WhatsApp option

  // Hero banner photo — close-up, eyes visible through the mask, black
  // background. Replaced 2026-07-27 (previous version was hands+tools on
  // a burgundy background — see hero-banner-hands-OLD.jpg for that one).
  // Portrait 3:4 — css .hero-photo-banner aspect-ratio matches it exactly.
  // fixed 2026-07-29 (speed audit): was a relative path ("assets/..."), which
  // resolved wrong (404, failed request) whenever this same shared app.js runs
  // on a nested /products/<id> page instead of "/" — leading slash fixes it
  heroPhoto: "/assets/brand/hero-banner.jpg",
  heroVideoWebm: "/assets/products/black-bird-eye/aspect-black-bird-eye-black-fashion-mask-headpiece-hero-video.webm",
  heroVideoMp4: "/assets/products/black-bird-eye/aspect-black-bird-eye-black-fashion-mask-headpiece-hero-video.mp4",

  heroTitle: "Feel insane.",
  heroSubtitle: "At the event. On camera. Inside out.",

  // REMOVED from the main page 2026-07-27 per Lena — the occasion list was
  // slowing down the "see what's in stock" path for a cold visitor. This
  // content should move to a dedicated card/section on each PRODUCT page
  // instead (not built yet — future task). Data kept here for reuse then.
  heroWearForHeading: "Fashion avant-garde masks for:",
  heroWearFor: [
    "Wow content",
    "Burning Man & festival looks",
    "Stage performance & music videos",
    "Masquerade & fantasy nights",
    "Boudoir shoots & intimate content",
    "Red carpet & gala dress codes",
  ],

  // 3rd (quietest) attention tier — plain/quiet 3-line block, sits FIRST.
  // "Fashion avant-garde masks" is plain text here, not a heading — the
  // heading treatment is on "Only 6 pieces exist now:" below instead.
  heroTaglineLines: [
    "Fashion avant-garde masks",
    "Designer, hand-sculpted, one of one.",
    "Ready to ship today, worldwide.",
  ],

  // Scarcity callout — the emphasized heading of this section, sits right
  // above the catalog grid. No subtitle under it anymore (removed per
  // Lena 2026-07-27 — "exist in the world right now — Own yours now" is
  // gone, the number + "exist now:" says it all on its own).
  // "6" reflects the CURRENT catalog — update by hand when the assortment
  // changes, not computed automatically.
  heroScarcityNumber: "Only 6 pieces exist now:",

  // NOT rendered on the page anymore — removed 2026-07-27 per Lena
  // ("Available Now" heading + subtitle above the catalog grid). Left here
  // in case she wants them back later; js/app.js no longer reads these.
  sectionTitle: "Available Now",
  sectionSubtitle: "Everything below is in stock and ready to ship today.",

  orderPopupTitle: "How to order",
  orderPopupExplainer:
    "Every piece is ordered personally, over Instagram Direct — that's how we confirm shipping with you. Copy the link below, paste it into the chat and send it over.",
};
