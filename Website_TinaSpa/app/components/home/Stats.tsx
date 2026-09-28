import { stats } from '~/data/home'

export interface StatsProps {
  readonly className?: string
}

export function Stats({ className = '' }: StatsProps) {
  return (
    <section className={className}>
      <div className='mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 pb-16 sm:px-6 lg:grid-cols-4'>
        {stats.map((item) => (
          <div key={item.label} className='text-center'>
            <p className='text-4xl font-extrabold tracking-tight text-clinic sm:text-5xl'>{item.value}</p>
            <p className='mt-2 text-sm font-medium text-muted'>{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
