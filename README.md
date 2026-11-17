# 7 Day Plan — Weekly Tracker

A clean, black/white/red version of your "7 Days Plan" PDF, turned into a website. Tracks German learning, university classes, money saved, job hours, your project, and the accounting certificate — week by week, forever. Switch to Month or Year to see totals automatically add up.

No build step, no backend, no database — it's plain HTML/CSS/JS. Everything you type is saved in your browser (`localStorage`) so it's still there next time you open the site on the same device/browser. Use the **Save backup** button anytime to download a `.json` copy of everything, and **Restore backup** to load it again (or move it to another device/browser).

## Files

```
index.html        → page structure
style.css         → black / white / red design
app.js            → all the logic (data, saving, week/month/year views)
ext-standard.js   → Step 1: standard everyday German (loaded after app.js)
```

New features are added as extra scripts that load after `app.js` and only change what is displayed. They never delete or rename your saved data.

## Run it locally

Just open `index.html` in a browser — that's it. Or, for a local server:

```bash
npx serve .
```

## Deploy on Vercel

Push to the `main` branch on GitHub; Vercel redeploys automatically (static site, no build command needed).

## A note on your data

Because there's no database, your entries live in the browser you use to open the site — they won't automatically show up on a different phone or laptop. Use **Save backup** on one device and **Restore backup** on the other to move them.

All progress is stored under the localStorage key `sevenDayPlan.v1`. The first time `ext-standard.js` runs, it copies that raw value to `sevenDayPlan.v1.backup-before-boost` (only if that backup does not exist yet), so you always have one untouched copy from before the B2 upgrade.

## B2 upgrade — Step 1: standard everyday German

Goal: speak comfortably with family and reach CEFR B2 by day 240, in the German spoken across central and northern Germany (Moin, Tschüss, Mahlzeit, Schönen Feierabend) — not exam-stiff, not slang.

- **Phrase of the Day** now shows 30 standard everyday phrases (Moin, Tschüss, Alles klar, Genau, Ach so, Ich hätte gern …, Zusammen oder getrennt?, Stimmt so, Schönen Feierabend, Mahlzeit, Wie bitte? …), each with a more formal variant, an English meaning and a note on where it is used. The old slang list (Digga, Alter, Bock, krass …) is gone.
- **Lesson sentences cleaned in memory only.** Slang and sloppy spellings in the "everyday" sentences (n bisschen, nen, ne, Bock, krass, mega, zock, chill, check's, sorry …) are replaced with standard German when the page loads. The cleaner runs once per lesson object and does not touch saved data.
- **Clearer labels.** The two sentence boxes are now "Standard German (written / formal)" and "Everyday spoken German".
- **B2 wording** in the hero (title, subtitle, goal, ring "0/240") and a neutral "Tests" tab label.
- **Backup copy** of your saved data (see above).

### How to test Step 1

1. Open the site, then the **A1 → B2** tab. The hero should say **Goethe B2 Path** and the ring should show your completed days out of **240**. Your completed days, streak and notes must look exactly as before.
2. The phrase card should show something like "Moin!" with a "More formal" line, a meaning and a note. Change days in the day picker: the phrase changes and none of them is slang.
3. Open any lesson: the two boxes should be labelled **Standard German (written / formal)** and **Everyday spoken German**. Check a few days for leftovers like "n bisschen", "nen", "Bock", "krass".
4. In the browser console, run `Object.keys(localStorage)`: you should see `sevenDayPlan.v1` and `sevenDayPlan.v1.backup-before-boost`.
5. Reload the page and confirm nothing was lost.
