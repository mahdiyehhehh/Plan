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

## B2 upgrade — Step 2: words and chunks the way a child learns them

No memorising lists, no case tables. Four new files, all loaded after `app.js`: `ext-glossary.js` (word list, data only), `ext-chunks.js` (situation chunks, data only), `ext-words.js` (the engine) and the three `<script>` lines in `index.html`. Saved data is only ever **added to** (`state.german.vocab`); nothing existing is renamed or deleted. Remove the three script tags and the site behaves exactly as before.

- **Tap any German word** in a lesson, test, reading text or listening transcript: meaning, article + plural, an example sentence from your own material, a Forvo link, dict.cc / Wiktionary links, and **Add to my deck**. Words missing from the glossary can still be saved with your own meaning.
- **Colour-coded nouns everywhere**: der blue, die red, das green.
- **Words you'll meet** before every test, listening, reading and mock-exam text, and **Words in this lesson** under every lesson without a vocabulary list.
- **New "Words" tab**:
  - *Flashcards* with Leitner boxes (1, 2, 4, 7, 14, 30 days), at most 20 new words a day. A card shows the English meaning and a sentence with a gap; the back shows article + plural and all chunk forms (das Kino / ins Kino / im Kino). Never a bare noun.
  - *Chunk Q&A*: a scene and a question ("Wohin gehst du?"), you say the chunk, then check. About 10 rounds per family per day.
  - *Fill the gap*: "Ich gehe ___ Kino." The situation is the only clue; a wrong answer is read aloud and comes back soon.
  - *Say it aloud*: shadow 5 chunks and rate them "automatic" or "still thinking" (those come back more often).
  - *Chunk library*: Wohin? / Wo? side by side with audio; an optional "Why?" for curious moments.
  - *My words*: your deck with its boxes.
- Contractions (ins, im, zum, zur, beim, vom, am, aufs, fürs, ums) are the main forms; long forms only appear in the optional "Why?" notes.

### How to test Step 2

1. Reload. Your streak, completed days and notes must look exactly as before.
2. In the **A1 → B2** area there is a new **Words** tab next to Reading.
3. Open any lesson and tap a word: a sheet opens with meaning, article, plural, example sentence and links. Tap **Add to my deck**.
4. Open **Tests**, **Listening** or **Reading**, open an item: a **Words you'll meet** box sits at the top.
5. **Words → Flashcards**, **Chunk Q&A**, **Fill the gap**, **Say it aloud**: finish one round of each. Reload and check **My words** still lists your deck.
6. In the console: `JSON.parse(localStorage.getItem("sevenDayPlan.v1")).german.vocab` shows your cards, and `Object.keys(localStorage)` still lists `sevenDayPlan.v1.backup-before-boost`.
