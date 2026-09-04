import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { useNavigate } from 'react-router-dom'
import { ENTRADA_POR_LA_LUNA } from '@/content/luna'
import { ULTIMO_CAPITULO } from '@/juego-luna/mundos'
import { leerProgreso } from '@/juego-luna/progreso'
import { losTresYaEstan, suscribirseALosTres } from '@/lib/hallazgos'

/**
 * La luna de la portada — la puerta del juego de la tortuga.
 *
 * Es lo único en toda la web que apunta a `/luna`. Hasta que este
 * componente entró en la portada, el juego existía en el repositorio y
 * no existía para ella: se podía dejar a medias sin que se notara nada.
 *
 * Tres estados y ni uno más:
 *
 *  - **Cerrada.** Se ve, se hace notar y se puede tocar, pero no lleva a
 *    ningún lado: sale el aviso de que le faltan los tres peluches. Que
 *    se pueda tocar es el punto. El aviso es lo que convierte buscarlos
 *    en el camino a otra cosa, en vez de un juego suelto más.
 *  - **Abierta**, con los tres encontrados. Se enciende y lleva arriba.
 *  - **Llena**, cuando ya subió los tres capítulos. Más grande y más
 *    cálida, para releer la carta sin tener que jugar de nuevo.
 *
 * Y se abre **sin recargar**. Ella va a encontrar al tercero en esta
 * misma pantalla, con la luna ahí arriba; `lib/hallazgos.ts` avisa y la
 * luna se enciende en el momento. Ese momento sale gratis y es lo mejor
 * que tiene esta parte.
 */

/** Los cráteres, a mano. Son siempre los mismos, no hay nada que sortear. */
const CRATERES = [
  { x: 30, y: 30, lado: 15, opacidad: 0.13 },
  { x: 60, y: 22, lado: 9, opacidad: 0.1 },
  { x: 52, y: 58, lado: 20, opacidad: 0.11 },
  { x: 25, y: 66, lado: 10, opacidad: 0.09 },
  { x: 72, y: 48, lado: 7, opacidad: 0.12 },
]

/** Lo que tarda la cámara en tragarse la pantalla antes de entrar. */
const MS_DE_VIAJE = 780

/** Lo que se queda puesto el aviso de que le faltan los tres. */
const MS_DEL_AVISO = 6000

