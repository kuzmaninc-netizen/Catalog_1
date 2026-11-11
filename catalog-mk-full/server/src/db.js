import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { config } from './config.js';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS stores (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  slug               TEXT    NOT NULL UNIQUE,
  name               TEXT    NOT NULL,
  description        TEXT    NOT NULL DEFAULT '',
  logo_url           TEXT,
  phone              TEXT    NOT NULL,
  viber_phone        TEXT,
  address            TEXT    NOT NULL DEFAULT '',
  city               TEXT    NOT NULL DEFAULT '',
  working_hours      TEXT    NOT NULL DEFAULT '',
  delivery_fee       INTEGER NOT NULL DEFAULT 0,
  free_delivery_from INTEGER NOT NULL DEFAULT 0,
  min_order          INTEGER NOT NULL DEFAULT 0,
  is_active          INTEGER NOT NULL DEFAULT 1,
  created_at         TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at         TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id      INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  email         TEXT    NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT    NOT NULL,
  name          TEXT    NOT NULL DEFAULT '',
  created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS products (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id    INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name        TEXT    NOT NULL,
  description TEXT    NOT NULL DEFAULT '',
  price       INTEGER NOT NULL CHECK (price >= 0),
  image_url   TEXT,
  category    TEXT    NOT NULL DEFAULT '',
  unit        TEXT    NOT NULL DEFAULT 'парче',
  in_stock    INTEGER NOT NULL DEFAULT 1,
  is_active   INTEGER NOT NULL DEFAULT 1,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_products_store ON products(store_id);

CREATE TABLE IF NOT EXISTS orders (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id         INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  order_number     INTEGER NOT NULL,
  customer_name    TEXT    NOT NULL,
  customer_phone   TEXT    NOT NULL,
  customer_address TEXT    NOT NULL,
  note             TEXT    NOT NULL DEFAULT '',
  items_json       TEXT    NOT NULL,
  subtotal         INTEGER NOT NULL,
  delivery_fee     INTEGER NOT NULL,
  total            INTEGER NOT NULL,
  status           TEXT    NOT NULL DEFAULT 'new'
                   CHECK (status IN ('new','confirmed','delivered','cancelled')),
  created_at       TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at       TEXT    NOT NULL DEFAULT (datetime('now')),
  UNIQUE (store_id, order_number)
);
CREATE INDEX IF NOT EXISTS idx_orders_store ON orders(store_id, created_at DESC);
`;

export function openDatabase(dbPath = config.dbPath) {
  if (dbPath !== ':memory:') {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  }
  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA foreign_keys = ON;');
  if (dbPath !== ':memory:') db.exec('PRAGMA journal_mode = WAL;');
  db.exec(SCHEMA);
  return db;
}

/**
 * Извршува функција во трансакција. Ако фрли грешка → ROLLBACK.
 */
export function transaction(db, fn) {
  db.exec('BEGIN IMMEDIATE');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

/** node:sqlite враќа објекти без прототип – ги претвораме во обични објекти. */
export const plain = (row) => (row ? { ...row } : null);
