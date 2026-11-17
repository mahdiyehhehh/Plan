/* ===================== ext-standard.js — Step 1 =====================
   Standard, everyday German (spoken across central & northern Germany).
   - Replaces the slang "phrase of the day" with phrases millions of people really use.
   - Cleans slang / sloppy spellings out of the lesson "everyday" sentences IN MEMORY ONLY.
   - Relabels the two sentence boxes so you know which is which.
   NOTHING here writes to or deletes your saved data (localStorage). It only changes what's displayed.
   ==================================================================== */
(function(){
  "use strict";

  /* ---- Safety net: keep ONE untouched copy of your saved data from before this update. ---- */
  try{
    if(typeof STORAGE_KEY !== "undefined"){
      const raw = localStorage.getItem(STORAGE_KEY);
      const bk = STORAGE_KEY + ".backup-before-boost";
      if(raw && !localStorage.getItem(bk)) localStorage.setItem(bk, raw);
    }
  }catch(e){ /* storage full or blocked — the app itself keeps working */ }

  /* ---- 1) Standard-German cleaner for the lesson "everyday" sentences ---- */
  const MASC = /^(Kaffee|Schrank|Schreibtisch|Lernplan|Mittelweg|Apfel|Termin|Brief|Platz|Tag|Satz|Tisch|großen|starken|ganzen|kleinen|neuen|guten)$/;
  function fixArticle(word){ return MASC.test(word) ? "einen" : "ein"; }

  const MANUAL = [
    [/Komm' aus/g, "Ich komme aus"],
    [/Ich check's grad nicht\./g, "Ich verstehe das gerade nicht."],
    [/total Bock auf/g, "richtig Lust auf"],
    [/keinen Bock/g, "keine Lust"],
    [/Bock auf/g, "Lust auf"],
    [/Hast du Bock,/g, "Hast du Lust,"],
    [/Ich hol mir noch schnell nen Apfel, ich hab nämlich voll Hunger\./g, "Ich hole mir noch schnell einen Apfel, ich habe nämlich richtig Hunger."],
    [/Ich zock gern und spiel zweimal die Woche Fußball, sonst chill ich meistens\./g, "Ich spiele gern am Computer und zweimal die Woche Fußball, sonst entspanne ich meistens."],
    [/Mir tut voll der Kopf weh/g, "Mir tut der Kopf richtig weh"],
    [/mir tut voll der Hals weh/g, "mir tut der Hals richtig weh"],
    [/heut mega gut drauf/g, "heute richtig gut gelaunt"],
    [/Meine Bude/g, "Meine Wohnung"],
    [/häng ich vorm Fernseher/g, "sitze ich vorm Fernseher"],
    [/Echt nicht\? Krass\./g, "Wirklich nicht? Das ist ungewöhnlich."],
    [/Ah cool, /g, "Ach so, "],
    [/schon voll aufs Wochenende/g, "schon sehr aufs Wochenende"],
    [/Wär schon cool, wenn/g, "Es wäre schön, wenn"],
    [/kein Ding\./g, "kein Problem."],
    [/auf'n Tisch/g, "auf den Tisch"],
    [/(^|[^A-Za-zÄÖÜäöüß])n bisschen/g, "$1ein bisschen"],
    [/(^|[^A-Za-zÄÖÜäöüß])n paar/g, "$1ein paar"],
    [/dieses Jahr, krass\./g, "dieses Jahr, das ist viel."],
    [/die Fahrt war easy/g, "die Fahrt war problemlos"],
    [/\bsorry\b,?/gi, m=>"Entschuldigung"+(m.endsWith(",")?",":"")],
    [/die Post checken/g, "die Post durchsehen"],
    [/voll oft/g, "ziemlich oft"],
    [/War voll müde/g, "Ich war sehr müde"],
    [/immer voll nervös/g, "immer ziemlich nervös"],
    [/Hey Anna, musst wissen,/g, "Hallo Anna, du musst wissen:"],
    [/ganz easy\./g, "ganz einfach."],
    [/früher pennen gehen/g, "früher schlafen gehen"],
    [/Das ist der Typ, dem/g, "Das ist der Mann, dem"]
  ];

  function standardize(s){
    if(typeof s !== "string") return s;
    let out = s;
    MANUAL.forEach(([re,rep])=>{ out = out.replace(re, rep); });
    // "n Kaffee", "n großen Tisch" -> ein/einen (only the tiny spoken "n" before a capital/adjective)
    out = out.replace(/(^|[\s,—-])n (\S+)/g, (m,pre,w)=> pre + fixArticle(w.replace(/[.,;!?]/g,"")) + " " + w);
    // 'nen / nen -> einen ; ne -> eine
    out = out.replace(/'nen\b/g, "einen").replace(/\bnen\b/g, "einen");
    out = out.replace(/\bne\b(?!\?)/g, "eine").replace(/\bso eine\b/g,"so eine");
    return out;
  }
  window.standardizeGerman = standardize;

  const seen = new WeakSet();   // some lesson objects are shared between lists — clean each one only once
  function cleanLessons(){
    [ "GERMAN_DAYS","GERMAN_DAYS_A2","GERMAN_DAYS_B1","GERMAN_DAYS_B2_PART1","GERMAN_DAYS_B2_PART2","GERMAN_DAYS_B2_PART3" ].forEach(name=>{
      let arr; try{ arr = eval(name); }catch(e){ return; }
      if(!Array.isArray(arr)) return;
      arr.forEach(day=> (day.lessons||[]).forEach(l=>{ if(l && typeof l.natural === "string" && !seen.has(l)){ seen.add(l); l.natural = standardize(l.natural); } }));
    });
  }

  /* ---- 2) New "phrase of the day": everyday standard German, North/Central flavour ---- */
  const P = (natural, exam, meaning, note)=>({natural, exam, meaning, note});
  const ALLTAG = [
    P("Moin!", "Guten Morgen! / Guten Tag!", "Hello! (any time of day)", "The standard greeting in northern and much of central Germany (Hamburg, Bremen, Kiel, Hannover). Said morning, noon, even afternoon. In the south you'd hear \"Servus\" or \"Grüß Gott\" instead."),
    P("Tschüss!", "Auf Wiedersehen!", "Bye!", "Everyone says it — shops, colleagues, neighbours. \"Auf Wiedersehen\" sounds quite formal in daily life."),
    P("Wie geht's dir?", "Wie geht es Ihnen?", "How are you?", "Answer: \"Gut, danke. Und dir?\" Use \"Wie geht's Ihnen?\" with people you call Sie."),
    P("Alles klar.", "Das ist in Ordnung.", "Okay. / Got it.", "A calm, neutral \"okay\" — you'll hear it dozens of times a day, from friends and strangers alike."),
    P("Genau.", "Das stimmt.", "Exactly. / Right.", "The standard way to agree with someone while they're talking."),
    P("Ach so.", "Ich verstehe.", "Oh, I see.", "Said when something finally clicks. Very common, completely neutral."),
    P("Na ja, ...", "Nun, ...", "Well, ...", "Starts a sentence when you're thinking or slightly unsure. Everyone uses it."),
    P("Ich hätte gern einen Kaffee.", "Ich möchte einen Kaffee, bitte.", "I'd like a coffee.", "\"Ich hätte gern ...\" is THE phrase for ordering in cafés, bakeries and restaurants."),
    P("Zusammen oder getrennt?", "Bezahlen Sie gemeinsam oder getrennt?", "Together or separate?", "What the waiter asks when you want to pay. You'll answer: \"Zusammen, bitte.\" or \"Getrennt, bitte.\""),
    P("Stimmt so.", "Der Rest ist für Sie.", "Keep the change.", "Said when paying — the normal way to tip in Germany (round up, then say \"Stimmt so\")."),
    P("Schönen Feierabend!", "Ich wünsche Ihnen einen schönen Abend.", "Enjoy your evening! (after work)", "Said to colleagues and shop staff at the end of the working day. Very German, very common."),
    P("Schönes Wochenende!", "Ich wünsche Ihnen ein schönes Wochenende.", "Have a nice weekend!", "Every Friday, to everyone: neighbours, colleagues, the cashier."),
    P("Mahlzeit!", "Guten Appetit!", "Enjoy your meal! (lunch hello)", "At work around lunchtime colleagues greet each other with \"Mahlzeit\" in northern and central Germany."),
    P("Entschuldigung, ...", "Entschuldigen Sie bitte, ...", "Excuse me, ...", "For getting attention or squeezing past someone. Works everywhere."),
    P("Wie bitte?", "Wie bitte? Können Sie das wiederholen?", "Pardon? / Sorry, what?", "Perfectly polite. Use it whenever you didn't catch something — nobody minds."),
    P("Kein Problem.", "Das ist kein Problem.", "No problem.", "The standard answer to \"Danke\" or \"Entschuldigung\" for small things. Also: \"Gern geschehen.\""),
    P("Doch!", "Doch, das stimmt.", "Yes, I do! (contradicting a \"no\")", "Answer a negative question with \"Doch\": \"Hast du keine Zeit?\" — \"Doch!\" (= Yes, I do.)"),
    P("Auf jeden Fall.", "Ja, selbstverständlich.", "Definitely.", "Strong, friendly \"yes\" that Germans use all the time."),
    P("Mal sehen.", "Ich werde es sehen.", "We'll see.", "The polite way to say \"maybe\" or \"I'll think about it\"."),
    P("Das ist mir recht.", "Das passt mir gut.", "That suits me fine.", "Used when someone suggests a time, place or plan and you agree."),
    P("Ich bin gleich da.", "Ich komme in wenigen Minuten.", "I'll be right there.", "Useful on the phone and in messages when you're almost there."),
    P("Hast du kurz Zeit?", "Haben Sie einen Moment Zeit?", "Do you have a minute?", "Polite way to start a quick question with a colleague or friend."),
    P("Sie sind dran.", "Sie sind jetzt an der Reihe.", "It's your turn.", "Heard in queues at the bakery, post office and office. \"Wer ist dran?\" = Who's next?"),
    P("Gesundheit!", "Gesundheit!", "Bless you!", "Said after someone sneezes — the same word everywhere."),
    P("Gute Besserung!", "Ich wünsche Ihnen gute Besserung.", "Get well soon!", "Say it to anyone who is ill. Very common at work and with neighbours."),
    P("Viel Erfolg!", "Ich wünsche Ihnen viel Erfolg.", "Good luck!", "For exams, interviews, new jobs — a warm, standard wish."),
    P("Herzlichen Glückwunsch!", "Herzlichen Glückwunsch!", "Congratulations! / Happy birthday!", "Used for birthdays, exams, weddings, new jobs."),
    P("Bis später!", "Bis später. Auf Wiedersehen.", "See you later!", "When you'll see the person again the same day."),
    P("Bis morgen!", "Bis morgen. Auf Wiedersehen.", "See you tomorrow!", "Goodbye to colleagues and classmates at the end of the day."),
    P("Moin moin!", "Guten Morgen!", "Hello! (northern, extra friendly)", "Double \"moin\" is typical for Hamburg and the coast — warm and relaxed. You've now got the everyday toolkit.")
  ];
  try{
    if(typeof SLANG_OF_DAY !== "undefined" && Array.isArray(SLANG_OF_DAY)){
      SLANG_OF_DAY.length = 0; ALLTAG.forEach(p=>SLANG_OF_DAY.push(p));
    }
  }catch(e){ console.warn("Phrase list not replaced", e); }

  /* ---- 3) Re-render the phrase card + relabel the sentence boxes ---- */
  window.renderSlangCard = function(){
    const card = document.getElementById("slangCard");
    if(!card) return;
    const item = SLANG_OF_DAY[(germanCurrentDay-1) % SLANG_OF_DAY.length];
    card.innerHTML = `
      <span class="slang-eyebrow">Alltagsdeutsch · everyday German <span class="day-of">· Day ${germanCurrentDay}</span></span>
      <h3 class="slang-phrase">${forvoWords(item.natural)}</h3>
      <p class="slang-exam">More formal: <strong>${forvoWords(item.exam)}</strong></p>
      ${tatoebaSentenceLinks(item.natural + " " + item.exam)}
      <p class="slang-meaning">${esc(item.meaning)}</p>
      <p class="slang-note">${esc(item.note)}</p>
    `;
  };

  function relabel(){
    document.querySelectorAll(".g-phrase-exam .g-phrase-tag").forEach(t=>{ t.textContent = "Standard German (written / formal)"; });
    document.querySelectorAll(".g-phrase-natural .g-phrase-tag").forEach(t=>{ t.textContent = "Everyday spoken German"; });
  }
  const _renderDailyCard = window.renderDailyCard;
  window.renderDailyCard = function(){ _renderDailyCard.apply(this, arguments); relabel(); };

  cleanLessons();
  window.__standardGermanReady = true;
})();
