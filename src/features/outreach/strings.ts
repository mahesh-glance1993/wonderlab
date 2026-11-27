// English + Telugu copy for the public /schools and /support pages. Kept beside the pages (not in
// src/i18n) because these are adult-facing marketing pages with their own language switch.
// NOTE: Telugu should be reviewed by a native speaker before wide promotion (docs/VERIFICATION.md).
import { useState } from 'react';
import { useApp } from '../../lib/app';
import type { LeadField } from '../../shared/leads';

export type OLang = 'en' | 'te';

const en = {
  langSwitch: 'తెలుగు',
  langSwitchLabel: 'చదవండి తెలుగులో (Read in Telugu)',
  // ---- schools ----
  sTitle: 'For schools',
  sH1: 'WonderLab for schools and tuition centres',
  sIntro: 'A free, calm learning app for Telangana classrooms — the full State syllabus for Classes 1–10, in Telugu and English, that keeps working when the internet does not.',
  sGetH: 'What your school gets',
  sGet: [
    ['book', 'Full Telangana syllabus, Classes 1–10', 'Mathematics, Science, EVS, Social Studies and languages, chapter by chapter, matched to the State textbooks.'],
    ['puzzle', 'Interactive practice', 'Step-by-step lessons, hints, virtual labs and practice that adapts to each learner.'],
    ['globe', 'Telugu and English', 'Every learner can switch language, with read-aloud narration.'],
    ['wifiOff', 'Works offline', 'Download class packs once over Wi-Fi; lessons keep working in rooms with no signal.'],
    ['user', 'Many learners on one account', 'Create a learner profile for each child on one classroom account — no child email or phone needed.'],
    ['chart', 'Progress overview for the teacher', 'See which topics each learner has mastered and who needs more practice.'],
  ] as [string, string, string][],
  sPilotH: 'Free pilot for one class for a term',
  sPilot: 'Try WonderLab with one class for a full term at no cost. We help you set up, and you tell us what works and what doesn’t.',
  sFormH: 'Ask about a pilot',
  sFormFor: 'This form is for school and tuition-centre staff. Give your own work contact details only — please do not enter any child’s name or details.',
  kind: 'You are enquiring for a', kSchool: 'School', kTuition: 'Tuition centre', kOther: 'Other (NGO, library, group)',
  contactName: 'Your name', role: 'Your role', roleHint: 'For example: Headmaster, Teacher, Centre owner',
  orgName: 'School or centre name', town: 'Town / district',
  phone: 'Phone', email: 'Email', contactHint: 'Give at least one — phone or email.',
  students: 'Approximate number of students (optional)', classes: 'Classes of interest (optional)', classPre: 'Pre-primary', classN: 'Class',
  message: 'Message (optional)', messageHint: 'What would you like to try? Any questions?',
  confirmStaff: 'I am a member of staff and I am sharing only my own work contact details — no child’s details.',
  honeypot: 'Leave this field empty',
  send: 'Send enquiry', sending: 'Sending…',
  sentH: 'Thank you!', sent: 'We have received your enquiry and will reply within a few working days.',
  sendAnother: 'Send another enquiry',
  failRate: 'Too many enquiries from this network. Please try again in an hour.',
  failOffline: 'You seem to be offline. Your enquiry was not sent — please try again when you are connected.',
  failGeneric: 'Your enquiry could not be sent. Please try again.',
  fixFields: 'Please check the highlighted fields.',
  sPrivacy: 'We use these details only to reply about WonderLab. Enquiries are deleted after 2 years.',
  // ---- support ----
  pTitle: 'Support WonderLab',
  pH1: 'Support WonderLab',
  pIntro: 'WonderLab is free. If it helps your child, you can support it.',
  pFree: 'Support is optional and unlocks nothing — every lesson stays free for every child.',
  pUpiH: 'Pay with any UPI app',
  pUpiTap: 'Open in a UPI app', pUpiScan: 'Or scan this code with any UPI app (Google Pay, PhonePe, Paytm, BHIM…). You choose the amount.',
  pUpiId: 'UPI ID', pCopy: 'Copy UPI ID', pCopied: 'UPI ID copied',
  pAdult: 'For parents and other adults. Children: please ask a grown-up first.',
  pSoon: 'Support options coming soon.',
  pOtherH: 'Other ways to help',
  pShare: 'Share WonderLab with other parents', pShareBtn: 'Share', pShareCopied: 'Link copied',
  pSchool: 'Tell your child’s school or tuition centre about WonderLab',
  pReport: 'Report mistakes: use “Report a problem” on any lesson or question',
  pSponsorH: 'Sponsor a school',
  pSponsor: 'Know a school that could use WonderLab? Point them to our free pilot for schools.',
  pSponsorLink: 'Schools and tuition centres',
  shareText: 'WonderLab — free learning for Nursery to Class 10, Telangana syllabus, in Telugu and English.',
};
type Strings = typeof en;