export function LunaDePortada() {
  const navigate = useNavigate()
  const sinMovimiento = useReducedMotion()
  const botonRef = useRef<HTMLButtonElement>(null)

  /*
   * `useSyncExternalStore` y no un `useState`: el que sabe si la luna
   * está abierta es `localStorage`, no React, y quien lo cambia es otro
   * componente. Esto es justo el caso para el que existe.
   */
  const abierta = useSyncExternalStore(suscribirseALosTres, losTresYaEstan, () => false)

  /** Si ya llegó arriba alguna vez. Se lee una sola vez, al montar. */
  const [llena] = useState(() => leerProgreso().capitulo >= ULTIMO_CAPITULO)

  /** El aviso de que le faltan los tres, cuando la toca cerrada. */
  const [avisando, setAvisando] = useState(false)

  /** De dónde sale el círculo que se come la pantalla, al entrar. */
  const [viaje, setViaje] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    if (!avisando) return
    const t = window.setTimeout(() => setAvisando(false), MS_DEL_AVISO)
    return () => window.clearTimeout(t)
  }, [avisando])

  const lado = llena ? 96 : 78

  function tocar() {
    if (!abierta) {
      setAvisando(true)
      return
    }

    // Con menos movimiento pedido no hay viaje: se entra y ya. Un
    // círculo creciendo hasta llenar la pantalla es exactamente lo que
    // esa preferencia está pidiendo que no pase.
    if (sinMovimiento) {
      navigate('/luna')
      return
    }

    const caja = botonRef.current?.getBoundingClientRect()
    setViaje({
      x: caja ? caja.left + caja.width / 2 : window.innerWidth / 2,
      y: caja ? caja.top + caja.height / 2 : window.innerHeight / 3,
    })
    window.setTimeout(() => navigate('/luna'), MS_DE_VIAJE)
  }

  return (
    /* En el flujo y no colgada del encabezado. Colgada quedaba bonita
       hasta el día en que se apague el regalo de la portada: sin él, el
       encabezado sube y la luna se le monta al botón del tema, que va
       fijo arriba a la derecha. Con su propia franja no depende de lo
       que haya encima. */
    <div className="relative z-20 flex flex-col items-center">
      <button
        ref={botonRef}
        type="button"
        onClick={tocar}
        aria-label={abierta ? ENTRADA_POR_LA_LUNA.etiquetaAbierta : ENTRADA_POR_LA_LUNA.etiqueta}
        className="relative grid cursor-pointer place-items-center"
        style={{ width: lado, height: lado }}
      >
        {/* El halo, que es lo único que se enciende cada tanto. */}
        <span
          aria-hidden
          className="anima-brillo-luna absolute inset-[-30%] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgb(245 244 232 / 0.42), rgb(245 244 232 / 0) 66%)',
          }}
        />

        {/* El disco. Cerrada está más apagada, pero se ve: si no se
            viera no habría nada que tocar y el aviso no llegaría nunca. */}
        <motion.span
          aria-hidden
          className="anima-flotar relative block overflow-hidden rounded-full"
          style={{
            width: lado,
            height: lado,
            background: 'radial-gradient(circle at 34% 30%, #fdfbf0, #f0ead2 52%, #cfc6a8 100%)',
            boxShadow: llena
              ? '0 0 46px rgb(245 196 81 / 0.4), inset -8px -8px 20px rgb(120 108 78 / 0.28)'
              : '0 0 26px rgb(248 244 232 / 0.22), inset -8px -8px 20px rgb(120 108 78 / 0.3)',
          }}
          // Cerrada baja hasta donde sigue leyéndose como luna y no
          // como piedra. Más apagada de esto se vuelve una mancha gris
          // en el cielo y deja de dar ganas de tocarla, que es de lo
          // único que depende que el aviso le llegue alguna vez.
          animate={{ opacity: abierta ? 1 : 0.72 }}
          transition={{ duration: 1.6, ease: 'easeOut' }}
          whileTap={{ scale: 0.93 }}
        >
          {CRATERES.map((c, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-[#8a7f5e]"
              style={{
                left: `${c.x}%`,
                top: `${c.y}%`,
                width: `${c.lado}%`,
                height: `${c.lado}%`,
                opacity: c.opacidad,
              }}
            />
          ))}
        </motion.span>
      </button>

      {/* Solo cuando ya subió: que la carta se puede releer sin volver a
          jugar no se deduce de una luna un poco más grande. */}
      {llena ? (
        <span className="fuente-mano mt-1 whitespace-nowrap text-sm text-texto-suave/60">
          {ENTRADA_POR_LA_LUNA.llena}
        </span>
      ) : null}

      {/* ── El aviso de que le faltan los tres ───────────────────────
          Un papelito debajo de la luna y no un cuadro que tape la
          pantalla: es un «todavía no», no una noticia. */}
      <AnimatePresence>
        {avisando ? (
          <motion.div
            initial={sinMovimiento ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
            role="status"
            onClick={() => setAvisando(false)}
            className="papel absolute top-full right-0 mt-3 w-60 cursor-pointer rounded-xl px-4 py-3 text-center sm:w-72"
          >
            <p className="font-display text-base text-acento">
              {ENTRADA_POR_LA_LUNA.cerrada.titulo}
            </p>
            <p className="fuente-mano mt-2 text-base leading-snug text-texto-suave">
              {ENTRADA_POR_LA_LUNA.cerrada.texto}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* ── La cámara ────────────────────────────────────────────────
          Un círculo que sale de la luna y se come la pantalla. Sin esto
          la portada desaparecía de golpe y el juego aparecía de golpe, y
          se perdía lo único que dice de qué va la cosa: que se sube
          hasta allá. */}
      {viaje ? (
        <motion.span
          aria-hidden
          className="fixed z-[80] rounded-full"
          style={{
            left: viaje.x,
            top: viaje.y,
            width: lado,
            height: lado,
            marginLeft: -lado / 2,
            marginTop: -lado / 2,
            background: 'radial-gradient(circle at 34% 30%, #fdfbf0, #e8e0c4 55%, #0b1026 100%)',
          }}
          initial={{ scale: 1 }}
          // 60 veces su ancho alcanza para tapar cualquier teléfono y
          // cualquier escritorio, aun saliendo desde una esquina.
          animate={{ scale: 60 }}
          transition={{ duration: MS_DE_VIAJE / 1000, ease: [0.7, 0, 0.84, 0] }}
        />
      ) : null}

      {/* Y la noche encima, sobre el final del viaje.
          Sin esto la pantalla se quedaba en blanco crema y el juego
          entraba en azul noche, o sea un fogonazo justo en el corte. El
          color es el mismo `#0b1026` del canvas del juego, así que lo
          que ella ve es una cosa sola: se mete en la luna y del otro
          lado ya es de noche. */}
      {viaje ? (
        <motion.span
          aria-hidden
          className="fixed inset-0 z-[81] bg-[#0b1026]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: MS_DE_VIAJE / 1000 - 0.28 }}
        />
      ) : null}
    </div>
  )
}
