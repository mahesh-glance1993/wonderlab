// Pure helpers for the public landing and get-the-app pages (no React; unit-tested in tests/welcome.test.ts).

/** Public site address used in share messages (the production origin, so shared links always work). */
export const SITE_URL = 'https://learn.maheshglance.com';

export type Platform = 'ios' | 'android' | 'desktop';

/** iOS / iPadOS (iPadOS 13+ reports itself as a Mac, so touch support tells them apart) / Android / everything else. */
export function detectPlatform(ua: string, maxTouchPoints = 0): Platform {
  if (/iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && maxTouchPoints > 1)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'desktop';
}

/** On iOS, "Add to Home Screen" is most reliable from Safari; other iOS browsers and in-app browsers add their own token. */
export function isIosSafari(ua: string): boolean {
  return /Safari\//.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|GSA\/|Instagram|FBAN|FBAV|WhatsApp|Line\//.test(ua);
}

/** Short bilingual invite, the visitor's language first. No referral codes or tracking parameters. */
export function inviteText(lang: 'en' | 'te'): string {
  const en = 'WonderLab — a free learning app for Nursery to Class 10 (Telangana syllabus), in English and Telugu. Works offline.';
  const te = 'WonderLab — నర్సరీ నుండి 10వ తరగతి వరకు ఉచిత లెర్నింగ్ యాప్ (తెలంగాణ సిలబస్), ఇంగ్లీష్ మరియు తెలుగులో.';
  return `${lang === 'te' ? `${te}\n${en}` : `${en}\n${te}`}\n${SITE_URL}/`;
}

export function whatsappUrl(lang: 'en' | 'te'): string {
  return `https://wa.me/?text=${encodeURIComponent(inviteText(lang))}`;
}

/** Shape of public/download/version.json, written by scripts/publish-apk.mjs. */
export interface ApkInfo { versionName: string; versionCode: number; size: number; sha256: string; signerSha256?: string; date: string; file: string }

/** Validates version.json. Returns null for anything unexpected (e.g. the SPA fallback page when no APK is published). */
export function parseApkInfo(v: unknown): ApkInfo | null {
  if (!v || typeof v !== 'object') return null;
  const o = v as Record<string, unknown>;
  if (typeof o.versionName !== 'string' || typeof o.versionCode !== 'number' || typeof o.size !== 'number' || o.size <= 0) return null;
  if (typeof o.sha256 !== 'string' || !/^[0-9a-f]{64}$/.test(o.sha256) || typeof o.date !== 'string') return null;
  const file = typeof o.file === 'string' && /^\/download\/[\w.-]+\.apk$/.test(o.file) ? o.file : '/download/wonderlab.apk';
  const info: ApkInfo = { versionName: o.versionName, versionCode: o.versionCode, size: o.size, sha256: o.sha256, date: o.date, file };
  if (typeof o.signerSha256 === 'string' && /^[0-9a-f]{64}$/.test(o.signerSha256)) info.signerSha256 = o.signerSha256;
  return info;
}

/** 23_456_789 → "22.4 MB" (binary megabytes, as Android's Files app shows them). */
export function formatSize(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** sha256 hex in groups of 4 so it can be compared by eye. */
export const groupHex = (hex: string) => hex.match(/.{1,4}/g)?.join(' ') ?? hex;
