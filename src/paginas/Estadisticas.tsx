import { animate, motion, useInView, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { RankingDelDrama } from '@/componentes/RankingDelDrama'
import { OSITA, OSITO } from '@/content/config'
import { CORTE, instagram, numeros, totales } from '@/content/estadisticas'
import { conSeparador, fechaLarga } from '@/lib/tiempo'
import { useTrazo } from '@/lib/trazo'

/**
 * El wrapped: nuestro chat en números.
 *
 * Todo sale de `npm run chat:parsear`. Son una foto fija, y la página
 * lo dice claramente arriba: no pretendemos estar al día.
 */

/** Lo que tarda una cifra en contar desde cero hasta la de verdad. */
const DURACION_CUENTA = 1.4

/**
 * Un número que cuenta hacia arriba la primera vez que entra en pantalla.
 *
 * La cifra final va escondida debajo y es la que da el ancho: así la
 * tarjeta no baila mientras los dígitos cambian. Con movimiento reducido
 * aparece la final de una, sin contar.
 */
function Cuenta({ valor, retraso = 0 }: { valor: number; retraso?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const visto = useInView(ref, { once: true, margin: '-40px 0px' })
  const reducido = useReducedMotion()
  const [actual, setActual] = useState(reducido ? valor : 0)

  useEffect(() => {
    if (!visto || reducido) {
      if (reducido) setActual(valor)
      return
    }
    const control = animate(0, valor, {
      duration: DURACION_CUENTA,
      delay: retraso,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (n) => setActual(Math.round(n)),
    })
    return () => control.stop()
  }, [visto, reducido, valor, retraso])

  return (
    <span ref={ref} className="inline-grid tabular-nums">
      <span aria-hidden className="invisible col-start-1 row-start-1">
        {conSeparador(valor)}
      </span>
      <span className="col-start-1 row-start-1">{conSeparador(actual)}</span>
    </span>
  )
}

/**
 * La cifra más grande de la página se resalta con marcador, cuando ya
 * terminó de contar.
 */
function Resaltada({ children, retraso }: { children: ReactNode; retraso: number }) {
  const resaltado = useTrazo<HTMLSpanElement>({
    tipo: 'highlight',
    // Violeta de tulipán: la cifra ya va en el color del acento, y un
    // marcador del mismo tono quedaba como una mancha sucia detrás.
    color: '--color-tulipan-violeta',
    opacidad: 0.3,
    vueltas: 1,
    relleno: [0, 6],
    duracion: 700,
    retraso: (DURACION_CUENTA + retraso) * 1000 + 200,
  })
  return (
    <span ref={resaltado} className="inline-block">
      {children}
    </span>
  )
}

function Cifra({
  numero,
  etiqueta,
  detalle,
  retraso = 0,
  resaltada = false,
}: {
  /** Un número cuenta hacia arriba; un texto (la hora) se queda quieto. */
  numero: number | string
  etiqueta: string
  detalle?: string
  retraso?: number
  resaltada?: boolean
}) {
  const cifra = typeof numero === 'number' ? <Cuenta valor={numero} retraso={retraso} /> : numero
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px 0px' }}
      transition={{ duration: 0.7, delay: retraso, ease: [0.22, 1, 0.36, 1] }}
      className="papel rounded-2xl px-5 py-7 text-center"
    >
      <div className="font-display text-4xl leading-none text-acento sm:text-5xl">
        {resaltada ? <Resaltada retraso={retraso}>{cifra}</Resaltada> : cifra}
      </div>
      <div className="mt-3 text-xs uppercase tracking-[0.16em] text-texto-suave">{etiqueta}</div>
      {detalle && <div className="fuente-mano mt-2 text-base text-texto-suave/80">{detalle}</div>}
    </motion.div>
  )
}

/** Barra comparativa entre los dos. */
function Duelo({
  titulo,
  osito,
  osita,
  sufijo = '',
}: {
  titulo: string
  osito: number
  osita: number
  sufijo?: string
}) {
  const total = osito + osita
  const porcentajeOsito = (osito / total) * 100
  // La cifra del que gana va encerrada en un círculo, cuando la barra ya
  // terminó de llenarse.
  const trazoOsito = useTrazo<HTMLElement>({ tipo: 'circle', relleno: [2, 5], retraso: 1300, activo: osito > osita })
  const trazoOsita = useTrazo<HTMLElement>({ tipo: 'circle', relleno: [2, 5], retraso: 1300, activo: osita > osito })

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-40px 0px' }}
      transition={{ duration: 0.7 }}
      className="papel rounded-2xl px-6 py-6"
    >
      <p className="mb-4 text-center text-xs uppercase tracking-[0.18em] text-texto-suave">
        {titulo}
      </p>

      {/* Los dos emojis van encima de la barra y no dentro de cada mitad:
          con un reparto extremo, la mitad chica no alcanzaba a cubrir el
          🐻 y se lo comía a la mitad. */}
      <div className="relative flex h-8 overflow-hidden rounded-full bg-fondo-2">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${porcentajeOsito}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="bg-[var(--color-oso-claro)]"
        />
        <div className="flex-1 bg-[var(--color-rosa-pastel)]" />
        <span aria-hidden className="absolute inset-y-0 left-3 flex items-center text-xs">
          🐻
        </span>
        <span aria-hidden className="absolute inset-y-0 right-3 flex items-center text-xs">
          🎀
        </span>
      </div>

      {/* Si los apodos y las cifras no caben en una línea, se acomodan en dos. */}
      <div className="mt-3 flex flex-wrap justify-between gap-x-4 gap-y-1 text-sm">
        <span className="text-texto-suave">
          {OSITO.apodo} · <strong ref={trazoOsito} className="inline-block text-texto">{conSeparador(osito)}</strong>
          {sufijo}
        </span>
        <span className="ms-auto text-texto-suave">
          <strong ref={trazoOsita} className="inline-block text-texto">{conSeparador(osita)}</strong>
          {sufijo} · {OSITA.apodo}
        </span>
      </div>
    </motion.div>
  )
}

