// Privacy Policy and Terms of Use (English + Telugu), shown at /privacy and /terms and opened by the apps.
//
// NOT SHOWN TO USERS — NOTE FOR THE OPERATOR:
//   * This text is a plain-language draft written from what the code actually stores (migrations/*.sql, worker/*.ts).
//     It is NOT legal advice. A lawyer familiar with the Digital Personal Data Protection Act 2023 and the DPDP Rules
//     must review both documents (English and Telugu) before public launch.
//   * Fill in every [PLACEHOLDER] (operator name, contact email, grievance officer, postal address) before launch.
//   * The Telugu text should also be checked by a fluent Telugu reader; the English version is the reference.
//   * If you change what the product collects or who processes it, update this file and bump CONSENT_VERSION in
//     src/shared/legal.ts so every parent is asked to agree again.

export interface L { en: string; te: string }
export type Block = L | { list: L[] };
export interface Section { id: string; title: L; blocks: Block[] }
export interface LegalDoc { title: L; updated: L; intro: L; sections: Section[] }

export const OPERATOR = '[OPERATOR NAME]';
export const CONTACT = '[CONTACT EMAIL]';
export const GRIEVANCE = '[GRIEVANCE OFFICER NAME / EMAIL]';
export const ADDRESS = '[POSTAL ADDRESS]';

const UPDATED: L = { en: 'Last updated: 19 November 2026', te: 'చివరిగా నవీకరించినది: 19 నవంబర్ 2026' };

