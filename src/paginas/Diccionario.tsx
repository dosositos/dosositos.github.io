import { motion } from 'motion/react'
import { useMemo, useRef, useState } from 'react'
import {
  CurvaDeUso,
  DondeNacio,
  LargoDelLema,
  LemaCifrado,
  ProveedorDiccionario,
} from '@/componentes/ExpedienteCifrado'
import { FotoCifrada } from '@/componentes/FotoCifrada'
import { Libro, type ManejoLibro, type PaginaLibro } from '@/componentes/Libro'
import { entradas, FOTO_TAPA, TEXTOS } from '@/content/diccionario'
import { conSeparador, fechaLarga, fechaNI } from '@/lib/tiempo'
import type { DatosDePalabra, EntradaDiccionario } from '@/types'

/**
 * EL DICCIONARIO OSO–ESPAÑOL.
 *
 * Un libro de verdad: tapa de cuero con una polaroid pegada, papel
 * crema, canto de páginas que adelgaza mientras avanzás y hojas que
 * se pasan con el dedo. El motor está en <Libro>; acá se arma qué
 * dice cada página.
 *
 * La ficha de cada palabra va en claro (es la voz del que cuenta),
 * y las citas textuales llegan cifradas, como todo lo que salió del
 * chat.
 */

/* ── Cómo se lee una fecha y una hora ──────────────────────────── */

function fechaDe(iso: string): string {
  const [a, m, d] = iso.split('-').map(Number)
  return fechaLarga(fechaNI(a, m, d))
}

/** '17:54' → '5:54 p. m.' — como lo escribe WhatsApp aquí. */
function horaDe(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number)
  // Los espacios de acá son duros (U+00A0). Con los normales, el
  // navegador parte «5:16 p. m.» y deja la m sola en la línea de abajo.
  const sufijo = h < 12 ? 'a. m.' : 'p. m.'
  const doce = h % 12 === 0 ? 12 : h % 12
  return `${doce}:${String(m).padStart(2, '0')} ${sufijo}`
}

/* ── El reparto, dibujado ──────────────────────────────────────
   Dos tintas de estilográfica sobre el papel: la de él y la de
   ella. Se ve de un vistazo de quién es la palabra, que es la
   pregunta que uno se hace antes de leer los números. */

