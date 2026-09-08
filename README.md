# Calorie Tracker

A daily calorie and exercise tracker, built as a local-first web app. All
data lives in the browser's IndexedDB — nothing is sent to a server.

## Concepts

- **Campaign** — a goal-tracking period defined by a starting weight, a
  target weight, a maintenance-calorie estimate, and a daily calorie
  deficit target. Only one campaign is active at a time. You can end a
  campaign whenever you like and either start a new one or resume a past
  one — its logged days are kept.
- **Day** — the app only ever shows *today*. Food, exercise, and an
  optional weight entry are logged against the active campaign and
  today's date.
- **Food library** — a reusable list of foods (serving size/unit,
  calories, protein, cholesterol). Logging a food from the library
  snapshots its nutrition onto that day's entry, so editing or deleting a
  library item later never rewrites history.

## Development

```bash
npm install
npm run dev      # start the dev server
npm run build    # typecheck + production build
npm run lint     # oxlint
```
