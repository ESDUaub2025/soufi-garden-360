import { Viewer } from '@photo-sphere-viewer/core';
import { VideoPlugin } from '@photo-sphere-viewer/video-plugin';
import { EquirectangularVideoAdapter } from '@photo-sphere-viewer/equirectangular-video-adapter';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import { GyroscopePlugin } from '@photo-sphere-viewer/gyroscope-plugin';
import { MapPlugin } from '@photo-sphere-viewer/map-plugin';
import scenes, { mapImage, mapHotspots } from './scenes.js';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

// Photo Sphere Viewer accepts angles as radians (number) or degrees
// ("45deg" string). scenes.js is authored in plain degrees for
// readability, so this converts them at the boundary.
const deg = (n) => `${n ?? 0}deg`;

const leafPinSVG = `
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 21c-4.4-2.4-7-6.2-7-10.4C5 6 8.1 3 12 3s7 3 7 7.6c0 4.2-2.6 8-7 10.4z" fill="#3f9c86" stroke="#eafaf4" stroke-width="1.2"/>
    <path d="M12 17.5V7.5M12 10.5c1.6-1.6 2.6-2 4-2M12 14c-1.6-1.6-2.6-2-4-2" stroke="#eafaf4" stroke-width="1.1" stroke-linecap="round"/>
  </svg>
`;

function markerHtml() {
  return `<div class="map-pin">${leafPinSVG}</div>`;
}

/* ------------------------------------------------------------------ */
/* Element references                                                 */
/* ------------------------------------------------------------------ */

const els = {
  app: document.getElementById('app'),
  mapView: document.getElementById('map-view'),
  mapScroll: document.getElementById('map-scroll'),
  mapCanvas: document.getElementById('map-canvas'),
  mapImg: document.getElementById('map-img'),
  mapZoomIn: document.getElementById('map-zoom-in'),
  mapZoomOut: document.getElementById('map-zoom-out'),
  mapTooltip: document.getElementById('map-tooltip'),
  mapTooltipThumbWrap: document.getElementById('map-tooltip-thumb-wrap'),
  mapTooltipThumb: document.getElementById('map-tooltip-thumb'),
  mapTooltipName: document.getElementById('map-tooltip-name'),
  mapTooltipDesc: document.getElementById('map-tooltip-desc'),
  mapTooltipNote: document.getElementById('map-tooltip-note'),
  mapTooltipEnter: document.getElementById('map-tooltip-enter'),
  btnMap: document.getElementById('btn-map'),
  miniPopup: document.getElementById('marker-mini-popup'),
  miniPopupTitle: document.getElementById('marker-mini-title'),
  sceneTitle: document.getElementById('scene-title'),
  progressCurrent: document.getElementById('progress-current'),
  progressTotal: document.getElementById('progress-total'),
  progressDots: document.getElementById('progress-dots'),
  viewer: document.getElementById('viewer'),
  loadingOverlay: document.getElementById('loading-overlay'),
  loadingText: document.getElementById('loading-text'),
  gyroPrompt: document.getElementById('gyro-prompt'),
  popupBackdrop: document.getElementById('popup-backdrop'),
  popupCard: document.getElementById('popup-card'),
  popupClose: document.getElementById('popup-close'),
  popupImageWrap: document.getElementById('popup-image-wrap'),
  popupImage: document.getElementById('popup-image'),
  popupTitle: document.getElementById('popup-title'),
  popupDescription: document.getElementById('popup-description'),
  btnPrev: document.getElementById('btn-prev'),
  btnNext: document.getElementById('btn-next'),
  btnReset: document.getElementById('btn-reset'),
  btnPlayPause: document.getElementById('btn-playpause'),
  iconPlay: document.getElementById('icon-play'),
  iconPause: document.getElementById('icon-pause'),
};

/* ------------------------------------------------------------------ */
/* State                                                              */
/* ------------------------------------------------------------------ */

let viewer = null;
let markersPlugin = null;
let videoPlugin = null;
let gyroPlugin = null;
let mapPlugin = null;
let currentIndex = 0;
let isTransitioning = false;
let popupOpen = false;
let activeMiniMarkerId = null;

els.progressTotal.textContent = String(scenes.length);
buildProgressDots();

/* ------------------------------------------------------------------ */
/* Viewer bootstrap                                                    */
/* ------------------------------------------------------------------ */

