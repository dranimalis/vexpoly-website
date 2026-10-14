# VEXPOLY website

Static landing site for [VEXPOLY](https://github.com/dranimalis/vexpoly).
Plain HTML, CSS, JavaScript. No build step, no bundler, no framework.

## Pages

| File | Purpose |
| --- | --- |
| `index.html` | Landing page with live canvas preview |
| `download.html` | Platform downloads + source install |
| `docs.html` | Install, controls, renderer notes |
| `changelog.html` | Release history |
| `404.html` | Not-found page (GitHub Pages serves automatically) |

## Deploy

1. Create a repo named `vexpoly-website`.
2. Push these files to `main`.
3. Repo **Settings → Pages**:
   - Source: **Deploy from a branch**
   - Branch: **main**, folder: **/ (root)**
4. Save. GitHub serves it at `https://<username>.github.io/vexpoly-website/`.

To use a custom domain, add a `CNAME` file with your domain and point
an `ALIAS`/`CNAME` DNS record at `<username>.github.io`.

## Assets to copy in

This site is a separate repo from the game. Copy the following from the
game repo's `docs/` folder into this site's `assets/` folder:

| Game repo file | Website path |
| --- | --- |
| `docs/hero.gif` | `assets/hero.gif` |
| `docs/social-preview.png` | `assets/social-preview.png` |
| `docs/logo-mark-solid.png` | `assets/favicon.png` (rename) |

## When you add new builds

The download page has three cards:

- **macOS** is live and points at
  `releases/latest/download/vexpoly-macos.zip`. This filename must match
  what `.github/workflows/build-macos.yml` produces.
- **Windows** and **Linux** are marked `.is-soon` — they link to the
  source-install steps instead of a missing binary.

Once you add `build-windows.yml` and `build-linux.yml` workflows that
publish `vexpoly-win64.exe` and `vexpoly-x86_64.AppImage`, do this:

1. Remove `is-soon` from the two `<article class="dl-card">` tags.
2. Change their badges from `<span class="dl-badge">Soon</span>` to
   `<span class="dl-badge">Available</span>`.
3. Swap the ghost buttons for solid ones pointing at the release URLs.

## Editing

- **Colours** live in `:root` at the top of `style.css`.
- **Content** is plain HTML. No templating.
- **Interactivity** in `script.js` covers the mobile nav, the platform
  detector, copy-to-clipboard, scroll reveal, counters, docs scroll spy,
  and the canvas preview.

## License

MIT. Same as the game.