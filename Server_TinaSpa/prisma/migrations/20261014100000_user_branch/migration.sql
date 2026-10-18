-- Gắn User với khu vực (Branch): MANAGER/STAFF quản lý theo cơ sở; ADMIN không gán. note giữ cột cuối (Role.md).

ALTER TABLE "User"
    ADD COLUMN "branchAID" VARCHAR(20);

CREATE INDEX "IX_User_branchAID" ON "User" ("branchAID");

ALTER TABLE "User"
    ADD CONSTRAINT "FK_User_branchAID"
    FOREIGN KEY ("branchAID") REFERENCES "Branch" ("branchAID")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "User" ADD COLUMN "noteMoved" TEXT;
UPDATE "User" SET "noteMoved" = "note";
ALTER TABLE "User" DROP COLUMN "note";
ALTER TABLE "User" RENAME COLUMN "noteMoved" TO "note";
