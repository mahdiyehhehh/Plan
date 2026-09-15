# 7 Day Plan — Weekly Tracker

A clean, black/white/red version of your "7 Days Plan" PDF, turned into a website. Tracks German learning, university classes, money saved, job hours, your project, and the accounting certificate — week by week, forever. Switch to Month or Year to see totals automatically add up.

No build step, no backend, no database — it's plain HTML/CSS/JS. Everything you type is saved in your browser (`localStorage`) so it's still there next time you open the site on the same device/browser. Use the **Export backup** link anytime to download a `.json` copy of everything, and **Import backup** to restore it (or move it to another device/browser).

## Files

```
index.html   → page structure
style.css    → black / white / red design
app.js       → all the logic (data, saving, week/month/year views)
```

## Run it locally

Just open `index.html` in a browser — that's it. Or, for a local server:

```bash
npx serve .
```

## Put it on GitHub

```bash
cd 7day-tracker
git init
git add .
git commit -m "Initial commit: 7 Day Plan tracker"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/7day-tracker.git
git push -u origin main
```

(Create the empty repo on GitHub first at github.com/new, then run the commands above from inside this folder.)

## Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with your GitHub account.
2. Click **Add New → Project**.
3. Select the `7day-tracker` repo you just pushed.
4. Framework preset: choose **Other** (it's a static site — no build command needed).
5. Click **Deploy**.

Vercel gives you a live URL right away (something like `7day-tracker.vercel.app`). Every time you push a change to the `main` branch on GitHub, Vercel redeploys automatically.

## A note on your data

Because there's no database, your entries live in the browser you use to open the site — they won't automatically show up on a different phone or laptop. If you want to check your tracker from multiple devices with the same data, use **Export backup** on one device and **Import backup** on the other, or say the word and this can be upgraded to sync through a real database (e.g. Vercel Postgres or Supabase) later.

## What's new

- **Export as Image** — download the current sheet (Week, Month, Year, or the German hub) as a crisp, print-ready PNG.
- **Save backup / Restore backup** — same JSON backup as before, just renamed for clarity. "Save backup" downloads your data; "Restore backup" loads a `.json` file back in.
- **Month & Year are now one-page, no-scroll sheets** — they use the exact same "fit-to-screen" trick as the Week view: the whole report scales down as one unit to fit your screen, so there's never any scrolling or sliding. Export as Image still exports them at full resolution.
- **The German hub no longer gets clipped on mobile** — it used to inherit the app's "no scroll" behavior by accident, which cut off the bottom half of the page. It now scrolls normally (like any content-heavy page), with bigger touch targets and larger text on small screens.
- **A1 → B2 tab** — reframed around the real goal: passing the Goethe/telc exam *and* speaking comfortably, not just one or the other:
  - **Phrase of the Day** — a pinned card with a real German slang term, idiom, or everyday phrase (not textbook German), rotating automatically once a day.
  - **Forvo pronunciation links** — a 🔊 button next to each day's key vocabulary word and next to the phrase of the day, opening that word's native-speaker pronunciations on Forvo.
  - **Daily Learning**: a 30-day A1 curriculum. Each day has a key vocab word, a homework prompt, a worked example, a space for your answer, and a notes section. A progress ring tracks how many of the 30 days you've completed.
  - **A1 Tests**: ten short multiple-choice practice tests (5 questions each) covering core A1 topics. Check your answers, see explanations, log what to review, and mark each test complete.

## A note on scope (A2 → B2)

The 30-day curriculum currently covers A1. Getting to B1/B2 for the Goethe exam is a much bigger curriculum (grammar like Konjunktiv II, Passiv, subordinate clauses, plus exam-format writing/speaking practice) — it's intentionally left as a next step rather than rushed, so say the word and the same Daily Learning / Tests structure can be extended with A2, B1, and B2 modules.
