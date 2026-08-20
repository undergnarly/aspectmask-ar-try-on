"""Import one hero image per sold-mask folder as compact WebP assets."""

from __future__ import annotations

import argparse
import json
import re
import unicodedata
from pathlib import Path

from PIL import Image, ImageOps

try:
    from pillow_heif import register_heif_opener
except ImportError:
    register_heif_opener = None


ROOT = Path(__file__).resolve().parents[1]
ARCHIVE_OUTPUT = ROOT / "assets" / "archive"
ARCHIVE_DATA = ROOT / "js" / "archive-data.js"
HERO_PATTERN = re.compile(r"hero|herp", re.IGNORECASE)


def slugify(value: str) -> str:
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-") or "archive-piece"


def hero_priority(path: Path) -> tuple[bool, bool, str]:
    """Prefer correctly named, primary hero files over alternates and typos."""
    lowered = path.name.lower()
    return ("herp" in lowered, "2" in path.stem, lowered)


def convert_to_webp(source: Path, destination: Path) -> tuple[int, int]:
    with Image.open(source) as opened:
        image = ImageOps.exif_transpose(opened)
        image.thumbnail((960, 1200), Image.Resampling.LANCZOS)
        if image.mode != "RGB":
            image = image.convert("RGB")
        destination.parent.mkdir(parents=True, exist_ok=True)
        image.save(destination, "WEBP", quality=76, method=6)
        return image.width, image.height


def import_archive(source_root: Path) -> list[dict[str, object]]:
    if register_heif_opener is not None:
        register_heif_opener()

    folders = sorted(
        (path for path in source_root.iterdir() if path.is_dir()),
        key=lambda path: path.name.lower(),
    )
    manifest: list[dict[str, object]] = []

    for folder in folders:
        candidates = sorted(
            (path for path in folder.iterdir() if path.is_file() and HERO_PATTERN.search(path.name)),
            key=hero_priority,
        )
        if not candidates:
            print(f"Skipping {folder.name}: no hero image")
            continue

        destination = ARCHIVE_OUTPUT / f"{slugify(folder.name)}.webp"
        last_error: Exception | None = None
        for source in candidates:
            try:
                width, height = convert_to_webp(source, destination)
                break
            except Exception as exc:
                last_error = exc
        else:
            raise RuntimeError(f"Could not convert {folder.name}: {last_error}")

        manifest.append(
            {
                "name": folder.name.strip(),
                "src": f"/assets/archive/{destination.name}",
                "width": width,
                "height": height,
            }
        )
        print(f"Built {folder.name.strip()}: {width}x{height} -> {destination.name}")

    lines = ["window.ASPECT_ARCHIVE = ["]
    for item in manifest:
        lines.append(
            "  { name: %s, src: %s, width: %d, height: %d },"
            % (
                json.dumps(item["name"], ensure_ascii=False),
                json.dumps(item["src"]),
                item["width"],
                item["height"],
            )
        )
    lines.append("];\n")
    ARCHIVE_DATA.write_text("\n".join(lines), encoding="utf-8")
    return manifest


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path, help="Folder containing one subfolder per sold mask")
    args = parser.parse_args()
    manifest = import_archive(args.source.resolve())
    print(f"Imported {len(manifest)} sold masks")


if __name__ == "__main__":
    main()
