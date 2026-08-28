import { quests, getQuest } from './data/quests.js';
import { getAdventureDay, formatAdventureDate } from './date.js';
import { loadCompleted, saveCompleted } from './storage.js';

const day = getAdventureDay();
const completed = loadCompleted();
let activeQuest = null;
let journalPage = 0;
let journalImageIndex = 0;

// Add purchased codes here. A code is only shown after its matching quest is complete.
const voucherCodes = Object.fromEntries(quests.map(quest => [quest.day, 'Code to be added']));
const voucherGroups = [
  { title: 'Spa', from: 1, to: 1, image: 'assets/art/vouchers/voucher-spa.png' },
  { title: 'Amazon', from: 2, to: 8, image: 'assets/art/vouchers/voucher-amazon.png' },
  { title: 'MODIVO / CCC', from: 9, to: 15, image: 'assets/art/vouchers/voucher-ccc.png' },
  { title: 'Morele', from: 16, to: 22, image: 'assets/art/vouchers/voucher-morele.png' },
  { title: 'Steam', from: 23, to: 29, image: 'assets/art/vouchers/voucher-steam.png' },
  { title: 'Wild Horse Fund', from: 30, to: 30, image: 'assets/art/vouchers/voucher-cwhf.png' }
];

const $ = selector => document.querySelector(selector);
const els = {
  mapView: $('#mapView'), sceneView: $('#sceneView'), mapWorld: $('#mapWorld'), fog: $('#fog'),
  fogRevealHoles: $('#fogRevealHoles'),
  markers: $('#questMarkers'), markerTemplate: $('#markerTemplate'), dayLabel: $('#dayLabel'),
  completedCount: $('#completedCount'), currentRegion: $('#currentRegion'), resetProgress: $('#resetProgress'), discoveryPercent: $('#discoveryPercent'), discoveryBar: $('#discoveryBar'),
  mapHint: $('#mapHint'), sceneStage: $('#sceneStage'), sceneArt: $('#sceneArt'), sceneOpenArt: $('#sceneOpenArt'), sceneRegion: $('#sceneRegion'),
  sceneTitle: $('#sceneTitle'), scenePrompt: $('#scenePrompt'), hotspot: $('#hotspot'), easterEggHotspot: $('#easterEggHotspot'), backButton: $('#backButton'),
  modal: $('#rewardModal'), rewardIcon: $('#rewardIcon'), rewardDay: $('#rewardDay'), rewardTitle: $('#rewardTitle'),
  rewardText: $('#rewardText'), rewardVoucher: $('#rewardVoucher'), rewardVoucherImage: $('#rewardVoucherImage'), closeReward: $('#closeReward'), returnButton: $('#returnButton'),
  letterOverlay: $('#letterOverlay'), letterImage: $('#letterImage'), closeLetter: $('#closeLetter'),
  openJournal: $('#openJournal'), journalOverlay: $('#journalOverlay'), closeJournal: $('#closeJournal'),
  journalPage: $('#journalPage'), journalPageLabel: $('#journalPageLabel'), journalPrevious: $('#journalPrevious'), journalNext: $('#journalNext'),
  parchmentOverlay: $('#parchmentOverlay'), parchmentTitle: $('#parchmentTitle'), parchmentCodes: $('#parchmentCodes'), closeParchment: $('#closeParchment'),
  imageOverlay: $('#imageOverlay'), journalFullImage: $('#journalFullImage'), imageViewerTitle: $('#imageViewerTitle'), closeImageViewer: $('#closeImageViewer'),
  previousJournalImage: $('#previousJournalImage'), nextJournalImage: $('#nextJournalImage')
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
    els.easterEggHotspot.classList.remove('is-available');
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
    if (activeQuest.easterEggArt && activeQuest.easterEggHotspot) {
      Object.assign(els.easterEggHotspot.style, {
        left: `${activeQuest.easterEggHotspot.x}%`, top: `${activeQuest.easterEggHotspot.y}%`,
        width: `${activeQuest.easterEggHotspot.w}%`, height: `${activeQuest.easterEggHotspot.h}%`
      });
      els.easterEggHotspot.classList.add('is-available');
    }
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

function revealEasterEgg() {
  if (!activeQuest?.easterEggArt || !els.sceneStage.classList.contains('is-object-open')) return;
  els.sceneOpenArt.src = activeQuest.easterEggArt;
  els.easterEggHotspot.classList.remove('is-available');
}

function handleSceneEasterEggClick(event) {
  if (!activeQuest?.easterEggArt || activeQuest.day !== 30 || !els.sceneStage.classList.contains('is-object-open')) return;
  if (!els.sceneStage.contains(event.target)) return;
  if (event.target.closest('#hotspot, #easterEggHotspot')) return;
  revealEasterEgg();
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

function setOverlay(overlay, open) {
  overlay.classList.toggle('is-open', open);
  overlay.setAttribute('aria-hidden', String(!open));
}

function renderJournal() {
  els.journalPage.replaceChildren();
  els.journalPrevious.disabled = journalPage === 0;
  els.journalNext.disabled = journalPage === 5;
  els.journalPageLabel.textContent = journalPage === 0 ? 'Page 1 of 6 · Voucher collection' : `Page ${journalPage + 1} of 6 · Days ${(journalPage - 1) * 6 + 1}–${journalPage * 6}`;
  const grid = document.createElement('div');
  grid.className = 'journal-grid';

  if (journalPage === 0) {
    voucherGroups.forEach(group => {
      const groupQuests = quests.filter(quest => quest.day >= group.from && quest.day <= group.to);
      const found = groupQuests.filter(quest => completed.has(quest.id)).length;
      const tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'journal-tile voucher-tile';
      tile.setAttribute('aria-label', `${group.title}: ${found} of ${groupQuests.length} rewards found`);
      tile.innerHTML = `<img src="${group.image}" alt="${group.title} voucher"><span class="voucher-progress">${found}/${groupQuests.length}</span><span class="journal-tile-caption">${group.title}</span>`;
      tile.addEventListener('click', () => openVoucherParchment(group));
      grid.append(tile);
    });
  } else {
    quests.slice((journalPage - 1) * 6, journalPage * 6).forEach(quest => {
      const unlocked = completed.has(quest.id);
      const tile = document.createElement('button');
      tile.type = 'button';
      tile.className = `journal-tile${unlocked ? '' : ' is-locked'}`;
      tile.disabled = !unlocked;
      tile.setAttribute('aria-label', unlocked ? `View Day ${quest.day}: ${quest.title}` : `Day ${quest.day}, not yet discovered`);
      tile.innerHTML = `<img src="${quest.openSceneArt || quest.sceneArt}" alt=""><span class="journal-tile-caption">Day ${quest.day} · ${quest.title}</span>${unlocked ? '' : `<span class="journal-lock">${quest.day}<small>Not yet discovered</small></span>`}`;
      if (unlocked) tile.addEventListener('click', () => openJournalImage(quest));
      grid.append(tile);
    });
  }
  els.journalPage.append(grid);
}

function openJournal() {
  renderJournal();
  setOverlay(els.journalOverlay, true);
  els.closeJournal.focus();
}

function closeJournal() {
  setOverlay(els.journalOverlay, false);
  els.openJournal.focus();
}

function changeJournalPage(change) {
  journalPage = Math.max(0, Math.min(5, journalPage + change));
  renderJournal();
}

function openVoucherParchment(group) {
  els.parchmentTitle.textContent = group.title;
  els.parchmentCodes.replaceChildren();
  quests.filter(quest => quest.day >= group.from && quest.day <= group.to).forEach(quest => {
    const unlocked = completed.has(quest.id);
    const row = document.createElement('div');
    row.className = 'code-row';
    const code = voucherCodes[quest.day];
    row.innerHTML = `<strong>Day ${quest.day}</strong><span class="code-value${unlocked ? '' : ' is-locked'}">${unlocked ? code : '••••••••••••'}</span><button class="copy-code" type="button" ${unlocked ? '' : 'disabled'}>${unlocked ? 'Copy' : 'Locked'}</button>`;
    if (unlocked) row.querySelector('button').addEventListener('click', async event => {
      await navigator.clipboard?.writeText(code);
      event.currentTarget.textContent = 'Copied';
      window.setTimeout(() => { event.currentTarget.textContent = 'Copy'; }, 1200);
    });
    els.parchmentCodes.append(row);
  });
  setOverlay(els.parchmentOverlay, true);
  els.closeParchment.focus();
}

function completedGallery() {
  return quests.filter(quest => completed.has(quest.id));
}

function openJournalImage(quest) {
  const gallery = completedGallery();
  journalImageIndex = Math.max(0, gallery.findIndex(item => item.id === quest.id));
  renderJournalImage();
  setOverlay(els.imageOverlay, true);
  els.closeImageViewer.focus();
}

function renderJournalImage() {
  const gallery = completedGallery();
  if (!gallery.length) return;
  journalImageIndex = (journalImageIndex + gallery.length) % gallery.length;
  const quest = gallery[journalImageIndex];
  els.journalFullImage.src = quest.openSceneArt || quest.sceneArt;
  els.journalFullImage.alt = quest.sceneAlt;
  els.imageViewerTitle.textContent = `Day ${quest.day} · ${quest.title}`;
  const multiple = gallery.length > 1;
  els.previousJournalImage.hidden = !multiple;
  els.nextJournalImage.hidden = !multiple;
}

function changeJournalImage(change) {
  journalImageIndex += change;
  renderJournalImage();
}

function resetCompletionData() {
  if (!window.confirm('Reset all completed quests for testing?')) return;
  completed.clear();
  saveCompleted(completed);
  render();
  els.resetProgress.blur();
}
els.hotspot.addEventListener('click', handleObjectInteraction);
els.easterEggHotspot.addEventListener('click', revealEasterEgg);
document.addEventListener('click', handleSceneEasterEggClick, true);
els.openJournal.addEventListener('click', openJournal);
els.closeJournal.addEventListener('click', closeJournal);
els.journalPrevious.addEventListener('click', () => changeJournalPage(-1));
els.journalNext.addEventListener('click', () => changeJournalPage(1));
els.journalOverlay.querySelector('[data-close-journal]').addEventListener('click', closeJournal);
els.closeParchment.addEventListener('click', () => setOverlay(els.parchmentOverlay, false));
els.parchmentOverlay.querySelector('[data-close-parchment]').addEventListener('click', () => setOverlay(els.parchmentOverlay, false));
els.closeImageViewer.addEventListener('click', () => setOverlay(els.imageOverlay, false));
els.imageOverlay.querySelector('[data-close-image]').addEventListener('click', () => setOverlay(els.imageOverlay, false));
els.previousJournalImage.addEventListener('click', () => changeJournalImage(-1));
els.nextJournalImage.addEventListener('click', () => changeJournalImage(1));
els.resetProgress.addEventListener('click', resetCompletionData);
els.closeLetter.addEventListener('click', closeLetter);
els.backButton.addEventListener('click', () => showView('map'));
els.closeReward.addEventListener('click', () => closeReward(false));
els.returnButton.addEventListener('click', () => closeReward(true));
els.modal.addEventListener('click', event => { if (event.target.classList.contains('modal-backdrop')) closeReward(false); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && els.imageOverlay.classList.contains('is-open')) setOverlay(els.imageOverlay, false);
  else if (event.key === 'Escape' && els.parchmentOverlay.classList.contains('is-open')) setOverlay(els.parchmentOverlay, false);
  else if (event.key === 'Escape' && els.journalOverlay.classList.contains('is-open')) closeJournal();
  else if (event.key === 'Escape' && els.modal.classList.contains('is-open')) closeReward(false);
  else if (els.imageOverlay.classList.contains('is-open') && event.key === 'ArrowLeft') changeJournalImage(-1);
  else if (els.imageOverlay.classList.contains('is-open') && event.key === 'ArrowRight') changeJournalImage(1);
  else if (els.journalOverlay.classList.contains('is-open') && event.key === 'ArrowLeft') changeJournalPage(-1);
  else if (els.journalOverlay.classList.contains('is-open') && event.key === 'ArrowRight') changeJournalPage(1);
});

render();