function createViewer(firstScene) {
  viewer = new Viewer({
    container: els.viewer,
    adapter: EquirectangularVideoAdapter,
    panorama: { source: firstScene.video },
    defaultYaw: deg(firstScene.startYaw),
    defaultPitch: deg(firstScene.startPitch),
    navbar: false,
    mousewheel: true,
    plugins: [
      VideoPlugin.withConfig({
        progressbar: false,
        bigbutton: false,
      }),
      MarkersPlugin,
      GyroscopePlugin,
      MapPlugin.withConfig({
        imageUrl: mapImage,
        center: firstScene.mapPosition,
        size: '170px',
        position: 'bottom left',
        hotspots: buildHotspots(),
      }),
    ],
  });

  videoPlugin = viewer.getPlugin(VideoPlugin);
  markersPlugin = viewer.getPlugin(MarkersPlugin);
  gyroPlugin = viewer.getPlugin(GyroscopePlugin);
  mapPlugin = viewer.getPlugin(MapPlugin);

  videoPlugin.addEventListener('play-pause', ({ playing }) => {
    setPlayPauseIcon(playing);
  });

  // First click on a marker: small popup anchored above the pin.
  // Second click on that same (already-mini-popped) marker: full popup.
  markersPlugin.addEventListener('select-marker', ({ marker }) => {
    if (activeMiniMarkerId === marker.id) {
      hideMiniPopup();
      openPopup(marker.data);
      return;
    }
    const pos = marker.state.position2D;
    if (!pos) {
      // Marker isn't currently on-screen enough to anchor a mini popup
      // to (shouldn't normally happen right after a click) — fall back
      // to the full popup so the click still does something useful.
      openPopup(marker.data);
      return;
    }
    activeMiniMarkerId = marker.id;
    showMiniPopup(marker.data.title, pos);
  });

  mapPlugin.addEventListener('select-hotspot', ({ hotspotId }) => {
    const index = scenes.findIndex((s) => s.id === hotspotId);
    if (index !== -1 && index !== currentIndex) goToScene(index);
  });

  viewer.addEventListener(
    'ready',
    () => {
      setMarkersForScene(firstScene);
      hideLoading();
      checkGyroscopeSupport();
    },
    { once: true }
  );
}

function buildHotspots() {
  return scenes.map((s) => ({
    id: s.id,
    x: s.mapPosition.x,
    y: s.mapPosition.y,
    tooltip: s.title,
  }));
}

function setMarkersForScene(scene) {
  markersPlugin.setMarkers(
    scene.labels.map((label, i) => ({
      id: `${scene.id}-marker-${i}`,
      position: { yaw: deg(label.yaw), pitch: deg(label.pitch) },
      html: markerHtml(),
      size: { width: 36, height: 44 },
      anchor: 'bottom center',
      tooltip: label.title,
      data: label,
    }))
  );
}

/* ------------------------------------------------------------------ */
/* Scene navigation                                                    */
/* ------------------------------------------------------------------ */

function buildProgressDots() {
  els.progressDots.innerHTML = '';
  scenes.forEach(() => els.progressDots.appendChild(document.createElement('i')));
}

function updateProgressDots() {
  [...els.progressDots.children].forEach((dot, i) => {
    dot.classList.toggle('on', i === currentIndex);
  });
}

function updateTopBar(scene) {
  els.sceneTitle.textContent = scene.title;
  els.progressCurrent.textContent = String(currentIndex + 1);
  updateProgressDots();
}

function updateNavButtons() {
  els.btnPrev.disabled = currentIndex === 0 || isTransitioning;
  els.btnNext.disabled = currentIndex === scenes.length - 1 || isTransitioning;
}

function showLoading(text) {
  els.loadingText.textContent = text;
  els.loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
  els.loadingOverlay.classList.add('hidden');
}

function setPlayPauseIcon(playing) {
  els.iconPlay.classList.toggle('hidden', playing);
  els.iconPause.classList.toggle('hidden', !playing);
}

function goToScene(index) {
  if (index < 0 || index >= scenes.length || isTransitioning) return;

  const scene = scenes[index];
  currentIndex = index;
  isTransitioning = true;

  updateTopBar(scene);
  updateNavButtons();
  closePopup();
  hideMiniPopup();
  showLoading(`Loading ${scene.title}…`);
  setPlayPauseIcon(false);

  if (!viewer) {
    createViewer(scene);
    isTransitioning = false;
    updateNavButtons();
    return;
  }

  viewer
    .setPanorama(
      { source: scene.video },
      {
        position: { yaw: deg(scene.startYaw), pitch: deg(scene.startPitch) },
        transition: { effect: 'fade', speed: 600 },
      }
    )
    .then(() => {
      setMarkersForScene(scene);
      if (mapPlugin) mapPlugin.setCenter(scene.mapPosition);
      hideLoading();
    })
    .catch((err) => {
      console.error('Failed to load scene', scene.id, err);
      showLoading(`Could not load "${scene.title}". Check the file exists in /videos/.`);
    })
    .finally(() => {
      isTransitioning = false;
      updateNavButtons();
    });
}

