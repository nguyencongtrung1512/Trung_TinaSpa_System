import { apiUrl, clearSession, isSession, loadSession, saveSession, type AuthSession } from '~/lib/auth'

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message)
  }
}

interface RequestOptions {
  readonly method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  readonly body?: unknown
  /** Sends the access token and retries once with a refreshed token on 401. */
  readonly auth?: boolean
}

const apiMessages: Record<string, string> = {
  'Service category slug already exists': 'Slug nhóm dịch vụ đã tồn tại.',
  'Service slug already exists': 'Slug dịch vụ đã tồn tại.',
  'Service category still has services': 'Nhóm vẫn còn dịch vụ. Hãy xóa hoặc chuyển các dịch vụ sang nhóm khác trước.',
  'Service category not found': 'Không tìm thấy nhóm dịch vụ.',
  'Service not found': 'Không tìm thấy dịch vụ.',
  'Phone number already registered': 'Số điện thoại đã được dùng cho tài khoản khác.',
  'Insufficient role': 'Tài khoản không có quyền thực hiện thao tác này.',
  Unauthorized: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
}

let refreshing: Promise<AuthSession | null> | null = null

function refreshSession(): Promise<AuthSession | null> {
  const session = loadSession()
  if (!session) return Promise.resolve(null)

  refreshing ??= (async () => {
    try {
      const response = await fetch(apiUrl('/api/auth/refresh'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: session.refreshToken })
      })
      const data: unknown = response.ok ? await response.json() : null
      if (!isSession(data)) {
        clearSession()
        return null
      }
      saveSession(data)
      return data
    } catch {
      return null
    } finally {
      refreshing = null
    }
  })()

  return refreshing
}

export async function apiRequest<T>(
  path: string,
  { method = 'GET', body, auth = false }: RequestOptions = {}
): Promise<T> {
  const send = (token: string | undefined) =>
    fetch(apiUrl(`/api${path}`), {
      method,
      headers: {
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: body === undefined ? undefined : JSON.stringify(body)
    })

  let response: Response
  try {
    response = await send(auth ? loadSession()?.accessToken : undefined)
    if (auth && response.status === 401) {
      const next = await refreshSession()
      if (next) response = await send(next.accessToken)
    }
  } catch {
    throw new ApiError('Không thể kết nối máy chủ. Vui lòng thử lại.', 0)
  }

  if (!response.ok) {
    throw new ApiError(await readApiError(response), response.status)
  }
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

async function readApiError(response: Response) {
  const fallback = 'Không thể hoàn tất yêu cầu. Vui lòng thử lại.'
  try {
    const data: unknown = await response.json()
    if (!data || typeof data !== 'object' || !('message' in data)) return fallback
    const messages = Array.isArray(data.message) ? data.message.map(String) : [String(data.message)]
    const known = messages.map((message) => apiMessages[message])
    if (known.every(Boolean)) return known.join(' ')
    return response.status === 400 ? `Dữ liệu chưa hợp lệ: ${messages.join('; ')}` : fallback
  } catch {
    return fallback
  }
}
