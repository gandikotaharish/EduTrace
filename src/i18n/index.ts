import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import type { SupportedLocale } from '@/ai/translation-engine/types';
import { SUPPORTED_LOCALES } from '@/ai/translation-engine/types';

const STORAGE_KEY = 'edutrace-locale';

const resources: Record<string, { translation: Record<string, string> }> = {
  en: { translation: {} },
  hi: { translation: {} },
  te: { translation: {} },
  ta: { translation: {} },
  kn: { translation: {} },
  bn: { translation: {} },
  mr: { translation: {} },
};

// Load minimal UI keys for each language (can be extended)
const en: Record<string, string> = {
  appName: 'EduTrace',
  dashboard: 'Dashboard',
  learn: 'Learn',
  progress: 'Progress',
  settings: 'Settings',
  students: 'Students',
  teachers: 'Teachers',
  myClasses: 'My Classes',
  concepts: 'Concepts',
  analytics: 'Analytics',
  schools: 'Schools',
  subjects: 'Subjects',
  signOut: 'Sign Out',
  backToConcepts: 'Back to Concepts',
  understandingTheConcept: 'Understanding the Concept',
  thinkingTask: 'Thinking Task',
  reflectOnLearning: 'Reflect on Your Learning',
  apply: 'Apply',
  voiceAssistant: 'Voice Assistant',
  speak: 'Speak',
  listen: 'Listen',
  askQuestion: 'Ask a question...',
  language: 'Language',
  darkMode: 'Dark mode',
};

const hi: Record<string, string> = {
  appName: 'EduTrace',
  dashboard: 'डैशबोर्ड',
  learn: 'सीखें',
  progress: 'प्रगति',
  settings: 'सेटिंग्स',
  students: 'छात्र',
  teachers: 'शिक्षक',
  myClasses: 'मेरी कक्षाएं',
  concepts: 'अवधारणाएं',
  analytics: 'विश्लेषण',
  schools: 'स्कूल',
  subjects: 'विषय',
  signOut: 'साइन आउट',
  backToConcepts: 'अवधारणाओं पर वापस',
  understandingTheConcept: 'अवधारणा को समझना',
  thinkingTask: 'सोचने का कार्य',
  reflectOnLearning: 'अपने सीखने पर विचार करें',
  apply: 'लागू करें',
  voiceAssistant: 'वॉयस सहायक',
  speak: 'बोलें',
  listen: 'सुनें',
  askQuestion: 'प्रश्न पूछें...',
  language: 'भाषा',
  darkMode: 'डार्क मोड',
};

const te: Record<string, string> = {
  appName: 'EduTrace',
  dashboard: 'డాష్‌బోర్డ్',
  learn: 'నేర్చుకోండి',
  progress: 'పురోగతి',
  settings: 'సెట్టింగ్‌లు',
  students: 'విద్యార్థులు',
  teachers: 'ఉపాధ్యాయులు',
  myClasses: 'నా తరగతులు',
  concepts: 'భావనలు',
  analytics: 'విశ్లేషణ',
  schools: 'పాఠశాలలు',
  subjects: 'విషయాలు',
  signOut: 'సైన్ అవుట్',
  backToConcepts: 'భావనలకు తిరిగి',
  understandingTheConcept: 'భావనను అర్థం చేసుకోవడం',
  thinkingTask: 'ఆలోచన పని',
  reflectOnLearning: 'మీ అభ్యాసంపై ప్రతిబింబించండి',
  apply: 'అప్లై చేయండి',
  voiceAssistant: 'వాయిస్ అసిస్టెంట్',
  speak: 'మాట్లాడండి',
  listen: 'వినండి',
  askQuestion: 'ప్రశ్న అడగండి...',
  language: 'భాష',
  darkMode: 'డార్క్ మోడ్',
};

const ta: Record<string, string> = {
  appName: 'EduTrace',
  dashboard: 'டாஷ்போர்டு',
  learn: 'கற்றுக்கொள்ளுங்கள்',
  progress: 'முன்னேற்றம்',
  settings: 'அமைப்புகள்',
  students: 'மாணவர்கள்',
  teachers: 'ஆசிரியர்கள்',
  myClasses: 'என் வகுப்புகள்',
  concepts: 'கருத்துக்கள்',
  analytics: 'பகுப்பாய்வு',
  schools: 'பள்ளிகள்',
  subjects: 'பாடங்கள்',
  signOut: 'வெளியேறு',
  backToConcepts: 'கருத்துகளுக்கு திரும்பு',
  understandingTheConcept: 'கருத்தைப் புரிந்துகொள்ளுதல்',
  thinkingTask: 'சிந்தனை பணி',
  reflectOnLearning: 'உங்கள் கற்றலில் சிந்தியுங்கள்',
  apply: 'பயன்படுத்து',
  voiceAssistant: 'குரல் உதவியாளர்',
  speak: 'பேசுங்கள்',
  listen: 'கேளுங்கள்',
  askQuestion: 'கேள்வி கேளுங்கள்...',
  language: 'மொழி',
  darkMode: 'டார்க் மோட்',
};

