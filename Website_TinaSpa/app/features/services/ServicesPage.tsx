import { useState, useMemo } from 'react'
import { Link } from 'react-router'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useServiceMenus, type ServiceMenu } from '~/data/home'
import { Icon } from '~/components/ui/Icon'
import { StableText } from '~/components/ui/StableText'

export function ServicesPage() {
  const { t } = useTranslation()
  const serviceMenus = useServiceMenus()
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Logic lọc danh mục và từ khóa tìm kiếm
  const filteredMenus = useMemo(() => {
    return serviceMenus
      .map((menu) => {
        // Lọc theo danh mục active
        if (activeCategory !== 'all' && menu.id !== activeCategory) {
          return null
        }

        // Lọc theo từ khóa tìm kiếm
        if (!searchQuery.trim()) return menu

        const query = searchQuery.toLowerCase().trim()
        const matchedItems = menu.items.filter(
          (item) =>
            item.name.toLowerCase().includes(query) ||
            item.summary?.toLowerCase().includes(query) ||
            item.description?.toLowerCase().includes(query)
        )

        if (matchedItems.length === 0) return null

        return { ...menu, items: matchedItems }
      })
      .filter((menu): menu is ServiceMenu => menu !== null)
  }, [activeCategory, searchQuery, serviceMenus])

  return (
    <section className='relative isolate min-h-screen overflow-hidden'>
      {/* KHUNG ẢNH NỀN CỐ ĐỊNH (FIXED): Không bị nhảy vị trí khi chiều cao trang thay đổi */}
      <div className='fixed inset-0 -z-20 pointer-events-none'>
        <img
          src='/images/ServiceBackground.png'
          alt=''
          aria-hidden
          className='h-full w-full object-cover'
        />
        <div className='absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-white/30' />
      </div>

      <div className='mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20'>
        {/* Header tiêu đề */}
        <div className='mx-auto mb-10 max-w-2xl text-center'>
          <p className='text-sm font-semibold tracking-wide text-clinic'>
            <StableText i18nKey='servicesPage.eyebrow' block align='center' />
          </p>
          <h1 className='mt-2 font-serif text-4xl text-ink sm:text-5xl'>
            <StableText i18nKey='servicesPage.title' block align='center' />
          </h1>
          <p className='mt-3 text-sm leading-6 text-muted'>
            <StableText i18nKey='servicesPage.description' block align='center' />
          </p>
        </div>

        {/* Thanh Menu + Search Bar tối giản */}
        <div className='mb-14 flex flex-col items-center justify-between gap-6 border-b border-clinic/20 pb-4 lg:flex-row'>
          {/* List Danh mục dạng IN HOA phân cách bằng '|' */}
          <nav
            className='flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs font-bold tracking-widest sm:text-sm'
            aria-label={t('servicesPage.groups')}
          >
            <button
              type='button'
              onClick={() => setActiveCategory('all')}
              className={`transition-colors uppercase ${activeCategory === 'all'
                ? 'text-clinic underline underline-offset-8 decoration-2'
                : 'text-ink/70 hover:text-clinic'
                }`}
            >
              <StableText i18nKey='servicesPage.all' />
            </button>

            {serviceMenus.map((menu) => (
              <div key={menu.id} className='flex items-center gap-3'>
                <span className='select-none text-clinic/30 font-normal'>|</span>
                <button
                  type='button'
                  onClick={() => setActiveCategory(menu.id)}
                  className={`transition-colors uppercase ${activeCategory === menu.id
                    ? 'text-clinic underline underline-offset-8 decoration-2'
                    : 'text-ink/70 hover:text-clinic'
                    }`}
                >
                  <StableText i18nKey={`serviceMenus.${menu.id}.title`} />
                </button>
              </div>
            ))}
          </nav>

          {/* Ô Tìm kiếm gạch chân bên phải */}
          <div className='relative w-full max-w-xs sm:w-64'>
            <input
              type='text'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('servicesPage.searchPlaceholder')}
              className='w-full border-b-2 border-clinic/50 bg-transparent py-1.5 pl-1 pr-8 text-sm font-medium text-ink placeholder:text-muted transition-colors focus:border-clinic focus:outline-none'
            />
            <span className='pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-clinic'>
              <Icon name='search' size={18} />
            </span>
          </div>
        </div>

        {/* Danh sách dịch vụ */}
        {filteredMenus.length > 0 ? (
          <div className='space-y-16 lg:space-y-24'>
            {filteredMenus.map((menu, index) => (
              <ServiceMenuBlock key={menu.id} menu={menu} reversed={index % 2 === 1} />
            ))}
          </div>
        ) : (
          <div className='py-16 text-center text-muted'>
            {t('servicesPage.empty', { query: searchQuery })}
          </div>
        )}

        {/* Nút Đặt lịch */}
        <div className='mt-20 text-center'>
          <Link
            to='/booking'
            className='inline-flex min-h-11 items-center justify-center rounded-full bg-clinic px-7 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_var(--color-whisper-shadow)] transition hover:bg-clinic-deep'
          >
            <StableText i18nKey='common.bookNow' />
          </Link>
        </div>
      </div>
    </section>
  )
}

