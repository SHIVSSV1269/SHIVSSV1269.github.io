# Shivaselvam S — Portfolio

Static site, no build step: `index.html`, `style.css`, `script.js`, `assets/`.

## Add your photo
1. Save it as `assets/photo.jpg` (square, at least 800×800).
2. In `index.html`, find `<div class="photo-placeholder">…</div>` and replace the whole div with:
   ```html
   <img src="assets/photo.jpg" alt="Shivaselvam S" />
   ```

## Run locally
```bash
python -m http.server 5500
```
Then open http://localhost:5500

## Deploy free — GitHub Pages (recommended)
Gives you **https://shivssv1269.github.io**
```bash
git init
git add .
git commit -m "Portfolio"
git branch -M main
git remote add origin https://github.com/SHIVSSV1269/SHIVSSV1269.github.io.git
git push -u origin main
```
Create the empty repo `SHIVSSV1269.github.io` on GitHub first, then in the repo: Settings → Pages → Source: *Deploy from a branch* → `main` / root.

## Other free hosts
- **Netlify** — drag the folder onto app.netlify.com/drop → `yourname.netlify.app`
- **Vercel** — import the GitHub repo → `yourname.vercel.app`
- **Cloudflare Pages** — connect the repo, no build command → `yourname.pages.dev`
