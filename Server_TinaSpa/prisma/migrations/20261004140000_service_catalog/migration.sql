-- Danh mục dịch vụ: ServiceCategory (nhóm) 1 - n Service (dịch vụ). Thiết kế: skill/Table.md mục 3, 4.

CREATE TABLE "ServiceCategory" (
    "serviceCategoryAID" VARCHAR(20) NOT NULL DEFAULT "generateBusinessID"('ServiceCategory'),
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

    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByAID" VARCHAR(20),
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedByAID" VARCHAR(20),
    "deletedAt" TIMESTAMP(3),

    "note" TEXT,

    CONSTRAINT "ServiceCategory_pkey" PRIMARY KEY ("serviceCategoryAID"),
    CONSTRAINT "CK_ServiceCategory_status" CHECK ("status" IN ('ACTIVE', 'INACTIVE'))
);

CREATE UNIQUE INDEX "UQ_ServiceCategory_serviceCategoryID" ON "ServiceCategory" ("serviceCategoryID");
CREATE UNIQUE INDEX "UQ_ServiceCategory_slug" ON "ServiceCategory" ("slug");
CREATE INDEX "IX_ServiceCategory_status_sortOrder" ON "ServiceCategory" ("status", "sortOrder");

CREATE TABLE "Service" (
    "serviceAID" VARCHAR(20) NOT NULL DEFAULT "generateBusinessID"('Service'),
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
    "price" DECIMAL(12,0) NOT NULL,
    "durationMinutes" INTEGER,
    "image" TEXT,
    "imageAlt" VARCHAR(255),
    "isBookable" BOOLEAN NOT NULL DEFAULT TRUE,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',

    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByAID" VARCHAR(20),
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedByAID" VARCHAR(20),
    "deletedAt" TIMESTAMP(3),

    "note" TEXT,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("serviceAID"),
    CONSTRAINT "CK_Service_status" CHECK ("status" IN ('ACTIVE', 'INACTIVE')),
    CONSTRAINT "CK_Service_price" CHECK ("price" >= 0),
    CONSTRAINT "CK_Service_durationMinutes" CHECK ("durationMinutes" IS NULL OR "durationMinutes" > 0)
);

CREATE UNIQUE INDEX "UQ_Service_serviceID" ON "Service" ("serviceID");
CREATE UNIQUE INDEX "UQ_Service_slug" ON "Service" ("slug");
CREATE INDEX "IX_Service_serviceCategoryAID_sortOrder" ON "Service" ("serviceCategoryAID", "sortOrder");
CREATE INDEX "IX_Service_status" ON "Service" ("status");

ALTER TABLE "Service"
    ADD CONSTRAINT "FK_Service_serviceCategoryAID"
    FOREIGN KEY ("serviceCategoryAID") REFERENCES "ServiceCategory" ("serviceCategoryAID")
    ON DELETE RESTRICT ON UPDATE CASCADE;
