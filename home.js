/**
 * RPhotography - Home Page Controller
 * Displays match cards with dynamic cover previews & auto-probed exact photo counts
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
  { id: 'Monett-vs-Joplin',
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
  }
];

// Helper: Probes images using the manifest instead of downloading every file
function probeMatchPhotoCount(match, countBadgeEl, availableImages) {
  if (availableImages && availableImages.length > 0) {
    const matchFiles = availableImages.filter(file => {
      const num = parseInt(file.replace(/[^0-9]/g, ''), 10);
      return num >= match.startNum && num <= match.endNum;
    });
    countBadgeEl.textContent = `${matchFiles.length} Photos →`;
  } else {
    // Fallback count if manifest.json hasn't been created yet
    const estimated = match.endNum - match.startNum + 1;
    countBadgeEl.textContent = `${estimated} Photos →`;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('home-match-cards');
  if (!container) return;

  container.innerHTML = '';

  // Fast single fetch for existing image names
  let availableImages = [];
  try {
    const res = await fetch(`${IMAGE_FOLDER}/manifest.json`);
    if (res.ok) availableImages = await res.json();
  } catch (err) {
    // Falls back seamlessly if manifest is absent
  }

  MATCH_DATA.forEach(match => {
    const coverUrl = `${IMAGE_FOLDER}/${FILE_PREFIX}${match.startNum}.${FILE_EXTENSION}`;

    const card = document.createElement('a');
    card.className = 'match-card home-card';
    card.href = `gallery.html?match=${encodeURIComponent(match.id)}`;

    card.innerHTML = `
      <div class="match-card-thumb">
        <img src="${coverUrl}" alt="${match.title} Preview" loading="lazy" decoding="async" onerror="this.parentElement.classList.add('thumb-fallback')" />
      </div>
      <div class="match-card-body">
        <div class="match-card-title">${match.title}</div>
        <div class="match-card-meta" id="count-${match.id}">Scanning...</div>
      </div>
    `;

    container.appendChild(card);

    // Auto-probe and update count for this match without firing 700+ network downloads
    const countBadgeEl = card.querySelector(`#count-${match.id}`);
    probeMatchPhotoCount(match, countBadgeEl, availableImages);
  });
});