const te: Strings = {
  langSwitch: 'English',
  langSwitchLabel: 'Read in English',
  sTitle: 'పాఠశాలల కోసం',
  sH1: 'పాఠశాలలు మరియు ట్యూషన్ కేంద్రాల కోసం వండర్‌ల్యాబ్',
  sIntro: 'తెలంగాణ తరగతి గదుల కోసం ఉచిత, ప్రశాంతమైన అభ్యాస యాప్ — 1 నుండి 10వ తరగతి వరకు పూర్తి రాష్ట్ర సిలబస్, తెలుగు మరియు ఇంగ్లీషులో, ఇంటర్నెట్ లేకపోయినా పనిచేస్తుంది.',
  sGetH: 'మీ పాఠశాలకు ఏమి లభిస్తుంది',
  sGet: [
    ['book', 'పూర్తి తెలంగాణ సిలబస్, 1–10 తరగతులు', 'గణితం, సైన్స్, పరిసరాల విజ్ఞానం, సాంఘిక శాస్త్రం మరియు భాషలు — రాష్ట్ర పాఠ్యపుస్తకాలకు సరిపోయేలా అధ్యాయం వారీగా.'],
    ['puzzle', 'ఇంటరాక్టివ్ అభ్యాసం', 'దశల వారీ పాఠాలు, సూచనలు, వర్చువల్ ప్రయోగశాలలు మరియు ప్రతి విద్యార్థికి సరిపోయే అభ్యాసం.'],
    ['globe', 'తెలుగు మరియు ఇంగ్లీష్', 'ప్రతి విద్యార్థి భాష మార్చుకోవచ్చు, చదివి వినిపించే సదుపాయంతో.'],
    ['wifiOff', 'ఆఫ్‌లైన్‌లో పనిచేస్తుంది', 'Wi-Fi ద్వారా ఒకసారి తరగతి ప్యాక్‌లు డౌన్‌లోడ్ చేయండి; సిగ్నల్ లేని గదుల్లో కూడా పాఠాలు పనిచేస్తాయి.'],
    ['user', 'ఒకే ఖాతాలో చాలా మంది విద్యార్థులు', 'ఒకే తరగతి ఖాతాలో ప్రతి పిల్లవాడికి ఒక ప్రొఫైల్ — పిల్లల ఇమెయిల్ లేదా ఫోన్ అవసరం లేదు.'],
    ['chart', 'ఉపాధ్యాయునికి ప్రగతి సారాంశం', 'ఏ విద్యార్థి ఏ అంశాలు నేర్చుకున్నారో, ఎవరికి ఇంకా అభ్యాసం కావాలో చూడండి.'],
  ],
  sPilotH: 'ఒక తరగతికి ఒక టర్మ్ ఉచిత పైలట్',
  sPilot: 'ఒక తరగతితో పూర్తి టర్మ్ పాటు వండర్‌ల్యాబ్‌ను ఉచితంగా ప్రయత్నించండి. సెటప్‌లో మేము సహాయం చేస్తాము, ఏది పనిచేస్తుందో ఏది పనిచేయదో మీరు మాకు చెప్పండి.',
  sFormH: 'పైలట్ గురించి అడగండి',
  sFormFor: 'ఈ ఫారం పాఠశాల మరియు ట్యూషన్ కేంద్రం సిబ్బంది కోసం. మీ స్వంత పని సంప్రదింపు వివరాలు మాత్రమే ఇవ్వండి — దయచేసి ఏ పిల్లల పేరు లేదా వివరాలు నమోదు చేయవద్దు.',
  kind: 'మీరు దేని తరఫున అడుగుతున్నారు', kSchool: 'పాఠశాల', kTuition: 'ట్యూషన్ కేంద్రం', kOther: 'ఇతర (NGO, గ్రంథాలయం, బృందం)',
  contactName: 'మీ పేరు', role: 'మీ హోదా', roleHint: 'ఉదాహరణకు: ప్రధానోపాధ్యాయులు, ఉపాధ్యాయులు, కేంద్రం యజమాని',
  orgName: 'పాఠశాల లేదా కేంద్రం పేరు', town: 'పట్టణం / జిల్లా',
  phone: 'ఫోన్', email: 'ఇమెయిల్', contactHint: 'కనీసం ఒకటి ఇవ్వండి — ఫోన్ లేదా ఇమెయిల్.',
  students: 'సుమారు విద్యార్థుల సంఖ్య (ఐచ్ఛికం)', classes: 'ఆసక్తి ఉన్న తరగతులు (ఐచ్ఛికం)', classPre: 'ప్రీ-ప్రైమరీ', classN: 'తరగతి',
  message: 'సందేశం (ఐచ్ఛికం)', messageHint: 'మీరు ఏమి ప్రయత్నించాలనుకుంటున్నారు? ఏమైనా ప్రశ్నలు ఉన్నాయా?',
  confirmStaff: 'నేను సిబ్బందిలో ఒకరిని, నా స్వంత పని సంప్రదింపు వివరాలు మాత్రమే ఇస్తున్నాను — ఏ పిల్లల వివరాలు కాదు.',
  honeypot: 'ఈ ఖాళీని ఖాళీగా వదిలేయండి',
  send: 'విచారణ పంపండి', sending: 'పంపుతోంది…',
  sentH: 'ధన్యవాదాలు!', sent: 'మీ విచారణ మాకు అందింది. కొన్ని పని దినాల్లో సమాధానం ఇస్తాము.',
  sendAnother: 'మరో విచారణ పంపండి',
  failRate: 'ఈ నెట్‌వర్క్ నుండి చాలా విచారణలు వచ్చాయి. దయచేసి ఒక గంట తర్వాత మళ్ళీ ప్రయత్నించండి.',
  failOffline: 'మీరు ఆఫ్‌లైన్‌లో ఉన్నట్టున్నారు. విచారణ పంపబడలేదు — కనెక్ట్ అయ్యాక మళ్ళీ ప్రయత్నించండి.',
  failGeneric: 'విచారణ పంపలేకపోయాము. దయచేసి మళ్ళీ ప్రయత్నించండి.',
  fixFields: 'దయచేసి గుర్తించిన ఖాళీలను సరిచూడండి.',
  sPrivacy: 'ఈ వివరాలను వండర్‌ల్యాబ్ గురించి సమాధానం ఇవ్వడానికి మాత్రమే ఉపయోగిస్తాము. విచారణలు 2 సంవత్సరాల తర్వాత తొలగించబడతాయి.',
  pTitle: 'వండర్‌ల్యాబ్‌కు మద్దతు',
  pH1: 'వండర్‌ల్యాబ్‌కు మద్దతు ఇవ్వండి',
  pIntro: 'వండర్‌ల్యాబ్ ఉచితం. ఇది మీ పిల్లలకు ఉపయోగపడితే, మీరు మద్దతు ఇవ్వవచ్చు.',
  pFree: 'మద్దతు ఐచ్ఛికం, దానితో ఏమీ అదనంగా రాదు — ప్రతి పాఠం ప్రతి పిల్లవాడికి ఉచితంగానే ఉంటుంది.',
  pUpiH: 'ఏదైనా UPI యాప్‌తో చెల్లించండి',
  pUpiTap: 'UPI యాప్‌లో తెరవండి', pUpiScan: 'లేదా ఈ కోడ్‌ను ఏదైనా UPI యాప్‌తో (Google Pay, PhonePe, Paytm, BHIM…) స్కాన్ చేయండి. మొత్తం మీరే ఎంచుకోండి.',
  pUpiId: 'UPI ID', pCopy: 'UPI ID కాపీ చేయండి', pCopied: 'UPI ID కాపీ అయింది',
  pAdult: 'తల్లిదండ్రులు మరియు ఇతర పెద్దల కోసం. పిల్లలు: దయచేసి ముందుగా పెద్దవారిని అడగండి.',
  pSoon: 'మద్దతు ఎంపికలు త్వరలో వస్తాయి.',
  pOtherH: 'సహాయం చేయడానికి ఇతర మార్గాలు',
  pShare: 'వండర్‌ల్యాబ్‌ను ఇతర తల్లిదండ్రులతో పంచుకోండి', pShareBtn: 'పంచుకోండి', pShareCopied: 'లింక్ కాపీ అయింది',
  pSchool: 'మీ పిల్లల పాఠశాల లేదా ట్యూషన్ కేంద్రానికి వండర్‌ల్యాబ్ గురించి చెప్పండి',
  pReport: 'తప్పులు తెలియజేయండి: ఏ పాఠంలోనైనా “సమస్యను నివేదించండి” ఉపయోగించండి',
  pSponsorH: 'ఒక పాఠశాలను స్పాన్సర్ చేయండి',
  pSponsor: 'వండర్‌ల్యాబ్ ఉపయోగపడే పాఠశాల మీకు తెలుసా? పాఠశాలల కోసం మా ఉచిత పైలట్ గురించి వారికి చెప్పండి.',
  pSponsorLink: 'పాఠశాలలు మరియు ట్యూషన్ కేంద్రాలు',
  shareText: 'వండర్‌ల్యాబ్ — నర్సరీ నుండి 10వ తరగతి వరకు ఉచిత అభ్యాసం, తెలంగాణ సిలబస్, తెలుగు మరియు ఇంగ్లీషులో.',
};

