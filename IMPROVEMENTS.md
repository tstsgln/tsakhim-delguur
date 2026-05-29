# tsetseglen.mn — Сайжруулах / нэмэх зүйлсийн жагсаалт

> Codebase-д хийсэн шинжилгээний үндсэн дээр гаргав (2026-05-29). ✅ = кодоос шууд баталгаажуулсан.
> Effort: S (бага) / M (дунд) / L (их).

## 🟢 Хурдан хожил (өндөр үр өгөөж, бага хүчин чармайлт)

- [x] **1. Зургийн оптимизаци асаах** ✅ — `next.config.ts`-аас `unoptimized: true` устгав. Тест: 108KB JPEG → 14KB WebP (87% бага). sharp суусан. localhost дээр баталгаажсан. — **S** ✓ ДУУССАН
- [x] **2. SEO** — `robots.ts` + `sitemap.ts` (динамик: бараа+дэлгүүр), root layout-д metadataBase/title template/OG/Twitter, product & store-д `generateMetadata` (title/desc/canonical/OG), product-д JSON-LD Product schema (rating, offers). `lib/site.ts` нэмэв. tsc цэвэр, localhost дээр баталгаажсан. — **M** ✓ ДУУССАН
- [x] **3. Admin email-г env рүү** ✅ — `ADMIN_EMAILS` (таслалаар, олон админ). Тохируулаагүй бол хуучин email-руу fallback (prod эвдрэхгүй). — **S** ✓ ДУУССАН
- [x] **4. `/help` хуудас + About form** — `/help` Тусламжийн төв (FAQ, `<details>`) үүсгэв; About-ийн холбоо барих form-г `mailto:`-руу холбов (нэвтрээгүй зочид ч ашиглана). — **S** ✓ ДУУССАН

## 🔒 Аюулгүй байдал

- [x] **5. Authorization data layer-т (defense-in-depth)** — шалгахад order/balance/messages call site бүгд аль хэдийн зөв authorize хийдэг (идэвхтэй нүх биш). `listMessages`/`markConversationRead`-д membership guard-ийг SQL-д суулгав (гишүүн биш бол хоосон/өөрчлөхгүй). — **M** ✓ ДУУССАН
- [x] **6. Rate limiting** — `lib/rate-limit.ts` (in-memory, single PM2 process). login 15/15мин, signup 6/цаг, resend 10/цаг — IP-ээр. Логик бие даан тест хийсэн. — **S-M** ✓ ДУУССАН

## 🧪 Найдвартай байдал

- [x] **7. Тест нэмэх** — vitest суулгав; `orders-db.test.ts` 12 тест (commission бүхэл тоо, stock decrement/restore, escrow release балланс+ledger, markPaid/Shipped эрх+төлөв, payout request/complete/reject). `db.ts` нь `SQLITE_DB_PATH` env уншдаг болов (тест :memory: ашиглана). `npm test`. — **M** ✓ ДУУССАН
- [x] **8. Бүтээгдэхүүн архивлах (soft-delete)** — `archived_at` багана (schema v18); архивласан бараа бүх buyer-facing query-ээс (listing/detail/store/search/counts/sitemap) хасагдана; seller dashboard-д архивлах/сэргээх товч + шошго; захиалгын түүх (order_items snapshot) хөндөгдөхгүй. Урьд нь устгах функц огт байгаагүй. `products-db.test.ts` 3 тест. — **M** ✓ ДУУССАН
- [x] **9. Имэйл алдааг лог хийх** — `failed_emails` хүснэгт (schema v17); `sendEmail` алдааг төвлөрүүлж бичээд re-throw; бүх имэйлд context (signup/resend/new-order); admin самбарт "Илгээгдээгүй имэйл" хэсэг + "Шийдсэн" товч; `email-log.test.ts` 4 тест. — **S** ✓ ДУУССАН

## 🛒 Feature / UX

- [ ] **10. Төлбөрийн урсгалыг тодорхой болгох** — checkout яаж төлөхийг хэлдэггүй. ⏸️ **ХОЙШЛУУЛСАН** — qPay merchant авсны дараа qPay интеграцитай хамт хийнэ. — **S→M**
- [x] **11. Pagination** — `/products`-д numbered pagination (24/хуудас, client-side, шүүлт өөрчлөгдөхөд reset, ellipsis цонх, scroll-to-top). PAGE_SIZE=3 түр тохируулж localhost дээр баталгаажсан. ⚠️ Тэмдэглэл: client-side тул бүх бараа одоо ч client руу дамждаг — каталог олон мянга болоход server-side pagination руу шилжих хэрэгтэй. — **S-M** ✓ ДУУССАН
- [ ] **12. Favorites-г DB-д хадгалах** — одоо localStorage-д л, sync хийгддэггүй. — **M**
- [ ] **13. Борлуулагчийн итгэлийн тэмдэг** — listing дээр rating / verified badge. — **M**

---

## Тэмдэглэл
- ❗ AGENTS.md: "Энэ бол чиний мэдэх Next.js биш." Код бичихээсээ өмнө `node_modules/next/dist/docs/`-г унш.
- ✅ Шалгасан: checkout-ийн stock decrement нь race condition **биш** (атомар `UPDATE ... WHERE stock_quantity >= ?` + синхрон `db.transaction`). Овердрафт/oversell гарахгүй.
- Ажлын дэг: visual өөрчлөлтийг эхлээд localhost дээр үзүүлж, зөвшөөрөл авсны дараа deploy.
