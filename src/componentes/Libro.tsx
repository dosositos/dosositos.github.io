import { animate, motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from 'motion/react'
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type Ref,
} from 'react'

/**
 * EL LIBRO — el motor de páginas del diccionario.
 *
 * No sabe nada de palabras: recibe páginas ya armadas y se encarga de
 * que se sientan papel.
 *
 * ── Cómo está hecho, y por qué así ──────────────────────────────
 *
 * El libro es una PILA DE HOJAS de verdad. Cada hoja se arma una vez,
 * con su contenido pegado para siempre, y lo único que cambia es su
 * ángulo: 0 si todavía no la pasaste, -180 si ya la pasaste, y en el
 * medio la que estás dando vuelta con el dedo.
 *
 * La primera versión no era así: había tres capas fijas —la de abajo,
 * la que gira y la de atrás— y al terminar cada giro se les cambiaba el
 * contenido y se devolvía el ángulo a cero. Eso funciona hasta que un
 * cuadro llega desfasado, y entonces se ve por un instante la página
 * que viene: el parpadeo. Con la pila ese error no puede existir,
 * porque al terminar el giro no se mueve ni se reemplaza nada — la
 * hoja simplemente se queda donde ya estaba.
 *
 * Lo que hace que se sienta papel y no una animación:
 *
 *   1. La hoja sigue el dedo. Al soltar decide si termina de pasar o
 *      si se devuelve, según qué tan lejos la llevaste y con cuánta
 *      fuerza.
 *   2. El bloque cambia de grosor: el canto derecho adelgaza y el
 *      izquierdo engorda mientras avanzás.
 *   3. La hoja se arquea al doblarse — se acorta, se comba, se le
 *      curva la esquina de afuera y le corre un brillo por el pliegue.
 *   4. El lomo hunde el papel con un canal oscuro en el borde de
 *      adentro, y la hoja levantada tira sombra sobre la de abajo.
 *
 * En el teléfono cada hoja lleva una página y se lee de a una; en
 * pantalla ancha lleva dos, el libro se abre de par en par y el lomo
 * queda al medio.
 */

export interface PaginaLibro {
  id: string
  /** Lo que se ve en la página. */
  contenido: ReactNode
  /** La palabra guía de la cabecera, como en los diccionarios. */
  guia?: string
  /** A qué pestaña del canto pertenece esta hoja. */
  letra?: string
}

/** Lo que el libro deja hacer desde afuera: saltar a una página. */
export interface ManejoLibro {
  irA: (indice: number) => void
}

/** Cuánto hay que arrastrar (del ancho de la página) para que pase. */
const UMBRAL = 0.28
/**
 * Cuánto tiene que recorrer el dedo antes de que el libro se dé por
 * aludido. Por debajo de esto, tocar el papel no mueve nada.
 */
const ZONA_MUERTA = 14
/**
 * Qué tan dura está la hoja. Con 1 el papel sigue al dedo milímetro a
 * milímetro y se sentía nervioso; con 1.45 hay que llevarlo casi media
 * página de más para darlo vuelta, que es como pesa un libro.
 */
const DUREZA = 1.45
/** A partir de esta velocidad la hoja pasa aunque la hayás soltado antes. */
const VELOCIDAD_MINIMA = 320
/** Cuántas hojas se montan alrededor de la actual. El resto no existe. */
const VENTANA = 3

/* ═══════════════════════════════════════════════════════════════
   UNA HOJA
   ═══════════════════════════════════════════════════════════════ */

