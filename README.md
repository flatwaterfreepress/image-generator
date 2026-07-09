# Documenters Image Generator

A simple web app for creating branded 1920×1080 Documenters images. Upload a photo, choose a logo and style, then download as WebP.

## Run locally

Serve the project over HTTP (required for logo assets):

```bash
python3 -m http.server 8080
```

Open http://localhost:8080

## Deploy to GitHub Pages

1. Push this repo to GitHub
2. In the repo settings, go to **Pages**
3. Under **Build and deployment**, set **Source** to **GitHub Actions**
4. Push to `main` or `master` — the included workflow deploys automatically

The app will be available at `https://<org-or-user>.github.io/image-generator/`
