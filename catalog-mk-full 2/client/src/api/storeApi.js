import { request } from './http';

/**
 * publicStore: продавница + активни производи + категории.
 * @param {string} slug
 */
export function fetchPublicStore(slug, { signal } = {}) {
  return request(`/api/public/stores/${encodeURIComponent(slug)}`, { signal });
}

/**
 * Зачувај нарачка. Серверот ги пресметува цените од базата.
 * @param {string} slug
 * @param {{customer: {name,phone,address,note}, items: Array<{product_id:number, quantity:number}>}} payload
 * @returns {Promise<{order: object}>}
 */
export function createOrder(slug, payload) {
  return request(`/api/public/stores/${encodeURIComponent(slug)}/orders`, {
    method: 'POST',
    body: payload,
  });
}
