import { Link } from 'react-router'
import { motion, useReducedMotion } from 'framer-motion'
import { Icon } from '~/components/ui/Icon'
import { portalCardClass } from '~/portal/styles'
import { deskProposals } from '~/portal/staff/staff-desk.data'

export function ProposalBoard() {
  const reduceMotion = useReducedMotion()

  return (
    <section className='mt-6'>
      <div className='mb-3 flex flex-wrap items-center justify-between gap-3'>
        <h2 className='flex items-center gap-2 text-base font-extrabold text-ink sm:text-lg'>
          <Icon name='lightbulb' size={20} className='text-clinic' />
          Đề xuất nội dung & cải tiến phác đồ
          <span className='rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700'>
            Chờ Quản lý duyệt
          </span>
        </h2>
        <Link to='/portal/staff/articles' className='inline-flex items-center gap-1 text-sm font-bold text-clinic'>
          <Icon name='add' size={18} />
          Tạo đề xuất mới
        </Link>
      </div>
      <div className='grid gap-3 lg:grid-cols-2'>
        {deskProposals.map((proposal, index) => (
          <motion.article
            key={proposal.id}
            className={`${portalCardClass} p-5`}
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: reduceMotion ? 0 : 0.15 + index * 0.06, ease: 'easeOut' }}
          >
            <div className='flex flex-wrap items-center gap-2 text-[11px] font-bold tracking-wide text-muted uppercase'>
              <span className='inline-flex items-center gap-1 rounded-full bg-mist px-2.5 py-1 text-clinic'>
                <Icon name={proposal.icon} size={14} />
                {proposal.kind}
              </span>
              <span>{proposal.sent}</span>
            </div>
            <h3 className='mt-3 text-base font-extrabold text-ink'>{proposal.title}</h3>
            <p className='mt-2 text-sm leading-6 text-muted'>{proposal.body}</p>
            <div className='mt-4 flex flex-wrap items-center justify-between gap-3'>
              <span
                className={`text-xs font-semibold ${proposal.statusTone === 'done' ? 'text-emerald-600' : 'text-amber-600'}`}
              >
                {proposal.statusTone === 'done' ? '✓ ' : ''}
                {proposal.status}
              </span>
              <Link to='/portal/staff/articles' className='text-sm font-bold text-clinic'>
                {proposal.action}
              </Link>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  )
}
