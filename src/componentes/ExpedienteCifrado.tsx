import { motion } from 'motion/react'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { abrirSobreUnaVez, claveRecordada } from '@/lib/cripto'
import { MESES_ES } from '@/lib/tiempo'
import type { DiccionarioGuardado, ExpedienteDePalabra, MensajeContexto } from '@/types'

/**
 * LO QUE EL DICCIONARIO NO PUEDE DECIR EN CLARO.
 *
 * En `src/content/diccionario.ts` está la ficha: la palabra, la
 * categoría y la definición, que son la voz del que cuenta. Todo lo que
 * es cita textual —el pedazo de chat donde nació cada palabra, y el
 * título de las tres entradas que son una frase entera— vive cifrado en
 * public/cifrado/diccionario.enc y se abre acá, en el teléfono, con la
 * misma frase de la puerta.
 *
 * El sobre se abre una sola vez para todo el libro: `abrirSobreUnaVez`
 * guarda la promesa, así que aunque haya diez hojas montadas a la vez,
 * el descifrado ocurre una.
 */

const Contexto = createContext<DiccionarioGuardado | null>(null)

export function ProveedorDiccionario({ children }: { children: ReactNode }) {
  const [datos, setDatos] = useState<DiccionarioGuardado | null>(null)

  useEffect(() => {
    const clave = claveRecordada()
    if (!clave) return
    let vigente = true
    abrirSobreUnaVez<DiccionarioGuardado>('diccionario', clave)
      .then((d) => {
        if (vigente) setDatos(d)
      })
      .catch(() => {
        // Sin sobre, el libro se lee igual: solo se queda sin los
        // pedazos de conversación.
      })
    return () => {
      vigente = false
    }
  }, [])

  return <Contexto.Provider value={datos}>{children}</Contexto.Provider>
}

export function useExpediente(id: string): ExpedienteDePalabra | null {
  const datos = useContext(Contexto)
  return datos?.entradas?.[id] ?? null
}

/* ── El título, cuando el título es una frase suya ──────────────── */

export function LemaCifrado({ id, mientras }: { id: string; mientras: string }) {
  const exp = useExpediente(id)
  if (!exp?.lema) return <>{mientras}</>
  return <>«{exp.lema}»</>
}

/* ── La curva de uso ────────────────────────────────────────────
   Cuántas veces al mes se dijo la palabra, desde que nació hasta
   hoy. Es la que cuenta si una palabra prendió de golpe, si se fue
   apagando o si sigue viva. */

function nombreMes(iso: string): string {
  const [anio, mes] = iso.split('-')
  return `${MESES_ES[Number(mes) - 1]?.slice(0, 3)} ${anio.slice(2)}`
}

export function CurvaDeUso({
  id,
  /** 'veces' es cuántas veces se dijo; 'largo', cuánto medía. */
  mide = 'veces',
  alto = 42,
  titulo,
}: {
  id: string
  mide?: 'veces' | 'largo'
  alto?: number
  titulo?: string
}) {
  const exp = useExpediente(id)
  if (!exp || exp.serie.length < 3) return null

  const serie = exp.serie
  const valor = (m: (typeof serie)[number]) => (mide === 'largo' ? m.largo : m.veces)
  const tope = Math.max(...serie.map(valor))
  if (!tope) return null

  const pico = serie.reduce((a, b) => (valor(a) >= valor(b) ? a : b))
  const ancho = 100
  const paso = ancho / serie.length

  return (
    <div className="mt-3">
      {titulo && <p className="palabra-guia mb-1">{titulo}</p>}
      <svg
        viewBox={`0 0 ${ancho} ${alto}`}
        preserveAspectRatio="none"
        className="block w-full"
        style={{ height: alto }}
        role="img"
        aria-label={`Uso mes a mes: del ${nombreMes(serie[0]!.mes)} al ${nombreMes(serie.at(-1)!.mes)}, con el máximo en ${nombreMes(pico.mes)}`}
      >
        {/* La línea del suelo */}
        <line x1="0" y1={alto - 0.5} x2={ancho} y2={alto - 0.5} stroke="rgb(120 90 55 / 0.35)" strokeWidth="0.5" />
        {serie.map((m, i) => {
          const h = Math.max(1.2, (valor(m) / tope) * (alto - 6))
          const esPico = m.mes === pico.mes
          return (
            <motion.rect
              key={m.mes}
              initial={{ height: 0, y: alto - 1 }}
              animate={{ height: h, y: alto - 1 - h }}
              transition={{ duration: 0.5, delay: Math.min(0.4, i * 0.018), ease: [0.22, 1, 0.36, 1] }}
              x={i * paso + paso * 0.18}
              width={paso * 0.64}
              rx={paso * 0.2}
              fill={esPico ? 'var(--color-tinta-roja)' : 'rgb(90 70 45 / 0.55)'}
            />
          )
        })}
      </svg>
      <div className="mt-0.5 flex justify-between text-[0.58rem] text-[var(--color-tinta-suave)]">
        <span>{nombreMes(serie[0]!.mes)}</span>
        <span className="text-[var(--color-tinta-roja)]">
          {nombreMes(pico.mes)}
          {mide === 'largo' ? ` · ${pico.largo} caracteres` : ` · ${pico.veces}`}
        </span>
        <span>{nombreMes(serie.at(-1)!.mes)}</span>
      </div>
    </div>
  )
}

