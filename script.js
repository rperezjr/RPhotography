/**
 * Monett Highschool Soccer Gallery - Targeted JPG Feed Script
 * Specifically targets _WAC7332.JPG pattern in images/ folder
 */

// --- CONFIGURATION ---
const IMAGE_FOLDER = 'images';
const FILE_PREFIX = '_WAC';
const FILE_EXTENSION = 'JPG';  // Matches exact uppercase extension on GitHub
const START_NUMBER = 7332;
const TOTAL_SLOTS_TO_CHECK = 150;
const PROBE_TIMEOUT_MS = 2000;

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
// 2. CARD DOM CREATION
// ==========================================
function createPhotoCard(filename, fullUrl, photoNum, isTopRow) {
  const card = document.createElement('div');
  card.className = 'photo-card';
  card.dataset.filename = filename;

  const loadingAttr = isTopRow ? 'eager' : 'lazy';

  card.innerHTML = `
    <div class="image-wrapper">
      <img src="${fullUrl}" loading="${loadingAttr}" decoding="async" alt="Shot ${photoNum}" />
    </div>
    <div class="card-info">
      <div class="card-top-row">
        <span class="card-title">Shot #${photoNum}</span>
      </div>
    </div>
  `;

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
// 3. DIRECT PROBE ENGINE
// ==========================================
function probeUrl(fullUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    let timer = setTimeout(() => {
      img.src = "";
      resolve(false);
    }, PROBE_TIMEOUT_MS);

    img.onload = () => {
      clearTimeout(timer);
      resolve(true);
    };
    img.onerror = () => {
      clearTimeout(timer);
      resolve(false);
    };
    img.src = fullUrl;
  });
}

async function probeSlot(photoNum) {
  const filename = `${FILE_PREFIX}${photoNum}.${FILE_EXTENSION}`;
  const fullUrl = `${IMAGE_FOLDER}/${filename}`;
  const exists = await probeUrl(fullUrl);
  return { exists, filename, fullUrl, photoNum };
}

// ==========================================
// 4. STREAMING GALLERY LOADER
// ==========================================
async function loadPhotos() {
  if (syncStatus) syncStatus.textContent = "Loading photos...";

  const promises = [];
  for (let i = 0; i < TOTAL_SLOTS_TO_CHECK; i++) {
    const photoNum = START_NUMBER + i;
    
    const p = probeSlot(photoNum).then(result => {
      if (result.exists) {
        if (!loadedImagesMap.has(result.filename)) {
          if (emptyState && gallery.contains(emptyState)) {
            emptyState.remove();
          }

          currentGalleryList.push(result);
          currentGalleryList.sort((a, b) => a.photoNum - b.photoNum);

          const isTopRow = currentGalleryList.length <= 6;
          const cardElement = createPhotoCard(result.filename, result.fullUrl, result.photoNum, isTopRow);
          
          gallery.appendChild(cardElement);
          loadedImagesMap.set(result.filename, cardElement);
          filterGallery();
        }
      }
      return result;
    });

    promises.push(p);
  }

  await Promise.allSettled(promises);

  if (syncStatus) {
    if (loadedImagesMap.size === 0) {
      syncStatus.textContent = "No photos found. Check repository files on GitHub.";
    } else {
      syncStatus.textContent = `Sync Active (${loadedImagesMap.size} Photos Live)`;
    }
  }
}

// ==========================================
// 5. LIGHTBOX CONTROLS
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

document.addEventListener("DOMContentLoaded", loadPhotos);