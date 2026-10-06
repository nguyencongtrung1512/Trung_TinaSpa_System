import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useLocation } from 'react-router'
import { PortalSidebar } from '~/portal/layout/PortalSidebar'
import { PortalTopbar } from '~/portal/layout/PortalTopbar'
import type { PortalRole } from '~/portal/types'

export interface PortalShellProps {
  readonly role: PortalRole
  readonly children: ReactNode
}

export function PortalShell({ role, children }: PortalShellProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const reduceMotion = useReducedMotion()

  return (
    <div className='min-h-dvh bg-[#fff4f8] text-ink'>
      <PortalTopbar role={role} menuOpen={menuOpen} onMenuToggle={() => setMenuOpen((open) => !open)} />

      <div className='mx-auto flex max-w-[1500px] gap-4 px-4 py-4 sm:px-6'>
        <div className='hidden w-[248px] shrink-0 lg:block'>
          <div className='sticky top-24 flex h-[calc(100dvh-7rem)] flex-col'>
            <PortalSidebar role={role} />
          </div>
        </div>

        <AnimatePresence>
          {menuOpen ? (
            <motion.div key='portal-nav-layer' className='fixed inset-0 z-40 lg:hidden'>
              <motion.button
                type='button'
                aria-label='Đóng menu làm việc'
                className='absolute inset-0 bg-ink/30'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMenuOpen(false)}
              />
              <motion.div
                id='portal-nav'
                className='absolute inset-y-0 left-0 flex w-[min(100%,320px)] flex-col p-3'
                initial={{ x: reduceMotion ? 0 : -320 }}
                animate={{ x: 0 }}
                exit={{ x: reduceMotion ? 0 : -320 }}
                transition={{ duration: reduceMotion ? 0 : 0.28, ease: 'easeOut' }}
              >
                <PortalSidebar role={role} onNavigate={() => setMenuOpen(false)} />
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <main key={location.pathname} className='min-w-0 flex-1'>
          {children}
        </main>
      </div>
    </div>
  )
}
