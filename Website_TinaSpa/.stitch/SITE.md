# Project Vision & Constitution

> **AGENT INSTRUCTION:** Đọc file này trước mọi vòng lặp. Đây là bộ nhớ dài hạn của dự án.

## 1. Core Identity
* **Project Name:** Dr Tina Beauty (TinaSpa)
* **Stitch Project ID:** Chưa có — Stitch MCP không khả dụng trong phiên dựng homepage
* **Mission:** Website phòng khám thẩm mỹ: giới thiệu thương hiệu, liệu trình, đội ngũ và đặt lịch
* **Target Audience:** Khách muốn chăm sóc da, trẻ hóa và liệu trình thẩm mỹ y khoa
* **Voice:** Ấm, chuyên môn, gần gũi, đáng tin — tiếng Việt tự nhiên

## 2. Visual Language
* **The "Vibe" (Adjectives):**
    * *Primary:* **Ấm** — hồng phấn, ánh sáng spa
    * *Secondary:* **Tin cậy** — bác sĩ thật, bố cục phòng khám rõ ràng
    * *Tertiary:* **Mềm** — sóng chuyển section, thẻ bo tròn

## 3. Architecture & File Structure
* **App root:** `Website_TinaSpa/app/`
* **Stitch staging:** `.stitch/designs/`
* **Production:** React Router routes (`/`, `/about`) — không dùng `site/public/*.html`
* **Navigation:** Header chung: Trang chủ, Giới thiệu, Dịch vụ, Đội ngũ, Liên hệ, Đặt lịch ngay

## 4. Live Sitemap (Current State)
* [x] `/` (`home`) — Homepage theo mockup: hero, thống kê, dịch vụ, lý do chọn, quy trình, đội ngũ, cảm nhận, CTA, footer
* [ ] `/about` — Giới thiệu phòng khám và bác sĩ

## 5. The Roadmap (Backlog)
### High Priority
- [ ] Trang Giới thiệu (`about`)
- [ ] Trang Dịch vụ chi tiết
- [ ] Form đặt lịch

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
