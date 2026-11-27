# Brand accounts: Gmail, YouTube, Instagram, X

How to set up WonderLab's own accounts, for free, in about two hours. These are accounts for the **brand, run by an adult** (you). Children never use, log in to or appear on these accounts.

Telugu: **needs native-speaker check.**

## The plan in one picture

```
ONE new Gmail  (the base for everything)
  ├── YouTube  (Brand Account channel "WonderLab")
  ├── Instagram  (Professional > Creator account)
  ├── X  (signed up with the same Gmail)
  ├── Website contact: hello@maheshglance.com  → forwards to the Gmail (Cloudflare Email Routing)
  └── Later: Google Play Console ($25) and Apple Developer ($99/yr) sign-ups
```

Keep a password manager (Bitwarden's free plan works) with one entry per account. Use a different, long password for each.

---

## Step 0: Choose a handle (check availability first)

Pick one name that is free on **all four** platforms before you create anything. Check in this order: X (strictest), Instagram, YouTube, Gmail.

Rules that limit the choice:
- **X:** 4–15 characters, letters, numbers and underscore only (no dots).
- **Instagram:** up to 30 characters, letters, numbers, dots and underscores.
- **YouTube handle:** 3–30 characters, letters, numbers, dots, hyphens, underscores.
- **Gmail:** 6–30 characters, letters, numbers and dots (dots are ignored by Gmail).

Six ideas (availability **not checked**; check each one yourself):

| # | Handle | X | Instagram | YouTube | Gmail | Note |
|---|---|---|---|---|---|---|
| 1 | `wonderlab_ts` | ✔ (12) | ✔ | @wonderlab_ts | wonderlab.ts@gmail.com | Short; "ts" = Telangana State |
| 2 | `wonderlabtg` | ✔ (11) | ✔ | @wonderlabtg | wonderlabtg@gmail.com | "TG" is the newer Telangana abbreviation |
| 3 | `wonderlab_tel` | ✔ (13) | ✔ | @wonderlab_tel | wonderlab.tel@gmail.com | |
| 4 | `wonderlabtelugu` | ✔ (15, the maximum) | ✔ | @wonderlabtelugu | wonderlabtelugu@gmail.com | Says the language clearly |
| 5 | `learnwonderlab` | ✔ (14) | ✔ | @learnwonderlab | learnwonderlab@gmail.com | Matches the website "learn." |
| 6 | `wonderlab_learn` | ✔ (15) | ✔ | @wonderlab_learn | wonderlab.learn@gmail.com | |

`wonderlab.ts` works on Instagram and YouTube but not X (no dots), so use `wonderlab_ts` everywhere instead. `wonderlabtelangana` is 18 characters: too long for X.

Display name everywhere: **WonderLab** (or "WonderLab · Learn" if plain "WonderLab" looks crowded in search).

---

## Step 1: The base Gmail

1. In a private/incognito window, go to accounts.google.com > **Create account** > **For my personal use**. (Use "For work or my business" only if Google offers it without asking you to start a paid Workspace trial.)
2. First name: `WonderLab`. Last name: leave blank or `Learn`.
3. Birthday: **your own** real date of birth (it must be an adult's account).
4. Username: your chosen handle, for example `wonderlab.ts`.
5. Use a long, unique password and save it in your password manager.
6. Add **your** phone number for recovery, and a recovery email (your personal Gmail).
7. **Turn on 2-Step Verification:** myaccount.google.com > Security > 2-Step Verification > turn on. Add (a) Google Authenticator or another authenticator app, and (b) a **passkey** on your phone.
8. **Backup codes:** same page > Backup codes > Get backup codes. **Print them** (or write them on paper). Store the paper at home, away from the phone. Do not save them in the same Gmail or in a photo on the same phone.
9. Profile picture: upload `public/icon-512.png` from the repo.
10. Do a Security Checkup (myaccount.google.com > Security > Security Checkup) and fix every warning.

### Website contact address: hello@maheshglance.com

Use Cloudflare Email Routing (free) so `hello@maheshglance.com` lands in the new Gmail. The website domain is already on Cloudflare.

1. **First check existing email records:** Cloudflare dashboard > maheshglance.com > DNS. If there are existing **MX** records on the root domain for another mailbox, stop and decide whether to keep that mailbox; Email Routing replaces root MX records. (The app's sending service, Resend, normally uses its own subdomain records; leave those as they are.)
2. Cloudflare dashboard > maheshglance.com > **Email** > **Email Routing** > Get started / Enable.
3. **Destination addresses** > add the new Gmail > open the verification email in Gmail and click the link.
4. **Routing rules** > Custom address `hello` > Action: Send to an email > the Gmail > Save. Let Cloudflare add the MX and SPF records it asks for.
5. Send a test from your personal phone to `hello@maheshglance.com`. It should arrive in the WonderLab Gmail.
6. In Gmail, create a filter: To `hello@maheshglance.com` > Apply label "Website".
7. Put `hello@maheshglance.com` on the `/support` and `/schools` pages and in every bio.

Replying: Email Routing only receives. Replies go out from the Gmail address, which is fine. If you later want replies to show `hello@maheshglance.com`, add it in Gmail > Settings > Accounts > "Send mail as" using an SMTP service (for example Resend's free tier, which the app already uses for its own emails).

---

## Step 2: YouTube (Brand Account channel)

A Brand Account lets you add a helper later without sharing your password.

1. Sign in to youtube.com with the WonderLab Gmail.
2. Go to youtube.com/account > **Add or manage your channel(s)** > **Create a channel**. Choose a **custom name**: `WonderLab`. This creates a Brand Account.
3. Set the **handle** (Settings > Advanced settings, or YouTube Studio > Customisation > Basic info > Handle) to your chosen handle.
4. **Verify the channel** with a phone number: youtube.com/verify. This unlocks custom thumbnails and longer videos.
5. YouTube Studio > Settings > **Channel > Advanced settings > Audience**: choose **"No, set this channel as not made for kids"** for the channel, then set **each video** separately (see the rules below). The channel default is the setting you choose most often; most WonderLab videos speak to parents and older students.
6. Studio > Settings > Upload defaults: description footer with the link, category **Education**, language Telugu.
7. Studio > Customisation > Branding: profile picture `public/icon-512.png`; banner image (2560 × 1440, keep text in the centre 1546 × 423).
8. Studio > Settings > Community: put comments in "Hold potentially inappropriate comments for review". Add blocked words.
9. Brand Account security is the Gmail's security. Later, add a helper under Settings > Permissions as **Editor**, never Owner.

**Channel description** (max 1000 characters; this is about 825):

> WonderLab is a free learning app and website for children from Nursery to Class 10. It follows the Telangana SCERT syllabus for Classes 1–10, in English and Telugu.
>
> On this channel: short "What if?" videos where you move a value and see what changes (lens formula, Ohm's law, quadratic roots and more), quick Class 6–8 science and social ideas, Telugu letters and rhymes for little ones, and tips for parents.
>
> Free · Works offline · No ads in the app
> Try it: https://learn.maheshglance.com
> Schools: free one-class pilot: https://learn.maheshglance.com/schools
> Contact: hello@maheshglance.com
>
> WonderLab follows the SCERT chapter lists with its own explanations. It is not an official SCERT product.
>
> WonderLab నర్సరీ నుంచి 10వ తరగతి వరకు పిల్లల కోసం ఉచిత లెర్నింగ్ యాప్. తెలంగాణ SCERT సిలబస్ ప్రకారం, ఇంగ్లీష్‌లో, తెలుగులో.

**Banner text** (centre of the banner):
- Line 1: `WonderLab`
- Line 2: `Nursery to Class 10 · Telangana syllabus · English & తెలుగు`
- Line 3 (small): `Free · learn.maheshglance.com`

**Three playlists:**
1. **Class 10 "What if?" · SSC revision** (పదో తరగతి "What if?") — videos 1–4 in `video-scripts.md`. Not made for kids.
2. **Class 6–8 Science & Social in 40 seconds** (6–8 తరగతుల సైన్స్, సోషల్) — videos 5–8. Not made for kids.
3. **Rhymes & Telugu for little ones** (చిన్నారులకు పాటలు, తెలుగు) — videos 10–11 and future rhymes. Set videos aimed at children as Made for kids.

**First 3 posts (Shorts):** video 1 (convex lens), video 11 (Chandamama rhyme, Made for kids), video 12 (notes).

---

## Step 3: Instagram (Professional > Creator account)

1. Install Instagram on your phone. Sign up with **email** and use the WonderLab Gmail (not your phone number).
2. Username: your chosen handle. Name: `WonderLab · Learn` (the Name field is searchable, so include a keyword).
3. Profile photo: `public/icon-512.png`.
4. Profile > Menu > **Account type and tools** > **Switch to professional account** > **Creator** > category **Education** (or "Educational Website"). Choose not to show the category if it looks odd. Creator is enough; switch to Business later only if you need a contact button tied to the email.
5. Add the website link: Edit profile > Links > `https://learn.maheshglance.com`.
6. **Two-factor authentication:** Accounts Center > Password and security > Two-factor authentication > choose **Authentication app**. Save the **backup codes** on paper with the Gmail ones.
7. Settings > Hidden words: turn on hiding offensive comments and message requests. Settings > Messages: restrict message requests from people you don't follow.
8. Do **not** follow, comment on or message children's accounts. Follow schools, education pages, Telangana parenting pages and other creators.

**Bio** (max 150 characters), English (133):
```
Free learning app, Nursery–Class 10 📚
Follows Telangana SCERT syllabus · English & తెలుగు
"What if?" sliders · Works offline · No ads
```
Telugu alternative:
```
నర్సరీ–10వ తరగతి ఉచిత లెర్నింగ్ యాప్ 📚
తెలంగాణ SCERT సిలబస్ ప్రకారం · తెలుగు & English
ఆఫ్‌లైన్‌లో పనిచేస్తుంది · యాడ్స్ లేవు
```

**Highlights** (story covers using app colours): "Class 10", "Little ones", "How to install", "Schools".

**First 3 posts:**
1. Carousel (5 images): app icon; a lesson screen; a "what if?" explorer; practice with a hint; Nursery rhymes. Caption: week 1 Monday in `social-calendar.md`.
2. Reel: video 1 (convex lens).
3. Reel: video 10 (Class 1 Telugu: clap the word parts).

---

## Step 4: X (Twitter)

1. x.com > **Create account** > use the WonderLab Gmail (choose "Use email instead" if asked for a phone). Date of birth: your own.
2. Set the username to your chosen handle (Settings > Your account > Account information > Username). Name: `WonderLab`.
3. Profile photo `public/icon-512.png`; header: the YouTube banner image resized to 1500 × 500.
4. Website field: `learn.maheshglance.com`. Location: `Telangana, India`.
5. **Two-factor authentication:** Settings > Security and account access > Security > Two-factor authentication > **Authentication app** (SMS 2FA on X needs a paid plan; the authenticator app is free). Save the **backup code** on paper.
6. Settings > Privacy and safety > Direct messages: allow messages only from people you follow.

**Bio** (max 160 characters), English (137):
```
Free learning app for Nursery–Class 10. Follows the Telangana SCERT syllabus. English & తెలుగు. "What if?" sliders, notes, works offline.
```
Telugu alternative:
```
నర్సరీ–10వ తరగతి ఉచిత లెర్నింగ్ యాప్. తెలంగాణ SCERT సిలబస్ ప్రకారం. తెలుగు & English. ఆఫ్‌లైన్‌లో పనిచేస్తుంది.
```

**First 3 posts:**
1. `Hello! WonderLab is a free learning app for Nursery to Class 10, following the Telangana SCERT syllabus, in English and Telugu. No ads. Works offline. learn.maheshglance.com` + 4 screenshots. Pin this post.
2. `Class 10: move the object in front of a convex lens and watch the image jump. Try the "What if?" explorer free 👉 learn.maheshglance.com` + video 1.
3. `Teachers and school principals in Telangana: we offer a free one-class pilot. Details: learn.maheshglance.com/schools`

---

## Step 5: Store your recovery kit (offline)

Make one paper sheet and keep it in a safe place at home (and a photocopy with someone you trust):

- Gmail address and the place the password is kept (not the password itself, unless the paper is truly safe)
- Google backup codes
- Instagram backup codes
- X backup code
- The recovery phone number used for each account
- Date the codes were created; re-print new codes when you use the last few

Never keep these codes only inside the Gmail they protect. Check every 3 months that you can still sign in to all four accounts.

---

## Important rules

**These are adult accounts.** You (an adult) own and run them. Children do not get the passwords and do not post.

**Children's faces, names and voices.** Never post a child's face, full name, school name with name, voice or any identifying detail without **written permission from the parent or guardian**. Even with permission, prefer screen recordings, hands only, or the back of the head. Keep the signed permission (a simple dated form: what will be posted, where, and that they can ask you to remove it at any time). Remove a post immediately if a parent asks. Do not show pilot classrooms where children can be recognised.

**YouTube "Made for kids" (COPPA).** YouTube requires you to say, for every video, whether it is made for kids. This is required by law (the US COPPA rule) and by YouTube's terms, and it applies to you even in India.
- **Made for kids:** the video is aimed at children (rhymes, Nursery–Class 3 songs and letters spoken to the child). YouTube then turns off comments, personalised ads, the notification bell and some other features for that video. That is expected.
- **Not made for kids:** the video speaks to parents, teachers or older students (Class 10 revision, how-to-install, school pilot). Comments stay on; moderate them.
- When in doubt about a children's-style video, choose **Made for kids**. Never mark a child-directed video "not made for kids" to keep comments.

**Follow each platform's terms.** Minimum age, honest information, no impersonation, no misleading claims. Use only music from the YouTube Audio Library or Instagram's own music library, or none.

**No shortcuts.** Do not buy followers, likes, views or reviews; do not join "follow for follow" or engagement groups; do not post the same link repeatedly in groups. Platforms penalise this and it damages trust with parents and schools.

**Claims.** Say "follows the Telangana SCERT syllabus". Never say "official", "SCERT approved", "teacher-approved", "AI tutor" or promise marks.

**Security incidents.** If an account is hacked: use the platform's recovery page from a trusted device, change the Gmail password first, sign out all sessions, re-generate backup codes, and post on the other accounts that the hacked account is not you until it is recovered.

---

> Reminder: a human should review this before sending or publishing.
