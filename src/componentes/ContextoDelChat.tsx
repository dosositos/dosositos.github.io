import { motion } from 'motion/react'
import type { ContextoDeFrase, FuenteChat, MensajeContexto } from '@/types'
import { MESES_ES } from '@/lib/tiempo'

/**
 * De dónde salió la frase.
 *
 * Se muestra después de responder, nunca antes: media gracia del juego
 * está en lo que venía pasando alrededor («¿Qué cenaste??» → «Ayote con
 * queso amor»), pero enseñarlo antes sería regalar la respuesta.
 *
 * Estas burbujas llegan del archivo cifrado, igual que la frase. En el
 * código no vive ni una palabra de la conversación.
 */

const FUENTES: Record<FuenteChat, string> = {
  instagram: '📷 Instagram',
  whatsapp: '💬 WhatsApp',
}

const SIN_TEXTO: Record<string, string> = {
  audio: '🎤 nota de voz',
  foto: '📷 foto',
  video: '🎬 video',
  sticker: '✨ sticker',
  reel: '🎞️ un reel',
}

/** '2025-04-30' → '30 de abril de 2025' */
function enPalabras(iso: string): string {
  const [anio, mes, dia] = iso.split('-')
  return `${Number(dia)} de ${MESES_ES[Number(mes) - 1]} de ${anio}`
}

function Burbuja({ mensaje, retraso }: { mensaje: MensajeContexto; retraso: number }) {
  const mio = mensaje.de === 'osito'
  const relleno = mensaje.tipo && mensaje.tipo !== 'texto' ? SIN_TEXTO[mensaje.tipo] : null

  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: retraso, ease: [0.22, 1, 0.36, 1] }}
      className={`flex flex-col ${mio ? 'items-end' : 'items-start'}`}
    >
      <div className="relative">
        <div
          className={`max-w-[76vw] whitespace-pre-line rounded-2xl px-3.5 py-2 text-[0.85rem] leading-snug sm:max-w-sm ${
            mio ? 'rounded-br-md bg-acento/85 text-fondo' : 'rounded-bl-md bg-superficie-2 text-texto'
          } ${
            mensaje.esLaFrase
              ? 'ring-2 ring-acento-2 ring-offset-2 ring-offset-superficie'
              : 'opacity-70'
          }`}
        >
          {relleno && <span className="italic opacity-70">{relleno}</span>}
          {relleno && mensaje.texto && ' '}
          {mensaje.texto}
        </div>

        {mensaje.reaccion && (
          <span
            className={`absolute -bottom-2 rounded-full bg-fondo-2 px-1.5 py-0.5 text-[0.65rem] shadow ${
              mio ? 'left-1' : 'right-1'
            }`}
          >
            {mensaje.reaccion}
          </span>
        )}
      </div>

      {mensaje.hora && (
        <span className="mt-0.5 px-1 text-[0.6rem] text-texto-suave/40">{mensaje.hora}</span>
      )}
    </motion.li>
  )
}

export function ContextoDelChat({
  contextos,
  titulo = 'de dónde salió',
}: {
  contextos: ContextoDeFrase[]
  titulo?: string
}) {
  if (contextos.length === 0) return null

  return (
    <div className="space-y-4">
      {contextos.map((contexto, i) => (
        <section key={i} className="papel rounded-2xl px-3 py-4 sm:px-5">
          <p className="mb-3 text-center text-[0.62rem] uppercase tracking-[0.2em] text-texto-suave/55">
            {/* Con dos contextos son "los dos": se rotula de quién es cada uno. */}
            {contextos.length > 1
              ? `una vez que lo dijo ${contexto.mensajes.find((m) => m.esLaFrase)?.de ?? 'osito'}`
              : titulo}
            <span className="mx-2 opacity-40">·</span>
            {enPalabras(contexto.fecha)}
            <span className="mx-2 opacity-40">·</span>
            <span className="whitespace-nowrap">{FUENTES[contexto.fuente]}</span>
          </p>

          <ol className="space-y-1.5">
            {contexto.mensajes.map((m, j) => (
              <Burbuja key={j} mensaje={m} retraso={Math.min(j * 0.06, 0.5)} />
            ))}
          </ol>
        </section>
      ))}
    </div>
  )
}
