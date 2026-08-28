import { useReducedMotion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { AYUDA, CARTEL, TEXTOS } from '@/content/luna'
import { crearPintor } from '@/juego-luna/dibujo'
import { conectarEntrada } from '@/juego-luna/entrada'
import { crearMotor } from '@/juego-luna/motor'
import { capituloNumero, construirNivel } from '@/juego-luna/mundos'
import { anotarCapitulo, tienePoder } from '@/juego-luna/progreso'
import { RETRATOS } from '@/lib/retratos'
import type { EventoLuna, ProgresoLuna } from '@/types'

/**
 * El marcador de poderes, abajo a la izquierda.
 *
 * Un icono por poder ganado y un puntito por carga: lleno mientras le
 * quede, hueco cuando ya lo gastó. Con letras («te queda un empujón»)
 * había que leer en medio de un salto, y en medio de un salto nadie
 * lee. Cuando estén los tres poderes, esto es una fila de tres.
 */
const DIBUJO_DEL_PODER: Record<string, ReactNode> = {
  // El planeo: una cúpula con sus tirantes, que es lo que todo el
  // mundo reconoce como «esto te hace bajar despacio».
  planeo: (
    <>
      <path d="M2.4 9.2a7.6 7.6 0 0 1 15.2 0" />
      <path d="M2.4 9.2l6.4 4.4M17.6 9.2l-6.4 4.4M10 9.2v4.4" />
      <path d="M8.6 13.6h2.8v3.2H8.6z" />
    </>
  ),
}

function MarcadorDePoderes({
  poderes,
}: {
  poderes: { id: string; nombre: string; cargas: number; sinGastar: number; usando?: boolean }[]
}) {
  if (poderes.length === 0) return null

  return (
    <div className="pointer-events-none absolute bottom-5 left-4 flex gap-3">
      {poderes.map((poder) => {
        const entero = poder.sinGastar > 0
        return (
          <div key={poder.id} className="flex flex-col items-center gap-1">
            <div
              aria-label={poder.nombre}
              className={`grid h-9 w-9 place-items-center rounded-xl border transition-all duration-300 ${
                poder.usando
                  ? 'scale-110 border-tulipan-amarillo bg-tulipan-amarillo/35 text-tulipan-amarillo'
                  : entero
                    ? 'border-tulipan-amarillo/70 bg-tulipan-amarillo/15 text-tulipan-amarillo'
                    : 'border-margarita/15 bg-margarita/5 text-margarita/25'
              }`}
            >
              <svg
                viewBox="0 0 20 20"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {DIBUJO_DEL_PODER[poder.id]}
              </svg>
            </div>

            <div className="flex gap-1">
              {Array.from({ length: poder.cargas }, (_, i) => (
                <span
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full transition-colors duration-500 ${
                    i < poder.sinGastar ? 'bg-tulipan-amarillo/80' : 'bg-margarita/20'
                  }`}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/**
 * A la luna, a pasitos de tortuga.
 *
 * De la frase de siempre: «de aquí a la luna a pasitos de tortuga».
 * Una tortuga sube saltando hasta la luna y arriba hay una carta que
 * no está en ninguna otra parte de la web.
 *
 * Esta ruta no se enlaza desde ningún lado y no aparece en el menú.
 * Hasta que la luna de la portada se vuelva tocable (la última fase),
 * el juego no existe para ella y se puede dejar a medias sin que se
 * note nada raro en la web.
 *
 * Acá adentro React solo monta el canvas y se aparta: el bucle, la
 * física y el dibujo viven en `src/juego-luna/`, fuera de React. No
 * hay un solo render por frame. Lo único que sube hasta React es lo
 * que va escrito con letras encima del canvas: el cartel del capítulo,
 * la ayuda de abajo, el aviso del lazo y el cierre.
 */
export function Luna() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cajaRef = useRef<HTMLDivElement>(null)
  const menosMovimiento = useReducedMotion()

  // Por ahora solo está escrito el capítulo de Boo. Cuando estén los
  // tres, de aquí sale el que le toque según el progreso.
  const capitulo = useMemo(() => capituloNumero(1), [])
  const nivel = useMemo(() => construirNivel(capitulo), [capitulo])

/**
   * El poder se gana cerrando el capítulo, así que la primera vez no
   * lo tiene y en las siguientes sí. Se lee una sola vez al montar:
   * que aparezca a media subida sería raro.
   */
  const conPoder = useMemo(() => tienePoder(capitulo.poder.id), [capitulo])

  /** Mientras está en falso se ve el cartel y el dedo no hace nada. */
  const [empezado, setEmpezado] = useState(false)

  /** Se enciende al pisar la última plataforma. */
  const [llegada, setLlegada] = useState<{ pasitos: number; caidas: number } | null>(null)

  /** Lo acumulado de todas las veces, para enseñarlo al llegar. */
  const [totales, setTotales] = useState<ProgresoLuna | null>(null)

  /** La línea de abajo, que se va sola cuando ya entendió. */
  const [ayudaVisible, setAyudaVisible] = useState(true)

  /** El aviso de haber pisado un lazo. Dura un par de segundos. */
  const [aviso, setAviso] = useState<{ texto: string; yendose: boolean } | null>(null)

/**
   * El aire de planeo que le queda, de 1 a 0, y si está planeando
   * ahora mismo. Es lo único de adentro del bucle que sube a React, y
   * sube redondeado a tercios: así cambia tres veces por capítulo en
   * vez de sesenta por segundo.
   */
  const [aire, setAire] = useState(conPoder ? 3 : 0)
  const [planeando, setPlaneando] = useState(false)

  /**
   * Falso mientras la luna se presenta y mientras se despide. En esos
   * segundos no hay letras ni marcadores encima: lo único que hay que
   * mirar es ella.
   */
  const [jugando, setJugando] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const caja = cajaRef.current
    if (!canvas || !caja) return

    const pintor = crearPintor(canvas, nivel)
    pintor.movimientoReducido = menosMovimiento ?? false

    /** Los relojes de los carteles, para apagarlos todos al salir. */
    const relojes: number[] = []
    const olvidarRelojes = () => {
      for (const r of relojes) window.clearTimeout(r)
      relojes.length = 0
    }

    /**
     * Los avisos de una línea. Entran, se quedan un momento y se van
     * solos. No detienen el juego ni piden que se los cierre: se leen
     * de reojo mientras la tortuga sigue caminando.
     */
    const mostrarAviso = (texto: string) => {
      olvidarRelojes()
      setAviso({ texto, yendose: false })
      relojes.push(
        window.setTimeout(() => setAviso((a) => (a ? { ...a, yendose: true } : a)), 1500),
        window.setTimeout(() => setAviso(null), 2100),
      )
    }

    /**
     * La vibración es lo que hace que el salto se sienta en la mano.
     * Anda en el Android de ella, que es el teléfono que manda; en el
     * iPhone la API no existe y no pasa nada, que está bien.
     */
    const vibrar = (ms: number | number[]) => {
      try {
        navigator.vibrate?.(ms)
      } catch {
        /* algunos navegadores la tienen pero prohibida: da igual */
      }
    }

    /** Cuántos saltos lleva, para saber cuándo retirar la ayuda. */
    let saltos = 0
    let relojDeLaAyuda = 0

    const alEvento = (evento: EventoLuna) => {
      if (evento === 'salto') {
        vibrar(12)

        // La ayuda se va después del tercer salto: para entonces ya
        // sabe mantener y soltar, y dejarla puesta sería una línea de
        // texto encima del juego para siempre. Vuelve si se queda un
        // rato largo sin saltar, por si se trabó.
        saltos += 1
        if (saltos >= AYUDA.saltosParaIrse) {
          window.clearTimeout(relojDeLaAyuda)
          setAyudaVisible(false)
          relojDeLaAyuda = window.setTimeout(() => setAyudaVisible(true), AYUDA.msDeOlvido)
        }
      } else if (evento === 'caida') vibrar([0, 30])
      // Agotada: tres toquecitos, que se sienten como un tropiezo.
      else if (evento === 'agotada') vibrar([0, 14, 60, 14, 60, 26])
      // El tramo de impulso la manda sola: un empujón largo en la mano.
      else if (evento === 'impulso') vibrar(34)
      else if (evento === 'poder') vibrar(10)
      else if (evento === 'hito') {
        vibrar([0, 18, 70, 22])
        // El lazo se enciende y late, pero eso solo se pasa por alto
        // jugando. Hay que decirlo con letras.
        mostrarAviso(TEXTOS.hito)
      } else if (evento === 'cima') {
        const cuenta = motor.cuenta()
        // Se guarda al pisar la cima y no al final de la cinemática:
        // si cierra la página mientras la luna se va, el capítulo
        // igual quedó ganado.
        setTotales(anotarCapitulo(capitulo.numero, cuenta.pasitos, cuenta.caidas, capitulo.poder.id))
      } else if (evento === 'fin') {
        // El cartel espera a que la luna termine de irse. Taparla con
        // un cuadro de texto sería tirar la mejor parte.
        setLlegada(motor.cuenta())
      }
    }

    /** El último tercio de aire que se le enseñó a React. */
    let tercioPintado = conPoder ? 3 : 0
    let planeabaAntes = false
    let jugandoAntes = false

    const motor = crearMotor({
      nivel,
      conPoder,
      conCinematica: true,
      pintar: (escena) => {
        pintor.pintar(escena)

        // El marcador se entera desde aquí, y solo cuando de verdad
        // cambia: un setState por frame haría re-renderizar React
        // sesenta veces por segundo, que es justo lo que este juego
        // no hace.
        const tercio = Math.ceil(escena.aire * 3)
        if (tercio !== tercioPintado) {
          tercioPintado = tercio
          setAire(tercio)
          if (tercio === 0) mostrarAviso(TEXTOS.sinAire)
        }
        if (escena.planeando !== planeabaAntes) {
          planeabaAntes = escena.planeando
          setPlaneando(escena.planeando)
        }
        if ((escena.cine === 'jugando') !== jugandoAntes) {
          jugandoAntes = escena.cine === 'jugando'
          setJugando(jugandoAntes)
        }
      },
      alEvento,
    })

    /**
     * Medir con `visualViewport` y no con `innerHeight`: en Safari la
     * barra del navegador aparece y desaparece sola, y con
     * `innerHeight` el canvas queda más alto que lo que se ve. Además
     * hay que volver a medir cada vez que cambia.
     */
    const medir = () => {
      const vv = window.visualViewport
      const ancho = Math.round(vv?.width ?? window.innerWidth)
      const alto = Math.round(vv?.height ?? window.innerHeight)
      caja.style.height = `${alto}px`
      pintor.medir(ancho, alto)
      // La cámara necesita saber cuánto se ve para dejar a la tortuga
      // donde va; el único que lo sabe es el pintor.
      motor.medirVista(pintor.altoDeLaVista())
    }

    medir()

    // El motor arranca aunque el cartel esté puesto: detrás del texto
    // se ven el cielo y la tortuga caminando por el suelo, que invita
    // más que un fondo negro. Lo que no se conecta hasta que le da a
    // empezar es el dedo.
    motor.iniciar()

    const desconectar = empezado
      ? conectarEntrada(canvas, { presionar: motor.presionar, soltar: motor.soltar })
      : undefined

    window.visualViewport?.addEventListener('resize', medir)
    window.visualViewport?.addEventListener('scroll', medir)
    window.addEventListener('orientationchange', medir)

    return () => {
      motor.detener()
      desconectar?.()
      olvidarRelojes()
      window.clearTimeout(relojDeLaAyuda)
      window.visualViewport?.removeEventListener('resize', medir)
      window.visualViewport?.removeEventListener('scroll', medir)
      window.removeEventListener('orientationchange', medir)
    }
  }, [capitulo, conPoder, empezado, menosMovimiento, nivel])

  const retrato = RETRATOS[capitulo.id]

  return (
    <div
      ref={cajaRef}
      className="fixed inset-0 z-30 overflow-hidden bg-[#0b1026] overscroll-none select-none"
    >
      <canvas
        ref={canvasRef}
        className="block h-full w-full touch-none"
        aria-label="A la luna, a pasitos de tortuga"
      />

      {/* ── El cartel del capítulo, con su retrato ────────────────── */}
      {!empezado ? (
        <div className="absolute inset-0 overflow-y-auto bg-[#0b1026]/88 px-6 py-10 backdrop-blur-[2px]">
          <div className="anima-aparecer mx-auto flex min-h-full max-w-md flex-col justify-center">
            {retrato ? (
              <img
                src={retrato}
                alt={capitulo.nombre}
                className="mx-auto mb-4 h-28 w-28 object-contain"
              />
            ) : null}

            <h2 className="fuente-mano text-center text-3xl text-tulipan-amarillo">
              {capitulo.presentacion.titulo}
            </h2>

            {capitulo.presentacion.texto.map((parrafo, i) => (
              <p key={i} className="mt-4 text-[0.95rem] leading-relaxed text-margarita/75">
                {parrafo}
              </p>
            ))}

            {/* Cómo se juega va solo en el primero: después ya lo sabe. */}
            {capitulo.numero === 1 ? (
              <div className="mt-6 border-t border-margarita/15 pt-5">
                {CARTEL.parrafos.map((parrafo, i) => (
                  <p key={i} className="mt-3 text-[0.9rem] leading-relaxed text-margarita/60">
                    {parrafo}
                  </p>
                ))}
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => setEmpezado(true)}
              className="mt-8 w-full rounded-full bg-tulipan-amarillo px-8 py-4 font-display text-lg text-[#0b1026] transition-transform hover:-translate-y-0.5"
            >
              {capitulo.presentacion.boton}
            </button>

            <p className="fuente-mano mt-4 text-center text-base text-margarita/45">{CARTEL.pie}</p>
          </div>
        </div>
      ) : null}

      {/* ── El aviso de una línea ─────────────────────────────────── */}
      {aviso ? (
        <p
          className={`pointer-events-none absolute inset-x-0 top-20 text-center text-sm tracking-wide text-tulipan-amarillo/80 transition-opacity duration-500 ${
            aviso.yendose ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {aviso.texto}
        </p>
      ) : null}

      {/* ── Los poderes ganados ───────────────────────────────────── */}
      {empezado && jugando && conPoder && !llegada ? (
        <MarcadorDePoderes
          poderes={[
            {
              id: capitulo.poder.id,
              nombre: capitulo.poder.nombre,
              // El tanque de aire, contado en tercios. El día que haya
              // más poderes, esta lista crece.
              cargas: 3,
              sinGastar: aire,
              usando: planeando,
            },
          ]}
        />
      ) : null}

      {/* ── El cierre del capítulo, con el poder ganado ───────────── */}
      {llegada ? (
        <div className="absolute inset-0 overflow-y-auto bg-[#0b1026]/88 px-6 py-10 backdrop-blur-[2px]">
          <div className="anima-aparecer mx-auto flex min-h-full max-w-md flex-col justify-center text-center">
            {retrato ? (
              <img src={retrato} alt="" className="mx-auto mb-4 h-32 w-32 object-contain" />
            ) : null}

            <h2 className="font-display text-3xl text-tulipan-amarillo">
              {capitulo.cierre.titulo}
            </h2>

            <p className="fuente-mano mt-3 text-lg text-margarita/70">
              {llegada.pasitos} pasitos, {llegada.caidas}{' '}
              {llegada.caidas === 1 ? 'caída' : 'caídas'}
            </p>

            {totales ? (
              <p className="mt-1 text-xs text-margarita/40">
                {TEXTOS.enTotal}: {totales.pasitos} pasitos, {totales.caidas}{' '}
                {totales.caidas === 1 ? 'caída' : 'caídas'}
              </p>
            ) : null}

            <p className="mt-6 text-left text-[0.95rem] leading-relaxed text-margarita/75">
              {capitulo.cierre.texto}
            </p>

            <p className="mt-6 text-xs text-margarita/45">
              {TEXTOS.siguiente}
            </p>
          </div>
        </div>
      ) : (
        <p
          className={`pointer-events-none absolute inset-x-0 bottom-6 text-center text-xs text-margarita/50 transition-opacity duration-700 ${
            empezado && jugando && ayudaVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {TEXTOS.ayudaTocar}
          <span className="hidden sm:inline"> · {TEXTOS.ayudaTeclado}</span>
        </p>
      )}
    </div>
  )
}
