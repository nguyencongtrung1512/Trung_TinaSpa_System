import { Link } from 'react-router'

export interface CtaBannerProps {
  readonly className?: string
}

export function CtaBanner({ className = '' }: CtaBannerProps) {
  return (
    <section id='dat-lich' className={`bg-mist ${className}`}>
      <div className='mx-auto max-w-3xl px-4 py-20 text-center sm:px-6'>
        <h2 className='text-3xl font-extrabold tracking-tight text-ink sm:text-4xl'>Đặt lịch hẹn chữa lành</h2>
        <p className='mx-auto mt-4 max-w-xl text-sm leading-6 text-muted'>
          Đến Tina Spa để xả stress và làm mới mình. Vẻ đẹp bắt đầu từ những điều nhỏ nhất và lan tỏa đến cả tâm hồn.
        </p>
        <Link
          to='/#lien-he'
          className='mt-8 inline-flex min-h-11 items-center justify-center rounded-full bg-clinic px-7 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_var(--color-whisper-shadow)] transition hover:bg-clinic-deep'
        >
          Đặt lịch trải nghiệm
        </Link>
      </div>
    </section>
  )
}
