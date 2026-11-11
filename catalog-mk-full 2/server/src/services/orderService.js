import { plain, transaction } from '../db.js';
import { badRequest, notFound } from '../utils/http.js';
import { toOrder } from './mappers.js';

export const ORDER_STATUSES = ['new', 'confirmed', 'delivered', 'cancelled'];
const MAX_LINES = 100;
const MAX_QTY = 99;

export function createOrderService(db) {
  const storeBySlug = db.prepare('SELECT * FROM stores WHERE slug = ? AND is_active = 1');
  const productStmt = db.prepare('SELECT * FROM products WHERE id = ? AND store_id = ?');
  const nextNumberStmt = db.prepare(
    'SELECT COALESCE(MAX(order_number), 0) + 1 AS next FROM orders WHERE store_id = ?',
  );
  const insertStmt = db.prepare(`
    INSERT INTO orders (store_id, order_number, customer_name, customer_phone, customer_address,
                        note, items_json, subtotal, delivery_fee, total)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const getStmt = db.prepare('SELECT * FROM orders WHERE id = ? AND store_id = ?');

  /**
   * Креира нарачка. Цените се пресметуваат од базата – НЕ се верува на клиентот.
   * @param {string} slug
   * @param {{customer: {name,phone,address,note}, items: Array<{product_id:number, quantity:number}>}} input
   */
  function createOrder(slug, { customer, items }) {
    const store = plain(storeBySlug.get(String(slug ?? '').toLowerCase()));
    if (!store) throw notFound('Продавницата не е пронајдена.');

    if (!Array.isArray(items) || items.length === 0) {
      throw badRequest('Кошничката е празна.');
    }
    if (items.length > MAX_LINES) throw badRequest('Премногу артикли во една нарачка.');

    // Спои дупликати и валидирај количини
    const merged = new Map();
    for (const line of items) {
      const productId = Number(line?.product_id);
      const qty = Number(line?.quantity);
      if (!Number.isInteger(productId) || productId <= 0) throw badRequest('Невалиден производ.');
      if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
        throw badRequest(`Количината мора да биде помеѓу 1 и ${MAX_QTY}.`);
      }
      merged.set(productId, Math.min(MAX_QTY, (merged.get(productId) ?? 0) + qty));
    }

    const unavailable = [];
    const orderItems = [];
    for (const [productId, quantity] of merged) {
      const p = plain(productStmt.get(productId, store.id));
      if (!p || !p.is_active || !p.in_stock) {
        unavailable.push(p?.name ?? `#${productId}`);
        continue;
      }
      orderItems.push({
        product_id: p.id,
        name: p.name,
        unit: p.unit,
        price: p.price,
        quantity,
        line_total: p.price * quantity,
      });
    }

    if (unavailable.length) {
      const err = badRequest(`Некои производи веќе не се достапни: ${unavailable.join(', ')}.`);
      err.code = 'PRODUCTS_UNAVAILABLE';
      throw err;
    }

    const subtotal = orderItems.reduce((s, i) => s + i.line_total, 0);
    if (store.min_order > 0 && subtotal < store.min_order) {
      throw badRequest(`Минималната нарачка е ${store.min_order} ден.`);
    }
    const deliveryFee =
      store.free_delivery_from > 0 && subtotal >= store.free_delivery_from ? 0 : store.delivery_fee;
    const total = subtotal + deliveryFee;

    const orderId = transaction(db, () => {
      const { next } = nextNumberStmt.get(store.id);
      const result = insertStmt.run(
        store.id,
        next,
        customer.name,
        customer.phone,
        customer.address,
        customer.note ?? '',
        JSON.stringify(orderItems),
        subtotal,
        deliveryFee,
        total,
      );
      return Number(result.lastInsertRowid);
    });

    return toOrder(plain(getStmt.get(orderId, store.id)));
  }

  function list(storeId, { status, limit = 50, offset = 0 } = {}) {
    const where = ['store_id = ?'];
    const params = [storeId];
    if (status && ORDER_STATUSES.includes(status)) {
      where.push('status = ?');
      params.push(status);
    }
    const whereSql = where.join(' AND ');
    const rows = db
      .prepare(`SELECT * FROM orders WHERE ${whereSql} ORDER BY id DESC LIMIT ? OFFSET ?`)
      .all(...params, limit, offset);
    const { count } = db.prepare(`SELECT COUNT(*) AS count FROM orders WHERE ${whereSql}`).get(...params);
    return { orders: rows.map((r) => toOrder(plain(r))), total: count };
  }

  function updateStatus(storeId, id, status) {
    if (!ORDER_STATUSES.includes(status)) throw badRequest('Невалиден статус.');
    const row = getStmt.get(id, storeId);
    if (!row) throw notFound('Нарачката не е пронајдена.');
    db.prepare(`UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ? AND store_id = ?`).run(
      status,
      id,
      storeId,
    );
    return toOrder(plain(getStmt.get(id, storeId)));
  }

  function stats(storeId) {
    const row = db
      .prepare(
        `SELECT
           COUNT(*) AS total_orders,
           SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) AS new_orders,
           SUM(CASE WHEN date(created_at, 'localtime') = date('now', 'localtime') THEN 1 ELSE 0 END) AS today_orders,
           COALESCE(SUM(CASE WHEN status <> 'cancelled' AND date(created_at, 'localtime') = date('now', 'localtime')
                             THEN total ELSE 0 END), 0) AS today_revenue,
           COALESCE(SUM(CASE WHEN status <> 'cancelled' AND created_at >= datetime('now', '-30 days')
                             THEN total ELSE 0 END), 0) AS month_revenue
         FROM orders WHERE store_id = ?`,
      )
      .get(storeId);
    const products = db
      .prepare('SELECT COUNT(*) AS c, SUM(CASE WHEN in_stock = 0 THEN 1 ELSE 0 END) AS out FROM products WHERE store_id = ?')
      .get(storeId);
    return {
      total_orders: row.total_orders ?? 0,
      new_orders: row.new_orders ?? 0,
      today_orders: row.today_orders ?? 0,
      today_revenue: row.today_revenue ?? 0,
      month_revenue: row.month_revenue ?? 0,
      products: products.c ?? 0,
      out_of_stock: products.out ?? 0,
    };
  }

  return { createOrder, list, updateStatus, stats };
}
