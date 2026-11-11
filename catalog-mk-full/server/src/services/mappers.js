import { formatPhoneDisplay, normalizePhone } from '../utils/phone.js';

const phoneInfo = (value) => {
  const international = normalizePhone(value);
  return international
    ? { international, display: formatPhoneDisplay(international), tel: `tel:+${international}` }
    : null;
};

/** Продавница → јавен формат (за каталогот). */
export function toPublicStore(row) {
  const phone = phoneInfo(row.phone);
  const viber = phoneInfo(row.viber_phone) ?? phone;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    logo_url: row.logo_url || null,
    address: row.address,
    city: row.city,
    working_hours: row.working_hours,
    currency: 'MKD',
    currency_label: 'ден.',
    delivery_fee: row.delivery_fee,
    free_delivery_from: row.free_delivery_from,
    min_order: row.min_order,
    phone: phone?.international ?? '',
    phone_display: phone?.display ?? '',
    phone_tel: phone?.tel ?? '',
    viber_phone: viber?.international ?? '',
    viber_phone_display: viber?.display ?? '',
  };
}

/** Продавница → формат за админ панел (ги содржи и суровите полиња). */
export function toAdminStore(row) {
  return {
    ...toPublicStore(row),
    raw_viber_phone: row.viber_phone || '',
    is_active: Boolean(row.is_active),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function toPublicProduct(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    image_url: row.image_url || null,
    category: row.category || 'Останато',
    unit: row.unit || 'парче',
    in_stock: Boolean(row.in_stock),
    sort_order: row.sort_order,
  };
}

export function toAdminProduct(row) {
  return {
    ...toPublicProduct(row),
    category: row.category,
    is_active: Boolean(row.is_active),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function toOrder(row) {
  let items = [];
  try {
    items = JSON.parse(row.items_json);
  } catch {
    items = [];
  }
  return {
    id: row.id,
    order_number: row.order_number,
    customer: {
      name: row.customer_name,
      phone: row.customer_phone,
      phone_display: formatPhoneDisplay(row.customer_phone),
      address: row.customer_address,
      note: row.note,
    },
    items,
    subtotal: row.subtotal,
    delivery_fee: row.delivery_fee,
    total: row.total,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function toUser(row) {
  return { id: row.id, email: row.email, name: row.name, store_id: row.store_id };
}
