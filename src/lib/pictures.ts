// Realistic pictures (same as the native apps — android/.../core/design/Emoji.kt):
// every emoji on the page is shown as a picture instead of the system emoji glyph:
//   - Class 1–10 learners (classLevel >= 3): a real photograph (public/pictures/photos/<key>.webp, Wikimedia Commons —
//     see the Picture credits page) when one exists, otherwise the 3D picture;
//   - Nursery / LKG / UKG and before a learner is chosen: Microsoft Fluent Emoji 3D (public/pictures/emoji/<cps>.webp, MIT).
// The images are copied from the app's resources at build time (scripts/copy-pictures.mjs).
//
// The renderer works on the live DOM (one MutationObserver on #root), so it covers every screen — lesson text,
// choices, tiles, games — without changing their components. It never removes a node React owns: a text node with
// emoji keeps its place (its text is shortened to the part before the first emoji) and our own nodes (<img> + text)
// are inserted right after it. When React later changes or removes that text node, our nodes are removed and the
// text is processed again. Inputs, textareas, contenteditable, <svg>, <option> etc. are left alone.

export type PictureStyle = 'emoji3d' | 'photo';

/** classLevel: 0 Nursery, 1 LKG, 2 UKG, 3 = Class 1 … 12 = Class 10; null = no learner chosen yet. */
export const pictureStyleFor = (classLevel: number | null | undefined): PictureStyle => (classLevel != null && classLevel >= 3 ? 'photo' : 'emoji3d');

const BASE = '/pictures';
const strip = (e: string) => e.replace(/️/g, '');

let emojiIdx: Map<string, string> | null = null;
let photoIdx: Map<string, string> | null = null;
let loading: Promise<void> | null = null;

async function loadIndex(path: string): Promise<Map<string, string>> {
  try {
    const r = await fetch(path);
    if (!r.ok) return new Map();
    const o = (await r.json()) as Record<string, string>;
    const m = new Map<string, string>();
    for (const [k, v] of Object.entries(o)) { if (typeof v !== 'string') continue; m.set(k, v); m.set(strip(k), v); }
    return m;
  } catch { return new Map(); }
}

/** Loads both picture indexes once (small JSON files). */
export function loadPictureIndex(): Promise<void> {
  if (!loading) loading = Promise.all([loadIndex(`${BASE}/emoji/index.json`), loadIndex(`${BASE}/photos/index.json`)]).then(([e, p]) => { emojiIdx = e; photoIdx = p; });
  return loading;
}

const lookup = (idx: Map<string, string> | null, e: string) => idx?.get(e) ?? idx?.get(strip(e)) ?? null;

/** The picture for one emoji in a style, or null when there is none (the emoji then stays as text). */
export function pictureFor(emoji: string, style: PictureStyle): { src: string; photo: boolean } | null {
  const photo = style === 'photo' ? lookup(photoIdx, emoji) : null;
  if (photo) return { src: `${BASE}/photos/${photo}.webp`, photo: true };
  const file = lookup(emojiIdx, emoji);
  return file ? { src: `${BASE}/emoji/${file}.webp`, photo: false } : null;
}

// ------------------------------------------------------------------ emoji scanner (same rules as the apps)

const isRegional = (cp: number) => cp >= 0x1f1e6 && cp <= 0x1f1ff;
const isSkin = (cp: number) => cp >= 0x1f3fb && cp <= 0x1f3ff;
const isBase = (cp: number) => (cp >= 0x1f000 && cp <= 0x1faff) || (cp >= 0x2600 && cp <= 0x27bf) || (cp >= 0x2b00 && cp <= 0x2bff) || (cp >= 0x2300 && cp <= 0x23ff)
  || (cp >= 0x2190 && cp <= 0x21ff) || cp === 0x3030 || cp === 0x303d || cp === 0x3297 || cp === 0x3299 || cp === 0xa9 || cp === 0xae
  || cp === 0x203c || cp === 0x2049 || cp === 0x2122 || cp === 0x2139 || cp === 0x24c2 || (cp >= 0x25aa && cp <= 0x25fe) || cp === 0x2934 || cp === 0x2935;
