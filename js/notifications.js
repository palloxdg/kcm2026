const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xkjjaznd';
const NOTIFIED_QUESTS_KEY = 'kcm2026.notifiedQuests';

function notificationsAreDisabled() {
  const host = window.location.hostname.toLowerCase();
  const isLocal = host === 'localhost' || host === '127.0.0.1' || host === '';
  const isDebugDay = new URLSearchParams(window.location.search).has('day');
  return isLocal || isDebugDay;
}

function loadNotifiedQuests() {
  try {
    const stored = JSON.parse(localStorage.getItem(NOTIFIED_QUESTS_KEY) || '[]');
    return new Set(Array.isArray(stored) ? stored : []);
  } catch {
    return new Set();
  }
}

function saveNotifiedQuests(notified) {
  try {
    localStorage.setItem(NOTIFIED_QUESTS_KEY, JSON.stringify([...notified]));
  } catch {
    // A blocked localStorage should not interrupt the reward experience.
  }
}

export async function notifyVoucherOpened(quest) {
  if (!quest || notificationsAreDisabled()) return false;

  const notified = loadNotifiedQuests();
  if (notified.has(quest.id)) return false;

  try {
    const openedAt = new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'full',
      timeStyle: 'long',
      timeZone: 'Europe/Berlin'
    }).format(new Date());

    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        subject: `Kate opened Day ${quest.day}`,
        day: quest.day,
        quest: quest.title,
        questId: quest.id,
        openedAt,
        page: window.location.href
      })
    });

    if (!response.ok) return false;

    notified.add(quest.id);
    saveNotifiedQuests(notified);
    return true;
  } catch {
    // Notification failures remain invisible to Kate and do not block the popup.
    return false;
  }
}
