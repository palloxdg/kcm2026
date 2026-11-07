const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xkjjaznd';
const STORAGE_KEY = 'kcm2026.notifiedQuests';
const inFlight = new Set();

function loadNotified() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return new Set(Array.isArray(value) ? value : []);
  } catch {
    return new Set();
  }
}

function saveNotified(notified) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...notified]));
  } catch {
    // Notifications must never interrupt the adventure.
  }
}

function formatOpenedAt(date = new Date()) {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'full',
    timeStyle: 'long',
    timeZone: 'Europe/Berlin'
  }).format(date);
}

function isDevelopmentVisit() {
  const hostname = window.location.hostname;

  return (
    new URLSearchParams(window.location.search).has('day') ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === ''
  );
}

export async function notifyQuestCompleted(quest) {
  if (!quest?.id || isDevelopmentVisit()) return false;

  const notified = loadNotified();

  if (notified.has(quest.id) || inFlight.has(quest.id)) {
    return false;
  }

  inFlight.add(quest.id);

  try {
    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      keepalive: true,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        _subject: `Kate opened Day ${quest.day} 🎁`,
        event: 'quest_completed',
        day: quest.day,
        quest: quest.title,
        region: quest.region,
        opened_at: formatOpenedAt(),
        site: window.location.origin,
        _gotcha: ''
      })
    });

    if (!response.ok) return false;

    notified.add(quest.id);
    saveNotified(notified);

    return true;
  } catch {
    return false;
  } finally {
    inFlight.delete(quest.id);
  }
}
