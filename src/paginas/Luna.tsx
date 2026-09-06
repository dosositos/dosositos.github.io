import { useReducedMotion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { CartaDeLaLuna } from '@/componentes/CartaDeLaLuna'
import { EscuelitaDeLaLuna } from '@/componentes/EscuelitaDeLaLuna'
import { HistoriaDeLaTortuga } from '@/componentes/HistoriaDeLaTortuga'
import { InterruptorDeSonido } from '@/componentes/InterruptorDeSonido'
import { MarcadorDeLaLuna } from '@/componentes/MarcadorDeLaLuna'
import { RoperoDeLaTortuga } from '@/componentes/RoperoDeLaTortuga'
import {
  AYUDA,
  BAUTIZO,
  CAPITULOS,
  CARTEL,
  ESCUELITA,
  TEXTOS,
  TEXTOS_DEL_ROPERO,
} from '@/content/luna'
import { crearPintor } from '@/juego-luna/dibujo'
import { conectarEntrada } from '@/juego-luna/entrada'
import { crearMotor, type Motor } from '@/juego-luna/motor'
import { capituloNumero, construirNivel, ULTIMO_CAPITULO } from '@/juego-luna/mundos'
import { arrancarMusica, atenderElCambioDePestana, pararMusica } from '@/juego-luna/musica'
import { conNombre } from '@/juego-luna/nombrar'
import {
  anotarCapitulo,
  anotarEscuelita,
  anotarLlegada,
  conCualEntra,
  LARGO_DEL_NOMBRE,
  leerProgreso,
  ponerle,
  ponerleNombre,
} from '@/juego-luna/progreso'
import { loPuesto } from '@/juego-luna/ropero'
import { sonar } from '@/juego-luna/sonidos'
import { RETRATOS } from '@/lib/retratos'
import type { EventoLuna, ProgresoLuna, RanuraDeLaTortuga } from '@/types'

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

/**
 * Las pantallas de antes de jugar, en orden.
 *
 * `historia` es por qué una tortuga, y sale cada vez que se entra por
 * el capítulo uno: la primera de todas y cada vez que se vuelve a
 * empezar. `escuelita` son las siete clases, y esa sí es una sola vez
 * por teléfono.
 *
 * El bautizo va **entre las dos**, y ese es el orden que importa: la
 * historia termina en que todavía no tiene nombre, y de ahí se pasa a
 * ponérselo. Preguntándolo antes, ese remate no existe; preguntándolo
 * después de las siete clases, ella ya jugó media hora con una tortuga
 * sin nombre y la pregunta llega tarde.
 */
type Fase = 'historia' | 'escuelita' | 'bautizo' | 'cartel' | 'jugando'

export function Luna() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cajaRef = useRef<HTMLDivElement>(null)
  /**
   * El motor de la partida de ahora, para poder darle el aviso de
   * empezar desde fuera del efecto que lo crea.
   */
  const motorRef = useRef<Motor | null>(null)
  /**
   * Y el pintor, por lo mismo: la ropa de la tortuga se cambia a mitad
   * de partida y ponerla por aquí evita tirar el nivel entero, con su
   * cielo y su decorado sembrados, cada vez que ella se prueba un gorro.
   */
  const pintorRef = useRef<ReturnType<typeof crearPintor> | null>(null)
  const menosMovimiento = useReducedMotion()

  /** Lo que había guardado al abrir. De aquí sale con cuál se entra. */
  const [guardado, setGuardado] = useState<ProgresoLuna>(() => leerProgreso())

  const [numero, setNumero] = useState(() => conCualEntra(leerProgreso(), ULTIMO_CAPITULO))
  const capitulo = useMemo(() => capituloNumero(numero), [numero])
  const nivel = useMemo(() => construirNivel(capitulo), [capitulo])

  /**
   * Por dónde se entra.
   *
   * Entrando por el capítulo uno se entra por la historia, siempre:
   * dura menos de un minuto, se salta con un botón y es lo que le da
   * sentido a que la que sube sea una tortuga. Entrando por el dos o
   * el tres —o sea, volviendo a media vuelta— no: eso es retomar, y a
   * quien retoma no se le vuelve a contar el principio.
   *
   * El nombre se pregunta una sola vez, la primera de todas. Si lo deja
   * para después queda vacío y se le vuelve a preguntar la próxima,
   * que es la única manera de cambiarlo: no hay pantalla de ajustes.
   */
  const [fase, setFase] = useState<Fase>(() => {
    const guardado = leerProgreso()
    if (conCualEntra(guardado, ULTIMO_CAPITULO) === 1) return 'historia'
    return guardado.nombre ? 'cartel' : 'bautizo'
  })

  /** Lo que va escribiendo en la casilla del nombre. */
  const [escribiendo, setEscribiendo] = useState('')

  /** El ropero abierto encima del cartel. */
  const [vistiendo, setVistiendo] = useState(false)

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

  /* ── La música de fondo ─────────────────────────────────────────
     Vive acá arriba y no adentro de cada pantalla porque tiene que
     seguir sonando de la historia a la escuelita y de un capítulo al
     siguiente, y todas esas son pantallas distintas del mismo
     componente. Al salir de /luna se para, y el `return` del efecto es
     el único sitio del que se puede saber que se salió.

     Arranca con el primer toque de ella, sea cual sea. No es una
     preferencia: el navegador no deja que una página empiece a sonar
     sola, y en el juego el primer toque llega enseguida porque para ir
     a cualquier parte hay que tocar algo. Si ese primer intento no
     prospera —el navegador todavía no lo daba por bueno—, el toque
     siguiente lo vuelve a intentar. */
  useEffect(() => {
    const alTocar = () => void arrancarMusica()
    window.addEventListener('pointerdown', alTocar)
    window.addEventListener('keydown', alTocar)

    const olvidarLaPestana = atenderElCambioDePestana()

    return () => {
      window.removeEventListener('pointerdown', alTocar)
      window.removeEventListener('keydown', alTocar)
      olvidarLaPestana()
      pararMusica()
    }
  }, [])

  /** El nombre que ella le puso, o vacío mientras no le puso ninguno. */
  const nombre = guardado.nombre
  const conElNombre = (texto: string) => conNombre(texto, nombre)

  const empezado = fase === 'jugando'

  /**
   * Si el canvas del capítulo está puesto en la pantalla.
   *
   * La historia y la escuelita se van por su propio `return` más abajo,
   * con su canvas y su bucle, y mientras están puestas el canvas de acá
   * no existe. Al volver hay que montar el motor otra vez, y sin este
   * aviso el efecto no se enteraba: sus dependencias eran el capítulo y
   * el nivel, y ninguno de los dos cambia por salir de la escuelita.
   *
   * Eso dejaba la pantalla en negro desde el cartel de Boo en adelante:
   * el canvas estaba ahí y no lo pintaba nadie. Se vio vistiendo a la
   * tortuga antes de empezar, que es el camino más largo hasta el
   * cartel y por eso el más fácil de notar.
   *
   * Va como un sí o un no y no como la fase entera a propósito: la fase
   * también cambia de `cartel` a `jugando`, y metiéndola en las
   * dependencias, darle a «empezar» tiraría el motor y montaría uno
   * nuevo. Esto se enciende una vez y se queda encendido.
   */
  const conCanvas = fase !== 'historia' && fase !== 'escuelita'

  useEffect(() => {
    const canvas = canvasRef.current
    const caja = cajaRef.current
    if (!canvas || !caja) return

    const pintor = crearPintor(canvas, nivel)
    pintor.movimientoReducido = menosMovimiento ?? false
    pintor.puesto = loPuesto(leerProgreso())
    pintorRef.current = pintor

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
      // El sonido, antes que nada y para todos los eventos de una vez:
      // si está apagado —que es como viene— no hace nada, y si está
      // encendido cada cosa sabe sola cómo suena. Quién suena y quién
      // no vive en `sonidos.ts`, junto a la receta; repartir eso por
      // este if de acá abajo sería tener el catálogo en dos sitios.
      sonar(evento)

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
        const ahora = anotarCapitulo(capitulo.numero, cuenta.pasitos, cuenta.caidas)

        if (numero === ULTIMO_CAPITULO) {
          // Llegó arriba: se anota la llegada y **empieza otra
          // vuelta**. De aquí para adelante vuelve a entrar por el
          // capítulo de Boo, porque un juego que se acaba y no se
          // puede volver a empezar se juega una sola vez en la vida.
          //
          // Lo que la carta enseña son los números de **antes** de
          // borrar: los pasitos de esta subida, que es de lo que
          // habla. Lo ganado no se borra nunca, eso lo cuida
          // `anotarLlegada`.
          const { antes, ahora: deNuevo } = anotarLlegada()
          setTotales(antes)
          setGuardado(deNuevo)
        } else {
          setTotales(ahora)
          // Y esto es lo que abre el ropero: ganar el capítulo, o
          // ganárselo sin caerse, o igualarle el récord, desbloquea
          // cosas. Sin este aviso ella cerraría el capítulo, entraría
          // al ropero y vería lo que acaba de ganarse bajo llave.
          setGuardado(ahora)
        }
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
      pintorRef.current = null
      olvidarRelojes()
      window.clearTimeout(relojDeLaAyuda)
      window.visualViewport?.removeEventListener('resize', medir)
      window.visualViewport?.removeEventListener('scroll', medir)
      window.removeEventListener('orientationchange', medir)
    }
  }, [capitulo, conCanvas, menosMovimiento, nivel])

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

  /**
   * Ponerse o quitarse algo. Se guarda al instante y se le pasa al
   * pintor, así lo que se ve en el ropero y lo que se ve jugando son la
   * misma tortuga sin que haya que cerrar nada.
   */
  const ponerse = (ranura: RanuraDeLaTortuga, id: string) => {
    const ahora = ponerle(ranura, id)
    setGuardado(ahora)
    if (pintorRef.current) pintorRef.current.puesto = loPuesto(ahora)
  }

  /**
   * Lo que toca después de la historia y después del bautizo: la
   * escuelita si nunca la vio, y si ya la vio, el cartel del capítulo.
   *
   * Vive en un sitio solo porque lo preguntan los dos. Escrito dos
   * veces, el día que se cambie una de las dos ella entraría a la
   * escuelita desde la historia y no desde el bautizo, o al revés.
   */
  const trasLaPresentacion = (progreso: ProgresoLuna): Fase =>
    progreso.escuelita === 'pendiente' ? 'escuelita' : 'cartel'

  /** Guardar el nombre y seguir. Vacío es «mejor después». */
  const bautizar = (puesto: string) => {
    const ahora = ponerleNombre(puesto)
    setGuardado(ahora)
    setFase(trasLaPresentacion(ahora))
  }

  /**
   * Se acabó la historia. Si todavía no la bautizó, ahí va la
   * pregunta, que es justo donde el último cuadro la deja.
   */
  const trasLaHistoria = () => {
    const ahora = leerProgreso()
    setFase(ahora.nombre ? trasLaPresentacion(ahora) : 'bautizo')
  }

  /**
   * Se acabó la escuelita, o se la saltó. Las dos cosas se anotan para
   * no volver a ofrecérsela, y se anota cuál de las dos fue: al cartel
   * de Boo se le quita el «cómo se juega» solo a quien la hizo.
   */
  const trasLaEscuelita = (como: 'hecha' | 'saltada') => {
    setGuardado(anotarEscuelita(como))
    setFase('cartel')
  }

  /**
   * Volver a subir, desde la carta.
   *
   * El progreso ya se reinició al pisar la luna, así que acá no hay
   * nada que borrar: solo hay que volver a poner la página en el
   * capítulo uno y devolverla a la historia, que es por donde empieza
   * una vuelta. La escuelita no vuelve a salir — esa fue una vez.
   */
  const volverASubir = () => {
    setLlegada(null)
    setTotales(null)
    setAyudaVisible(true)
    setJugando(false)
    setNumero(1)
    setFase('historia')
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

  /* ── La historia y la escuelita, antes que nada ──────────────────
     Salen con `return` propio y no montadas encima del juego: cada una
     tiene su canvas y su bucle, y tener los dos corriendo a la vez
     sería pintar dos juegos en la misma pantalla para que se vea uno.
     Al terminar, la página vuelve por su camino de siempre y el motor
     del capítulo nace ahí, limpio. */
  if (fase === 'historia') return <HistoriaDeLaTortuga alTerminar={trasLaHistoria} />
  if (fase === 'escuelita') return <EscuelitaDeLaLuna alSalir={trasLaEscuelita} />

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

            {/* Cómo se juega, solo en el primero **y solo para quien no
                pasó por la escuelita**. Con las siete clases hechas
                esto sobra: ya lo probó con el dedo, que es la única
                manera de aprender a medir una barra de fuerza. Y a
                quien se las saltó se le deja, porque es lo único que
                le queda explicándole el juego. Esto es lo que le
                saca el bulto al cartel de Boo, que llevaba la historia
                de Boo y el manual apilados uno sobre el otro. */}
            {capitulo.numero === 1 && guardado.escuelita !== 'hecha' ? (
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

            {/* El ropero, debajo y en pequeño. Va después del botón de
                empezar a propósito: vestirla es lo de al lado, no el
                camino. La primera vez que abra el juego lo que tiene que
                hacer es subir, no elegir gorro. */}
            <button
              type="button"
              onClick={() => setVistiendo(true)}
              className="mt-4 self-center rounded-full border border-margarita/25 px-5 py-2 text-sm text-margarita/60 transition-colors hover:border-tulipan-amarillo/60 hover:text-tulipan-amarillo"
            >
              {TEXTOS_DEL_ROPERO.abrir}
            </button>

            {/* Y el sonido, todavía más chiquito y todavía más abajo.
                Está en el cartel de los tres capítulos y no una sola
                vez al principio, porque la decisión cambia según dónde
                esté: lo que en la casa se enciende, en el bus se apaga. */}
            <InterruptorDeSonido className="mt-3" />

            <p className="fuente-mano mt-4 text-center text-base text-margarita/45">
              {conElNombre(CARTEL.pie)}
            </p>
          </div>
        </div>
      ) : null}

      {/* ── El ropero ─────────────────────────────────────────────
          Encima del cartel y no en vez de él: al cerrarlo vuelve a
          donde estaba, con el botón de empezar todavía sin tocar. */}
      {vistiendo ? (
        <RoperoDeLaTortuga
          progreso={guardado}
          nombre={nombre}
          alPonerse={ponerse}
          alCerrar={() => setVistiendo(false)}
        />
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
          alVolverASubir={volverASubir}
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
