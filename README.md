```markdown
# RPhotography 📸⚽

A lightweight, responsive web gallery built to showcase soccer match photography. The site is powered by vanilla HTML, CSS, and JavaScript with automated client-side indexing, hosted directly via GitHub Pages.

---

## 🚀 Live Demo

Visit the live site:  
👉 **[https://rperezjr.github.io/RPhotography/](https://rperezjr.github.io/RPhotography/)**

---

## 📁 Repository Structure

```text
RPhotography/
├── images/           # Stored game photos (e.g., _WAC7482.JPG)
├── index.html        # Main gallery structure & modal markup
├── styles.css        # Responsive CSS grid, lightbox, and typography
├── script.js         # Match configuration (MATCH_DATA) & dynamic image loader
└── README.md         # Documentation & update instructions

```

---

## ⚡ Workflow: Adding Pictures for a New Game

When adding pictures for a new game, follow these 3 steps to update your site:

### 1. Copy and Compress the New Photos

* Move your new camera files into your local project's `images/` folder.
* Ensure the file names match your naming pattern (e.g., `_WAC7482.JPG`, `_WAC7483.JPG`).
* Compress the new `.JPG` files using your terminal so your site continues loading fast:

```bash
sips -Z 1600 --setProperty formatOptions 75 images/*.JPG

```

* `-Z 1600`: Scales the longest side down to a maximum of 1600px while maintaining the original aspect ratio.
* `--setProperty formatOptions 75`: Sets JPEG compression quality to 75%, cutting file size significantly without visible degradation.

---

### 2. Update `MATCH_DATA` in `script.js`

Open `script.js` and add a new entry to the `MATCH_DATA` array containing the title and shot range for the new game:

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

*(Your dropdown menu and section headers will automatically populate and update from this data).*

---

### 3. Commit and Deploy to GitHub

Push your new images and updated `script.js` file using your terminal:

```bash
git add images/ script.js README.md
git commit -m "Add Match photos and update match manifest"
git push origin main

```

*(GitHub Pages will automatically rebuild and deploy your changes within 1–2 minutes).*

---

## 🛠️ Built With

* **Markup:** Semantic HTML5
* **Styles:** Responsive CSS3 (CSS Grid & Flexbox)
* **Interactivity:** Vanilla JavaScript (ES6+)
* **Image Processing:** macOS `sips` CLI
* **Deployment & Hosting:** GitHub Pages

```

```