/**
 * Sioufi Garden 360 — scene + map configuration
 * ------------------------------------------------
 * Content is correlated from real footage against the real park map
 * (source: official As-Built & Execution Landscape Drawings, sheets
 * L-003/L-005/L-006/L-008). See map/README.md for how this was derived
 * and what still needs on-site confirmation.
 *
 * - `mapImage`      the real site map (SVG), used both as the full-screen
 *                    landing map and the in-tour minimap.
 * - `mapHotspots`    every point plotted on the source map (20 total).
 *                    Points with a `sceneIndex` open a 360° clip; points
 *                    with `sceneIndex: null` are plotted but have no
 *                    footage yet — they render as muted "coming soon"
 *                    pins on the landing map so new clips can be wired
 *                    up later just by adding a scene and filling this in.
 * - `scenes`         the 10 filmed clips, in tour order. `hotspotId`
 *                    links each one back to its entry in `mapHotspots`.
 */

export const mapImage = "map/sioufi-garden-map.svg";

// ===========================================================================
// HOW TO UPDATE PINS ON THE LANDING MAP  (map/sioufi-garden-map.svg is 3112 x
// 2523px — that's MAP_NATURAL_WIDTH / MAP_NATURAL_HEIGHT in app.js)
// ===========================================================================
//
// MOVE a pin:            change its x / y below (pixel position on the map
//                         image, measured from the top-left corner).
//
// EDIT a pin's text:     change its name / desc (shown in the tooltip when
//                         tapped).
//
// ADD a new pin with no footage yet ("coming soon"):
//                         add a new { id, name, desc, x, y, sceneIndex: null }
//                         entry. It shows up as a muted gray pin automatically
//                         — nothing else to wire up.
//
// LINK footage to a pin (including a "coming soon" one):
//                         1. add the clip as a new entry in `scenes` below
//                            (pick any unique id/hotspotId, point `video` at
//                            the mp4 in videos/, set mapPosition to the same
//                            x/y as its mapHotspots entry)
//                         2. set that mapHotspots entry's `sceneIndex` to the
//                            new scene's position in the `scenes` array
//                            (0 = first, 1 = second, ...)
//
// REMOVE a pin entirely:  delete its entry from mapHotspots. If it had
//                         footage, also delete the matching entry in `scenes`
//                         and fix up any `sceneIndex` values that shifted.
//
// Each pin's screen `%` position is computed automatically from x/y at
// render time (see buildMapPins() in app.js), so there's nothing to
// recalculate by hand — just edit the numbers below.
// ===========================================================================
export const mapHotspots = [
  { id: 1, name: "Entrance Roundabout", desc: "Circular plaza at the main garden entrance.", x: 2477.6, y: 494.0, sceneIndex: 0 },
  { id: 2, name: "East Lawn", desc: "Open lawn along the eastern path, near E-B1.", x: 2464.0, y: 831.3, sceneIndex: null },
  { id: 3, name: "Parking Court", desc: "Paved parking area near the east entrance.", x: 2245.0, y: 960.0, sceneIndex: null },
  { id: 4, name: "Reflecting Promenade", desc: "Polished granite water feature flanked by planting beds.", x: 1819.2, y: 828.1, sceneIndex: 9 },
  { id: 5, name: "Sunken Planting Beds", desc: "Shaped planting beds within the paved courtyard.", x: 1929.0, y: 1203.0, sceneIndex: 8 },
  { id: 6, name: "E-B3 Courtyard", desc: "Paved courtyard beside the E-B3 building.", x: 1850.0, y: 1340.0, sceneIndex: null },
  {
    id: 7,
    name: "Amphitheater & Splash Pad",
    desc: "Stepped stone amphitheater beside a splash-pad play area.",
    note: "Position estimated from walk order — this point is missing from the source map (#7 was skipped) and needs on-site confirmation.",
    x: 1320,
    y: 1370,
    sceneIndex: 3,
  },
  { id: 8, name: "The Terrace", desc: "Raised stone terrace overlooking the central lawn.", x: 1485.0, y: 970.0, sceneIndex: 6 },
  { id: 9, name: "Outdoor Exhibition Plaza", desc: "The garden's largest paved plaza, used for outdoor exhibitions and events.", x: 1219.0, y: 1104.0, sceneIndex: null },
  { id: 10, name: "Garden Walk", desc: "Curving lawn path linking the plaza to the western gardens.", x: 1108.5, y: 1285.0, sceneIndex: 2 },
  {
    id: 11,
    name: "Side Gate",
    desc: "Secondary gated entrance with stone pillars and a stairway.",
    note: "Position estimated from walk order — this point is missing from the source map (#11 was skipped) and needs on-site confirmation.",
    x: 770,
    y: 1570,
    sceneIndex: 4,
  },
  { id: 12, name: "Vintage Play Area", desc: "Play area built around the rehabilitated vintage play structure.", x: 1159.0, y: 1463.5, sceneIndex: 1 },
  { id: 13, name: "Fitness Trail", desc: "Winding path through the lawn, past a vintage garden statue.", x: 1032.0, y: 988.5, sceneIndex: 7 },
  { id: 14, name: "Great Lawn — North", desc: "Large triangular lawn crossed by diagonal stone paths.", x: 744.5, y: 932.5, sceneIndex: null },
  {
    id: 15,
    name: "Great Lawn — South",
    desc: "Large triangular lawn crossed by diagonal stone paths.",
    note: "North/South assignment for this clip is a best guess — both points share the same description on the source map.",
    x: 495.0,
    y: 1088.5,
    sceneIndex: 5,
  },
  { id: 16, name: "Duck Pond", desc: "Spiral walkway around the garden's private duck pond.", x: 724.5, y: 1360.5, sceneIndex: null },
  { id: 17, name: "West Path", desc: "Perimeter path along the western boundary.", x: 532.0, y: 1755.5, sceneIndex: null },
  { id: 18, name: "Solar Canopy", desc: "Solar panel canopy shading part of the south lawn.", x: 2024.0, y: 1871.0, sceneIndex: null },
  { id: 19, name: "Shade Pavilion", desc: "Lattice shade structure near the new building's entrance.", x: 1859.0, y: 575.0, sceneIndex: null },
  { id: 20, name: "East Corner Lawn", desc: "Small lawn tucked into the garden's eastern corner.", x: 3028.0, y: 670.0, sceneIndex: null },
];

