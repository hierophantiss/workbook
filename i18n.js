/* ═══════════════════════════════════════════
   i18n.js — Translations
   ═══════════════════════════════════════════ */

const T = {
  el: {
    // Nav
    navHome: 'Αρχική', navChapters: 'Κεφάλαια', navBreath: 'Αναπνοή',
    navExercises: 'Ασκήσεις', navJournal: 'Ημερολόγιο',

    // RPG Menu
    menuStart: 'Ξεκίνα', menuStartSub: 'Μανιφέστο · Πρώτα βήματα',
    menuChapters: 'Κεφάλαια', menuChaptersSub: 'Σώμα · Αναπνοή · Προσοχή · Χώρος',
    menuBreath: 'Αναπνοή', menuBreathSub: 'Άσκηση 4-2-6-1',
    menuExercises: 'Ασκήσεις', menuExercisesSub: '11 διαδραστικές ασκήσεις',
    menuJournal: 'Ημερολόγιο', menuJournalSub: 'Αναστοχασμός · 4 άξονες',
    menuAbout: 'Σχετικά', menuAboutSub: 'Trauma-informed · Επικοινωνία',
    menuDownloads: 'Λήψεις', menuDownloadsSub: 'PDF οδηγός · Εγκατάσταση app',

    // Manifesto
    manifestoTitle: 'Ανοιχτότητα, όχι έλεγχος',
    manifestoBody: 'Η απόρριψη δεν μένει μόνο στη μνήμη. Γίνεται σώμα — σφίξιμο, ένταση, συστολή. Κάθε φορά που κρίνεις τον εαυτό σου, την αναπαράγεις. Ο νους σου δεν είναι σπασμένος — λειτουργεί διαφορετικά.\\n\\nΑυτή η πρακτική δεν ζητάει έλεγχο. Ζητάει περιέργεια.\\n\\nΑντί «πρέπει να ηρεμήσω» → «τι παρατηρώ τώρα; ας κάνω μερικές απαλές εκπνοές.»\\n\\nΑντιμετώπισε τον εαυτό σου όπως έναν φίλο που δυσκολεύεται. Διαχώρισε τους άξονες — Σώμα, Αναπνοή, Προσοχή, Χώρος — και γνώρισέ τους, ένα πράγμα τη φορά. Δεν χρειάζεσαι εμπειρία — μόνο λίγες στιγμές.\\n\\nΌταν η καλοσύνη αντικαθιστά την κατάκριση, η ένταση παύει να είναι απειλή. Γίνεται απλώς αίσθηση. Ανοιχτότητα.',
    tryBreath: 'Δοκίμασε μια αναπνοή',
    startCh1: 'Κεφάλαιο 1',
    seeExercises: 'Δες μια άσκηση',

    // About
    traumaTitle: 'Γιατί αυτός ο οδηγός είναι trauma-informed',
    traumaText: '✦ Ξεκινά πάντα από το σώμα — όχι από τη σκέψη. Η γείωση δημιουργεί αίσθηση ασφάλειας πριν ζητηθεί οτιδήποτε άλλο.\\n\\n✦ Δεν ζητάει «άδειασμα του νου». Η προσοχή επιστρέφει, δεν ελέγχει. Κάθε αποτυχία είναι μέρος της άσκησης.\\n\\n✦ Σέβεται τα όρια — αν κάτι φέρνει δυσφορία, σταματάς.\\n\\n✦ Χρησιμοποιεί καλοσύνη αντί κατάκριση.',
    aboutTitle: 'Ο δημιουργός',
    aboutText: 'Ο Τετραπλός Άξονας δημιουργήθηκε από τον Θεόδωρο Μπαϊρακτάρη — νευροδιαφορετικό ασκούμενο με πάνω από 20 χρόνια πρακτικής σε παραδόσεις ενσυνειδητότητας: Tai Chi & Qi Gong, Σούφι διαλογισμό (Inayatiyya), και Θιβετιανό Βουδισμό (Samatha, Tsa Lung, Shine). Η μέθοδος γεννήθηκε από προσωπική ανάγκη για εργαλεία παρουσίας που λειτουργούν για τον νευροδιαφορετικό νου.',
    aboutContact: 'Ερωτήσεις ή σχόλια;',

    // Downloads
    dlPdfName: 'Οδηγός Ενσυνειδητότητας (PDF)',
    dlPdfDesc: 'Πλήρης οδηγός σε μορφή PDF για ανάγνωση offline',
    dlAppName: 'Εγκατάσταση Εφαρμογής',
    dlAppDesc: 'Πρόσβαση από την αρχική οθόνη · Λειτουργεί offline',

    // Stats
    statSessions: 'Συνεδρίες', statMinutes: 'Λεπτά', statStreak: 'Σερί', statExplored: 'Ασκήσεις',

    // Chapter nav
    prev: 'Προηγ.', next: 'Επόμενο',
    chPracticesLabel: 'Διαδραστικές Ασκήσεις',
    journalPlaceholder: 'Το ημερολόγιο θα ενεργοποιηθεί σύντομα',

    // Practices
    practices: [
      {id:'gravity', icon:'🧲', name:'Βαρύτητα & Σκέψεις', axis:'Σώμα', axisColor:'#7A9E7E',
       desc:'Πώς οι σκέψεις μετατοπίζουν το κέντρο βάρους — και πώς η γείωση σε φέρνει πίσω.',
       file:'gravity_thoughts.html'},
      {id:'touch', icon:'🤲', name:'Εσωτερική Αφή', axis:'Αναπνοή', axisColor:'#C07050',
       desc:'Νιώσε τον αέρα στα ρουθούνια, τη διαστολή, τον παλμό. Η αναπνοή ως αφή.',
       file:'eswterikhafh.html'},
      {id:'camera', icon:'📷', name:'Άσκηση Κάμερας', axis:'Προσοχή', axisColor:'#C8922A',
       desc:'Από zoom σε ανοιχτή επίγνωση. Πώς η εστίαση αλλάζει την αντίληψη.',
       file:'camera_exercise.html'},
      {id:'camera2', icon:'🎥', name:'Κάμερα: Zoom & Wide', axis:'Προσοχή', axisColor:'#C8922A',
       desc:'Εναλλαγή μεταξύ εστιασμένης και ανοιχτής προσοχής.',
       file:'cameraexercise.html'},
      {id:'three', icon:'🔺', name:'Τρεις Μορφές Προσοχής', axis:'Προσοχή', axisColor:'#C8922A',
       desc:'Εστιασμένη, ανοιχτή, διασπασμένη — η ίδια ενέργεια, τρεις κατευθύνσεις.',
       file:'three_attention.html'},
      {id:'samatha', icon:'◎', name:'Γεωμετρία Προσοχής', axis:'Προσοχή', axisColor:'#C8922A',
       desc:'Πώς η προσοχή εστιάζει, παγιδεύεται και επιστρέφει. Samatha & Vipassana.',
       file:'samatha_attention.html'},
      {id:'dispersion', icon:'⚡', name:'Διάσπαση Προσοχής', axis:'Προσοχή', axisColor:'#C8922A',
       desc:'Τι συμβαίνει χωρίς επιστροφή στον άξονα — αισθητηριακή υπερφόρτωση.',
       file:'attention_dispersion.html',
       warn:'Αυτή η άσκηση προσομοιώνει αισθητηριακή υπερφόρτωση. Αν είσαι σε ευαίσθητη κατάσταση, ίσως να μην είναι η κατάλληλη στιγμή.'},
      {id:'metro', icon:'🎵', name:'Μετρονόμος Παρουσίας', axis:'Σώμα · Χώρος', axisColor:'#B5A7D0',
       desc:'Ρυθμική κίνηση από το κέντρο. Η παρουσία ζει μέσα στην κίνηση.',
       file:'metronomos.html'},
      {id:'tree', icon:'🌳', name:'Άσκηση Δέντρο', axis:'Σώμα', axisColor:'#7A9E7E',
       desc:'Βιομηχανική ισορροπίας — λεκάνη, γλουτιαίος μέσος, ιδιοδεκτικότητα.',
       file:'treepose.html'},
      {id:'openaware', icon:'🌌', name:'Ανοιχτή Επίγνωση', axis:'Χώρος', axisColor:'#B5A7D0',
       desc:'Από τον εγκλωβισμό στις σκέψεις στην ανοιχτή παρουσία.',
       file:'openawareness.html'},
      {id:'racing', icon:'🌀', name:'Νους που Τρέχει', axis:'Σώμα · Αναπνοή', axisColor:'#C07050',
       desc:'Διάσπαση → Γείωση → Αναπνοή → Παρουσία.',
       file:'racing_mind.html'}
    ]
  },

  en: {
    navHome: 'Home', navChapters: 'Chapters', navBreath: 'Breath',
    navExercises: 'Exercises', navJournal: 'Journal',

    menuStart: 'Start', menuStartSub: 'Manifesto · First steps',
    menuChapters: 'Chapters', menuChaptersSub: 'Body · Breath · Attention · Space',
    menuBreath: 'Breath', menuBreathSub: 'Exercise 4-2-6-1',
    menuExercises: 'Exercises', menuExercisesSub: '11 interactive exercises',
    menuJournal: 'Journal', menuJournalSub: 'Reflection · 4 axes',
    menuAbout: 'About', menuAboutSub: 'Trauma-informed · Contact',
    menuDownloads: 'Downloads', menuDownloadsSub: 'PDF guide · Install app',

    manifestoTitle: 'Openness, not control',
    manifestoBody: 'Rejection doesn\'t just stay in memory. It becomes body — tightness, tension, contraction. Every time you judge yourself, you reproduce it. Your mind is not broken — it works differently.\\n\\nThis practice doesn\'t ask for control. It asks for curiosity.\\n\\nInstead of "I must calm down" → "what do I notice now? let me take a few gentle exhales."\\n\\nTreat yourself like a friend who is struggling. Separate the axes — Body, Breath, Attention, Space — and get to know them, one thing at a time. No experience needed — just a few moments.\\n\\nWhen kindness replaces judgment, tension stops being a threat. It becomes simply a sensation. Openness.',
    tryBreath: 'Try a breath',
    startCh1: 'Chapter 1',
    seeExercises: 'See an exercise',

    traumaTitle: 'Why this guide is trauma-informed',
    traumaText: '✦ Always starts with the body — not thought. Grounding creates safety before anything else is asked.\\n\\n✦ Does not ask you to "empty your mind." Attention returns, it does not control.\\n\\n✦ Respects boundaries — if something brings discomfort, you stop.\\n\\n✦ Uses kindness instead of judgment.',
    aboutTitle: 'The creator',
    aboutText: 'The Fourfold Axis was created by Theodoros Bairaktaris — a neurodivergent practitioner with over 20 years of practice in contemplative traditions: Tai Chi & Qi Gong, Sufi meditation (Inayatiyya), and Tibetan Buddhism (Samatha, Tsa Lung, Shine). The method was born from personal need for presence tools that work for the neurodivergent mind.',
    aboutContact: 'Questions or feedback?',

    dlPdfName: 'Mindfulness Guide (PDF)',
    dlPdfDesc: 'Full guide in PDF format for offline reading',
    dlAppName: 'Install Application',
    dlAppDesc: 'Access from home screen · Works offline',

    statSessions: 'Sessions', statMinutes: 'Minutes', statStreak: 'Streak', statExplored: 'Exercises',

    prev: 'Prev', next: 'Next',
    chPracticesLabel: 'Interactive Exercises',
    journalPlaceholder: 'Journal will be activated soon',

    practices: [
      {id:'gravity', icon:'🧲', name:'Gravity & Thoughts', axis:'Body', axisColor:'#7A9E7E',
       desc:'How thoughts shift your center of gravity — and how grounding brings you back.',
       file:'gravity_thoughts.html'},
      {id:'touch', icon:'🤲', name:'Internal Touch', axis:'Breath', axisColor:'#C07050',
       desc:'Feel the air at your nostrils, the expansion, the pulse. Breath as touch.',
       file:'eswterikhafh.html'},
      {id:'camera', icon:'📷', name:'Camera Exercise', axis:'Attention', axisColor:'#C8922A',
       desc:'From zoom to open awareness. How focus changes perception.',
       file:'camera_exercise.html'},
      {id:'camera2', icon:'🎥', name:'Camera: Zoom & Wide', axis:'Attention', axisColor:'#C8922A',
       desc:'Switching between focused and open attention.',
       file:'cameraexercise.html'},
      {id:'three', icon:'🔺', name:'Three Types of Attention', axis:'Attention', axisColor:'#C8922A',
       desc:'Focused, open, scattered — same energy, three directions.',
       file:'three_attention.html'},
      {id:'samatha', icon:'◎', name:'Attention Geometry', axis:'Attention', axisColor:'#C8922A',
       desc:'How attention focuses, gets caught, and returns. Samatha & Vipassana.',
       file:'samatha_attention.html'},
      {id:'dispersion', icon:'⚡', name:'Attention Dispersion', axis:'Attention', axisColor:'#C8922A',
       desc:'What happens without returning to the axis — sensory overload.',
       file:'attention_dispersion.html',
       warn:'This exercise simulates sensory overload. If you are in a sensitive state, this may not be the right time.'},
      {id:'metro', icon:'🎵', name:'Presence Metronome', axis:'Body · Space', axisColor:'#B5A7D0',
       desc:'Rhythmic movement from the center. Presence lives within movement.',
       file:'metronomos.html'},
      {id:'tree', icon:'🌳', name:'Tree Pose', axis:'Body', axisColor:'#7A9E7E',
       desc:'Balance biomechanics — pelvis, gluteus medius, proprioception.',
       file:'treepose.html'},
      {id:'openaware', icon:'🌌', name:'Open Awareness', axis:'Space', axisColor:'#B5A7D0',
       desc:'From entrapment in thought to open presence.',
       file:'openawareness.html'},
      {id:'racing', icon:'🌀', name:'Racing Mind', axis:'Body · Breath', axisColor:'#C07050',
       desc:'Dispersion → Grounding → Breath → Presence.',
       file:'racing_mind.html'}
    ]
  }
};