function Hoja({
  frente,
  dorso,
  indice,
  pasadas,
  giro,
  doble,
  total,
  enContratapa,
}: {
  frente: ReactNode
  dorso: ReactNode
  indice: number
  pasadas: number
  giro: MotionValue<number>
  doble: boolean
  total: number
  enContratapa: boolean
}) {
  /**
   * El ángulo de esta hoja.
   *
   * Las que ya pasaste están a -180 y ahí se quedan; las que faltan, a
   * 0. Solo la de arriba de la pila —y la última pasada, si vas hacia
   * atrás— se mueven con el dedo.
   */
  const activaAdelante = indice === pasadas
  const activaAtras = indice === pasadas - 1

  const rotacion = useTransform(giro, (p) => {
    if (activaAdelante && p > 0) return -180 * p
    if (activaAtras && p < 0) return -180 * (1 + p)
    return indice < pasadas ? -180 : 0
  })

  const enMovimiento = useTransform(giro, (p) =>
    (activaAdelante && p > 0) || (activaAtras && p < 0) ? Math.abs(p) : 0,
  )

  // El papel se acorta, se comba y se le curva la esquina de afuera:
  // un papel no gira como una tabla.
  const encogido = useTransform(enMovimiento, (m) => 1 - 0.055 * Math.sin(m * Math.PI))
  const combado = useTransform(enMovimiento, (m) => -Math.sin(m * Math.PI) * 1.15)
  const luz = useTransform(enMovimiento, (m) => Math.sin(m * Math.PI) * 0.55)
  const bulto = useTransform(enMovimiento, (m) => Math.sin(m * Math.PI) * 0.4)
  const esquinaCurva = useTransform(enMovimiento, (m) => {
    const c = Math.sin(m * Math.PI)
    return `3px ${9 + c * 30}px ${7 + c * 24}px 4px / 4px ${6 + c * 40}px ${10 + c * 30}px 3px`
  })

  /**
   * El orden de la pila.
   *
   * Las que faltan van de mayor a menor según se alejan (la de arriba
   * manda), y las pasadas al revés, para que la última que diste vuelta
   * quede encima de las anteriores.
   */
  const z = indice >= pasadas ? total - indice : total + indice

  /* Al pasar la última hoja, el bloque de hojas volteadas se guarda y
     queda la contratapa sola. Vuelve a la vista en cuanto empezás a
     retroceder — de ahí que dependa del giro y no solo del estado. */
  const visible = useTransform(giro, (p) => (enContratapa && p === 0 ? 'hidden' : 'visible'))

  return (
    <motion.div
      // Marca cuál es la hoja de arriba de la pila: la usan las pruebas
      // de private/notas para leer lo que de verdad se está viendo.
      data-activa={activaAdelante ? 'si' : 'no'}
      className={`hoja ${doble ? 'left-1/2 w-1/2' : ''}`}
      style={{
        rotateY: rotacion,
        scaleX: encogido,
        skewY: combado,
        transformOrigin: 'left center',
        zIndex: z,
        visibility: visible,
      }}
    >
      <motion.div
        className="cara papel-libro"
        data-cara="frente"
        style={{ borderRadius: esquinaCurva }}
      >
        {frente}
        <div className="lomo-sombra" data-lado="izq" />
        <motion.div
          className="pliegue"
          style={{
            opacity: luz,
            background:
              'linear-gradient(to left, rgba(255,248,230,0.55), rgba(120,90,55,0.12) 30%, rgba(60,40,20,0.35))',
          }}
        />
        {/* El bulto: la hoja doblada se abomba y ahí le pega la luz. */}
        <motion.div
          className="pliegue"
          style={{
            opacity: bulto,
            background:
              'radial-gradient(120% 78% at 62% 50%, rgba(255,250,235,0.5), rgba(255,250,235,0.12) 45%, rgba(90,62,32,0.28) 100%)',
          }}
        />
      </motion.div>

      {/* El dorso. En pantalla ancha lleva la página siguiente de
          verdad; en el teléfono es el reverso del papel, con la tinta
          que trasluce — que es lo que se ve al levantar una hoja. */}
      <motion.div
        className="cara papel-libro"
        data-cara="dorso"
        style={{ borderRadius: esquinaCurva }}
      >
        {dorso}
        <div className="lomo-sombra" data-lado={doble ? 'der' : 'izq'} />
        <motion.div
          className="pliegue"
          style={{
            opacity: luz,
            background:
              'linear-gradient(to right, rgba(255,248,230,0.4), rgba(120,90,55,0.1) 30%, rgba(60,40,20,0.3))',
          }}
        />
      </motion.div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   EL LIBRO
   ═══════════════════════════════════════════════════════════════ */

export function Libro({
  paginas,
  portada,
  contratapa,
  className = '',
  alCambiar,
  alAbrir,
  pestanas,
  letraActual,
  ref,
}: {
  paginas: PaginaLibro[]
  /** La tapa. Si no la hay, el libro arranca abierto. */
  portada?: ReactNode
  /** Lo que dice la contratapa, al fondo de todo. */
  contratapa?: ReactNode
  className?: string
  /** Avisa qué página quedó a la vista, para el índice y las pestañas. */
  alCambiar?: (indice: number) => void
  /** Avisa cuando la tapa se abre: con el libro cerrado no hay índice. */
  alAbrir?: () => void
  /** El índice alfabético, recortado en el canto. */
  pestanas?: { letra: string; indice: number }[]
  /** Cuál de esas letras está abierta ahora. */
  letraActual?: string | null
  /** Para saltar de afuera. */
  ref?: Ref<ManejoLibro>
}) {
  const sinMovimiento = useReducedMotion()
  const [doble, setDoble] = useState(false)
  const [abierto, setAbierto] = useState(!portada)
  /** Cuántas hojas están dadas vuelta. Es todo el estado del libro. */
  const [pasadas, setPasadas] = useState(0)
  const [girando, setGirando] = useState(false)

  const caja = useRef<HTMLDivElement>(null)
  const arrastre = useRef<{
    x0: number
    y0: number
    t0: number
    /** Si ya se sabe hacia dónde va el gesto. */
    decidido: boolean
    /** Si ese gesto resultó ser pasar la hoja (y no rodar el papel). */
    pasando: boolean
    id: number
  } | null>(null)

  /** -1 … 0 … 1 — cuánto lleva girado la hoja activa. */
  const giro = useMotionValue(0)

  /* ── Pantalla ancha: el libro se abre de par en par ───────────── */
  useEffect(() => {
    const consulta = window.matchMedia('(min-width: 1024px)')
    const aplicar = () => setDoble(consulta.matches)
    aplicar()
    consulta.addEventListener('change', aplicar)
    return () => consulta.removeEventListener('change', aplicar)
  }, [])

  /** Páginas por hoja: una en el teléfono, dos abierto de par en par. */
  const porHoja = doble ? 2 : 1
  const totalHojas = Math.ceil(paginas.length / porHoja)

  // Se pueden pasar todas las hojas, incluida la última: al voltearla
  // queda a la vista el fondo del libro, que es la contratapa.
  const hayAdelante = pasadas < totalHojas
  /** Pasaste la última hoja: lo que se ve es la contratapa, sola. */
  const enContratapa = pasadas >= totalHojas
  const hayAtras = pasadas > 0

  // La página que se está leyendo, para el índice de afuera.
  useEffect(() => {
    alCambiar?.(pasadas * porHoja)
  }, [pasadas, porHoja, alCambiar])

  // Al cambiar de teléfono a pantalla ancha (o al revés) cambia cuántas
  // páginas entran por hoja: hay que recolocarse en la misma página.
  const paginaActual = useRef(0)
  useEffect(() => {
    paginaActual.current = pasadas * porHoja
  }, [pasadas, porHoja])
  useEffect(() => {
    setPasadas(Math.floor(paginaActual.current / porHoja))
  }, [porHoja])

  /* ── Pasar la hoja ────────────────────────────────────────────── */
  const completar = useCallback(
    (hacia: 1 | -1) => {
      if (girando) return
      if (hacia === 1 && !hayAdelante) return
      if (hacia === -1 && !hayAtras) return

      setGirando(true)

      const terminar = () => {
        // No hay nada que reacomodar: la hoja se queda donde quedó y
        // solo cambia el número de hojas pasadas. Por eso no parpadea.
        setPasadas((p) => p + hacia)
        giro.set(0)
        setGirando(false)
      }

      if (sinMovimiento) {
        terminar()
        return
      }

      // El recorrido siempre empieza en 0 y termina en el lado que
      // corresponde: 1 hacia adelante, -1 hacia atrás. Antes, hacia
      // atrás, se arrancaba en -1 y se animaba hasta 0 — o sea al revés:
      // la hoja se desvolteaba y en el último cuadro, con el giro ya en
      // cero pero las hojas pasadas sin actualizar, saltaba de vuelta a
      // la página en la que estabas. Ese era el rebote de ir atrás.
      animate(giro, hacia, {
        duration: 0.62,
        ease: [0.29, 0.72, 0.26, 1],
      }).then(terminar)
    },
    [girando, hayAdelante, hayAtras, giro, sinMovimiento],
  )

  const volver = useCallback(
    (desde: number) => {
      animate(giro, desde < 0 ? -1 : 0, { type: 'spring', stiffness: 260, damping: 30 }).then(() =>
        giro.set(0),
      )
    },
    [giro],
  )

  /* ── Saltar a una letra desde las pestañas del canto ───────────── */
  const irA = useCallback(
    (indice: number) => {
      if (girando) return
      setAbierto(true)
      alAbrir?.()
      giro.set(0)
      setPasadas(Math.min(Math.max(0, Math.floor(indice / porHoja)), Math.max(0, totalHojas - 1)))
    },
    [girando, giro, porHoja, totalHojas, alAbrir],
  )

  useImperativeHandle(ref, () => ({ irA }), [irA])

  /* ── El dedo ──────────────────────────────────────────────────────
     Tocar no es arrastrar. El dedo tiene que recorrer un trecho —y en
     horizontal— antes de que la hoja se mueva un milímetro.

     Antes se capturaba el puntero apenas apoyabas el dedo, y eso traía
     tres males: la hoja saltaba con cualquier roce, el gesto peleaba con
     el scroll de la página, y el papel no se podía rodar por dentro
     porque la captura se comía el movimiento. Ahora el puntero se
     captura recién cuando quedó claro que el gesto es horizontal; si es
     vertical, el libro no se mete y deja rodar. */
  const alBajar = (e: React.PointerEvent) => {
    if (girando || sinMovimiento || !abierto) return
    // El arrastre no debe robarle el gesto a un enlace o a un botón.
    if ((e.target as HTMLElement).closest('a,button')) return
    arrastre.current = {
      x0: e.clientX,
      y0: e.clientY,
      t0: performance.now(),
      decidido: false,
      pasando: false,
      id: e.pointerId,
    }
  }

  const alMover = (e: React.PointerEvent) => {
    const a = arrastre.current
    if (!a || !caja.current) return

    const dx = e.clientX - a.x0
    const dy = e.clientY - a.y0

    if (!a.decidido) {
      // Todavía no se sabe qué quiere hacer el dedo.
      if (Math.abs(dx) < ZONA_MUERTA && Math.abs(dy) < ZONA_MUERTA) return
      a.decidido = true
      // Vertical, o en diagonal dudosa: es scroll, no es pasar hoja.
      if (Math.abs(dx) < Math.abs(dy) * 1.2) {
        arrastre.current = null
        return
      }
      a.pasando = true
      ;(e.currentTarget as HTMLElement).setPointerCapture(a.id)
    }

    if (!a.pasando) return

    // El recorrido cuenta desde donde se decidió, no desde donde se
    // apoyó el dedo: si no, la hoja pega un salto de golpe.
    const util = dx - Math.sign(dx) * ZONA_MUERTA
    const ancho = (caja.current.offsetWidth / (doble ? 2 : 1)) * DUREZA
    let p = -util / ancho
    if (p > 0 && !hayAdelante) p = 0
    if (p < 0 && !hayAtras) p = 0
    giro.set(Math.max(-1, Math.min(1, p)))
  }

  const alSoltar = (e: React.PointerEvent) => {
    const a = arrastre.current
    if (!a || !caja.current) return
    arrastre.current = null
    if (!a.pasando) return

    const ancho = (caja.current.offsetWidth / (doble ? 2 : 1)) * DUREZA
    const recorrido = -(e.clientX - a.x0)
    const segundos = Math.max(0.001, (performance.now() - a.t0) / 1000)
    const velocidad = recorrido / segundos
    const p = giro.get()
    if (p === 0) return

    const pasaPorFuerza = Math.abs(velocidad) > VELOCIDAD_MINIMA && Math.sign(velocidad) === Math.sign(p)
    const pasaPorDistancia = Math.abs(p) > UMBRAL
    const hacia: 1 | -1 = p > 0 ? 1 : -1
    const puede = hacia === 1 ? hayAdelante : hayAtras

    if ((pasaPorFuerza || pasaPorDistancia) && puede) {
      setGirando(true)
      const meta = hacia === 1 ? 1 : -1
      animate(giro, meta, {
        duration: 0.34 * (1 - Math.abs(p)) + 0.2,
        ease: [0.3, 0.7, 0.3, 1],
      }).then(() => {
        setPasadas((q) => q + hacia)
        giro.set(0)
        setGirando(false)
      })
      return
    }
    volver(p)
  }

  /* ── Teclado ──────────────────────────────────────────────────── */
  useEffect(() => {
    if (!abierto) return
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') completar(1)
      if (e.key === 'ArrowLeft') completar(-1)
    }
    window.addEventListener('keydown', alTeclear)
    return () => window.removeEventListener('keydown', alTeclear)
  }, [abierto, completar])

  /* ── El grosor del bloque ─────────────────────────────────────── */
  const grosor = useMemo(() => {
    const leido = totalHojas > 0 ? Math.min(1, pasadas / totalHojas) : 0
    /* En la contratapa no hay cantos: el libro se ve por detrás, no
       abierto. Y del lado izquierdo siempre hay cuerpo, incluso en la
       primera página — ahí lo que se ve es la tapa con sus guardas, no
       un borde suelto en el aire. */
    if (enContratapa) return { izq: 0, der: 0 }
    return { izq: 22 + leido * 20, der: 2 + (1 - leido) * 34 }
  }, [pasadas, totalHojas, enContratapa])

  /** Las hojas que se montan: la de arriba y unas pocas a cada lado. */
  const hojas = useMemo(() => {
    const desde = Math.max(0, pasadas - VENTANA)
    const hasta = Math.min(totalHojas - 1, pasadas + VENTANA)
    const lista = []
    for (let i = desde; i <= hasta; i++) {
      lista.push({
        indice: i,
        frente: paginas[i * porHoja]?.contenido ?? null,
        dorso: doble ? (paginas[i * porHoja + 1]?.contenido ?? null) : null,
        reverso: paginas[i * porHoja]?.contenido ?? null,
      })
    }
    return lista
  }, [pasadas, totalHojas, paginas, porHoja, doble])

  /* ── La tapa cerrada ──────────────────────────────────────────── */
  if (!abierto && portada) {
    return (
      <div className={`escena-libro ${className}`}>
        <motion.button
          type="button"
          onClick={() => {
            setAbierto(true)
            alAbrir?.()
          }}
          className="cuerpo-libro tapa-libro block w-full cursor-pointer rounded-l-sm rounded-r-md text-left"
          whileHover={sinMovimiento ? undefined : { scale: 1.015, rotateY: -3 }}
          whileTap={{ scale: 0.995 }}
          transition={{ type: 'spring', stiffness: 220, damping: 24 }}
          aria-label="Abrir el diccionario"
        >
          <div className="filete-dorado" />
          <div className="lomo-cuero absolute inset-y-0 left-0 w-[5%] rounded-l-sm" />
          {portada}
        </motion.button>
      </div>
    )
  }

  return (
    <div className={`escena-libro ${className}`}>
      <div
        ref={caja}
        data-doble={doble ? 'si' : 'no'}
        className="cuerpo-libro touch-pan-y select-none"
        onPointerDown={alBajar}
        onPointerMove={alMover}
        onPointerUp={alSoltar}
        onPointerCancel={alSoltar}
      >
        {/* ── El canto: el grosor de lo leído y de lo que falta ──
            Los dos se van hasta fuera de la pantalla y se apagan contra
            el fondo, para que el libro no se lea como un objeto chiquito
            recortado en el aire sino como uno grande al que le estamos
            mirando una hoja de cerca. */}
        <div className="canto" data-lado="izq" style={{ right: '100%', width: `${grosor.izq}px` }} />
        <div className="canto" data-lado="der" style={{ left: '100%', width: `${grosor.der}px` }} />

        {/* ── La contratapa ──
            Es el fondo del libro: lo que queda debajo de todas las hojas,
            y lo que se ve cuando pasás la última. Va en cuero, como la
            tapa, porque eso es — la misma pieza por el otro lado. */}
        <div className="tapa-libro papel-quieto absolute inset-0 overflow-hidden rounded-r-md rounded-l-sm">
          <div className="filete-dorado" />
          <div className="lomo-cuero absolute inset-y-0 left-0 w-[4%]" />
          {contratapa}
        </div>

        {/* ── La pila de hojas ── */}
        {hojas.map((h) => (
          <Hoja
            key={h.indice}
            indice={h.indice}
            pasadas={pasadas}
            giro={giro}
            doble={doble}
            total={totalHojas}
            enContratapa={enContratapa}
            frente={h.frente}
            dorso={
              doble ? (
                h.dorso
              ) : (
                <div className="h-full w-full scale-x-[-1] opacity-[0.07] blur-[0.6px]">
                  {h.reverso}
                </div>
              )
            }
          />
        ))}

        {/* ── Las pestañas del índice ──
            Recortadas en el canto de las hojas que faltan, montadas un
            poco sobre el papel, como las uñas de un diccionario. */}
        {pestanas && pestanas.length > 0 && !enContratapa && (
          <nav aria-label="Índice alfabético" className="tira-pestanas">
            {pestanas.map(({ letra, indice }) => (
              <button
                key={letra}
                type="button"
                onClick={() => irA(indice)}
                data-activa={letraActual === letra ? 'si' : 'no'}
                className="pestana"
                aria-label={`Ir a la letra ${letra}`}
              >
                {letra}
              </button>
            ))}
          </nav>
        )}
      </div>

      {/* ── Los botones ─────────────────────────────────────────────
          Siempre debajo del libro. Encima del papel tapaban el texto, y
          a los costados chocaban con las pestañas del índice. */}
      <div className="mt-4 flex justify-center gap-8">
        <button
          type="button"
          onClick={() => completar(-1)}
          disabled={!hayAtras || girando}
          aria-label="Página anterior"
          className="grid h-11 w-11 place-items-center rounded-full border border-borde bg-superficie/85 text-texto-suave backdrop-blur transition-opacity hover:text-acento disabled:pointer-events-none disabled:opacity-25"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => completar(1)}
          disabled={!hayAdelante || girando}
          aria-label="Página siguiente"
          className="grid h-11 w-11 place-items-center rounded-full border border-borde bg-superficie/85 text-texto-suave backdrop-blur transition-opacity hover:text-acento disabled:pointer-events-none disabled:opacity-25"
        >
          ›
        </button>
      </div>
    </div>
  )
}
