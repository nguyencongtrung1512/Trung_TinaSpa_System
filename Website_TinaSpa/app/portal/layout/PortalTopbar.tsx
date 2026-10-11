import { Link } from 'react-router'
import { Icon } from '~/components/ui/Icon'
import { useToast } from '~/components/ui/toast-view'
import { useBranches } from '~/portal/appointments/useAppointments'
import { portalActions, portalActors } from '~/portal/navigation'
import type { PortalRole } from '~/portal/types'

export interface PortalTopbarProps {
  readonly role: PortalRole
  readonly menuOpen: boolean
  readonly onMenuToggle: () => void
}

export function PortalTopbar({ role, menuOpen, onMenuToggle }: PortalTopbarProps) {
  const actor = portalActors[role]
  const branches = useBranches()
  const toast = useToast()

  return (
    <header className='sticky top-0 z-30 border-b border-rose-soft/50 bg-white/95 backdrop-blur'>
      <div className='mx-auto flex max-w-[1500px] items-center gap-3 px-4 py-3 sm:px-6'>
        <button
          type='button'
          className='inline-flex size-11 items-center justify-center rounded-full text-ink lg:hidden'
          aria-expanded={menuOpen}
          aria-controls='portal-nav'
          aria-label={menuOpen ? 'Đóng menu làm việc' : 'Mở menu làm việc'}
          onClick={onMenuToggle}
        >
          <Icon name={menuOpen ? 'close' : 'menu'} size={24} />
        </button>

        <Link to='/' className='shrink-0 leading-none' aria-label='Dr Tina Beauty'>
          <span className='block text-[13px] font-extrabold tracking-[0.16em] text-clinic sm:text-sm'>
            DR TINA BEAUTY
          </span>
          <span className='mt-1 hidden text-[9px] font-semibold tracking-[0.18em] text-muted sm:block'>
            BESPOKE RITUAL & CLINICAL AESTHETICS
          </span>
        </Link>

        <p className='ml-2 hidden items-center gap-2 rounded-full border border-rose-soft/80 bg-canvas px-4 py-2 text-sm font-medium text-ink xl:inline-flex'>
          <Icon name='location_on' size={18} className='text-clinic' />
          {branches.length > 0 ? `${branches.length} khu vực nhận lịch` : actor.branch}
        </p>

        <div className='ml-auto flex items-center gap-2'>
          <div className='hidden items-center gap-2 md:flex'>
            {portalActions[role].map((action) => {
              const className =
                action.tone === 'solid'
                  ? 'inline-flex shrink-0 items-center gap-1.5 rounded-full bg-clinic px-4 py-2.5 text-xs font-bold tracking-wide whitespace-nowrap text-white uppercase shadow-[0_10px_24px_rgba(225,29,116,0.25)] transition hover:bg-clinic-deep'
                  : 'inline-flex shrink-0 items-center gap-1.5 rounded-full border border-rose-soft bg-white px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-ink transition hover:border-clinic hover:text-clinic'
              const content = (
                <>
                  <Icon name={action.icon} size={18} />
                  {action.label}
                </>
              )
              return action.to ? (
                <Link key={action.label} to={action.to} className={className}>
                  {content}
                </Link>
              ) : (
                <button
                  key={action.label}
                  type='button'
                  className={className}
                  onClick={() => toast.info(`${action.label} đang được phát triển`, 'Tính năng này sẽ sớm ra mắt.')}
                >
                  {content}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </header>
  )
}
