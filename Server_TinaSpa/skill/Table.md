# Table Design — Product, ProductDetail, Service

Tuân thủ `Role.md`: AID là PK, ID là Business ID (`YYYYMMDDXXXXXX`, sinh bởi `"generateBusinessID"`),
3 field language, camelCase, audit trước `note`, `note` luôn cuối, FK tham chiếu AID.

Nguồn nghiệp vụ:

- `Website_TinaSpa/app/features/products/ProductsPage.tsx` → danh sách sản phẩm (card, lọc, sắp xếp).
- `Website_TinaSpa/app/features/products/ProductDetailPage.tsx` → trang chi tiết (gallery, tab Mô tả / Thành phần / Cách dùng / Lưu ý, Công dụng chính).
- Ảnh "Combo Package" → dịch vụ: tên, mô tả ngắn (1 dòng), giá, nút `+` mở chi tiết, ảnh đại diện nhóm.
- `Website_TinaSpa/app/features/booking/BookingPage.tsx` → ô "Dịch vụ quan tâm" lấy từ `Service` (sau này `Appointment.serviceAID`).

---

## 1. Product

Sản phẩm bán lẻ (serum, kem dưỡng, chống nắng, mặt nạ, dưỡng mắt).

| # | Column | Type | Null | Mô tả |
|---|---|---|---|---|
| 1 | productAID | BIGSERIAL | PK | Khóa kỹ thuật |
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
| 22 | createdByAID | BIGINT | NULL | |
| 23 | updatedAt | TIMESTAMP | NOT NULL | |
| 24 | updatedByAID | BIGINT | NULL | |
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
| 1 | productDetailAID | BIGSERIAL | PK | |
| 2 | productDetailID | VARCHAR(14) | NOT NULL, UNIQUE | DEFAULT `generateBusinessID('ProductDetail')` |
| 3 | nameVietnamese | VARCHAR(255) | NOT NULL | Tiêu đề mục (EFFECT title, INGREDIENT name...) |
| 4 | nameEnglish | VARCHAR(255) | NULL | |
| 5 | nameCambodia | VARCHAR(255) | NULL | |
| 6 | productAID | BIGINT | NOT NULL, FK | → `Product.productAID` (ON DELETE CASCADE) |
| 7 | detailType | VARCHAR(20) | NOT NULL | `STORY` \| `HIGHLIGHT` \| `INGREDIENT` \| `USAGE` \| `NOTE` \| `EFFECT` \| `GALLERY` |
| 8 | contentVietnamese | TEXT | NULL | Nội dung |
| 9 | contentEnglish | TEXT | NULL | |
| 10 | contentCambodia | TEXT | NULL | |
| 11 | icon | VARCHAR(50) | NULL | Tên Material icon (EFFECT) |
| 12 | image | TEXT | NULL | Ảnh (GALLERY) |
| 13 | imageAlt | VARCHAR(255) | NULL | |
| 14 | sortOrder | INTEGER | NOT NULL, DEFAULT 0 | Thứ tự trong cùng `detailType` |
| 15 | createdAt | TIMESTAMP | NOT NULL | |
| 16 | createdByAID | BIGINT | NULL | |
| 17 | updatedAt | TIMESTAMP | NOT NULL | |
| 18 | updatedByAID | BIGINT | NULL | |
| 19 | note | TEXT | NULL | Luôn cuối |

---

## 3. Service

Dịch vụ spa như ảnh "Combo Package": mỗi dòng gồm **tên** (Perfectly Polished), **mô tả ngắn** 1 dòng
(Làm móng tay sắc (Mani hoặc Pedi...)), **giá** (390k), nút `+` mở **mô tả đầy đủ**; tiêu đề nhóm
("Combo Package") và ảnh bên trái lấy theo `category`.

