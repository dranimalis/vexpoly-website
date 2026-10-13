# VEXPOLY website

Static landing page for [VEXPOLY](https://github.com/dranimalis/vexpoly).

Plain HTML, CSS and JavaScript. No build step, no bundler, no framework.
Push it to GitHub Pages and you are done.

## Deploy

1. Create a new repo named `vexpoly-website` (or anything you like).
2. Push these files to `main`.
3. Repo **Settings → Pages**:
   - Source: **Deploy from a branch**
   - Branch: **main**, folder: **/ (root)**
4. Save. GitHub serves it at `https://<username>.github.io/vexpoly-website/`.

To use a custom domain, add a `CNAME` file containing your domain and point
an `ALIAS`/`CNAME` DNS record at `<username>.github.io`.

## Editing

- **Colours** live in `:root` at the top of `style.css`.
- **Content** is plain HTML in `index.html`. No templating, no components.
- **Interactivity** in `script.js` covers only the mobile nav toggle and
  copy-to-clipboard buttons. Everything else is CSS.

## Assets to copy in

From the main game repo's `docs/` folder:

| File | Where it goes |
| --- | --- |
| `hero.gif` | `assets/hero.gif` |
| `social-preview.png` | `assets/social-preview.png` |
| `logo-mark-solid.png` | `assets/favicon.png` (rename) |

## License

MIT. Same as the game.# vexpoly-website
# vexpoly-website
