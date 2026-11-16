/* german-content-fixes.js — loaded AFTER app.js.
   Step 1 content fixes (standard everyday German, no youth slang / Southern phrases).
   Only edits in-memory lesson content. Never reads, writes or clears localStorage,
   so all saved progress (sevenDayPlan.v1) is untouched. */
(function(){
  try{
    // 1) Phrase of the Day: standard everyday German only
    const NEW_PHRASES = [
  {natural:"Alles klar?", exam:"Wie geht es dir?", meaning:"Everything okay? / How are you?", note:"A very common everyday greeting in all of Germany. Answer: \"Ja, alles klar.\" or \"Ja, und bei dir?\""},
  {natural:"Kein Problem.", exam:"Das ist kein Problem.", meaning:"No problem.", note:"The normal reply when someone says thank you or sorry for something small. Works with everyone."},
  {natural:"Mach's gut!", exam:"Auf Wiedersehen.", meaning:"Take care! (goodbye)", note:"For people you know: friends, colleagues, neighbours. Use \"Auf Wiedersehen\" for formal situations."},
  {natural:"Ich weiß es nicht.", exam:"Ich weiß es nicht.", meaning:"I don't know.", note:"Standard in every situation. Friends also say \"Keine Ahnung.\""},
  {natural:"Keine Ahnung.", exam:"Ich weiß es nicht.", meaning:"No idea.", note:"Everyday and friendly. Fine with friends and colleagues; with your boss, say \"Das weiß ich leider nicht.\""},
  {natural:"Ich habe keine Lust.", exam:"Ich möchte das nicht machen.", meaning:"I don't feel like it.", note:"Normal everyday German. \"Lust haben\" is the standard way to say you want or don't want to do something."},
  {natural:"Hast du Lust?", exam:"Möchtest du mitkommen?", meaning:"Do you feel like it? / Are you up for it?", note:"The standard way to invite someone: \"Hast du Lust, ins Kino zu gehen?\""},
  {natural:"Das ist in Ordnung.", exam:"Das ist in Ordnung.", meaning:"That's fine.", note:"Works everywhere. Everyday short forms: \"Okay.\" or \"Alles gut.\""},
  {natural:"Genau!", exam:"Das stimmt.", meaning:"Exactly! / Right!", note:"You'll hear it constantly in conversation to show you agree."},
  {natural:"Echt?", exam:"Wirklich?", meaning:"Really?", note:"The everyday reaction to surprising news. \"Wirklich?\" and \"Ach so?\" are also normal."},
  {natural:"Ach so.", exam:"Ich verstehe.", meaning:"Oh, I see.", note:"Said when you've just understood something. Very common and polite."},
  {natural:"Schade!", exam:"Das ist bedauerlich.", meaning:"What a pity! / Too bad!", note:"The everyday word for small disappointments."},
  {natural:"Bis später!", exam:"Auf Wiedersehen, bis später.", meaning:"See you later!", note:"When you'll see the person again the same day. \"Bis morgen!\" = see you tomorrow."},
  {natural:"Bis bald!", exam:"Auf Wiedersehen, bis bald.", meaning:"See you soon!", note:"A friendly goodbye when you'll meet again in the next days."},
  {natural:"Ich bin pleite.", exam:"Ich habe kein Geld.", meaning:"I'm broke.", note:"Common and understood everywhere. Neutral enough for friends and family."},
  {natural:"Es nieselt.", exam:"Es regnet ein bisschen.", meaning:"It's drizzling.", note:"Typical for the weather in northern and central Germany."},
  {natural:"Moment, bitte.", exam:"Einen Moment, bitte.", meaning:"One moment, please.", note:"Polite and normal with everyone, from shops to the office."},
  {natural:"Ich muss zur Toilette.", exam:"Ich muss zur Toilette.", meaning:"I need the toilet.", note:"Standard and polite. \"Wo ist die Toilette?\" is the question you'll need most."},
  {natural:"Mir geht es nicht so gut.", exam:"Ich fühle mich nicht wohl.", meaning:"I'm not feeling so well.", note:"Natural everyday small talk about health. Short form: \"Mir geht's nicht so gut.\""},
  {natural:"Wie bitte?", exam:"Wie bitte?", meaning:"Pardon? / Sorry, what?", note:"Use it when you didn't understand. Always safe and polite."},
  {natural:"Kannst du das wiederholen?", exam:"Können Sie das bitte wiederholen?", meaning:"Can you repeat that?", note:"With friends use \"du\", with strangers and at work use \"Sie\". Add \"bitte\" to be polite."},
  {natural:"Das macht nichts.", exam:"Das ist nicht schlimm.", meaning:"That doesn't matter.", note:"A kind reply to \"Entschuldigung\"."},
  {natural:"Ich nehme die Bahn.", exam:"Ich nehme die U-Bahn.", meaning:"I'll take the train.", note:"\"Die Bahn\" is the everyday word for train/metro in Germany. Spoken German often drops the final -e: \"Ich nehm die Bahn.\""},
  {natural:"Ich melde mich.", exam:"Ich werde mich bei Ihnen melden.", meaning:"I'll get in touch.", note:"Very common at work and with friends to end a conversation."},
  {natural:"Ich sehe mal nach.", exam:"Ich werde es überprüfen.", meaning:"I'll have a look.", note:"A relaxed, standard way to say you'll check something."},
  {natural:"Das passt gut.", exam:"Das passt mir gut.", meaning:"That suits me well.", note:"Use it to accept a time or plan: \"Dienstag um 10 passt gut.\""},
  {natural:"Gern geschehen.", exam:"Gern geschehen.", meaning:"You're welcome.", note:"The standard answer to \"Danke\". Short form: \"Gern.\""},
  {natural:"Stimmt so.", exam:"Der Rest ist für Sie.", meaning:"Keep the change.", note:"Said when paying in a café or restaurant and rounding up the bill."},
  {natural:"Das ist schön!", exam:"Das ist sehr schön.", meaning:"That's nice!", note:"A warm, everyday reaction to good news or a nice plan."},
  {natural:"Bis zum nächsten Mal!", exam:"Auf Wiedersehen, bis zum nächsten Mal.", meaning:"Until next time!", note:"A warm closing for a lesson, a visit or a meeting."}
];
    if(typeof SLANG_OF_DAY !== "undefined"){
      SLANG_OF_DAY.length = 0;
      NEW_PHRASES.forEach(function(p){ SLANG_OF_DAY.push(p); });
    }
    // 2) One lesson line contained slang ("krass")
    if(typeof GERMAN_DAYS !== "undefined"){
      const bad = "Die Nebenkosten sind echt gestiegen dieses Jahr, krass.";
      const good = "Die Nebenkosten sind dieses Jahr wirklich stark gestiegen.";
      GERMAN_DAYS.forEach(function(d){
        (d.lessons || []).forEach(function(l){
          Object.keys(l).forEach(function(k){
            if(typeof l[k] === "string" && l[k].indexOf(bad) !== -1) l[k] = l[k].split(bad).join(good);
          });
        });
      });
    }
  }catch(e){
    console.error("german-content-fixes.js skipped", e);
  }
})();
