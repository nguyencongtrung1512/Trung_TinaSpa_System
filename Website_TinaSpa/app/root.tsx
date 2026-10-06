import { useEffect } from 'react'
import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router'
import { MotionConfig } from 'framer-motion'
import { useTranslation } from 'react-i18next'

import type { Route } from './+types/root'
import { ToastProvider } from './components/ui/toast-view'
import { applyDetectedLanguage } from './i18n'
import './app.css'

export const links: Route.LinksFunction = () => [
  { rel: 'icon', href: '/favicon.ico' },
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous'
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap'
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0..1,0'
  }
]

export function Layout({ children }: { children: React.ReactNode }) {
  // Subscribing here re-renders <Meta /> so route titles follow the active language.
  const { i18n } = useTranslation()

  return (
    <html lang={i18n.resolvedLanguage ?? 'vi'}>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  useEffect(() => {
    void applyDetectedLanguage()
  }, [])

  return (
    <MotionConfig reducedMotion='user'>
      <ToastProvider>
        <Outlet />
      </ToastProvider>
    </MotionConfig>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const { t } = useTranslation()
  let message = t('error.title')
  let details = t('error.details')
  let stack: string | undefined

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : t('error.generic')
    details = error.status === 404 ? t('error.notFound') : error.statusText || details
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message
    stack = error.stack
  }

  return (
    <main className='container mx-auto p-4 pt-16'>
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className='w-full overflow-x-auto p-4'>
          <code>{stack}</code>
        </pre>
      )}
    </main>
  )
}