export const PRIVACY: LegalDoc = {
  title: { en: 'Privacy Policy', te: 'గోప్యతా విధానం' },
  updated: UPDATED,
  intro: {
    en: `WonderLab is an independent learning app for children from Nursery to Class 10. It is run by ${OPERATOR} ("we", "us") and is not affiliated with or endorsed by SCERT Telangana or any government body. This page explains, in plain language, what information WonderLab keeps, why, where, for how long, and how you can see, correct or delete it. WonderLab is meant for families in India and follows the Digital Personal Data Protection Act, 2023 (DPDP Act).`,
    te: `WonderLab నర్సరీ నుండి 10వ తరగతి వరకు పిల్లల కోసం ఒక స్వతంత్ర అభ్యాస యాప్. దీనిని ${OPERATOR} ("మేము") నడుపుతున్నారు; ఇది SCERT తెలంగాణ లేదా ఏ ప్రభుత్వ సంస్థతోనూ అనుబంధించబడలేదు, వాటి ఆమోదం పొందలేదు. WonderLab ఏ సమాచారాన్ని ఉంచుతుంది, ఎందుకు, ఎక్కడ, ఎంతకాలం, మరియు మీరు దానిని ఎలా చూడవచ్చు, సరిచేయవచ్చు లేదా తొలగించవచ్చు అనేది ఈ పేజీ సరళమైన భాషలో వివరిస్తుంది. WonderLab భారతదేశంలోని కుటుంబాల కోసం ఉద్దేశించబడింది మరియు డిజిటల్ వ్యక్తిగత డేటా రక్షణ చట్టం, 2023 (DPDP చట్టం)ను అనుసరిస్తుంది.`,
  },
  sections: [
    {
      id: 'summary',
      title: { en: 'The short version', te: 'సంక్షిప్తంగా' },
      blocks: [{ list: [
        { en: 'A parent or guardian (18 or older) creates the account and agrees to this policy. Children use a nickname — never their full name.', te: 'తల్లిదండ్రులు లేదా సంరక్షకులు (18 ఏళ్లు లేదా పైబడినవారు) ఖాతాను సృష్టించి ఈ విధానానికి అంగీకరిస్తారు. పిల్లలు ముద్దుపేరు మాత్రమే వాడతారు — పూర్తి పేరు ఎప్పుడూ కాదు.' },
        { en: 'No advertisements. No third-party tracking or analytics. We never sell or share your data for marketing.', te: 'ప్రకటనలు లేవు. మూడవ పక్ష ట్రాకింగ్ లేదా అనలిటిక్స్ లేవు. మీ డేటాను మార్కెటింగ్ కోసం ఎప్పుడూ అమ్మము లేదా పంచుకోము.' },
        { en: 'No public profiles, chat, leaderboards or public galleries. Children cannot contact other users.', te: 'పబ్లిక్ ప్రొఫైల్‌లు, చాట్, లీడర్‌బోర్డ్‌లు లేదా పబ్లిక్ గ్యాలరీలు లేవు. పిల్లలు ఇతర వినియోగదారులను సంప్రదించలేరు.' },
        { en: 'You can download all your family\'s data, or delete the account and everything in it, at any time from Parent settings → Your data.', te: 'తల్లిదండ్రుల సెట్టింగ్‌లు → మీ డేటా నుండి మీ కుటుంబ డేటా మొత్తాన్ని డౌన్‌లోడ్ చేయవచ్చు, లేదా ఖాతాను మరియు దానిలోని ప్రతిదాన్నీ ఎప్పుడైనా తొలగించవచ్చు.' },
      ] }],
    },
    {
      id: 'collect',
      title: { en: 'What we keep', te: 'మేము ఉంచే సమాచారం' },
      blocks: [
        { en: 'Parent account:', te: 'తల్లిదండ్రుల ఖాతా:' },
        { list: [
          { en: 'Username, and which security question you chose.', te: 'యూజర్‌నేమ్, మరియు మీరు ఎంచుకున్న భద్రతా ప్రశ్న.' },
          { en: 'Password, security answer and recovery codes — stored only as secure one-way hashes. We cannot read them.', te: 'పాస్‌వర్డ్, భద్రతా సమాధానం మరియు రికవరీ కోడ్‌లు — సురక్షిత వన్-వే హాష్‌లుగా మాత్రమే నిల్వ చేయబడతాయి. మేము వాటిని చదవలేము.' },
          { en: 'Email address, only if you give one (optional), and whether it is confirmed. It is used only for account recovery and account messages.', te: 'ఈమెయిల్ చిరునామా — మీరు ఇస్తే మాత్రమే (ఐచ్ఛికం), మరియు అది నిర్ధారించబడిందా లేదా. ఇది ఖాతా రికవరీ మరియు ఖాతా సందేశాల కోసం మాత్రమే వాడబడుతుంది.' },
          { en: 'When you agreed to this policy and the Terms, and which version.', te: 'మీరు ఈ విధానానికి మరియు నిబంధనలకు ఎప్పుడు అంగీకరించారు, ఏ వెర్షన్‌కు.' },
          { en: 'Signed-in devices: a short label such as "Chrome on Android", and when each sign-in started and was last used.', te: 'సైన్-ఇన్ అయిన పరికరాలు: "Chrome on Android" వంటి చిన్న పేరు, మరియు ప్రతి సైన్-ఇన్ ఎప్పుడు మొదలైంది, చివరిగా ఎప్పుడు వాడబడింది.' },
          { en: 'A security log of account events (for example sign-in, password change, data export) with the date and time.', te: 'ఖాతా సంఘటనల భద్రతా లాగ్ (ఉదాహరణకు సైన్-ఇన్, పాస్‌వర్డ్ మార్పు, డేటా ఎగుమతి) తేదీ మరియు సమయంతో.' },
        ] },
        { en: 'Each learner (child) profile:', te: 'ప్రతి అభ్యాసకుని (పిల్లల) ప్రొఫైల్:' },
        { list: [
          { en: 'Nickname, avatar picture (chosen from our set), class, and age band (for example "5–6"). We do not ask for a birth date, surname, photo, school or location.', te: 'ముద్దుపేరు, అవతార్ చిత్రం (మా సెట్ నుండి ఎంచుకున్నది), తరగతి, మరియు వయస్సు శ్రేణి (ఉదాహరణకు "5–6"). మేము పుట్టిన తేదీ, ఇంటిపేరు, ఫోటో, పాఠశాల లేదా స్థానం అడగము.' },
          { en: 'Settings: language, syllabus, theme, text size, sound, voice and break reminders.', te: 'సెట్టింగ్‌లు: భాష, సిలబస్, థీమ్, అక్షర పరిమాణం, శబ్దం, గొంతు మరియు విరామ రిమైండర్‌లు.' },
          { en: 'Learning records: which questions were answered, the answer given, whether it was right, hints used and time taken; progress per topic; where the child is in each lesson, game or activity; stars earned; which offline lesson packs were downloaded.', te: 'అభ్యాస రికార్డులు: ఏ ప్రశ్నలకు సమాధానం ఇచ్చారు, ఇచ్చిన సమాధానం, అది సరైనదా, వాడిన సూచనలు మరియు పట్టిన సమయం; ప్రతి అంశంలో పురోగతి; ప్రతి పాఠం, ఆట లేదా కార్యకలాపంలో పిల్లలు ఎక్కడ ఉన్నారు; సంపాదించిన నక్షత్రాలు; ఏ ఆఫ్‌లైన్ పాఠ ప్యాక్‌లు డౌన్‌లోడ్ చేశారు.' },
          { en: 'What the child creates: My Notes (typed text and handwriting) and artwork (drawings and small preview pictures).', te: 'పిల్లలు సృష్టించేవి: నా నోట్స్ (టైప్ చేసిన వచనం మరియు చేతిరాత) మరియు చిత్రాలు (డ్రాయింగ్‌లు మరియు చిన్న ప్రివ్యూ చిత్రాలు).' },
        ] },
        { en: 'If you ask for an export, it includes all of the above that we hold (except passwords, security answers and recovery codes, which we cannot read).', te: 'మీరు ఎగుమతి కోరితే, మా వద్ద ఉన్న పైవన్నీ అందులో ఉంటాయి (మేము చదవలేని పాస్‌వర్డ్‌లు, భద్రతా సమాధానాలు మరియు రికవరీ కోడ్‌లు తప్ప).' },
        { en: 'Problem reports you send us about a lesson or question (the lesson, the question and your description).', te: 'ఒక పాఠం లేదా ప్రశ్న గురించి మీరు పంపే సమస్య నివేదికలు (పాఠం, ప్రశ్న మరియు మీ వివరణ).' },
        { en: 'Technical information: your internet (IP) address is used as a short counter to stop repeated password guessing; it is not linked to your account. If the app hits an error it sends us the error message, the page and the app version — never names, usernames, emails or IDs. Our hosting provider (Cloudflare) processes standard request details such as IP address and browser type to deliver and protect the service.', te: 'సాంకేతిక సమాచారం: పదేపదే పాస్‌వర్డ్ ఊహించడాన్ని ఆపడానికి మీ ఇంటర్నెట్ (IP) చిరునామా ఒక చిన్న లెక్కింపుగా వాడబడుతుంది; ఇది మీ ఖాతాతో అనుసంధానించబడదు. యాప్‌లో లోపం వస్తే అది లోప సందేశం, పేజీ మరియు యాప్ వెర్షన్ మాత్రమే పంపుతుంది — పేర్లు, యూజర్‌నేమ్‌లు, ఈమెయిల్‌లు లేదా IDలు ఎప్పుడూ కాదు. మా హోస్టింగ్ ప్రొవైడర్ (Cloudflare) సేవను అందించడానికి మరియు రక్షించడానికి IP చిరునామా, బ్రౌజర్ రకం వంటి సాధారణ అభ్యర్థన వివరాలను ప్రాసెస్ చేస్తుంది.' },
        { en: 'School and tuition-centre enquiries (the "For schools" form): the adult contact\'s name, role, organisation, town, email or phone, number of students, classes and message. We use them only to reply about WonderLab and delete them after 2 years. The form never asks about children.', te: 'పాఠశాల మరియు ట్యూషన్ కేంద్రాల విచారణలు ("పాఠశాలల కోసం" ఫారం): సంప్రదించే పెద్దవారి పేరు, హోదా, సంస్థ, ఊరు, ఈమెయిల్ లేదా ఫోన్, విద్యార్థుల సంఖ్య, తరగతులు మరియు సందేశం. వీటిని WonderLab గురించి సమాధానం ఇవ్వడానికి మాత్రమే వాడి, 2 సంవత్సరాల తర్వాత తొలగిస్తాము. ఈ ఫారం పిల్లల గురించి ఎప్పుడూ అడగదు.' },
        { en: 'We do not collect: children\'s full names, birth dates, photos, voice or camera recordings, location, contacts, phone numbers or government ID numbers. The website turns off camera, microphone and location access.', te: 'మేము సేకరించనివి: పిల్లల పూర్తి పేర్లు, పుట్టిన తేదీలు, ఫోటోలు, గొంతు లేదా కెమెరా రికార్డింగ్‌లు, స్థానం, పరిచయాలు, ఫోన్ నంబర్లు లేదా ప్రభుత్వ ID నంబర్లు. వెబ్‌సైట్ కెమెరా, మైక్రోఫోన్ మరియు స్థాన ప్రాప్యతను ఆపివేస్తుంది.' },
      ],
    },
    {
      id: 'use',
      title: { en: 'Why we use it', te: 'మేము దీనిని ఎందుకు వాడతాము' },
      blocks: [{ list: [
        { en: 'To run your account: sign-in, keeping devices signed in, and helping you recover a forgotten password or username.', te: 'మీ ఖాతాను నడపడానికి: సైన్-ఇన్, పరికరాలను సైన్-ఇన్‌లో ఉంచడం, మరియు మరచిపోయిన పాస్‌వర్డ్ లేదా యూజర్‌నేమ్ తిరిగి పొందడంలో సహాయం.' },
        { en: 'To save each child\'s work and progress and keep it the same on all your devices, including offline.', te: 'ప్రతి పిల్లల పని మరియు పురోగతిని సేవ్ చేయడానికి మరియు ఆఫ్‌లైన్‌తో సహా మీ అన్ని పరికరాలలో ఒకేలా ఉంచడానికి.' },
        { en: 'To suggest the next lesson and set difficulty. This uses only the child\'s own progress inside WonderLab and only for learning.', te: 'తదుపరి పాఠాన్ని సూచించడానికి మరియు కష్టతను నిర్ణయించడానికి. ఇది WonderLab లోని పిల్లల సొంత పురోగతిని మాత్రమే, అభ్యాసం కోసం మాత్రమే వాడుతుంది.' },
        { en: 'To show you, the parent, your child\'s progress.', te: 'మీకు, తల్లిదండ్రులకు, మీ పిల్లల పురోగతిని చూపడానికి.' },
        { en: 'To send account emails you need (confirm your email, password reset, username reminder). We do not send marketing emails.', te: 'మీకు అవసరమైన ఖాతా ఈమెయిల్‌లు పంపడానికి (ఈమెయిల్ నిర్ధారణ, పాస్‌వర్డ్ రీసెట్, యూజర్‌నేమ్ గుర్తుచేయడం). మేము మార్కెటింగ్ ఈమెయిల్‌లు పంపము.' },
        { en: 'To fix mistakes you report, and to keep the service secure.', te: 'మీరు నివేదించిన తప్పులను సరిచేయడానికి, మరియు సేవను సురక్షితంగా ఉంచడానికి.' },
      ] }],
    },
    {
      id: 'children',
      title: { en: 'Children\'s data', te: 'పిల్లల డేటా' },
      blocks: [
        { en: 'Under the DPDP Act, anyone under 18 is a child. We create learner profiles only after a parent or legal guardian (18 or older) has signed in with their own account and agreed to this policy and the Terms. We record when that agreement was given.', te: 'DPDP చట్టం ప్రకారం 18 ఏళ్ల లోపు ఎవరైనా పిల్లలే. తల్లిదండ్రులు లేదా చట్టబద్ధ సంరక్షకులు (18 ఏళ్లు లేదా పైబడినవారు) తమ సొంత ఖాతాతో సైన్ ఇన్ చేసి ఈ విధానానికి మరియు నిబంధనలకు అంగీకరించిన తర్వాత మాత్రమే మేము అభ్యాసకుల ప్రొఫైల్‌లను సృష్టిస్తాము. ఆ అంగీకారం ఎప్పుడు ఇచ్చారో మేము నమోదు చేస్తాము.' },
        { en: 'Children\'s data is never used for tracking, behavioural monitoring or targeted advertising. There are no ads of any kind. We do not follow children across other apps or websites, do not build profiles for marketing, and do not sell or share their data. Progress is used only to teach the child and to show the parent how they are doing.', te: 'పిల్లల డేటా ట్రాకింగ్, ప్రవర్తనా పర్యవేక్షణ లేదా లక్ష్యిత ప్రకటనల కోసం ఎప్పుడూ వాడబడదు. ఏ రకమైన ప్రకటనలూ లేవు. మేము ఇతర యాప్‌లు లేదా వెబ్‌సైట్‌లలో పిల్లలను అనుసరించము, మార్కెటింగ్ కోసం ప్రొఫైల్‌లు తయారు చేయము, వారి డేటాను అమ్మము లేదా పంచుకోము. పురోగతి పిల్లలకు నేర్పడానికి మరియు వారు ఎలా చేస్తున్నారో తల్లిదండ్రులకు చూపడానికి మాత్రమే వాడబడుతుంది.' },
        { en: 'Actions such as adding or removing a learner, changing account details, exporting or deleting data need the parent password again.', te: 'అభ్యాసకుడిని చేర్చడం లేదా తొలగించడం, ఖాతా వివరాలు మార్చడం, డేటా ఎగుమతి లేదా తొలగింపు వంటి చర్యలకు తల్లిదండ్రుల పాస్‌వర్డ్ మళ్లీ అవసరం.' },
      ],
    },
    {
      id: 'where',
      title: { en: 'Where it is stored and who helps us', te: 'ఇది ఎక్కడ నిల్వ చేయబడుతుంది, మాకు ఎవరు సహాయం చేస్తారు' },
      blocks: [
        { list: [
          { en: 'Cloudflare, Inc. hosts WonderLab and its database (Cloudflare Workers and D1). Cloudflare\'s servers may be in India or in other countries. Cloudflare processes the data only to provide the service to us.', te: 'Cloudflare, Inc. WonderLab ను మరియు దాని డేటాబేస్‌ను (Cloudflare Workers మరియు D1) హోస్ట్ చేస్తుంది. Cloudflare సర్వర్లు భారతదేశంలో లేదా ఇతర దేశాలలో ఉండవచ్చు. Cloudflare మాకు సేవ అందించడానికి మాత్రమే డేటాను ప్రాసెస్ చేస్తుంది.' },
          { en: 'Natural-voice narration: lesson text is turned into speech by Cloudflare Workers AI, and the audio is shared between all families so each sentence is made only once. Anything containing a child\'s nickname (such as a greeting) is spoken by the device\'s own voice instead and is never sent.', te: 'సహజ గొంతు కథనం: పాఠ వచనం Cloudflare Workers AI ద్వారా మాటలుగా మార్చబడుతుంది, ప్రతి వాక్యం ఒక్కసారే తయారయ్యేలా ఆ ఆడియో అన్ని కుటుంబాలకు పంచబడుతుంది. పిల్లల ముద్దుపేరు ఉన్న ఏదైనా (పలకరింపు వంటిది) పరికరం సొంత గొంతుతోనే చదవబడుతుంది, ఎప్పుడూ పంపబడదు.' },
          { en: 'Email: if you give an email address, account emails are sent through our email delivery provider (Resend).', te: 'ఈమెయిల్: మీరు ఈమెయిల్ చిరునామా ఇస్తే, ఖాతా ఈమెయిల్‌లు మా ఈమెయిల్ డెలివరీ ప్రొవైడర్ (Resend) ద్వారా పంపబడతాయి.' },
          { en: 'Fonts: the website loads its fonts from Google Fonts, so Google receives your device\'s IP address and browser details when a page loads. The Android and iPad apps do not use Google Fonts.', te: 'ఫాంట్‌లు: వెబ్‌సైట్ తన ఫాంట్‌లను Google Fonts నుండి లోడ్ చేస్తుంది, కాబట్టి పేజీ లోడ్ అయినప్పుడు Google మీ పరికరం యొక్క IP చిరునామా మరియు బ్రౌజర్ వివరాలను పొందుతుంది. Android మరియు iPad యాప్‌లు Google Fonts వాడవు.' },
          { en: 'Some textbook references link to outside websites (for example Google Drive). Those open only if you tap them, and their own privacy policies apply.', te: 'కొన్ని పాఠ్యపుస్తక సూచనలు బయటి వెబ్‌సైట్‌లకు (ఉదాహరణకు Google Drive) లింక్ చేస్తాయి. మీరు నొక్కితేనే అవి తెరుచుకుంటాయి, వాటి సొంత గోప్యతా విధానాలు వర్తిస్తాయి.' },
        ] },
        { en: 'On your device, WonderLab saves progress, notes, artwork and downloaded lessons so it works offline, plus one sign-in cookie that is needed for the account to work. There are no advertising or analytics cookies. "Remove this device\'s data" in Parent settings clears what is saved on a device.', te: 'మీ పరికరంలో, WonderLab ఆఫ్‌లైన్‌లో పని చేయడానికి పురోగతి, నోట్స్, చిత్రాలు మరియు డౌన్‌లోడ్ చేసిన పాఠాలను సేవ్ చేస్తుంది, మరియు ఖాతా పని చేయడానికి అవసరమైన ఒక సైన్-ఇన్ కుకీ. ప్రకటనల లేదా అనలిటిక్స్ కుకీలు లేవు. తల్లిదండ్రుల సెట్టింగ్‌లలోని "ఈ పరికరం డేటాను తీసివేయండి" ఒక పరికరంలో సేవ్ అయినవాటిని తొలగిస్తుంది.' },
      ],
    },
    {
      id: 'retention',
      title: { en: 'How long we keep it', te: 'మేము ఎంతకాలం ఉంచుతాము' },
      blocks: [
        { en: 'We keep your family\'s data while your account exists, because it is needed to keep each child\'s progress.', te: 'ప్రతి పిల్లల పురోగతిని ఉంచడానికి అవసరం కాబట్టి, మీ ఖాతా ఉన్నంతకాలం మేము మీ కుటుంబ డేటాను ఉంచుతాము.' },
        { en: 'When you remove a learner, their profile and all their records are deleted. When you delete the account, the account, every learner profile and every record that belongs to it are deleted from our database straight away. Copies can remain in our hosting provider\'s automatic database recovery history for up to 30 days and in our encrypted backup copies for up to [BACKUP RETENTION PERIOD], and are then gone.', te: 'మీరు ఒక అభ్యాసకుడిని తొలగించినప్పుడు, వారి ప్రొఫైల్ మరియు అన్ని రికార్డులు తొలగించబడతాయి. మీరు ఖాతాను తొలగించినప్పుడు, ఖాతా, ప్రతి అభ్యాసకుని ప్రొఫైల్ మరియు దానికి చెందిన ప్రతి రికార్డు మా డేటాబేస్ నుండి వెంటనే తొలగించబడతాయి. కాపీలు మా హోస్టింగ్ ప్రొవైడర్ యొక్క ఆటోమేటిక్ డేటాబేస్ రికవరీ చరిత్రలో 30 రోజుల వరకు, మా ఎన్‌క్రిప్ట్ చేసిన బ్యాకప్ కాపీలలో [BACKUP RETENTION PERIOD] వరకు ఉండవచ్చు, తర్వాత పూర్తిగా పోతాయి.' },
      ],
    },
    {
      id: 'rights',
      title: { en: 'Your rights and how to use them', te: 'మీ హక్కులు మరియు వాటిని ఎలా వాడాలి' },
      blocks: [
        { en: 'As the parent or guardian you can use these rights for yourself and for your child. Most can be done straight away in Parent settings; you can also write to us at ' + CONTACT + '.', te: 'తల్లిదండ్రులు లేదా సంరక్షకులుగా మీరు ఈ హక్కులను మీ కోసం మరియు మీ పిల్లల కోసం వాడవచ్చు. చాలా వరకు తల్లిదండ్రుల సెట్టింగ్‌లలో వెంటనే చేయవచ్చు; మీరు మాకు ' + CONTACT + ' కు కూడా వ్రాయవచ్చు.' },
        { list: [
          { en: 'See your data (access): Parent settings → Your data → Export downloads everything we hold about your family as a file. Parent settings → Progress shows each child\'s progress.', te: 'మీ డేటాను చూడండి (ప్రాప్యత): తల్లిదండ్రుల సెట్టింగ్‌లు → మీ డేటా → ఎగుమతి మీ కుటుంబం గురించి మా వద్ద ఉన్న ప్రతిదాన్నీ ఒక ఫైల్‌గా డౌన్‌లోడ్ చేస్తుంది. తల్లిదండ్రుల సెట్టింగ్‌లు → పురోగతి ప్రతి పిల్లల పురోగతిని చూపుతుంది.' },
          { en: 'Correct it: change a learner\'s nickname, class or age band under Learners, and your email, password or security question under Account. For anything else, write to us.', te: 'సరిచేయండి: అభ్యాసకులు కింద అభ్యాసకుని ముద్దుపేరు, తరగతి లేదా వయస్సు శ్రేణిని, ఖాతా కింద మీ ఈమెయిల్, పాస్‌వర్డ్ లేదా భద్రతా ప్రశ్నను మార్చండి. ఇంకేదైనా కోసం మాకు వ్రాయండి.' },
          { en: 'Erase it: remove one learner under Learners, or delete the whole account under Your data → Delete account.', te: 'తొలగించండి: అభ్యాసకులు కింద ఒక అభ్యాసకుడిని తీసివేయండి, లేదా మీ డేటా → ఖాతాను తొలగించండి కింద మొత్తం ఖాతాను తొలగించండి.' },
          { en: 'Withdraw consent: WonderLab cannot work without the data described above, so withdrawing consent means deleting the account and all its data (Your data → Delete account). It is as easy as giving consent, and takes effect at once.', te: 'అంగీకారాన్ని ఉపసంహరించుకోండి: పైన చెప్పిన డేటా లేకుండా WonderLab పని చేయదు, కాబట్టి అంగీకారం ఉపసంహరించుకోవడం అంటే ఖాతాను మరియు దాని డేటా మొత్తాన్ని తొలగించడం (మీ డేటా → ఖాతాను తొలగించండి). ఇది అంగీకారం ఇచ్చినంత సులభం, వెంటనే అమలులోకి వస్తుంది.' },
          { en: 'Nominate someone: you can name a person who may use these rights for you if you die or become unable to. Write to us to do this.', te: 'ఒకరిని నామినేట్ చేయండి: మీరు మరణిస్తే లేదా అసమర్థులైతే మీ తరపున ఈ హక్కులను వాడగల వ్యక్తిని మీరు సూచించవచ్చు. దీని కోసం మాకు వ్రాయండి.' },
          { en: 'Complain: contact our Grievance Officer (below). If you are not satisfied with the answer, you can complain to the Data Protection Board of India.', te: 'ఫిర్యాదు చేయండి: మా ఫిర్యాదుల అధికారిని (కింద) సంప్రదించండి. సమాధానంతో మీరు సంతృప్తి చెందకపోతే, మీరు భారత డేటా రక్షణ బోర్డుకు ఫిర్యాదు చేయవచ్చు.' },
        ] },
        { en: 'We may ask you to sign in, or ask a question only the account holder can answer, before acting on a request sent by email, so that nobody else can get or delete your family\'s data.', te: 'ఈమెయిల్ ద్వారా వచ్చిన అభ్యర్థనపై చర్య తీసుకునే ముందు, మీ కుటుంబ డేటాను మరెవరూ పొందకుండా లేదా తొలగించకుండా ఉండేందుకు, మేము మిమ్మల్ని సైన్ ఇన్ చేయమని లేదా ఖాతాదారుడు మాత్రమే జవాబు చెప్పగల ప్రశ్న అడగవచ్చు.' },
      ],
    },
    {
      id: 'delete',
      title: { en: 'How to delete your account and data', te: 'మీ ఖాతా మరియు డేటాను ఎలా తొలగించాలి' },
      blocks: [
        { list: [
          { en: 'On the website or in the app: Parent settings → Your data → Delete account and all data. Enter the parent password, then type your username to confirm. Everything is deleted at once on all devices.', te: 'వెబ్‌సైట్‌లో లేదా యాప్‌లో: తల్లిదండ్రుల సెట్టింగ్‌లు → మీ డేటా → ఖాతా మరియు మొత్తం డేటాను తొలగించండి. తల్లిదండ్రుల పాస్‌వర్డ్ నమోదు చేసి, నిర్ధారించడానికి మీ యూజర్‌నేమ్ టైప్ చేయండి. అన్ని పరికరాలలో ప్రతిదీ ఒకేసారి తొలగించబడుతుంది.' },
          { en: `If you cannot sign in: email ${CONTACT} with your username and ask us to delete the account. We will check that the request comes from the account holder and then delete everything.`, te: `మీరు సైన్ ఇన్ చేయలేకపోతే: మీ యూజర్‌నేమ్‌తో ${CONTACT} కు ఈమెయిల్ చేసి ఖాతాను తొలగించమని అడగండి. అభ్యర్థన ఖాతాదారుడి నుండే వచ్చిందని నిర్ధారించుకుని, ప్రతిదాన్నీ తొలగిస్తాము.` },
          { en: 'What is deleted: the parent account, every learner profile, all progress, answers, notes, artwork, settings, downloads list, problem reports, signed-in devices and the security log.', te: 'తొలగించబడేవి: తల్లిదండ్రుల ఖాతా, ప్రతి అభ్యాసకుని ప్రొఫైల్, మొత్తం పురోగతి, సమాధానాలు, నోట్స్, చిత్రాలు, సెట్టింగ్‌లు, డౌన్‌లోడ్‌ల జాబితా, సమస్య నివేదికలు, సైన్-ఇన్ పరికరాలు మరియు భద్రతా లాగ్.' },
        ] },
      ],
    },
    {
      id: 'security',
      title: { en: 'Keeping it safe, and if something goes wrong', te: 'సురక్షితంగా ఉంచడం, ఏదైనా తప్పు జరిగితే' },
      blocks: [
        { en: 'All connections use HTTPS. Passwords, security answers and recovery codes are stored only as one-way hashes. Each family can see only its own data, and sensitive actions need the parent password again.', te: 'అన్ని కనెక్షన్‌లు HTTPS వాడతాయి. పాస్‌వర్డ్‌లు, భద్రతా సమాధానాలు మరియు రికవరీ కోడ్‌లు వన్-వే హాష్‌లుగా మాత్రమే నిల్వ చేయబడతాయి. ప్రతి కుటుంబం తన సొంత డేటాను మాత్రమే చూడగలదు, సున్నితమైన చర్యలకు తల్లిదండ్రుల పాస్‌వర్డ్ మళ్లీ అవసరం.' },
        { en: 'If a personal data breach happens, we will tell the parents affected and the Data Protection Board of India as the law requires, without delay: what happened, what data was involved, what we are doing about it and what you can do.', te: 'వ్యక్తిగత డేటా ఉల్లంఘన జరిగితే, చట్టం కోరిన విధంగా, ఆలస్యం లేకుండా, ప్రభావితమైన తల్లిదండ్రులకు మరియు భారత డేటా రక్షణ బోర్డుకు తెలియజేస్తాము: ఏమి జరిగింది, ఏ డేటా ప్రభావితమైంది, మేము ఏమి చేస్తున్నాము మరియు మీరు ఏమి చేయవచ్చు.' },
      ],
    },
    {
      id: 'changes',
      title: { en: 'Changes to this policy', te: 'ఈ విధానంలో మార్పులు' },
      blocks: [
        { en: 'If we change this policy in a way that matters, we will update the date above and ask you to agree again the next time you open Parent settings.', te: 'మేము ఈ విధానాన్ని ముఖ్యమైన రీతిలో మారిస్తే, పైన ఉన్న తేదీని నవీకరించి, మీరు తదుపరిసారి తల్లిదండ్రుల సెట్టింగ్‌లు తెరిచినప్పుడు మళ్లీ అంగీకరించమని అడుగుతాము.' },
      ],
    },
    {
      id: 'contact',
      title: { en: 'Contact and Grievance Officer', te: 'సంప్రదింపు మరియు ఫిర్యాదుల అధికారి' },
      blocks: [
        { list: [
          { en: `Operator (Data Fiduciary): ${OPERATOR}, ${ADDRESS}`, te: `నిర్వాహకులు (డేటా ఫిడ్యూషియరీ): ${OPERATOR}, ${ADDRESS}` },
          { en: `Privacy questions and requests: ${CONTACT}`, te: `గోప్యతా ప్రశ్నలు మరియు అభ్యర్థనలు: ${CONTACT}` },
          { en: `Grievance Officer: ${GRIEVANCE}`, te: `ఫిర్యాదుల అధికారి: ${GRIEVANCE}` },
        ] },
        { en: 'We will acknowledge your request or complaint within 24 hours and resolve it within 15 days. You can write to us in English or Telugu.', te: 'మీ అభ్యర్థన లేదా ఫిర్యాదును 24 గంటల్లో స్వీకరించినట్లు తెలియజేసి, 15 రోజుల్లో పరిష్కరిస్తాము. మీరు మాకు ఇంగ్లీష్ లేదా తెలుగులో వ్రాయవచ్చు.' },
      ],
    },
  ],
};

