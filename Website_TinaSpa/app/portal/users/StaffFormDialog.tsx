import { useState } from 'react'
import { Icon } from '~/components/ui/Icon'
import {
  Field,
  FormError,
  PortalDialog,
  iconButtonClass,
  inputClass,
  outlineButtonClass,
  primaryButtonClass
} from '~/portal/manager/services/form-ui'
import { useBranches } from '~/portal/appointments/useAppointments'
import { createStaff, userGenderLabels, type StaffPayload, type UserGender } from './users.api'

interface StaffFormValues {
  readonly fullName: string
  readonly phone: string
  readonly password: string
  readonly gender: UserGender | ''
  readonly dateOfBirth: string
  readonly address: string
  readonly avatar: string
  readonly note: string
  readonly branchID: string
  readonly role: 'STAFF' | 'MANAGER'
}

type FormErrors = Partial<Record<keyof StaffFormValues, string>>

const emptyValues: StaffFormValues = {
  fullName: '',
  phone: '',
  password: '',
  gender: '',
  dateOfBirth: '',
  address: '',
  avatar: '',
  note: '',
  branchID: '',
  role: 'STAFF'
}

const PHONE_PATTERN = /^\+?[0-9]{9,15}$/

function todayISO() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function validate(values: StaffFormValues, requireBranch: boolean): FormErrors {
  const errors: FormErrors = {}
  if (values.fullName.trim().length < 2) errors.fullName = 'Nhập họ tên (ít nhất 2 ký tự).'
  if (!PHONE_PATTERN.test(values.phone.trim())) errors.phone = 'Số điện thoại gồm 9–15 chữ số, có thể bắt đầu bằng +.'
  if (values.password.length < 8) errors.password = 'Mật khẩu tối thiểu 8 ký tự.'
  if (values.dateOfBirth && values.dateOfBirth > todayISO()) errors.dateOfBirth = 'Ngày sinh không được ở tương lai.'
  if (requireBranch && !values.branchID) errors.branchID = 'Chọn khu vực làm việc.'
  return errors
}

const blank = (value: string) => value.trim() || null

function toPayload(values: StaffFormValues, includeBranch: boolean, includeRole: boolean): StaffPayload {
  return {
    fullName: values.fullName.trim(),
    phone: values.phone.trim(),
    password: values.password,
    gender: values.gender || null,
    dateOfBirth: values.dateOfBirth || null,
    address: blank(values.address),
    avatar: blank(values.avatar),
    note: blank(values.note),
    ...(includeBranch ? { branchID: values.branchID } : {}),
    ...(includeRole ? { role: values.role } : {})
  }
}

export interface StaffFormDialogProps {
  readonly open: boolean
  readonly onClose: () => void
  readonly onSaved: (message: string) => void
  readonly canPickBranch?: boolean
  readonly canCreateManager?: boolean
}

