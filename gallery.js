/**
 * RPhotography - Monett Soccer Gallery Engine
 * High-Performance Smooth Carousel Engine
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
let lightboxSlots = [];
const preloadedCache = new Set();

function resolveInitialMatch() {
  const params = new URLSearchParams(window.location.search);
  const matchId = params.get('match');
  const found = MATCH_DATA.find(m => m.id === matchId);
  return found || MATCH_DATA[0];
}

// 1. DYNAMIC DROPDOWN
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

// 2. GRID PROBING & POPULATION
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

  if (cachedManifest === null) {
    try {
      const res = await fetch(`${IMAGE_FOLDER}/manifest.json?v=${Date.now()}`);
      if (res.ok) cachedManifest = await res.json();
    } catch (e) {
      cachedManifest = [];
    }
  }

  const matchingFiles = (cachedManifest || []).filter(filename => {
    const num = parseInt(filename.replace(/[^0-9]/g, ''), 10);
    return !isNaN(num) && num >= match.startNum && num <= match.endNum;
  });

  if (matchingFiles.length === 0) {
    gallery.innerHTML = '<div class="empty-state" id="empty-state">No photos found for this match.</div>';
    if (syncStatus) syncStatus.textContent = 'No photos available';
    return;
  }

  currentGalleryList = matchingFiles
    .map(filename => {
      const photoNum = parseInt(filename.replace(/[^0-9]/g, ''), 10);
      const fullUrl = `${IMAGE_FOLDER}/${filename}`;
      const thumbUrl = `${IMAGE_FOLDER}/thumbs/${filename}`;
      return { filename, fullUrl, thumbUrl, photoNum };
    })
    .sort((a, b) => a.photoNum - b.photoNum);

  gallery.innerHTML = '';

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

// 3. SEARCH FILTER
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

// 4. THUMBNAIL CARD GENERATOR
function createPhotoCard(filename, fullUrl, thumbUrl, photoNum, isTopRow) {
  const card = document.createElement('div');
  card.className = 'photo-card';
  card.dataset.filename = filename;
  card.dataset.photoNum = photoNum;

  const loadingAttr = isTopRow ? 'eager' : 'lazy';

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

// 5. CACHED & DECODED CAROUSEL ENGINE
function initLightboxSlots() {
  const slotConfigs = [
    { id: 'card-far-left', offset: -2, isCenter: false },
    { id: 'card-left',     offset: -1, isCenter: false },
    { id: 'card-center',   offset:  0, isCenter: true  },
    { id: 'card-right',    offset:  1, isCenter: false },
    { id: 'card-far-right',offset:  2, isCenter: false }
  ];

  lightboxSlots = slotConfigs
    .map(slot => ({
      ...slot,
      img: document.getElementById(slot.id)?.querySelector('img')
    }))
    .filter(slot => slot.img !== null);
}

function preloadImage(url) {
  if (!url || preloadedCache.has(url)) return;
  preloadedCache.add(url);

  const img = new Image();
  img.src = url;
  if ('decode' in img) {
    img.decode().catch(() => {});
  }
}

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
  const total = filteredGalleryList.length;
  if (total === 0) return;

  const getIdx = (offset) => (activeIndex + offset + total) % total;

  lightboxSlots.forEach(slot => {
    const item = filteredGalleryList[getIdx(slot.offset)];
    if (!item) return;

    if (slot.isCenter) {
      // Step 1: Render thumbnail immediately so frame drop is zero
      const initialSrc = item.thumbUrl || item.fullUrl;
      if (slot.img.getAttribute('src') !== initialSrc) {
        slot.img.src = initialSrc;
      }

      // Step 2: Off-thread decode full-res asset before mounting
      const fullImg = new Image();
      fullImg.src = item.fullUrl;

      if ('decode' in fullImg) {
        fullImg.decode()
          .then(() => {
            if (filteredGalleryList[activeIndex]?.fullUrl === item.fullUrl) {
              slot.img.src = item.fullUrl;
            }
          })
          .catch(() => {
            slot.img.src = item.fullUrl;
          });
      } else {
        slot.img.src = item.fullUrl;
      }
    } else {
      // Side cards strictly stay on lightweight thumbnails
      const targetSideUrl = item.thumbUrl || item.fullUrl;
      if (slot.img.getAttribute('src') !== targetSideUrl) {
        slot.img.src = targetSideUrl;
      }
    }
  });

  // Pre-decode adjacent high-res files into browser cache
  const nextItem = filteredGalleryList[getIdx(1)];
  const prevItem = filteredGalleryList[getIdx(-1)];
  if (nextItem) preloadImage(nextItem.fullUrl);
  if (prevItem) preloadImage(prevItem.fullUrl);

  if (lightboxCaption && filteredGalleryList[activeIndex]) {
    lightboxCaption.textContent = `Shot #${filteredGalleryList[activeIndex].photoNum} (${activeIndex + 1} of ${total})`;
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

// 6. EVENT BINDINGS
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
  initLightboxSlots();
  currentMatch = resolveInitialMatch();
  initializeMatchDropdown();
  loadMatchPhotos(currentMatch);
});