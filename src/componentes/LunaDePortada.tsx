import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { useNavigate } from 'react-router-dom'
import { ENTRADA_POR_LA_LUNA } from '@/content/luna'
import { leerProgreso, yaLlego } from '@/juego-luna/progreso'
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
 *  - **Cerrada.** Se ve poco: está metida en la esquina, medio salida
 *    por el borde y bastante apagada. Se puede tocar, y tocarla saca
 *    cuatro palabras —«aún te falta algo»— y nada más. No dice qué
 *    falta ni dónde buscarlo: eso lo descubre ella. Lo único que el
 *    aviso tiene que hacer es que sepa que ahí hay una puerta.
 *  - **Abierta**, con los tres encontrados. Se enciende y lleva arriba.
 *  - **Llena**, cuando ya llegó a la luna. Más grande y más cálida, y
 *    sin una línea debajo explicándolo: si ya subió, ya sabe qué hay
 *    arriba, y un cartelito de recordatorio le quita el secreto a la
 *    única cosa de la web que era suya.
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

/**
 * Lo que se queda puesto el aviso.
 *
 * Menos que antes: cuatro palabras se leen de un vistazo, y un
 * papelito que se queda seis segundos encima de cuatro palabras parece
 * que está esperando que uno haga algo con él.
 */
const MS_DEL_AVISO = 3600

/**
 * Cuánto de la luna se esconde por el borde de la pantalla.
 *
 * Es lo que la vuelve un hallazgo en vez de un botón. Asomada, se ve
 * lo bastante como para que se entienda que es una luna y para dar
 * ganas de tocarla; entera y en el medio de su franja era lo primero
 * que se veía al abrir la web, y una puerta que se anuncia sola no se
 * descubre.
 */