| # | Column | Type | Null | Mô tả |
|---|---|---|---|---|
| 1 | serviceAID | BIGSERIAL | PK | |
| 2 | serviceID | VARCHAR(14) | NOT NULL, UNIQUE | DEFAULT `generateBusinessID('Service')` |
| 3 | nameVietnamese | VARCHAR(255) | NOT NULL | Tên dịch vụ (Perfectly Polished) |
| 4 | nameEnglish | VARCHAR(255) | NULL | |
| 5 | nameCambodia | VARCHAR(255) | NULL | |
| 6 | category | VARCHAR(30) | NOT NULL | Nhóm dịch vụ, UPPERCASE: `COMBO_PACKAGE`, `NAIL`, `SKIN_CARE`, `BODY_CARE`, `HAIR`... |
| 7 | shortDescriptionVietnamese | VARCHAR(500) | NULL | Mô tả 1 dòng dưới tên (bị cắt "...") |
| 8 | shortDescriptionEnglish | VARCHAR(500) | NULL | |
| 9 | shortDescriptionCambodia | VARCHAR(500) | NULL | |
| 10 | descriptionVietnamese | TEXT | NULL | Mô tả đầy đủ khi bấm `+` |
| 11 | descriptionEnglish | TEXT | NULL | |
| 12 | descriptionCambodia | TEXT | NULL | |
| 13 | price | NUMERIC(12,0) | NOT NULL | Giá (VND), hiển thị `390k` = 390000, `>= 0` |
| 14 | durationMinutes | INTEGER | NULL | Thời lượng dịch vụ (phút), `> 0` |
| 15 | image | TEXT | NULL | Ảnh dịch vụ / ảnh nhóm |
| 16 | imageAlt | VARCHAR(255) | NULL | |
| 17 | isBookable | BOOLEAN | NOT NULL, DEFAULT TRUE | Hiện trong ô "Dịch vụ quan tâm" của form đặt lịch |
| 18 | sortOrder | INTEGER | NOT NULL, DEFAULT 0 | Thứ tự trong nhóm |
| 19 | status | VARCHAR(20) | NOT NULL, DEFAULT `ACTIVE` | `ACTIVE` \| `INACTIVE` |
| 20 | createdAt | TIMESTAMP | NOT NULL | |
| 21 | createdByAID | BIGINT | NULL | |
| 22 | updatedAt | TIMESTAMP | NOT NULL | |
| 23 | updatedByAID | BIGINT | NULL | |
| 24 | deletedAt | TIMESTAMP | NULL | Soft delete |
| 25 | note | TEXT | NULL | Luôn cuối |

---

## 4. Relationship

```text
Product
├── productAID   PK
├── productID    UNIQUE
└── ProductDetail (1 - n)
      └── productAID FK → Product.productAID

Service
├── serviceAID   PK
├── serviceID    UNIQUE
└── (sau này) Appointment.serviceAID FK → Service.serviceAID
```

---

## 5. SQL (PostgreSQL)

```sql
CREATE TABLE "Product" (
    "productAID" BIGSERIAL PRIMARY KEY,
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
    "createdByAID" BIGINT,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedByAID" BIGINT,
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
    "productDetailAID" BIGSERIAL PRIMARY KEY,
    "productDetailID" VARCHAR(14) NOT NULL DEFAULT "generateBusinessID"('ProductDetail'),

    "nameVietnamese" VARCHAR(255) NOT NULL,
    "nameEnglish" VARCHAR(255),
    "nameCambodia" VARCHAR(255),

    "productAID" BIGINT NOT NULL,
    "detailType" VARCHAR(20) NOT NULL,
    "contentVietnamese" TEXT,
    "contentEnglish" TEXT,
    "contentCambodia" TEXT,
    "icon" VARCHAR(50),
    "image" TEXT,
    "imageAlt" VARCHAR(255),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByAID" BIGINT,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedByAID" BIGINT,

    "note" TEXT,

    CONSTRAINT "UQ_ProductDetail_productDetailID" UNIQUE ("productDetailID"),
    CONSTRAINT "FK_ProductDetail_productAID" FOREIGN KEY ("productAID")
        REFERENCES "Product" ("productAID") ON DELETE CASCADE,
    CONSTRAINT "CK_ProductDetail_detailType" CHECK (
        "detailType" IN ('STORY', 'HIGHLIGHT', 'INGREDIENT', 'USAGE', 'NOTE', 'EFFECT', 'GALLERY')
    )
);

CREATE INDEX "IX_ProductDetail_productAID_detailType" ON "ProductDetail" ("productAID", "detailType", "sortOrder");

CREATE TABLE "Service" (
    "serviceAID" BIGSERIAL PRIMARY KEY,
    "serviceID" VARCHAR(14) NOT NULL DEFAULT "generateBusinessID"('Service'),

    "nameVietnamese" VARCHAR(255) NOT NULL,
    "nameEnglish" VARCHAR(255),
    "nameCambodia" VARCHAR(255),

    "category" VARCHAR(30) NOT NULL,
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
    "createdByAID" BIGINT,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedByAID" BIGINT,
    "deletedAt" TIMESTAMP,

    "note" TEXT,

    CONSTRAINT "UQ_Service_serviceID" UNIQUE ("serviceID"),
    CONSTRAINT "CK_Service_status" CHECK ("status" IN ('ACTIVE', 'INACTIVE')),
    CONSTRAINT "CK_Service_price" CHECK ("price" >= 0),
    CONSTRAINT "CK_Service_durationMinutes" CHECK ("durationMinutes" IS NULL OR "durationMinutes" > 0)
);

CREATE INDEX "IX_Service_category_sortOrder" ON "Service" ("category", "sortOrder");
CREATE INDEX "IX_Service_status" ON "Service" ("status");
```

