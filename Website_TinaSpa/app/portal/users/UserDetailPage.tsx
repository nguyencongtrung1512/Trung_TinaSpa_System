import { useEffect, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router'
import { motion, useReducedMotion } from 'framer-motion'
import { Icon } from '~/components/ui/Icon'
import { formatPhone } from '~/portal/appointments/appointments.api'
import { formatPortalDate } from '~/portal/format'
import { formatPrice } from '~/portal/manager/services/catalog.api'
import { outlineButtonClass } from '~/portal/manager/services/form-ui'
import { portalRoleLabel } from '~/portal/navigation'
import { portalCardClass } from '~/portal/styles'
import type { PortalRole } from '~/portal/types'
import { ageFromDateOfBirth, getUserDetail, userGenderLabels, userRoleLabels, type UserDetail } from './users.api'

const dateFormatter = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
const dateTimeFormatter = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' })

/** Every status the API can return, including the in-service steps the booking screens don't list. */
const appointmentStatus: Record<string, { readonly label: string; readonly className: string }> = {
  PENDING: { label: 'Chờ xác nhận', className: 'bg-amber-50 text-amber-700' },
  CONFIRMED: { label: 'Đã xác nhận', className: 'bg-mist text-clinic' },
  ARRIVED: { label: 'Đã đến', className: 'bg-sky-50 text-sky-700' },
  IN_SERVICE: { label: 'Đang phục vụ', className: 'bg-violet-50 text-violet-700' },
  COMPLETED: { label: 'Hoàn thành', className: 'bg-emerald-50 text-emerald-700' },
  CANCELLED: { label: 'Đã hủy', className: 'bg-canvas text-muted' }
}

function initials(fullName: string) {
  const words = fullName.trim().split(/\s+/)
  return (words.length > 1 ? words[0][0] + words[words.length - 1][0] : (words[0]?.slice(0, 2) ?? '?')).toUpperCase()
}

function InfoRow({
  icon,
  label,
  children
}: {
  readonly icon: string
  readonly label: string
  readonly children: ReactNode
}) {
  return (
    <div className='flex items-start gap-3 py-2.5'>
      <Icon name={icon} size={18} className='mt-0.5 shrink-0 text-clinic' />
      <dt className='w-24 shrink-0 text-sm text-muted'>{label}</dt>
      <dd className='min-w-0 flex-1 text-sm font-semibold break-words text-ink'>{children}</dd>
    </div>
  )
}

function StatTile({
  icon,
  label,
  value,
  hint
}: {
  readonly icon: string
  readonly label: string
  readonly value: string
  readonly hint?: string
}) {
  return (
    <div className={`${portalCardClass} p-4`}>
      <p className='flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-muted uppercase'>
        <Icon name={icon} size={16} className='text-clinic' />
        {label}
      </p>
      <p className='mt-1.5 text-2xl font-extrabold text-ink tabular-nums'>{value}</p>
      {hint ? <p className='mt-0.5 text-xs text-muted'>{hint}</p> : null}
    </div>
  )
}

function EmptyRow({ colSpan, children }: { readonly colSpan: number; readonly children: ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className='px-4 py-10 text-center text-sm text-muted'>
        {children}
      </td>
    </tr>
  )
}

export interface UserDetailPageProps {
  readonly role: PortalRole
  /** List page to go back to, e.g. `/portal/manager/staff`. */
  readonly backTo: string
  readonly backLabel: string
}

export function UserDetailPage({ role, backTo, backLabel }: UserDetailPageProps) {
  const { userID = '' } = useParams()
  const reduceMotion = useReducedMotion()
  const [detail, setDetail] = useState<UserDetail>()
  const [error, setError] = useState<string>()
  const [reloadKey, setReloadKey] = useState(0)
  const [avatarBroken, setAvatarBroken] = useState(false)

  useEffect(() => {
    let cancelled = false
    setError(undefined)
    getUserDetail(userID)
      .then((next) => !cancelled && setDetail(next))
      .catch((reason: unknown) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : 'Không tải được thông tin tài khoản.')
      })
    return () => {
      cancelled = true
    }
  }, [userID, reloadKey])

  const backLink = (
    <Link
      to={backTo}
      className='inline-flex items-center gap-1 text-sm font-semibold text-muted transition hover:text-clinic'
    >
      <Icon name='arrow_back' size={18} />
      {backLabel}
    </Link>
  )

  if (error) {
    return (
      <div>
        {backLink}
        <div className={`${portalCardClass} mt-6 flex flex-col items-center gap-3 px-6 py-14 text-center`}>
          <Icon name='person_off' size={32} className='text-clinic' />
          <p className='text-sm text-ink'>{error}</p>
          <button type='button' className={outlineButtonClass} onClick={() => setReloadKey((key) => key + 1)}>
            <Icon name='refresh' size={18} />
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  if (!detail) {
    return (
      <div>
        {backLink}
        <div className='mt-6 grid gap-4 lg:grid-cols-[340px_1fr]'>
          <div className='h-96 animate-pulse rounded-[28px] bg-white/70' />
          <div className='space-y-4'>
            <div className='h-28 animate-pulse rounded-[28px] bg-white/70' />
            <div className='h-64 animate-pulse rounded-[28px] bg-white/70' />
          </div>
        </div>
      </div>
    )
  }

  const { user, stats, services, appointments } = detail
  const isCustomer = user.role === 'CUSTOMER'
  const age = ageFromDateOfBirth(user.dateOfBirth)

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {backLink}
      <div className='mt-3 flex flex-wrap items-center gap-3 text-xs font-bold tracking-[0.16em] text-clinic'>
        <span>{portalRoleLabel[role]}</span>
        <span className='font-medium tracking-normal text-muted'>{formatPortalDate(new Date())}</span>
      </div>
      <h1 className='mt-2 text-3xl font-extrabold text-ink sm:text-4xl'>{user.fullName}</h1>

      <div className='mt-6 grid items-start gap-4 lg:grid-cols-[340px_1fr]'>
        <aside className={`${portalCardClass} p-5`} aria-label='Thông tin tài khoản'>
          <div className='flex flex-col items-center text-center'>
            <span className='grid size-24 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-rose-soft to-clinic/70 text-2xl font-extrabold text-white'>
              {user.avatar && !avatarBroken ? (
                <img
                  src={user.avatar}
                  alt=''
                  className='size-full object-cover'
                  onError={() => setAvatarBroken(true)}
                />
              ) : (
                initials(user.fullName)
              )}
            </span>
            <p className='mt-3 font-mono text-xs text-muted'>{user.userID}</p>
            <div className='mt-2 flex flex-wrap justify-center gap-1.5'>
              <span className='rounded-full bg-mist px-2.5 py-0.5 text-xs font-bold text-clinic'>
                {userRoleLabels[user.role] ?? user.role}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  user.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-ink/5 text-muted'
                }`}
              >
                <span className={`size-1.5 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-muted'}`} />
                {user.isActive ? 'Hoạt động' : 'Đã khóa'}
              </span>
              {user.mustChangePassword ? (
                <span className='rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700'>
                  Chưa đổi mật khẩu
                </span>
              ) : null}
            </div>
          </div>

          <dl className='mt-5 divide-y divide-rose-soft/40 border-t border-rose-soft/40'>
            <InfoRow icon='call' label='Điện thoại'>
              <a href={`tel:${user.phone}`} className='tabular-nums hover:text-clinic'>
                {formatPhone(user.phone)}
              </a>
            </InfoRow>
            <InfoRow icon='location_on' label='Khu vực'>
              {user.branchName ?? user.branchID ?? 'Toàn hệ thống'}
            </InfoRow>
            <InfoRow icon='wc' label='Giới tính'>
              {user.gender ? userGenderLabels[user.gender] : '—'}
            </InfoRow>
            <InfoRow icon='cake' label='Ngày sinh'>
              {user.dateOfBirth ? `${dateFormatter.format(new Date(user.dateOfBirth))} · ${age} tuổi` : '—'}
            </InfoRow>
            <InfoRow icon='home' label='Địa chỉ'>
              {user.address ?? '—'}
            </InfoRow>
            <InfoRow icon='event' label='Ngày tạo'>
              {dateTimeFormatter.format(new Date(user.createdAt))}
            </InfoRow>
          </dl>
        </aside>

        <div className='min-w-0 space-y-4'>
          <div className='grid gap-4 sm:grid-cols-3'>
            <StatTile
              icon='receipt_long'
              label={isCustomer ? 'Dịch vụ đã dùng' : 'Dịch vụ đã ghi'}
              value={String(stats.serviceCount)}
              hint={stats.lastServiceAt ? `Gần nhất ${dateFormatter.format(new Date(stats.lastServiceAt))}` : 'Chưa có'}
            />
            <StatTile
              icon='payments'
              label={isCustomer ? 'Tổng chi tiêu' : 'Doanh thu ghi nhận'}
              value={formatPrice(stats.serviceTotal)}
            />
            <StatTile
              icon='calendar_month'
              label={isCustomer ? 'Lịch đã đặt' : 'Lịch đã xử lý'}
              value={String(stats.appointmentCount)}
              hint={`${stats.completedAppointments} hoàn thành · ${stats.cancelledAppointments} đã hủy`}
            />
          </div>

          <section className={`${portalCardClass} p-3 sm:p-4`} aria-labelledby='detail-services'>
            <h2 id='detail-services' className='px-1 pb-3 text-lg font-extrabold text-ink'>
              {isCustomer ? 'Dịch vụ đã sử dụng' : 'Dịch vụ đã ghi nhận'}
            </h2>
            <div className='overflow-x-auto'>
              <table className='w-full min-w-[560px] text-left text-sm'>
                <thead>
                  <tr className='border-b border-rose-soft/60 text-[11px] font-bold tracking-wide text-muted uppercase'>
                    <th scope='col' className='px-4 py-3'>
                      Ngày
                    </th>
                    <th scope='col' className='px-4 py-3'>
                      Dịch vụ
                    </th>
                    {isCustomer ? null : (
                      <th scope='col' className='px-4 py-3'>
                        Khách hàng
                      </th>
                    )}
                    <th scope='col' className='px-4 py-3 text-right'>
                      SL
                    </th>
                    <th scope='col' className='px-4 py-3 text-right'>
                      Thành tiền
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {services.length === 0 ? (
                    <EmptyRow colSpan={isCustomer ? 4 : 5}>Chưa có dịch vụ nào.</EmptyRow>
                  ) : (
                    services.map((item) => (
                      <tr key={item.customerServiceID} className='border-b border-rose-soft/40 last:border-0 align-top'>
                        <td className='px-4 py-3 whitespace-nowrap text-ink/80 tabular-nums'>
                          {dateFormatter.format(new Date(item.usedAt))}
                        </td>
                        <td className='px-4 py-3'>
                          <p className='font-semibold text-ink'>{item.nameVietnamese}</p>
                          {item.branchName ? <p className='text-xs text-muted'>{item.branchName}</p> : null}
                          {item.staffNote ? (
                            <p className='mt-0.5 text-xs text-ink/70 italic'>“{item.staffNote}”</p>
                          ) : null}
                        </td>
                        {isCustomer ? null : (
                          <td className='px-4 py-3'>
                            <p className='font-semibold text-ink'>{item.customer?.fullName ?? '—'}</p>
                            {item.customer ? (
                              <p className='text-xs text-muted tabular-nums'>{formatPhone(item.customer.phone)}</p>
                            ) : null}
                          </td>
                        )}
                        <td className='px-4 py-3 text-right tabular-nums'>{item.quantity}</td>
                        <td className='px-4 py-3 text-right font-semibold whitespace-nowrap text-ink tabular-nums'>
                          {formatPrice(item.price * item.quantity)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className={`${portalCardClass} p-3 sm:p-4`} aria-labelledby='detail-appointments'>
            <h2 id='detail-appointments' className='px-1 pb-3 text-lg font-extrabold text-ink'>
              {isCustomer ? 'Lịch sử đặt lịch hẹn' : 'Lịch hẹn đã xác nhận / phục vụ'}
            </h2>
            <div className='overflow-x-auto'>
              <table className='w-full min-w-[560px] text-left text-sm'>
                <thead>
                  <tr className='border-b border-rose-soft/60 text-[11px] font-bold tracking-wide text-muted uppercase'>
                    <th scope='col' className='px-4 py-3'>
                      Thời gian
                    </th>
                    {isCustomer ? null : (
                      <th scope='col' className='px-4 py-3'>
                        Khách hàng
                      </th>
                    )}
                    <th scope='col' className='px-4 py-3'>
                      Khu vực
                    </th>
                    <th scope='col' className='px-4 py-3'>
                      Ghi chú
                    </th>
                    <th scope='col' className='px-4 py-3'>
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.length === 0 ? (
                    <EmptyRow colSpan={isCustomer ? 4 : 5}>Chưa có lịch hẹn nào.</EmptyRow>
                  ) : (
                    appointments.map((item) => {
                      const status = appointmentStatus[item.status] ?? {
                        label: item.status,
                        className: 'bg-canvas text-muted'
                      }
                      const note = item.serviceNote ?? item.customerNote
                      return (
                        <tr key={item.appointmentID} className='border-b border-rose-soft/40 last:border-0 align-top'>
                          <td className='px-4 py-3 whitespace-nowrap tabular-nums'>
                            <p className='font-semibold text-ink'>{item.appointmentTime}</p>
                            <p className='text-xs text-muted'>
                              {dateFormatter.format(new Date(`${item.appointmentDate}T00:00:00`))}
                            </p>
                          </td>
                          {isCustomer ? null : (
                            <td className='px-4 py-3'>
                              <p className='font-semibold text-ink'>{item.customerName}</p>
                              <p className='text-xs text-muted tabular-nums'>{formatPhone(item.phoneNumber)}</p>
                            </td>
                          )}
                          <td className='px-4 py-3 text-ink/80'>{item.branchName}</td>
                          <td className='max-w-[260px] px-4 py-3 text-xs text-ink/70'>{note ?? '—'}</td>
                          <td className='px-4 py-3'>
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap ${status.className}`}
                            >
                              {status.label}
                            </span>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
            {appointments.length >= 50 || services.length >= 50 ? (
              <p className='px-1 pt-3 text-xs text-muted'>Hiển thị 50 bản ghi gần nhất.</p>
            ) : null}
          </section>
        </div>
      </div>
    </motion.div>
  )
}
