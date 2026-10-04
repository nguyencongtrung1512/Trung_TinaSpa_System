import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Icon } from '~/components/ui/Icon'
import { formatPortalDate } from '~/portal/format'
import { inputClass, outlineButtonClass, primaryButtonClass } from '~/portal/manager/services/form-ui'
import { portalRoleLabel } from '~/portal/navigation'
import { portalCardClass } from '~/portal/styles'
import type { PortalRole } from '~/portal/types'
import { StaffFormDialog } from './StaffFormDialog'
import {
  ageFromDateOfBirth,
  listUsers,
  userGenderLabels,
  userRoleLabels,
  type PortalUser,
  type UserListResult,
  type UserRole
} from './users.api'

type RoleTab = UserRole | 'all'
type ActiveFilter = 'all' | 'active' | 'locked'

const PAGE_SIZE = 20

const roleBadgeClass: Record<UserRole, string> = {
  CUSTOMER: 'bg-mist text-clinic',
  STAFF: 'bg-sky-50 text-sky-700',
  MANAGER: 'bg-violet-50 text-violet-700',
  ADMIN: 'bg-amber-50 text-amber-700'
}

const dateFormatter = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })

function initials(fullName: string) {
  const words = fullName.trim().split(/\s+/)
  return (words.length > 1 ? words[0][0] + words[words.length - 1][0] : (words[0]?.slice(0, 2) ?? '?')).toUpperCase()
}

function UserAvatar({ user }: { readonly user: PortalUser }) {
  const [broken, setBroken] = useState(false)
  return (
    <span className='grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-rose-soft to-clinic/70 text-xs font-extrabold text-white'>
      {user.avatar && !broken ? (
        <img src={user.avatar} alt='' className='size-full object-cover' onError={() => setBroken(true)} />
      ) : (
        initials(user.fullName)
      )}
    </span>
  )
}

export interface UserListPageProps {
  readonly role: PortalRole
  readonly title: string
  readonly description: string
  /** Account roles shown on this page; tabs appear only when there is more than one. */
  readonly roles: readonly UserRole[]
  readonly entityLabel: string
  readonly canCreateStaff?: boolean
}

