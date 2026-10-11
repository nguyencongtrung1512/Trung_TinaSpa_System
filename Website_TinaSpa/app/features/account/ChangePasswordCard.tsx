import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '~/components/ui/Icon'
import { changeMyPassword } from '~/lib/profile'
import { Field, FormError, inputClass, primaryButtonClass } from '~/portal/manager/services/form-ui'

export function ChangePasswordCard({ highlight }: { readonly highlight: boolean }) {
  const { t } = useTranslation()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string>()
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setDone(false)
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
      setDone(true)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t('account.password.errors.failed'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section
      className={`mt-6 rounded-[28px] border bg-white p-5 shadow-[0_20px_50px_rgba(58,41,48,0.06)] sm:p-8 ${
        highlight ? 'border-amber-300' : 'border-rose-soft/60'
      }`}
      aria-labelledby='change-password-title'
    >
      <h2 id='change-password-title' className='font-["Cormorant_Garamond",serif] text-3xl font-semibold text-[#3A2930]'>
        {t('account.password.title')}
      </h2>
      {highlight ? (
        <p className='mt-3 flex items-start gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800'>
          <Icon name='warning' size={18} className='mt-0.5 shrink-0' />
          {t('account.password.notice')}
        </p>
      ) : null}

      <form onSubmit={(event) => void submit(event)} noValidate className='mt-5 grid gap-4 sm:grid-cols-2'>
        <div className='sm:col-span-2'>
          <FormError message={error} />
        </div>
        <Field label={t('account.password.current')} required className='sm:col-span-2'>
          {(id) => (
            <input
              id={id}
              type='password'
              className={inputClass}
              value={current}
              onChange={(event) => setCurrent(event.target.value)}
              autoComplete='current-password'
            />
          )}
        </Field>
        <Field label={t('account.password.next')} required>
          {(id) => (
            <input
              id={id}
              type='password'
              className={inputClass}
              value={next}
              onChange={(event) => setNext(event.target.value)}
              autoComplete='new-password'
            />
          )}
        </Field>
        <Field label={t('account.password.confirm')} required>
          {(id) => (
            <input
              id={id}
              type='password'
              className={inputClass}
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              autoComplete='new-password'
            />
          )}
        </Field>
        <div className='flex items-center gap-4 sm:col-span-2'>
          <button type='submit' className={primaryButtonClass} disabled={busy}>
            <Icon name='lock_reset' size={18} />
            {busy ? t('account.password.submitting') : t('account.password.submit')}
          </button>
          {done ? (
            <span role='status' className='flex items-center gap-1.5 text-sm font-semibold text-emerald-700'>
              <Icon name='check_circle' size={18} />
              {t('account.password.success')}
            </span>
          ) : null}
        </div>
      </form>
    </section>
  )
}
