import { motion } from 'motion/react'
import { OSITA, OSITO } from '@/content/config'
import { turnoDeAmarMas } from '@/lib/celebraciones'

/**
 * El árbitro oficial de la discusión eterna.
 * Cada día le toca a uno tener la razón, y el otro tiene que aceptarlo.
 */
export function QuienAmaMas() {
  const turno = turnoDeAmarMas()
  const quien = turno === 'osito' ? OSITO : OSITA
  const otro = turno === 'osito' ? OSITA : OSITO
  const color = turno === 'osito' ? 'var(--color-oso-claro)' : 'var(--color-rosa-pastel)'

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="papel relative mx-auto w-full max-w-lg overflow-hidden rounded-2xl px-6 py-7 text-center"
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
      />

      <p className="text-[0.68rem] uppercase tracking-[0.24em] text-texto-suave/70">
        veredicto del día
      </p>

      <p className="mt-4 font-display text-2xl leading-snug sm:text-3xl">
        Hoy{' '}
        <span className="resplandor" style={{ color }}>
          {quien.apodo}
        </span>{' '}
        ama más.
      </p>

      <p className="fuente-mano mt-3 text-lg text-texto-suave">
        Y {otro.apodo} tiene que aceptarlo. Son las reglas.
      </p>

      <p className="mt-5 text-xs text-texto-suave/60">
        mañana le toca a {otro.apodo} — no vale reclamar antes de medianoche
      </p>

      <span aria-hidden className="anima-latido mt-4 inline-block text-2xl">
        {turno === 'osito' ? '🐻' : '🎀'}
      </span>
    </motion.section>
  )
}
