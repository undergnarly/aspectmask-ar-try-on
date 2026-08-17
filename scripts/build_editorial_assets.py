"""Build local, mobile-sized assets for the Archive and As Seen sections.

The source folders are owned by ASPECT. Only the selected `hero` image from
each sold-mask folder is published. Instagram preview images are cached locally
so the storefront never waits for third-party embeds during first paint.
"""

from __future__ import annotations

import html
import re
import unicodedata
from pathlib import Path

import gdown
import requests
from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
SOLD_SOURCE_URL = (
    "https://drive.google.com/drive/folders/"
    "1xXUbdSX5WuLy5S0mf2cRHBHODoTci4wU"
)
SOLD_DOWNLOADS = ROOT / "tmp" / "drive-sold-heroes"
ARCHIVE_OUTPUT = ROOT / "assets" / "archive"
AS_SEEN_OUTPUT = ROOT / "assets" / "as-seen"

AS_SEEN = [
    ("flanelle-magazine", "https://www.instagram.com/p/DJenuvNxWD0/"),
    ("bali-kudeta-runway", "https://www.instagram.com/reel/DN21obE5G4-/"),
    ("million-view-music-video", "https://www.instagram.com/reel/DJtINxZPEMQ/"),
    ("tata-shapran-music-video", "https://www.instagram.com/reel/DKpziN2vFIx/"),
    ("motion-stage-performance", "https://www.instagram.com/reel/DOC1vN9Es4z/"),
    ("mikhail-talanov-stage", "https://www.instagram.com/reel/DawcR3Qz6if/"),
]


def slugify(value: str) -> str:
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-") or "archive-piece"


def to_webp(source: Path, destination: Path, max_width: int = 1100) -> tuple[int, int]:
    with Image.open(source) as opened:
        image = ImageOps.exif_transpose(opened)
        if image.width > max_width:
            new_height = round(image.height * max_width / image.width)
            image = image.resize((max_width, new_height), Image.Resampling.LANCZOS)
        if image.mode not in ("RGB", "RGBA"):
            image = image.convert("RGB")
        destination.parent.mkdir(parents=True, exist_ok=True)
        image.save(destination, "WEBP", quality=84, method=6)
        return image.width, image.height


def build_archive() -> list[dict[str, object]]:
    listing = gdown.download_folder(
        url=SOLD_SOURCE_URL,
        output=str(SOLD_DOWNLOADS),
        quiet=True,
        remaining_ok=True,
        skip_download=True,
    )
    if not listing:
        raise RuntimeError("The sold-mask Drive folder could not be listed")

    chosen = {}
    for item in listing:
        relative = Path(item.local_path).relative_to(SOLD_DOWNLOADS)
        if not re.search(r"(?i)hero|herp", relative.name):
            continue
        folder = relative.parts[0] if len(relative.parts) > 1 else relative.stem
        chosen.setdefault(folder, item)

    SOLD_DOWNLOADS.mkdir(parents=True, exist_ok=True)
    ARCHIVE_OUTPUT.mkdir(parents=True, exist_ok=True)
    manifest = []
    for folder, item in sorted(chosen.items(), key=lambda pair: pair[0].lower()):
        source = Path(item.local_path)
        source.parent.mkdir(parents=True, exist_ok=True)
        if not source.exists():
            earlier = ROOT / "tmp" / "drive-sold" / folder
            earlier_matches = (
                [path for path in earlier.iterdir() if re.search(r"(?i)hero|herp", path.name)]
                if earlier.exists()
                else []
            )
            if earlier_matches:
                source.write_bytes(earlier_matches[0].read_bytes())
                result = str(source)
            else:
                try:
                    result = gdown.download(id=item.id, output=str(source), quiet=True, fuzzy=True)
                except Exception as exc:
                    print("Skipping unavailable Drive image {}: {}".format(folder, exc))
                    continue
            if not result:
                print("Skipping unavailable Drive image: {}".format(folder))
                continue
        destination = ARCHIVE_OUTPUT / "{}.webp".format(slugify(folder))
        try:
            width, height = to_webp(source, destination)
        except Exception as exc:
            print("Skipping unreadable image {}: {}".format(folder, exc))
            continue
        manifest.append(
            {
                "name": folder,
                "src": "/assets/archive/{}".format(destination.name),
                "width": width,
                "height": height,
            }
        )

    lines = ["window.ASPECT_ARCHIVE = ["]
    for item in manifest:
        lines.append(
            '  {{ name: "{name}", src: "{src}", width: {width}, height: {height} }},'.format(
                **item
            )
        )
    lines.append("];\n")
    (ROOT / "js" / "archive-data.js").write_text("\n".join(lines), encoding="utf-8")
    return manifest


def instagram_preview_url(page_url: str) -> str:
    response = requests.get(
        page_url,
        headers={"User-Agent": "Mozilla/5.0 (ASPECT storefront asset builder)"},
        timeout=30,
    )
    response.raise_for_status()
    patterns = [
        r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)',
        r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:image["\']',
    ]
    for pattern in patterns:
        match = re.search(pattern, response.text, flags=re.IGNORECASE)
        if match:
            return html.unescape(match.group(1))
    raise RuntimeError("Instagram did not expose an og:image for {}".format(page_url))


def build_as_seen() -> int:
    AS_SEEN_OUTPUT.mkdir(parents=True, exist_ok=True)
    session = requests.Session()
    session.headers.update({"User-Agent": "Mozilla/5.0"})
    built = 0
    for slug, page_url in AS_SEEN:
        destination = AS_SEEN_OUTPUT / "{}.webp".format(slug)
        try:
            preview_url = instagram_preview_url(page_url)
            temporary = AS_SEEN_OUTPUT / "{}.source".format(slug)
            response = session.get(preview_url, timeout=45)
            response.raise_for_status()
            temporary.write_bytes(response.content)
            to_webp(temporary, destination, max_width=900)
            temporary.unlink(missing_ok=True)
            built += 1
        except Exception as exc:
            print("Skipping Instagram preview {}: {}".format(slug, exc))
    return built


if __name__ == "__main__":
    archive = build_archive()
    seen_count = build_as_seen()
    print("Built {} archive images and {} As Seen previews".format(len(archive), seen_count))
