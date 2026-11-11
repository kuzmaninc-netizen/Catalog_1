import { plain } from '../db.js';
import { notFound } from '../utils/http.js';
import { toAdminProduct } from './mappers.js';

const FIELDS = ['name', 'description', 'price', 'image_url', 'category', 'unit', 'in_stock', 'is_active', 'sort_order'];

const toDb = (field, value) => {
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (field === 'image_url' && !value) return null;
  return value;
};

export function createProductService(db) {
  const listStmt = db.prepare(
    'SELECT * FROM products WHERE store_id = ? ORDER BY sort_order ASC, id DESC',
  );
  const getStmt = db.prepare('SELECT * FROM products WHERE id = ? AND store_id = ?');
  const deleteStmt = db.prepare('DELETE FROM products WHERE id = ? AND store_id = ?');
  const categoriesStmt = db.prepare(
    `SELECT DISTINCT category FROM products WHERE store_id = ? AND category <> '' ORDER BY category`,
  );

  function getRow(storeId, id) {
    const row = plain(getStmt.get(id, storeId));
    if (!row) throw notFound('Производот не е пронајден.');
    return row;
  }

  function list(storeId) {
    return listStmt.all(storeId).map((r) => toAdminProduct(plain(r)));
  }

  function categories(storeId) {
    return categoriesStmt.all(storeId).map((r) => r.category);
  }

  function get(storeId, id) {
    return toAdminProduct(getRow(storeId, id));
  }

  function create(storeId, data) {
    const fields = FIELDS.filter((f) => data[f] !== undefined);
    const result = db
      .prepare(
        `INSERT INTO products (store_id, ${fields.join(', ')}) VALUES (?, ${fields.map(() => '?').join(', ')})`,
      )
      .run(storeId, ...fields.map((f) => toDb(f, data[f])));
    return get(storeId, Number(result.lastInsertRowid));
  }

  function update(storeId, id, data) {
    getRow(storeId, id);
    const fields = FIELDS.filter((f) => data[f] !== undefined);
    if (fields.length) {
      db.prepare(
        `UPDATE products SET ${fields.map((f) => `${f} = ?`).join(', ')}, updated_at = datetime('now')
         WHERE id = ? AND store_id = ?`,
      ).run(...fields.map((f) => toDb(f, data[f])), id, storeId);
    }
    return get(storeId, id);
  }

  function remove(storeId, id) {
    const row = getRow(storeId, id);
    deleteStmt.run(id, storeId);
    return toAdminProduct(row);
  }

  return { list, categories, get, create, update, remove };
}
