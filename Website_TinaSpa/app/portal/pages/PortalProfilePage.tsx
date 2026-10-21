import { useCallback, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ChangePasswordDialog } from '~/features/account/ChangePasswordDialog'
import { ProfileForm } from '~/features/account/ProfileForm'
import { useSession } from '~/lib/auth'
import { formatPortalDate } from '~/portal/format'
import { portalRoleLabel } from '~/portal/navigation'
import { portalCardClass } from '~/portal/styles'
import type { PortalRole } from '~/portal/types'

export function PortalProfilePage({ role }: { readonly role: PortalRole }) {
  const reduceMotion = useReducedMotion()
  const session = useSession()
  const [passwordOpen, setPasswordOpen] = useState(false)
  const closePassword = useCallback(() => setPasswordOpen(false), [])
  if (!session) return null

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className='max-w-3xl'
    >
      <header>
        <div className='flex flex-wrap items-center gap-3 text-xs font-bold tracking-[0.16em] text-clinic'>
          <span>{portalRoleLabel[role]}</span>
          <span className='font-medium tracking-normal text-muted'>{formatPortalDate(new Date())}</span>
        </div>
        <h1 className='mt-2 text-3xl font-extrabold text-ink sm:text-4xl'>Hồ sơ của tôi</h1>
        <p className='mt-1 text-sm text-muted'>Thông tin cá nhân hiển thị với đồng nghiệp và khách hàng.</p>
      </header>
      <section className={`${portalCardClass} mt-6 p-5 sm:p-8`}>
        <ProfileForm initialUser={session.user} onChangePassword={() => setPasswordOpen(true)} />
      </section>
      <ChangePasswordDialog
        open={passwordOpen}
        highlight={session.user.mustChangePassword === true}
        onClose={closePassword}
      />
    </motion.div>
  )
}
