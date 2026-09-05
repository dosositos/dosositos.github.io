import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { FECHAS } from '@/content/config'
import { HISTORIA, TORTUGA } from '@/content/luna'
import { conNombre } from '@/juego-luna/nombrar'
import { leerProgreso } from '@/juego-luna/progreso'
import { escenaDeVitrina, loPuesto } from '@/juego-luna/ropero'
import { dibujarTortuga } from '@/juego-luna/tortuga'
import { RETRATOS } from '@/lib/retratos'
import { desglosar, frasearDesglose } from '@/lib/tiempo'
import type { CuadroDeLaHistoria } from '@/types'

/**
 * POR QUÉ UNA TORTUGA
 *
 * Lo que el juego nunca explicaba: que la que sube sea el animal más
 * lento que hay no es un chiste, es el punto entero. «De aquí a la
 * luna a pasitos de tortuga» es una de sus medidas del infinito y es
 * la única que tiene camino; las otras son números y esta se anda.
 *
 * Sale antes de la escuelita la primera vez, y antes del capítulo uno
 * cada vez que se vuelve a empezar.
 *
 * Los cuadros se pasan tocando y no solos. Cada quien lee a su
 * velocidad, y un cuento que se adelanta antes de que lo terminen de
 * leer no es un cuento, es un cartel que se apura.
 *
 * El cielo es el mismo `#0b1026` del canvas del juego, la tortuga es
 * la de verdad —el mismo dibujo, con la ropita que traiga puesta— y
 * los peluches son sus retratos bordados. Nada de esto es una
 * ilustración aparte: si se le cambia el gorro en el ropero, se le
 * cambia también en el cuento.
 */

/** De qué tamaño se dibuja la tortuga del cuento, en píxeles de CSS. */
const RETRATO = { ancho: TORTUGA.alto * 2.6, alto: TORTUGA.alto * 1.7 }

/** El aumento con el que se estira ese dibujo en pantalla. */
const AUMENTO = 1.5

