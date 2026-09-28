import { SiteShell } from '~/components/layout/SiteShell'
import { Icon } from '~/components/ui/Icon'

const values = [
  {
    index: '01',
    title: 'Chân Thật',
    description:
      'Mỗi dịch vụ được thực hiện bằng sự tận tâm và tự nhiên, không phô trương, chỉ mang đến điều tinh khiết nhất cho cơ thể và tâm trí.'
  },
  {
    index: '02',
    title: 'Hài Hòa',
    description:
      'Không gian, con người và liệu trình đều hướng đến sự cân bằng — giữa hiện đại và truyền thống, giữa thể chất và tinh thần.'
  },
  {
    index: '03',
    title: 'Chữa Lành',
    description:
      'Liệu trình được thiết kế để giải tỏa căng thẳng, phục hồi năng lượng, đưa bạn về trạng thái an nhiên trọn vẹn.'
  },
  {
    index: '04',
    title: 'Tinh Tế',
    description:
      'Chú trọng từng chi tiết nhỏ, từ hương thơm, ánh sáng đến từng động tác trị liệu — tất cả đều để nâng niu trải nghiệm của bạn.'
  }
] as const

const signatures = [
  {
    icon: 'spa',
    lead: 'Sản phẩm an toàn, ',
    accent: 'lành tính',
    description: 'Cam kết dùng nguồn sản phẩm thuần chay, không độc hại và thân thiện với môi trường.'
  },
  {
    icon: 'fingerprint',
    lead: 'Dịch vụ ',
    accent: 'cá nhân hóa',
    description: 'Mỗi khách hàng đều được lắng nghe và thiết kế liệu trình riêng phù hợp với nhu cầu làn da.'
  },
  {
    icon: 'self_improvement',
    lead: 'Chữa lành từ ',
    accent: 'bên trong',
    description: 'Không gian an tĩnh giúp bạn xả hết những căng thẳng và nạp lại năng lượng tích cực.'
  }
] as const

export function meta() {
  return [
    { title: 'Giới thiệu — Dr Tina Beauty' },
    {
      name: 'description',
      content: 'Giá trị cốt lõi của Dr Tina Beauty: chân thật, hài hòa, chữa lành và tinh tế.'
    }
  ]
}

export default function About() {
  return (
    <SiteShell>
      <section className='bg-canvas'>
        <div className='mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16 lg:py-24'>
          <div className='relative mx-auto w-full max-w-lg'>
            <img
              src='/images/screen.png'
              alt='Không gian liệu trình thư giãn tại Dr Tina Beauty'
              className='aspect-[4/5] w-[78%] rounded-[1.75rem] object-cover shadow-[0_18px_40px_var(--color-whisper-shadow)]'
            />
            <img
              src='/images/screen1.png'
              alt='Góc chăm sóc da trong phòng trị liệu'
              className='absolute top-8 right-0 aspect-[4/5] w-[58%] rounded-[1.5rem] border-4 border-white object-cover shadow-[0_16px_36px_var(--color-whisper-shadow)]'
            />
            <span className='absolute top-4 left-4 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-bold tracking-[0.14em] text-clinic uppercase'>
              Sanctuary ritual
            </span>
            <div className='absolute bottom-6 left-4 flex max-w-[240px] items-center gap-3 rounded-2xl bg-white/95 px-3 py-3 shadow-sm'>
              <span className='inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-clinic text-lg text-white'>
                ✦
              </span>
              <span>
                <span className='block text-sm font-extrabold text-ink'>Không Gian Thuần Khiết</span>
                <span className='mt-0.5 block text-xs leading-5 text-muted'>
                  Thư giãn tâm thức · Đánh thức vẻ đẹp nội sinh
                </span>
              </span>
            </div>
          </div>

          <div>
            <p className='text-xs font-bold tracking-[0.28em] text-clinic uppercase'>Giá trị cốt lõi</p>
            <h1 className='mt-4 text-4xl leading-tight font-extrabold tracking-tight text-ink sm:text-5xl'>
              Lan Tỏa Tinh Hoa
              <span className='mt-1 block text-clinic'>Nội Tại</span>
            </h1>
            <p className='mt-5 max-w-xl text-sm leading-7 text-muted'>
              Định hình phong cách làm đẹp xuất phát từ sự thấu hiểu sâu sắc, kết hợp tinh hoa y học chuẩn xác cùng
              nghệ thuật phục hồi an yên cho làn da và thần thái.
            </p>

            <div className='mt-10 grid gap-8 sm:grid-cols-2'>
              {values.map((item) => (
                <article key={item.index}>
                  <h2 className='text-lg font-extrabold text-ink'>
                    <span className='mr-2 text-clinic'>{item.index}</span>
                    {item.title}
                  </h2>
                  <p className='mt-2 text-sm leading-6 text-muted'>{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className='bg-mist'>
        <div className='mx-auto max-w-6xl px-4 py-20 text-center sm:px-6'>
          <p className='text-xs font-bold tracking-[0.28em] text-clinic uppercase'>Điều làm nên dấu ấn riêng</p>
          <h2 className='mt-4 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl'>
            Chỉ Có Tại <span className='text-clinic'>Dr Tina Beauty</span>
          </h2>
          <p className='mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted'>
            Ba giá trị khác biệt kiến tạo nên trải nghiệm thư thái và sự chuyển hóa thanh khiết từ tâm thức đến làn da.
          </p>

          <div className='mt-14 grid gap-10 md:grid-cols-3'>
            {signatures.map((item) => (
              <article key={item.icon} className='px-4'>
                <span className='mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full bg-rose-soft text-clinic'>
                  <Icon name={item.icon} size={40} />
                </span>
                <h3 className='mt-5 text-lg font-extrabold text-ink'>
                  {item.lead}
                  <span className='text-clinic'>{item.accent}</span>
                </h3>
                <p className='mt-3 text-sm leading-6 text-muted'>{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  )
}