const scenes = [
  {
    id: "hotspot-1",
    hotspotId: 1,
    title: "Entrance Roundabout",
    video: "videos/01_entrance.mp4",
    startYaw: 0,
    startPitch: 0,
    mapPosition: { x: 2477.6, y: 494.0 },
    labels: [
      {
        yaw: 0,
        pitch: 0,
        title: "Entrance Roundabout",
        description: "Circular plaza at the main garden entrance.",
      },
    ],
  },
  {
    id: "hotspot-12",
    hotspotId: 12,
    title: "Vintage Play Area",
    video: "videos/02_rosemary_walk.mp4",
    startYaw: 0,
    startPitch: 0,
    mapPosition: { x: 1159.0, y: 1463.5 },
    labels: [
      {
        yaw: 0,
        pitch: 0,
        title: "Vintage Play Area",
        description: "Play area built around the rehabilitated vintage play structure, next to the garden's duck pond.",
      },
    ],
  },
  {
    id: "hotspot-10",
    hotspotId: 10,
    title: "Garden Walk",
    video: "videos/03_citrus_grove.mp4",
    startYaw: 0,
    startPitch: 0,
    mapPosition: { x: 1108.5, y: 1285.0 },
    labels: [
      {
        yaw: 0,
        pitch: 0,
        title: "Garden Walk",
        description: "Curving lawn path linking the plaza to the western gardens.",
      },
    ],
  },
  {
    id: "hotspot-7",
    hotspotId: 7,
    title: "Amphitheater & Splash Pad",
    video: "videos/04_raised_beds.mp4",
    startYaw: 0,
    startPitch: 0,
    mapPosition: { x: 1320, y: 1370 },
    labels: [
      {
        yaw: 0,
        pitch: 0,
        title: "Amphitheater & Splash Pad",
        description: "Stepped stone amphitheater beside a splash-pad play area.",
      },
    ],
  },
  {
    id: "hotspot-11",
    hotspotId: 11,
    title: "Side Gate",
    video: "videos/05_herb_spiral.mp4",
    startYaw: 0,
    startPitch: 0,
    mapPosition: { x: 770, y: 1570 },
    labels: [
      {
        yaw: 0,
        pitch: 0,
        title: "Side Gate",
        description: "Secondary gated entrance with stone pillars and a stairway.",
      },
    ],
  },
  {
    id: "hotspot-15",
    hotspotId: 15,
    title: "Great Lawn — South",
    video: "videos/06_compost_area.mp4",
    startYaw: 0,
    startPitch: 0,
    mapPosition: { x: 495.0, y: 1088.5 },
    labels: [
      {
        yaw: 0,
        pitch: 0,
        title: "Great Lawn — South",
        description: "Large triangular lawn crossed by diagonal stone paths.",
      },
    ],
  },
  {
    id: "hotspot-8",
    hotspotId: 8,
    title: "The Terrace",
    video: "videos/07_pond.mp4",
    startYaw: 0,
    startPitch: 0,
    mapPosition: { x: 1485.0, y: 970.0 },
    labels: [
      {
        yaw: 0,
        pitch: 0,
        title: "The Terrace",
        description: "Raised stone terrace overlooking the central lawn.",
      },
    ],
  },
  {
    id: "hotspot-13",
    hotspotId: 13,
    title: "Fitness Trail",
    video: "videos/08_pergola.mp4",
    startYaw: 0,
    startPitch: 0,
    mapPosition: { x: 1032.0, y: 988.5 },
    labels: [
      {
        yaw: 0,
        pitch: 0,
        title: "Fitness Trail",
        description: "Winding path through the lawn, past a vintage garden statue.",
      },
    ],
  },
  {
    id: "hotspot-5",
    hotspotId: 5,
    title: "Sunken Planting Beds",
    video: "videos/09_wildflower_meadow.mp4",
    startYaw: 0,
    startPitch: 0,
    mapPosition: { x: 1929.0, y: 1203.0 },
    labels: [
      {
        yaw: 0,
        pitch: 0,
        title: "Sunken Planting Beds",
        description: "Shaped planting beds within the paved courtyard.",
      },
    ],
  },
  {
    id: "hotspot-4",
    hotspotId: 4,
    title: "Reflecting Promenade",
    video: "videos/10_greenhouse.mp4",
    startYaw: 0,
    startPitch: 0,
    mapPosition: { x: 1819.2, y: 828.1 },
    labels: [
      {
        yaw: 0,
        pitch: 0,
        title: "Reflecting Promenade",
        description: "Polished granite water feature flanked by planting beds.",
      },
    ],
  },
];

export default scenes;
