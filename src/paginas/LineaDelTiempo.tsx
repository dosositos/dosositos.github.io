import { motion, useReducedMotion } from 'motion/react'
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Galeria } from '@/componentes/Galeria'
import { momentos } from '@/content/momentos'
import { instantes } from '@/content/instantes'
import { FLORES } from '@/lib/flores'
import { fechaLarga, MESES_ES } from '@/lib/tiempo'
import type { Instante, Momento } from '@/types'

/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  LA LÍNEA DEL TIEMPO — pensada para el teléfono              ║
 * ║                                                              ║
 * ║  Un tallo vertical con una flor por momento. En el teléfono  ║
 * ║  el tallo va pegado a la izquierda y las tarjetas todas del  ║
 * ║  mismo lado (a 360 px de ancho, alternar solo hace que se    ║
 * ║  lea peor). De 640 px para arriba el tallo se va al centro   ║
 * ║  y las tarjetas empiezan a alternar.                          ║
 * ║                                                              ║
 * ║  Desde 1024 px la línea se acuesta: es la `Cinta`, más abajo. ║
 * ║                                                              ║
 * ║  OJO con el `margin` de los `viewport`: va con los dos ejes   ║
 * ║  ('-60px 0px') y nunca suelto. Un margen suelto también       ║
 * ║  recorta 60 px por los lados, y en el teléfono la flor vive   ║
 * ║  a 36 px del borde izquierdo: quedaba dentro de la franja     ║
 * ║  recortada, no entraba nunca "en vista" y se quedaba          ║
 * ║  invisible. En computadora no pasaba porque ahí la flor va    ║
 * ║  centrada sobre el tallo.                                     ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

/**
 * Momentos y fotos sueltas viven en archivos distintos porque se
 * escriben distinto, pero en la línea van mezclados por fecha: es una
 * sola historia.
 */
type Entrada = { tipo: 'momento'; dato: Momento } | { tipo: 'instante'; dato: Instante }

const enOrden: Entrada[] = [
  ...momentos.map((dato): Entrada => ({ tipo: 'momento', dato })),
  ...instantes.map((dato): Entrada => ({ tipo: 'instante', dato })),
].sort((a, b) => (a.dato.fecha < b.dato.fecha ? -1 : 1))

const anioDe = (e: Entrada) => e.dato.fecha.slice(0, 4)

/** '2024-08-29' → '29 de agosto' (el año ya lo dice el separador). */
function diaYMes(fecha: string) {
  const [, mes, dia] = fecha.split('-')
  return `${Number(dia)} de ${MESES_ES[Number(mes) - 1]}`
}

/**
 * El giro de una tarjeta destacada: menos de un grado, hacia un lado o al
 * otro según su id. Sale del id y no de Math.random para que cada visita
 * la encuentre igual de torcida, como las polaroids de la galería.
 */
function giroDe(id: string) {
  const suma = [...id].reduce((total, c) => total + c.charCodeAt(0), 0)
  return suma % 2 === 0 ? 0.9 : -0.9
}

/**
 * En la cinta de computadora cada entrada va de un lado del tallo:
 * `arriba` o `abajo`. Sin `enCinta` es la línea vertical del teléfono.
 */
type Lado = 'arriba' | 'abajo'

