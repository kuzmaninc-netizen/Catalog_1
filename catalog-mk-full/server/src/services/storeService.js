import { plain } from '../db.js';
import { conflict, notFound, badRequest } from '../utils/http.js';
import { isValidSlug } from '../utils/slug.js';
import { toAdminStore, toPublicProduct, toPublicStore } from './mappers.js';

const UPDATABLE = [
  'name', 'slug', 'description', 'logo_url', 'phone', 'viber_phone', 'address', 'city',
  'working_hours', 'delivery_fee', 'free_delivery_from', 'min_order', 'is_active',
];

export function createStoreService(db) {
  const byId = db.prepare('SELECT * FROM stores WHERE id = ?');
  const bySlug = db.prepare('SELECT * FROM stores WHERE slug = ?');
  const activeProducts = db.prepare(
    `SELECT * FROM products WHERE store_id = ? AND is_active = 1
     ORDER BY sort_order ASC, name COLLATE NOCASE ASC`,
  );

  function getRow(id) {
    const row = plain(byId.get(id));
    if (!row) throw notFound('Продавницата не е пронајдена.');
    return row;
  }

  function isSlugTaken(slug, exceptId = 0) {
    const row = bySlug.get(slug);
    return Boolean(row && row.id !== exceptId);
  }

  /** Јавен каталог: продавница + активни производи + категории. */
  function getPublicCatalog(slug) {
    const row = plain(bySlug.get(String(slug ?? '').toLowerCase()));
    if (!row || !row.is_active) throw notFound('Продавницата не е пронајдена.');
    const products = activeProducts.all(row.id).map((p) => toPublicProduct(plain(p)));
    const categories = [...new Set(products.map((p) => p.category))];
    return { store: toPublicStore(row), products, categories };
  }

  function getAdminStore(id) {
    return toAdminStore(getRow(id));
  }

  function updateStore(id, data) {
    getRow(id);
    if (data.slug !== undefined) {
      if (!isValidSlug(data.slug)) {
        throw badRequest('Проверете ги внесените податоци.', {
          slug: 'Линкот смее да содржи само мали латинични букви, бројки и цртичка (3–50 знаци).',
        });
      }
      if (isSlugTaken(data.slug, id)) throw conflict('Овој линк веќе е зафатен. Изберете друг.');
    }

    const fields = UPDATABLE.filter((f) => data[f] !== undefined);
    if (fields.length) {
      const values = fields.map((f) => {
        const v = data[f];
        if (typeof v === 'boolean') return v ? 1 : 0;
        return v === '' && (f === 'logo_url' || f === 'viber_phone') ? null : v;
      });
      db.prepare(
        `UPDATE stores SET ${fields.map((f) => `${f} = ?`).join(', ')}, updated_at = datetime('now') WHERE id = ?`,
      ).run(...values, id);
    }
    return getAdminStore(id);
  }

  return { getRow, isSlugTaken, getPublicCatalog, getAdminStore, updateStore };
}
