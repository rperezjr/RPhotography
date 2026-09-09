/**
 * RPhotography - Monett Soccer Gallery Engine
 * Automatic Dropdown, 3D Carousel Modal, & iOS-Style Studio with True Bounding-Box Canvas Crop & Advanced Noise Reduction
 */

// --- CONFIGURATION ---
const IMAGE_FOLDER = 'images';
const FILE_PREFIX = '_WAC';
const FILE_EXTENSION = 'JPG';

// --- ADMIN / AUTH CHECK ---
const ADMIN_PASS = "monett2026";
const isAdmin = localStorage.getItem("isLoggedIn") === "true";

// --- MATCHES MANIFEST ---
const MATCH_DATA = [
  { id: 'jhs-jamboree', title: 'JHS Soccer Jamboree', startNum: 7332, endNum: 7474 },
  { id: 'Monett-vs-Hillcrest', title: 'Monett vs Hillcrest', startNum: 7476, endNum: 7514 },
  { id: 'Monett-vs-Boliver', title: 'Monett vs Boliver', startNum: 7516, endNum: 7667 },
  { id: 'Monett-vs-Nixa', title: 'Monett vs Nixa', startNum: 7670, endNum: 7831 },
  { id: 'Monett-vs-Joplin', title: 'Monett vs Joplin', startNum: 7837, endNum: 7979 }
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

let activeEditItem = null;
let activeCardElement = null;
let activeEditTool = 'adjust'; // 'adjust' or 'crop'

// True Bounding-Box Crop Interaction State
let isInteractingCrop = false;
let cropAction = null; // 'drag', 'nw', 'ne', 'sw', 'se'
let cropStartX = 0, cropStartY = 0;
let initialBoxLeft = 0, initialBoxTop = 0, initialBoxWidth = 0, initialBoxHeight = 0;

// Inject iOS-Style Studio Modal HTML with Canvas Preview & Working Denoise
if (isAdmin) {
  const modalHtml = `
    <div id="admin-filter-modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.95); justify-content: center; align-items: center; z-index: 3000; padding: 15px; overflow-y: auto;">
      <div style="background: #121212; border-radius: 12px; width: 1050px; max-width: 100%; border: 1px solid #333; color: #fff; box-sizing: border-box; height: 92vh; display: flex; flex-direction: column; overflow: hidden;">
        
        <!-- iOS Top Header Bar -->
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 1px solid #222; background: #181818;">
          <button onclick="closeAdminModal()" style="background: none; border: none; color: #888; font-size: 1rem; cursor: pointer;">Cancel</button>
          <h3 style="margin: 0; color: #fff; font-size: 1rem; font-weight: 600;">Edit Photo</h3>
          <button onclick="saveActiveFilter()" style="background: none; border: none; color: #4cd964; font-size: 1rem; font-weight: 600; cursor: pointer;">Done</button>
        </div>

        <!-- iOS Main Workspace Layout -->
        <div id="ios-studio-layout" style="display: flex; flex-grow: 1; overflow: hidden; min-height: 0;">
          
          <!-- Image Viewport / Live Canvas Area -->
          <div style="flex: 1.6; background: #000; display: flex; justify-content: center; align-items: center; position: relative; overflow: hidden;">
            <div id="ios-viewport" style="position: relative; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; overflow: hidden;">
              <canvas id="modal-preview-canvas" style="max-width: 90%; max-height: 90%; object-fit: contain;"></canvas>
              
              <!-- iOS Interactive Crop Box Overlay with Handles -->
              <div id="ios-crop-box" style="position: absolute; border: 2px solid #fff; box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6); cursor: move; display: none; top: 15%; left: 15%; width: 70%; height: 70%;">
                <div style="position: absolute; inset: 0; pointer-events: none; background: linear-gradient(to right, rgba(255,255,255,0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.25) 1px, transparent 1px); background-size: 33.33% 33.33%;"></div>
                
                <!-- Resize Handles -->
                <div class="crop-handle" data-handle="nw" style="position: absolute; top: -6px; left: -6px; width: 14px; height: 14px; background: #fff; border: 1px solid #000; cursor: nwse-resize;"></div>
                <div class="crop-handle" data-handle="ne" style="position: absolute; top: -6px; right: -6px; width: 14px; height: 14px; background: #fff; border: 1px solid #000; cursor: nesw-resize;"></div>
                <div class="crop-handle" data-handle="sw" style="position: absolute; bottom: -6px; left: -6px; width: 14px; height: 14px; background: #fff; border: 1px solid #000; cursor: nesw-resize;"></div>
                <div class="crop-handle" data-handle="se" style="position: absolute; bottom: -6px; right: -6px; width: 14px; height: 14px; background: #fff; border: 1px solid #000; cursor: nwse-resize;"></div>
              </div>
            </div>
          </div>

          <!-- iOS Side Tool Panel -->
          <div style="flex: 1; background: #181818; border-left: 1px solid #222; display: flex; flex-direction: column; overflow: hidden;">
            
            <div id="ios-tools-container" style="flex-grow: 1; overflow-y: auto; padding: 20px;">
              
              <!-- ADJUST SLIDERS VIEW -->
              <div id="tool-view-adjust">
                <div style="font-size: 0.8rem; font-weight: bold; color: #888; text-transform: uppercase; margin-bottom: 15px; letter-spacing: 1px;">Light & Color Adjustments</div>
                
                <div style="margin-bottom: 15px;">
                  <label style="display: flex; justify-content: space-between; font-size: 0.8rem; color: #ccc; margin-bottom: 5px;"><span>Exposure</span><span id="val-b">100%</span></label>
                  <input type="range" id="range-b" min="0" max="200" value="100" style="width: 100%; accent-color: #4cd964; cursor: pointer;" oninput="triggerLiveFilter()">
                </div>
                <div style="margin-bottom: 15px;">
                  <label style="display: flex; justify-content: space-between; font-size: 0.8rem; color: #ccc; margin-bottom: 5px;"><span>Brilliance</span><span id="val-high">100%</span></label>
                  <input type="range" id="range-high" min="50" max="150" value="100" style="width: 100%; accent-color: #4cd964; cursor: pointer;" oninput="triggerLiveFilter()">
                </div>
                <div style="margin-bottom: 15px;">
                  <label style="display: flex; justify-content: space-between; font-size: 0.8rem; color: #ccc; margin-bottom: 5px;"><span>Contrast</span><span id="val-c">100%</span></label>
                  <input type="range" id="range-c" min="0" max="200" value="100" style="width: 100%; accent-color: #4cd964; cursor: pointer;" oninput="triggerLiveFilter()">
                </div>
                <div style="margin-bottom: 15px;">
                  <label style="display: flex; justify-content: space-between; font-size: 0.8rem; color: #ccc; margin-bottom: 5px;"><span>Shadows</span><span id="val-shad">100%</span></label>
                  <input type="range" id="range-shad" min="50" max="180" value="100" style="width: 100%; accent-color: #4cd964; cursor: pointer;" oninput="triggerLiveFilter()">
                </div>
                <div style="margin-bottom: 15px;">
                  <label style="display: flex; justify-content: space-between; font-size: 0.8rem; color: #ccc; margin-bottom: 5px;"><span>Saturation</span><span id="val-s">100%</span></label>
                  <input type="range" id="range-s" min="0" max="200" value="100" style="width: 100%; accent-color: #4cd964; cursor: pointer;" oninput="triggerLiveFilter()">
                </div>
                <div style="margin-bottom: 15px;">
                  <label style="display: flex; justify-content: space-between; font-size: 0.8rem; color: #ccc; margin-bottom: 5px;"><span>Warmth</span><span id="val-temp">0°</span></label>
                  <input type="range" id="range-temp" min="-50" max="50" value="0" style="width: 100%; accent-color: #4cd964; cursor: pointer;" oninput="triggerLiveFilter()">
                </div>
                <div style="margin-bottom: 15px;">
                  <label style="display: flex; justify-content: space-between; font-size: 0.8rem; color: #ccc; margin-bottom: 5px;"><span>Sharpness</span><span id="val-sharp">0px</span></label>
                  <input type="range" id="range-sharp" min="0" max="10" value="0" step="0.5" style="width: 100%; accent-color: #4cd964; cursor: pointer;" oninput="triggerLiveFilter()">
                </div>
                <div style="margin-bottom: 15px;">
                  <label style="display: flex; justify-content: space-between; font-size: 0.8rem; color: #ccc; margin-bottom: 5px;"><span>Denoise</span><span id="val-denoise">0%</span></label>
                  <input type="range" id="range-denoise" min="0" max="100" value="0" style="width: 100%; accent-color: #4cd964; cursor: pointer;" oninput="triggerLiveFilter()">
                </div>
              </div>

              <!-- CROP TOOLS VIEW -->
              <div id="tool-view-crop" style="display: none;">
                <div style="font-size: 0.8rem; font-weight: bold; color: #888; text-transform: uppercase; margin-bottom: 15px; letter-spacing: 1px;">Crop & Straighten</div>
                
                <div style="margin-bottom: 20px;">
                  <label style="display: flex; justify-content: space-between; font-size: 0.8rem; color: #ccc; margin-bottom: 5px;"><span>Straighten Angle</span><span id="val-straighten">0°</span></label>
                  <input type="range" id="range-straighten" min="-45" max="45" value="0" style="width: 100%; accent-color: #4cd964; cursor: pointer;" oninput="triggerLiveFilter()">
                </div>

                <p style="font-size: 0.75rem; color: #888; line-height: 1.4;">💡 Tip: Click and drag inside the frame box to position your crop, or use corner handles to resize. The image crops cleanly and updates live!</p>
              </div>

            </div>

            <!-- iOS Bottom Tool Switching Bar -->
            <div style="display: flex; justify-content: space-around; padding: 12px; background: #111; border-top: 1px solid #222;">
              <button onclick="switchIosTool('adjust')" id="tab-btn-adjust" style="background: none; border: none; color: #4cd964; font-size: 0.8rem; font-weight: bold; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 4px;">
                <span>⚙️</span> Adjust
              </button>
              <button onclick="switchIosTool('crop')" id="tab-btn-crop" style="background: none; border: none; color: #888; font-size: 0.8rem; font-weight: bold; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 4px;">
                <span>📐</span> Crop & Rotate
              </button>
              <button onclick="resetActiveFilters()" style="background: none; border: none; color: #ff3b30; font-size: 0.8rem; font-weight: bold; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 4px;">
                <span>🔄</span> Reset
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);

  // Responsive styling
  const responsiveStyle = document.createElement('style');
  responsiveStyle.innerHTML = `
    @media (max-width: 768px) {
      #ios-studio-layout { flex-direction: column !important; }
      #admin-filter-modal > div { width: 100% !important; height: 98vh !important; }
    }
  `;
  document.head.appendChild(responsiveStyle);

  // True Interactive Drag & Resize Crop Box Logic
  const cropBox = document.getElementById('ios-crop-box');
  const viewport = document.getElementById('ios-viewport');

  function getClientCoords(e) {
    return e.touches ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY };
  }

  cropBox.addEventListener('mousedown', initCropInteraction);
  cropBox.addEventListener('touchstart', initCropInteraction, { passive: false });

  function initCropInteraction(e) {
    const coords = getClientCoords(e);
    cropStartX = coords.x;
    cropStartY = coords.y;

    initialBoxLeft = cropBox.offsetLeft;
    initialBoxTop = cropBox.offsetTop;
    initialBoxWidth = cropBox.offsetWidth;
    initialBoxHeight = cropBox.offsetHeight;

    if (e.target.classList.contains('crop-handle')) {
      cropAction = e.target.getAttribute('data-handle');
    } else {
      cropAction = 'drag';
    }

    isInteractingCrop = true;
    e.stopPropagation();
    e.preventDefault();
  }

  window.addEventListener('mousemove', onCropMove);
  window.addEventListener('touchmove', onCropMove, { passive: false });

  function onCropMove(e) {
    if (!isInteractingCrop) return;
    const coords = getClientCoords(e);
    const dx = coords.x - cropStartX;
    const dy = coords.y - cropStartY;

    const maxWidth = viewport.clientWidth;
    const maxHeight = viewport.clientHeight;

    let l = initialBoxLeft;
    let t = initialBoxTop;
    let w = initialBoxWidth;
    let h = initialBoxHeight;

    if (cropAction === 'drag') {
      l = Math.max(0, Math.min(initialBoxLeft + dx, maxWidth - w));
      t = Math.max(0, Math.min(initialBoxTop + dy, maxHeight - h));
    } else if (cropAction === 'nw') {
      let newW = Math.max(50, initialBoxWidth - dx);
      let newH = Math.max(50, initialBoxHeight - dy);
      l = initialBoxLeft + (initialBoxWidth - newW);
      t = initialBoxTop + (initialBoxHeight - newH);
      w = newW; h = newH;
    } else if (cropAction === 'ne') {
      w = Math.max(50, Math.min(initialBoxWidth + dx, maxWidth - initialBoxLeft));
      let newH = Math.max(50, initialBoxHeight - dy);
      t = initialBoxTop + (initialBoxHeight - newH);
      h = newH;
    } else if (cropAction === 'sw') {
      let newW = Math.max(50, initialBoxWidth - dx);
      l = initialBoxLeft + (initialBoxWidth - newW);
      w = newW;
      h = Math.max(50, Math.min(initialBoxHeight + dy, maxHeight - initialBoxTop));
    } else if (cropAction === 'se') {
      w = Math.max(50, Math.min(initialBoxWidth + dx, maxWidth - initialBoxLeft));
      h = Math.max(50, Math.min(initialBoxHeight + dy, maxHeight - initialBoxTop));
    }

    cropBox.style.left = l + 'px';
    cropBox.style.top = t + 'px';
    cropBox.style.width = w + 'px';
    cropBox.style.height = h + 'px';

    triggerLiveFilter();
    e.preventDefault();
  }

  window.addEventListener('mouseup', endCropInteraction);
  window.addEventListener('touchend', endCropInteraction);

  function endCropInteraction() {
    isInteractingCrop = false;
  }
}

function switchIosTool(tool) {
  activeEditTool = tool;
  const cropBox = document.getElementById('ios-crop-box');

  if (tool === 'adjust') {
    document.getElementById('tool-view-adjust').style.display = 'block';
    document.getElementById('tool-view-crop').style.display = 'none';
    document.getElementById('tab-btn-adjust').style.color = '#4cd964';
    document.getElementById('tab-btn-crop').style.color = '#888';
    if (cropBox) cropBox.style.display = 'none';
  } else {
    document.getElementById('tool-view-adjust').style.display = 'none';
    document.getElementById('tool-view-crop').style.display = 'block';
    document.getElementById('tab-btn-adjust').style.color = '#888';
    document.getElementById('tab-btn-crop').style.color = '#4cd964';
    if (cropBox) cropBox.style.display = 'block';
  }
}

// Advanced Canvas Rendering Engine with Bounding-Box Cropping, Clean Filters, and Real Denoise
function renderImageToCanvas(imgElement, canvasElement, f) {
  if (!imgElement || !canvasElement) return;
  const ctx = canvasElement.getContext('2d');
  if (!ctx) return;

  const naturalWidth = imgElement.naturalWidth || imgElement.width || 800;
  const naturalHeight = imgElement.naturalHeight || imgElement.height || 600;

  canvasElement.width = naturalWidth;
  canvasElement.height = naturalHeight;

  ctx.clearRect(0, 0, naturalWidth, naturalHeight);
  ctx.save();

  // Map viewport crop box percentages to actual image pixel coordinates
  const viewport = document.getElementById('ios-viewport');
  const cropBox = document.getElementById('ios-crop-box');

  let sx = 0, sy = 0, sWidth = naturalWidth, sHeight = naturalHeight;

  if (viewport && cropBox && cropBox.style.display !== 'none' && viewport.clientWidth > 0) {
    const boxLeft = cropBox.offsetLeft;
    const boxTop = cropBox.offsetTop;
    const boxW = cropBox.offsetWidth;
    const boxH = cropBox.offsetHeight;
    const vW = viewport.clientWidth;
    const vH = viewport.clientHeight;

    sx = (boxLeft / vW) * naturalWidth;
    sy = (boxTop / vH) * naturalHeight;
    sWidth = (boxW / vW) * naturalWidth;
    sHeight = (boxH / vH) * naturalHeight;
  } else if (f.cropBoxW && f.cropBoxH) {
    sx = (f.cropBoxX / 100) * naturalWidth;
    sy = (f.cropBoxY / 100) * naturalHeight;
    sWidth = (f.cropBoxW / 100) * naturalWidth;
    sHeight = (f.cropBoxH / 100) * naturalHeight;
  }

  // Set canvas size to the cropped dimensions so it fills correctly without stretching
  canvasElement.width = sWidth;
  canvasElement.height = sHeight;

  ctx.filter = `brightness(${f.brightness}%) contrast(${f.contrast}%) saturate(${f.saturation}%) sepia(${Math.max(0, f.temperature - 100)}%)`;

  ctx.translate(sWidth / 2, sHeight / 2);
  ctx.rotate((f.straighten * Math.PI) / 180);

  ctx.drawImage(
    imgElement,
    sx, sy, sWidth, sHeight,
    -sWidth / 2, -sHeight / 2, sWidth, sHeight
  );

  ctx.restore();

  // True Pixel-Level Denoise Algorithm (Fast Box Blur Noise Smoothing)
  if (f.denoise > 0) {
    const intensity = f.denoise / 100;
    const imgData = ctx.getImageData(0, 0, canvasElement.width, canvasElement.height);
    const data = imgData.data;
    const width = imgData.width;
    const height = imgData.height;
    const r = Math.round(intensity * 1.5); // Radius

    if (r > 0) {
      const copy = new Uint8ClampedArray(data);
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          let red = 0, green = 0, blue = 0, count = 0;
          for (let dy = -r; dy <= r; dy++) {
            for (let dx = -r; dx <= r; dx++) {
              let nx = x + dx, ny = y + dy;
              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                let idx = (ny * width + nx) * 4;
                red += copy[idx];
                green += copy[idx + 1];
                blue += copy[idx + 2];
                count++;
              }
            }
          }
          let destIdx = (y * width + x) * 4;
          data[destIdx] = red / count;
          data[destIdx + 1] = green / count;
          data[destIdx + 2] = blue / count;
        }
      }
      ctx.putImageData(imgData, 0, 0);
    }
  }
}

function getDefaultFilters() {
  return {
    straighten: 0,
    brightness: 100, highlights: 100, contrast: 100, shadows: 100,
    saturation: 100, temperature: 0, sharpness: 0, denoise: 0,
    cropBoxX: 15, cropBoxY: 15, cropBoxW: 70, cropBoxH: 70
  };
}

function getStoredFilters() {
  try {
    const stored = localStorage.getItem(`rphotography_filters_${currentMatch.id}`);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error("Error reading localStorage filters:", e);
  }
  return {};
}

function saveStoredFilters(filtersMap) {
  try {
    localStorage.setItem(`rphotography_filters_${currentMatch.id}`, JSON.stringify(filtersMap));
  } catch (e) {
    console.error("Error writing localStorage filters:", e);
  }
}

function resolveInitialMatch() {
  const params = new URLSearchParams(window.location.search);
  const matchId = params.get('match');
  const found = MATCH_DATA.find(m => m.id === matchId);
  return found || MATCH_DATA[0];
}

function initializeMatchDropdown() {
  if (!matchSelect) return;
  
  matchSelect.innerHTML = '';
  MATCH_DATA.forEach(match => {
    const opt = document.createElement('option');
    opt.value = match.id;
    opt.textContent = match.title;
    if (match.id === currentMatch.id) opt.selected = true;
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

function loadMatchPhotos(match) {
  currentMatch = match;
  
  if (displayGameTitle) displayGameTitle.textContent = currentMatch.title;
  if (matchSelect) matchSelect.value = currentMatch.id;
  
  gallery.innerHTML = '<div class="empty-state" id="empty-state">Loading match photos...</div>';
  loadedImagesMap.clear();
  currentGalleryList = [];
  filteredGalleryList = [];

  if (photoCountBadge) photoCountBadge.textContent = '0 Photos';
  if (syncStatus) syncStatus.textContent = `Scanning ${match.title}...`;

  const count = match.endNum - match.startNum + 1;
  const sortedNumbers = Array.from({ length: count }, (_, i) => match.startNum + i);
  const savedFilters = getStoredFilters();

  const potentialList = sortedNumbers.map(photoNum => {
    const filename = `${FILE_PREFIX}${photoNum}.${FILE_EXTENSION}`;
    const fullUrl = `${IMAGE_FOLDER}/${filename}`;
    const filters = savedFilters[filename] || getDefaultFilters();
    return { filename, fullUrl, photoNum, filters };
  });

  let verifiedCount = 0;

  potentialList.forEach((item) => {
    const testerImg = new Image();

    testerImg.onload = () => {
      if (currentGalleryList.length === 0) gallery.innerHTML = '';

      currentGalleryList.push(item);
      currentGalleryList.sort((a, b) => a.photoNum - b.photoNum);

      const isTopRow = currentGalleryList.length <= 6;
      const cardElement = createPhotoCard(item, isTopRow);

      loadedImagesMap.set(item.filename, cardElement);
      
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

      verifiedCount++;
      filterGallery();

      if (syncStatus) syncStatus.textContent = `Sync Active (${verifiedCount} Photos Loaded)`;
    };

    testerImg.onerror = () => {};
    testerImg.src = item.fullUrl;
  });
}

function filterGallery() {
  const searchTerm = gameTitleInput ? gameTitleInput.value.toLowerCase().trim() : '';

  filteredGalleryList = currentGalleryList.filter(item => {
    return searchTerm === '' || item.photoNum.toString().includes(searchTerm);
  });

  loadedImagesMap.forEach((cardElement, filename) => {
    const isVisible = filteredGalleryList.some(item => item.filename === filename);
    cardElement.style.display = isVisible ? '' : 'none';
  });

  if (photoCountBadge) photoCountBadge.textContent = `${filteredGalleryList.length} Photos`;
}

if (gameTitleInput) gameTitleInput.addEventListener('input', filterGallery);
if (updateTitleBtn) updateTitleBtn.addEventListener('click', filterGallery);

function createPhotoCard(item, isTopRow) {
  const card = document.createElement('div');
  card.className = 'photo-card';
  card.dataset.filename = item.filename;
  card.dataset.photoNum = item.photoNum;
  card.style.position = 'relative';
  card.style.overflow = 'hidden';

  const loadingAttr = isTopRow ? 'eager' : 'lazy';
  const f = item.filters || getDefaultFilters();

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'width: 100%; height: 100%; object-fit: cover; display: block;';
  card.appendChild(canvas);

  const tempImg = new Image();
  tempImg.onload = () => {
    renderImageToCanvas(tempImg, canvas, f);
  };
  tempImg.src = item.fullUrl;

  if (isAdmin) {
    const editBtn = document.createElement('button');
    editBtn.textContent = '⚙️ Edit';
    editBtn.style.cssText = 'position: absolute; top: 10px; right: 10px; z-index: 10; padding: 4px 8px; background: #2e7d32; color: #fff; border: none; border-radius: 4px; font-size: 0.7rem; cursor: pointer; font-weight: bold;';
    
    editBtn.onclick = (e) => {
      e.stopPropagation();
      openAdminModal(item, card);
    };
    card.appendChild(editBtn);
  }

  card.addEventListener('click', () => {
    const index = filteredGalleryList.findIndex(entry => entry.filename === item.filename);
    if (index !== -1) openLightbox(index);
  });

  return card;
}

function openAdminModal(item, cardElement) {
  activeEditItem = item;
  activeCardElement = cardElement;

  const f = item.filters || getDefaultFilters();
  document.getElementById("range-straighten").value = f.straighten;
  document.getElementById("range-b").value = f.brightness;
  document.getElementById("range-high").value = f.highlights;
  document.getElementById("range-c").value = f.contrast;
  document.getElementById("range-shad").value = f.shadows;
  document.getElementById("range-s").value = f.saturation;
  document.getElementById("range-temp").value = f.temperature;
  document.getElementById("range-sharp").value = f.sharpness;
  document.getElementById("range-denoise").value = f.denoise;

  const cropBox = document.getElementById("ios-crop-box");
  if (cropBox) {
    cropBox.style.left = (f.cropBoxX || 15) + "%";
    cropBox.style.top = (f.cropBoxY || 15) + "%";
    cropBox.style.width = (f.cropBoxW || 70) + "%";
    cropBox.style.height = (f.cropBoxH || 70) + "%";
  }

  const previewCanvas = document.getElementById("modal-preview-canvas");
  const sourceImg = new Image();
  sourceImg.onload = () => {
    switchIosTool('adjust');
    renderImageToCanvas(sourceImg, previewCanvas, f);
    document.getElementById("admin-filter-modal").style.display = "flex";
  };
  sourceImg.src = item.fullUrl;
}

function getCurrentFiltersFromUI() {
  const cropBox = document.getElementById("ios-crop-box");
  const viewport = document.getElementById("ios-viewport");

  let boxX = 15, boxY = 15, boxW = 70, boxH = 70;
  if (cropBox && viewport && viewport.clientWidth > 0) {
    boxX = (cropBox.offsetLeft / viewport.clientWidth) * 100;
    boxY = (cropBox.offsetTop / viewport.clientHeight) * 100;
    boxW = (cropBox.offsetWidth / viewport.clientWidth) * 100;
    boxH = (cropBox.offsetHeight / viewport.clientHeight) * 100;
  }

  return {
    straighten: parseFloat(document.getElementById("range-straighten").value),
    brightness: parseFloat(document.getElementById("range-b").value),
    highlights: parseFloat(document.getElementById("range-high").value),
    contrast: parseFloat(document.getElementById("range-c").value),
    shadows: parseFloat(document.getElementById("range-shad").value),
    saturation: parseFloat(document.getElementById("range-s").value),
    temperature: parseFloat(document.getElementById("range-temp").value),
    sharpness: parseFloat(document.getElementById("range-sharp").value),
    denoise: parseFloat(document.getElementById("range-denoise").value),
    cropBoxX: boxX, cropBoxY: boxY, cropBoxW: boxW, cropBoxH: boxH
  };
}

function triggerLiveFilter() {
  const f = getCurrentFiltersFromUI();

  document.getElementById("val-straighten").textContent = f.straighten + "°";
  document.getElementById("val-b").textContent = f.brightness + "%";
  document.getElementById("val-high").textContent = f.highlights + "%";
  document.getElementById("val-c").textContent = f.contrast + "%";
  document.getElementById("val-shad").textContent = f.shadows + "%";
  document.getElementById("val-s").textContent = f.saturation + "%";
  document.getElementById("val-temp").textContent = f.temperature + "°";
  document.getElementById("val-sharp").textContent = f.sharpness + "px";
  document.getElementById("val-denoise").textContent = f.denoise + "%";

  const modalCanvas = document.getElementById("modal-preview-canvas");
  if (modalCanvas && activeEditItem) {
    const sourceImg = new Image();
    sourceImg.onload = () => {
      renderImageToCanvas(sourceImg, modalCanvas, f);
    };
    sourceImg.src = activeEditItem.fullUrl;
  }

  if (activeCardElement) {
    const cardCanvas = activeCardElement.querySelector("canvas");
    const sourceImg = new Image();
    sourceImg.onload = () => {
      renderImageToCanvas(sourceImg, cardCanvas, f);
    };
    sourceImg.src = activeEditItem.fullUrl;
  }
}

function resetActiveFilters() {
  const def = getDefaultFilters();
  document.getElementById("range-straighten").value = def.straighten;
  document.getElementById("range-b").value = def.brightness;
  document.getElementById("range-high").value = def.highlights;
  document.getElementById("range-c").value = def.contrast;
  document.getElementById("range-shad").value = def.shadows;
  document.getElementById("range-s").value = def.saturation;
  document.getElementById("range-temp").value = def.temperature;
  document.getElementById("range-sharp").value = def.sharpness;
  document.getElementById("range-denoise").value = def.denoise;

  const cropBox = document.getElementById("ios-crop-box");
  if (cropBox) {
    cropBox.style.left = "15%";
    cropBox.style.top = "15%";
    cropBox.style.width = "70%";
    cropBox.style.height = "70%";
  }

  triggerLiveFilter();
}

function closeAdminModal() {
  document.getElementById("admin-filter-modal").style.display = "none";
  if (activeEditItem && activeCardElement) {
    const f = activeEditItem.filters || getDefaultFilters();
    const cardCanvas = activeCardElement.querySelector("canvas");
    const sourceImg = new Image();
    sourceImg.onload = () => {
      renderImageToCanvas(sourceImg, cardCanvas, f);
    };
    sourceImg.src = activeEditItem.fullUrl;
  }
}

function saveActiveFilter() {
  if (!activeEditItem) return;

  activeEditItem.filters = getCurrentFiltersFromUI();

  const savedFilters = getStoredFilters();
  savedFilters[activeEditItem.filename] = activeEditItem.filters;
  saveStoredFilters(savedFilters);

  document.getElementById("admin-filter-modal").style.display = "none";
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
      const item = filteredGalleryList[slot.index];
      if (img && item) {
        img.src = item.fullUrl;
        const f = item.filters || getDefaultFilters();
        img.style.filter = `brightness(${f.brightness}%) contrast(${f.contrast}%) saturate(${f.saturation}%)`;
      }
    }
  });

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
  activeIndex = (activeIndex + 1 + filteredGalleryList.length) % filteredGalleryList.length;
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

document.addEventListener('DOMContentLoaded', () => {
  currentMatch = resolveInitialMatch();
  initializeMatchDropdown();
  loadMatchPhotos(currentMatch);
});