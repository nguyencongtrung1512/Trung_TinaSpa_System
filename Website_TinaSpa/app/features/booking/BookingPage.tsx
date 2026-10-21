import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { useSearchParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Icon } from '~/components/ui/Icon'
import { StableText } from '~/components/ui/StableText'
import { useToast } from '~/components/ui/toast-view'
import { currentLanguage } from '~/i18n'
import {
  bookingApi,
  branchAddress,
  branchName,
  localDateIso,
  localTime,
  timeOptions,
  type Branch,
  type BookingReceipt
} from '~/lib/booking'
import { Select } from '~/components/ui/Select'

interface BookingValues {
  readonly name: string
  readonly phone: string
  readonly branch: string
  readonly date: string
  readonly time: string
  readonly note: string
}

const emptyValues: BookingValues = {
  name: '',
  phone: '',
  branch: '',
  date: '',
  time: '',
  note: ''
}

type FieldName = keyof BookingValues

function validate(values: BookingValues) {
  const errors: Partial<Record<FieldName, string>> = {}
  if (values.name.trim().length < 2) errors.name = 'booking.errors.name'
  if (!/^(0|\+84)\d{8,10}$/.test(values.phone.replaceAll(/\s/g, ''))) {
    errors.phone = 'booking.errors.phone'
  }
  if (!values.branch) errors.branch = 'booking.errors.branch'
  if (!values.date) errors.date = 'booking.errors.date'
  else if (values.date < localDateIso()) errors.date = 'booking.errors.datePast'
  if (!values.time) errors.time = 'booking.errors.time'
  return errors
}

