import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Icon } from '~/components/ui/Icon'
import { clearSession, useSession } from '~/lib/auth'
import { portalActors } from '~/portal/navigation'
import type { PortalRole } from '~/portal/types'

export interface PortalUserCardProps {
  readonly role: PortalRole
  readonly className?: string
}

export function PortalUserCard({ role, className }: PortalUserCardProps) {
  const actor = portalActors[role]
  const session = useSession()
  const navigate = useNavigate()
  const [avatarBroken, setAvatarBroken] = useState(false)
  const name = session?.user.fullName ?? actor.name
  const avatar = session?.user.avatar
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((word) => word[0]?.toUpperCase())
    .join('')

  function logout() {
    clearSession()
    navigate('/login', { replace: true })
  }

  return (
    <div
      className={`mt-auto shrink-0 flex items-center gap-3 border-t border-rose-soft/60 px-1 pt-4 ${className ?? ''}`}
    >
      <Link
        to={`/portal/${role}/profile`}
        title='Hồ sơ của tôi'
        className='-m-1.5 flex min-w-0 flex-1 items-center gap-3 rounded-2xl p-1.5 transition hover:bg-mist'
      >
        <span className='grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-[#f7b7cf] to-clinic text-sm font-bold text-white'>
          {avatar && !avatarBroken ? (
            <img src={avatar} alt='' className='size-full object-cover' onError={() => setAvatarBroken(true)} />
          ) : (
            initials || actor.initials
          )}
        </span>
        <span className='min-w-0 flex-1 leading-tight'>
          <span className='block truncate text-sm font-bold text-ink'>{name}</span>
          <span className='block truncate text-xs text-muted'>{actor.title}</span>
        </span>
      </Link>
      <button
        type='button'
        className='inline-flex size-9 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-mist hover:text-clinic'
        aria-label='Đăng xuất'
        title='Đăng xuất'
        onClick={logout}
      >
        <Icon name='logout' size={20} />
      </button>
    </div>
  )
}
