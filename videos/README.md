# Video files needed here

Place your 10 converted 360° MP4 clips in this folder with **exactly** these filenames
(referenced by `../scenes.js`):

| # | Filename                       | Scene title (edit in scenes.js) |
|---|---------------------------------|----------------------------------|
| 1 | `01_entrance.mp4`               | Garden Entrance                  |
| 2 | `02_rosemary_walk.mp4`          | Rosemary Walk                     |
| 3 | `03_citrus_grove.mp4`           | Citrus Grove                      |
| 4 | `04_raised_beds.mp4`            | Raised Vegetable Beds             |
| 5 | `05_herb_spiral.mp4`            | Herb Spiral                       |
| 6 | `06_compost_area.mp4`           | Compost Area                      |
| 7 | `07_pond.mp4`                   | Pond & Wetland Filter             |
| 8 | `08_pergola.mp4`                | Shade Pergola                     |
| 9 | `09_wildflower_meadow.mp4`      | Native Wildflower Meadow          |
| 10| `10_greenhouse.mp4`             | Solar-Powered Greenhouse          |

## Requirements for each file

- **Format:** MP4 container, H.264 video (8-bit, `yuv420p` — not 10-bit "High 10", which
  browsers cannot play), AAC audio.
- **Projection:** true equirectangular (2:1 aspect ratio, e.g. 3840×1920), not a raw
  fisheye frame. If you're converting from DJI Osmo 360 `.OSV` files, ffmpeg needs
  to (1) stitch the two fisheye lens streams into an equirectangular frame and
  (2) re-encode to 8-bit `yuv420p` — most browsers refuse to play 10-bit H.264.
- **Filenames must match exactly** (case-sensitive on some servers/hosts) or that
  scene will show the loading spinner forever with a "could not load" message.

## Adding/renaming scenes

You don't have to use these exact names — they're just what `scenes.js` currently
points to. If you rename a file, update the corresponding `video:` path in
`scenes.js` to match. You can also add more than 10 scenes (or fewer) by
adding/removing entries in the `scenes` array; the top bar progress counter and
prev/next navigation adapt automatically.
