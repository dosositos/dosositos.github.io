import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { EstrellaDePapel } from '@/componentes/EstrellaDePapel'
import { POR_DIA, TEXTOS } from '@/content/mensajitos'
import { abrirSobreUnaVez, claveRecordada } from '@/lib/cripto'
import { partesLocales } from '@/lib/tiempo'
import type { Estrellita, FrascoGuardado, TonoEstrellita } from '@/types'

/**
 * El frasco de mensajitos.
 *
 * Un frasco lleno de estrellitas de papel dobladas a mano. Ella toca el
 * frasco, sale una, se desdobla y adentro hay algo escrito.
 *
 * Se abren de a POR_DIA por día, contados en horario de Nicaragua. El
 * límite no es tacañería: sin él, el frasco se lee entero la primera
 * tarde y después no queda nada que volver a buscar. Dentro del día no
 * se repite ninguna hasta que las haya visto todas.
 *
 * Los mensajitos no viven en src/: llegan de public/cifrado/frasco.enc,
 * que se abre con la misma frase de la puerta. Varios son frases reales
 * del chat, y esas no van en claro ni siendo de él.
 */

const LLAVE_ABIERTAS = 'dosositos:frasco'
const LLAVE_DIA = 'dosositos:frasco-dia'

/** El tono no se lee en pantalla: es el color del papel. */
const COLOR_POR_TONO: Record<TonoEstrellita, string> = {
  animo: 'var(--color-tulipan-amarillo)',
  amor: 'var(--color-rosa-roja)',
  chiste: 'var(--color-hibisco)',
  promesa: 'var(--color-tulipan-violeta)',
  recuerdo: 'var(--color-rosa-pastel)',
}

const colorDe = (e: Estrellita) => COLOR_POR_TONO[e.tono ?? 'amor']

/**
 * Llave corta y estable de un mensajito.
 *
 * Se guarda la huella y no el texto: el localStorage del teléfono lo
 * puede leer cualquiera que lo agarre, y ahí no tienen por qué quedar
 * los mensajitos en claro. De paso sobrevive a que Armando reordene el
 * archivo — lo que identifica a cada uno es lo que dice, no su posición.
 */
function huella(texto: string): string {
  let h = 5381
  for (const c of texto) h = ((h * 33) ^ (c.codePointAt(0) ?? 0)) >>> 0
  return h.toString(36)
}

function leerAbiertas(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(LLAVE_ABIERTAS) ?? '[]') as string[])
  } catch {
    return new Set()
  }
}

function guardarAbiertas(abiertas: Set<string>) {
  try {
    localStorage.setItem(LLAVE_ABIERTAS, JSON.stringify([...abiertas]))
  } catch {
    // Modo privado del navegador: se puede sacar igual, solo que el
    // frasco no se acuerda de nada entre visitas.
  }
}

/* ── El cupo del día ─────────────────────────────────────────────── */

/**
 * Qué día es hoy en Nicaragua, no en el teléfono.
 *
 * Importa: si se contara con la zona del aparato, alguien de viaje
 * estrenaría el frasco unas horas antes o después, y a las once de la
 * noche podría quedarse sin las de un día que allá todavía no empezó.
 */
