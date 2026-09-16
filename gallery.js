/**
 * RPhotography - Monett Soccer Gallery Engine
 * Automatic Dropdown Population, Manifest-Strict Filtering, & 3D Carousel Modal
 */

// --- CONFIGURATION ---
const IMAGE_FOLDER = 'images';
const FILE_PREFIX = '_WAC';
const FILE_EXTENSION = 'JPG';

// --- MATCHES MANIFEST ---
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
  }
];

// --- DOM REFERENCES ---
const gallery = document.getElementById('gallery');
const syncStatus = document.getElementById('sync-status');
const matchSelect = document.getElementById('match-select');
const gameTitleInput = document.getElementById('game-title-input');
const updateTitleBtn = document.getElementById('update-title-btn');
const displayGameTitle = document.getElementById('display-game-title');
const photoCountBadge = document.getElementById('photo-count-badge');

// --- LIGHTBOX ELEMENTS ---
const lightbox = document.getElementById('lightbox');
const lightboxCaption = document.getElementById('lightbox-caption');
const lightboxClose = document.getElementById('lightbox-close');
const lightboxPrev = document.getElementById('lightbox-prev');
const lightboxNext = document.getElementById('lightbox-next');

// --- STATE MANAGEMENT ---
let currentMatch = MATCH_DATA[0];
let loadedImagesMap = new Map();
let currentGalleryList = [];
let filteredGalleryList = [];
let activeIndex = 0;
let cachedManifest = null;

// Resolve initial match from URL query (?match=...) or default to the first
function resolveInitialMatch() {
  const params = new URLSearchParams(window.location.search);
  const matchId = params.get('match');
  const found = MATCH_DATA.find(m => m.id === matchId);
  return found || MATCH_DATA[0];
}

// 1. DYNAMIC DROPDOWN INITIALIZATION
function initializeMatchDropdown() {
  if (!matchSelect) return;
  
  matchSelect.innerHTML = '';
  MATCH_DATA.forEach(match => {
    const opt = document.createElement('option');
    opt.value = match.id;
    opt.textContent = match.title;
    if (match.id === currentMatch.id) {
      opt.selected = true;
    }
    matchSelect.appendChild(opt);
  });

  matchSelect.addEventListener('change', (e) => {
    const selected = MATCH_DATA.find(m => m.id === e.target.value);
    if (selected) {
      window.history.replaceState({}, '', `gallery.html?match=${encodeURIComponent(selected.id)}`);
      loadMatchPhotos(selected);
    }
  });
}

// 2. IMAGE PROBING & GRID POPULATION (STRICT REAL FILES ONLY)
async function loadMatchPhotos(match) {
  currentMatch = match;
  
  if (displayGameTitle) {
    displayGameTitle.textContent = currentMatch.title;
  }
  
  if (matchSelect) {
    matchSelect.value = currentMatch.id;
  }
  
  gallery.innerHTML = '<div class="empty-state" id="empty-state">Loading match photos...</div>';
  loadedImagesMap.clear();
  currentGalleryList = [];
  filteredGalleryList = [];

  if (photoCountBadge) photoCountBadge.textContent = '0 Photos';
  if (syncStatus) syncStatus.textContent = `Loading ${match.title}...`;

  // Fetch manifest once to know exactly which images exist on disk
  if (cachedManifest === null) {
    try {
      const res = await fetch(`${IMAGE_FOLDER}/manifest.json?v=${Date.now()}`);
      if (res.ok) cachedManifest = await res.json();
    } catch (e) {
      cachedManifest = [];
    }
  }

  // Filter ONLY files that physically exist in manifest.json within this match number range
  let matchingFiles = (cachedManifest || []).filter(filename => {
    const num = parseInt(filename.replace(/[^0-9]/g, ''), 10);
    return !isNaN(num) && num >= match.startNum && num <= match.endNum;
  });

  if (matchingFiles.length === 0) {
    gallery.innerHTML = '<div class="empty-state" id="empty-state">No photos found for this match.</div>';
    if (syncStatus) syncStatus.textContent = 'No photos available';
    return;
  }

  // Map into gallery items and sort strictly by photo number
  currentGalleryList = matchingFiles
    .map(filename => {
      const photoNum = parseInt(filename.replace(/[^0-9]/g, ''), 10);
      const fullUrl = `${IMAGE_FOLDER}/${filename}`;
      const thumbUrl = `${IMAGE_FOLDER}/thumbs/${filename}`;
      return { filename, fullUrl, thumbUrl, photoNum };
    })
    .sort((a, b) => a.photoNum - b.photoNum);

  gallery.innerHTML = '';

  // Render cards ONLY for files that exist
  currentGalleryList.forEach((item, index) => {
    const isTopRow = index < 6;
    const cardElement = createPhotoCard(item.filename, item.fullUrl, item.thumbUrl, item.photoNum, isTopRow);

    loadedImagesMap.set(item.filename, cardElement);
    gallery.appendChild(cardElement);
  });

  filterGallery();

  if (syncStatus) {
    syncStatus.textContent = `Sync Active (${currentGalleryList.length} Photos Loaded)`;
  }
}

