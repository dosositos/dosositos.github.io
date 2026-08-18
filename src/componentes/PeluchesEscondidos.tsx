import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { EstrellaDePapel } from '@/componentes/EstrellaDePapel'
import {
  HALLAZGO_IMPOSTOR,
  IMPOSTOR_SIN_ENCONTRAR,
  PREMIO_PELUCHES,
  peluches,
} from '@/content/peluches'
import type { EsquinaEscondite, Peluche } from '@/content/peluches'
import { repartoDelDia } from '@/lib/escondites'
import { numeroDelDia } from '@/lib/tiempo'

/**
 * Ovi, Boo y Nico escondidos por las esquinas — y el colado, que no es
 * hijo de nadie.
 *
 * Cada uno se asoma apenas por el borde de una página, medio cuerpo
 * afuera de la pantalla. Al tocarlo sale al centro, dice lo suyo y se
 * va: encontrado es encontrado, no se queda de adorno en la esquina.
 * Con los tres hijos, el premio.
 *
 * Tres reglas que valen más que el código:
 *
 *  1. **Nunca dos en la misma página el mismo día.** Toparse con dos de
 *     un saque arruina las ganas de seguir buscando.
 *  2. **No van pegados a la pantalla, van pegados a la página.** El que
 *     se esconde arriba está al principio y se pierde al bajar; el que
 *     se esconde abajo obliga a recorrer todo. Si viajaran con el
 *     scroll, como los botones de casa y de tema, no habría nada que
 *     buscar: estarían siempre a la vista.
 *  3. **Se esconden, no se anuncian.** Sombra corta y oscura en vez de
 *     resplandor: el resplandor los delata desde el otro extremo de la
 *     pantalla y además los deja borrosos.
 *
 * Se acuerda en el teléfono (localStorage). Si se borra, vuelven a
 * esconderse, que tampoco es una tragedia.
 */

const LLAVE = 'dosositos:peluches'
const LLAVE_PREMIO = 'dosositos:peluches:premio'
const LLAVE_DORMIDOS = 'dosositos:peluches:dormidos'

/** Los que sí son hijos. El colado no cuenta para el «1 de 3». */
const HIJOS = peluches.filter((p) => !p.esImpostor)

/** El que no es hijo. Sale en el resumen igual, encontrado o no. */
const COLADO = peluches.find((p) => p.esImpostor)

function leerEncontrados(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(LLAVE) ?? '[]') as string[])
  } catch {
    return new Set()
  }
}

function guardarEncontrados(ids: Set<string>) {
  try {
    localStorage.setItem(LLAVE, JSON.stringify([...ids]))
  } catch {
    // Sin localStorage el juego funciona igual, solo que empieza de cero
    // en cada visita.
  }
}

function yaVioElPremio(): boolean {
  try {
    return localStorage.getItem(LLAVE_PREMIO) === 'si'
  } catch {
    return false
  }
}

function anotarPremio() {
  try {
    localStorage.setItem(LLAVE_PREMIO, 'si')
  } catch {
    // ídem
  }
}

/** El día en que los mandó a dormir, o 0 si andan despiertos. */
function leerDormidos(): number {
  try {
    return Number(localStorage.getItem(LLAVE_DORMIDOS) ?? 0)
  } catch {
    return 0
  }
}

function olvidarTodo(dormirHoy: number) {
  try {
    localStorage.removeItem(LLAVE)
    localStorage.removeItem(LLAVE_PREMIO)
    if (dormirHoy) localStorage.setItem(LLAVE_DORMIDOS, String(dormirHoy))
    else localStorage.removeItem(LLAVE_DORMIDOS)
  } catch {
    // ídem
  }
}

/* ── La cara de cada uno ─────────────────────────────────────────── */

/**
 * Los retratos bordados, los únicos archivos de imagen que viajan en
 * claro dentro del bundle (`npm run peluches:preparar` los genera). No
 * van en `content/peluches.ts` a propósito: ese archivo es datos que
 * edita Armando y no tiene por qué importar assets.
 *
 * Se recogen solos de la carpeta en vez de importarse uno por uno: el
 * día que aparezca `dummy.webp` queda cableado sin tocar este archivo,
 * y mientras no esté, ese peluche se asoma con su emoji y no se rompe
 * nada. La llave es el nombre del archivo sin extensión, que tiene que
 * coincidir con el `id` de la ficha.
 */