/* ------------------------------------------------------------------ */
/* Controls                                                            */
/* ------------------------------------------------------------------ */

els.btnPrev.addEventListener('click', () => goToScene(currentIndex - 1));
els.btnNext.addEventListener('click', () => goToScene(currentIndex + 1));

els.btnPlayPause.addEventListener('click', () => {
  if (videoPlugin) videoPlugin.playPause();
});

els.btnReset.addEventListener('click', () => {
  if (!viewer) return;
  const scene = scenes[currentIndex];
  viewer.animate({
    yaw: deg(scene.startYaw),
    pitch: deg(scene.startPitch),
    zoom: 50,
    speed: '2rpm',
  });
});

/* ------------------------------------------------------------------ */
/* Popup card                                                          */
/* ------------------------------------------------------------------ */

function openPopup(label) {
  popupOpen = true;
  wakeChrome();

  els.popupTitle.textContent = label.title;
  els.popupDescription.textContent = label.description;

  if (label.image) {
    els.popupImage.src = label.image;
    els.popupImage.alt = label.title;
    els.popupImageWrap.classList.remove('hidden');
  } else {
    els.popupImageWrap.classList.add('hidden');
    els.popupImage.removeAttribute('src');
  }

  els.popupBackdrop.classList.remove('hidden');
  els.popupCard.classList.remove('hidden');
  // rAF so the "hidden -> visible" class swap animates from the closed state
  requestAnimationFrame(() => {
    els.popupBackdrop.classList.add('is-open');
    els.popupCard.classList.add('is-open');
  });
}

function closePopup() {
  els.popupBackdrop.classList.remove('is-open');
  els.popupCard.classList.remove('is-open');
  setTimeout(() => {
    els.popupBackdrop.classList.add('hidden');
    els.popupCard.classList.add('hidden');
  }, 200);

  popupOpen = false;
  wakeChrome();
}

els.popupClose.addEventListener('click', closePopup);
els.popupBackdrop.addEventListener('click', closePopup);

/* ------------------------------------------------------------------ */
/* Marker mini-popup (first tap on an in-sphere pin)                   */
/* ------------------------------------------------------------------ */

function showMiniPopup(title, pos) {
  els.miniPopupTitle.textContent = title;
  els.miniPopup.style.left = `${pos.x}px`;
  els.miniPopup.style.top = `${pos.y}px`;
  els.miniPopup.classList.remove('hidden');
  requestAnimationFrame(() => els.miniPopup.classList.add('visible'));
}

function hideMiniPopup() {
  activeMiniMarkerId = null;
  els.miniPopup.classList.remove('visible');
  setTimeout(() => els.miniPopup.classList.add('hidden'), 150);
}

// Dragging the sphere to look around should dismiss an open mini popup
// (it's anchored to a screen point, not the marker itself, so it would
// otherwise drift away from the pin). A plain click/tap has near-zero
// movement, so this only fires for real drags — it won't interfere with
// clicking the same marker again to open the full popup.
let viewerPointerDownAt = null;
els.viewer.addEventListener('pointerdown', (e) => {
  viewerPointerDownAt = { x: e.clientX, y: e.clientY };
});
els.viewer.addEventListener('pointerup', (e) => {
  if (!viewerPointerDownAt) return;
  const dragged =
    Math.abs(e.clientX - viewerPointerDownAt.x) > 6 || Math.abs(e.clientY - viewerPointerDownAt.y) > 6;
  viewerPointerDownAt = null;
  if (dragged && activeMiniMarkerId !== null) hideMiniPopup();
});

/* ------------------------------------------------------------------ */
/* Gyroscope / tilt-to-look (mobile)                                   */
/* ------------------------------------------------------------------ */

function checkGyroscopeSupport() {
  gyroPlugin.isSupported().then((supported) => {
    if (supported && !gyroPlugin.isEnabled()) {
      els.gyroPrompt.classList.remove('hidden');
    }
  });
}

els.gyroPrompt.addEventListener('click', () => {
  gyroPlugin
    .start()
    .then(() => {
      els.gyroPrompt.classList.add('hidden');
    })
    .catch((err) => {
      console.warn('Gyroscope permission denied or unavailable', err);
      els.gyroPrompt.textContent = 'Tilt controls unavailable';
      setTimeout(() => els.gyroPrompt.classList.add('hidden'), 1800);
    });
});

