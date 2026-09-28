import { team } from '~/data/home'

export interface TeamProps {
  readonly className?: string
}

export function Team({ className = '' }: TeamProps) {
  return (
    <section id='doi-ngu' className={`bg-canvas ${className}`}>
      <div className='mx-auto max-w-6xl px-4 py-20 sm:px-6'>
        <div className='mx-auto mb-12 max-w-2xl text-center'>
          <p className='text-sm font-semibold tracking-wide text-clinic'>Đội ngũ chuyên môn</p>
          <h2 className='mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl'>Người đồng hành cùng bạn</h2>
        </div>

        <div className='grid gap-6 md:grid-cols-3'>
          {team.map((member) => (
            <article
              key={member.name}
              className='overflow-hidden rounded-2xl bg-surface shadow-[0_10px_30px_var(--color-whisper-shadow)]'
            >
              <div className='aspect-[4/5] overflow-hidden bg-mist'>
                <img src={member.image} alt={member.imageAlt} className='h-full w-full object-cover' />
              </div>
              <div className='px-5 py-5 text-center'>
                <h3 className='text-lg font-extrabold text-ink'>{member.name}</h3>
                <p className='mt-1 text-sm text-clinic'>{member.role}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
