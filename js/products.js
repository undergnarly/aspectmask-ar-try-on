/* =========================================================================
   ASPECT — product catalog data
   -------------------------------------------------------------------------
   HOW TO ADD A NEW PRODUCT (no coding needed):
   1. Copy one whole {…} block below (from "{" to the matching "},").
   2. Paste it right after the last product, before the closing "];".
   3. Change id, name, price, description.
   4. For media: put your photo/video files in  assets/products/<id>/
      and change each `src` to the file name, e.g. "01-hero.jpg".
      If you don't have a file yet for a slot, leave src: null —
      the site will show a labeled placeholder instead of breaking.
   5. Save the file. That's it — the new card appears automatically.

   CAROUSEL SLIDE ORDER (finalized 2026-08-10 — full 8-slide target sequence now live;
   see Claude project doc "product-card-slide-sequence-v2-decision.md" for the roadmap
   and history of how this was built up slide by slide):
    1. image   — Hero photo — unchanged
    2. fit     — Head-on-mannequin photo + objection-handling bullets (fit/comfort/travel)
    3. proof   — Proof-of-process slide ("One of one")
    4. cta     — Early CTA (urgency copy, "Only one exists.") — MOVED here from the end
                 of the carousel 2026-08-10
    5. image   — Macro / detail photo (single consolidated shot)
    6. image   — Collage of 4 angles (side 1, side 2, back, inside) — NEW 2026-08-10,
                 replaces the 4 separate on-mannequin angle slides + the standalone
                 "Front photo" slide, which were REMOVED entirely per Lena. One
                 pre-composited image per product, built in a 2x2 grid — see the
                 collage build notes in product-card-slide-sequence-v2-decision.md.
    7. video   — Hands-on video (table → hands → on face) — MOVED here from position 4
                 2026-08-10
    8. finalcta — Final CTA, "one of one, gone" theme + small "ready to ship today"
                 caption — NEW 2026-08-10 (see `type: "finalcta"` below)

   REMOVED 2026-08-10 (not part of the final 8-slide sequence, per Lena):
   - "Front photo, on mannequin" (front.jpg is still used as the `fit` slide's photo)
   - "Brand statement" text slide (the `type: "text"` slide type below is no longer
     used by any live product, but the renderer support is left in app.js in case
     it's needed again)
   - The old "Video product review" slide (removed earlier, 2026-08-10)

   SLIDE TYPES:
   - { type: "image", slot, src }                — a normal photo
   - { type: "video", slot, src }                 — a normal video (muted, autoplay, loop)
   - { type: "text",  slot, src, focusY, bullets } — brand-copy slide (NOT currently used by
                                                     any product — see REMOVED note above.
                                                     Left here for reference only.)
   - { type: "proof", slot, src, heading, bodyLines } — template APPROVED via Lena's Figma
                                                     mockup (node-id=21-27). heading/bodyLines are
                                                     the SAME on every product — do not change the
                                                     copy. `src` is the ONLY thing that changes per
                                                     product (a photo proving the piece is hand-made
                                                     — process shot, full-bleed). Full spec in the
                                                     Claude project doc "proof-slide-template-spec.md".
   - { type: "cta",   slot, src, ctaTitle, ctaSub } — EARLY cta, now at position 4. ctaTitle/
                                                     ctaSub are the SAME on every product ("Only
                                                     one exists." / "First to claim it, wears it.
                                                     No identical piece will ever be made again.").
                                                     `src` is the ONLY thing that changes per
                                                     product. Title font-size 30px, sub 17px — see
                                                     .cta-slide-title/.cta-slide-sub in css/style.css.
                                                     Full spec in the Claude project doc
                                                     "cta-slide-template-spec.md".
   - { type: "finalcta", slot, src, ctaTitle, ctaSub, caption } — FINAL slide (position 8), NEW
                                                     2026-08-10. Reuses the same .cta-slide photo/
                                                     overlay layout as `cta` above, plus a small
                                                     caption line (.finalcta-slide-caption).
                                                     ctaTitle/ctaSub/caption are the SAME on every
                                                     product — approved copy: "First to claim it,
                                                     wears it." / "No identical piece will ever be
                                                     made again." / "Ready to ship today". `src` is
                                                     the ONLY thing that changes per product
                                                     (reuses the same ready-to-ship photo as the
                                                     early cta slide).
   ========================================================================= */

