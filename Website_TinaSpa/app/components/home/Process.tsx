import { processSteps } from '~/data/home'
import { Icon } from '~/components/ui/Icon'

export interface ProcessProps {
  readonly className?: string
}

export function Process({ className = '' }: ProcessProps) {
  return (
    <section className={`bg-mist ${className}`}>
      <div className='mx-auto max-w-6xl px-4 py-20 sm:px-6'>
        <div className='mx-auto mb-14 max-w-2xl text-center'>
          <p className='text-sm font-semibold tracking-wide text-clinic'>Quy trình làm việc</p>
          <h2 className='mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl'>4 bước đồng hành</h2>
        </div>

        <ol className='relative grid gap-10 md:grid-cols-4'>
          <div className='pointer-events-none absolute top-7 right-8 left-8 hidden border-t border-dashed border-clinic/40 md:block' />
          {processSteps.map((item) => (
            <li key={item.step} className='relative text-center'>
              <div className='relative z-10 mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-surface text-clinic shadow-[0_8px_20px_var(--color-whisper-shadow)]'>
                <Icon name={item.icon} className='text-[26px]' />
              </div>
              <p className='text-xs font-bold tracking-[0.2em] text-clinic'>{item.step}</p>
              <h3 className='mt-2 text-base font-extrabold text-ink'>{item.title}</h3>
              <p className='mt-2 text-sm leading-6 text-muted'>{item.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
