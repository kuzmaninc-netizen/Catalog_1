/**
 * Демо податоци: npm run seed
 *   Најава: demo@catalog.mk / demo1234
 *   Каталог: http://localhost:5173/pekara-zito
 */
import { openDatabase } from './db.js';
import { createServices } from './services/index.js';
import { normalizePhone } from './utils/phone.js';

const db = openDatabase();
const services = createServices(db);

const DEMO_EMAIL = 'demo@catalog.mk';
const existing = db.prepare('SELECT store_id FROM users WHERE email = ?').get(DEMO_EMAIL);
if (existing) {
  console.log('Демо продавницата веќе постои. Најава: demo@catalog.mk / demo1234');
  process.exit(0);
}

const session = services.auth.register({
  store_name: 'Пекара Жито',
  slug: 'pekara-zito',
  phone: normalizePhone('070 123 456'),
  name: 'Демо Сопственик',
  email: DEMO_EMAIL,
  password: 'demo1234',
});
const storeId = session.store.id;

services.stores.updateStore(storeId, {
  description: 'Свежо печиво секое утро. Достава низ Карпош и Центар.',
  address: 'ул. Партизанска бр. 12',
  city: 'Скопје',
  working_hours: 'Пон–Саб 06:00–21:00',
  delivery_fee: 100,
  free_delivery_from: 1000,
  min_order: 300,
});

const img = (seed) => `https://picsum.photos/seed/${seed}/600/600`;
const products = [
  ['Бел леб 500г', 'Секојдневен бел леб, печен утрово.', 45, 'bread-white', 'Леб', 'парче', true],
  ['Интегрален леб', 'Со семки од сончоглед и лен.', 70, 'bread-whole', 'Леб', 'парче', true],
  ['Багет', 'Хрскав француски багет.', 55, 'baguette', 'Леб', 'парче', true],
  ['Бурек со сирење', 'Традиционален бурек, порција 300г.', 120, 'burek', 'Пециво', 'парче', true],
  ['Кроасан со чоколадо', 'Путер тесто и белгиско чоколадо.', 80, 'croissant', 'Пециво', 'парче', true],
  ['Ѓеврек', 'Со сусам, свеж од фурна.', 30, 'simit', 'Пециво', 'парче', false],
  ['Торта Шварцвалд', 'Цела торта за 10–12 лица.', 1450, 'cake-black', 'Слатко', 'парче', true],
  ['Баклава', 'Домашна баклава со ореви.', 650, 'baklava', 'Слатко', 'кг', true],
];

products.forEach(([name, description, price, seed, category, unit, inStock], i) => {
  services.products.create(storeId, {
    name,
    description,
    price,
    image_url: img(seed),
    category,
    unit,
    in_stock: inStock,
    is_active: true,
    sort_order: i + 1,
  });
});

console.log('✔ Демо податоците се внесени.');
console.log('  Каталог: http://localhost:5173/pekara-zito');
console.log('  Админ:   http://localhost:5173/admin  (demo@catalog.mk / demo1234)');
db.close();
