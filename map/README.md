# Site map — sioufi-garden-map.svg

The real Sioufi Garden site map, extracted from an interactive map built
from the official "Rehabilitation & Upgrading of Sioufi Garden" landscape
drawings (UNOPS / German Cooperation KfW / Maalouf Trading & Contracting,
sheets L-003 / L-005 / L-006 / L-008).

It's a vector SVG (not a raster image) — terrain, paving, trees, buildings,
and zone-name labels are all real vector shapes with a `viewBox="-70 -70
3112 2523"`. Its natural pixel size is **3112 × 2523**; that's
`MAP_NATURAL_WIDTH` / `MAP_NATURAL_HEIGHT` in `app.js`, used to convert a
pin's `x`/`y` into a percentage position on screen.

This same file is used both as the full-screen landing map (panned/zoomed
directly) and as the source image for the in-tour minimap (Photo Sphere
Viewer's `MapPlugin`).

## Pins vs. this file

Unlike an earlier draft of this map, **pins are not baked into the SVG** —
the numbered badges from the original source map were stripped out on
purpose, so our own pin layer (drawn from `mapHotspots` in `scenes.js`) is
the only thing rendering markers. This avoids ever having two different pin
systems drawn on top of each other. See the comment block above
`mapHotspots` in `scenes.js` for how to add/move/link pins.

## Known open questions

These are called out directly in each affected pin's `note` field in
`scenes.js`, but the full context is:

- **Hotspot numbers #7 and #11 are missing from the source map** — the
  original drawings/legend skip straight from 6→8 and 10→12. Two of our
  filmed clips (the stepped amphitheater + splash pad, and the side gate
  with stairs) don't match any of the 18 labeled points, so they were
  assigned to these two missing numbers and given **estimated** positions
  based on walk order in the raw footage — not the source drawings. If you
  can confirm their real locations on-site, update their `x`/`y` in
  `mapHotspots` and remove the `note`.
- **"Great Lawn — North" vs. "Great Lawn — South"** (#14 / #15) share an
  identical description on the source map, so which one clip 06 actually
  shows is a best guess. If you can tell which is which, fix the
  `sceneIndex` assignment between the two entries in `mapHotspots`.

## If the source drawings change or new zones are surveyed

Re-derive pin coordinates the same way the current ones were: read the pin's
position directly off the source map (in whatever tool produced it) and
carry over its `x`/`y` here — no offset math needed beyond what's already
documented in `scenes.js` (the map's own `viewBox` origin is `-70,-70`, so a
raw drawing coordinate of `(tx, ty)` becomes `(tx + 70, ty + 70)` in this
file's pixel space).
