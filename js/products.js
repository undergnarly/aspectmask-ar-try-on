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

   CAROUSEL SLIDE ORDER (updated 2026-07-28):
    1. image — Hero photo
    2. video — Hero video
    3. video — Video product review
    4. video — Hands-on video (table → hands → on face)
    5. image — Front photo, on mannequin
    6. image — Side photo 1, on mannequin
    7. image — Side photo 2, on mannequin
    8. image — Back photo, on mannequin
    9. image — Inside photo
    10-11. image — Macro / detail photos (2-3 of them)
    12. text  — brand statement slide (no heading/subheading anymore — see `type: "text"` below)
    13. proof — proof-of-process slide, right after the text slide (see `type: "proof"` below)
    14. cta   — hero photo + overlay copy, nudges toward the Order button

   SLIDE TYPES:
   - { type: "image", slot, src }                — a normal photo
   - { type: "video", slot, src }                 — a normal video (muted, autoplay, loop)
   - { type: "text",  slot, src, focusY, bullets } — brand-copy slide, redesigned 2026-07-28 (heading/
                                                     subheading REMOVED per Lena's new Figma mockup —
                                                     see node-id=21-3). `bullets` is the SAME on every
                                                     product — do not change the copy. `src` is the ONLY
                                                     thing that changes per product (a photo of that
                                                     product's mask, framed so the eyes read clearly in
                                                     the top-third crop). Full positioning spec is saved
                                                     in the Claude project doc "text-slide-template-spec.md"
                                                     — read it before touching this slide's CSS/JS/copy.
   - { type: "proof", slot, src, heading, bodyLines } — NEW 2026-07-28, template APPROVED via Lena's
                                                     Figma mockup (node-id=21-27). heading/bodyLines are
                                                     the SAME on every product — do not change the copy.
                                                     `src` is the ONLY thing that changes per product (a
                                                     photo proving the piece is hand-made — process shot,
                                                     full-bleed). Full spec in the Claude project doc
                                                     "proof-slide-template-spec.md".
   - { type: "cta",   slot, src, ctaTitle, ctaSub } — template APPROVED 2026-07-22.
                                                     ctaTitle/ctaSub are the SAME on every
                                                     product ("Ready to ship" / "Claim it for
                                                     your look. Make your entrance."). `src`
                                                     is the ONLY thing that changes per product.
                                                     Full spec in the Claude project doc
                                                     "cta-slide-template-spec.md".
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
      { type: "video", slot: "Video product review", src: "aspect-ruby-dune-red-fashion-mask-headpiece-review-video.mp4",
      alt: "Ruby Dune Mask — full review video of the red avant-garde headpiece", },
      { type: "video", slot: "Hands-on video", src: "aspect-ruby-dune-red-fashion-mask-headpiece-hands-on-video.mp4",
      alt: "Ruby Dune Mask — hands-on video showing how the red mask fits the face", },
      { type: "image", slot: "Front photo, on mannequin", src: "aspect-ruby-dune-red-fashion-mask-headpiece-front.jpg",
      alt: "Ruby Dune Mask — red mask worn on display form, front view", },
      { type: "image", slot: "Side photo 1, on mannequin", src: "aspect-ruby-dune-red-fashion-mask-headpiece-side-1.jpg",
      alt: "Ruby Dune Mask — red headpiece worn on display form, side view", },
      { type: "image", slot: "Side photo 2, on mannequin", src: "aspect-ruby-dune-red-fashion-mask-headpiece-side-2.jpg",
      alt: "Ruby Dune Mask — red mask worn on display form, other side view", },
      { type: "image", slot: "Back photo, on mannequin", src: "aspect-ruby-dune-red-fashion-mask-headpiece-back.jpg",
      alt: "Ruby Dune Mask — back view of the red mask construction", },
      { type: "image", slot: "Inside photo", src: "aspect-ruby-dune-red-fashion-mask-headpiece-inside.jpg",
      alt: "Ruby Dune Mask — inside view showing the mask's structure", },
      { type: "image", slot: "Macro detail 1", src: "aspect-ruby-dune-red-fashion-mask-headpiece-detail-1.jpg",
      alt: "Ruby Dune Mask — macro detail of the hand-sculpted red design", },
      { type: "image", slot: "Macro detail 2", src: "aspect-ruby-dune-red-fashion-mask-headpiece-detail-2.jpg",
      alt: "Ruby Dune Mask — close-up detail of the red headpiece texture", },
      {
        type: "text",
        slot: "Brand statement",
        src: "aspect-ruby-dune-red-fashion-mask-headpiece-brand-story.jpg",
        alt: "Ruby Dune Mask — one-of-one handmade red fashion mask",
        focusY: 41, // eye-position calibration for THIS photo — see text-slide-template-spec.md
        bullets: [
          "Bends by hand to fit any face.",
          "Lightweight. Wear it all night.",
          "Travels easily — weighs next to nothing, box&nbsp;included.",
          "Soft against your skin, not wire.",
        ],
      },
      {
        type: "proof",
        slot: "Proof of process",
        src: "aspect-ruby-dune-red-fashion-mask-headpiece-handmade-proof.jpg",
        alt: "Ruby Dune Mask — proof of handmade craftsmanship, red mask in progress", // process photo added 2026-07-28 (Lena, direct upload)
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
        ctaTitle: "Ready to ship",
        ctaSub: "Claim it for your look.<br>Make your entrance.",
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
      { type: "video", slot: "Video product review", src: "aspect-black-bird-eye-black-fashion-mask-headpiece-review-video.mp4",
      alt: "Black Bird Eye Mask — full review video of the black avant-garde headpiece", },
      { type: "video", slot: "Hands-on video", src: "aspect-black-bird-eye-black-fashion-mask-headpiece-hands-on-video.mp4",
      alt: "Black Bird Eye Mask — hands-on video showing how the black mask fits the face", },
      { type: "image", slot: "Front photo, on mannequin", src: "aspect-black-bird-eye-black-fashion-mask-headpiece-front.jpg",
      alt: "Black Bird Eye Mask — black mask worn on display form, front view", },
      { type: "image", slot: "Side photo 1, on mannequin", src: "aspect-black-bird-eye-black-fashion-mask-headpiece-side-1.jpg",
      alt: "Black Bird Eye Mask — black headpiece worn on display form, side view", },
      { type: "image", slot: "Side photo 2, on mannequin", src: "aspect-black-bird-eye-black-fashion-mask-headpiece-side-2.jpg",
      alt: "Black Bird Eye Mask — black mask worn on display form, other side view", },
      { type: "image", slot: "Back photo, on mannequin", src: "aspect-black-bird-eye-black-fashion-mask-headpiece-back.jpg",
      alt: "Black Bird Eye Mask — back view of the black mask construction", },
      { type: "image", slot: "Inside photo", src: "aspect-black-bird-eye-black-fashion-mask-headpiece-inside.jpg",
      alt: "Black Bird Eye Mask — inside view showing the mask's structure", },
      { type: "image", slot: "Macro detail 1", src: "aspect-black-bird-eye-black-fashion-mask-headpiece-detail-1.jpg",
      alt: "Black Bird Eye Mask — macro detail of the hand-sculpted black design", },
      { type: "image", slot: "Macro detail 2", src: "aspect-black-bird-eye-black-fashion-mask-headpiece-detail-2.jpg",
      alt: "Black Bird Eye Mask — close-up detail of the black headpiece texture", },
      {
        type: "text",
        slot: "Brand statement",
        src: "aspect-black-bird-eye-black-fashion-mask-headpiece-brand-story.jpg",
        alt: "Black Bird Eye Mask — one-of-one handmade black fashion mask",
        focusY: 23.3, // eye-position calibration for THIS photo — see text-slide-template-spec.md
        bullets: [
          "Bends by hand to fit any face.",
          "Lightweight. Wear it all night.",
          "Travels easily — weighs next to nothing, box&nbsp;included.",
          "Soft against your skin, not wire.",
        ],
      },
      {
        type: "proof",
        slot: "Proof of process",
        src: "aspect-black-bird-eye-black-fashion-mask-headpiece-handmade-proof.jpg",
        alt: "Black Bird Eye Mask — proof of handmade craftsmanship, black mask in progress", // process photo added 2026-07-28 (Lena, direct upload)
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
        ctaTitle: "Ready to ship",
        ctaSub: "Claim it for your look.<br>Make your entrance.",
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
      { type: "video", slot: "Video product review", src: "aspect-black-fire-black-fashion-mask-headpiece-review-video.mp4",
      alt: "Black Fire Mask — full review video of the black avant-garde headpiece", },
      { type: "video", slot: "Hands-on video", src: "aspect-black-fire-black-fashion-mask-headpiece-hands-on-video.mp4",
      alt: "Black Fire Mask — hands-on video showing how the black mask fits the face", },
      { type: "image", slot: "Front photo, on mannequin", src: "aspect-black-fire-black-fashion-mask-headpiece-front.jpg",
      alt: "Black Fire Mask — black mask worn on display form, front view", },
      { type: "image", slot: "Side photo 1, on mannequin", src: "aspect-black-fire-black-fashion-mask-headpiece-side-1.jpg",
      alt: "Black Fire Mask — black headpiece worn on display form, side view", },
      { type: "image", slot: "Side photo 2, on mannequin", src: "aspect-black-fire-black-fashion-mask-headpiece-side-2.jpg",
      alt: "Black Fire Mask — black mask worn on display form, other side view", },
      { type: "image", slot: "Back photo, on mannequin", src: "aspect-black-fire-black-fashion-mask-headpiece-back.jpg",
      alt: "Black Fire Mask — back view of the black mask construction", },
      { type: "image", slot: "Inside photo", src: "aspect-black-fire-black-fashion-mask-headpiece-inside.jpg",
      alt: "Black Fire Mask — inside view showing the mask's structure", },
      { type: "image", slot: "Macro detail 1", src: "aspect-black-fire-black-fashion-mask-headpiece-detail-1.jpg",
      alt: "Black Fire Mask — macro detail of the hand-sculpted black design", },
      { type: "image", slot: "Macro detail 2", src: "aspect-black-fire-black-fashion-mask-headpiece-detail-2.jpg",
      alt: "Black Fire Mask — close-up detail of the black headpiece texture", },
      {
        type: "text",
        slot: "Brand statement",
        src: "aspect-black-fire-black-fashion-mask-headpiece-brand-story.jpg",
        alt: "Black Fire Mask — one-of-one handmade black fashion mask",
        focusY: 40, // reverted per Lena 2026-07-28 — the 58 attempt pushed the crop too far up (opposite of what she wanted)
        scale: 1.77, // +15% vs previous 1.54, per Lena 2026-07-28
        bullets: [
          "Bends by hand to fit any face.",
          "Lightweight. Wear it all night.",
          "Travels easily — weighs next to nothing, box&nbsp;included.",
          "Soft against your skin, not wire.",
        ],
      },
      {
        type: "proof",
        slot: "Proof of process",
        src: "aspect-black-fire-black-fashion-mask-headpiece-handmade-proof.jpg",
        alt: "Black Fire Mask — proof of handmade craftsmanship, black mask in progress", // process photo added 2026-07-28 (Lena, direct upload)
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
        ctaTitle: "Ready to ship",
        ctaSub: "Claim it for your look.<br>Make your entrance.",
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
      { type: "video", slot: "Video product review", src: "aspect-deep-ocean-blue-fashion-mask-headpiece-review-video.mp4",
      alt: "Deep Ocean Mask — full review video of the blue avant-garde headpiece", },
      { type: "video", slot: "Hands-on video", src: "aspect-deep-ocean-blue-fashion-mask-headpiece-hands-on-video.mp4",
      alt: "Deep Ocean Mask — hands-on video showing how the blue mask fits the face", },
      { type: "image", slot: "Front photo, on mannequin", src: "aspect-deep-ocean-blue-fashion-mask-headpiece-front.jpg",
      alt: "Deep Ocean Mask — blue mask worn on display form, front view", },
      { type: "image", slot: "Side photo 1, on mannequin", src: "aspect-deep-ocean-blue-fashion-mask-headpiece-side-1.jpg",
      alt: "Deep Ocean Mask — blue headpiece worn on display form, side view", },
      { type: "image", slot: "Side photo 2, on mannequin", src: "aspect-deep-ocean-blue-fashion-mask-headpiece-side-2.jpg",
      alt: "Deep Ocean Mask — blue mask worn on display form, other side view", },
      { type: "image", slot: "Back photo, on mannequin", src: "aspect-deep-ocean-blue-fashion-mask-headpiece-back.jpg",
      alt: "Deep Ocean Mask — back view of the blue mask construction", },
      { type: "image", slot: "Inside photo", src: "aspect-deep-ocean-blue-fashion-mask-headpiece-inside.jpg",
      alt: "Deep Ocean Mask — inside view showing the mask's structure", },
      { type: "image", slot: "Macro detail 1", src: "aspect-deep-ocean-blue-fashion-mask-headpiece-detail-1.jpg",
      alt: "Deep Ocean Mask — macro detail of the hand-sculpted blue design", },
      { type: "image", slot: "Macro detail 2", src: "aspect-deep-ocean-blue-fashion-mask-headpiece-detail-2.jpg",
      alt: "Deep Ocean Mask — close-up detail of the blue headpiece texture", },
      {
        type: "text",
        slot: "Brand statement",
        src: "aspect-deep-ocean-blue-fashion-mask-headpiece-brand-story.jpg",
        alt: "Deep Ocean Mask — one-of-one handmade blue fashion mask",
        focusY: 26, // eye-position calibration for THIS photo — see text-slide-template-spec.md
        scale: 1.27, // -30% vs the default 1.81, per Lena's request 2026-07-23 (same X/Y center — focusY unchanged)
        bullets: [
          "Bends by hand to fit any face.",
          "Lightweight. Wear it all night.",
          "Travels easily — weighs next to nothing, box&nbsp;included.",
          "Soft against your skin, not wire.",
        ],
      },
      {
        type: "proof",
        slot: "Proof of process",
        src: "aspect-deep-ocean-blue-fashion-mask-headpiece-handmade-proof.jpg",
        alt: "Deep Ocean Mask — proof of handmade craftsmanship, blue mask in progress", // process photo added 2026-07-28 (Lena, direct upload)
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
        ctaTitle: "Ready to ship",
        ctaSub: "Claim it for your look.<br>Make your entrance.",
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
      { type: "video", slot: "Video product review", src: "aspect-electric-fire-red-fashion-mask-headpiece-review-video.mp4",
      alt: "Electric Fire Mask — full review video of the red avant-garde headpiece", },
      { type: "video", slot: "Hands-on video", src: "aspect-electric-fire-red-fashion-mask-headpiece-hands-on-video.mp4",
      alt: "Electric Fire Mask — hands-on video showing how the red mask fits the face", },
      { type: "image", slot: "Front photo, on mannequin", src: "aspect-electric-fire-red-fashion-mask-headpiece-front.jpg",
      alt: "Electric Fire Mask — red mask worn on display form, front view", },
      { type: "image", slot: "Side photo 1, on mannequin", src: "aspect-electric-fire-red-fashion-mask-headpiece-side-1.jpg",
      alt: "Electric Fire Mask — red headpiece worn on display form, side view", },
      { type: "image", slot: "Side photo 2, on mannequin", src: "aspect-electric-fire-red-fashion-mask-headpiece-side-2.jpg",
      alt: "Electric Fire Mask — red mask worn on display form, other side view", },
      { type: "image", slot: "Back photo, on mannequin", src: "aspect-electric-fire-red-fashion-mask-headpiece-back.jpg",
      alt: "Electric Fire Mask — back view of the red mask construction", },
      { type: "image", slot: "Inside photo", src: "aspect-electric-fire-red-fashion-mask-headpiece-inside.jpg",
      alt: "Electric Fire Mask — inside view showing the mask's structure", },
      { type: "image", slot: "Macro detail 1", src: "aspect-electric-fire-red-fashion-mask-headpiece-detail-1.jpg",
      alt: "Electric Fire Mask — macro detail of the hand-sculpted red design", },
      { type: "image", slot: "Macro detail 2", src: "aspect-electric-fire-red-fashion-mask-headpiece-detail-2.jpg",
      alt: "Electric Fire Mask — close-up detail of the red headpiece texture", },
      {
        type: "text",
        slot: "Brand statement",
        src: "aspect-electric-fire-red-fashion-mask-headpiece-brand-story.jpg",
        alt: "Electric Fire Mask — one-of-one handmade red fashion mask",
        focusY: 40, // eye-position calibration for THIS photo — see text-slide-template-spec.md
        bullets: [
          "Bends by hand to fit any face.",
          "Lightweight. Wear it all night.",
          "Travels easily — weighs next to nothing, box&nbsp;included.",
          "Soft against your skin, not wire.",
        ],
      },
      {
        type: "proof",
        slot: "Proof of process",
        src: "aspect-electric-fire-red-fashion-mask-headpiece-handmade-proof.jpg",
        alt: "Electric Fire Mask — proof of handmade craftsmanship, red mask in progress", // process photo added 2026-07-28 (Lena, direct upload)
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
        ctaTitle: "Ready to ship",
        ctaSub: "Claim it for your look.<br>Make your entrance.",
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
      { type: "video", slot: "Video product review", src: "aspect-wine-heart-wine-red-fashion-mask-headpiece-review-video.mp4",
      alt: "Wine Heart Mask — full review video of the wine-red avant-garde headpiece", },
      { type: "video", slot: "Hands-on video", src: "aspect-wine-heart-wine-red-fashion-mask-headpiece-hands-on-video.mp4",
      alt: "Wine Heart Mask — hands-on video showing how the wine-red mask fits the face", },
      { type: "image", slot: "Front photo, on mannequin", src: "aspect-wine-heart-wine-red-fashion-mask-headpiece-front.jpg",
      alt: "Wine Heart Mask — wine-red mask worn on display form, front view", },
      { type: "image", slot: "Side photo 1, on mannequin", src: "aspect-wine-heart-wine-red-fashion-mask-headpiece-side-1.jpg",
      alt: "Wine Heart Mask — wine-red headpiece worn on display form, side view", },
      { type: "image", slot: "Side photo 2, on mannequin", src: "aspect-wine-heart-wine-red-fashion-mask-headpiece-side-2.jpg",
      alt: "Wine Heart Mask — wine-red mask worn on display form, other side view", },
      { type: "image", slot: "Back photo, on mannequin", src: "aspect-wine-heart-wine-red-fashion-mask-headpiece-back.jpg",
      alt: "Wine Heart Mask — back view of the wine-red mask construction", },
      { type: "image", slot: "Inside photo", src: "aspect-wine-heart-wine-red-fashion-mask-headpiece-inside.jpg",
      alt: "Wine Heart Mask — inside view showing the mask's structure", },
      { type: "image", slot: "Macro detail 1", src: "aspect-wine-heart-wine-red-fashion-mask-headpiece-detail-1.jpg",
      alt: "Wine Heart Mask — macro detail of the hand-sculpted wine-red design", },
      { type: "image", slot: "Macro detail 2", src: "aspect-wine-heart-wine-red-fashion-mask-headpiece-detail-2.jpg",
      alt: "Wine Heart Mask — close-up detail of the wine-red headpiece texture", },
      {
        type: "text",
        slot: "Brand statement",
        src: "aspect-wine-heart-wine-red-fashion-mask-headpiece-brand-story.jpg",
        alt: "Wine Heart Mask — one-of-one handmade wine-red fashion mask",
        focusY: 35, // raised eye level slightly per Lena 2026-07-28 (was 30)
        scale: 2.08, // +15% vs default 1.81, per Lena 2026-07-28
        bullets: [
          "Bends by hand to fit any face.",
          "Lightweight. Wear it all night.",
          "Travels easily — weighs next to nothing, box&nbsp;included.",
          "Soft against your skin, not wire.",
        ],
      },
      {
        type: "proof",
        slot: "Proof of process",
        src: "aspect-wine-heart-wine-red-fashion-mask-headpiece-handmade-proof.jpg",
        alt: "Wine Heart Mask — proof of handmade craftsmanship, wine-red mask in progress", // process photo added 2026-07-28 (Lena, direct upload)
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
        ctaTitle: "Ready to ship",
        ctaSub: "Claim it for your look.<br>Make your entrance.",
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
      { type: "video", slot: "Video product review", src: null },
      { type: "video", slot: "Hands-on video", src: null },
      { type: "image", slot: "Front photo, on mannequin", src: null },
      { type: "image", slot: "Side photo 1, on mannequin", src: null },
      { type: "image", slot: "Side photo 2, on mannequin", src: null },
      { type: "image", slot: "Back photo, on mannequin", src: null },
      { type: "image", slot: "Inside photo", src: null },
      { type: "image", slot: "Macro detail 1", src: null },
      { type: "image", slot: "Macro detail 2", src: null },
      // text-slide copy is APPROVED and identical for every product — only change `src`
      // (a photo of THIS product's mask, cropped/zoomed per text-slide-template-spec.md
      // so the eyes read clearly in the top third). Do not edit bullets. No heading/subheading
      // anymore (removed 2026-07-28). focusY: eye-position % for THIS photo, calculated per the
      // formula in text-slide-template-spec.md — every product needs its own value (photos differ).
      { type: "text", slot: "Brand statement", src: null, focusY: 41,
        bullets: [
          "Bends by hand to fit any face.",
          "Lightweight. Wear it all night.",
          "Travels easily — weighs next to nothing, box&nbsp;included.",
          "Soft against your skin, not wire.",
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
      // cta-slide copy is APPROVED and identical for every product — only change `src`
      // (a photo of THIS product's mask; the bottom third gets covered by a graphite
      // gradient + text, so keep the piece's key visual detail in the top two-thirds
      // of the frame). Full spec: Claude project doc "cta-slide-template-spec.md".
      { type: "cta", slot: "Order CTA", src: null,
        ctaTitle: "Ready to ship",
        ctaSub: "Claim it for your look.<br>Make your entrance." },
    ],
  },
  ------------------------------------------------------------------------ */
];

// Expose the catalog to the standalone camera try-on page. The main storefront
// continues to use the lexical PRODUCTS binding above; this read-only alias
// avoids duplicating product names and thumbnail paths in another file.
window.ASPECT_PRODUCTS = PRODUCTS;
