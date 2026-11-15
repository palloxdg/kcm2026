# The ranking room

A standalone tier list for GitHub Pages. No build step, accounts, or dependencies.

## Add to kcm2026

1. Copy `index.html`, `style.css`, and `app.js` into a folder such as `Tiermaker/` in `palloxdg/kcm2026` on `main`.
2. Create **`tierlistimg/` at the root of the repository** and upload your images there. Commit the files to `main`. Images inside nested folders are not automatically discovered.
3. Open the page through your existing website, for example `https://palloxdg.github.io/kcm2026/Tiermaker/` when using GitHub Pages, or `/Tiermaker/` on your custom domain. Existing GitHub Pages publication settings must include this folder. Do not replace the existing repository homepage unless you want this page to become the homepage.
4. Click **Refresh images** after uploading images. PNG, JPG, JPEG, WebP, GIF, AVIF and SVG are supported.

The page uses the public GitHub Contents API to discover the root `tierlistimg` folder. The repository must be public. GitHub allows up to 1,000 entries in a directory response and limits unauthenticated API requests. The repository, branch and folder are configured in `CONFIG` at the top of `app.js`.

## Optional: avoid the GitHub API / run locally

Place a `tierlistimg` folder **alongside index.html** containing your images and an `images.json` file:

```json
["first-image.jpg", "second-image.png", "an image with spaces.webp"]
```

The page tries this manifest first; if it is missing, it discovers the root GitHub folder instead. With a manifest, update the list when adding images. This option also works for private source repositories if the website and images are publicly served. Serve the files with a local HTTP server for testing; opening `index.html` through `file://` does not support fetch.

## Use

- Drag images between tiers, or select an image and click/tap a tier label or empty space in that tier. Drop on another image to insert before it.
- Select an image and use left/right arrow keys to reorder it within a tier. Select **Return selected image to unranked** to remove its ranking.
- Click a tier label (with no image selected) or its gear to rename it or change its color. Add, delete and reorder tiers with the controls on the board.
- Edit the title directly. Rankings, order, labels and title save in this browser's local storage. They are personal to that browser; they are not written to GitHub or shared with other visitors. Renaming/deleting image files removes their visible ranking; newly uploaded files start unranked.
- **Export PNG** downloads the ranked board, excluding unranked images. Images must load successfully and permit canvas export. GitHub raw image URLs support this. Animated GIFs export as a still image.
- **Reset rankings** returns all images to the pool while keeping tier labels and colors.

Fonts use Google Fonts with system fallbacks. No image files are uploaded through this website: add them using GitHub's file upload interface or Git.
