import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Chat } from '@/componentes/Chat'
import { momentos } from '@/content/momentos'
import { abrirSobreUnaVez, claveRecordada } from '@/lib/cripto'
import { conSeparador, MESES_ES, partesLocales } from '@/lib/tiempo'
import type { RecuerdoDelDia } from '@/types'

/**
 * UN DÍA COMO HOY
 *
 * Lo que se dijeron un 17 de agosto cualquiera, hace uno o dos años.
 * La fecha se calcula en horario de Nicaragua (nunca con la del
 * teléfono), así que el recuerdo cambia a medianoche allá y no a
 * medianoche de donde esté ella.
 *
 * Los mensajes vienen del archivo cifrado del mes — uno por mes, para
 * no bajar los 366 días en la portada — y los eligió un script, no
 * nosotros: ver scripts/preparar-dia-como-hoy.mjs.
 */

/** Lo que trae el archivo del mes: cada día con sus años. */
type Sobre = Record<string, RecuerdoDelDia[]>

const CUANTOS_ANIOS = ['este mismo año', 'hace un año', 'hace dos años', 'hace tres años']

function haceCuanto(anios: number): string {
  return CUANTOS_ANIOS[anios] ?? `hace ${anios} años`
}

export function UnDiaComoHoy() {
  const hoy = partesLocales(new Date())
  const mes = String(hoy.mes).padStart(2, '0')
  const llave = `${mes}-${String(hoy.dia).padStart(2, '0')}`

  const [recuerdos, setRecuerdos] = useState<RecuerdoDelDia[] | null>(null)
  const [elegido, setElegido] = useState(0)
  const [fallo, setFallo] = useState(false)

  useEffect(() => {
    const clave = claveRecordada()
    if (!clave) {
      setFallo(true)
      return
    }

    let vigente = true

    abrirSobreUnaVez<Sobre>(`dia-como-hoy-${mes}`, clave)
      .then((sobre) => {
        if (vigente) setRecuerdos(sobre[llave] ?? [])
      })
      .catch(() => {
        if (vigente) setFallo(true)
      })

    return () => {
      vigente = false
    }
  }, [mes, llave])

  // No abrió el archivo, o hoy no hay nada guardado: la portada sigue
  // como si esta sección no existiera. Un hueco con una disculpa se ve
  // peor que no tenerla.
  if (fallo || (recuerdos && recuerdos.length === 0)) {
    if (fallo && import.meta.env.DEV) {
      return (
        <p className="fuente-mano text-center text-hibisco">
          No pude abrir «dia-como-hoy-{mes}». ¿Corriste <code>npm run dia:preparar</code> y
          <code className="mx-1">npm run secretos:cifrar</code>?
        </p>
      )
    }
    return null
  }

  // Mientras descifra, un hueco de la altura aproximada para que la
  // portada no pegue un salto cuando aparezcan las burbujas.
  if (!recuerdos) {
    return (
      <div className="papel mx-auto w-full max-w-lg animate-pulse rounded-2xl opacity-40" style={{ height: 420 }} aria-hidden />
    )
  }

  const recuerdo = recuerdos[Math.min(elegido, recuerdos.length - 1)]
  const anio = Number(recuerdo.fecha.slice(0, 4))
  // ¿Ese mismo día es un momento de la línea del tiempo?
  const momento = momentos.find((m) => m.fecha === recuerdo.fecha && !m.borrador)

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px 0px' }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto w-full max-w-lg"
      aria-label="Un día como hoy"
    >
      <header className="mb-5 text-center">
        <p className="text-[0.68rem] uppercase tracking-[0.24em] text-texto-suave/70">
          un día como hoy
        </p>
        <h2 className="mt-2 font-display text-2xl sm:text-3xl">
          <span className="texto-degradado">
            {hoy.dia} de {MESES_ES[hoy.mes - 1]}
          </span>
        </h2>

        {/* Los años disponibles. Con uno solo no hay nada que elegir. */}
        {recuerdos.length > 1 && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {recuerdos.map((r, i) => {
              const suAnio = r.fecha.slice(0, 4)
              const activo = i === Math.min(elegido, recuerdos.length - 1)
              return (
                <button
                  key={r.fecha}
                  type="button"
                  onClick={() => setElegido(i)}
                  aria-pressed={activo}
                  className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                    activo
                      ? 'border-acento text-acento'
                      : 'border-borde text-texto-suave hover:border-acento/60'
                  }`}
                >
                  {suAnio}
                </button>
              )
            })}
          </div>
        )}
      </header>

      {/* La conversación cambia con el año elegido: la key hace que las
          burbujas vuelvan a entrar una por una en vez de reemplazarse. */}
      <Chat
        key={recuerdo.fecha}
        mensajes={recuerdo.mensajes}
        titulo={`${haceCuanto(hoy.anio - anio)} · ${conSeparador(recuerdo.total)} mensajes ese día`}
        fuente={recuerdo.fuente}
      />

      {momento && (
        <Link
          to={`/momento/${momento.id}`}
          className="papel mt-4 flex items-center gap-3 rounded-xl px-5 py-4 transition-colors hover:border-acento"
        >
          <span className="text-2xl">{momento.icono ?? '📖'}</span>
          <span>
            <span className="block text-[0.65rem] uppercase tracking-[0.2em] text-texto-suave/60">
              ese día pasó algo
            </span>
            <span className="fuente-mano block text-lg text-texto">{momento.titulo}</span>
          </span>
        </Link>
      )}
    </motion.section>
  )
}