/* ------------------------------------------------------------------ */
/* Landing map (full-screen entry point)                               */
/* ------------------------------------------------------------------ */

// Natural pixel size of map/sioufi-garden-map.svg (its width/height attrs).
// Pins are placed with % left/top = spot.x / MAP_NATURAL_WIDTH * 100, so
// they stay correctly placed at any zoom level with no per-zoom recompute.
const MAP_NATURAL_WIDTH = 3112;
const MAP_NATURAL_HEIGHT = 2523;

const leafPinIconSVG = (fill) => `
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 21c-4.4-2.4-7-6.2-7-10.4C5 6 8.1 3 12 3s7 3 7 7.6c0 4.2-2.6 8-7 10.4z" fill="${fill}" stroke="#eafaf4" stroke-width="1.2"/>
    <path d="M12 17.5V7.5M12 10.5c1.6-1.6 2.6-2 4-2M12 14c-1.6-1.6-2.6-2-4-2" stroke="#eafaf4" stroke-width="1.1" stroke-linecap="round"/>
  </svg>
`;

let mapWidthPx = 1900;

function initMapView() {
  buildMapPins();
  fitMapToContainer();
  wireMapPanZoom();

  // The SVG map has explicit width/height attributes so layout is correct
  // immediately, but re-fit once more after full load as a safety net
  // (covers the case where the image is still loading on first paint).
  if (els.mapImg.complete) {
    fitMapToContainer();
  } else {
    els.mapImg.addEventListener('load', fitMapToContainer, { once: true });
  }
  window.addEventListener('resize', fitMapToContainer);
}

// ---------------------------------------------------------------------
// HOW TO ADD OR MOVE A PIN
// Pins come entirely from `mapHotspots` in scenes.js — there is nothing
// pin-specific to edit here. To add a new pin: add an entry to
// mapHotspots with a unique id, name, desc, x/y (pixel position on
// map/sioufi-garden-map.svg), and sceneIndex (the index of its matching
// entry in the `scenes` array, or `null` if there's no footage yet).
// To move a pin, just change its x/y. To link footage to an existing
// "coming soon" pin, add a scene to `scenes` and set that pin's
// sceneIndex to its array index.
// ---------------------------------------------------------------------
function buildMapPins() {
  mapHotspots.forEach((spot) => {
    const hasScene = spot.sceneIndex !== null && spot.sceneIndex !== undefined;

    const pin = document.createElement('button');
    pin.type = 'button';
    pin.className = hasScene ? 'tour-pin' : 'tour-pin tour-pin--ghost';
    pin.style.left = `${(spot.x / MAP_NATURAL_WIDTH) * 100}%`;
    pin.style.top = `${(spot.y / MAP_NATURAL_HEIGHT) * 100}%`;
    pin.setAttribute('aria-label', spot.name);
    pin.innerHTML = leafPinIconSVG(hasScene ? '#3f9c86' : '#9fb3ac');

    pin.addEventListener('click', (e) => {
      e.stopPropagation();
      showMapTooltip(spot, pin);
    });

    els.mapCanvas.appendChild(pin);
  });
}

function showMapTooltip(spot, pinEl) {
  els.mapTooltipName.textContent = spot.name;
  els.mapTooltipDesc.textContent = spot.desc;
  els.mapTooltipNote.textContent = spot.note || '';

  const hasScene = spot.sceneIndex !== null && spot.sceneIndex !== undefined;
  if (hasScene) {
    els.mapTooltipEnter.classList.remove('hidden');
    els.mapTooltipEnter.onclick = () => enterScene(spot.sceneIndex);
    els.mapTooltipThumb.src = `images/thumbs/hotspot-${spot.id}.jpg`;
    els.mapTooltipThumb.alt = spot.name;
    els.mapTooltipThumbWrap.classList.remove('hidden');
  } else {
    els.mapTooltipEnter.classList.add('hidden');
    els.mapTooltipEnter.onclick = null;
    els.mapTooltipThumbWrap.classList.add('hidden');
    els.mapTooltipThumb.removeAttribute('src');
  }

  els.mapTooltip.classList.remove('hidden');
  els.mapTooltip.classList.add('visible');
  positionMapTooltip(pinEl);
}

function hideMapTooltip() {
  els.mapTooltip.classList.remove('visible');
}

