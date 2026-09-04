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
  }
];

// Helper: Probes images using the same Image() method as script.js
function probeMatchPhotoCount(match, countBadgeEl) {
  let verifiedCount = 0;
  let checksRemaining = match.endNum - match.startNum + 1;

  for (let photoNum = match.startNum; photoNum <= match.endNum; photoNum++) {
    const testerImg = new Image();
    const url = `${IMAGE_FOLDER}/${FILE_PREFIX}${photoNum}.${FILE_EXTENSION}`;

    testerImg.onload = () => {
      verifiedCount++;
      countBadgeEl.textContent = `${verifiedCount} Photos →`;
      checksRemaining--;
    };

    testerImg.onerror = () => {
      checksRemaining--;
      if (checksRemaining === 0 && verifiedCount === 0) {
        countBadgeEl.textContent = '0 Photos →';
      }
    };

    testerImg.src = url;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('home-match-cards');
  if (!container) return;

  container.innerHTML = '';

  MATCH_DATA.forEach(match => {
    const coverUrl = `${IMAGE_FOLDER}/${FILE_PREFIX}${match.startNum}.${FILE_EXTENSION}`;

    const card = document.createElement('a');
    card.className = 'match-card home-card';
    card.href = `gallery.html?match=${encodeURIComponent(match.id)}`;

    card.innerHTML = `
      <div class="match-card-thumb">
        <img src="${coverUrl}" alt="${match.title} Preview" loading="lazy" onerror="this.parentElement.classList.add('thumb-fallback')" />
      </div>
      <div class="match-card-body">
        <div class="match-card-title">${match.title}</div>
        <div class="match-card-meta" id="count-${match.id}">Scanning...</div>
      </div>
    `;

    container.appendChild(card);

    // Auto-probe and update count for this match
    const countBadgeEl = card.querySelector(`#count-${match.id}`);
    probeMatchPhotoCount(match, countBadgeEl);
  });
});