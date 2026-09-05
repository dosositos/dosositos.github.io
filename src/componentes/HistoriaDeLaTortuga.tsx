import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { FECHAS } from '@/content/config'
import { HISTORIA } from '@/content/luna'
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
 * cada vez que se vuelve a empezar. Los cuadros se pasan tocando y no
 * solos: cada quien lee a su velocidad, y un cuento que se adelanta
 * antes de que lo terminen de leer es un cartel que se apura.
 *
 * ── El camino entero va en un canvas, y es a propósito ──────────
 * La tortuga, los tres peluches montados, el polvito que levanta y el
 * suelo se pintan en el mismo lienzo y en las mismas unidades del
 * juego. La primera versión tenía a la tortuga en un recuadro chiquito
 * y a los peluches al lado, en imágenes de HTML: ella movía las
 * paticas sin avanzar —o sea, corría en el sitio— y ellos flotaban en
 * el cielo sin llegar a subírsele nunca. Para que uno se trepe al
 * caparazón de otra, los dos tienen que estar dibujados en el mismo
 * sitio.
 *
 * Y es la tortuga de verdad: el mismo dibujo del juego, con la ropita
 * que traiga puesta. Si se le cambia el gorro en el ropero, se le
 * cambia también en el cuento.
 */

/** El aumento con el que se estira el dibujo. Ella mide 50 de alto. */
const AUMENTO = 1.6

/** Lo alto de la franja por donde camina, en unidades del juego. */
const ALTO = 96

/** A qué altura de esa franja le quedan las paticas. */
const SUELO = ALTO - 16

/**
 * Lo que camina por segundo, en unidades.
 *
 * Menos que en el juego, donde va a 55. Allá la pantalla la sigue y el
 * mundo mide 360 de ancho; acá cruza un cuadro quieto, y a la
 * velocidad del juego parecía que iba corriendo. Es una tortuga.
 */
const VELOCIDAD = 26

/** Cuánto dura el pasito suelto, el del cuadro en que dice que sí. */
const MS_DEL_PASITO = 1100

/** Y cuánto tarda un peluche en treparse al caparazón. */
const MS_DE_TREPAR = 850

/** En qué orden se le suben. Es el orden en que llegaron a la casa. */
const LOS_TRES = ['boo', 'ovi', 'nico']

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
  const texto = esElUltimo && nombre ? conNombre(HISTORIA.ultimoConNombre, nombre) : cuadro.texto
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
      <Estrellas />

      <Luna lejania={cuadro.luna} sinMovimiento={!!sinMovimiento} />

      <EsperandoArriba cuantos={cuadro.esperan} sinMovimiento={!!sinMovimiento} />

      {/* ── El camino ─────────────────────────────────────────────
          Ocupa el ancho entero de la pantalla, con la luna arriba y la
          línea del cuadro abajo. Es lo único a lo ancho del todo: es
          por donde anda. */}
      <div className="absolute inset-x-0 top-[44%]">
        <ElCamino cuadro={cuadro} sinMovimiento={!!sinMovimiento} />
      </div>

      {/* ── El título, chiquito y arriba ───────────────────────────
          Por debajo de los botones de la casa y del tema, que van
          fijos arriba a la derecha en toda la web y también aquí. */}
      <p className="absolute inset-x-0 top-24 text-center text-[0.68rem] uppercase tracking-[0.34em] text-margarita/35">
        {HISTORIA.titulo}
      </p>

      {/* ── La línea del cuadro ─────────────────────────────────── */}
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
          Abajo a la izquierda: arriba a la derecha están los botones de
          la casa y del tema, que van fijos en toda la web.

          Con su propio `stopPropagation`: sin él, tocarlo cuenta además
          como tocar la pantalla y adelanta un cuadro por debajo. */}
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
 * EL CAMINO
 *
 * La tortuga andando, el polvito que levanta y los que se le van
 * subiendo al caparazón, todo en el mismo canvas.
 *
 * Va a lo ancho de la pantalla entera para que caminar se vea. En un
 * recuadro de dos dedos, mover las paticas sin avanzar se lee como
 * correr en el sitio, que es justo lo que no es.
 */
