(() => {
  'use strict';
  const storageKey = 'kcm2026.introSeen';
  const dialog = document.getElementById('introDialog');
  const video = document.getElementById('introVideo');
  const welcome = document.getElementById('introWelcome');
  const start = document.getElementById('introStart');
  const skip = document.getElementById('introSkip');
  const status = document.getElementById('introStatus');
  let dismissed = false;
  let replayButton = null;
  let replaying = false;
  let seen = false;

  try {
    seen = localStorage.getItem(storageKey) === '1';
  } catch { /* The intro still works when browser storage is unavailable. */ }

  // A browser without dialog support can still enter the adventure normally.
  if (typeof dialog.showModal !== 'function') return;

  function rememberVisit() {
    try { localStorage.setItem(storageKey, '1'); } catch { /* Best effort. */ }
  }

  function finishIntro() {
    if (dismissed) return;
    dismissed = true;
    rememberVisit();
    video.pause();
    video.removeAttribute('src');
    video.load();
    dialog.close();
    document.documentElement.classList.remove('intro-is-open');
    if (replaying && replayButton) {
      replayButton.focus({ preventScroll: true });
      return;
    }
    const heading = document.getElementById('mapTitle');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
  }

  skip.addEventListener('click', finishIntro);
  dialog.addEventListener('cancel', event => {
    event.preventDefault();
  });

  function playVideo() {
    start.disabled = true;
    status.textContent = '';
    video.hidden = false;
    video.controls = true;
    // Load the MP4 only when Kate starts it, never on returning visits.
    if (!video.getAttribute('src')) {
      video.src = './Kates_November_Adventure_Video.mp4';
    }
    const playback = video.play();
    if (playback) playback.catch(() => {
      if (dismissed) return;
      welcome.hidden = false;
      video.hidden = true;
      start.disabled = false;
      status.textContent = 'Tap to try again, or choose Start to enter your adventure.';
      start.focus();
    });
    welcome.hidden = true;
    skip.focus();
  }

  start.addEventListener('click', playVideo);

  // The intro script runs before the map markup, so bind replay after parsing.
  document.addEventListener('DOMContentLoaded', () => {
    replayButton = document.getElementById('replayIntro');
    if (!replayButton) return;
    replayButton.addEventListener('click', () => {
      dismissed = false;
      replaying = true;
      skip.textContent = 'Close video';
      dialog.showModal();
      document.documentElement.classList.add('intro-is-open');
      playVideo();
    });
  });

  if (seen) return;

  dialog.showModal();
  document.documentElement.classList.add('intro-is-open');
  // Remember the first opening, including skipping or refreshing the welcome.
  rememberVisit();
  start.focus();
})();