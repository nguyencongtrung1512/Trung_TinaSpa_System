import { testimonials } from '~/data/home'
import { Icon } from '~/components/ui/Icon'

export interface TestimonialsProps {
  readonly className?: string
}

export function Testimonials({ className = '' }: TestimonialsProps) {
  return (
    <section className={`bg-canvas ${className}`}>
      <div className='mx-auto max-w-6xl px-4 pb-20 sm:px-6'>
        <div className='mx-auto mb-12 max-w-2xl text-center'>
          <p className='text-sm font-semibold tracking-wide text-clinic'>Khách hàng nói gì</p>
          <h2 className='mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl'>Cảm nhận thật sau liệu trình</h2>
        </div>

        <div className='grid gap-5 md:grid-cols-3'>
          {testimonials.map((item) => (
            <blockquote
              key={item.name}
              className='rounded-2xl bg-surface p-6 shadow-[0_10px_30px_var(--color-whisper-shadow)]'
            >
              <div className='mb-3 flex gap-0.5 text-clinic'>
                {Array.from({ length: 5 }, (_, index) => (
                  <Icon key={index} name='star' className='text-[18px]' filled />
                ))}
              </div>
              <p className='text-sm leading-6 text-muted'>{item.quote}</p>
              <footer className='mt-5'>
                <p className='text-sm font-extrabold text-ink'>{item.name}</p>
                <p className='text-xs text-muted'>{item.detail}</p>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  )
}
