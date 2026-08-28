import { quests, getQuest } from './data/quests.js';
import { getAdventureDay, formatAdventureDate } from './date.js';
import { loadCompleted, saveCompleted } from './storage.js';

const day = getAdventureDay();
const completed = loadCompleted();
let activeQuest = null;

const $ = selector => document.querySelector(selector);
const els = {
  mapView: $('#mapView'), sceneView: $('#sceneView'), mapWorld: $('#mapWorld'), fog: $('#fog'),
  fogRevealHoles: $('#fogRevealHoles'),
  markers: $('#questMarkers'), markerTemplate: $('#markerTemplate'), dayLabel: $('#dayLabel'),
  completedCount: $('#completedCount'), currentRegion: $('#currentRegion'), resetProgress: $('#resetProgress'), discoveryPercent: $('#discoveryPercent'), discoveryBar: $('#discoveryBar'),
  mapHint: $('#mapHint'), sceneStage: $('#sceneStage'), sceneArt: $('#sceneArt'), sceneOpenArt: $('#sceneOpenArt'), sceneRegion: $('#sceneRegion'),
  sceneTitle: $('#sceneTitle'), scenePrompt: $('#scenePrompt'), hotspot: $('#hotspot'), backButton: $('#backButton'),
  modal: $('#rewardModal'), rewardIcon: $('#rewardIcon'), rewardDay: $('#rewardDay'), rewardTitle: $('#rewardTitle'),
  rewardText: $('#rewardText'), rewardVoucher: $('#rewardVoucher'), rewardVoucherImage: $('#rewardVoucherImage'), closeReward: $('#closeReward'), returnButton: $('#returnButton'),
  letterOverlay: $('#letterOverlay'), letterImage: $('#letterImage'), closeLetter: $('#closeLetter')
};

function render() {
  const progress = Math.round((day / 30) * 100);
  els.dayLabel.textContent = formatAdventureDate(day);
  els.completedCount.textContent = quests.filter(quest => completed.has(quest.id)).length;
  els.currentRegion.textContent = quests.find(quest => quest.day === day)?.region ?? 'Awaiting November';
  els.discoveryPercent.textContent = `${progress}%`;
  els.discoveryBar.style.width = `${progress}%`;
  renderFog();
  els.mapHint.textContent = day === 0
    ? 'The path appears on November 1, 2026. Try ?day=12 while building.'
    : 'Choose any revealed golden marker to begin a quest.';
  renderMarkers();
}

function renderFog() {
  const svgNamespace = 'http://www.w3.org/2000/svg';
  els.fogRevealHoles.replaceChildren();

  quests.filter(quest => quest.day <= day).forEach(quest => {
    const reveal = document.createElementNS(svgNamespace, 'circle');
    reveal.setAttribute('cx', quest.mapPosition.x);
    reveal.setAttribute('cy', quest.mapPosition.y);
    reveal.setAttribute('r', quest.day === 1 ? 15 : 13);
    reveal.setAttribute('fill', 'black');
    reveal.classList.add('fog-reveal');
    if (quest.day === day) reveal.style.animationDelay = '180ms';
    els.fogRevealHoles.append(reveal);
  });

  els.fog.classList.toggle('is-cleared', day >= 30);
}

function renderMarkers() {
  els.markers.replaceChildren();
  quests.forEach(quest => {
    const unlocked = quest.day <= day;
    const done = completed.has(quest.id);
    const active = unlocked && quest.day === day && !done;
    const available = unlocked && !active && !done;
    const marker = els.markerTemplate.content.firstElementChild.cloneNode(true);
    marker.style.left = `${quest.mapPosition.x}%`;
    marker.style.top = `${quest.mapPosition.y}%`;
    marker.classList.toggle('is-locked', !unlocked);
    marker.classList.toggle('is-active', active);
    marker.classList.toggle('is-available', available);
    marker.classList.toggle('is-complete', done);
    marker.classList.toggle('is-final', quest.final);
    marker.querySelector('.marker-symbol').textContent = !unlocked ? '◆' : done ? '✓' : active ? '!' : '•';
    marker.querySelector('.marker-label').textContent = `Day ${quest.day} · ${quest.title}`;
    marker.setAttribute('aria-label', !unlocked
      ? `${quest.title}, unlocks November ${quest.day}`
      : `${quest.title}${done ? ', completed' : ', available'}`);
    marker.disabled = !unlocked;
    if (active) marker.setAttribute('aria-current', 'step');
    marker.addEventListener('click', () => enterQuest(quest.id));
    els.markers.append(marker);
  });
}

