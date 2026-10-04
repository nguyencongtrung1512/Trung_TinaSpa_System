# Table Design — Product, ProductDetail, ServiceCategory, Service

Tuân thủ `Role.md`: AID là PK `VARCHAR(20)` cùng dạng `YYYYMMDDXXXXXX` (sinh bởi `"generateBusinessID"`), ID là Business ID `VARCHAR(14)`,
3 field language, camelCase, audit trước `note`, `note` luôn cuối, FK tham chiếu AID.

Nguồn nghiệp vụ:

- `Website_TinaSpa/app/features/products/ProductsPage.tsx` → danh sách sản phẩm (card, lọc, sắp xếp).
- `Website_TinaSpa/app/features/products/ProductDetailPage.tsx` → trang chi tiết (gallery, tab Mô tả / Thành phần / Cách dùng / Lưu ý, Công dụng chính).
- `Website_TinaSpa/app/features/services/ServicesPage.tsx` → trang `/services`:
  - Thanh tab lọc nhóm (TẤT CẢ | GÓI COMBO | MANICURE | PEDICURE...) → `ServiceCategory` theo `sortOrder`.
  - Mỗi nhóm là một khối: ảnh lớn xen kẽ trái/phải + tiêu đề nhóm → `ServiceCategory.image`, `name*`; anchor `/services#<slug>`.
  - Mỗi dòng dịch vụ: tên, mô tả 1 dòng (bị cắt `...`), giá `390k`, nút `+` mở mô tả đầy đủ → `Service`.
  - Ô tìm kiếm lọc theo tên, mô tả ngắn và mô tả đầy đủ của ngôn ngữ đang chọn.
- `Website_TinaSpa/app/components/home/Services.tsx` → mục "Dịch vụ nổi bật" trang chủ: icon, tên, mô tả nhóm, "`n` dịch vụ · từ `giá thấp nhất`".
- `Website_TinaSpa/app/features/booking/BookingPage.tsx` → ô "Dịch vụ quan tâm" liệt kê **nhóm dịch vụ** (Khám da tổng quát, Điều trị mụn...)
  → `ServiceCategory` có `isBookable = TRUE`. Khung giờ (08:00 – 10:00...) là cố định, không thuộc Service.
- `Website_TinaSpa/app/features/contact/ContactPage.tsx` → nút "Đặt lịch tại cơ sở này" dẫn về `/booking`.
  Cơ sở (tên, địa chỉ, hotline, email, giờ mở cửa, bản đồ) là bảng `Branch` riêng, chưa thiết kế trong file này.
- UI hiện song ngữ VI/EN → đọc `nameVietnamese` / `nameEnglish`...; `*Cambodia` dành cho ngôn ngữ thứ 3 sau này.

---

## 1. Product

Sản phẩm bán lẻ (serum, kem dưỡng, chống nắng, mặt nạ, dưỡng mắt).

| # | Column | Type | Null | Mô tả |
|---|---|---|---|---|
| 1 | productAID | VARCHAR(20) | PK | Mã dạng YYYYMMDDXXXXXX, DEFAULT `generateBusinessID('Product')` |
| 2 | productID | VARCHAR(14) | NOT NULL, UNIQUE | Business ID, DEFAULT `generateBusinessID('Product')` |
| 3 | nameVietnamese | VARCHAR(255) | NOT NULL | Tên sản phẩm (VD: Luminous Elixir) |
| 4 | nameEnglish | VARCHAR(255) | NULL | |
| 5 | nameCambodia | VARCHAR(255) | NULL | |
| 6 | slug | VARCHAR(150) | NOT NULL, UNIQUE | Đường dẫn `/products/:slug` (VD: `luminous-elixir`) |
| 7 | subtitleVietnamese | VARCHAR(255) | NULL | Dòng phụ (VD: 24K Gold & Active Botanical Serum) |
| 8 | subtitleEnglish | VARCHAR(255) | NULL | |
| 9 | subtitleCambodia | VARCHAR(255) | NULL | |
| 10 | descriptionVietnamese | TEXT | NULL | Mô tả ngắn trên card / đầu trang chi tiết |
| 11 | descriptionEnglish | TEXT | NULL | |
| 12 | descriptionCambodia | TEXT | NULL | |
| 13 | category | VARCHAR(20) | NOT NULL | `SERUM` \| `CREAM` \| `SUNSCREEN` \| `MASK` \| `EYE` |
| 14 | price | NUMERIC(12,0) | NOT NULL | Giá bán (VND), `>= 0` |
| 15 | compareAtPrice | NUMERIC(12,0) | NULL | Giá gốc gạch ngang, `> price` nếu có |
| 16 | image | TEXT | NULL | Ảnh đại diện |
| 17 | imageAlt | VARCHAR(255) | NULL | Alt text ảnh đại diện |
| 18 | badge | VARCHAR(50) | NULL | Nhãn trên ảnh (Bán chạy, Mới...) |
| 19 | volume | VARCHAR(30) | NULL | Dung tích (30ml, 50g...) |
| 20 | status | VARCHAR(20) | NOT NULL, DEFAULT `ACTIVE` | `ACTIVE` \| `INACTIVE` |
| 21 | createdAt | TIMESTAMP | NOT NULL | Dùng cho sắp xếp "Mới nhất" |
| 22 | createdByAID | VARCHAR(20) | NULL | |
| 23 | updatedAt | TIMESTAMP | NOT NULL | |
| 24 | updatedByAID | VARCHAR(20) | NULL | |
| 25 | deletedAt | TIMESTAMP | NULL | Soft delete |
| 26 | note | TEXT | NULL | Luôn cuối |

