# LTO Reviewers (Code A, A1)

Interactive multiple-choice reviewers for the non-professional motorcycle license. Plain HTML, CSS and JavaScript, no build step.

- `part1/` and `part2/`: 60 questions each, with sign images and explanations
- `app.js`: shared quiz engine (clues, skip, back, retry, analytics); each folder has its own `data.js`
- `style.css`: shared, premium-styled theme for every page, light and dark mode

## Features
- **Clues** (up to 3 per question): topic hint, then one wrong answer ruled out, then the first words of the answer.
- **Skip**: a skipped question comes back at the end of the run.
- **Try again**: a wrong pick is crossed out so your next guess has fewer options.
- **Back / question dots**: revisit any question you've already seen; your previous pick and result are shown again.
- **Clue honesty rule**: if you use a clue and still get it right, it's tagged "IDK (clue used)" instead of "Correct" and does not count toward your score — the idea is your score reflects what you actually know.
- **Passing score**: Part 1 and Part 2 both need 48/60 (80%) to pass. Shown on the results screen once you finish a full run.
- **Analytics**: accuracy by topic, your most-missed questions, clues used, skips, and your best full-run score — tap "Analytics" from any quiz.

## Saving your progress
Analytics are saved automatically with the browser's `localStorage`, scoped per quiz (`rev.stats.part1`, `rev.stats.part2`). That means:
- It's already being saved — there's nothing to set up.
- It stays on **this device, in this browser**, until you clear site data or use a different browser/profile.
- It will **not** sync to your other phone, tablet, or a different browser automatically.

### If you want it to follow you across devices
You'll need a small free cloud database behind the site. Two good, beginner-friendly options:
- **[Firebase](https://firebase.google.com/)** (Google) — a generous free tier, a Firestore database, and a short JavaScript snippet to read/write the same `S` object this app already keeps in memory.
- **[Supabase](https://supabase.com/)** — similar free tier, Postgres-based, also has a simple JS client.

Either one takes about 15–20 minutes to set up (create a project, create a collection/table, copy a small public config into the page). Once you have an account, this app's `save()`/load logic in `app.js` is the only place that needs to change — ask for help wiring it up and you can paste in the project config.

## Publish on GitHub Pages
Settings > Pages > Deploy from a branch > `main` / root. Your site will be at `https://<username>.github.io/<repo>/`.

## Run locally
Open `index.html` in a browser.

Study aid only. Check answers against the official LTO handbook.
