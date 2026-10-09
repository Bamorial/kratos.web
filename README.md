# Kratos Web — Systhera Beratung

Next.js App Router, React, TypeScript, and plain CSS. Implements the first V1 pass from [specs.md](../specs.md).

## Design source

[Figma: LANDING DEV READY](https://www.figma.com/design/hvXZui3RbU8faPUnDMcr53/Untitled?node-id=2001-208)

The Figma reference exports are stored under `design/`. Images and icons are exact downloaded exports in `public/images/`; Satoshi fonts are hosted locally in `public/fonts/`. No expiring Figma asset URLs are used at runtime.

| Page | Desktop Figma node | Route |
| --- | --- | --- |
| Landing | 2001:209 | `/de` |
| Contact | 2001:1120 | `/de/contact` |
| Blog | 2001:1329 | `/de/blog` |
| Article | 2001:1751 | `/de/blog/self-understanding` |
| About | 2001:2054 | `/de/about` |
| Services | 2001:3100 | `/de/services` |
| Legal notice | 2001:2230 | `/de/impressum` |
| Disclaimer | 2001:2453 | `/de/disclaimer` |
| Terms | 2001:2597 | `/de/terms` |
| Cookie policy | 2001:2741 | `/de/privacy` |

Replace `/de` with `/en` or `/ro` for English and Romanian. The language switch preserves the current page. `/` redirects to German, matching the source design.

## Run

Requires Node.js 22 or newer.

```sh
npm ci
npm run dev
```

Open http://localhost:3000.

```sh
npm run build
npm start
npm run lint
npm run typecheck
npm run test:e2e
```

Browser tests use installed Google Chrome and start the production build on port 3100. Run `npm run build` before the browser suite. The suite covers language switching, routes and 404s, keyboard FAQ interaction, mobile navigation, contact validation, image responses, and mobile overflow. Screenshots are written to `test-results/`.

## Deploy to Vercel

Import the repository, set the project **Root Directory** to `kratos.web`, select **Next.js**, and use Node.js 22. The build command is `npm run build`; use the default Next.js output settings. The public site falls back to the bundled content until Firebase is configured. See [Firebase CMS setup](docs/firebase-setup.md) for environment variables, Firestore rules, administrator access, and deployment. No live deployment has been created.

## Structure

- `src/app`: route composition, page metadata, and shared CSS tokens.
- `src/components`: shared UI, page layouts, and individual landing sections. Interactive navigation, testimonials, and the contact form are client components; page content remains server rendered.
- `src/content`: typed content accessors and German source text, separated from layout to support a later CMS adapter.
- `src/i18n`: supported locales, translation selection, and URL helpers.
- `src/proxy.ts`: default-language redirect.

## Current scope and remaining content

- Responsive first pass of every designed page, with working navigation and a shared header/footer. The layout is adapted for intermediate screen widths rather than copying Figma's absolute coordinates.
- German, English, and Romanian navigation, landing content, contact, about, services, blog summaries, and the main article are implemented. **Legal documents still use their German source text**, with an explicit notice in English and Romanian. Their full translations remain to be supplied.
- Figma includes one complete article and five excerpts. The five corresponding pages show their available excerpts; full article bodies remain to be supplied.
- Contact submits enquiries to Firestore after validation and consent. Administrators view them in `/admin`; replies open the email client. Firebase credentials and the rate-limit secret are required.
- The services design contains a Qigong block followed by a large empty area. This implementation adds a therapy section using existing landing content so that both service links have useful destinations.
- Social icons are retained visually; profile URLs were absent from the source and are not invented.
- The German legal/cookie text is a transcription of the supplied design. It mentions the previous WordPress/Divi/Complianz setup, Google Fonts and maps; those integrations are not part of this app. Updating that content to describe this implementation is outstanding. Cookie preferences are not simulated: the app has no analytics, tracking, or cookie-consent storage.
- German landing copy has minor editorial corrections; FAQ wording avoids asserting unverified insurance coverage or outdated opening restrictions. English and Romanian marketing translations are initial implementation copy.
- V2 now uses an integrated Firestore CMS and Firebase Authentication, following the newer Firestore requirement instead of the original Payload plan. Texts, translations, articles, services/prices, and enquiries are managed at `/admin`. Images use bundled assets or HTTPS URLs; uploads and automated emails are not implemented.

## Fonts and assets

Satoshi is sourced from [Fontshare](https://www.fontshare.com/fonts/satoshi). Exact font source URLs are recorded in `design/fonts.css`. The Figma export provenance is in `design/assets.json`; `scripts/download-assets.py` can re-download the exports while their source URLs remain valid. Keep image usage and source rights aligned with the supplied design.

Framework setup follows the official [Next.js installation](https://nextjs.org/docs/app/getting-started/installation) and [internationalization](https://nextjs.org/docs/app/guides/internationalization) guides.

## CMS development

Read [Firebase CMS setup](docs/firebase-setup.md) for installation, deployment, editorial workflows, emulator tests, and architecture. The implementation separates content models, validation, authentication, database access, API handlers, and UI in line with the project’s SOLID/single-responsibility principles.

## Favicon

The production app serves its custom 64 px ICO from `src/app/favicon.ico`; its SVG source is in `src/app/favicon-source.svg`. Requests for `/favicon.ico` resolve to this static asset, not a locale route.
