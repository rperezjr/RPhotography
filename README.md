Here is your updated, clean, and simplified **`README.md`** file reflecting your final Google Drive architecture (no manifests, no Python scripts, pure JSON-mapping workflow):

```markdown
# RPhotography ⚽📸

A lightweight, high-performance web gallery built to showcase local soccer match photography. The site uses vanilla HTML, CSS, and modern asynchronous JavaScript, hosted on GitHub Pages with image assets offloaded directly to **Google Drive**.

---

## 📁 Repository Structure

```text
RPhotography/
├── images/
│   └── drive_ids.json    # Maps all photo filenames directly to Google Drive file IDs
├── gallery.html          # Dynamic photo gallery viewer and lightbox
├── gallery.js            # Match configuration and Google Drive gallery loader
├── home.js               # Landing page match cards and dynamic cover previews
├── index.html            # Main entry page
├── style.css             # Responsive CSS grid, lightbox, and typography
└── README.md             # Documentation & workflow guide

```

---

## 🚀 Workflow: Adding Photos for a New Match

Whenever you shoot and add a new soccer match, follow these 2 simple steps:

### 1. Upload to Google Drive & Update Drive IDs

1. Upload your new match photos to Google Drive.
2. Add the filenames and their corresponding Google Drive file IDs into **`images/drive_ids.json`**. *(The app automatically uses the keys of this file as its image index, filtering out any hidden system files).*

### 2. Update Match Data (`home.js` & `gallery.js`)

Open both `home.js` and `gallery.js` and add your new match object to the `MATCH_DATA` array with its correct camera file number range:

```javascript
{
  id: 'Monett-vs-Opponent',
  title: 'Monett vs Opponent',
  startNum: XXXXX,
  endNum: XXXXX
}

```

### 3. Sync Changes to GitHub

Open your terminal in the project folder and push your clean code and updated Drive map live:

```bash
git add .
git commit -m "Add new match photos to Google Drive and update match configuration"
git push origin main

```