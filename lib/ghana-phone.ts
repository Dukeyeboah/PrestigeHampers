/** Normalize Ghana phone input to E.164 (+233…) when possible */
export function formatGhanaPhone(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';

  const d = trimmed.replace(/\D/g, '');
  if (trimmed.startsWith('+')) {
    if (d.startsWith('233')) return `+${d}`;
    return trimmed;
  }
  if (d.startsWith('233')) return `+${d}`;
  if (d.startsWith('0')) return `+233${d.slice(1)}`;
  if (d.length === 9) return `+233${d}`;
  return `+233${d}`;
}

export function isValidGhanaPhone(raw: string): boolean {
  return /^\+233[0-9]{9}$/.test(formatGhanaPhone(raw));
}
