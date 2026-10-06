import { NavLink } from 'react-router'
import { Icon } from '~/components/ui/Icon'
import { PortalUserCard } from '~/portal/layout/PortalUserCard'
import { portalNavigation } from '~/portal/navigation'
import type { PortalRole } from '~/portal/types'

export interface PortalSidebarProps {
  readonly role: PortalRole
  readonly onNavigate?: () => void
  readonly className?: string
}

export function PortalSidebar({ role, onNavigate, className }: PortalSidebarProps) {
  return (
    <div
      className={`flex h-full min-h-0 flex-col gap-4 rounded-[28px] bg-white p-4 shadow-[0_16px_40px_rgba(190,24,96,0.05)] ${
        className ?? ''
      }`}
    >
      <nav aria-label='Mục làm việc' className='-mx-1 flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-1'>
        {portalNavigation[role].map((group) => (
          <section key={group.label}>
            <h2 className='px-3 pb-2 text-[11px] font-bold tracking-[0.16em] text-muted uppercase'>{group.label}</h2>
            <ul className='space-y-1'>
              {group.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition ${
                        isActive ? 'bg-mist text-clinic' : 'text-ink/80 hover:bg-mist/70'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon name={item.icon} size={20} className={isActive ? 'text-clinic' : 'text-muted'} />
                        <span className='min-w-0 flex-1 truncate'>{item.label}</span>
                        {typeof item.badge === 'number' ? (
                          <span className='grid h-5 min-w-5 place-items-center rounded-full bg-clinic px-1.5 text-[11px] font-bold text-white'>
                            {item.badge}
                          </span>
                        ) : null}
                        {typeof item.badge === 'string' && item.badge !== 'dot' ? (
                          <span className='rounded-full bg-mist px-2 py-0.5 text-[11px] font-bold whitespace-nowrap text-clinic'>
                            {item.badge}
                          </span>
                        ) : null}
                        {item.badge === 'dot' || (isActive && item.badge === undefined) ? (
                          <span className='size-1.5 rounded-full bg-clinic' aria-hidden />
                        ) : null}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </nav>
      <PortalUserCard role={role} />
    </div>
  )
}
