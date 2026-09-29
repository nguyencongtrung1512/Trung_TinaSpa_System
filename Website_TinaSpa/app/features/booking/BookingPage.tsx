import { useState, type FormEvent, type ReactNode } from 'react'
import { services } from '~/data/home'
import { Icon } from '~/components/ui/Icon'

const timeSlots = ['08:00 – 10:00', '10:00 – 12:00', '13:00 – 15:00', '15:00 – 17:00', '17:00 – 20:00'] as const

interface BookingValues {
  readonly name: string
  readonly phone: string
  readonly service: string
  readonly date: string
  readonly time: string
  readonly note: string
}

const emptyValues: BookingValues = {
  name: '',
  phone: '',
  service: '',
  date: '',
  time: '',
  note: ''
}

type FieldName = keyof BookingValues

function todayIso() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

function validate(values: BookingValues) {
  const errors: Partial<Record<FieldName, string>> = {}
  if (values.name.trim().length < 2) errors.name = 'Xin hãy cho biết họ và tên.'
  if (!/^(0|\+84)\d{8,10}$/.test(values.phone.replaceAll(/\s/g, ''))) {
    errors.phone = 'Số điện thoại chưa đúng.'
  }
  if (!values.service) errors.service = 'Hãy chọn dịch vụ bạn quan tâm.'
  if (!values.date) errors.date = 'Hãy chọn ngày mong muốn.'
  else if (values.date < todayIso()) errors.date = 'Ngày hẹn cần từ hôm nay trở đi.'
  if (!values.time) errors.time = 'Hãy chọn khung giờ.'
  return errors
}

