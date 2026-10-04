Database Role & Coding Rules — Dr Tina Beauty

1. Mục đích

## Tài liệu này định nghĩa các quy tắc bắt buộc khi AI tạo mới hoặc chỉnh sửa:
PostgreSQL database
Table
Column
Primary Key
Business ID
Foreign Key
Prisma Schema
Prisma Migration
SQL Script
API model/entity liên quan đến database
Các quy tắc trong tài liệu này là NON-NEGOTIABLE.
AI không được tự ý áp dụng convention mặc định của PostgreSQL, Prisma,
TypeORM, NestJS hoặc bất kỳ framework nào nếu convention đó khác với tài liệu này.

1. Nguyên tắc cốt lõi

Mỗi table phải có đầy đủ:

```text
<TableName>AID
<TableName>ID

nameVietnamese
nameEnglish
nameCambodia

...
note
```

## Trong đó:
`AID`: Primary Key kỹ thuật của database.
`ID`: Business ID / mã nghiệp vụ.
`nameVietnamese`: Tên tiếng Việt.
`nameEnglish`: Tên tiếng Anh.
`nameCambodia`: Tên tiếng Cambodia.
`note`: Ghi chú, luôn là field cuối cùng.

1. Quy tắc Primary Key — AID

3.1. Mỗi table bắt buộc có AID
Tên AID phải theo:

```text
<tableName>AID
```

Ví dụ:

```text
customerAID
serviceAID
appointmentAID
productAID
userAID
serviceDetailAID
```

3.2. AID là Primary Key
Ví dụ:

```sql
"customerAID" VARCHAR(20) PRIMARY KEY DEFAULT "generateBusinessID"('Customer')
```

Mã AID cùng dạng Business ID `YYYYMMDDXXXXXX`, lưu trong `VARCHAR(20)`.
PostgreSQL không có `nvarchar`; `VARCHAR` đã lưu Unicode, tương đương `nvarchar(20)`.
3.3. Không được tạo generic ID
KHÔNG được tạo:

```text
id
Id
ID
uuid
```

## để làm Primary Key thay cho AID.

1. Quy tắc Business ID — ID

Mỗi table bắt buộc có một Business ID:

```text
<tableName>ID
```

Ví dụ:

```text
customerID
serviceID
appointmentID
productID
userID
serviceDetailID
```

## Business ID:
Không phải Primary Key.
Phải `NOT NULL`.
Phải `UNIQUE`.
Dùng cho mã nghiệp vụ / hiển thị / tra cứu.
Không để Frontend tự generate.
Backend hoặc Database chịu trách nhiệm generate.

1. Quy tắc phát sinh Business ID

Business ID phải có format:

```text
YYYYMMDDXXXXXX
```

Trong đó:

```text
YYYY = năm
MM   = tháng
DD   = ngày
XXXXXX = sequence 6 chữ số tăng dần với bước nhảy ngẫu nhiên 1–50
```

Ví dụ:

```text
20260929000001
20260929000002
20260929000003
```

Ngày tiếp theo:

```text
20260930000001
20260930000002
```

5.1. Yêu cầu
Business ID:
Phải UNIQUE.
Phải NOT NULL.
Phải có index UNIQUE.
Không dùng UUID.
Không dùng random string.
Không dùng auto increment trực tiếp làm Business ID.
Frontend không được tự sinh Business ID.
5.2. Lưu ý về sequence
Nếu hệ thống có nhiều request đồng thời, việc generate Business ID phải đảm bảo không bị duplicate.
AI phải ưu tiên cơ chế an toàn transaction/concurrency của PostgreSQL hoặc backend.
Không được dùng logic kiểu:

```text
SELECT MAX(ID) + 1
```

5.3. Cơ chế hiện tại
Business ID được sinh bởi function PostgreSQL `"generateBusinessID"('<TableName>')`,
dùng làm DEFAULT của cột `<tableName>ID`, đếm theo table + ngày trong table `BusinessIdCounter`.
XXXXXX tăng dần với bước nhảy ngẫu nhiên 1–50 (không tăng +1) để khó đoán mã kế tiếp.
Không gửi `AID` ra Frontend / JWT; API chỉ dùng `ID`.

## để generate mã trong môi trường production.

1. Quy tắc Naming

Tất cả column sử dụng:

```text
camelCase
```

Ví dụ đúng:

```text
customerAID
customerID
customerName
phoneNumber
appointmentDate
appointmentTime
createdAt
updatedAt
```

Không dùng:

```text
customer_aid
customer_id
CustomerID
CUSTOMER_ID
```

---

1. Quy tắc Multi-language Name

Mỗi table bắt buộc có:

```text
nameVietnamese
nameEnglish
nameCambodia
```

Không được tự ý thay thế bằng:

```text
name
title
displayName
serviceName
```

nếu đó là tên chính của entity.

Ngoại lệ — các table KHÔNG có 3 field language:

