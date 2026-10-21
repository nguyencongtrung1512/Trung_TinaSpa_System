import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '~/components/ui/Icon'
import { useToast } from '~/components/ui/toast-view'
import { ImageUpload } from '~/components/ui/ImageUpload'
import type { AuthUser } from '~/lib/auth'
import { fetchMyProfile, updateMyProfile } from '~/lib/profile'
import { MAX_IMAGE_SIZE_MB } from '~/lib/storage'
import { Field, FormError, inputClass, outlineButtonClass, primaryButtonClass } from '~/portal/manager/services/form-ui'
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

function ProfileEditor({ user }: { readonly user: AuthUser }) {
  const { t, i18n } = useTranslation()
  const [values, setValues] = useState(() => toValues(user))
  const [saved, setSaved] = useState(() => toValues(user))
  const [errors, setErrors] = useState<ProfileErrors>({})
  const [submitError, setSubmitError] = useState<string>()
  const toast = useToast()
  const [busy, setBusy] = useState(false)
  const [avatarBroken, setAvatarBroken] = useState(false)
  const [uploading, setUploading] = useState(false)

  const dirty = (Object.keys(values) as (keyof ProfileValues)[]).some((key) => values[key] !== saved[key])
  const avatar = values.avatar.trim()

  function update<K extends keyof ProfileValues>(field: K, value: ProfileValues[K]) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    if (field === 'avatar') setAvatarBroken(false)
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
      <div className='flex flex-col gap-4 border-b border-rose-soft/60 pb-6 sm:flex-row sm:items-center'>
        <span className='grid size-20 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-[#f7b7cf] to-clinic text-2xl font-bold text-white shadow-[0_10px_24px_rgba(225,29,116,0.2)]'>
          {avatar && !avatarBroken ? (
            <img src={avatar} alt='' className='size-full object-cover' onError={() => setAvatarBroken(true)} />
          ) : (
            initials(values.fullName || user.fullName)
          )}
        </span>
        <div className='min-w-0'>
          <p className='truncate text-xl font-extrabold text-ink'>{values.fullName || user.fullName}</p>
          <p className='mt-0.5 text-sm text-muted tabular-nums'>{user.phone}</p>
          <p className='mt-2 flex flex-wrap items-center gap-2 text-xs'>
            <span className='rounded-full bg-mist px-2.5 py-1 font-bold text-clinic'>
              {t(`account.roles.${user.role}`, { defaultValue: user.role })}
            </span>
            {values.dateOfBirth ? (
              <span className='text-muted'>{t('account.age', { count: ageOf(values.dateOfBirth) })}</span>
            ) : null}
            {memberSince ? <span className='text-muted'>{t('account.memberSince', { date: memberSince })}</span> : null}
          </p>
        </div>
      </div>

      <div className='mt-6'>
        <FormError message={submitError} />
      </div>

      <div className='grid gap-4 sm:grid-cols-2'>
        <Field label={t('account.fullName')} required error={errors.fullName} className='sm:col-span-2'>
          {(id) => (
            <input
              id={id}
              className={inputClass}
              value={values.fullName}
              onChange={(event) => update('fullName', event.target.value)}
              autoComplete='name'
              maxLength={100}
            />
          )}
        </Field>
        <Field label={t('account.phone')} hint={t('account.phoneHint')}>
          {(id) => (
            <input id={id} className={`${inputClass} bg-canvas text-muted`} value={user.phone} readOnly disabled />
          )}
        </Field>
        <Field label={t('account.gender')}>
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
        <Field label={t('account.dateOfBirth')} error={errors.dateOfBirth}>
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
        <Field label={t('account.avatar')}>
          {(id) => (
            <ImageUpload
              id={id}
              folder='avatars'
              value={values.avatar}
              onChange={(url) => update('avatar', url)}
              onUploadingChange={setUploading}
              labels={{
                choose: t('account.avatarUpload.choose'),
                replace: t('account.avatarUpload.replace'),
                remove: t('account.avatarUpload.remove'),
                uploading: t('account.avatarUpload.uploading'),
                hint: t('account.avatarUpload.hint', { size: MAX_IMAGE_SIZE_MB })
              }}
            />
          )}
        </Field>
        <Field label={t('account.address')} className='sm:col-span-2'>
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

      <div className='mt-6 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end'>
        <button type='submit' className={primaryButtonClass} disabled={busy || uploading || !dirty}>
          <Icon name='save' size={18} />
          {busy ? t('account.saving') : t('account.save')}
        </button>
      </div>
    </form>
  )
}

export function ProfileForm({ initialUser }: { readonly initialUser: AuthUser }) {
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
          <div className='size-20 rounded-full bg-canvas' />
          <div className='space-y-2'>
            <div className='h-5 w-48 rounded-full bg-canvas' />
            <div className='h-4 w-32 rounded-full bg-canvas' />
          </div>
        </div>
        <div className='mt-6 grid gap-4 sm:grid-cols-2'>
          {[0, 1, 2, 3, 4].map((row) => (
            <div key={row} className={`h-16 rounded-2xl bg-canvas ${row === 0 ? 'sm:col-span-2' : ''}`} />
          ))}
        </div>
      </div>
    )
  }

  return <ProfileEditor user={user} />
}