function BarraDeReparto({ datos }: { datos: DatosDePalabra }) {
  const total = Math.max(1, datos.reparto.osito + datos.reparto.osita)
  const suyo = (datos.reparto.osito / total) * 100

  return (
    <div className="mt-2">
      <div className="flex h-[6px] w-full overflow-hidden rounded-full bg-[rgb(120_90_55/0.15)]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${suyo}%` }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="shrink-0"
          style={{ background: 'linear-gradient(to right, #2c4a7c, #3f6499)' }}
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${100 - suyo}%` }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="shrink-0"
          style={{ background: 'linear-gradient(to right, #b8465c, #d0697e)' }}
        />
      </div>
      <div className="mt-1 flex justify-between text-[0.62rem] text-[var(--color-tinta-suave)]">
        <span>él {conSeparador(datos.reparto.osito)}</span>
        <span>ella {conSeparador(datos.reparto.osita)}</span>
      </div>
    </div>
  )
}

/* ── El expediente: lo que el chat sabe de la palabra ──────────── */

function Expediente({ datos, sinBorde = false }: { datos: DatosDePalabra; sinBorde?: boolean }) {
  const quien = datos.acuño === 'osito' ? 'él' : 'ella'

  return (
    <div
      className={`${sinBorde ? '' : 'mt-4 border-t border-[rgb(120_90_55/0.28)] pt-2.5'} text-[0.7rem] leading-snug text-[var(--color-tinta-suave)]`}
    >
      <p>
        <span className="text-[var(--color-tinta-roja)]">▸</span> La dijo primero{' '}
        <strong className="font-semibold text-[var(--color-tinta)]">{quien}</strong>, el{' '}
        {fechaDe(datos.nacio)}
        {datos.hora ? ` a las ${horaDe(datos.hora)}` : '.'}
      </p>

      <p className="mt-1.5">
        <span className="text-[var(--color-tinta-roja)]">▸</span>{' '}
        <strong className="font-semibold text-[var(--color-tinta)]">
          {conSeparador(datos.veces)}
        </strong>{' '}
        {datos.veces === 1 ? 'vez' : 'veces'} en dos años.
      </p>
      <BarraDeReparto datos={datos} />

      {datos.formas && datos.formas.length > 1 && (
        <p className="mt-2.5">
          <span className="text-[var(--color-tinta-roja)]">▸</span> Se escribe:{' '}
          {datos.formas.slice(0, 3).map((f, i) => (
            <span key={f.forma}>
              {i > 0 && ' · '}
              <em className="not-italic text-[var(--color-tinta)]">{f.forma}</em> (
              {conSeparador(f.veces)})
            </span>
          ))}
          {datos.formas.length > 3 ? '…' : null}
        </p>
      )}

      {datos.ultima && (
        <p className="mt-1.5">
          <span className="text-[var(--color-tinta-roja)]">▸</span> Última vez:{' '}
          {fechaDe(datos.ultima)}.
        </p>
      )}
    </div>
  )
}

/* ── Una página de entrada ─────────────────────────────────────── */

/**
 * Cuándo una entrada no cabe en una hoja.
 *
 * Medido contra la página más chica que nos importa (un teléfono de
 * 360 px): pasando de esto, las acepciones se van a la hoja siguiente
 * en vez de apretar la letra. Es lo que hace un diccionario de papel
 * cuando una palabra se le va de largo.
 */
const CABE_EN_UNA_HOJA = 240

/**
 * La pestaña del apartado final.
 *
 * Las frases enteras no son palabras y no caben en ninguna letra: van
 * juntas al final del libro, bajo este símbolo.
 */
const APARTADO_FRASES = '✦'

/**
 * Cuándo la definición sola ya llena la hoja.
 *
 * Pasando esto no queda sitio abajo ni para el expediente, así que la
 * ficha se queda con el texto y todo lo demás pasa a la vuelta.
 */
const DEFINICION_LARGA = 170

/**
 * Cómo se reparte una entrada entre sus hojas.
 *
 * Un diccionario de papel hace esto todo el tiempo: la palabra empieza
 * en una hoja y sigue en la otra. Acá se decide qué se queda y qué
 * pasa, y sobre todo se evita el error que tuvimos dos veces — mandar a
 * la vuelta una hoja que no lleva nada, o apretujar en la ficha algo
 * que no entra.
 */
interface Plan {
  /** Las acepciones se leen en la hoja siguiente. */
  acepcionesFuera: boolean
  /** El expediente también. */
  expedienteFuera: boolean
  /** Y si el expediente se junta con las burbujas en vez de ir solo. */
  expedienteConLasBurbujas: boolean
  /** Si hace falta una hoja de continuación. */
  hayNota: boolean
}

function planDe(entrada: EntradaDiccionario): Plan {
  const acepciones = entrada.acepciones?.join(' ') ?? ''
  const definicion = entrada.definicion.length
  const hayAcepciones = Boolean(entrada.acepciones?.length)

  const cabeTodo = definicion + acepciones.length <= CABE_EN_UNA_HOJA
  const definicionLarga = definicion > DEFINICION_LARGA

  const acepcionesFuera = hayAcepciones && (!cabeTodo || definicionLarga)
  const expedienteFuera = definicionLarga
  // Si la entrada tiene hoja de nacimiento, el expediente viaja con las
  // burbujas: una hoja para él solo quedaba con dos tercios en blanco.
  const expedienteConLasBurbujas = expedienteFuera && Boolean(entrada.cifrada)

  return {
    acepcionesFuera,
    expedienteFuera,
    expedienteConLasBurbujas,
    hayNota: acepcionesFuera || (expedienteFuera && !expedienteConLasBurbujas),
  }
}

/**
 * De qué tamaño se compone el lema.
 *
 * Un lema largo en cuerpo de titular se come media hoja y deja la
 * definición sin sitio. Los diccionarios de papel hacen lo mismo: la
 * palabra manda, pero no a costa de lo que dice.
 */
function tamanoDelLema(entrada: EntradaDiccionario): string {
  if (entrada.lemaCifrado) return 'text-[clamp(1rem,4.2vw,1.25rem)] leading-tight'
  const largo = entrada.palabra.length
  if (largo > 22) return 'text-[clamp(1.05rem,4.4vw,1.45rem)] leading-tight'
  if (largo > 14) return 'text-[clamp(1.3rem,5.4vw,1.8rem)] leading-tight'
  return 'text-[clamp(1.6rem,6.5vw,2.3rem)] leading-none lg:text-[2rem]'
}

function Cabecera({ guia, folio }: { guia: string; folio: number }) {
  return (
    <div className="mb-4 flex items-baseline justify-between border-b border-[rgb(120_90_55/0.22)] pb-2">
      <span className="palabra-guia">{guia}</span>
      <span className="palabra-guia">{folio}</span>
    </div>
  )
}

function PaginaEntrada({
  entrada,
  folio,
  guia,
  /**
   * 'ficha' es la entrada, 'nota' la continuación de lo que no cupo, y
   * 'nacimiento' la hoja con el pedazo de chat donde salió la palabra.
   */
  parte = 'ficha',
}: {
  entrada: EntradaDiccionario
  folio: number
  guia: string
  parte?: 'ficha' | 'nota' | 'nacimiento'
}) {
  const plan = planDe(entrada)

  /* La hoja del nacimiento: el pedazo de conversación donde la palabra
     apareció por primera vez, con las burbujas de verdad. Todo esto
     llega cifrado — en el código no vive ni una palabra del chat. */
  if (parte === 'nacimiento') {
    return (
      <div className="relative flex h-full flex-col px-[8.5%] py-[4.8%]">
        <Cabecera guia={guia} folio={folio} />
        <div className="caja-hoja min-h-0 flex-1 overflow-hidden">
          {/* Si lo que no cupo en la ficha fue el expediente, viene acá.
              Antes se iba a una hoja para él solo, y esa hoja quedaba
              con dos tercios de papel en blanco. */}
          {plan.expedienteConLasBurbujas && entrada.datos && (
            <div className="mb-4">
              <Expediente datos={entrada.datos} sinBorde />
            </div>
          )}

          <p className="cuerpo-definicion mb-3 text-[0.82rem] italic">
            {entrada.lemaCifrado ? 'La primera vez que apareció:' : 'El día que nació la palabra:'}
          </p>

          <DondeNacio id={entrada.id} />

          {/* Las palabras no llevan gráfica: un diccionario no lleva
              estadísticas de uso mes a mes, y el dato de cuántas veces
              se dijo ya está arriba, en el expediente.

              Las tres fórmulas sí, porque ahí la gráfica no cuenta
              cuántas veces se dijeron: cuenta cuánto se fueron
              estirando, que es la historia de la entrada. */}
          {entrada.lemaCifrado && (
            <>
              <CurvaDeUso id={entrada.id} mide="largo" alto={54} titulo="cómo fue creciendo" />
              <p className="mt-2 text-[0.68rem] leading-snug text-[var(--color-tinta-suave)]">
                <span className="text-[var(--color-tinta-roja)]">▸</span> El más largo llegó a{' '}
                <strong className="font-semibold text-[var(--color-tinta)]">
                  <LargoDelLema id={entrada.id} />
                </strong>{' '}
                caracteres de un tirón.
              </p>
            </>
          )}
        </div>
      </div>
    )
  }

  if (parte === 'nota') {
    return (
      <div className="relative flex h-full flex-col px-[8.5%] py-[4.8%]">
        <Cabecera guia={guia} folio={folio} />
        <div className="caja-hoja min-h-0 flex-1 overflow-hidden">
          <p className="palabra-guia mb-3">viene de la hoja anterior</p>

          {plan.acepcionesFuera &&
            entrada.acepciones?.map((acepcion, i) => (
              <p
                key={acepcion.slice(0, 24)}
                className="cuerpo-definicion mt-3 text-[clamp(0.86rem,3.4vw,0.95rem)]"
              >
                <span className="mr-1 font-semibold text-[var(--color-tinta-roja)]">{i + 2}.</span>
                {acepcion}
              </p>
            ))}

          {plan.expedienteFuera && !plan.expedienteConLasBurbujas && entrada.datos && (
            <Expediente datos={entrada.datos} sinBorde />
          )}
        </div>
        {entrada.margen && (
          <p className="fuente-mano mt-3 -rotate-1 text-right text-[0.95rem] text-[var(--color-tinta-roja)] opacity-80">
            {entrada.margen}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="relative flex h-full flex-col px-[8.5%] py-[4.8%]">
      <Cabecera guia={guia} folio={folio} />

      <div className="caja-hoja min-h-0 flex-1 overflow-hidden">
        {/* Cuando el título es una frase de ellos, no vive en claro:
            llega descifrado. Y como es largo, se compone más chico. */}
        <h2 className={`lema ${tamanoDelLema(entrada)}`}>
          {entrada.lemaCifrado ? (
            <LemaCifrado id={entrada.id} mientras={entrada.palabra} />
          ) : (
            entrada.palabra
          )}
        </h2>

        <p className="mt-1.5 text-[0.78rem]">
          {entrada.fonetica && <span className="fonetica">[{entrada.fonetica}]</span>}
          {entrada.fonetica && ' '}
          <span className="categoria">{entrada.tipo}</span>
        </p>

        <p className="cuerpo-definicion mt-4 text-[clamp(0.86rem,3.3vw,1rem)]">
          {entrada.acepciones?.length ? (
            <span className="mr-1 font-semibold text-[var(--color-tinta-roja)]">1.</span>
          ) : null}
          {entrada.definicion}
        </p>

        {/* Las acepciones solo van acá si la entrada cabe entera; si no,
            pasan a la hoja siguiente. */}
        {!plan.acepcionesFuera &&
          entrada.acepciones?.map((acepcion, i) => (
            <p
              key={acepcion.slice(0, 24)}
              className="cuerpo-definicion mt-3 text-[clamp(0.86rem,3.4vw,0.95rem)]"
            >
              <span className="mr-1 font-semibold text-[var(--color-tinta-roja)]">{i + 2}.</span>
              {acepcion}
            </p>
          ))}

        {!plan.expedienteFuera && entrada.datos && <Expediente datos={entrada.datos} />}
      </div>

      {plan.hayNota ? (
        <p className="palabra-guia mt-3 text-right">sigue →</p>
      ) : (
        entrada.margen && (
          <p className="fuente-mano mt-3 -rotate-1 text-right text-[0.95rem] text-[var(--color-tinta-roja)] opacity-80">
            {entrada.margen}
          </p>
        )
      )}
    </div>
  )
}

/* ── La tapa ───────────────────────────────────────────────────── */

function Tapa() {
  return (
    <div className="relative flex h-full flex-col items-center justify-between px-[12%] py-[10%] text-center">
      <div className="w-full">
        <p className="palabra-guia !text-[rgb(201_162_39/0.75)]">{TEXTOS.seccion}</p>
        <h1
          className="mt-2 font-display text-[clamp(1.7rem,7vw,2.4rem)] leading-tight text-[#e8d5a8]"
          style={{
            textShadow: '0 1px 0 rgba(0,0,0,0.5), 0 0 22px rgba(201,162,39,0.25)',
          }}
        >
          {TEXTOS.titulo}
        </h1>
      </div>

      {/* La polaroid, pegada con cinta y un poco torcida */}
      <div className="relative w-[68%] max-w-[230px] -rotate-2">
        <div className="bg-[#f7f3e8] p-[6%] pb-[16%] shadow-[0_14px_30px_-10px_rgba(0,0,0,0.8)]">
          <FotoCifrada foto={FOTO_TAPA} proporcion="1 / 1" className="block w-full" />
        </div>
        {/* Las dos cintas adhesivas */}
        <span className="absolute -left-3 -top-3 h-6 w-14 -rotate-[28deg] bg-[rgb(240_228_190/0.42)] shadow-sm backdrop-blur-[1px]" />
        <span className="absolute -bottom-2 -right-3 h-6 w-14 -rotate-[22deg] bg-[rgb(240_228_190/0.42)] shadow-sm backdrop-blur-[1px]" />
      </div>

      <div className="w-full">
        <p className="fuente-mano text-[1.05rem] text-[#d9c9a4]">{TEXTOS.tapa.autores}</p>
        <p className="palabra-guia mt-1 !text-[rgb(201_162_39/0.55)]">{TEXTOS.tapa.pie}</p>
      </div>
    </div>
  )
}

/* ── La portadilla y el colofón ────────────────────────────────── */

function Portadilla() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-[12%] text-center">
      <p className="palabra-guia">{TEXTOS.seccion}</p>
      <h2 className="lema mt-3 text-[clamp(1.8rem,7vw,2.4rem)] leading-tight">{TEXTOS.titulo}</h2>
      <div className="my-5 h-px w-16 bg-[rgb(120_90_55/0.4)]" />
      <p className="cuerpo-definicion text-[0.95rem] italic">{TEXTOS.subtitulo}</p>
      <p className="fuente-mano mt-8 text-[1.1rem] text-[var(--color-tinta-roja)]">
        {entradas.length} palabras que no existen en ningún otro idioma
      </p>
    </div>
  )
}

function Prologo() {
  return (
    <div className="flex h-full flex-col justify-center px-[10%]">
      <p className="palabra-guia mb-4">cómo se lee esto</p>
      <p className="cuerpo-definicion text-[0.95rem]">
        Cada palabra trae abajo lo que el chat sabe de ella: quién la dijo primero, el día y la hora
        exactos, cuántas veces se ha dicho y de quién es más.
      </p>
      <p className="cuerpo-definicion mt-3 text-[0.95rem]">
        Nada de eso lo escribimos a mano. Sale de contar los mensajes de los dos, uno por uno, desde
        el primero.
      </p>
      <p className="fuente-mano mt-7 text-[1.1rem] text-[var(--color-tinta-roja)]">
        pasá la hoja con el dedo →
      </p>
    </div>
  )
}

function Colofon() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-[12%] text-center">
      <p className="cuerpo-definicion text-[0.95rem] italic">
        Este idioma lo hablan dos personas en todo el mundo.
      </p>
      <div className="my-5 h-px w-16 bg-[rgb(120_90_55/0.4)]" />
      <p className="palabra-guia">fin</p>
    </div>
  )
}

/**
 * La portadilla del apartado de frases.
 *
 * Las tres fórmulas no son palabras: son oraciones enteras, y no tienen
 * dónde caer en el alfabeto. Van juntas al final, detrás de esta hoja, y
 * su pestaña en el canto es ✦.
 */
function PortadillaFrases() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-[12%] text-center">
      <p className="text-2xl text-[var(--color-tinta-roja)]">{APARTADO_FRASES}</p>
      <h2 className="lema mt-4 text-[clamp(1.4rem,6vw,1.9rem)] leading-tight">frases enteras</h2>
      <div className="my-4 h-px w-14 bg-[rgb(120_90_55/0.4)]" />
      <p className="cuerpo-definicion text-[0.88rem]">
        Lo que sigue no son palabras: son oraciones que se dicen completas, todos los días,
        siempre igual. No caben en ninguna letra, así que tienen su propio apartado.
      </p>
    </div>
  )
}

/**
 * La contratapa.
 *
 * Se llega pasando la última hoja. Es papel de guarda, más oscuro que
 * el resto, con el sello del libro: un solo ejemplar, para una sola
 * persona.
 */
function Contraportada() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-[14%] text-center">
      <p className="fuente-mano text-[1.35rem] leading-tight text-[#e2d0a8]">
        Este libro se va a seguir escribiendo
      </p>
      <p className="fuente-mano mt-1 text-[1.35rem] leading-tight text-[#e2d0a8]">
        mientras nos sigamos hablando.
      </p>

      <div className="my-7 flex items-center gap-3">
        <span className="h-px w-10 bg-[rgb(201_162_39/0.45)]" />
        <span className="text-[rgb(201_162_39/0.9)]">✦</span>
        <span className="h-px w-10 bg-[rgb(201_162_39/0.45)]" />
      </div>

      <p className="palabra-guia !tracking-[0.1em] !text-[rgb(201_162_39/0.7)]">{TEXTOS.tapa.pie}</p>
      <p className="palabra-guia mt-1 !text-[rgb(201_162_39/0.55)]">Managua · Nicaragua</p>

      <p className="fuente-mano mt-9 text-[1.15rem] text-[#d8b98a]">
        de tu osito, para su osita
      </p>
    </div>
  )
}

/* ── La página entera ──────────────────────────────────────────── */

export function Diccionario() {
  const libro = useRef<ManejoLibro>(null)
  const [pos, setPos] = useState(0)
  const [abierto, setAbierto] = useState(false)

  /** Las páginas, en orden: portadilla, prólogo, entradas, colofón. */
  const { paginas, pestanas } = useMemo(() => {
    const previas: PaginaLibro[] = [
      { id: 'portadilla', contenido: <Portadilla /> },
      { id: 'prologo', contenido: <Prologo /> },
    ]

    // Las entradas largas ocupan dos hojas: la ficha, y las acepciones
    // en la siguiente. El folio se lleva contando de corrido, así que
    // las páginas se arman en un solo recorrido y no con un map.
    const deEntradas: PaginaLibro[] = []
    const saltos = new Map<string, number>()

    /* Alfabético de verdad: por la palabra que manda, no por el lema.
       «qué barbaridad» va en la B y la ñ cae después de la n, como en
       cualquier diccionario en español.

       Las tres frases enteras no son palabras y no tienen dónde caer en
       el alfabeto: van juntas al final, en su propio apartado, y su
       pestaña en el canto es ✦. */
    const clave = (e: EntradaDiccionario) => {
      if (e.letraIndice === APARTADO_FRASES) return `zzzz~${e.id}`
      if (e.letraIndice) return `${e.letraIndice.toLowerCase()}~${e.id}`
      return e.alfabetiza ?? e.palabra
    }
    const enOrden = [...entradas].sort((a, b) =>
      clave(a).localeCompare(clave(b), 'es', { sensitivity: 'base' }),
    )

    let abrioApartado = false

    for (const entrada of enOrden) {
      /* La portadilla del apartado de frases, una sola vez, justo antes
         de la primera. Sin ella, las tres aparecerían de golpe después
         de la Y sin que nada avise que cambió la sección. */
      if (entrada.letraIndice === APARTADO_FRASES && !abrioApartado) {
        abrioApartado = true
        saltos.set(APARTADO_FRASES, previas.length + deEntradas.length)
        deEntradas.push({
          id: 'apartado-frases',
          guia: 'frases enteras',
          letra: APARTADO_FRASES,
          contenido: <PortadillaFrases />,
        })
      }

      const indice = previas.length + deEntradas.length
      const letra = entrada.letraIndice ?? clave(entrada)[0]!.toUpperCase()
      if (!saltos.has(letra)) saltos.set(letra, indice)

      /* La palabra guía de la cabecera. En las entradas cuyo título es
         una frase entera, el título llega cifrado: la guía usa el
         nombre corto con el que las conocemos entre nosotros. */
      const guia = entrada.alfabetiza ?? entrada.palabra

      deEntradas.push({
        id: entrada.id,
        guia,
        letra,
        contenido: <PaginaEntrada entrada={entrada} folio={indice + 1} guia={guia} />,
      })

      // La hoja de continuación solo hace falta para las acepciones.
      // Si lo que sobra es el expediente y la entrada tiene hoja de
      // nacimiento, se va allá y no se gasta papel en una hoja aparte.
      if (planDe(entrada).hayNota) {
        deEntradas.push({
          id: `${entrada.id}-nota`,
          guia,
          letra,
          contenido: (
            <PaginaEntrada
              entrada={entrada}
              folio={previas.length + deEntradas.length + 1}
              guia={guia}
              parte="nota"
            />
          ),
        })
      }

      // Y la hoja del nacimiento, para las que tienen expediente
      // cifrado: ahí se ve la conversación donde salió la palabra.
      if (entrada.cifrada) {
        deEntradas.push({
          id: `${entrada.id}-nacimiento`,
          guia,
          letra,
          contenido: (
            <PaginaEntrada
              entrada={entrada}
              folio={previas.length + deEntradas.length + 1}
              guia={guia}
              parte="nacimiento"
            />
          ),
        })
      }
    }

    const todas: PaginaLibro[] = [
      ...previas,
      ...deEntradas,
      { id: 'colofon', contenido: <Colofon /> },
    ]

    return {
      paginas: todas,
      pestanas: [...saltos.entries()].map(([letra, indice]) => ({
        letra,
        indice,
      })),
    }
  }, [])

  // La pestaña encendida sale de la letra que la propia hoja declara.
  // Adivinarla de la primera letra del lema fallaba justo en las
  // frases: «el saludo de ella» encendía la E, no el apartado ✦.
  const letraActual = useMemo(() => paginas[pos]?.letra ?? null, [paginas, pos])

  return (
    // Sin encabezado: el libro ya trae su título grabado en la tapa, y
    // repetirlo arriba le quitaba la sorpresa de abrirlo.
    //
    // El proveedor abre el sobre cifrado una sola vez para todo el
    // libro: de ahí salen los títulos de las fórmulas, las burbujas de
    // cada nacimiento y las curvas de uso.
    <ProveedorDiccionario>
      <div className="mx-auto w-full max-w-6xl px-4 pb-0 pt-16 sm:px-6 lg:pb-16">
        {/* El libro se queda con todo el ancho: las pestañas ya no le
          roban una columna al costado, van recortadas en su propio
          canto. Los cantos se salen de la pantalla a propósito. */}
        <div className="relative mx-auto max-w-[380px] pr-7 sm:pr-8 lg:max-w-[980px] lg:pr-10">
          <Libro
            ref={libro}
            paginas={paginas}
            portada={<Tapa />}
          contratapa={<Contraportada />}
            alCambiar={setPos}
            alAbrir={() => setAbierto(true)}
            pestanas={abierto ? pestanas : undefined}
            letraActual={letraActual}
          />
        </div>

        <p className="fuente-mano mt-3 text-center text-[0.95rem] text-texto-suave sm:text-lg">
          {abierto ? TEXTOS.ayuda : TEXTOS.abrir}
        </p>
      </div>
    </ProveedorDiccionario>
  )
}
