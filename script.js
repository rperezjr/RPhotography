// --- CONFIGURATION ---
const IMAGE_FOLDER = './images';
const START_NUMBER = 7332;        
const TOTAL_SLOTS_TO_CHECK = 150; 
const POLL_INTERVAL_MS = 10000;    
const FILE_EXTENSION = 'JPG'; // Match exact uppercase extension on GitHub

// DOM Element References
const gallery = document.getElementById('gallery');
const syncStatus = document.getElementById('sync-status');
const emptyState = document.getElementById('empty-state');
const gameSearchInput = document.getElementById('game-search-input');
const searchClearBtn = document.getElementById('search-clear-btn');
const displayGameTitle = document.getElementById('display-game-title');
const photoCountBadge = document.getElementById('photo-count-badge');

// Lightbox Modal Elements
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCaption = document.getElementById('lightbox-caption');
const lightboxClose = document.getElementById('lightbox-close');
const lightboxPrev = document.getElementById('lightbox-prev');
const lightboxNext = document.getElementById('lightbox-next');

// State Management
let currentGameTitle = "Match 1: JHS Soccer Jamboree";
let loadedImagesMap = new Map();
let currentGalleryList = [];   
let filteredGalleryList = [];  
let activeIndex = 0;

if (displayGameTitle) {
  displayGameTitle.textContent = currentGameTitle;
}

// Live Search & Filter Logic
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

// Parallel Image Presence Probe
function checkImageExists(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

// Card Creation with ONLY Shot Number
function createPhotoCard(filename, fullUrl, photoNum, isTopRow) {
  const card = document.createElement('div');
  card.className = 'photo-card';
  card.dataset.filename = filename;

  const loadingAttr = isTopRow ? 'eager' : 'lazy';
  const fetchPriority = isTopRow ? 'fetchpriority="high"' : '';

  card.innerHTML = `
    <div class="image-wrapper">
      <img src="${fullUrl}" 
           loading="${loadingAttr}" 
           decoding="async" 
           ${fetchPriority} 
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

// Preload adjacent photos for smooth lightbox navigation
function preloadLightboxImage(index) {
  if (filteredGalleryList[index]) {
    const img = new Image();
    img.src = filteredGalleryList[index].fullUrl;
  }
}

// Fast Parallel Polling Sync Loop
async function syncGallery() {
  let validCount = 0;
  let newList = [];

  const checkPromises = [];
  for (let i = 0; i < TOTAL_SLOTS_TO_CHECK; i++) {
    const photoNum = START_NUMBER + i;
    const filename = `_WAC${photoNum}.${FILE_EXTENSION}`;
    const fullUrl = `${IMAGE_FOLDER}/${filename}`;

    checkPromises.push(
      checkImageExists(fullUrl).then(exists => ({ exists, filename, fullUrl, photoNum }))
    );
  }

  const results = await Promise.all(checkPromises);

  if (emptyState && gallery.contains(emptyState)) {
    emptyState.remove();
  }

  const fragment = document.createDocumentFragment();

  results.forEach(item => {
    if (item.exists) {
      validCount++;
      newList.push(item);

      if (!loadedImagesMap.has(item.filename)) {
        const isTopRow = newList.length <= 6;
        const cardElement = createPhotoCard(item.filename, item.fullUrl, item.photoNum, isTopRow);
        fragment.appendChild(cardElement);
        loadedImagesMap.set(item.filename, cardElement);
      }
    }
  });

  if (fragment.children.length > 0) {
    gallery.appendChild(fragment);
  }

  currentGalleryList = newList;
  filterGallery(); 

  if (syncStatus) {
    syncStatus.textContent = `Sync Active (${validCount} Photos Live)`;
  }
}

// --- LIGHTBOX FUNCTIONS ---
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