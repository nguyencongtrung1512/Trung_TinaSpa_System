import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Icon } from '~/components/ui/Icon'
import { popupBannerApi, type PopupBanner as PopupBannerData } from '~/lib/popup-banner'

/** Remembers the dismissed image for this browser tab session, so a new banner still shows. */
const DISMISSED_KEY = 'tinaspa:popup-banner-dismissed'

function readDismissed() {
  try {
    return sessionStorage.getItem(DISMISSED_KEY)
  } catch {
    return null
  }
}

function writeDismissed(image: string) {
  try {
    sessionStorage.setItem(DISMISSED_KEY, image)
  } catch {
    // Storage blocked: the popup may show again on the next page, which is acceptable.
  }
}

/** Popup image configured by admin (Cấu hình → Popup banner); shown once per visit, closes on any click outside. */
export function PopupBanner() {
  const { t } = useTranslation()
  const reduceMotion = useReducedMotion()
  const [banner, setBanner] = useState<PopupBannerData | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    popupBannerApi
      .getPublic()
      .then(({ banner: next }) => {
        if (cancelled || !next?.image || readDismissed() === next.image) return
        setBanner(next)
        setOpen(true)
      })
      .catch(() => {
        // The popup is optional; never block the page on it.
      })
    return () => {
      cancelled = true
    }
  }, [])

  const close = () => {
    if (banner?.image) writeDismissed(banner.image)
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const image = banner?.image ? (
    <img
      src={banner.image}
      alt={banner.imageAlt ?? t('common.promotion')}
      className='block max-h-[80dvh] w-auto max-w-full rounded-3xl object-contain shadow-2xl'
    />
  ) : null

  const link = banner?.link
  const content = !link ? (
    image
  ) : link.startsWith('/') ? (
    <Link to={link} onClick={close}>
      {image}
    </Link>
  ) : (
    <a href={link} target='_blank' rel='noreferrer' onClick={close}>
      {image}
    </a>
  )

  return (
    <AnimatePresence>
      {open && banner ? (
        <motion.div
          role='dialog'
          aria-modal='true'
          aria-label={banner.imageAlt ?? t('common.promotion')}
          className='fixed inset-0 z-[90] grid place-items-center p-4'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.25 }}
        >
          <button
            type='button'
            aria-label={t('common.close')}
            className='absolute inset-0 cursor-default bg-ink/60 backdrop-blur-[2px]'
            onClick={close}
          />
          <motion.div
            className='relative max-w-[min(92vw,720px)]'
            initial={reduceMotion ? false : { opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {content}
            <button
              type='button'
              aria-label={t('common.close')}
              onClick={close}
              className='absolute -top-3 -right-3 grid size-10 place-items-center rounded-full bg-white text-ink shadow-lg transition hover:text-clinic'
            >
              <Icon name='close' size={20} />
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
