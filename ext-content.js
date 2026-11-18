/* ===================== ext-content.js — Step 3c (new listening and reading content) =====================
   Adds 20 listening items and 20 reading items (A2 to B2, 3 questions each) to the existing lists
   LISTENING_EXERCISES and READING_PASSAGES from app.js. Same format as the existing items, so the
   Listening tab, Reading tab, timed mocks, XP and skill bars pick them up automatically.
   All texts are original and written for this site. Names, places and numbers are invented for practice.
   Needs (loaded before): app.js. Remove this script tag and the site behaves exactly as before.
   SAVED DATA: nothing is changed. New items get their own ids (l-a2-3 ... l-b2-8, r-a2-3 ... r-b2-8).
   ======================================================================================================= */
(function(){
  "use strict";
  if(window.__EXT_CONTENT__) return;
  if(typeof LISTENING_EXERCISES === "undefined" || typeof READING_PASSAGES === "undefined"){ console.warn("ext-content: app.js lists not found"); return; }
  window.__EXT_CONTENT__ = true;

  const Q = (q, options, answer, explain) => ({q, options, answer, explain});

  /* ============================== LISTENING (20) ============================== */
  const L = [
    /* ---------- A2 (7) ---------- */
    {id:"l-a2-3", level:"A2", title:"Beim Bäcker", topic:"Dialog · Einkaufen",
      script:"Guten Morgen! Was darf es sein? Ich hätte gern vier Brötchen und ein Vollkornbrot, bitte. Gern. Möchten Sie das Brot geschnitten? Ja, bitte. Sonst noch etwas? Ja, zwei Stück Apfelkuchen zum Mitnehmen. Das macht dann elf Euro fünfzig. Hier, bitte, zwölf Euro. Stimmt so. Vielen Dank, schönen Tag noch!",
      questions:[
        Q("Welches Brot kauft der Kunde?", ["Weißbrot","Vollkornbrot","Baguette"], 1, "„ein Vollkornbrot“"),
        Q("Wie viele Brötchen kauft er?", ["Drei","Sechs","Vier"], 2, "„vier Brötchen“"),
        Q("Wie viel kostet alles zusammen?", ["12,00 €","11,50 €","10,50 €"], 1, "„Das macht dann elf Euro fünfzig.“")
      ]},
    {id:"l-a2-4", level:"A2", title:"Der Wetterbericht", topic:"Radio · Wetter",
      script:"Und nun das Wetter für morgen. Im Norden ist es am Vormittag bewölkt, ab Mittag regnet es immer wieder, besonders an der Küste. Die Temperaturen liegen bei zwölf bis sechzehn Grad. Im Süden scheint dagegen oft die Sonne, dort wird es bis zu zweiundzwanzig Grad warm. Am Wochenende kommt der Regen auch in den Süden, nehmen Sie also einen Schirm mit.",
      questions:[
        Q("Wie wird das Wetter morgen im Norden?", ["Sonnig und warm","Bewölkt, ab Mittag Regen","Schnee an der Küste"], 1, "„ab Mittag regnet es immer wieder“"),
        Q("Wie warm wird es im Süden?", ["Bis zu 22 Grad","Bis zu 12 Grad","Bis zu 16 Grad"], 0, "„bis zu zweiundzwanzig Grad“"),
        Q("Was gilt für das Wochenende?", ["Im Süden bleibt es sonnig","Es wird sehr kalt","Der Regen kommt auch in den Süden"], 2, "„Am Wochenende kommt der Regen auch in den Süden.“")
      ]},
    {id:"l-a2-5", level:"A2", title:"Nachricht auf dem Anrufbeantworter", topic:"Nachricht · Termin",
      script:"Guten Tag, hier spricht Lena Hoffmann. Ich habe morgen um zehn Uhr einen Termin bei Ihnen zum Haareschneiden, aber leider muss ich arbeiten und kann nicht kommen. Könnten wir den Termin auf Donnerstag verschieben, am besten am Nachmittag? Meine Handynummer ist null eins sieben sechs, zwei drei vier, fünf sechs sieben. Vielen Dank und bis bald!",
      questions:[
        Q("Warum ruft Lena an?", ["Sie möchte eine Rechnung bezahlen","Sie möchte einen Termin verschieben","Sie hat ihr Handy verloren"], 1, "„Könnten wir den Termin auf Donnerstag verschieben?“"),
        Q("Warum kann sie morgen nicht kommen?", ["Sie muss arbeiten","Sie ist krank","Sie fährt in den Urlaub"], 0, "„leider muss ich arbeiten“"),
        Q("Wann wäre ein neuer Termin am besten?", ["Freitagmorgen","Donnerstagvormittag","Donnerstagnachmittag"], 2, "„auf Donnerstag ... am besten am Nachmittag“")
      ]},
    {id:"l-a2-6", level:"A2", title:"Durchsage: Zugverspätung", topic:"Durchsage · Reisen",
      script:"Achtung an Gleis drei. Der Regionalexpress nach Bremen hat voraussichtlich zwanzig Minuten Verspätung. Grund dafür ist eine technische Störung am Zug. Der Zug fährt nicht um acht Uhr fünfzehn, sondern um acht Uhr fünfunddreißig ab. Fahrgäste mit Anschluss nach Oldenburg nehmen bitte den Bus vor dem Bahnhof. Wir bitten um Entschuldigung.",
      questions:[
        Q("Wohin fährt der Zug?", ["Oldenburg","Hamburg","Bremen"], 2, "„Der Regionalexpress nach Bremen“"),
        Q("Wie lange hat der Zug Verspätung?", ["Zehn Minuten","Zwanzig Minuten","Fünfunddreißig Minuten"], 1, "„zwanzig Minuten Verspätung“"),
        Q("Was sollen Fahrgäste mit Anschluss nach Oldenburg tun?", ["Den Bus nehmen","Ein Taxi rufen","Am Gleis warten"], 0, "„nehmen bitte den Bus vor dem Bahnhof“")
      ]},
    {id:"l-a2-7", level:"A2", title:"Wegbeschreibung", topic:"Gespräch · Orientierung",
      script:"Entschuldigung, wie komme ich zur Stadtbibliothek? Das ist ganz einfach. Gehen Sie hier geradeaus bis zur Ampel, dann biegen Sie links ab. Nach etwa zweihundert Metern sehen Sie rechts eine Apotheke. Die Bibliothek ist direkt daneben. Ist das weit? Nein, zu Fuß sind es nur fünf Minuten. Vielen Dank!",
      questions:[
        Q("Wohin möchte die Person?", ["Zum Bahnhof","Zur Apotheke","Zur Stadtbibliothek"], 2, "„wie komme ich zur Stadtbibliothek?“"),
        Q("Wo muss sie links abbiegen?", ["An der Ampel","An der Apotheke","Nach zweihundert Metern"], 0, "„bis zur Ampel, dann biegen Sie links ab“"),
        Q("Wo liegt die Bibliothek?", ["Gegenüber der Ampel","Direkt neben der Apotheke","Hinter dem Bahnhof"], 1, "„Die Bibliothek ist direkt daneben.“")
      ]},
    {id:"l-a2-8", level:"A2", title:"Einladung zum Abendessen", topic:"Telefonat · Familie",
      script:"Hallo Mama, ich wollte fragen, ob ihr am Samstag zum Abendessen zu uns kommen könnt. Samstag passt gut, wann sollen wir da sein? Um halb sieben. Ich koche Linsensuppe, und mein Mann macht einen Salat. Sollen wir etwas mitbringen? Ja, bring bitte einen Nachtisch mit, vielleicht einen Kuchen. Gern, ich backe einen Apfelkuchen. Wunderbar, bis Samstag!",
      questions:[
        Q("Wann beginnt das Essen?", ["Sonntag um sieben","Samstag um halb sieben","Samstag um halb acht"], 1, "„Um halb sieben.“"),
        Q("Was gibt es zu essen?", ["Nudeln mit Soße","Fisch mit Reis","Linsensuppe und Salat"], 2, "„Ich koche Linsensuppe, und mein Mann macht einen Salat.“"),
        Q("Was bringt die Mutter mit?", ["Einen Apfelkuchen","Einen Salat","Getränke"], 0, "„ich backe einen Apfelkuchen“")
      ]},
    {id:"l-a2-9", level:"A2", title:"Termin beim Bürgeramt", topic:"Telefongespräch · Behörde",
      script:"Bürgeramt, guten Tag. Ich möchte meinen Wohnsitz ummelden, ich bin vor einer Woche umgezogen. Dafür brauchen Sie einen Termin. Der nächste freie Termin ist am Dienstag um neun Uhr zehn. Bitte bringen Sie Ihren Personalausweis und die Wohnungsgeberbestätigung mit. Was ist das? Das ist eine Bescheinigung von Ihrem Vermieter. Ach so, danke, dann bis Dienstag.",
      questions:[
        Q("Was möchte die Person machen?", ["Einen Pass beantragen","Ihren Wohnsitz ummelden","Einen Führerschein machen"], 1, "„Ich möchte meinen Wohnsitz ummelden.“"),
        Q("Wann ist der Termin?", ["Dienstag um 9:10 Uhr","Donnerstag um 9:10 Uhr","Dienstag um 10:09 Uhr"], 0, "„am Dienstag um neun Uhr zehn“"),
        Q("Was ist die Wohnungsgeberbestätigung?", ["Ein Brief vom Finanzamt","Ein Ausweis","Eine Bescheinigung vom Vermieter"], 2, "„Das ist eine Bescheinigung von Ihrem Vermieter.“")
      ]},

    /* ---------- B1 (7) ---------- */
    {id:"l-b1-3", level:"B1", title:"Anruf wegen einer Ausbildung", topic:"Telefongespräch · Beruf",
      script:"Guten Tag, mein Name ist Mara Seidel. Ich rufe an, weil ich mich für die Ausbildung zur Steuerfachangestellten in Ihrer Kanzlei interessiere. Haben Sie die Stelle noch frei? Ja, die ist noch frei. Schicken Sie uns bitte Ihren Lebenslauf, ein kurzes Anschreiben und Ihre letzten Zeugnisse per E-Mail. Die Ausbildung dauert drei Jahre und beginnt am ersten September. Kann ich vorher ein Praktikum machen? Das ist eine gute Idee. Wir laden Sie zuerst zu einem Gespräch ein, danach sehen wir weiter.",
      questions:[
        Q("Wofür interessiert sich Frau Seidel?", ["Für ein Studium der Betriebswirtschaft","Für eine Ausbildung zur Steuerfachangestellten","Für einen Minijob im Büro"], 1, "„die Ausbildung zur Steuerfachangestellten“"),
        Q("Welche Unterlagen soll sie schicken?", ["Nur ein Foto","Lebenslauf, Anschreiben und Zeugnisse","Nur ihren Lebenslauf"], 1, "„Lebenslauf, ein kurzes Anschreiben und Ihre letzten Zeugnisse“"),
        Q("Was passiert, bevor sie ein Praktikum macht?", ["Sie wird zu einem Gespräch eingeladen","Sie bekommt sofort einen Vertrag","Sie muss einen Test schreiben"], 0, "„Wir laden Sie zuerst zu einem Gespräch ein.“")
      ]},
    {id:"l-b1-4", level:"B1", title:"Verkehrsmeldung", topic:"Radio · Verkehr",
      script:"Hier die aktuellen Verkehrsmeldungen. Auf der A 1 zwischen Bremen und Hamburg staut sich der Verkehr wegen eines Unfalls auf zehn Kilometern, bitte rechnen Sie mit einer Wartezeit von etwa vierzig Minuten. Auf der A 7 ist die Strecke wegen Bauarbeiten nachts gesperrt. Die Bahn meldet Verspätungen auf mehreren Regionalstrecken, weil heute Morgen starke Windböen Bäume auf die Gleise geworfen haben. Wir empfehlen Pendlern, früher loszufahren.",
      questions:[
        Q("Warum gibt es einen Stau auf der A 1?", ["Wegen einer Baustelle","Wegen schlechten Wetters","Wegen eines Unfalls"], 2, "„wegen eines Unfalls“"),
        Q("Wie lange ist die Wartezeit?", ["Etwa 20 Minuten","Etwa 40 Minuten","Etwa 60 Minuten"], 1, "„Wartezeit von etwa vierzig Minuten“"),
        Q("Warum gibt es Verspätungen bei der Bahn?", ["Wegen eines Streiks","Wegen einer technischen Störung","Wegen Bäumen auf den Gleisen"], 2, "„starke Windböen Bäume auf die Gleise geworfen“")
      ]},
    {id:"l-b1-5", level:"B1", title:"Gespräch mit dem Vermieter", topic:"Dialog · Wohnen",
      script:"Guten Tag, Herr Brandt, ich habe die Nebenkostenabrechnung bekommen und verstehe eine Position nicht. Warum soll ich für den Hausmeister so viel zahlen? Die Kosten werden auf alle Mieter verteilt, Ihr Anteil liegt bei sechs Prozent. Aber im letzten Jahr waren es nur vier Prozent. Da haben Sie recht, ich schaue das noch einmal nach und rufe Sie bis Freitag zurück. Gut, und bitte schicken Sie mir die Belege als Kopie. Das mache ich gern.",
      questions:[
        Q("Worüber spricht die Mieterin?", ["Über eine Mieterhöhung","Über einen Wasserschaden","Über die Nebenkostenabrechnung"], 2, "„die Nebenkostenabrechnung“"),
        Q("Was versteht sie nicht?", ["Warum der Hausmeisteranteil höher ist als im Vorjahr","Warum sie keine Rechnung bekommen hat","Warum der Hausmeister unfreundlich ist"], 0, "Sie sagt: im letzten Jahr waren es nur vier Prozent, jetzt sechs."),
        Q("Was verspricht der Vermieter?", ["Er senkt die Miete sofort","Er schaut nach und ruft bis Freitag zurück","Er schickt einen Handwerker"], 1, "„ich schaue das noch einmal nach und rufe Sie bis Freitag zurück“")
      ]},
    {id:"l-b1-6", level:"B1", title:"Neue Radwege", topic:"Nachrichten · Verkehr",
      script:"Eine mittelgroße Stadt im Norden Deutschlands baut in den nächsten zwei Jahren ihr Radwegenetz aus. Insgesamt sollen dreißig Kilometer neue Radwege entstehen, außerdem werden mehrere gefährliche Kreuzungen umgebaut. Die Kosten liegen bei etwa acht Millionen Euro. Der Fahrradclub begrüßt das Projekt, kritisiert aber, dass es zu langsam gehe. Einige Geschäftsleute befürchten dagegen, dass durch den Umbau Parkplätze wegfallen.",
      questions:[
        Q("Was soll in den nächsten zwei Jahren passieren?", ["Das Radwegenetz wird ausgebaut","Eine neue Autobahn wird gebaut","Eine Straßenbahn wird gebaut"], 0, "„baut ... ihr Radwegenetz aus“"),
        Q("Wie viele Kilometer neue Radwege sind geplant?", ["3 Kilometer","300 Kilometer","30 Kilometer"], 2, "„dreißig Kilometer neue Radwege“"),
        Q("Was befürchten einige Geschäftsleute?", ["Weniger Kunden aus dem Ausland","Dass Parkplätze wegfallen","Dass die Mieten steigen"], 1, "„dass durch den Umbau Parkplätze wegfallen“")
      ]},
    {id:"l-b1-7", level:"B1", title:"Vortrag: Die Steuererklärung", topic:"Vortrag · Finanzen",
      script:"Viele Menschen in Deutschland geben jedes Jahr eine Steuererklärung ab, und viele von ihnen bekommen dabei Geld zurück. Wichtig ist, dass Sie Belege sammeln, zum Beispiel für Fahrtkosten zur Arbeit, für Arbeitsmittel oder für Fortbildungen. Die Frist für die Abgabe liegt in der Regel im Sommer des folgenden Jahres, wer einen Steuerberater hat, bekommt mehr Zeit. Am einfachsten geht es mit einem Programm im Internet, das Sie Schritt für Schritt durch die Formulare führt.",
      questions:[
        Q("Was sollen die Zuhörer sammeln?", ["Fotos","Belege","Kontoauszüge von Freunden"], 1, "„Wichtig ist, dass Sie Belege sammeln.“"),
        Q("Wer bekommt mehr Zeit für die Abgabe?", ["Wer einen Steuerberater hat","Wer im Ausland wohnt","Wer studiert"], 0, "„wer einen Steuerberater hat, bekommt mehr Zeit“"),
        Q("Was ist laut dem Vortrag am einfachsten?", ["Ein Papierformular","Ein Besuch beim Finanzamt","Ein Programm im Internet"], 2, "„Am einfachsten geht es mit einem Programm im Internet.“")
      ]},
    {id:"l-b1-8", level:"B1", title:"Urlaubsplanung im Büro", topic:"Dialog · Arbeit",
      script:"Hast du schon Urlaub für den Sommer eingetragen? Noch nicht, ich wollte erst mit meiner Familie sprechen. Wir fahren wahrscheinlich im August für zwei Wochen an die Ostsee. Dann müssen wir uns absprechen, denn im August hat auch Frau Köhler Urlaub, und zwei Leute aus unserer Abteilung dürfen nicht gleichzeitig fehlen. Dann nehme ich lieber die ersten beiden Septemberwochen. Das passt, ich trage es gleich in den Kalender ein.",
      questions:[
        Q("Wie lange will die Familie Urlaub machen?", ["Eine Woche","Zwei Wochen","Drei Wochen"], 1, "„für zwei Wochen an die Ostsee“"),
        Q("Warum gibt es ein Problem mit dem August?", ["Das Büro ist geschlossen","Es gibt im August keinen Urlaub","Frau Köhler hat auch Urlaub, und nicht zu viele dürfen fehlen"], 2, "„zwei Leute aus unserer Abteilung dürfen nicht gleichzeitig fehlen“"),
        Q("Wann nimmt die Person nun Urlaub?", ["Im Oktober","Im August","Die ersten beiden Septemberwochen"], 2, "„Dann nehme ich lieber die ersten beiden Septemberwochen.“")
      ]},
    {id:"l-b1-9", level:"B1", title:"Umfrage: Lesen und Hörbücher", topic:"Radio · Gesellschaft",
      script:"In einer Umfrage gaben viele Menschen an, dass sie weniger Bücher lesen als noch vor zehn Jahren. Während früher fast jeder Zweite regelmäßig zu einem Buch griff, ist es heute nur noch etwa jeder Dritte. Vor allem junge Leute verbringen ihre Freizeit lieber mit Videos und sozialen Medien. Gleichzeitig steigt die Zahl der Hörbücher: Viele Berufstätige hören sie im Auto oder beim Sport. Büchereien reagieren darauf und bieten ihren Kunden jetzt auch digitale Ausleihen an.",
      questions:[
        Q("Was hat sich laut der Umfrage verändert?", ["Die Menschen lesen mehr Bücher","Die Menschen lesen weniger Bücher","Die Menschen kaufen nur noch Zeitungen"], 1, "„weniger Bücher lesen als noch vor zehn Jahren“"),
        Q("Was machen junge Leute in ihrer Freizeit lieber?", ["Sport treiben","Hörbücher hören","Videos und soziale Medien nutzen"], 2, "„lieber mit Videos und sozialen Medien“"),
        Q("Wie reagieren Büchereien?", ["Sie bieten digitale Ausleihen an","Sie schließen","Sie erhöhen die Preise"], 0, "„bieten ihren Kunden jetzt auch digitale Ausleihen an“")
      ]},

    /* ---------- B2 (6) ---------- */
    {id:"l-b2-3", level:"B2", title:"Radiobeitrag: Fachkräftemangel", topic:"Radiobeitrag · Wirtschaft",
      script:"Der Fachkräftemangel betrifft inzwischen nahezu alle Branchen, vom Handwerk über die Pflege bis zur Informationstechnik. Wirtschaftsverbände fordern daher, die Zuwanderung qualifizierter Arbeitskräfte zu erleichtern und ausländische Abschlüsse schneller anzuerkennen. Kritiker wenden ein, dass allein dadurch das Problem nicht gelöst werde; man müsse auch die Ausbildung attraktiver machen und Frauen sowie Älteren bessere Möglichkeiten bieten, in Teilzeit zu arbeiten. Einigkeit besteht lediglich darin, dass es keine schnelle Lösung gibt.",
      questions:[
        Q("Welche Branchen sind vom Fachkräftemangel betroffen?", ["Nur das Handwerk","Fast alle Branchen","Nur die Informationstechnik"], 1, "„nahezu alle Branchen“"),
        Q("Was fordern die Wirtschaftsverbände?", ["Höhere Löhne für alle","Weniger Ausbildungsplätze","Leichtere Zuwanderung und schnellere Anerkennung von Abschlüssen"], 2, "„die Zuwanderung ... zu erleichtern und ausländische Abschlüsse schneller anzuerkennen“"),
        Q("Worin sind sich alle einig?", ["Es gibt keine schnelle Lösung","Das Problem ist bald gelöst","Nur die Politik kann helfen"], 0, "„Einigkeit besteht lediglich darin, dass es keine schnelle Lösung gibt.“")
      ]},
    {id:"l-b2-4", level:"B2", title:"Diskussion: Der Wohnungsmarkt", topic:"Diskussion · Gesellschaft",
      script:"Die Mieten in den Großstädten steigen seit Jahren schneller als die Einkommen. Das ist richtig, doch die Ursache liegt weniger bei den Vermietern als beim fehlenden Angebot: Es wird einfach zu wenig gebaut. Aber neue Wohnungen sind meist teuer, davon haben Menschen mit geringem Einkommen nichts. Kurzfristig mag das stimmen, auf Dauer entlastet jedoch jede neue Wohnung den Markt, weil dadurch andere Wohnungen frei werden.",
      questions:[
        Q("Was ist laut dem ersten Sprecher das Problem?", ["Die Einkommen sinken","Die Mieten steigen schneller als die Einkommen","Es gibt zu viele Vermieter"], 1, "„Die Mieten ... steigen ... schneller als die Einkommen.“"),
        Q("Was ist laut dem zweiten Sprecher die Hauptursache?", ["Gierige Vermieter","Zu hohe Steuern","Es wird zu wenig gebaut"], 2, "„Es wird einfach zu wenig gebaut.“"),
        Q("Was ist das Gegenargument des dritten Sprechers?", ["Auf Dauer entlastet jede neue Wohnung den Markt","Neue Wohnungen sind immer billig","Man sollte gar nicht mehr bauen"], 0, "„auf Dauer entlastet jedoch jede neue Wohnung den Markt“")
      ]},
    {id:"l-b2-5", level:"B2", title:"Vortrag: Sprachen lernen", topic:"Vortrag · Bildung",
      script:"Beim Sprachenlernen unterschätzen viele, wie wichtig regelmäßiger Kontakt ist. Wer täglich zwanzig Minuten übt, kommt langfristig weiter als jemand, der nur einmal pro Woche drei Stunden lernt. Fehler gehören dabei zum Prozess: Wer aus Angst vor Fehlern nicht spricht, verlangsamt seinen Fortschritt erheblich. Außerdem hilft es, neue Wörter nicht isoliert, sondern in ganzen Sätzen zu lernen, weil man sich so auch Grammatik und typische Wendungen merkt.",
      questions:[
        Q("Was bringt laut dem Vortrag mehr?", ["Einmal pro Woche drei Stunden","Täglich etwa zwanzig Minuten","Nur Grammatik lernen"], 1, "„Wer täglich zwanzig Minuten übt, kommt langfristig weiter.“"),
        Q("Was passiert, wenn man aus Angst vor Fehlern nicht spricht?", ["Man lernt schneller","Man macht keine Fehler mehr","Der Fortschritt wird langsamer"], 2, "„verlangsamt seinen Fortschritt erheblich“"),
        Q("Warum soll man Wörter in ganzen Sätzen lernen?", ["Man merkt sich so auch Grammatik und Wendungen","Sätze sind kürzer als Wörter","Man braucht dann kein Wörterbuch"], 0, "„weil man sich so auch Grammatik und typische Wendungen merkt“")
      ]},
    {id:"l-b2-6", level:"B2", title:"Podcast: Digitalisierung im Büro", topic:"Podcast · Arbeit",
      script:"In vielen Unternehmen werden Rechnungen und Verträge inzwischen nur noch digital bearbeitet. Das spart Papier und Platz, verändert aber auch die Arbeit in der Buchhaltung: Routineaufgaben übernimmt zunehmend die Software, während Fachleute sich stärker um Kontrolle und Beratung kümmern. Eine Steuerberaterin erklärt, dass sich niemand Sorgen um seinen Arbeitsplatz machen müsse, der bereit sei, ständig dazuzulernen. Gerade Auszubildende profitierten davon, weil sie mit digitalen Werkzeugen aufwachsen.",
      questions:[
        Q("Was bringt die digitale Bearbeitung laut dem Beitrag?", ["Mehr Papier","Weniger Kontrolle","Sie spart Papier und Platz"], 2, "„Das spart Papier und Platz“"),
        Q("Wie verändert sich die Arbeit in der Buchhaltung?", ["Die Software übernimmt Routine, Fachleute kontrollieren und beraten","Es gibt keine Buchhaltung mehr","Alle Aufgaben bleiben gleich"], 0, "„Routineaufgaben übernimmt zunehmend die Software“"),
        Q("Wer sollte sich laut der Steuerberaterin keine Sorgen machen?", ["Wer nur Papier benutzt","Wer bereit ist, ständig dazuzulernen","Wer schon lange im Beruf ist"], 1, "„niemand ..., der bereit sei, ständig dazuzulernen“")
      ]},
    {id:"l-b2-7", level:"B2", title:"Interview: Ehrenamt bei der Feuerwehr", topic:"Interview · Gesellschaft",
      script:"Herr Lindner, Sie engagieren sich seit zwölf Jahren in der Freiwilligen Feuerwehr. Warum? Anfangs wollte ich einfach etwas Sinnvolles tun, inzwischen sind die Kameraden fast eine zweite Familie. Kostet das nicht viel Zeit? Doch, durchschnittlich zehn Stunden pro Woche mit Übungen und Einsätzen, aber ich bekomme viel zurück. Und der Nachwuchs? Das ist unser größtes Problem. Immer weniger junge Leute sind bereit, sich langfristig zu verpflichten.",
      questions:[
        Q("Wie lange ist Herr Lindner schon bei der Feuerwehr?", ["Seit zwei Jahren","Seit zehn Jahren","Seit zwölf Jahren"], 2, "„seit zwölf Jahren“"),
        Q("Warum macht er weiter?", ["Er wird gut bezahlt","Die Kameraden sind fast eine zweite Familie","Es ist Pflicht"], 1, "„inzwischen sind die Kameraden fast eine zweite Familie“"),
        Q("Was ist das größte Problem der Feuerwehr?", ["Zu wenig Nachwuchs","Zu wenig Geld","Zu wenige Einsätze"], 0, "„Das ist unser größtes Problem. Immer weniger junge Leute ...“")
      ]},
    {id:"l-b2-8", level:"B2", title:"Kommentar: Vier-Tage-Woche", topic:"Kommentar · Arbeit",
      script:"Die Vier-Tage-Woche klingt verlockend: mehr Freizeit, weniger Stress, zufriedenere Mitarbeiter. Erste Pilotprojekte zeigen tatsächlich, dass viele Beschäftigte weniger krank sind und motivierter arbeiten. Allerdings lässt sich das Modell nicht auf jede Branche übertragen. Ein Krankenhaus oder ein Supermarkt kann nicht einfach einen Tag schließen. Deshalb sollten Unternehmen ausprobieren, was zu ihnen passt, statt eine pauschale Lösung zu fordern.",
      questions:[
        Q("Was zeigen erste Pilotprojekte?", ["Die Mitarbeiter sind unzufriedener","Viele Beschäftigte sind weniger krank und motivierter","Die Firmen machen mehr Verlust"], 1, "„weniger krank sind und motivierter arbeiten“"),
        Q("Warum passt das Modell nicht überall?", ["Es ist zu teuer","Es ist verboten","Ein Krankenhaus oder Supermarkt kann nicht einfach einen Tag schließen"], 2, "„Ein Krankenhaus oder ein Supermarkt kann nicht einfach einen Tag schließen.“"),
        Q("Was empfiehlt der Kommentator?", ["Ausprobieren, was zum Unternehmen passt","Das Modell überall sofort einführen","Das Modell ganz verbieten"], 0, "„sollten Unternehmen ausprobieren, was zu ihnen passt“")
      ]}
  ];

  /* ============================== READING (20) ============================== */
  const R = [
    /* ---------- A2 (7) ---------- */
    {id:"r-a2-3", level:"A2", title:"Einladung zum Sommerfest", topic:"Einladung · Alltag",
      passage:"Liebe Nachbarn,\n\nam Samstag, dem 14. Juni, feiern wir unser Sommerfest im Hof von Haus Nummer 12. Das Fest beginnt um 15 Uhr und dauert bis ungefähr 22 Uhr. Wir grillen Würstchen und Gemüse, Getränke gibt es gegen eine kleine Spende. Bitte bringt einen Salat oder einen Kuchen mit. Wenn es regnet, feiern wir im Treppenhaus im Erdgeschoss.\n\nBitte sagt bis Mittwoch Bescheid, wie viele Personen ihr seid.\n\nHerzliche Grüße\nFamilie Berger",
      questions:[
        Q("Wann beginnt das Fest?", ["Um 12 Uhr","Um 15 Uhr","Um 22 Uhr"], 1, "„Das Fest beginnt um 15 Uhr.“"),
        Q("Was sollen die Gäste mitbringen?", ["Getränke","Würstchen","Einen Salat oder einen Kuchen"], 2, "„Bitte bringt einen Salat oder einen Kuchen mit.“"),
        Q("Richtig oder falsch: Bei Regen fällt das Fest aus.", ["Richtig","Falsch"], 1, "Bei Regen feiern sie im Treppenhaus: „feiern wir im Treppenhaus im Erdgeschoss“.")
      ]},
    {id:"r-a2-4", level:"A2", title:"Wohnungsanzeige", topic:"Anzeige · Wohnen",
      passage:"2-Zimmer-Wohnung in Bremen-Neustadt\n58 m², 2. Stock, Altbau mit Balkon\nKüche und Bad vorhanden, Keller\nMiete: 640 € kalt, Nebenkosten: 140 €\nKaution: zwei Monatsmieten (kalt)\nFrei ab 1. Oktober\nHaustiere nur nach Absprache\nBesichtigung: Mittwoch ab 17 Uhr, bitte vorher anrufen.",
      questions:[
        Q("Wie viel Miete muss man ohne Nebenkosten zahlen?", ["640 €","780 €","140 €"], 0, "„Miete: 640 € kalt“"),
        Q("Wann ist die Wohnung frei?", ["Sofort","Ab 1. Oktober","Ab Mittwoch"], 1, "„Frei ab 1. Oktober“"),
        Q("Richtig oder falsch: Man darf in der Wohnung immer Haustiere haben.", ["Richtig","Falsch"], 1, "„Haustiere nur nach Absprache“")
      ]},
    {id:"r-a2-5", level:"A2", title:"E-Mail an die Hausverwaltung", topic:"E-Mail · Wohnen",
      passage:"Betreff: Heizung im Wohnzimmer defekt\n\nSehr geehrte Damen und Herren,\n\nseit Montag funktioniert die Heizung in meinem Wohnzimmer nicht mehr. Die anderen Heizungen sind in Ordnung. Das Wohnzimmer ist abends sehr kalt, besonders weil ich zwei kleine Kinder habe. Könnte bitte diese Woche jemand vorbeikommen? Ich bin ab 14 Uhr zu Hause. Meine Telefonnummer steht unten.\n\nVielen Dank im Voraus.\nMit freundlichen Grüßen\nLeyla Kaya",
      questions:[
        Q("Was ist das Problem?", ["Das Wasser ist kalt","Die Heizung im Wohnzimmer funktioniert nicht","Der Strom ist ausgefallen"], 1, "„funktioniert die Heizung in meinem Wohnzimmer nicht mehr“"),
        Q("Seit wann besteht das Problem?", ["Seit Montag","Seit gestern Abend","Seit einem Monat"], 0, "„seit Montag“"),
        Q("Was möchte Frau Kaya?", ["Eine neue Wohnung","Dass jemand diese Woche vorbeikommt","Weniger Miete zahlen"], 1, "„Könnte bitte diese Woche jemand vorbeikommen?“")
      ]},
    {id:"r-a2-6", level:"A2", title:"Plakat: Stadtfest", topic:"Plakat · Freizeit",
      passage:"STADTFEST AM HAFEN\nFreitag bis Sonntag, 6.–8. September\n\nFreitag: ab 18 Uhr Live-Musik auf der großen Bühne\nSamstag: 11 Uhr Flohmarkt, 14 Uhr Kinderprogramm, abends Feuerwerk\nSonntag: 10 Uhr Gottesdienst am Wasser, danach Familienfrühstück\n\nEintritt frei! Parken am Hafen nicht möglich, bitte nutzen Sie Bus und Bahn.\nHaltestelle: „Hafenstraße“",
      questions:[
        Q("Was gibt es am Freitagabend?", ["Einen Flohmarkt","Live-Musik","Ein Feuerwerk"], 1, "„Freitag: ab 18 Uhr Live-Musik“"),
        Q("Was kostet der Eintritt?", ["Fünf Euro","Zwei Euro für Kinder","Nichts"], 2, "„Eintritt frei!“"),
        Q("Richtig oder falsch: Man kann direkt am Hafen parken.", ["Richtig","Falsch"], 1, "„Parken am Hafen nicht möglich“")
      ]},
    {id:"r-a2-7", level:"A2", title:"Stellenanzeige: Servicekraft", topic:"Stellenanzeige · Arbeit",
      passage:"Café am Markt sucht Servicekraft (m/w/d) in Teilzeit\n\nIhre Aufgaben: Gäste bedienen, Getränke und Kuchen zubereiten, Tische sauber halten.\nWir bieten: 20 Stunden pro Woche, ein freundliches Team, faire Bezahlung und ein kostenloses Mittagessen.\nWir erwarten: Freude am Kontakt mit Menschen, Zuverlässigkeit und gute Deutschkenntnisse (mindestens A2).\nArbeitszeiten: meistens vormittags, ein Wochenende im Monat.\nBewerbung bitte per E-Mail.",
      questions:[
        Q("Wie viele Stunden pro Woche ist die Stelle?", ["10 Stunden","20 Stunden","40 Stunden"], 1, "„20 Stunden pro Woche“"),
        Q("Was gehört zu den Aufgaben?", ["Gäste bedienen","Autos reparieren","Kinder betreuen"], 0, "„Gäste bedienen“"),
        Q("Welche Deutschkenntnisse braucht man mindestens?", ["Keine","A2","C1"], 1, "„gute Deutschkenntnisse (mindestens A2)“")
      ]},
    {id:"r-a2-8", level:"A2", title:"Postkarte aus dem Urlaub", topic:"Postkarte · Freizeit",
      passage:"Liebe Oma, lieber Opa,\n\nviele Grüße von der Nordsee! Wir sind seit drei Tagen hier und das Wetter ist super. Jeden Morgen gehen wir am Strand spazieren, nachmittags baden wir oder lesen ein Buch. Gestern haben wir frischen Fisch gegessen, das war sehr lecker. Am Freitag fahren wir mit dem Schiff zu einer kleinen Insel. Wir vermissen euch und freuen uns auf das Wiedersehen am Sonntag!\n\nEure Hanna",
      questions:[
        Q("Wo ist Hanna?", ["In den Bergen","An der Nordsee","In einer Großstadt"], 1, "„Viele Grüße von der Nordsee!“"),
        Q("Was haben sie gestern gegessen?", ["Pizza","Eis","Frischen Fisch"], 2, "„Gestern haben wir frischen Fisch gegessen.“"),
        Q("Richtig oder falsch: Hanna sieht ihre Großeltern am Freitag wieder.", ["Richtig","Falsch"], 1, "Am Freitag fahren sie zu einer Insel; das Wiedersehen ist am Sonntag.")
      ]},
    {id:"r-a2-9", level:"A2", title:"Schild im Schwimmbad", topic:"Hinweis · Freizeit",
      passage:"HALLENBAD SÜD – BITTE BEACHTEN SIE:\n\n• Bitte duschen Sie vor dem Schwimmen.\n• Kinder unter 8 Jahren dürfen nur mit einem Erwachsenen ins Wasser.\n• Im Schwimmbereich bitte nicht rennen.\n• Wertsachen können Sie im Schließfach einschließen. Das Schließfach kostet einen Euro, den Sie nach dem Schwimmen zurückbekommen.\n• Das Bad schließt 30 Minuten vor Ende der Öffnungszeit. Die letzte Kasse ist um 20 Uhr.",
      questions:[
        Q("Was soll man vor dem Schwimmen tun?", ["Etwas essen","Duschen","Bezahlen"], 1, "„Bitte duschen Sie vor dem Schwimmen.“"),
        Q("Wer darf nur mit einem Erwachsenen ins Wasser?", ["Alle Kinder","Kinder unter 8 Jahren","Alle über 60"], 1, "„Kinder unter 8 Jahren dürfen nur mit einem Erwachsenen ins Wasser.“"),
        Q("Richtig oder falsch: Das Geld für das Schließfach bekommt man zurück.", ["Richtig","Falsch"], 0, "„einen Euro, den Sie nach dem Schwimmen zurückbekommen“")
      ]},

    /* ---------- B1 (7) ---------- */
    {id:"r-b1-3", level:"B1", title:"Anschreiben für eine Ausbildung", topic:"Brief · Beruf",
      passage:"Bewerbung um eine Ausbildung zur Steuerfachangestellten\n\nSehr geehrte Frau Albrecht,\n\nauf Ihrer Internetseite habe ich gelesen, dass Sie zum 1. September eine Auszubildende suchen. Ich bewerbe mich hiermit um diese Stelle. Zurzeit mache ich einen Deutschkurs auf dem Niveau B1 und lerne täglich, um mein Deutsch weiter zu verbessern. In meinem Heimatland habe ich zwei Jahre in einem Büro gearbeitet, dort war ich für Rechnungen und Ablage zuständig. Ich arbeite gern genau und selbstständig, und mich interessieren Zahlen. Über eine Einladung zu einem Vorstellungsgespräch würde ich mich sehr freuen.\n\nMit freundlichen Grüßen\nMara Seidel",
      questions:[
        Q("Wo hat die Bewerberin von der Stelle erfahren?", ["In einer Zeitung","Auf der Internetseite der Kanzlei","Von einer Freundin"], 1, "„auf Ihrer Internetseite habe ich gelesen“"),
        Q("Was hat sie in ihrem Heimatland gemacht?", ["Sie hat in einem Büro gearbeitet","Sie hat Medizin studiert","Sie war Lehrerin"], 0, "„zwei Jahre in einem Büro gearbeitet“"),
        Q("Richtig oder falsch: Die Bewerberin spricht noch kein Deutsch.", ["Richtig","Falsch"], 1, "Sie macht einen Deutschkurs auf dem Niveau B1 und lernt täglich.")
      ]},
    {id:"r-b1-4", level:"B1", title:"Zeitungsartikel: Die neue Stadtbibliothek", topic:"Zeitungsartikel · Gesellschaft",
      passage:"Nach zwei Jahren Bauzeit hat am Samstag die neue Stadtbibliothek eröffnet. Auf drei Etagen finden Besucher nicht nur Bücher, sondern auch Computerarbeitsplätze, ein Lesecafé und Räume für Kurse. Besonders beliebt ist die Kinderabteilung, in der es jeden Mittwoch eine Vorlesestunde gibt. Die Bibliothek ist montags bis samstags von 10 bis 19 Uhr geöffnet, der Ausweis kostet für Erwachsene zwölf Euro im Jahr, Kinder zahlen nichts. Die Bürgermeisterin sagte bei der Eröffnung, die Bibliothek solle ein Ort sein, „an dem sich jeder willkommen fühlt“.",
      questions:[
        Q("Wie lange hat der Bau gedauert?", ["Ein Jahr","Zwei Jahre","Drei Jahre"], 1, "„Nach zwei Jahren Bauzeit“"),
        Q("Was gibt es jeden Mittwoch?", ["Ein Konzert","Einen Computerkurs","Eine Vorlesestunde für Kinder"], 2, "„jeden Mittwoch eine Vorlesestunde“"),
        Q("Wer muss für den Bibliotheksausweis nichts bezahlen?", ["Kinder","Rentner","Studenten"], 0, "„Kinder zahlen nichts“")
      ]},
    {id:"r-b1-5", level:"B1", title:"Leserbrief: Tempo 30", topic:"Leserbrief · Gesellschaft",
      passage:"Zum Artikel „Tempo 30 in der ganzen Innenstadt“:\n\nIch wohne seit zwanzig Jahren an einer Hauptstraße und freue mich über die neue Regelung. Früher konnte man abends kaum mit offenem Fenster schlafen, so laut waren die Autos. Außerdem gab es viele gefährliche Situationen für Kinder auf dem Schulweg. Natürlich verstehe ich, dass Pendler jetzt etwas länger brauchen. Aber ein paar Minuten mehr Fahrzeit sind meiner Meinung nach ein kleiner Preis für mehr Sicherheit und weniger Lärm.\n\nPetra Wolter",
      questions:[
        Q("Wie findet Frau Wolter die neue Regelung?", ["Sie ist dagegen","Sie freut sich darüber","Sie ist ihr egal"], 1, "„freue mich über die neue Regelung“"),
        Q("Welches Problem gab es früher?", ["Zu wenig Parkplätze","Zu viele Fahrräder","Der Lärm der Autos und gefährliche Situationen"], 2, "„so laut waren die Autos“ und „gefährliche Situationen für Kinder“"),
        Q("Richtig oder falsch: Frau Wolter versteht die Sorgen der Pendler nicht.", ["Richtig","Falsch"], 1, "„Natürlich verstehe ich, dass Pendler jetzt etwas länger brauchen.“")
      ]},
    {id:"r-b1-6", level:"B1", title:"Forum: Tipps zum Deutschlernen", topic:"Forum · Lernen",
      passage:"Hallo zusammen,\n\nich lerne seit sechs Monaten Deutsch und komme beim Sprechen nicht richtig voran. Im Kurs verstehe ich fast alles, aber wenn ich mit Nachbarn rede, fällt mir kein Wort ein. Habt ihr Tipps? — Lina\n\nAntwort von Jonas: Mir hat geholfen, jeden Tag laut zu sprechen, auch allein. Ich beschreibe zum Beispiel, was ich gerade koche. Außerdem habe ich mir feste Sätze gemerkt, die man oft braucht, wie „Könnten Sie das bitte wiederholen?“.\n\nAntwort von Eva: Such dir ein Tandem. Mit einer Partnerin, die Deutsch als Muttersprache hat und selbst deine Sprache lernen möchte, wird das Sprechen viel entspannter.",
      questions:[
        Q("Was ist Linas Problem?", ["Sie versteht im Kurs nichts","Sie findet keine Zeit zum Lernen","Sie versteht viel, kann aber im Gespräch nicht gut sprechen"], 2, "„Im Kurs verstehe ich fast alles, aber ... fällt mir kein Wort ein.“"),
        Q("Was empfiehlt Jonas?", ["Jeden Tag laut sprechen und feste Sätze lernen","Nur Bücher lesen","Den Kurs wechseln"], 0, "„jeden Tag laut zu sprechen“ und „feste Sätze“"),
        Q("Was ist ein Tandem laut Eva?", ["Ein Wörterbuch","Eine Lernpartnerin, die selbst die andere Sprache lernt","Ein Online-Test"], 1, "„Partnerin, die Deutsch als Muttersprache hat und selbst deine Sprache lernen möchte“")
      ]},
    {id:"r-b1-7", level:"B1", title:"Information der Bank: Online-Banking", topic:"Mitteilung · Finanzen",
      passage:"Neu: Online-Banking mit Sicherheits-App\n\nAb dem 1. März ändert sich die Anmeldung im Online-Banking. Um Ihr Konto noch besser zu schützen, bestätigen Sie jede Überweisung künftig mit der Sicherheits-App auf Ihrem Smartphone. Die bisherige TAN-Liste auf Papier gilt dann nicht mehr. Die App können Sie kostenlos herunterladen. Wenn Sie Hilfe bei der Einrichtung brauchen, kommen Sie einfach in Ihre Filiale: Unsere Mitarbeiter richten die App gemeinsam mit Ihnen ein. Bitte geben Sie Ihr Passwort niemals an Dritte weiter, auch nicht am Telefon.",
      questions:[
        Q("Was ändert sich ab dem 1. März?", ["Das Konto kostet mehr","Überweisungen werden mit der Sicherheits-App bestätigt","Die Filialen schließen"], 1, "„bestätigen Sie jede Überweisung künftig mit der Sicherheits-App“"),
        Q("Was passiert mit der TAN-Liste auf Papier?", ["Sie gilt weiter","Sie wird per Post erneuert","Sie gilt nicht mehr"], 2, "„Die bisherige TAN-Liste auf Papier gilt dann nicht mehr.“"),
        Q("Wo bekommt man Hilfe bei der Einrichtung?", ["In der Filiale","Nur im Internet","Bei der Polizei"], 0, "„kommen Sie einfach in Ihre Filiale“")
      ]},
    {id:"r-b1-8", level:"B1", title:"Reisebericht: Ein Wochenende in Hamburg", topic:"Reisebericht · Freizeit",
      passage:"Letztes Wochenende waren wir zum ersten Mal in Hamburg. Wir sind am Freitagabend mit dem Zug angekommen und haben in einer kleinen Pension in der Nähe des Hafens übernachtet. Am Samstag haben wir eine Hafenrundfahrt gemacht, das hat uns am besten gefallen. Danach sind wir durch die Speicherstadt gelaufen und haben Fischbrötchen gegessen. Leider hat es am Nachmittag stark geregnet, deshalb sind wir ins Museum gegangen. Am Sonntag war das Wetter wieder schön, und wir haben einen Spaziergang an der Alster gemacht. Wir kommen bestimmt wieder!",
      questions:[
        Q("Womit sind sie nach Hamburg gefahren?", ["Mit dem Auto","Mit dem Zug","Mit dem Flugzeug"], 1, "„mit dem Zug angekommen“"),
        Q("Was hat ihnen am besten gefallen?", ["Das Museum","Die Pension","Die Hafenrundfahrt"], 2, "„Hafenrundfahrt gemacht, das hat uns am besten gefallen“"),
        Q("Warum sind sie am Samstagnachmittag ins Museum gegangen?", ["Es hat stark geregnet","Sie hatten Hunger","Das Museum war kostenlos"], 0, "„Leider hat es am Nachmittag stark geregnet, deshalb ...“")
      ]},
    {id:"r-b1-9", level:"B1", title:"Mülltrennung im Haus", topic:"Informationstext · Wohnen",
      passage:"Richtig Müll trennen: So geht's\n\nIn Deutschland wird Abfall in mehrere Tonnen sortiert. In die gelbe Tonne oder den gelben Sack gehören Verpackungen aus Plastik, Metall und Verbundstoffen, zum Beispiel Joghurtbecher oder Getränkekartons. Papier und Pappe kommen in die blaue Tonne. Gemüsereste und Gartenabfälle gehören in die Biotonne. Alles andere landet im Restmüll. Glasflaschen bringt man zu den Containern, die oft in der Nähe des Supermarkts stehen, und sortiert sie nach Farben. Pfandflaschen geben Sie im Supermarkt zurück und bekommen Ihr Geld wieder.",
      questions:[
        Q("Was kommt in die blaue Tonne?", ["Papier und Pappe","Verpackungen aus Plastik","Gemüsereste"], 0, "„Papier und Pappe kommen in die blaue Tonne.“"),
        Q("Wohin gehören Gemüsereste?", ["In den Restmüll","In die gelbe Tonne","In die Biotonne"], 2, "„Gemüsereste und Gartenabfälle gehören in die Biotonne.“"),
        Q("Was macht man mit Pfandflaschen?", ["Man wirft sie in den Glascontainer","Man gibt sie im Supermarkt zurück","Man wirft sie in den Restmüll"], 1, "„Pfandflaschen geben Sie im Supermarkt zurück und bekommen Ihr Geld wieder.“")
      ]},

    /* ---------- B2 (6) ---------- */
    {id:"r-b2-3", level:"B2", title:"Homeoffice und Produktivität", topic:"Sachtext · Arbeit",
      passage:"Seit Homeoffice für viele Beschäftigte zum Alltag gehört, streiten Unternehmen und Wissenschaftler darüber, ob zu Hause tatsächlich produktiver gearbeitet wird. Befürworter verweisen darauf, dass der Weg zur Arbeit entfällt und man sich konzentrierter an Aufgaben setzen kann, die Ruhe erfordern. Skeptiker halten dagegen, dass spontane Gespräche und der Austausch im Team verloren gehen, was besonders neuen Mitarbeitern das Einarbeiten erschwere. Viele Studien deuten darauf hin, dass ein Mischmodell am besten funktioniert: einige Tage Präsenz für Zusammenarbeit, einige Tage zu Hause für konzentrierte Einzelarbeit. Entscheidend ist letztlich, dass klare Absprachen getroffen werden.",
      questions:[
        Q("Welches Argument nennen Befürworter des Homeoffice?", ["Spontane Gespräche werden häufiger","Es fällt der Arbeitsweg weg, und man kann sich konzentrierter arbeiten","Das Einarbeiten wird einfacher"], 1, "„der Weg zur Arbeit entfällt“ und „konzentrierter“"),
        Q("Was kritisieren Skeptiker?", ["Der Austausch im Team geht verloren","Die Technik ist zu teuer","Man hat zu viel Freizeit"], 0, "„spontane Gespräche und der Austausch im Team gehen verloren“"),
        Q("Was zeigen viele Studien laut dem Text?", ["Homeoffice ist immer besser","Nur Büroarbeit ist produktiv","Ein Mischmodell funktioniert am besten"], 2, "„ein Mischmodell am besten funktioniert“")
      ]},
    {id:"r-b2-4", level:"B2", title:"Kommentar: Bargeld oder Karte?", topic:"Kommentar · Gesellschaft",
      passage:"In vielen Ländern zahlt man längst fast alles mit Karte oder Smartphone. In Deutschland dagegen hängt ein großer Teil der Bevölkerung nach wie vor am Bargeld. Wer so denkt, argumentiert meist mit Datenschutz und Kontrolle über die eigenen Ausgaben: Bargeld hinterlässt keine Spuren. Befürworter des bargeldlosen Zahlens betonen hingegen, dass es schneller, hygienischer und für Händler günstiger sei. Ein Verbot von Bargeld fordert allerdings kaum jemand. Realistisch erscheint vielmehr, dass beide Systeme noch lange nebeneinander bestehen, denn nicht jeder besitzt ein Smartphone oder ein Bankkonto, und auch diese Menschen müssen am Alltag teilnehmen können.",
      questions:[
        Q("Wie unterscheidet sich Deutschland laut dem Text von vielen anderen Ländern?", ["Man zahlt weniger mit Karte","Viele Menschen halten noch am Bargeld fest","Es gibt kein Bargeld mehr"], 1, "„hängt ein großer Teil der Bevölkerung nach wie vor am Bargeld“"),
        Q("Welches Argument nennen Befürworter des bargeldlosen Zahlens?", ["Es ist anonymer","Es ist teurer für Händler","Es ist schneller und günstiger für Händler"], 2, "„schneller, hygienischer und für Händler günstiger“"),
        Q("Was hält der Autor für realistisch?", ["Beide Zahlungsarten bestehen noch lange nebeneinander","Bargeld wird bald verboten","Alle werden Karten benutzen müssen"], 0, "„dass beide Systeme noch lange nebeneinander bestehen“")
      ]},
    {id:"r-b2-5", level:"B2", title:"Warum Schlaf so wichtig ist", topic:"Sachtext · Gesundheit",
      passage:"Wer dauerhaft zu wenig schläft, schadet nicht nur seiner Konzentration, sondern auch seinem Immunsystem. Im Schlaf verarbeitet das Gehirn, was wir tagsüber erlebt und gelernt haben, und sortiert wichtige von unwichtigen Informationen. Schlafforscher empfehlen Erwachsenen sieben bis neun Stunden pro Nacht, wobei der individuelle Bedarf unterschiedlich ist. Hilfreich sind feste Schlafenszeiten, ein dunkler, kühler Raum und der Verzicht auf Bildschirme in der letzten Stunde vor dem Zubettgehen. Kaffee am späten Nachmittag kann den Schlaf ebenfalls stören, selbst wenn man es beim Einschlafen nicht merkt.",
      questions:[
        Q("Was passiert im Schlaf mit unseren Erlebnissen?", ["Sie werden vom Gehirn verarbeitet und sortiert","Sie werden alle gelöscht","Sie bleiben unverändert"], 0, "„verarbeitet das Gehirn, was wir tagsüber erlebt und gelernt haben“"),
        Q("Wie viel Schlaf empfehlen Forscher Erwachsenen?", ["Vier bis fünf Stunden","Sieben bis neun Stunden","Zehn bis zwölf Stunden"], 1, "„sieben bis neun Stunden pro Nacht“"),
        Q("Welcher Tipp steht im Text?", ["Vor dem Schlafen noch Videos schauen","Abends starken Kaffee trinken","Auf Bildschirme in der letzten Stunde vor dem Zubettgehen verzichten"], 2, "„der Verzicht auf Bildschirme in der letzten Stunde“")
      ]},
    {id:"r-b2-6", level:"B2", title:"Ausbildung oder Studium?", topic:"Bericht · Beruf",
      passage:"Lange galt das Studium als der sichere Weg zu einer guten Karriere, doch immer mehr junge Menschen entscheiden sich bewusst für eine Ausbildung. Ein Vorteil: Schon während der Lehre erhalten sie ein Gehalt und sammeln praktische Erfahrung. Zudem sind die Übernahmechancen in vielen Berufen gut, weil Betriebe händeringend Nachwuchs suchen. Wer später doch studieren möchte, kann oft mit abgeschlossener Berufsausbildung und Berufserfahrung an eine Hochschule wechseln. Berufsberater betonen jedoch, dass es keine allgemein richtige Entscheidung gibt; wichtig sei, dass die Wahl zu den eigenen Stärken und Interessen passe.",
      questions:[
        Q("Was gilt als Vorteil einer Ausbildung?", ["Man bekommt schon während der Lehre ein Gehalt","Sie dauert nur ein Jahr","Sie ist immer besser bezahlt als ein Studium"], 0, "„Schon während der Lehre erhalten sie ein Gehalt“"),
        Q("Warum sind die Übernahmechancen oft gut?", ["Weil es nur wenige Betriebe gibt","Weil Betriebe dringend Nachwuchs suchen","Weil man keine Prüfung braucht"], 1, "„weil Betriebe händeringend Nachwuchs suchen“"),
        Q("Was sagen Berufsberater?", ["Jeder sollte studieren","Eine Ausbildung ist immer die bessere Wahl","Die Entscheidung sollte zu den eigenen Stärken und Interessen passen"], 2, "„dass die Wahl zu den eigenen Stärken und Interessen passe“")
      ]},
    {id:"r-b2-7", level:"B2", title:"Behördengänge im Internet", topic:"Sachtext · Verwaltung",
      passage:"Wer in Deutschland ein Auto anmelden, einen Umzug mitteilen oder Wohngeld beantragen will, muss häufig noch persönlich zur Behörde gehen. Das soll sich ändern: Bund und Länder arbeiten daran, möglichst viele Verwaltungsleistungen online anzubieten. Bisher scheitert das Vorhaben jedoch oft an uneinheitlichen Systemen, Datenschutzbedenken und fehlenden Fachkräften. Zudem nutzen noch zu wenige Bürger die Online-Ausweisfunktion ihres Personalausweises, die für viele digitale Anträge nötig ist. Experten sind sich einig, dass die Digitalisierung nur gelingen kann, wenn die Angebote einfach zu bedienen sind und man sich ohne Mühe sicher anmelden kann.",
      questions:[
        Q("Was ist das Ziel von Bund und Ländern?", ["Behörden zu schließen","Mehr Verwaltungsleistungen online anzubieten","Mehr Formulare auf Papier einzuführen"], 1, "„möglichst viele Verwaltungsleistungen online anzubieten“"),
        Q("Woran scheitert das Vorhaben bisher oft?", ["An der Bevölkerung, die nicht lesen kann","An zu vielen Fachkräften","An uneinheitlichen Systemen, Datenschutzbedenken und fehlenden Fachkräften"], 2, "„uneinheitlichen Systemen, Datenschutzbedenken und fehlenden Fachkräften“"),
        Q("Was ist laut Experten Voraussetzung für den Erfolg?", ["Die Angebote müssen einfach zu bedienen sein","Alle müssen einen Computer kaufen","Die Behörden müssen mehr Personal einstellen"], 0, "„wenn die Angebote einfach zu bedienen sind“")
      ]},
    {id:"r-b2-8", level:"B2", title:"Porträt: Berufsbild Buchhalterin", topic:"Porträt · Beruf",
      passage:"Wenn Sabine Krüger von ihrem Beruf erzählt, klingt das wenig nach staubigen Aktenordnern. Seit fünfzehn Jahren arbeitet sie als Buchhalterin in einem mittelständischen Betrieb im Norden. „Zahlen erzählen eine Geschichte“, sagt sie, „man muss nur lernen, sie zu lesen.“ Zu ihren Aufgaben gehören das Verbuchen von Rechnungen, die Vorbereitung der Umsatzsteuer und das Erstellen von Monatsabschlüssen. Die Digitalisierung hat ihre Arbeit verändert: Belege werden gescannt, und Routinebuchungen laufen automatisch. Dafür verbringt sie mehr Zeit mit Analysen und Gesprächen mit der Geschäftsführung. Wer den Beruf erlernen möchte, sollte genau arbeiten, Verschwiegenheit mitbringen und Freude an Zahlen haben.",
      questions:[
        Q("Seit wann arbeitet Frau Krüger als Buchhalterin?", ["Seit fünf Jahren","Seit fünfzehn Jahren","Seit fünfzig Jahren"], 1, "„Seit fünfzehn Jahren arbeitet sie als Buchhalterin“"),
        Q("Wie hat die Digitalisierung ihre Arbeit verändert?", ["Routinebuchungen laufen automatisch, sie macht mehr Analysen und Gespräche","Sie arbeitet nur noch mit Papier","Sie hat weniger Verantwortung"], 0, "„Routinebuchungen laufen automatisch“ und „mehr Zeit mit Analysen“"),
        Q("Welche Eigenschaften sollte man für den Beruf mitbringen?", ["Kreativität und Mut zum Risiko","Genauigkeit, Verschwiegenheit und Freude an Zahlen","Gute Kenntnisse in Medizin"], 1, "„genau arbeiten, Verschwiegenheit mitbringen und Freude an Zahlen haben“")
      ]}
  ];

  /* ============================== add to the existing lists ============================== */
  const have = arr => new Set(arr.map(x => x.id));
  const lHave = have(LISTENING_EXERCISES), rHave = have(READING_PASSAGES);
  let addedL = 0, addedR = 0;
  L.forEach(it => { if(!lHave.has(it.id)){ LISTENING_EXERCISES.push(it); addedL++; } });
  R.forEach(it => { if(!rHave.has(it.id)){ READING_PASSAGES.push(it); addedR++; } });
  console.info("ext-content: added", addedL, "listening and", addedR, "reading items");

  /* redraw the lists if the tabs were already drawn */
  try{ if(typeof renderListeningList === "function") renderListeningList(); }catch(e){}
  try{ if(typeof renderReadingList === "function") renderReadingList(); }catch(e){}
})();
