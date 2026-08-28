import { useReducedMotion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { AYUDA, CARTEL, NIVEL_DE_PRUEBA, TEXTOS } from '@/content/luna'
import { crearPintor } from '@/juego-luna/dibujo'
import { conectarEntrada } from '@/juego-luna/entrada'
import { crearMotor } from '@/juego-luna/motor'
import { construirNivel } from '@/juego-luna/mundos'
import { anotarCapitulo, leerProgreso } from '@/juego-luna/progreso'
import type { EventoLuna, ProgresoLuna } from '@/types'

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
 * hay un solo render por frame. Lo único que sube hasta React son las
 * cuatro cosas que van escritas con letras encima del canvas: el
 * cartel del principio, la ayuda de abajo, el aviso del lazo y la
 * llegada.
 */
export function Luna() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cajaRef = useRef<HTMLDivElement>(null)
  const menosMovimiento = useReducedMotion()

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

  // El nivel se arma una sola vez: convertir las alturas escritas a
  // mano en plataformas no tiene por qué repetirse en cada render.
  const nivel = useMemo(() => construirNivel(NIVEL_DE_PRUEBA), [])

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
     * El aviso del lazo. Entra, se queda un momento y se va solo. No
     * detiene el juego ni pide que se lo cierre: se lee de reojo
     * mientras la tortuga sigue caminando.
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
      else if (evento === 'hito') {
        vibrar([0, 18, 70, 22])
        // El lazo se enciende y late, pero eso solo se pasa por alto
        // jugando. Hay que decirlo con letras.
        mostrarAviso(TEXTOS.hito)
      } else if (evento === 'cima') {
        const cuenta = motor.cuenta()
        // Se guarda al llegar arriba y no antes: es el único momento
        // en que hay algo que valga la pena acordarse.
        anotarCapitulo(1, cuenta.pasitos, cuenta.caidas)
        setLlegada(cuenta)
        setTotales(leerProgreso())
      }
    }

    const motor = crearMotor({
      nivel,
      pintar: (escena) => pintor.pintar(escena),
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
  }, [empezado, menosMovimiento, nivel])

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

      {/* ── El cartel de antes de empezar ─────────────────────────── */}
      {!empezado ? (
        <div className="absolute inset-0 overflow-y-auto bg-[#0b1026]/85 px-6 py-10 backdrop-blur-[2px]">
          <div className="anima-aparecer mx-auto flex min-h-full max-w-md flex-col justify-center">
            <h2 className="fuente-mano text-3xl text-tulipan-amarillo">{CARTEL.titulo}</h2>

            {CARTEL.parrafos.map((parrafo, i) => (
              <p key={i} className="mt-4 text-[0.95rem] leading-relaxed text-margarita/75">
                {parrafo}
              </p>
            ))}

            <button
              type="button"
              onClick={() => setEmpezado(true)}
              className="mt-8 w-full rounded-full bg-tulipan-amarillo px-8 py-4 font-display text-lg text-[#0b1026] transition-transform hover:-translate-y-0.5"
            >
              {CARTEL.boton}
            </button>

            <p className="fuente-mano mt-4 text-center text-base text-margarita/45">{CARTEL.pie}</p>
          </div>
        </div>
      ) : null}

      {/* ── El aviso del lazo ─────────────────────────────────────── */}
      {aviso ? (
        <p
          className={`pointer-events-none absolute inset-x-0 top-20 text-center text-sm tracking-wide text-tulipan-amarillo/80 transition-opacity duration-500 ${
            aviso.yendose ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {aviso.texto}
        </p>
      ) : null}

      {/* ── La llegada y la ayuda de abajo ────────────────────────── */}
      {llegada ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-16 text-center">
          <p className="font-display text-3xl text-tulipan-amarillo">{TEXTOS.llegada}</p>
          <p className="fuente-mano mt-2 text-lg text-margarita/70">
            {llegada.pasitos} pasitos, {llegada.caidas}{' '}
            {llegada.caidas === 1 ? 'caída' : 'caídas'}
          </p>
          {totales ? (
            <p className="mt-1 text-xs text-margarita/40">
              {TEXTOS.enTotal}: {totales.pasitos} pasitos, {totales.caidas}{' '}
              {totales.caidas === 1 ? 'caída' : 'caídas'}
            </p>
          ) : null}
        </div>
      ) : (
        <p
          className={`pointer-events-none absolute inset-x-0 bottom-6 text-center text-xs text-margarita/50 transition-opacity duration-700 ${
            empezado && ayudaVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {TEXTOS.ayudaTocar}
          <span className="hidden sm:inline"> · {TEXTOS.ayudaTeclado}</span>
        </p>
      )}
    </div>
  )
}