export function UserListPage({ role, title, description, roles, entityLabel, canCreateStaff }: UserListPageProps) {
  const reduceMotion = useReducedMotion()
  const multiRole = roles.length > 1
  const [roleTab, setRoleTab] = useState<RoleTab>(multiRole ? 'all' : roles[0])
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('all')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [reloadKey, setReloadKey] = useState(0)
  const [result, setResult] = useState<UserListResult>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()
  const [staffForm, setStaffForm] = useState({ session: 0, open: false })
  const [notice, setNotice] = useState<string>()
  const noticeTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(noticeTimer.current), [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    listUsers({
      search: debouncedSearch || undefined,
      role: roleTab === 'all' ? undefined : roleTab,
      isActive: activeFilter === 'all' ? undefined : activeFilter === 'active',
      page,
      pageSize: PAGE_SIZE
    })
      .then((next) => {
        if (cancelled) return
        setResult(next)
        setError(undefined)
      })
      .catch((reason: unknown) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : `Không tải được danh sách ${entityLabel}.`)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [debouncedSearch, roleTab, activeFilter, page, reloadKey, entityLabel])

  const closeStaffForm = useCallback(() => setStaffForm((current) => ({ ...current, open: false })), [])

  const handleStaffSaved = (message: string) => {
    closeStaffForm()
    setNotice(message)
    clearTimeout(noticeTimer.current)
    noticeTimer.current = setTimeout(() => setNotice(undefined), 3500)
    setPage(1)
    setReloadKey((key) => key + 1)
  }

  const roleCounts = result?.roleCounts
  const countOf = (value: RoleTab) =>
    roleCounts
      ? value === 'all'
        ? roles.reduce((sum, item) => sum + (roleCounts[item] ?? 0), 0)
        : (roleCounts[value] ?? 0)
      : undefined
  const totalPages = result ? Math.max(1, Math.ceil(result.total / result.pageSize)) : 1
  const firstRow = result && result.total > 0 ? (result.page - 1) * result.pageSize + 1 : 0
  const lastRow = result ? Math.min(result.page * result.pageSize, result.total) : 0
  const tabs: RoleTab[] = ['all', ...roles]

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <header className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
        <div>
          <div className='flex flex-wrap items-center gap-3 text-xs font-bold tracking-[0.16em] text-clinic'>
            <span>{portalRoleLabel[role]}</span>
            <span className='font-medium tracking-normal text-muted'>{formatPortalDate(new Date())}</span>
          </div>
          <h1 className='mt-2 text-3xl font-extrabold text-ink sm:text-4xl'>{title}</h1>
          <p className='mt-1 text-sm text-muted'>{description}</p>
        </div>
        {canCreateStaff ? (
          <button
            type='button'
            className={`${primaryButtonClass} self-start lg:self-auto`}
            onClick={() => setStaffForm((current) => ({ session: current.session + 1, open: true }))}
          >
            <Icon name='person_add' size={18} />
            Thêm nhân viên
          </button>
        ) : null}
      </header>

      <section className={`${portalCardClass} mt-6 p-3 sm:p-4`} aria-label={`Danh sách ${entityLabel}`}>
        <div className='flex flex-col gap-3 px-1 pb-3 lg:flex-row lg:items-center'>
          {multiRole ? (
            <div role='tablist' aria-label='Lọc theo vai trò' className='flex flex-1 flex-wrap gap-1.5'>
              {tabs.map((tab) => {
                const selected = roleTab === tab
                return (
                  <button
                    key={tab}
                    type='button'
                    role='tab'
                    aria-selected={selected}
                    onClick={() => {
                      setRoleTab(tab)
                      setPage(1)
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-bold transition ${
                      selected
                        ? 'bg-clinic text-white shadow-sm'
                        : 'bg-canvas text-ink/70 hover:bg-mist hover:text-clinic'
                    }`}
                  >
                    {tab === 'all' ? 'Tất cả' : userRoleLabels[tab]}
                    <span
                      className={`min-w-6 rounded-full px-1.5 text-center text-[11px] tabular-nums ${
                        selected ? 'bg-white/20' : 'bg-white text-muted'
                      }`}
                    >
                      {countOf(tab) ?? '–'}
                    </span>
                  </button>
                )
              })}
            </div>
          ) : (
            <h2 className='flex-1 text-lg font-extrabold text-ink'>
              {userRoleLabels[roles[0]]}
              <span className='ml-2 text-sm font-semibold text-muted tabular-nums'>{result?.total ?? ''}</span>
            </h2>
          )}
          <div className='relative lg:w-72'>
            <Icon
              name='search'
              size={18}
              className='pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted'
            />
            <input
              type='search'
              aria-label={`Tìm ${entityLabel}`}
              placeholder='Tìm tên, số điện thoại, địa chỉ...'
              className={`${inputClass} pl-10`}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <select
            aria-label='Lọc trạng thái tài khoản'
            className={`${inputClass} lg:w-44`}
            value={activeFilter}
            onChange={(event) => {
              setActiveFilter(event.target.value as ActiveFilter)
              setPage(1)
            }}
          >
            <option value='all'>Mọi trạng thái</option>
            <option value='active'>Đang hoạt động</option>
            <option value='locked'>Đã khóa</option>
          </select>
        </div>

        {error ? (
          <div className='flex flex-col items-center gap-3 px-6 py-14 text-center'>
            <Icon name='cloud_off' size={32} className='text-clinic' />
            <p className='text-sm text-ink'>{error}</p>
            <button type='button' className={outlineButtonClass} onClick={() => setReloadKey((key) => key + 1)}>
              <Icon name='refresh' size={18} />
              Thử lại
            </button>
          </div>
        ) : !result && loading ? (
          <div className='space-y-2 p-2'>
            {[0, 1, 2, 3, 4].map((row) => (
              <div key={row} className='h-14 animate-pulse rounded-2xl bg-canvas' />
            ))}
          </div>
        ) : result && result.items.length > 0 ? (
          <div className={`overflow-x-auto transition-opacity ${loading ? 'opacity-60' : ''}`} aria-busy={loading}>
            <table className='w-full min-w-[760px] text-left text-sm'>
              <thead>
                <tr className='border-b border-rose-soft/60 text-[11px] font-bold tracking-wide text-muted uppercase'>
                  <th scope='col' className='px-4 py-3'>
                    Họ tên
                  </th>
                  <th scope='col' className='px-4 py-3'>
                    Liên hệ
                  </th>
                  <th scope='col' className='px-4 py-3'>
                    Giới tính
                  </th>
                  <th scope='col' className='px-4 py-3 text-right'>
                    Tuổi
                  </th>
                  {multiRole ? (
                    <th scope='col' className='px-4 py-3'>
                      Vai trò
                    </th>
                  ) : null}
                  <th scope='col' className='px-4 py-3'>
                    Trạng thái
                  </th>
                  <th scope='col' className='px-4 py-3 text-right'>
                    Ngày tạo
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((user) => {
                  const age = ageFromDateOfBirth(user.dateOfBirth)
                  return (
                    <tr key={user.userID} className='border-b border-rose-soft/40 last:border-0 hover:bg-canvas/60'>
                      <td className='px-4 py-3'>
                        <div className='flex items-center gap-3'>
                          <UserAvatar user={user} />
                          <div className='min-w-0'>
                            <p className='truncate font-bold text-ink'>{user.fullName}</p>
                            <p className='font-mono text-[11px] text-muted/80'>{user.userID}</p>
                          </div>
                        </div>
                      </td>
                      <td className='max-w-[260px] px-4 py-3'>
                        <a href={`tel:${user.phone}`} className='text-ink/80 tabular-nums hover:text-clinic'>
                          {user.phone}
                        </a>
                        {user.address ? (
                          <p className='truncate text-xs text-muted' title={user.address}>
                            {user.address}
                          </p>
                        ) : null}
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap text-ink/80'>
                        {user.gender ? userGenderLabels[user.gender] : '—'}
                      </td>
                      <td
                        className='px-4 py-3 text-right whitespace-nowrap text-ink/80 tabular-nums'
                        title={user.dateOfBirth ? dateFormatter.format(new Date(user.dateOfBirth)) : undefined}
                      >
                        {age ?? '—'}
                      </td>
                      {multiRole ? (
                        <td className='px-4 py-3'>
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap ${roleBadgeClass[user.role] ?? 'bg-canvas text-muted'}`}
                          >
                            {userRoleLabels[user.role] ?? user.role}
                          </span>
                        </td>
                      ) : null}
                      <td className='px-4 py-3'>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap ${
                            user.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-ink/5 text-muted'
                          }`}
                        >
                          <span className={`size-1.5 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-muted'}`} />
                          {user.isActive ? 'Hoạt động' : 'Đã khóa'}
                        </span>
                      </td>
                      <td className='px-4 py-3 text-right whitespace-nowrap text-ink/80 tabular-nums'>
                        {dateFormatter.format(new Date(user.createdAt))}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className='flex flex-col items-center gap-3 px-6 py-14 text-center'>
            <Icon name='group_off' size={32} className='text-clinic/60' />
            <p className='text-sm text-muted'>
              {debouncedSearch || activeFilter !== 'all'
                ? `Không có ${entityLabel} khớp bộ lọc.`
                : `Chưa có ${entityLabel} nào.`}
            </p>
            {canCreateStaff && !debouncedSearch && activeFilter === 'all' ? (
              <button
                type='button'
                className={outlineButtonClass}
                onClick={() => setStaffForm((current) => ({ session: current.session + 1, open: true }))}
              >
                <Icon name='person_add' size={18} />
                Thêm nhân viên
              </button>
            ) : null}
          </div>
        )}

        {result && result.total > 0 && !error ? (
          <div className='flex flex-col gap-3 border-t border-rose-soft/40 px-2 pt-3 text-sm text-muted sm:flex-row sm:items-center sm:justify-between'>
            <p className='tabular-nums'>
              Hiển thị {firstRow}–{lastRow} / {result.total} {entityLabel}
            </p>
            <div className='flex items-center gap-2'>
              <button
                type='button'
                className={`${outlineButtonClass} px-3 py-1.5`}
                onClick={() => setPage((current) => current - 1)}
                disabled={page <= 1 || loading}
                aria-label='Trang trước'
              >
                <Icon name='chevron_left' size={18} />
              </button>
              <span className='min-w-16 text-center font-bold text-ink tabular-nums'>
                {page} / {totalPages}
              </span>
              <button
                type='button'
                className={`${outlineButtonClass} px-3 py-1.5`}
                onClick={() => setPage((current) => current + 1)}
                disabled={page >= totalPages || loading}
                aria-label='Trang sau'
              >
                <Icon name='chevron_right' size={18} />
              </button>
            </div>
          </div>
        ) : null}
      </section>

      {canCreateStaff ? (
        <StaffFormDialog
          key={staffForm.session}
          open={staffForm.open}
          onClose={closeStaffForm}
          onSaved={handleStaffSaved}
        />
      ) : null}

      <AnimatePresence>
        {notice ? (
          <motion.p
            key={notice}
            role='status'
            className='fixed right-4 bottom-4 z-[60] flex max-w-sm items-center gap-2 rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white shadow-xl'
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
          >
            <Icon name='check_circle' size={18} className='text-emerald-300' />
            {notice}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </motion.div>
  )
}
