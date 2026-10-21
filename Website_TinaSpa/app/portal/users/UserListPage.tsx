import { useCallback, useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ActionMenu, type ActionMenuItem } from '~/components/ui/ActionMenu'
import { Icon } from '~/components/ui/Icon'
import { Pagination } from '~/components/ui/Pagination'
import { useToast } from '~/components/ui/toast-view'
import { formatPortalDate } from '~/portal/format'
import { useSession } from '~/lib/auth'
import { ConfirmDialog, inputClass, outlineButtonClass, primaryButtonClass } from '~/portal/manager/services/form-ui'
import { portalRoleLabel } from '~/portal/navigation'
import { portalCardClass } from '~/portal/styles'
import type { PortalRole } from '~/portal/types'
import { useBranches } from '~/portal/appointments/useAppointments'
import { Link, useLocation, useNavigate } from 'react-router'
import { StaffFormDialog } from './StaffFormDialog'
import {
  deleteUser,
  listUsers,
  setUserActive,
  userRoleLabels,
  type PortalUser,
  type UserListResult,
  type UserRole
} from './users.api'
import { Select } from '~/components/ui/Select'

type ActiveFilter = 'all' | 'active' | 'locked'

const PAGE_SIZE = 20

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
  readonly canPickBranch?: boolean
  /** Thêm sửa (nhân viên/quản lý), khóa/mở khóa và xóa vào menu thao tác; backend vẫn kiểm tra quyền theo khu vực. */
  readonly canManage?: boolean
}

