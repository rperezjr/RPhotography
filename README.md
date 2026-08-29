When adding pictures for a new game, follow these 3 steps to update your site:

**1. Copy and Compress the New Photos**

* Move your new camera files into your local project's `images/` folder.
* Ensure the file names match your naming pattern (e.g., `_WAC7482.JPG`, `_WAC7483.JPG`).
* Compress the new `.JPG` files using your terminal so your site continues loading fast:
```bash
sips -Z 1600 --setProperty formatOptions 75 images/*.JPG

```



2. Update `MATCH_DATA` in `script.js**`
Open `script.js` and add a new entry to the `MATCH_DATA` array containing the title and shot range for the new game:

```javascript
const MATCH_DATA = [
  {
    id: 'jhs-jamboree',
    title: 'Match 1: JHS Soccer Jamboree',
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

**3. Commit and Deploy to GitHub**
Push your new images and updated `script.js` file using your terminal:

```bash
git add images/ script.js
git commit -m "Add Match 2 photos and update match manifest"
git push origin main

```