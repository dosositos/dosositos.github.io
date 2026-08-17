import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ContextoDelChat } from '@/componentes/ContextoDelChat'
import { ACLARACION, FINALES, OPCIONES, PORTADA, REACCIONES, REGLAS, REMATE } from '@/content/juego'
import { abrirSobreUnaVez, claveRecordada } from '@/lib/cripto'
import type { FraseJuego, RespuestaJuego, SobreJuego } from '@/types'

/**
 * ¿QUIÉN DIJO ESTO?
 *
 * Tres vidas, doce frases y cuatro respuestas: osito, osita, los dos o
 * ninguno. Las frases llegan de public/cifrado/juego.enc — en el código
 * no vive ni una palabra de la conversación.
 *
 * Dos decisiones que le dan sentido al juego:
 *
 * · Las frases vienen emparejadas en su forma de escribir (mayúsculas,
 *   abreviaciones, tildes). Sin eso la primera letra resolvía todo. Se
 *   avisa en la primera pantalla, porque hacerlo callado sería trampa.
 * · Al responder se muestra de dónde salió la frase: unos mensajes
 *   antes y después. Ahí está media gracia, y convierte el juego en
 *   volver a leer el chat.
 */

const ORDEN: RespuestaJuego[] = ['osito', 'osita', 'ambos', 'ninguno']

const LLAVE_RECORD = 'dosositos:juego:record'
const LLAVE_VISTAS = 'dosositos:juego:vistas'

type Fase = 'cargando' | 'sin-archivo' | 'portada' | 'jugando' | 'final'

interface Jugada {
  frase: FraseJuego
  respondio: RespuestaJuego
  acerto: boolean
}

// ══ Armar la partida ═══════════════════════════════════════════════

function barajar<T>(lista: T[]): T[] {
  const copia = [...lista]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia
}

/** Las que ya salieron en partidas anteriores, para no repetirlas. */
function leerVistas(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(LLAVE_VISTAS) ?? '[]') as string[])
  } catch {
    return new Set()
  }
}

function anotarVistas(ids: string[], total: number) {
  try {
    const vistas = [...leerVistas(), ...ids]
    // Cuando ya se vieron casi todas, se empieza de nuevo: mejor repetir
    // que quedarse sin frases a mitad de una partida.
    localStorage.setItem(LLAVE_VISTAS, JSON.stringify(vistas.length > total - REGLAS.rondas ? ids : vistas))
  } catch {
    // Modo privado del navegador: que no se repitan es un lujo, no una necesidad.
  }
}

/**
 * Una partida mezclada a propósito: la mayoría de uno solo (mitad y
 * mitad entre los dos), unas cuantas de "los dos" y un par de las
 * inventadas, para que "ninguno" pueda ser la respuesta buena y no se
 * vuelva un botón de adorno.
 */
function armarPartida(frases: FraseJuego[]): FraseJuego[] {
  const vistas = leerVistas()
  const frescas = (lista: FraseJuego[]) => {
    const nuevas = lista.filter((f) => !vistas.has(f.id))
    return barajar(nuevas.length > 0 ? nuevas : lista)
  }

  const de = (quien: RespuestaJuego) => frescas(frases.filter((f) => f.respuesta === quien))

  const ninguno = de('ninguno').slice(0, 2)
  const ambos = de('ambos').slice(0, 3)
  const faltan = REGLAS.rondas - ninguno.length - ambos.length

  // Si sobra una, se la lleva uno u otro al azar: dársela siempre al
  // mismo sería una pista de más partida tras partida.
  const alOsito = Math.random() < 0.5
  const osito = de('osito').slice(0, alOsito ? Math.ceil(faltan / 2) : Math.floor(faltan / 2))
  const osita = de('osita').slice(0, alOsito ? Math.floor(faltan / 2) : Math.ceil(faltan / 2))

  const elegidas = barajar([...ninguno, ...ambos, ...osito, ...osita])

  // Si faltara alguna categoría (todavía no hay inventadas, por ejemplo)
  // se completa con lo que haya, sin repetir.
  if (elegidas.length < REGLAS.rondas) {
    const yaEstan = new Set(elegidas.map((f) => f.id))
    elegidas.push(
      ...barajar(frases.filter((f) => !yaEstan.has(f.id))).slice(0, REGLAS.rondas - elegidas.length),
    )
  }

  return elegidas.slice(0, REGLAS.rondas)
}

// ══ Piezas de pantalla ═════════════════════════════════════════════

