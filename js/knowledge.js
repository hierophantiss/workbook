/* ═══════════════════════════════════════════
   knowledge.js — ∞ Companion Knowledge Map
   
   The companion's understanding of the Fourfold Axis method.
   Maps each chapter to:
   - Daily micro-tasks (small, actionable, guilt-free)
   - Wisdom quotes from the book
   - Contextual tips based on mood/time
   - Practice recommendations
   
   This makes the ∞ a true guide, not just a tracker.
   ═══════════════════════════════════════════ */

var COMPANION_KNOWLEDGE = {
  // ─── PER-CHAPTER GUIDANCE ───
  chapters: {
    1: {
      axis: 'body',
      icon: '🧍',
      microTasks: {
        el: [
          'Νιώσε τα πέλματά σου στο πάτωμα. Μόνο αυτό. 5 δευτερόλεπτα.',
          'Βάλε ένα βιβλίο στο κεφάλι σου. Νιώσε τον άξονα.',
          'Παρατήρησε πού έχεις ένταση. Σαγόνι; Ώμοι; Μην κάνεις τίποτα — μόνο παρατήρησε.',
          'Στάσου όρθιος. Νιώσε τη βαρύτητα να σε τραβά κάτω. Αυτό είναι το «εδώ».',
          'Ακούμπησε τα χέρια σου στα πόδια σου. Νιώσε τη ζεστασιά.'
        ],
        en: [
          'Feel your soles on the floor. Just that. 5 seconds.',
          'Place a book on your head. Feel the axis.',
          'Notice where you hold tension. Jaw? Shoulders? Don\'t fix it — just notice.',
          'Stand up. Feel gravity pulling you down. This is "here".',
          'Rest your hands on your legs. Feel the warmth.'
        ]
      },
      wisdom: {
        el: ['Η βαρύτητα είναι πάντα εδώ. Το σώμα είναι πάντα εδώ.', 'Μέσα στο σώμα δεν υπάρχουν έννοιες — μόνο αισθήσεις.', 'Η γείωση είναι ο διακόπτης: βγάζει τον νου από το σενάριο.'],
        en: ['Gravity is always here. The body is always here.', 'Inside the body there are no concepts — only sensations.', 'Grounding is a switch: it pulls the mind out of the script.']
      },
      whenStressed: {
        el: 'Νιώσε τα πέλματά σου. Η βαρύτητα δεν σε αφήνει ποτέ.',
        en: 'Feel your soles. Gravity never leaves you.'
      }
    },
    2: {
      axis: 'breath',
      icon: '🫁',
      microTasks: {
        el: [
          'Μία αναπνοή. Εισπνοή από τη μύτη, αργή εκπνοή από το στόμα.',
          'Νιώσε τον αέρα στα ρουθούνια. Κρύος ή ζεστός;',
          'Παρατήρησε χωρίς να αλλάξεις τίποτα: πόσο γρήγορη είναι η αναπνοή σου;',
          'Τρεις εκπνοές από το στόμα. Αργά. Σαν να σβήνεις κερί μακριά σου.',
          'Βάλε το χέρι στην κοιλιά. Νιώσε τη να ανεβοκατεβαίνει.'
        ],
        en: [
          'One breath. Inhale through the nose, slow exhale through the mouth.',
          'Feel the air at your nostrils. Cool or warm?',
          'Observe without changing anything: how fast is your breathing?',
          'Three mouth exhales. Slowly. Like blowing out a distant candle.',
          'Place your hand on your belly. Feel it rise and fall.'
        ]
      },
      wisdom: {
        el: ['Παρατηρώ χωρίς να επεμβαίνω. Κάθε αναπνοή είναι μια νέα αρχή.', 'Η αναπνοή δεν χρειάζεται έλεγχο — χρειάζεται παρατήρηση.', 'Η αργή εκπνοή ενεργοποιεί το φρένο του νευρικού συστήματος.'],
        en: ['I observe without intervening. Every breath is a new beginning.', 'Breath doesn\'t need control — it needs observation.', 'Slow exhale activates the brake of the nervous system.']
      },
      whenStressed: {
        el: 'Μία εκπνοή από το στόμα. Αργή. Μόνο αυτό αρκεί.',
        en: 'One mouth exhale. Slow. That\'s enough.'
      }
    },
    3: {
      axis: 'attention',
      icon: '👁',
      microTasks: {
        el: [
          'Κοίτα ένα σταθερό σημείο για 10 δευτερόλεπτα. Αν φύγεις, γύρνα.',
          'Βάλε ταμπέλα στην επόμενη σκέψη που θα σε τραβήξει: «Ανησυχία», «Σενάριο» ή «Κριτική».',
          'Ακολούθησε έναν ήχο μέχρι να σβήσει. Πόσο κράτησε;',
          'Κλείσε τα μάτια. Πού πηγαίνει πρώτα η προσοχή;',
          'Παρατήρησε 3 χρώματα γύρω σου. Χωρίς κρίση.'
        ],
        en: [
          'Look at a fixed point for 10 seconds. If you drift, return.',
          'Label the next thought that pulls you: "Worry", "Scenario" or "Criticism".',
          'Follow a sound until it fades. How long did it last?',
          'Close your eyes. Where does attention go first?',
          'Notice 3 colors around you. Without judgment.'
        ]
      },
      wisdom: {
        el: ['Η επιστροφή της προσοχής δεν είναι αποτυχία — είναι η ίδια η άσκηση.', 'Η ταμπέλα δημιουργεί απόσταση — δεν είσαι η σκέψη.', 'Η προσοχή έχει τρεις μορφές: εστιασμένη, ανοιχτή, διασπασμένη.'],
        en: ['Returning attention is not failure — it is the practice itself.', 'The label creates distance — you are not the thought.', 'Attention has three modes: focused, open, scattered.']
      },
      whenStressed: {
        el: 'Βάλε ταμπέλα: «Αυτή είναι η παλιά φωνή». Μετά γύρνα στο σώμα.',
        en: 'Label it: "That\'s the old voice." Then return to the body.'
      }
    },
    4: {
      axis: 'space',
      icon: '✦',
      microTasks: {
        el: [
          'Μαλάκωσε το βλέμμα. Άσε την περιφέρεια να υπάρχει.',
          'Ακούσε 3 ήχους ταυτόχρονα. Μη διάλεξες — άσε τους να υπάρχουν.',
          'Νιώσε τον χώρο γύρω σου. Τον αέρα, τους ήχους, το φως — όλα μαζί.',
          'Φαντάσου τον ουρανό. Εσύ είσαι ο ουρανός. Οι σκέψεις είναι σύννεφα.',
          'Κοίτα μακριά. Χωρίς εστίαση. Τι παρατηρείς;'
        ],
        en: [
          'Soften your gaze. Let the periphery exist.',
          'Hear 3 sounds at once. Don\'t choose — let them be.',
          'Feel the space around you. Air, sounds, light — all together.',
          'Imagine the sky. You are the sky. Thoughts are clouds.',
          'Look far away. Without focus. What do you notice?'
        ]
      },
      wisdom: {
        el: ['Δεν είσαι τα σύννεφα. Είσαι ο ουρανός που τα χωράει.', 'Η ανοιχτή προσοχή δεν ψάχνει — δέχεται.', 'Ο χώρος δεν είναι κενό — είναι πεδίο επίγνωσης.'],
        en: ['You are not the clouds. You are the sky that holds them.', 'Open attention doesn\'t search — it receives.', 'Space is not emptiness — it\'s a field of awareness.']
      },
      whenStressed: {
        el: 'Μαλάκωσε το βλέμμα. Υπάρχει χώρος γύρω σου. Πάντα υπάρχει.',
        en: 'Soften your gaze. There is space around you. There always is.'
      }
    },
    5: {
      axis: 'mind',
      icon: '🧠',
      microTasks: {
        el: [
          'Ο νους τρέχει ή κλειδώνει τώρα; Μόνο παρατήρησε.',
          'Αν τρέχει: νιώσε τα πέλματα + μία αναπνοή.',
          'Αν κλειδώνει: μαλάκωσε το βλέμμα + νιώσε τον χώρο.',
          'Μεταχειρίσου τον εαυτό σου όπως θα μεταχειριζόσουν έναν φίλο.',
          'Ο μηχανικός νους χρειάζεται ανάπαυση. Δώσε του 10 δευτερόλεπτα.'
        ],
        en: [
          'Is the mind racing or locking right now? Just notice.',
          'If racing: feel your soles + one breath.',
          'If locking: soften your gaze + feel the space.',
          'Treat yourself the way you would treat a struggling friend.',
          'The mechanical mind needs rest. Give it 10 seconds.'
        ]
      },
      wisdom: {
        el: ['Ο νους σου δεν είναι σπασμένος — λειτουργεί διαφορετικά.', 'Δεν πολεμάς τον εγκέφαλό σου. Συνεργάζεσαι μαζί του.', 'Η αυτοκριτική ενεργοποιεί τα ίδια κυκλώματα με τον εξωτερικό κίνδυνο.'],
        en: ['Your mind is not broken — it works differently.', 'You don\'t fight your brain. You collaborate with it.', 'Self-criticism activates the same circuits as external threat.']
      },
      whenStressed: {
        el: 'Αυτή η ένταση δεν γεννήθηκε μέσα σου. Είναι απόηχος.',
        en: 'This tension wasn\'t born inside you. It\'s an echo.'
      }
    },
    6: {
      axis: 'daily',
      icon: '☀',
      microTasks: {
        el: [
          'Στη δουλειά: 3 αναπνοές πριν ανοίξεις email.',
          'Στο λεωφορείο: νιώσε τα πέλματα στο πάτωμα.',
          'Σε θορυβώδη χώρο: άνοιξε την περιφερειακή όραση.',
          'Πριν τον ύπνο: εκπνοή από το στόμα, αργά, 3 φορές.',
          'Σε κοινωνική κατάσταση: βρες ένα ουδέτερο σημείο (φυτό, τοίχο).'
        ],
        en: [
          'At work: 3 breaths before opening email.',
          'On the bus: feel your soles on the floor.',
          'In a noisy space: open peripheral vision.',
          'Before sleep: mouth exhale, slowly, 3 times.',
          'In a social situation: find a neutral point (plant, wall).'
        ]
      },
      wisdom: {
        el: ['Μικρά βήματα, κάθε μέρα. Η συνέπεια σε μικρές δόσεις είναι πιο σημαντική από τη διάρκεια.'],
        en: ['Small steps, every day. Consistency in small doses matters more than duration.']
      },
      whenStressed: {
        el: 'Πέλματα → 3 εκπνοές → περιφερειακή όραση. 30 δευτερόλεπτα.',
        en: 'Soles → 3 exhales → peripheral vision. 30 seconds.'
      }
    },
    7: {
      axis: 'crisis',
      icon: '🌊',
      microTasks: {
        el: [
          'Πρωτόκολλο Άγχους: Βάρος → Εκπνοή → Ταμπέλα → Χώρος.',
          'Πρωτόκολλο Υπερφόρτωσης: Πέλματα → Ροή αναπνοής → Ένα σημείο → Μαλάκωσε.',
          'Τα ερεθίσματα είναι σύννεφα. Περνούν.',
          'Ποιο είναι το πρώτο σημάδι; Σαγόνι; Ώμοι; Στήθος;'
        ],
        en: [
          'Anxiety Protocol: Weight → Exhale → Label → Space.',
          'Overload Protocol: Soles → Breath flow → One point → Soften.',
          'Stimuli are clouds. They pass.',
          'What\'s the first signal? Jaw? Shoulders? Chest?'
        ]
      },
      wisdom: {
        el: ['Δεν είσαι τα σύννεφα. Είσαι ο ουρανός που τα χωράει.'],
        en: ['You are not the clouds. You are the sky that holds them.']
      },
      whenStressed: {
        el: 'Βάρος. Εκπνοή. Ταμπέλα. Χώρος. Τέσσερα βήματα, τώρα.',
        en: 'Weight. Exhale. Label. Space. Four steps, now.'
      }
    },
    8: {
      axis: 'worksheet',
      icon: '📋',
      microTasks: {
        el: [
          'ΣΩΜΑ: Νιώσε το βάρος σου.',
          'ΑΝΑΠΝΟΗ: Μία εκπνοή από το στόμα.',
          'ΠΡΟΣΟΧΗ: Πού είναι η προσοχή σου; Γύρνα σε ένα σημείο.',
          'ΧΩΡΟΣ: Μαλάκωσε. Θυμήσου τον ουρανό.'
        ],
        en: [
          'BODY: Feel your weight.',
          'BREATH: One mouth exhale.',
          'ATTENTION: Where is your attention? Return to a point.',
          'SPACE: Soften. Remember the sky.'
        ]
      },
      wisdom: {
        el: ['Στόχος: να επιστρέφεις στο «τώρα» σε λίγα δευτερόλεπτα.'],
        en: ['Goal: return to "now" in a few seconds.']
      },
      whenStressed: {
        el: 'Βάρος → Εκπνοή → Σημείο → Ουρανός.',
        en: 'Weight → Exhale → Point → Sky.'
      }
    },
    9: {
      axis: 'stages',
      icon: '👣',
      microTasks: {
        el: [
          'Στάδιο 1: Κάθισε. Νιώσε τα σημεία επαφής.',
          'Στάδιο 2: Κλείσε τα μάτια. Ακολούθησε την αναπνοή.',
          'Στάδιο 3: Άνοιξε τα μάτια. Σταθερό σημείο.',
          'Στάδιο 4: Μαλάκωσε. Νιώσε τα πάντα μαζί.'
        ],
        en: [
          'Stage 1: Sit. Feel contact points.',
          'Stage 2: Close eyes. Follow breath.',
          'Stage 3: Open eyes. Stable point.',
          'Stage 4: Soften. Feel everything together.'
        ]
      },
      wisdom: {
        el: ['Η παρουσία δεν χρειάζεται ώρες. Ξεκινά με νίκες λίγων δευτερολέπτων.', 'Η απαλότητα δεν είναι προαιρετική — είναι η ίδια η μέθοδος.'],
        en: ['Presence doesn\'t need hours. It starts with victories of a few seconds.', 'Gentleness is not optional — it is the method itself.']
      },
      whenStressed: {
        el: 'Επαφή → Αναπνοή → Σημείο → Ουρανός. Ακόμα και 20 δευτερόλεπτα αρκούν.',
        en: 'Contact → Breath → Point → Sky. Even 20 seconds is enough.'
      }
    },
    10: {
      axis: 'science',
      icon: '🔭',
      microTasks: {
        el: [
          'Ο εγκέφαλός σου αλλάζει τώρα. Κάθε πρακτική χτίζει νέους νευρωνικούς δρόμους.',
          'Η νησίδα (insula) ενισχύεται ακόμα και με 5 δευτερόλεπτα παρατήρησης.',
          '8 εβδομάδες πρακτικής αλλάζουν μετρήσιμα τον εγκέφαλο (Hölzel 2011).'
        ],
        en: [
          'Your brain is changing now. Every practice builds new neural pathways.',
          'The insula strengthens even with 5 seconds of observation.',
          '8 weeks of practice measurably change the brain (Hölzel 2011).'
        ]
      },
      wisdom: {
        el: ['Ο εγκέφαλός σου μπορεί να αλλάξει. Κάθε πρακτική χτίζει νέους νευρωνικούς διαδρόμους.'],
        en: ['Your brain can change. Every practice builds new neural pathways.']
      },
      whenStressed: {
        el: 'Αυτή η στιγμή αλλάζει τον εγκέφαλό σου. Κυριολεκτικά.',
        en: 'This moment is changing your brain. Literally.'
      }
    }
  },

  // ─── TIME-OF-DAY SUGGESTIONS ───
  timeOfDay: {
    morning: {
      el: { msg: 'Καλημέρα. Πώς νιώθεις σήμερα;', task: 'Μία εισπνοή από τη μύτη. Μία εκπνοή από το στόμα. Αρκεί.' },
      en: { msg: 'Good morning. How do you feel today?', task: 'One inhale through the nose. One exhale through the mouth. Enough.' }
    },
    afternoon: {
      el: { msg: 'Η μέση της μέρας. Πάρε 5 δευτερόλεπτα.', task: 'Νιώσε τα πέλματά σου. Πού είναι η ένταση; Μην τη διώξεις — νιώσε τη.' },
      en: { msg: 'Middle of the day. Take 5 seconds.', task: 'Feel your soles. Where\'s the tension? Don\'t push it away — feel it.' }
    },
    evening: {
      el: { msg: 'Η μέρα τελείωσε. Αφέσου.', task: 'Τρεις αργές εκπνοές από το στόμα. Σαν να σβήνεις κερί πολύ μακριά σου.' },
      en: { msg: 'Day is done. Let go.', task: 'Three slow mouth exhales. Like blowing out a very distant candle.' }
    }
  }
};

