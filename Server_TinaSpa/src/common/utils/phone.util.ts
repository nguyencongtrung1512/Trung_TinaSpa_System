/** Strips separators and turns +84 / 84 prefixes into the leading 0 used for `User.phone`. */
export function normalizePhone(raw: string): string {
  const phone = raw.replaceAll(/[\s.\-()]/g, '');
  if (phone.startsWith('+84')) return `0${phone.slice(3)}`;
  if (/^84\d{9,10}$/.test(phone)) return `0${phone.slice(2)}`;
  return phone;
}

/** Spellings a phone may have been stored with (account or guest booking). */
export function phoneVariants(normalized: string): string[] {
  return normalized.startsWith('0')
    ? [normalized, `+84${normalized.slice(1)}`]
    : [normalized];
}
