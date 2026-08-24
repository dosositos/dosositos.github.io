import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { CajaDeRegalo, type FaseCaja } from '@/componentes/CajaDeRegalo'
import { FECHAS } from '@/content/config'
import { REGALO, type SobreRegalo } from '@/content/regalo'
import { abrirSobreUnaVez, claveRecordada } from '@/lib/cripto'
import { celebracionDeHoy } from '@/lib/celebraciones'
import { desglosar, frasearDesglose } from '@/lib/tiempo'

/**
 * EL REGALO DEL 24 DE AGOSTO
 *
 * Lo primero que se ve al pasar la puerta: una caja quieta en medio de
 * la pantalla. Se toca, tiembla, la tapa vuela, la luz se come toda la
 * pantalla y detrás de la luz está la carta con el botón al video.
 *
 * El enlace del video NO vive en el código. Llega descifrado de
 * public/cifrado/regalo.enc con la misma frase de la puerta, porque
 * este repositorio es público y un enlace «no listado» a la vista de
 * todos deja de ser no listado. Se escribe en
 * private/publicable/regalo.json y el hook lo cifra solo.
 *
 * Se acuerda de que ya lo abrió (localStorage): al volver otro día la
 * caja aparece ya destapada y el estallido no se repite. Una sorpresa
 * que se repite en cada visita deja de ser una sorpresa y se vuelve un
 * peaje para llegar a la portada.
 */

const LLAVE = 'dosositos:regalo'

/** Lo que trae el archivo de ejemplo mientras nadie ha pegado el enlace. */
const SIN_PEGAR = 'PEGA-AQUI-EL-ENLACE'

type Fase = 'cerrada' | 'temblando' | 'estallando' | 'carta' | 'guardado'

function yaSeAbrio(): boolean {
  try {
    return localStorage.getItem(LLAVE) === 'si'
  } catch {
    return false
  }
}

function anotarQueSeAbrio() {
  try {
    localStorage.setItem(LLAVE, 'si')
  } catch {
    // Sin localStorage el regalo funciona igual, solo que vuelve a
    // estar cerrado en cada visita.
  }
}

