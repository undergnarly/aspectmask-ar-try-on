#!/usr/bin/env python3
"""
ASPECT — generate a real, crawlable static page for every product.

WHY THIS EXISTS (session #10, 2026-07-28)
------------------------------------------
The catalog used to open every product as a JS modal on top of "/", with no
URL of its own — Google could only ever index one address (the homepage),
so no individual mask could rank on its own in search. Lena asked for a
real URL per product, permanently, for every future product too.

This script generates products/<id>/index.html for every product in
js/products.js: same page shell as index.html (js/app.js drives all the
actual carousel/modal content at runtime either way, and detects the
"/products/<id>" path to auto-open that product on load — see the routing
comment block in js/app.js), but with its OWN <title>/<meta description>/
canonical/Open Graph/Twitter Card/JSON-LD Product block, plus a <noscript>
fallback describing the piece in plain text.

HOW TO ADD A NEW PRODUCT (do this AFTER following product-card-layout-spec.md
as usual to add the product to js/products.js):
    python3 scripts/generate_product_pages.py
This regenerates ALL product pages (cheap, a few KB each) and rewrites
sitemap.xml to match. Then deploy the new/changed files under products/
and the updated sitemap.xml the same way you deploy everything else.

DO NOT hand-edit files under products/<id>/index.html directly — the next
run of this script overwrites them. Edit index.html's SEO-META/NOSCRIPT-SEO
markers (the shared template) or js/products.js (the per-product data)
instead.
"""

import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
INDEX_HTML = ROOT / "index.html"
PRODUCTS_JS = ROOT / "js" / "products.js"
SITE_ORIGIN = "https://aspectmask.com"

SEO_START = "<!-- SEO-META:START -->"
SEO_END = "<!-- SEO-META:END -->"
NOSCRIPT_START = "<!-- NOSCRIPT-SEO:START -->"
NOSCRIPT_END = "<!-- NOSCRIPT-SEO:END -->"