const PRODUCTS = [
  {
    id: "ruby-dune",
    name: "Ruby Dune Mask",
    price: "$ 255", // confirmed 2026-07-23, Notion price list
    inStock: true,
    tagline: "Hand-sculpted red wire mask — veins of thread tracing the face",
    description:
      "One-of-one hand-sculpted piece — no two Aspect masks are ever the same.",
    // SEO/link-preview description ONLY — used by scripts/generate_product_pages.py for
    // <meta name="description">/og:description/twitter:description/JSON-LD. Does NOT
    // touch the visible on-page tagline/description above (those stay frozen per
    // card-body-below-carousel-spec.md). Approved by Lena 2026-07-29 — combines the
    // product's craft/visual details with the homepage's keyword layer, kept under
    // ~159 chars so Google doesn't truncate it, and always states the color.
    metaDescription:
      "Designer fashion avant-garde red wire mask — hand-sculpted, veins of thread tracing the face. One-of-one piece for Burning Man, festival and stage performance.",
    media: [
      { type: "image", slot: "Hero photo", src: "aspect-ruby-dune-red-fashion-mask-headpiece-hero.jpg",
      alt: "Ruby Dune Mask — fashion avant-garde red mask for performance and party looks", },
      {
        type: "fit",
        slot: "Fit + objections",
        src: "aspect-ruby-dune-red-fashion-mask-headpiece-front.jpg",
        alt: "Ruby Dune Mask — worn on display form, fit and comfort details",
        scale: 1.13, originX: 50, originY: 100, // per-photo calibration — see slide2-fit-slide-template-spec.md
        bullets: [
          { strong: "Fit any face", dim: ": bends by hand." },
          { strong: "Lightweight", dim: ": wear it all night." },
          { strong: "Travels easily", dim: ": box&nbsp;included." },
          { strong: "Soft", dim: ": against your skin, not wire." },
        ],
      },
      {
        type: "proof",
        slot: "Proof of process",
        src: "aspect-ruby-dune-red-fashion-mask-headpiece-handmade-proof.jpg",
        alt: "Ruby Dune Mask — proof of handmade craftsmanship, red mask in progress",
        heading: "One of one",
        bodyLines: [
          "Authored.",
          "Hand-sculptured.",
          "Once one is claimed, it's gone for good",
        ],
      },
      {
        type: "cta",
        slot: "Order CTA",
        src: "aspect-ruby-dune-red-fashion-mask-headpiece-ready-to-ship.jpg",
        alt: "Ruby Dune Mask — ready to ship red mask, festival and red carpet ready",
        ctaTitle: "Only one exists.",
        ctaSub: "First to claim it, wears it.<br>No identical piece will ever be made again.",
      },
      // Macro slide, consolidated to ONE photo 2026-08-10 per Lena (was two separate
      // "Macro detail 1/2" slides) — see product-card-slide-sequence-v2-decision.md, slide 5.
      { type: "image", slot: "Macro detail", src: "aspect-ruby-dune-red-fashion-mask-headpiece-detail-1.jpg",
      alt: "Ruby Dune Mask — macro detail of the hand-sculpted red design, wire-wrapped joints", },
      // Collage slide, NEW 2026-08-10 — replaces the 4 separate side1/side2/back/inside
      // slides. Pre-composited 2x2 grid image, built + cropped/color-matched per Lena's
      // feedback (see product-card-slide-sequence-v2-decision.md, slide 6).
      { type: "image", slot: "Collage — 4 angles", src: "aspect-ruby-dune-red-fashion-mask-headpiece-angles.jpg",
      alt: "Ruby Dune Mask — four angles: both sides, back and inside", },
      { type: "video", slot: "Hands-on video", src: "aspect-ruby-dune-red-fashion-mask-headpiece-hands-on-video.mp4",
      alt: "Ruby Dune Mask — hands-on video showing how the red mask fits the face", },
      {
        type: "finalcta",
        slot: "Final CTA (slide 8)",
        src: "aspect-ruby-dune-red-fashion-mask-headpiece-ready-to-ship.jpg",
        alt: "Ruby Dune Mask — ready to ship, one of one",
        ctaTitle: "First to claim it, wears it.",
        ctaSub: "No identical piece will ever be made again.",
        caption: "Ready to ship today",
      },
    ],
  },

  {
    id: "black-bird-eye",
    name: "Black Bird Eye Mask",
    price: "$ 355", // confirmed 2026-07-23, Notion price list
    inStock: true,
    tagline: "Hand-woven black thread mask — a raven's gaze traced in wire",
    description:
      "One-of-one hand-sculpted piece — no two Aspect masks are ever the same.",
    metaDescription:
      "Designer fashion avant-garde black wire mask — hand-woven, a raven's gaze traced in wire. One-of-one piece for Burning Man, stage performance and music video.",
    media: [
      { type: "image", slot: "Hero photo", src: "aspect-black-bird-eye-black-fashion-mask-headpiece-hero.jpg",
      alt: "Black Bird Eye Mask — fashion avant-garde black mask for performance and party looks", },
      {
        type: "fit",
        slot: "Fit + objections",
        src: "aspect-black-bird-eye-black-fashion-mask-headpiece-front.jpg",
        alt: "Black Bird Eye Mask — worn on display form, fit and comfort details",
        scale: 1.15, originX: 50, originY: 100, // per-photo calibration — see slide2-fit-slide-template-spec.md
        bullets: [
          { strong: "Fit any face", dim: ": bends by hand." },
          { strong: "Lightweight", dim: ": wear it all night." },
          { strong: "Travels easily", dim: ": box&nbsp;included." },
          { strong: "Soft", dim: ": against your skin, not wire." },
        ],
      },
      {
        type: "proof",
        slot: "Proof of process",
        src: "aspect-black-bird-eye-black-fashion-mask-headpiece-handmade-proof.jpg",
        alt: "Black Bird Eye Mask — proof of handmade craftsmanship, black mask in progress",
        heading: "One of one",
        bodyLines: [
          "Authored.",
          "Hand-sculptured.",
          "Once one is claimed, it's gone for good",
        ],
      },
      {
        type: "cta",
        slot: "Order CTA",
        src: "aspect-black-bird-eye-black-fashion-mask-headpiece-ready-to-ship.jpg",
        alt: "Black Bird Eye Mask — ready to ship black mask, festival and red carpet ready",
        ctaTitle: "Only one exists.",
        ctaSub: "First to claim it, wears it.<br>No identical piece will ever be made again.",
      },
      { type: "image", slot: "Macro detail", src: "aspect-black-bird-eye-black-fashion-mask-headpiece-detail-2.jpg",
      alt: "Black Bird Eye Mask — macro detail of the hand-sculpted black design, wire-wrapped joints", },
      { type: "image", slot: "Collage — 4 angles", src: "aspect-black-bird-eye-black-fashion-mask-headpiece-angles.jpg",
      alt: "Black Bird Eye Mask — four angles: both sides, back and inside", },
      { type: "video", slot: "Hands-on video", src: "aspect-black-bird-eye-black-fashion-mask-headpiece-hands-on-video.mp4",
      alt: "Black Bird Eye Mask — hands-on video showing how the black mask fits the face", },
      {
        type: "finalcta",
        slot: "Final CTA (slide 8)",
        src: "aspect-black-bird-eye-black-fashion-mask-headpiece-ready-to-ship.jpg",
        alt: "Black Bird Eye Mask — ready to ship, one of one",
        ctaTitle: "First to claim it, wears it.",
        ctaSub: "No identical piece will ever be made again.",
        caption: "Ready to ship today",
      },
    ],
  },

  {
    id: "black-fire",
    name: "Black Fire Mask",
    price: "$ 455", // confirmed 2026-07-23, Notion price list
    inStock: true,
    tagline: "Hand-sculpted black wire crown — flames traced in thread",
    description:
      "One-of-one hand-sculpted piece — no two Aspect masks are ever the same.",
    metaDescription:
      "Designer fashion avant-garde black wire crown — hand-sculpted, flames traced in thread. One-of-one piece for Burning Man, festival and stage performance.",
    media: [
      { type: "image", slot: "Hero photo", src: "aspect-black-fire-black-fashion-mask-headpiece-hero.jpg",
      alt: "Black Fire Mask — fashion avant-garde black mask for performance and party looks", },
      {
        type: "fit",
        slot: "Fit + objections",
        src: "aspect-black-fire-black-fashion-mask-headpiece-front.jpg",
        alt: "Black Fire Mask — worn on display form, fit and comfort details",
        scale: 1.08, originX: 50, originY: 135, // per-photo calibration — see slide2-fit-slide-template-spec.md
        bullets: [
          { strong: "Fit any face", dim: ": bends by hand." },
          { strong: "Lightweight", dim: ": wear it all night." },
          { strong: "Travels easily", dim: ": box&nbsp;included." },
          { strong: "Soft", dim: ": against your skin, not wire." },
        ],
      },
      {
        type: "proof",
        slot: "Proof of process",
        src: "aspect-black-fire-black-fashion-mask-headpiece-handmade-proof.jpg",
        alt: "Black Fire Mask — proof of handmade craftsmanship, black mask in progress",
        heading: "One of one",
        bodyLines: [
          "Authored.",
          "Hand-sculptured.",
          "Once one is claimed, it's gone for good",
        ],
      },
      {
        type: "cta",
        slot: "Order CTA",
        src: "aspect-black-fire-black-fashion-mask-headpiece-ready-to-ship.jpg",
        alt: "Black Fire Mask — ready to ship black mask, festival and red carpet ready",
        ctaTitle: "Only one exists.",
        ctaSub: "First to claim it, wears it.<br>No identical piece will ever be made again.",
      },
      { type: "image", slot: "Macro detail", src: "aspect-black-fire-black-fashion-mask-headpiece-detail-2.jpg",
      alt: "Black Fire Mask — macro detail of the hand-sculpted black design, wire-wrapped joints", },
      { type: "image", slot: "Collage — 4 angles", src: "aspect-black-fire-black-fashion-mask-headpiece-angles.jpg",
      alt: "Black Fire Mask — four angles: both sides, back and inside", },
      { type: "video", slot: "Hands-on video", src: "aspect-black-fire-black-fashion-mask-headpiece-hands-on-video.mp4",
      alt: "Black Fire Mask — hands-on video showing how the black mask fits the face", },
      {
        type: "finalcta",
        slot: "Final CTA (slide 8)",
        src: "aspect-black-fire-black-fashion-mask-headpiece-ready-to-ship.jpg",
        alt: "Black Fire Mask — ready to ship, one of one",
        ctaTitle: "First to claim it, wears it.",
        ctaSub: "No identical piece will ever be made again.",
        caption: "Ready to ship today",
      },
    ],
  },

  {
    id: "deep-ocean",
    name: "Deep Ocean Mask",
    price: "$ 290", // confirmed 2026-07-23, Notion price list
    inStock: true,
    tagline: "Hand-sculpted blue wire mask — currents traced in thread",
    description:
      "One-of-one hand-sculpted piece — no two Aspect masks are ever the same.",
    metaDescription:
      "Designer fashion avant-garde blue wire mask — hand-sculpted, currents traced in thread. One-of-one piece for gala, red-carpet and stage performance.",
    media: [
      { type: "image", slot: "Hero photo", src: "aspect-deep-ocean-blue-fashion-mask-headpiece-hero.jpg",
      alt: "Deep Ocean Mask — fashion avant-garde blue mask for performance and party looks", },
      {
        type: "fit",
        slot: "Fit + objections",
        src: "aspect-deep-ocean-blue-fashion-mask-headpiece-front.jpg",
        alt: "Deep Ocean Mask — worn on display form, fit and comfort details",
        scale: 1.16, originX: 50, originY: 85, // per-photo calibration — see slide2-fit-slide-template-spec.md
        bullets: [
          { strong: "Fit any face", dim: ": bends by hand." },
          { strong: "Lightweight", dim: ": wear it all night." },
          { strong: "Travels easily", dim: ": box&nbsp;included." },
          { strong: "Soft", dim: ": against your skin, not wire." },
        ],
      },
      {
        type: "proof",
        slot: "Proof of process",
        src: "aspect-deep-ocean-blue-fashion-mask-headpiece-handmade-proof.jpg",
        alt: "Deep Ocean Mask — proof of handmade craftsmanship, blue mask in progress",
        heading: "One of one",
        bodyLines: [
          "Authored.",
          "Hand-sculptured.",
          "Once one is claimed, it's gone for good",
        ],
      },
      {
        type: "cta",
        slot: "Order CTA",
        src: "aspect-deep-ocean-blue-fashion-mask-headpiece-ready-to-ship.jpg",
        alt: "Deep Ocean Mask — ready to ship blue mask, festival and red carpet ready",
        ctaTitle: "Only one exists.",
        ctaSub: "First to claim it, wears it.<br>No identical piece will ever be made again.",
      },
      { type: "image", slot: "Macro detail", src: "aspect-deep-ocean-blue-fashion-mask-headpiece-detail-2.jpg",
      alt: "Deep Ocean Mask — macro detail of the hand-sculpted blue design, wire-wrapped joints", },
      { type: "image", slot: "Collage — 4 angles", src: "aspect-deep-ocean-blue-fashion-mask-headpiece-angles.jpg",
      alt: "Deep Ocean Mask — four angles: both sides, back and inside", },
      { type: "video", slot: "Hands-on video", src: "aspect-deep-ocean-blue-fashion-mask-headpiece-hands-on-video.mp4",
      alt: "Deep Ocean Mask — hands-on video showing how the blue mask fits the face", },
      {
        type: "finalcta",
        slot: "Final CTA (slide 8)",
        src: "aspect-deep-ocean-blue-fashion-mask-headpiece-ready-to-ship.jpg",
        alt: "Deep Ocean Mask — ready to ship, one of one",
        ctaTitle: "First to claim it, wears it.",
        ctaSub: "No identical piece will ever be made again.",
        caption: "Ready to ship today",
      },
    ],
  },

  {
    id: "electric-fire",
    name: "Electric Fire Mask",
    price: "$ 355", // confirmed 2026-07-23, Notion price list
    inStock: true,
    tagline: "Hand-sculpted red wire mask — sparks traced in thread",
    description:
      "One-of-one hand-sculpted piece — no two Aspect masks are ever the same.",
    metaDescription:
      "Designer fashion avant-garde red wire mask — hand-sculpted, sparks traced in thread. One-of-one piece for Burning Man, festival and music video.",
    media: [
      { type: "image", slot: "Hero photo", src: "aspect-electric-fire-red-fashion-mask-headpiece-hero.jpg",
      alt: "Electric Fire Mask — fashion avant-garde red mask for performance and party looks", },
      {
        type: "fit",
        slot: "Fit + objections",
        src: "aspect-electric-fire-red-fashion-mask-headpiece-front.jpg",
        alt: "Electric Fire Mask — worn on display form, fit and comfort details",
        scale: 1.07, originX: 50, originY: 100, // per-photo calibration — see slide2-fit-slide-template-spec.md
        bullets: [
          { strong: "Fit any face", dim: ": bends by hand." },
          { strong: "Lightweight", dim: ": wear it all night." },
          { strong: "Travels easily", dim: ": box&nbsp;included." },
          { strong: "Soft", dim: ": against your skin, not wire." },
        ],
      },
      {
        type: "proof",
        slot: "Proof of process",
        src: "aspect-electric-fire-red-fashion-mask-headpiece-handmade-proof.jpg",
        alt: "Electric Fire Mask — proof of handmade craftsmanship, red mask in progress",
        heading: "One of one",
        bodyLines: [
          "Authored.",
          "Hand-sculptured.",
          "Once one is claimed, it's gone for good",
        ],
      },
      {
        type: "cta",
        slot: "Order CTA",
        src: "aspect-electric-fire-red-fashion-mask-headpiece-ready-to-ship.jpg",
        alt: "Electric Fire Mask — ready to ship red mask, festival and red carpet ready",
        ctaTitle: "Only one exists.",
        ctaSub: "First to claim it, wears it.<br>No identical piece will ever be made again.",
      },
      { type: "image", slot: "Macro detail", src: "aspect-electric-fire-red-fashion-mask-headpiece-detail-1.jpg",
      alt: "Electric Fire Mask — macro detail of the hand-sculpted red design, wire-wrapped joints", },
      { type: "image", slot: "Collage — 4 angles", src: "aspect-electric-fire-red-fashion-mask-headpiece-angles.jpg",
      alt: "Electric Fire Mask — four angles: both sides, back and inside", },
      { type: "video", slot: "Hands-on video", src: "aspect-electric-fire-red-fashion-mask-headpiece-hands-on-video.mp4",
      alt: "Electric Fire Mask — hands-on video showing how the red mask fits the face", },
      {
        type: "finalcta",
        slot: "Final CTA (slide 8)",
        src: "aspect-electric-fire-red-fashion-mask-headpiece-ready-to-ship.jpg",
        alt: "Electric Fire Mask — ready to ship, one of one",
        ctaTitle: "First to claim it, wears it.",
        ctaSub: "No identical piece will ever be made again.",
        caption: "Ready to ship today",
      },
    ],
  },

  {
    id: "wine-heart",
    name: "Wine Heart Mask",
    price: "$ 290", // confirmed 2026-07-23, Notion price list
    inStock: true,
    tagline: "Hand-sculpted wine-red wire mask — a heart traced in thread",
    description:
      "One-of-one hand-sculpted piece — no two Aspect masks are ever the same.",
    metaDescription:
      "Designer fashion avant-garde wine-red wire mask — hand-sculpted, a heart traced in thread. One-of-one piece for gala, red-carpet and dress-code party.",
    media: [
      { type: "image", slot: "Hero photo", src: "aspect-wine-heart-wine-red-fashion-mask-headpiece-hero.jpg",
      alt: "Wine Heart Mask — fashion avant-garde wine-red mask for performance and party looks", },
      {
        type: "fit",
        slot: "Fit + objections",
        src: "aspect-wine-heart-wine-red-fashion-mask-headpiece-front.jpg",
        alt: "Wine Heart Mask — worn on display form, fit and comfort details",
        scale: 1.27, originX: 110, originY: 100, // per-photo calibration — see slide2-fit-slide-template-spec.md
        bullets: [
          { strong: "Fit any face", dim: ": bends by hand." },
          { strong: "Lightweight", dim: ": wear it all night." },
          { strong: "Travels easily", dim: ": box&nbsp;included." },
          { strong: "Soft", dim: ": against your skin, not wire." },
        ],
      },
      {
        type: "proof",
        slot: "Proof of process",
        src: "aspect-wine-heart-wine-red-fashion-mask-headpiece-handmade-proof.jpg",
        alt: "Wine Heart Mask — proof of handmade craftsmanship, wine-red mask in progress",
        heading: "One of one",
        bodyLines: [
          "Authored.",
          "Hand-sculptured.",
          "Once one is claimed, it's gone for good",
        ],
      },
      {
        type: "cta",
        slot: "Order CTA",
        src: "aspect-wine-heart-wine-red-fashion-mask-headpiece-ready-to-ship.jpg",
        alt: "Wine Heart Mask — ready to ship wine-red mask, festival and red carpet ready",
        ctaTitle: "Only one exists.",
        ctaSub: "First to claim it, wears it.<br>No identical piece will ever be made again.",
      },
      { type: "image", slot: "Macro detail", src: "aspect-wine-heart-wine-red-fashion-mask-headpiece-detail-1.jpg",
      alt: "Wine Heart Mask — macro detail of the hand-sculpted wine-red design, wire-wrapped joints", },
      { type: "image", slot: "Collage — 4 angles", src: "aspect-wine-heart-wine-red-fashion-mask-headpiece-angles.jpg",
      alt: "Wine Heart Mask — four angles: both sides, back and inside", },
      { type: "video", slot: "Hands-on video", src: "aspect-wine-heart-wine-red-fashion-mask-headpiece-hands-on-video.mp4",
      alt: "Wine Heart Mask — hands-on video showing how the wine-red mask fits the face", },
      {
        type: "finalcta",
        slot: "Final CTA (slide 8)",
        src: "aspect-wine-heart-wine-red-fashion-mask-headpiece-ready-to-ship.jpg",
        alt: "Wine Heart Mask — ready to ship, one of one",
        ctaTitle: "First to claim it, wears it.",
        ctaSub: "No identical piece will ever be made again.",
        caption: "Ready to ship today",
      },
    ],
  },

  /* ---- TEMPLATE — copy this block to add your next product ------------
  {
    id: "your-product-id",
    name: "Product Name",
    price: "$ 000", // keep the space between "$" and the number — approved format, see card-body-below-carousel-spec.md
    inStock: true,
    tagline: "One short line describing the piece",
    description: "One-of-one hand-sculpted piece — no two Aspect masks are ever the same.",
    media: [
      { type: "image", slot: "Hero photo", src: null },
      // fit-slide copy is APPROVED and identical for every product — only change `src` (this
      // product's own front/on-mannequin photo) and the scale/originX/originY calibration
      // (per-photo, like text-slide's focusY — see slide2-fit-slide-template-spec.md, Claude
      // project doc, for how to calibrate a new photo). Do not edit bullets.
      { type: "fit", slot: "Fit + objections", src: null, scale: 1.1, originX: 50, originY: 100,
        bullets: [
          { strong: "Fit any face", dim: ": bends by hand." },
          { strong: "Lightweight", dim: ": wear it all night." },
          { strong: "Travels easily", dim: ": box&nbsp;included." },
          { strong: "Soft", dim: ": against your skin, not wire." },
        ] },
      // proof-slide copy is APPROVED and identical for every product — only change `src`
      // (a full-bleed photo proving the piece is genuinely hand-made — a process shot: hands,
      // tools, work-in-progress). Full spec: Claude project doc "proof-slide-template-spec.md".
      { type: "proof", slot: "Proof of process", src: null, heading: "One of one",
        bodyLines: [
          "Authored.",
          "Hand-sculptured.",
          "Once one is claimed, it's gone for good",
        ] },
      // early-cta copy is APPROVED and identical for every product — only change `src` (this
      // product's ready-to-ship photo, reused again on the finalcta slide below). Moved to
      // position 4 2026-08-10 — see cta-slide-template-spec.md.
      { type: "cta", slot: "Order CTA", src: null,
        ctaTitle: "Only one exists.",
        ctaSub: "First to claim it, wears it.<br>No identical piece will ever be made again." },
      // Macro slide — ONE strong close-up shot per product, picked from your available detail
      // photos (favor the crop that most clearly shows the hand-wrapped wire at the thread
      // joints, and fills the 3:4 carousel frame without empty margins).
      { type: "image", slot: "Macro detail", src: null },
      // Collage slide — pre-composited 2x2 grid image (side 1, side 2, back, inside), built
      // externally per product and dropped in assets/products/<id>/ as one file. See slide 6
      // in product-card-slide-sequence-v2-decision.md for the build method (equal-size tiles,
      // no gap/border, cropped ~30% tighter than the raw source photos).
      { type: "image", slot: "Collage — 4 angles", src: null },
      { type: "video", slot: "Hands-on video", src: null },
      // final-cta copy is APPROVED and identical for every product — only change `src` (reuse
      // the same ready-to-ship photo as the early cta slide above). Last slide in the
      // carousel (position 8) — see cta-slide-template-spec.md / product-card-slide-sequence-v2-decision.md.
      { type: "finalcta", slot: "Final CTA (slide 8)", src: null,
        ctaTitle: "First to claim it, wears it.",
        ctaSub: "No identical piece will ever be made again.",
        caption: "Ready to ship today" },
    ],
  },
  ------------------------------------------------------------------------ */
];

// Expose the catalog to the standalone camera try-on page. The storefront keeps
// using the lexical PRODUCTS binding; this alias prevents duplicated product data.
window.ASPECT_PRODUCTS = PRODUCTS;