function Vidas({ quedan }: { quedan: number }) {
  return (
    <span className="flex gap-1" aria-label={`${quedan} vidas`}>
      {Array.from({ length: REGLAS.vidas }, (_, i) => (
        <motion.span
          key={i}
          animate={i < quedan ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0.25 }}
          transition={{ type: 'spring', stiffness: 300, damping: 18 }}
          className="text-lg"
        >
          {i < quedan ? '❤️' : '🤍'}
        </motion.span>
      ))}
    </span>
  )
}

function Boton({
  cual,
  onClick,
  estado,
}: {
  cual: RespuestaJuego
  onClick: () => void
  estado: 'esperando' | 'correcta' | 'elegida-mal' | 'apagada'
}) {
  const opcion = OPCIONES[cual]

  const pinta = {
    esperando: 'border-borde bg-superficie/70 hover:border-acento hover:-translate-y-0.5',
    correcta: 'border-cipres bg-cipres/25 text-texto',
    'elegida-mal': 'border-hibisco bg-hibisco/20 text-texto',
    apagada: 'border-borde/40 bg-superficie/30 text-texto-suave/40',
  }[estado]

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={estado !== 'esperando'}
      className={`flex min-h-20 flex-col items-center justify-center gap-1 rounded-2xl border px-3 py-4 text-center transition-all duration-300 disabled:cursor-default ${pinta}`}
    >
      <span className="text-2xl">{opcion.icono}</span>
      <span className="font-display text-sm leading-tight">{opcion.texto}</span>
    </button>
  )
}

// ══ La página ══════════════════════════════════════════════════════