export function Regalo() {
  const sinMovimiento = useReducedMotion() ?? false
  const [fase, setFase] = useState<Fase>(() => (yaSeAbrio() ? 'guardado' : 'cerrada'))
  const [enlace, setEnlace] = useState<SobreRegalo | null>(null)
  const [falloEnlace, setFalloEnlace] = useState(false)
  const relojes = useRef<number[]>([])

  /** Si la abrió ahora mismo, la caja se destapa animada; si no, ya está destapada. */
  const estreno = useRef(!yaSeAbrio())

  const celebracion = celebracionDeHoy()
  const conocernos = frasearDesglose(desglosar(new Date(FECHAS.nosConocimos.fecha)))
  const novios = frasearDesglose(desglosar(new Date(FECHAS.novios.fecha)))

  /* ── El enlace, descifrado antes de que le haga falta ─────────── */
  useEffect(() => {
    const clave = claveRecordada()
    if (!clave) {
      setFalloEnlace(true)
      return
    }

    let vigente = true
    abrirSobreUnaVez<SobreRegalo>('regalo', clave)
      .then((s) => {
        if (vigente) setEnlace(s)
      })
      .catch(() => {
        if (vigente) setFalloEnlace(true)
      })

    return () => {
      vigente = false
    }
  }, [])

  /* ── Los relojes de la apertura, que hay que apagar al salir ──── */
  useEffect(() => {
    const pendientes = relojes.current
    return () => pendientes.forEach(clearTimeout)
  }, [])

  /* ── Mientras la carta está abierta, la página de atrás no rueda ─ */
  useEffect(() => {
    if (fase !== 'carta' && fase !== 'estallando') return
    const antes = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = antes
    }
  }, [fase])

  /* ── Escape cierra la carta ───────────────────────────────────── */
  useEffect(() => {
    if (fase !== 'carta') return
    const alTecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFase('guardado')
    }
    window.addEventListener('keydown', alTecla)
    return () => window.removeEventListener('keydown', alTecla)
  }, [fase])

  if (!REGALO.activo) return null

  function abrir() {
    if (fase === 'temblando' || fase === 'estallando' || fase === 'carta') return

    // Ya lo había abierto: la carta sale de una, sin repetir el estallido.
    if (fase === 'guardado') {
      estreno.current = false
      setFase('carta')
      return
    }

    anotarQueSeAbrio()

    if (sinMovimiento) {
      estreno.current = false
      setFase('carta')
      return
    }

    estreno.current = true
    setFase('temblando')
    relojes.current.push(
      window.setTimeout(() => setFase('estallando'), 560),
      window.setTimeout(() => setFase('carta'), 1700),
    )
  }

  const faseCaja: FaseCaja =
    fase === 'cerrada'
      ? 'cerrada'
      : fase === 'temblando'
        ? 'temblando'
        : estreno.current && fase !== 'guardado'
          ? 'abierta'
          : 'yaAbierta'

  /** El enlace de verdad, o null si falló o si todavía nadie lo pegó. */
  const enlaceListo =
    enlace?.enlace && !enlace.enlace.includes(SIN_PEGAR) ? enlace.enlace : null

  return (
    <>
      {/* ═══ La caja, en la portada ═══════════════════════════════ */}
      <section className="flex w-full flex-col items-center">
        {celebracion && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="fuente-mano text-center text-xl text-acento sm:text-2xl"
          >
            {celebracion.titulo}
          </motion.p>
        )}

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mt-2 text-center text-[0.68rem] uppercase tracking-[0.3em] text-texto-suave/70"
        >
          {conocernos} &nbsp;·&nbsp; {novios} de ositos
        </motion.p>

        <motion.button
          type="button"
          onClick={abrir}
          aria-label={fase === 'guardado' ? 'Volver a abrir el regalo' : 'Abrir el regalo'}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: [0.34, 1.56, 0.64, 1], delay: 0.3 }}
          whileHover={sinMovimiento ? undefined : { scale: 1.035 }}
          whileTap={sinMovimiento ? undefined : { scale: 0.97 }}
          className="relative mt-2 h-[clamp(260px,76vw,360px)] w-[clamp(260px,76vw,360px)] cursor-pointer rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-acento"
        >
          <CajaDeRegalo
            fase={faseCaja}
            etiqueta={REGALO.etiqueta}
            sinMovimiento={sinMovimiento}
          />
        </motion.button>

        <motion.p
          animate={sinMovimiento ? {} : { opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 2.8, repeat: sinMovimiento ? 0 : Infinity, ease: 'easeInOut' }}
          className="fuente-mano -mt-2 text-xl text-texto-suave"
        >
          {fase === 'guardado' ? REGALO.invitacionAbierto : REGALO.invitacion}
        </motion.p>
      </section>

      {/* ═══ El fogonazo ══════════════════════════════════════════
          Vive aparte de la carta y se desmonta al terminar. Antes era
          UNA sola capa que se encendía (0→1) y después se bajaba
          (1→0,3): dos animaciones seguidas sobre el mismo elemento y
          la misma propiedad, que es justo donde Safari se traba. Si la
          segunda no arrancaba, la luz se quedaba encendida y se comía
          el texto crema — quedaba solo el botón, que por ser una
          pastilla sólida con letra oscura se lee sobre cualquier cosa.
          Ahora ninguna capa tiene que dar marcha atrás. */}
      <AnimatePresence>
        {fase === 'estallando' && (
          <motion.div
            key="destello"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.9, delay: 0, ease: 'easeIn' } }}
            transition={{ duration: 0.45, delay: 0.3, ease: 'easeOut' }}
            className="pointer-events-none fixed inset-0 z-[90]"
            style={{
              background:
                'radial-gradient(circle at 50% 42%, #fffaf0 0%, #ffeec4 16%, #f7cf7c 30%, #e9963a 46%, #8d2a2f 68%, #200814 100%)',
            }}
          />
        )}
      </AnimatePresence>

      {/* ═══ La carta ═════════════════════════════════════════════ */}
      <AnimatePresence>
        {fase === 'carta' && (
          <motion.div
            key="carta"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto bg-fondo px-6 py-16"
          >
            {/* El rescoldo del fogonazo. Es fijo, no se anima: lo que
                se lee encima no puede depender de que algo se apague. */}
            <div
              className="pointer-events-none fixed inset-0 opacity-30"
              style={{
                background:
                  'radial-gradient(circle at 50% 42%, #fffaf0 0%, #ffeec4 16%, #f7cf7c 30%, #e9963a 46%, #8d2a2f 68%, #200814 100%)',
              }}
            />

            {(() => {
              /* Los tiempos de entrada, en segundos. En CSS y no en
                 JavaScript: ver `anima-aparecer` en index.css. */
              const ultima = 0.3 + (REGALO.lineas.length - 1) * 0.2
              return (
              <div className="relative mx-auto w-full max-w-lg text-center">
                <p
                  className="anima-aparecer text-[0.68rem] uppercase tracking-[0.3em] text-acento/80"
                  style={{ animationDelay: '0.05s' }}
                >
                  {conocernos} · {novios} de ositos
                </p>

                <h2
                  className="anima-aparecer resplandor mt-4 font-display text-5xl text-acento sm:text-6xl"
                  style={{ animationDelay: '0.15s' }}
                >
                  {REGALO.titulo}
                </h2>

                <div className="mt-7 space-y-4">
                  {REGALO.lineas.map((linea, i) => (
                    <p
                      key={linea}
                      className="anima-aparecer fuente-mano text-xl leading-snug text-texto sm:text-2xl"
                      style={{ animationDelay: `${0.3 + i * 0.2}s` }}
                    >
                      {linea}
                    </p>
                  ))}
                </div>

                <p
                  className="anima-aparecer fuente-mano mt-5 text-lg text-texto-suave"
                  style={{ animationDelay: `${ultima + 0.2}s` }}
                >
                  {REGALO.firma}
                </p>

                <div className="anima-aparecer mt-10" style={{ animationDelay: `${ultima + 0.4}s` }}>
                  {enlaceListo ? (
                    <a
                      href={enlaceListo}
                      target="_blank"
                      rel="noreferrer"
                      className="anima-latido resplandor-caja inline-block rounded-full bg-acento px-10 py-4 font-display text-xl text-fondo transition-transform hover:scale-105"
                    >
                      {REGALO.boton}
                    </a>
                  ) : (
                    <p className="fuente-mano text-lg text-hibisco">
                      {falloEnlace
                        ? 'No pude abrir el enlace del video. ¿Hay internet?'
                        : enlace
                          ? 'Falta pegar el enlace en private/publicable/regalo.json'
                          : 'Abriendo el video...'}
                    </p>
                  )}

                  {enlaceListo && (
                    <p className="mt-4 text-xs uppercase tracking-[0.2em] text-texto-suave/60">
                      {enlace?.pie ?? REGALO.aviso}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setFase('guardado')}
                  className="anima-aparecer fuente-mano mt-10 text-base text-texto-suave/60 underline-offset-4 transition-colors hover:text-acento hover:underline"
                  style={{ animationDelay: `${ultima + 0.5}s` }}
                >
                  {REGALO.cerrar}
                </button>
              </div>
              )
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
