import { Link } from 'react-router'
import { resultCases } from '~/data/home'
import { BeforeAfterSlider } from '~/components/home/BeforeAfterSlider'

export interface ResultsProps {
  readonly className?: string
}

export function Results({ className = '' }: ResultsProps) {
  return (
    <section id='minh-chung' className={`bg-canvas ${className}`}>
      <div className='mx-auto max-w-6xl px-4 py-20 sm:px-6'>
        <div className='mx-auto mb-12 max-w-2xl text-center'>
          <p className='text-sm font-bold tracking-[0.22em] text-clinic'>MINH CHỨNG HIỆU QUẢ</p>
          <h2 className='mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl'>Kết quả thực tế</h2>
          <p className='mt-3 text-sm leading-6 text-muted'>
            Hành trình thay đổi của khách hàng được đo lường bằng chỉ số lâm sàng minh bạch.
          </p>
        </div>

        <div className='grid gap-5 lg:grid-cols-3'>
          {resultCases.map((item) => (
            <article
              key={item.id}
              className='flex flex-col rounded-[1.75rem] border border-rose-soft/80 bg-surface p-4 shadow-[0_10px_30px_var(--color-whisper-shadow)]'
            >
              <BeforeAfterSlider
                beforeSrc={item.beforeSrc}
                afterSrc={item.afterSrc}
                beforeAlt={item.beforeAlt}
                afterAlt={item.afterAlt}
                result={item.result}
                note={item.note}
              />

              <div className='flex flex-1 flex-col px-2 pt-5 pb-2'>
                <p className='text-xs font-bold tracking-[0.16em] text-clinic uppercase'>{item.label}</p>
                <h3 className='mt-2 text-xl font-extrabold text-ink'>{item.title}</h3>

                <dl className='mt-5 grid grid-cols-2 gap-4 border-t border-rose-soft/70 pt-4'>
                  <div>
                    <dt className='text-[11px] font-semibold tracking-wide text-muted uppercase'>Số buổi</dt>
                    <dd className='mt-1 text-lg font-extrabold text-ink'>{item.sessions}</dd>
                  </div>
                  <div>
                    <dt className='text-[11px] font-semibold tracking-wide text-muted uppercase'>Thời gian</dt>
                    <dd className='mt-1 text-lg font-extrabold text-ink'>{item.duration}</dd>
                  </div>
                </dl>

                <Link
                  to='/#dat-lich'
                  className='mt-5 inline-flex min-h-11 items-center justify-center rounded-full border border-clinic/40 px-5 py-2.5 text-sm font-bold tracking-wide text-ink transition hover:border-clinic hover:text-clinic'
                >
                  XEM HÀNH TRÌNH
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
