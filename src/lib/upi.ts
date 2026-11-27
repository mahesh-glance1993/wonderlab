// UPI payment link for the /support page. The UPI ID comes only from build-time configuration
// (VITE_SUPPORT_UPI_ID); nothing personal is hard-coded.

const UPI_ID_RE = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z][a-zA-Z0-9.-]{1,63}$/;

/** Builds a `upi://pay` link, or null when the UPI ID is missing or malformed. */
export function upiLink(id: string | undefined, name: string | undefined): string | null {
  const pa = (id || '').trim();
  if (!UPI_ID_RE.test(pa)) return null;
  const pn = (name || '').trim().slice(0, 60) || 'WonderLab';
  return `upi://pay?pa=${pa}&pn=${encodeURIComponent(pn)}&cu=INR`;
}
