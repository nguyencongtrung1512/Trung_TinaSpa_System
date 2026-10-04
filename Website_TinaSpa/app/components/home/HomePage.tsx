import { motion } from 'framer-motion'
import { CtaBanner } from '~/components/home/CtaBanner'
import { Hero } from '~/components/home/Hero'
import { Process } from '~/components/home/Process'
import { Services } from '~/components/home/Services'
import { Stats } from '~/components/home/Stats'
import { Results } from '~/components/home/Results'
import { Team } from '~/components/home/Team'
import { WaveDivider } from '~/components/home/WaveDivider'

export function HomePage() {
  return (
    <>
      <div className='relative overflow-hidden bg-mist'>
        <motion.img
          src='/images/background.png'
          alt=''
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1.05, opacity: 0.35 }}
          transition={{ duration: 1.8, ease: 'easeOut' }}
          className='pointer-events-none absolute inset-0 h-full w-full object-cover blur-[2px]'
        />
        <div className='pointer-events-none absolute inset-0 bg-gradient-to-r from-white/85 via-mist/75 to-white/55' />
        <div className='relative'>
          <Hero />
          <Stats />
        </div>
      </div>
      <WaveDivider fill='canvas' />
      <Services />
      <WaveDivider fill='mist' />
      <Process />
      <WaveDivider fill='canvas' background='mist' />
      <Team />
      <Results />
      <CtaBanner />
    </>
  )
}
