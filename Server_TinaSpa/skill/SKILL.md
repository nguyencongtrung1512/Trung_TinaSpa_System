---
name: tinaspa-backend
description: >-
  Tổ chức src NestJS của Server_TinaSpa theo từng chức năng (một folder một
  module). Dùng khi thêm module, controller, service, DTO, guard, policy, hoặc
  khi người dùng nhắc cấu trúc backend, src, role customer/staff/manager/admin.
---

# Backend TinaSpa

Gốc mã backend là `Server_TinaSpa/src/`. Mỗi chức năng nghiệp vụ là một folder. Role (`CUSTOMER`, `STAFF`, `MANAGER`, `ADMIN`) là quyền, không phải folder.

Khi thêm hoặc sửa code trong `src/`, làm theo skill này. Không tách `src/admin`, `src/staff`, `src/manager`, `src/customer`.

## Cây thư mục

```text
src/
  main.ts
  app.module.ts
  common/                      # dùng chung, không gắn một chức năng
    constants/roles.ts
    decorators/
    guards/
    filters/
    types/
    utils/
    setup-app.ts
  prisma/                      # nối Nest với database
    prisma.module.ts
    prisma.service.ts
  auth/                        # đăng ký, đăng nhập, refresh, logout, /auth/me
  users/                       # tài khoản: tạo, tìm, gán role, khóa
  customers/                   # hồ sơ khách
  staff/                       # hồ sơ nhân viên
  services/                    # danh mục liệu trình
  bookings/                    # đặt, hủy, hoàn thành lịch
```

Thêm folder khi có nghiệp vụ mới (`branches`, `payments`). Không thêm folder khi chỉ thêm một role.

`manager` không có folder. Quản lý dùng `bookings`, `staff`, `services` với quyền rộng hơn. Admin dùng `users` để gán role và khóa tài khoản.

Database không nằm trong các folder trên. Bảng khai báo ở `Server_TinaSpa/prisma/schema.prisma`. Dữ liệu role gốc nằm ở `Server_TinaSpa/prisma/seed.ts`.

## Một chức năng = một folder

Mẫu (đặt lịch):

```text
src/bookings/
  dto/
    create-booking.dto.ts
    update-booking.dto.ts
  policies/
    booking-access.policy.ts
  bookings.module.ts
  bookings.controller.ts
  bookings.service.ts
```

`policies/` chỉ tạo khi quy tắc “ai được sửa đúng bản ghi này” dài. Chức năng mới bắt đầu với `module`, `controller`, `service`, `dto/`.

Không đặt `*.schema.ts` trong folder chức năng. Hình dạng bảng là Prisma. Dữ liệu vào API là DTO.

## Mục đích từng file

### Trong folder chức năng

| File | Mục đích |
|---|---|
| `<ten>.module.ts` | Khai báo controller và service của chức năng, import module khác nếu cần. `AppModule` import file này thì route mới chạy. |
| `<ten>.controller.ts` | Cửa HTTP: path, method, guard, DTO, gọi một method của service, trả kết quả. Không gọi Prisma. Không viết quy tắc nghiệp vụ. |
| `<ten>.service.ts` | Quy tắc nghiệp vụ và mọi câu hỏi database qua `PrismaService`. |
| `dto/<hanh-dong>.dto.ts` | Hình dạng body/query và validate (`class-validator`). `ValidationPipe` ở `common/setup-app.ts` áp dụng cho mọi DTO. |
| `policies/<ten>-access.policy.ts` | Trả lời một user có được xem hoặc sửa đúng một bản ghi không. Service gọi policy. Controller không gọi. |

Tên folder và tên file là kebab-case, số nhiều theo tài nguyên URL: `bookings`, `services`, `customers`. Một class một file.

### Hạ tầng, không nhân bản theo chức năng

| File | Mục đích |
|---|---|
| `main.ts` | Khởi động app, gọi `setupApp`. |
| `app.module.ts` | Danh sách module. Chức năng mới được import ở đây. |
| `common/setup-app.ts` | Pipe, prefix, cấu hình HTTP dùng chung. |
| `common/constants/roles.ts` | Bốn giá trị `ADMIN`, `MANAGER`, `STAFF`, `CUSTOMER`. Mọi chỗ so role lấy từ đây. |
| `common/decorators/roles.decorator.ts` | `@Roles(...)` gắn role được phép lên route. |
| `common/decorators/current-user.decorator.ts` | Lấy user đang đăng nhập từ request. |
| `common/guards/jwt-auth.guard.ts` | Chặn route khi chưa đăng nhập. |
| `common/guards/roles.guard.ts` | Chặn route khi user không có role trong `@Roles`. |
| `src/prisma/prisma.module.ts` | Đưa `PrismaService` cho module khác dùng. |
| `src/prisma/prisma.service.ts` | Một kết nối Prisma cho cả app. Mở khi app chạy, đóng khi app tắt. |
| `prisma/schema.prisma` | Bảng và quan hệ. Một bảng `User`, role qua `UserRole`. |
| `prisma/seed.ts` | Tạo sẵn bốn role. Chạy lại không tạo trùng. |

`auth/` và `users/` cùng dạng folder chức năng (module, controller, service, dto). Guard và strategy dùng chung để ở `common/guards` và `auth/strategies`, không copy vào từng chức năng.

## Quyền

Hai câu hỏi, hai chỗ:

1. Role này có được gọi route không? Trả lời ở controller bằng `JwtAuthGuard` rồi `RolesGuard` và `@Roles(...)`.
2. User này có được đụng đúng bản ghi không? Trả lời ở `policies/` của chức năng đó.

Ví dụ lịch hẹn, một folder `bookings`:

- Customer tạo lịch và chỉ xem, hủy lịch của mình.
- Staff xem lịch được giao cho mình.
- Manager xem và sửa lịch trong chi nhánh của mình.
- Admin thao tác toàn bộ.

Route đặt theo tài nguyên, không theo role: `POST /bookings`, `GET /bookings/:id`, `PATCH /users/:id/roles`. Không tạo `GET /admin/bookings` song song với `GET /customer/bookings` cho cùng một việc.

Đăng ký công khai luôn gán `CUSTOMER`. `STAFF` và `MANAGER` chỉ được gán qua endpoint quản lý tài khoản, dành cho `ADMIN` (và `MANAGER` nếu nghiệp vụ cho phép).

Hồ sơ tách khỏi tài khoản khi trường khác nhau: `customers` giữ ghi chú, dị ứng; `staff` giữ chi nhánh, chuyên môn, ca. Cả hai trỏ về `User`. Không tạo bốn bảng user.

## Thứ tự khi thêm một chức năng

1. Thêm model vào `prisma/schema.prisma` nếu cần bảng mới, rồi migration.
2. Tạo folder `src/<chuc-nang>/` với module, controller, service, dto.
3. Import module trong `app.module.ts`.
4. Gắn guard trên route cần đăng nhập hoặc cần role.
5. Thêm `policies/` khi cùng một route mà mỗi role thấy một tập bản ghi khác nhau.
6. Thêm role mới thì sửa `common/constants/roles.ts` và `prisma/seed.ts`, rồi mới dùng trong `@Roles`.

## Không làm

- Không tách folder theo role.
- Không đặt query Prisma trong controller.
- Không trả `passwordHash` ra API. Kiểu trả về công khai nằm cạnh service (ví dụ `PublicUser` trong `users`).
- Không thêm file schema trong folder chức năng.
- Không tạo repository cho đến khi service vừa chứa quy tắc vừa chứa nhiều câu query dài.
- Không để `users` import `auth` chỉ để dùng guard. Guard nằm ở `common/guards`.
