import { services } from '~/data/home'
import { Icon } from '~/components/ui/Icon'

export interface ServicesProps {
  readonly className?: string
}

export function Services({ className = '' }: ServicesProps) {
  return (
    <section id='dich-vu' className={`bg-canvas ${className}`}>
      <div className='mx-auto max-w-6xl px-4 py-20 sm:px-6'>
        <div className='mx-auto mb-12 max-w-2xl text-center'>
          <p className='text-sm font-semibold tracking-wide text-clinic'>Dịch vụ của chúng tôi</p>
          <h2 className='mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl'>Chăm sóc toàn diện</h2>
          <p className='mt-3 text-sm leading-6 text-muted'>
            Các liệu trình thẩm mỹ y khoa được sắp xếp rõ ràng, dễ chọn theo nhu cầu da và cơ thể.
          </p>
        </div>

        <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
          {services.map((item) => (
            <article
              key={item.title}
              className='rounded-2xl bg-surface p-6 shadow-[0_10px_30px_var(--color-whisper-shadow)] transition duration-300 hover:-translate-y-1'
            >
              <div className='mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-mist text-clinic'>
                <Icon name={item.icon} className='text-[26px]' />
              </div>
              <h3 className='text-lg font-extrabold text-ink'>{item.title}</h3>
              <p className='mt-2 text-sm leading-6 text-muted'>{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
