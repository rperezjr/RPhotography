Save the updated documentation directly to your repository as **`README.md`** using your terminal:

```bash
cat << 'EOF' > README.md
# RPhotography ⚽📸

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
2. Open your terminal in the project root and run this single Python automation script:

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

Add or update the match object in `MATCH_DATA` in both **`home.js`** and **`gallery.js`**:

```javascript
const MATCH_DATA = [
  // ... existing games ...
  {
    id: 'monett-vs-opponent',
    title: 'Monett vs Opponent',
    startNum: 8959,
    endNum: 9150
  }
];

```

---

### 3. Stage, Commit, and Push

Make sure your generated thumbnails and manifest are tracked and pushed to GitHub:

```bash
git add images/manifest.json images/thumbs/ images/drive_ids.json README.md gallery.js home.js
git commit -m "Add new match photos, thumbnails, and updated configuration"
git push origin main

```