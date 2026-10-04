import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Icon } from '~/components/ui/Icon'
import { portalCardClass } from '~/portal/styles'
import { approvalTaskTotal, approvalTasks, type ApprovalTask } from '~/portal/manager/manager-overview.data'

export function ApprovalQueue() {
  const [doneIds, setDoneIds] = useState<readonly string[]>([])
  const remaining = approvalTaskTotal - doneIds.length

  return (
    <section>
      <div className='mb-3 flex items-center justify-between gap-3'>
        <h2 className='text-lg font-extrabold text-ink sm:text-xl'>Cần phê duyệt & xử lý</h2>
        <motion.span
          key={remaining}
          initial={{ scale: 1.25 }}
          animate={{ scale: 1 }}
          className='rounded-full bg-clinic px-3 py-1 text-xs font-bold text-white'
        >
          {String(remaining).padStart(2, '0')} việc
        </motion.span>
      </div>

      <ul className='space-y-3'>
        {approvalTasks.map((task) => (
          <li key={task.id}>
            <TaskCard
              task={task}
              done={doneIds.includes(task.id)}
              onDone={() => setDoneIds((ids) => (ids.includes(task.id) ? ids : [...ids, task.id]))}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}

function TaskCard({
  task,
  done,
  onDone
}: {
  readonly task: ApprovalTask
  readonly done: boolean
  readonly onDone: () => void
}) {
  const reduceMotion = useReducedMotion()
  const article = task.tone === 'article'

  return (
    <article className={`${portalCardClass} p-5`}>
      <div className='flex items-center justify-between gap-3'>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
            article ? 'bg-mist text-clinic' : 'bg-emerald-50 text-emerald-700'
          }`}
        >
          <Icon name={task.kindIcon} size={14} />
          {task.kind}
        </span>
        <span className='text-xs text-muted'>{task.meta}</span>
      </div>
      {task.title ? <h3 className='mt-3 text-base leading-6 font-extrabold text-ink'>{task.title}</h3> : null}
      <p className='mt-2 text-sm leading-6 text-muted'>{task.body}</p>

      <AnimatePresence mode='wait' initial={false}>
        {done ? (
          <motion.p
            key='done'
            className='mt-4 flex items-center justify-center gap-1.5 rounded-full bg-emerald-50 py-2.5 text-sm font-bold text-emerald-700'
            initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Icon name='check_circle' size={18} />
            {task.doneLabel}
          </motion.p>
        ) : (
          <motion.button
            key='action'
            type='button'
            className={`mt-4 w-full rounded-full py-2.5 text-sm font-bold text-white transition ${
              article ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-clinic hover:bg-clinic-deep'
            }`}
            exit={reduceMotion ? undefined : { opacity: 0, scale: 0.96 }}
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            onClick={onDone}
          >
            {task.action}
          </motion.button>
        )}
      </AnimatePresence>
    </article>
  )
}