```text
User               (đã có fullName là tên riêng của người dùng)
RefreshToken       (table kỹ thuật phục vụ xác thực)
BusinessIdCounter  (table kỹ thuật sinh Business ID, không theo convention AID/ID)
```

Các table nghiệp vụ khác (Service, Product, Appointment...) vẫn bắt buộc
nameVietnamese, nameEnglish, nameCambodia.
Ví dụ:

```text
serviceAID
serviceID

nameVietnamese
nameEnglish
nameCambodia
```

---

1. Quy tắc Note

Mỗi table bắt buộc có:

```text
note
```

`note` phải là column cuối cùng của table.
Ví dụ:

```text
createdAt
createdByAID
updatedAt
updatedByAID
note
```

## Không đặt `note` ở giữa các field nghiệp vụ.

1. Quy tắc Audit

Mỗi table nên có:

```text
createdAt
updatedAt
```

Nếu cần tracking người tạo/người cập nhật:

```text
createdByAID
updatedByAID
```

Các field audit phải nằm trước `note`.
Thứ tự mặc định:

```text
createdAt
createdByAID
updatedAt
updatedByAID
note
```

## Nếu một field audit không cần thiết theo nghiệp vụ, AI có thể bỏ field đó nhưng không được tự ý thay đổi naming convention.

1. Quy tắc Foreign Key

Foreign Key phải tham chiếu `AID` theo mặc định.
Ví dụ:

```text
Service
---------
serviceAID   PK
serviceID    UNIQUE

Appointment
-----------
appointmentAID PK
appointmentID  UNIQUE
serviceAID     FK
```

Relationship:

```text
Appointment.serviceAID
        ↓
Service.serviceAID
```

Không mặc định tham chiếu:

```text
Appointment.serviceID
        ↓
Service.serviceID
```

Lý do:

```text
AID = Database Relationship Key
ID  = Business / Display Key
```

---

1. Quy tắc Table Detail

Ví dụ:

```text
Service
ServiceDetail
```

Service

```text
serviceAID
serviceID

nameVietnamese
nameEnglish
nameCambodia

...

note
```

ServiceDetail

```text
serviceDetailAID
serviceDetailID

nameVietnamese
nameEnglish
nameCambodia

serviceAID

...

note
```

Foreign Key:

```text
serviceDetail.serviceAID
        ↓
service.serviceAID
```

---

1. Ví dụ Appointment

Table đặt lịch:

```text
Appointment
```

Cấu trúc:

```text
appointmentAID
appointmentID

nameVietnamese
nameEnglish
nameCambodia

customerName
phoneNumber

serviceAID

appointmentDate
appointmentTime

status

createdAt
createdByAID
updatedAt
updatedByAID

note
```

Trong trường hợp entity không có tên riêng theo nghiệp vụ, ba field:

```text
nameVietnamese
nameEnglish
nameCambodia
```

## vẫn phải được giữ vì đây là database convention chung của hệ thống.

1. Status

Status phải có giá trị có ý nghĩa.
Ví dụ:

```text
PENDING
CONFIRMED
COMPLETED
CANCELLED
```

Không dùng số không có ý nghĩa nếu không có enum/documentation rõ ràng:

```text
1
2
3
4
```

## Nếu dùng status dạng string, phải thống nhất uppercase.

1. Thứ tự Field chuẩn

Khi tạo table, ưu tiên thứ tự:

```text
1. <tableName>AID
2. <tableName>ID

3. nameVietnamese
4. nameEnglish
5. nameCambodia

6. Các field nghiệp vụ

7. createdAt
8. createdByAID
9. updatedAt
10. updatedByAID

11. note
```

## Nếu một số field audit không cần thiết, có thể bỏ nhưng `note` vẫn phải ở cuối.

1. Ví dụ SQL chuẩn

```sql
CREATE TABLE "Service" (
    "serviceAID" VARCHAR(20) PRIMARY KEY DEFAULT "generateBusinessID"('Service'),

    "serviceID" VARCHAR(14) NOT NULL UNIQUE,

    "nameVietnamese" VARCHAR(255) NOT NULL,
    "nameEnglish" VARCHAR(255),
    "nameCambodia" VARCHAR(255),

    "image" TEXT,
    "description" TEXT,

    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByAID" VARCHAR(20),

    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedByAID" VARCHAR(20),

    "note" TEXT
);
```

---

1. Ví dụ Relationship

```text
Service
│
├── serviceAID
├── serviceID
│
└── ServiceDetail
      │
      └── serviceAID FK
```

## Không tạo relationship bằng generic `id`.

1. Quy tắc Prisma

Khi tạo Prisma Schema, phải giữ nguyên tên database field.
Ví dụ:

```prisma
model Service {
  serviceAID      String   @id @default(dbgenerated("\"generateBusinessID\"('Service'::text)")) @db.VarChar(20)
  serviceID       String   @unique

  nameVietnamese  String
  nameEnglish     String?
  nameCambodia    String?

  image           String?
  description     String?

  createdAt       DateTime @default(now())
  createdByAID    String?  @db.VarChar(20)
  updatedAt       DateTime @updatedAt
  updatedByAID    String?  @db.VarChar(20)

  note            String?
}
```

