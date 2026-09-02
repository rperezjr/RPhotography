/**
 * RPhotography - Home Page Controller
 * Displays match cards with dynamic cover previews linking to gallery.html?match={id}
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
  }
];

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('home-match-cards');
  if (!container) return;

  container.innerHTML = '';

  MATCH_DATA.forEach(match => {
    const totalPossible = match.endNum - match.startNum + 1;
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
        <div class="match-card-meta">Up to ${totalPossible} Photos &rarr;</div>
      </div>
    `;

    container.appendChild(card);
  });
});