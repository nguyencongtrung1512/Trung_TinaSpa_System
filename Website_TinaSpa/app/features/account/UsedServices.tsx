import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '~/components/ui/Icon'
import { fetchMyServices, type UsedServiceList, type UsedServiceRecord } from '~/lib/profile'
import { formatPrice } from '~/portal/manager/services/catalog.api'
import { outlineButtonClass } from '~/portal/manager/services/form-ui'

const PAGE_SIZE = 10

function localizedName(record: UsedServiceRecord, language: string) {
  if (language.startsWith('en') && record.nameEnglish) return record.nameEnglish
  return record.nameVietnamese
}

function localizedDescription(record: UsedServiceRecord, language: string) {
  if (language.startsWith('en') && record.descriptionEnglish) return record.descriptionEnglish
  return record.descriptionVietnamese
}

export function UsedServices() {
  const { t, i18n } = useTranslation()
  const [page, setPage] = useState(1)
  const [result, setResult] = useState<UsedServiceList>()
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchMyServices(page, PAGE_SIZE)
      .then((next) => {
        if (cancelled) return
        setResult(next)
        setFailed(false)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [page])

  const dateFormatter = new Intl.DateTimeFormat(i18n.language.startsWith('en') ? 'en-GB' : 'vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
  const totalPages = result ? Math.max(1, Math.ceil(result.total / result.pageSize)) : 1

  return (
    <section
      className='rounded-[28px] border border-rose-soft/60 bg-white p-5 shadow-[0_20px_50px_rgba(58,41,48,0.06)] sm:p-8'
      aria-labelledby='used-services-title'
    >
      <div className='flex items-start justify-between gap-4 border-b border-rose-soft/60 pb-5'>
        <div>
          <h2 id='used-services-title' className='font-serif text-2xl text-ink sm:text-3xl'>
            {t('account.usedServices.title')}
          </h2>
          <p className='mt-1.5 text-sm text-ink/65'>{t('account.usedServices.intro')}</p>
        </div>
        {result ? (
          <span className='shrink-0 rounded-full bg-mist px-3 py-1 text-xs font-bold whitespace-nowrap text-clinic'>
            {t('account.usedServices.total', { count: result.total })}
          </span>
        ) : null}
      </div>

      <div className='mt-2' aria-live='polite'>
        {failed ? (
          <p role='alert' className='mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700'>
            {t('account.usedServices.error')}
          </p>
        ) : loading && !result ? (
          <div className='animate-pulse space-y-3 py-3' aria-label={t('account.usedServices.loading')}>
            {[0, 1, 2].map((row) => (
              <div key={row} className='h-24 rounded-2xl bg-canvas' />
            ))}
          </div>
        ) : result && result.items.length === 0 ? (
          <div className='mt-4 flex flex-col items-center gap-2 rounded-2xl bg-[#FFF8FA] px-6 py-10 text-center'>
            <Icon name='spa' size={30} className='text-clinic/60' />
            <p className='text-sm text-muted'>{t('account.usedServices.empty')}</p>
          </div>
        ) : (
          <ul className={`divide-y divide-rose-soft/50 transition-opacity ${loading ? 'opacity-60' : ''}`}>
            {result?.items.map((record) => (
              <li
                key={record.customerServiceID}
                className='-mx-2 flex flex-col gap-3 rounded-2xl px-2 py-5 transition-colors hover:bg-[#FFF8FA] sm:-mx-3 sm:flex-row sm:items-start sm:justify-between sm:px-3'
              >
                <div className='min-w-0 flex-1'>
                  <p className='font-serif text-lg text-ink sm:text-xl'>{localizedName(record, i18n.language)}</p>
                  {localizedDescription(record, i18n.language) ? (
                    <p className='mt-1.5 max-w-2xl text-sm leading-6 whitespace-pre-line text-ink/70'>
                      {localizedDescription(record, i18n.language)}
                    </p>
                  ) : null}
                  {record.staffNote ? (
                    <p className='mt-3 flex max-w-2xl items-start gap-2 rounded-2xl bg-[#FFF8FA] px-3 py-2 text-xs leading-5 text-ink/80'>
                      <Icon name='sticky_note_2' size={16} className='mt-px shrink-0 text-clinic' />
                      <span>
                        <span className='font-bold'>{t('account.usedServices.staffNote')}: </span>
                        {record.staffNote}
                      </span>
                    </p>
                  ) : null}
                  <p className='mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted'>
                    <span className='inline-flex items-center gap-1'>
                      <Icon name='calendar_today' size={14} />
                      {dateFormatter.format(new Date(record.usedAt))}
                    </span>
                    {record.quantity > 1 ? (
                      <span>{t('account.usedServices.quantity', { count: record.quantity })}</span>
                    ) : null}
                  </p>
                </div>
                <p className='shrink-0 text-sm font-bold text-clinic tabular-nums'>
                  {formatPrice(record.price * record.quantity)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {result && result.total > result.pageSize ? (
        <div className='mt-4 flex items-center justify-between gap-3'>
          <button
            type='button'
            className={outlineButtonClass}
            disabled={page <= 1 || loading}
            onClick={() => setPage((current) => current - 1)}
          >
            {t('account.usedServices.prev')}
          </button>
          <span className='text-xs text-muted'>{t('account.usedServices.page', { page, pages: totalPages })}</span>
          <button
            type='button'
            className={outlineButtonClass}
            disabled={page >= totalPages || loading}
            onClick={() => setPage((current) => current + 1)}
          >
            {t('account.usedServices.next')}
          </button>
        </div>
      ) : null}
    </section>
  )
}
