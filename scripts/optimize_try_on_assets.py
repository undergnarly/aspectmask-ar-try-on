"""Create exact-alpha WebP copies of the six camera try-on cutouts."""

from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]

for source in sorted((ROOT / "assets" / "ar").glob("*-mask.png")):
    destination = source.with_suffix(".webp")
    with Image.open(source) as image:
        image.save(destination, "WEBP", lossless=True, method=6)
    print("{}: {} -> {} bytes".format(source.name, source.stat().st_size, destination.stat().st_size))
