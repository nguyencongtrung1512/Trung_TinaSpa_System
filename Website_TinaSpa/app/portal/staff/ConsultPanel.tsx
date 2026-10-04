import { useState, type FormEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Icon } from '~/components/ui/Icon'
import { portalCardClass } from '~/portal/styles'
import type { DeskAppointment } from '~/portal/staff/staff-desk.data'

export interface ConsultPanelProps {
  readonly appointment: DeskAppointment
}

export function ConsultPanel({ appointment }: ConsultPanelProps) {
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)
  const reduceMotion = useReducedMotion()
  const prescription = appointment.prescription

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaved(true)
  }

  return (
    <motion.form
      onSubmit={onSubmit}
      className={`${portalCardClass} p-5`}
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <h2 className='flex items-center gap-2 text-base font-extrabold text-ink'>
        <Icon name='spa' size={18} className='text-clinic' />
        Sản phẩm tư vấn
      </h2>
      <p className='mt-4 text-[11px] font-bold tracking-[0.14em] text-muted uppercase'>Kê đơn chăm sóc theo phác đồ</p>
      <p className='mt-1 text-lg font-extrabold text-ink'>{appointment.name}</p>
      <p className='mt-1 text-sm text-muted'>
        <span className='font-semibold text-ink'>Phác đồ: </span>
        {prescription?.plan ?? appointment.detail}
      </p>

      {prescription ? (
        <ul className='mt-4 space-y-4'>
          {prescription.products.map((product) => (
            <li key={product.name} className='flex gap-3 border-b border-rose-soft/50 pb-4 last:border-0'>
              <span className='grid size-10 shrink-0 place-items-center rounded-2xl bg-mist text-clinic'>
                <Icon name={product.icon} size={18} />
              </span>
              <div className='min-w-0 flex-1'>
                <div className='flex items-start justify-between gap-3'>
                  <p className='text-sm font-bold text-ink'>{product.name}</p>
                  <p className='shrink-0 text-sm font-bold text-ink'>{product.price}</p>
                </div>
                <p className='text-xs text-muted'>{product.size}</p>
                <p className='mt-1 text-xs leading-5 text-muted'>{product.note}</p>
                <p className='mt-2 inline-flex rounded-full border border-clinic/30 px-2.5 py-1 text-[11px] font-bold text-clinic'>
                  {product.added}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className='mt-4 rounded-2xl bg-canvas px-4 py-5 text-sm leading-6 text-muted'>
          Buổi này chưa có sản phẩm kèm theo. Chọn lịch của Nguyễn Minh Anh để xem đơn tư vấn mẫu.
        </p>
      )}

      {prescription ? (
        <div className='mt-2 space-y-1 text-sm'>
          <p className='flex items-center justify-between text-muted'>
            <span>Tổng giá niêm yết ({prescription.products.length} sản phẩm)</span>
            <span className='line-through'>{prescription.listPrice}</span>
          </p>
          <p className='flex items-center justify-between font-bold text-clinic'>
            <span>Ưu đãi VIP Hội viên (-10%)</span>
            <span>{prescription.memberPrice}</span>
          </p>
        </div>
      ) : null}

      <label className='mt-4 block text-sm font-bold text-ink' htmlFor='consult-note'>
        Dặn dò kê đơn cho khách
      </label>
      <textarea
        id='consult-note'
        value={note}
        onChange={(event) => {
          setNote(event.target.value)
          setSaved(false)
        }}
        rows={3}
        placeholder='Hướng dẫn khách thoa tinh chất về nhà 1 giọt, không dùng AHA/BHA trong 5 ngày đầu.'
        className='mt-2 w-full resize-none rounded-2xl border border-rose-soft/80 bg-canvas px-4 py-3 text-sm text-ink outline-none placeholder:text-muted/80 focus:border-clinic'
      />

      <button
        type='submit'
        className='mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-clinic px-4 py-3.5 text-xs font-bold tracking-wide text-white uppercase shadow-[0_12px_24px_rgba(225,29,116,0.28)] transition hover:bg-clinic-deep'
      >
        <Icon name='play_arrow' size={18} />
        Lưu đơn tư vấn & đóng bộ đến khách hàng
      </button>
      <AnimatePresence>
        {saved ? (
          <motion.p
            className='mt-3 text-center text-sm font-semibold text-emerald-600'
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            Đã lưu đơn tư vấn cho {appointment.name}.
          </motion.p>
        ) : null}
      </AnimatePresence>
    </motion.form>
  )
}