Không tự động đổi:

```text
serviceAID → id
serviceID → code
createdAt → created_at
```

---

1. Quy tắc Migration

## Khi tạo migration:
Không rename field chỉ vì convention mặc định của framework.
Không tạo generic `id`.
Không bỏ `AID`.
Không bỏ `ID`.
Không bỏ 3 field language.
Không bỏ `note`.
Foreign Key phải kiểm tra đúng `AID`.
Unique constraint phải được tạo cho Business ID.

1. Quy tắc Index

Business ID phải có UNIQUE index/constraint.
Ví dụ:

```sql
CONSTRAINT "UQ_Service_serviceID"
UNIQUE ("serviceID")
```

Foreign Key quan trọng nên có index nếu có nhu cầu truy vấn/join thường xuyên.
Ví dụ:

```sql
CREATE INDEX "IX_Appointment_serviceAID"
ON "Appointment" ("serviceAID");
```

## AI phải cân nhắc index dựa trên query thực tế, không tạo index tràn lan.

1. Quy tắc không được tự ý sáng tạo convention

AI KHÔNG được tự ý:

```text
id
uuid
code
created_at
updated_at
deleted_at
name
title
display_name
```

## nếu việc tạo field đó làm thay đổi convention đã quy định.
Nếu nghiệp vụ thực sự cần thêm field mới, AI được tạo field mới nhưng phải:
Dùng camelCase.
Có tên thể hiện đúng nghiệp vụ.
Không trùng hoặc phá vỡ các field chuẩn.
Giữ nguyên AID/ID.
Giữ nguyên 3 field language.
Giữ `note` ở cuối.

1. Soft Delete

Nếu nghiệp vụ cần soft delete, sử dụng field:

```text
deletedAt
```

và đặt trước `note`.
Ví dụ:

```text
createdAt
createdByAID
updatedAt
updatedByAID
deletedAt

note
```

Không dùng:

```text
isDeleted
deleteFlag
deleted
```

## trừ khi có yêu cầu nghiệp vụ cụ thể.

1. Quy tắc khi sửa Table đã tồn tại

## Trước khi ALTER TABLE, AI phải:
Đọc schema hiện tại.
Kiểm tra dữ liệu hiện có.
Kiểm tra Foreign Key.
Kiểm tra Index.
Kiểm tra Prisma relation.
Kiểm tra API đang sử dụng field đó.
Đánh giá migration có gây mất dữ liệu hay không.
Không tự ý DROP column/table trong production.
Nếu migration có nguy cơ mất dữ liệu, phải cảnh báo trước khi thực hiện.

1. Checklist bắt buộc trước khi hoàn thành

Trước khi tạo hoặc sửa một table, AI phải tự kiểm tra:

```text
[ ] Có <tableName>AID?
[ ] AID là PRIMARY KEY?
[ ] Có <tableName>ID?
[ ] ID là UNIQUE?
[ ] ID là NOT NULL?
[ ] ID có format YYYYMMDDXXXXXX?
[ ] Không có generic `id`?
[ ] Có nameVietnamese? (trừ table ngoại lệ)
[ ] Có nameEnglish? (trừ table ngoại lệ)
[ ] Có nameCambodia? (trừ table ngoại lệ)
[ ] Có createdAt?
[ ] Có updatedAt?
[ ] Foreign Key tham chiếu AID?
[ ] Naming dùng camelCase?
[ ] Có note?
[ ] note là field cuối?
[ ] Prisma giữ nguyên database naming?
[ ] Migration không gây mất dữ liệu ngoài dự kiến?
```

## Nếu bất kỳ rule bắt buộc nào không đạt, schema chưa được xem là hoàn chỉnh.

1. Nguyên tắc ưu tiên

Khi có xung đột giữa convention của framework và tài liệu này:

```text
DATABASE ROLE.md
        ↓
Database Architecture
        ↓
Prisma / ORM
        ↓
NestJS
        ↓
Framework default convention
```

## `DATABASE ROLE.md` là nguồn quy tắc cao nhất đối với database naming và structure.

1. Tóm tắt Convention

Mọi table mới phải có dạng:

```text
<TableName>
│
├── <tableName>AID       ← PRIMARY KEY
├── <tableName>ID        ← UNIQUE BUSINESS ID
│
├── nameVietnamese
├── nameEnglish
├── nameCambodia
│
├── ... business fields
│
├── createdAt
├── createdByAID
├── updatedAt
├── updatedByAID
│
└── note                 ← ALWAYS LAST
```

Business ID:

```text
YYYYMMDDXXXXXX
```

Ví dụ:

```text
20260929000001
```

Foreign Key:

```text
<childTable>.<parentTable>AID
        ↓
<parentTable>.<parentTable>AID
```

Không dùng generic:

```text
id
```

Không tự ý thay đổi convention.