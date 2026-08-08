#!/usr/bin/env python3
"""Local-only dev server mimicking Vercel's cleanUrls+trailingSlash:false
behavior, so /products/<id> (no extension, no trailing slash) resolves to
products/<id>/index.html — just for testing before deploy. Not shipped."""
import http.server
import os
import socketserver

PORT = 8799


class Handler(http.server.SimpleHTTPRequestHandler):
    # Python's http.server doesn't send a charset on text/* responses, which
    # made Chromium mis-decode the UTF-8 em dashes in js/app.js as Latin-1
    # during local testing (mojibake) — the real host (Vercel/GitHub Pages)
    # doesn't have this gap, but pin it here too so local testing is accurate.
    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        ".js": "text/javascript; charset=UTF-8",
        ".html": "text/html; charset=UTF-8",
        ".xml": "application/xml; charset=UTF-8",
    }

    def translate_path(self, path):
        path = path.split("?", 1)[0].split("#", 1)[0]
        if path.rstrip("/") == "/products" or path == "/":
            pass
        clean = path.rstrip("/")
        if clean and not os.path.splitext(clean)[1]:
            candidate = self.directory + clean + "/index.html"
            if os.path.isfile(candidate):
                return candidate
        return super().translate_path(path)


os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
with socketserver.TCPServer(("127.0.0.1", PORT), Handler) as httpd:
    print(f"serving on http://127.0.0.1:{PORT}")
    httpd.serve_forever()
