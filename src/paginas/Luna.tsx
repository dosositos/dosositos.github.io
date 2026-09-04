import { useReducedMotion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { CartaDeLaLuna } from '@/componentes/CartaDeLaLuna'
import { MarcadorDeLaLuna } from '@/componentes/MarcadorDeLaLuna'
import { AYUDA, BAUTIZO, CAPITULOS, CARTEL, TEXTOS } from '@/content/luna'
import { crearPintor } from '@/juego-luna/dibujo'
import { conectarEntrada } from '@/juego-luna/entrada'
import { crearMotor, type Motor } from '@/juego-luna/motor'
import { capituloNumero, construirNivel, ULTIMO_CAPITULO } from '@/juego-luna/mundos'
import { conNombre } from '@/juego-luna/nombrar'
import {
  anotarCapitulo,
  conCualEntra,
  LARGO_DEL_NOMBRE,
  leerProgreso,
  ponerleNombre,
} from '@/juego-luna/progreso'
import { RETRATOS } from '@/lib/retratos'
import type { EventoLuna, ProgresoLuna } from '@/types'

/**
 * A la luna, a pasitos de tortuga.
 *
 * De la frase de siempre: «de aquí a la luna a pasitos de tortuga».
 * Una tortuga sube saltando hasta la luna y arriba hay una carta que
 * no está en ninguna otra parte de la web.
 *
 * Se entra tocando la luna de la portada, y solo después de haber
 * encontrado a los tres peluches escondidos. No está en el menú y no la
 * apunta nada más: `LunaDePortada.tsx` es la única puerta.
 *
 * Acá adentro React solo monta el canvas y se aparta: el bucle, la
 * física y el dibujo viven en `src/juego-luna/`, fuera de React. No
 * hay un solo render por frame. Lo único que sube hasta React es lo
 * que va escrito con letras encima del canvas: el bautizo, el cartel
 * del capítulo, la ayuda de abajo, el aviso de la estrella y el cierre.
 */

/** Las tres pantallas de antes de jugar, en orden. */
type Fase = 'bautizo' | 'cartel' | 'jugando'

export function Luna() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cajaRef = useRef<HTMLDivElement>(null)
  /**
   * El motor de la partida de ahora, para poder darle el aviso de
   * empezar desde fuera del efecto que lo crea.
   */
  const motorRef = useRef<Motor | null>(null)
  const menosMovimiento = useReducedMotion()

  /** Lo que había guardado al abrir. De aquí sale con cuál se entra. */
  const [guardado, setGuardado] = useState<ProgresoLuna>(() => leerProgreso())

  const [numero, setNumero] = useState(() => conCualEntra(leerProgreso(), ULTIMO_CAPITULO))
  const capitulo = useMemo(() => capituloNumero(numero), [numero])
  const nivel = useMemo(() => construirNivel(capitulo), [capitulo])

  /**
   * El nombre se pregunta una sola vez, la primera de todas. Si lo deja
   * para después queda vacío y se le vuelve a preguntar la próxima,
   * que es la única manera de cambiarlo: no hay pantalla de ajustes.
   */
  const [fase, setFase] = useState<Fase>(() => (leerProgreso().nombre ? 'cartel' : 'bautizo'))

  /** Lo que va escribiendo en la casilla del nombre. */
  const [escribiendo, setEscribiendo] = useState('')

  /** Se enciende al pisar la última plataforma. */
  const [llegada, setLlegada] = useState<{ pasitos: number; caidas: number } | null>(null)

  /** Lo acumulado de todas las veces, para enseñarlo al llegar. */
  const [totales, setTotales] = useState<ProgresoLuna | null>(null)

  /** La línea de abajo, que se va sola cuando ya entendió. */
  const [ayudaVisible, setAyudaVisible] = useState(true)

  /** El aviso de haber pisado una estrella. Dura un par de segundos. */
  const [aviso, setAviso] = useState<{ texto: string; yendose: boolean } | null>(null)

  /**
   * Falso mientras la luna se presenta y mientras se despide. En esos
   * segundos no hay letras ni marcadores encima: lo único que hay que
   * mirar es ella.
   */
  const [jugando, setJugando] = useState(false)

  /** El nombre que ella le puso, o vacío mientras no le puso ninguno. */
  const nombre = guardado.nombre
  const conElNombre = (texto: string) => conNombre(texto, nombre)

  const empezado = fase === 'jugando'

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

    /** De qué cosas de las que caen ya vio el cartel. */
    const yaLoSabe = new Set<EventoLuna>()

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
      } else if (evento === 'apuron' || evento === 'apagon') {
        // Un golpe seco: algo le cayó encima.
        vibrar([0, 26, 40, 12])
        // Y el texto, **una sola vez cada uno**. El dibujo del objeto
        // ya dice a qué le va a pegar; qué hace exactamente hay que
        // decirlo con letras la primera vez, y a la segunda ya lo sabe
        // y un cartel encima del juego solo estorba.
        if (!yaLoSabe.has(evento)) {
          yaLoSabe.add(evento)
          mostrarAviso(evento === 'apuron' ? TEXTOS.golpeApuron : TEXTOS.golpeApagon)
        }
      } else if (evento === 'caida') vibrar([0, 30])
      // Agotada: tres toquecitos, que se sienten como un tropiezo.
      else if (evento === 'agotada') vibrar([0, 14, 60, 14, 60, 26])
      // El tramo de impulso la manda sola: un empujón largo en la mano.
      else if (evento === 'impulso') vibrar(34)
      else if (evento === 'hito') {
        vibrar([0, 18, 70, 22])
        // La estrella se enciende y late, pero eso solo se pasa por
        // alto jugando. Hay que decirlo con letras.
        mostrarAviso(TEXTOS.hito)
      } else if (evento === 'cima') {
        const cuenta = motor.cuenta()
        // Se guarda al pisar la cima y no al final de la cinemática:
        // si cierra la página mientras la luna se va, el capítulo
        // igual quedó ganado.
        setTotales(anotarCapitulo(capitulo.numero, cuenta.pasitos, cuenta.caidas))
      } else if (evento === 'fin') {
        // El cartel espera a que la luna termine de irse. Taparla con
        // un cuadro de texto sería tirar la mejor parte.
        setLlegada(motor.cuenta())
      }
    }

    let jugandoAntes = false

    const motor = crearMotor({
      nivel,
      conCinematica: true,
      // Detrás de este ya no hay otro: la luna no se escapa y ella
      // sube hasta pararse encima. Es lo único que cambia el final.
      esElFinal: numero === ULTIMO_CAPITULO,
      pintar: (escena) => {
        pintor.pintar(escena)

        // React se entera de la cinemática desde aquí, y solo cuando
        // de verdad cambia: un setState por frame lo haría
        // re-renderizar sesenta veces por segundo, que es justo lo
        // que este juego no hace.
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
     * hay que volver a medir cada vez que cambia — y en el bautizo eso
     * pasa de verdad, porque al abrirse el teclado la ventana encoge.
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
    // más que un fondo negro. En el bautizo eso además es media
    // respuesta a la pregunta, porque la que se va a llamar de alguna
    // manera está ahí abajo dando vueltas.
    //
    // Lo que no arranca todavía es la luna. Su cinemática espera al
    // botón, porque corriendo detrás del cartel se gastaba entera sin
    // que nadie pudiera verla. De eso se encarga el efecto de abajo,
    // que es también el que conecta el dedo.
    motorRef.current = motor
    motor.iniciar()

    window.visualViewport?.addEventListener('resize', medir)
    window.visualViewport?.addEventListener('scroll', medir)
    window.addEventListener('orientationchange', medir)

    return () => {
      motor.detener()
      motorRef.current = null
      olvidarRelojes()
      window.clearTimeout(relojDeLaAyuda)
      window.visualViewport?.removeEventListener('resize', medir)
      window.visualViewport?.removeEventListener('scroll', medir)
      window.removeEventListener('orientationchange', medir)
    }
  }, [capitulo, menosMovimiento, nivel])

  /**
   * Empezar de verdad: la luna se presenta y el dedo pasa a mandar.
   *
   * Va aparte del efecto de arriba a propósito. Metido allí, darle al
   * botón tiraba el motor entero y montaba uno nuevo, que funcionaba
   * pero era un efecto de lado de una dependencia, no una decisión
   * escrita. Y sobre todo: así el capítulo empieza cuando ella lo
   * empieza.
   */
  useEffect(() => {
    const canvas = canvasRef.current
    const motor = motorRef.current
    if (!empezado || !canvas || !motor) return

    motor.empezar()
    return conectarEntrada(canvas, { presionar: motor.presionar, soltar: motor.soltar })
  }, [empezado, nivel, numero])

  const retrato = RETRATOS[capitulo.id]
  const siguiente = CAPITULOS.find((c) => c.numero === capitulo.numero + 1)

  /** Detrás de este ya no hay otro: acá se llega a la luna y sale la carta. */
  const esElFinal = numero === ULTIMO_CAPITULO

  /** Lo mejor que ella ha hecho en este capítulo, ya con esta subida. */
  const suMejor = totales?.mejorPorCapitulo[capitulo.numero]

  const marcador = llegada ? (
    <MarcadorDeLaLuna record={capitulo.record} pasitos={llegada.pasitos} mejor={suMejor} />
  ) : null

  /** Guardar el nombre y pasar al cartel. Vacío es «mejor después». */
  const bautizar = (puesto: string) => {
    setGuardado(ponerleNombre(puesto))
    setFase('cartel')
  }

  /** Del cierre de un capítulo al cartel del siguiente, sin salir. */
  const alSiguiente = () => {
    if (!siguiente) return
    setLlegada(null)
    setTotales(null)
    setAyudaVisible(true)
    setJugando(false)
    setNumero(siguiente.numero)
    setFase('cartel')
  }

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

      {/* ── El bautizo, una sola vez en la vida ───────────────────── */}
      {fase === 'bautizo' ? (
        <div className="absolute inset-0 overflow-y-auto bg-gradient-to-b from-[#0b1026] from-60% via-[#0b1026]/85 via-80% to-transparent px-6 pt-20 pb-10">
          <form
            className="anima-aparecer mx-auto flex max-w-md flex-col"
            onSubmit={(e) => {
              e.preventDefault()
              bautizar(escribiendo)
            }}
          >
            <h2 className="fuente-mano text-center text-3xl text-tulipan-amarillo">
              {BAUTIZO.titulo}
            </h2>

            {BAUTIZO.parrafos.map((parrafo, i) => (
              <p key={i} className="mt-4 text-[0.95rem] leading-relaxed text-margarita/75">
                {parrafo}
              </p>
            ))}

            <input
              type="text"
              value={escribiendo}
              onChange={(e) => setEscribiendo(e.target.value.slice(0, LARGO_DEL_NOMBRE))}
              maxLength={LARGO_DEL_NOMBRE}
              placeholder={BAUTIZO.ejemplo}
              aria-label={BAUTIZO.titulo}
              autoComplete="off"
              autoCapitalize="words"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="done"
              className="fuente-mano mt-7 w-full rounded-2xl border border-margarita/20 bg-[#0b1026]/70 px-5 py-4 text-center text-2xl text-margarita placeholder:text-margarita/25 focus:border-tulipan-amarillo/60 focus:outline-none"
            />

            <button
              type="submit"
              disabled={escribiendo.trim() === ''}
              className="mt-5 w-full rounded-full px-8 py-4 font-display text-lg transition disabled:border disabled:border-margarita/20 disabled:bg-transparent disabled:text-margarita/35 enabled:bg-tulipan-amarillo enabled:text-[#0b1026] enabled:hover:-translate-y-0.5"
            >
              {BAUTIZO.boton}
            </button>

            <button
              type="button"
              onClick={() => bautizar('')}
              className="mt-4 text-center text-sm text-margarita/45 underline decoration-margarita/20 underline-offset-4"
            >
              {BAUTIZO.saltar}
            </button>

            <p className="fuente-mano mt-5 text-center text-base text-margarita/40">
              {BAUTIZO.pie}
            </p>
          </form>
        </div>
      ) : null}

      {/* ── El cartel del capítulo, con su retrato ────────────────── */}
      {fase === 'cartel' ? (
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
                {conElNombre(parrafo)}
              </p>
            ))}

            {/* Cómo se juega va solo en el primero: después ya lo sabe. */}
            {capitulo.numero === 1 ? (
              <div className="mt-6 border-t border-margarita/15 pt-5">
                {CARTEL.parrafos.map((parrafo, i) => (
                  <p key={i} className="mt-3 text-[0.9rem] leading-relaxed text-margarita/60">
                    {conElNombre(parrafo)}
                  </p>
                ))}
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => setFase('jugando')}
              className="mt-8 w-full rounded-full bg-tulipan-amarillo px-8 py-4 font-display text-lg text-[#0b1026] transition-transform hover:-translate-y-0.5"
            >
              {capitulo.presentacion.boton}
            </button>

            <p className="fuente-mano mt-4 text-center text-base text-margarita/45">
              {conElNombre(CARTEL.pie)}
            </p>
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

      {/* ── El cierre del capítulo ────────────────────────────────── */}
      {llegada && esElFinal ? (
        /* Arriba no hay cartel de cierre y no hay fondo que tape: el
           canvas se quedó congelado con la luna quieta y ella sentada
           encima, y la carta se abre sobre eso. Los pasitos y las
           caídas van adentro de la carta, que es donde significan
           algo, y son los de todas las veces: lo que mide subir tres
           capítulos no es la última subida. */
        <CartaDeLaLuna
          pasitos={totales?.pasitos ?? llegada.pasitos}
          caidas={totales?.caidas ?? llegada.caidas}
          antesala={conElNombre(capitulo.cierre.texto)}
          marcador={marcador}
        />
      ) : llegada ? (
        <div className="absolute inset-0 overflow-y-auto bg-[#0b1026]/88 px-6 py-10 backdrop-blur-[2px]">
          <div className="anima-aparecer mx-auto flex min-h-full max-w-md flex-col justify-center text-center">
            {retrato ? (
              <img src={retrato} alt="" className="mx-auto mb-4 h-32 w-32 object-contain" />
            ) : null}

            <h2 className="font-display text-3xl text-tulipan-amarillo">{capitulo.cierre.titulo}</h2>

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

            {marcador}

            <p className="mt-6 text-left text-[0.95rem] leading-relaxed text-margarita/75">
              {conElNombre(capitulo.cierre.texto)}
            </p>

            {siguiente ? (
              <button
                type="button"
                onClick={alSiguiente}
                className="mt-8 w-full rounded-full bg-tulipan-amarillo px-8 py-4 font-display text-lg text-[#0b1026] transition-transform hover:-translate-y-0.5"
              >
                {TEXTOS.seguir} {siguiente.nombre}
              </button>
            ) : null}
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
