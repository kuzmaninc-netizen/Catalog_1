import { HttpError } from '../utils/http.js';

/**
 * Едноставен in-memory rate limiter (по IP). Доволен за еден сервер.
 * @param {{windowMs:number, max:number, message?:string}} opts
 */
export function rateLimit({ windowMs, max, message = 'Премногу барања. Обидете се повторно за малку.' }) {
  const hits = new Map();

  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) if (entry.reset <= now) hits.delete(key);
  }, windowMs);
  cleanup.unref();

  return (req, res, next) => {
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    let entry = hits.get(key);
    if (!entry || entry.reset <= now) {
      entry = { count: 0, reset: now + windowMs };
      hits.set(key, entry);
    }
    entry.count += 1;

    res.setHeader('RateLimit-Limit', String(max));
    res.setHeader('RateLimit-Remaining', String(Math.max(0, max - entry.count)));

    if (entry.count > max) {
      res.setHeader('Retry-After', String(Math.ceil((entry.reset - now) / 1000)));
      return next(new HttpError(429, message, 'RATE_LIMITED'));
    }
    return next();
  };
}