---

## 2. ProductDetail

Nội dung chi tiết 1–n của Product. Mỗi dòng là một mục trong trang chi tiết, phân loại bằng `detailType`:

| detailType | Hiển thị ở | Field dùng |
|---|---|---|
| `STORY` | Tab "Mô tả" – đoạn văn | content* |
| `HIGHLIGHT` | Tab "Mô tả" – gạch đầu dòng | content* |
| `INGREDIENT` | Tab "Thành phần" | name* |
| `USAGE` | Tab "Cách dùng" – các bước (theo sortOrder) | content* |
| `NOTE` | Tab "Lưu ý" | content* |
| `EFFECT` | Khối "Công dụng chính" | icon, name*, content* |
| `GALLERY` | Ảnh gallery | image, imageAlt |

| # | Column | Type | Null | Mô tả |
|---|---|---|---|---|
| 1 | productDetailAID | VARCHAR(20) | PK | DEFAULT `generateBusinessID('ProductDetail')` |
| 2 | productDetailID | VARCHAR(14) | NOT NULL, UNIQUE | DEFAULT `generateBusinessID('ProductDetail')` |
| 3 | nameVietnamese | VARCHAR(255) | NOT NULL | Tiêu đề mục (EFFECT title, INGREDIENT name...) |
| 4 | nameEnglish | VARCHAR(255) | NULL | |
| 5 | nameCambodia | VARCHAR(255) | NULL | |
| 6 | productAID | VARCHAR(20) | NOT NULL, FK | → `Product.productAID` (ON DELETE CASCADE) |
| 7 | detailType | VARCHAR(20) | NOT NULL | `STORY` \| `HIGHLIGHT` \| `INGREDIENT` \| `USAGE` \| `NOTE` \| `EFFECT` \| `GALLERY` |
| 8 | contentVietnamese | TEXT | NULL | Nội dung |
| 9 | contentEnglish | TEXT | NULL | |
| 10 | contentCambodia | TEXT | NULL | |
| 11 | icon | VARCHAR(50) | NULL | Tên Material icon (EFFECT) |
| 12 | image | TEXT | NULL | Ảnh (GALLERY) |
| 13 | imageAlt | VARCHAR(255) | NULL | |
| 14 | sortOrder | INTEGER | NOT NULL, DEFAULT 0 | Thứ tự trong cùng `detailType` |
| 15 | createdAt | TIMESTAMP | NOT NULL | |
| 16 | createdByAID | VARCHAR(20) | NULL | |
| 17 | updatedAt | TIMESTAMP | NOT NULL | |
| 18 | updatedByAID | VARCHAR(20) | NULL | |
| 19 | note | TEXT | NULL | Luôn cuối |

---

## 3. ServiceCategory

Nhóm dịch vụ. Một dòng phục vụ đồng thời:

| Nơi hiển thị | Field dùng |
|---|---|
| Tab lọc trang `/services` (chữ IN HOA, phân cách `\|`) | name*, sortOrder |
| Khối menu trang `/services`: ảnh lớn + tiêu đề nhóm | image, imageAlt, name*; anchor `#slug` |
| Card "Dịch vụ nổi bật" trang chủ | icon, name*, description*, `isFeatured = TRUE` |
| Ô "Dịch vụ quan tâm" trong form đặt lịch | name*, `isBookable = TRUE` |

