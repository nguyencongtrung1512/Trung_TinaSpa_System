import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router'
import { Icon } from '~/components/ui/Icon'
import { portalCardClass } from '~/portal/styles'
import {
  todaySessionTotal,
  treatmentSessions,
  type SessionStage,
  type TreatmentSession
} from '~/portal/manager/manager-overview.data'

const primaryClass: Record<SessionStage, string> = {
  'in-progress': 'border border-rose-soft bg-white text-ink hover:border-clinic hover:text-clinic',
  'room-ready': 'bg-clinic text-white hover:bg-clinic-deep',
  arriving: 'border border-rose-soft bg-white text-ink hover:border-clinic hover:text-clinic',
  unassigned: 'bg-clinic text-white hover:bg-clinic-deep'
}

export function TreatmentSchedule() {
  const reduceMotion = useReducedMotion()

  return (
    <section>
      <div className='mb-3 flex flex-wrap items-end justify-between gap-3'>
        <div>
          <h2 className='text-lg font-extrabold text-ink sm:text-xl'>Lịch trình & phòng trị liệu hôm nay</h2>
          <p className='mt-1 text-sm text-muted'>Theo dõi tiến trình phục vụ theo từng mốc giờ và phòng trị liệu.</p>
        </div>
        <span className='rounded-full bg-white px-3 py-1.5 text-xs font-bold text-muted shadow-sm'>
          {todaySessionTotal} lịch đặt trong ngày
        </span>
      </div>

      <ul className='space-y-3'>
        {treatmentSessions.map((session, index) => (
          <motion.li
            key={session.id}
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: reduceMotion ? 0 : index * 0.05, ease: 'easeOut' }}
          >
            <SessionCard session={session} />
          </motion.li>
        ))}
      </ul>

      <Link
        to='/portal/manager/lich-hen'
        className='mt-3 inline-flex items-center gap-1 px-1 text-sm font-semibold text-clinic'
      >
        Xem toàn bộ {todaySessionTotal} lịch hôm nay
        <Icon name='arrow_forward' size={16} />
      </Link>
    </section>
  )
}

function SessionCard({ session }: { readonly session: TreatmentSession }) {
  const unassigned = session.specialist === null

  return (
    <article
      className={`${portalCardClass} flex flex-wrap items-start justify-between gap-4 p-5 transition hover:-translate-y-0.5 ${
        unassigned ? 'ring-1 ring-orange-200' : ''
      }`}
    >
      <div className='min-w-0 flex-1'>
        <div className='flex flex-wrap items-center gap-3'>
          <span className='rounded-full bg-canvas px-3 py-1 text-sm font-extrabold text-ink'>{session.time}</span>
          <h3 className='text-base font-extrabold text-ink'>{session.customer}</h3>
        </div>
        <p className='mt-2 text-sm leading-6 text-ink/80'>{session.plan}</p>
        <p
          className={`mt-2 inline-flex items-center gap-1.5 text-xs font-semibold ${
            unassigned ? 'text-orange-600' : 'text-muted'
          }`}
        >
          <Icon name={unassigned ? 'warning' : 'medical_services'} size={16} />
          Chuyên viên: <span className={unassigned ? '' : 'text-ink'}>{session.specialist ?? 'Chưa gán'}</span>
        </p>
      </div>

      <div className='flex flex-col items-end gap-2'>
        <button
          type='button'
          className={`rounded-full px-4 py-2 text-xs font-bold whitespace-nowrap transition ${primaryClass[session.stage]}`}
        >
          {session.primaryAction}
        </button>
        {session.secondaryAction ? (
          <button type='button' className='text-xs font-semibold text-muted transition hover:text-clinic'>
            {session.secondaryAction}
          </button>
        ) : null}
      </div>
    </article>
  )
}
