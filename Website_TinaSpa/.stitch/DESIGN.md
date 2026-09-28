# Design System: Dr Tina Beauty
**Project ID:** Chưa kết nối Stitch MCP — hệ thống lấy từ mockup homepage đã cung cấp.

## 1. Visual Theme & Atmosphere
Giao diện phòng khám thẩm mỹ ấm, sáng và tin cậy. Nền hồng phấn thoáng, nhiều khoảng thở, cảm giác spa y khoa hơn là bệnh viện lạnh. Mật độ trung bình: hero rộng, lưới thẻ đều, chuyển section bằng sóng mềm.

## 2. Color Palette & Roles
- **Blush Canvas** (#FFF7FA) — Nền trang, không khí spa
- **Rose Mist** (#FDE8F0) — Nền hero, stats, process, CTA
- **Pure Surface** (#FFFFFF) — Header, thẻ, footer
- **Petal Ink** (#4A2035) — Tiêu đề, chữ chính
- **Muted Rose** (#8A6573) — Mô tả, metadata
- **Clinic Rose** (#E11D74) — CTA, logo, icon, trạng thái active
- **Rose Soft** (#F8C3D6) — Viền nhẹ, vòng icon
- **Whisper Shadow** (rgba(225, 29, 116, 0.08)) — Đổ bóng hồng rất nhẹ

## 3. Typography Rules
- **Display / Body:** Plus Jakarta Sans — tiêu đề extra-bold, tracking hơi chặt; thân bài regular/medium, leading thoáng
- **Icons:** Material Symbols Outlined, nét mảnh, màu Clinic Rose, đặt trong vòng tròn Rose Soft
- **Một màu nhấn duy nhất:** Clinic Rose (#E11D74). Cụm chữ nhấn, số thứ tự, icon và nút dùng đúng mã này. Không thêm hồng thứ hai, không dùng script/serif để tạo cảm giác đổi màu
- Không dùng Inter. Không dùng chữ đen thuần `#000000`

## 4. Component Stylings
- **Buttons:** Dạng viên thuốc (`rounded-full`). Primary: nền Clinic Rose, chữ trắng, bóng hồng nhẹ. Outline: viền Clinic Rose, chữ Clinic Rose, nền trong suốt
- **Cards:** Góc bo rộng (~1.25rem–1.5rem), nền trắng, bóng hồng thì thầm, hover nâng nhẹ bằng `translateY`
- **Icon wells:** Hình tròn nền Rose Soft / Rose Mist, icon Clinic Rose ở giữa
- **Inputs (tương lai):** Label phía trên, focus ring Clinic Rose

## 5. Layout Principles
- Desktop-first, cột nội dung tối đa ~1152px, căn giữa
- Hero tách 2 cột: copy trái, chân dung bác sĩ trong khung tròn phải
- Chuyển section bằng dải sóng SVG, không dùng đường kẻ cứng
- Dưới 768px: mọi lưới đổ 1 cột, menu hamburger, ảnh hero thu nhỏ dưới copy

## 6. Design System Notes for Stitch Generation
**Copy this block into every baton prompt:**

**DESIGN SYSTEM (REQUIRED):**
- Platform: Web, Desktop-first
- Theme: Light, warm medical-spa, blush and clinical trust
- Background: Blush Canvas (#FFF7FA)
- Section wash: Rose Mist (#FDE8F0)
- Surface: Pure Surface (#FFFFFF)
- Primary Accent: Clinic Rose (#E11D74) for buttons, links, icons
- Text Primary: Petal Ink (#4A2035)
- Text Secondary: Muted Rose (#8A6573)
- Font: Plus Jakarta Sans only, extra-bold headlines, relaxed body
- Single accent: Clinic Rose (#E11D74) for buttons, links, icons, and emphasized words. No second pink
- Buttons: Pill-shaped, rose fill or rose outline
- Cards: Generously rounded, whisper rose shadows
- Layout: Centered max-width container, wave dividers between sections
- No harsh black, no neon glow, no cold hospital blue