| # | Column | Type | Null | Mô tả |
|---|---|---|---|---|
| 1 | serviceCategoryAID | VARCHAR(20) | PK | DEFAULT `generateBusinessID('ServiceCategory')` |
| 2 | serviceCategoryID | VARCHAR(14) | NOT NULL, UNIQUE | DEFAULT `generateBusinessID('ServiceCategory')` |
| 3 | nameVietnamese | VARCHAR(255) | NOT NULL | Tên nhóm (Gói Combo, Manicure, Khám da tổng quát) |
| 4 | nameEnglish | VARCHAR(255) | NULL | (Combo Packages, Manicure, Comprehensive skin exam) |
| 5 | nameCambodia | VARCHAR(255) | NULL | |
| 6 | slug | VARCHAR(50) | NOT NULL, UNIQUE | Khóa lọc / anchor `/services#combo`, chữ thường, `-` |
| 7 | descriptionVietnamese | TEXT | NULL | Mô tả nhóm trên card trang chủ |
| 8 | descriptionEnglish | TEXT | NULL | |
| 9 | descriptionCambodia | TEXT | NULL | |
| 10 | icon | VARCHAR(50) | NULL | Tên Material Symbols (`dermatology`, `spa`...) |
| 11 | image | TEXT | NULL | Ảnh lớn của khối menu |
| 12 | imageAlt | VARCHAR(255) | NULL | |
| 13 | isFeatured | BOOLEAN | NOT NULL, DEFAULT FALSE | Hiện ở mục "Dịch vụ nổi bật" trang chủ |
| 14 | isBookable | BOOLEAN | NOT NULL, DEFAULT TRUE | Hiện trong ô "Dịch vụ quan tâm" của form đặt lịch |
| 15 | sortOrder | INTEGER | NOT NULL, DEFAULT 0 | Thứ tự tab lọc / khối menu / card |
| 16 | status | VARCHAR(20) | NOT NULL, DEFAULT `ACTIVE` | `ACTIVE` \| `INACTIVE` |
| 17 | createdAt | TIMESTAMP | NOT NULL | |
| 18 | createdByAID | VARCHAR(20) | NULL | |
| 19 | updatedAt | TIMESTAMP | NOT NULL | |
| 20 | updatedByAID | VARCHAR(20) | NULL | |
| 21 | deletedAt | TIMESTAMP | NULL | Soft delete |
| 22 | note | TEXT | NULL | Luôn cuối |

---

## 4. Service

Một dòng trong khối menu trang `/services`: **tên** (Perfectly Polished), **mô tả ngắn** 1 dòng
(Làm móng tay sắc (Mani hoặc Pedi)...), **giá** (`390k`), nút `+` mở **mô tả đầy đủ**.
Tiêu đề và ảnh của khối lấy từ `ServiceCategory` qua `serviceCategoryAID`.

| UI | Column |
|---|---|
| Tên dịch vụ (đậm, đổi màu khi mở) | name* |
| Dòng mô tả bị cắt `...`, mở rộng khi bấm `+` | shortDescription* |
| Đoạn văn trong panel khi bấm `+` | description* |
| Giá `390k`, `1.290k` | price (`price / 1000` + `k`, phân cách nghìn kiểu vi-VN) |
| "`n` dịch vụ · từ `giá`" trên card trang chủ | `COUNT(*)`, `MIN(price)` theo `serviceCategoryAID` |
| Ô tìm kiếm | name*, shortDescription*, description* theo ngôn ngữ đang chọn (`ILIKE`) |

| # | Column | Type | Null | Mô tả |
|---|---|---|---|---|
| 1 | serviceAID | VARCHAR(20) | PK | DEFAULT `generateBusinessID('Service')` |
| 2 | serviceID | VARCHAR(14) | NOT NULL, UNIQUE | DEFAULT `generateBusinessID('Service')` |
| 3 | nameVietnamese | VARCHAR(255) | NOT NULL | Tên dịch vụ (Perfectly Polished) |
| 4 | nameEnglish | VARCHAR(255) | NULL | |
| 5 | nameCambodia | VARCHAR(255) | NULL | |
| 6 | serviceCategoryAID | VARCHAR(20) | NOT NULL, FK | → `ServiceCategory.serviceCategoryAID` (ON DELETE RESTRICT) |
| 7 | slug | VARCHAR(150) | NOT NULL, UNIQUE | Khóa dịch vụ (`perfectly-polished`), dùng cho link đặt lịch `/booking?service=` |
| 8 | shortDescriptionVietnamese | VARCHAR(500) | NULL | Mô tả 1 dòng dưới tên |
| 9 | shortDescriptionEnglish | VARCHAR(500) | NULL | |
| 10 | shortDescriptionCambodia | VARCHAR(500) | NULL | |
| 11 | descriptionVietnamese | TEXT | NULL | Mô tả đầy đủ khi bấm `+` |
| 12 | descriptionEnglish | TEXT | NULL | |
| 13 | descriptionCambodia | TEXT | NULL | |
| 14 | price | NUMERIC(12,0) | NOT NULL | Giá (VND), `390k` = 390000, `>= 0` |
| 15 | durationMinutes | INTEGER | NULL | Thời lượng (phút), `> 0` |
| 16 | image | TEXT | NULL | Ảnh riêng; NULL → dùng `ServiceCategory.image` |
| 17 | imageAlt | VARCHAR(255) | NULL | |
| 18 | isBookable | BOOLEAN | NOT NULL, DEFAULT TRUE | Cho phép chọn khi đặt lịch theo dịch vụ cụ thể |
| 19 | sortOrder | INTEGER | NOT NULL, DEFAULT 0 | Thứ tự trong nhóm |
| 20 | status | VARCHAR(20) | NOT NULL, DEFAULT `ACTIVE` | `ACTIVE` \| `INACTIVE` |
| 21 | createdAt | TIMESTAMP | NOT NULL | |
| 22 | createdByAID | VARCHAR(20) | NULL | |
| 23 | updatedAt | TIMESTAMP | NOT NULL | |
| 24 | updatedByAID | VARCHAR(20) | NULL | |
| 25 | deletedAt | TIMESTAMP | NULL | Soft delete |
| 26 | note | TEXT | NULL | Luôn cuối |

