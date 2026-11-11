/**
 * Viber интеграција и помошни функции за нарачка.
 */

const MK_COUNTRY_CODE = '389';
const DIVIDER = '━━━━━━━━━━━━━━';

/**
 * Го чисти телефонскиот број и го претвора во меѓународен формат без знаци.
 *
 *   normalizePhone('070 123 456')         → '38970123456'
 *   normalizePhone('+389 70 123 456')     → '38970123456'
 *   normalizePhone('00389 (0)70/123-456') → '38970123456'
 *   normalizePhone('70123456')            → '38970123456'
 *   normalizePhone('02 3123 456')         → '38923123456'
 *   normalizePhone('123')                 → ''
 *
 * @param {string|number|null|undefined} phone
 * @returns {string} меѓународен број без знаци или '' ако е невалиден
 */
export function normalizePhone(phone) {
  if (phone === null || phone === undefined) return '';
  const raw = String(phone).trim();
  let digits = raw.replace(/\D/g, '');
  if (!digits) return '';

  const hadInternationalPrefix = raw.startsWith('+') || digits.startsWith('00');
  if (digits.startsWith('00')) digits = digits.slice(2);

  // Веќе има 389 → извади го националниот дел (и евентуална водечка 0)
  if (digits.startsWith(MK_COUNTRY_CODE)) {
    let national = digits.slice(MK_COUNTRY_CODE.length);
    if (national.startsWith('0')) national = national.slice(1);
    return national.length === 8 ? MK_COUNTRY_CODE + national : '';
  }

  // Странски број (+44..., 0049...) – прифати ако има E.164 должина
  if (hadInternationalPrefix) {
    return digits.length >= 8 && digits.length <= 15 ? digits : '';
  }

  // Локален македонски формат: 07X XXX XXX, 02 XXX XXXX ...
  if (digits.startsWith('0')) digits = digits.slice(1);
  return digits.length === 8 ? MK_COUNTRY_CODE + digits : '';
}

/**
 * Дали бројот е валиден македонски мобилен (07X).
 * @param {string} phone
 */
export function isValidMkMobile(phone) {
  return /^3897\d{7}$/.test(normalizePhone(phone));
}

/**
 * Меѓународен → локален формат за прикажување: '38970123456' → '070 123 456'
 * @param {string} phone
 */
export function formatPhoneDisplay(phone) {
  const n = normalizePhone(phone);
  if (!n) return String(phone ?? '');
  if (!n.startsWith(MK_COUNTRY_CODE) || n.length !== 11) return `+${n}`;
  const national = n.slice(3);
  if (national.startsWith('2')) {
    return `0${national.slice(0, 1)} ${national.slice(1, 4)} ${national.slice(4)}`;
  }
  return `0${national.slice(0, 2)} ${national.slice(2, 5)} ${national.slice(5)}`;
}

/**
 * Форматирање на износ во денари: 1250 → '1.250 ден.'
 * @param {number} amount
 */
export function formatPrice(amount) {
  const value = Number.isFinite(Number(amount)) ? Math.round(Number(amount)) : 0;
  const formatted = String(Math.abs(value)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${value < 0 ? '-' : ''}${formatted} ден.`;
}

/**
 * Пресметка на сумите во кошничката.
 *
 * @param {Array<{product: {price:number}, quantity:number}>} cartItems
 * @param {{delivery_fee?: number, free_delivery_from?: number}} [store]
 */
export function calculateTotals(cartItems, store = {}) {
  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.product.price || 0) * item.quantity,
    0,
  );
  const itemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const baseFee = Number(store.delivery_fee) || 0;
  const freeFrom = Number(store.free_delivery_from) || 0;
  const deliveryFee = subtotal === 0 || (freeFrom > 0 && subtotal >= freeFrom) ? 0 : baseFee;

  return {
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    itemsCount,
  };
}

/**
 * Структурирана текст-порака за нарачката.
 *
 * @param {Array<{product: {name:string, price:number, unit?:string}, quantity:number}>} cartItems
 * @param {{name:string, phone:string, address:string, note?:string}} customerDetails
 * @param {number} totalPrice  вкупен износ (вклучувајќи достава)
 * @param {{storeName?: string, subtotal?: number, deliveryFee?: number}} [options]
 * @returns {string}
 */
export function buildOrderMessage(cartItems, customerDetails, totalPrice, options = {}) {
  const { storeName, subtotal, deliveryFee } = options;
  const lines = [];

  lines.push(storeName ? `🛒 НОВА НАРАЧКА – ${storeName}` : '🛒 НОВА НАРАЧКА');
  lines.push(DIVIDER);

  cartItems.forEach((item, index) => {
    const { product, quantity } = item;
    const lineTotal = Number(product.price || 0) * quantity;
    const unit = product.unit && product.unit !== 'парче' ? ` ${product.unit}` : '';
    lines.push(`${index + 1}. ${product.name}`);
    lines.push(`   ${quantity}${unit} × ${formatPrice(product.price)} = ${formatPrice(lineTotal)}`);
  });

  lines.push(DIVIDER);

  if (typeof subtotal === 'number' && typeof deliveryFee === 'number') {
    lines.push(`Меѓузбир: ${formatPrice(subtotal)}`);
    lines.push(`Достава: ${deliveryFee > 0 ? formatPrice(deliveryFee) : 'бесплатна'}`);
  }
  lines.push(`💰 ВКУПНО: ${formatPrice(totalPrice)}`);

  lines.push('');
  lines.push('👤 ПОДАТОЦИ ЗА КУПУВАЧОТ');
  lines.push(`Име: ${customerDetails.name.trim()}`);
  lines.push(`Телефон: ${formatPhoneDisplay(customerDetails.phone)}`);
  lines.push(`Адреса: ${customerDetails.address.trim()}`);

  if (customerDetails.note && customerDetails.note.trim()) {
    lines.push(`Забелешка: ${customerDetails.note.trim()}`);
  }

  lines.push('');
  lines.push('Испратено преку catalog.mk');

  return lines.join('\n');
}

/**
 * Генерира Viber deep-link што отвора разговор со пополнета порака.
 *   viber://chat?number=3897XXXXXXX&draft=...
 *
 * @param {string} phone   телефон на продавницата (било кој формат)
 * @param {string} message текст на пораката
 * @returns {string}
 * @throws {Error} ако бројот не е валиден
 */
export function buildViberUrl(phone, message) {
  const number = normalizePhone(phone);
  if (!number) {
    throw new Error('Невалиден Viber број на продавницата.');
  }
  return `viber://chat?number=${number}&draft=${encodeURIComponent(message ?? '')}`;
}