export function StaffFormDialog({
  open,
  onClose,
  onSaved,
  canPickBranch = false,
  canCreateManager = false
}: StaffFormDialogProps) {
  const branches = useBranches()
  const [values, setValues] = useState(emptyValues)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitError, setSubmitError] = useState<string>()
  const [busy, setBusy] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [avatarBroken, setAvatarBroken] = useState(false)

  function update<K extends keyof StaffFormValues>(field: K, value: StaffFormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    if (field === 'avatar') setAvatarBroken(false)
  }

  async function submit() {
    const nextErrors = validate(values, canPickBranch)
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    setBusy(true)
    setSubmitError(undefined)
    try {
      const payload = toPayload(values, canPickBranch, canCreateManager)
      await createStaff(payload)
      const roleLabel = payload.role === 'MANAGER' ? 'quản lý' : 'nhân viên'
      onSaved(`Đã thêm ${roleLabel} "${payload.fullName}".`)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Không thể thêm nhân viên.')
    } finally {
      setBusy(false)
    }
  }

  const avatar = values.avatar.trim()

  return (
    <PortalDialog
      open={open}
      title={canCreateManager ? 'Thêm tài khoản nội bộ' : 'Thêm nhân viên'}
      description={
        canCreateManager
          ? 'Admin gán khu vực cho quản lý hoặc nhân viên. Quản lý sau đó chỉ xem nhân viên và khách hàng của khu vực đó.'
          : 'Tài khoản nhân viên được gắn vào khu vực của bạn. Nhân viên đăng nhập bằng số điện thoại và mật khẩu này.'
      }
      onClose={onClose}
      onSubmit={() => void submit()}
      footer={
        <>
          <button type='button' className={outlineButtonClass} onClick={onClose}>
            Hủy
          </button>
          <button type='submit' className={primaryButtonClass} disabled={busy}>
            <Icon name='person_add' size={18} />
            {busy ? 'Đang lưu...' : canCreateManager ? 'Thêm tài khoản' : 'Thêm nhân viên'}
          </button>
        </>
      }
    >
      <FormError message={submitError} />

      <p className='text-xs font-bold tracking-[0.16em] text-clinic uppercase'>Tài khoản đăng nhập</p>
      <div className='mt-4 grid gap-4 sm:grid-cols-2'>
        <Field label='Họ và tên' required error={errors.fullName} className='sm:col-span-2'>
          {(id) => (
            <input
              id={id}
              className={inputClass}
              value={values.fullName}
              onChange={(event) => update('fullName', event.target.value)}
              placeholder='VD: Nguyễn Linh Đan'
              autoComplete='off'
            />
          )}
        </Field>
        <Field label='Số điện thoại' required error={errors.phone}>
          {(id) => (
            <input
              id={id}
              type='tel'
              inputMode='tel'
              className={inputClass}
              value={values.phone}
              onChange={(event) => update('phone', event.target.value.replace(/[^\d+]/g, ''))}
              placeholder='VD: 0901234567'
              autoComplete='off'
            />
          )}
        </Field>
        <Field label='Mật khẩu' required error={errors.password} hint='Tối thiểu 8 ký tự.'>
          {(id) => (
            <div className='relative'>
              <input
                id={id}
                type={showPassword ? 'text' : 'password'}
                className={`${inputClass} pr-12`}
                value={values.password}
                onChange={(event) => update('password', event.target.value)}
                autoComplete='new-password'
              />
              <button
                type='button'
                className={`${iconButtonClass} absolute top-1/2 right-1.5 -translate-y-1/2`}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                onClick={() => setShowPassword((current) => !current)}
              >
                <Icon name={showPassword ? 'visibility_off' : 'visibility'} size={18} />
              </button>
            </div>
          )}
        </Field>
      </div>

      <p className='mt-6 text-xs font-bold tracking-[0.16em] text-clinic uppercase'>Hồ sơ</p>
      <div className='mt-4 grid gap-4 sm:grid-cols-2'>
        {canPickBranch ? (
          <Field label='Khu vực' required error={errors.branchID} className={canCreateManager ? '' : 'sm:col-span-2'}>
            {(id) => (
              <select id={id} className={inputClass} value={values.branchID} onChange={(event) => update('branchID', event.target.value)}>
                <option value=''>Chọn khu vực</option>
                {branches.map((item) => (
                  <option key={item.branchID} value={item.branchID}>
                    {item.nameVietnamese} ({item.branchID})
                  </option>
                ))}
              </select>
            )}
          </Field>
        ) : null}
        {canCreateManager ? (
          <Field label='Vai trò' required>
            {(id) => (
              <select
                id={id}
                className={inputClass}
                value={values.role}
                onChange={(event) => update('role', event.target.value as 'STAFF' | 'MANAGER')}
              >
                <option value='STAFF'>Nhân viên</option>
                <option value='MANAGER'>Quản lý khu vực</option>
              </select>
            )}
          </Field>
        ) : null}
        <Field label='Giới tính'>
          {(id) => (
            <select
              id={id}
              className={inputClass}
              value={values.gender}
              onChange={(event) => update('gender', event.target.value as UserGender | '')}
            >
              <option value=''>Chưa chọn</option>
              {Object.entries(userGenderLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field label='Ngày sinh' error={errors.dateOfBirth} hint='Dùng để tính tuổi.'>
          {(id) => (
            <input
              id={id}
              type='date'
              className={inputClass}
              value={values.dateOfBirth}
              max={todayISO()}
              onChange={(event) => update('dateOfBirth', event.target.value)}
            />
          )}
        </Field>
        <Field label='Địa chỉ' className='sm:col-span-2'>
          {(id) => (
            <input
              id={id}
              className={inputClass}
              value={values.address}
              onChange={(event) => update('address', event.target.value)}
              placeholder='Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành'
              maxLength={255}
            />
          )}
        </Field>
        <Field label='Ảnh đại diện' hint='Đường dẫn ảnh, VD: /images/staff/linh-dan.jpg' className='sm:col-span-2'>
          {(id) => (
            <div className='flex items-center gap-3'>
              <span className='grid size-11 shrink-0 place-items-center overflow-hidden rounded-full bg-mist text-clinic'>
                {avatar && !avatarBroken ? (
                  <img src={avatar} alt='' className='size-full object-cover' onError={() => setAvatarBroken(true)} />
                ) : (
                  <Icon name='person' size={22} />
                )}
              </span>
              <input
                id={id}
                className={inputClass}
                value={values.avatar}
                onChange={(event) => update('avatar', event.target.value)}
              />
            </div>
          )}
        </Field>
        <Field label='Ghi chú nội bộ' className='sm:col-span-2'>
          {(id) => (
            <textarea
              id={id}
              rows={2}
              className={inputClass}
              value={values.note}
              onChange={(event) => update('note', event.target.value)}
            />
          )}
        </Field>
      </div>
    </PortalDialog>
  )
}
