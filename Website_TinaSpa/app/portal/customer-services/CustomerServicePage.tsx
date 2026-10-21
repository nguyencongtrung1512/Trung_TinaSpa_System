import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'
import { Icon } from '~/components/ui/Icon'
import { useToast } from '~/components/ui/toast-view'
import { formatPortalDate } from '~/portal/format'
import { formatPhone } from '~/portal/appointments/appointments.api'
import {
  ConfirmDialog,
  Field,
  FormError,
  inputClass,
  outlineButtonClass,
  primaryButtonClass
} from '~/portal/manager/services/form-ui'
import { formatPrice, type CatalogService } from '~/portal/manager/services/catalog.api'
import { portalRoleLabel } from '~/portal/navigation'
import { portalCardClass } from '~/portal/styles'
import type { PortalRole } from '~/portal/types'
import {
  PHONE_PATTERN,
  cleanPhone,
  customerServicesApi,
  type CustomerLookup,
  type CustomerServiceRecord
} from './customerServices.api'
import { Select } from '~/components/ui/Select'
import { CustomerPicker } from './CustomerPicker'

interface DraftLine {
  readonly key: number
  readonly serviceID: string
  readonly quantity: number
  readonly staffNote: string
}

function errorText(reason: unknown, fallback: string) {
  return reason instanceof Error ? reason.message : fallback
}

function todayISO() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