Quy tắc hiển thị:

- Chỉ lấy dòng `status = 'ACTIVE' AND deletedAt IS NULL` (cả Service và ServiceCategory).
- Nhóm không còn Service ACTIVE vẫn có thể hiện trong form đặt lịch (VD: Khám da tổng quát, Tư vấn liệu trình), nhưng ẩn khỏi trang `/services`.
- API trả `serviceID` / `serviceCategoryID` + `slug`, không trả AID.

---

## 5. Relationship

```text
Product
├── productAID   PK
├── productID    UNIQUE
└── ProductDetail (1 - n)
      └── productAID FK → Product.productAID

ServiceCategory
├── serviceCategoryAID   PK
├── serviceCategoryID    UNIQUE
└── Service (1 - n)
      ├── serviceCategoryAID FK → ServiceCategory.serviceCategoryAID (RESTRICT)
      └── (sau này) Appointment.serviceAID FK → Service.serviceAID (NULL được)

(sau này) Appointment
├── serviceCategoryAID FK → ServiceCategory.serviceCategoryAID  ← ô "Dịch vụ quan tâm"
├── serviceAID         FK → Service.serviceAID (NULL)           ← khi đặt từ một dịch vụ cụ thể
└── branchAID          FK → Branch.branchAID                    ← "Đặt lịch tại cơ sở này" (trang Liên hệ)
```

---

## 6. SQL (PostgreSQL)

