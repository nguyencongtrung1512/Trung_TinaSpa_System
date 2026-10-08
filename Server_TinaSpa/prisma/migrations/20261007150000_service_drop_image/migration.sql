-- Ảnh chỉ gắn với nhóm dịch vụ (ServiceCategory), không lưu trên từng Service.

ALTER TABLE "Service" DROP COLUMN IF EXISTS "image";
ALTER TABLE "Service" DROP COLUMN IF EXISTS "imageAlt";
