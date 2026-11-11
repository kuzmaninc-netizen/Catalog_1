import { badRequest } from './http.js';
import { normalizePhone } from './phone.js';

/**
 * Мала библиотека за валидација. Секое правило враќа нормализирана вредност
 * или фрла грешка со порака на македонски.
 *
 *   const data = validate(req.body, {
 *     name: str({ min: 2, max: 120 }),
 *     price: int({ min: 0 }),
 *   });
 */
export function validate(input, schema, { partial = false } = {}) {
  const source = input && typeof input === 'object' ? input : {};
  const out = {};
  const errors = {};

  for (const [key, rule] of Object.entries(schema)) {
    const present = Object.prototype.hasOwnProperty.call(source, key);
    if (partial && !present) continue;
    try {
      const value = rule(source[key], key);
      if (value !== undefined) out[key] = value;
    } catch (err) {
      errors[key] = err.message;
    }
  }

  if (Object.keys(errors).length) {
    throw badRequest('Проверете ги внесените податоци.', errors);
  }
  return out;
}

const isEmpty = (v) => v === undefined || v === null || (typeof v === 'string' && v.trim() === '');

export const str =
  ({ min = 0, max = 500, required = min > 0, label = 'Полето', pattern, patternMessage } = {}) =>
  (value) => {
    if (isEmpty(value)) {
      if (required) throw new Error(`${label} е задолжително.`);
      return '';
    }
    const s = String(value).trim();
    if (s.length < min) throw new Error(`${label} мора да има најмалку ${min} знаци.`);
    if (s.length > max) throw new Error(`${label} може да има најмногу ${max} знаци.`);
    if (pattern && !pattern.test(s)) throw new Error(patternMessage || `${label} не е во валиден формат.`);
    return s;
  };

export const int =
  ({ min = 0, max = 100_000_000, required = false, label = 'Вредноста', fallback = 0 } = {}) =>
  (value) => {
    if (isEmpty(value)) {
      if (required) throw new Error(`${label} е задолжителна.`);
      return fallback;
    }
    const n = Number(value);
    if (!Number.isFinite(n) || !Number.isInteger(n)) throw new Error(`${label} мора да биде цел број.`);
    if (n < min) throw new Error(`${label} мора да биде најмалку ${min}.`);
    if (n > max) throw new Error(`${label} може да биде најмногу ${max}.`);
    return n;
  };

export const bool =
  ({ fallback = true } = {}) =>
  (value) => {
    if (value === undefined || value === null || value === '') return fallback;
    if (typeof value === 'boolean') return value;
    return ['1', 'true', 'on', 'yes'].includes(String(value).toLowerCase());
  };

export const phone =
  ({ required = true, label = 'Телефонот' } = {}) =>
  (value) => {
    if (isEmpty(value)) {
      if (required) throw new Error(`${label} е задолжителен.`);
      return '';
    }
    const n = normalizePhone(value);
    if (!n) throw new Error(`${label} не е валиден (пр. 070 123 456).`);
    return n;
  };

export const email =
  ({ label = 'Е-поштата' } = {}) =>
  (value) => {
    const s = String(value ?? '').trim().toLowerCase();
    if (!s) throw new Error(`${label} е задолжителна.`);
    if (s.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) throw new Error(`${label} не е валидна.`);
    return s;
  };

export const imageUrl =
  () =>
  (value) => {
    if (isEmpty(value)) return null;
    const s = String(value).trim();
    if (s.length > 1000) throw new Error('URL-то е предолго.');
    if (!/^(https?:\/\/|\/uploads\/)/i.test(s)) {
      throw new Error('Сликата мора да биде прикачена или да е https:// линк.');
    }
    return s;
  };

export const oneOf =
  (values, { label = 'Вредноста' } = {}) =>
  (value) => {
    if (!values.includes(value)) throw new Error(`${label} не е валидна.`);
    return value;
  };

export function parseId(value) {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) throw badRequest('Невалиден ID.');
  return n;
}
