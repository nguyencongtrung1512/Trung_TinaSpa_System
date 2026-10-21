import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '~/components/ui/Icon'
import { useToast } from '~/components/ui/toast-view'
import { changeMyPassword } from '~/lib/profile'
import {
  Field,
  FormError,
  PortalDialog,
  inputClass,
  outlineButtonClass,
  primaryButtonClass
} from '~/portal/manager/services/form-ui'

function PasswordInput({
  id,
  value,
  onChange,
  autoComplete,
  autoFocus
}: {
  readonly id: string
  readonly value: string
  readonly onChange: (value: string) => void
  readonly autoComplete: string
  readonly autoFocus?: boolean
}) {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)
  return (
    <div className='relative'>
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        className={`${inputClass} pr-12`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
      />
      <button
        type='button'
        className='absolute inset-y-0 right-1.5 my-auto grid size-9 place-items-center rounded-full text-muted transition hover:bg-mist hover:text-clinic'
        aria-label={visible ? t('account.password.hide') : t('account.password.show')}
        aria-pressed={visible}
        onClick={() => setVisible((current) => !current)}
      >
        <Icon name={visible ? 'visibility_off' : 'visibility'} size={18} />
      </button>
    </div>
  )
}

export function ChangePasswordDialog({
  open,
  highlight,
  onClose
}: {
  readonly open: boolean
  readonly highlight: boolean
  readonly onClose: () => void
}) {
  const { t } = useTranslation()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string>()
  const toast = useToast()
  const [busy, setBusy] = useState(false)

  function close() {
    if (busy) return
    setCurrent('')
    setNext('')
    setConfirm('')
    setError(undefined)
    onClose()
  }

  async function submit() {
    if (!current) return setError(t('account.password.errors.current'))
    if (next.length < 8) return setError(t('account.password.errors.length'))
    if (next !== confirm) return setError(t('account.password.errors.match'))

    setBusy(true)
    setError(undefined)
    try {
      await changeMyPassword({ currentPassword: current, newPassword: next })
      setCurrent('')
      setNext('')
      setConfirm('')
      toast.success(t('account.password.success'))
      onClose()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t('account.password.errors.failed'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <PortalDialog
      open={open}
      size='md'
      title={t('account.password.title')}
      description={t('account.password.description')}
      onClose={close}
      onSubmit={() => void submit()}
      footer={
        <>
          <button type='button' className={outlineButtonClass} onClick={close} disabled={busy}>
            {t('account.password.cancel')}
          </button>
          <button type='submit' className={primaryButtonClass} disabled={busy}>
            <Icon name='lock_reset' size={18} />
            {busy ? t('account.password.submitting') : t('account.password.submit')}
          </button>
        </>
      }
    >
      <div className='grid gap-4'>
        {highlight ? (
          <p className='flex items-start gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800'>
            <Icon name='warning' size={18} className='mt-0.5 shrink-0' />
            {t('account.password.notice')}
          </p>
        ) : null}
        <FormError message={error} />
        <Field label={t('account.password.current')} required>
          {(id) => (
            <PasswordInput id={id} value={current} onChange={setCurrent} autoComplete='current-password' autoFocus />
          )}
        </Field>
        <Field label={t('account.password.next')} required hint={t('account.password.lengthHint')}>
          {(id) => <PasswordInput id={id} value={next} onChange={setNext} autoComplete='new-password' />}
        </Field>
        <Field label={t('account.password.confirm')} required>
          {(id) => <PasswordInput id={id} value={confirm} onChange={setConfirm} autoComplete='new-password' />}
        </Field>
      </div>
    </PortalDialog>
  )
}
