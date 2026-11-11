import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rateLimit.js';
import { asyncHandler } from '../utils/http.js';
import { email, phone, str, validate } from '../utils/validate.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Премногу обиди за најава. Обидете се повторно за 15 минути.',
});

const password = (label = 'Лозинката') => str({ min: 8, max: 200, label });

/** POST /api/auth/register – нова продавница + сопственик */
router.post(
  '/register',
  authLimiter,
  asyncHandler(async (req, res) => {
    const data = validate(req.body, {
      store_name: str({ min: 2, max: 120, label: 'Името на продавницата' }),
      slug: str({ max: 50, label: 'Линкот' }),
      phone: phone({ label: 'Телефонот за Viber' }),
      name: str({ min: 2, max: 100, label: 'Вашето име' }),
      email: email(),
      password: password(),
    });
    data.slug = data.slug ? data.slug.toLowerCase() : '';
    const session = req.app.locals.services.auth.register(data);
    res.status(201).json({ ok: true, data: session });
  }),
);

/** POST /api/auth/login */
router.post(
  '/login',
  authLimiter,
  asyncHandler(async (req, res) => {
    const data = validate(req.body, {
      email: email(),
      password: str({ min: 1, max: 200, label: 'Лозинката' }),
    });
    const session = req.app.locals.services.auth.login(data);
    res.json({ ok: true, data: session });
  }),
);

/** GET /api/auth/me */
router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const store = req.app.locals.services.stores.getAdminStore(req.user.store_id);
    res.json({ ok: true, data: { user: req.user, store } });
  }),
);

/** POST /api/auth/change-password */
router.post(
  '/change-password',
  requireAuth,
  asyncHandler(async (req, res) => {
    const data = validate(req.body, {
      current_password: str({ min: 1, max: 200, label: 'Тековната лозинка' }),
      new_password: password('Новата лозинка'),
    });
    req.app.locals.services.auth.changePassword(req.user.id, data);
    res.json({ ok: true, data: { changed: true } });
  }),
);

export default router;
