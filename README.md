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
├── images/            # Google Drive mapping & index
│   ├── thumbs/        # Lightweight compressed grid thumbnails (~30-50KB)
│   └── manifest.json  # Auto-generated index of all match photos
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

Follow these steps whenever you add a new soccer match:

### 1. Drop, Process, and Move Images

1. Drop your new match photos directly into the root `images/` directory.
2. Run this Python automation script in your terminal to downsample them into lightweight thumbnails, move the originals out of the root folder into `images/thumbs/`, and rebuild a complete `manifest.json` containing **all** past and present images:

```bash
python3 -c '
import os, subprocess, json
thumbs_dir = "images/thumbs"
os.makedirs(thumbs_dir, exist_ok=True)

# 1. Process any new files sitting in root images/
root_files = [f for f in os.listdir("images") if f.lower().endswith((".jpg", ".jpeg")) and not f.startswith(".")]
for filename in root_files:
    src = os.path.join("images", filename)
    dest = os.path.join(thumbs_dir, filename)
    if not os.path.exists(dest):
        subprocess.run(["sips", "-Z", "450", "--setProperty", "formatOptions", "65", src, "--out", dest])
    # Move original to thumbs folder as well (or keep separate if needed)
    final_dest = os.path.join(thumbs_dir, filename)
    if os.path.exists(src) and src != final_dest:
        os.replace(src, final_dest)

# 2. Generate manifest scanning ALL files in thumbs/ to keep everything
all_files = sorted([f for f in os.listdir(thumbs_dir) if f.lower().endswith((".jpg", ".jpeg")) and not f.startswith(".")])
open("images/manifest.json", "w").write(json.dumps(all_files, indent=2))
print(f"Successfully processed and indexed {len(all_files)} total photos!")
'

```

---

### 2. Update Match Manifest in `gallery.js` & `home.js`

Add your new match range to `MATCH_DATA`:

```javascript
{
  id: 'monett-vs-opponent',
  title: 'Monett vs Opponent',
  startNum: 8959,
  endNum: 9150
}

```

---

### 3. Stage, Commit, and Push

```bash
git add images/manifest.json images/thumbs/ images/drive_ids.json README.md gallery.js home.js
git commit -m "Add new match photos, thumbnails, and update complete manifest"
git push origin main

```