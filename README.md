# FlexBen Calculator

A browser-based calculator for planning how to allocate a flexible-benefits
budget across the year — including health insurance costs, a car allowance,
year-end bonus, and custom priorities — with a month-by-month allocation
matrix so you can see exactly how your budget is spent.

Live app: https://6135.github.io/FlexBenCalc

## Features

- **Budget configuration** — total yearly budget, number of months, car
  allowance, bonus, and health insurance plan (employee/spouse/dependents,
  downgrade/standard/upgrade tiers).
- **Priorities** — add your own spending priorities (e.g. glasses, gym,
  meal card) with drag-and-drop reordering.
- **Monthly allocation matrix** — see how the budget is distributed across
  every month, with auto-balance to absorb any surplus/deficit into the
  last priority.
- **Share / Export / Import** — share a configuration via a self-contained
  link, or export/import it as a JSON file.
- **Print-friendly output** for keeping a physical copy.
- All data is stored locally in your browser (`localStorage`) — nothing is
  sent to a server.

## Tech stack

- [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [React Router](https://reactrouter.com/) (`HashRouter`, for GitHub Pages compatibility)
- [Tailwind CSS](https://tailwindcss.com/)
- [Create React App](https://create-react-app.dev/) (`react-scripts`)
- Deployed to GitHub Pages via [`gh-pages`](https://www.npmjs.com/package/gh-pages)

## Getting started

```bash
git clone https://github.com/6135/FlexBenCalc.git
cd FlexBenCalc
npm install
npm start
```

The app runs at `http://localhost:3000/FlexBenCalc` (the `homepage` field in
`package.json` points at the GitHub Pages subpath).

Other scripts:

```bash
npm run build     # production build, output in build/
npm test          # run the test suite
npm run deploy    # build and publish build/ to the gh-pages branch
```

## Privacy & analytics

The app can optionally use Google Analytics (GA4) to understand which
features are actually used (e.g. Share, Export, Print, Auto-Balance), so we
know what's worth improving. A few things worth knowing:

- **Off by default.** Analytics only starts after you explicitly accept it
  in the disclaimer dialog shown on load. If you reject it (or don't
  choose), no analytics script is loaded and no cookies are set — nothing
  is sent to Google at all.
- **No financial data is ever tracked.** Only the fact that an action
  happened is recorded (e.g. "export button clicked") — never your budget,
  dependents, priorities, or other figures.
- **Shared links are redacted.** The `/shared/:sharedData` route encodes a
  full configuration as base64 in the URL. That segment is stripped to
  `/shared/[redacted]` before anything is reported, so a shared link's
  contents never reach analytics either.
- **You can change your mind.** The consent choice is asked again each time
  you reload the page, alongside the disclaimer.

See `src/utils/analytics.ts` for the consent-gating implementation and
`src/components/DisclaimerModal.tsx` for the consent UI.

## Disclaimer

This calculator is provided for informational purposes only. All
calculations are the user's sole responsibility — verify results
independently before making financial decisions. See the in-app disclaimer
for full terms.