function Tarjeta({
  momento,
  aLaIzquierda,
  enCinta,
}: {
  momento: Momento
  aLaIzquierda: boolean
  enCinta?: Lado
}) {
  const sinMovimiento = useReducedMotion()
  const flor = FLORES[momento.flor]
  const giro = momento.destacado ? giroDe(momento.id) : 0

  // En la cinta la tarjeta llega desde su lado del tallo, y lo que cuenta
  // para «en vista» es el ancho: el alto ya cabe entero en la pantalla.
  const entrada = enCinta
    ? { opacity: 0, y: enCinta === 'arriba' ? -24 : 24, rotate: giro * 2.5 }
    : { opacity: 0, y: 28, x: aLaIzquierda ? -12 : 12, rotate: giro * 2.5 }
  const margen = enCinta ? '0px -40px' : '-60px 0px'

  const papel = (
    <motion.div
      initial={sinMovimiento ? false : entrada}
      whileInView={{ opacity: 1, y: 0, x: 0, rotate: giro }}
      viewport={{ once: true, margin: margen }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        to={`/momento/${momento.id}`}
        className="papel group relative block rounded-2xl px-5 py-5 transition-all duration-500 hover:-translate-y-1 hover:border-acento"
      >
        {/* Las destacadas van pegadas al álbum con cinta, como las
            polaroids de la galería. */}
        {momento.destacado && (
          <span
            aria-hidden
            // En la cinta, corrida a un lado: centrada, la de las tarjetas
            // de abajo quedaba justo debajo de la flor.
            className={`pointer-events-none absolute -top-2.5 h-5 w-16 -translate-x-1/2 -rotate-2 rounded-[1px] bg-white/25 backdrop-blur-[1px] ${
              enCinta ? 'left-[28%]' : 'left-1/2'
            }`}
            style={{ boxShadow: '0 1px 3px rgb(0 0 0 / 0.25)' }}
          />
        )}

        {/* El acento de color de su flor */}
        <span
          className={`block h-0.5 w-8 rounded-full ${aLaIzquierda ? 'sm:ms-auto' : ''}`}
          style={{ backgroundColor: flor.color }}
          aria-hidden
        />

        <p className="mt-3 text-xs uppercase tracking-[0.2em] text-texto-suave/60">
          {momento.fechaTexto ?? diaYMes(momento.fecha)}
          {momento.lugar && (
            <>
              <span className="mx-1.5 opacity-40">·</span>
              {momento.lugar}
            </>
          )}
        </p>

        <h2
          className={`mt-2 font-display leading-tight text-texto transition-colors group-hover:text-acento ${
            // en la cinta no crece más: a lo alto solo hay media pantalla
            momento.destacado ? (enCinta ? 'text-2xl' : 'text-2xl sm:text-[1.7rem]') : 'text-xl'
          }`}
        >
          {momento.titulo}
        </h2>

        <p className="mt-2 text-[0.95rem] leading-relaxed text-texto-suave">
          {momento.resumen}
        </p>

        {/* Lo que trae adentro */}
        <p
          className={`mt-3 flex flex-wrap items-center gap-2 text-xs text-texto-suave/60 ${
            aLaIzquierda ? 'sm:justify-end' : ''
          }`}
        >
          {momento.borrador ? (
            <span className="rounded-full border border-dashed border-borde px-2 py-0.5">
              por escribir
            </span>
          ) : (
            <>
              {momento.chat && (
                <span className="rounded-full border border-borde px-2 py-0.5">
                  {momento.chat.mensajes} {momento.chat.mensajes === 1 ? 'mensaje' : 'mensajes'}
                </span>
              )}
              {momento.fotos && (
                <span className="rounded-full border border-borde px-2 py-0.5">
                  {momento.fotos.length} {momento.fotos.length === 1 ? 'foto' : 'fotos'}
                </span>
              )}
              {momento.privado && (
                <span className="rounded-full border border-borde px-2 py-0.5">🔒 privado</span>
              )}
              {/* Siempre a la vista: en el teléfono no hay hover, y
                  escondido hasta pasarle el ratón no existía. */}
              <span className="fuente-mano ms-1 text-base leading-none text-acento/80 transition-colors group-hover:text-acento">
                abrir →
              </span>
            </>
          )}
        </p>
      </Link>
    </motion.div>
  )

  if (enCinta) {
    return (
      // Las destacadas, más anchas: su título grande cabe en una línea y
      // la tarjeta no se pasa de la mitad de la cinta.
      <EnLaCinta
        lado={enCinta}
        punta={<FlorDelTallo momento={momento} enCinta />}
        ancho={momento.destacado ? 'w-[25rem]' : 'w-[22rem]'}
      >
        {papel}
      </EnLaCinta>
    )
  }

  return (
    <li className="relative list-none">
      <div
        className={`flex items-start gap-4 sm:gap-0 ${
          aLaIzquierda ? 'sm:flex-row' : 'sm:flex-row-reverse'
        }`}
      >
        {/* ── La tarjeta ─────────────────────────────────────── */}
        <div className={`min-w-0 flex-1 ${aLaIzquierda ? 'sm:pr-10 sm:text-right' : 'sm:pl-10'}`}>
          {papel}
        </div>

        {/* ── La flor sobre el tallo ─────────────────────────── */}
        <div className="order-first flex w-10 shrink-0 justify-center pt-6 sm:order-none sm:w-0 sm:pt-0">
          <FlorDelTallo momento={momento} />
        </div>

        {/* La mitad vacía: es lo que empuja la tarjeta a su lado */}
        <div className="hidden flex-1 sm:block" />
      </div>
    </li>
  )
}

/** La flor del momento, sentada sobre el tallo. */
function FlorDelTallo({ momento, enCinta = false }: { momento: Momento; enCinta?: boolean }) {
  const sinMovimiento = useReducedMotion()
  const flor = FLORES[momento.flor]

  return (
    <motion.span
      initial={sinMovimiento ? false : { scale: 0, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: true, margin: enCinta ? '0px -40px' : '-60px 0px' }}
      transition={{ duration: 0.6, delay: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
      className={
        enCinta
          ? 'absolute left-1/2 top-1/2 z-[1] inline-flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full'
          : 'inline-flex shrink-0 items-center justify-center rounded-full sm:absolute sm:left-1/2 sm:top-6 sm:-translate-x-1/2'
      }
      // 40 px es justo el ancho de la columna del tallo: así el centro
      // de la flor cae exactamente sobre la línea, sin desbordarse.
      //
      // El emoji va en píxeles y con line-height 1: heredando el tamaño
      // en rem y la altura de línea, el glifo se salía del círculo.
      style={{
        width: momento.destacado ? 40 : 32,
        height: momento.destacado ? 40 : 32,
        backgroundColor: 'var(--t-fondo)',
        border: `2px solid ${flor.color}`,
        boxShadow: momento.destacado ? `0 0 22px -4px ${flor.color}` : undefined,
        fontSize: momento.destacado ? 18 : 15,
        lineHeight: 1,
      }}
      aria-hidden
    >
      {momento.icono ?? flor.emoji}
    </motion.span>
  )
}

/**
 * Una foto sin momento exacto. Deliberadamente más callada que una
 * tarjeta: sin papel, sin borde, sin "abrir →". Solo la fecha, una
 * línea a mano y un punto chiquito sobre el tallo.
 */
function Suelta({
  instante,
  aLaIzquierda,
  enCinta,
}: {
  instante: Instante
  aLaIzquierda: boolean
  enCinta?: Lado
}) {
  const sinMovimiento = useReducedMotion()
  const color = instante.flor ? FLORES[instante.flor].color : 'var(--t-borde)'
  const margen = enCinta ? '0px -40px' : '-60px 0px'

  /* Nada de giro aquí, y la `y` vuelve a 0: el visor de fotos es `fixed`
     y vive aquí adentro, y un `transform` que se quedara puesto lo
     encerraría en esta caja. */
  const contenido = (
    <motion.div
      initial={sinMovimiento ? false : { opacity: 0, y: enCinta === 'arriba' ? -20 : 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: margen }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      // En la cinta, la foto al lado del texto y no debajo: a lo alto no
      // hay más que media pantalla.
      className={enCinta ? 'flex items-center gap-4 py-1' : 'py-1'}
    >
      <Textos enCinta={!!enCinta}>
        <p className="text-xs uppercase tracking-[0.2em] text-texto-suave/50">
          {instante.fechaTexto ?? diaYMes(instante.fecha)}
          {instante.lugar && (
            <>
              <span className="mx-1.5 opacity-40">·</span>
              {instante.lugar}
            </>
          )}
        </p>

        <p className="fuente-mano mt-1 text-lg leading-snug text-texto-suave">
          {instante.texto}
        </p>
      </Textos>

      {instante.fotos && instante.fotos.length > 0 && (
        // Apiladas: una foto sin momento no debería ocupar más
        // espacio en la línea que el momento que tiene al lado.
        <div
          className={
            enCinta
              ? 'order-first w-[8.5rem] shrink-0'
              : `mt-4 max-w-[13rem] ${aLaIzquierda ? 'sm:ms-auto' : ''}`
          }
        >
          <Galeria fotos={instante.fotos} formato="pila" />
        </div>
      )}
    </motion.div>
  )

  /* El punto: la versión callada de la flor */
  const punto = (
    <motion.span
      initial={sinMovimiento ? false : { scale: 0, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: true, margin: margen }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className={
        enCinta
          ? 'absolute left-1/2 top-1/2 z-[1] block -translate-x-1/2 -translate-y-1/2 rounded-full'
          : 'block rounded-full sm:absolute sm:left-1/2 sm:top-4 sm:-translate-x-1/2'
      }
      style={{
        width: 11,
        height: 11,
        backgroundColor: 'var(--t-fondo)',
        border: `1.5px solid ${color}`,
      }}
      aria-hidden
    />
  )

  if (enCinta) {
    return (
      <EnLaCinta lado={enCinta} punta={punto} ancho="w-[21rem]">
        {contenido}
      </EnLaCinta>
    )
  }

  return (
    <li className="relative list-none">
      <div
        className={`flex items-start gap-4 sm:gap-0 ${
          aLaIzquierda ? 'sm:flex-row' : 'sm:flex-row-reverse'
        }`}
      >
        <div className={`min-w-0 flex-1 ${aLaIzquierda ? 'sm:pr-10 sm:text-right' : 'sm:pl-10'}`}>
          {contenido}
        </div>

        {/* El punto: la versión callada de la flor */}
        <div className="order-first flex w-10 shrink-0 justify-center pt-4 sm:order-none sm:w-0 sm:pt-0">
          {punto}
        </div>

        <div className="hidden flex-1 sm:block" />
      </div>
    </li>
  )
}

/** En la cinta, la fecha y la frase van juntas en una columna al lado de la foto. */
function Textos({ enCinta, children }: { enCinta: boolean; children: ReactNode }) {
  return enCinta ? <div className="min-w-0 flex-1">{children}</div> : <>{children}</>
}

/**
 * El año, pegado al tallo: a la izquierda en el teléfono, centrado en
 * pantalla ancha. Se queda arriba (`sticky`) mientras se recorre su año y
 * el del año siguiente lo empuja al llegar: por eso cada año es un grupo
 * aparte, con el separador adentro. Sueltos en la misma lista, se habrían
 * pegado todos uno encima del otro.
 */
function SeparadorDeAnio({ anio }: { anio: string }) {
  return (
    <div className="sticky top-[max(1rem,env(safe-area-inset-top))] z-10 flex justify-start py-2 sm:justify-center">
      <motion.p
        initial={{ opacity: 0, scale: 0.92 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="rounded-full border border-borde bg-fondo px-4 py-1 font-display text-sm tracking-[0.18em] text-texto-suave"
      >
        {anio}
      </motion.p>
    </div>
  )
}

/** Las entradas en grupos de un año, cada una con su posición en la línea. */
const porAnio = enOrden.reduce<{ anio: string; entradas: { entrada: Entrada; i: number }[] }[]>(
  (grupos, entrada, i) => {
    const anio = anioDe(entrada)
    const ultimo = grupos[grupos.length - 1]
    if (ultimo?.anio === anio) ultimo.entradas.push({ entrada, i })
    else grupos.push({ anio, entradas: [{ entrada, i }] })
    return grupos
  },
  [],
)

/* ══════════════════════════════════════════════════════════════
   LA CINTA — la versión de computadora
   ══════════════════════════════════════════════════════════════ */

/**
 * Desde 1024 px (el `lg` de Tailwind) la línea se acuesta. Se decide en
 * JavaScript y no con clases `lg:hidden`: con las dos versiones montadas,
 * el teléfono descifraría también las fotos de la cinta que nunca ve.
 * `useSyncExternalStore` lo sabe desde el primer cuadro, sin parpadeo.
 */
const PANTALLA_ANCHA = '(min-width: 1024px)'

function suscribirseAlAncho(avisar: () => void) {
  const consulta = window.matchMedia(PANTALLA_ANCHA)
  consulta.addEventListener('change', avisar)
  return () => consulta.removeEventListener('change', avisar)
}

function usePantallaAncha() {
  return useSyncExternalStore(
    suscribirseAlAncho,
    () => window.matchMedia(PANTALLA_ANCHA).matches,
    () => false,
  )
}

/**
 * Una entrada de la cinta: una columna del alto entero, partida a la mitad
 * por el tallo. Lo suyo va en la mitad de arriba o en la de abajo, pegado
 * al tallo, y la flor (la `punta`) queda justo sobre la línea.
 *
 * Las columnas se montan un poco una sobre otra (`-ms-…`): como se alternan
 * arriba y abajo, la de al lado nunca choca, y así la cinta no queda con
 * huecos de media tarjeta entre flor y flor.
 */
function EnLaCinta({
  lado,
  punta,
  ancho,
  children,
}: {
  lado: Lado
  punta: ReactNode
  /** La clase del ancho de la columna (`w-[…]`). */
  ancho: string
  children: ReactNode
}) {
  const arriba = lado === 'arriba'
  return (
    <li className={`relative -ms-32 flex h-full shrink-0 snap-center list-none flex-col ${ancho}`}>
      <div className="flex min-h-0 flex-1 flex-col justify-end pb-5">{arriba && children}</div>
      <div className="flex min-h-0 flex-1 flex-col justify-start pt-5">{!arriba && children}</div>

      {/* La ramita: del tallo a lo suyo */}
      <span
        aria-hidden
        className={`pointer-events-none absolute left-1/2 h-5 w-px ${arriba ? 'bottom-1/2' : 'top-1/2'}`}
        style={{ backgroundColor: 'var(--t-borde)' }}
      />
      {punta}
    </li>
  )
}

/**
 * El año en la cinta: sentado sobre el tallo y pegado a la izquierda
 * (`sticky`) mientras se recorre ese año, igual que en el teléfono se
 * queda arriba. Ocupa su ancho pero lo devuelve con un margen negativo,
 * para no correr las entradas; el `sticky` igual lo deja dentro de su
 * año, y por eso el del año siguiente lo empuja al llegar.
 */
function MarcaDeAnio({ anio }: { anio: string }) {
  return (
    <div className="sticky left-[4.75rem] z-10 flex h-full w-24 shrink-0 items-center -me-24">
      <p className="rounded-full border border-borde bg-fondo px-4 py-1 font-display text-sm tracking-[0.18em] text-texto-suave">
        {anio}
      </p>
    </div>
  )
}

/**
 * Dónde se quedó la cinta, para reabrirla ahí al volver de un momento.
 *
 * Se guarda junto con la clave de esa entrada del historial
 * (`location.key`) y solo se restaura si coincide: eso pasa al volver
 * atrás (o al recargar), nunca al entrar de nuevo desde el menú. No se
 * usa `useNavigationType`: dentro de un `<Routes location={…}>`, como
 * el de `App`, siempre contesta `POP`.
 */
const LLAVE_CINTA = 'dosositos:cinta'

function Cinta() {
  const sinMovimiento = useReducedMotion()
  const { key: clave } = useLocation()
  const cinta = useRef<HTMLDivElement>(null)
  const [puedeAtras, setPuedeAtras] = useState(false)
  const [puedeAdelante, setPuedeAdelante] = useState(true)

  // Al volver (y solo al volver), donde estaba; antes de pintar, para que
  // no se vea el principio un cuadro y después el salto.
  useLayoutEffect(() => {
    const el = cinta.current
    if (!el) return
    try {
      const guardada = JSON.parse(sessionStorage.getItem(LLAVE_CINTA) ?? 'null') as {
        clave: string
        x: number
      } | null
      if (guardada?.clave === clave && guardada.x > 0) el.scrollLeft = guardada.x
    } catch {
      // sin sessionStorage (o algo raro guardado) se abre al principio, y ya
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const el = cinta.current
    if (!el) return

    let pendiente = 0
    const mirar = () => {
      if (pendiente) return
      pendiente = requestAnimationFrame(() => {
        pendiente = 0
        const tope = el.scrollWidth - el.clientWidth
        setPuedeAtras(el.scrollLeft > 1)
        setPuedeAdelante(el.scrollLeft < tope - 1)
        try {
          sessionStorage.setItem(LLAVE_CINTA, JSON.stringify({ clave, x: Math.round(el.scrollLeft) }))
        } catch {
          // lleno o bloqueado: al volver se abre al principio
        }
      })
    }

    /* La rueda del ratón gira hacia abajo, pero la cinta corre de lado:
       se traduce. Solo si el giro es mayormente vertical (el touchpad ya
       manda el de lado solito) y si la cinta todavía puede correr hacia
       ahí; en las puntas se suelta y la página baja como siempre. */
    const rueda = (e: WheelEvent) => {
      if (e.ctrlKey || Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return
      const paso =
        e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * el.clientWidth : e.deltaY
      const tope = el.scrollWidth - el.clientWidth
      if ((paso > 0 && el.scrollLeft >= tope - 1) || (paso < 0 && el.scrollLeft <= 0)) return
      e.preventDefault()
      el.scrollBy({ left: paso, behavior: 'instant' })
    }

    mirar()
    el.addEventListener('scroll', mirar, { passive: true })
    el.addEventListener('wheel', rueda, { passive: false })
    window.addEventListener('resize', mirar)
    return () => {
      cancelAnimationFrame(pendiente)
      el.removeEventListener('scroll', mirar)
      el.removeEventListener('wheel', rueda)
      window.removeEventListener('resize', mirar)
    }
  }, [clave])

  /** Casi una pantalla con los botones; una entrada con las flechas del teclado. */
  const correr = (sentido: 1 | -1, cuanto: 'pantalla' | 'entrada') => {
    const el = cinta.current
    if (!el) return
    const paso = cuanto === 'pantalla' ? el.clientWidth * 0.75 : 192
    el.scrollBy({ left: sentido * paso, behavior: sinMovimiento ? 'instant' : 'smooth' })
  }

  const flecha =
    'absolute top-1/2 z-20 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-borde bg-superficie/80 text-xl text-texto-suave backdrop-blur transition-[opacity,color,border-color] hover:border-acento hover:text-acento disabled:pointer-events-none disabled:opacity-0'

  return (
    <section className="relative min-h-0 flex-1">
      <div
        ref={cinta}
        tabIndex={0}
        role="region"
        aria-label="la línea del tiempo, de lado"
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
            e.preventDefault()
            correr(e.key === 'ArrowRight' ? 1 : -1, 'entrada')
          }
        }}
        className="h-full overflow-x-auto overflow-y-hidden overscroll-x-contain"
        style={{
          scrollSnapType: 'x proximity',
          scrollPaddingInline: '5rem',
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--t-borde) transparent',
        }}
      >
        <div className="flex h-full w-max items-stretch ps-48">
          <div className="relative flex h-full">
            {/* El tallo, acostado: de punta a punta, por la mitad */}
            <div
              className="pointer-events-none absolute -left-24 right-0 top-1/2 h-px"
              style={{
                background:
                  'linear-gradient(to right, transparent, var(--t-borde) 3%, var(--t-borde) 97%, transparent)',
              }}
              aria-hidden
            />

            <ol className="relative flex h-full">
              {porAnio.map(({ anio, entradas }) => (
                <li key={anio} className="flex h-full list-none">
                  <MarcaDeAnio anio={anio} />
                  <ol className="flex h-full ps-36">
                    {entradas.map(({ entrada, i }) => {
                      const lado: Lado = i % 2 === 0 ? 'arriba' : 'abajo'
                      return entrada.tipo === 'momento' ? (
                        <Tarjeta key={entrada.dato.id} momento={entrada.dato} aLaIzquierda={false} enCinta={lado} />
                      ) : (
                        <Suelta key={entrada.dato.id} instante={entrada.dato} aLaIzquierda={false} enCinta={lado} />
                      )
                    })}
                  </ol>
                </li>
              ))}
            </ol>
          </div>

          {/* El final abierto, donde se acaba el tallo */}
          <div className="flex h-full w-[26rem] shrink-0 snap-end flex-col items-center justify-center pe-24 ps-10">
            <FinalAbierto enCinta />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => correr(-1, 'pantalla')}
        disabled={!puedeAtras}
        className={`${flecha} left-4`}
        aria-label="Más atrás en la historia"
      >
        ←
      </button>
      <button
        type="button"
        onClick={() => correr(1, 'pantalla')}
        disabled={!puedeAdelante}
        className={`${flecha} right-4`}
        aria-label="Más adelante en la historia"
      >
        →
      </button>
    </section>
  )
}

/** El final abierto: la historia sigue. */
function FinalAbierto({ enCinta = false }: { enCinta?: boolean }) {
  const ultimo = enOrden[enOrden.length - 1].dato
  return (
    <>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className={enCinta ? 'fuente-mano text-center text-2xl text-texto-suave' : 'fuente-mano mt-16 text-center text-2xl text-texto-suave'}
      >
        …y todo lo que falta 🌻
      </motion.p>

      <p className="mt-3 text-center text-xs uppercase tracking-[0.2em] text-texto-suave/50">
        el último: {diaYMes(ultimo.fecha)} de {ultimo.fecha.slice(0, 4)}
      </p>
    </>
  )
}

export function LineaDelTiempo() {
  const ancha = usePantallaAncha()
  const primero = enOrden[0].dato
  const escritos = momentos.filter((m) => !m.borrador).length

  const subtitulos = (
    <>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.35 }}
        className={
          ancha
            ? 'fuente-mano text-xl text-texto-suave'
            : 'fuente-mano mx-auto mt-4 max-w-md text-xl text-texto-suave'
        }
      >
        desde {fechaLarga(new Date(`${primero.fecha}T12:00:00-06:00`))}
      </motion.p>

      <p
        className={
          ancha
            ? 'text-xs uppercase tracking-[0.2em] text-texto-suave/50'
            : 'mt-3 text-xs uppercase tracking-[0.2em] text-texto-suave/50'
        }
      >
        {escritos} momentos guardados · tocá cualquiera para abrirlo
      </p>
    </>
  )

  const encabezado = (
    <header className={ancha ? 'mb-2 shrink-0 text-center' : 'mb-14 text-center'}>
      <motion.h1
        initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        className={
          ancha
            ? 'font-display text-4xl leading-tight texto-degradado'
            : 'font-display text-4xl leading-tight texto-degradado sm:text-5xl'
        }
      >
        nuestra historia
      </motion.h1>

      {ancha ? (
        // En computadora, en un solo renglón: cada línea que se ahorra
        // aquí arriba es alto que le queda a la cinta.
        <div className="mt-1 flex items-baseline justify-center gap-6">{subtitulos}</div>
      ) : (
        subtitulos
      )}
    </header>
  )

  /* En computadora la página entera es la cinta: del encabezado para
     abajo, todo el alto que deja la firma del pie (3.5rem). Así no hay
     que bajar para verla, y la rueda queda toda para ella. El mínimo es
     lo que necesita la tarjeta más alta en cada mitad: en una ventana más
     bajita la página baja un poco antes que cortarla. */
  if (ancha) {
    return (
      <div className="flex h-[calc(100dvh-3.5rem)] min-h-[41.5rem] w-full flex-col pt-4">
        {encabezado}
        <Cinta />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-24 pt-20">
      {encabezado}

      <div className="relative">
        {/* El tallo: pegado a la izquierda en el teléfono, al centro en pantalla ancha */}
        <div
          className="pointer-events-none absolute bottom-0 left-5 top-0 w-px sm:left-1/2"
          style={{
            background:
              'linear-gradient(to bottom, transparent, var(--t-borde) 5%, var(--t-borde) 95%, transparent)',
          }}
          aria-hidden
        />

        <ol className="relative space-y-10">
          {porAnio.map(({ anio, entradas }) => (
            <li key={anio} className="list-none">
              <SeparadorDeAnio anio={anio} />
              <ol className="mt-10 space-y-10">
                {entradas.map(({ entrada, i }) => {
                  const aLaIzquierda = i % 2 === 1
                  return entrada.tipo === 'momento' ? (
                    <Tarjeta key={entrada.dato.id} momento={entrada.dato} aLaIzquierda={aLaIzquierda} />
                  ) : (
                    <Suelta key={entrada.dato.id} instante={entrada.dato} aLaIzquierda={aLaIzquierda} />
                  )
                })}
              </ol>
            </li>
          ))}
        </ol>
      </div>

      {/* El final abierto: la historia sigue */}
      <FinalAbierto />
    </div>
  )
}