// ═══ GET SMART COMPANION MESSAGE ═══
// This replaces the basic messages with context-aware guidance
function getSmartCompanionMessage() {
  var lang = typeof LANG !== 'undefined' ? LANG : 'el';
  var data = companionData;
  var mood = typeof loadMood === 'function' ? loadMood() : -1;
  var totalChapters = 10;
  var now = new Date();
  var hour = now.getHours();

  // Determine time of day
  var timeKey = hour < 12 ? 'morning' : (hour < 18 ? 'afternoon' : 'evening');
  var timeData = COMPANION_KNOWLEDGE.timeOfDay[timeKey][lang];

  // Count progress
  var chaptersCompleted = 0;
  var keys = Object.keys(data.chapterProgress);
  for (var k = 0; k < keys.length; k++) {
    if (data.chapterProgress[keys[k]].completed) chaptersCompleted++;
  }

  // Find current/resume chapter
  var resumeChapter = null;
  var resumeScroll = 0;
  var progKeys = Object.keys(data.chapterProgress);
  for (var p = 0; p < progKeys.length; p++) {
    var prog = data.chapterProgress[progKeys[p]];
    if (!prog.completed && prog.scrollPct > 0.05 && prog.scrollPct < 0.85 && prog.scrollPct > resumeScroll) {
      resumeScroll = prog.scrollPct;
      resumeChapter = parseInt(progKeys[p]);
    }
  }

  var nextChapter = null;
  for (var i = 1; i <= totalChapters; i++) {
    if (!data.chapterProgress[i] || !data.chapterProgress[i].completed) { nextChapter = i; break; }
  }

  // Days since last visit
  var daysSince = 0;
  if (data.lastSeen) daysSince = Math.floor((now - new Date(data.lastSeen)) / 86400000);

  var messages = { primary: '', secondary: '', actions: [] };
  var chs = (typeof CHAPTERS_DATA !== 'undefined') ? (CHAPTERS_DATA[lang] || CHAPTERS_DATA.el) : [];

  // ─── MOOD: VERY BAD → SOS ───
  if (mood >= 0 && mood <= 1) {
    var crisisCh = COMPANION_KNOWLEDGE.chapters[7];
    messages.primary = crisisCh.whenStressed[lang];
    messages.secondary = lang === 'el'
      ? 'Δεν χρειάζεται να κάνεις τίποτα άλλο.'
      : 'You don\'t need to do anything else.';
    messages.actions = [
      { label: lang === 'el' ? '🆘 SOS Ηρεμία' : '🆘 SOS Calm', action: "showScreen('breath');setTimeout(activateSOS,400)" },
      { label: lang === 'el' ? '🫁 Αναπνοή' : '🫁 Breathe', action: "showScreen('breath')" }
    ];
    return messages;
  }

  // ─── RETURNING AFTER ABSENCE ───
  if (daysSince >= 2) {
    messages.primary = lang === 'el' ? 'Καλώς ήρθες πίσω.' : 'Welcome back.';
    
    // Pick a wisdom quote from their current chapter
    var currentCh = resumeChapter || nextChapter || 1;
    var chKnowledge = COMPANION_KNOWLEDGE.chapters[currentCh];
    if (chKnowledge) {
      var wisdomArr = chKnowledge.wisdom[lang];
      var wisdom = wisdomArr[Math.floor(Math.random() * wisdomArr.length)];
      messages.secondary = '«' + wisdom + '»';
    }

    if (resumeChapter && chs[resumeChapter - 1]) {
      messages.actions = [
        { label: chs[resumeChapter - 1].icon + ' ' + (lang === 'el' ? 'Συνέχισε' : 'Continue'), action: 'openChapter(' + resumeChapter + ')' }
      ];
    } else if (nextChapter && chs[nextChapter - 1]) {
      messages.actions = [
        { label: chs[nextChapter - 1].icon + ' ' + (lang === 'el' ? 'Πάμε' : 'Let\'s go'), action: 'openChapter(' + nextChapter + ')' }
      ];
    }
    return messages;
  }

  // ─── HAS PROGRESS → GIVE MICRO-TASK ───
  var activeChapter = resumeChapter || (nextChapter ? Math.max(1, nextChapter - 1) : null);
  if (activeChapter && COMPANION_KNOWLEDGE.chapters[activeChapter]) {
    var chK = COMPANION_KNOWLEDGE.chapters[activeChapter];
    var tasks = chK.microTasks[lang];
    
    // Pick a task based on day (so it rotates daily, not randomly per click)
    var dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
    var taskIdx = dayOfYear % tasks.length;
    var task = tasks[taskIdx];

    messages.primary = chK.icon + ' ' + task;
    
    // Add time-of-day flavor
    messages.secondary = timeData.msg;

    if (resumeChapter && chs[resumeChapter - 1]) {
      messages.actions = [
        { label: chs[resumeChapter - 1].icon + ' ' + (lang === 'el' ? 'Κεφάλαιο' : 'Chapter'), action: 'openChapter(' + resumeChapter + ')' },
        { label: lang === 'el' ? '🫁 Αναπνοή' : '🫁 Breathe', action: "showScreen('breath')" }
      ];
    } else if (nextChapter && chs[nextChapter - 1]) {
      messages.actions = [
        { label: chs[nextChapter - 1].icon + ' ' + (lang === 'el' ? 'Επόμενο' : 'Next'), action: 'openChapter(' + nextChapter + ')' },
        { label: lang === 'el' ? '🫁 Αναπνοή' : '🫁 Breathe', action: "showScreen('breath')" }
      ];
    } else {
      messages.actions = [
        { label: lang === 'el' ? '🫁 Αναπνοή' : '🫁 Breathe', action: "showScreen('breath')" }
      ];
    }
    return messages;
  }

  // ─── ALL DONE ───
  if (chaptersCompleted >= totalChapters) {
    var allWisdom = [];
    for (var c = 1; c <= 10; c++) {
      if (COMPANION_KNOWLEDGE.chapters[c]) {
        allWisdom = allWisdom.concat(COMPANION_KNOWLEDGE.chapters[c].wisdom[lang]);
      }
    }
    var randomWisdom = allWisdom[Math.floor(Math.random() * allWisdom.length)];
    messages.primary = '«' + randomWisdom + '»';
    messages.secondary = timeData.task;
    messages.actions = [
      { label: lang === 'el' ? '✦ Μικρή δόση' : '✦ Micro dose', action: "microCat='all';microIdx=0;showScreen('micro')" },
      { label: lang === 'el' ? '🫁 Αναπνοή' : '🫁 Breathe', action: "showScreen('breath')" }
    ];
    return messages;
  }

  // ─── DEFAULT: FIRST VISIT ───
  messages.primary = timeData.msg;
  messages.secondary = timeData.task;
  messages.actions = [
    { label: lang === 'el' ? '📖 Ξεκίνα' : '📖 Start', action: "showScreen('chapters')" },
    { label: lang === 'el' ? '🫁 Αναπνοή' : '🫁 Breathe', action: "showScreen('breath')" }
  ];
  return messages;
}

// ═══ PATCH COMPANION TO USE KNOWLEDGE ═══
function patchCompanionWithKnowledge() {
  if (typeof getCompanionMessage !== 'function') return;
  
  // Replace the companion's message function with our smart version
  window.getCompanionMessage = getSmartCompanionMessage;
}

// ═══ INIT ═══
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    patchCompanionWithKnowledge();
  }, 700);
});