function hoyNI(): string {
  const { anio, mes, dia } = partesLocales(new Date())
  return `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
}

/** Las que sacó hoy. Se guardan las huellas, nunca el texto. */
interface EstadoDelDia {
  dia: string
  huellas: string[]
}

function leerDia(): EstadoDelDia {
  const hoy = hoyNI()
  try {
    const crudo = JSON.parse(localStorage.getItem(LLAVE_DIA) ?? 'null') as EstadoDelDia | null
    // Si el guardado es de ayer, hoy arranca de cero.
    if (!crudo || crudo.dia !== hoy) return { dia: hoy, huellas: [] }
    return { dia: hoy, huellas: Array.isArray(crudo.huellas) ? crudo.huellas : [] }
  } catch {
    return { dia: hoy, huellas: [] }
  }
}

function guardarDia(estado: EstadoDelDia) {
  try {
    localStorage.setItem(LLAVE_DIA, JSON.stringify(estado))
  } catch {
    // Igual que arriba: sin localStorage el frasco funciona, pero no
    // puede llevar la cuenta del día.
  }
}

/* ── El frasco dibujado ──────────────────────────────────────────── */

const CUPO = 18 // estrellitas que caben dibujadas, no las que hay escritas

/**
 * Dónde va cada estrellita dentro del vidrio. Con semilla fija, como los
 * pétalos: si fueran de Math.random se reacomodarían solas en cada
 * visita y el frasco parecería otro.
 *
 * Van ordenadas de abajo hacia arriba a propósito: al mostrar solo las
 * primeras N, el montón baja como bajaría de verdad al ir sacando.
 */
const DENTRO = (() => {
  let semilla = 24_11_2024
  const aleatorio = () => {
    semilla = (semilla * 1103515245 + 12345) % 2147483648
    return semilla / 2147483648
  }

  const colores = Object.values(COLOR_POR_TONO)

  return Array.from({ length: CUPO }, () => ({
    x: 22 + aleatorio() * 56, // % del ancho del frasco
    y: 32 + aleatorio() * 56, // % del alto
    tamanio: 16 + aleatorio() * 10,
    giro: aleatorio() * 360,
    color: colores[Math.floor(aleatorio() * colores.length)],
  })).sort((a, b) => b.y - a.y)
})()

/**
 * Cómo se mueven las estrellitas dentro del vidrio.
 *
 * Entran cayendo desde arriba y se asientan con un rebote corto — el
 * `overflow-hidden` del frasco las tapa mientras vienen en el aire, así
 * que se ven aparecer por la boca. Después se quedan quietas: flotar
 * todo el tiempo cansa en una página que se mira fijo, y en el teléfono
 * gasta batería para nada. Lo único que las vuelve a mover es que ella
 * toque el frasco, y ahí se sacuden como se sacudiría de verdad.
 *
 * Las dos animaciones van en dos elementos anidados y no en uno solo:
 * el de afuera cae una vez, el de adentro se sacude cada vez que ella
 * toca. Si compartieran elemento, la sacudida tendría que reescribir la
 * posición en la que quedó la caída, y volverían a caer con cada toque.
 *
 * (Antes esto se hacía con `useAnimationControls` disparado desde un
 * efecto. Si esa conexión no llegaba a establecerse, las estrellitas se
 * quedaban en su estado inicial —`opacity: 0`— y el frasco se veía
 * vacío. Declarado así no hay nada que conectar: el navegador las
 * anima al montarlas.)
 */

/** De dónde caen, en píxeles por encima del frasco. */
const ALTURA_DE_CAIDA = 190

function FrascoDeVidrio({
  restantes,
  total,
  puedeSacar,
  sinAbrir,
  alTocar,
}: {
  restantes: number
  total: number
  /** Sin cupo el frasco se sacude igual, pero no sale nada. */
  puedeSacar: boolean
  /** Todavía descifrando: tampoco sale nada, pero por otro motivo. */
  sinAbrir: boolean
  alTocar: () => void
}) {
  const sinMovimiento = useReducedMotion()

  // Cuántas veces tocó el frasco. No se usa de contador: cambia la `key`
  // de las estrellitas de adentro, y eso las remonta y vuelve a
  // dispararles la sacudida. Es la forma más simple de repetir una
  // animación a pedido sin controles ni efectos.
  const [toques, setToques] = useState(0)

  // Cuántas se dibujan: el nivel del frasco cuenta cuántas le faltan por
  // abrir. Si queda aunque sea una, se ve una.
  const visibles = restantes === 0 ? 0 : Math.max(1, Math.round((restantes / total) * CUPO))

  function tocar() {
    setToques((n) => n + 1)
    alTocar()
  }

  return (
    <motion.button
      type="button"
      onClick={tocar}
      whileHover={sinMovimiento ? undefined : { y: -6 }}
      whileTap={sinMovimiento ? undefined : { scale: 0.97, rotate: -1.5 }}
      transition={{ type: 'spring', stiffness: 300, damping: 18 }}
      aria-label={
        puedeSacar
          ? 'Sacar una estrellita del frasco'
          : sinAbrir
            ? 'El frasco de estrellitas — abriéndose'
            : 'El frasco de estrellitas — ya sacaste las de hoy'
      }
      className="relative block h-[300px] w-[220px] cursor-pointer"
    >
      <svg viewBox="0 0 160 220" className="absolute inset-0 h-full w-full">
        {/* La tapa */}
        <rect x={46} y={2} width={68} height={20} rx={6} fill="var(--t-superficie-2)" stroke="var(--t-borde)" strokeWidth={2} />
        <rect x={54} y={18} width={52} height={16} fill="var(--t-superficie-2)" stroke="var(--t-borde)" strokeWidth={2} />

        {/* El vidrio */}
        <rect
          x={14}
          y={32}
          width={132}
          height={184}
          rx={26}
          fill="var(--t-superficie)"
          fillOpacity={0.5}
          stroke="var(--t-borde)"
          strokeWidth={2}
        />

        {/* Reflejo */}
        <rect x={30} y={54} width={13} height={116} rx={7} fill="#fff" opacity={0.07} />
      </svg>

      {/* Las estrellitas van encima del SVG, en divs, para poder animarlas */}
      <span aria-hidden className="absolute inset-0 overflow-hidden rounded-[26px]">
        {DENTRO.slice(0, visibles).map((e, i) => {
          const lado = i % 2 === 0 ? 1 : -1
          return (
            <motion.span
              key={i}
              className="absolute"
              // El centrado va en `translate` y no en el transform: así
              // motion tiene el transform libre para la caída.
              style={{ left: `${e.x}%`, top: `${e.y}%`, translate: '-50% -50%' }}
              initial={sinMovimiento ? false : { y: -ALTURA_DE_CAIDA, opacity: 0, rotate: -35 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              transition={
                sinMovimiento
                  ? { duration: 0 }
                  : {
                      type: 'spring',
                      stiffness: 120,
                      damping: 11,
                      mass: 0.7,
                      delay: i * 0.045,
                    }
              }
            >
              <motion.span
                // Al cambiar la llave se remonta, y con eso se sacude otra vez.
                key={toques}
                className="block"
                initial={false}
                animate={
                  toques === 0 || sinMovimiento
                    ? { x: 0, y: 0, rotate: 0 }
                    : {
                        y: [0, -9, 3, 0],
                        x: [0, 5 * lado, -3 * lado, 0],
                        rotate: [0, 9 * lado, -5 * lado, 0],
                      }
                }
                transition={{ duration: 0.6, delay: (i % 5) * 0.025, ease: 'easeOut' }}
              >
                <EstrellaDePapel color={e.color} tamanio={e.tamanio} giro={e.giro} />
              </motion.span>
            </motion.span>
          )
        })}
      </span>

      {/* La etiqueta pegada al vidrio */}
      <span
        aria-hidden
        className="absolute left-1/2 top-[38%] w-[62%] -translate-x-1/2 rotate-[-2deg] rounded-sm bg-[#f4efe6] px-2 py-1.5 text-center shadow-[0_6px_18px_-10px_rgb(0_0_0/0.9)]"
      >
        <span className="fuente-mano block text-[1.05rem] leading-none text-[#4a4038]">
          para vos, osita
        </span>
      </span>
    </motion.button>
  )
}

/* ── El papelito desdoblado ──────────────────────────────────────── */

function Papelito({ estrellita }: { estrellita: Estrellita }) {
  const sinMovimiento = useReducedMotion()
  const color = colorDe(estrellita)

  return (
    <motion.div
      initial={sinMovimiento ? { opacity: 0 } : { opacity: 0, scaleY: 0.2, y: -14 }}
      animate={{ opacity: 1, scaleY: 1, y: 0 }}
      exit={sinMovimiento ? { opacity: 0 } : { opacity: 0, scaleY: 0.4, y: 10 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformOrigin: 'top center' }}
      className="relative mx-auto w-full max-w-md"
    >
      {/* La estrellita de la que salió, como pegada arriba */}
      <motion.span
        aria-hidden
        initial={sinMovimiento ? false : { rotate: -160, scale: 0.3, opacity: 0 }}
        animate={{ rotate: -8, scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
        className="absolute -top-6 left-1/2 z-10 block -translate-x-1/2"
      >
        <EstrellaDePapel color={color} tamanio={46} />
      </motion.span>

      <div
        className="rounded-sm bg-[#f7f2e6] px-6 pb-7 pt-9 shadow-[0_18px_50px_-20px_rgb(0_0_0/0.9)]"
        style={{
          // Los dobleces del papel: estuvo hecho estrellita hasta hace un rato
          backgroundImage:
            'linear-gradient(90deg, transparent calc(50% - 1px), rgb(0 0 0 / 0.07) 50%, transparent calc(50% + 1px)), linear-gradient(0deg, transparent calc(50% - 1px), rgb(0 0 0 / 0.05) 50%, transparent calc(50% + 1px))',
        }}
      >
        <p className="fuente-mano text-center text-2xl leading-snug text-[#3f3830] sm:text-[1.7rem]">
          {estrellita.texto}
        </p>
        <p className="mt-5 text-right text-sm text-[#6b6055]">— {estrellita.de}</p>
      </div>
    </motion.div>
  )
}

/* ── La página ───────────────────────────────────────────────────── */

export function Frasco() {
  const [mensajitos, setMensajitos] = useState<Estrellita[] | null>(null)
  const [fallo, setFallo] = useState(false)
  const [abiertas, setAbiertas] = useState<Set<string>>(leerAbiertas)
  const [dia, setDia] = useState<EstadoDelDia>(leerDia)
  const [actual, setActual] = useState<Estrellita | null>(null)
  const [recienLlenado, setRecienLlenado] = useState(false)

  // Los mensajitos llegan cifrados. Como para estar en esta página ya
  // hubo que escribir la frase de la puerta, ella no ve ningún candado
  // extra: el frasco aparece lleno y ya.
  useEffect(() => {
    const clave = claveRecordada()
    if (!clave) {
      setFallo(true)
      return
    }

    let vigente = true

    abrirSobreUnaVez<FrascoGuardado>('frasco', clave)
      .then((sobre) => {
        if (!vigente) return
        setMensajitos(sobre.mensajitos)

        // La última que sacó hoy sigue desdoblada al volver: si cerró la
        // página sin querer, no perdió una de las tres del día.
        const ultima = leerDia().huellas.at(-1)
        if (ultima) {
          setActual(sobre.mensajitos.find((m) => huella(m.texto) === ultima) ?? null)
        }
      })
      .catch(() => {
        if (vigente) setFallo(true)
      })

    return () => {
      vigente = false
    }
  }, [])

  const pendientes = useMemo(
    () => (mensajitos ?? []).filter((m) => !abiertas.has(huella(m.texto))),
    [mensajitos, abiertas],
  )

  const quedanHoy = Math.max(0, POR_DIA - dia.huellas.length)
  const puedeSacar = mensajitos !== null && quedanHoy > 0

  function sacar() {
    if (!mensajitos) return

    // El día se vuelve a mirar acá y no solo al montar: si dejó la página
    // abierta desde anoche, a la medianoche de Nicaragua le toca cupo nuevo.
    const hoy = hoyNI()
    const delDia = dia.dia === hoy ? dia : { dia: hoy, huellas: [] }
    if (delDia.huellas.length >= POR_DIA) {
      if (delDia !== dia) setDia(delDia)
      return
    }

    // Si ya las abrió todas, el frasco se vuelve a llenar solo. Evitamos
    // nada más que la primera de la vuelta nueva sea la que acaba de leer.
    const seVolvioALlenar = pendientes.length === 0
    const bolsa = seVolvioALlenar ? mensajitos.filter((m) => m !== actual) : pendientes
    const candidatas = bolsa.length > 0 ? bolsa : mensajitos

    const elegida = candidatas[Math.floor(Math.random() * candidatas.length)]
    const nuevas = seVolvioALlenar
      ? new Set([huella(elegida.texto)])
      : new Set([...abiertas, huella(elegida.texto)])

    const diaNuevo = { dia: hoy, huellas: [...delDia.huellas, huella(elegida.texto)] }

    setAbiertas(nuevas)
    guardarAbiertas(nuevas)
    setDia(diaNuevo)
    guardarDia(diaNuevo)
    setActual(elegida)
    setRecienLlenado(seVolvioALlenar)
  }

  // Mientras descifra, el frasco se dibuja lleno: es lo que se va a ver
  // en un segundo, y así no aparece vacío para llenarse de golpe.
  const total = mensajitos?.length ?? 0
  const restantes = mensajitos ? pendientes.length : 1

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-5 pb-24 pt-20">
      <header className="mb-8 text-center">
        <p className="text-[0.68rem] uppercase tracking-[0.3em] text-texto-suave/60">
          {TEXTOS.seccion}
        </p>
        <h1 className="mt-4 font-display text-4xl texto-degradado sm:text-5xl">{TEXTOS.titulo}</h1>
        <p className="fuente-mano mt-4 text-xl text-texto-suave">{TEXTOS.entrada}</p>
      </header>

      <FrascoDeVidrio
        restantes={restantes}
        total={total || 1}
        puedeSacar={puedeSacar}
        sinAbrir={mensajitos === null}
        alTocar={sacar}
      />

      <p className="mt-4 text-center text-xs text-texto-suave/60">
        {quedanHoy > 0 ? TEXTOS.cupo.disponible(quedanHoy) : TEXTOS.cupo.agotado}
      </p>

      <AnimatePresence mode="wait">
        {actual && (
          <motion.section
            key={huella(actual.texto)}
            // Para que quien use lector de pantalla escuche el mensajito
            // al salir, sin tener que ir a buscarlo.
            aria-live="polite"
            className="mt-12 w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {recienLlenado && (
              <p className="fuente-mano mb-4 text-center text-lg text-acento">
                {TEXTOS.seVolvioALlenar}
              </p>
            )}

            <Papelito estrellita={actual} />

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {/* Sin cupo no hay botón: es más claro que un botón apagado. */}
              {puedeSacar && (
                <button
                  type="button"
                  onClick={sacar}
                  className="rounded-full border border-acento/60 px-5 py-2 text-sm text-acento transition-colors hover:bg-acento/10"
                >
                  {TEXTOS.sacar}
                </button>
              )}
              <button
                type="button"
                onClick={() => setActual(null)}
                className="rounded-full border border-borde px-5 py-2 text-sm text-texto-suave transition-colors hover:border-acento hover:text-acento"
              >
                {TEXTOS.cerrar}
              </button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Casi siempre significa que falta correr `npm run secretos:cifrar`.
          En la web publicada no le mostramos a ella un error técnico. */}
      {fallo && import.meta.env.DEV && (
        <p className="mt-12 rounded-xl border border-dashed border-hibisco/60 px-5 py-4 text-center text-sm text-hibisco">
          No pude abrir el frasco. ¿Corriste
          <code className="mx-1">npm run secretos:cifrar</code>
          después del último cambio en <code>private/publicable/frasco.json</code>?
        </p>
      )}

      <p className="fuente-mano mt-14 max-w-sm text-center text-lg text-texto-suave/70">
        {TEXTOS.pie(POR_DIA)}
      </p>
    </div>
  )
}
