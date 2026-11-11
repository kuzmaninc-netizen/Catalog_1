import { verifyToken } from '../auth/token.js';
import { unauthorized } from '../utils/http.js';

/**
 * Бара валиден Bearer токен. Поставува req.user = { id, store_id }.
 */
export function requireAuth(req, _res, next) {
  const header = req.get('authorization') || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return next(unauthorized());

  const payload = verifyToken(token);
  if (!payload) return next(unauthorized('Сесијата истече. Најавете се повторно.'));

  const user = req.app.locals.services.auth.getUser(payload.sub);
  if (!user || user.store_id !== payload.store_id) return next(unauthorized());

  req.user = user;
  return next();
}
