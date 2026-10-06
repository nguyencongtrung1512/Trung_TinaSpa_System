-- Quy trình phục vụ trong ngày: CONFIRMED -> ARRIVED (check-in) -> IN_SERVICE -> COMPLETED.

ALTER TABLE "Appointment" DROP CONSTRAINT "CK_Appointment_status";
ALTER TABLE "Appointment"
    ADD CONSTRAINT "CK_Appointment_status"
    CHECK ("status" IN ('PENDING', 'CONFIRMED', 'ARRIVED', 'IN_SERVICE', 'COMPLETED', 'CANCELLED'));

ALTER TABLE "Appointment"
    ADD COLUMN "checkedInAt" TIMESTAMP(3),
    ADD COLUMN "serviceStartedAt" TIMESTAMP(3),
    ADD COLUMN "completedAt" TIMESTAMP(3),
    ADD COLUMN "servedByAID" VARCHAR(20),
    ADD COLUMN "serviceNote" TEXT;

ALTER TABLE "Appointment"
    ADD CONSTRAINT "FK_Appointment_servedByAID"
    FOREIGN KEY ("servedByAID") REFERENCES "User" ("userAID")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- PostgreSQL luôn thêm cột mới vào cuối; dựng lại audit + "note" để giữ thứ tự audit trước note, note cuối cùng (Role.md).
ALTER TABLE "Appointment"
    ADD COLUMN "createdAtMoved" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN "createdByAIDMoved" VARCHAR(20),
    ADD COLUMN "updatedAtMoved" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN "updatedByAIDMoved" VARCHAR(20),
    ADD COLUMN "noteMoved" TEXT;
UPDATE "Appointment" SET
    "createdAtMoved" = "createdAt",
    "createdByAIDMoved" = "createdByAID",
    "updatedAtMoved" = "updatedAt",
    "updatedByAIDMoved" = "updatedByAID",
    "noteMoved" = "note";
ALTER TABLE "Appointment"
    DROP COLUMN "createdAt",
    DROP COLUMN "createdByAID",
    DROP COLUMN "updatedAt",
    DROP COLUMN "updatedByAID",
    DROP COLUMN "note";
ALTER TABLE "Appointment" RENAME COLUMN "createdAtMoved" TO "createdAt";
ALTER TABLE "Appointment" RENAME COLUMN "createdByAIDMoved" TO "createdByAID";
ALTER TABLE "Appointment" RENAME COLUMN "updatedAtMoved" TO "updatedAt";
ALTER TABLE "Appointment" RENAME COLUMN "updatedByAIDMoved" TO "updatedByAID";
ALTER TABLE "Appointment" RENAME COLUMN "noteMoved" TO "note";