export function HistoriaDeLaTortuga({ alTerminar }: { alTerminar: () => void }) {
  const sinMovimiento = useReducedMotion()
  const [cual, setCual] = useState(0)
  const [seVe, setSeVe] = useState(false)

  const nombre = leerProgreso().nombre
  const cuadros = HISTORIA.cuadros
  const esElUltimo = cual === cuadros.length - 1
  const cuadro = cuadros[cual]

  /**
   * Cuánto llevan de conocerse, contado de verdad.
   *
   * Es la única cifra del cuento y es la que lo ancla: sin ella la
   * tortuga lleva caminando un rato inventado, y con ella lleva
   * caminando exactamente lo que llevan ellos dos.
   */
  const tiempo = frasearDesglose(desglosar(new Date(FECHAS.nosConocimos.fecha)))

  /*
   * El último cuadro es la bisagra. La primera vez termina en que
   * todavía no tiene nombre y de ahí se pasa a ponérselo; cuando ya lo
   * tiene, la nombra y sale a jugar. Decirle «todavía no tiene nombre»
   * a quien se lo puso hace tres meses es el juego olvidándose de ella.
   */
  const texto =
    esElUltimo && nombre ? conNombre(HISTORIA.ultimoConNombre, nombre) : cuadro.texto
  const leido = texto.replaceAll('{tiempo}', tiempo)

  /* El «tocá para seguir» entra tarde, para no apurar la lectura. */
  useEffect(() => {
    setSeVe(false)
    const t = window.setTimeout(() => setSeVe(true), 1800)
    return () => window.clearTimeout(t)
  }, [cual])

  const seguir = () => {
    if (esElUltimo) alTerminar()
    else setCual(cual + 1)
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={seguir}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') seguir()
      }}
      aria-label={HISTORIA.seguir}
      className="fixed inset-0 z-30 cursor-pointer overflow-hidden bg-[#0b1026] overscroll-none select-none"
    >
      <CieloDelCuento cuadro={cuadro} sinMovimiento={!!sinMovimiento} />

      {/* ── El título, chiquito y arriba ───────────────────────────
          Por debajo de los botones de la casa y del tema, que van
          fijos arriba a la derecha en toda la web y también aquí. A la
          altura del todo se le metían encima y el título se leía
          cortado por un emoji. */}
      <p className="absolute inset-x-0 top-24 text-center text-[0.68rem] uppercase tracking-[0.34em] text-margarita/35">
        {HISTORIA.titulo}
      </p>

      {/* ── La línea del cuadro ───────────────────────────────────
          Va en el tercio de abajo y no en el medio: en el medio le
          queda encima a la tortuga, que es lo que hay que mirar
          mientras se lee. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-28 px-8">
        <AnimatePresence mode="wait">
          <motion.p
            key={cual}
            initial={sinMovimiento ? { opacity: 0 } : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="fuente-mano mx-auto max-w-sm text-center text-2xl leading-snug text-margarita"
          >
            {leido}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* ── Tocá para seguir ──────────────────────────────────────── */}
      <p
        className={`pointer-events-none absolute inset-x-0 bottom-12 text-center text-xs tracking-wide text-margarita/40 transition-opacity duration-700 ${
          seVe ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {HISTORIA.seguir}
      </p>

      {/* ── Y saltar, para quien ya lo leyó ────────────────────────
          Abajo a la izquierda: arriba a la derecha están los botones
          de la casa y del tema, que van fijos en toda la web, y este
          quedaba debajo de ellos y sin poderse tocar.

          Con su propio `stopPropagation`: sin él, tocarlo cuenta
          además como tocar la pantalla y adelanta un cuadro por
          debajo. */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          alTerminar()
        }}
        className="absolute bottom-7 left-5 rounded-full border border-margarita/20 px-4 py-1.5 text-xs text-margarita/45 transition-colors hover:border-tulipan-amarillo/50 hover:text-tulipan-amarillo"
      >
        {HISTORIA.saltar}
      </button>
    </div>
  )
}

/**
 * El cielo del cuento: las estrellas, la luna a su altura y la tortuga
 * abajo con lo que lleve trepado al caparazón.
 *
 * La luna sube cuadro a cuadro pero **no llega**, y en el último baja
 * un poco. Es lo único que la animación tiene que decir sin palabras:
 * que se acercó todo lo que se puede acercar caminando, que es un
 * montón y no es llegar.
 */
function CieloDelCuento({
  cuadro,
  sinMovimiento,
}: {
  cuadro: CuadroDeLaHistoria
  sinMovimiento: boolean
}) {
  return (
    <>
      {/* Las estrellas del fondo, quietas y siempre las mismas. */}
      <div aria-hidden className="absolute inset-0">
        {ESTRELLAS.map((e, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-[#f5f4e8]"
            style={{
              left: `${e.x}%`,
              top: `${e.y}%`,
              width: e.r,
              height: e.r,
              opacity: e.brillo,
            }}
          />
        ))}
      </div>

      {/* ── La luna ────────────────────────────────────────────────
          Sube de un cuadro al otro. Lo que se mueve es su sitio y su
          tamaño, y las dos cosas salen del mismo número: cuanto más
          cerca, más abajo y más grande. */}
      <motion.div
        aria-hidden
        className="absolute left-1/2 rounded-full"
        style={{
          background: 'radial-gradient(circle at 34% 30%, #fdfbf0, #f0ead2 52%, #cfc6a8 100%)',
          boxShadow: '0 0 40px rgb(245 244 232 / 0.28)',
        }}
        initial={false}
        animate={{
          width: 44 + cuadro.luna * 150,
          height: 44 + cuadro.luna * 150,
          // La banda va de 26 % a 16 %, y no de 16 % a 8 %: arriba del
          // todo está el título, y la luna grande de los últimos
          // cuadros se le montaba encima y lo dejaba ilegible.
          top: `${26 - cuadro.luna * 10}%`,
          x: '-50%',
        }}
        transition={{ duration: sinMovimiento ? 0 : 2.2, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* ── Ella, abajo, con los que se le treparon ────────────────
          Van pegados al caparazón y no al lado: subirse encima es lo
          que la línea del cuadro está diciendo, y tres retratos
          flotando al costado no lo dicen. */}
      <div className="absolute inset-x-0 bottom-[38%] flex flex-col items-center">
        <div className="relative">
          <AnimatePresence>
            {cuadro.peluches > 0 ? (
              <motion.div
                initial={sinMovimiento ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9, ease: [0.34, 1.56, 0.64, 1] }}
                // Pegados a ella y solapando la coronilla, no flotando
                // en el cielo por encima: la línea del cuadro dice que
                // se le treparon al caparazón, y tres retratos con un
                // dedo de aire debajo dicen otra cosa. Amontonados
                // además, con el espacio en negativo: van los tres
                // encima de la misma tortuga, no en fila.
                className="absolute inset-x-0 -top-1 flex justify-center -space-x-1"
              >
                {LOS_TRES.slice(0, cuadro.peluches).map((id) =>
                  RETRATOS[id] ? (
                    <img key={id} src={RETRATOS[id]} alt="" className="h-9 w-9 object-contain" />
                  ) : null,
                )}
              </motion.div>
            ) : null}
          </AnimatePresence>

          <TortugaDelCuento camina={cuadro.camina} sinMovimiento={sinMovimiento} />
        </div>
      </div>
    </>
  )
}

/**
 * La tortuga del cuento, dibujada con el dibujo de verdad.
 *
 * Camina o se queda parada según el cuadro. Caminando no se desplaza
 * por la pantalla: mueve las paticas en su sitio. Es a propósito —
 * cruzar el cuadro de lado a lado diría que va para algún lado de
 * aquí, y para donde va es para arriba.
 */
function TortugaDelCuento({
  camina,
  sinMovimiento,
}: {
  camina: boolean
  sinMovimiento: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  /*
   * Igual que en el ropero: lo que cambia entra por una referencia y
   * no por las dependencias del efecto. El bucle se monta una sola vez
   * y cambiar de cuadro no puede volver el reloj a cero, que le pegaría
   * un tirón a la caminata en cada línea del cuento.
   */
  const caminaRef = useRef(camina)
  caminaRef.current = camina

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const densidad = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = RETRATO.ancho * densidad
    canvas.height = RETRATO.alto * densidad

    const puesto = loPuesto(leerProgreso())
    let cuadroPedido = 0
    let caminado = 0
    let anterior = performance.now()
    const nacio = anterior

    const pintar = (ahora: number) => {
      const paso = Math.min(0.05, (ahora - anterior) / 1000)
      anterior = ahora
      // Lo caminado es lo que da el ciclo de las paticas, y solo
      // avanza mientras el cuadro diga que camina. Parada, se queda
      // donde estaba en vez de volver a cero: así no pega un salto al
      // volver a arrancar.
      if (caminaRef.current && !sinMovimiento) caminado += TORTUGA.velocidad * paso

      ctx.setTransform(densidad, 0, 0, densidad, 0, 0)
      ctx.clearRect(0, 0, RETRATO.ancho, RETRATO.alto)

      const escena = escenaDeVitrina((ahora - nacio) / 1000)
      escena.x = RETRATO.ancho / 2
      escena.y = RETRATO.alto - 10
      escena.caminado = caminado

      // La sombra: sin ella se ve flotando en un cuadro negro en vez
      // de parada en algún sitio.
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
      ctx.beginPath()
      ctx.ellipse(escena.x, escena.y + 1.5, 16, 4, 0, 0, Math.PI * 2)
      ctx.fill()

      dibujarTortuga(ctx, escena, undefined, puesto)
      cuadroPedido = requestAnimationFrame(pintar)
    }

    cuadroPedido = requestAnimationFrame(pintar)
    return () => cancelAnimationFrame(cuadroPedido)
  }, [sinMovimiento])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      // Se dibuja en las unidades del mundo y se estira con CSS, igual
      // que en el ropero: el tamaño del cuadro no cambia el tamaño de
      // la tortuga.
      style={{ width: RETRATO.ancho * AUMENTO, height: RETRATO.alto * AUMENTO }}
    />
  )
}

/** En qué orden se le trepan. Es el orden en que llegaron. */
const LOS_TRES = ['boo', 'ovi', 'nico']

/**
 * Las estrellas del fondo, sembradas de una vez con una cuenta y no
 * con `Math.random`: así el cielo del cuento es el mismo cada vez y no
 * parpadea de un cuadro a otro. Es la misma manera que usa el cielo
 * del juego, por lo mismo.
 */
const ESTRELLAS = (() => {
  const sembradas: { x: number; y: number; r: number; brillo: number }[] = []
  let semilla = 24082026
  const siguiente = () => {
    semilla = (semilla * 1664525 + 1013904223) % 4294967296
    return semilla / 4294967296
  }
  for (let i = 0; i < 70; i += 1) {
    sembradas.push({
      x: siguiente() * 100,
      y: siguiente() * 78,
      r: 1 + siguiente() * 1.6,
      brillo: 0.18 + siguiente() * 0.5,
    })
  }
  return sembradas
})()