export function BookingPage() {
  const [values, setValues] = useState<BookingValues>(emptyValues)
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({})
  const [submitted, setSubmitted] = useState(false)

  function update(field: FieldName, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length === 0) setSubmitted(true)
  }

  return (
    <section className='booking-page relative overflow-hidden bg-[#FFF8FA]'>
      <img
        src='/images/Background_Booking.png'
        alt=''
        className='pointer-events-none absolute inset-0 h-full w-full object-cover object-[12%_center] lg:object-[72%_center]'
      />

      <div className='relative mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 lg:py-16'>
        <div className='max-w-[740px]'>
          <p className='flex items-center gap-3 text-[11px] font-medium tracking-[0.22em] text-[#D4145A] uppercase'>
            <span className='h-1.5 w-1.5 rounded-full bg-[#D4145A]' />
            Dr Tina Beauty
            <span className='h-px w-10 bg-[#E83E78]/45' />
            Spa & Aesthetics
          </p>

          <h1 className='mt-5 font-["Cormorant_Garamond",serif] text-5xl leading-none font-semibold tracking-[0.08em] text-[#3A2930] uppercase sm:text-6xl lg:text-7xl'>
            Đặt lịch hẹn
          </h1>
          <p className='mt-3 font-["Dancing_Script",cursive] text-4xl leading-tight text-[#D4145A] sm:text-5xl'>
            Dành một chút thời gian cho bản thân
          </p>
          <p className='mt-5 max-w-xl text-sm leading-7 text-[#3A2930]/75'>
            Thư giãn, tái tạo năng lượng và chăm sóc sắc đẹp cùng Dr Tina Beauty.
            <span className='mt-1 block'>
              Chúng tôi luôn sẵn sàng đồng hành cùng bạn trên hành trình tự tin và rạng rỡ hơn.
            </span>
          </p>
          <p className='mt-5 font-["Dancing_Script",cursive] text-2xl text-[#E83E78] sm:text-[1.85rem]'>
            Đẹp hơn · Khỏe hơn · Hạnh phúc hơn
          </p>

          {submitted ? (
            <div className='mt-14 max-w-lg'>
              <p className='font-["Dancing_Script",cursive] text-4xl text-[#D4145A]'>Cảm ơn {values.name.trim()}</p>
              <p className='mt-4 text-sm leading-7 text-[#3A2930]/80'>
                Lịch {values.service.toLowerCase()} vào {values.date.split('-').reverse().join('/')} ({values.time}) đã
                được ghi nhận. Chúng tôi sẽ gọi {values.phone.trim()} để xác nhận cùng bạn.
              </p>
            </div>
          ) : (
            <form className='mt-12' onSubmit={onSubmit} noValidate>
              <div className='grid items-stretch gap-y-10 lg:grid-cols-[1fr_auto_1fr] lg:gap-x-0 lg:gap-y-0'>
                <div className='flex flex-col gap-10 lg:pr-10'>
                  <UnderlineField id='booking-name' label='Họ và tên' icon='person' error={errors.name}>
                    <input
                      id='booking-name'
                      name='name'
                      autoComplete='name'
                      placeholder='Nhập họ và tên của bạn'
                      value={values.name}
                      aria-invalid={Boolean(errors.name)}
                      onChange={(event) => update('name', event.target.value)}
                      className={inputClass}
                    />
                  </UnderlineField>
                  <UnderlineField id='booking-phone' label='Số điện thoại' icon='call' error={errors.phone}>
                    <input
                      id='booking-phone'
                      name='phone'
                      type='tel'
                      autoComplete='tel'
                      inputMode='tel'
                      placeholder='Nhập số điện thoại'
                      value={values.phone}
                      aria-invalid={Boolean(errors.phone)}
                      onChange={(event) => update('phone', event.target.value)}
                      className={inputClass}
                    />
                  </UnderlineField>
                  <UnderlineField id='booking-service' label='Dịch vụ quan tâm' icon='spa' error={errors.service}>
                    <select
                      id='booking-service'
                      name='service'
                      value={values.service}
                      aria-invalid={Boolean(errors.service)}
                      onChange={(event) => update('service', event.target.value)}
                      className={`${inputClass} appearance-none ${values.service ? 'text-[#3A2930]' : 'text-[#8A6573]'}`}
                    >
                      <option value=''>Chọn dịch vụ</option>
                      {services.map((item) => (
                        <option key={item.title} value={item.title}>
                          {item.title}
                        </option>
                      ))}
                    </select>
                    <Icon name='expand_more' size={18} className='pointer-events-none text-[#D4145A]' />
                  </UnderlineField>
                </div>

                <div className='hidden lg:flex lg:flex-col lg:items-center lg:px-2' aria-hidden>
                  <span className='w-px flex-1 bg-[#E83E78]/25' />
                  <Icon name='local_florist' size={16} className='my-3 text-[#E83E78]/70' />
                  <span className='w-px flex-1 bg-[#E83E78]/25' />
                </div>

                <div className='flex flex-col gap-10 lg:pl-10'>
                  <UnderlineField id='booking-date' label='Ngày mong muốn' icon='calendar_month' error={errors.date}>
                    <input
                      id='booking-date'
                      name='date'
                      type='date'
                      min={todayIso()}
                      value={values.date}
                      aria-invalid={Boolean(errors.date)}
                      onChange={(event) => update('date', event.target.value)}
                      className={`${inputClass} ${values.date ? 'text-[#3A2930]' : 'text-[#8A6573]'}`}
                    />
                  </UnderlineField>
                  <UnderlineField id='booking-time' label='Khung giờ' icon='schedule' error={errors.time}>
                    <select
                      id='booking-time'
                      name='time'
                      value={values.time}
                      aria-invalid={Boolean(errors.time)}
                      onChange={(event) => update('time', event.target.value)}
                      className={`${inputClass} appearance-none ${values.time ? 'text-[#3A2930]' : 'text-[#8A6573]'}`}
                    >
                      <option value=''>Chọn khung giờ</option>
                      {timeSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                    <Icon name='expand_more' size={18} className='pointer-events-none text-[#D4145A]' />
                  </UnderlineField>
                  <UnderlineField id='booking-note' label='Ghi chú' icon='chat_bubble' error={errors.note}>
                    <input
                      id='booking-note'
                      name='note'
                      placeholder='Để lại ghi chú (nếu có)'
                      value={values.note}
                      onChange={(event) => update('note', event.target.value)}
                      className={inputClass}
                    />
                  </UnderlineField>
                </div>
              </div>

              <div className='mt-12 flex flex-col items-center'>
                <button
                  type='submit'
                  className='inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#D4145A] px-8 py-3 text-[13px] font-semibold tracking-[0.14em] text-white uppercase transition duration-300 ease-out hover:-translate-y-px hover:bg-[#C90F50]'
                >
                  <Icon name='calendar_month' size={18} className='text-white' />
                  Xác nhận đặt lịch
                  <span aria-hidden>→</span>
                </button>
                <p className='mt-4 flex items-center gap-2 text-xs text-[#8A6573]'>
                  <Icon name='call' size={14} className='text-[#D4145A]' />
                  Chúng tôi sẽ liên hệ xác nhận lịch hẹn của bạn.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

const inputClass =
  'w-full min-w-0 bg-transparent py-2 text-sm text-[#3A2930] outline-none placeholder:text-[#8A6573]/80'

function UnderlineField({
  id,
  label,
  icon,
  error,
  children
}: {
  readonly id: string
  readonly label: string
  readonly icon: string
  readonly error?: string
  readonly children: ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className='block text-[13px] font-medium text-[#3A2930]'>
        {label}
      </label>
      <div className='mt-1 flex items-center gap-3 border-b border-[#F7D5DF] transition-colors duration-300 focus-within:border-[#D4145A]'>
        <Icon name={icon} size={18} className='shrink-0 text-[#D4145A]' />
        {children}
      </div>
      {error ? <p className='mt-1.5 text-xs text-[#D4145A]'>{error}</p> : null}
    </div>
  )
}