// 3. SEARCH BY SHOT NUMBER
function filterGallery() {
  const searchTerm = gameTitleInput ? gameTitleInput.value.toLowerCase().trim() : '';

  filteredGalleryList = currentGalleryList.filter(item => {
    return searchTerm === '' || item.photoNum.toString().includes(searchTerm);
  });

  loadedImagesMap.forEach((cardElement, filename) => {
    const isVisible = filteredGalleryList.some(item => item.filename === filename);
    cardElement.style.display = isVisible ? '' : 'none';
  });

  if (photoCountBadge) {
    photoCountBadge.textContent = `${filteredGalleryList.length} Photos`;
  }
}

if (gameTitleInput) gameTitleInput.addEventListener('input', filterGallery);
if (updateTitleBtn) updateTitleBtn.addEventListener('click', filterGallery);

// 4. CARD CREATION
function createPhotoCard(filename, fullUrl, thumbUrl, photoNum, isTopRow) {
  const card = document.createElement('div');
  card.className = 'photo-card';
  card.dataset.filename = filename;
  card.dataset.photoNum = photoNum;

  const loadingAttr = isTopRow ? 'eager' : 'lazy';

  // Use thumbnail for grid rendering with fullUrl fallback
  card.innerHTML = `
    <img 
      src="${thumbUrl}" 
      loading="${loadingAttr}" 
      decoding="async" 
      alt="${currentMatch.title} Shot ${photoNum}"
      onerror="if (!this.dataset.fallbackTried) { this.dataset.fallbackTried = 'true'; this.src='${fullUrl}'; } else { this.closest('.photo-card').remove(); }"
    />
  `;

  card.addEventListener('click', () => {
    const index = filteredGalleryList.findIndex(item => item.filename === filename);
    if (index !== -1) openLightbox(index);
  });

  return card;
}

// 5. CAROUSEL POP-UP MODAL CONTROLS (OPTIMIZED ASSET ALLOCATION)
function openLightbox(index) {
  activeIndex = index;
  updateLightboxContent();
  if (lightbox) {
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeLightbox() {
  if (lightbox) {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function updateLightboxContent() {
  if (!filteredGalleryList || filteredGalleryList.length === 0) return;

  const total = filteredGalleryList.length;
  const getIdx = (offset) => (activeIndex + offset + total) % total;

  // Center gets high-res preview; outer slots receive cached thumbnails to load instantaneously
  const slots = [
    { id: 'card-far-left', index: getIdx(-2), isCenter: false },
    { id: 'card-left',     index: getIdx(-1), isCenter: false },
    { id: 'card-center',   index: getIdx(0),  isCenter: true  },
    { id: 'card-right',    index: getIdx(1),  isCenter: false },
    { id: 'card-far-right',index: getIdx(2),  isCenter: false }
  ];

  slots.forEach(slot => {
    const el = document.getElementById(slot.id);
    if (!el) return;

    const img = el.querySelector('img');
    const item = filteredGalleryList[slot.index];
    if (!img || !item) return;

    const targetUrl = slot.isCenter ? item.fullUrl : (item.thumbUrl || item.fullUrl);

    // Only update if src actually changed to prevent flashing/re-downloads
    if (img.getAttribute('src') !== targetUrl) {
      img.src = targetUrl;
    }

    img.onerror = function() {
      if (this.src !== item.fullUrl) {
        this.src = item.fullUrl;
      }
    };
  });

  if (lightboxCaption && filteredGalleryList[activeIndex]) {
    lightboxCaption.textContent = `${currentMatch.title} — Shot #${filteredGalleryList[activeIndex].photoNum} (${activeIndex + 1} of ${total})`;
  }
}

function showPrevPhoto() {
  if (filteredGalleryList.length === 0) return;
  activeIndex = (activeIndex - 1 + filteredGalleryList.length) % filteredGalleryList.length;
  updateLightboxContent();
}

function showNextPhoto() {
  if (filteredGalleryList.length === 0) return;
  activeIndex = (activeIndex + 1) % filteredGalleryList.length;
  updateLightboxContent();
}

if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
if (lightboxPrev) lightboxPrev.addEventListener('click', (e) => { e.stopPropagation(); showPrevPhoto(); });
if (lightboxNext) lightboxNext.addEventListener('click', (e) => { e.stopPropagation(); showNextPhoto(); });

if (lightbox) {
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
}

document.addEventListener('keydown', (e) => {
  if (!lightbox || !lightbox.classList.contains('active')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') showPrevPhoto();
  if (e.key === 'ArrowRight') showNextPhoto();
});

// INITIALIZE
document.addEventListener('DOMContentLoaded', () => {
  currentMatch = resolveInitialMatch();
  initializeMatchDropdown();
  loadMatchPhotos(currentMatch);
});