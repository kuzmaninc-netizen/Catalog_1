import { readStorage, removeStorage, writeStorage } from '../utils/storage';

const TOKEN_KEY = 'catalogmk:token';

export class ApiError extends Error {
  constructor(message, { status = 0, code = 'UNKNOWN', details } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const tokenStore = {
  get: () => readStorage(TOKEN_KEY, null),
  set: (token) => writeStorage(TOKEN_KEY, token),
  clear: () => removeStorage(TOKEN_KEY),
};

let onUnauthorized = () => {};
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

/**
 * fetch обвивка: JSON, токен, грешки на македонски.
 * Враќа `data` од { ok: true, data }.
 */
export async function request(path, { method = 'GET', body, auth = false, signal } = {}) {
  const headers = {};
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
  if (body !== undefined && !isForm) headers['Content-Type'] = 'application/json';

  if (auth) {
    const token = tokenStore.get();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(path, {
      method,
      headers,
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
      signal,
    });
  } catch (err) {
    if (err?.name === 'AbortError') throw err;
    throw new ApiError('Нема врска со серверот. Проверете ја интернет врската.', { code: 'NETWORK_ERROR' });
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok || !payload?.ok) {
    const error = payload?.error ?? {};
    if (response.status === 401 && auth) onUnauthorized();
    throw new ApiError(error.message || `Грешка (${response.status}).`, {
      status: response.status,
      code: error.code,
      details: error.details,
    });
  }

  return payload.data;
}
