"""Fail when a generated page points at a missing local asset."""

from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]


class AssetParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.paths = []

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        for key in ("src", "href"):
            value = values.get(key, "")
            if value.startswith(("/assets/", "/css/", "/js/")):
                self.paths.append(urlparse(value).path)


pages = [ROOT / "index.html", ROOT / "privacy" / "index.html"]
pages.extend(sorted((ROOT / "products").glob("*/index.html")))
missing = []
for page in pages:
    parser = AssetParser()
    parser.feed(page.read_text(encoding="utf-8"))
    for asset in parser.paths:
        if not (ROOT / asset.lstrip("/")).is_file():
            missing.append("{} -> {}".format(page.relative_to(ROOT), asset))

if missing:
    raise SystemExit("Missing static assets:\n" + "\n".join(missing))
print("Verified {} pages: every local asset exists".format(len(pages)))
