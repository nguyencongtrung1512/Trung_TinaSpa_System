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
      className='mt-6 rounded-[28px] border border-rose-soft/60 bg-white p-5 shadow-[0_20px_50px_rgba(58,41,48,0.06)] sm:p-8'
      aria-labelledby='used-services-title'
    >
      <div className='flex flex-wrap items-end justify-between gap-2'>
        <div>
          <h2 id='used-services-title' className='font-["Cormorant_Garamond",serif] text-3xl font-semibold text-[#3A2930]'>
            {t('account.usedServices.title')}
          </h2>
          <p className='mt-1 text-sm text-[#3A2930]/75'>{t('account.usedServices.intro')}</p>
        </div>
        {result ? (
          <span className='text-xs font-semibold text-muted'>{t('account.usedServices.total', { count: result.total })}</span>
        ) : null}
      </div>

      <div className='mt-5' aria-live='polite'>
        {failed ? (
          <p role='alert' className='rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700'>
            {t('account.usedServices.error')}
          </p>
        ) : loading && !result ? (
          <p className='text-sm text-muted'>{t('account.usedServices.loading')}</p>
        ) : result && result.items.length === 0 ? (
          <div className='flex flex-col items-center gap-2 rounded-2xl bg-[#FFF8FA] px-6 py-8 text-center'>
            <Icon name='spa' size={30} className='text-clinic/60' />
            <p className='text-sm text-muted'>{t('account.usedServices.empty')}</p>
          </div>
        ) : (
          <ul className='divide-y divide-rose-soft/60'>
            {result?.items.map((record) => (
              <li key={record.customerServiceID} className='flex flex-wrap items-start gap-x-4 gap-y-1 py-4'>
                <div className='min-w-0 flex-1'>
                  <p className='text-base font-bold text-[#3A2930]'>{localizedName(record, i18n.language)}</p>
                  <p className='mt-0.5 text-xs text-muted'>
                    {dateFormatter.format(new Date(record.usedAt))}
                    {record.quantity > 1 ? ` · ${t('account.usedServices.quantity', { count: record.quantity })}` : ''}
                  </p>
                  {record.staffNote ? (
                    <p className='mt-2 rounded-2xl bg-[#FFF8FA] px-3 py-2 text-xs leading-5 text-[#3A2930]/80'>
                      <span className='font-bold'>{t('account.usedServices.staffNote')}: </span>
                      {record.staffNote}
                    </p>
                  ) : null}
                </div>
                <p className='shrink-0 text-sm font-bold text-clinic'>{formatPrice(record.price * record.quantity)}</p>
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
