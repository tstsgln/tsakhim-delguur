# tsetseglen.mn — Сайжруулах / нэмэх зүйлсийн жагсаалт

> Codebase-д хийсэн шинжилгээний үндсэн дээр гаргав (2026-05-29). ✅ = кодоос шууд баталгаажуулсан.
> Effort: S (бага) / M (дунд) / L (их).

## 🟢 Хурдан хожил (өндөр үр өгөөж, бага хүчин чармайлт)

- [x] **1. Зургийн оптимизаци асаах** ✅ — `next.config.ts`-аас `unoptimized: true` устгав. Тест: 108KB JPEG → 14KB WebP (87% бага). sharp суусан. localhost дээр баталгаажсан. — **S** ✓ ДУУССАН
- [x] **2. SEO** — `robots.ts` + `sitemap.ts` (динамик: бараа+дэлгүүр), root layout-д metadataBase/title template/OG/Twitter, product & store-д `generateMetadata` (title/desc/canonical/OG), product-д JSON-LD Product schema (rating, offers). `lib/site.ts` нэмэв. tsc цэвэр, localhost дээр баталгаажсан. — **M** ✓ ДУУССАН
- [x] **3. Admin email-г env рүү** ✅ — `ADMIN_EMAILS` (таслалаар, олон админ). Тохируулаагүй бол хуучин email-руу fallback (prod эвдрэхгүй). — **S** ✓ ДУУССАН
- [x] **4. `/help` хуудас + About form** — `/help` Тусламжийн төв (FAQ, `<details>`) үүсгэв; About-ийн холбоо барих form-г `mailto:`-руу холбов (нэвтрээгүй зочид ч ашиглана). — **S** ✓ ДУУССАН

## 🔒 Аюулгүй байдал

- [ ] **5. Authorization-г data layer-т суулгах** — `getOrder()`, `listLedgerForUser()`, `listMessages()`, `markConversationRead()` эзэмшил шалгадаггүй; зөвхөн page layer дээр шалгадаг тул эмзэг. `getOrderForBuyer(id, userId)` маягийн query руу. — **M**
- [ ] **6. Login/signup rate limit** — brute-force / спам боломжтой. — **S-M**

## 🧪 Найдвартай байдал

- [ ] **7. Тест нэмэх** — мөнгө/захиалга/ledger логик хамгийн эрсдэлтэй, vitest. — **M**
- [ ] **8. Бүтээгдэхүүн soft-delete** — hard-delete захиалгын түүх SET NULL болгож, зургийн файл орхино. `deleted_at` нэмэх. — **M**
- [ ] **9. Имэйл алдааг лог хийх** — fire-and-forget; Resend амжилтгүй бол чимээгүй алдагдана. — **S**

## 🛒 Feature / UX

- [ ] **10. Төлбөрийн урсгалыг тодорхой болгох** — checkout яаж төлөхийг хэлдэггүй (банк/данс/QR). — **S**
- [ ] **11. Pagination** — `/products` бүх барааг нэг дор ачаална. — **S-M**
- [ ] **12. Favorites-г DB-д хадгалах** — одоо localStorage-д л, sync хийгддэггүй. — **M**
- [ ] **13. Борлуулагчийн итгэлийн тэмдэг** — listing дээр rating / verified badge. — **M**

---

## Тэмдэглэл
- ❗ AGENTS.md: "Энэ бол чиний мэдэх Next.js биш." Код бичихээсээ өмнө `node_modules/next/dist/docs/`-г унш.
- ✅ Шалгасан: checkout-ийн stock decrement нь race condition **биш** (атомар `UPDATE ... WHERE stock_quantity >= ?` + синхрон `db.transaction`). Овердрафт/oversell гарахгүй.
- Ажлын дэг: visual өөрчлөлтийг эхлээд localhost дээр үзүүлж, зөвшөөрөл авсны дараа deploy.
