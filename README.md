Here is the updated, drop-in replacement for your **`README.md`** reflecting the optimized workflow, thumbnail generation, and manifest indexing.

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
2. Open your terminal in the project root and run this single optimization script:

```bash
# Compress raw images (>2MB) down to 1600px preview files
find images -maxdepth 1 -type f \( -name "*.JPG" -o -name "*.jpg" \) -size +2M -exec sips -Z 1600 --setProperty formatOptions 75 {} +

# Generate 450px lightweight thumbnails for gallery grids
mkdir -p images/thumbs && find images -maxdepth 1 -type f \( -name "*.JPG" -o -name "*.jpg" \) -exec sips -Z 450 --setProperty formatOptions 65 {} --out images/thumbs/ \;

```

---

### 2. Update Match Manifest in `home.js` & `gallery.js`

Add the new match object to `MATCH_DATA` in both **`home.js`** and **`gallery.js`**:

```javascript
const MATCH_DATA = [
  // ... existing games ...
  {
    id: 'Monett-vs-NewOpponent',
    title: 'Monett vs New Opponent',
    startNum: 8105,
    endNum: 8250
  }
];

```

* The site reads `images/manifest.json` to count only the photos that actually exist within that range, preventing missing numbers from causing broken image boxes or 404 delays.

---

### 3. Stage, Commit, and Deploy

Stage your changes, commit, and push to GitHub:

```bash
git add -A
git commit -m "Add Monett vs New Opponent photos and update manifest"
git push origin main

```

*(GitHub Pages will automatically deploy your updates in about 1–2 minutes).*

---

## 🛠️ Built With

* **Markup:** Semantic HTML5
* **Styles:** Responsive CSS3 (CSS Grid & Flexbox)
* **Interactivity:** Vanilla JavaScript (ES6+ with `loading="lazy"` & `decoding="async"`)
* **Asset Pipeline:** macOS `sips` CLI + Node.js indexing
* **Deployment & Hosting:** GitHub Pages