export function Juego() {
  const [fase, setFase] = useState<Fase>('cargando')
  const [frases, setFrases] = useState<FraseJuego[]>([])

  const [partida, setPartida] = useState<FraseJuego[]>([])
  const [ronda, setRonda] = useState(0)
  const [vidas, setVidas] = useState(REGLAS.vidas)
  const [puntos, setPuntos] = useState(0)
  const [racha, setRacha] = useState(0)
  const [mejorRacha, setMejorRacha] = useState(0)
  const [jugadas, setJugadas] = useState<Jugada[]>([])
  const [elegida, setElegida] = useState<RespuestaJuego | null>(null)
  const [record, setRecord] = useState(0)

  const panelResultado = useRef<HTMLDivElement>(null)

  // ── Traer las frases, ya descifradas ────────────────────────────
  useEffect(() => {
    const clave = claveRecordada()
    if (!clave) {
      setFase('sin-archivo')
      return
    }

    let vigente = true

    abrirSobreUnaVez<SobreJuego>('juego', clave)
      .then((sobre) => {
        if (!vigente) return
        if (!sobre.frases?.length) {
          setFase('sin-archivo')
          return
        }
        setFrases(sobre.frases)
        setFase('portada')
      })
      .catch(() => vigente && setFase('sin-archivo'))

    try {
      setRecord(Number(localStorage.getItem(LLAVE_RECORD) ?? 0))
    } catch {
      // sin localStorage se juega igual, solo que sin récord
    }

    return () => {
      vigente = false
    }
  }, [])

  const actual = partida[ronda]
  const aciertos = jugadas.filter((j) => j.acerto).length

  const final = useMemo(
    () => FINALES.find((f) => aciertos >= f.aciertos) ?? FINALES[FINALES.length - 1],
    [aciertos],
  )

  function empezar() {
    setPartida(armarPartida(frases))
    setRonda(0)
    setVidas(REGLAS.vidas)
    setPuntos(0)
    setRacha(0)
    setMejorRacha(0)
    setJugadas([])
    setElegida(null)
    setFase('jugando')
  }

  function responder(cual: RespuestaJuego) {
    if (elegida || !actual) return

    const acerto = cual === actual.respuesta
    setElegida(cual)
    setJugadas((previas) => [...previas, { frase: actual, respondio: cual, acerto }])

    if (acerto) {
      const seguidas = racha + 1
      const extra = REGLAS.racha * Math.min(seguidas - 1, 4)
      const dificil = actual.respuesta === 'ambos' || actual.respuesta === 'ninguno' ? REGLAS.dificil : 0
      setPuntos((p) => p + REGLAS.acierto + extra + dificil)
      setRacha(seguidas)
      setMejorRacha((m) => Math.max(m, seguidas))
    } else {
      setRacha(0)
      setVidas((v) => v - 1)
    }

    // En el teléfono el contexto queda debajo del pliegue y parecería
    // que no pasó nada: lo llevamos a la vista.
    setTimeout(() => panelResultado.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 120)
  }

  function siguiente() {
    const ultima = ronda + 1 >= partida.length
    const sinVidas = vidas <= 0

    if (ultima || sinVidas) {
      anotarVistas(
        partida.slice(0, ronda + 1).map((f) => f.id),
        frases.length,
      )
      if (puntos > record) {
        setRecord(puntos)
        try {
          localStorage.setItem(LLAVE_RECORD, String(puntos))
        } catch {
          // da igual: el récord es un adorno
        }
      }
      setFase('final')
      return
    }

    setElegida(null)
    setRonda((r) => r + 1)
  }

  async function compartir() {
    const texto = `¿quién dijo esto? — ${aciertos}/${jugadas.length} y ${puntos} puntos 🧸`
    try {
      if (navigator.share) await navigator.share({ text: texto })
      else await navigator.clipboard.writeText(texto)
    } catch {
      // canceló, o el navegador no deja: no pasa nada
    }
  }

  // ── Mientras descifra ───────────────────────────────────────────
  if (fase === 'cargando') {
    return (
      <div className="grid min-h-[70dvh] place-items-center px-6">
        <p className="fuente-mano animate-pulse text-xl text-texto-suave">
          buscando lo que nos dijimos...
        </p>
      </div>
    )
  }

  // ── No abrió el archivo ─────────────────────────────────────────
  if (fase === 'sin-archivo') {
    return (
      <div className="mx-auto grid min-h-[70dvh] w-full max-w-md place-items-center px-6 text-center">
        <div className="papel rounded-2xl px-6 py-10">
          <span className="anima-flotar block text-5xl">🧸</span>
          <p className="fuente-mano mt-6 text-xl text-texto-suave">
            todavía no puedo abrir las frases
          </p>
          {import.meta.env.DEV && (
            <p className="mt-4 text-sm text-hibisco">
              ¿Corriste <code>npm run juego:preparar</code> y se cifró{' '}
              <code>public/cifrado/juego.enc</code>?
            </p>
          )}
          <Link
            to="/"
            className="mt-8 inline-block rounded-full border border-borde px-5 py-2 text-sm text-texto-suave transition-colors hover:border-acento hover:text-acento"
          >
            ← volver a la madriguera
          </Link>
        </div>
      </div>
    )
  }

  // ── Portada, con la aclaración ──────────────────────────────────
  if (fase === 'portada') {
    return (
      <div className="mx-auto w-full max-w-2xl px-5 pb-24 pt-16">
        <motion.header
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <span className="anima-flotar block text-5xl">🎯</span>
          <h1 className="mt-6 font-display text-4xl texto-degradado sm:text-5xl">{PORTADA.titulo}</h1>
          <p className="fuente-mano mt-3 text-xl text-texto-suave">{PORTADA.entrada}</p>
        </motion.header>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="papel mt-10 rounded-2xl px-5 py-6 sm:px-7"
        >
          <h2 className="fuente-mano text-2xl text-acento">{ACLARACION.titulo}</h2>
          {ACLARACION.parrafos.map((p, i) => (
            <p key={i} className="mt-3 text-[0.95rem] leading-relaxed text-texto-suave">
              {p}
            </p>
          ))}
        </motion.section>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-8 text-center"
        >
          <button
            type="button"
            onClick={empezar}
            className="w-full rounded-full bg-acento px-8 py-4 font-display text-lg text-fondo transition-transform hover:-translate-y-0.5 sm:w-auto sm:px-16"
          >
            {PORTADA.empezar}
          </button>
          <p className="mt-4 text-xs text-texto-suave/60">{ACLARACION.pie}</p>
          <p className="mt-2 text-xs text-texto-suave/45">
            {REGLAS.rondas} frases · {REGLAS.vidas} vidas
            {record > 0 && ` · tu récord: ${record} puntos`}
          </p>
        </motion.div>
      </div>
    )
  }

  // ── Final ───────────────────────────────────────────────────────
  if (fase === 'final') {
    return (
      <div className="mx-auto w-full max-w-2xl px-5 pb-24 pt-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.34, 1.56, 0.64, 1] }}
          className="papel rounded-2xl px-6 py-10 text-center"
        >
          <span className="block text-6xl">{final.icono}</span>
          <h1 className="resplandor mt-6 font-display text-3xl text-acento">{final.titulo}</h1>

          <p className="mt-6 text-5xl font-display texto-degradado">{puntos}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.24em] text-texto-suave/60">puntos</p>

          <p className="mt-6 text-base leading-relaxed text-texto-suave">{final.texto}</p>

          <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-texto-suave/70">
            <span>
              {aciertos} de {jugadas.length} bien
            </span>
            <span>racha máxima: {mejorRacha}</span>
            {record > 0 && <span>récord: {record}</span>}
          </div>

          <p className="fuente-mano mt-8 text-xl text-acento-2">{REMATE.invitacion}</p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={empezar}
              className="rounded-full bg-acento px-8 py-3 font-display text-base text-fondo transition-transform hover:-translate-y-0.5"
            >
              {PORTADA.otraVez}
            </button>
            <button
              type="button"
              onClick={compartir}
              className="rounded-full border border-borde px-8 py-3 text-base text-texto-suave transition-colors hover:border-acento hover:text-acento"
            >
              {REMATE.compartir}
            </button>
          </div>
        </motion.div>

        {/* El repaso: qué era cada una, para el que quiera revisar */}
        <section className="mt-10 space-y-2">
          {jugadas.map((j, i) => (
            <div
              key={j.frase.id}
              className="flex items-start gap-3 rounded-xl border border-borde/50 px-4 py-3 text-sm"
            >
              <span className="text-base">{j.acerto ? '✅' : '❌'}</span>
              <span className="flex-1 text-texto-suave">
                <span className="line-clamp-2">{j.frase.texto}</span>
                <span className="mt-1 block text-xs text-texto-suave/55">
                  {OPCIONES[j.frase.respuesta].icono} {OPCIONES[j.frase.respuesta].texto}
                  {!j.acerto && ` · vos dijiste ${OPCIONES[j.respondio].texto}`}
                </span>
              </span>
              <span className="text-xs text-texto-suave/40">{i + 1}</span>
            </div>
          ))}
        </section>
      </div>
    )
  }

  // ── Jugando ─────────────────────────────────────────────────────
  if (!actual) return null

  const respondida = elegida !== null
  const acerto = respondida && elegida === actual.respuesta
  const reaccion = acerto
    ? REACCIONES.acierto[ronda % REACCIONES.acierto.length]
    : REACCIONES.fallo[ronda % REACCIONES.fallo.length]

  return (
    <div className="mx-auto w-full max-w-2xl px-5 pb-28 pt-14">
      {/* Marcador */}
      <div className="flex items-center justify-between gap-3">
        <Vidas quedan={vidas} />
        <span className="text-xs uppercase tracking-[0.2em] text-texto-suave/60">
          {ronda + 1} / {partida.length}
        </span>
        <motion.span
          key={puntos}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 320, damping: 16 }}
          className="font-display text-lg tabular-nums text-acento"
        >
          {puntos}
        </motion.span>
      </div>

      {/* La frase */}
      <AnimatePresence mode="wait">
        <motion.blockquote
          key={actual.id}
          initial={{ opacity: 0, y: 24, rotate: -1 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="papel mt-6 rounded-2xl px-6 py-10 text-center"
        >
          <span className="block font-display text-4xl leading-none text-acento/40" aria-hidden>
            “
          </span>
          <p className="mt-2 whitespace-pre-line text-xl leading-relaxed text-texto sm:text-2xl">
            {actual.texto}
          </p>
        </motion.blockquote>
      </AnimatePresence>

      {/* Las cuatro respuestas */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        {ORDEN.map((cual) => (
          <Boton
            key={cual}
            cual={cual}
            onClick={() => responder(cual)}
            estado={
              !respondida
                ? 'esperando'
                : cual === actual.respuesta
                  ? 'correcta'
                  : cual === elegida
                    ? 'elegida-mal'
                    : 'apagada'
            }
          />
        ))}
      </div>

      {/* Qué pasó, y de dónde salió la frase */}
      <AnimatePresence>
        {respondida && (
          <motion.div
            ref={panelResultado}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-8 scroll-mt-6"
            role="status"
            aria-live="polite"
          >
            <p
              className={`fuente-mano text-center text-2xl ${acerto ? 'text-cipres' : 'text-hibisco'}`}
            >
              {reaccion}
            </p>

            {actual.respuesta === 'ninguno' && (
              <p className="mt-2 text-center text-sm text-texto-suave">
                {acerto ? REACCIONES.trampaEsquivada : REACCIONES.trampaCaida}
              </p>
            )}

            {actual.veces && (
              <p className="mt-2 text-center text-sm text-texto-suave">
                osito la dijo {actual.veces.osito} veces · osita {actual.veces.osita}
              </p>
            )}

            {actual.pista && (
              <p className="fuente-mano mt-3 text-center text-lg text-texto-suave">{actual.pista}</p>
            )}

            <div className="mt-6">
              <ContextoDelChat contextos={actual.contextos} />
            </div>

            <button
              type="button"
              onClick={siguiente}
              autoFocus
              className="mt-8 w-full rounded-full bg-acento px-8 py-4 font-display text-lg text-fondo transition-transform hover:-translate-y-0.5"
            >
              {vidas <= 0 || ronda + 1 >= partida.length ? 'ver cómo te fue' : 'siguiente'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
