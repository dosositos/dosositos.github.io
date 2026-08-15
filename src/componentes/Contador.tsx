import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { conSeparador, desglosar, fechaLarga, frasearDesglose } from '@/lib/tiempo'

type Formato = 'calendario' | 'dias' | 'vivo'

const SIGUIENTE: Record<Formato, Formato> = {
  calendario: 'dias',
  dias: 'vivo',
  vivo: 'calendario',
}

const ETIQUETA: Record<Formato, string> = {
  calendario: 'años, meses y días',
  dias: 'días totales',
  vivo: 'al segundo',
}

interface Props {
  desde: string
  titulo: string
  subtitulo?: string
  /** Color de acento de esta tarjeta (una de nuestras flores). */
  flor?: string
  retraso?: number
}

export function Contador({ desde, titulo, subtitulo, flor = 'var(--t-acento)', retraso = 0 }: Props) {
  const fechaInicio = new Date(desde)
  const [formato, setFormato] = useState<Formato>('calendario')
  const [d, setD] = useState(() => desglosar(fechaInicio))

  useEffect(() => {
    // En modo "vivo" latimos cada segundo; en los otros basta cada minuto.
    const periodo = formato === 'vivo' ? 1000 : 30_000
    const id = setInterval(() => setD(desglosar(fechaInicio)), periodo)
    setD(desglosar(fechaInicio))
    return () => clearInterval(id)
  }, [desde, formato])

  return (
    <motion.article
      initial={{ opacity: 0, y: 28, rotate: -0.6 }}
      whileInView={{ opacity: 1, y: 0, rotate: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.9, delay: retraso, ease: [0.22, 1, 0.36, 1] }}
      className="papel relative w-full max-w-md rounded-2xl px-6 py-8 sm:px-8"
      style={{ ['--flor' as string]: flor }}
    >
      {/* Cinta adhesiva del scrapbook */}
      <span
        aria-hidden
        className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 -rotate-2 rounded-[2px] opacity-70 backdrop-blur-[1px]"
        style={{
          background: `linear-gradient(105deg, color-mix(in srgb, ${flor} 35%, transparent), color-mix(in srgb, ${flor} 18%, transparent))`,
          boxShadow: '0 1px 6px rgb(0 0 0 / .35)',
        }}
      />

      <header className="mb-5 text-center">
        <p className="fuente-mano text-lg text-texto-suave">{titulo}</p>
        {subtitulo && (
          <p className="mt-1 text-[0.72rem] uppercase tracking-[0.22em] text-texto-suave/60">
            {subtitulo}
          </p>
        )}
      </header>

      <div className="min-h-[7.5rem] grid place-items-center">
        <AnimatePresence mode="wait">
          {formato === 'calendario' && (
            <motion.div
              key="calendario"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
              className="flex items-end justify-center gap-4 sm:gap-6"
            >
              {[
                { n: d.anios, u: d.anios === 1 ? 'año' : 'años' },
                { n: d.meses, u: d.meses === 1 ? 'mes' : 'meses' },
                { n: d.dias, u: d.dias === 1 ? 'día' : 'días' },
              ].map((bloque) => (
                <div key={bloque.u} className="text-center">
                  <div
                    className="font-display text-5xl leading-none sm:text-6xl"
                    style={{ color: flor }}
                  >
                    {bloque.n}
                  </div>
                  <div className="mt-2 text-xs uppercase tracking-[0.18em] text-texto-suave">
                    {bloque.u}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {formato === 'dias' && (
            <motion.div
              key="dias"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.04 }}
              transition={{ duration: 0.35 }}
              className="text-center"
            >
              <div className="font-display text-6xl leading-none sm:text-7xl" style={{ color: flor }}>
                {conSeparador(d.diasTotales)}
              </div>
              <div className="mt-3 text-xs uppercase tracking-[0.18em] text-texto-suave">
                días juntos
              </div>
            </motion.div>
          )}

          {formato === 'vivo' && (
            <motion.div
              key="vivo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <div className="font-display text-4xl leading-none tabular-nums sm:text-5xl" style={{ color: flor }}>
                {conSeparador(d.diasTotales)}
                <span className="text-2xl text-texto-suave">d</span>{' '}
                {String(d.horas).padStart(2, '0')}
                <span className="text-2xl text-texto-suave">h</span>{' '}
                {String(d.minutos).padStart(2, '0')}
                <span className="text-2xl text-texto-suave">m</span>{' '}
                <motion.span
                  key={d.segundos}
                  initial={{ opacity: 0.35 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25 }}
                >
                  {String(d.segundos).padStart(2, '0')}
                </motion.span>
                <span className="text-2xl text-texto-suave">s</span>
              </div>
              <div className="mt-3 text-xs uppercase tracking-[0.18em] text-texto-suave">
                y sigue corriendo
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="mt-6 flex items-center justify-between gap-3 border-t border-borde/60 pt-4">
        <p className="fuente-mano text-sm text-texto-suave/80">
          desde el {fechaLarga(fechaInicio)}
        </p>
        <button
          onClick={() => setFormato(SIGUIENTE[formato])}
          className="rounded-full border border-borde px-3 py-1.5 text-[0.68rem] uppercase tracking-[0.14em] text-texto-suave transition-colors hover:border-acento hover:text-acento"
          aria-label={`Cambiar formato: ahora en ${ETIQUETA[formato]}`}
        >
          {ETIQUETA[formato]}
        </button>
      </footer>

      {/* Lectura accesible completa, para lectores de pantalla */}
      <span className="sr-only">
        Han pasado {frasearDesglose(d)} desde el {fechaLarga(fechaInicio)}.
      </span>
    </motion.article>
  )
}
