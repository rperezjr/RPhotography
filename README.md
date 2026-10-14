Here is your complete, updated **`README.md`** file incorporating the full project documentation, automation workflow, and the new small-batch push guide for the 82–89 photo series.

```markdown
# RPhotography 📸⚽

A lightweight, high-performance web gallery built to showcase soccer match photography. The site uses vanilla HTML, CSS, and modern asynchronous JavaScript with client-side indexing, lazy loading, and thumbnail caching, hosted directly on GitHub Pages.

---

## 🚀 Live Demo

Visit the live site:  
👉 **[Live Gallery](https://rperezjr.github.io/RPhotography/)**

---

## 📁 Repository Structure

```text
RPhotography/
├── .github/workflows/ # GitHub Actions static deployment workflow
├── images/            # Full-size match photos (e.g., _WAC7482.JPG)
│   ├── thumbs/        # Lightweight compressed grid thumbnails (~30-50KB)
│   └── manifest.json  # Auto-generated index of existing images
├── .nojekyll          # Disables Jekyll processing for underscore files
├── gallery.html       # Gallery page view
├── gallery.js         # Match configuration & dynamic gallery loader
├── home.js            # Landing page interactions & match cards
├── index.html         # Main entry page
├── style.css          # Responsive CSS grid, lightbox, and typography
└── README.md          # Documentation & workflow guide

```

---

## ⚡ Workflow: Adding Pictures for a New Game

Follow these 3 steps whenever you add a new soccer match:

### 1. Copy & Process Images (Thumbnails + Compression)

1. Drop your camera files directly into the root `images/` directory.
2. Open your terminal in the project root and run this single, bulletproof Python automation script (works out of the box on macOS, avoiding any shell globbing errors):

```bash
python3 -c '
import os, subprocess, json
os.makedirs("images/thumbs", exist_ok=True)
files = sorted([f for f in os.listdir("images") if f.lower().endswith((".jpg", ".jpeg")) and not f.startswith(".")])
for filename in files:
    src = os.path.join("images", filename)
    dest = os.path.join("images/thumbs", filename)
    if not os.path.exists(dest):
        subprocess.run(["sips", "-Z", "450", "--setProperty", "formatOptions", "65", src, "--out", dest])
open("images/manifest.json", "w").write(json.dumps(files))
print(f"Successfully processed {len(files)} photos (thumbnails & manifest updated)!")
'

```

---

### 2. Update Match Manifest in `home.js` & `gallery.js`

Add or update the match object in `MATCH_DATA` in both **`home.js`** and **`gallery.js`** (ensure your `startNum` is less than your `endNum`):

```javascript
const MATCH_DATA = [
  // ... existing games ...
  {
    id: 'Monett-vs-McDonald-County-2',
    title: 'Monett vs McDonald County (2nd Match)',
    startNum: 8297,
    endNum: 8335
  },
  {
    id: 'Monett-vs-Branson',
    title: 'Monett vs Branson',
    startNum: 8336,
    endNum: 8538
  },
  {
    id: 'Monett-vs-Cassville-2',
    title: 'Monett vs Cassville (2nd Match)',
    startNum: 8539,
    endNum: 8958
  }
];

```

* The site reads `images/manifest.json` to count only the photos that actually exist within that range, preventing missing numbers from causing broken image boxes or 404 delays.

---

### 3. Stage, Commit, and Push (Include `thumbs/` and `manifest.json`)

Make sure your generated thumbnails and manifest are tracked and pushed to GitHub so GitHub Pages can render them:

```bash
git add images/manifest.json images/thumbs/
git add -A
git commit -m "Add new match photos, thumbnails, and updated manifest"
git push origin main

```

*(GitHub Pages will automatically deploy your updates in about 1–2 minutes).*

---

## 🛠️ Built With

* **Markup:** Semantic HTML5
* **Styles:** Responsive CSS3 (CSS Grid & Flexbox)
* **Interactivity:** Vanilla JavaScript (ES6+ with `loading="lazy"` & `decoding="async"`)
* **Asset Pipeline:** macOS `sips` CLI + Python automation
* **Deployment & Hosting:** GitHub Pages

---

## 🔧 Troubleshooting Large Uploads & Git Issues

If you encounter hangs during `git push` when uploading large batches of match photos, or run into index lock errors, follow these steps:

### 1. Fixing Git Index Lock Errors (`index.lock: File exists`)

If a previous Git process was interrupted, remove the stale lock file before running new commands:

```bash
rm .git/index.lock

```

### 2. Handling Large Photo Upload Stalls (HTTPS Timeouts)

Pushing hundreds of megabytes of high-resolution JPEGs and thumbnails over HTTPS can cause the transfer to hang at "Writing objects". To fix and prevent this:

* **Increase the Git HTTP Post Buffer:**
```bash
git config --global http.postBuffer 524288000

```


* **Optimize Pack Window Memory:**
```bash
git config pack.windowMemory 100m
git config pack.packSizeLimit 100m

```



### 3. Pushing Large Photo Archives in Numeric Batches (82–89 Series)

If pushing all your match thumbnails at once hangs at "Writing objects" (due to large payloads over HTTPS), reset your staged state and push your thumbnails in smaller numeric chunks by their prefix (e.g., matching the 82–89 series):

1. **Reset your local branch to a clean state:**
```bash
git reset --mixed origin/main

```


2. **Push your manifest, configuration, and documentation first:**
```bash
git add images/manifest.json README.md home.js gallery.js
git commit -m "Update manifest, scripts, and documentation"
git push origin main

```


3. **Push thumbnails in numeric pairs:**
* **82 & 83 Series:**
```bash
git add images/thumbs/_WAC82*.JPG images/thumbs/_WAC83*.JPG
git commit -m "Add match thumbnails 82 and 83 series"
git push origin main

```


* **84 & 85 Series:**
```bash
git add images/thumbs/_WAC84*.JPG images/thumbs/_WAC85*.JPG
git commit -m "Add match thumbnails 84 and 85 series"
git push origin main

```


* **86 & 87 Series:**
```bash
git add images/thumbs/_WAC86*.JPG images/thumbs/_WAC87*.JPG
git commit -m "Add match thumbnails 86 and 87 series"
git push origin main

```


* **88 & 89 Series:**
```bash
git add images/thumbs/_WAC88*.JPG images/thumbs/_WAC89*.JPG
git commit -m "Add match thumbnails 88 and 89 series"
git push origin main

```