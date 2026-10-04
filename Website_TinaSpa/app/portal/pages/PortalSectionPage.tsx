import { motion, useReducedMotion } from 'framer-motion'
import { Icon } from '~/components/ui/Icon'
import type { PortalNavItem } from '~/portal/types'
import { portalCardClass } from '~/portal/styles'

export interface PortalSectionPageProps {
  readonly item: PortalNavItem
}

export function PortalSectionPage({ item }: PortalSectionPageProps) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.section
      className={`${portalCardClass} px-6 py-10 sm:px-10`}
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <span className='grid size-12 place-items-center rounded-2xl bg-mist text-clinic'>
        <Icon name={item.icon} size={24} />
      </span>
      <p className='mt-5 text-xs font-bold tracking-[0.16em] text-clinic uppercase'>Cùng khung cổng làm việc</p>
      <h1 className='mt-2 text-3xl font-extrabold text-ink'>{item.label}</h1>
      <p className='mt-3 max-w-2xl text-sm leading-6 text-muted'>{item.summary}</p>
    </motion.section>
  )
}
