import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { FotoCifrada } from '@/componentes/FotoCifrada'
import type { Foto } from '@/types'

/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  LAS POLAROIDS                                               ║
 * ║                                                              ║
 * ║  Fotos pegadas al álbum: papel blanco, un poco torcidas, con ║
 * ║  su tira de cinta adhesiva encima. Al tocarlas se abren a    ║
 * ║  pantalla completa y ahí se pasan deslizando.                ║
 * ║                                                              ║
 * ║  Ninguna viaja en claro: todas salen de FotoCifrada.         ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

/**
 * El giro de cada polaroid. Sale de la posición y del nombre del
 * archivo, no de Math.random: tiene que ser el mismo en cada visita,
 * o las fotos bailarían solas al volver a entrar al momento.
 */
function giroDe(foto: Foto, i: number) {
  if (foto.giro !== undefined) return foto.giro
  const semilla = [...foto.src].reduce((suma, c) => suma + c.charCodeAt(0), i * 7)
  return ((semilla % 9) - 4) * 0.7 // entre -2.8° y +2.8°
}

function Polaroid({
  foto,
  giro,
  alTocar,
}: {
  foto: Foto
  giro: number
  alTocar: () => void
}) {
  const sinMovimiento = useReducedMotion()

  return (
    <motion.button
      type="button"
      onClick={alTocar}
      initial={sinMovimiento ? false : { opacity: 0, y: 24, rotate: giro * 2.5 }}
      whileInView={{ opacity: 1, y: 0, rotate: giro }}
      whileHover={sinMovimiento ? undefined : { rotate: 0, y: -6, scale: 1.02 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="cinta group block w-full cursor-zoom-in rounded-sm bg-[#f4efe6] p-2.5 pb-9 shadow-[0_14px_40px_-16px_rgb(0_0_0/0.85)]"
      aria-label={`Ampliar: ${foto.alt}`}
    >
      {/* La tira de cinta adhesiva */}
      <span
        aria-hidden
        className="pointer-events-none absolute -top-2.5 left-1/2 h-5 w-16 -translate-x-1/2 -rotate-2 rounded-[1px] bg-white/25 backdrop-blur-[1px]"
        style={{ boxShadow: '0 1px 3px rgb(0 0 0 / 0.25)' }}
      />

      <FotoCifrada foto={foto} cual="mini" className="block w-full rounded-[1px]" />

      {foto.pie && (
        <span className="fuente-mano mt-2 block px-1 text-center text-[0.95rem] leading-tight text-[#4a4038]">
          {foto.pie}
        </span>
      )}
    </motion.button>
  )
}

/** El visor: la foto sola, a pantalla completa, sobre fondo oscuro. */
function Visor({
  fotos,
  indice,
  cerrar,
  mover,
}: {
  fotos: Foto[]
  indice: number
  cerrar: () => void
  mover: (paso: number) => void
}) {
  const foto = fotos[indice]

  useEffect(() => {
    const teclas = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cerrar()
      if (e.key === 'ArrowRight') mover(1)
      if (e.key === 'ArrowLeft') mover(-1)
    }
    window.addEventListener('keydown', teclas)

    // Que el fondo no siga desplazándose detrás del visor.
    const previo = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', teclas)
      document.body.style.overflow = previo
    }
  }, [cerrar, mover])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 grid place-items-center bg-black/92 p-4 backdrop-blur-sm"
      onClick={cerrar}
    >
      <motion.div
        key={foto.src}
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        onDragEnd={(_, info) => {
          if (info.offset.x < -60) mover(1)
          else if (info.offset.x > 60) mover(-1)
        }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-full w-full max-w-2xl"
      >
        <FotoCifrada
          foto={foto}
          className="mx-auto max-h-[78dvh] w-auto max-w-full rounded-sm object-contain"
        />

        <p className="fuente-mano mt-4 text-center text-lg text-white/80">
          {foto.pie ?? foto.alt}
        </p>

        {fotos.length > 1 && (
          <p className="mt-1 text-center text-[0.7rem] uppercase tracking-[0.2em] text-white/40">
            {indice + 1} de {fotos.length} · deslizá para pasar
          </p>
        )}
      </motion.div>

      <button
        type="button"
        onClick={cerrar}
        className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full border border-white/20 text-white/70 transition-colors hover:border-white/50 hover:text-white"
        aria-label="Cerrar"
      >
        ✕
      </button>
    </motion.div>
  )
}

export function Galeria({ fotos }: { fotos: Foto[] }) {
  const [abierta, setAbierta] = useState<number | null>(null)

  const mover = useCallback(
    (paso: number) => {
      setAbierta((i) => (i === null ? i : (i + paso + fotos.length) % fotos.length))
    },
    [fotos.length],
  )

  const cerrar = useCallback(() => setAbierta(null), [])

  if (fotos.length === 0) return null

  return (
    <>
      <div
        className={`mx-auto grid gap-5 ${
          fotos.length === 1 ? 'max-w-xs grid-cols-1' : 'grid-cols-2 sm:gap-7'
        }`}
      >
        {fotos.map((foto, i) => (
          <Polaroid key={foto.src} foto={foto} giro={giroDe(foto, i)} alTocar={() => setAbierta(i)} />
        ))}
      </div>

      <AnimatePresence>
        {abierta !== null && (
          <Visor fotos={fotos} indice={abierta} cerrar={cerrar} mover={mover} />
        )}
      </AnimatePresence>
    </>
  )
}
