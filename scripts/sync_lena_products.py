#!/usr/bin/env python3
"""Import Lena's analytics-led product catalog without replacing storefront code.

The two repositories intentionally have different histories.  This utility reads
only ``js/products.js`` from Lena's latest fetched ``origin/main`` and preserves
the small browser export required by the standalone camera try-on page.
"""

from pathlib import Path
import re
import subprocess


ROOT = Path(__file__).resolve().parents[1]
LENA_REPO = ROOT.parent / "aspectmask-site"
PRODUCTS_FILE = ROOT / "js" / "products.js"
LENA_REF = "origin/main:js/products.js"
TRY_ON_EXPORT = """

// Expose the catalog to the standalone camera try-on page. The storefront keeps
// using the lexical PRODUCTS binding; this alias prevents duplicated product data.
window.ASPECT_PRODUCTS = PRODUCTS;
"""


def read_lena_catalog() -> str:
    result = subprocess.run(
        ["git", "-C", str(LENA_REPO), "show", LENA_REF],
        check=True,
        capture_output=True,
        text=True,
        encoding="utf-8",
    )
    return result.stdout.rstrip() + "\n"


def validate(catalog: str) -> None:
    product_ids = re.findall(r'^\s+id:\s+"([^"]+)",', catalog, re.MULTILINE)
    if product_ids != [
        "ruby-dune",
        "black-bird-eye",
        "black-fire",
        "deep-ocean",
        "electric-fire",
        "wine-heart",
        "your-product-id",
    ]:
        raise SystemExit(f"Unexpected product order: {product_ids}")

    live_catalog = catalog.split("/* ---- TEMPLATE", 1)[0]
    required_markers = {
        r'^\s+type: "fit",$': 6,
        r'^\s+type: "proof",$': 6,
        r'^\s+type: "cta",$': 6,
        r'^\s+type: "finalcta",$': 6,
        r'^\s+\{ type: "image", slot: "Collage — 4 angles",': 6,
        r'^\s+\{ type: "video", slot: "Hands-on video",': 6,
    }
    for marker, expected in required_markers.items():
        actual = len(re.findall(marker, live_catalog, re.MULTILINE))
        if actual != expected:
            raise SystemExit(f"Expected {expected} occurrences of {marker!r}, found {actual}")


def main() -> None:
    catalog = read_lena_catalog()
    validate(catalog)
    if "window.ASPECT_PRODUCTS" not in catalog:
        catalog = catalog.rstrip() + TRY_ON_EXPORT
    PRODUCTS_FILE.write_text(catalog, encoding="utf-8")
    print(f"Synced Lena's 8-slide catalog to {PRODUCTS_FILE.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
