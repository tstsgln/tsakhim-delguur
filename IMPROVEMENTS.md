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
- [x] **12. Favorites (hybrid DB + localStorage)** — урьд нь огт хэрэгжээгүй (placeholder + ажилладаггүй ♡). `favorites` хүснэгт (schema v19); зочид → localStorage, нэвтэрсэн → DB + төхөөрөмж хооронд sync; нэвтрэхэд localStorage-ийн дуртайг DB-д нэгтгэнэ. ProductCard ба ProductDetail-д ♡ товч (бараа луу орохгүйгээр хадгална); Header-т dropdown menu + "хараагүй" badge (dropdown нээхэд арилна). `products-db.test.ts`-д favorites тестүүд (25 тест). — **M** ✓ ДУУССАН
- [x] **13. Борлуулагчийн trust badge** — `getSellerStats` (дундаж rating, үнэлгээний тоо, дууссан борлуулалт); `SellerTrustBadge` компонент (★ rating, 📦 борлуулалт, ⭐ Шилдэг борлуулагч, 🌱 Шинэ дэлгүүр); store ба product detail-д харуулна. "Made by"→"Худалдагч". `products-db.test.ts`-д 2 тест. — **M** ✓ ДУУССАН

---

## 🌼 Etsy-гээс санаа авсан (хуулбар биш, Монголд тааруулсан) — 2026-06-02

- [x] **14. "Танд таалагдаж магадгүй" / Холбоотой бараа** — Барааны хуудсанд "{Дэлгүүр}-ийн бусад бараа" (шинэ) + "Төстэй бүтээгдэхүүн" хэсэг. `getRelatedProducts` + `getMoreFromSeller` (LIMIT-тэй үр ашигтай SQL, өмнө `getAllProducts()`-г бүхэлд нь ачаалдаг байсныг солив). Schema өөрчлөлтгүй. tsc цэвэр, localhost-д 200. — **S** ✓ ДУУССАН
- [x] **15. Бэлгийн горим** — Checkout-д "🎁 Бэлэг болгож авч байна" checkbox + нөхцөлт захидлын талбар (max 500). `orders`-д `is_gift`, `gift_message` (schema v20). Борлуулагчийн захиалгад ягаан "Энэ бол бэлэг" блок + захидал; худалдан авагчийн хуудсанд тэмдэглэгээ. `orders-db.test.ts`-д 2 тест (trim, бэлэг биш бол захидал хадгалахгүй). tsc + 27 тест цэвэр. — **S** ✓ ДУУССАН
- [x] **16. Зурагтай үнэлгээ** — `review_images` хүснэгт (schema v21); худалдан авагч үнэлгээндээ 4 хүртэл зураг хавсаргана; барааны хуудсанд thumbnail (дарвал шинэ табд нээгдэнэ). Зураг upload логикийг `lib/uploads.ts` дундын helper (`validateImageFile`/`saveImageFile`) болгож гаргаад seller.ts-ийн давхардлыг цэвэрлэв; review-д хадгалалт нь tx-тэй, амжилтгүй бол файлыг буцаан устгана; акаунт устгахад review зургийг ч цэвэрлэнэ. `reviews-db.test.ts` 3 тест. tsc + 30 тест цэвэр. — **S-M** ✓ ДУУССАН
- [x] **17. Сүүлд үзсэн бараа** — `lib/recently-viewed.ts` (localStorage, бүтэн Product snapshot, dedupe, 12 cap — guest favorites-ийн загвараар, серверийн дуудлагагүй); `RecentlyViewed` client компонент (record + excludeId + хоосон бол null); барааны хуудсанд (одоогийнхийг хасна) + нүүрэнд "Таны сүүлд үзсэн". `recently-viewed.test.ts` 4 тест (дараалал/dedupe/cap/malformed). tsc + build + 34 тест цэвэр. — **S-M** ✓ ДУУССАН
- [x] **18. Жинхэнэ ангилал + шүүлтүүр (faceted browse)** — Нүүрэнд "Ангилалаар үзэх" tile grid (зөвхөн бараатай ангилал, тоогоор эрэмбэлсэн, `getCategoryCounts`). `/products`-д ажилладаг **байршлын шүүлтүүр** нэмж, ажиллахгүй "Үнэгүй хүргэлт" checkbox-ыг (dead UI) сольсон. Ангилал/үнэ/эрэмбэ sidebar өмнө нь байсан. tsc + build + 34 тест цэвэр. — **M** ✓ ДУУССАН
- [x] **19. Урчны түүх — "Гар урчинтай танилц"** — `sellers`-д `story` + `banner_path` (schema v22). Дэлгүүрийн dashboard-д урчны түүхийн textarea + banner upload (хуучин banner-ийг солиход устгана, uploads.ts helper); дэлгүүрийн хуудсанд banner зураг дээд талд + "🌱 Гар урчинтай танилц" түүхийн хэсэг. Акаунт устгахад banner цэвэрлэнэ. tsc + build + 34 тест цэвэр. ⏸️ Workshop зургийн галерей (#19b) дараа. — **M** ✓ ДУУССАН
- [ ] **20. Дэлгүүрийн хямдрал / купон** — Хувь хямдрал эсвэл "₮X-аас дээш үнэгүй хүргэлт". Конверс түлхэх. (`coupons` / `product.sale_price`). — **M**
- [ ] **21. Худалдагчийн статистик (Shop Stats)** — Dashboard-д барааны үзэлт, favorites тоо, конверс. Seller-ийг буцааж ирүүлэх. (үзэлт логлох `product_views` хэрэгтэй). — **M**
- [ ] **22. Бүтээгдэхүүний хувилбар + захиалгаар хийх** — Нэг listing дотор хэмжээ/өнгө/материал сонголт + хувийн бичвэр ("Энд нэр бичих"). `accept_custom_orders` талбар аль хэдийн байгаа. Гар урлалд хамгийн чухал. — **M-L**

## Тэмдэглэл
- ❗ AGENTS.md: "Энэ бол чиний мэдэх Next.js биш." Код бичихээсээ өмнө `node_modules/next/dist/docs/`-г унш.
- ✅ Шалгасан: checkout-ийн stock decrement нь race condition **биш** (атомар `UPDATE ... WHERE stock_quantity >= ?` + синхрон `db.transaction`). Овердрафт/oversell гарахгүй.
- Ажлын дэг: visual өөрчлөлтийг эхлээд localhost дээр үзүүлж, зөвшөөрөл авсны дараа deploy.
