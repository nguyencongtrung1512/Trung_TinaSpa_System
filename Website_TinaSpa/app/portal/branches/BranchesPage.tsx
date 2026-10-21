import { useCallback, useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Icon } from '~/components/ui/Icon'
import { useToast } from '~/components/ui/toast-view'
import { invalidateBranches } from '~/portal/appointments/useAppointments'
import { formatPortalDate } from '~/portal/format'
import {
  ConfirmDialog,
  iconButtonClass,
  outlineButtonClass,
  primaryButtonClass
} from '~/portal/manager/services/form-ui'
import { portalRoleLabel } from '~/portal/navigation'
import { portalCardClass } from '~/portal/styles'
import { BranchFormDialog } from './BranchFormDialog'
import { branchesApi, type ManagedBranch } from './branches.api'

function Stat({ icon, label, value }: { readonly icon: string; readonly label: string; readonly value: number }) {
  return (
    <div className='rounded-2xl bg-canvas px-3 py-2.5'>
      <p className='flex items-center gap-1 text-[11px] font-bold tracking-wide text-muted uppercase'>
        <Icon name={icon} size={14} />
        {label}
      </p>
      <p className='mt-0.5 text-lg font-extrabold text-ink tabular-nums'>{value}</p>
    </div>
  )
}

export function BranchesPage() {
  const reduceMotion = useReducedMotion()
  const toast = useToast()
  const [branches, setBranches] = useState<ManagedBranch[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string>()
  const [form, setForm] = useState<{ session: number; open: boolean; target: ManagedBranch | null }>({
    session: 0,
    open: false,
    target: null
  })
  const [deleteTarget, setDeleteTarget] = useState<ManagedBranch | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState<string>()
  const [togglingID, setTogglingID] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      setBranches(await branchesApi.list())
      setLoadError(undefined)
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Không tải được danh sách chi nhánh.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const changed = useCallback(() => {
    invalidateBranches()
    void refresh()
  }, [refresh])

  const openForm = (target: ManagedBranch | null) =>
    setForm((current) => ({ session: current.session + 1, open: true, target }))
  const closeForm = useCallback(() => setForm((current) => ({ ...current, open: false })), [])

  const handleSaved = (message: string) => {
    closeForm()
    toast.success(message)
    changed()
  }

  async function toggleStatus(branch: ManagedBranch) {
    const status = branch.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    setTogglingID(branch.branchID)
    try {
      await branchesApi.update(branch.branchID, { status })
      toast.success(`${branch.nameVietnamese}: ${status === 'ACTIVE' ? 'đã mở nhận lịch' : 'đã tạm ngưng nhận lịch'}.`)
      changed()
    } catch (error) {
      toast.error('Không đổi được trạng thái', error instanceof Error ? error.message : undefined)
    } finally {
      setTogglingID(null)
    }
  }

  const closeDelete = useCallback(() => {
    setDeleteTarget(null)
    setDeleteError(undefined)
  }, [])

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleteBusy(true)
    setDeleteError(undefined)
    try {
      await branchesApi.remove(deleteTarget.branchID)
      toast.success(`Đã xóa chi nhánh "${deleteTarget.nameVietnamese}".`)
      setDeleteTarget(null)
      changed()
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Không thể xóa chi nhánh.')
    } finally {
      setDeleteBusy(false)
    }
  }

  const deleteBlocked = deleteTarget
    ? deleteTarget.managerCount + deleteTarget.staffCount > 0 || deleteTarget.upcomingAppointments > 0
    : false

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <header className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
        <div>
          <div className='flex flex-wrap items-center gap-3 text-xs font-bold tracking-[0.16em] text-clinic'>
            <span>{portalRoleLabel.admin}</span>
            <span className='font-medium tracking-normal text-muted'>{formatPortalDate(new Date())}</span>
          </div>
          <h1 className='mt-2 text-3xl font-extrabold text-ink sm:text-4xl'>Chi nhánh</h1>
        </div>
        <button
          type='button'
          className={`${primaryButtonClass} self-start lg:self-auto`}
          onClick={() => openForm(null)}
        >
          <Icon name='add_business' size={18} />
          Thêm chi nhánh
        </button>
      </header>

      {loadError ? (
        <div className={`${portalCardClass} mt-6 flex flex-col items-center gap-3 px-6 py-14 text-center`}>
          <Icon name='cloud_off' size={32} className='text-clinic' />
          <p className='text-sm text-ink'>{loadError}</p>
          <button type='button' className={outlineButtonClass} onClick={() => void refresh()}>
            <Icon name='refresh' size={18} />
            Thử lại
          </button>
        </div>
      ) : loading ? (
        <div className='mt-6 grid gap-4 md:grid-cols-2'>
          {[0, 1].map((item) => (
            <div key={item} className='h-64 animate-pulse rounded-[28px] bg-white/70' />
          ))}
        </div>
      ) : branches.length === 0 ? (
        <div className={`${portalCardClass} mt-6 flex flex-col items-center gap-3 px-6 py-14 text-center`}>
          <Icon name='store' size={32} className='text-clinic/60' />
          <p className='text-sm text-muted'>Chưa có chi nhánh nào.</p>
          <button type='button' className={outlineButtonClass} onClick={() => openForm(null)}>
            <Icon name='add_business' size={18} />
            Thêm chi nhánh
          </button>
        </div>
      ) : (
        <ul className='mt-6 grid gap-4 md:grid-cols-2'>
          {branches.map((branch) => {
            const active = branch.status === 'ACTIVE'
            return (
              <li
                key={branch.branchID}
                className={`${portalCardClass} flex flex-col p-5 ${active ? '' : 'opacity-80'}`}
              >
                <div className='flex items-start gap-3'>
                  <span className='grid size-11 shrink-0 place-items-center rounded-2xl bg-mist text-clinic'>
                    <Icon name='store' size={22} />
                  </span>
                  <div className='min-w-0 flex-1'>
                    <h2 className='text-lg leading-snug font-extrabold text-ink'>{branch.nameVietnamese}</h2>
                    <p className='font-mono text-[11px] text-muted/80'>
                      {branch.branchID} · {branch.slug}
                    </p>
                  </div>
                  <span
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap ${
                      active ? 'bg-emerald-50 text-emerald-700' : 'bg-ink/5 text-muted'
                    }`}
                  >
                    <span className={`size-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-muted'}`} />
                    {active ? 'Đang nhận lịch' : 'Tạm ngưng'}
                  </span>
                </div>

                <dl className='mt-4 space-y-1.5 text-sm text-ink/80'>
                  <div className='flex items-start gap-2'>
                    <dt className='sr-only'>Địa chỉ</dt>
                    <Icon name='location_on' size={16} className='mt-0.5 shrink-0 text-clinic' />
                    <dd>{branch.addressVietnamese ?? '—'}</dd>
                  </div>
                  <div className='flex items-center gap-2'>
                    <dt className='sr-only'>Giờ mở cửa</dt>
                    <Icon name='schedule' size={16} className='shrink-0 text-clinic' />
                    <dd className='tabular-nums'>
                      {branch.openTime} – {branch.closeTime}
                    </dd>
                  </div>
                  <div className='flex items-center gap-2'>
                    <dt className='sr-only'>Hotline</dt>
                    <Icon name='call' size={16} className='shrink-0 text-clinic' />
                    <dd className='tabular-nums'>{branch.hotline ?? '—'}</dd>
                  </div>
                </dl>

                <div className='mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4'>
                  <Stat icon='supervisor_account' label='Quản lý' value={branch.managerCount} />
                  <Stat icon='badge' label='Nhân viên' value={branch.staffCount} />
                  <Stat icon='group' label='Khách' value={branch.customerCount} />
                  <Stat icon='event' label='Lịch tới' value={branch.upcomingAppointments} />
                </div>

                <div className='mt-4 flex items-center justify-end gap-1 border-t border-rose-soft/40 pt-3'>
                  <button
                    type='button'
                    className={outlineButtonClass}
                    disabled={togglingID === branch.branchID}
                    onClick={() => void toggleStatus(branch)}
                  >
                    <Icon name={active ? 'pause_circle' : 'play_circle'} size={18} />
                    {active ? 'Tạm ngưng' : 'Mở nhận lịch'}
                  </button>
                  <button
                    type='button'
                    className={iconButtonClass}
                    aria-label={`Sửa ${branch.nameVietnamese}`}
                    title='Sửa'
                    onClick={() => openForm(branch)}
                  >
                    <Icon name='edit' size={18} />
                  </button>
                  <button
                    type='button'
                    className={`${iconButtonClass} hover:bg-red-50 hover:text-red-600`}
                    aria-label={`Xóa ${branch.nameVietnamese}`}
                    title='Xóa'
                    onClick={() => {
                      setDeleteError(undefined)
                      setDeleteTarget(branch)
                    }}
                  >
                    <Icon name='delete' size={18} />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <BranchFormDialog
        key={form.session}
        open={form.open}
        branch={form.target}
        onClose={closeForm}
        onSaved={handleSaved}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title={deleteBlocked ? 'Chưa thể xóa chi nhánh' : 'Xóa chi nhánh?'}
        message={
          deleteBlocked ? (
            <>
              <strong>{deleteTarget?.nameVietnamese}</strong> còn {deleteTarget?.managerCount ?? 0} quản lý,{' '}
              {deleteTarget?.staffCount ?? 0} nhân viên và {deleteTarget?.upcomingAppointments ?? 0} lịch hẹn sắp tới.
              Hãy chuyển nhân sự sang chi nhánh khác và xử lý các lịch hẹn trước, hoặc chọn &quot;Tạm ngưng&quot; để
              ngừng nhận lịch.
            </>
          ) : (
            <>
              <strong>{deleteTarget?.nameVietnamese}</strong> sẽ bị ẩn khỏi hệ thống. Lịch sử lịch hẹn và dịch vụ đã ghi
              nhận vẫn được giữ.
            </>
          )
        }
        confirmLabel={deleteBlocked ? 'Đã hiểu' : 'Xóa'}
        icon={deleteBlocked ? 'check' : 'delete'}
        tone={deleteBlocked ? 'primary' : 'danger'}
        busy={deleteBusy}
        error={deleteError}
        onConfirm={() => (deleteBlocked ? closeDelete() : void confirmDelete())}
        onClose={closeDelete}
      />
    </motion.div>
  )
}
