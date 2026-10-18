import { useSyncExternalStore } from 'react'

export type AuthUser = {
  userID: string
  phone: string
  fullName: string
  avatar?: string | null
  address?: string | null
  dateOfBirth?: string | null
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | null
  role: string
  isActive: boolean
  mustChangePassword?: boolean
  branchID?: string | null
  createdAt?: string
}

export type AuthSession = {
  accessToken: string
  refreshToken: string
  user: AuthUser
  roles: string[]
}

const STORAGE_KEY = 'tina-spa.session'

const errorMessages: Record<string, string> = {
  'Invalid credentials': 'Số điện thoại hoặc mật khẩu không đúng.',
  'Phone number already registered': 'Số điện thoại này đã được đăng ký.',
  'Account is inactive': 'Tài khoản đang bị khóa.',
  'phone must be a valid phone number': 'Số điện thoại không hợp lệ.',
  'password must be longer than or equal to 8 characters': 'Mật khẩu cần ít nhất 8 ký tự.',
  'fullName must be longer than or equal to 2 characters': 'Họ tên cần ít nhất 2 ký tự.',
  'fullName should not be empty': 'Vui lòng nhập họ tên.',
  'password should not be empty': 'Vui lòng nhập mật khẩu.'
}

export function loadSession(): AuthSession | null {
  if (typeof window === 'undefined') return null

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    const parsed: unknown = JSON.parse(raw)
    return isSession(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function saveSession(session: AuthSession) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  window.dispatchEvent(new Event('tina-session'))
}

export function clearSession() {
  window.localStorage.removeItem(STORAGE_KEY)
  window.dispatchEvent(new Event('tina-session'))
}

let cachedRaw: string | null = null
let cachedSession: AuthSession | null = null

function sessionSnapshot() {
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (raw !== cachedRaw) {
    cachedRaw = raw
    cachedSession = loadSession()
  }
  return cachedSession
}

export function useSession() {
  return useSyncExternalStore(subscribeSession, sessionSnapshot, () => null)
}

function subscribeSession(onChange: () => void) {
  window.addEventListener('storage', onChange)
  window.addEventListener('tina-session', onChange)
  return () => {
    window.removeEventListener('storage', onChange)
    window.removeEventListener('tina-session', onChange)
  }
}

export function login(input: { phone: string; password: string }) {
  return requestAuth('/api/auth/login', input)
}

export function register(input: { phone: string; password: string; fullName: string }) {
  return requestAuth('/api/auth/register', input)
}

export function apiUrl(path: string) {
  const base = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? ''
  return `${base}${path}`
}

async function requestAuth(path: string, body: { phone: string; password: string; fullName?: string }) {
  let response: Response

  try {
    response = await fetch(apiUrl(path), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
  } catch {
    throw new Error('Không thể kết nối máy chủ. Vui lòng thử lại.')
  }

  if (!response.ok) {
    throw new Error(await readError(response))
  }

  const data: unknown = await response.json()
  if (!isSession(data)) {
    throw new Error('Phản hồi từ máy chủ không hợp lệ.')
  }

  return data
}

async function readError(response: Response) {
  try {
    const data: unknown = await response.json()
    if (data && typeof data === 'object' && 'message' in data) {
      const message = data.message
      if (Array.isArray(message)) {
        return message.map((item) => translate(String(item))).join(' ')
      }
      if (typeof message === 'string') return translate(message)
    }
  } catch {
    return 'Không thể hoàn tất yêu cầu. Vui lòng thử lại.'
  }

  return 'Không thể hoàn tất yêu cầu. Vui lòng thử lại.'
}

function translate(message: string) {
  return errorMessages[message] ?? 'Không thể hoàn tất yêu cầu. Vui lòng thử lại.'
}

export function isSession(value: unknown): value is AuthSession {
  if (!value || typeof value !== 'object') return false

  const session = value as Partial<AuthSession>
  const user = session.user
  return (
    typeof session.accessToken === 'string' &&
    typeof session.refreshToken === 'string' &&
    Array.isArray(session.roles) &&
    !!user &&
    typeof user.userID === 'string' &&
    typeof user.phone === 'string' &&
    typeof user.fullName === 'string'
  )
}
