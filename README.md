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

- **Opt-in, and you must choose.** First-time visitors have to explicitly
  accept or reject analytics before the disclaimer dialog can be dismissed.
  Nothing is loaded or collected until that choice is made, and if you
  reject, no analytics script is loaded and no cookies are set — nothing is
  sent to Google at all.
- **No financial data is ever tracked.** Only the fact that an action
  happened is recorded (e.g. "export button clicked") — never your budget,
  dependents, priorities, or other figures.
- **Shared links are redacted.** The `/shared/:sharedData` route encodes a
  full configuration as base64 in the URL. That segment is stripped to
  `/shared/[redacted]` before anything is reported, so a shared link's
  contents never reach analytics either.
- **You can change your mind at any time** via the "Cookie settings" link in
  the footer. Withdrawing consent reloads the page so the analytics script is
  fully unloaded, not merely muted.
- **Your choice is recorded** with a timestamp and policy version, so it can
  be demonstrated and so a change to the policy re-asks rather than assuming.

The full privacy policy lives at `/#/privacy` in the app
(`src/components/PrivacyPolicy.tsx`) and covers the controller, recipients,
international transfers, retention and your GDPR rights.

See `src/utils/analytics.ts` for the consent-gating implementation and
`src/components/DisclaimerModal.tsx` for the consent UI.

### Configuring the GA4 property

Two settings must be applied in the GA4 admin UI to match what the policy
states — they cannot be set from code:

1. **Data retention** — Admin → Data Settings → Data Retention → 2 months.
2. **Enhanced Measurement** — Admin → Data Streams → your stream. The code
   redacts URLs globally so automatic events inherit the redaction, but
   review which of these events you actually want.

You must also accept Google's Data Processing Terms (Admin → Account
Settings) to have a valid controller–processor arrangement.

## Disclaimer

This calculator is provided for informational purposes only. All
calculations are the user's sole responsibility — verify results
independently before making financial decisions. See the in-app disclaimer
for full terms.
