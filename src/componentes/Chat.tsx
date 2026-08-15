import { motion } from 'motion/react'
import type { Mensaje } from '@/types'

/**
 * Conversaciones reconstruidas.
 *
 * En vez de pegar la captura de pantalla, redibujamos el chat con
 * nuestra estética: se lee bien en cualquier teléfono, se puede
 * seleccionar el texto, y los mensajes aparecen uno a uno, como si se
 * estuvieran escribiendo otra vez.
 */
export function Chat({ mensajes, titulo }: { mensajes: Mensaje[]; titulo?: string }) {
  return (
    <section className="papel w-full rounded-2xl px-4 py-6 sm:px-6" aria-label={titulo ?? 'Conversación'}>
      {titulo && (
        <p className="mb-5 text-center text-[0.68rem] uppercase tracking-[0.24em] text-texto-suave/60">
          {titulo}
        </p>
      )}

      <ol className="space-y-2">
        {mensajes.map((m, i) => {
          const mio = m.de === 'osito'

          return (
            <motion.li
              key={i}
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{
                duration: 0.45,
                delay: Math.min(i * 0.09, 1.4),
                ease: [0.34, 1.56, 0.64, 1],
              }}
              className={`flex flex-col ${mio ? 'items-end' : 'items-start'}`}
            >
              {/* La cita del mensaje al que se responde */}
              {m.responde && (
                <div
                  className={`mb-1 max-w-[78%] border-l-2 border-borde px-3 py-1 text-xs leading-snug text-texto-suave/60 ${
                    mio ? 'text-right' : 'text-left'
                  }`}
                >
                  <span className="mb-0.5 block text-[0.6rem] uppercase tracking-[0.14em] text-texto-suave/45">
                    {mio ? 'respondiste' : 'te respondió'}
                  </span>
                  {m.responde}
                </div>
              )}

              <div className="relative">
                <div
                  className={`max-w-[80vw] rounded-2xl px-4 py-2.5 text-[0.95rem] leading-snug sm:max-w-md ${
                    mio
                      ? 'rounded-br-md bg-acento/85 text-fondo'
                      : 'rounded-bl-md bg-superficie-2 text-texto'
                  }`}
                >
                  {m.tipo && m.tipo !== 'texto' ? (
                    <span className="italic opacity-70">
                      {m.tipo === 'audio' && '🎤 nota de voz'}
                      {m.tipo === 'foto' && '📷 foto'}
                      {m.tipo === 'sticker' && '✨ sticker'}
                    </span>
                  ) : (
                    m.texto
                  )}
                </div>

                {/* Reacción pegada a la esquina de la burbuja */}
                {m.reaccion && (
                  <motion.span
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: Math.min(i * 0.09, 1.4) + 0.35, type: 'spring', stiffness: 400 }}
                    className={`absolute -bottom-2 rounded-full bg-fondo-2 px-1.5 py-0.5 text-xs shadow ${
                      mio ? 'left-1' : 'right-1'
                    }`}
                  >
                    {m.reaccion}
                  </motion.span>
                )}
              </div>

              {m.hora && (
                <span className="mt-1 px-1 text-[0.65rem] text-texto-suave/45">{m.hora}</span>
              )}
            </motion.li>
          )
        })}
      </ol>
    </section>
  )
}