export function BookingPage() {
  const { t, i18n } = useTranslation()
  const language = i18n.resolvedLanguage ?? currentLanguage()
  const [searchParams] = useSearchParams()
  const [branches, setBranches] = useState<Branch[]>([])
  const [branchesError, setBranchesError] = useState(false)
  const [values, setValues] = useState<BookingValues>(emptyValues)
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const toast = useToast()
  const [receipt, setReceipt] = useState<BookingReceipt | null>(null)

  useEffect(() => {
    let active = true
    bookingApi
      .listBranches()
      .then((items) => {
        if (!active) return
        setBranches(items)
        const preset =
          items.find((item) => item.slug === searchParams.get('branch')) ?? (items.length === 1 ? items[0] : undefined)
        if (preset) setValues((current) => (current.branch ? current : { ...current, branch: preset.branchID }))
      })
      .catch(() => {
        if (active) setBranchesError(true)
      })
    return () => {
      active = false
    }
  }, [searchParams])

  const selectedBranch = branches.find((item) => item.branchID === values.branch)

  const availableTimes = useMemo(() => {
    if (!selectedBranch) return []
    const times = timeOptions(selectedBranch.openTime, selectedBranch.closeTime)
    if (values.date !== localDateIso()) return times
    const now = localTime()
    return times.filter((time) => time > now)
  }, [selectedBranch, values.date])

  function update(field: FieldName, value: string) {
    setValues((current) => {
      const next = { ...current, [field]: value }
      return field === 'branch' || field === 'date' ? { ...next, time: '' } : next
    })
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    const toastID = toast.loading(
      t('booking.toast.sending'),
      selectedBranch ? branchName(selectedBranch, language) : undefined
    )
    try {
      const note = values.note.trim()
      const created = await bookingApi.create({
        customerName: values.name.trim(),
        phoneNumber: values.phone.replaceAll(/\s/g, ''),
        branchID: values.branch,
        appointmentDate: values.date,
        appointmentTime: values.time,
        ...(note ? { customerNote: note } : {})
      })
      setReceipt(created)
      toast.update(toastID, {
        type: 'success',
        title: t('booking.toast.success'),
        message: t('booking.toast.successMessage', {
          time: created.appointmentTime,
          date: created.appointmentDate.split('-').reverse().join('/')
        })
      })
    } catch (error) {
      toast.update(toastID, {
        type: 'error',
        title: t('booking.toast.error'),
        message: error instanceof Error ? error.message : t('booking.errors.submit')
      })
    } finally {
      setSubmitting(false)
    }
  }

  const errorText = (field: FieldName) => {
    const key = errors[field]
    return key ? t(key) : undefined
  }

  return (
    <section className='booking-page relative overflow-hidden bg-[#FFF8FA]'>
      <img
        src='/images/Background_Booking.png'
        alt=''
        className='pointer-events-none absolute inset-0 h-full w-full object-cover object-[12%_center] lg:object-[72%_center]'
      />

      <div className='relative mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 lg:py-16'>
        <div className='max-w-[740px]'>
          <p className='flex items-center gap-3 text-[11px] font-medium tracking-[0.22em] text-[#D4145A] uppercase'>
            <span className='h-1.5 w-1.5 rounded-full bg-[#D4145A]' />
            Dr Tina Beauty
            <span className='h-px w-10 bg-[#E83E78]/45' />
            Spa & Aesthetics
          </p>

          <h1 className='font-["Cormorant_Garamond",serif] text-5xl leading-none font-semibold tracking-[0.08em] text-[#3A2930] uppercase sm:text-6xl lg:text-7xl'>
            <StableText i18nKey='booking.title' block />
          </h1>
          <p className='font-["Dancing_Script",cursive] text-4xl leading-none text-[#D4145A] sm:text-5xl'>
            <StableText i18nKey='booking.tagline' block />
          </p>
          {/* <p className='mt-5 max-w-xl text-sm leading-7 text-[#3A2930]/75'>
            <StableText i18nKey='booking.intro' block />
            <StableText i18nKey='booking.introMore' block className='mt-1' />
          </p> */}
          {/* <p className='mt-5 font-["Dancing_Script",cursive] text-2xl text-[#E83E78] sm:text-[1.85rem]'>
            <StableText i18nKey='booking.motto' block />
          </p> */}

          {receipt ? (
            <div className='mt-14 max-w-lg'>
              <p className='font-["Dancing_Script",cursive] text-4xl text-[#D4145A]'>
                {t('booking.thanks', { name: receipt.customerName })}
              </p>
              <p className='mt-4 text-sm leading-7 text-[#3A2930]/80'>
                {t('booking.confirmation', {
                  branch: branchName(receipt.branch, language),
                  date: receipt.appointmentDate.split('-').reverse().join('/'),
                  time: receipt.appointmentTime,
                  phone: values.phone.trim()
                })}
              </p>
              <p className='mt-3 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold text-[#3A2930]'>
                <Icon name='confirmation_number' size={16} className='text-[#D4145A]' />
                {t('booking.code', { code: receipt.appointmentID })}
              </p>
            </div>
          ) : (
            <form className='mt-12' onSubmit={(event) => void onSubmit(event)} noValidate>
              <div className='grid items-stretch gap-y-10 lg:grid-cols-[1fr_auto_1fr] lg:gap-x-0 lg:gap-y-0'>
                <div className='flex flex-col gap-10 lg:pr-10'>
                  <UnderlineField
                    id='booking-name'
                    label={t('booking.fields.name')}
                    icon='person'
                    error={errorText('name')}
                  >
                    <input
                      id='booking-name'
                      name='name'
                      autoComplete='name'
                      placeholder={t('booking.fields.namePlaceholder')}
                      value={values.name}
                      aria-invalid={Boolean(errors.name)}
                      onChange={(event) => update('name', event.target.value)}
                      className={inputClass}
                    />
                  </UnderlineField>
                  <UnderlineField
                    id='booking-phone'
                    label={t('booking.fields.phone')}
                    icon='call'
                    error={errorText('phone')}
                  >
                    <input
                      id='booking-phone'
                      name='phone'
                      type='tel'
                      autoComplete='tel'
                      inputMode='tel'
                      placeholder={t('booking.fields.phonePlaceholder')}
                      value={values.phone}
                      aria-invalid={Boolean(errors.phone)}
                      onChange={(event) => update('phone', event.target.value)}
                      className={inputClass}
                    />
                  </UnderlineField>
                  <UnderlineField
                    id='booking-branch'
                    label={t('booking.fields.branch')}
                    icon='location_on'
                    error={errorText('branch') ?? (branchesError ? t('booking.errors.branchesLoad') : undefined)}
                    hint={selectedBranch ? (branchAddress(selectedBranch, language) ?? undefined) : undefined}
                  >
                    <Select
                      id='booking-branch'
                      name='branch'
                      variant='bare'
                      value={values.branch}
                      aria-invalid={Boolean(errors.branch)}
                      onChange={(value) => update('branch', value)}
                      placeholder={t('booking.fields.branchPlaceholder')}
                      options={branches.map((item) => ({ value: item.branchID, label: branchName(item, language) }))}
                    />
                  </UnderlineField>
                </div>

                <div className='hidden lg:flex lg:flex-col lg:items-center lg:px-2' aria-hidden>
                  <span className='w-px flex-1 bg-[#E83E78]/25' />
                  <Icon name='local_florist' size={16} className='my-3 text-[#E83E78]/70' />
                  <span className='w-px flex-1 bg-[#E83E78]/25' />
                </div>

                <div className='flex flex-col gap-10 lg:pl-10'>
                  <UnderlineField
                    id='booking-date'
                    label={t('booking.fields.date')}
                    icon='calendar_month'
                    error={errorText('date')}
                  >
                    <input
                      id='booking-date'
                      name='date'
                      type='date'
                      min={localDateIso()}
                      value={values.date}
                      aria-invalid={Boolean(errors.date)}
                      onChange={(event) => update('date', event.target.value)}
                      className={`${inputClass} ${values.date ? 'text-[#3A2930]' : 'text-[#8A6573]'}`}
                    />
                  </UnderlineField>
                  <UnderlineField
                    id='booking-time'
                    label={t('booking.fields.time')}
                    icon='schedule'
                    error={errorText('time')}
                    hint={
                      selectedBranch
                        ? t('booking.openHours', { open: selectedBranch.openTime, close: selectedBranch.closeTime })
                        : undefined
                    }
                  >
                    <Select
                      id='booking-time'
                      name='time'
                      variant='bare'
                      value={values.time}
                      disabled={!selectedBranch}
                      aria-invalid={Boolean(errors.time)}
                      onChange={(value) => update('time', value)}
                      placeholder={
                        selectedBranch
                          ? availableTimes.length > 0
                            ? t('booking.fields.timePlaceholder')
                            : t('booking.fields.timeNone')
                          : t('booking.fields.timeNeedBranch')
                      }
                      options={availableTimes.map((slot) => ({ value: slot, label: slot }))}
                    />
                  </UnderlineField>
                  <UnderlineField
                    id='booking-note'
                    label={t('booking.fields.note')}
                    icon='chat_bubble'
                    error={errorText('note')}
                  >
                    <input
                      id='booking-note'
                      name='note'
                      maxLength={1000}
                      placeholder={t('booking.fields.notePlaceholder')}
                      value={values.note}
                      onChange={(event) => update('note', event.target.value)}
                      className={inputClass}
                    />
                  </UnderlineField>
                </div>
              </div>

              <div className='mt-12 flex flex-col items-center'>
                <button
                  type='submit'
                  disabled={submitting}
                  className='inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#D4145A] px-8 py-3 text-[13px] font-semibold tracking-[0.14em] text-white uppercase transition duration-300 ease-out hover:-translate-y-px hover:bg-[#C90F50] disabled:cursor-wait disabled:opacity-70'
                >
                  <Icon name='calendar_month' size={18} className='text-white' />
                  {submitting ? t('booking.submitting') : <StableText i18nKey='booking.submit' />}
                  <span aria-hidden>→</span>
                </button>
                <p className='mt-4 flex items-center gap-2 text-xs text-[#8A6573]'>
                  <Icon name='call' size={14} className='text-[#D4145A]' />
                  {t('booking.contactNote')}
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

const inputClass =
  'w-full min-w-0 bg-transparent py-2 text-sm text-[#3A2930] outline-none placeholder:text-[#8A6573]/80'

function UnderlineField({
  id,
  label,
  icon,
  error,
  hint,
  children
}: {
  readonly id: string
  readonly label: string
  readonly icon: string
  readonly error?: string
  readonly hint?: string
  readonly children: ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className='block text-[13px] font-medium text-[#3A2930]'>
        {label}
      </label>
      <div className='mt-1 flex items-center gap-3 border-b border-[#F7D5DF] transition-colors duration-300 focus-within:border-[#D4145A]'>
        <Icon name={icon} size={18} className='shrink-0 text-[#D4145A]' />
        {children}
      </div>
      {error ? (
        <p className='mt-1.5 text-xs text-[#D4145A]'>{error}</p>
      ) : hint ? (
        <p className='mt-1.5 text-xs text-[#8A6573]'>{hint}</p>
      ) : null}
    </div>
  )
}
