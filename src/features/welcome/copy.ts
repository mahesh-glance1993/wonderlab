// Bilingual copy for the public pages (landing + get the app). Visitors are not signed in, so these pages
// keep their own English/Telugu choice (remembered on this device) instead of the learner's preferences.
import { useCallback, useState } from 'react';

export type WLang = 'en' | 'te';
type L = { en: string; te: string };

const KEY = 'wl.welcomeLang';

function initialLang(): WLang {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'en' || saved === 'te') return saved;
  } catch { /* storage blocked */ }
  return typeof navigator !== 'undefined' && /^te\b/i.test(navigator.language || '') ? 'te' : 'en';
}

export function useWelcomeLang(): [WLang, (l: WLang) => void, (s: L) => string] {
  const [lang, setLangState] = useState<WLang>(initialLang);
  const setLang = useCallback((l: WLang) => {
    setLangState(l);
    try { localStorage.setItem(KEY, l); } catch { /* storage blocked */ }
  }, []);
  const tr = useCallback((s: L) => s[lang], [lang]);
  return [lang, setLang, tr];
}

export const C = {
  langLabel: { en: 'Language', te: 'భాష' },
  tagline: { en: 'Learn, explore, create', te: 'నేర్చుకో, అన్వేషించు, సృష్టించు' },
  signIn: { en: 'Sign in', te: 'సైన్ ఇన్' },
  heroTitle: { en: 'Joyful learning for every child, from Nursery to Class 10', te: 'నర్సరీ నుండి 10వ తరగతి వరకు, ప్రతి బిడ్డకూ ఆనందంగా నేర్చుకునే అవకాశం' },
  heroSub: {
    en: 'WonderLab is an interactive learning app with lessons, practice, games and art — in English and Telugu. It follows the Telangana SCERT syllabus and keeps working without the internet.',
    te: 'WonderLab పాఠాలు, అభ్యాసం, ఆటలు, బొమ్మలు గీయడం ఉన్న ఇంటరాక్టివ్ లెర్నింగ్ యాప్ — ఇంగ్లీష్ మరియు తెలుగులో. ఇది తెలంగాణ SCERT సిలబస్‌ను అనుసరిస్తుంది, ఇంటర్నెట్ లేకపోయినా పనిచేస్తుంది.',
  },
  badgeFree: { en: 'Free for every child', te: 'ప్రతి బిడ్డకూ ఉచితం' },
  badgeSyllabus: { en: 'Telangana syllabus Classes 1–10 + Nursery–UKG', te: 'తెలంగాణ సిలబస్ 1–10 తరగతులు + నర్సరీ–యూకేజీ' },
  badgeNoAds: { en: 'No ads, no tracking', te: 'ప్రకటనలు లేవు, ట్రాకింగ్ లేదు' },
  getApp: { en: 'Get the app', te: 'యాప్ పొందండి' },
  startBrowser: { en: 'Start in your browser', te: 'బ్రౌజర్‌లోనే ప్రారంభించండి' },
  shareWhatsApp: { en: 'Share on WhatsApp', te: 'వాట్సాప్‌లో షేర్ చేయండి' },
  opensWhatsApp: { en: '(opens WhatsApp)', te: '(వాట్సాప్ తెరుచుకుంటుంది)' },

  featuresTitle: { en: 'What children get', te: 'పిల్లలకు ఏమి లభిస్తుంది' },
  features: [
    { icon: 'book', title: { en: 'Interactive lessons', te: 'ఇంటరాక్టివ్ పాఠాలు' },
      body: { en: 'Every chapter step by step, with pictures, read-aloud explanations, worked examples and practice questions.', te: 'ప్రతి అధ్యాయం దశలవారీగా — బొమ్మలు, చదివి వినిపించే వివరణ, సాధించిన ఉదాహరణలు, అభ్యాస ప్రశ్నలతో.' } },
    { icon: 'scale', title: { en: '“What if?” formula explorer', te: '“ఒకవేళ ఇలా అయితే?” సూత్రాల అన్వేషణ' },
      body: { en: 'Move a slider and watch the formula answer back — change the speed, the angle or the mass and see what happens.', te: 'స్లైడర్‌ను జరిపి సూత్రం ఎలా మారుతుందో చూడండి — వేగం, కోణం లేదా ద్రవ్యరాశి మార్చి ఏమవుతుందో గమనించండి.' } },
    { icon: 'globe', title: { en: 'Telugu and English', te: 'తెలుగు మరియు ఇంగ్లీష్' },
      body: { en: 'Learn in English or Telugu and switch whenever you like. Lessons can be read aloud.', te: 'ఇంగ్లీష్ లేదా తెలుగులో నేర్చుకోండి, ఎప్పుడైనా భాష మార్చుకోండి. పాఠాలను చదివి వినిపిస్తుంది.' } },
    { icon: 'note', title: { en: 'Notes for revision', te: 'పునశ్చరణ కోసం నోట్స్' },
      body: { en: 'Short chapter notes and key points to revise before a test.', te: 'పరీక్షకు ముందు చదువుకోవడానికి అధ్యాయాల సంక్షిప్త నోట్స్, ముఖ్యాంశాలు.' } },
    { icon: 'wifiOff', title: { en: 'Works offline', te: 'ఇంటర్నెట్ లేకుండా పనిచేస్తుంది' },
      body: { en: 'Download a class once, then learn without the internet. Progress syncs when you are back online.', te: 'ఒక తరగతిని ఒకసారి డౌన్‌లోడ్ చేస్తే, ఇంటర్నెట్ లేకుండానే నేర్చుకోవచ్చు. మళ్ళీ ఆన్‌లైన్‌కు వచ్చినప్పుడు ప్రగతి సింక్ అవుతుంది.' } },
    { icon: 'star', title: { en: 'Encouraging feedback', te: 'ప్రోత్సాహకరమైన స్పందన' },
      body: { en: 'Gentle hints, kind words when an answer is wrong, and stars for effort — never pressure.', te: 'తప్పు జవాబుకు సున్నితమైన సూచనలు, మంచి మాటలు, కృషికి నక్షత్రాలు — ఎప్పుడూ ఒత్తిడి ఉండదు.' } },
  ],

  howTitle: { en: 'How it works', te: 'ఇది ఎలా పనిచేస్తుంది' },
  parentsTitle: { en: 'For parents', te: 'తల్లిదండ్రుల కోసం' },
  parentsSteps: [
    { en: 'Create a free parent account.', te: 'ఉచితంగా తల్లిదండ్రుల ఖాతా సృష్టించండి.' },
    { en: 'Add a profile for each child and choose their class.', te: 'ప్రతి బిడ్డకు ఒక ప్రొఫైల్ జోడించి, వారి తరగతిని ఎంచుకోండి.' },
    { en: 'Your child picks their profile and learns; you can see their progress.', te: 'పిల్లలు తమ ప్రొఫైల్ ఎంచుకుని నేర్చుకుంటారు; మీరు వారి ప్రగతిని చూడవచ్చు.' },
    { en: 'Download classes to use offline on your phone or tablet.', te: 'ఫోన్ లేదా టాబ్లెట్‌లో ఆఫ్‌లైన్‌లో వాడటానికి తరగతులను డౌన్‌లోడ్ చేయండి.' },
  ],
  createAccount: { en: 'Create a parent account', te: 'తల్లిదండ్రుల ఖాతా సృష్టించండి' },
  schoolsTitle: { en: 'For teachers and schools', te: 'ఉపాధ్యాయులు, పాఠశాలల కోసం' },
  schoolsSteps: [
    { en: 'Lessons follow the Telangana SCERT chapters, so they fit your timetable.', te: 'పాఠాలు తెలంగాణ SCERT అధ్యాయాలను అనుసరిస్తాయి, కాబట్టి మీ టైమ్‌టేబుల్‌కు సరిపోతాయి.' },
    { en: 'Use shared classroom devices — each child learns in their own profile.', te: 'తరగతి గదిలో అందరూ వాడే పరికరాలపై ఉపయోగించండి — ప్రతి విద్యార్థి తన సొంత ప్రొఫైల్‌లో నేర్చుకుంటారు.' },
    { en: 'Download class packs once and teach where the internet is weak.', te: 'తరగతి ప్యాక్‌లను ఒకసారి డౌన్‌లోడ్ చేసి, ఇంటర్నెట్ బలహీనంగా ఉన్న చోట కూడా బోధించండి.' },
  ],
  forSchools: { en: 'WonderLab for schools', te: 'పాఠశాలల కోసం WonderLab' },

  appBandTitle: { en: 'Get WonderLab on your phone', te: 'మీ ఫోన్‌లో WonderLab పొందండి' },
  appBandBody: {
    en: 'Android: download the app directly. iPhone and iPad: add it to your Home Screen from Safari. Both are free.',
    te: 'ఆండ్రాయిడ్: యాప్‌ను నేరుగా డౌన్‌లోడ్ చేసుకోండి. ఐఫోన్, ఐప్యాడ్: Safari నుండి హోమ్ స్క్రీన్‌కు జోడించండి. రెండూ ఉచితం.',
  },

  footerNav: { en: 'Site links', te: 'సైట్ లింక్‌లు' },
  privacy: { en: 'Privacy', te: 'గోప్యత' },
  terms: { en: 'Terms', te: 'నిబంధనలు' },
  schools: { en: 'For schools', te: 'పాఠశాలల కోసం' },
  credits: { en: 'Credits', te: 'క్రెడిట్స్' },
  independent: {
    en: 'WonderLab is an independent project. It follows the Telangana SCERT syllabus but is not affiliated with, approved or endorsed by SCERT Telangana, the Government of Telangana, NCERT, CBSE or any government body.',
    te: 'WonderLab ఒక స్వతంత్ర ప్రాజెక్ట్. ఇది తెలంగాణ SCERT సిలబస్‌ను అనుసరిస్తుంది, కానీ SCERT తెలంగాణ, తెలంగాణ ప్రభుత్వం, NCERT, CBSE లేదా ఏ ప్రభుత్వ సంస్థతోనూ దీనికి సంబంధం లేదు; వారి ఆమోదం లేదా సిఫార్సు లేదు.',
  },
  notices: { en: 'Third-party notices', te: 'థర్డ్-పార్టీ నోటీసులు' },
  signer: { en: 'Signing certificate SHA-256', te: 'సంతకం సర్టిఫికేట్ SHA-256' },
  footerNote: { en: 'Made for children in Telangana. No ads, no tracking.', te: 'తెలంగాణ పిల్లల కోసం తయారు చేయబడింది. ప్రకటనలు లేవు, ట్రాకింగ్ లేదు.' },

  // get the app
  getAppIntro: { en: 'WonderLab is free. Choose your device below.', te: 'WonderLab ఉచితం. కింద మీ పరికరాన్ని ఎంచుకోండి.' },
  yourDevice: { en: 'Your device', te: 'మీ పరికరం' },
  back: { en: 'Back', te: 'వెనుకకు' },
  androidTitle: { en: 'Android phone or tablet', te: 'ఆండ్రాయిడ్ ఫోన్ లేదా టాబ్లెట్' },
  downloadApk: { en: 'Download for Android', te: 'ఆండ్రాయిడ్ కోసం డౌన్‌లోడ్ చేయండి' },
  checking: { en: 'Checking the latest version…', te: 'తాజా వెర్షన్ చూస్తున్నాం…' },
  version: { en: 'Version', te: 'వెర్షన్' },
  size: { en: 'Size', te: 'పరిమాణం' },
  updated: { en: 'Updated', te: 'నవీకరించిన తేదీ' },
  sha: { en: 'SHA-256 fingerprint (to check the file)', te: 'SHA-256 (ఫైల్‌ను సరిచూడటానికి)' },
  apkNotReady: {
    en: 'The Android download is being prepared. Meanwhile, install WonderLab from Chrome (below) or use it in the browser.',
    te: 'ఆండ్రాయిడ్ డౌన్‌లోడ్ సిద్ధమవుతోంది. ఈలోగా క్రోమ్ నుండి WonderLab ఇన్‌స్టాల్ చేయండి (కింద చూడండి) లేదా బ్రౌజర్‌లో వాడండి.',
  },
  androidWhy: {
    en: 'WonderLab is not on the Play Store yet, so Android asks you to allow the install once.',
    te: 'WonderLab ఇంకా ప్లే స్టోర్‌లో లేదు, అందుకే ఇన్‌స్టాల్ చేయడానికి ఆండ్రాయిడ్ ఒకసారి మీ అనుమతి అడుగుతుంది.',
  },
  androidStepsTitle: { en: 'How to install', te: 'ఇన్‌స్టాల్ చేసే విధానం' },
  androidSteps: [
    { en: 'Tap “Download for Android”. If Chrome asks, tap “Download anyway”.', te: '“ఆండ్రాయిడ్ కోసం డౌన్‌లోడ్ చేయండి” నొక్కండి. క్రోమ్ అడిగితే “Download anyway” నొక్కండి.' },
    { en: 'When it finishes, tap “Open” (or open Files → Downloads → wonderlab.apk).', te: 'డౌన్‌లోడ్ పూర్తయ్యాక “Open” నొక్కండి (లేదా Files → Downloads → wonderlab.apk తెరవండి).' },
    { en: 'If you see “For your security, your phone is not allowed to install unknown apps from this source”, tap Settings and turn on “Allow from this source”.', te: '“For your security, your phone is not allowed to install unknown apps from this source” అని వస్తే, Settings నొక్కి “Allow from this source” ఆన్ చేయండి.' },
    { en: 'Go back and tap Install, then Open.', te: 'వెనక్కి వచ్చి Install నొక్కండి, తర్వాత Open నొక్కండి.' },
    { en: 'Optional: turn “Allow from this source” off again afterwards. Updates install the same way.', te: 'కావాలంటే, తర్వాత “Allow from this source” మళ్ళీ ఆఫ్ చేయవచ్చు. అప్‌డేట్‌లు కూడా ఇదే విధంగా ఇన్‌స్టాల్ అవుతాయి.' },
  ],
  androidSafety: {
    en: 'Only download WonderLab from this website. Google Play Protect may offer to scan the app before installing — that is normal for apps from outside the Play Store.',
    te: 'WonderLab ను ఈ వెబ్‌సైట్ నుండి మాత్రమే డౌన్‌లోడ్ చేయండి. ప్లే స్టోర్ బయటి యాప్‌లను ఇన్‌స్టాల్ చేసే ముందు Google Play Protect స్కాన్ చేస్తానని అడగవచ్చు — అది సాధారణమే.',
  },
  pwaTitle: { en: 'Or install from Chrome — no download needed', te: 'లేదా క్రోమ్ నుండి ఇన్‌స్టాల్ చేయండి — డౌన్‌లోడ్ అవసరం లేదు' },
  pwaInstall: { en: 'Install WonderLab', te: 'WonderLab ఇన్‌స్టాల్ చేయండి' },
  pwaManual: { en: 'In Chrome, tap the ⋮ menu, then “Add to Home screen” or “Install app”.', te: 'క్రోమ్‌లో ⋮ మెనూ నొక్కి, “Add to Home screen” లేదా “Install app” ఎంచుకోండి.' },
  installed: { en: 'WonderLab is installed on this device. Open it from your Home Screen.', te: 'ఈ పరికరంలో WonderLab ఇన్‌స్టాల్ అయింది. హోమ్ స్క్రీన్ నుండి తెరవండి.' },
  inAndroidApp: { en: 'You are already using the WonderLab Android app.', te: 'మీరు ఇప్పటికే WonderLab ఆండ్రాయిడ్ యాప్‌ను వాడుతున్నారు.' },

  iosTitle: { en: 'iPhone or iPad', te: 'ఐఫోన్ లేదా ఐప్యాడ్' },
  iosIntro: {
    en: 'Add WonderLab to your Home Screen. It opens full screen like an app and works offline after you download a class.',
    te: 'WonderLab ను హోమ్ స్క్రీన్‌కు జోడించండి. ఇది యాప్ లాగే పూర్తి స్క్రీన్‌లో తెరుచుకుంటుంది, తరగతిని డౌన్‌లోడ్ చేశాక ఆఫ్‌లైన్‌లో కూడా పనిచేస్తుంది.',
  },
  iosSteps: [
    { en: 'Open this page in Safari.', te: 'ఈ పేజీని Safari లో తెరవండి.' },
    { en: 'Tap the Share button — a square with an arrow pointing up.', te: 'Share బటన్ నొక్కండి — పైకి బాణం ఉన్న చతురస్రం.' },
    { en: 'Scroll down and tap “Add to Home Screen”.', te: 'కిందికి స్క్రోల్ చేసి “Add to Home Screen” నొక్కండి.' },
    { en: 'Tap “Add”. WonderLab appears on your Home Screen.', te: '“Add” నొక్కండి. మీ హోమ్ స్క్రీన్‌పై WonderLab కనిపిస్తుంది.' },
  ],
  iosOtherBrowser: { en: 'You are using a different browser. Copy the link and open it in Safari.', te: 'మీరు వేరే బ్రౌజర్ వాడుతున్నారు. లింక్ కాపీ చేసి Safari లో తెరవండి.' },
  copyLink: { en: 'Copy link', te: 'లింక్ కాపీ చేయండి' },
  copied: { en: 'Link copied', te: 'లింక్ కాపీ అయింది' },
  desktopTitle: { en: 'On a computer', te: 'కంప్యూటర్‌లో' },
  desktopBody: {
    en: 'WonderLab works in any modern browser — just sign in. To put it on a phone, open this page on the phone or share it on WhatsApp.',
    te: 'WonderLab ఏ ఆధునిక బ్రౌజర్‌లోనైనా పనిచేస్తుంది — సైన్ ఇన్ చేస్తే చాలు. ఫోన్‌లో పెట్టుకోవడానికి, ఈ పేజీని ఫోన్‌లో తెరవండి లేదా వాట్సాప్‌లో షేర్ చేయండి.',
  },
  shareTitle: { en: 'Tell other parents and teachers', te: 'ఇతర తల్లిదండ్రులు, ఉపాధ్యాయులకు చెప్పండి' },
  shareBody: { en: 'WonderLab is free. Share it with families and schools who could use it.', te: 'WonderLab ఉచితం. ఉపయోగపడే కుటుంబాలు, పాఠశాలలతో పంచుకోండి.' },
} as const;
