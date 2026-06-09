# Цэцэглэн — Мобайл API (v1)

Native Android (дараа нь iOS) аппад зориулсан HTTP API. Вэбийн `lib/*-db.ts`
функцууд дээр тулгуурлана — бизнес логик дахин бичигдэхгүй. Вэбсайт өөрөө
server action + cookie session-оо хэвээр ашиглана; энэ API нь зэрэгцэн ажиллана.

## Auth загвар
- **JWT Bearer token.** Вэбийн session-той ижил jose HS256 + `SESSION_SECRET`.
- Login/signup → token-ийг **хариуны биед** буцаана (cookie биш).
- Хамгаалалттай endpoint → `Authorization: Bearer <token>` header.
- Token задлах: `lib/api-auth.ts` → `getApiUser(req)`.
- Logout нь stateless — апп token-оо устгана (сервер талд хийх зүйлгүй).

## Хариуны хэлбэр
- Амжилт: нөөцийн JSON шууд, эсвэл `{ token, user }`.
- Алдаа: `{ error: "мессеж" }` + тохирох HTTP статус (400/401/403/404/429).

## Endpoint-ийн зурагл（прогресс）

### Auth — `/api/v1/auth/*`
- [x] `POST /signup` — {name,email,password} → бүртгэл + баталгаажуулах имэйл → `{ ok }`
- [x] `POST /login` — {email,password} → `{ token, user }`
- [x] `GET  /me` — Bearer → `{ user }`
- [ ] `POST /resend-verification` — баталгаажуулах имэйл дахин
- [ ] `POST /account/delete` — нууц үгээр баталгаажуулж акаунт устгах

### Бараа — `/api/v1/products/*`  (lib/products-db.ts)
- [x] `GET /products` — жагсаалт + хайлт + шүүлт (category, location, price, sort) + pagination
- [x] `GET /products/:id` — дэлгэрэнгүй (зураг, хувилбар, persionalization)
- [x] `GET /products/:id/related` — төстэй + дэлгүүрийн бусад
- [x] `GET /categories` — ангилал + тоо
- [x] `POST /products/:id/view` — үзэлт нэмэх

### Дуртай — `/api/v1/favorites/*`
- [x] `GET /favorites` · `POST /favorites/:id` · `DELETE /favorites/:id`

### Сагс/Захиалга — `/api/v1/orders/*`  (lib/orders-db.ts)
- [x] `POST /checkout` — сагснаас захиалга үүсгэх (pickup, gift, personalization)
- [x] `GET /orders` — худалдан авагчийн захиалга
- [x] `GET /orders/:id` — дэлгэрэнгүй (эзэмшил шалгана)
- [x] `POST /orders/:id/confirm-received` — хүлээж авсан (escrow release)
- [x] `POST /orders/:id/cancel` — цуцлах
- [x] `GET /balance` — баланс + ledger

### Үнэлгээ — `/api/v1/reviews/*`
- [ ] `POST /products/:id/reviews` — үнэлгээ + зураг

### Чат — `/api/v1/chat/*`  (lib/chat-db.ts)
- [ ] `GET /conversations` · `GET /conversations/:id` · `POST /conversations/:id/messages` · unread

### Мэдэгдэл — `/api/v1/notifications/*`
- [ ] `GET /notifications` · `POST /notifications/read` · `GET /notifications/unread`

### Борлуулагч — `/api/v1/seller/*`  (lib/seller, products-db)
- [ ] `GET /seller/dashboard` · `GET /seller/stats` · бараа CRUD/архив · `GET /seller/orders` ·
      захиалгын төлөв (markPaid/Shipped) · payout · дэлгүүрийн түүх/banner

### Бусад
- [ ] `POST /feedback` — санал/холбоо барих

> Админ самбар (orders/payouts/feedback/email-log) **вэб дээр л үлдэнэ** — апп-д орохгүй.

## Үе шатууд
- **Үе 0** (одоо): API суурь + JWT auth + auth endpoint-ууд ← хийгдэж байна
- Үе 1: Android skeleton + нэвтрэлт + бараа үзэх
- Үе 2: дэлгэрэнгүй + сагс + checkout
- Үе 3: захиалга, дуртай, үнэлгээ, чат, мэдэгдэл
- Үе 4: борлуулагчийн самбар
- Үе 5: өнгөлгөө → Play Store
