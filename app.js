import { Viewer } from '@photo-sphere-viewer/core';
import { VideoPlugin } from '@photo-sphere-viewer/video-plugin';
import { EquirectangularVideoAdapter } from '@photo-sphere-viewer/equirectangular-video-adapter';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import { GyroscopePlugin } from '@photo-sphere-viewer/gyroscope-plugin';
import scenes from './scenes.js';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

// Photo Sphere Viewer accepts angles as radians (number) or degrees
// ("45deg" string). scenes.js is authored in plain degrees for
// readability, so this converts them at the boundary.
const deg = (n) => `${n ?? 0}deg`;

const leafPinSVG = `
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 21c-4.4-2.4-7-6.2-7-10.4C5 6 8.1 3 12 3s7 3 7 7.6c0 4.2-2.6 8-7 10.4z" fill="#3f7a4f" stroke="#eafff0" stroke-width="1.2"/>
    <path d="M12 17.5V7.5M12 10.5c1.6-1.6 2.6-2 4-2M12 14c-1.6-1.6-2.6-2-4-2" stroke="#eafff0" stroke-width="1.1" stroke-linecap="round"/>
  </svg>
`;

function markerHtml() {
  return `<div class="map-pin">${leafPinSVG}</div>`;
}

/* ------------------------------------------------------------------ */
/* Element references                                                 */
/* ------------------------------------------------------------------ */

const els = {
  sceneTitle: document.getElementById('scene-title'),
  progressCurrent: document.getElementById('progress-current'),
  progressTotal: document.getElementById('progress-total'),
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
let currentIndex = 0;
let isTransitioning = false;

els.progressTotal.textContent = String(scenes.length);

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
    ],
  });

  videoPlugin = viewer.getPlugin(VideoPlugin);
  markersPlugin = viewer.getPlugin(MarkersPlugin);
  gyroPlugin = viewer.getPlugin(GyroscopePlugin);

  videoPlugin.addEventListener('play-pause', ({ playing }) => {
    setPlayPauseIcon(playing);
  });

  markersPlugin.addEventListener('select-marker', ({ marker }) => {
    openPopup(marker.data);
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

function updateTopBar(scene) {
  els.sceneTitle.textContent = scene.title;
  els.progressCurrent.textContent = String(currentIndex + 1);
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
}

els.popupClose.addEventListener('click', closePopup);
els.popupBackdrop.addEventListener('click', closePopup);

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
/* Boot                                                                */
/* ------------------------------------------------------------------ */

goToScene(0);
