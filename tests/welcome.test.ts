import { describe, expect, it } from 'vitest';
import { detectPlatform, formatSize, groupHex, inviteText, isIosSafari, parseApkInfo, SITE_URL, whatsappUrl } from '../src/features/welcome/platform';

const UA = {
  iphoneSafari: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1',
  iphoneChrome: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/131.0 Mobile/15E148 Safari/604.1',
  ipadDesktop: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15',
  android: 'Mozilla/5.0 (Linux; Android 14; SM-A146B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36',
  windows: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36',
};

describe('get-the-app platform detection', () => {
  it('detects iOS, iPadOS (desktop mode), Android and desktop', () => {
    expect(detectPlatform(UA.iphoneSafari)).toBe('ios');
    expect(detectPlatform(UA.ipadDesktop, 5)).toBe('ios');
    expect(detectPlatform(UA.ipadDesktop, 0)).toBe('desktop'); // a real Mac
    expect(detectPlatform(UA.android)).toBe('android');
    expect(detectPlatform(UA.windows)).toBe('desktop');
  });
  it('tells Safari from other iOS browsers', () => {
    expect(isIosSafari(UA.iphoneSafari)).toBe(true);
    expect(isIosSafari(UA.iphoneChrome)).toBe(false);
  });
});

describe('WhatsApp invite', () => {
  it('is bilingual, puts the chosen language first and has no tracking parameters', () => {
    const te = inviteText('te');
    expect(te.indexOf('నర్సరీ')).toBeLessThan(te.indexOf('free learning app'));
    expect(inviteText('en').indexOf('free learning app')).toBeLessThan(inviteText('en').indexOf('నర్సరీ'));
    expect(te.endsWith(`${SITE_URL}/`)).toBe(true);
    const url = whatsappUrl('en');
    expect(url.startsWith('https://wa.me/?text=')).toBe(true);
    expect(decodeURIComponent(url.slice('https://wa.me/?text='.length))).toBe(inviteText('en'));
    expect(url).not.toMatch(/utm_|ref=/);
  });
});

describe('APK version.json', () => {
  const good = { versionName: '3.0.0', versionCode: 10, size: 20_000_000, sha256: 'a'.repeat(64), date: '2026-11-27T00:00:00.000Z', file: '/download/wonderlab.apk' };
  it('accepts what publish-apk writes', () => {
    expect(parseApkInfo(good)).toEqual(good);
    expect(parseApkInfo({ ...good, signerSha256: 'b'.repeat(64) })?.signerSha256).toBe('b'.repeat(64));
    expect(parseApkInfo({ ...good, signerSha256: 'nope' })).toEqual(good);
  });
  it('rejects missing or odd data (e.g. the SPA fallback when no APK is published)', () => {
    expect(parseApkInfo(null)).toBeNull();
    expect(parseApkInfo('<!doctype html>')).toBeNull();
    expect(parseApkInfo({ ...good, sha256: 'xyz' })).toBeNull();
    expect(parseApkInfo({ ...good, size: 0 })).toBeNull();
    expect(parseApkInfo({ ...good, file: 'https://evil.example/x.apk' })?.file).toBe('/download/wonderlab.apk');
  });
  it('formats size and fingerprint for people', () => {
    expect(formatSize(23_456_789)).toBe('22.4 MB');
    expect(formatSize(2048)).toBe('2 KB');
    expect(groupHex('abcdef0123')).toBe('abcd ef01 23');
  });
});
