/**
 * Monett Highschool Soccer Gallery - Instant Load Engine
 * Generates 150 shot slots programmatically with zero probe delay.
 */

// --- CONFIGURATION ---
const IMAGE_FOLDER = 'images';
const FILE_PREFIX = '_WAC';
const FILE_EXTENSION = 'JPG'; // Case-sensitive: must match GitHub casing exactly

const START_NUMBER = 7332;
const TOTAL_PHOTOS = 150;

// Programmatically generate array: [7332, 7333, ..., 7481]
const SHOT_NUMBERS = Array.from({ length: TOTAL_PHOTOS }, (_, i) => START_NUMBER + i);

// --- DOM REFERENCES ---
const gallery = document.getElementById('gallery');
const syncStatus = document.getElementById('sync-status');
const emptyState = document.getElementById('empty-state');
const gameSearchInput = document.getElementById('game-search-input');
const searchClearBtn = document.getElementById('search-clear-btn');
const displayGameTitle = document.getElementById('display-game-title');
const photoCountBadge = document.getElementById('photo-count-badge');

// --- LIGHTBOX ELEMENTS ---
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
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
  const searchTerm = gameSearchInput ? gameSearchInput.value.toLowerCase().trim() : "";

  filteredGalleryList = currentGalleryList.filter(item => {
    const titleMatch = currentGameTitle.toLowerCase().includes(searchTerm);
    const photoNumMatch = item.photoNum.toString().includes(searchTerm);
    return searchTerm === "" || titleMatch || photoNumMatch;
  });

  loadedImagesMap.forEach((cardElement, filename) => {
    const isVisible = filteredGalleryList.some(item => item.filename === filename);
    cardElement.style.display = isVisible ? 'flex' : 'none';
  });

  if (photoCountBadge) {
    photoCountBadge.textContent = `${filteredGalleryList.length} Photos`;
  }
}

if (gameSearchInput) {
  gameSearchInput.addEventListener('input', filterGallery);
}

if (searchClearBtn) {
  searchClearBtn.addEventListener('click', () => {
    gameSearchInput.value = '';
    filterGallery();
  });
}

// ==========================================
// 2. CARD DOM CREATION (LAZY LOAD OPTIMIZED)
// ==========================================
function createPhotoCard(filename, fullUrl, photoNum, isTopRow) {
  const card = document.createElement('div');
  card.className = 'photo-card';
  card.dataset.filename = filename;

  // Eager load only top 4 images; lazy load everything else offscreen
  const loadingAttr = isTopRow ? 'eager' : 'lazy';

  card.innerHTML = `
    <div class="image-wrapper">
      <img src="${fullUrl}" 
           loading="${loadingAttr}" 
           decoding="async" 
           alt="Shot ${photoNum}" />
    </div>
    <div class="card-info">
      <div class="card-top-row">
        <span class="card-title">Shot #${photoNum}</span>
      </div>
    </div>
  `;

  // Clean fail-safe: remove card if slot photo wasn't uploaded
  const imgTag = card.querySelector('img');
  imgTag.onerror = () => {
    card.remove();
    loadedImagesMap.delete(filename);
    currentGalleryList = currentGalleryList.filter(item => item.filename !== filename);
    filterGallery();
  };

  const imgWrapper = card.querySelector('.image-wrapper');
  imgWrapper.addEventListener('click', () => {
    const index = filteredGalleryList.findIndex(item => item.filename === filename);
    if (index !== -1) openLightbox(index);
  });

  return card;
}

// ==========================================
// 3. INSTANT DOM STREAMING BUILDER
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
    const isTopRow = index < 4; // Top 4 cards render immediately
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
// 4. LIGHTBOX MODAL CONTROLS
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
  const currentItem = filteredGalleryList[activeIndex];
  if (!currentItem) return;

  if (lightboxImg) {
    lightboxImg.src = currentItem.fullUrl;
    lightboxImg.decoding = 'async';
  }
  
  if (lightboxCaption) {
    lightboxCaption.textContent = `${currentGameTitle} — Shot #${currentItem.photoNum}`;
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

// Run instantly when DOM is ready
document.addEventListener("DOMContentLoaded", buildGalleryInstantly);