const RETRATOS: Record<string, string> = Object.fromEntries(
  Object.entries(
    import.meta.glob('../assets/peluches/*.webp', {
      eager: true,
      query: '?url',
      import: 'default',
    }) as Record<string, string>,
  ).map(([ruta, url]) => [ruta.split('/').pop()!.replace('.webp', ''), url]),
)

/**
 * El retrato del peluche, con el emoji de la ficha como respaldo
 * mientras alguno no tenga el suyo.
 *
 * `nombrar` solo se usa donde ella ya lo encontró: mientras está
 * escondido el `alt` se queda vacío, porque un lector de pantalla
 * diciendo «Ovi» arruina el juego antes de empezarlo.
 */
function Retrato({
  peluche,
  lado,
  nombrar = false,
}: {
  peluche: Peluche
  lado: number
  nombrar?: boolean
}) {
  const retrato = RETRATOS[peluche.id]

  if (!retrato) {
    return (
      <span className="block leading-none" style={{ fontSize: lado * 0.8 }}>
        {peluche.emoji}
      </span>
    )
  }

  return (
    <img
      src={retrato}
      alt={nombrar ? `${peluche.nombre}, ${peluche.especie} de peluche` : ''}
      aria-hidden={!nombrar}
      draggable={false}
      className="block object-contain"
      style={{ width: lado, height: lado }}
    />
  )
}

/**
 * El colado cuando no lo encontró: su forma en negro y un signo de
 * interrogación encima.
 *
 * Se hace con `brightness(0)` sobre el mismo retrato en vez de dibujar
 * una silueta aparte — así la forma es exactamente la suya, con peluca y
 * todo, y el día que se cambie el dibujo la silueta se cambia sola. El
 * disco de atrás está porque negro sobre el panel nocturno no se
 * distingue de un agujero.
 */
function Silueta({ peluche, lado }: { peluche: Peluche; lado: number }) {
  const retrato = RETRATOS[peluche.id]

  return (
    <span
      className="relative grid place-items-center rounded-full bg-texto/[0.07]"
      style={{ width: lado * 1.15, height: lado * 1.15 }}
    >
      {retrato ? (
        <img
          src={retrato}
          alt=""
          aria-hidden
          draggable={false}
          className="block object-contain"
          style={{ width: lado, height: lado, filter: 'brightness(0)', opacity: 0.55 }}
        />
      ) : (
        <span className="block leading-none opacity-40" style={{ fontSize: lado * 0.8 }}>
          {peluche.emoji}
        </span>
      )}

      <span
        aria-hidden
        className="absolute font-display text-acento"
        style={{ fontSize: lado * 0.5, textShadow: '0 2px 10px rgb(0 0 0 / 0.6)' }}
      >
        ?
      </span>
    </span>
  )
}

/* ── Dónde se para hoy cada uno ──────────────────────────────────── */

/*
 * El reparto vive en `lib/escondites.ts` y no aquí: así `npm run
 * peluches:hoy` puede decir dónde están hoy usando exactamente el mismo
 * código que la web, en vez de una copia que se despiste con el tiempo.
 */

/**
 * Dónde se ancla, dentro de la PÁGINA y no de la pantalla.
 *
 * `absolute` y no `fixed`: el de arriba se ve al entrar y se pierde en
 * cuanto ella baja, el de abajo aparece recién al final del recorrido.
 */
const ANCLA: Record<EsquinaEscondite, string> = {
  // Pegados a la esquina de verdad. El envoltorio de App.tsx abarca el
  // pie, así que esto es la esquina de abajo de la página entera: al
  // llegar al final del scroll quedan en el rincón de la pantalla.
  'abajo-izquierda': 'bottom-8 left-4',
  'abajo-derecha': 'bottom-8 right-4',
  'arriba-izquierda': 'top-6 left-4',
}

/** Escondido: medio cuerpo fuera del borde y torcido. */
const ESCONDIDO: Record<EsquinaEscondite, { x: string; y: string; rotate: number }> = {
  'abajo-izquierda': { x: '-32%', y: '30%', rotate: -16 },
  'abajo-derecha': { x: '32%', y: '30%', rotate: 16 },
  'arriba-izquierda': { x: '-32%', y: '-30%', rotate: 16 },
}

/** Con el ratón encima se asoma un poco más, pero no se entrega. */
const ASOMA: Record<EsquinaEscondite, { x: string; y: string }> = {
  'abajo-izquierda': { x: '-22%', y: '22%' },
  'abajo-derecha': { x: '22%', y: '22%' },
  'arriba-izquierda': { x: '-22%', y: '-22%' },
}

