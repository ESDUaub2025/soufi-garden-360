# Sioufi Garden 360

A single-page, no-build-tools interactive map and 360° video tour of Sioufi
Garden (Beirut, Achrafieh). The site opens on a pannable/zoomable map of the
real park; tapping a pin drops you into that spot's 360° video, with
interactive info pins inside the sphere. Built on
[Photo Sphere Viewer v5](https://photo-sphere-viewer.js.org/) loaded from
jsDelivr — no npm install, no bundler.

## Running locally

Browsers block `fetch`/module imports and some video features on the
`file://` protocol, so this must be served over HTTP. From this folder run:

```powershell
python -m http.server 8080
```

Then open **http://localhost:8080/** in your browser (Chrome/Edge/Firefox/Safari,
desktop or mobile — for a phone on the same Wi-Fi, use your machine's LAN IP
instead of `localhost`).

Any other static server works too (`npx serve`, VS Code's "Live Server"
extension, etc.) — the only requirement is that it's HTTP(S), not `file://`.

> **Gyroscope/tilt controls note:** mobile browsers only expose the device
> orientation API on secure contexts (`https://` or `localhost`). Tilt-to-look
> will not appear at all if you deploy this over plain `http://` on a real
> domain — use HTTPS for the public-facing version.

## File structure

```
soufi-garden-360/
  index.html      the page shell (loads PSV from CDN via an import map)
  style.css       all visual design / layout / animations
  scenes.js       <-- hand-edit this: scenes, map pins, and how to add more
                      (see the comment block above `mapHotspots`)
  app.js          viewer wiring: landing map, navigation, markers, popups,
                   gyroscope, in-tour minimap
  videos/
    README.md     exact filenames expected, see there before adding footage
    *.mp4         the filmed clips
  images/
    thumbs/        still-frame previews shown in the landing map's tooltip,
                    one per filmed clip (hotspot-<id>.jpg)
  map/
    README.md     provenance of the site map + what's still unconfirmed
    sioufi-garden-map.svg   the real site map (source: official as-built
                    landscape drawings), used for both the full-screen
                    landing map and the in-tour minimap
```

## Site map

The site **opens on a full-screen, pannable/zoomable map** of the real
garden (drag to pan, +/− to zoom). Every plotted point from the source
drawings is shown as a pin — green leaf pins have footage and open a tooltip
with a real preview still + an "Explore in 360°" button; muted gray pins are
plotted but have no footage yet ("coming soon"). A **Map** button in the
in-tour control bar returns here without losing the viewer's state.

