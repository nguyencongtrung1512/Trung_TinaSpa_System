import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '~/components/ui/Icon'
import { useToast } from '~/components/ui/toast-view'
import type { AuthUser } from '~/lib/auth'
import { fetchMyProfile, updateMyProfile } from '~/lib/profile'
import { IMAGE_ACCEPT, uploadImage, validateImageFile } from '~/lib/storage'
import { Field, FormError, inputClass, outlineButtonClass, primaryButtonClass } from '~/portal/manager/services/form-ui'
import { ImagePreview } from '~/components/ui/ImageUpload'
import { Select } from '~/components/ui/Select'

type Gender = NonNullable<AuthUser['gender']>

interface ProfileValues {
  readonly fullName: string
  readonly gender: Gender | ''
  readonly dateOfBirth: string
  readonly address: string
  readonly avatar: string
}

type ProfileErrors = Partial<Record<keyof ProfileValues, string>>

const genders: Gender[] = ['FEMALE', 'MALE', 'OTHER']

/** Small uppercase labels for the profile card. */
const fieldClass = '[&>label]:text-[11px] [&>label]:tracking-[0.14em] [&>label]:text-ink/80 [&>label]:uppercase'

function todayISO() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function ageOf(dateOfBirth: string) {
  const [year, month, day] = dateOfBirth.split('-').map(Number)
  const today = new Date()
  const hadBirthday = today.getMonth() + 1 > month || (today.getMonth() + 1 === month && today.getDate() >= day)
  return today.getFullYear() - year - (hadBirthday ? 0 : 1)
}

function toValues(user: AuthUser): ProfileValues {
  return {
    fullName: user.fullName,
    gender: user.gender ?? '',
    dateOfBirth: user.dateOfBirth ?? '',
    address: user.address ?? '',
    avatar: user.avatar ?? ''
  }
}

function initials(fullName: string) {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((word) => word[0]?.toUpperCase())
    .join('')
}