export const TERMS: LegalDoc = {
  title: { en: 'Terms of Use', te: 'వినియోగ నిబంధనలు' },
  updated: UPDATED,
  intro: {
    en: `These terms are an agreement between you (the parent or guardian who creates the account) and ${OPERATOR}, who runs WonderLab. By creating an account you confirm that you are 18 or older and the parent or legal guardian of the children you add, and that you agree to these Terms and the Privacy Policy.`,
    te: `ఈ నిబంధనలు మీకు (ఖాతాను సృష్టించే తల్లిదండ్రులు లేదా సంరక్షకులు) మరియు WonderLab ను నడిపే ${OPERATOR} కు మధ్య ఒప్పందం. ఖాతాను సృష్టించడం ద్వారా మీరు 18 ఏళ్లు లేదా పైబడినవారని, మీరు చేర్చే పిల్లల తల్లిదండ్రులు లేదా చట్టబద్ధ సంరక్షకులని, మరియు ఈ నిబంధనలకు మరియు గోప్యతా విధానానికి అంగీకరిస్తున్నారని నిర్ధారిస్తున్నారు.`,
  },
  sections: [
    {
      id: 'service',
      title: { en: 'The service', te: 'సేవ' },
      blocks: [
        { en: 'WonderLab offers lessons, practice, games, art and notes for Nursery to Class 10. It is provided free of charge and is intended for families in India.', te: 'WonderLab నర్సరీ నుండి 10వ తరగతి వరకు పాఠాలు, అభ్యాసం, ఆటలు, చిత్రకళ మరియు నోట్స్ అందిస్తుంది. ఇది ఉచితంగా అందించబడుతుంది మరియు భారతదేశంలోని కుటుంబాల కోసం ఉద్దేశించబడింది.' },
        { en: 'WonderLab is provided "as is" and "as available". We work hard to keep it accurate and running, but we cannot promise it will always be available, error-free or suitable for every purpose. We may change, pause or stop features. To the extent the law allows, we are not responsible for indirect losses from using the service.', te: 'WonderLab "ఉన్నది ఉన్నట్లుగా" మరియు "అందుబాటులో ఉన్నట్లుగా" అందించబడుతుంది. దానిని ఖచ్చితంగా మరియు నడుస్తూ ఉంచడానికి మేము కష్టపడతాము, కానీ ఇది ఎల్లప్పుడూ అందుబాటులో ఉంటుందని, లోపాలు లేకుండా ఉంటుందని లేదా ప్రతి అవసరానికి సరిపోతుందని హామీ ఇవ్వలేము. మేము ఫీచర్లను మార్చవచ్చు, నిలిపివేయవచ్చు లేదా ఆపవచ్చు. చట్టం అనుమతించిన మేరకు, సేవను వాడటం వల్ల కలిగే పరోక్ష నష్టాలకు మేము బాధ్యులం కాము.' },
      ],
    },
    {
      id: 'content',
      title: { en: 'Educational content', te: 'విద్యా విషయం' },
      blocks: [
        { en: 'Lessons are written to follow the Telangana State (SCERT) syllabus, with CBSE (NCERT) lessons where a class has not yet been written for it. WonderLab is an independent learning aid. It is not affiliated with, made, approved or endorsed by SCERT Telangana, the Government of Telangana, NCERT, CBSE or any other government body, and it does not replace school, teachers or official textbooks.', te: 'పాఠాలు తెలంగాణ రాష్ట్ర (SCERT) సిలబస్‌ను అనుసరించేలా వ్రాయబడ్డాయి; ఏదైనా తరగతి దాని కోసం ఇంకా వ్రాయబడకపోతే CBSE (NCERT) పాఠాలు ఉంటాయి. WonderLab ఒక స్వతంత్ర అభ్యాస సహాయం. ఇది SCERT తెలంగాణ, తెలంగాణ ప్రభుత్వం, NCERT, CBSE లేదా మరే ప్రభుత్వ సంస్థతోనూ అనుబంధించబడలేదు, వాటిచే తయారు చేయబడలేదు, ఆమోదించబడలేదు లేదా సమర్థించబడలేదు, మరియు ఇది పాఠశాలను, ఉపాధ్యాయులను లేదా అధికారిక పాఠ్యపుస్తకాలను భర్తీ చేయదు.' },
        { en: 'The lessons, pictures, sounds and software belong to us or to their licensors (see Picture credits). You may use them for your family\'s own learning. Please do not copy, sell or republish them.', te: 'పాఠాలు, చిత్రాలు, శబ్దాలు మరియు సాఫ్ట్‌వేర్ మాకు లేదా వాటి లైసెన్సర్‌లకు చెందినవి (చిత్ర క్రెడిట్‌లు చూడండి). మీరు వాటిని మీ కుటుంబ సొంత అభ్యాసం కోసం వాడవచ్చు. దయచేసి వాటిని కాపీ చేయవద్దు, అమ్మవద్దు లేదా తిరిగి ప్రచురించవద్దు.' },
        { en: 'Notes and artwork that your children make belong to your family. We store them only to provide the service.', te: 'మీ పిల్లలు తయారు చేసే నోట్స్ మరియు చిత్రాలు మీ కుటుంబానికే చెందుతాయి. సేవను అందించడానికి మాత్రమే మేము వాటిని నిల్వ చేస్తాము.' },
      ],
    },
    {
      id: 'mistakes',
      title: { en: 'Reporting mistakes', te: 'తప్పులను నివేదించడం' },
      blocks: [
        { en: `If you find a mistake in a lesson, question, picture or translation, use "Report a problem" in the lesson or in Parent settings → Your data, or write to ${CONTACT}. Reports are private and reviewed by our team.`, te: `పాఠం, ప్రశ్న, చిత్రం లేదా అనువాదంలో తప్పు కనిపిస్తే, పాఠంలో లేదా తల్లిదండ్రుల సెట్టింగ్‌లు → మీ డేటాలో "సమస్యను నివేదించండి" వాడండి, లేదా ${CONTACT} కు వ్రాయండి. నివేదికలు ప్రైవేట్‌గా ఉంటాయి మరియు మా బృందం వాటిని పరిశీలిస్తుంది.` },
      ],
    },
    {
      id: 'use',
      title: { en: 'Your account and acceptable use', te: 'మీ ఖాతా మరియు ఆమోదయోగ్య వినియోగం' },
      blocks: [{ list: [
        { en: 'Keep your password and recovery codes private. You are responsible for what happens in your account and for supervising your children\'s use.', te: 'మీ పాస్‌వర్డ్ మరియు రికవరీ కోడ్‌లను గోప్యంగా ఉంచండి. మీ ఖాతాలో జరిగేదానికి మరియు మీ పిల్లల వినియోగాన్ని పర్యవేక్షించడానికి మీరే బాధ్యులు.' },
        { en: 'Use a nickname for each child — not a full name, phone number or email.', te: 'ప్రతి పిల్లలకు ముద్దుపేరు వాడండి — పూర్తి పేరు, ఫోన్ నంబర్ లేదా ఈమెయిల్ కాదు.' },
        { en: 'Do not try to access other families\' data, break or overload the service, get around its security, or use automated tools to copy it.', te: 'ఇతర కుటుంబాల డేటాను పొందడానికి, సేవను పాడు చేయడానికి లేదా అధిక భారం వేయడానికి, దాని భద్రతను దాటడానికి, లేదా దానిని కాపీ చేయడానికి ఆటోమేటెడ్ సాధనాలు వాడటానికి ప్రయత్నించవద్దు.' },
        { en: 'Do not put anything into notes, artwork titles or problem reports that is unlawful; harmful to children; obscene or sexual; hateful, abusive or harassing; someone else\'s personal information or copyrighted work; false or misleading; impersonating someone; a threat to India\'s unity, security or public order; or contains viruses or harmful code.', te: 'నోట్స్, చిత్రాల పేర్లు లేదా సమస్య నివేదికలలో ఇవేవీ పెట్టవద్దు: చట్టవిరుద్ధమైనవి; పిల్లలకు హానికరమైనవి; అశ్లీలమైన లేదా లైంగికమైనవి; ద్వేషపూరితమైన, దూషణాత్మకమైన లేదా వేధించేవి; ఇతరుల వ్యక్తిగత సమాచారం లేదా కాపీరైట్ ఉన్న రచనలు; తప్పుడు లేదా తప్పుదారి పట్టించేవి; ఇతరులుగా నటించేవి; భారతదేశ ఐక్యత, భద్రత లేదా ప్రజా క్రమానికి ముప్పు కలిగించేవి; లేదా వైరస్‌లు, హానికరమైన కోడ్ ఉన్నవి.' },
      ] }, { en: 'If an account is used to harm the service or other people, we may suspend it.', te: 'సేవకు లేదా ఇతరులకు హాని చేయడానికి ఖాతా వాడబడితే, మేము దానిని నిలిపివేయవచ్చు.' }],
    },
    {
      id: 'ending',
      title: { en: 'Ending your account', te: 'మీ ఖాతాను ముగించడం' },
      blocks: [
        { en: 'You can delete your account and all its data at any time in Parent settings → Your data → Delete account. This also withdraws your consent. See the Privacy Policy for details.', te: 'తల్లిదండ్రుల సెట్టింగ్‌లు → మీ డేటా → ఖాతాను తొలగించండి లో మీరు ఎప్పుడైనా మీ ఖాతాను మరియు దాని డేటా మొత్తాన్ని తొలగించవచ్చు. ఇది మీ అంగీకారాన్ని కూడా ఉపసంహరిస్తుంది. వివరాల కోసం గోప్యతా విధానం చూడండి.' },
      ],
    },
    {
      id: 'law',
      title: { en: 'Changes, law and disputes', te: 'మార్పులు, చట్టం మరియు వివాదాలు' },
      blocks: [
        { en: 'We may update these Terms. If a change matters, we will ask you to agree again in Parent settings.', te: 'మేము ఈ నిబంధనలను నవీకరించవచ్చు. మార్పు ముఖ్యమైనదైతే, తల్లిదండ్రుల సెట్టింగ్‌లలో మళ్లీ అంగీకరించమని అడుగుతాము.' },
        { en: 'These Terms are governed by the laws of India. Any dispute will be handled by the courts at [JURISDICTION CITY], India. Please contact us first — most problems can be solved quickly.', te: 'ఈ నిబంధనలు భారత చట్టాలకు లోబడి ఉంటాయి. ఏదైనా వివాదాన్ని భారతదేశంలోని [JURISDICTION CITY] న్యాయస్థానాలు పరిష్కరిస్తాయి. దయచేసి ముందుగా మమ్మల్ని సంప్రదించండి — చాలా సమస్యలు త్వరగా పరిష్కరించవచ్చు.' },
        { en: `Contact: ${OPERATOR}, ${CONTACT}. Grievance Officer: ${GRIEVANCE}.`, te: `సంప్రదింపు: ${OPERATOR}, ${CONTACT}. ఫిర్యాదుల అధికారి: ${GRIEVANCE}.` },
      ],
    },
  ],
};
