-- Cấu hình hệ thống dạng key → JSON (vd. "popupBanner": ảnh popup khi khách mới vào website). note giữ cột cuối (Role.md).

CREATE TABLE "SystemSetting" (
    "key"          VARCHAR(100) NOT NULL,
    "value"        JSONB        NOT NULL,
    "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedByAID" VARCHAR(20),
    "note"         TEXT,

    CONSTRAINT "PK_SystemSetting" PRIMARY KEY ("key")
);
