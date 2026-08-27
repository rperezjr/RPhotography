/**
 * RPhotography - Monett Soccer Match Feed & Carousel Engine
 */

// --- CONFIGURATION ---
const IMAGE_FOLDER = 'images';
const FILE_PREFIX = '_WAC';
const FILE_EXTENSION = 'JPG';

const START_NUMBER = 7332;
const TOTAL_PHOTOS = 150;

// Programmatically generate array: [7332, 7333, ..., 7481]
const SHOT_NUMBERS = Array.from({ length: TOTAL_PHOTOS }, (_, i) => START_NUMBER + i);

// --- DOM REFERENCES ---
const gallery = document.getElementById('gallery');
const syncStatus = document.getElementById('sync-status');
const emptyState = document.getElementById('empty-state');
const gameTitleInput = document.getElementById('game-title-input');
const updateTitleBtn = document.getElementById('update-title-btn');
const displayGameTitle = document.getElementById('display-game-title');
const photoCountBadge = document.getElementById('photo-count-badge');

// --- LIGHTBOX CAROUSEL ELEMENTS ---
const lightbox = document.getElementById('lightbox');
const lightboxCaption = document.getElementById('lightbox-caption');
const lightboxClose = document.getElementById('lightbox-close');
const lightboxPrev = document.getElementById('lightbox-prev');
const lightboxNext = document.getElementById('lightbox-next');

// --- STATE MANAGEMENT ---
let currentGameTitle = "Match 1: JHS Soccer Jamboree";
let loadedImagesMap = new Map();
let currentGalleryList = [];
let filteredGalleryList = [];
let activeIndex = 0;

if (displayGameTitle) {
  displayGameTitle.textContent = currentGameTitle;
}

// ==========================================
// 1. LIVE SEARCH & FILTER ENGINE
// ==========================================
function filterGallery() {
  const searchTerm = gameTitleInput ? gameTitleInput.value.toLowerCase().trim() : "";

  filteredGalleryList = currentGalleryList.filter(item => {
    const photoNumMatch = item.photoNum.toString().includes(searchTerm);
    return searchTerm === "" || photoNumMatch;
  });

  loadedImagesMap.forEach((cardElement, filename) => {
    const isVisible = filteredGalleryList.some(item => item.filename === filename);
    cardElement.style.display = isVisible ? '' : 'none';
  });

  if (photoCountBadge) {
    photoCountBadge.textContent = `${filteredGalleryList.length} Photos`;
  }
}

if (gameTitleInput) {
  gameTitleInput.addEventListener('input', filterGallery);
}

if (updateTitleBtn) {
  updateTitleBtn.addEventListener('click', filterGallery);
}

// ==========================================
// 2. CARD DOM CREATION (CLEAN GRID)
// ==========================================
function createPhotoCard(filename, fullUrl, photoNum, isTopRow) {
  const card = document.createElement('div');
  card.className = 'photo-card';
  card.dataset.filename = filename;

  const loadingAttr = isTopRow ? 'eager' : 'lazy';

  card.innerHTML = `
    <div class="image-wrapper">
      <img src="${fullUrl}" 
           loading="${loadingAttr}" 
           decoding="async" 
           alt="Soccer match photo" />
    </div>
  `;

  const imgTag = card.querySelector('img');
  imgTag.onerror = () => {
    card.remove();
    loadedImagesMap.delete(filename);
    currentGalleryList = currentGalleryList.filter(item => item.filename !== filename);
    filterGallery();
  };

  card.addEventListener('click', () => {
    const index = filteredGalleryList.findIndex(item => item.filename === filename);
    if (index !== -1) openLightbox(index);
  });

  return card;
}

// ==========================================
// 3. INSTANT GALLERY BUILDER
// ==========================================
function buildGalleryInstantly() {
  if (emptyState && gallery.contains(emptyState)) {
    emptyState.remove();
  }

  const fragment = document.createDocumentFragment();

  currentGalleryList = SHOT_NUMBERS.map(photoNum => {
    const filename = `${FILE_PREFIX}${photoNum}.${FILE_EXTENSION}`;
    const fullUrl = `${IMAGE_FOLDER}/${filename}`;
    return { filename, fullUrl, photoNum };
  });

  currentGalleryList.forEach((item, index) => {
    const isTopRow = index < 6;
    const cardElement = createPhotoCard(item.filename, item.fullUrl, item.photoNum, isTopRow);
    
    fragment.appendChild(cardElement);
    loadedImagesMap.set(item.filename, cardElement);
  });

  gallery.appendChild(fragment);
  filterGallery();

  if (syncStatus) {
    syncStatus.textContent = `Sync Active (${currentGalleryList.length} Photos Live)`;
  }
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

  if (lightboxCaption) {
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

document.addEventListener("DOMContentLoaded", buildGalleryInstantly);