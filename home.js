/**
 * RPhotography - Home Page Controller
 * Renders match cards with search filtering and sorting options (Newest, Oldest, Name).
 */

const JSON_URL = 'images/drive_ids.json';
let allMatches = [];

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('home-match-cards');
  const searchInput = document.getElementById('home-search-input');
  const sortSelect = document.getElementById('home-sort-select');
  if (!container) return;

  container.innerHTML = '<div class="empty-state">Loading matches from Google Drive...</div>';

  let matchDataMap = {};

  try {
    const res = await fetch(`${JSON_URL}?v=${Date.now()}`);
    if (res.ok) {
      matchDataMap = await res.json();
    }
  } catch (err) {
    console.warn('Could not load Google Drive ID mappings.', err);
  }

  const matchTitles = Object.keys(matchDataMap);

  if (matchTitles.length === 0) {
    container.innerHTML = '<div class="empty-state">No matches found.</div>';
    return;
  }

  // Preserve initial order from JSON (Apps Script sends Newest-First)
  allMatches = matchTitles.map((title, originalIndex) => {
    const fileIdsMap = matchDataMap[title];
    const filenames = Object.keys(fileIdsMap).filter(name => !name.startsWith('.')).sort();
    const coverFileName = filenames[0];
    const fileId = fileIdsMap[coverFileName];
    const imageUrl = fileId ? `https://lh3.googleusercontent.com/d/${fileId}` : '';
    const matchId = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    return { title, matchId, imageUrl, count: filenames.length, originalIndex };
  });

  updateAndRender();

  if (searchInput) searchInput.addEventListener('input', updateAndRender);
  if (sortSelect) sortSelect.addEventListener('change', updateAndRender);
});

function updateAndRender() {
  const searchInput = document.getElementById('home-search-input');
  const sortSelect = document.getElementById('home-sort-select');
  
  const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const sortValue = sortSelect ? sortSelect.value : 'newest';

  // 1. Filter by search term
  let filtered = allMatches.filter(m => m.title.toLowerCase().includes(searchTerm));

  // 2. Sort results
  filtered.sort((a, b) => {
    if (sortValue === 'newest') {
      return a.originalIndex - b.originalIndex; // Newest first (Original Apps Script order)
    } else if (sortValue === 'oldest') {
      return b.originalIndex - a.originalIndex; // Oldest first (Reverse order)
    } else if (sortValue === 'name') {
      return a.title.localeCompare(b.title); // Alphabetical A-Z
    }
    return 0;
  });

  renderMatches(filtered);
}

function renderMatches(matches) {
  const container = document.getElementById('home-match-cards');
  if (!container) return;

  if (matches.length === 0) {
    container.innerHTML = '<div class="empty-state">No matching matches found.</div>';
    return;
  }

  container.innerHTML = '';

  matches.forEach(match => {
    const card = document.createElement('a');
    card.className = 'match-card home-card';
    card.href = `gallery.html?match=${encodeURIComponent(match.matchId)}`;

    card.innerHTML = `
      <div class="match-card-thumb">
        <img 
          src="${match.imageUrl}" 
          alt="${match.title} Preview" 
          loading="lazy" 
          decoding="async" 
          onerror="this.parentElement.classList.add('thumb-fallback');" 
        />
      </div>
      <div class="match-card-body">
        <div class="match-card-title">${match.title}</div>
        <div class="match-card-meta">${match.count} Photos →</div>
      </div>
    `;

    container.appendChild(card);
  });
}