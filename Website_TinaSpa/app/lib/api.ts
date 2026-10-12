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
  'File storage is not configured': 'Kho lưu trữ ảnh chưa được cấu hình. Vui lòng liên hệ quản trị viên.',
  'File extension does not match content type': 'Đuôi tệp không khớp với định dạng ảnh.',
  'Unsupported file extension': 'Chỉ hỗ trợ ảnh JPG, PNG, WEBP hoặc GIF.',
  'Unsupported content type': 'Chỉ hỗ trợ ảnh JPG, PNG, WEBP hoặc GIF.',
  'Object not found': 'Không tìm thấy tệp.',
  'Branch not found': 'Khu vực không tồn tại hoặc đã ngừng nhận lịch.',
  'Appointment not found': 'Không tìm thấy lịch hẹn.',
  'Appointment already exists on this date': 'Số điện thoại này đã có lịch hẹn trong ngày đã chọn.',
  'Appointment time has passed': 'Giờ hẹn đã qua, vui lòng chọn thời gian khác.',
  'Appointment time is outside opening hours': 'Giờ hẹn nằm ngoài giờ mở cửa của khu vực.',
  'Only pending appointments can be confirmed': 'Chỉ xác nhận được lịch đang chờ xác nhận.',
  'Customer has already checked in': 'Khách đã check-in, không thể đổi thời gian hoặc khu vực.',
  'Customer not found': 'Không tìm thấy khách hàng.',
  'Customer service not found': 'Không tìm thấy dịch vụ đã ghi nhận.',
  'usedAt must not be in the future': 'Ngày sử dụng không được ở tương lai.',
  'Current password is incorrect': 'Mật khẩu hiện tại không đúng.',
  'New password must differ from the current password': 'Mật khẩu mới phải khác mật khẩu hiện tại.',
  'phone is not a valid phone number': 'Số điện thoại không hợp lệ.',
  'Blog not found': 'Không tìm thấy bài viết.',
  'Blog category not found': 'Không tìm thấy danh mục bài viết.',
  'Blog slug already exists': 'Đường dẫn bài viết đã tồn tại, hãy đổi slug.',
  'Blog category slug already exists': 'Đường dẫn danh mục đã tồn tại, hãy đổi slug.',
  'Product not found': 'Không tìm thấy sản phẩm.',
  'Product slug already exists': 'Đường dẫn sản phẩm đã tồn tại, hãy đổi slug.',
  'Product category not found': 'Không tìm thấy danh mục sản phẩm.',
  'Product category slug already exists': 'Đường dẫn danh mục đã tồn tại, hãy đổi slug.',
  'Product category still has products': 'Danh mục vẫn còn sản phẩm. Hãy xóa hoặc chuyển sản phẩm sang danh mục khác trước.',
  'compareAtPrice must not be lower than price': 'Giá gốc phải lớn hơn hoặc bằng giá bán.',
  'At least one variant is required': 'Sản phẩm cần ít nhất một phiên bản.',
  'Variant SKU already exists': 'Mã SKU đã tồn tại, hãy đổi mã khác.',
  'Variant SKU must be unique': 'Mã SKU của các phiên bản không được trùng nhau.',
  'Product variant not found': 'Không tìm thấy phiên bản sản phẩm.',
  'Only draft blogs can be edited': 'Chỉ sửa được bài đang ở trạng thái bản nháp.',
  'publishedAt is required for published blogs': 'Bài xuất bản phải có thời gian xuất bản.',
  'slug must be lowercase letters, digits and hyphens': 'Đường dẫn chỉ gồm chữ thường, số và dấu gạch ngang.',
  'thumbnailURL must be an https URL or a site-relative path': 'Ảnh đại diện chỉ nhận đường dẫn https:// hoặc đường dẫn nội bộ bắt đầu bằng /.',
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
    if (response.status === 403) return apiMessages['Insufficient role']
    if (response.status === 413) return 'Tệp vượt quá dung lượng cho phép.'
    return response.status === 400 ? `Dữ liệu chưa hợp lệ: ${messages.join('; ')}` : fallback
  } catch {
    return fallback
  }
}