function ServiceMenuBlock({ menu, reversed }: { readonly menu: ServiceMenu; readonly reversed: boolean }) {
  const reduceMotion = useReducedMotion()
  const [openName, setOpenName] = useState<string | null>(null)
  const offset = reduceMotion ? 0 : 48

  return (
    <article id={menu.id} className='grid scroll-mt-28 items-center gap-8 md:grid-cols-2 lg:gap-16'>
      <motion.div
        className={reversed ? 'md:order-2' : ''}
        initial={{ opacity: 0, x: reversed ? offset : -offset }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <div className='overflow-hidden rounded-md shadow-[0_24px_60px_rgba(74,32,53,0.18)]'>
          <img
            src={menu.image}
            alt={menu.imageAlt}
            loading='lazy'
            className='aspect-[4/5] w-full object-cover transition duration-700 hover:scale-105 md:aspect-square'
          />
        </div>
      </motion.div>

      <motion.div
        className={reversed ? 'md:order-1' : ''}
        initial={{ opacity: 0, x: reversed ? -offset : offset }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, delay: reduceMotion ? 0 : 0.1, ease: 'easeOut' }}
      >
        <h2 className='font-serif text-3xl text-clinic-deep sm:text-4xl'>{menu.title}</h2>
        <ul className='mt-6'>
          {menu.items.map((item) => {
            const open = openName === item.id
            const panelId = `${menu.id}-${item.id}`
            return (
              <li key={item.id} className='border-b border-ink/10 last:border-0'>
                <button
                  type='button'
                  className='group flex w-full items-start gap-4 py-4 text-left'
                  aria-expanded={open}
                  aria-controls={panelId}
                  onClick={() => setOpenName(open ? null : item.id)}
                >
                  <span className='min-w-0 flex-1'>
                    <span
                      className={`block text-sm font-bold transition-colors ${open ? 'text-clinic' : 'text-ink group-hover:text-clinic'
                        }`}
                    >
                      {item.name}
                    </span>
                    <span className={`mt-1 block text-xs text-muted ${open ? '' : 'truncate'}`}>
                      {item.summary}
                    </span>
                    <span className='mt-1 block text-sm font-bold text-ink'>{item.price}</span>
                  </span>
                  <motion.span
                    animate={{ rotate: open ? 45 : 0 }}
                    transition={{ duration: 0.25 }}
                    className='mt-1 inline-flex text-ink/70 group-hover:text-clinic'
                  >
                    <Icon name='add' size={20} />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {open ? (
                    <motion.div
                      id={panelId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: reduceMotion ? 0 : 0.3, ease: 'easeOut' }}
                      className='overflow-hidden'
                    >
                      <p className='pr-10 pb-4 text-sm leading-6 text-ink/80'>{item.description}</p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </li>
            )
          })}
        </ul>
      </motion.div>
    </article>
  )
}