const isJoinable = (cp: number) => (cp >= 0x1f000 && cp <= 0x1faff) || (cp >= 0x2600 && cp <= 0x27bf) || (cp >= 0x2b00 && cp <= 0x2bff);
const cpLen = (cp: number) => (cp >= 0x10000 ? 2 : 1);

/** Length (UTF-16 units) of the emoji starting at i, or 0. */
function emojiAt(s: string, i: number): number {
  const cp = s.codePointAt(i)!;
  if (isRegional(cp)) { const j = i + 2; return j < s.length && isRegional(s.codePointAt(j)!) ? 4 : 0; }
  if (cp === 0x23 || cp === 0x2a || (cp >= 0x30 && cp <= 0x39)) {
    let j = i + 1;
    if (j < s.length && s.charCodeAt(j) === 0xfe0f) j++;
    return j < s.length && s.charCodeAt(j) === 0x20e3 ? j + 1 - i : 0;
  }
  if (!isBase(cp)) return 0;
  let j = i + cpLen(cp);
  const modifier = () => { if (j < s.length) { const m = s.codePointAt(j)!; if (m === 0xfe0f || isSkin(m)) j += cpLen(m); } };
  modifier();
  while (j + 1 < s.length && s.charCodeAt(j) === 0x200d) {
    const n = s.codePointAt(j + 1)!;
    if (!isJoinable(n)) break;
    j += 1 + cpLen(n);
    modifier();
  }
  return j - i;
}

/** Splits text into plain and emoji runs. */
export function splitEmoji(text: string): { emoji: boolean; text: string }[] {
  const out: { emoji: boolean; text: string }[] = [];
  let i = 0, start = 0;
  while (i < text.length) {
    const n = emojiAt(text, i);
    if (n > 0) {
      if (i > start) out.push({ emoji: false, text: text.slice(start, i) });
      out.push({ emoji: true, text: text.slice(i, i + n) });
      i += n; start = i;
    } else i += cpLen(text.codePointAt(i)!);
  }
  if (start < text.length) out.push({ emoji: false, text: text.slice(start) });
  return out;
}

// quick pre-filter: most text nodes have no emoji-range character at all
// eslint-disable-next-line no-misleading-character-class
const MAYBE = /[©®‼⁉™ℹ←-⇿⌀-⏿Ⓜ▪-◾☀-➿⤴⤵⬀-⯿〰〽㊗㊙⃣]|\ud83c[\udc00-\udfff]|\ud83d[\udc00-\udfff]|\ud83e[\udc00-\udeff]/;

// ------------------------------------------------------------------ DOM renderer

const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT', 'SELECT', 'OPTION', 'OPTGROUP', 'TITLE', 'CODE', 'PRE', 'CANVAS', 'IFRAME']);
const SVG_NS = 'http://www.w3.org/2000/svg';

let style: PictureStyle = 'emoji3d';
let root: HTMLElement | null = null;
let observer: MutationObserver | null = null;
/** React-owned text node → the nodes we inserted after it (and the text it really holds). */
const owned = new WeakMap<Text, { nodes: Node[]; full: string }>();
const tracked = new Set<Text>();
const ours = new WeakSet<Node>();

function skipped(el: Element | null): boolean {
  for (let e = el; e && e !== root; e = e.parentElement) {
    if (SKIP_TAGS.has(e.tagName) || e.namespaceURI === SVG_NS) return true;
    if ((e as HTMLElement).isContentEditable || e.hasAttribute('data-no-pictures')) return true;
  }
  return false;
}

function makeImg(emoji: string, pic: { src: string; photo: boolean }): HTMLImageElement {
  const img = document.createElement('img');
  img.className = pic.photo ? 'wl-pic photo' : 'wl-pic';
  img.alt = emoji;
  img.src = pic.src;
  img.loading = 'lazy';
  img.decoding = 'async';
  img.draggable = false;
  img.dataset.emoji = emoji;
  img.addEventListener('error', () => {
    // missing file: show the emoji as text instead
    if (!img.parentNode) return;
    const t = document.createTextNode(emoji);
    ours.add(t);
    img.replaceWith(t);
    for (const [, v] of trackedEntries()) { const k = v.nodes.indexOf(img); if (k >= 0) v.nodes[k] = t; }
  }, { once: true });
  ours.add(img);
  return img;
}
function* trackedEntries(): Generator<[Text, { nodes: Node[]; full: string }]> {
  for (const t of tracked) { const v = owned.get(t); if (v) yield [t, v]; }
}

