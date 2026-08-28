const START = new Date(2026, 10, 1);
const END = new Date(2026, 10, 30, 23, 59, 59, 999);

// Temporary preview default. Set to null before launch to use the real date.
const DEVELOPMENT_DAY = 1;

export function getAdventureDay(search = window.location.search, now = new Date()) {
  const debug = Number.parseInt(new URLSearchParams(search).get('day'), 10);
  if (Number.isInteger(debug)) return Math.min(30, Math.max(0, debug));
  if (Number.isInteger(DEVELOPMENT_DAY)) return DEVELOPMENT_DAY;
  if (now < START) return 0;
  if (now > END) return 30;
  return now.getDate();
}

export function formatAdventureDate(day) {
  if (day === 0) return 'Adventure locked';
  return `November ${day}, 2026`;
}
