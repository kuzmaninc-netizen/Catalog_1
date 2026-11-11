/**
 * catalog.mk – Base44 backend function
 *
 * Повик од фронтендот:
 *   base44.functions.invoke('storeApi', { action: 'publicStore', slug: 'pekara-zito' })
 *
 * Акции:
 *   - publicStore : јавни податоци за продавницата + активни производи (без автентикација)
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// ---------------------------------------------------------------------------
// Типови
// ---------------------------------------------------------------------------

interface StoreRecord {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  cover_url?: string;
  phone?: string;
  viber_phone?: string;
  address?: string;
  city?: string;
  working_hours?: string;
  delivery_fee?: number;
  free_delivery_from?: number;
  min_order?: number;
  is_active?: boolean;
}

interface ProductRecord {
  id: string;
  store_id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category?: string;
  unit?: string;
  in_stock?: boolean;
  is_active?: boolean;
  sort_order?: number;
}

interface PublicPhone {
  /** Меѓународен формат без знаци, пр. 38970123456 (за Viber deep-link) */
  international: string;
  /** Локален формат за прикажување, пр. 070 123 456 */
  display: string;
  /** tel: линк, пр. tel:+38970123456 */
  tel: string;
}

type ActionHandler = (
  base44: ReturnType<typeof createClientFromRequest>,
  payload: Record<string, unknown>,
) => Promise<Response>;

// ---------------------------------------------------------------------------
// Помошни функции
// ---------------------------------------------------------------------------

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS_HEADERS },
  });
}

function errorResponse(message: string, status = 400, code = 'BAD_REQUEST'): Response {
  return json({ ok: false, error: { code, message } }, status);
}

/**
 * Македонски телефонски број → меѓународен формат без знаци.
 *   "070 123 456"        → "38970123456"
 *   "+389 70 123 456"    → "38970123456"
 *   "00389 (0)70/123-456"→ "38970123456"
 *   "02 3123 456"        → "38923123456"
 * Враќа празен стринг ако бројот не е валиден.
 */
function normalizePhone(phone: unknown): string {
  if (phone === null || phone === undefined) return '';
  const raw = String(phone).trim();
  let digits = raw.replace(/\D/g, '');
  if (!digits) return '';

  const hadInternationalPrefix = raw.startsWith('+') || digits.startsWith('00');
  if (digits.startsWith('00')) digits = digits.slice(2);

  if (digits.startsWith('389')) {
    let national = digits.slice(3);
    if (national.startsWith('0')) national = national.slice(1);
    return national.length === 8 ? `389${national}` : '';
  }

  if (hadInternationalPrefix) {
    // Странски број – дозволи го ако има разумна должина (E.164)
    return digits.length >= 8 && digits.length <= 15 ? digits : '';
  }

  if (digits.startsWith('0')) digits = digits.slice(1);
  return digits.length === 8 ? `389${digits}` : '';
}

/** "38970123456" → "070 123 456", "38923123456" → "02 3123 456" */
function formatPhoneDisplay(international: string): string {
  if (!international.startsWith('389') || international.length !== 11) {
    return international ? `+${international}` : '';
  }
  const national = international.slice(3); // 8 цифри
  if (national.startsWith('7')) {
    return `0${national.slice(0, 2)} ${national.slice(2, 5)} ${national.slice(5)}`;
  }
  if (national.startsWith('2')) {
    // Скопје: 02 XXX XXXX
    return `0${national.slice(0, 1)} ${national.slice(1, 4)} ${national.slice(4)}`;
  }
  // Други региони: 0XX XXX XXX
  return `0${national.slice(0, 2)} ${national.slice(2, 5)} ${national.slice(5)}`;
}

function toPublicPhone(phone: unknown): PublicPhone | null {
  const international = normalizePhone(phone);
  if (!international) return null;
  return {
    international,
    display: formatPhoneDisplay(international),
    tel: `tel:+${international}`,
  };
}

function toNumber(value: unknown, fallback = 0): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function sanitizeSlug(value: unknown): string {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 80);
}

// ---------------------------------------------------------------------------
// Мапирање во јавен формат (не враќаме внатрешни полиња)
// ---------------------------------------------------------------------------

function mapStore(store: StoreRecord) {
  const phone = toPublicPhone(store.phone);
  const viber = toPublicPhone(store.viber_phone) ?? phone;

  return {
    id: store.id,
    name: store.name,
    slug: store.slug,
    description: store.description ?? '',
    logo_url: store.logo_url ?? null,
    cover_url: store.cover_url ?? null,
    address: store.address ?? '',
    city: store.city ?? '',
    working_hours: store.working_hours ?? '',
    currency: 'MKD',
    currency_label: 'ден.',
    delivery_fee: toNumber(store.delivery_fee, 0),
    free_delivery_from: toNumber(store.free_delivery_from, 0),
    min_order: toNumber(store.min_order, 0),

    // Телефони во македонски формат
    phone: phone?.international ?? '', // 3897XXXXXXX
    phone_display: phone?.display ?? '', // 07X XXX XXX
    phone_tel: phone?.tel ?? '',
    viber_phone: viber?.international ?? '', // се користи за viber://chat?number=
    viber_phone_display: viber?.display ?? '',
  };
}

function mapProduct(product: ProductRecord) {
  return {
    id: product.id,
    name: product.name,
    description: product.description ?? '',
    price: toNumber(product.price, 0),
    image_url: product.image_url ?? null,
    category: product.category?.trim() || 'Останато',
    unit: product.unit ?? 'парче',
    in_stock: product.in_stock !== false,
    sort_order: toNumber(product.sort_order, 0),
  };
}

// ---------------------------------------------------------------------------
// Акции
// ---------------------------------------------------------------------------

const publicStore: ActionHandler = async (base44, payload) => {
  const slug = sanitizeSlug(payload.slug);
  if (!slug) {
    return errorResponse('Недостасува „slug“ на продавницата.', 400, 'MISSING_SLUG');
  }

  // Јавен ендпоинт → читаме со service role, но враќаме само јавни полиња.
  const stores = (await base44.asServiceRole.entities.Store.filter({ slug })) as StoreRecord[];
  const store = stores.find((s) => s.is_active !== false);

  if (!store) {
    return errorResponse('Продавницата не е пронајдена.', 404, 'STORE_NOT_FOUND');
  }

  const products = (await base44.asServiceRole.entities.Product.filter({
    store_id: store.id,
  })) as ProductRecord[];

  const publicProducts = products
    .filter((p) => p.is_active !== false)
    .map(mapProduct)
    .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name, 'mk'));

  const categories = Array.from(new Set(publicProducts.map((p) => p.category)));

  return json({
    ok: true,
    data: {
      store: mapStore(store),
      products: publicProducts,
      categories,
    },
  });
};

const ACTIONS: Record<string, ActionHandler> = {
  publicStore,
};

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return errorResponse('Дозволен е само POST.', 405, 'METHOD_NOT_ALLOWED');
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await req.json()) ?? {};
  } catch {
    return errorResponse('Невалиден JSON.', 400, 'INVALID_JSON');
  }

  const action = String(payload.action ?? '');
  const handler = ACTIONS[action];
  if (!handler) {
    return errorResponse(`Непозната акција: „${action}“.`, 400, 'UNKNOWN_ACTION');
  }

  try {
    const base44 = createClientFromRequest(req);
    return await handler(base44, payload);
  } catch (err) {
    console.error(`[storeApi:${action}]`, err);
    return errorResponse('Внатрешна грешка на серверот.', 500, 'INTERNAL_ERROR');
  }
});