function enterQuest(id) {
  activeQuest = getQuest(id);
  if (!activeQuest) return;
  els.mapWorld.style.setProperty('--zoom-x', `${activeQuest.mapPosition.x}%`);
  els.mapWorld.style.setProperty('--zoom-y', `${activeQuest.mapPosition.y}%`);
  els.mapView.classList.add('is-departing');
  setTimeout(() => {
    els.sceneArt.src = activeQuest.sceneArt;
    els.sceneArt.alt = activeQuest.sceneAlt;
    els.sceneStage.classList.remove('is-object-opening', 'is-object-open');
    if (activeQuest.openSceneArt && activeQuest.revealBox) {
      const box = activeQuest.revealBox;
      els.sceneOpenArt.src = activeQuest.openSceneArt;
      els.sceneOpenArt.hidden = false;
      els.sceneStage.style.setProperty('--open-top', `${box.y}%`);
      els.sceneStage.style.setProperty('--open-right', `${100 - box.x - box.w}%`);
      els.sceneStage.style.setProperty('--open-bottom', `${100 - box.y - box.h}%`);
      els.sceneStage.style.setProperty('--open-left', `${box.x}%`);
      els.sceneStage.style.setProperty('--effect-x', `${box.x + box.w / 2}%`);
      els.sceneStage.style.setProperty('--effect-y', `${box.y + box.h / 2}%`);
    } else {
      els.sceneOpenArt.removeAttribute('src');
      els.sceneOpenArt.hidden = true;
    }
    els.sceneRegion.textContent = `Day ${activeQuest.day} · ${activeQuest.region}`;
    els.sceneTitle.textContent = activeQuest.title;
    els.scenePrompt.textContent = completed.has(activeQuest.id)
      ? 'You have already found this treasure. You can inspect it again.'
      : activeQuest.prompt;
    Object.assign(els.hotspot.style, {
      left: `${activeQuest.hotspot.x}%`, top: `${activeQuest.hotspot.y}%`,
      width: `${activeQuest.hotspot.w}%`, height: `${activeQuest.hotspot.h}%`
    });
    els.hotspot.querySelector('.hotspot-label').textContent = activeQuest.objectLabel;
    showView('scene');
    els.hotspot.focus({ preventScroll: true });
    els.mapView.classList.remove('is-departing');
  }, 520);
}

function showView(view) {
  const scene = view === 'scene';
  els.mapView.classList.toggle('is-active', !scene);
  els.sceneView.classList.toggle('is-active', scene);
  els.mapView.setAttribute('aria-hidden', String(scene));
  els.sceneView.setAttribute('aria-hidden', String(!scene));
}

function handleObjectInteraction() {
  if (!activeQuest) return;
  const hasOpenState = Boolean(activeQuest.openSceneArt && activeQuest.revealBox);
  const isAlreadyOpen = els.sceneStage.classList.contains('is-object-open');

  if (!hasOpenState || isAlreadyOpen) {
    showReward();
    return;
  }

  els.hotspot.disabled = true;
  els.sceneStage.classList.add('is-object-opening', 'is-object-open');
  window.setTimeout(() => {
    els.sceneStage.classList.remove('is-object-opening');
    if (activeQuest.letterArt) {
      showLetter();
    } else {
      els.hotspot.disabled = false;
      showReward();
    }
  }, activeQuest.letterArt ? 3000 : 2900);
}

function showLetter() {
  els.letterImage.src = activeQuest.letterArt;
  els.letterOverlay.classList.add('is-open');
  els.letterOverlay.setAttribute('aria-hidden', 'false');
  els.closeLetter.focus();
}

function closeLetter() {
  els.letterOverlay.classList.remove('is-open');
  els.letterOverlay.setAttribute('aria-hidden', 'true');
  els.hotspot.disabled = false;
  showReward();
}

function showReward() {
  if (!activeQuest) return;
  completed.add(activeQuest.id);
  saveCompleted(completed);
  els.rewardIcon.textContent = activeQuest.reward.icon;
  els.rewardDay.textContent = `Day ${activeQuest.day} reward`;
  els.rewardTitle.textContent = activeQuest.reward.title;
  els.rewardText.textContent = activeQuest.reward.text;
  els.rewardVoucher.href = activeQuest.reward.voucherUrl;
  els.rewardVoucherImage.src = activeQuest.reward.voucherImage;
  els.rewardVoucherImage.alt = activeQuest.reward.voucherAlt;
  els.modal.classList.add('is-open');
  els.modal.setAttribute('aria-hidden', 'false');
  els.returnButton.focus();
  render();
}

function closeReward(returnToMap = false) {
  els.modal.classList.remove('is-open');
  els.modal.setAttribute('aria-hidden', 'true');
  if (returnToMap) {
    showView('map');
    activeQuest = null;
    render();
    document.querySelector('.quest-marker.is-complete:not(:disabled)')?.focus();
  } else {
    els.hotspot.focus();
  }
}

function resetCompletionData() {
  if (!window.confirm('Reset all completed quests for testing?')) return;
  completed.clear();
  saveCompleted(completed);
  render();
  els.resetProgress.blur();
}
els.hotspot.addEventListener('click', handleObjectInteraction);
els.resetProgress.addEventListener('click', resetCompletionData);
els.closeLetter.addEventListener('click', closeLetter);
els.backButton.addEventListener('click', () => showView('map'));
els.closeReward.addEventListener('click', () => closeReward(false));
els.returnButton.addEventListener('click', () => closeReward(true));
els.modal.addEventListener('click', event => { if (event.target.classList.contains('modal-backdrop')) closeReward(false); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && els.modal.classList.contains('is-open')) closeReward(false); });

render();
