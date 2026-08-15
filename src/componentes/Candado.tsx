import { motion, AnimatePresence } from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { CANDADO } from '@/content/config'
import { ClaveIncorrecta, abrirSobre, claveRecordada, recordarClave } from '@/lib/cripto'

interface Saludo {
  bienvenida: string
  linea: string
  firma: string
}

/**
 * La puerta.
 *
 * No es un `if (clave === '...')` con la respuesta escondida en el código:
 * la clave se comprueba intentando descifrar de verdad un archivo cifrado.
 * Si abre, era la correcta. Eso significa que la respuesta no está en
 * ninguna parte del sitio, ni siquiera cifrada — solo en la cabeza de ustedes.
 */
export function Candado({ children }: { children: ReactNode }) {
  const [abierto, setAbierto] = useState(false)
  const [saludo, setSaludo] = useState<Saludo | null>(null)
  const [clave, setClave] = useState('')
  const [error, setError] = useState('')
  const [probando, setProbando] = useState(false)
  const campo = useRef<HTMLInputElement>(null)

  async function intentar(candidata: string, silencioso = false) {
    if (!candidata.trim()) return
    setProbando(true)
    setError('')

    try {
      const s = await abrirSobre<Saludo>('saludo', candidata.trim().toLowerCase())
      recordarClave(candidata.trim().toLowerCase())
      setSaludo(s)
      // Un respiro para leer el saludo antes de que se abra la web
      setTimeout(() => setAbierto(true), 2600)
    } catch (e) {
      if (!silencioso) {
        setError(e instanceof ClaveIncorrecta ? CANDADO.mensajeError : 'No pude abrir la puerta. ¿Hay internet?')
        setClave('')
        campo.current?.focus()
      }
    } finally {
      setProbando(false)
    }
  }

  // Si ya entró en esta visita, no volver a preguntar
  useEffect(() => {
    const recordada = claveRecordada()
    if (recordada) intentar(recordada, true)
    else campo.current?.focus()
  }, [])

  if (abierto) return <>{children}</>

  return (
    <div className="grid min-h-[100dvh] place-items-center px-6">
      <AnimatePresence mode="wait">
        {saludo ? (
          <motion.div
            key="saludo"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="text-center"
          >
            <motion.span
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="block text-6xl"
            >
              🧸
            </motion.span>
            <p className="resplandor mt-8 font-display text-4xl text-acento sm:text-5xl">
              {saludo.bienvenida}
            </p>
            <p className="fuente-mano mt-4 text-2xl text-texto-suave">{saludo.linea}</p>
            <p className="mt-8 text-xs uppercase tracking-[0.2em] text-texto-suave/50">
              {saludo.firma}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="puerta"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md text-center"
          >
            <span className="anima-flotar block text-5xl">🔒</span>

            <h1 className="mt-8 font-display text-3xl texto-degradado">
              esto es solo para vos
            </h1>

            <p className="mt-6 text-base leading-relaxed text-texto-suave">{CANDADO.pista}</p>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                intentar(clave)
              }}
              className="mt-8"
            >
              <input
                ref={campo}
                type="text"
                value={clave}
                onChange={(e) => setClave(e.target.value)}
                placeholder={CANDADO.ejemplo}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                aria-label="La frase que abre la puerta"
                className="w-full rounded-full border border-borde bg-superficie/70 px-6 py-4 text-center text-lg text-texto placeholder:text-texto-suave/35 focus:border-acento focus:outline-none"
              />

              <button
                type="submit"
                disabled={probando || !clave.trim()}
                className="mt-4 w-full rounded-full bg-acento px-6 py-4 font-display text-lg text-fondo transition-opacity disabled:opacity-40"
              >
                {probando ? 'abriendo...' : 'entrar'}
              </button>
            </form>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: [0, -8, 8, -4, 4, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="fuente-mano mt-6 text-lg text-hibisco"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
