import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useSession } from '~/lib/auth'
import { AppointmentBoard } from '~/portal/staff/AppointmentBoard'
import { ConsultPanel } from '~/portal/staff/ConsultPanel'
import { ProposalBoard } from '~/portal/staff/ProposalBoard'
import { formatPortalDate } from '~/portal/format'
import { portalRoleLabel } from '~/portal/navigation'
import { portalCardClass } from '~/portal/styles'
import { deskAppointments, deskGreeting, deskStats } from '~/portal/staff/staff-desk.data'

export function StaffDeskPage() {
  const [selectedId, setSelectedId] = useState(deskAppointments[0].id)
  const selected = deskAppointments.find((item) => item.id === selectedId) ?? deskAppointments[0]
  const reduceMotion = useReducedMotion()
  const name = useSession()?.user.fullName ?? deskGreeting.name

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <header className='flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between'>
        <div className='max-w-xl'>
          <div className='flex flex-wrap items-center gap-3 text-xs font-bold tracking-[0.16em] text-clinic'>
            <span>{portalRoleLabel.staff}</span>
            <span className='font-medium tracking-normal text-muted'>{formatPortalDate(new Date())}</span>
          </div>
          <h1 className='mt-2 text-3xl font-extrabold text-ink sm:text-4xl'>Xin chào, {name}</h1>
          <p className='mt-2 text-sm leading-6 text-muted italic'>&ldquo;{deskGreeting.quote}&rdquo;</p>
        </div>
        <ul className='grid grid-cols-2 gap-3 sm:grid-cols-4 xl:w-[460px]'>
          {deskStats.map((stat) => (
            <li key={stat.label} className={`${portalCardClass} px-3 py-3`}>
              <p className='text-[11px] font-semibold text-muted'>{stat.label}</p>
              <p className={`mt-1 text-2xl font-extrabold ${stat.tone}`}>
                {stat.value} <span className='text-xs font-semibold'>{stat.unit}</span>
              </p>
            </li>
          ))}
        </ul>
      </header>

      <div className='mt-5 grid items-start gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.78fr)]'>
        <AppointmentBoard selectedId={selected.id} onSelect={setSelectedId} />
        <div className='xl:sticky xl:top-24'>
          <ConsultPanel key={selected.id} appointment={selected} />
        </div>
      </div>

      <ProposalBoard />
    </motion.div>
  )
}