export function CustomerServicePage({ role }: { readonly role: PortalRole }) {
  const { t, i18n } = useTranslation()
  const dateTimeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.language.startsWith('en') ? 'en-GB' : 'vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
    [i18n.language]
  )
  const [searchParams, setSearchParams] = useSearchParams()
  const [phoneInput, setPhoneInput] = useState(searchParams.get('phone') ?? '')
  const [lookup, setLookup] = useState<CustomerLookup>()
  const [lookedUpPhone, setLookedUpPhone] = useState('')
  const [lookupBusy, setLookupBusy] = useState(false)
  const [error, setError] = useState<string>()
  const toast = useToast()

  const [fullName, setFullName] = useState('')
  const [createBusy, setCreateBusy] = useState(false)

  const [records, setRecords] = useState<CustomerServiceRecord[]>([])
  const [total, setTotal] = useState(0)
  const [recordsLoading, setRecordsLoading] = useState(false)

  const [catalog, setCatalog] = useState<CatalogService[]>([])
  const [lines, setLines] = useState<DraftLine[]>([{ key: 1, serviceID: '', quantity: 1, staffNote: '' }])
  const [usedDate, setUsedDate] = useState(todayISO())
  const [saveBusy, setSaveBusy] = useState(false)
  const [formError, setFormError] = useState<string>()

  const [removing, setRemoving] = useState<CustomerServiceRecord>()
  const [removeBusy, setRemoveBusy] = useState(false)
  const [removeError, setRemoveError] = useState<string>()

  const customer = lookup?.customer ?? null

  useEffect(() => {
    let cancelled = false
    customerServicesApi
      .listCatalog()
      .then((items) => {
        if (!cancelled) setCatalog(items)
      })
      .catch((reason: unknown) => {
        if (!cancelled) setError(errorText(reason, t('staffServices.errors.catalog')))
      })
    return () => {
      cancelled = true
    }
  }, [])

  const loadRecords = useCallback(async (userID: string) => {
    setRecordsLoading(true)
    try {
      const result = await customerServicesApi.list(userID)
      setRecords(result.items)
      setTotal(result.total)
    } catch (reason) {
      setError(errorText(reason, t('staffServices.errors.history')))
    } finally {
      setRecordsLoading(false)
    }
  }, [])

  const runLookup = useCallback(
    async (raw: string) => {
      const phone = cleanPhone(raw)
      if (!PHONE_PATTERN.test(phone)) {
        setError(t('staffServices.errors.phone'))
        return
      }
      setLookupBusy(true)
      setError(undefined)
      try {
        const result = await customerServicesApi.lookup(phone)
        setLookup(result)
        setLookedUpPhone(phone)
        setFullName(result.suggestedName ?? '')
        setRecords([])
        setTotal(0)
        if (result.customer) await loadRecords(result.customer.userID)
      } catch (reason) {
        setLookup(undefined)
        setError(errorText(reason, t('staffServices.errors.lookup')))
      } finally {
        setLookupBusy(false)
      }
    },
    [loadRecords]
  )

  // Opened from an appointment ("Ghi dịch vụ") with ?phone=...
  useEffect(() => {
    const phone = searchParams.get('phone')
    if (phone) void runLookup(phone)
    // Only on first mount; later lookups come from the form.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function submitLookup(event: FormEvent) {
    event.preventDefault()
    setSearchParams(phoneInput.trim() ? { phone: cleanPhone(phoneInput) } : {}, { replace: true })
    void runLookup(phoneInput)
  }

  async function createAccount(event: FormEvent) {
    event.preventDefault()
    if (fullName.trim().length < 2) {
      setError(t('staffServices.errors.fullName'))
      return
    }
    setCreateBusy(true)
    setError(undefined)
    try {
      await customerServicesApi.createCustomer({ phone: lookedUpPhone, fullName: fullName.trim() })
      toast.success(t('staffServices.created'))
      await runLookup(lookedUpPhone)
    } catch (reason) {
      setError(errorText(reason, t('staffServices.errors.create')))
    } finally {
      setCreateBusy(false)
    }
  }

  const priceOf = useMemo(() => new Map(catalog.map((service) => [service.serviceID, service.price])), [catalog])
  const grouped = useMemo(() => {
    const groups = new Map<string, CatalogService[]>()
    for (const service of catalog) {
      const label = service.category?.nameVietnamese ?? t('staffServices.otherCategory')
      groups.set(label, [...(groups.get(label) ?? []), service])
    }
    return [...groups.entries()]
  }, [catalog])

  function updateLine(key: number, patch: Partial<DraftLine>) {
    setLines((current) => current.map((line) => (line.key === key ? { ...line, ...patch } : line)))
    setFormError(undefined)
  }

  function addLine() {
    setLines((current) => [
      ...current,
      { key: (current.at(-1)?.key ?? 0) + 1, serviceID: '', quantity: 1, staffNote: '' }
    ])
  }

  function removeLine(key: number) {
    setLines((current) => (current.length > 1 ? current.filter((line) => line.key !== key) : current))
  }

  const draftTotal = lines.reduce((sum, line) => sum + (priceOf.get(line.serviceID) ?? 0) * line.quantity, 0)

  async function saveServices(event: FormEvent) {
    event.preventDefault()
    if (!customer) return
    if (lines.some((line) => !line.serviceID)) {
      setFormError(t('staffServices.errors.pickService'))
      return
    }
    if (usedDate > todayISO()) {
      setFormError(t('staffServices.errors.futureDate'))
      return
    }
    setSaveBusy(true)
    setFormError(undefined)
    try {
      const added = await customerServicesApi.add(customer.userID, {
        items: lines.map((line) => ({
          serviceID: line.serviceID,
          quantity: line.quantity,
          staffNote: line.staffNote.trim() || null
        })),
        usedAt: usedDate === todayISO() ? new Date().toISOString() : `${usedDate}T05:00:00.000Z`
      })
      setLines([{ key: 1, serviceID: '', quantity: 1, staffNote: '' }])
      toast.success(t('staffServices.saved', { count: added.length, name: customer.fullName }))
      await loadRecords(customer.userID)
    } catch (reason) {
      setFormError(errorText(reason, t('staffServices.errors.save')))
    } finally {
      setSaveBusy(false)
    }
  }

  async function confirmRemove() {
    if (!removing || !customer) return
    setRemoveBusy(true)
    setRemoveError(undefined)
    try {
      await customerServicesApi.remove(removing.customerServiceID)
      setRemoving(undefined)
      toast.success(t('staffServices.removed'))
      await loadRecords(customer.userID)
    } catch (reason) {
      setRemoveError(errorText(reason, t('staffServices.errors.remove')))
    } finally {
      setRemoveBusy(false)
    }
  }

  const closeRemove = useCallback(() => setRemoving(undefined), [])

  return (
    <div>
      <header>
        <div className='flex flex-wrap items-center gap-3 text-xs font-bold tracking-[0.16em] text-clinic'>
          <span>{portalRoleLabel[role]}</span>
          <span className='font-medium tracking-normal text-muted'>{formatPortalDate(new Date())}</span>
        </div>
        <h1 className='mt-2 text-3xl font-extrabold text-ink sm:text-4xl'>{t('staffServices.title')}</h1>
        <p className='mt-1 text-sm text-muted'>{t('staffServices.intro')}</p>
      </header>

      <form
        onSubmit={submitLookup}
        className={`${portalCardClass} mt-6 flex flex-col gap-3 p-4 sm:flex-row sm:items-end`}
      >
        <Field label={t('staffServices.phoneLabel')} required className='flex-1'>
          {(id) => (
            <CustomerPicker
              id={id}
              value={phoneInput}
              onChange={setPhoneInput}
              onPick={(customer) => {
                setSearchParams({ phone: customer.phone }, { replace: true })
                void runLookup(customer.phone)
              }}
              placeholder={t('staffServices.phonePlaceholder')}
            />
          )}
        </Field>
        <button type='submit' className={primaryButtonClass} disabled={lookupBusy}>
          <Icon name='search' size={18} />
          {lookupBusy ? t('staffServices.searching') : t('staffServices.search')}
        </button>
      </form>

      <div className='mt-4 space-y-3' aria-live='polite'>
        <FormError message={error} />
      </div>

      {lookup && !customer ? (
        <section className={`${portalCardClass} mt-4 p-5`} aria-label={t('staffServices.createAccount')}>
          <h2 className='text-lg font-extrabold text-ink'>
            {t('staffServices.noAccount', { phone: formatPhone(lookedUpPhone) })}
          </h2>
          <p className='mt-1 text-sm text-muted'>{t('staffServices.noAccountHint')}</p>
          {lookup.recentAppointments.length > 0 ? (
            <ul className='mt-3 space-y-1 text-xs text-ink/80'>
              {lookup.recentAppointments.map((appointment) => (
                <li key={appointment.appointmentID} className='flex items-center gap-1.5'>
                  <Icon name='event' size={14} className='text-clinic' />
                  {t('staffServices.appointmentLine', {
                    date: appointment.appointmentDate.split('-').reverse().join('/'),
                    time: appointment.appointmentTime,
                    name: appointment.customerName
                  })}
                </li>
              ))}
            </ul>
          ) : null}
          <form
            onSubmit={(event) => void createAccount(event)}
            className='mt-4 flex flex-col gap-3 sm:flex-row sm:items-end'
          >
            <Field label={t('staffServices.fullName')} required className='flex-1'>
              {(id) => (
                <input
                  id={id}
                  className={inputClass}
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  maxLength={100}
                  autoComplete='off'
                />
              )}
            </Field>
            <button type='submit' className={primaryButtonClass} disabled={createBusy}>
              <Icon name='person_add' size={18} />
              {createBusy ? t('staffServices.creating') : t('staffServices.createAccount')}
            </button>
          </form>
        </section>
      ) : null}

      {customer ? (
        <>
          <section
            className={`${portalCardClass} mt-4 flex flex-wrap items-center gap-4 p-5`}
            aria-label={customer.fullName}
          >
            <span className='grid size-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-rose-soft to-clinic/70 text-sm font-extrabold text-white'>
              {customer.fullName.trim().slice(0, 1).toUpperCase()}
            </span>
            <div className='min-w-0 flex-1'>
              <h2 className='text-lg font-extrabold text-ink'>{customer.fullName}</h2>
              <p className='text-sm text-muted'>
                {t('staffServices.customerMeta', { phone: formatPhone(customer.phone), id: customer.userID })}
              </p>
            </div>
            {customer.mustChangePassword ? (
              <span className='rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700'>
                {t('staffServices.defaultPassword')}
              </span>
            ) : null}
          </section>

          <form
            onSubmit={(event) => void saveServices(event)}
            noValidate
            className={`${portalCardClass} mt-4 p-5`}
            aria-label={t('staffServices.addTitle')}
          >
            <h2 className='text-lg font-extrabold text-ink'>{t('staffServices.addTitle')}</h2>
            <div className='mt-4'>
              <FormError message={formError} />
            </div>
            <div className='space-y-3'>
              {lines.map((line, index) => (
                <div key={line.key} className='grid gap-3 rounded-2xl bg-canvas p-3 sm:grid-cols-[1fr_6rem_auto]'>
                  <Field label={t('staffServices.serviceN', { n: index + 1 })} required>
                    {(id) => (
                      <Select
                        id={id}
                        value={line.serviceID}
                        onChange={(value) => updateLine(line.key, { serviceID: value })}
                        placeholder={t('staffServices.chooseService')}
                        options={grouped.flatMap(([label, services]) =>
                          services.map((service) => ({
                            value: service.serviceID,
                            label: `${service.nameVietnamese} — ${formatPrice(service.price)}`,
                            group: label
                          }))
                        )}
                      />
                    )}
                  </Field>
                  <Field label={t('staffServices.quantity')}>
                    {(id) => (
                      <input
                        id={id}
                        type='number'
                        min={1}
                        max={99}
                        className={inputClass}
                        value={line.quantity}
                        onChange={(event) =>
                          updateLine(line.key, { quantity: Math.min(99, Math.max(1, Number(event.target.value) || 1)) })
                        }
                      />
                    )}
                  </Field>
                  <div className='flex items-end'>
                    <button
                      type='button'
                      className={outlineButtonClass}
                      onClick={() => removeLine(line.key)}
                      disabled={lines.length === 1}
                      aria-label={t('staffServices.removeLine', { n: index + 1 })}
                    >
                      <Icon name='delete' size={18} />
                    </button>
                  </div>
                  <Field label={t('staffServices.noteLabel')} className='sm:col-span-3'>
                    {(id) => (
                      <input
                        id={id}
                        className={inputClass}
                        value={line.staffNote}
                        onChange={(event) => updateLine(line.key, { staffNote: event.target.value })}
                        maxLength={1000}
                        placeholder={t('staffServices.notePlaceholder')}
                      />
                    )}
                  </Field>
                </div>
              ))}
            </div>

            <div className='mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
              <div className='flex flex-wrap items-end gap-3'>
                <button type='button' className={outlineButtonClass} onClick={addLine} disabled={lines.length >= 20}>
                  <Icon name='add' size={18} />
                  {t('staffServices.addLine')}
                </button>
                <Field label={t('staffServices.usedDate')}>
                  {(id) => (
                    <input
                      id={id}
                      type='date'
                      className={inputClass}
                      value={usedDate}
                      max={todayISO()}
                      onChange={(event) => setUsedDate(event.target.value || todayISO())}
                    />
                  )}
                </Field>
              </div>
              <div className='flex items-center gap-4'>
                <p className='text-sm text-ink/80'>
                  {t('staffServices.estimate')} <strong className='text-ink'>{formatPrice(draftTotal)}</strong>
                </p>
                <button type='submit' className={primaryButtonClass} disabled={saveBusy}>
                  <Icon name='save' size={18} />
                  {saveBusy ? t('staffServices.saving') : t('staffServices.save')}
                </button>
              </div>
            </div>
          </form>

          <section className={`${portalCardClass} mt-4 p-5`} aria-label={t('staffServices.historyTitle')}>
            <h2 className='text-lg font-extrabold text-ink'>
              {t('staffServices.historyTitle')} <span className='text-sm font-semibold text-muted'>({total})</span>
            </h2>
            {recordsLoading ? (
              <p className='mt-3 text-sm text-muted'>{t('staffServices.loading')}</p>
            ) : records.length === 0 ? (
              <p className='mt-3 text-sm text-muted'>{t('staffServices.historyEmpty')}</p>
            ) : (
              <ul className='mt-3 divide-y divide-rose-soft/60'>
                {records.map((record) => (
                  <li key={record.customerServiceID} className='flex flex-wrap items-start gap-3 py-3'>
                    <div className='min-w-0 flex-1'>
                      <p className='text-sm font-bold text-ink'>
                        {record.nameVietnamese}
                        {record.quantity > 1 ? <span className='text-muted'> × {record.quantity}</span> : null}
                      </p>
                      <p className='text-xs text-muted'>
                        {dateTimeFormatter.format(new Date(record.usedAt))} ·{' '}
                        {formatPrice(record.price * record.quantity)}
                      </p>
                      {record.staffNote ? <p className='mt-1 text-xs text-ink/70'>{record.staffNote}</p> : null}
                    </div>
                    <button
                      type='button'
                      className='inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-semibold text-muted transition hover:text-clinic'
                      onClick={() => {
                        setRemoveError(undefined)
                        setRemoving(record)
                      }}
                    >
                      <Icon name='delete' size={15} />
                      {t('staffServices.remove')}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      ) : null}

      <ConfirmDialog
        open={removing !== undefined}
        title={t('staffServices.removeTitle')}
        message={t('staffServices.removeMessage', { name: removing?.nameVietnamese ?? '' })}
        confirmLabel={t('staffServices.remove')}
        busy={removeBusy}
        error={removeError}
        onConfirm={() => void confirmRemove()}
        onClose={closeRemove}
      />
    </div>
  )
}