```sql
CREATE TABLE "Product" (
    "productAID" VARCHAR(20) PRIMARY KEY DEFAULT "generateBusinessID"('Product'),
    "productID" VARCHAR(14) NOT NULL DEFAULT "generateBusinessID"('Product'),

    "nameVietnamese" VARCHAR(255) NOT NULL,
    "nameEnglish" VARCHAR(255),
    "nameCambodia" VARCHAR(255),

    "slug" VARCHAR(150) NOT NULL,
    "subtitleVietnamese" VARCHAR(255),
    "subtitleEnglish" VARCHAR(255),
    "subtitleCambodia" VARCHAR(255),
    "descriptionVietnamese" TEXT,
    "descriptionEnglish" TEXT,
    "descriptionCambodia" TEXT,
    "category" VARCHAR(20) NOT NULL,
    "price" NUMERIC(12,0) NOT NULL,
    "compareAtPrice" NUMERIC(12,0),
    "image" TEXT,
    "imageAlt" VARCHAR(255),
    "badge" VARCHAR(50),
    "volume" VARCHAR(30),
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',

    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByAID" VARCHAR(20),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedByAID" VARCHAR(20),
    "deletedAt" TIMESTAMP,

    "note" TEXT,

    CONSTRAINT "UQ_Product_productID" UNIQUE ("productID"),
    CONSTRAINT "UQ_Product_slug" UNIQUE ("slug"),
    CONSTRAINT "CK_Product_category" CHECK ("category" IN ('SERUM', 'CREAM', 'SUNSCREEN', 'MASK', 'EYE')),
    CONSTRAINT "CK_Product_status" CHECK ("status" IN ('ACTIVE', 'INACTIVE')),
    CONSTRAINT "CK_Product_price" CHECK ("price" >= 0),
    CONSTRAINT "CK_Product_compareAtPrice" CHECK ("compareAtPrice" IS NULL OR "compareAtPrice" > "price")
);

CREATE INDEX "IX_Product_category" ON "Product" ("category");
CREATE INDEX "IX_Product_status" ON "Product" ("status");

CREATE TABLE "ProductDetail" (
    "productDetailAID" VARCHAR(20) PRIMARY KEY DEFAULT "generateBusinessID"('ProductDetail'),
    "productDetailID" VARCHAR(14) NOT NULL DEFAULT "generateBusinessID"('ProductDetail'),

    "nameVietnamese" VARCHAR(255) NOT NULL,
    "nameEnglish" VARCHAR(255),
    "nameCambodia" VARCHAR(255),

    "productAID" VARCHAR(20) NOT NULL,
    "detailType" VARCHAR(20) NOT NULL,
    "contentVietnamese" TEXT,
    "contentEnglish" TEXT,
    "contentCambodia" TEXT,
    "icon" VARCHAR(50),
    "image" TEXT,
    "imageAlt" VARCHAR(255),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByAID" VARCHAR(20),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedByAID" VARCHAR(20),

    "note" TEXT,

    CONSTRAINT "UQ_ProductDetail_productDetailID" UNIQUE ("productDetailID"),
    CONSTRAINT "FK_ProductDetail_productAID" FOREIGN KEY ("productAID")
        REFERENCES "Product" ("productAID") ON DELETE CASCADE,
    CONSTRAINT "CK_ProductDetail_detailType" CHECK (
        "detailType" IN ('STORY', 'HIGHLIGHT', 'INGREDIENT', 'USAGE', 'NOTE', 'EFFECT', 'GALLERY')
    )
);

CREATE INDEX "IX_ProductDetail_productAID_detailType" ON "ProductDetail" ("productAID", "detailType", "sortOrder");

CREATE TABLE "ServiceCategory" (
    "serviceCategoryAID" VARCHAR(20) PRIMARY KEY DEFAULT "generateBusinessID"('ServiceCategory'),
    "serviceCategoryID" VARCHAR(14) NOT NULL DEFAULT "generateBusinessID"('ServiceCategory'),

    "nameVietnamese" VARCHAR(255) NOT NULL,
    "nameEnglish" VARCHAR(255),
    "nameCambodia" VARCHAR(255),

    "slug" VARCHAR(50) NOT NULL,
    "descriptionVietnamese" TEXT,
    "descriptionEnglish" TEXT,
    "descriptionCambodia" TEXT,
    "icon" VARCHAR(50),
    "image" TEXT,
    "imageAlt" VARCHAR(255),
    "isFeatured" BOOLEAN NOT NULL DEFAULT FALSE,
    "isBookable" BOOLEAN NOT NULL DEFAULT TRUE,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',

    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByAID" VARCHAR(20),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedByAID" VARCHAR(20),
    "deletedAt" TIMESTAMP,

    "note" TEXT,

    CONSTRAINT "UQ_ServiceCategory_serviceCategoryID" UNIQUE ("serviceCategoryID"),
    CONSTRAINT "UQ_ServiceCategory_slug" UNIQUE ("slug"),
    CONSTRAINT "CK_ServiceCategory_status" CHECK ("status" IN ('ACTIVE', 'INACTIVE'))
);

CREATE INDEX "IX_ServiceCategory_status_sortOrder" ON "ServiceCategory" ("status", "sortOrder");

CREATE TABLE "Service" (
    "serviceAID" VARCHAR(20) PRIMARY KEY DEFAULT "generateBusinessID"('Service'),
    "serviceID" VARCHAR(14) NOT NULL DEFAULT "generateBusinessID"('Service'),

    "nameVietnamese" VARCHAR(255) NOT NULL,
    "nameEnglish" VARCHAR(255),
    "nameCambodia" VARCHAR(255),

    "serviceCategoryAID" VARCHAR(20) NOT NULL,
    "slug" VARCHAR(150) NOT NULL,
    "shortDescriptionVietnamese" VARCHAR(500),
    "shortDescriptionEnglish" VARCHAR(500),
    "shortDescriptionCambodia" VARCHAR(500),
    "descriptionVietnamese" TEXT,
    "descriptionEnglish" TEXT,
    "descriptionCambodia" TEXT,
    "price" NUMERIC(12,0) NOT NULL,
    "durationMinutes" INTEGER,
    "image" TEXT,
    "imageAlt" VARCHAR(255),
    "isBookable" BOOLEAN NOT NULL DEFAULT TRUE,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',

    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByAID" VARCHAR(20),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedByAID" VARCHAR(20),
    "deletedAt" TIMESTAMP,

    "note" TEXT,

    CONSTRAINT "UQ_Service_serviceID" UNIQUE ("serviceID"),
    CONSTRAINT "UQ_Service_slug" UNIQUE ("slug"),
    CONSTRAINT "FK_Service_serviceCategoryAID" FOREIGN KEY ("serviceCategoryAID")
        REFERENCES "ServiceCategory" ("serviceCategoryAID") ON DELETE RESTRICT,
    CONSTRAINT "CK_Service_status" CHECK ("status" IN ('ACTIVE', 'INACTIVE')),
    CONSTRAINT "CK_Service_price" CHECK ("price" >= 0),
    CONSTRAINT "CK_Service_durationMinutes" CHECK ("durationMinutes" IS NULL OR "durationMinutes" > 0)
);

CREATE INDEX "IX_Service_serviceCategoryAID_sortOrder" ON "Service" ("serviceCategoryAID", "sortOrder");
CREATE INDEX "IX_Service_status" ON "Service" ("status");
```