function positionMapTooltip(pinEl) {
  const r = pinEl.getBoundingClientRect();
  const tw = els.mapTooltip.offsetWidth || 260;
  const x = r.left + r.width / 2;
  const y = r.top - 10;
  els.mapTooltip.style.left = `${Math.min(Math.max(8, x - tw / 2), window.innerWidth - tw - 8)}px`;
  let top = y - els.mapTooltip.offsetHeight;
  if (top < 8) top = r.bottom + 10;
  els.mapTooltip.style.top = `${top}px`;
}

document.addEventListener('click', hideMapTooltip);

function applyMapWidth() {
  els.mapCanvas.style.width = `${mapWidthPx}px`;
}

function fitMapToContainer() {
  if (!els.app.classList.contains('mode-map')) return;
  const svgAspect = MAP_NATURAL_WIDTH / MAP_NATURAL_HEIGHT;
  const cw = els.mapScroll.clientWidth - 4;
  const ch = els.mapScroll.clientHeight - 4;
  if (cw < 10 || ch < 10) return;
  mapWidthPx = Math.max(700, Math.min(cw, ch * svgAspect));
  applyMapWidth();
  els.mapScroll.scrollLeft = (els.mapCanvas.scrollWidth - els.mapScroll.clientWidth) / 2;
  els.mapScroll.scrollTop = (els.mapCanvas.scrollHeight - els.mapScroll.clientHeight) / 2;
}

function wireMapPanZoom() {
  els.mapZoomIn.addEventListener('click', () => {
    mapWidthPx = Math.min(mapWidthPx * 1.28, 6000);
    applyMapWidth();
  });
  els.mapZoomOut.addEventListener('click', () => {
    mapWidthPx = Math.max(mapWidthPx / 1.28, 700);
    applyMapWidth();
  });

  let isDown = false;
  let didDrag = false;
  let startX = 0;
  let startY = 0;
  let scrollLeft = 0;
  let scrollTop = 0;

  els.mapScroll.addEventListener('mousedown', (e) => {
    isDown = true;
    didDrag = false;
    els.mapScroll.classList.add('dragging');
    startX = e.pageX;
    startY = e.pageY;
    scrollLeft = els.mapScroll.scrollLeft;
    scrollTop = els.mapScroll.scrollTop;
  });
  window.addEventListener('mouseup', () => {
    isDown = false;
    els.mapScroll.classList.remove('dragging');
  });
  els.mapScroll.addEventListener('mouseleave', () => {
    isDown = false;
    els.mapScroll.classList.remove('dragging');
  });
  els.mapScroll.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    // Small movements shouldn't count as a drag, so a plain click on a
    // pin isn't swallowed by the pan handler.
    if (Math.abs(e.pageX - startX) > 3 || Math.abs(e.pageY - startY) > 3) didDrag = true;
    els.mapScroll.scrollLeft = scrollLeft - (e.pageX - startX);
    els.mapScroll.scrollTop = scrollTop - (e.pageY - startY);
  });
  // Prevent the drag-to-pan gesture from also registering as a background
  // click that immediately closes the tooltip you just dragged past.
  els.mapScroll.addEventListener('click', (e) => {
    if (didDrag) e.stopPropagation();
  });
}

function enterScene(index) {
  hideMapTooltip();
  els.app.classList.remove('mode-map');
  wakeChrome();
  goToScene(index);
}

function backToMap() {
  if (videoPlugin) videoPlugin.pause();
  setPlayPauseIcon(false);
  closePopup();
  hideMiniPopup();
  els.app.classList.add('mode-map');
  fitMapToContainer();
}

els.btnMap.addEventListener('click', backToMap);

/* ------------------------------------------------------------------ */
/* Auto-hiding chrome (immersive mode)                                 */
/* ------------------------------------------------------------------ */

// Chrome (top bar, controls, gyro prompt) fades away after a few seconds
// of inactivity so the 360° view can be enjoyed edge-to-edge, and reappears
// on the next interaction. Paused entirely while the popup card is open so
// visitors always have a visible way to close it.
const IDLE_DELAY = 4000;
let idleTimer = null;

function scheduleIdle() {
  clearTimeout(idleTimer);
  if (popupOpen) return;
  idleTimer = setTimeout(() => {
    els.app.classList.add('chrome-idle');
  }, IDLE_DELAY);
}

function wakeChrome() {
  els.app.classList.remove('chrome-idle');
  scheduleIdle();
}

['pointerdown', 'pointermove', 'wheel', 'keydown'].forEach((evt) => {
  window.addEventListener(evt, wakeChrome, { passive: true });
});

/* ------------------------------------------------------------------ */
/* Boot                                                                */
/* ------------------------------------------------------------------ */

initMapView();