---

## 6. Prisma Schema

```prisma
/// category: SERUM | CREAM | SUNSCREEN | MASK | EYE (CHECK "CK_Product_category")
/// status: ACTIVE | INACTIVE (CHECK "CK_Product_status")
model Product {
  productAID            BigInt    @id @default(autoincrement())
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
  createdByAID          BigInt?
  updatedAt             DateTime  @default(now()) @updatedAt
  updatedByAID          BigInt?
  deletedAt             DateTime?

  note                  String?

  productDetails ProductDetail[]

  @@index([category], map: "IX_Product_category")
  @@index([status], map: "IX_Product_status")
}

/// detailType: STORY | HIGHLIGHT | INGREDIENT | USAGE | NOTE | EFFECT | GALLERY (CHECK "CK_ProductDetail_detailType")
model ProductDetail {
  productDetailAID  BigInt   @id @default(autoincrement())
  productDetailID   String   @unique(map: "UQ_ProductDetail_productDetailID") @default(dbgenerated("\"generateBusinessID\"('ProductDetail'::text)")) @db.VarChar(14)

  nameVietnamese    String   @db.VarChar(255)
  nameEnglish       String?  @db.VarChar(255)
  nameCambodia      String?  @db.VarChar(255)

  productAID        BigInt
  detailType        String   @db.VarChar(20)
  contentVietnamese String?
  contentEnglish    String?
  contentCambodia   String?
  icon              String?  @db.VarChar(50)
  image             String?
  imageAlt          String?  @db.VarChar(255)
  sortOrder         Int      @default(0)

  createdAt         DateTime @default(now())
  createdByAID      BigInt?
  updatedAt         DateTime @default(now()) @updatedAt
  updatedByAID      BigInt?

  note              String?

  product Product @relation(fields: [productAID], references: [productAID], onDelete: Cascade, map: "FK_ProductDetail_productAID")

  @@index([productAID, detailType, sortOrder], map: "IX_ProductDetail_productAID_detailType")
}

/// category: COMBO_PACKAGE | NAIL | SKIN_CARE | BODY_CARE | HAIR ... (UPPERCASE)
/// status: ACTIVE | INACTIVE (CHECK "CK_Service_status")
model Service {
  serviceAID                 BigInt    @id @default(autoincrement())
  serviceID                  String    @unique(map: "UQ_Service_serviceID") @default(dbgenerated("\"generateBusinessID\"('Service'::text)")) @db.VarChar(14)

  nameVietnamese             String    @db.VarChar(255)
  nameEnglish                String?   @db.VarChar(255)
  nameCambodia               String?   @db.VarChar(255)

  category                   String    @db.VarChar(30)
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
  createdByAID               BigInt?
  updatedAt                  DateTime  @default(now()) @updatedAt
  updatedByAID               BigInt?
  deletedAt                  DateTime?

  note                       String?

  @@index([category, sortOrder], map: "IX_Service_category_sortOrder")
  @@index([status], map: "IX_Service_status")
}
```

---

## 7. Dữ liệu mẫu (theo ảnh)

```sql
INSERT INTO "Service" ("nameVietnamese", "nameEnglish", "category", "shortDescriptionVietnamese", "price", "sortOrder")
VALUES
    ('Perfectly Polished', 'Perfectly Polished', 'COMBO_PACKAGE', 'Làm móng tay sắc (Mani hoặc Pedi)', 390000, 1),
    ('Perfectly Polished', 'Perfectly Polished', 'COMBO_PACKAGE', 'Làm móng tay sắc (Mani hoặc Pedi)', 390000, 2);
```

---

## 8. Checklist

```text
[x] Có <tableName>AID, là PRIMARY KEY (BIGSERIAL)
[x] Có <tableName>ID, NOT NULL, UNIQUE, format YYYYMMDDXXXXXX (generateBusinessID)
[x] Không có generic id / uuid / code
[x] Có nameVietnamese, nameEnglish, nameCambodia
[x] Có createdAt, updatedAt (+ createdByAID, updatedByAID)
[x] FK ProductDetail.productAID → Product.productAID
[x] Naming camelCase, status UPPERCASE
[x] deletedAt (nếu có) đứng trước note
[x] note là field cuối
[x] Prisma giữ nguyên database naming
```