---

## 7. Prisma Schema

```prisma
/// category: SERUM | CREAM | SUNSCREEN | MASK | EYE (CHECK "CK_Product_category")
/// status: ACTIVE | INACTIVE (CHECK "CK_Product_status")
model Product {
  productAID            String    @id @default(dbgenerated("\"generateBusinessID\"('Product'::text)")) @db.VarChar(20)
  productID             String    @unique(map: "UQ_Product_productID") @default(dbgenerated("\"generateBusinessID\"('Product'::text)")) @db.VarChar(14)

  nameVietnamese        String    @db.VarChar(255)
  nameEnglish           String?   @db.VarChar(255)
  nameCambodia          String?   @db.VarChar(255)

  slug                  String    @unique(map: "UQ_Product_slug") @db.VarChar(150)
  subtitleVietnamese    String?   @db.VarChar(255)
  subtitleEnglish       String?   @db.VarChar(255)
  subtitleCambodia      String?   @db.VarChar(255)
  descriptionVietnamese String?
  descriptionEnglish    String?
  descriptionCambodia   String?
  category              String    @db.VarChar(20)
  price                 Decimal   @db.Decimal(12, 0)
  compareAtPrice        Decimal?  @db.Decimal(12, 0)
  image                 String?
  imageAlt              String?   @db.VarChar(255)
  badge                 String?   @db.VarChar(50)
  volume                String?   @db.VarChar(30)
  rating                Decimal   @default(0) @db.Decimal(2, 1)
  reviewCount           Int       @default(0)
  stockQuantity         Int       @default(0)
  sortOrder             Int       @default(0)
  status                String    @default("ACTIVE") @db.VarChar(20)

  createdAt             DateTime  @default(now())
  createdByAID          String?   @db.VarChar(20)
  updatedAt             DateTime  @default(now()) @updatedAt
  updatedByAID          String?   @db.VarChar(20)
  deletedAt             DateTime?

  note                  String?

  productDetails ProductDetail[]

  @@index([category], map: "IX_Product_category")
  @@index([status], map: "IX_Product_status")
}

/// detailType: STORY | HIGHLIGHT | INGREDIENT | USAGE | NOTE | EFFECT | GALLERY (CHECK "CK_ProductDetail_detailType")
model ProductDetail {
  productDetailAID  String   @id @default(dbgenerated("\"generateBusinessID\"('ProductDetail'::text)")) @db.VarChar(20)
  productDetailID   String   @unique(map: "UQ_ProductDetail_productDetailID") @default(dbgenerated("\"generateBusinessID\"('ProductDetail'::text)")) @db.VarChar(14)

  nameVietnamese    String   @db.VarChar(255)
  nameEnglish       String?  @db.VarChar(255)
  nameCambodia      String?  @db.VarChar(255)

  productAID        String   @db.VarChar(20)
  detailType        String   @db.VarChar(20)
  contentVietnamese String?
  contentEnglish    String?
  contentCambodia   String?
  icon              String?  @db.VarChar(50)
  image             String?
  imageAlt          String?  @db.VarChar(255)
  sortOrder         Int      @default(0)

  createdAt         DateTime @default(now())
  createdByAID      String?  @db.VarChar(20)
  updatedAt         DateTime @default(now()) @updatedAt
  updatedByAID      String?  @db.VarChar(20)

  note              String?

  product Product @relation(fields: [productAID], references: [productAID], onDelete: Cascade, map: "FK_ProductDetail_productAID")

  @@index([productAID, detailType, sortOrder], map: "IX_ProductDetail_productAID_detailType")
}

/// status: ACTIVE | INACTIVE (CHECK "CK_ServiceCategory_status")
model ServiceCategory {
  serviceCategoryAID    String    @id @default(dbgenerated("\"generateBusinessID\"('ServiceCategory'::text)")) @db.VarChar(20)
  serviceCategoryID     String    @unique(map: "UQ_ServiceCategory_serviceCategoryID") @default(dbgenerated("\"generateBusinessID\"('ServiceCategory'::text)")) @db.VarChar(14)

  nameVietnamese        String    @db.VarChar(255)
  nameEnglish           String?   @db.VarChar(255)
  nameCambodia          String?   @db.VarChar(255)

  slug                  String    @unique(map: "UQ_ServiceCategory_slug") @db.VarChar(50)
  descriptionVietnamese String?
  descriptionEnglish    String?
  descriptionCambodia   String?
  icon                  String?   @db.VarChar(50)
  image                 String?
  imageAlt              String?   @db.VarChar(255)
  isFeatured            Boolean   @default(false)
  isBookable            Boolean   @default(true)
  sortOrder             Int       @default(0)
  status                String    @default("ACTIVE") @db.VarChar(20)

  createdAt             DateTime  @default(now())
  createdByAID          String?   @db.VarChar(20)
  updatedAt             DateTime  @default(now()) @updatedAt
  updatedByAID          String?   @db.VarChar(20)
  deletedAt             DateTime?

  note                  String?

  services Service[]

  @@index([status, sortOrder], map: "IX_ServiceCategory_status_sortOrder")
}

/// status: ACTIVE | INACTIVE (CHECK "CK_Service_status")
model Service {
  serviceAID                 String    @id @default(dbgenerated("\"generateBusinessID\"('Service'::text)")) @db.VarChar(20)
  serviceID                  String    @unique(map: "UQ_Service_serviceID") @default(dbgenerated("\"generateBusinessID\"('Service'::text)")) @db.VarChar(14)

  nameVietnamese             String    @db.VarChar(255)
  nameEnglish                String?   @db.VarChar(255)
  nameCambodia               String?   @db.VarChar(255)

  serviceCategoryAID         String    @db.VarChar(20)
  slug                       String    @unique(map: "UQ_Service_slug") @db.VarChar(150)
  shortDescriptionVietnamese String?   @db.VarChar(500)
  shortDescriptionEnglish    String?   @db.VarChar(500)
  shortDescriptionCambodia   String?   @db.VarChar(500)
  descriptionVietnamese      String?
  descriptionEnglish         String?
  descriptionCambodia        String?
  price                      Decimal   @db.Decimal(12, 0)
  durationMinutes            Int?
  image                      String?
  imageAlt                   String?   @db.VarChar(255)
  isBookable                 Boolean   @default(true)
  sortOrder                  Int       @default(0)
  status                     String    @default("ACTIVE") @db.VarChar(20)

  createdAt                  DateTime  @default(now())
  createdByAID               String?   @db.VarChar(20)
  updatedAt                  DateTime  @default(now()) @updatedAt
  updatedByAID               String?   @db.VarChar(20)
  deletedAt                  DateTime?

  note                       String?

  serviceCategory ServiceCategory @relation(fields: [serviceCategoryAID], references: [serviceCategoryAID], onDelete: Restrict, map: "FK_Service_serviceCategoryAID")

  @@index([serviceCategoryAID, sortOrder], map: "IX_Service_serviceCategoryAID_sortOrder")
  @@index([status], map: "IX_Service_status")
}
```