const ASOMO = 0.3

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

  /**
   * Si ya llegó arriba alguna vez. Se lee una sola vez, al montar.
   *
   * Se pregunta por las llegadas y no por el capítulo: al pisar la
   * luna el juego se reinicia para poder volver a subir, y mirando el
   * capítulo la luna se le cerraría en el mismo momento en que ella
   * llegó.
   */
  const [llena] = useState(() => yaLlego(leerProgreso()))

  /** El aviso de que le faltan los tres, cuando la toca cerrada. */
  const [avisando, setAvisando] = useState(false)

  /** De dónde sale el círculo que se come la pantalla, al entrar. */
  const [viaje, setViaje] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    if (!avisando) return
    const t = window.setTimeout(() => setAvisando(false), MS_DEL_AVISO)
    return () => window.clearTimeout(t)
  }, [avisando])

  // Más grande que antes, las dos. Escondiéndose por el borde, un
  // disco chiquito se lee como una mancha; grande y medio salido se
  // lee como una luna que quedó fuera de cuadro, que es lo que es.
  const lado = llena ? 132 : 112

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
       que haya encima.

       Lo que sí cambió es que la franja no la centra: se va a la
       esquina derecha y **se le recorta un tercio**, así que lo que se
       ve es una luna asomada por el borde de la pantalla. Eso es lo
       que la vuelve un hallazgo en vez de un botón.

       **Acá no se recorta nada.** El disco se sale por la derecha con
       un margen negativo, y quien lo corta es la franja de la portada,
       que lleva `overflow-x-clip` y termina justo en el filo de la
       pantalla. Ese `clip` muerde solo a lo ancho: el resplandor sigue
       saliéndose por arriba y por abajo, que es lo que tiene que hacer.

       Antes se recortaba aquí, con una caja más angosta que el disco, y
       eso dejaba **una raya vertical en el cielo**: el halo de la luna
       es un cuadrado con un degradado redondo dentro, más ancho que el
       disco, y la caja se lo cortaba a filo por la izquierda. Se veía
       una línea recta de arriba abajo, a un dedo de la luna, y una
       línea recta en el cielo no la puso nadie.

       Esta caja mide lo que se ve —el disco menos lo que se asoma— y no
       corta: está para que el papelito de abajo cuelgue del borde
       derecho de la pantalla y no del borde del disco, que se fue
       afuera. */
    <motion.div
      className="relative z-20"
      style={{ width: lado * (1 - ASOMO), height: lado }}
      /* ── Cómo entra ────────────────────────────────────────────
         Todo lo demás de la portada entra —el regalo aparece, el
         título sube desenfocado, el contador se desliza— y la luna
         estaba puesta desde el primer cuadro. Al lado de lo otro se
         veía pegada, como si se hubiera olvidado de llegar.

         Entra **derivando desde afuera**, no apareciendo: viene de más
         a la derecha y de más arriba, o sea de fuera de la pantalla,
         que es de donde vendría una luna que quedó fuera de cuadro. Y
         entra creciendo un poquito, porque se acerca.

         **La última, y con calma.** El título va con 0,15 de retraso y
         el contador con 0,5; la luna llega en 0,9 y tarda segundo y
         medio en posarse. Es a propósito: es una puerta escondida y no
         puede ser lo primero que se mueve. Lo que tiene que pasar es
         que ella lea el encabezado y **después** note, de reojo, que
         algo se acomodó en la esquina.

         Con `prefers-reduced-motion` no deriva ni crece: aparece y ya.
         Un disco cruzando la pantalla es exactamente lo que esa
         preferencia está pidiendo que no pase. */
      initial={
        sinMovimiento ? { opacity: 0 } : { opacity: 0, x: 58, y: -30, scale: 0.82 }
      }
      animate={sinMovimiento ? { opacity: 1 } : { opacity: 1, x: 0, y: 0, scale: 1 }}
      transition={
        sinMovimiento
          ? { duration: 0.8, delay: 0.4 }
          : { duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.9 }
      }
    >
      <button
        ref={botonRef}
        type="button"
        onClick={tocar}
        aria-label={abierta ? ENTRADA_POR_LA_LUNA.etiquetaAbierta : ENTRADA_POR_LA_LUNA.etiqueta}
        className="absolute top-0 left-0 grid cursor-pointer place-items-center"
        style={{ width: lado, height: lado }}
      >
        {/* El halo, que es lo único que se enciende cada tanto. */}
        <span
          aria-hidden
          className="anima-brillo-luna absolute inset-[-30%] rounded-full"
          style={{
            background: abierta
              ? 'radial-gradient(circle, rgb(245 244 232 / 0.42), rgb(245 244 232 / 0) 66%)'
              : // Cerrada, el halo va a la mitad. Es lo que más la
                // delataba: un resplandor pasando cada dieciocho
                // segundos en una esquina se ve desde el otro lado de
                // la pantalla, y lo que se busca ahora es que se la
                // encuentre, no que se la anuncie.
                'radial-gradient(circle, rgb(245 244 232 / 0.2), rgb(245 244 232 / 0) 66%)',
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
          // único que depende que el aviso le llegue alguna vez. Bajó
          // de 0,72 a 0,55 al meterla en la esquina: ahí el cielo es
          // más oscuro y el disco resalta más que en medio de su
          // franja. Es de lo primero que hay que volver a mirar en el
          // Android de ella, que es la pantalla que manda.
          animate={{ opacity: abierta ? 1 : 0.55 }}
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

      {/* Aquí vivía «la carta sigue allá arriba», debajo de la luna
          llena. Se fue: si ya subió, ya sabe qué hay arriba, y un
          cartelito recordándoselo en la portada convierte lo único
          secreto de la web en un aviso más. La luna llena es más
          grande y más cálida, y quien la abrió una vez la reconoce.
          Los que no subieron nunca la vieron y no se pierden nada. */}

      {/* ── El aviso ─────────────────────────────────────────────────
          Un papelito debajo de la luna y no un cuadro que tape la
          pantalla: es un «todavía no», no una noticia. Y cuatro
          palabras, sin título y sin pista: que le falta algo se lo
          decimos; qué es, lo descubre ella. */}
      <AnimatePresence>
        {avisando ? (
          <motion.div
            initial={sinMovimiento ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
            role="status"
            onClick={() => setAvisando(false)}
            className="papel absolute top-full mt-2 cursor-pointer rounded-xl px-4 py-2 text-center whitespace-nowrap"
            // Un dedo de aire contra el filo. Pegado al borde con
            // `right-0` quedaba tocando el canto de la pantalla, y la
            // franja de la portada corta ahí: un papelito que llega
            // justo al corte parece que se sigue por fuera.
            style={{ right: 14 }}
          >
            <p className="fuente-mano text-base leading-snug text-texto-suave">
              {ENTRADA_POR_LA_LUNA.cerrada}
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
    </motion.div>
  )
}
