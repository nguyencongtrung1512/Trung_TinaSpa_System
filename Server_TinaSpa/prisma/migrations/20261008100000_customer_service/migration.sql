-- Dịch vụ khách đã sử dụng (nhân viên ghi nhận) + cờ buộc đổi mật khẩu cho tài khoản do nhân viên tạo.

ALTER TABLE "User" ADD COLUMN "mustChangePassword" BOOLEAN NOT NULL DEFAULT false;

-- PostgreSQL luôn thêm cột mới vào cuối; dựng lại audit + "note" để giữ thứ tự audit trước note, note cuối cùng (Role.md).
ALTER TABLE "User"
    ADD COLUMN "createdAtMoved" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN "createdByAIDMoved" VARCHAR(20),
    ADD COLUMN "updatedAtMoved" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN "updatedByAIDMoved" VARCHAR(20),
    ADD COLUMN "noteMoved" TEXT;
UPDATE "User" SET
    "createdAtMoved" = "createdAt",
    "createdByAIDMoved" = "createdByAID",
    "updatedAtMoved" = "updatedAt",
    "updatedByAIDMoved" = "updatedByAID",
    "noteMoved" = "note";
ALTER TABLE "User"
    DROP COLUMN "createdAt",
    DROP COLUMN "createdByAID",
    DROP COLUMN "updatedAt",
    DROP COLUMN "updatedByAID",
    DROP COLUMN "note";
ALTER TABLE "User" RENAME COLUMN "createdAtMoved" TO "createdAt";
ALTER TABLE "User" RENAME COLUMN "createdByAIDMoved" TO "createdByAID";
ALTER TABLE "User" RENAME COLUMN "updatedAtMoved" TO "updatedAt";
ALTER TABLE "User" RENAME COLUMN "updatedByAIDMoved" TO "updatedByAID";
ALTER TABLE "User" RENAME COLUMN "noteMoved" TO "note";

CREATE TABLE "CustomerService" (
    "customerServiceAID" VARCHAR(20) NOT NULL DEFAULT "generateBusinessID"('CustomerService'),
    "customerServiceID" VARCHAR(14) NOT NULL DEFAULT "generateBusinessID"('CustomerService'),

    "nameVietnamese" VARCHAR(255) NOT NULL,
    "nameEnglish" VARCHAR(255),
    "nameCambodia" VARCHAR(255),

    "customerAID" VARCHAR(20) NOT NULL,
    "serviceAID" VARCHAR(20) NOT NULL,
    "priceSnapshot" DECIMAL(12, 0) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "staffNote" TEXT,

    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByAID" VARCHAR(20),
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedByAID" VARCHAR(20),
    "deletedAt" TIMESTAMP(3),

    "note" TEXT,

    CONSTRAINT "CustomerService_pkey" PRIMARY KEY ("customerServiceAID"),
    CONSTRAINT "CK_CustomerService_quantity" CHECK ("quantity" > 0),
    CONSTRAINT "CK_CustomerService_priceSnapshot" CHECK ("priceSnapshot" >= 0)
);

CREATE UNIQUE INDEX "UQ_CustomerService_customerServiceID" ON "CustomerService" ("customerServiceID");
CREATE INDEX "IX_CustomerService_customerAID_usedAt" ON "CustomerService" ("customerAID", "usedAt");
CREATE INDEX "IX_CustomerService_serviceAID" ON "CustomerService" ("serviceAID");

ALTER TABLE "CustomerService"
    ADD CONSTRAINT "FK_CustomerService_customerAID"
    FOREIGN KEY ("customerAID") REFERENCES "User" ("userAID")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "CustomerService"
    ADD CONSTRAINT "FK_CustomerService_serviceAID"
    FOREIGN KEY ("serviceAID") REFERENCES "Service" ("serviceAID")
    ON DELETE RESTRICT ON UPDATE CASCADE;