---

## 8. Dữ liệu mẫu (theo UI hiện tại)

Nguồn: `Website_TinaSpa/app/data/home.ts` + `app/i18n/locales/{vi,en}.ts` (`services`, `serviceMenus`).

```sql
INSERT INTO "ServiceCategory"
    ("nameVietnamese", "nameEnglish", "slug", "icon", "image", "isFeatured", "isBookable", "sortOrder")
VALUES
    ('Khám da tổng quát', 'Comprehensive skin exam', 'skin-exam', 'dermatology', NULL, TRUE, TRUE, 1),
    ('Điều trị mụn', 'Acne treatment', 'acne', 'face_retouching_natural', NULL, TRUE, TRUE, 2),
    ('Trẻ hóa da', 'Skin rejuvenation', 'rejuvenation', 'spa', NULL, TRUE, TRUE, 3),
    ('Laser thẩm mỹ', 'Aesthetic laser', 'laser', 'wb_iridescent', NULL, TRUE, TRUE, 4),
    ('Chăm sóc body', 'Body care', 'body', 'self_improvement', NULL, TRUE, TRUE, 5),
    ('Tư vấn liệu trình', 'Treatment consultation', 'consult', 'favorite', NULL, TRUE, TRUE, 6),
    ('Gói Combo', 'Combo Packages', 'combo', NULL, '/images/p1.png', FALSE, TRUE, 7),
    ('Manicure', 'Manicure', 'manicure', NULL, '/images/p4.png', FALSE, TRUE, 8),
    ('Pedicure', 'Pedicure', 'pedicure', NULL, '/images/p2.png', FALSE, TRUE, 9);

INSERT INTO "Service"
    ("nameVietnamese", "nameEnglish", "serviceCategoryAID", "slug",
     "shortDescriptionVietnamese", "shortDescriptionEnglish", "price", "sortOrder")
SELECT v."name", v."name", c."serviceCategoryAID", v."slug", v."shortVi", v."shortEn", v."price", v."sortOrder"
FROM (VALUES
    ('combo', 'perfectly-polished', 'Perfectly Polished',
        'Làm móng tay sắc (Mani hoặc Pedi) kèm dưỡng da tay chuyên sâu',
        'Manicure or pedicure with intensive hand care', 390000, 1),
    ('combo', 'glow-relax', 'Glow & Relax',
        'Chăm sóc da mặt cơ bản kết hợp massage cổ vai gáy',
        'Basic facial combined with a neck and shoulder massage', 590000, 2),
    ('combo', 'hand-foot-ritual', 'Hand & Foot Ritual',
        'Combo Mani + Pedi sơn gel, ngâm thảo mộc thư giãn',
        'Gel mani + pedi combo with a relaxing herbal soak', 650000, 3),
    ('combo', 'bridal-beauty-day', 'Bridal Beauty Day',
        'Gói làm đẹp trọn ngày cho cô dâu trước lễ cưới',
        'A full beauty day for brides before the wedding', 1290000, 4),
    ('manicure', 'classic-manicure', 'Classic Manicure',
        'Làm mới màu sắc (Mani hoặc Pedi), cắt da và tạo form móng',
        'Fresh color (mani or pedi), cuticle care and nail shaping', 190000, 1),
    ('manicure', 'gel-polish', 'Gel Polish',
        'Sơn gel bền màu, bóng đẹp đến 4 tuần',
        'Long-lasting, glossy gel polish for up to 4 weeks', 290000, 2)
) AS v("category", "slug", "name", "shortVi", "shortEn", "price", "sortOrder")
JOIN "ServiceCategory" c ON c."slug" = v."category";
```

