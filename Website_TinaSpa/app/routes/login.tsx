import { LoginPage } from '~/login/LoginPage'

export function meta() {
  return [
    { title: 'Đăng nhập — Dr Tina Beauty' },
    { name: 'description', content: 'Đăng nhập cổng khách hàng Dr Tina Beauty để quản lý lịch hẹn và phác đồ trị liệu.' }
  ]
}

export default function Login() {
  return <LoginPage />
}