function ProfileEditor({ user, onChangePassword }: { readonly user: AuthUser; readonly onChangePassword: () => void }) {
  const { t, i18n } = useTranslation()
  const [values, setValues] = useState(() => toValues(user))
  const [saved, setSaved] = useState(() => toValues(user))
  const [errors, setErrors] = useState<ProfileErrors>({})
  const [submitError, setSubmitError] = useState<string>()
  const toast = useToast()
  const [busy, setBusy] = useState(false)
  const [avatarBroken, setAvatarBroken] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [avatarError, setAvatarError] = useState<string>()
  const avatarInput = useRef<HTMLInputElement>(null)
  const uploading = uploadProgress !== null

  const dirty = (Object.keys(values) as (keyof ProfileValues)[]).some((key) => values[key] !== saved[key])
  const avatar = values.avatar.trim()

  function update<K extends keyof ProfileValues>(field: K, value: ProfileValues[K]) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    if (field === 'avatar') setAvatarBroken(false)
  }

  async function uploadAvatar(file: File) {
    const invalid = validateImageFile(file)
    if (invalid) return setAvatarError(invalid)
    setAvatarError(undefined)
    setUploadProgress(0)
    try {
      const { publicUrl } = await uploadImage(file, 'avatars', setUploadProgress)
      update('avatar', publicUrl)
    } catch (error) {
      setAvatarError(error instanceof Error ? error.message : t('account.avatarUpload.failed'))
    } finally {
      setUploadProgress(null)
    }
  }

  async function submit() {
    if (uploading) return
    const nextErrors: ProfileErrors = {}
    if (values.fullName.trim().length < 2) nextErrors.fullName = t('account.errors.fullName')
    if (values.dateOfBirth && values.dateOfBirth > todayISO()) nextErrors.dateOfBirth = t('account.errors.dateOfBirth')
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    setBusy(true)
    setSubmitError(undefined)
    try {
      const { user: next } = await updateMyProfile({
        fullName: values.fullName.trim(),
        gender: values.gender || null,
        dateOfBirth: values.dateOfBirth || null,
        address: values.address.trim() || null,
        avatar: avatar || null
      })
      const nextValues = toValues(next)
      setValues(nextValues)
      setSaved(nextValues)
      toast.success(t('account.saved'))
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : t('account.errors.save'))
    } finally {
      setBusy(false)
    }
  }

  const memberSince = user.createdAt
    ? new Intl.DateTimeFormat(i18n.language === 'en' ? 'en-GB' : 'vi-VN', {
        month: '2-digit',
        year: 'numeric'
      }).format(new Date(user.createdAt))
    : null

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        void submit()
      }}
    >
      <div className='flex items-center gap-4 border-b border-rose-soft/60 pb-6 sm:gap-5'>
        <div className='relative shrink-0'>
          <span className='block size-20 rounded-full bg-gradient-to-br from-clinic to-[#f7b7cf] p-[3px] shadow-[0_10px_24px_rgba(225,29,116,0.2)] sm:size-24'>
            <span className='grid size-full place-items-center overflow-hidden rounded-full border-2 border-white bg-gradient-to-br from-[#f7b7cf] to-clinic text-2xl font-bold text-white'>
              {avatar && !avatarBroken ? (
                <button
                  type='button'
                  className='group relative size-full cursor-zoom-in'
                  aria-label={t('account.avatarUpload.preview')}
                  title={t('account.avatarUpload.preview')}
                  onClick={() => setPreviewOpen(true)}
                >
                  <img
                    src={avatar}
                    alt=''
                    className='size-full object-cover transition-transform duration-300 group-hover:scale-105'
                    onError={() => setAvatarBroken(true)}
                  />
                  <span className='absolute inset-0 grid place-items-center bg-ink/35 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100'>
                    <Icon name='zoom_in' size={24} />
                  </span>
                </button>
              ) : (
                initials(values.fullName || user.fullName)
              )}
            </span>
          </span>
          {uploadProgress !== null ? (
            <span className='absolute inset-[3px] grid place-items-center rounded-full bg-ink/45 text-xs font-bold text-white tabular-nums'>
              {uploadProgress}%
            </span>
          ) : null}
          <button
            type='button'
            className='absolute -right-0.5 -bottom-0.5 grid size-8 place-items-center rounded-full bg-clinic text-white shadow-md ring-[3px] ring-white transition hover:scale-105 hover:bg-clinic-deep disabled:opacity-60 sm:size-9'
            aria-label={t('account.avatarUpload.replace')}
            title={t('account.avatarUpload.replace')}
            disabled={uploading}
            onClick={() => avatarInput.current?.click()}
          >
            <Icon name='photo_camera' size={18} />
          </button>
          <input
            ref={avatarInput}
            type='file'
            accept={IMAGE_ACCEPT}
            className='hidden'
            onChange={(event) => {
              const file = event.target.files?.[0]
              event.target.value = ''
              if (file) void uploadAvatar(file)
            }}
          />
        </div>
        <div className='min-w-0'>
          <p className='truncate font-serif text-2xl text-ink sm:text-[28px]'>{values.fullName || user.fullName}</p>
          <p className='mt-0.5 text-sm font-semibold text-clinic tabular-nums'>{user.phone}</p>
          <p className='mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs'>
            <span className='rounded-full bg-mist px-2.5 py-1 text-[10px] font-bold tracking-wider text-clinic uppercase'>
              {t(`account.roles.${user.role}`, { defaultValue: user.role })}
            </span>
            {memberSince ? <span className='text-muted'>{t('account.memberSince', { date: memberSince })}</span> : null}
            {values.dateOfBirth ? (
              <span className='text-muted'>· {t('account.age', { count: ageOf(values.dateOfBirth) })}</span>
            ) : null}
          </p>
        </div>
      </div>

      {previewOpen && avatar ? (
        <ImagePreview src={avatar} closeLabel={t('common.close')} onClose={() => setPreviewOpen(false)} />
      ) : null}

      {avatarError ? <p className='mt-3 text-xs text-clinic'>{avatarError}</p> : null}
      {values.avatar !== saved.avatar && !uploading ? (
        <p className='mt-3 text-xs text-muted'>{t('account.avatarUpload.pending')}</p>
      ) : null}

      <div className='mt-6'>
        <FormError message={submitError} />
      </div>

      <div className='grid gap-4 sm:grid-cols-2 sm:gap-5'>
        <Field label={t('account.fullName')} required error={errors.fullName} className={`${fieldClass} sm:col-span-2`}>
          {(id) => (
            <div className='relative'>
              <input
                id={id}
                className={`${inputClass} pr-11`}
                value={values.fullName}
                onChange={(event) => update('fullName', event.target.value)}
                autoComplete='name'
                maxLength={100}
              />
              <Icon
                name='person'
                size={18}
                className='pointer-events-none absolute inset-y-0 right-4 my-auto h-fit text-muted'
              />
            </div>
          )}
        </Field>
        <Field label={t('account.phone')} hint={t('account.phoneHint')} className={fieldClass}>
          {(id) => (
            <input id={id} className={`${inputClass} bg-mist/50 text-muted`} value={user.phone} readOnly disabled />
          )}
        </Field>
        <Field label={t('account.gender')} className={fieldClass}>
          {(id) => (
            <Select
              id={id}
              value={values.gender}
              onChange={(value) => update('gender', value)}
              options={[
                { value: '', label: t('account.genderNone') },
                ...genders.map((gender) => ({ value: gender, label: t(`account.genders.${gender}`) }))
              ]}
            />
          )}
        </Field>
        <Field label={t('account.dateOfBirth')} error={errors.dateOfBirth} className={`${fieldClass} sm:col-span-2`}>
          {(id) => (
            <input
              id={id}
              type='date'
              className={inputClass}
              value={values.dateOfBirth}
              max={todayISO()}
              onChange={(event) => update('dateOfBirth', event.target.value)}
              autoComplete='bday'
            />
          )}
        </Field>
        <Field label={t('account.address')} className={`${fieldClass} sm:col-span-2`}>
          {(id) => (
            <input
              id={id}
              className={inputClass}
              value={values.address}
              onChange={(event) => update('address', event.target.value)}
              placeholder={t('account.addressPlaceholder')}
              autoComplete='street-address'
              maxLength={255}
            />
          )}
        </Field>
      </div>

      <div className='mt-7 flex flex-col gap-3 sm:flex-row'>
        <button
          type='submit'
          className={`${primaryButtonClass} flex-1 bg-gradient-to-r from-clinic-deep to-clinic tracking-[0.12em] uppercase hover:brightness-110`}
          disabled={busy || uploading || !dirty}
        >
          <Icon name='save' size={18} />
          {busy ? t('account.saving') : t('account.save')}
        </button>
        <button type='button' className={outlineButtonClass} onClick={onChangePassword}>
          <Icon name='lock' size={18} />
          {t('account.password.open')}
        </button>
      </div>
    </form>
  )
}

