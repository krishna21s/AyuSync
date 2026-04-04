import React, { createContext, useState, useContext } from 'react';

type Language = 'en' | 'te';

const translations = {
  en: {
    // Settings & Profile
    'Settings': 'Settings', 'Manage your preferences': 'Manage your preferences',
    'QUICK SETTINGS': 'QUICK SETTINGS', 'ACCOUNT': 'ACCOUNT',
    'Push Notifications': 'Push Notifications', 'Get reminders for medicines': 'Get reminders for medicines',
    'Sound Alerts': 'Sound Alerts', 'Play sound with reminders': 'Play sound with reminders',
    'Dark Mode': 'Dark Mode', 'Switch to dark theme': 'Switch to dark theme',
    'Vibration': 'Vibration', 'Vibrate on reminder': 'Vibrate on reminder',
    'Telugu (తెలుగు)': 'Telugu (తెలుగు)', 'Enable Telugu language': 'Enable Telugu language',
    'Premium Health Plan': 'Premium Health Plan', 'Edit Profile': 'Edit Profile',
    'Language Preferences': 'Language Preferences', 'Medication Schedule': 'Medication Schedule',
    'Privacy & Security': 'Privacy & Security', 'Emergency Contacts': 'Emergency Contacts',
    'Sign Out': 'Sign Out',
    // Home
    'Good Morning': 'Good Morning', 'Good Afternoon': 'Good Afternoon', 'Good Evening': 'Good Evening',
    'Here\'s your health summary for today': 'Here\'s your health summary for today',
    'Today\'s Plan': 'Today\'s Plan', 'Stay on track with': 'Stay on track with', 'your health goals': 'your health goals',
    'Next Med': 'Next Med', 'Water': 'Water', 'Activity': 'Activity',
    'taken': 'taken', 'Streak': 'Streak', 'DAYS': 'DAYS', 'to goal': 'to goal',
    'Add Glass': 'Add Glass', 'AI Suggestions': 'AI Suggestions', 'Today\'s Timeline': 'Today\'s Timeline',
    'Taken': 'Taken',
    // Nav
    'Home': 'Home', 'Meds': 'Meds', 'Routine': 'Routine', 'Reports': 'Reports',
    // Meds
    'Medicines': 'Medicines', 'Track & manage your daily medications': 'Track & manage your daily medications',
    'Add': 'Add', 'Pending': 'Pending', 'Missed': 'Missed', 'All': 'All',
    'Search medicines...': 'Search medicines...', 'MEDICINE NAME': 'MEDICINE NAME',
    'DOSAGE': 'DOSAGE', 'WHEN TO TAKE': 'WHEN TO TAKE', 'CATEGORY': 'CATEGORY', 'Add Medicine': 'Add Medicine',
    'Morning': 'Morning', 'Afternoon': 'Afternoon', 'Evening': 'Evening', 'Night': 'Night',
    'Done': 'Done',
    // Routine
    'Daily Routine': 'Daily Routine', 'tasks completed today': 'tasks completed today',
    'Today\'s Progress': 'Today\'s Progress', 'completed': 'completed', 'remaining': 'remaining', 'Open': 'Open',
    // Reports
    'Health Reports': 'Health Reports', 'Your health analytics & insights': 'Your health analytics & insights',
    'Adherence Rate': 'Adherence Rate', 'Current Streak': 'Current Streak', 'Today Taken': 'Today Taken',
    'Avg Water/Day': 'Avg Water/Day', 'Weekly Adherence': 'Weekly Adherence', 'Water Intake Trend': 'Water Intake Trend',
    'Medicine Categories': 'Medicine Categories', 'Monthly Summary': 'Monthly Summary',
    'Medicines Taken': 'Medicines Taken', 'Water Goal Met': 'Water Goal Met', 'Routine Followed': 'Routine Followed',
    'Doctor Visits': 'Doctor Visits', 'Mon': 'Mon', 'Tue': 'Tue', 'Wed': 'Wed', 'Thu': 'Thu', 'Fri': 'Fri', 'Sat': 'Sat', 'Sun': 'Sun',
    // Exercises
    'Workout Progress': 'Workout Progress', 'min total': 'min total', 'Yoga': 'Yoga', 'Walking': 'Walking', 'Stretch': 'Stretch',
    'Warm Up': 'Warm Up', 'Main Exercise': 'Main Exercise', 'Cool Down': 'Cool Down',
    'EASY': 'EASY', 'MEDIUM': 'MEDIUM', 'reps': 'reps', 'STEPS': 'STEPS', 'TIMER': 'TIMER',
    'Completed!': 'Completed!', 'Start': 'Start', 'Pause': 'Pause', 'Resume': 'Resume',
    // Meals
    'Nutrition Summary': 'Nutrition Summary', 'Calories': 'Calories', 'Protein': 'Protein', 'Carbs': 'Carbs', 'Fiber': 'Fiber',
    'Breakfast': 'Breakfast', 'Lunch': 'Lunch', 'Snacks': 'Snacks', 'Dinner': 'Dinner',
    'Your meals are personalized based on your health conditions — Diabetes, BP, and supplements.': 'Your meals are personalized based on your health conditions — Diabetes, BP, and supplements.',
    'kcal · AI-personalized': 'kcal · AI-personalized'
  },
  te: {
    'Settings': 'సెట్టింగ్‌లు', 'Manage your preferences': 'మీ ప్రాధాన్యతలను నిర్వహించండి',
    'QUICK SETTINGS': 'త్వరిత సెట్టింగ్‌లు', 'ACCOUNT': 'ఖాతా',
    'Push Notifications': 'పుష్ నోటిఫికేషన్‌లు', 'Get reminders for medicines': 'మందుల కోసం రిమైండర్‌లను పొందండి',
    'Sound Alerts': 'సౌండ్ అలర్ట్స్', 'Play sound with reminders': 'రిమైండర్‌లతో సౌండ్ ప్లే చేయండి',
    'Dark Mode': 'డార్క్ మోడ్', 'Switch to dark theme': 'డార్క్ మోడ్‌కు మారండి',
    'Vibration': 'వైబ్రేషన్', 'Vibrate on reminder': 'రిమైండర్‌పై వైబ్రేట్ చేయండి',
    'Telugu (తెలుగు)': 'తెలుగు (Telugu)', 'Enable Telugu language': 'తెలుగు భాషను ప్రారంభించండి',
    'Premium Health Plan': 'ప్రీమియం హెల్త్ ప్లాన్', 'Edit Profile': 'ప్రొఫైల్ సవరించండి',
    'Language Preferences': 'భాష ప్రాధాన్యతలు', 'Medication Schedule': 'మందుల షెడ్యూల్',
    'Privacy & Security': 'గోప్యత & భద్రత', 'Emergency Contacts': 'అత్యవసర పరిచయాలు',
    'Sign Out': 'సైన్ అవుట్ చేయండి',
    // Home
    'Good Morning': 'శుభోదయం', 'Good Afternoon': 'శుభ మధ్యాహ్నం', 'Good Evening': 'శుభ సాయంత్రం',
    'Here\'s your health summary for today': 'ఈ రోజు మీ ఆరోగ్య సారాంశం',
    'Today\'s Plan': 'ఈ రోజు ప్రణాళిక', 'Stay on track with': 'దీనితో ట్రాక్‌లో ఉండండి', 'your health goals': 'మీ ఆరోగ్య లక్ష్యాలు',
    'Next Med': 'తదుపరి మందు', 'Water': 'నీరు', 'Activity': 'చర్య',
    'taken': 'పూర్తయింది', 'Streak': 'స్ట్రీక్', 'DAYS': 'రోజులు', 'to goal': 'లక్ష్యం వరకు',
    'Add Glass': 'నీరు జోడించు', 'AI Suggestions': 'AI సూచనలు', 'Today\'s Timeline': 'నేటి కాలక్రమం',
    'Taken': 'తీసుకున్నారు',
    // Nav
    'Home': 'హోమ్', 'Meds': 'మందులు', 'Routine': 'దినచర్య', 'Reports': 'నివేదికలు',
    // Meds
    'Medicines': 'మందులు (Medicines)', 'Track & manage your daily medications': 'మీ మందులను ట్రాక్ చేయండి మరియు నిర్వహించండి',
    'Add': 'జోడించు', 'Pending': 'పెండింగ్', 'Missed': 'తప్పిపోయినవి', 'All': 'అన్నీ',
    'Search medicines...': 'మందులను వెతకండి...', 'MEDICINE NAME': 'మందుల పేరు',
    'DOSAGE': 'మోతాదు', 'WHEN TO TAKE': 'ఎప్పుడు తీసుకోవాలి', 'CATEGORY': 'వర్గం', 'Add Medicine': 'మందులని జతచేయు',
    'Morning': 'ఉదయం', 'Afternoon': 'మధ్యాహ్నం', 'Evening': 'సాయంత్రం', 'Night': 'రాత్రి',
    'Done': 'పూర్తయింది',
    // Routine
    'Daily Routine': 'రోజువారీ దినచర్య', 'tasks completed today': 'ఈరోజు పూర్తయిన పనులు',
    'Today\'s Progress': 'నేటి పురోగతి', 'completed': 'పూర్తయింది', 'remaining': 'మిగిలినవి', 'Open': 'తెరవండి',
    // Reports
    'Health Reports': 'ఆరోగ్య నివేదికలు', 'Your health analytics & insights': 'మీ ఆరోగ్య విశ్లేషణలు',
    'Adherence Rate': 'కట్టుబడి రేటు', 'Current Streak': 'ప్రస్తుత స్ట్రీక్', 'Today Taken': 'ఈ రోజు తీసుకున్నారు',
    'Avg Water/Day': 'సగటు నీరు/రోజు', 'Weekly Adherence': 'వారపు కట్టుబడి', 'Water Intake Trend': 'నీటి తీసుకోవడం ధోరణి',
    'Medicine Categories': 'మందుల వర్గాలు', 'Monthly Summary': 'నెలవారీ సారాంశం',
    'Medicines Taken': 'మందులు తీసుకున్నారు', 'Water Goal Met': 'నీటి లక్ష్యం చేరుకుంది', 'Routine Followed': 'దినచర్య అనుసరించరు',
    'Doctor Visits': 'డాక్టర్ సందర్శనలు', 'Mon': 'సోమ', 'Tue': 'మంగళ', 'Wed': 'బుధ', 'Thu': 'గురు', 'Fri': 'శుక్ర', 'Sat': 'శని', 'Sun': 'ఆది',
    // Exercises
    'Workout Progress': 'వ్యాయామం వృద్ధి', 'min total': 'నిమిషాల మొత్తం', 'Yoga': 'యోగా', 'Walking': 'నడక', 'Stretch': 'సాగదీయడం',
    'Warm Up': 'వార్మప్', 'Main Exercise': 'ప్రధాన వ్యాయామం', 'Cool Down': 'కూల్ డౌన్',
    'EASY': 'సులభం', 'MEDIUM': 'మధ్యస్థం', 'reps': 'రెప్స్', 'STEPS': 'దశలు', 'TIMER': 'టైమర్',
    'Completed!': 'పూర్తయింది!', 'Start': 'ప్రారంభించు', 'Pause': 'పాజ్', 'Resume': 'కొనసాగించు',
    // Meals
    'Nutrition Summary': 'పోషకాహార సారాంశం', 'Calories': 'కేలరీలు', 'Protein': 'ప్రోటీన్', 'Carbs': 'కార్బ్స్', 'Fiber': 'ఫైబర్',
    'Breakfast': 'అల్పాహారం', 'Lunch': 'మధ్యాహ్న భోజనం', 'Snacks': 'స్నాక్స్', 'Dinner': 'రాత్రి భోజనం',
    'Your meals are personalized based on your health conditions — Diabetes, BP, and supplements.': 'మీ ఆరోగ్య పరిస్థితుల ఆధారంగా — మధుమేహం, బీపీ మరియు సప్లిమెంట్ల ఆధారంగా మీ భోజనం వ్యక్తిగతీకరించబడింది.',
    'kcal · AI-personalized': 'kcal · AI-వ్యక్తిగతీకరించబడింది'
  }
};

type I18nContextType = {
  lang: Language;
  setLanguage: (l: Language) => void;
  t: (key: keyof typeof translations.en | string) => string;
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return (translations[lang] as any)[key] || key;
  };

  return (
    <I18nContext.Provider value={{ lang, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
