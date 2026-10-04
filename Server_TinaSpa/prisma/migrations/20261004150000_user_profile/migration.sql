-- Hồ sơ người dùng: ảnh đại diện, địa chỉ, ngày sinh (tính tuổi), giới tính.

ALTER TABLE "User"
    ADD COLUMN "avatar" TEXT,
    ADD COLUMN "address" VARCHAR(255),
    ADD COLUMN "dateOfBirth" DATE,
    ADD COLUMN "gender" VARCHAR(10),
    ADD CONSTRAINT "CK_User_gender" CHECK ("gender" IS NULL OR "gender" IN ('MALE', 'FEMALE', 'OTHER'));

-- PostgreSQL luôn thêm cột mới vào cuối; dựng lại "note" để giữ quy tắc note là cột cuối cùng (Role.md).
ALTER TABLE "User" ADD COLUMN "noteMoved" TEXT;
UPDATE "User" SET "noteMoved" = "note";
ALTER TABLE "User" DROP COLUMN "note";
ALTER TABLE "User" RENAME COLUMN "noteMoved" TO "note";
