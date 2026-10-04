import { Link } from 'react-router'
import { motion, type Variants } from 'framer-motion'

const easeOut = [0.22, 1, 0.36, 1] as const

export const MotionLink = motion.create(Link)

export const inView = {
  initial: 'hidden',
  whileInView: 'show',
  viewport: { once: true, amount: 0.2 }
} as const

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: easeOut } }
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.8, ease: easeOut } }
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: easeOut } }
}

export function slideIn(from: 'left' | 'right', distance = 48): Variants {
  return {
    hidden: { opacity: 0, x: from === 'left' ? -distance : distance },
    show: { opacity: 1, x: 0, transition: { duration: 0.8, ease: easeOut } }
  }
}

export function stagger(gap = 0.12, delay = 0): Variants {
  return {
    hidden: {},
    show: { transition: { staggerChildren: gap, delayChildren: delay } }
  }
}

export const hoverLift = {
  whileHover: { y: -6 },
  transition: { type: 'spring', stiffness: 300, damping: 22 }
} as const

export const pressable = {
  whileHover: { scale: 1.04 },
  whileTap: { scale: 0.97 },
  transition: { type: 'spring', stiffness: 400, damping: 20 }
} as const
