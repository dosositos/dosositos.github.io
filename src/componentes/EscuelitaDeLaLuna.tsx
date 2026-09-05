import { useReducedMotion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { CLASES, ESCUELITA } from '@/content/luna'
import { crearPintor } from '@/juego-luna/dibujo'
import { conectarEntrada } from '@/juego-luna/entrada'
import { crearMotor } from '@/juego-luna/motor'
import { construirNivel } from '@/juego-luna/mundos'
import { conNombre } from '@/juego-luna/nombrar'
import { leerProgreso } from '@/juego-luna/progreso'
import { loPuesto } from '@/juego-luna/ropero'
import type { EventoLuna } from '@/types'

/**
 * LA ESCUELITA
 *
 * Siete clases chiquitas antes del capítulo uno, una cosa por
 * pantalla, y **nada cuesta nada**: no se cuentan pasitos, no se
 * anotan caídas y no cae nada del cielo. Lo que enseña cada una y con
 * qué plataformas está escrito en `content/luna.ts`.
 *
 * Vive aparte de `Luna.tsx` y con su propio canvas a propósito. Metida
 * allá dentro, la página tendría que llevar dos juegos en el mismo
 * lienzo —siete niveles que se cambian solos y tres capítulos que se
 * cambian con un botón— y el efecto que monta el motor pasaría a
 * depender de en cuál de los dos anda. Acá adentro solo hay clases.
 *
 * Cómo se pasa una clase depende de la clase, y no siempre es llegar
 * arriba: la del cansancio se pasa mareándose y la de la estrellita,
 * cayéndose. Eso es lo que dice `objetivo`, y es lo que deja que la
 * clase de aguantar la barra sea una plataforma de pared a pared donde
 * no hay a dónde ir.
 */
export function EscuelitaDeLaLuna({
  alSalir,
}: {
  /**
   * Cómo se salió: haciéndola o saltándosela. Las dos dejan de
   * ofrecerla, y solo la primera le quita el «cómo se juega» al cartel
   * de Boo — a quien se la saltó eso es lo único que le queda
   * explicándole el juego.
   */
  alSalir: (como: 'hecha' | 'saltada') => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cajaRef = useRef<HTMLDivElement>(null)
  const menosMovimiento = useReducedMotion()

  /** La portada de la escuelita, que es donde se puede decir que no. */
  const [empezada, setEmpezada] = useState(false)

  /** En qué clase va. Al pasar la última se sale. */
  const [cual, setCual] = useState(0)

  /** Falso mientras se lee el cartel de despedida de la última. */
  const [terminada, setTerminada] = useState(false)

  /** El empujoncito, si se queda trabada un rato largo. */
  const [pista, setPista] = useState(false)

  const clase = CLASES[cual]
  const nivel = useMemo(() => construirNivel(clase), [clase])
  const nombre = leerProgreso().nombre

  /*
   * Detrás de la portada el juego ya está corriendo —se ve el cielo y
   * la tortuga caminando, que invita más que un fondo vacío—, pero
   * todavía no cuenta. Entra por una referencia y no por las
   * dependencias del efecto: puesto ahí, darle a «empezar» tiraría el
   * motor recién montado y armaría otro.
   */
  const empezadaRef = useRef(empezada)
  empezadaRef.current = empezada

  useEffect(() => {
    const canvas = canvasRef.current
    const caja = cajaRef.current
    if (!canvas || !caja) return

    const pintor = crearPintor(canvas, nivel)
    pintor.movimientoReducido = menosMovimiento ?? false
    pintor.puesto = loPuesto(leerProgreso())

    setPista(false)
    const relojDeLaPista = window.setTimeout(() => setPista(true), ESCUELITA.msParaLaPista)

    const vibrar = (ms: number | number[]) => {
      try {
        navigator.vibrate?.(ms)
      } catch {
        /* algunos navegadores la tienen pero prohibida: da igual */
      }
    }

    /** Ya se dio por aprendida, para no darla por aprendida dos veces. */
    let listo = false

    /**
     * Si ya pisó la estrellita.
     *
     * Lo pide la clase del guardado, y no es un detalle: el motor
     * avisa de la reaparición en cualquier caída, también en una de
     * antes de haber pisado nada. Sin esto, tirarse al vacío de
     * entrada daría la clase por aprendida sin que la estrellita
     * hubiera aparecido en la pantalla.
     */
    let pisoLaEstrella = false

    const aprendida = () => {
      if (listo) return
      listo = true
      vibrar([0, 20, 60, 30])
      // Un respiro antes de cambiar de clase. Sin él la pantalla se
      // cambia sola en el mismo cuadro en que ella entendió, y lo que
      // acaba de pasar no se llega a ver.
      window.setTimeout(() => {
        if (cual + 1 < CLASES.length) setCual(cual + 1)
        else setTerminada(true)
      }, 900)
    }

    const alEvento = (evento: EventoLuna) => {
      if (evento === 'salto') vibrar(12)
      else if (evento === 'caida') vibrar([0, 30])
      else if (evento === 'agotada') vibrar([0, 14, 60, 14, 60, 26])
      else if (evento === 'impulso') vibrar(34)
      else if (evento === 'hito') {
        vibrar([0, 18, 70, 22])
        pisoLaEstrella = true
      }

      // Y lo único que decide si la clase se pasó: el evento que ella
      // vino a provocar. La del cansancio se pasa mareándose, la de la
      // estrellita cayéndose después de haberla pisado, y las otras
      // cinco llegando arriba.
      if (!empezadaRef.current) return
      if (evento !== clase.objetivo) return
      if (evento === 'reaparicion' && !pisoLaEstrella) return
      aprendida()
    }

    const motor = crearMotor({
      nivel,
      // Sin la luna presentándose ni despidiéndose: son siete clases
      // seguidas y siete cinemáticas serían más tiempo mirando que
      // jugando. La luna está en el cielo del cuadro y con eso alcanza.
      conCinematica: false,
      nadaCae: true,
      pintar: pintor.pintar,
      alEvento,
    })

    const medir = () => {
      const vv = window.visualViewport
      const ancho = Math.round(vv?.width ?? window.innerWidth)
      const alto = Math.round(vv?.height ?? window.innerHeight)
      caja.style.height = `${alto}px`
      pintor.medir(ancho, alto)
      motor.medirVista(pintor.altoDeLaVista())
    }

    medir()
    motor.iniciar()
    const desconectar = conectarEntrada(canvas, {
      presionar: motor.presionar,
      soltar: motor.soltar,
    })

    window.visualViewport?.addEventListener('resize', medir)
    window.visualViewport?.addEventListener('scroll', medir)
    window.addEventListener('orientationchange', medir)

    return () => {
      motor.detener()
      desconectar()
      window.clearTimeout(relojDeLaPista)
      window.visualViewport?.removeEventListener('resize', medir)
      window.visualViewport?.removeEventListener('scroll', medir)
      window.removeEventListener('orientationchange', medir)
    }
  }, [clase, cual, menosMovimiento, nivel])

  return (
    <div
      ref={cajaRef}
      className="fixed inset-0 z-30 overflow-hidden bg-[#0b1026] overscroll-none select-none"
    >
      <canvas
        ref={canvasRef}
        className="block h-full w-full touch-none"
        aria-label={clase.titulo}
      />

      {/* ── La portada, que es donde se puede decir que no ────────
          El botón de saltarla va abajo y en chiquito, igual que el del
          ropero: se puede decir que no, pero lo que se ofrece es
          entrar. */}
      {empezada ? null : (
        <div className="absolute inset-0 overflow-y-auto bg-[#0b1026]/88 px-6 py-10 backdrop-blur-[2px]">
          <div className="anima-aparecer mx-auto flex min-h-full max-w-md flex-col justify-center">
            <h2 className="fuente-mano text-center text-3xl text-tulipan-amarillo">
              {ESCUELITA.titulo}
            </h2>

            {ESCUELITA.parrafos.map((parrafo, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <p key={i} className="mt-4 text-[0.95rem] leading-relaxed text-margarita/75">
                {conNombre(parrafo, nombre)}
              </p>
            ))}

            <button
              type="button"
              onClick={() => setEmpezada(true)}
              className="mt-8 w-full rounded-full bg-tulipan-amarillo px-8 py-4 font-display text-lg text-[#0b1026] transition-transform hover:-translate-y-0.5"
            >
              {ESCUELITA.boton}
            </button>

            <button
              type="button"
              onClick={() => alSalir('saltada')}
              className="mt-4 self-center rounded-full border border-margarita/25 px-5 py-2 text-sm text-margarita/60 transition-colors hover:border-tulipan-amarillo/60 hover:text-tulipan-amarillo"
            >
              {ESCUELITA.saltar}
            </button>
          </div>
        </div>
      )}

      {/* ── Lo que hay que aprender, arriba ───────────────────────
          Arriba y no abajo: abajo está la barra, que es justo lo que
          el cartel le está pidiendo que mire. */}
      {terminada || !empezada ? null : (
        <div className="pointer-events-none absolute inset-x-0 top-0 px-6 pt-8 text-center">
          <p className="text-[0.68rem] uppercase tracking-[0.3em] text-margarita/40">
            {cual + 1} de {CLASES.length}
          </p>

          <h2 className="fuente-mano mt-2 text-2xl text-tulipan-amarillo">{clase.titulo}</h2>

          <p className="mx-auto mt-2 max-w-xs text-[0.9rem] leading-relaxed text-margarita/75">
            {conNombre(clase.texto, nombre)}
          </p>

          {/* El empujoncito. Sale tarde y a propósito: entrar a los
              diez segundos a decirle cómo se hace es quitarle la clase. */}
          <p
            className={`fuente-mano mx-auto mt-4 max-w-xs text-base leading-snug text-margarita/50 transition-opacity duration-700 ${
              pista ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {conNombre(clase.pista, nombre)}
          </p>
        </div>
      )}

      {/* ── Y el cierre de las siete ──────────────────────────────── */}
      {terminada ? (
        <div className="absolute inset-0 overflow-y-auto bg-[#0b1026]/88 px-6 py-10 backdrop-blur-[2px]">
          <div className="anima-aparecer mx-auto flex min-h-full max-w-md flex-col justify-center text-center">
            <h2 className="font-display text-3xl text-tulipan-amarillo">
              {ESCUELITA.final.titulo}
            </h2>

            <p className="mt-5 text-left text-[0.95rem] leading-relaxed text-margarita/75">
              {conNombre(ESCUELITA.final.texto, nombre)}
            </p>

            <button
              type="button"
              onClick={() => alSalir('hecha')}
              className="mt-8 w-full rounded-full bg-tulipan-amarillo px-8 py-4 font-display text-lg text-[#0b1026] transition-transform hover:-translate-y-0.5"
            >
              {ESCUELITA.final.boton}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
