-- Bài viết (Blog) và danh mục bài viết (BlogCategory). Theo Role.md: AID/ID sinh bởi "generateBusinessID", note cuối cùng.

CREATE TABLE "BlogCategory" (
    "blogCategoryAID" VARCHAR(20) NOT NULL DEFAULT "generateBusinessID"('BlogCategory'),
    "blogCategoryID" VARCHAR(14) NOT NULL DEFAULT "generateBusinessID"('BlogCategory'),

    "nameVietnamese" VARCHAR(255) NOT NULL,
    "nameEnglish" VARCHAR(255),
    "nameCambodia" VARCHAR(255),

    "slug" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    "note" TEXT,

    CONSTRAINT "BlogCategory_pkey" PRIMARY KEY ("blogCategoryAID"),
    CONSTRAINT "CK_BlogCategory_slug" CHECK ("slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

CREATE UNIQUE INDEX "UQ_BlogCategory_blogCategoryID" ON "BlogCategory" ("blogCategoryID");
CREATE UNIQUE INDEX "UQ_BlogCategory_slug" ON "BlogCategory" ("slug");
CREATE INDEX "IX_BlogCategory_isActive_displayOrder" ON "BlogCategory" ("isActive", "displayOrder");

CREATE TABLE "Blog" (
    "blogAID" VARCHAR(20) NOT NULL DEFAULT "generateBusinessID"('Blog'),
    "blogID" VARCHAR(14) NOT NULL DEFAULT "generateBusinessID"('Blog'),

    "nameVietnamese" VARCHAR(255) NOT NULL,
    "nameEnglish" VARCHAR(255),
    "nameCambodia" VARCHAR(255),

    "blogCategoryAID" VARCHAR(20) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "summary" TEXT,
    "content" TEXT,
    "thumbnailURL" TEXT,
    "authorAID" VARCHAR(20),
    "status" VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "metaTitle" VARCHAR(255),
    "metaDescription" VARCHAR(320),

    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByAID" VARCHAR(20),
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedByAID" VARCHAR(20),

    "note" TEXT,

    CONSTRAINT "Blog_pkey" PRIMARY KEY ("blogAID"),
    CONSTRAINT "CK_Blog_status" CHECK ("status" IN ('DRAFT', 'PUBLISHED', 'HIDDEN')),
    CONSTRAINT "CK_Blog_viewCount" CHECK ("viewCount" >= 0),
    -- Bài đã xuất bản bắt buộc có thời điểm xuất bản.
    CONSTRAINT "CK_Blog_publishedAt" CHECK ("status" <> 'PUBLISHED' OR "publishedAt" IS NOT NULL),
    CONSTRAINT "CK_Blog_slug" CHECK ("slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

CREATE UNIQUE INDEX "UQ_Blog_blogID" ON "Blog" ("blogID");
CREATE UNIQUE INDEX "UQ_Blog_slug" ON "Blog" ("slug");
CREATE INDEX "IX_Blog_blogCategoryAID" ON "Blog" ("blogCategoryAID");
CREATE INDEX "IX_Blog_status_publishedAt" ON "Blog" ("status", "publishedAt" DESC);

ALTER TABLE "Blog"
    ADD CONSTRAINT "FK_Blog_blogCategoryAID"
    FOREIGN KEY ("blogCategoryAID") REFERENCES "BlogCategory" ("blogCategoryAID")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Blog"
    ADD CONSTRAINT "FK_Blog_authorAID"
    FOREIGN KEY ("authorAID") REFERENCES "User" ("userAID")
    ON DELETE SET NULL ON UPDATE CASCADE;
