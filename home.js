/**
 * RPhotography - Home Page Controller
 * Automatically renders match cards using folder names from drive_ids.json
 */

const JSON_URL = 'images/drive_ids.json';

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('home-match-cards');
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

  container.innerHTML = '';

  // Sort match titles alphabetically
  matchTitles.sort().forEach(title => {
    const fileIdsMap = matchDataMap[title];
    const filenames = Object.keys(fileIdsMap).filter(name => !name.startsWith('.')).sort();
    
    if (filenames.length === 0) return;

    // Use the first image in the folder as the cover preview thumbnail
    const coverFileName = filenames[0];
    const fileId = fileIdsMap[coverFileName];
    const imageUrl = fileId ? `https://lh3.googleusercontent.com/d/${fileId}` : '';

    // Create a URL-safe ID slug from the folder name
    const matchId = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const card = document.createElement('a');
    card.className = 'match-card home-card';
    card.href = `gallery.html?match=${encodeURIComponent(matchId)}`;

    card.innerHTML = `
      <div class="match-card-thumb">
        <img 
          src="${imageUrl}" 
          alt="${title} Preview" 
          loading="lazy" 
          decoding="async" 
          onerror="this.parentElement.classList.add('thumb-fallback');" 
        />
      </div>
      <div class="match-card-body">
        <div class="match-card-title">${title}</div>
        <div class="match-card-meta">${filenames.length} Photos →</div>
      </div>
    `;

    container.appendChild(card);
  });
});