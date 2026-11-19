# 7 Day Plan — Weekly Tracker

A clean, black/white/red version of your "7 Days Plan" PDF, turned into a website. Tracks German learning, university classes, money saved, job hours, your project, and the accounting certificate — week by week, forever. Switch to Month or Year to see totals automatically add up.

No build step, no backend, no database — it's plain HTML/CSS/JS. Everything you type is saved in your browser (`localStorage`) so it's still there next time you open the site on the same device/browser. Use the **Save backup** button anytime to download a `.json` copy of everything, and **Restore backup** to load it again (or move it to another device/browser).

## Files

```
index.html            → page structure and the script list
style.css             → black / white / red design
app.js                → all the logic (data, saving, week/month/year views)
ext-standard.js       → Step 1: standard everyday German
ext-glossary.js       → Step 2: word list (data only)
ext-glossary2.js      → Step 3c: more words for the new items + 11 gap words (data only)
ext-chunks.js         → Step 2: situation chunks (data only)
ext-words.js          → Step 2: words engine and Words tab
ext-fun.js            → Step 3a: Today screen, quest, XP, badges, streak freeze
ext-resources.js      → Step 3b: real-German links with "done today" ticks
ext-content.js        → Step 3c: 20 new listening + 20 new reading items
ext-kind.js           → Step 4 + 5: study blocks, kinder wording, clearer and calmer Today screen
tools/audit-vocab.js  → read-only check: which words appear in tests before they are taught
```

Script order in `index.html` matters. Each extension needs the ones before it:
`app.js`, `ext-standard.js`, `ext-glossary.js`, `ext-glossary2.js`, `ext-chunks.js`, `ext-words.js`, `ext-fun.js`, `ext-resources.js`, `ext-content.js`, `ext-kind.js`.

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

## B2 upgrade — Step 3a: the Today screen and the habit system

File: `ext-fun.js`. It adds a **Today** tab as the first tab of the A1 → B2 area, and the site opens on it.

- **One 10-minute quest a day:** 10 flashcards, 1 short listening, 1 sentence to say or write. Finishing it gives +50 XP and confetti. Rest Days keep the streak alive.
- **XP and levels**, worked out from your real records, so nothing double-counts. 26 badges (quests, streaks, words, listening, reading, weekly review, levels, lesson days, B1 and B2 mocks).
- **Streak with an earned freeze:** every 7th active day in a row earns one ❄️ freeze, which quietly covers one missed day. Rest Days add nothing but never break the streak.
- **Five skill bars:** Wortschatz, Hören, Lesen, Sprechen, Schreiben. Speaking and writing are self-rated.
- **Weekly mini-review:** 6 multiple-choice questions on words you collected recently (+40 XP).
- **Milestones:** B1 checkpoint around day 120, B2 mock exams in month 8.
- **Pace estimate** (on track / behind / ahead) and a **floating quest bar** while you are in another tab mid-quest.
- **Friendly nudge** replaces the old guilt nudge on the daily popup.

Saved data: only adds `state.german.fun` (quest, badges, minutes, sentences, weekly reviews, resource ticks, plan start date). Remove the script tag and the site behaves exactly as before.

### How to test Step 3a

1. Open **A1 → B2**. The **Today** tab should be first and selected, with the day card, the quest and a strip showing streak, freezes, level and XP.
2. Tap **Start quest**. It should open your flashcards. Finish some cards, come back, and the step count should update (the floating bar shows progress while you are in another tab).
3. Do the listening step (open the item, answer, tap Check Answers), then write or say the sentence. The quest should complete with a toast and confetti.
4. Tap **Take a Rest Day today**, then undo it. The streak number must not drop.
5. Open the weekly mini-review (needs at least 4 words in your deck) and finish it.
6. Reload: level, XP, badges and streak must be the same as before the reload.

## B2 upgrade — Step 3b: real German, with a "done today" tick

File: `ext-resources.js`. It adds a **Real German for today** card under the quest.

- 19 links in five slots: listening, reading, speaking, writing, words. Examples: Nicos Weg A1 and Top-Thema (DW), Easy German, tagesschau, NDR, Radio Bremen, Nachrichtenleicht, Goethe-Institut practice pages, Forvo, dict.cc, Wiktionary, Tatoeba. For work and accounting German at B1 and B2: Studyflix (Buchungssätze), "Buchführung einfach erklärt" and Bibi Bilanzierung (Uni Gießen).
- Only the links that fit your **current level** are shown. The rest sit under "Other levels".
- Every link opens in a **new tab**. Nothing is embedded.
- The round tick means "I did this today". It saves to `state.german.fun.res[date][id]`, counts for the streak, adds +10 XP and feeds the matching skill bar. Ticks are self-reported.
- Of the 19 links, 3 were opened or came back from a search with their real page content, 8 are exact addresses quoted by other pages, and 8 are front pages. Not every address has been opened live yet (see the last section).

### How to test Step 3b

