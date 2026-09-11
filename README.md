```markdown
# RPhotography 📸⚽

A lightweight, responsive web gallery built to showcase soccer match photography. The site is powered by vanilla HTML, CSS, and JavaScript with automated client-side indexing, hosted directly via GitHub Pages.

---

## 🚀 Live Demo

Visit the live site:  
👉 **[Live Gallery](https://rperezjr.github.io/RPhotography/)**

---

## 📁 Repository Structure

```text
RPhotography/
├── .github/workflows/ # GitHub Actions static deployment workflow
├── images/            # Stored match photos (e.g., _WAC7482.JPG)
├── .nojekyll          # Disables Jekyll processing for underscore files
├── gallery.html       # Gallery page view
├── gallery.js         # Match configuration & dynamic gallery loader
├── home.js            # Landing page interactions & featured images
├── index.html         # Main entry page
├── style.css          # Responsive CSS grid, lightbox, and typography
└── README.md          # Documentation & workflow guide

```

---

## ⚡ Workflow: Adding Pictures for a New Game

Follow these 3 steps to update your site:

### 1. Copy and Compress the New Photos

1. Copy your camera files into the local `images/` directory.
2. Run this command from the project root to automatically find and compress only large photos (>2MB) without re-compressing previously optimized images:

```bash
find images -type f \( -name "*.JPG" -o -name "*.jpg" \) -size +2M -exec sips -Z 1600 --setProperty formatOptions 75 {} +

```

* `-Z 1600`: Scales the longest edge down to a maximum of 1600px while maintaining the original aspect ratio.
* `--setProperty formatOptions 75`: Sets JPEG compression quality to 75% to reduce file payload without visible artifacting.
* `-size +2M`: Protects previously compressed images from undergoing multiple compression passes.

---

### 2. Update Match Manifest

Open `gallery.js` (or `home.js`) and update your match array with the new game title and shot range:

```javascript
const MATCH_DATA = [
  {
    id: 'match-1',
    title: 'Match 1: Monett vs Opponent',
    startNum: 7332,
    endNum: 7481
  },
  {
    id: 'match-2',
    title: 'Match 2: Monett vs Opponent',
    startNum: 7482,
    endNum: 7600
  }
];

```

---

### 3. Stage, Commit, and Deploy to GitHub

Stage your modified files and newly added images, commit, and push:

```bash
git add -A
git commit -m "Add new match photos"
git push origin main

```

*(GitHub Pages will trigger an automated build and deploy your updates within 1–2 minutes).*

---

## 🛠️ Built With

* **Markup:** Semantic HTML5
* **Styles:** Responsive CSS3 (CSS Grid & Flexbox)
* **Interactivity:** Vanilla JavaScript (ES6+)
* **Image Processing:** macOS `sips` CLI
* **Deployment & Hosting:** GitHub Pages

```

```