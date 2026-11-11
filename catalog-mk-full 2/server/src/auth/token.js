import crypto from 'node:crypto';
import { config } from '../config.js';

/**
 * Минимален JWT (HS256) со вграден crypto – без надворешни пакети.
 */
const b64url = (input) => Buffer.from(input).toString('base64url');

function sign(data, secret) {
  return crypto.createHmac('sha256', secret).update(data).digest('base64url');
}

export function createToken(payload, { secret = config.jwtSecret, expiresInDays = config.jwtExpiresDays } = {}) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = b64url(JSON.stringify({ ...payload, iat: now, exp: now + expiresInDays * 86400 }));
  return `${header}.${body}.${sign(`${header}.${body}`, secret)}`;
}

/** Враќа payload или null ако токенот е невалиден/истечен. */
export function verifyToken(token, { secret = config.jwtSecret } = {}) {
  if (typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, body, signature] = parts;

  const expected = Buffer.from(sign(`${header}.${body}`, secret));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) return null;

  try {
    const head = JSON.parse(Buffer.from(header, 'base64url').toString());
    if (head.alg !== 'HS256') return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (typeof payload.exp !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