/** Removes what we inserted after a React text node (and gives it back its full text when asked). */
function release(t: Text, restore: boolean) {
  const v = owned.get(t);
  if (!v) return;
  for (const n of v.nodes) n.parentNode?.removeChild(n);
  owned.delete(t); tracked.delete(t);
  if (restore && t.data !== v.full) t.data = v.full;
}

function processText(t: Text) {
  if (ours.has(t) || owned.has(t)) return;
  const s = t.data;
  if (!s || !MAYBE.test(s)) return;
  const parent = t.parentNode;
  if (!parent || skipped(t.parentElement)) return;
  const parts = splitEmoji(s);
  if (!parts.some((p) => p.emoji && pictureFor(p.text, style))) return;
  // the React node keeps the text before the first picture; everything after goes into our own nodes
  let first = 0;
  while (first < parts.length && !(parts[first].emoji && pictureFor(parts[first].text, style))) first++;
  const head = parts.slice(0, first).map((p) => p.text).join('');
  const nodes: Node[] = [];
  let buf = '';
  const flush = () => { if (buf) { const n = document.createTextNode(buf); ours.add(n); nodes.push(n); buf = ''; } };
  for (const p of parts.slice(first)) {
    const pic = p.emoji ? pictureFor(p.text, style) : null;
    if (pic) { flush(); nodes.push(makeImg(p.text, pic)); } else buf += p.text;
  }
  flush();
  const next = t.nextSibling;
  for (const n of nodes) parent.insertBefore(n, next);
  t.data = head;
  owned.set(t, { nodes, full: s });
  tracked.add(t);
}

function scan(node: Node) {
  if (node.nodeType === Node.TEXT_NODE) { processText(node as Text); return; }
  if (node.nodeType !== Node.ELEMENT_NODE || ours.has(node)) return;
  const el = node as Element;
  if (skipped(el)) return;
  const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const list: Text[] = [];
  for (let n = w.nextNode(); n; n = w.nextNode()) if (!ours.has(n) && MAYBE.test((n as Text).data)) list.push(n as Text);
  for (const t of list) processText(t);
}

function onMutations(records: MutationRecord[]) {
  const again = new Set<Node>();
  let sweep = false;
  for (const r of records) {
    if (r.type === 'characterData') {
      const t = r.target as Text;
      if (ours.has(t)) continue;
      if (owned.has(t)) release(t, false); // React wrote new text: drop our old pictures
      again.add(t);
    } else {
      r.removedNodes.forEach((n) => {
        if (n.nodeType === Node.TEXT_NODE && owned.has(n as Text)) release(n as Text, true);
        else if (n.nodeType === Node.ELEMENT_NODE) sweep = true;
      });
      r.addedNodes.forEach((n) => { if (!ours.has(n)) again.add(n); });
    }
  }
  // a removed subtree took its text nodes (and our pictures) with it: forget them
  if (sweep) for (const t of [...tracked]) if (!t.isConnected) { owned.delete(t); tracked.delete(t); }
  for (const n of again) if (n.isConnected) scan(n);
  observer?.takeRecords(); // our own changes
}

/** Starts the renderer on the app root (idempotent). */
export function installPictures(el: HTMLElement) {
  if (observer || typeof MutationObserver === 'undefined') return;
  root = el;
  observer = new MutationObserver(onMutations);
  void loadPictureIndex().then(() => {
    if (!root || !observer) return;
    observer.observe(root, { childList: true, subtree: true, characterData: true });
    scan(root);
    observer.takeRecords();
  });
}

/** Switches between 3D pictures and photos (when the learner changes); re-renders pictures already shown. */
export function setPictureStyle(next: PictureStyle) {
  if (next === style) return;
  style = next;
  if (!root || !emojiIdx) return;
  for (const t of [...tracked]) { release(t, true); }
  observer?.takeRecords();
  scan(root);
  observer?.takeRecords();
}
