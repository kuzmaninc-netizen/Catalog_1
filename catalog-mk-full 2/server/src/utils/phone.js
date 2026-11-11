const MK = '389';

/**
 * Телефон → меѓународен формат без знаци (пр. 38970123456). '' ако е невалиден.
 */
export function normalizePhone(phone) {
  if (phone === null || phone === undefined) return '';
  const raw = String(phone).trim();
  let digits = raw.replace(/\D/g, '');
  if (!digits) return '';

  const hadPrefix = raw.startsWith('+') || digits.startsWith('00');
  if (digits.startsWith('00')) digits = digits.slice(2);

  if (digits.startsWith(MK)) {
    let national = digits.slice(3);
    if (national.startsWith('0')) national = national.slice(1);
    return national.length === 8 ? MK + national : '';
  }
  if (hadPrefix) return digits.length >= 8 && digits.length <= 15 ? digits : '';

  if (digits.startsWith('0')) digits = digits.slice(1);
  return digits.length === 8 ? MK + digits : '';
}

export function isMkMobile(phone) {
  return /^3897\d{7}$/.test(normalizePhone(phone));
}

/** 38970123456 → 070 123 456 */
export function formatPhoneDisplay(phone) {
  const n = normalizePhone(phone);
  if (!n) return '';
  if (!n.startsWith(MK) || n.length !== 11) return `+${n}`;
  const national = n.slice(3);
  if (national.startsWith('2')) {
    return `0${national.slice(0, 1)} ${national.slice(1, 4)} ${national.slice(4)}`;
  }
  return `0${national.slice(0, 2)} ${national.slice(2, 5)} ${national.slice(5)}`;
}
