/**
 * Soufi Garden 360 — scene configuration
 * ---------------------------------------
 * Hand-edit this file to add your real clips and labels.
 *
 * - `video`      path to the mp4, relative to index.html (place files in /videos/)
 * - `startYaw`   initial horizontal look direction in DEGREES (0 = center of the video frame)
 * - `startPitch` initial vertical look direction in DEGREES (0 = horizon, positive = up)
 * - `labels`     array of pins placed on the sphere for this clip
 *     - `yaw` / `pitch` in DEGREES, same convention as above
 *     - `title` short name shown on the popup card
 *     - `description` a sentence or two, shown on the popup card
 *     - `image` (optional) path to a photo shown on the popup card, omit if none
 *
 * See videos/README.md for the exact list of filenames this config expects.
 */

const scenes = [
  {
    id: "scene1",
    title: "Garden Entrance",
    video: "videos/01_entrance.mp4",
    startYaw: 0,
    startPitch: 0,
    labels: [
      {
        yaw: 35,
        pitch: 3,
        title: "Olive Tree",
        description:
          "A mature olive tree marks the entrance, chosen for its drought tolerance and symbolic roots in the region's agricultural heritage.",
      },
      {
        yaw: -40,
        pitch: -5,
        title: "Lavender Border",
        description:
          "A low lavender hedge lines the entry path, attracting pollinators while releasing a light fragrance as visitors brush past.",
      },
      {
        yaw: 150,
        pitch: 8,
        title: "Welcome Signage",
        description:
          "Recycled-timber signage introduces the Soufi Garden project and the ESDU sustainability initiatives on display throughout the garden.",
      },
    ],
  },
  {
    id: "scene2",
    title: "Rosemary Walk",
    video: "videos/02_rosemary_walk.mp4",
    startYaw: 0,
    startPitch: 0,
    labels: [
      {
        yaw: 10,
        pitch: 0,
        title: "Rosemary Hedge",
        description:
          "A dense rosemary hedge forms a fragrant, low-maintenance border that thrives in the region's dry summers.",
      },
      {
        yaw: -95,
        pitch: -4,
        title: "Gravel Pathway",
        description:
          "Permeable gravel paving reduces runoff and lets rainwater filter directly back into the soil.",
      },
    ],
  },
  {
    id: "scene3",
    title: "Citrus Grove",
    video: "videos/03_citrus_grove.mp4",
    startYaw: 0,
    startPitch: 0,
    labels: [
      {
        yaw: -20,
        pitch: 10,
        title: "Lemon Tree",
        description:
          "One of several citrus trees grown here, selected to demonstrate productive planting within a compact urban footprint.",
      },
      {
        yaw: 70,
        pitch: -2,
        title: "Drip Irrigation Line",
        description:
          "A low-flow drip irrigation system delivers water directly to the root zone, cutting water use compared to overhead sprinklers.",
      },
      {
        yaw: 170,
        pitch: 5,
        title: "Mulched Bed",
        description:
          "A thick layer of organic mulch retains soil moisture and suppresses weeds without the need for herbicides.",
      },
    ],
  },
  {
    id: "scene4",
    title: "Raised Vegetable Beds",
    video: "videos/04_raised_beds.mp4",
    startYaw: 0,
    startPitch: 0,
    labels: [
      {
        yaw: 0,
        pitch: -8,
        title: "Tomato Bed",
        description:
          "Raised beds improve drainage and soil warmth, extending the growing season for seasonal vegetables like tomatoes and peppers.",
      },
      {
        yaw: -60,
        pitch: 0,
        title: "Companion Planting",
        description:
          "Marigolds are interplanted with vegetables to naturally deter common pests, reducing the need for pesticides.",
      },
    ],
  },
  {
    id: "scene5",
    title: "Herb Spiral",
    video: "videos/05_herb_spiral.mp4",
    startYaw: 0,
    startPitch: 0,
    labels: [
      {
        yaw: 25,
        pitch: -6,
        title: "Herb Spiral",
        description:
          "A stacked-stone spiral creates multiple microclimates in one small footprint, letting sun-loving and shade-loving herbs grow side by side.",
      },
      {
        yaw: 120,
        pitch: 2,
        title: "Thyme & Sage",
        description:
          "Mediterranean herbs like thyme and sage occupy the drier, sunnier upper section of the spiral.",
      },
    ],
  },
  {
    id: "scene6",
    title: "Compost Area",
    video: "videos/06_compost_area.mp4",
    startYaw: 0,
    startPitch: 0,
    labels: [
      {
        yaw: -15,
        pitch: -5,
        title: "Compost Bins",
        description:
          "Three-bin compost system turns garden and kitchen waste into nutrient-rich soil amendment used throughout Soufi Garden.",
      },
      {
        yaw: 100,
        pitch: 3,
        title: "Worm Farm",
        description:
          "A vermicomposting station uses red wiggler worms to accelerate decomposition and produce a nutrient-dense worm castings fertilizer.",
      },
    ],
  },
  {
    id: "scene7",
    title: "Pond & Wetland Filter",
    video: "videos/07_pond.mp4",
    startYaw: 0,
    startPitch: 0,
    labels: [
      {
        yaw: 45,
        pitch: -3,
        title: "Reflection Pond",
        description:
          "A small pond supports local biodiversity and cools the surrounding microclimate during hot summer months.",
      },
      {
        yaw: -70,
        pitch: 5,
        title: "Reed Filter Bed",
        description:
          "Reeds and aquatic plants naturally filter the pond water, demonstrating a low-energy alternative to mechanical filtration.",
      },
    ],
  },
  {
    id: "scene8",
    title: "Shade Pergola",
    video: "videos/08_pergola.mp4",
    startYaw: 0,
    startPitch: 0,
    labels: [
      {
        yaw: 0,
        pitch: 15,
        title: "Grapevine Canopy",
        description:
          "A climbing grapevine trained over the pergola provides seasonal shade in summer and lets light through once it sheds leaves in winter.",
      },
      {
        yaw: -120,
        pitch: -4,
        title: "Seating Area",
        description:
          "Reclaimed-wood seating invites visitors to pause and enjoy the garden, framed by climbing jasmine along the pergola posts.",
      },
    ],
  },
  {
    id: "scene9",
    title: "Native Wildflower Meadow",
    video: "videos/09_wildflower_meadow.mp4",
    startYaw: 0,
    startPitch: 0,
    labels: [
      {
        yaw: 30,
        pitch: -2,
        title: "Wildflower Mix",
        description:
          "A meadow of native wildflower species supports local pollinators and requires minimal watering once established.",
      },
      {
        yaw: 160,
        pitch: 4,
        title: "Pollinator Hotel",
        description:
          "A insect hotel built from reclaimed wood and reeds offers nesting habitat for solitary bees and other beneficial insects.",
      },
    ],
  },
  {
    id: "scene10",
    title: "Solar-Powered Greenhouse",
    video: "videos/10_greenhouse.mp4",
    startYaw: 0,
    startPitch: 0,
    labels: [
      {
        yaw: -10,
        pitch: 6,
        title: "Solar Panel Array",
        description:
          "Rooftop solar panels power the greenhouse's irrigation pumps and climate sensors, closing the loop on the garden's energy use.",
      },
      {
        yaw: 95,
        pitch: -3,
        title: "Seedling Nursery",
        description:
          "Seedlings are propagated here before being transplanted to beds throughout Soufi Garden, extending the growing calendar year-round.",
      },
    ],
  },
];

export default scenes;
