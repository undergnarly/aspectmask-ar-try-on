# aspectmask-site

Static storefront for ASPECT masks.

## Local preview

Run the included server from the repository root:

```powershell
python scripts/dev_server.py
```

Open `http://127.0.0.1:8799/`. Product pages are generated from `index.html` and
`js/products.js` with `python scripts/generate_product_pages.py`.

## Camera try-on

The beta experience lives at `/try-on/?mask=ruby-dune`. It uses MediaPipe Face
Landmarker in the browser and transparent 2D mask cutouts from `assets/ar/`.
Camera frames stay on the visitor's device; the implementation does not upload
or store them. A secure HTTPS origin is required on phones outside localhost.

The current cutouts are front-view prototypes. For production-quality fit at
larger head angles, replace them with artist-approved transparent renders or 3D
assets and keep the mask IDs in `js/try-on.js` aligned with `js/products.js`.

## Netlify

The repository includes `netlify.toml`, `_headers`, and `.netlifyignore`. The
publish directory is the repository root and no build command is required.
