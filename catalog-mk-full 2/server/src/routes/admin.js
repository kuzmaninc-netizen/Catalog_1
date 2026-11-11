import fs from 'node:fs';
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { deleteUploadedFile, imageUpload, verifyImageFile } from '../middleware/upload.js';
import { ORDER_STATUSES } from '../services/orderService.js';
import { asyncHandler, badRequest } from '../utils/http.js';
import { bool, imageUrl, int, oneOf, parseId, phone, str, validate } from '../utils/validate.js';

const router = Router();
router.use(requireAuth);

const svc = (req) => req.app.locals.services;

/* --------------------------------- Продавница --------------------------------- */

const storeSchema = {
  name: str({ min: 2, max: 120, label: 'Името' }),
  slug: str({ min: 3, max: 50, label: 'Линкот' }),
  description: str({ max: 500, label: 'Описот' }),
  logo_url: imageUrl(),
  phone: phone({ label: 'Телефонот' }),
  viber_phone: phone({ required: false, label: 'Viber бројот' }),
  address: str({ max: 200, label: 'Адресата' }),
  city: str({ max: 80, label: 'Градот' }),
  working_hours: str({ max: 120, label: 'Работното време' }),
  delivery_fee: int({ min: 0, max: 100000, label: 'Цената за достава' }),
  free_delivery_from: int({ min: 0, max: 10000000, label: 'Бесплатна достава од' }),
  min_order: int({ min: 0, max: 10000000, label: 'Минималната нарачка' }),
  is_active: bool(),
};

router.get(
  '/store',
  asyncHandler(async (req, res) => {
    res.json({ ok: true, data: { store: svc(req).stores.getAdminStore(req.user.store_id) } });
  }),
);

router.put(
  '/store',
  asyncHandler(async (req, res) => {
    const data = validate(req.body, storeSchema, { partial: true });
    if (data.slug) data.slug = data.slug.toLowerCase();

    const before = svc(req).stores.getRow(req.user.store_id);
    const store = svc(req).stores.updateStore(req.user.store_id, data);
    if (data.logo_url !== undefined && before.logo_url && before.logo_url !== store.logo_url) {
      deleteUploadedFile(before.logo_url);
    }
    res.json({ ok: true, data: { store } });
  }),
);

/* --------------------------------- Прикачување --------------------------------- */

router.post(
  '/uploads',
  imageUpload,
  asyncHandler(async (req, res) => {
    if (!req.file) throw badRequest('Изберете слика за прикачување.');
    if (!verifyImageFile(req.file.path)) {
      fs.promises.unlink(req.file.path).catch(() => {});
      throw badRequest('Фајлот не е валидна слика.');
    }
    res.status(201).json({ ok: true, data: { url: `/uploads/${req.file.filename}` } });
  }),
);

/* --------------------------------- Производи --------------------------------- */

const productSchema = {
  name: str({ min: 2, max: 150, label: 'Името' }),
  description: str({ max: 1000, label: 'Описот' }),
  price: int({ min: 0, max: 10000000, required: true, label: 'Цената' }),
  image_url: imageUrl(),
  category: str({ max: 60, label: 'Категоријата' }),
  unit: str({ max: 20, label: 'Единицата' }),
  in_stock: bool(),
  is_active: bool(),
  sort_order: int({ min: -100000, max: 100000, label: 'Редоследот' }),
};

router.get(
  '/products',
  asyncHandler(async (req, res) => {
    const products = svc(req).products.list(req.user.store_id);
    const categories = svc(req).products.categories(req.user.store_id);
    res.json({ ok: true, data: { products, categories } });
  }),
);

router.post(
  '/products',
  asyncHandler(async (req, res) => {
    const data = validate(req.body, productSchema);
    if (!data.unit) data.unit = 'парче';
    const product = svc(req).products.create(req.user.store_id, data);
    res.status(201).json({ ok: true, data: { product } });
  }),
);

router.put(
  '/products/:id',
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    const data = validate(req.body, productSchema, { partial: true });
    const before = svc(req).products.get(req.user.store_id, id);
    const product = svc(req).products.update(req.user.store_id, id, data);
    if (data.image_url !== undefined && before.image_url && before.image_url !== product.image_url) {
      deleteUploadedFile(before.image_url);
    }
    res.json({ ok: true, data: { product } });
  }),
);

router.delete(
  '/products/:id',
  asyncHandler(async (req, res) => {
    const removed = svc(req).products.remove(req.user.store_id, parseId(req.params.id));
    deleteUploadedFile(removed.image_url);
    res.json({ ok: true, data: { deleted: removed.id } });
  }),
);

/* --------------------------------- Нарачки --------------------------------- */

router.get(
  '/orders',
  asyncHandler(async (req, res) => {
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
    const offset = Math.max(0, Number(req.query.offset) || 0);
    const status = ORDER_STATUSES.includes(req.query.status) ? req.query.status : undefined;
    const result = svc(req).orders.list(req.user.store_id, { status, limit, offset });
    res.json({ ok: true, data: result });
  }),
);

router.patch(
  '/orders/:id',
  asyncHandler(async (req, res) => {
    const { status } = validate(req.body, { status: oneOf(ORDER_STATUSES, { label: 'Статусот' }) });
    const order = svc(req).orders.updateStatus(req.user.store_id, parseId(req.params.id), status);
    res.json({ ok: true, data: { order } });
  }),
);

router.get(
  '/stats',
  asyncHandler(async (req, res) => {
    res.json({ ok: true, data: svc(req).orders.stats(req.user.store_id) });
  }),
);

export default router;
