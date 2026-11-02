/**
- RPhotography - Monett Soccer Gallery Engine
- Pulls photos dynamically based on exact folder names from drive_ids.json
 */

const IMAGE_FOLDER = 'images';

let MATCH_DATA_MAP = {};
let MATCH_LIST = [];
let currentMatch = null;
let loadedImagesMap = new Map();
let currentGalleryList = [];
let filteredGalleryList = [];
let activeIndex = 0;
let lightboxSlots = [];
const preloadedCache = new Set();

const gallery = document.getElementById('gallery');
const syncStatus = document.getElementById('sync-status');
const matchSelect = document.getElementById('match-select');
const gameTitleInput = document.getElementById('game-title-input');
const updateTitleBtn = document.getElementById('update-title-btn');
const displayGameTitle = document.getElementById('display-game-title');
const photoCountBadge = document.getElementById('photo-count-badge');

const lightbox = document.getElementById('lightbox');
const lightboxCaption = document.getElementById('lightbox-caption');
const lightboxClose = document.getElementById('lightbox-close');
const lightboxPrev = document.getElementById('lightbox-prev');
const lightboxNext = document.getElementById('lightbox-next');

async function loadDriveMappings() {
  try {
    const res = await fetch(`${IMAGE_FOLDER}/drive_ids.json?v=${Date.now()}`);
    if (res.ok) {
      MATCH_DATA_MAP = await res.json();
      
      MATCH_LIST = Object.keys(MATCH_DATA_MAP).sort().map(title => {
        const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        return { id, title, filesMap: MATCH_DATA_MAP[title] };
      });
    }
  } catch (e) {
    console.warn('Could not load drive_ids.json', e);
  }
}

function resolveInitialMatch() {
  const params = new URLSearchParams(window.location.search);
  const matchId = params.get('match');
  return MATCH_LIST.find(m => m.id === matchId) || MATCH_LIST[0];
}

function initializeMatchDropdown() {
  if (!matchSelect || MATCH_LIST.length === 0) return;
  
  matchSelect.innerHTML = '';
  MATCH_LIST.forEach(match => {
    const opt = document.createElement('option');
    opt.value = match.id;
    opt.textContent = match.title;
    if (match.id === currentMatch?.id) opt.selected = true;
    matchSelect.appendChild(opt);
  });

  matchSelect.addEventListener('change', (e) => {
    const selected = MATCH_LIST.find(m => m.id === e.target.value);
    if (selected) {
      window.history.replaceState({}, '', `gallery.html?match=${encodeURIComponent(selected.id)}`);
      loadMatchPhotos(selected);
    }
  });
}

async function loadMatchPhotos(match) {
  currentMatch = match;
  if (!currentMatch) return;
  
  if (displayGameTitle) displayGameTitle.textContent = currentMatch.title;
  if (matchSelect) matchSelect.value = currentMatch.id;
  
  gallery.innerHTML = '<div class="empty-state" id="empty-state">Loading match photos...</div>';
  loadedImagesMap.clear();
  currentGalleryList = [];
  filteredGalleryList = [];

  if (photoCountBadge) photoCountBadge.textContent = '0 Photos';
  if (syncStatus) syncStatus.textContent = `Loading ${match.title}...`;

  const filenames = Object.keys(currentMatch.filesMap)
    .filter(name => !name.startsWith('.'))
    .sort((a, b) => {
      const numA = parseInt(a.replace(/[^0-9]/g, ''), 10) || 0;
      const numB = parseInt(b.replace(/[^0-9]/g, ''), 10) || 0;
      return numA - numB;
    });

  if (filenames.length === 0) {
    gallery.innerHTML = '<div class="empty-state" id="empty-state">No photos found for this match.</div>';
    if (syncStatus) syncStatus.textContent = 'No photos available';
    return;
  }

  currentGalleryList = filenames.map(filename => {
    const photoNum = parseInt(filename.replace(/[^0-9]/g, ''), 10) || 0;
    const fileId = currentMatch.filesMap[filename];
    const fullUrl = fileId ? `https://lh3.googleusercontent.com/d/${fileId}` : '';
    return { filename, fullUrl, thumbUrl: fullUrl, photoNum };
  });

  gallery.innerHTML = '';

  currentGalleryList.forEach((item, index) => {
    const cardElement = createPhotoCard(item.filename, item.fullUrl, item.thumbUrl, item.photoNum, index < 6);
    loadedImagesMap.set(item.filename, cardElement);
    gallery.appendChild(cardElement);
  });

  filterGallery();
  if (syncStatus) syncStatus.textContent = `Google Drive Sync Active (${currentGalleryList.length} Photos Loaded)`;
}

function filterGallery() {
  const searchTerm = gameTitleInput ? gameTitleInput.value.toLowerCase().trim() : '';
  filteredGalleryList = currentGalleryList.filter(item => searchTerm === '' || item.photoNum.toString().includes(searchTerm));

  loadedImagesMap.forEach((cardElement, filename) => {
    cardElement.style.display = filteredGalleryList.some(item => item.filename === filename) ? '' : 'none';
  });

  if (photoCountBadge) photoCountBadge.textContent = `${filteredGalleryList.length} Photos`;
}

if (gameTitleInput) gameTitleInput.addEventListener('input', filterGallery);
if (updateTitleBtn) updateTitleBtn.addEventListener('click', filterGallery);

function createPhotoCard(filename, fullUrl, thumbUrl, photoNum, isTopRow) {
  const card = document.createElement('div');
  card.className = 'photo-card';
  card.dataset.filename = filename;
  
  card.innerHTML = `<img src="${thumbUrl}" loading="${isTopRow ? 'eager' : 'lazy'}" decoding="async" alt="Shot ${photoNum}" onerror="this.closest('.photo-card').remove();"/>`;
  card.addEventListener('click', () => {
    const index = filteredGalleryList.findIndex(item => item.filename === filename);
    if (index !== -1) openLightbox(index);
  });

  return card;
}

function initLightboxSlots() {
  lightboxSlots = [
    { offset: -2, isCenter: false, img: document.getElementById('card-far-left')?.querySelector('img') },
    { offset: -1, isCenter: false, img: document.getElementById('card-left')?.querySelector('img') },
    { offset: 0,  isCenter: true,  img: document.getElementById('card-center')?.querySelector('img') },
    { offset: 1,  isCenter: false, img: document.getElementById('card-right')?.querySelector('img') },
    { offset: 2,  isCenter: false, img: document.getElementById('card-far-right')?.querySelector('img') }
  ].filter(slot => slot.img !== null);
}

function preloadImage(url) {
  if (!url || preloadedCache.has(url)) return;
  preloadedCache.add(url);
  const img = new Image();
  img.src = url;
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
    slot.img.src = item.fullUrl;
  });

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

if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
if (lightboxPrev) lightboxPrev.addEventListener('click', (e) => { e.stopPropagation(); showPrevPhoto(); });
if (lightboxNext) lightboxNext.addEventListener('click', (e) => { e.stopPropagation(); showNextPhoto(); });

document.addEventListener('keydown', (e) => {
  if (!lightbox || !lightbox.classList.contains('active')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') showPrevPhoto();
  if (e.key === 'ArrowRight') showNextPhoto();
});

document.addEventListener('DOMContentLoaded', async () => {
  initLightboxSlots();
  await loadDriveMappings();
  if (MATCH_LIST.length > 0) {
    currentMatch = resolveInitialMatch();
    initializeMatchDropdown();
    loadMatchPhotos(currentMatch);
  } else {
    if (gallery) gallery.innerHTML = '<div class="empty-state">No match folders found in Google Drive.</div>';
  }
});