function ElCamino({
  cuadro,
  sinMovimiento,
}: {
  cuadro: CuadroDeLaHistoria
  sinMovimiento: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  /*
   * El cuadro entra por una referencia y no por las dependencias del
   * efecto. El bucle se monta una sola vez: naciendo de nuevo en cada
   * línea del cuento, la tortuga volvería de un salto al principio del
   * camino y los que ya se le habían subido se le caerían.
   */
  const cuadroRef = useRef(cuadro)
  cuadroRef.current = cuadro

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const puesto = loPuesto(leerProgreso())

    /* Los retratos, pedidos una vez. Mientras no lleguen no se dibujan
       y no pasa nada: son tres archivos del propio bundle. */
    const retratos = new Map<string, HTMLImageElement>()
    for (const id of LOS_TRES) {
      const url = RETRATOS[id]
      if (!url) continue
      const img = new Image()
      img.src = url
      retratos.set(id, img)
    }

    let ancho = 0
    let densidad = 1

    const medir = () => {
      const anchoCss = canvas.clientWidth || window.innerWidth
      densidad = Math.min(window.devicePixelRatio || 1, 2)
      ancho = anchoCss / AUMENTO
      canvas.width = Math.round(ancho * AUMENTO * densidad)
      canvas.height = Math.round(ALTO * AUMENTO * densidad)
    }

    medir()

    /** Por dónde va, en unidades. Entra por la izquierda del cuadro. */
    let x = ancho * 0.28

    /** Lo caminado, que es lo que mueve las paticas. */
    let caminado = 0

    /** Lo que le queda del pasito suelto, en milisegundos. */
    let pasitoMs = 0

    /** Qué hacía en el cuadro anterior, para notar cuándo cambia. */
    let antes: CuadroDeLaHistoria['tortuga'] = 'mirando'

    /** Cuántos llevaba encima, para animar solo al que se está subiendo. */
    let encimaAntes = 0

    /** Cuánto lleva trepando el último, de 0 (en el suelo) a 1 (montado). */
    let trepando = 1

    /**
     * El polvito del camino. Le sale de las paticas y se queda atrás,
     * y es la mitad de lo que hace que caminar se vea: sin algo que se
     * quede quieto mientras ella avanza, avanzar no se nota.
     */
    const polvo: { x: number; y: number; vida: number; r: number }[] = []
    let paraElSiguiente = 0

    let cuadroPedido = 0
    let anterior = performance.now()
    const nacio = anterior

    const pintar = (ahora: number) => {
      const paso = Math.min(0.05, (ahora - anterior) / 1000)
      anterior = ahora

      const c = cuadroRef.current

      /* ── Lo que hace ella ──────────────────────────────────── */

      if (c.tortuga !== antes) {
        // Al entrar en el cuadro del pasito, arranca el pasito.
        if (c.tortuga === 'pasito') pasitoMs = MS_DEL_PASITO
        antes = c.tortuga
      }

      if (c.encima !== encimaAntes) {
        // Se subió uno más: que se lo vea treparse.
        if (c.encima > encimaAntes) trepando = 0
        encimaAntes = c.encima
      }
      if (trepando < 1) trepando = Math.min(1, trepando + (paso * 1000) / MS_DE_TREPAR)

      let andando = c.tortuga === 'caminando'
      if (pasitoMs > 0) {
        pasitoMs = Math.max(0, pasitoMs - paso * 1000)
        andando = true
      }

      if (andando && !sinMovimiento) {
        const avance = VELOCIDAD * paso
        x += avance
        caminado += avance
        // Al salirse por la derecha vuelve a entrar por la izquierda.
        // No es un truco de dibujo: es que ella sigue caminando y el
        // cuadro se queda donde está, que es de lo que habla el cuento.
        if (x > ancho + 34) x = -34

        paraElSiguiente -= paso
        if (paraElSiguiente <= 0) {
          // Desparejo a propósito, en el cuándo y en el dónde. A
          // intervalos fijos y todos a la misma altura salía una fila
          // de puntos igualitos, que no parece polvo: parece una línea
          // de puntos suspensivos siguiéndola.
          paraElSiguiente = 0.1 + Math.random() * 0.14
          polvo.push({
            x: x - 8 - Math.random() * 5,
            y: SUELO - 1 - Math.random() * 4,
            vida: 0.7 + Math.random() * 0.5,
            r: 0.6 + Math.random() * 1.3,
          })
        }
      }

      for (const p of polvo) {
        p.vida -= paso * 0.5
        // Sube y se abre un poco, como el polvo de verdad.
        p.y -= paso * 3
        p.r += paso * 0.6
      }
      while (polvo.length && polvo[0].vida <= 0) polvo.shift()

      /* ── Y a pintarlo ──────────────────────────────────────── */

      ctx.setTransform(densidad * AUMENTO, 0, 0, densidad * AUMENTO, 0, 0)
      ctx.clearRect(0, 0, ancho, ALTO)

      // El suelo: una raya muy floja que se apaga en las orillas. Le da
      // algo por donde ir sin llegar a ser un decorado, y es contra lo
      // que se mide que está avanzando.
      const raya = ctx.createLinearGradient(0, 0, ancho, 0)
      raya.addColorStop(0, 'rgba(245, 244, 232, 0)')
      raya.addColorStop(0.5, 'rgba(245, 244, 232, 0.16)')
      raya.addColorStop(1, 'rgba(245, 244, 232, 0)')
      ctx.fillStyle = raya
      ctx.fillRect(0, SUELO + 1, ancho, 0.8)

      for (const p of polvo) {
        ctx.globalAlpha = Math.max(0, p.vida) * 0.32
        ctx.fillStyle = '#f5f4e8'
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      const escena = escenaDeVitrina((ahora - nacio) / 1000)
      escena.x = x
      escena.y = SUELO
      escena.caminado = caminado

      // La sombra. Sin ella se ve flotando en un cuadro negro en vez de
      // andando por algún sitio.
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
      ctx.beginPath()
      ctx.ellipse(escena.x, escena.y + 1.5, 16, 4, 0, 0, Math.PI * 2)
      ctx.fill()

      dibujarTortuga(ctx, escena, undefined, puesto)

      // Y los que van montados, apoyados en el caparazón.
      //
      // Los números salen de dónde le queda el caparazón, que no es
      // donde uno diría: ella va parada en dos patas y mirando a la
      // derecha, así que el caparazón le queda **a la espalda y en
      // alto**, unas 47 unidades por encima de las paticas y una
      // docena hacia atrás. Puestos en el medio de ella se le sentaban
      // en la barriga y le tapaban la cara.
      //
      // Se dibujan después que ella para que se les vea encima y no
      // metidos debajo del caparazón.
      for (let i = 0; i < c.encima; i += 1) {
        const img = retratos.get(LOS_TRES[i])
        if (!img?.complete || img.naturalWidth === 0) continue

        // Chiquitos y amontonados: en el caparazón de una tortuga no
        // caben tres peluches en fila, y verlos apretujados es
        // justamente el chiste.
        const lado = 15
        const suX = escena.x - 26 + i * 9
        const suY = escena.y - 60

        // El último puede venir subiendo todavía: sale del suelo y se
        // acomoda arriba. Los que ya estaban ni se enteran.
        const suyo = i === c.encima - 1 ? trepando : 1
        const suave = 1 - (1 - suyo) * (1 - suyo)
        const y = suY + (1 - suave) * 58

        ctx.globalAlpha = suave
        ctx.drawImage(img, suX - lado / 2, y, lado, lado)
        ctx.globalAlpha = 1
      }

      cuadroPedido = requestAnimationFrame(pintar)
    }

    cuadroPedido = requestAnimationFrame(pintar)
    window.addEventListener('resize', medir)

    return () => {
      cancelAnimationFrame(cuadroPedido)
      window.removeEventListener('resize', medir)
    }
  }, [sinMovimiento])

  return (
    <canvas ref={canvasRef} aria-hidden className="block w-full" style={{ height: ALTO * AUMENTO }} />
  )
}

