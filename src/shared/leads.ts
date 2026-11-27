// School / tuition-centre enquiry ("lead") validation, shared by the /schools form and the
// POST /api/leads endpoint. Leads hold ADULT staff contact details only — never child data.

export const LEAD_KINDS = ['school', 'tuition', 'other'] as const;
export type LeadKind = (typeof LEAD_KINDS)[number];
export const LEAD_STATUSES = ['new', 'contacted', 'pilot', 'closed'] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];
/** Classes a school can ask about: pre-primary plus Classes 1–10. */
export const LEAD_CLASSES = ['pre', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'] as const;
export type LeadClass = (typeof LEAD_CLASSES)[number];

export const LEAD_LIMITS = {
  contactName: [2, 80],
  role: [2, 60],
  orgName: [2, 120],
  town: [2, 80],
  email: [0, 120],
  message: [0, 1000],
  students: [1, 100_000],
} as const;
/** Leads older than this may be deleted (see docs/OPERATIONS.md, "School enquiries"). */
export const LEAD_RETENTION_DAYS = 730;
/** Name of the hidden honeypot input. Real people never see or fill it. */
export const LEAD_HONEYPOT = 'website';

export interface LeadInput {
  kind: LeadKind;
  contactName: string;
  role: string;
  orgName: string;
  town: string;
  email: string | null;
  phone: string | null;
  students: number | null;
  classes: LeadClass[];
  message: string;
}
export type LeadField = 'kind' | 'contactName' | 'role' | 'orgName' | 'town' | 'email' | 'phone' | 'contact' | 'students' | 'classes' | 'message' | 'confirmStaff';
export type LeadErrors = Partial<Record<LeadField, string>>;
export type LeadResult = { ok: true; lead: LeadInput } | { ok: false; errors: LeadErrors };

const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;
// eslint-disable-next-line no-control-regex
const CONTROL_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/** Trims, removes control characters and (for single-line fields) collapses whitespace. */
export function cleanText(v: unknown, multiline = false): string {
  if (typeof v !== 'string') return '';
  const s = v.replace(CONTROL_RE, '');
  return (multiline ? s.replace(/\r\n?/g, '\n').replace(/\n{3,}/g, '\n\n') : s.replace(/\s+/g, ' ')).trim();
}

/**
 * Indian or international phone number: digits with optional +, spaces, dashes, dots or brackets.
 * Returns the normalised form (leading + kept, separators removed) or null when invalid.
 */
export function normalisePhone(v: string): string | null {
  if (!/^\+?[\d\s\-().]+$/.test(v)) return null;
  const plus = v.startsWith('+');
  const digits = v.replace(/\D/g, '');
  if (plus ? digits.length < 8 || digits.length > 15 : digits.length < 10 || digits.length > 13) return null;
  return (plus ? '+' : '') + digits;
}

export const isEmail = (v: string) => v.length <= LEAD_LIMITS.email[1] && EMAIL_RE.test(v);

const MSG: Record<LeadField, string> = {
  kind: 'Choose school, tuition centre or other.',
  contactName: `Enter your name (${LEAD_LIMITS.contactName[0]}–${LEAD_LIMITS.contactName[1]} characters).`,
  role: `Enter your role (${LEAD_LIMITS.role[0]}–${LEAD_LIMITS.role[1]} characters).`,
  orgName: `Enter the school or centre name (${LEAD_LIMITS.orgName[0]}–${LEAD_LIMITS.orgName[1]} characters).`,
  town: `Enter the town or district (${LEAD_LIMITS.town[0]}–${LEAD_LIMITS.town[1]} characters).`,
  email: 'Enter a valid email address.',
  phone: 'Enter a valid phone number (10 digits, or + and country code).',
  contact: 'Give a phone number or an email address so we can reply.',
  students: `Enter a number between ${LEAD_LIMITS.students[0]} and ${LEAD_LIMITS.students[1]}, or leave it empty.`,
  classes: 'Choose valid classes.',
  message: `Keep the message under ${LEAD_LIMITS.message[1]} characters.`,
  confirmStaff: 'Please confirm you are a staff member and are not sharing any child’s details.',
};

function within(s: string, [min, max]: readonly [number, number]) {
  return s.length >= min && s.length <= max;
}

/** Validates an untrusted enquiry body. Unknown properties are ignored. */
export function validateLead(raw: unknown): LeadResult {
  const b = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const errors: LeadErrors = {};

  const kind = LEAD_KINDS.includes(b.kind as LeadKind) ? (b.kind as LeadKind) : null;
  if (!kind) errors.kind = MSG.kind;

  const contactName = cleanText(b.contactName);
  if (!within(contactName, LEAD_LIMITS.contactName)) errors.contactName = MSG.contactName;
  const role = cleanText(b.role);
  if (!within(role, LEAD_LIMITS.role)) errors.role = MSG.role;
  const orgName = cleanText(b.orgName);
  if (!within(orgName, LEAD_LIMITS.orgName)) errors.orgName = MSG.orgName;
  const town = cleanText(b.town);
  if (!within(town, LEAD_LIMITS.town)) errors.town = MSG.town;

  const emailRaw = cleanText(b.email).toLowerCase();
  const email = emailRaw || null;
  if (email && !isEmail(email)) errors.email = MSG.email;
  const phoneRaw = cleanText(b.phone);
  const phone = phoneRaw ? normalisePhone(phoneRaw) : null;
  if (phoneRaw && !phone) errors.phone = MSG.phone;
  if (!emailRaw && !phoneRaw) errors.contact = MSG.contact;

  let students: number | null = null;
  if (b.students !== undefined && b.students !== null && b.students !== '') {
    const n = typeof b.students === 'number' ? b.students : typeof b.students === 'string' && /^\s*\d+\s*$/.test(b.students) ? Number(b.students) : NaN;
    if (Number.isInteger(n) && n >= LEAD_LIMITS.students[0] && n <= LEAD_LIMITS.students[1]) students = n;
    else errors.students = MSG.students;
  }

  let classes: LeadClass[] = [];
  if (b.classes !== undefined && b.classes !== null) {
    if (!Array.isArray(b.classes) || b.classes.length > LEAD_CLASSES.length || !b.classes.every((x) => LEAD_CLASSES.includes(x as LeadClass))) errors.classes = MSG.classes;
    else classes = LEAD_CLASSES.filter((x) => (b.classes as unknown[]).includes(x)); // de-duplicated, in order
  }

  const message = cleanText(b.message, true);
  if (!within(message, LEAD_LIMITS.message)) errors.message = MSG.message;

  if (b.confirmStaff !== true) errors.confirmStaff = MSG.confirmStaff;

  if (Object.keys(errors).length || !kind) return { ok: false, errors };
  return { ok: true, lead: { kind, contactName, role, orgName, town, email, phone, students, classes, message } };
}

/** True when the hidden honeypot field was filled in (a bot). */
export function isHoneypotFilled(raw: unknown): boolean {
  if (!raw || typeof raw !== 'object') return false;
  const v = (raw as Record<string, unknown>)[LEAD_HONEYPOT];
  return typeof v === 'string' ? v.trim() !== '' : v !== undefined && v !== null && v !== false;
}

export function classesLabel(classes: readonly string[]): string {
  return classes.map((c) => (c === 'pre' ? 'Pre-primary' : `Class ${c}`)).join(', ');
}