Các dịch vụ còn lại (French Tip 350k, Nail Art 420k, Nail Repair 250k, Paraffin Hand Care 220k,
Spa Pedicure 250k, Gel Pedicure 350k, Callus Treatment 280k, Detox Foot Ritual 390k) nhập cùng cách,
mô tả lấy từ `serviceMenus.<nhóm>.items.<dịch vụ>` trong locale.

---

## 9. API (module `src/service-catalog`)

Prefix `/api`. Công khai chỉ trả dòng `ACTIVE`, chưa xóa. Quản trị yêu cầu JWT role `ADMIN` hoặc `MANAGER`.
Response không bao giờ có AID; `price` trả về dạng number.

| Method | Path | Quyền | Mô tả |
|---|---|---|---|
| GET | `/service-categories?featured=&bookable=&includeServices=` | Công khai | Danh sách nhóm + `serviceCount`, `minPrice` |
| GET | `/service-categories/:slug` | Công khai | 1 nhóm kèm dịch vụ (khối menu `/services#slug`) |
| GET | `/services?category=&search=&bookable=` | Công khai | Danh sách dịch vụ, tìm trên mọi field ngôn ngữ |
| GET | `/services/:slug` | Công khai | Chi tiết 1 dịch vụ + nhóm |
| GET | `/service-categories/manage?status=` | ADMIN, MANAGER | Gồm cả `INACTIVE`, thêm `note`, `createdAt`, `updatedAt` |
| GET | `/service-categories/manage/:serviceCategoryID` | ADMIN, MANAGER | |
| POST | `/service-categories` | ADMIN, MANAGER | 409 nếu trùng `slug` |
| PATCH | `/service-categories/:serviceCategoryID` | ADMIN, MANAGER | Gửi field cần đổi; `null` để xóa giá trị field tùy chọn |
| DELETE | `/service-categories/:serviceCategoryID` | ADMIN, MANAGER | Soft delete; 409 nếu còn dịch vụ |
| GET | `/services/manage?category=&search=&status=&bookable=` | ADMIN, MANAGER | |
| GET | `/services/manage/:serviceID` | ADMIN, MANAGER | |
| POST | `/services` | ADMIN, MANAGER | Body dùng `serviceCategoryID` (Business ID) |
| PATCH | `/services/:serviceID` | ADMIN, MANAGER | |
| DELETE | `/services/:serviceID` | ADMIN, MANAGER | Soft delete |

Seed: `npx prisma db seed` thêm 9 nhóm + 14 dịch vụ theo UI (bỏ qua slug đã tồn tại).

---

## 10. Checklist

```text
[x] Có <tableName>AID, là PRIMARY KEY VARCHAR(20), mã YYYYMMDDXXXXXX
[x] Có <tableName>ID, NOT NULL, UNIQUE, format YYYYMMDDXXXXXX (generateBusinessID)
[x] Không có generic id / uuid / code
[x] Có nameVietnamese, nameEnglish, nameCambodia
[x] Có createdAt, updatedAt (+ createdByAID, updatedByAID)
[x] FK ProductDetail.productAID → Product.productAID
[x] FK Service.serviceCategoryAID → ServiceCategory.serviceCategoryAID (RESTRICT)
[x] slug UNIQUE cho Product, ServiceCategory, Service
[x] Naming camelCase, status UPPERCASE
[x] deletedAt (nếu có) đứng trước note
[x] note là field cuối
[x] Prisma giữ nguyên database naming
```
