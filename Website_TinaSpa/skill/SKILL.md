---
name: tinaspa-frontend
description: >-
  Dựng và mở rộng frontend Dr Tina Beauty trong Website_TinaSpa/app cho 5 role
  guest, customer, staff, manager, admin. Dùng khi thêm route, layout, trang
  portal, phân quyền UI, hoặc khi người dùng nhắc cấu trúc src/app frontend.
---

# Frontend TinaSpa

Gốc mã frontend là `Website_TinaSpa/app/`. Alias `~/` trỏ vào `app/` (`tsconfig.json`). Không tạo thư mục `src/` song song.

Route khai báo tường minh trong `app/routes.ts` bằng `layout`, `prefix`, `route`, `index` từ `@react-router/dev/routes`. Không dùng file-based routing và không đặt tên file kiểu `_portal.customer.tsx`.

## Hai vỏ

| Vỏ | File | Ai dùng |
|---|---|---|
| Site | `app/components/layout/SiteShell.tsx` | Guest và mọi người khi xem trang marketing |
| Portal | `app/components/layout/PortalShell.tsx` | Customer, staff, manager, admin sau đăng nhập |

`SiteShell` giữ header/footer marketing. `PortalShell` là sidebar + nội dung; mục menu lọc bằng `can()`, không viết `if (role === ...)` trong từng trang.

## Cây thư mục

```text
app/
  root.tsx
  routes.ts
  routes/
    home.tsx
    about.tsx
    services.tsx
    booking.tsx
    login.tsx
    register.tsx
    portal/
      index.tsx
      customer/
      staff/
      manager/
      admin/
  layouts/
    public.tsx          # bọc SiteShell
    portal.tsx          # bắt đăng nhập + PortalShell
    customer.tsx
    staff.tsx
    manager.tsx
    admin.tsx
  features/             # UI và logic theo nghiệp vụ
    booking/
    appointments/
    customers/
    services/
    users/
  components/
    ui/
    layout/
  lib/
    auth/
      roles.ts
      permissions.ts
      session.ts
    api/
```

File trong `routes/` và `layouts/` chỉ gắn layout, loader và compose màn hình. Màn hình nằm trong `features/`.

## Route

```ts
import { type RouteConfig, index, layout, prefix, route } from '@react-router/dev/routes'

export default [
  layout('layouts/public.tsx', [
    index('routes/home.tsx'),
    route('about', 'routes/about.tsx'),
    route('services', 'routes/services.tsx'),
    route('booking', 'routes/booking.tsx')
  ]),
  route('login', 'routes/login.tsx'),
  route('register', 'routes/register.tsx'),
  ...prefix('portal', [
    layout('layouts/portal.tsx', [
      index('routes/portal/index.tsx'),
      ...prefix('customer', [
        layout('layouts/customer.tsx', [
          index('routes/portal/customer/home.tsx'),
          route('bookings', 'routes/portal/customer/bookings.tsx')
        ])
      ]),
      ...prefix('staff', [
        layout('layouts/staff.tsx', [
          index('routes/portal/staff/home.tsx'),
          route('schedule', 'routes/portal/staff/schedule.tsx')
        ])
      ]),
      ...prefix('manager', [
        layout('layouts/manager.tsx', [
          index('routes/portal/manager/home.tsx'),
          route('reports', 'routes/portal/manager/reports.tsx')
        ])
      ]),
      ...prefix('admin', [
        layout('layouts/admin.tsx', [
          index('routes/portal/admin/home.tsx'),
          route('users', 'routes/portal/admin/users.tsx')
        ])
      ])
    ])
  ])
] satisfies RouteConfig
```

URL:

- Công khai: `/`, `/about`, `/services`, `/booking`, `/login`, `/register`
- Customer: `/portal/customer`, `/portal/customer/bookings`
- Staff: `/portal/staff`, `/portal/staff/schedule`
- Manager: `/portal/manager`, `/portal/manager/reports`
- Admin: `/portal/admin`, `/portal/admin/users`

`routes/portal/index.tsx` chỉ redirect về home của role hiện tại.

`layout()` không thêm đoạn URL. `prefix()` thêm đoạn (`portal`, `customer`, …) và trả về mảng nên phải spread (`...prefix(...)`). Layout role chỉ render `<Outlet />` sau khi kiểm tra role. Giữ path tương đối từ `app/` như `routes.ts` hiện tại, không thêm tiền tố `./`.

## Quyền

Role là nhãn. Quyền là thứ route và menu kiểm tra. Một nguồn trong `app/lib/auth/permissions.ts`. Chuỗi role trùng enum backend `RoleName`.

```ts
export const Role = {
  GUEST: 'guest',
  CUSTOMER: 'customer',
  STAFF: 'staff',
  MANAGER: 'manager',
  ADMIN: 'admin'
} as const

export type Role = (typeof Role)[keyof typeof Role]

export const permissions = {
  'site.view': [Role.GUEST, Role.CUSTOMER, Role.STAFF, Role.MANAGER, Role.ADMIN],
  'booking.create': [Role.GUEST, Role.CUSTOMER],
  'booking.viewOwn': [Role.CUSTOMER],
  'appointment.operate': [Role.STAFF, Role.MANAGER, Role.ADMIN],
  'report.view': [Role.MANAGER, Role.ADMIN],
  'user.manage': [Role.ADMIN]
} as const

export type Permission = keyof typeof permissions

export function can(role: Role, permission: Permission) {
  return (permissions[permission] as readonly Role[]).includes(role)
}
```

Staff không thấy màn customer. Customer không thấy màn nội bộ. Thêm màn mới thì thêm key quyền trước, rồi mới thêm route.

## Chặn truy cập

`layouts/portal.tsx`: không có session thì `redirect('/login')`.

Layout role (`layouts/customer.tsx` và tương đương): role hiện tại khác role của layout thì `redirect` về home của role đó (`/portal/staff`, …).

Loader layout là chỗ duy nhất kiểm tra session và role. Trang con tin layout cha.

## Tính năng dùng chung

Cùng nghiệp vụ, khác quyền thì một feature, nhiều trang lắp lại. Ví dụ lịch hẹn nằm ở `features/appointments`: customer xem lịch của mình, staff xem lịch trong ngày, manager xem cả cơ sở.

## Thứ tự khi dựng mới

1. `lib/auth/roles.ts` và `permissions.ts`
2. Chuyển route hiện có (`home`, `about`, `login`) vào `layout('layouts/public.tsx', ...)` vẫn bọc `SiteShell`
3. `layouts/portal.tsx` + `PortalShell` + redirect `/portal`
4. Customer, rồi staff, manager, admin

Trang marketing đã có trong `app/routes/` thì sửa tại chỗ, không tạo bản sao.