/**
 * LOS QUE ESPERAN ARRIBA
 *
 * Antes de que se le suban al caparazón se los ve allá arriba, cada
 * uno a su altura y bamboleándose despacio. Se asoman de a uno.
 *
 * Están aparte del camino porque no están en el camino: es lo que el
 * juego hace y lo que el cuento tenía mal. Cada peluche se gana
 * subiendo su capítulo, así que arrancar con los tres montados le
 * estaría contando un final que todavía no jugó.
 */
function EsperandoArriba({ cuantos, sinMovimiento }: { cuantos: number; sinMovimiento: boolean }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <AnimatePresence>
        {LOS_TRES.slice(0, cuantos).map((id, i) =>
          RETRATOS[id] ? (
            <motion.img
              key={id}
              src={RETRATOS[id]}
              alt=""
              initial={sinMovimiento ? { opacity: 0 } : { opacity: 0, scale: 0.4, y: 14 }}
              animate={sinMovimiento ? { opacity: 1 } : { opacity: 1, scale: 1, y: [0, -7, 0] }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={
                sinMovimiento
                  ? { duration: 0.4 }
                  : {
                      opacity: { duration: 0.7, delay: i * 0.3 },
                      scale: { duration: 0.7, delay: i * 0.3, ease: [0.34, 1.56, 0.64, 1] },
                      // El bamboleo es lo que los mantiene vivos
                      // mientras esperan, y cada uno al suyo: al mismo
                      // ritmo suben y bajan como un solo bloque y se
                      // ven pegados a un carrusel.
                      y: { duration: 3.4 + i * 0.7, repeat: Infinity, ease: 'easeInOut' },
                    }
              }
              className="absolute h-11 w-11 object-contain drop-shadow-[0_0_12px_rgba(245,244,232,0.2)]"
              style={{ left: SITIOS[i].izquierda, top: SITIOS[i].arriba }}
            />
          ) : null,
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * Dónde espera cada uno. A distinta altura: cada uno en su mundo.
 *
 * Los tres van fuera de la luna, y el tercero es el que lo pide: en el
 * medio y arriba le quedaba sentado justo encima del disco, y lo que
 * se leía es que ese ya llegó. Están esperándola en el camino, que es
 * lo contrario.
 */
const SITIOS = [
  { izquierda: '16%', arriba: '37%' },
  { izquierda: '77%', arriba: '31%' },
  { izquierda: '22%', arriba: '17%' },
]

/** La luna, que sube de un cuadro al otro y nunca se deja alcanzar. */
function Luna({ lejania, sinMovimiento }: { lejania: number; sinMovimiento: boolean }) {
  return (
    <motion.div
      aria-hidden
      className="absolute left-1/2 rounded-full"
      style={{
        background: 'radial-gradient(circle at 34% 30%, #fdfbf0, #f0ead2 52%, #cfc6a8 100%)',
        boxShadow: '0 0 40px rgb(245 244 232 / 0.28)',
      }}
      initial={false}
      animate={{
        width: 44 + lejania * 150,
        height: 44 + lejania * 150,
        // La banda va de 26 % a 16 %: arriba del todo está el título, y
        // la luna grande de los últimos cuadros se le montaba encima.
        top: `${26 - lejania * 10}%`,
        x: '-50%',
      }}
      transition={{ duration: sinMovimiento ? 0 : 2.2, ease: [0.16, 1, 0.3, 1] }}
    />
  )
}

/**
 * Las estrellas del fondo, sembradas de una vez con una cuenta y no
 * con `Math.random`: así el cielo del cuento es el mismo cada vez y no
 * pega saltos de un cuadro a otro. Es la misma manera que usa el cielo
 * del juego, por lo mismo.
 */
const ESTRELLAS = (() => {
  const sembradas: { x: number; y: number; r: number; brillo: number; tarda: number }[] = []
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
      tarda: 2.4 + siguiente() * 4,
    })
  }
  return sembradas
})()

function Estrellas() {
  return (
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
            // Titilan, cada una a su ritmo y con su retraso. Es el
            // mismo `parpadeo-estrella` del cielo de toda la web, y va
            // en línea por lo mismo que allá: cada estrella necesita su
            // duración. Sin esto el cielo es un fondo con puntos
            // pegados, y entre una línea y la siguiente del cuento no
            // se mueve absolutamente nada.
            animation: `parpadeo-estrella ${e.tarda}s ease-in-out ${-e.tarda * ((i % 7) / 7)}s infinite`,
          }}
        />
      ))}
    </div>
  )
}
