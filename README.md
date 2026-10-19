# Malhão Pardo review preview

A separate website preview for review before final integration. Production is unchanged.

The public HTML, CSS and JavaScript are stored here. The build downloads public photos, fonts and videos from the existing website using `preview-assets.json` and verifies each SHA-256 before publishing. Internal documents, original Git history, admin page and credentials are excluded.

The preview supports browsing, galleries and language switching. Production bookings, payments and messages are intentionally disabled by `js/preview-mode.js`. External read-only services may have origin restrictions. This is not a production booking site.

Push reviewed changes to this repository's `main` branch to update its GitHub Pages preview. Final integration with the production website is a separate task for the site maintainer. Do not copy the preview-only overlay, submission guard or Pages workflow into production.

No custom domain or deployment secrets are required. GitHub Actions uses its built-in token. Media source: the owner-provided website kit, verified against the existing public site during builds.