export function UserListPage({
  role,
  title,
  description,
  roles,
  entityLabel,
  canCreateStaff,
  canPickBranch,
  canManage
}: UserListPageProps) {
  const reduceMotion = useReducedMotion()
  const session = useSession()
  const branches = useBranches()
  const multiRole = roles.length > 1
  const [roleTab, setRoleTab] = useState<UserRole>(roles[0])
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('all')
  const [branchFilter, setBranchFilter] = useState('')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [reloadKey, setReloadKey] = useState(0)
  const [result, setResult] = useState<UserListResult>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()
  const [staffForm, setStaffForm] = useState<{ session: number; open: boolean; user?: PortalUser }>({
    session: 0,
    open: false
  })
  const [statusTarget, setStatusTarget] = useState<PortalUser | null>(null)
  const [statusBusy, setStatusBusy] = useState(false)
  const [statusError, setStatusError] = useState<string>()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [deleteTarget, setDeleteTarget] = useState<PortalUser | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState<string>()
  const toast = useToast()

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
      role: roleTab,
      isActive: activeFilter === 'all' ? undefined : activeFilter === 'active',
      branchID: canPickBranch && branchFilter ? branchFilter : undefined,
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
  }, [debouncedSearch, roleTab, activeFilter, branchFilter, canPickBranch, page, reloadKey, entityLabel])

  const closeStaffForm = useCallback(() => setStaffForm((current) => ({ ...current, open: false })), [])

  const handleStaffSaved = (message: string) => {
    const editing = staffForm.user !== undefined
    closeStaffForm()
    toast.success(message)
    if (!editing) setPage(1)
    setReloadKey((key) => key + 1)
  }

  const openCreate = () => setStaffForm((current) => ({ session: current.session + 1, open: true }))
  const openEdit = (user: PortalUser) => setStaffForm((current) => ({ session: current.session + 1, open: true, user }))

  const closeStatus = () => {
    if (statusBusy) return
    setStatusTarget(null)
    setStatusError(undefined)
  }

  async function confirmStatus() {
    if (!statusTarget) return
    const nextActive = !statusTarget.isActive
    setStatusBusy(true)
    setStatusError(undefined)
    try {
      await setUserActive(statusTarget.userID, nextActive)
      toast.success(`Đã ${nextActive ? 'mở khóa' : 'khóa'} tài khoản`, statusTarget.fullName)
      setStatusTarget(null)
      setReloadKey((key) => key + 1)
    } catch (reason) {
      setStatusError(reason instanceof Error ? reason.message : 'Không thể cập nhật trạng thái tài khoản.')
    } finally {
      setStatusBusy(false)
    }
  }

  const closeDelete = () => {
    if (deleteBusy) return
    setDeleteTarget(null)
    setDeleteError(undefined)
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleteBusy(true)
    setDeleteError(undefined)
    try {
      await deleteUser(deleteTarget.userID)
      toast.success('Đã xóa tài khoản', deleteTarget.fullName)
      setDeleteTarget(null)
      if (result && result.items.length === 1 && page > 1) setPage(page - 1)
      setReloadKey((key) => key + 1)
    } catch (reason) {
      setDeleteError(reason instanceof Error ? reason.message : 'Không thể xóa tài khoản.')
    } finally {
      setDeleteBusy(false)
    }
  }

  const branchLabelOf = (user: PortalUser) => (user.branchID ? (user.branchName ?? user.branchID) : 'Toàn hệ thống')

  // Trang chi tiết nằm ngay dưới trang danh sách, VD /portal/manager/staff/:userID.
  const detailPath = (user: PortalUser) => `${pathname.replace(/\/$/, '')}/${encodeURIComponent(user.userID)}`

  // Quản lý chỉ sửa nhân viên; quản trị sửa được cả quản lý. Không thao tác trên chính mình hay tài khoản quản trị.
  const isSelf = (user: PortalUser) => user.userID === session?.user.userID
  const canEdit = (user: PortalUser) =>
    canManage && !isSelf(user) && (user.role === 'STAFF' || (role === 'admin' && user.role === 'MANAGER'))
  const canToggle = (user: PortalUser) => canManage && !isSelf(user) && user.role !== 'ADMIN'

  const menuItems = (user: PortalUser): ActionMenuItem[] => [
    { label: 'Xem chi tiết', icon: 'visibility', onSelect: () => navigate(detailPath(user)) },
    ...(canEdit(user) ? [{ label: 'Chỉnh sửa', icon: 'edit', onSelect: () => openEdit(user) }] : []),
    ...(canToggle(user)
      ? [
          {
            label: user.isActive ? 'Khóa tài khoản' : 'Mở khóa',
            icon: user.isActive ? 'lock' : 'lock_open',
            onSelect: () => setStatusTarget(user)
          },
          {
            label: 'Xóa',
            icon: 'delete',
            tone: 'danger' as const,
            onSelect: () => {
              setDeleteError(undefined)
              setDeleteTarget(user)
            }
          }
        ]
      : [])
  ]

  const roleCounts = result?.roleCounts
  const countOf = (value: UserRole) => (roleCounts ? (roleCounts[value] ?? 0) : undefined)

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
          <button type='button' className={`${primaryButtonClass} self-start lg:self-auto`} onClick={openCreate}>
            <Icon name='person_add' size={18} />
            Thêm nhân viên
          </button>
        ) : null}
      </header>

      <section className={`${portalCardClass} mt-6 p-3 sm:p-4`} aria-label={`Danh sách ${entityLabel}`}>
        <div className='flex flex-col gap-3 px-1 pb-3 lg:flex-row lg:items-center'>
          {multiRole ? (
            <div role='tablist' aria-label='Lọc theo vai trò' className='flex flex-1 flex-wrap gap-1.5'>
              {roles.map((tab) => {
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
                    {userRoleLabels[tab]}
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
          <Select
            aria-label='Lọc trạng thái tài khoản'
            className='w-full lg:w-44'
            value={activeFilter}
            onChange={(value) => {
              setActiveFilter(value)
              setPage(1)
            }}
            options={[
              { value: 'all', label: 'Mọi trạng thái' },
              { value: 'active', label: 'Đang hoạt động' },
              { value: 'locked', label: 'Đã khóa' }
            ]}
          />

          {canPickBranch && branches.length > 0 ? (
            <Select
              aria-label='Lọc theo khu vực'
              className='w-full lg:w-48'
              value={branchFilter}
              onChange={(value) => {
                setBranchFilter(value)
                setPage(1)
              }}
              options={[
                { value: '', label: 'Tất cả khu vực' },
                ...branches.map((b) => ({ value: b.branchID, label: b.nameVietnamese }))
              ]}
            />
          ) : null}
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
            <table className='w-full min-w-[640px] text-left text-sm'>
              <thead>
                <tr className='border-b border-rose-soft/60 text-[11px] font-bold tracking-wide text-muted uppercase'>
                  <th scope='col' className='px-4 py-3'>
                    Họ tên
                  </th>
                  <th scope='col' className='px-4 py-3'>
                    Số điện thoại
                  </th>
                  <th scope='col' className='px-4 py-3'>
                    Khu vực
                  </th>
                  <th scope='col' className='px-4 py-3'>
                    Trạng thái
                  </th>
                  <th scope='col' className='w-14 px-2 py-3'>
                    <span className='sr-only'>Thao tác</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((user) => {
                  return (
                    <tr key={user.userID} className='border-b border-rose-soft/40 last:border-0 hover:bg-canvas/60'>
                      <td className='px-4 py-3'>
                        <Link to={detailPath(user)} className='group flex items-center gap-3 rounded-xl text-left'>
                          <UserAvatar user={user} />
                          <span className='min-w-0'>
                            <span className='block truncate font-bold text-ink group-hover:text-clinic'>
                              {user.fullName}
                            </span>
                            <span className='block font-mono text-[11px] text-muted/80'>{user.userID}</span>
                          </span>
                        </Link>
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap'>
                        <a href={`tel:${user.phone}`} className='text-ink/80 tabular-nums hover:text-clinic'>
                          {user.phone}
                        </a>
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap text-xs text-ink/80'>
                        {user.branchID ? (
                          <span className='inline-flex items-center gap-1 rounded-full bg-mist/60 px-2.5 py-1 font-semibold text-clinic'>
                            <Icon name='location_on' size={14} />
                            {branchLabelOf(user)}
                          </span>
                        ) : (
                          <span className='inline-flex items-center gap-1 rounded-full bg-canvas px-2.5 py-1 text-muted'>
                            Toàn hệ thống
                          </span>
                        )}
                      </td>
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
                      <td className='px-2 py-3 text-right'>
                        <ActionMenu label={`Thao tác với ${user.fullName}`} items={menuItems(user)} />
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
              <button type='button' className={outlineButtonClass} onClick={openCreate}>
                <Icon name='person_add' size={18} />
                Thêm nhân viên
              </button>
            ) : null}
          </div>
        )}

        {result && !error ? (
          <Pagination
            className='border-t border-rose-soft/40 px-2 pt-3'
            page={page}
            pageSize={result.pageSize}
            total={result.total}
            disabled={loading}
            onPageChange={setPage}
            labels={{ summary: ({ from, to, total }) => `Hiển thị ${from}–${to} / ${total} ${entityLabel}` }}
          />
        ) : null}
      </section>

      {canCreateStaff || canManage ? (
        <StaffFormDialog
          key={staffForm.session}
          open={staffForm.open}
          onClose={closeStaffForm}
          onSaved={handleStaffSaved}
          canPickBranch={canPickBranch}
          canCreateManager={role === 'admin'}
          user={staffForm.user}
        />
      ) : null}

      <ConfirmDialog
        open={statusTarget !== null}
        title={statusTarget?.isActive ? 'Khóa tài khoản?' : 'Mở khóa tài khoản?'}
        message={
          statusTarget?.isActive ? (
            <>
              <strong>{statusTarget.fullName}</strong> sẽ bị đăng xuất ngay và không thể đăng nhập cho đến khi được mở
              khóa.
            </>
          ) : (
            <>
              <strong>{statusTarget?.fullName}</strong> có thể đăng nhập lại bằng mật khẩu hiện tại.
            </>
          )
        }
        confirmLabel={statusTarget?.isActive ? 'Khóa' : 'Mở khóa'}
        icon={statusTarget?.isActive ? 'lock' : 'lock_open'}
        busyLabel='Đang lưu...'
        tone={statusTarget?.isActive ? 'danger' : 'primary'}
        busy={statusBusy}
        error={statusError}
        onConfirm={() => void confirmStatus()}
        onClose={closeStatus}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title='Xóa tài khoản?'
        message={
          <>
            Tài khoản <strong>{deleteTarget?.fullName}</strong> ({deleteTarget?.phone}) sẽ bị xóa vĩnh viễn. Chỉ xóa
            được tài khoản chưa có lịch hẹn, dịch vụ hoặc bài viết; nếu đã có, hãy khóa tài khoản để giữ lịch sử.
          </>
        }
        confirmLabel='Xóa'
        busy={deleteBusy}
        error={deleteError}
        onConfirm={() => void confirmDelete()}
        onClose={closeDelete}
      />
    </motion.div>
  )
}
