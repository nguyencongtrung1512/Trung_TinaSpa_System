import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { Icon } from '~/components/ui/Icon'
import { login, register, saveSession } from '~/lib/auth'

const legalLinks = [
  { label: 'Điều khoản dịch vụ', href: '/#lien-he' },
  { label: 'Bảo mật thông tin', href: '/#lien-he' },
  { label: 'Quy trình trị liệu', href: '/#dich-vu' }
] as const

type AuthTab = 'login' | 'register'

export function LoginPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<AuthTab>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const isLogin = tab === 'login'
  const submitLabel = pending ? 'Đang xử lý...' : isLogin ? 'Đăng nhập' : 'Đăng ký'

  function selectTab(next: AuthTab) {
    setTab(next)
    setError(null)
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const normalizedPhone = phone.replace(/[\s.-]/g, '')
    if (!/^\+?[0-9]{9,15}$/.test(normalizedPhone)) {
      setError('Số điện thoại không hợp lệ.')
      return
    }

    if (!isLogin && fullName.trim().length < 2) {
      setError('Họ tên cần ít nhất 2 ký tự.')
      return
    }

    if (!isLogin && password.length < 8) {
      setError('Mật khẩu cần ít nhất 8 ký tự.')
      return
    }

    setPending(true)
    try {
      const session = isLogin
        ? await login({ phone: normalizedPhone, password })
        : await register({ phone: normalizedPhone, password, fullName: fullName.trim() })
      saveSession(session)
      navigate('/')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Không thể kết nối máy chủ. Vui lòng thử lại.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className='grid min-h-dvh bg-canvas lg:grid-cols-2'>
      <aside className='relative hidden min-h-dvh overflow-hidden lg:block'>
        <img
          src='/images/screen.png'
          alt='Không gian trị liệu Dr Tina Beauty'
          className='absolute inset-0 h-full w-full object-cover'
        />
        <div className='absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/10 to-white/10' />

        <div className='relative flex h-full flex-col justify-between p-8 text-white'>
          <div className='flex items-start justify-between gap-4'>
            <Link to='/' className='inline-flex items-center gap-3'>
              <img src='/images/logo.png' alt='Dr Tina Beauty' className='h-14 w-auto rounded-full bg-white p-1' />
              <span>
                <span className='block text-sm font-extrabold tracking-wide'>DR TINA BEAUTY</span>
                <span className='block text-[10px] tracking-[0.18em] uppercase'>Clinical & Aesthetic Spa</span>
              </span>
            </Link>
            <span className='inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-clinic'>
              <Icon name='spa' size={16} />
              Sanctuary Rituals
            </span>
          </div>

          <div className='max-w-md'>
            <span className='inline-flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-1.5 text-xs font-semibold text-clinic'>
              <Icon name='bolt' size={16} />
              Không gian phục hồi năng lượng
            </span>
            <h1 className='mt-5 text-4xl leading-tight font-extrabold text-white'>
              Nơi tái sinh <span className='text-rose-soft italic'>vẻ đẹp tự nhiên</span> & sự tĩnh tại.
            </h1>
            <p className='mt-4 text-sm leading-6 text-white/90'>
              Điểm nhấn trong không gian kiến trúc trị liệu tối giản, nâng niu làn da bằng công nghệ thẩm mỹ chuyên sâu
              cùng các nghi thức dưỡng tâm an hòa.
            </p>
            <div className='mt-6 flex items-center gap-3'>
              <span className='inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-clinic'>
                <Icon name='verified_user' size={22} />
              </span>
              <span>
                <span className='block text-sm font-extrabold'>100% Chuyên gia Y khoa</span>
                <span className='block text-xs text-white/80'>Quy chuẩn vô khuẩn và liệu trình cá nhân hóa</span>
              </span>
            </div>
          </div>

          <div className='flex items-center justify-between text-xs text-white/85'>
            <span className='inline-flex items-center gap-1'>
              <Icon name='location_on' size={16} />
              Quận 1, Thành phố Hồ Chí Minh
            </span>
            <span>Holistic Spa Sanctuary © {new Date().getFullYear()}</span>
          </div>
        </div>
      </aside>

      <main className='flex min-h-dvh flex-col px-5 py-6 sm:px-10'>
        <div className='flex items-center justify-between gap-4 text-sm'>
          <Link to='/' className='inline-flex items-center gap-1 font-semibold text-ink hover:text-clinic'>
            <Icon name='arrow_back' size={18} />
            Quay lại trang chủ
          </Link>
          <a href='tel:19001234' className='inline-flex items-center gap-1 text-muted hover:text-clinic'>
            <Icon name='support_agent' size={18} />
            Hỗ trợ đặt hẹn: 1900 1234
          </a>
        </div>

        <div className='mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12'>
          <p className='text-xs font-bold tracking-[0.22em] text-clinic uppercase'>Dr Tina Client Portal</p>
          <h2 className='mt-3 text-4xl font-extrabold tracking-tight text-ink'>
            {isLogin ? 'Chào mừng bạn trở lại' : 'Tạo tài khoản hội viên'}
          </h2>
          <p className='mt-3 text-sm leading-6 text-muted'>
            {isLogin
              ? 'Đăng nhập để quản lý lịch hẹn, theo dõi phác đồ trị liệu và các đặc quyền hội viên của bạn.'
              : 'Đăng ký bằng số điện thoại để đặt lịch và theo dõi liệu trình tại Dr Tina Beauty.'}
          </p>

          <div role='tablist' aria-label='Hình thức tài khoản' className='mt-8 grid grid-cols-2 rounded-full bg-mist p-1'>
            <button
              type='button'
              role='tab'
              id='tab-login'
              aria-selected={isLogin}
              aria-controls='auth-panel'
              className={`min-h-11 rounded-full text-sm font-bold transition ${
                isLogin ? 'bg-clinic text-white shadow-[0_8px_18px_var(--color-whisper-shadow)]' : 'text-ink hover:text-clinic'
              }`}
              onClick={() => selectTab('login')}
            >
              Đăng nhập
            </button>
            <button
              type='button'
              role='tab'
              id='tab-register'
              aria-selected={!isLogin}
              aria-controls='auth-panel'
              className={`min-h-11 rounded-full text-sm font-bold transition ${
                isLogin ? 'text-ink hover:text-clinic' : 'bg-clinic text-white shadow-[0_8px_18px_var(--color-whisper-shadow)]'
              }`}
              onClick={() => selectTab('register')}
            >
              Đăng ký
            </button>
          </div>

          <form id='auth-panel' role='tabpanel' aria-labelledby={isLogin ? 'tab-login' : 'tab-register'} className='mt-6 space-y-5' onSubmit={onSubmit}>
            {isLogin ? null : (
              <div>
                <label htmlFor='fullName' className='mb-2 block text-sm font-semibold text-ink'>
                  Họ và tên <span className='text-clinic'>*</span>
                </label>
                <div className='flex items-center gap-2 rounded-full border border-rose-soft bg-white px-4'>
                  <Icon name='person' size={18} className='text-muted' />
                  <input
                    id='fullName'
                    name='fullName'
                    type='text'
                    autoComplete='name'
                    required
                    minLength={2}
                    maxLength={100}
                    value={fullName}
                    placeholder='Nhập họ và tên'
                    className='h-12 w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted'
                    onChange={(event) => setFullName(event.target.value)}
                  />
                </div>
              </div>
            )}

            <div>
              <div className='mb-2 flex items-center justify-between text-sm'>
                <label htmlFor='phone' className='font-semibold text-ink'>
                  Số điện thoại <span className='text-clinic'>*</span>
                </label>
                <span className='text-xs text-muted'>9–15 chữ số</span>
              </div>
              <div className='flex items-center gap-2 rounded-full border border-rose-soft bg-white px-4'>
                <Icon name='call' size={18} className='text-muted' />
                <input
                  id='phone'
                  name='phone'
                  type='tel'
                  inputMode='numeric'
                  autoComplete='tel'
                  required
                  maxLength={16}
                  value={phone}
                  placeholder='Nhập số điện thoại (ví dụ: 0901 234 567)'
                  className='h-12 w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted'
                  onChange={(event) => setPhone(event.target.value)}
                />
              </div>
            </div>

            <div>
              <div className='mb-2 flex items-center justify-between text-sm'>
                <label htmlFor='password' className='font-semibold text-ink'>
                  Mật khẩu <span className='text-clinic'>*</span>
                </label>
                <span className='text-xs text-muted'>{isLogin ? 'Mật khẩu tài khoản' : 'Tối thiểu 8 ký tự'}</span>
              </div>
              <div className='flex items-center gap-2 rounded-full border border-rose-soft bg-white px-4'>
                <Icon name='lock' size={18} className='text-muted' />
                <input
                  id='password'
                  name='password'
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  required
                  minLength={isLogin ? undefined : 8}
                  maxLength={128}
                  value={password}
                  placeholder='Nhập mật khẩu'
                  className='h-12 w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted'
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button
                  type='button'
                  className='inline-flex min-h-11 min-w-11 items-center justify-center text-muted hover:text-clinic'
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  onClick={() => setShowPassword((value) => !value)}
                >
                  <Icon name={showPassword ? 'visibility_off' : 'visibility'} size={20} />
                </button>
              </div>
            </div>

            {error ? (
              <p role='alert' className='rounded-2xl bg-mist px-4 py-3 text-sm font-medium text-clinic'>
                {error}
              </p>
            ) : null}

            <button
              type='submit'
              disabled={pending}
              className='inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-clinic text-sm font-bold tracking-wide text-white uppercase shadow-[0_12px_28px_var(--color-whisper-shadow)] transition hover:bg-clinic-deep disabled:cursor-not-allowed disabled:opacity-70'
            >
              {submitLabel}
              <Icon name='arrow_forward' size={18} className='text-white' />
            </button>
          </form>
        </div>

        <footer className='mx-auto w-full max-w-md pb-2 text-center'>
          <nav className='flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] font-semibold tracking-wide text-muted uppercase'>
            {legalLinks.map((item) => (
              <Link key={item.label} to={item.href} className='hover:text-clinic'>
                {item.label}
              </Link>
            ))}
          </nav>
          <p className='mt-3 text-xs text-muted'>DR TINA BEAUTY Hotline: 1900 1234</p>
        </footer>
      </main>
    </div>
  )
}
