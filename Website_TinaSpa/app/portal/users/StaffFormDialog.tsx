import { useState } from 'react'
import { Icon } from '~/components/ui/Icon'
import { ImageUpload } from '~/components/ui/ImageUpload'
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
import {
  createStaff,
  updateStaff,
  userGenderLabels,
  type PortalUser,
  type StaffPayload,
  type UserGender
} from './users.api'
import { Select } from '~/components/ui/Select'

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

function valuesFromUser(user: PortalUser): StaffFormValues {
  return {
    fullName: user.fullName,
    phone: user.phone,
    password: '',
    gender: user.gender ?? '',
    dateOfBirth: user.dateOfBirth ?? '',
    address: user.address ?? '',
    avatar: user.avatar ?? '',
    note: '',
    branchID: user.branchID ?? '',
    role: user.role === 'MANAGER' ? 'MANAGER' : 'STAFF'
  }
}

const PHONE_PATTERN = /^\+?[0-9]{9,15}$/

function todayISO() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function validate(values: StaffFormValues, requireBranch: boolean, editing: boolean): FormErrors {
  const errors: FormErrors = {}
  if (values.fullName.trim().length < 2) errors.fullName = 'Nhập họ tên (ít nhất 2 ký tự).'
  if (!PHONE_PATTERN.test(values.phone.trim())) errors.phone = 'Số điện thoại gồm 9–15 chữ số, có thể bắt đầu bằng +.'
  // Khi sửa, để trống mật khẩu nghĩa là giữ mật khẩu cũ.
  if ((!editing || values.password) && values.password.length < 8) errors.password = 'Mật khẩu tối thiểu 8 ký tự.'
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
  /** Có giá trị thì dialog ở chế độ sửa tài khoản này. */
  readonly user?: PortalUser
}

export function StaffFormDialog({
  open,
  onClose,
  onSaved,
  canPickBranch = false,
  canCreateManager = false,
  user
}: StaffFormDialogProps) {
  const branches = useBranches()
  const editing = user !== undefined
  const [values, setValues] = useState(() => (user ? valuesFromUser(user) : emptyValues))
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitError, setSubmitError] = useState<string>()
  const [busy, setBusy] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [uploading, setUploading] = useState(false)

  const selectedBranch = branches.find((b) => b.branchID === values.branchID) ?? null

  function update<K extends keyof StaffFormValues>(field: K, value: StaffFormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  async function submit() {
    if (uploading) return
    const nextErrors = validate(values, canPickBranch, editing)
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    setBusy(true)
    setSubmitError(undefined)
    try {
      if (user) {
        const { password, note, ...rest } = toPayload(values, canPickBranch, false)
        await updateStaff(user.userID, {
          ...rest,
          ...(password ? { password } : {}),
          ...(note ? { note } : {})
        })
        const moved = canPickBranch && values.branchID !== (user.branchID ?? '')
        onSaved(`Đã cập nhật "${rest.fullName}"${moved ? ' và chuyển khu vực' : ''}.`)
      } else {
        const payload = toPayload(values, canPickBranch, canCreateManager)
        await createStaff(payload)
        const roleLabel = payload.role === 'MANAGER' ? 'quản lý' : 'nhân viên'
        onSaved(`Đã thêm ${roleLabel} "${payload.fullName}".`)
      }
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : editing ? 'Không thể cập nhật tài khoản.' : 'Không thể thêm nhân viên.'
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <PortalDialog
      open={open}
      title={editing ? `Sửa tài khoản ${user.fullName}` : canCreateManager ? 'Thêm tài khoản nội bộ' : 'Thêm nhân viên'}
      description={
        editing
          ? canPickBranch
            ? 'Đổi khu vực hoặc mật khẩu sẽ buộc tài khoản đăng nhập lại.'
            : 'Đặt mật khẩu mới sẽ buộc nhân viên đăng nhập lại. Chỉ quản trị viên được chuyển khu vực.'
          : canCreateManager
            ? 'Admin gán khu vực cho quản lý hoặc nhân viên.'
            : 'Tài khoản nhân viên được gắn vào khu vực của bạn. Nhân viên đăng nhập bằng số điện thoại và mật khẩu này.'
      }
      onClose={onClose}
      onSubmit={() => void submit()}
      footer={
        <>
          <button type='button' className={outlineButtonClass} onClick={onClose}>
            Hủy
          </button>
          <button type='submit' className={primaryButtonClass} disabled={busy || uploading}>
            <Icon name={editing ? 'save' : 'person_add'} size={18} />
            {busy ? 'Đang lưu...' : editing ? 'Lưu thay đổi' : canCreateManager ? 'Thêm tài khoản' : 'Thêm nhân viên'}
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
        <Field
          label={editing ? 'Mật khẩu mới' : 'Mật khẩu'}
          required={!editing}
          error={errors.password}
          hint={editing ? 'Để trống nếu giữ mật khẩu cũ.' : 'Tối thiểu 8 ký tự.'}
        >
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
          <Field
            label='Khu vực'
            required
            error={errors.branchID}
            className={canCreateManager && !editing ? '' : 'sm:col-span-2'}
          >
            {(id) => (
              <>
                <Select
                  id={id}
                  value={values.branchID}
                  onChange={(value) => update('branchID', value)}
                  placeholder='Chọn khu vực'
                  options={branches.map((item) => ({ value: item.branchID, label: item.nameVietnamese }))}
                />
                {selectedBranch?.addressVietnamese ? (
                  <p className='mt-1.5 flex items-start gap-1 text-xs text-stone-500'>
                    <Icon name='location_on' size={14} className='mt-px shrink-0 text-clinic' />
                    {selectedBranch.addressVietnamese}
                  </p>
                ) : null}
              </>
            )}
          </Field>
        ) : null}
        {canCreateManager && !editing ? (
          <Field label='Vai trò' required>
            {(id) => (
              <Select
                id={id}
                value={values.role}
                onChange={(value) => update('role', value)}
                options={[
                  { value: 'STAFF', label: 'Nhân viên' },
                  { value: 'MANAGER', label: 'Quản lý khu vực' }
                ]}
              />
            )}
          </Field>
        ) : null}
        <Field label='Giới tính'>
          {(id) => (
            <Select
              id={id}
              value={values.gender}
              onChange={(value) => update('gender', value)}
              options={[
                { value: '', label: 'Chưa chọn' },
                ...(Object.keys(userGenderLabels) as UserGender[]).map((gender) => ({
                  value: gender,
                  label: userGenderLabels[gender]
                }))
              ]}
            />
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
        <Field label='Ảnh đại diện' className='sm:col-span-2'>
          {(id) => (
            <ImageUpload
              id={id}
              folder='staff'
              value={values.avatar}
              onChange={(url) => update('avatar', url)}
              onUploadingChange={setUploading}
            />
          )}
        </Field>
        <Field
          label='Ghi chú nội bộ'
          hint={editing ? 'Để trống nếu giữ ghi chú cũ.' : undefined}
          className='sm:col-span-2'
        >
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