1. On the Today tab, find **Real German for today**. The header shows your level and "0 ticked today".
2. Tap **Open ↗** on two links. Each should open in a new tab and the site should stay where it was.
3. Tick one resource: you should see a toast with +10 XP, "1 ticked today", and the matching skill bar should move.
4. Untick it. The count and the bar go back.
5. Open **Other levels** and check that the links there belong to other levels.
6. Reload: the tick for today must still be there.

## B2 upgrade — Step 3c: more listening, reading and words

Files: `ext-content.js` and `ext-glossary2.js`.

- **20 new listening items and 20 new reading items**, from A2 to B2, each with 3 questions. They appear in the normal **Listening** and **Reading** tabs next to the originals.
- **About 630 new words** for those items in `ext-glossary2.js`, plus 11 gap words (App, Bau, Café, Eis, elf, nun, per, Hof, Süd, TAN, Eva), so tapping a word in the new texts gives a real meaning.

### How to test Step 3c

1. Open **Listening** and **Reading**. There should be 20 more items in each than before, across A2 to B2.
2. Open a new item, play it or read it, answer the 3 questions and tap Check Answers.
3. Tap several words in the text. Each should show a meaning, and none should say that it is missing.
4. Add a new word to your deck and check that it appears in **Words → My words**.
5. Optional: `node tools/audit-vocab.js 30` lists words that appear in tests before they were taught (read-only).

## B2 upgrade — Step 4: study blocks, kinder wording, clearer Today screen

File: `ext-kind.js` (loaded last).

- **Study blocks:** 6 blocks of 30 minutes make 3 hours a day. Do them at any time of day, in any order. Each block can be ticked and unticked, adds 30 minutes to "Time studied today" and counts as an active day for the streak. A block you skip never takes anything away.
- **Kinder wording:** "Behind" becomes "Catching up", "Slightly behind" becomes "Nearly there", the "N behind" line is gone, the skill bars no longer show a where-you-should-be marker, and the words line no longer shows a target you "need" to hit.
- **Clearer Today screen:** the day card, the study blocks, the quest and the real-German links come first. Streak, bonus, pace, skills, weekly review, milestones and badges sit under one **More** fold. Text and buttons are bigger and the next undone quest step is highlighted.

Saved data: adds `state.german.fun.blocks`, and for each ticked block one `block-N` entry in `state.german.fun.res[date]` and +30 in `state.german.fun.minutes[date]`. Remove the script tag and the site behaves exactly as before.

### How to test Step 4

1. Open the Today tab. The order should be: day card, **Today's study time** (6 blocks), quest, **Real German for today**, then a **More** fold.
2. Tap a block: it turns green, the counter shows "1 of 6 blocks · 0.5 of 3 h", and "Time studied today" under **More** goes up by 30 minutes. Tap it again to undo.
3. Tick all 6 blocks: you should see a toast and confetti, and the bar should be full.
4. Open **More**. The pace card should never say "Behind" or "N behind". The skill bars should have no marker line.
5. In **Real German for today**, the "ticked today" number must not count the study blocks.
6. Reload: the ticked blocks must still be there, and open or closed state of **More** should not break the page.
7. Remove the `ext-kind.js` script tag locally: the site should look like Step 3b again, and nothing saved should be lost.

## B2 upgrade — Step 5: a calmer, Apple-style Today screen

File: `ext-kind.js` (a second `<style id="polishCss">` block at the bottom). CSS only: no saved data, no logic, no new files.

- **Soft cards:** white cards with a light shadow instead of heavy black borders. The page uses the German section's own colour tokens, so light and dark mode both work.
- **One accent colour:** crimson for progress, buttons and ticks. Finished study blocks turn soft green.
- **Quieter type:** sentence-case headings instead of small uppercase labels, a large "Day N" number, fainter supporting text.
- **Buttons:** the quest button is a wide rounded button; the small buttons are soft tinted pills. Every tap target is at least 44 px, with a tiny press animation (switched off for people who prefer reduced motion).
- **Next step** is shown with a soft tint instead of a red outline.
- **More** is one tappable row ("More — Streak, pace, skills, badges") with a chevron.
- The Week, Month and Year sheets and the other German tabs are not touched.

To go back to the Step 4 look, delete the `polishCss` block at the bottom of `ext-kind.js`.

### How to test Step 5

1. Open the Today tab on your phone, in light mode and then dark mode. Cards should be soft and borderless, with no heavy black outlines.
2. Tap a study block, start the quest, tick a Real German resource: everything should still work exactly as in Step 4.
3. Tap the **More** row: it opens and closes, and the chevron turns.
4. Check that text is readable and nothing is cut off on a narrow screen.
5. Open the Week, Month and Year views: they must look exactly as before.

## Still to do

- Open every link in `ext-resources.js` live and replace any address that no longer works. Not opened yet: the three accounting links added on 2026-11-19 (Studyflix, Buchführung einfach erklärt, Bibi Bilanzierung), the Nicos Weg A1 address, and all front-page links.
