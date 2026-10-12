-- Danh mục sản phẩm (ProductCategory), sản phẩm (Product), biến thể (ProductVariant) và chi tiết sản phẩm (ProductDetail). Theo Role.md: AID/ID sinh bởi "generateBusinessID", note cuối cùng.

CREATE TABLE "ProductCategory" (
    "productCategoryAID" VARCHAR(20) NOT NULL DEFAULT "generateBusinessID"('ProductCategory'),
    "productCategoryID" VARCHAR(14) NOT NULL DEFAULT "generateBusinessID"('ProductCategory'),

    "nameVietnamese" VARCHAR(255) NOT NULL,
    "nameEnglish" VARCHAR(255),
    "nameCambodia" VARCHAR(255),

    "slug" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByAID" VARCHAR(20),
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedByAID" VARCHAR(20),

    "note" TEXT,

    CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("productCategoryAID"),
    CONSTRAINT "CK_ProductCategory_slug" CHECK ("slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

CREATE UNIQUE INDEX "UQ_ProductCategory_productCategoryID" ON "ProductCategory" ("productCategoryID");
CREATE UNIQUE INDEX "UQ_ProductCategory_slug" ON "ProductCategory" ("slug");
CREATE INDEX "IX_ProductCategory_isActive_displayOrder" ON "ProductCategory" ("isActive", "displayOrder");

CREATE TABLE "Product" (
    "productAID" VARCHAR(20) NOT NULL DEFAULT "generateBusinessID"('Product'),
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
    "productCategoryAID" VARCHAR(20) NOT NULL,
    "price" NUMERIC(12, 0) NOT NULL,
    "compareAtPrice" NUMERIC(12, 0),
    "image" TEXT,
    "imageAlt" VARCHAR(255),
    "badge" VARCHAR(100),
    "status" VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',

    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByAID" VARCHAR(20),
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedByAID" VARCHAR(20),
    "deletedAt" TIMESTAMP(3),

    "note" TEXT,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("productAID"),
    CONSTRAINT "CK_Product_slug" CHECK ("slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
    CONSTRAINT "CK_Product_status" CHECK ("status" IN ('ACTIVE', 'INACTIVE')),
    CONSTRAINT "CK_Product_price" CHECK ("price" >= 0 AND ("compareAtPrice" IS NULL OR "compareAtPrice" >= 0))
);

CREATE UNIQUE INDEX "UQ_Product_productID" ON "Product" ("productID");
CREATE UNIQUE INDEX "UQ_Product_slug" ON "Product" ("slug");
CREATE INDEX "IX_Product_productCategoryAID_status" ON "Product" ("productCategoryAID", "status");

-- Biến thể: mỗi sản phẩm có một hoặc nhiều biến thể (dung tích, loại hộp, set...) với giá riêng.
-- Product."price" / "compareAtPrice" là giá "từ", API đồng bộ theo biến thể đang bán rẻ nhất.
CREATE TABLE "ProductVariant" (
    "productVariantAID" VARCHAR(20) NOT NULL DEFAULT "generateBusinessID"('ProductVariant'),
    "productVariantID" VARCHAR(14) NOT NULL DEFAULT "generateBusinessID"('ProductVariant'),

    "nameVietnamese" VARCHAR(255) NOT NULL,
    "nameEnglish" VARCHAR(255),
    "nameCambodia" VARCHAR(255),

    "productAID" VARCHAR(20) NOT NULL,
    "sku" VARCHAR(50),
    "price" NUMERIC(12, 0) NOT NULL,
    "compareAtPrice" NUMERIC(12, 0),
    "status" VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByAID" VARCHAR(20),
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedByAID" VARCHAR(20),

    "note" TEXT,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("productVariantAID"),
    CONSTRAINT "CK_ProductVariant_status" CHECK ("status" IN ('ACTIVE', 'INACTIVE')),
    CONSTRAINT "CK_ProductVariant_price" CHECK ("price" >= 0 AND ("compareAtPrice" IS NULL OR "compareAtPrice" >= "price"))
);

CREATE UNIQUE INDEX "UQ_ProductVariant_productVariantID" ON "ProductVariant" ("productVariantID");
CREATE UNIQUE INDEX "UQ_ProductVariant_sku" ON "ProductVariant" ("sku");
CREATE INDEX "IX_ProductVariant_productAID_sortOrder" ON "ProductVariant" ("productAID", "sortOrder");

CREATE TABLE "ProductVariantImage" (
    "productVariantImageAID" VARCHAR(20) NOT NULL DEFAULT "generateBusinessID"('ProductVariantImage'),
    "productVariantImageID" VARCHAR(14) NOT NULL DEFAULT "generateBusinessID"('ProductVariantImage'),

    "nameVietnamese" VARCHAR(255) NOT NULL,
    "nameEnglish" VARCHAR(255),
    "nameCambodia" VARCHAR(255),

    "productVariantAID" VARCHAR(20) NOT NULL,
    "image" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByAID" VARCHAR(20),
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedByAID" VARCHAR(20),

    "note" TEXT,

    CONSTRAINT "ProductVariantImage_pkey" PRIMARY KEY ("productVariantImageAID")
);

CREATE UNIQUE INDEX "UQ_ProductVariantImage_productVariantImageID" ON "ProductVariantImage" ("productVariantImageID");
CREATE INDEX "IX_ProductVariantImage_productVariantAID_sortOrder" ON "ProductVariantImage" ("productVariantAID", "sortOrder");

CREATE TABLE "ProductDetail" (
    "productDetailAID" VARCHAR(20) NOT NULL DEFAULT "generateBusinessID"('ProductDetail'),
    "productDetailID" VARCHAR(14) NOT NULL DEFAULT "generateBusinessID"('ProductDetail'),

    "nameVietnamese" VARCHAR(255) NOT NULL,
    "nameEnglish" VARCHAR(255),
    "nameCambodia" VARCHAR(255),

    "productAID" VARCHAR(20) NOT NULL,
    "detailType" VARCHAR(30) NOT NULL,
    "contentVietnamese" TEXT,
    "contentEnglish" TEXT,
    "contentCambodia" TEXT,
    "icon" VARCHAR(100),
    "image" TEXT,
    "imageAlt" VARCHAR(255),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByAID" VARCHAR(20),
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedByAID" VARCHAR(20),

    "note" TEXT,

    CONSTRAINT "ProductDetail_pkey" PRIMARY KEY ("productDetailAID"),
    CONSTRAINT "CK_ProductDetail_detailType" CHECK ("detailType" IN ('STORY', 'HIGHLIGHT', 'INGREDIENT', 'USAGE', 'NOTE', 'EFFECT', 'GALLERY'))
);

CREATE UNIQUE INDEX "UQ_ProductDetail_productDetailID" ON "ProductDetail" ("productDetailID");
CREATE INDEX "IX_ProductDetail_productAID_detailType" ON "ProductDetail" ("productAID", "detailType", "sortOrder");

ALTER TABLE "ProductVariant"
    ADD CONSTRAINT "FK_ProductVariant_productAID"
    FOREIGN KEY ("productAID") REFERENCES "Product" ("productAID")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProductDetail"
    ADD CONSTRAINT "FK_ProductDetail_productAID"
    FOREIGN KEY ("productAID") REFERENCES "Product" ("productAID")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Product"
    ADD CONSTRAINT "FK_Product_productCategoryAID"
    FOREIGN KEY ("productCategoryAID") REFERENCES "ProductCategory" ("productCategoryAID")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ProductVariantImage"
    ADD CONSTRAINT "FK_ProductVariantImage_productVariantAID"
    FOREIGN KEY ("productVariantAID") REFERENCES "ProductVariant" ("productVariantAID")
    ON DELETE CASCADE ON UPDATE CASCADE;
