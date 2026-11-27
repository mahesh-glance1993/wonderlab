#!/usr/bin/env node
// Publishes the signed Android release APK for free direct download from the website (/get-app).
//
//   cd android && ./gradlew :app:assembleRelease     (signed with the release key)
//   node scripts/publish-apk.mjs [path/to/app-release.apk]
//   npx vite build && npx wrangler deploy --env production
//
// Copies the APK to public/download/wonderlab.apk and writes public/download/version.json
// ({ versionName, versionCode, size, sha256, signerSha256?, date, file }) which the get-the-app page shows.
// signerSha256 (the signing certificate's fingerprint) is read with the Android SDK's apksigner when available.
// Both files are git-ignored: the binary is never committed.
// Cloudflare Workers static assets allow at most 25 MiB per file, so a bigger APK fails loudly here
// instead of failing (or being silently skipped) at deploy time.
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MAX_BYTES = 25 * 1024 * 1024; // Cloudflare static asset limit per file (25 MiB)

const src = resolve(process.argv[2] || join(root, 'android/app/build/outputs/apk/release/app-release.apk'));
const gradleFile = join(root, 'android/app/build.gradle.kts');
const outDir = join(root, 'public/download');

function fail(msg) {
  console.error(`\npublish-apk: ERROR — ${msg}\n`);
  process.exit(1);
}

if (!existsSync(src)) fail(`APK not found at ${src}\nBuild it first: cd android && ./gradlew :app:assembleRelease`);
if (/unsigned/i.test(src)) fail('this is an unsigned APK; Android will refuse to install it. Configure the release signing key and rebuild.');

const gradle = readFileSync(gradleFile, 'utf8');
const versionCode = Number(/versionCode\s*=\s*(\d+)/.exec(gradle)?.[1]);
const versionName = /versionName\s*=\s*"([^"]+)"/.exec(gradle)?.[1];
if (!Number.isInteger(versionCode) || !versionName) fail(`could not read versionCode/versionName from ${gradleFile}`);

const size = statSync(src).size;
const mib = (size / 1024 / 1024).toFixed(2);
if (size > MAX_BYTES) {
  fail(`APK is ${mib} MiB — over Cloudflare's 25 MiB per-file limit for static assets.\n` +
    'Shrink it (R8/minify, resource shrinking, fewer bundled pictures/audio, or ABI splits) or host it elsewhere (e.g. a GitHub Release or R2) and link to it.');
}
const head = readFileSync(src).subarray(0, 2).toString('latin1');
if (head !== 'PK') fail(`${src} is not an APK (zip) file`);

/** SHA-256 of the signing certificate via the Android SDK's apksigner (optional: skipped with a warning if not found). */
function signerSha256() {
  const dirs = [process.env.ANDROID_HOME, process.env.ANDROID_SDK_ROOT];
  try { dirs.push(/^sdk\.dir=(.*)$/m.exec(readFileSync(join(root, 'android/local.properties'), 'utf8'))?.[1]?.replace(/\\\\/g, '\\').replace(/\\:/g, ':')); } catch { /* none */ }
  if (process.env.LOCALAPPDATA) dirs.push(join(process.env.LOCALAPPDATA, 'Android', 'Sdk'));
  if (process.env.HOME) dirs.push(join(process.env.HOME, 'Library/Android/sdk'), join(process.env.HOME, 'Android/Sdk'));
  for (const sdk of dirs.filter(Boolean)) {
    const bt = join(sdk, 'build-tools');
    if (!existsSync(bt)) continue;
    const versions = readdirSync(bt).sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
    for (const v of versions) {
      const tool = join(bt, v, process.platform === 'win32' ? 'apksigner.bat' : 'apksigner');
      if (!existsSync(tool)) continue;
      // apksigner.bat needs a shell on Windows; quote paths that may contain spaces
      const r = process.platform === 'win32'
        ? spawnSync(`"${tool}"`, ['verify', '--print-certs', `"${src}"`], { encoding: 'utf8', shell: true })
        : spawnSync(tool, ['verify', '--print-certs', src], { encoding: 'utf8' });
      if (r.status !== 0) fail(`apksigner could not verify the APK signature:\n${r.stderr || r.stdout}`);
      const m = /certificate SHA-256 digest:\s*([0-9a-f]{64})/i.exec(r.stdout);
      return m ? m[1].toLowerCase() : null;
    }
  }
  console.warn('publish-apk: warning — apksigner (Android SDK build-tools) not found; the signing certificate fingerprint is not published.');
  return null;
}

const sha256 = createHash('sha256').update(readFileSync(src)).digest('hex');
const signer = signerSha256();
mkdirSync(outDir, { recursive: true });
copyFileSync(src, join(outDir, 'wonderlab.apk'));
const info = { versionName, versionCode, size, sha256, ...(signer ? { signerSha256: signer } : {}), date: new Date().toISOString(), file: '/download/wonderlab.apk' };
writeFileSync(join(outDir, 'version.json'), JSON.stringify(info, null, 2) + '\n');

console.log(`publish-apk: WonderLab ${versionName} (${versionCode}), ${mib} MiB`);
console.log(`  sha256 ${sha256}`);
if (signer) console.log(`  signer certificate sha256 ${signer}`);
console.log(`  → public/download/wonderlab.apk + version.json (rebuild and deploy the site to publish)`);
