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

## 6. Song ngữ VI/EN & chống giật layout
Website hỗ trợ tiếng Việt (mặc định) và tiếng Anh. Câu chữ hai ngôn ngữ dài ngắn khác nhau, nên mọi khối chữ có thể đẩy phần tử khác đi đều phải **giữ cố định kích thước theo bản dài nhất**. Nhờ vậy khi bấm VI/EN, không nút, tab hay đoạn văn nào bị nhảy.
- **Kỹ thuật:** component `StableText` (`app/components/ui/StableText.tsx`) render mọi bản dịch chồng lên nhau trong cùng một ô grid. Chỉ bản đang dùng hiển thị, các bản còn lại `invisible` (cũng bị ẩn khỏi trình đọc màn hình).
  - Mặc định (inline): giữ **chiều rộng** lớn nhất. Dùng cho nút, link điều hướng, tab, chip lọc, nhãn cạnh control.
  - `block`: giữ **chiều cao** lớn nhất. Dùng cho tiêu đề và đoạn văn nằm phía trên nút hoặc nội dung quan trọng (hero, đầu trang, thẻ kết quả, thông tin cơ sở).
  - `align`: `start` | `center` | `end`, theo căn lề của khối chứa.
- **Select / input có giá trị là chữ:** đặt chiều rộng cố định (vd. `w-40`, `w-44`) đủ cho bản dài nhất.
- **Không cần cố định:** văn bản dài cuối section (mô tả sản phẩm, nội dung tab chi tiết), alt ảnh, `aria-label`, meta title. Những chỗ này dùng `t()` bình thường.
- **Thiết kế mới:** chừa chỗ cho bản tiếng Anh/Việt dài hơn khoảng 30%. Không đặt nút có chữ vào khung có chiều rộng cứng quá sát chữ.

## 7. Design System Notes for Stitch Generation
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
- Bilingual VI/EN: header has a VI/EN pill switcher; buttons, nav, tabs and chips keep a fixed width sized for the longest language; headings and paragraphs above controls reserve the height of the longest language so switching never shifts layout
