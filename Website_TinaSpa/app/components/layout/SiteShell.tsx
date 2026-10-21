import type { ReactNode } from 'react'
import { Footer } from '~/components/layout/Footer'
import { Header } from '~/components/layout/Header'
import { PopupBanner } from '~/components/layout/PopupBanner'

export interface SiteShellProps {
  readonly children: ReactNode
}

export function SiteShell({ children }: SiteShellProps) {
  return (
    <div className='min-h-dvh bg-canvas text-ink'>
      <Header />
      <main>{children}</main>
      <Footer />
      <PopupBanner />
    </div>
  )
}
