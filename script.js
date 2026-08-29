/**
 * RPhotography - Monett Soccer Gallery Engine
 * Automatic Dropdown Population & Match Title Sync Script
 */

// --- CONFIGURATION ---
const IMAGE_FOLDER = 'images';
const FILE_PREFIX = '_WAC';
const FILE_EXTENSION = 'JPG';

// --- MATCHES MANIFEST ---
// Set startNum to your first shot and endNum to your last shot off the camera.
// Missing/deleted numbers inside the range will be skipped automatically!
const MATCH_DATA = [
  {
    id: 'jhs-jamboree',
    title: 'JHS Soccer Jamboree',
    startNum: 7332,
    endNum: 7481
  },
  {
    id: 'reeds-spring',
    title: 'Monett vs Hillcrest',
    startNum: 7476,
    endNum: 7514
  }
];

// --- DOM REFERENCES ---
const gallery = document.getElementById('gallery');
const syncStatus = document.getElementById('sync-status');
const emptyState = document.getElementById('empty-state');
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

// ==========================================
// 1. DYNAMIC DROPDOWN & MATCH SWITCHER
// ==========================================
function initializeMatchDropdown() {
  if (!matchSelect) return;
  
  matchSelect.innerHTML = '';
  MATCH_DATA.forEach(match => {
    const opt = document.createElement('option');
    opt.value = match.id;
    opt.textContent = match.title;
    matchSelect.appendChild(opt);
  });

  matchSelect.addEventListener('change', (e) => {
    const selected = MATCH_DATA.find(m => m.id === e.target.value);
    if (selected) loadMatchPhotos(selected);
  });
}

function loadMatchPhotos(match) {
  currentMatch = match;
  
  if (displayGameTitle) {
    displayGameTitle.textContent = currentMatch.title;
  }
  
  gallery.innerHTML = '';
  loadedImagesMap.clear();
  currentGalleryList = [];

  // Generate sequence range between startNum and endNum
  const count = match.endNum - match.startNum + 1;
  const sortedNumbers = Array.from({ length: count }, (_, i) => match.startNum + i).sort((a, b) => a - b);

  const potentialList = sortedNumbers.map(photoNum => {
    const filename = `${FILE_PREFIX}${photoNum}.${FILE_EXTENSION}`;
    const fullUrl = `${IMAGE_FOLDER}/${filename}`;
    return { filename, fullUrl, photoNum };
  });

  // Probe each photo in range and only add existing files
  potentialList.forEach((item) => {
    const testerImg = new Image();

    testerImg.onload = () => {
      // Photo exists on server: add to gallery list
      currentGalleryList.push(item);
      
      // Keep gallery list sorted by shot number
      currentGalleryList.sort((a, b) => a.photoNum - b.photoNum);

      const isTopRow = currentGalleryList.length <= 6;
      const cardElement = createPhotoCard(item.filename, item.fullUrl, item.photoNum, isTopRow);

      loadedImagesMap.set(item.filename, cardElement);
      
      // Insert in sorted numerical order in the DOM
      const existingCards = Array.from(gallery.children);
      const insertBeforeCard = existingCards.find(card => {
        const num = parseInt(card.dataset.photoNum, 10);
        return num > item.photoNum;
      });

      if (insertBeforeCard) {
        gallery.insertBefore(cardElement, insertBeforeCard);
      } else {
        gallery.appendChild(cardElement);
      }

      // Update filtered list & badge automatically
      filterGallery();

      if (syncStatus) {
        syncStatus.textContent = `Sync Active (${currentGalleryList.length} Photos Loaded)`;
      }
    };

    // Missing/deleted numbers fail quietly without inflating the photo count
    testerImg.onerror = () => {};

    testerImg.src = item.fullUrl;
  });
}

// ==========================================
// 2. SEARCH & FILTER ENGINE
// ==========================================
function filterGallery() {
  const searchTerm = gameTitleInput ? gameTitleInput.value.toLowerCase().trim() : "";

  filteredGalleryList = currentGalleryList.filter(item => {
    return searchTerm === "" || item.photoNum.toString().includes(searchTerm);
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

// ==========================================
// 3. CARD DOM CREATION
// ==========================================
function createPhotoCard(filename, fullUrl, photoNum, isTopRow) {
  const card = document.createElement('div');
  card.className = 'photo-card';
  card.dataset.filename = filename;
  card.dataset.photoNum = photoNum;

  const loadingAttr = isTopRow ? 'eager' : 'lazy';

  card.innerHTML = `
    <div class="image-wrapper">
      <img src="${fullUrl}" loading="${loadingAttr}" decoding="async" alt="${currentMatch.title} Shot ${photoNum}" />
    </div>
  `;

  card.addEventListener('click', () => {
    const index = filteredGalleryList.findIndex(item => item.filename === filename);
    if (index !== -1) openLightbox(index);
  });

  return card;
}

// ==========================================
// 4. CAROUSEL POP-UP MODAL CONTROLS
// ==========================================
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
  if (filteredGalleryList.length === 0) return;

  const total = filteredGalleryList.length;
  const getIdx = (offset) => (activeIndex + offset + total) % total;

  const slots = [
    { id: 'card-far-left', index: getIdx(-2) },
    { id: 'card-left', index: getIdx(-1) },
    { id: 'card-center', index: getIdx(0) },
    { id: 'card-right', index: getIdx(1) },
    { id: 'card-far-right', index: getIdx(2) }
  ];

  slots.forEach(slot => {
    const el = document.getElementById(slot.id);
    if (el) {
      const img = el.querySelector('img');
      if (img && filteredGalleryList[slot.index]) {
        img.src = filteredGalleryList[slot.index].fullUrl;
      }
    }
  });

  // DYNAMIC LIGHTBOX TITLE UPDATE
  if (lightboxCaption) {
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

document.addEventListener("DOMContentLoaded", () => {
  initializeMatchDropdown();
  loadMatchPhotos(MATCH_DATA[0]);
});