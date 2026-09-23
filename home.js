/**
 * RPhotography - Home Page Controller
 * Displays match cards with dynamic cover previews & manifest-verified photo counts
 */

const IMAGE_FOLDER = 'images';
const FILE_PREFIX = '_WAC';
const FILE_EXTENSION = 'JPG';

const MATCH_DATA = [
  {
    id: 'jhs-jamboree',
    title: 'JHS Soccer Jamboree',
    startNum: 7332,
    endNum: 7474
  },
  {
    id: 'Monett-vs-Hillcrest',
    title: 'Monett vs Hillcrest',
    startNum: 7476,
    endNum: 7514
  },
  {
    id: 'Monett-vs-Boliver',
    title: 'Monett vs Boliver',
    startNum: 7516,
    endNum: 7667
  },
  {
    id: 'Monett-vs-Nixa',
    title: 'Monett vs Nixa',
    startNum: 7670,
    endNum: 7831
  },
  { 
    id: 'Monett-vs-Joplin',
    title: 'Monett vs Joplin', 
    startNum: 7837, 
    endNum: 7979 
  },
  {
    id: 'Monett-vs-Carthage',
    title: 'Monett vs Carthage',
    startNum: 7982,
    endNum: 8033
  },
  {
    id: 'Monett-vs-Catholic',
    title: 'Monett vs Catholic',
    startNum: 8034,
    endNum: 8104
  },
  {
    id: 'Monett-vs-Mcdonald-County',
    title: 'Monett vs McDonald County',
    startNum: 8105,
    endNum: 8174
  },
  {
    id: 'Monett-vs-Cassville',
    title: 'Monett vs Cassville',
    startNum: 8175,
    endNum: 8295
  }
];

// Helper: Computes exact counts instantly via manifest without downloading files
function probeMatchPhotoCount(match, countBadgeEl, availableImages) {
  if (availableImages && availableImages.length > 0) {
    const matchFiles = availableImages.filter(file => {
      const num = parseInt(file.replace(/[^0-9]/g, ''), 10);
      return !isNaN(num) && num >= match.startNum && num <= match.endNum;
    });
    countBadgeEl.textContent = `${matchFiles.length} Photos →`;
  } else {
    countBadgeEl.textContent = '0 Photos →';
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('home-match-cards');
  if (!container) return;

  container.innerHTML = '';

  let availableImages = [];
  try {
    const res = await fetch(`${IMAGE_FOLDER}/manifest.json?v=${Date.now()}`);
    if (res.ok) availableImages = await res.json();
  } catch (err) {
    // Falls back gracefully if manifest is absent
  }

  MATCH_DATA.forEach(match => {
    // Find the first REAL existing image for this match to use as cover preview
    let coverFileName = `${FILE_PREFIX}${match.startNum}.${FILE_EXTENSION}`;
    if (availableImages.length > 0) {
      const matchFiles = availableImages
        .map(name => ({ name, num: parseInt(name.replace(/[^0-9]/g, ''), 10) }))
        .filter(item => !isNaN(item.num) && item.num >= match.startNum && item.num <= match.endNum)
        .sort((a, b) => a.num - b.num);

      if (matchFiles.length > 0) {
        coverFileName = matchFiles[0].name;
      }
    }

    const thumbUrl = `${IMAGE_FOLDER}/thumbs/${coverFileName}`;
    const originalUrl = `${IMAGE_FOLDER}/${coverFileName}`;

    const card = document.createElement('a');
    card.className = 'match-card home-card';
    card.href = `gallery.html?match=${encodeURIComponent(match.id)}`;

    card.innerHTML = `
      <div class="match-card-thumb">
        <img 
          src="${thumbUrl}" 
          alt="${match.title} Preview" 
          loading="lazy" 
          decoding="async" 
          onerror="if (!this.dataset.triedOriginal) { this.dataset.triedOriginal = 'true'; this.src='${originalUrl}'; } else { this.parentElement.classList.add('thumb-fallback'); }" 
        />
      </div>
      <div class="match-card-body">
        <div class="match-card-title">${match.title}</div>
        <div class="match-card-meta" id="count-${match.id}">Scanning...</div>
      </div>
    `;

    container.appendChild(card);

    const countBadgeEl = card.querySelector(`#count-${match.id}`);
    probeMatchPhotoCount(match, countBadgeEl, availableImages);
  });
});