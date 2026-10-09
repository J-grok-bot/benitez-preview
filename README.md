# benitez-preview

Preview of the redesigned Frankie Benitez / Benitez Studio site. Not the live site (live: J-grok-bot/benitez.studio → https://benitez.studio).

- Single page: `index.html`, styles `assets/css/style.css`, script `assets/js/main.js`
- Self-hosted video in `assets/video/`
- Contact form: set `data-endpoint` on `#contact-form` to a Formspree URL to switch from mailto to Formspree.

## Hero background video

To swap the hero video, replace **`assets/video/hero.mp4`** (H.264 MP4, muted loop, ~10–20 s, ideally < 5 MB). That is the only file required; `hero.webm` is an optional fallback (replace or delete it) and `hero-poster.jpg` is the optional first frame. Current clip: cut from the "My Way" Instagram reel (DXpyp0sjkG0). If you swap it, bump `?v=2` in index.html to bust caches.