const fieldErrors: Record<OLang, Record<LeadField, string>> = {
  en: {
    kind: 'Choose school, tuition centre or other.',
    contactName: 'Enter your name (2–80 characters).',
    role: 'Enter your role (2–60 characters).',
    orgName: 'Enter the school or centre name (2–120 characters).',
    town: 'Enter the town or district (2–80 characters).',
    email: 'Enter a valid email address.',
    phone: 'Enter a valid phone number (10 digits, or + and country code).',
    contact: 'Give a phone number or an email address so we can reply.',
    students: 'Enter a number between 1 and 100000, or leave it empty.',
    classes: 'Choose valid classes.',
    message: 'Keep the message under 1000 characters.',
    confirmStaff: 'Please tick to confirm.',
  },
  te: {
    kind: 'పాఠశాల, ట్యూషన్ కేంద్రం లేదా ఇతర ఎంచుకోండి.',
    contactName: 'మీ పేరు నమోదు చేయండి (2–80 అక్షరాలు).',
    role: 'మీ హోదా నమోదు చేయండి (2–60 అక్షరాలు).',
    orgName: 'పాఠశాల లేదా కేంద్రం పేరు నమోదు చేయండి (2–120 అక్షరాలు).',
    town: 'పట్టణం లేదా జిల్లా నమోదు చేయండి (2–80 అక్షరాలు).',
    email: 'సరైన ఇమెయిల్ చిరునామా నమోదు చేయండి.',
    phone: 'సరైన ఫోన్ నంబర్ నమోదు చేయండి (10 అంకెలు, లేదా + మరియు దేశ కోడ్).',
    contact: 'మేము సమాధానం ఇవ్వడానికి ఫోన్ నంబర్ లేదా ఇమెయిల్ ఇవ్వండి.',
    students: '1 నుండి 100000 మధ్య సంఖ్య నమోదు చేయండి, లేదా ఖాళీగా వదిలేయండి.',
    classes: 'సరైన తరగతులు ఎంచుకోండి.',
    message: 'సందేశం 1000 అక్షరాల లోపు ఉంచండి.',
    confirmStaff: 'నిర్ధారించడానికి దయచేసి టిక్ చేయండి.',
  },
};

export const STRINGS: Record<OLang, Strings> = { en, te };
export const FIELD_ERRORS = fieldErrors;

/** Page language: ?lang=te|en in the URL, else the app's language; switchable on the page. */
export function useOutreachLang() {
  const { lang } = useApp();
  const [l, setL] = useState<OLang>(() => {
    const q = typeof location !== 'undefined' ? new URLSearchParams(location.search).get('lang') : null;
    return q === 'te' || q === 'en' ? q : lang === 'te' ? 'te' : 'en';
  });
  return { lang: l, s: STRINGS[l], fe: FIELD_ERRORS[l], toggle: () => setL((x) => (x === 'te' ? 'en' : 'te')) };
}