def parse_products():
    """Pull the PRODUCTS array out of js/products.js without a JS runtime.

    js/products.js is plain-object literal syntax (not JSON — trailing
    commas, unquoted keys, // comments), so we can't json.loads it directly.
    Node is not guaranteed to be present in every environment this script
    might run in, so instead we do a light-touch regex extraction of just
    the handful of top-level fields this script needs (id/name/price/
    tagline/description/inStock/first media src) rather than a full parser.
    If you add a field this script needs, extend the regexes below rather
    than reaching for a full JS parser.
    """
    text = PRODUCTS_JS.read_text(encoding="utf-8")
    # isolate the PRODUCTS = [ ... ]; array, stop before the commented-out
    # TEMPLATE block guidance if present — but the template product
    # (id: "your-product-id") is harmless to include/exclude either way
    # since it's filtered out below by checking inStock is not explicitly
    # false and id isn't the placeholder.
    # PRODUCTS is followed by a small browser-facing alias used by the AR
    # try-on page, so the array no longer has to be the final statement in
    # the file. Stop at its own closing `];` instead of anchoring to EOF.
    array_match = re.search(r"const PRODUCTS\s*=\s*\[(.*?)\];", text, re.S)
    if not array_match:
        print("ERROR: could not find `const PRODUCTS = [...]` in js/products.js", file=sys.stderr)
        sys.exit(1)
    body = array_match.group(1)

    # split into top-level {...} blocks (products are not nested objects at
    # the top level beyond `media`, so bracket-depth counting is enough)
    blocks = []
    depth = 0
    start = None
    for i, ch in enumerate(body):
        if ch == "{":
            if depth == 0:
                start = i
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0 and start is not None:
                blocks.append(body[start : i + 1])
                start = None

    def field(pattern, block, default=None):
        m = re.search(pattern, block)
        return m.group(1) if m else default

    def extract_image_srcs(block):
        """Pull every non-video media src from this product's `media: [...]` array,
        for the image sitemap (session #10, 2026-07-29 — added when photos/videos
        were renamed with SEO filenames). Skips video slides — image sitemaps are
        for images only; a video sitemap would be a separate future addition.
        Bracket-depth-matches the media array itself (it contains nested arrays
        like `bullets`/`bodyLines`, so a naive regex would stop at the first `]`)."""
        media_start = block.find("media:")
        if media_start == -1:
            return []
        arr_start = block.find("[", media_start)
        if arr_start == -1:
            return []
        depth = 0
        arr_end = None
        for i in range(arr_start, len(block)):
            if block[i] == "[":
                depth += 1
            elif block[i] == "]":
                depth -= 1
                if depth == 0:
                    arr_end = i
                    break
        if arr_end is None:
            return []
        media_text = block[arr_start + 1 : arr_end]

        # split into individual {...} slide objects (brace-depth aware)
        slides = []
        depth = 0
        start = None
        for i, ch in enumerate(media_text):
            if ch == "{":
                if depth == 0:
                    start = i
                depth += 1
            elif ch == "}":
                depth -= 1
                if depth == 0 and start is not None:
                    slides.append(media_text[start : i + 1])
                    start = None

        srcs = []
        for slide in slides:
            type_m = re.search(r'type:\s*"([^"]*)"', slide)
            src_m = re.search(r'src:\s*"([^"]+\.(?:jpg|jpeg|png|webp))"', slide)
            if type_m and src_m and type_m.group(1) != "video":
                srcs.append(src_m.group(1))
        return srcs

    products = []
    for block in blocks:
        pid = field(r'id:\s*"([^"]*)"', block)
        if not pid or pid == "your-product-id":
            continue  # skip the commented-out template block at the end
        name = field(r'name:\s*"([^"]*)"', block, pid)
        price = field(r'price:\s*"([^"]*)"', block, "")
        tagline = field(r'tagline:\s*"((?:[^"\\]|\\.)*)"', block, "")
        # description can be a multi-line string literal split across
        # `"..." + "..."`-free plain quotes with just JS string concatenation
        # via adjacent lines — collapse whitespace between quote fragments.
        desc_match = re.search(r'description:\s*\n?\s*"((?:[^"\\]|\\.)*)"', block)
        description = desc_match.group(1) if desc_match else ""
        # metaDescription is OPTIONAL — an explicit SEO/link-preview override (session
        # #11, 2026-07-29) so we can write link-preview copy without touching the
        # visible on-page tagline/description fields above. Falls back to the old
        # tagline+description formula in build_seo_block() when absent, so any future
        # product that doesn't set it still gets a sane description.
        meta_desc_match = re.search(r'metaDescription:\s*\n?\s*"((?:[^"\\]|\\.)*)"', block)
        meta_description = meta_desc_match.group(1) if meta_desc_match else None
        in_stock = "inStock: false" not in block
        first_src_match = re.search(r'src:\s*"([^"]+\.(?:jpg|jpeg|png|webp))"', block)
        cover = first_src_match.group(1) if first_src_match else None
        image_srcs = extract_image_srcs(block)
        products.append(
            {
                "id": pid,
                "name": html.unescape(name).replace("\\n", " "),
                "price": price,
                "tagline": tagline.replace("\\n", " "),
                "description": description.replace("\\n", " "),
                "metaDescription": meta_description.replace("\\n", " ") if meta_description else None,
                "inStock": in_stock,
                "cover": cover,
                "image_srcs": image_srcs,
            }
        )
    return products


def price_to_number(price_str):
    digits = re.sub(r"[^0-9.]", "", price_str or "")
    try:
        return float(digits) if digits else None
    except ValueError:
        return None


def build_seo_block(product):
    # Trailing slash matters here: GitHub Pages serves this as a directory
    # (products/<id>/index.html) and 301-redirects the no-slash URL to the
    # slash version. Every URL we publish ourselves (canonical, og:url,
    # sitemap) must be the slash version so nothing we control forces a
    # redirect hop — see session #12, 2026-07-29 trailing-slash cleanup.
    url = f"{SITE_ORIGIN}/products/{product['id']}/"
    title = f"{product['name']} — ASPECT | Fashion Avant-Garde Designer Mask"
    # meta description: prefer the explicit metaDescription override (session #11,
    # 2026-07-29 — Lena-approved copy combining product craft details + homepage
    # keywords, hand-tuned by hand to fit Google's ~159-char practical display limit
    # and always stating the color). This text is already exactly as long as Lena
    # wants it, so skip the auto-truncate for it — only the old tagline+description
    # fallback formula (used for any future product that doesn't set metaDescription)
    # gets auto-truncated, since that formula can run arbitrarily long.
    if product["metaDescription"]:
        desc = product["metaDescription"]
    else:
        desc = f"{product['tagline']}. {product['description']}".strip()
        if len(desc) > 155:
            desc = desc[:152].rsplit(" ", 1)[0] + "…"
    desc_attr = html.escape(desc, quote=True)
    title_attr = html.escape(title, quote=True)
    name_attr = html.escape(product["name"], quote=True)
    image_url = (
        f"{SITE_ORIGIN}/assets/products/{product['id']}/{product['cover']}"
        if product["cover"]
        else f"{SITE_ORIGIN}/assets/brand/og-cover.jpg"
    )
    price_num = price_to_number(product["price"])
    availability = "https://schema.org/InStock" if product["inStock"] else "https://schema.org/OutOfStock"

    ld = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product["name"],
        "image": [image_url],
        "description": desc,
        "sku": product["id"],
        "brand": {"@type": "Brand", "name": "ASPECT"},
    }
    if price_num is not None:
        ld["offers"] = {
            "@type": "Offer",
            "url": url,
            "priceCurrency": "USD",
            "price": price_num,
            "availability": availability,
        }

    return f"""<title>{title_attr}</title>
<meta name="description" content="{desc_attr}" />
<link rel="canonical" href="{url}" />

<!-- Open Graph (for when this piece's link is shared in Instagram Direct — see
     order-popup-spec.md, the "copy link" step now copies this exact URL) -->
<meta property="og:title" content="{name_attr} — ASPECT" />
<meta property="og:description" content="{desc_attr}" />
<meta property="og:image" content="{image_url}" />
<meta property="og:url" content="{url}" />
<meta property="og:type" content="product" />
<meta property="og:site_name" content="ASPECT" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="{name_attr} — ASPECT" />
<meta name="twitter:description" content="{desc_attr}" />
<meta name="twitter:image" content="{image_url}" />

<script type="application/ld+json">
{json.dumps(ld, indent=2)}
</script>"""


