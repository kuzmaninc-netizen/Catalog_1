import { Router } from 'express';
import { rateLimit } from '../middleware/rateLimit.js';
import { asyncHandler, badRequest } from '../utils/http.js';
import { phone, str, validate } from '../utils/validate.js';
import { isMkMobile } from '../utils/phone.js';

const router = Router();

const orderLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 15,
  message: 'Испративте премногу нарачки. Обидете се повторно за неколку минути.',
});

/**
 * GET /api/public/stores/:slug
 * Акција „publicStore“ – продавница + активни производи.
 */
router.get(
  '/stores/:slug',
  asyncHandler(async (req, res) => {
    const data = req.app.locals.services.stores.getPublicCatalog(req.params.slug);
    res.set('Cache-Control', 'public, max-age=30');
    res.json({ ok: true, data });
  }),
);

/**
 * POST /api/public/stores/:slug/orders
 * Body: { customer: {name, phone, address, note}, items: [{product_id, quantity}] }
 */
router.post(
  '/stores/:slug/orders',
  orderLimiter,
  asyncHandler(async (req, res) => {
    const customer = validate(req.body?.customer, {
      name: str({ min: 2, max: 100, label: 'Името' }),
      phone: phone({ label: 'Телефонот' }),
      address: str({ min: 5, max: 300, label: 'Адресата' }),
      note: str({ max: 500, label: 'Забелешката' }),
    });
    if (!isMkMobile(customer.phone) && customer.phone.startsWith('389')) {
      throw badRequest('Проверете ги внесените податоци.', { phone: 'Внесете мобилен број (07X XXX XXX).' });
    }

    const order = req.app.locals.services.orders.createOrder(req.params.slug, {
      customer,
      items: req.body?.items,
    });
    res.status(201).json({ ok: true, data: { order } });
  }),
);

export default router;
