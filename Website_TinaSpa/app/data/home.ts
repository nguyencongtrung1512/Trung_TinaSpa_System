import { useTranslation } from 'react-i18next'
import { useContent } from '~/i18n'

export interface NavLinkItem {
  readonly label: string
  readonly labelKey: string
  readonly href: string
}

export interface StatItem {
  readonly value: string
  readonly label: string
}

export interface ServiceItem {
  readonly id: string
  readonly icon: string
  readonly title: string
  readonly description: string
}

export interface ServiceMenuItem {
  readonly id: string
  readonly name: string
  readonly summary: string
  readonly description: string
  readonly price: string
}

export interface ServiceMenu {
  readonly id: string
  readonly title: string
  readonly image: string
  readonly imageAlt: string
  readonly items: readonly ServiceMenuItem[]
}

export interface ProcessStep {
  readonly step: string
  readonly icon: string
  readonly title: string
  readonly description: string
}

export interface TeamMember {
  readonly id: string
  readonly name: string
  readonly role: string
  readonly image: string
  readonly imageAlt: string
}

export interface TestimonialItem {
  readonly quote: string
  readonly name: string
  readonly detail: string
}

type TextMap<T> = Record<string, T>

export const brand = {
  name: 'Dr Tina Beauty',
  shortName: 'Tina Beauty',
  logo: '/images/logo.png',
  phone: '0123 456 789',
  email: 'hello@drtinabeauty.vn',
  hours: '8:00 — 20:00'
} as const

const navItems = [
  { key: 'home', href: '/' },
  { key: 'about', href: '/about' },
  { key: 'services', href: '/services' },
  { key: 'products', href: '/products' },
  { key: 'contact', href: '/contact' }
] as const

export function useNavLinks(): readonly NavLinkItem[] {
  const { t } = useTranslation()
  return navItems.map((item) => ({ label: t(`nav.${item.key}`), labelKey: `nav.${item.key}`, href: item.href }))
}

export const heroLinks = {
  primary: '/booking',
  secondary: '/about',
  portrait: '/images/imageLoan.jpg',
  /** Intro clip; `portrait` is its poster while loading and the fallback for reduced motion. */
  video: '/videos/intro.mp4'
} as const

const statItems = [
  { key: 'experience', value: '10+' },
  { key: 'customers', value: '1000+' },
  { key: 'treatments', value: '100+' },
  { key: 'groups', value: '5+' }
] as const

export function useStats(): readonly StatItem[] {
  const { t } = useTranslation()
  return statItems.map((item) => ({ value: item.value, label: t(`stats.${item.key}`) }))
}

const serviceItems = [
  { id: 'skinExam', icon: 'dermatology' },
  { id: 'acne', icon: 'face_retouching_natural' },
  { id: 'rejuvenation', icon: 'spa' },
  { id: 'laser', icon: 'wb_iridescent' },
  { id: 'body', icon: 'self_improvement' },
  { id: 'consult', icon: 'favorite' }
] as const

export function useServices(): readonly ServiceItem[] {
  const texts = useContent<TextMap<{ title: string; description: string }>>('services')
  return serviceItems.map((item) => ({ ...item, ...texts[item.id] }))
}

const serviceMenuItems = [
  {
    id: 'combo',
    image: '/images/p1.png',
    items: [
      { id: 'perfectlyPolished', name: 'Perfectly Polished', price: '390k' },
      { id: 'glowRelax', name: 'Glow & Relax', price: '590k' },
      { id: 'handFootRitual', name: 'Hand & Foot Ritual', price: '650k' },
      { id: 'bridalBeautyDay', name: 'Bridal Beauty Day', price: '1.290k' }
    ]
  },
  {
    id: 'manicure',
    image: '/images/p4.png',
    items: [
      { id: 'classicManicure', name: 'Classic Manicure', price: '190k' },
      { id: 'gelPolish', name: 'Gel Polish', price: '290k' },
      { id: 'frenchTip', name: 'French Tip', price: '350k' },
      { id: 'nailArt', name: 'Nail Art', price: '420k' },
      { id: 'nailRepair', name: 'Nail Repair', price: '250k' },
      { id: 'paraffinHandCare', name: 'Paraffin Hand Care', price: '220k' }
    ]
  },
  {
    id: 'pedicure',
    image: '/images/p2.png',
    items: [
      { id: 'spaPedicure', name: 'Spa Pedicure', price: '250k' },
      { id: 'gelPedicure', name: 'Gel Pedicure', price: '350k' },
      { id: 'callusTreatment', name: 'Callus Treatment', price: '280k' },
      { id: 'detoxFootRitual', name: 'Detox Foot Ritual', price: '390k' }
    ]
  }
] as const

interface ServiceMenuText {
  readonly title: string
  readonly imageAlt: string
  readonly items: TextMap<{ summary: string; description: string }>
}

export function useServiceMenus(): readonly ServiceMenu[] {
  const texts = useContent<TextMap<ServiceMenuText>>('serviceMenus')
  return serviceMenuItems.map((menu) => {
    const text = texts[menu.id]
    return {
      id: menu.id,
      image: menu.image,
      title: text.title,
      imageAlt: text.imageAlt,
      items: menu.items.map((item) => ({ ...item, ...text.items[item.id] }))
    }
  })
}

const processItems = [
  { key: 'book', step: '01', icon: 'calendar_month' },
  { key: 'consult', step: '02', icon: 'stethoscope' },
  { key: 'treat', step: '03', icon: 'healing' },
  { key: 'aftercare', step: '04', icon: 'monitoring' }
] as const

export function useProcessSteps(): readonly ProcessStep[] {
  const texts = useContent<TextMap<{ title: string; description: string }>>('process.steps')
  return processItems.map((item) => ({ step: item.step, icon: item.icon, ...texts[item.key] }))
}

const teamItems = [
  { id: 'doctor', image: '/images/image 1.png' },
  { id: 'skinExpert', image: '/images/imageLoan.jpg' },
  { id: 'spaTechnician', image: '/images/screen.png' }
] as const

export function useTeam(): readonly TeamMember[] {
  const texts = useContent<TextMap<{ name: string; role: string; imageAlt: string }>>('team.members')
  return teamItems.map((item) => ({ ...item, ...texts[item.id] }))
}

const testimonialItems = [
  { id: 'minhAnh', name: 'Minh Anh' },
  { id: 'thuHa', name: 'Thu Hà' },
  { id: 'lanPhuong', name: 'Lan Phương' }
] as const

export function useTestimonials(): readonly TestimonialItem[] {
  const texts = useContent<TextMap<{ quote: string; detail: string }>>('testimonials.items')
  return testimonialItems.map((item) => ({ name: item.name, ...texts[item.id] }))
}

const footerExplore = [
  { key: 'home', href: '/' },
  { key: 'about', href: '/about' },
  { key: 'services', href: '/services' },
  { key: 'products', href: '/products' },
  { key: 'booking', href: '/booking' }
] as const

const footerCare = ['skinExam', 'acne', 'rejuvenation', 'laser'] as const

export function useFooterColumns() {
  const { t } = useTranslation()
  return {
    explore: footerExplore.map((item) => ({ label: t(`nav.${item.key}`), href: item.href })),
    care: footerCare.map((key) => ({ label: t(`services.${key}.title`), href: '/services' }))
  }
}
