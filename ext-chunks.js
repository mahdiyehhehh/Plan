/* ===================== ext-chunks.js — Step 2 (data only) =====================
   Situation chunks for the "Words" tab. NO grammar tables: each variant is a real
   situation = a scene (emoji) + a question + the answer chunk + one sentence.
   Contractions (ins, im, zum, zur, beim, vom, am, aufs, fürs, ums ...) are the MAIN forms.
   Long forms (in das, in dem ...) only appear in the optional "Why?" notes.

   Variant fields:  sc = scene emoji · q = question · a = answer chunk
                    s  = sentence, the chunk to practise is wrapped in [[ ]]
                    en = English · n = the noun (colour-coded) · g = der|die|das
   To add your own chunk, copy a line below and append it to the list.
   ============================================================================== */
(function(){
  "use strict";
  const GO = e => "🚶➡️" + e, AT = e => "📍" + e;
  const CH = [];
  const V = (sc,q,a,s,en,n,g) => ({sc,q,a,s,en,n:n||null,g:g||null});

  /* two-way chunk: movement (Wohin?) and being there (Wo?) side by side */
  function pair(id, fam, e, g, n, goA, goS, atA, atS, enGo, enAt, qGo, qAt){
    CH.push({id, fam, v:[
      V(GO(e), qGo || "Wohin gehst du?", goA, goS, enGo, n, g),
      V(AT(e), qAt || "Wo bist du?",     atA, atS, enAt, n, g)
    ]});
  }
  function multi(id, fam, vs){ CH.push({id, fam, v:vs}); }

  /* ---------- Orte · everyday places ---------- */
  pair("kino","orte","🎬","das","Kino","Ins Kino.","Ich gehe [[ins]] Kino.","Im Kino.","Ich bin [[im]] Kino.","I'm going to the cinema.","I'm at the cinema.");
  pair("buero","orte","🏢","das","Büro","Ins Büro.","Ich gehe [[ins]] Büro.","Im Büro.","Ich bin [[im]] Büro.","I'm going to the office.","I'm in the office.");
  pair("stadt","orte","🏙️","die","Stadt","In die Stadt.","Ich fahre [[in die]] Stadt.","In der Stadt.","Ich bin [[in der]] Stadt.","I'm going into town.","I'm in town.");
  pair("schule","orte","🏫","die","Schule","In die Schule.","Ich gehe [[in die]] Schule.","In der Schule.","Ich bin [[in der]] Schule.","I'm going to school.","I'm at school.");
  pair("park","orte","🌳","der","Park","In den Park.","Ich gehe [[in den]] Park.","Im Park.","Ich bin [[im]] Park.","I'm going to the park.","I'm in the park.");
  pair("arzt","orte","🩺","der","Arzt","Zum Arzt.","Ich gehe [[zum]] Arzt.","Beim Arzt.","Ich bin [[beim]] Arzt.","I'm going to the doctor.","I'm at the doctor's.");
  pair("arbeit","orte","💼","die","Arbeit","Zur Arbeit.","Ich fahre [[zur]] Arbeit.","Bei der Arbeit.","Ich bin [[bei der]] Arbeit.","I'm going to work.","I'm at work.");
  pair("bank","orte","🏦","die","Bank","Zur Bank.","Ich gehe [[zur]] Bank.","Bei der Bank.","Ich bin [[bei der]] Bank.","I'm going to the bank.","I'm at the bank.");
  pair("hause","orte","🏠",null,"Hause","Nach Hause.","Ich gehe [[nach]] Hause.","Zu Hause.","Ich bin [[zu]] Hause.","I'm going home.","I'm at home.");
  pair("amt","orte","🏛️","das","Amt","Aufs Amt.","Ich gehe [[aufs]] Amt.","Auf dem Amt.","Ich bin [[auf dem]] Amt.","I'm going to the (government) office.","I'm at the office (Amt).");
  pair("supermarkt","orte","🛒","der","Supermarkt","In den Supermarkt.","Ich gehe [[in den]] Supermarkt.","Im Supermarkt.","Ich bin [[im]] Supermarkt.","I'm going to the supermarket.","I'm in the supermarket.");
  pair("kueche","orte","🍳","die","Küche","In die Küche.","Ich gehe [[in die]] Küche.","In der Küche.","Ich bin [[in der]] Küche.","I'm going into the kitchen.","I'm in the kitchen.");
  pair("baecker","orte","🥖","der","Bäcker","Zum Bäcker.","Ich gehe [[zum]] Bäcker.","Beim Bäcker.","Ich bin [[beim]] Bäcker.","I'm going to the baker's.","I'm at the baker's.");
  pair("bahnhof","orte","🚉","der","Bahnhof","Zum Bahnhof.","Ich fahre [[zum]] Bahnhof.","Am Bahnhof.","Ich bin [[am]] Bahnhof.","I'm going to the station.","I'm at the station.");
  pair("restaurant","orte","🍽️","das","Restaurant","Ins Restaurant.","Wir gehen [[ins]] Restaurant.","Im Restaurant.","Wir sind [[im]] Restaurant.","We're going to the restaurant.","We're in the restaurant.","Wohin geht ihr?","Wo seid ihr?");
  pair("garten","orte","🌷","der","Garten","In den Garten.","Ich gehe [[in den]] Garten.","Im Garten.","Ich bin [[im]] Garten.","I'm going into the garden.","I'm in the garden.");
  pair("bibliothek","orte","📚","die","Bibliothek","In die Bibliothek.","Ich gehe [[in die]] Bibliothek.","In der Bibliothek.","Ich bin [[in der]] Bibliothek.","I'm going to the library.","I'm in the library.");
  pair("post","orte","📮","die","Post","Zur Post.","Ich gehe [[zur]] Post.","Bei der Post.","Ich bin [[bei der]] Post.","I'm going to the post office.","I'm at the post office.");
  pair("urlaub","orte","🏖️","der","Urlaub","In den Urlaub.","Wir fahren [[in den]] Urlaub.","Im Urlaub.","Wir sind [[im]] Urlaub.","We're going on holiday.","We're on holiday.","Wohin fahrt ihr?","Wo seid ihr?");
  pair("bett","orte","🛏️","das","Bett","Ins Bett.","Ich gehe [[ins]] Bett.","Im Bett.","Ich bin [[im]] Bett.","I'm going to bed.","I'm in bed.");
  pair("wohnzimmer","orte","🛋️","das","Wohnzimmer","Ins Wohnzimmer.","Wir gehen [[ins]] Wohnzimmer.","Im Wohnzimmer.","Wir sind [[im]] Wohnzimmer.","We're going into the living room.","We're in the living room.","Wohin geht ihr?","Wo seid ihr?");
  pair("krankenhaus","orte","🏥","das","Krankenhaus","Ins Krankenhaus.","Er fährt [[ins]] Krankenhaus.","Im Krankenhaus.","Er ist [[im]] Krankenhaus.","He's going to hospital.","He's in hospital.","Wohin fährt er?","Wo ist er?");
  pair("berlin","orte","🐻",null,"Berlin","Nach Berlin.","Ich fahre [[nach]] Berlin.","In Berlin.","Ich wohne [[in]] Berlin.","I'm travelling to Berlin.","I live in Berlin.","Wohin fährst du?","Wo wohnst du?");
  pair("hamburg","orte","⚓",null,"Hamburg","Nach Hamburg.","Wir fahren [[nach]] Hamburg.","In Hamburg.","Meine Schwester wohnt [[in]] Hamburg.","We're going to Hamburg.","My sister lives in Hamburg.","Wohin fahrt ihr?","Wo wohnt deine Schwester?");
  pair("schwiegermutter","orte","👵","die","Schwiegermutter","Zu meiner Schwiegermutter.","Wir fahren [[zu meiner]] Schwiegermutter.","Bei meiner Schwiegermutter.","Wir sind [[bei meiner]] Schwiegermutter.","We're going to my mother-in-law's.","We're at my mother-in-law's.","Zu wem fahrt ihr?","Bei wem seid ihr?");

  /* ---------- Büro & Buchhaltung · office, accounting, Ausbildung ---------- */
  pair("buchhaltung","buero","📒","die","Buchhaltung","In die Buchhaltung.","Ich gehe [[in die]] Buchhaltung.","In der Buchhaltung.","Ich arbeite [[in der]] Buchhaltung.","I'm going to the accounting department.","I work in accounting.","Wohin gehst du?","Wo arbeitest du?");
  pair("finanzamt","buero","🏛️","das","Finanzamt","Zum Finanzamt.","Ich gehe [[zum]] Finanzamt.","Beim Finanzamt.","Ich bin [[beim]] Finanzamt.","I'm going to the tax office.","I'm at the tax office.");
  pair("berufsschule","buero","🎓","die","Berufsschule","Zur Berufsschule.","Ich fahre [[zur]] Berufsschule.","In der Berufsschule.","Ich bin [[in der]] Berufsschule.","I'm going to vocational school.","I'm at vocational school.");
  pair("rechnung","buero","🧾","die","Rechnung","Auf die Rechnung.","Ich schreibe die Nummer [[auf die]] Rechnung.","Auf der Rechnung.","Die Nummer steht [[auf der]] Rechnung.","I write the number onto the invoice.","The number is on the invoice.","Wohin schreibst du die Nummer?","Wo steht die Nummer?");
  multi("chef","buero",[
    V("👨‍💼","Mit wem sprichst du?","Mit dem Chef.","Ich spreche [[mit dem]] Chef.","I'm talking to the (male) boss.","Chef","der"),
    V("👩‍💼","Mit wem sprichst du?","Mit der Chefin.","Ich spreche [[mit der]] Chefin.","I'm talking to the (female) boss.","Chefin","die")
  ]);
  multi("kollege","buero",[
    V("🧑‍💻","Mit wem isst du?","Mit dem Kollegen.","Ich esse [[mit dem]] Kollegen.","I'm eating with my (male) colleague.","Kollegen","der"),
    V("👩‍💻","Mit wem isst du?","Mit der Kollegin.","Ich esse [[mit der]] Kollegin.","I'm eating with my (female) colleague.","Kollegin","die")
  ]);
  pair("steuerberaterin","buero","👩‍💼","die","Steuerberaterin","Zur Steuerberaterin.","Ich gehe [[zur]] Steuerberaterin.","Bei der Steuerberaterin.","Ich bin [[bei der]] Steuerberaterin.","I'm going to the tax advisor.","I'm at the tax advisor's.","Zu wem gehst du?","Bei wem bist du?");
  pair("kunde","buero","🤝","der","Kunden","Zum Kunden.","Ich fahre [[zum]] Kunden.","Beim Kunden.","Ich bin [[beim]] Kunden.","I'm driving to the customer.","I'm at the customer's.","Zu wem fährst du?","Bei wem bist du?");
  pair("ordner","buero","📁","der","Ordner","In den Ordner.","Ich lege die Rechnung [[in den]] Ordner.","Im Ordner.","Die Rechnung ist [[im]] Ordner.","I put the invoice into the folder.","The invoice is in the folder.","Wohin legst du die Rechnung?","Wo ist die Rechnung?");
  pair("konto","buero","💶","das","Konto","Aufs Konto.","Ich überweise das Geld [[aufs]] Konto.","Auf dem Konto.","Das Geld liegt [[auf dem]] Konto.","I transfer the money to the account.","The money is in the account.","Wohin überweist du das Geld?","Wo liegt das Geld?");
  pair("meeting","buero","🗓️","das","Meeting","Ins Meeting.","Ich gehe [[ins]] Meeting.","Im Meeting.","Ich bin [[im]] Meeting.","I'm going to the meeting.","I'm in a meeting.");
  pair("besprechung","buero","🗣️","die","Besprechung","In die Besprechung.","Ich gehe [[in die]] Besprechung.","In der Besprechung.","Ich bin [[in der]] Besprechung.","I'm going to the meeting.","I'm in the meeting.");
  pair("pause","buero","☕","die","Pause","In die Pause.","Ich gehe [[in die]] Pause.","In der Pause.","Ich bin [[in der]] Pause.","I'm going on my break.","I'm on my break.");
  pair("kantine","buero","🍲","die","Kantine","In die Kantine.","Wir gehen [[in die]] Kantine.","In der Kantine.","Wir sind [[in der]] Kantine.","We're going to the canteen.","We're in the canteen.","Wohin geht ihr?","Wo seid ihr?");
  pair("kasse","buero","🧾","die","Kasse","An die Kasse.","Ich gehe [[an die]] Kasse.","An der Kasse.","Ich stehe [[an der]] Kasse.","I'm going to the till.","I'm standing at the till.","Wohin gehst du?","Wo stehst du?");
  multi("email","buero",[ V("✉️","Wie schickst du die Rechnung?","Per E-Mail.","Ich schicke die Rechnung [[per]] E-Mail.","I send the invoice by email.","E-Mail","die") ]);
  multi("fuers-amt","buero",[ V("📑🏛️","Für wen ist die Steuererklärung?","Fürs Finanzamt.","Die Steuererklärung ist [[fürs]] Finanzamt.","The tax return is for the tax office.","Finanzamt","das") ]);
  multi("ausbildung","buero",[ V("🎓","Was machst du gerade?","In der Ausbildung.","Ich bin [[in der]] Ausbildung.","I'm in training (apprenticeship).","Ausbildung","die") ]);

  /* ---------- Unterwegs & Verben · transport + verbs with their pattern ---------- */
  multi("transport","verben",[
    V("🚌","Wie kommst du zur Arbeit?","Mit dem Bus.","Ich fahre [[mit dem]] Bus.","By bus.","Bus","der"),
    V("🚆","Wie kommst du zur Arbeit?","Mit der Bahn.","Ich fahre [[mit der]] Bahn.","By train.","Bahn","die"),
    V("🚗","Wie kommst du zur Arbeit?","Mit dem Auto.","Ich fahre [[mit dem]] Auto.","By car.","Auto","das"),
    V("🚲","Wie kommst du zur Arbeit?","Mit dem Fahrrad.","Ich fahre [[mit dem]] Fahrrad.","By bike.","Fahrrad","das"),
    V("🚶","Wie kommst du zur Arbeit?","Zu Fuß.","Ich gehe [[zu]] Fuß.","On foot.","Fuß","der")
  ]);
  multi("warten","verben",[
    V("🚌⏳","Worauf wartest du?","Auf den Bus.","Ich warte [[auf den]] Bus.","I'm waiting for the bus.","Bus","der"),
    V("🚆⏳","Worauf wartest du?","Auf die Bahn.","Ich warte [[auf die]] Bahn.","I'm waiting for the train.","Bahn","die"),
    V("📦⏳","Worauf wartest du?","Aufs Paket.","Ich warte [[aufs]] Paket.","I'm waiting for the parcel.","Paket","das"),
    V("🚕⏳","Worauf wartest du?","Aufs Taxi.","Ich warte [[aufs]] Taxi.","I'm waiting for the taxi.","Taxi","das")
  ]);
  multi("freuen","verben",[
    V("🎉","Worauf freust du dich?","Aufs Wochenende.","Ich freue mich [[aufs]] Wochenende.","I'm looking forward to the weekend.","Wochenende","das"),
    V("🏖️","Worauf freust du dich?","Auf den Urlaub.","Ich freue mich [[auf den]] Urlaub.","I'm looking forward to the holiday.","Urlaub","der"),
    V("💍","Worauf freust du dich?","Auf die Hochzeit.","Ich freue mich [[auf die]] Hochzeit.","I'm looking forward to the wedding.","Hochzeit","die")
  ]);
  multi("denken","verben",[
    V("💭🎉","Woran denkst du?","Ans Wochenende.","Ich denke [[ans]] Wochenende.","I'm thinking about the weekend.","Wochenende","das"),
    V("💭🏖️","Woran denkst du?","An den Urlaub.","Ich denke [[an den]] Urlaub.","I'm thinking about the holiday.","Urlaub","der"),
    V("💭📝","Woran denkst du?","An die Prüfung.","Ich denke [[an die]] Prüfung.","I'm thinking about the exam.","Prüfung","die")
  ]);
  multi("sprechen","verben",[
    V("💬☀️","Worüber sprecht ihr?","Übers Wetter.","Wir sprechen [[übers]] Wetter.","We're talking about the weather.","Wetter","das"),
    V("💬💼","Worüber sprecht ihr?","Über den Chef.","Wir sprechen [[über den]] Chef.","We're talking about the boss.","Chef","der"),
    V("💬🏢","Worüber sprecht ihr?","Über die Arbeit.","Wir sprechen [[über die]] Arbeit.","We're talking about work.","Arbeit","die")
  ]);
  multi("angst","verben",[
    V("😰📝","Wovor hast du Angst?","Vor der Prüfung.","Ich habe Angst [[vor der]] Prüfung.","I'm afraid of the exam.","Prüfung","die"),
    V("😰📋","Wovor hast du Angst?","Vorm Test.","Ich habe Angst [[vorm]] Test.","I'm afraid of the test.","Test","der"),
    V("😰🗣️","Wovor hast du Angst?","Vor dem Gespräch.","Ich habe Angst [[vor dem]] Gespräch.","I'm afraid of the conversation.","Gespräch","das")
  ]);
  multi("aergern","verben",[
    V("😠🚗","Worüber ärgerst du dich?","Über den Stau.","Ich ärgere mich [[über den]] Stau.","I'm annoyed about the traffic jam.","Stau","der"),
    V("😠🧾","Worüber ärgerst du dich?","Über die Rechnung.","Ich ärgere mich [[über die]] Rechnung.","I'm annoyed about the invoice.","Rechnung","die"),
    V("😠☔","Worüber ärgerst du dich?","Übers Wetter.","Ich ärgere mich [[übers]] Wetter.","I'm annoyed about the weather.","Wetter","das")
  ]);
  multi("kuemmern","verben",[
    V("🛠️🧾","Worum kümmerst du dich?","Um die Rechnung.","Ich kümmere mich [[um die]] Rechnung.","I'm taking care of the invoice.","Rechnung","die"),
    V("🛠️📅","Worum kümmerst du dich?","Um den Termin.","Ich kümmere mich [[um den]] Termin.","I'm taking care of the appointment.","Termin","der"),
    V("🛠️💶","Worum kümmerst du dich?","Ums Geld.","Ich kümmere mich [[ums]] Geld.","I'm taking care of the money.","Geld","das")
  ]);
  multi("fragen","verben",[
    V("❓💶","Wonach fragst du?","Nach dem Preis.","Ich frage [[nach dem]] Preis.","I'm asking about the price.","Preis","der"),
    V("❓🧾","Wonach fragst du?","Nach der Rechnung.","Ich frage [[nach der]] Rechnung.","I'm asking about the invoice.","Rechnung","die"),
    V("❓🗺️","Wonach fragst du?","Nach dem Weg.","Ich frage [[nach dem]] Weg.","I'm asking for directions.","Weg","der")
  ]);
  multi("telefonieren","verben",[
    V("📞👨","Mit wem telefonierst du?","Mit meinem Mann.","Ich telefoniere [[mit meinem]] Mann.","I'm on the phone with my husband.","Mann","der"),
    V("📞👵","Mit wem telefonierst du?","Mit meiner Schwiegermutter.","Ich telefoniere [[mit meiner]] Schwiegermutter.","I'm on the phone with my mother-in-law.","Schwiegermutter","die"),
    V("📞🤝","Mit wem telefonierst du?","Mit dem Kunden.","Ich telefoniere [[mit dem]] Kunden.","I'm on the phone with the customer.","Kunden","der"),
    V("📞👩‍💼","Mit wem telefonierst du?","Mit der Chefin.","Ich telefoniere [[mit der]] Chefin.","I'm on the phone with the boss.","Chefin","die")
  ]);
  multi("einladen","verben",[
    V("🍽️","Wozu lädst du uns ein?","Zum Essen.","Ich lade euch [[zum]] Essen ein.","I'm inviting you for a meal.","Essen","das"),
    V("💍","Wozu lädst du uns ein?","Zur Hochzeit.","Ich lade euch [[zur]] Hochzeit ein.","I'm inviting you to the wedding.","Hochzeit","die"),
    V("🎂","Wozu lädst du uns ein?","Zum Geburtstag.","Ich lade euch [[zum]] Geburtstag ein.","I'm inviting you to the birthday.","Geburtstag","der")
  ]);
  multi("bewerben","verben",[
    V("📄","Worum bewirbst du dich?","Um einen Ausbildungsplatz.","Ich bewerbe mich [[um einen]] Ausbildungsplatz.","I'm applying for a training place.","Ausbildungsplatz","der"),
    V("🏢","Bei wem bewirbst du dich?","Bei einer Firma.","Ich bewerbe mich [[bei einer]] Firma.","I'm applying to a company.","Firma","die")
  ]);
  multi("woher","verben",[
    V("🩺🏠","Woher kommst du?","Vom Arzt.","Ich komme [[vom]] Arzt.","I'm coming from the doctor's.","Arzt","der"),
    V("💼🏠","Woher kommst du?","Von der Arbeit.","Ich komme [[von der]] Arbeit.","I'm coming from work.","Arbeit","die"),
    V("🏢🏠","Woher kommst du?","Aus dem Büro.","Ich komme [[aus dem]] Büro.","I'm coming out of the office.","Büro","das"),
    V("🏫🏠","Woher kommst du?","Aus der Schule.","Ich komme [[aus der]] Schule.","I'm coming out of school.","Schule","die")
  ]);

  /* ---------- Zeit · "when?" chunks ---------- */
  multi("zeit1","zeit",[
    V("📅","Wann ist der Termin?","Am Montag.","Der Termin ist [[am]] Montag.","On Monday.","Montag","der"),
    V("🗓️","Wann fängst du an?","Im Januar.","Ich fange [[im]] Januar an.","In January.","Januar","der"),
    V("🕗","Wann beginnt das Meeting?","Um acht Uhr.","Das Meeting beginnt [[um]] acht Uhr.","At eight o'clock.","Uhr","die"),
    V("🛋️","Wann habt ihr Zeit?","Am Wochenende.","Wir haben [[am]] Wochenende Zeit.","At the weekend.","Wochenende","das"),
    V("🌙","Wann schläfst du?","In der Nacht.","Ich schlafe [[in der]] Nacht.","At night.","Nacht","die")
  ]);
  multi("zeit2","zeit",[
    V("🏢🚪","Wann gehst du einkaufen?","Nach der Arbeit.","Ich gehe [[nach der]] Arbeit einkaufen.","After work.","Arbeit","die"),
    V("🍳","Wann telefonierst du?","Vor dem Frühstück.","Ich telefoniere [[vor dem]] Frühstück.","Before breakfast.","Frühstück","das"),
    V("☕","Wann trinkst du Kaffee?","In der Pause.","Ich trinke [[in der]] Pause Kaffee.","In the break.","Pause","die"),
    V("🍽️","Wann sprecht ihr?","Beim Essen.","Wir sprechen [[beim]] Essen.","While eating.","Essen","das")
  ]);
  multi("zeit3","zeit",[
    V("⏳","Wie lange wohnst du hier?","Seit drei Monaten.","Ich wohne [[seit]] drei Monaten hier.","For three months (and still).","Monaten",null),
    V("⏮️","Wann war das?","Vor drei Monaten.","Das war [[vor]] drei Monaten.","Three months ago.","Monaten",null),
    V("⏭️","Wann kommt ihr?","In drei Monaten.","Wir kommen [[in]] drei Monaten.","In three months.","Monaten",null)
  ]);

  const FAM = [
    {id:"orte",   name:"Orte · everyday places",     why:"Moving towards a place (Wohin?) and being at a place (Wo?) use different little words: ins / im, in die / in der, zum / beim, zur / bei der, nach Hause / zu Hause. You do not need a rule — hear the scene, say the chunk, and it becomes automatic (like \"ins Kino\"). Curious? The short forms are: ins = in das, im = in dem, zum = zu dem, zur = zu der, beim = bei dem, am = an dem, aufs = auf das."},
    {id:"buero",  name:"Büro & Buchhaltung",          why:"Same idea at work: movement (zum Finanzamt, in die Buchhaltung, aufs Konto) versus being there (beim Finanzamt, in der Buchhaltung, auf dem Konto). Spoken German almost always uses the short forms (fürs = für das, im = in dem, aufs = auf das)."},
    {id:"verben", name:"Unterwegs & Verben",           why:"Some verbs always travel with the same little word (warten auf, sich freuen auf, denken an, sprechen über). Learn the verb together with its chunk, as one unit. Short forms: aufs = auf das, ans = an das, übers = über das, ums = um das, vorm = vor dem, vom = von dem."},
    {id:"zeit",   name:"Zeit · when?",                 why:"Time words also come as chunks: am Montag, im Januar, um acht Uhr, nach der Arbeit, seit drei Monaten. Say them as units. (am = an dem, im = in dem, beim = bei dem, vorm = vor dem.)"}
  ];

  window.XW_CHUNKS = CH;
  window.XW_FAMILIES = FAM;
})();
