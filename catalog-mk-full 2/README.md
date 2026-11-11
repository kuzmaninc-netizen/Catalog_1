# catalog.mk

Онлајн каталог за локални продавници со брза нарачка преку Viber.
**React + Tailwind** фронтенд, **Node.js + Express** бекенд и **SQLite** база.

## Што содржи

**За купувачите** (`/:slug`, пр. `/pekara-zito`)
- Каталог со категории, пребарување и кошничка.
- Нарачка во 2 чекори без регистрација: име, мобилен, адреса.
- Нарачката прво се зачувува во базата и добива број, па се отвора Viber со готова порака.

**За продавниците** (`/admin`)
- Регистрација и најава.
- **Нарачки**: статистика, филтри и статуси (нова → потврдена → доставена / откажана), со автоматско освежување.
- **Производи**: додавање, уредување и бришење, прикачување слики, залиха, видливост и категории.
- **Поставки**: лого, линк, Viber број, адреса, работно време, достава, минимална нарачка и промена на лозинка.

## Барања

- **Node.js 22.13 или понова** (препорачано Node 24 LTS). SQLite е вграден во Node, па не треба посебен сервер за база.

## Стартување (развој)

```bash
npm run install:all          # инсталира server/ и client/
cp server/.env.example server/.env
npm run seed                 # демо продавница
npm run dev                  # API на :4000 + фронтенд на :5173
```

- Каталог: http://localhost:5173/pekara-zito
- Админ: http://localhost:5173/admin (`demo@catalog.mk` / `demo1234`)

## Продукција

```bash
npm run install:all
npm run build                # client/dist
NODE_ENV=production JWT_SECRET="<долг-случаен-текст>" npm start
```

Express ги сервира и API-то и фронтендот на една порта (стандардно 4000).
Ставете го зад Nginx/Caddy со HTTPS. Резервна копија: папката `server/data/` (базата) и `server/uploads/` (сликите).

Сервери што одговараат: VPS (Hetzner, DigitalOcean), Render или Railway со **постојан диск**,
бидејќи базата и сликите се фајлови.

## Објавување: Netlify (фронтенд) + Render (бекенд)

Netlify е само за статички сајтови и не може да работи со Express и SQLite.
Затоа бекендот оди на Render, а Netlify ги проследува `/api` и `/uploads` до него.

**1. Бекенд на Render**
1. Ставете го проектот на GitHub.
2. Render → **New → Blueprint** → изберете го репозиториумот (`render.yaml` е подготвен).
3. По објавувањето, копирајте ја адресата, пр. `https://catalog-mk-api.onrender.com`.
4. Проверка: `https://…onrender.com/api/health` треба да врати `{"ok":true,…}`.
5. (Опционално) демо податоци: Render → Shell → `npm run seed`.

**2. Поврзете ги**: во `client/public/_redirects` заменете ја `https://catalog-mk-api.onrender.com` со вашата адреса.

**3. Фронтенд на Netlify**
- **Преку GitHub (препорачано):** Netlify → Add new site → Import from Git. Поставките ги чита од `netlify.toml` (base `client`, publish `dist`).
- **Рачно (drag & drop):** `npm run build --prefix client`, па повлечете ја **папката `client/dist`** (не целиот проект) на Netlify.

## Структура

```
catalog-mk/
├── package.json             # npm run dev / build / start / seed
├── scripts/dev.mjs          # ги стартува server + client заедно
├── server/
│   ├── .env.example
│   └── src/
│       ├── index.js         # стартување на серверот
│       ├── app.js           # Express: рути, статички фајлови, SPA
│       ├── config.js
│       ├── db.js            # SQLite шема (stores, users, products, orders)
│       ├── seed.js          # демо податоци
│       ├── auth/            # scrypt лозинки, JWT токени
│       ├── middleware/      # auth, rate limit, upload, грешки
│       ├── routes/          # public.js, auth.js, admin.js
│       ├── services/        # бизнис логика + мапирање
│       └── utils/           # phone, slug, validate, http
└── client/
    ├── public/              # logo-circle.png (мобилен), logo-wordmark.png (десктоп)
    └── src/
        ├── api/             # http.js, storeApi.js, adminApi.js
        ├── context/         # AuthContext, CartContext
        ├── components/      # Header, ProductCard, CheckoutSheet, CartBar, admin/…
        ├── pages/           # Landing, Storefront, admin/{Login,Register,Orders,Products,Settings}
        └── utils/           # orderMessage.js (Viber), format.js, storage.js
```

## API

| Метод | Патека | Опис |
|---|---|---|
| GET | `/api/public/stores/:slug` | Продавница + активни производи (`publicStore`) |
| POST | `/api/public/stores/:slug/orders` | Нова нарачка (цените ги пресметува серверот) |
| POST | `/api/auth/register` | Нова продавница + сопственик |
| POST | `/api/auth/login` | Најава → JWT токен |
| GET | `/api/auth/me` | Тековен корисник и продавница |
| POST | `/api/auth/change-password` | Промена на лозинка |
| GET/PUT | `/api/admin/store` | Поставки на продавницата |
| POST | `/api/admin/uploads` | Прикачување слика (поле `image`, макс. 5 MB) |
| GET/POST | `/api/admin/products` | Листа / нов производ |
| PUT/DELETE | `/api/admin/products/:id` | Уредување / бришење |
| GET | `/api/admin/orders?status=&limit=&offset=` | Нарачки |
| PATCH | `/api/admin/orders/:id` | Статус на нарачка |
| GET | `/api/admin/stats` | Статистика |

Сите одговори имаат форма `{ ok: true, data }` или `{ ok: false, error: { code, message, details? } }`.

## Безбедност

- Лозинките се хешираат со scrypt, а најавата користи JWT (HS256) со рок на важење.
- Секоја продавница гледа и менува само свои производи и нарачки.
- Цените и доставата при нарачка се пресметуваат од базата, не од прелистувачот.
- Има rate limit на најава, регистрација и нарачки.
- Прикачените фајлови мора да бидат вистински слики (JPG/PNG/WEBP/GIF, макс. 5 MB).

## Viber

`buildViberUrl('070 123 456', порака)` → `viber://chat?number=38970123456&draft=…`

Viber линкот работи само на уреди каде што Viber е инсталиран. Затоа по нарачката купувачот
ја гледа пораката и може да ја копира. Ако некоја верзија на Viber не го препознае бројот,
во `client/src/utils/orderMessage.js` сменете `number=${number}` во `number=%2B${number}`.