/* ── Dónde nació la palabra ─────────────────────────────────────
   Las burbujas de aquella conversación, con la que estrena la
   palabra resaltada. Son las de verdad: llegan cifradas. */

const SIN_TEXTO: Record<string, string> = {
  audio: '🎤 nota de voz',
  foto: '📷 foto',
  video: '🎬 video',
  sticker: '✨ sticker',
  reel: '🎞️ un reel',
}

function Burbuja({ mensaje, retraso }: { mensaje: MensajeContexto; retraso: number }) {
  const suyo = mensaje.de === 'osito'
  const relleno = mensaje.tipo && mensaje.tipo !== 'texto' ? SIN_TEXTO[mensaje.tipo] : null

  return (
    <motion.li
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: retraso, ease: [0.22, 1, 0.36, 1] }}
      className={`flex ${suyo ? 'justify-end' : 'justify-start'}`}
    >
      <span
        className={`max-w-[86%] whitespace-pre-line rounded-xl px-2.5 py-1.5 text-[0.74rem] leading-snug ${
          suyo
            ? 'rounded-br-sm bg-[rgb(44_74_124/0.14)] text-[#22364f]'
            : 'rounded-bl-sm bg-[rgb(184_70_92/0.14)] text-[#5c2233]'
        } ${
          mensaje.esLaFrase
            ? 'font-semibold shadow-[0_0_0_1.5px_rgb(156_54_38/0.55)]'
            : 'opacity-70'
        }`}
      >
        {relleno && <em className="opacity-70">{relleno}</em>}
        {relleno && mensaje.texto && ' '}
        {mensaje.texto}
      </span>
    </motion.li>
  )
}

export function DondeNacio({ id }: { id: string }) {
  const exp = useExpediente(id)
  if (!exp) return null

  const { fecha, fuente, mensajes } = exp.nacimiento
  const [anio, mes, dia] = fecha.split('-')

  return (
    <div>
      <p className="palabra-guia mb-2">
        {Number(dia)} de {MESES_ES[Number(mes) - 1]} de {anio} ·{' '}
        {fuente === 'instagram' ? 'Instagram' : 'WhatsApp'}
      </p>
      <ul className="space-y-1.5">
        {mensajes.map((m, i) => (
          <Burbuja key={`${m.de}-${i}-${m.texto.slice(0, 12)}`} mensaje={m} retraso={i * 0.05} />
        ))}
      </ul>
    </div>
  )
}

/** Para la ficha: el largo real del mensaje del que salió el título. */
export function LargoDelLema({ id }: { id: string }) {
  const exp = useExpediente(id)
  if (!exp?.lemaLargo) return null
  return <>{exp.lemaLargo.toLocaleString('es-NI')}</>
}
