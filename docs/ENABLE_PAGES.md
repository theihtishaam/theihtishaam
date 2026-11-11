# Enable your full-screen interactive portfolio (GitHub Pages)

Your source code is already included in the profile repository:

- `docs/index.html` — complete single-page portfolio.
- `docs/style.css` — dark-only visual theme, hover tilt, animations and responsive layouts.
- `docs/app.js` — pointer effects, motion toggle, public GitHub API project feed.
- `README.md` — the profile shown on GitHub itself.

**One required GitHub settings action:** connected GitHub file tools cannot change the Pages publishing settings.

1. Go to [Repository → Settings → Pages](https://github.com/theihtishaam/theihtishaam/settings/pages).
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Choose **main** and **/docs**, then click **Save**.
4. When GitHub reports it published, open **https://theihtishaam.github.io/theihtishaam/**.
5. Optionally add that URL to the website field in [your GitHub profile settings](https://github.com/settings/profile).

A GitHub README cannot change GitHub's global page background or run custom JavaScript. The separate Pages site is a complete full-screen dark design with mouse-following glow and real hover interactions.

## Interaction features

- A dark navy/black base and turquoise, ultraviolet, magenta accents
- Cursor-following ambient glow and subtle floating particles
- 3D tilt project cards and hover shine
- Animated identity scanner featuring the latest public GitHub avatar
- Live public GitHub repository discovery; cached fallback when API rate-limited
- Accessibility: reduced-motion media query, motion toggle, keyboard focus indicators and mobile layout
- No server setup, API keys, login, cookies, or paid dependency required

## If it looks blank

Check the exact profile page at [github.com/theihtishaam](https://github.com/theihtishaam), not just the repository's files tab. The special public `theihtishaam/theihtishaam` repository's root `README.md` is the GitHub profile content. Use Ctrl+Shift+R to refresh a cached image. GitHub's native chrome and color theme are controlled by GitHub and each viewer's settings, not by profile README code.
