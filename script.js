/**
 * Monett Highschool Soccer Gallery - Dynamic Batch Feed & Lightbox Script
 * Scans image slots in parallel batches of 10 for high speed on GitHub Pages.
 */

// --- CONFIGURATION ---
const IMAGE_FOLDER = 'images'; 
const START_NUMBER = 7332;        
const TOTAL_SLOTS_TO_CHECK = 150; 
const BATCH_SIZE = 10;           // Probes 10 images at a time so network doesn't lock up
const POLL_INTERVAL_MS = 30000;  // 30s poll interval
const FILE_EXTENSION = 'JPG';    // Must match GitHub casing exactly (.JPG vs .jpg)

// --- DOM ELEMENT REFERENCES ---
const gallery = document.getElementById('gallery');
const syncStatus = document.getElementById('sync-status');
const emptyState = document.getElementById('empty-state');
const gameSearchInput = document.getElementById('game-search-input');
const searchClearBtn = document.getElementById('search-clear-btn');
const displayGameTitle = document.getElementById('display-game-title');
const photoCountBadge = document.getElementById('photo-count-badge');

// --- LIGHTBOX MODAL ELEMENTS ---
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
// 2. TIMEOUT-PROTECTED IMAGE PROBE
// ==========================================
function checkImageExists(url, timeoutMs = 2500) {
  return new Promise((resolve) => {
    const img = new Image();
    let timer = setTimeout(() => {
      img.src = ""; // Abort hanging network request
      resolve(false);
    }, timeoutMs);

    img.onload = () => {
      clearTimeout(timer);
      resolve(true);
    };
    img.onerror = () => {
      clearTimeout(timer);
      resolve(false);
    };
    img.src = url;
  });
}

// ==========================================
// 3. CARD DOM CREATION
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
           alt="Shot ${photoNum}" />
    </div>
    <div class="card-info">
      <div class="card-top-row">
        <span class="card-title">Shot #${photoNum}</span>
      </div>
    </div>
  `;

  // Attach Lightbox Trigger on Image Click
  const imgWrapper = card.querySelector('.image-wrapper');
  imgWrapper.addEventListener('click', () => {
    const index = filteredGalleryList.findIndex(item => item.filename === filename);
    if (index !== -1) openLightbox(index);
  });

  return card;
}

function preloadLightboxImage(index) {
  if (filteredGalleryList[index]) {
    const img = new Image();
    img.src = filteredGalleryList[index].fullUrl;
  }
}

// ==========================================
// 4. BATCHED SYNC ENGINE (INCREMENTAL RENDER)
// ==========================================
async function syncGallery() {
  let newList = [];

  if (syncStatus && loadedImagesMap.size === 0) {
    syncStatus.textContent = "Scanning for match photos...";
  }

  // Probe 10 images at a time
  for (let i = 0; i < TOTAL_SLOTS_TO_CHECK; i += BATCH_SIZE) {
    const batchPromises = [];
    
    for (let j = 0; j < BATCH_SIZE && (i + j) < TOTAL_SLOTS_TO_CHECK; j++) {
      const photoNum = START_NUMBER + (i + j);
      const filename = `_WAC${photoNum}.${FILE_EXTENSION}`;
      const fullUrl = `${IMAGE_FOLDER}/${filename}`;

      batchPromises.push(
        checkImageExists(fullUrl).then(exists => ({ exists, filename, fullUrl, photoNum }))
      );
    }

    const batchResults = await Promise.all(batchPromises);

    // Render batch immediately as soon as it resolves
    const fragment = document.createDocumentFragment();

    batchResults.forEach(item => {
      if (item.exists) {
        newList.push(item);

        if (!loadedImagesMap.has(item.filename)) {
          if (emptyState && gallery.contains(emptyState)) {
            emptyState.remove();
          }

          const isTopRow = newList.length <= 6;
          const cardElement = createPhotoCard(item.filename, item.fullUrl, item.photoNum, isTopRow);
          fragment.appendChild(cardElement);
          loadedImagesMap.set(item.filename, cardElement);
        }
      }
    });

    if (fragment.children.length > 0) {
      gallery.appendChild(fragment);
      currentGalleryList = newList;
      filterGallery();
    }
  }

  currentGalleryList = newList;
  filterGallery(); 

  if (syncStatus) {
    syncStatus.textContent = `Sync Active (${loadedImagesMap.size} Photos Live)`;
  }
}

// ==========================================
// 5. LIGHTBOX MODAL CONTROLS
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

  preloadLightboxImage((activeIndex + 1) % filteredGalleryList.length);
  preloadLightboxImage((activeIndex - 1 + filteredGalleryList.length) % filteredGalleryList.length);
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

// Event Listeners for Lightbox Controls
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

// Run Initial Sync and Set Polling Loop
syncGallery();
setInterval(syncGallery, POLL_INTERVAL_MS);