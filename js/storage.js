const STORAGE_KEY = 'kcm2026.completedQuests';

export function loadCompleted() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return new Set(Array.isArray(value) ? value : []);
  } catch {
    return new Set();
  }
}

export function saveCompleted(completed) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed]));
}
