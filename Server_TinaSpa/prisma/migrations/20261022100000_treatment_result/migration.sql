-- Kết quả điều trị thực tế (ảnh before/after) hiển thị ở mục "Kết quả thực tế" trên trang chủ.
-- Quản trị và quản lý thêm/sửa/ẩn/xóa; nhân viên không truy cập. note giữ cột cuối (Role.md).

CREATE TABLE "TreatmentResult" (
    "treatmentResultAID" VARCHAR(20) NOT NULL DEFAULT "generateBusinessID"('TreatmentResult'),
    "treatmentResultID"  VARCHAR(14) NOT NULL DEFAULT "generateBusinessID"('TreatmentResult'),

    "titleVietnamese"   VARCHAR(255) NOT NULL,
    "titleEnglish"      VARCHAR(255),
    "resultVietnamese"  VARCHAR(255) NOT NULL,
    "resultEnglish"     VARCHAR(255),
    "summaryVietnamese" VARCHAR(500),
    "summaryEnglish"    VARCHAR(500),

    "beforeImage" VARCHAR(2048) NOT NULL,
    "afterImage"  VARCHAR(2048) NOT NULL,

    "sessionCount"  INTEGER NOT NULL,
    "durationWeeks" INTEGER NOT NULL,

    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive"     BOOLEAN NOT NULL DEFAULT true,

    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByAID" VARCHAR(20),
    "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedByAID" VARCHAR(20),

    "note" TEXT,

    CONSTRAINT "TreatmentResult_pkey" PRIMARY KEY ("treatmentResultAID"),
    CONSTRAINT "CK_TreatmentResult_sessionCount" CHECK ("sessionCount" BETWEEN 1 AND 999),
    CONSTRAINT "CK_TreatmentResult_durationWeeks" CHECK ("durationWeeks" BETWEEN 1 AND 999)
);

CREATE UNIQUE INDEX "UQ_TreatmentResult_treatmentResultID" ON "TreatmentResult" ("treatmentResultID");
CREATE INDEX "IX_TreatmentResult_isActive_displayOrder" ON "TreatmentResult" ("isActive", "displayOrder");

-- Ba ca mẫu trước đây được viết cứng trong website, chuyển vào bảng để trang chủ không đổi sau khi migrate.
INSERT INTO "TreatmentResult" (
    "titleVietnamese", "titleEnglish", "resultVietnamese", "resultEnglish", "summaryVietnamese", "summaryEnglish",
    "beforeImage", "afterImage", "sessionCount", "durationWeeks", "displayOrder"
) VALUES
    ('Phục hồi da chuyên sâu', 'Intensive skin recovery',
     'Tổn thương & kích ứng giảm mạnh 96%', 'Lesions & irritation reduced by 96%',
     'Da kích ứng, mất nước được phục hồi trọn vẹn', 'Irritated, dehydrated skin fully restored',
     '/images/screen.png', '/images/screen1.png', 6, 8, 1),
    ('Liệu trình mờ thâm nám', 'Dark spot & melasma treatment',
     'Nám mảng & tàn nhang giảm 88%', 'Melasma & freckles reduced by 88%',
     'Melanin tích tụ dày, viền màu trở nên rạng rỡ hơn', 'Dense melanin build-up, skin tone now more radiant',
     '/images/screen1.png', '/images/screen.png', 8, 10, 2),
    ('Trị mụn & kháng viêm', 'Acne & anti-inflammation',
     'Mụn viêm được kiểm soát hoàn toàn', 'Inflammatory acne fully under control',
     'Tăng tiết bã nhờn, da khít và mờ thâm', 'Excess sebum reduced, tighter pores and faded marks',
     '/images/image 1.png', '/images/screen1.png', 5, 6, 3);