export function ProfileForm({
  initialUser,
  onChangePassword
}: {
  readonly initialUser: AuthUser
  readonly onChangePassword: () => void
}) {
  const { t } = useTranslation()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    fetchMyProfile()
      .then((profile) => {
        if (!cancelled) setUser(profile.user)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
    return () => {
      cancelled = true
    }
  }, [attempt])

  if (error) {
    return (
      <div className='flex flex-col items-center gap-3 py-10 text-center'>
        <Icon name='cloud_off' size={32} className='text-clinic' />
        <p className='text-sm text-ink'>{t('account.errors.load')}</p>
        <button
          type='button'
          className={outlineButtonClass}
          onClick={() => {
            setError(false)
            setAttempt((value) => value + 1)
          }}
        >
          <Icon name='refresh' size={18} />
          {t('account.retry')}
        </button>
      </div>
    )
  }

  if (!user) {
    return (
      <div className='animate-pulse' aria-busy='true' aria-label={initialUser.fullName}>
        <div className='flex items-center gap-4 border-b border-rose-soft/60 pb-6'>
          <div className='size-20 rounded-full bg-canvas sm:size-24' />
          <div className='space-y-2'>
            <div className='h-5 w-48 rounded-full bg-canvas' />
            <div className='h-4 w-32 rounded-full bg-canvas' />
          </div>
        </div>
        <div className='mt-6 grid gap-4 sm:grid-cols-2'>
          {[0, 1, 2, 3, 4].map((row) => (
            <div key={row} className={`h-16 rounded-2xl bg-canvas ${row === 1 || row === 2 ? '' : 'sm:col-span-2'}`} />
          ))}
        </div>
      </div>
    )
  }

  return <ProfileEditor user={user} onChangePassword={onChangePassword} />
}
