// Replace these paths with the EXACT folder & file names from your repo
const INITIAL_PHOTOS = [
  { id: 1, url: "images/monett_game1_01.jpg", title: "Monett vs. Aurora", caption: "First half kickoff under lights.", edited: false },
  { id: 2, url: "images/monett_game1_02.jpg", title: "Monett vs. Aurora", caption: "Defensive block near box.", edited: false },
  { id: 3, url: "images/monett_game2_01.jpg", title: "Monett vs. Cassville", caption: "Midfield duel.", edited: false }
];

function getSitePhotos() {
  try {
    const stored = localStorage.getItem("rphotography_photos");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Storage parse error, falling back to defaults:", e);
  }
  return INITIAL_PHOTOS;
}