export function Estadisticas() {
  const corte = new Date(`${CORTE}T12:00:00-06:00`)
  const inicio = new Date(`${numeros.desde}T12:00:00-06:00`)
  const inicioInstagram = new Date(`${instagram.desde}T12:00:00-06:00`)

  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-24 pt-20">
      <header className="mb-4 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-texto-suave/60">
          nuestro chat en números
        </p>
        <h1 className="mt-4 font-display text-4xl texto-degradado sm:text-5xl">
          lo que nos hemos dicho
        </h1>
      </header>

      {/* La honestidad del dato: hasta cuándo está contado */}
      <p className="mb-12 text-center text-sm text-texto-suave/70">
        contado desde el {fechaLarga(inicio)}, nuestro primer WhatsApp,
        <br className="hidden sm:block" /> hasta el {fechaLarga(corte)}
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Cifra
          numero={numeros.mensajes}
          etiqueta="mensajes escritos"
          detalle="sin contar fotos ni audios"
        />
        <Cifra
          numero={numeros.multimedia}
          etiqueta="fotos, audios y stickers"
          detalle="el chat es un museo de stickers"
          retraso={0.06}
        />
        <Cifra
          numero={numeros.palabras.osito + numeros.palabras.osita}
          etiqueta="palabras en total"
          resaltada
          detalle="más largo que muchos libros"
          retraso={0.12}
        />
        <Cifra
          numero={`${numeros.horaPico}:00`}
          etiqueta="nuestra hora"
          detalle="cuando más nos escribimos"
          retraso={0.18}
        />
      </div>

      <div className="mt-4 grid gap-4">
        <Duelo
          titulo="quién manda más mensajes"
          osito={numeros.mensajesPor.osito}
          osita={numeros.mensajesPor.osita}
        />
        <Duelo
          titulo="quién escribe más palabras  "
          osito={numeros.palabras.osito}
          osita={numeros.palabras.osita}
        />

        <Duelo
          titulo="quién dice más veces te amo"
          osito={numeros.teAmo.osito}
          osita={numeros.teAmo.osita}
        />
      </div>

      <div className="mt-4">
        <RankingDelDrama />
      </div>

      {/* ── Instagram: donde empezó todo, y donde viven los reels ── */}
      <section className="mt-16">
        <header className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-texto-suave/60">
            📷 y antes de todo eso
          </p>
          <h2 className="mt-3 font-display text-3xl texto-degradado">nuestro Instagram</h2>
          <p className="fuente-mano mx-auto mt-3 max-w-md text-lg text-texto-suave">
            «{instagram.primerMensaje.texto}», el {fechaLarga(inicioInstagram)} a las{' '}
            {instagram.primerMensaje.hora}. Cinco días antes del primer WhatsApp.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          <Cifra
            numero={instagram.mensajes}
            etiqueta="mensajes por Instagram"
            detalle={`${conSeparador(instagram.antesDeWhatsapp)} de ellos antes del primer WhatsApp`}
          />
          <Cifra
            numero={instagram.reels}
            etiqueta="reels que nos mandamos"
            detalle="casi nunca hablamos ahí; solo nos etiquetamos cosas"
            retraso={0.06}
          />
          <Cifra
            numero={instagram.corazones}
            etiqueta="corazones de reacción"
            detalle="el ❤️ pegado a la esquina del mensaje"
            retraso={0.12}
          />
          <Cifra
            numero={instagram.diaMasHablador.mensajes}
            etiqueta="mensajes en un solo día"
            detalle="el 28 de agosto de 2024, recién conociéndonos"
            retraso={0.18}
          />
        </div>

        <div className="mt-4">
          <Duelo
            titulo="quién manda más reels"
            osito={instagram.reelsPor.osito}
            osita={instagram.reelsPor.osita}
          />
        </div>
      </section>

      {/* ── Las dos apps sumadas ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px 0px' }}
        transition={{ duration: 0.8 }}
        className="papel resplandor-caja mt-12 rounded-2xl px-6 py-8 text-center"
      >
        <p className="text-xs uppercase tracking-[0.22em] text-texto-suave/60">
          las dos apps sumadas
        </p>
        <p className="mt-4 font-display text-5xl leading-none text-acento sm:text-6xl">
          <Cuenta valor={totales.mensajes} />
        </p>
        <p className="mt-3 text-sm uppercase tracking-[0.16em] text-texto-suave">
          mensajes escritos
        </p>
        <p className="fuente-mano mt-4 text-lg text-texto-suave/80">
          y {conSeparador(totales.palabras)} palabras, desde aquel «heey»
        </p>
      </motion.div>

      <p className="mt-12 text-center text-xs text-texto-suave/50">
        números al {fechaLarga(corte)} · se actualizan cuando volvamos a exportar el chat
      </p>
    </div>
  )
}
