import { CtaBanner } from '~/components/home/CtaBanner'
import { Hero } from '~/components/home/Hero'
import { Process } from '~/components/home/Process'
import { Services } from '~/components/home/Services'
import { Stats } from '~/components/home/Stats'
import { Results } from '~/components/home/Results'
import { Team } from '~/components/home/Team'
import { Testimonials } from '~/components/home/Testimonials'
import { WaveDivider } from '~/components/home/WaveDivider'

export function HomePage() {
  return (
    <>
      <div className='relative overflow-hidden bg-mist'>
        <img
          src='/images/background.png'
          alt=''
          className='pointer-events-none absolute inset-0 h-full w-full scale-105 object-cover opacity-35 blur-[2px]'
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
      <WaveDivider fill='canvas' />
      <Team />
      <Testimonials />
      <Results />
      <WaveDivider fill='mist' />
      <CtaBanner />
    </>
  )
}
