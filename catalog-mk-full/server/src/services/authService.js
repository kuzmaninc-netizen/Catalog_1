import { plain, transaction } from '../db.js';
import { hashPassword, verifyPassword } from '../auth/password.js';
import { createToken } from '../auth/token.js';
import { badRequest, conflict, unauthorized } from '../utils/http.js';
import { isValidSlug, slugify } from '../utils/slug.js';
import { toAdminStore, toUser } from './mappers.js';

// Хеш за споредба кога корисникот не постои (ист тајминг → не открива дали е-поштата постои)
const DUMMY_HASH = hashPassword('dummy-password-for-timing');

export function createAuthService(db) {
  const userByEmail = db.prepare('SELECT * FROM users WHERE email = ?');
  const userById = db.prepare('SELECT * FROM users WHERE id = ?');
  const storeById = db.prepare('SELECT * FROM stores WHERE id = ?');
  const slugExists = db.prepare('SELECT 1 FROM stores WHERE slug = ?');

  function session(userRow) {
    const store = plain(storeById.get(userRow.store_id));
    return {
      token: createToken({ sub: userRow.id, store_id: userRow.store_id }),
      user: toUser(userRow),
      store: toAdminStore(store),
    };
  }

  function uniqueSlug(base) {
    let slug = base;
    let i = 2;
    while (slugExists.get(slug)) {
      slug = `${base.slice(0, 46)}-${i}`;
      i += 1;
    }
    return slug;
  }

  /**
   * Регистрација на нова продавница + сопственик.
   */
  function register({ store_name, slug, phone, name, email, password }) {
    if (userByEmail.get(email)) throw conflict('Веќе постои сметка со оваа е-пошта.');

    let finalSlug;
    if (slug) {
      if (!isValidSlug(slug)) {
        throw badRequest('Проверете ги внесените податоци.', {
          slug: 'Само мали латинични букви, бројки и цртичка (3–50 знаци).',
        });
      }
      if (slugExists.get(slug)) throw conflict('Овој линк веќе е зафатен. Изберете друг.');
      finalSlug = slug;
    } else {
      const base = slugify(store_name);
      finalSlug = uniqueSlug(isValidSlug(base) ? base : `prodavnica-${Date.now().toString(36)}`);
    }

    const userId = transaction(db, () => {
      const store = db
        .prepare('INSERT INTO stores (slug, name, phone) VALUES (?, ?, ?)')
        .run(finalSlug, store_name, phone);
      const user = db
        .prepare('INSERT INTO users (store_id, email, password_hash, name) VALUES (?, ?, ?, ?)')
        .run(Number(store.lastInsertRowid), email, hashPassword(password), name);
      return Number(user.lastInsertRowid);
    });

    return session(plain(userById.get(userId)));
  }

  function login({ email, password }) {
    const user = plain(userByEmail.get(email));
    const ok = verifyPassword(password, user?.password_hash ?? DUMMY_HASH);
    if (!user || !ok) throw unauthorized('Погрешна е-пошта или лозинка.');
    return session(user);
  }

  function getUser(id) {
    const row = plain(userById.get(id));
    return row ? toUser(row) : null;
  }

  function changePassword(userId, { current_password, new_password }) {
    const user = plain(userById.get(userId));
    if (!user || !verifyPassword(current_password, user.password_hash)) {
      throw badRequest('Проверете ги внесените податоци.', { current_password: 'Тековната лозинка не е точна.' });
    }
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hashPassword(new_password), userId);
  }

  return { register, login, getUser, changePassword };
}