def build_noscript_block(product):
    price_line = f"<p>{html.escape(product['price'])}</p>" if product["price"] else ""
    img = (
        f'<img src="/assets/products/{product["id"]}/{product["cover"]}" alt="{html.escape(product["name"], quote=True)}" style="max-width:100%;height:auto;" />'
        if product["cover"]
        else ""
    )
    return f"""<noscript>
  <div style="padding:24px;color:#fff;background:#000;font-family:sans-serif;">
    <h1>{html.escape(product['name'])}</h1>
    <p>{html.escape(product['tagline'])}</p>
    {price_line}
    {img}
    <p>{html.escape(product['description'])}</p>
  </div>
</noscript>"""


def replace_between(text, start_marker, end_marker, new_inner):
    pattern = re.compile(re.escape(start_marker) + r".*?" + re.escape(end_marker), re.S)
    replacement = f"{start_marker}\n{new_inner}\n{end_marker}"
    # use a lambda (not a plain string) as the repl arg — re.sub treats a string
    # repl's backslashes as backreference escapes (\1, \u, ...), which corrupts
    # content like JSON-LD that legitimately contains backslashes
    new_text, count = pattern.subn(lambda _m: replacement, text, count=1)
    if count != 1:
        raise RuntimeError(f"expected exactly one {start_marker}...{end_marker} block, found {count}")
    return new_text


def main():
    base_html = INDEX_HTML.read_text(encoding="utf-8")
    products = parse_products()
    if not products:
        print("ERROR: no products parsed from js/products.js", file=sys.stderr)
        sys.exit(1)

    out_dir = ROOT / "products"
    out_dir.mkdir(exist_ok=True)

    # (url, [image_urls]) pairs — homepage has no per-product images list here,
    # its own hero image is added separately below.
    url_entries = [
        (f"{SITE_ORIGIN}/", [f"{SITE_ORIGIN}/assets/brand/og-cover.jpg"]),
        (f"{SITE_ORIGIN}/privacy/", []),
    ]
    for product in products:
        page = replace_between(base_html, SEO_START, SEO_END, build_seo_block(product))
        page = replace_between(page, NOSCRIPT_START, NOSCRIPT_END, build_noscript_block(product))
        product_dir = out_dir / product["id"]
        product_dir.mkdir(parents=True, exist_ok=True)
        (product_dir / "index.html").write_text(page, encoding="utf-8")
        image_urls = [
            f"{SITE_ORIGIN}/assets/products/{product['id']}/{fname}"
            for fname in product.get("image_srcs", [])
        ]
        url_entries.append((f"{SITE_ORIGIN}/products/{product['id']}/", image_urls))
        print(f"wrote products/{product['id']}/index.html ({len(image_urls)} images in sitemap)")

    def render_url_entry(loc, image_urls):
        images_xml = "".join(
            f"\n    <image:image><image:loc>{img}</image:loc></image:image>"
            for img in image_urls
        )
        return f"  <url>\n    <loc>{loc}</loc>{images_xml}\n  </url>"

    sitemap_entries = "\n".join(render_url_entry(loc, imgs) for loc, imgs in url_entries)
    sitemap = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
{sitemap_entries}
</urlset>
"""
    (ROOT / "sitemap.xml").write_text(sitemap, encoding="utf-8")
    print(f"wrote sitemap.xml ({len(url_entries)} URLs, with per-product image entries)")


if __name__ == "__main__":
    main()
