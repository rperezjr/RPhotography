/**
 * RPhotography - Home Page Controller
 * Displays match cards with dynamic cover previews & photo counts using only drive_ids.json
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
  },
  {
    id: 'Monett-vs-McDonald-County-2',
    title: 'Monett vs McDonald County (2nd Match)',
    startNum: 8297,
    endNum: 8335
  },
  {
    id: 'Monett-vs-Branson',
    title: 'Monett vs Branson',
    startNum: 8336,
    endNum: 8538
  },
  {
    id: 'Monett-vs-Cassville-2',
    title: 'Monett vs Cassville (2nd Match)',
    startNum: 8539,
    endNum: 8958
  },
  {
    id: 'Monett-vs-Rogersville',
    title: 'Monett vs Rogersville',
    startNum: 8960,
    endNum: 9088
  },
  {
    id: 'Monett-vs-Springfield-Central',
    title: 'Monett vs Springfield Central',
    startNum: 9089,
    endNum: 9140
  },
  {
    id: 'Monett-vs-Parkview',
    title: 'Monett vs Parkview',
    startNum: 9141,
    endNum: 9285
  }
];

// Helper: Computes exact counts instantly from drive_ids keys (ignoring hidden files)
function probeMatchPhotoCount(match, countBadgeEl, availableImages) {
  if (availableImages && availableImages.length > 0) {
    const matchFiles = availableImages.filter(file => {
      if (file.startsWith('.')) return false; // Ignore hidden dotfiles
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

  let driveIdMap = {};
  let availableImages = [];

  try {
    const res = await fetch(`${IMAGE_FOLDER}/drive_ids.json?v=${Date.now()}`);
    if (res.ok) {
      driveIdMap = await res.json();
      availableImages = Object.keys(driveIdMap);
    }
  } catch (err) {
    console.warn('Could not load Google Drive ID mappings.', err);
  }

  MATCH_DATA.forEach(match => {
    // Find the first clean REAL existing image for this match to use as cover preview
    let coverFileName = `${FILE_PREFIX}${match.startNum}.${FILE_EXTENSION}`;
    if (availableImages.length > 0) {
      const matchFiles = availableImages
        .filter(name => !name.startsWith('.')) // Ignore hidden dotfiles
        .map(name => ({ name, num: parseInt(name.replace(/[^0-9]/g, ''), 10) }))
        .filter(item => !isNaN(item.num) && item.num >= match.startNum && item.num <= match.endNum)
        .sort((a, b) => a.num - b.num);

      if (matchFiles.length > 0) {
        coverFileName = matchFiles[0].name;
      }
    }

    const fileId = driveIdMap[coverFileName];
    const imageUrl = fileId 
      ? `https://lh3.googleusercontent.com/d/${fileId}` 
      : '';

    const card = document.createElement('a');
    card.className = 'match-card home-card';
    card.href = `gallery.html?match=${encodeURIComponent(match.id)}`;

    card.innerHTML = `
      <div class="match-card-thumb">
        <img 
          src="${imageUrl}" 
          alt="${match.title} Preview" 
          loading="lazy" 
          decoding="async" 
          onerror="this.parentElement.classList.add('thumb-fallback');" 
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