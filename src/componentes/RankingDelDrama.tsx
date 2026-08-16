import { motion } from 'motion/react'
import { chisteDelDrama, emojisDelDrama } from '@/content/estadisticas'

/**
 * El ranking del drama.
 *
 * Sale del recuento real del chat: los seis emojis que más usamos son
 * casi todos de puchero. El chiste se sostiene solo; lo único que hace
 * falta es rematarlo con el dato de la racha, que le da la vuelta.
 */
export function RankingDelDrama() {
  const maximo = emojisDelDrama[0].veces

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="papel w-full rounded-2xl px-6 py-8 sm:px-8"
    >
      <header className="text-center">
        <p className="text-[0.68rem] uppercase tracking-[0.24em] text-texto-suave/70">
          ahora somos más de stickers
        </p>
        <h2 className="mt-3 font-display text-2xl text-texto">{chisteDelDrama.titulo}</h2>
      </header>

      <ul className="mt-8 space-y-3">
        {emojisDelDrama.map((e, i) => (
          <li key={e.emoji} className="flex items-center gap-3">
            <span className="w-8 shrink-0 text-center text-2xl">{e.emoji}</span>

            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-fondo-2">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${(e.veces / maximo) * 100}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.15 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="h-full rounded-full bg-acento/70"
              />
            </div>

            <span className="w-12 shrink-0 text-right text-sm tabular-nums text-texto-suave">
              {e.veces}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-8 space-y-3 text-center">
        <p className="text-sm leading-relaxed text-texto-suave">{chisteDelDrama.explicacion}</p>
        <p className="pt-3 font-display text-lg leading-snug text-texto">
        </p>
      </div>
    </motion.section>
  )
}
