import { useEffect, useRef } from 'react'
import { animate, motion, useInView, useReducedMotion } from 'framer-motion'
import { useStats } from '~/data/home'
import { fadeUp, inView, stagger } from '~/components/ui/motion'

export interface StatsProps {
  readonly className?: string
}

function CountUp({ value }: { readonly value: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const visible = useInView(ref, { once: true, amount: 0.3 })
  const reduceMotion = useReducedMotion()
  const target = Number.parseInt(value, 10)
  const suffix = value.replace(/^\d+/, '')

  useEffect(() => {
    const node = ref.current
    if (!node || !visible || Number.isNaN(target)) return
    if (reduceMotion) {
      node.textContent = value
      return
    }
    const controls = animate(0, target, {
      duration: 1.6,
      ease: 'easeOut',
      onUpdate: (latest) => {
        node.textContent = `${Math.round(latest)}${suffix}`
      }
    })
    return () => controls.stop()
  }, [visible, target, suffix, value, reduceMotion])

  return <span ref={ref}>{Number.isNaN(target) ? value : `0${suffix}`}</span>
}

export function Stats({ className = '' }: StatsProps) {
  const stats = useStats()

  return (
    <section className={className}>
      <motion.div
        {...inView}
        variants={stagger(0.1)}
        className='mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 pb-16 sm:px-6 lg:grid-cols-4'
      >
        {stats.map((item) => (
          <motion.div key={item.value} variants={fadeUp} className='text-center'>
            <p className='text-4xl font-extrabold tracking-tight text-clinic tabular-nums sm:text-5xl'>
              <CountUp value={item.value} />
            </p>
            <p className='mt-2 text-sm font-medium text-muted'>{item.label}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
