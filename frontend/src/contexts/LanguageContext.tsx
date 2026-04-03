import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'EN' | 'TE';

interface Translations {
  [key: string]: {
    EN: string;
    TE: string;
  };
}

const dictionary: Translations = {
  // Sidebar & Nav
  "nav.dashboard": { EN: "Dashboard", TE: "డాష్‌బోర్డ్" },
  "nav.medicines": { EN: "Medicines", TE: "మందులు" },
  "nav.routine": { EN: "Routine", TE: "దినచర్య" },
  "nav.reports": { EN: "Reports", TE: "నివేదికలు" },
  "nav.settings": { EN: "Settings", TE: "సెట్టింగులు" },

  // Bottom Nav
  "nav.home": { EN: "Home", TE: "హోమ్" },
  "nav.add": { EN: "Add", TE: "జోడించు" },
  "nav.profile": { EN: "Profile", TE: "ప్రొఫైల్" },

  // common
  "common.taken": { EN: "Taken", TE: "తీసుకున్నవి" },
  "common.pending": { EN: "Pending", TE: "బాకీ ఉన్నవి" },
  "common.missed": { EN: "Missed", TE: "తప్పిపోయినవి" },
  "common.done": { EN: "Done", TE: "పూర్తి" },

  // Dashboard Index
  "dash.greeting.morning": { EN: "Good Morning", TE: "శుభోదయం" },
  "dash.greeting.afternoon": { EN: "Good Afternoon", TE: "శుభ మధ్యాహ్నం" },
  "dash.greeting.evening": { EN: "Good Evening", TE: "శుభ సాయంత్రం" },
  "dash.subtitle": { EN: "Here is your health overview for today.", TE: "ఈ రోజు మీ ఆరోగ్య స్థూలదృష్టి ఇక్కడ ఉంది." },

  // Hero Card
  "hero.todaysPlan": { EN: "Today's Plan", TE: "ఈ రోజు ప్రణాళిక" },
  "hero.title": { EN: "Today's Health Plan", TE: "ఈ రోజు ఆరోగ్య ప్రణాళిక" },
  "hero.nextMed": { EN: "Next Medicine", TE: "తదుపరి మందు" },
  "hero.waterRem": { EN: "Water Reminder", TE: "నీటి రిమైండర్" },
  "hero.glasses": { EN: "glasses", TE: "గ్లాసులు" },
  "hero.activity": { EN: "Activity", TE: "కార్యకలాపం" },
  "hero.walk": { EN: "10 min walk", TE: "10 నిమిషాల నడక " },

  // Medicine Schedule Card
  "medCard.title": { EN: "Medicines", TE: "మందులు" },
  "medCard.taken": { EN: "taken", TE: "తీసుకున్నవి" },

  // Streak Card
  "streak.title": { EN: "Streak", TE: "వరుస రోజులు" },
  "streak.days": { EN: "days", TE: "రోజులు" },
  "streak.toGoal": { EN: "days to goal", TE: "లక్ష్యానికి రోజులు" },

  // Water Card
  "water.title": { EN: "Water Intake", TE: "తాగిన నీరు" },
  "water.add": { EN: "Add Water", TE: "నీరు జోడించు" },

  // AI Suggestions
  "ai.title": { EN: "AI Tips", TE: "AI చిట్కాలు" },
  "ai.tip1": { EN: "Take Metformin after food for better absorption", TE: "మెరుగైన శోషణ కోసం ఆహారం తర్వాత మెట్‌ఫార్మిన్ తీసుకోండి" },
  "ai.tip2": { EN: "Go for a 10-min evening walk today", TE: "ఈ రోజు సాయంత్రం 10 నిమిషాలు నడవండి" },
  "ai.tip3": { EN: "Drink warm water before bed for better sleep", TE: "మంచి నిద్ర కోసం పడుకునే ముందు గోరువెచ్చని నీరు త్రాగాలి" },

  // Timeline
  "timeline.title": { EN: "Daily Routine", TE: "రోజువారీ దినచర్య" },
  "timeline.wakeup": { EN: "Wake Up", TE: "నిద్రలేవండి" },
  "timeline.morningWalk": { EN: "Morning Walk", TE: "ఉదయం నడక" },
  "timeline.breakfast": { EN: "Breakfast + Meds", TE: "అల్పాహారం + మందులు" },
  "timeline.lunch": { EN: "Lunch", TE: "మధ్యాహ్న భోజనం" },
  "timeline.afternoonMeds": { EN: "Afternoon Meds", TE: "మధ్యాహ్నం మందులు" },
  "timeline.lightExer": { EN: "Light Exercise", TE: "తేలికపాటి వ్యాయామం" },
  "timeline.nightMeds": { EN: "Night Meds", TE: "రాత్రి మందులు" },
  "timeline.sleep": { EN: "Sleep", TE: "నిద్ర" },

  // Medicines Page
  "medsPage.title": { EN: "Medicines", TE: "మందులు" },
  "medsPage.desc": { EN: "Manage your daily medications", TE: "మీ రోజువారీ మందులను నిర్వహించండి" },
  "medsPage.scan": { EN: "Scan Prescription", TE: "ప్రిస్క్రిప్షన్ స్కాన్ చేయండి" },
  "medsPage.add": { EN: "Add Medicine", TE: "మందు జోడించు" },
  "medsPage.searchPlaceholder": { EN: "Search medicines...", TE: "మందుల కోసం వెతకండి..." },
  "medsPage.all": { EN: "all", TE: "అన్నీ" },
  
  // Add Medicine Modal
  "addMed.title": { EN: "Add Medicine", TE: "మందు జోడించు" },
  "addMed.name": { EN: "Medicine Name", TE: "మందు పేరు" },
  "addMed.dosage": { EN: "Dosage", TE: "మోతాదు" },
  "addMed.when": { EN: "When to Take", TE: "ఎప్పుడు తీసుకోవాలి" },
  "addMed.freq": { EN: "Frequency", TE: "సక్రియం/సమయం" },
  "addMed.cat": { EN: "Category", TE: "వర్గం" },
  "addMed.addBtn": { EN: "Add Medicine", TE: "మందు జోడించు" },
  "addMed.sysNote": { EN: "Our system will set the exact reminder timing based on your routine.", TE: "మా సిస్టమ్ మీ దినచర్య ఆధారంగా ఖచ్చితమైన రిమైండర్ సమయాన్ని సెట్ చేస్తుంది." },
  // periods
  "period.morning": { EN: "Morning", TE: "ఉదయం" },
  "period.afternoon": { EN: "Afternoon", TE: "మధ్యాహ్నం" },
  "period.evening": { EN: "Evening", TE: "సాయంత్రం" },
  "period.night": { EN: "Evening & Night", TE: "సాయంత్రం & రాత్రి" },
  "period.mrange": { EN: "6 AM – 12 PM", TE: "6 AM – 12 PM" },
  "period.arange": { EN: "12 PM – 5 PM", TE: "12 PM – 5 PM" },
  "period.erange": { EN: "5 PM – 10 PM", TE: "5 PM – 10 PM" },

  // Scan Modal
  "scan.title": { EN: "Scan Prescription", TE: "ప్రిస్క్రిప్షన్ స్కాన్ చేయండి" },
  "scan.desc": { EN: "Upload your prescription and our AI will automatically identify medicines and add them to your list.", TE: "మీ ప్రిస్క్రిప్షన్‌ను అప్‌లోడ్ చేయండి మరియు మా AI స్వయంచాలకంగా మందులను గుర్తించి మీ జాబితాకు జోడిస్తుంది." },
  "scan.upload": { EN: "Upload Prescription", TE: "ప్రిస్క్రిప్షన్ అప్‌లోడ్ చేయండి" },
  "scan.photo": { EN: "Take Photo", TE: "ఫోటో తీయండి" },
  "scan.detected": { EN: "Detected Medicines", TE: "గుర్తించిన మందులు" },
  "scan.rescan": { EN: "Rescan", TE: "మళ్లీ స్కాన్ చేయండి" },
  "scan.addAll": { EN: "Add All", TE: "అన్నీ జోడించండి" },

  // Routine Page
  "routine.title": { EN: "Daily Routine", TE: "రోజువారీ దినచర్య" },
  "routine.desc": { EN: "tasks completed today", TE: "ఈ రోజు పూర్తయిన పనులు" },
  "routine.progress": { EN: "Today's Progress", TE: "ఈ రోజు పురోగతి" },
  "routine.completed": { EN: "completed", TE: "పూర్తయింది" },
  "routine.remaining": { EN: "remaining", TE: "మిగిలి ఉన్నాయి" },
  
  // Example Routine Items
  "routine.item1": { EN: "Wake Up & Stretch", TE: "నిద్రలేచి & సాగదీయండి" },
  "routine.item2": { EN: "Morning Walk (15 min)", TE: "ఉదయం నడక (15 నిమిషాలు)" },
  "routine.item3": { EN: "Breakfast", TE: "అల్పాహారం" },
  "routine.item4": { EN: "Morning Medicines", TE: "ఉదయం మందులు" },
  "routine.item5": { EN: "Light Exercise / Yoga", TE: "తేలికపాటి వ్యాయామం / యోగా" },
  "routine.item6": { EN: "Lunch", TE: "మధ్యాహ్న భోజనం" },
  "routine.item7": { EN: "Afternoon Medicines", TE: "మధ్యాహ్నం మందులు" },
  "routine.item8": { EN: "Rest / Nap", TE: "విశ్రాంతి" },
  "routine.item9": { EN: "Evening Tea & Snack", TE: "సాయంత్రం టీ & స్నాక్" },
  "routine.item10": { EN: "Evening Walk (20 min)", TE: "సాయంత్రం నడక (20 నిమిషాలు)" },
  "routine.item11": { EN: "Dinner", TE: "రాత్రి భోజనం" },
  "routine.item12": { EN: "Night Medicines", TE: "రాత్రి మందులు" },
  "routine.item13": { EN: "Warm Milk / Reading", TE: "గోరువెచ్చని పాలు / చదవడం" },
  "routine.item14": { EN: "Sleep", TE: "నిద్ర" },

  // Reports Page
  "reports.title": { EN: "Reports & Analytics", TE: "నివేదికలు & విశ్లేషణలు" },
  "reports.desc": { EN: "Track your health progress over time", TE: "సమయంతో పాటు మీ ఆరోగ్య పురోగతిని ట్రాక్ చేయండి" },
  "reports.adherence": { EN: "Adherence Rate", TE: "కట్టుబడి రేటు" },
  "reports.currStreak": { EN: "Current Streak", TE: "ప్రస్తుత వరుస" },
  "reports.medsToday": { EN: "Medicines Today", TE: "ఈ రోజు మందులు" },
  "reports.avgWater": { EN: "Avg Water/Day", TE: "సగటు నీరు/రోజు" },
  "reports.weeklyAdh": { EN: "Weekly Medicine Adherence", TE: "వారపు మందుల ఫాలోయింగ్" },
  "reports.waterTrend": { EN: "Water Intake Trend", TE: "నీటి వినియోగం ట్రెండ్" },
  "reports.medCat": { EN: "Medicine Categories", TE: "మందుల వర్గాలు" },
  "reports.monthly": { EN: "Monthly Summary", TE: "నెలవారీ సారాంశం" },

  "reports.mon": { EN: "Mon", TE: "సోమ" },
  "reports.tue": { EN: "Tue", TE: "మంగళ" },
  "reports.wed": { EN: "Wed", TE: "బుధ" },
  "reports.thu": { EN: "Thu", TE: "గురు" },
  "reports.fri": { EN: "Fri", TE: "శుక్ర" },
  "reports.sat": { EN: "Sat", TE: "శని" },
  "reports.sun": { EN: "Sun", TE: "ఆది" },
  "reports.cat1": { EN: "Diabetes", TE: "మధుమేహం" },
  "reports.cat2": { EN: "BP", TE: "బీపీ" },
  "reports.cat3": { EN: "Supplements", TE: "సప్లిమెంట్లు" },
  "reports.cat4": { EN: "Heart", TE: "గుండె" },

  "reports.lbl1": { EN: "Medicines Taken", TE: "తీసుకున్న మందులు" },
  "reports.lbl2": { EN: "Water Goal Met", TE: "నీటి లక్ష్యం చేరుకున్నవి" },
  "reports.lbl3": { EN: "Routine Followed", TE: "దినచర్య పాటించినవి" },
  "reports.lbl4": { EN: "Doctor Visits", TE: "డాక్టర్ సందర్శనలు" },

  // Settings Page
  "settings.title": { EN: "Settings", TE: "సెట్టింగులు" },
  "settings.desc": { EN: "Personalize your AyuSync experience", TE: "మీ ఆయుసింక్ అనుభవాన్ని వ్యక్తిగతీకరించండి" },
  "settings.plan": { EN: "Premium Health Plan", TE: "ప్రీమియం హెల్త్ ప్లాన్" },
  "settings.quick": { EN: "Quick Settings", TE: "శీఘ్ర సెట్టింగులు" },
  "settings.acct": { EN: "Account", TE: "ఖాతా" },
  "settings.signout": { EN: "Sign Out", TE: "సైన్ అవుట్" },

  "set.notif": { EN: "Push Notifications", TE: "పుష్ నోటిఫికేషన్‌లు" },
  "set.notifDesc": { EN: "Get reminders for medicines", TE: "మందుల కోసం రిమైండర్‌లను పొందండి" },
  "set.sound": { EN: "Sound Alerts", TE: "సౌండ్ అలర్ట్‌లు" },
  "set.soundDesc": { EN: "Play sound for medicine reminders", TE: "మందుల రిమైండర్‌లకు సౌండ్ ప్లే చేయండి" },
  "set.dark": { EN: "Dark Mode", TE: "డార్క్ మోడ్" },
  "set.darkDesc": { EN: "Switch to dark theme", TE: "డార్క్ థీమ్‌కు మారండి" },
  "set.vib": { EN: "Vibration", TE: "వైబ్రేషన్" },
  "set.vibDesc": { EN: "Vibrate on notifications", TE: "నోటిఫికేషన్‌లపై వైబ్రేట్ చేయండి" },

  "set.m1": { EN: "Edit Profile", TE: "ప్రొఫైల్ సవరించండి" },
  "set.m2": { EN: "Language Preferences", TE: "భాషా ప్రాధాన్యతలు" },
  "set.m3": { EN: "Reminder Schedule", TE: "రిమైండర్ షెడ్యూల్" },
  "set.m4": { EN: "Health Data & Privacy", TE: "ఆరోగ్య డేటా & గోప్యత" },
  "set.m5": { EN: "Emergency Contact", TE: "అత్యవసర సంప్రదింపు" },
  
  // mock terms
  "mock.metformin": { EN: "Metformin", TE: "మెట్‌ఫార్మిన్" },
  "mock.aml": { EN: "Amlodipine", TE: "ఆమ్లోడిపైన్" },
  "mock.vitd3": { EN: "Vitamin D3", TE: "విటమిన్ డి 3" },
  "mock.calc": { EN: "Calcium", TE: "కాల్షియం" },
  "mock.asp": { EN: "Aspirin", TE: "ఆస్పిరిన్" },
  "mock.ome": { EN: "Omeprazole", TE: "ఒమెప్రజోల్" },
  "mock.para": { EN: "Paracetamol", TE: "పారాసెటమాల్" },
  "mock.cetz": { EN: "Cetirizine", TE: "సెటిరిజైన్" },

  // ── Exercises Page ──
  "nav.exercises": { EN: "Exercises", TE: "వ్యాయామాలు" },
  "nav.meals": { EN: "Meal Plan", TE: "ఆహార ప్రణాళిక" },

  "ex.title": { EN: "Exercise Guide", TE: "వ్యాయామ గైడ్" },
  "ex.desc": { EN: "AI-recommended exercises for your health", TE: "మీ ఆరోగ్యం కోసం AI సిఫార్సు చేసిన వ్యాయామాలు" },
  "ex.tabAll": { EN: "For You", TE: "మీ కోసం" },
  "ex.tabYoga": { EN: "Yoga", TE: "యోగా" },
  "ex.tabWalk": { EN: "Walking", TE: "నడక" },
  "ex.tabStretch": { EN: "Stretching", TE: "సాగదీత" },
  "ex.warmup": { EN: "Warm Up", TE: "వార్మ్ అప్" },
  "ex.main": { EN: "Main Workout", TE: "ప్రధాన వ్యాయామం" },
  "ex.cooldown": { EN: "Cool Down", TE: "కూల్ డౌన్" },
  "ex.easy": { EN: "Easy", TE: "సులభం" },
  "ex.medium": { EN: "Medium", TE: "మధ్యస్తం" },
  "ex.start": { EN: "Start Workout", TE: "వ్యాయామం ప్రారంభించండి" },
  "ex.reps": { EN: "reps", TE: "రెప్స్" },
  "ex.sec": { EN: "sec", TE: "సెకన్లు" },
  "ex.min": { EN: "min", TE: "నిమిషాలు" },
  "ex.sets": { EN: "sets", TE: "సెట్స్" },
  "ex.steps": { EN: "How to do", TE: "ఎలా చేయాలి" },
  "ex.muscles": { EN: "Target", TE: "లక్ష్యం" },

  // Exercise Items
  "ex.neckRotation": { EN: "Neck Rotation", TE: "మెడ తిప్పడం" },
  "ex.neckDesc": { EN: "Gently rotate your neck clockwise and anti-clockwise", TE: "మెల్లగా మీ మెడను సవ్యదిశలో మరియు అపసవ్యదిశలో తిప్పండి" },
  "ex.shoulderStretch": { EN: "Shoulder Stretch", TE: "భుజం సాగదీత" },
  "ex.shoulderDesc": { EN: "Raise arms and stretch shoulders gently", TE: "చేతులు పైకెత్తి భుజాలను మెల్లగా సాగదీయండి" },
  "ex.seatedBend": { EN: "Seated Forward Bend", TE: "కూర్చొని ముందుకు వంగడం" },
  "ex.seatedDesc": { EN: "Sit and slowly bend forward touching your toes", TE: "కూర్చొని నెమ్మదిగా ముందుకు వంగి కాలి వేళ్లను తాకండి" },
  "ex.sideStretch": { EN: "Standing Side Stretch", TE: "నిలబడి పక్కకు సాగడం" },
  "ex.sideDesc": { EN: "Stand straight, raise one arm and bend sideways", TE: "నిటారుగా నిలబడి, ఒక చేయి పైకెత్తి పక్కకు వంగండి" },
  "ex.ankleRotation": { EN: "Ankle Rotation", TE: "చీలమండ తిప్పడం" },
  "ex.ankleDesc": { EN: "Rotate each ankle slowly in circular motion", TE: "ప్రతి చీలమండను వృత్తాకారంలో నెమ్మదిగా తిప్పండి" },
  "ex.deepBreathing": { EN: "Deep Breathing", TE: "లోతైన శ్వాస" },
  "ex.breathDesc": { EN: "Inhale deeply for 4 sec, hold 4 sec, exhale 6 sec", TE: "4 సెకన్లు లోతుగా పీల్చి, 4 సెకన్లు ఆపి, 6 సెకన్లు వదలండి" },

  "ex.neck": { EN: "Neck", TE: "మెడ" },
  "ex.shoulders": { EN: "Shoulders", TE: "భుజాలు" },
  "ex.back": { EN: "Back & Hamstrings", TE: "వీపు & హామ్‌స్ట్రింగ్‌లు" },
  "ex.obliques": { EN: "Obliques & Core", TE: "ఆబ్లిక్స్ & కోర్" },
  "ex.ankles": { EN: "Ankles & Feet", TE: "చీలమండలు & పాదాలు" },
  "ex.lungs": { EN: "Lungs & Mind", TE: "ఊపిరితిత్తులు & మనసు" },

  // ── Meals Page ──
  "ml.title": { EN: "AI Meal Planner", TE: "AI ఆహార ప్రణాళిక" },
  "ml.desc": { EN: "Personalized meals based on your health profile", TE: "మీ ఆరోగ్య ప్రొఫైల్ ఆధారంగా వ్యక్తిగతీకరించిన భోజనాలు" },
  "ml.banner": { EN: "Based on your health profile, here's your ideal meal plan for today", TE: "మీ ఆరోగ్య ప్రొఫైల్ ఆధారంగా, ఈ రోజు మీ ఆదర్శ ఆహార ప్రణాళిక ఇక్కడ ఉంది" },
  "ml.breakfast": { EN: "Breakfast", TE: "అల్పాహారం" },
  "ml.lunch": { EN: "Lunch", TE: "మధ్యాహ్న భోజనం" },
  "ml.snacks": { EN: "Snacks", TE: "స్నాక్స్" },
  "ml.dinner": { EN: "Dinner", TE: "రాత్రి భోజనం" },
  "ml.kcal": { EN: "kcal", TE: "కేకాల్" },
  "ml.summary": { EN: "Daily Nutrition Summary", TE: "రోజువారీ పోషకాహార సారాంశం" },
  "ml.calories": { EN: "Calories", TE: "కేలరీలు" },
  "ml.protein": { EN: "Protein", TE: "ప్రోటీన్" },
  "ml.carbs": { EN: "Carbs", TE: "కార్బ్స్" },
  "ml.fiber": { EN: "Fiber", TE: "ఫైబర్" },
  "ml.goodFor": { EN: "Good for", TE: "మంచిది" },

  // Meal Items
  "ml.idli": { EN: "Idli & Chutney", TE: "ఇడ్లీ & చట్నీ" },
  "ml.idliQty": { EN: "3 pieces + sambar", TE: "3 ముక్కలు + సాంబార్" },
  "ml.oats": { EN: "Oats Porridge", TE: "ఓట్స్ జావ" },
  "ml.oatsQty": { EN: "1 bowl with fruits", TE: "1 గిన్నె పండ్లతో" },
  "ml.riceDal": { EN: "Rice & Dal", TE: "అన్నం & పప్పు" },
  "ml.riceDalQty": { EN: "1 cup rice + 1 bowl dal", TE: "1 కప్పు అన్నం + 1 గిన్నె పప్పు" },
  "ml.chapati": { EN: "Chapati & Sabzi", TE: "చపాతీ & సబ్జీ" },
  "ml.chapatiQty": { EN: "2 chapatis + mixed veg", TE: "2 చపాతీలు + మిక్స్డ్ వెజ్" },
  "ml.fruit": { EN: "Fruit Bowl", TE: "పండ్ల గిన్నె" },
  "ml.fruitQty": { EN: "1 bowl seasonal fruits", TE: "1 గిన్నె సీజనల్ పండ్లు" },
  "ml.dryFruits": { EN: "Dry Fruits Mix", TE: "డ్రై ఫ్రూట్స్ మిక్స్" },
  "ml.dryFruitsQty": { EN: "1 handful (30g)", TE: "1 గుప్పెడు (30గ్రా)" },
  "ml.khichdi": { EN: "Veg Khichdi", TE: "వెజ్ కిచిడి" },
  "ml.khichdiQty": { EN: "1 bowl with ghee", TE: "1 గిన్నె నెయ్యితో" },
  "ml.warmMilk": { EN: "Turmeric Milk", TE: "పసుపు పాలు" },
  "ml.warmMilkQty": { EN: "1 glass before bed", TE: "1 గ్లాసు పడుకునే ముందు" },

  // Health tags
  "tag.diabetes": { EN: "Diabetes-friendly", TE: "మధుమేహానికి అనుకూలం" },
  "tag.heart": { EN: "Heart-healthy", TE: "గుండెకు మంచిది" },
  "tag.bp": { EN: "BP-friendly", TE: "బీపీకి అనుకూలం" },
  "tag.bone": { EN: "Bone Health", TE: "ఎముకల ఆరోగ్యం" },
  "tag.digestion": { EN: "Easy Digestion", TE: "సులభ జీర్ణం" },
  "tag.immunity": { EN: "Immunity Boost", TE: "రోగనిరోధక శక్తి" },
  "tag.energy": { EN: "Energy Boost", TE: "శక్తి పెంపు" },
  "tag.sleep": { EN: "Better Sleep", TE: "మంచి నిద్ర" },
};

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('EN');

  const t = (key: string) => {
    return dictionary[key]?.[lang] || dictionary[key]?.['EN'] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
