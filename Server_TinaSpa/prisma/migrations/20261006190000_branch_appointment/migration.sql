-- Đặt lịch hẹn theo khu vực (cơ sở): Branch 1 - n Appointment. Khách chọn khu vực, không chọn dịch vụ.

CREATE TABLE "Branch" (
    "branchAID" VARCHAR(20) NOT NULL DEFAULT "generateBusinessID"('Branch'),
    "branchID" VARCHAR(14) NOT NULL DEFAULT "generateBusinessID"('Branch'),

    "nameVietnamese" VARCHAR(255) NOT NULL,
    "nameEnglish" VARCHAR(255),
    "nameCambodia" VARCHAR(255),

    "slug" VARCHAR(50) NOT NULL,
    "addressVietnamese" VARCHAR(255),
    "addressEnglish" VARCHAR(255),
    "addressCambodia" VARCHAR(255),
    "hotline" VARCHAR(100),
    "openTime" VARCHAR(5) NOT NULL DEFAULT '08:00',
    "closeTime" VARCHAR(5) NOT NULL DEFAULT '20:00',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',

    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByAID" VARCHAR(20),
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedByAID" VARCHAR(20),
    "deletedAt" TIMESTAMP(3),

    "note" TEXT,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("branchAID"),
    CONSTRAINT "CK_Branch_status" CHECK ("status" IN ('ACTIVE', 'INACTIVE')),
    CONSTRAINT "CK_Branch_openTime" CHECK ("openTime" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
    CONSTRAINT "CK_Branch_closeTime" CHECK ("closeTime" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' AND "closeTime" > "openTime")
);

CREATE UNIQUE INDEX "UQ_Branch_branchID" ON "Branch" ("branchID");
CREATE UNIQUE INDEX "UQ_Branch_slug" ON "Branch" ("slug");
CREATE INDEX "IX_Branch_status_sortOrder" ON "Branch" ("status", "sortOrder");

CREATE TABLE "Appointment" (
    "appointmentAID" VARCHAR(20) NOT NULL DEFAULT "generateBusinessID"('Appointment'),
    "appointmentID" VARCHAR(14) NOT NULL DEFAULT "generateBusinessID"('Appointment'),

    "nameVietnamese" VARCHAR(255),
    "nameEnglish" VARCHAR(255),
    "nameCambodia" VARCHAR(255),

    "customerName" VARCHAR(100) NOT NULL,
    "phoneNumber" VARCHAR(20) NOT NULL,
    "customerAID" VARCHAR(20),
    "branchAID" VARCHAR(20) NOT NULL,
    "appointmentDate" DATE NOT NULL,
    "appointmentTime" VARCHAR(5) NOT NULL,
    "customerNote" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "confirmedAt" TIMESTAMP(3),
    "confirmedByAID" VARCHAR(20),

    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByAID" VARCHAR(20),
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedByAID" VARCHAR(20),

    "note" TEXT,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("appointmentAID"),
    CONSTRAINT "CK_Appointment_status" CHECK ("status" IN ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED')),
    CONSTRAINT "CK_Appointment_appointmentTime" CHECK ("appointmentTime" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$')
);

CREATE UNIQUE INDEX "UQ_Appointment_appointmentID" ON "Appointment" ("appointmentID");
CREATE INDEX "IX_Appointment_appointmentDate_branchAID" ON "Appointment" ("appointmentDate", "branchAID");
CREATE INDEX "IX_Appointment_phoneNumber" ON "Appointment" ("phoneNumber");
CREATE INDEX "IX_Appointment_customerAID" ON "Appointment" ("customerAID");

ALTER TABLE "Appointment"
    ADD CONSTRAINT "FK_Appointment_branchAID"
    FOREIGN KEY ("branchAID") REFERENCES "Branch" ("branchAID")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Appointment"
    ADD CONSTRAINT "FK_Appointment_customerAID"
    FOREIGN KEY ("customerAID") REFERENCES "User" ("userAID")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Appointment"
    ADD CONSTRAINT "FK_Appointment_confirmedByAID"
    FOREIGN KEY ("confirmedByAID") REFERENCES "User" ("userAID")
    ON DELETE SET NULL ON UPDATE CASCADE;