/** El estallido de estrellitas de papel del momento en que lo encuentra. */
const CHISPAS = Array.from({ length: 10 }, (_, i) => {
  const angulo = (i / 10) * Math.PI * 2
  return {
    x: Math.cos(angulo) * 120,
    y: Math.sin(angulo) * 120,
    giro: i * 51,
    tamanio: 14 + (i % 3) * 6,
  }
})

/* ── Uno escondido en su esquina ─────────────────────────────────── */

function Escondido({
  peluche,
  esquina,
  alTocar,
}: {
  peluche: Peluche
  esquina: EsquinaEscondite
  alTocar: () => void
}) {
  const sinMovimiento = useReducedMotion()

  return (
    // La raíz tiene que ser un `motion` para que AnimatePresence pueda
    // despedirlo: si fuera un div pelado, al encontrarlo desaparecería
    // de golpe aunque el botón de adentro declare su `exit`.
    <motion.div
      className={`pointer-events-none absolute z-40 ${ANCLA[esquina]}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={sinMovimiento ? { opacity: 0 } : { opacity: 0, scale: 0.4 }}
      transition={{ duration: 0.35 }}
    >
      <motion.button
        type="button"
        onClick={alTocar}
        // Sin nombrarlo: si el lector de pantalla dice "Ovi", ya no hay
        // nada que encontrar.
        aria-label="Algo se asoma en la esquina"
        className="pointer-events-auto grid h-16 w-16 cursor-pointer place-items-center"
        initial={ESCONDIDO[esquina]}
        animate={{ ...ESCONDIDO[esquina], opacity: 1 }}
        whileHover={sinMovimiento ? undefined : { ...ASOMA[esquina], opacity: 1 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 260, damping: 14 }}
      >
        <motion.span
          className="block"
          // Sombra corta y oscura, no resplandor: lo despega del fondo
          // sin delatarlo desde la otra punta ni dejarlo borroso.
          style={{ filter: 'drop-shadow(0 3px 6px rgb(0 0 0 / 0.55))' }}
          // El bamboleo va aparte del botón: si se animara el mismo
          // elemento, pelearía con el "salir de la esquina".
          animate={sinMovimiento ? { rotate: 0 } : { rotate: [0, -7, 0, 7, 0] }}
          transition={
            sinMovimiento
              ? { duration: 0.4 }
              : { duration: 6, repeat: Infinity, ease: 'easeInOut' }
          }
        >
          <Retrato peluche={peluche} lado={52} />
        </motion.span>
      </motion.button>
    </motion.div>
  )
}

/* ── El momento de encontrarlo ───────────────────────────────────── */

/**
 * Sale al centro, grande, y el resto de la página se apaga detrás.
 *
 * Se va sola a los pocos segundos, pero se puede cerrar antes tocando:
 * si ella ya leyó, esperar a que se vaya es tiempo muerto.
 */
function Hallazgo({
  peluche,
  llevados,
  alCerrar,
}: {
  peluche: Peluche
  llevados: number
  alCerrar: () => void
}) {
  const sinMovimiento = useReducedMotion()

  useEffect(() => {
    const t = setTimeout(alCerrar, 5200)
    const alTecla = (e: KeyboardEvent) => e.key === 'Escape' && alCerrar()
    window.addEventListener('keydown', alTecla)
    return () => {
      clearTimeout(t)
      window.removeEventListener('keydown', alTecla)
    }
  }, [alCerrar])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      onClick={alCerrar}
      role="dialog"
      aria-live="polite"
      aria-label={peluche.esImpostor ? HALLAZGO_IMPOSTOR.titulo : `Encontraste a ${peluche.nombre}`}
      className="fixed inset-0 z-[60] grid cursor-pointer place-items-center bg-fondo/85 p-6 backdrop-blur-sm"
    >
      <div className="relative grid place-items-center text-center">
        {/* El estallido */}
        {!sinMovimiento && (
          <span aria-hidden className="absolute top-24">
            {CHISPAS.map((c, i) => (
              <motion.span
                key={i}
                className="absolute block"
                initial={{ x: 0, y: 0, scale: 0.2, opacity: 1 }}
                animate={{ x: c.x, y: c.y, scale: 1, opacity: 0 }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
              >
                <EstrellaDePapel
                  color={i % 2 === 0 ? peluche.color : 'var(--t-acento)'}
                  tamanio={c.tamanio}
                  giro={c.giro}
                />
              </motion.span>
            ))}
          </span>
        )}

        <motion.div
          initial={sinMovimiento ? { opacity: 0 } : { scale: 0.2, opacity: 0, rotate: -25 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={
            sinMovimiento
              ? { duration: 0.3 }
              : { type: 'spring', stiffness: 200, damping: 12, mass: 0.8 }
          }
          style={{ filter: `drop-shadow(0 12px 30px rgb(0 0 0 / 0.6))` }}
        >
          <Retrato peluche={peluche} lado={190} nombrar />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="mt-6 max-w-sm"
        >
          {peluche.esImpostor ? (
            <>
              <p className="text-[0.7rem] uppercase tracking-[0.28em] text-texto-suave/70">
                {HALLAZGO_IMPOSTOR.titulo}
              </p>
              <p className="fuente-mano mt-3 text-2xl leading-snug text-texto">
                {peluche.frase}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-texto-suave/80">
                {HALLAZGO_IMPOSTOR.mensaje}
              </p>
            </>
          ) : (
            <>
              <p className="text-[0.7rem] uppercase tracking-[0.28em] text-acento">
                encontraste a {peluche.nombre}
              </p>
              <p className="fuente-mano mt-3 text-2xl leading-snug text-texto">
                {peluche.frase}
              </p>
              <p className="mt-5 text-sm text-texto-suave/80">
                {llevados} de {HIJOS.length} hijos escondidos
              </p>
              <div className="mt-3 flex justify-center gap-2" aria-hidden>
                {HIJOS.map((h, i) => (
                  <span
                    key={h.id}
                    className="h-1.5 w-8 rounded-full transition-colors"
                    style={{
                      background: i < llevados ? 'var(--t-acento)' : 'var(--t-borde)',
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}

/* ── El premio de encontrarlos a los tres ────────────────────────── */

function Premio({
  coladoEncontrado,
  alMandarADormir,
}: {
  coladoEncontrado: boolean
  alMandarADormir: () => void
}) {
  const sinMovimiento = useReducedMotion()

  // Cerrar el resumen ES mandarlos a dormir, se toque el botón, la tecla
  // o el fondo. Antes había también un «esconderlos otra vez», y sin él
  // hacía falta esto: si se pudiera cerrar sin más, quedaban los tres
  // marcados como encontrados para siempre y no volvían a salir nunca.
  useEffect(() => {
    const alTecla = (e: KeyboardEvent) => e.key === 'Escape' && alMandarADormir()
    window.addEventListener('keydown', alTecla)
    return () => window.removeEventListener('keydown', alTecla)
  }, [alMandarADormir])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={alMandarADormir}
      className="fixed inset-0 z-[60] overflow-y-auto bg-fondo/90 p-5 backdrop-blur-sm"
    >
      <motion.div
        role="dialog"
        aria-label={PREMIO_PELUCHES.titulo}
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 24, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        className="papel mx-auto my-6 w-full max-w-lg rounded-2xl px-6 py-9 text-center"
      >
        <h2 className="font-display text-2xl texto-degradado sm:text-3xl">
          {PREMIO_PELUCHES.titulo}
        </h2>
        <p className="fuente-mano mt-4 text-xl leading-snug text-texto-suave">
          {PREMIO_PELUCHES.mensaje}
        </p>

        {/* Uno debajo del otro y grandes: acá sí se miran con calma, que
            para eso se hicieron los retratos bordados. */}
        <ul className="mt-9 space-y-8">
          {HIJOS.map((p, i) => (
            <motion.li
              key={p.id}
              initial={sinMovimiento ? { opacity: 0 } : { opacity: 0, y: 26, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.25 + i * 0.18, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
              className="flex flex-col items-center"
            >
              <motion.span
                className="anima-flotar block"
                style={{
                  animationDelay: `${i * 0.5}s`,
                  filter: `drop-shadow(0 10px 22px rgb(0 0 0 / 0.45))`,
                }}
              >
                <Retrato peluche={p} lado={168} nombrar />
              </motion.span>

              <p className="mt-4 font-display text-xl text-texto">{p.nombre}</p>
              <p className="text-[0.68rem] uppercase tracking-[0.22em] text-texto-suave/60">
                {p.especie}
              </p>
              <p className="fuente-mano mt-3 max-w-xs text-lg leading-snug text-texto-suave">
                {/* Las fichas a medio escribir se marcan con «FALTA:» y esa
                    marca es para Armando, no para ella. Hasta que la de Boo
                    esté escrita, en su lugar habla el peluche. */}
                {p.descripcion.startsWith('FALTA') ? p.frase : p.descripcion}
              </p>
            </motion.li>
          ))}
        </ul>

        <p className="mt-9 text-sm text-texto-suave/70">— {PREMIO_PELUCHES.firma}</p>

        {/* Y el que no es hijo. Si dio con él sale con su cara; si no,
            solo su forma en negro, que ya es media pista para mañana. */}
        {COLADO && (
          <div className="mt-10 border-t border-borde/60 pt-8">
            {coladoEncontrado ? (
              <>
                <p className="text-[0.68rem] uppercase tracking-[0.24em] text-texto-suave/60">
                  {HALLAZGO_IMPOSTOR.titulo}
                </p>
                <div className="mt-5 flex flex-col items-center">
                  <span style={{ filter: 'drop-shadow(0 10px 22px rgb(0 0 0 / 0.45))' }}>
                    <Retrato peluche={COLADO} lado={132} nombrar />
                  </span>
                  <p className="mt-4 font-display text-xl text-texto">{COLADO.nombre}</p>
                  <p className="text-[0.68rem] uppercase tracking-[0.22em] text-texto-suave/60">
                    {COLADO.especie}
                  </p>
                  <p className="fuente-mano mt-3 max-w-xs text-lg leading-snug text-texto-suave">
                    {HALLAZGO_IMPOSTOR.mensaje}
                  </p>
                </div>
              </>
            ) : (
              <>
                <p className="text-[0.68rem] uppercase tracking-[0.24em] text-texto-suave/60">
                  {IMPOSTOR_SIN_ENCONTRAR.titulo}
                </p>
                <div className="mt-5 flex flex-col items-center">
                  <Silueta peluche={COLADO} lado={132} />
                  <p className="fuente-mano mt-5 max-w-xs text-lg leading-snug text-texto-suave">
                    {IMPOSTOR_SIN_ENCONTRAR.mensaje}
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={alMandarADormir}
          className="mt-10 rounded-full border border-acento/60 px-6 py-2.5 text-sm text-acento transition-colors hover:bg-acento/10"
        >
          que duerman hasta mañana
        </button>
      </motion.div>
    </motion.div>
  )
}

/* ── El que reparte a los cuatro ─────────────────────────────────── */

export function PeluchesEscondidos() {
  const { pathname } = useLocation()
  const dia = numeroDelDia()

  const [encontrados, setEncontrados] = useState<Set<string>>(leerEncontrados)
  const [hallazgo, setHallazgo] = useState<Peluche | null>(null)
  const [premio, setPremio] = useState(false)
  const [dormidosEl, setDormidosEl] = useState<number>(leerDormidos)

  // Se recalcula solo cuando cambia el día: dentro de la misma visita,
  // ir y volver de una página no los reacomoda.
  const aqui = useMemo(
    () => repartoDelDia(dia).filter(({ escondite }) => escondite.ruta === pathname),
    [dia, pathname],
  )

  const hijosLlevados = HIJOS.filter((h) => encontrados.has(h.id)).length
  const completos = hijosLlevados === HIJOS.length
  const durmiendo = dormidosEl === dia

  // El premio espera a que se cierre el cartel del tercero: encimarlos
  // sería no dejarla ver ninguno de los dos.
  useEffect(() => {
    if (!completos || hallazgo || yaVioElPremio()) return
    const t = setTimeout(() => {
      setPremio(true)
      anotarPremio()
    }, 500)
    return () => clearTimeout(t)
  }, [completos, hallazgo])

  function tocar(p: Peluche) {
    setHallazgo(p)
    if (encontrados.has(p.id)) return

    const nuevos = new Set([...encontrados, p.id])
    setEncontrados(nuevos)
    guardarEncontrados(nuevos)
  }

  function mandarADormir() {
    olvidarTodo(dia)
    setEncontrados(new Set())
    setDormidosEl(dia)
    setPremio(false)
  }

  return (
    <>
      <AnimatePresence>
        {!durmiendo &&
          aqui
            .filter(({ peluche }) => !encontrados.has(peluche.id))
            .map(({ peluche, esquina }) => (
              <Escondido
                key={peluche.id}
                peluche={peluche}
                esquina={esquina}
                alTocar={() => tocar(peluche)}
              />
            ))}
      </AnimatePresence>

      <AnimatePresence>
        {hallazgo && (
          <Hallazgo peluche={hallazgo} llevados={hijosLlevados} alCerrar={() => setHallazgo(null)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {premio && (
          <Premio
            coladoEncontrado={!!COLADO && encontrados.has(COLADO.id)}
            alMandarADormir={mandarADormir}
          />
        )}
      </AnimatePresence>
    </>
  )
}