The same image also powers the small persistent minimap shown while touring
(bottom-left, via Photo Sphere Viewer's `MapPlugin`), so both views always
agree on where everything is.

All pin data — position, name, description, and which scene (if any) it
links to — lives in `mapHotspots` in `scenes.js`. See the comment block
above it for exactly how to move a pin, add a new "coming soon" pin, or
link footage to one; nothing in `app.js` needs to change for routine edits.

## Deploying to GitHub Pages

This project is 100% static (no build step), so GitHub Pages can serve it as-is.

1. Push this folder's contents to the root of the `soufi-garden-360` repo, on
   whichever branch you'll publish from (`main` is simplest):

   ```powershell
   git init
   git remote add origin https://github.com/ESDUaub2025/soufi-garden-360.git
   git add .
   git commit -m "Initial Soufi Garden 360 preview"
   git branch -M main
   git push -u origin main
   ```

2. In the GitHub repo, go to **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **Deploy from a branch**.
4. Under **Branch**, choose `main` and folder `/ (root)`, then **Save**.
5. GitHub builds and publishes the site at:
   `https://esduaub2025.github.io/soufi-garden-360/`
   (first publish can take a minute or two; subsequent pushes to `main` redeploy
   automatically).

### Things that matter specifically for Pages hosting

- **HTTPS is automatic** on `github.io`, so the gyroscope/tilt-to-look feature
  will work correctly (it requires a secure context).
- **Video file sizes:** GitHub rejects files over 100 MB and warns above 50 MB.
  The current 10 clips are all well under that, but if you swap in longer/higher
  bitrate footage later and a file creeps past ~50 MB, consider re-compressing it
  (raise `-crf` a bit in your ffmpeg conversion) rather than fighting Git's limits.
- **Repo size:** there's no hard enforcement at this scale, but if the video
  collection grows a lot over time, consider
  [Git LFS](https://git-lfs.com/) for the `videos/` folder — not necessary at
  the current ~10 clips / ~150 MB total.
- **Case sensitivity:** GitHub Pages serves files from a case-sensitive Linux
  filesystem. Since `scenes.js` and the actual filenames were set up together,
  this is already consistent — just keep that in mind if you rename files later.

## What's implemented

- Full-screen, pannable/zoomable landing map as the site's entry point, with
  real preview-still tooltips and click-through into the matching 360° clip
- Full 360° drag/scroll/pinch navigation via Photo Sphere Viewer core
- Sequential clip playback with custom Play/Pause, Previous/Next, Reset View,
  and a Map button to return to the landing map without losing viewer state
- Video pauses without breaking sphere navigation — you can keep looking
  around a frozen frame indefinitely
- Animated leaf-pin markers per scene, defined in `scenes.js`. Tapping one
  shows a small popup anchored above the pin; tapping the same pin again
  expands it into the full, more-readable popup card
- Custom popup card (not PSV's built-in side panel) with title/description/
  optional image, fade+scale transition, safe positioning on mobile
  (becomes a bottom sheet under 480px width)
- Custom loading overlay per scene transition
- Glassmorphic, auto-hiding chrome (top bar + controls fade out after a few
  seconds of inactivity for an immersive view, and reappear on interaction)
- Gyroscope tilt-to-look with an explicit "Tap to enable" prompt that
  properly triggers iOS's `DeviceOrientationEvent.requestPermission()` inside
  a user gesture (required since iOS 13)

## Design decision: no autoplay

Each clip loads paused; the visitor presses the central Play button to start
it. This was a deliberate choice, not an oversight — unmuted video autoplay is
blocked by most browsers, and fighting that policy (auto-muting, then
requiring a tap to unmute) adds complexity without a real UX benefit for a
preview demo where visitors are actively exploring, not passively watching.

## Going from "10 clips in sequence" to a branching pathway tour

This preview intentionally only supports linear Prev/Next navigation. To
evolve it into a real branching tour later, the main things that change are:

1. **Data model:** `scenes` becomes a graph, not a flat array. Each scene
   needs one or more directional "hotspot" markers (e.g. an arrow/gate icon
   placed at the point in the 360° view where a path leads) that store a
   target scene id instead of (or in addition to) species labels. Photo
   Sphere Viewer's dedicated
   [Virtual Tour plugin](https://photo-sphere-viewer.js.org/plugins/virtual-tour.html)
   is built exactly for this — it manages the node graph, transitions, and
   optional GPS/map positions for you, so a chunk of `app.js`'s manual
   `goToScene` logic could be replaced by handing the graph to that plugin.
2. **Navigation UI:** the fixed Prev/Next footer buttons stop making sense
   once there's more than one possible "next" — they'd be replaced by
   clickable direction markers in the sphere itself (and optionally a small
   map/plan overview, which Virtual Tour also supports via its Plan plugin
   integration).
3. **State/history:** you'll want a visited-node history stack so a "back"
   action means "previous node visited," not "previous index in the array" —
   useful for a breadcrumb trail or a "return to entrance" shortcut.
4. **Content structure:** species/area labels and navigation hotspots become
   two distinct marker types with different click behavior (one opens a
   popup card, the other calls `goToScene(targetId)`), whereas right now
   there's only one marker type.

None of the current code is wasted: the video adapter setup, popup card
system, gyroscope handling, and loading-overlay pattern all carry over
unchanged — only the navigation/data layer needs to grow.
