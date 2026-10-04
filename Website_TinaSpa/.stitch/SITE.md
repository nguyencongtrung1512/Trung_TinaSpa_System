# Project Vision & Constitution

> **AGENT INSTRUCTION:** Đọc file này trước mọi vòng lặp. Đây là bộ nhớ dài hạn của dự án.

## 1. Core Identity
* **Project Name:** Dr Tina Beauty (TinaSpa)
* **Mission:** Website phòng khám thẩm mỹ: giới thiệu thương hiệu, liệu trình, đội ngũ và đặt lịch
* **Target Audience:** Khách muốn chăm sóc da, trẻ hóa và liệu trình thẩm mỹ y khoa
* **Voice:** Ấm, chuyên môn, gần gũi, đáng tin — tiếng Việt tự nhiên
* **Languages:** Song ngữ Tiếng Việt (mặc định) / English, chuyển bằng nút VI/EN trên header và trang đăng nhập

## 2. Visual Language
* **The "Vibe" (Adjectives):**
    * *Primary:* **Ấm** — hồng phấn, ánh sáng spa
    * *Secondary:* **Tin cậy** — bác sĩ thật, bố cục phòng khám rõ ràng
    * *Tertiary:* **Mềm** — sóng chuyển section, thẻ bo tròn

## 3. Architecture & File Structure
* **App root:** `Website_TinaSpa/app/`
* **Stitch staging:** `.stitch/designs/`
* **Production:** React Router routes (`/`, `/about`, `/products`, `/booking`) — không dùng `site/public/*.html`
* **Navigation:** Header chung: Trang chủ, Giới thiệu, Dịch vụ, Đội ngũ, Liên hệ, Đặt lịch ngay
* **i18n:** i18next + react-i18next. Cấu hình ở `app/i18n/index.ts`. Toàn bộ câu chữ nằm trong `app/i18n/locales/vi.ts` và `en.ts` (`en` có kiểu `typeof vi`, nên thiếu key là lỗi TypeScript). File `app/data/*` chỉ chứa dữ liệu không phải chữ (id, ảnh, giá, icon); chữ được ghép vào theo id qua hook. Quy tắc chống giật layout: xem `DESIGN.md` mục 6 và `skill/i18n.md`

## 4. Live Sitemap (Current State)
* [x] `/` (`home`) — Homepage theo mockup: hero, thống kê, dịch vụ, lý do chọn, quy trình, đội ngũ, cảm nhận, CTA, footer
* [x] `/about` — Giới thiệu giá trị cốt lõi của phòng khám
* [x] `/products` — Catalog sản phẩm p1–p6: lọc nhóm, tìm kiếm, sắp xếp, giá
* [x] `/products/:productId` — Chi tiết sản phẩm: gallery, mô tả, thành phần, cách dùng, sản phẩm đi kèm
* [x] `/booking` — Form đặt lịch hẹn

## 5. The Roadmap (Backlog)
### High Priority
- [ ] Trang Dịch vụ chi tiết (`services`)

### Medium Priority
- [ ] Trang Đội ngũ
- [ ] Trang Liên hệ

## 6. Creative Freedom Guidelines
1. Giữ đúng hệ hồng phấn + Clinic Rose
2. Dùng ảnh có sẵn: `public/images/logo.png`, `image 1.png`, `screen.png`, `screen1.png`
3. Tên file route: chữ thường, mô tả rõ

### Ideas to Explore
- [ ] `services` — catalog liệu trình
- [ ] `booking` — đặt lịch hẹn
- [ ] `team` — hồ sơ chuyên môn

## 7. Rules of Engagement
1. Không dựng lại trang đã có trong Section 4
2. Luôn cập nhật `next-prompt.md` trước khi kết thúc vòng
3. Khi dùng ý tưởng ở Section 6 thì xóa ý đó khỏi danh sách
4. Ưu tiên tích hợp React Router, không xuất HTML tĩnh song song
5. Mọi trang công khai mới phải song ngữ: không viết chữ cứng trong JSX, thêm key vào cả `vi.ts` và `en.ts`, dùng `StableText` cho chữ trên nút/tab/nav, và kiểm tra cả hai ngôn ngữ không bị giật layout