const kn: Record<string, string> = {
  appName: 'EduTrace',
  dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
  learn: 'ಕಲಿಯಿರಿ',
  progress: 'ಪ್ರಗತಿ',
  settings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
  students: 'ವಿದ್ಯಾರ್ಥಿಗಳು',
  teachers: 'ಉಪಾಧ್ಯಾಯರು',
  myClasses: 'ನನ್ನ ತರಗತಿಗಳು',
  concepts: 'ಪರಿಕಲ್ಪನೆಗಳು',
  analytics: 'ವಿಶ್ಲೇಷಣೆ',
  schools: 'ಶಾಲೆಗಳು',
  subjects: 'ವಿಷಯಗಳು',
  signOut: 'ಸೈನ್ ಔಟ್',
  backToConcepts: 'ಪರಿಕಲ್ಪನೆಗಳಿಗೆ ಹಿಂತಿರುಗಿ',
  understandingTheConcept: 'ಪರಿಕಲ್ಪನೆಯನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳುವುದು',
  thinkingTask: 'ಚಿಂತನಾ ಕಾರ್ಯ',
  reflectOnLearning: 'ನಿಮ್ಮ ಕಲಿಕೆಯ ಮೇಲೆ ಪ್ರತಿಬಿಂಬಿಸಿ',
  apply: 'ಅನ್ವಯಿಸಿ',
  voiceAssistant: 'ವಾಯ್ಸ್ ಅಸಿಸ್ಟೆಂಟ್',
  speak: 'ಮಾತನಾಡಿ',
  listen: 'ಕೇಳಿ',
  askQuestion: 'ಪ್ರಶ್ನೆ ಕೇಳಿ...',
  language: 'ಭಾಷೆ',
  darkMode: 'ಡಾರ್ಕ್ ಮೋಡ್',
};

const bn: Record<string, string> = {
  appName: 'EduTrace',
  dashboard: 'ড্যাশবোর্ড',
  learn: 'শিখুন',
  progress: 'অগ্রগতি',
  settings: 'সেটিংস',
  students: 'ছাত্র',
  teachers: 'শিক্ষক',
  myClasses: 'আমার ক্লাস',
  concepts: 'ধারণা',
  analytics: 'বিশ্লেষণ',
  schools: 'স্কুল',
  subjects: 'বিষয়',
  signOut: 'সাইন আউট',
  backToConcepts: 'ধারণায় ফিরে যান',
  understandingTheConcept: 'ধারণা বোঝা',
  thinkingTask: 'চিন্তার কাজ',
  reflectOnLearning: 'আপনার শেখার প্রতিফলন করুন',
  apply: 'প্রয়োগ করুন',
  voiceAssistant: 'ভয়েস অ্যাসিস্ট্যান্ট',
  speak: 'বলুন',
  listen: 'শুনুন',
  askQuestion: 'প্রশ্ন জিজ্ঞাসা করুন...',
  language: 'ভাষা',
  darkMode: 'ডার্ক মোড',
};

const mr: Record<string, string> = {
  appName: 'EduTrace',
  dashboard: 'डॅशबोर्ड',
  learn: 'शिका',
  progress: 'प्रगती',
  settings: 'सेटिंग्ज',
  students: 'विद्यार्थी',
  teachers: 'शिक्षक',
  myClasses: 'माझ्या वर्ग',
  concepts: 'संकल्पना',
  analytics: 'विश्लेषण',
  schools: 'शाळा',
  subjects: 'विषय',
  signOut: 'साइन आउट',
  backToConcepts: 'संकल्पनांवर परत',
  understandingTheConcept: 'संकल्पना समजून घेणे',
  thinkingTask: 'विचार कार्य',
  reflectOnLearning: 'तुमच्या शिकण्यावर विचार करा',
  apply: 'लागू करा',
  voiceAssistant: 'व्हॉईस असिस्टंट',
  speak: 'बोला',
  listen: 'ऐका',
  askQuestion: 'प्रश्न विचारा...',
  language: 'भाषा',
  darkMode: 'डार्क मोड',
};

resources.en.translation = en;
resources.hi.translation = hi;
resources.te.translation = te;
resources.ta.translation = ta;
resources.kn.translation = kn;
resources.bn.translation = bn;
resources.mr.translation = mr;

function getStoredLocale(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED_LOCALES.includes(stored as SupportedLocale)) return stored;
  } catch {}
  return 'en';
}

i18n.use(initReactI18next).init({
  resources,
  lng: getStoredLocale(),
  fallbackLng: 'en',
  supportedLngs: SUPPORTED_LOCALES,
  interpolation: { escapeValue: false },
});

export function setStoredLocale(locale: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
    i18n.changeLanguage(locale);
  } catch {}
}

export default i18n;
