-- Gắn dịch vụ khách đã dùng với khu vực thực hiện: MANAGER/STAFF chỉ thấy, sửa và tính doanh thu trong khu vực mình.
-- Bản ghi cũ lấy theo khu vực của khách. note giữ cột cuối (Role.md).

ALTER TABLE "CustomerService"
    ADD COLUMN "branchAID" VARCHAR(20);

UPDATE "CustomerService" cs
SET "branchAID" = u."branchAID"
FROM "User" u
WHERE u."userAID" = cs."customerAID";

CREATE INDEX "IX_CustomerService_branchAID_usedAt" ON "CustomerService" ("branchAID", "usedAt");

ALTER TABLE "CustomerService"
    ADD CONSTRAINT "FK_CustomerService_branchAID"
    FOREIGN KEY ("branchAID") REFERENCES "Branch" ("branchAID")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "CustomerService" ADD COLUMN "noteMoved" TEXT;
UPDATE "CustomerService" SET "noteMoved" = "note";
ALTER TABLE "CustomerService" DROP COLUMN "note";
ALTER TABLE "CustomerService" RENAME COLUMN "noteMoved" TO "note";
