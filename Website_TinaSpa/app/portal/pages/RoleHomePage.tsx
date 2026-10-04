import { Link } from 'react-router'
import { motion, useReducedMotion } from 'framer-motion'
import { Icon } from '~/components/ui/Icon'
import { useSession } from '~/lib/auth'
import { formatPortalDate } from '~/portal/format'
import { portalActors, portalNavigation, portalRoleLabel } from '~/portal/navigation'
import { portalCardClass } from '~/portal/styles'
import type { PortalRole } from '~/portal/types'

export interface RoleHomePageProps {
  readonly role: Exclude<PortalRole, 'staff'>
}

export function RoleHomePage({ role }: RoleHomePageProps) {
  const actor = portalActors[role]
  const reduceMotion = useReducedMotion()
  const name = useSession()?.user.fullName ?? actor.name
  const links = portalNavigation[role].flatMap((group) => group.items).filter((item) => item.to !== `/portal/${role}`)

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <p className='text-xs font-bold tracking-[0.18em] text-clinic'>{portalRoleLabel[role]}</p>
      <p className='mt-1 text-sm text-muted'>{formatPortalDate(new Date())}</p>
      <h1 className='mt-3 text-3xl font-extrabold text-ink'>Xin chào, {name}</h1>
      <p className='mt-2 max-w-2xl text-sm leading-6 text-muted'>
        Cổng này dùng chung thanh trên và menu với trang nhân viên. Màn hình chi tiết sẽ gắn vào từng mục bên trái.
      </p>
      <ul className='mt-6 grid gap-3 sm:grid-cols-2'>
        {links.map((item) => (
          <li key={item.to}>
            <Link
              to={item.to}
              className={`${portalCardClass} flex items-start gap-3 p-4 transition hover:-translate-y-0.5`}
            >
              <span className='grid size-10 shrink-0 place-items-center rounded-2xl bg-mist text-clinic'>
                <Icon name={item.icon} size={20} />
              </span>
              <span>
                <span className='block text-sm font-bold text-ink'>{item.label}</span>
                <span className='mt-1 block text-xs leading-5 text-muted'>{item.summary}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </motion.section>
  )
}
