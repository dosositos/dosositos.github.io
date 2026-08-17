import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { FotoCifrada } from '@/componentes/FotoCifrada'
import type { Foto } from '@/types'

/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  LAS POLAROIDS                                               ║
 * ║                                                              ║
 * ║  Dos formas de pegar fotos en el álbum:                      ║
 * ║                                                              ║
 * ║  · «columna» — dentro de un momento. Una debajo de otra,     ║
 * ║    todas del mismo tamaño, porque una polaroid de verdad     ║
 * ║    mide siempre igual: la foto se encuadra dentro del marco  ║
 * ║    en vez de que el marco se estire para caberla.            ║
 * ║                                                              ║
 * ║  · «pila» — las fotos sin momento exacto. Se ve la de        ║
 * ║    encima y las otras asomando debajo; ocupa el lugar de     ║
 * ║    una sola. Se tocan para abrirlas y se pasan deslizando.   ║
 * ║                                                              ║
 * ║  Ninguna viaja en claro: todas salen de FotoCifrada.         ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

/** La ventana de una polaroid es casi cuadrada, con el pie más ancho. */
const VENTANA = '1 / 1'

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

/** El marco: papel crema, ventana cuadrada y el pie ancho de abajo. */
function Marco({
  foto,
  children,
  className = '',
}: {
  foto: Foto
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`cinta rounded-sm bg-[#f4efe6] p-2.5 pb-9 shadow-[0_14px_40px_-16px_rgb(0_0_0/0.85)] ${className}`}
    >
      {/* La ventana es siempre cuadrada y la foto se encuadra dentro:
          una polaroid mide lo que mide, no lo que mida la foto. */}
      {foto && (
        <FotoCifrada
          foto={foto}
          cual="mini"
          proporcion={VENTANA}
          className="block w-full rounded-[1px]"
        />
      )}
      {children}
    </div>
  )
}

function Polaroid({ foto, giro, alTocar }: { foto: Foto; giro: number; alTocar: () => void }) {
  const sinMovimiento = useReducedMotion()

  return (
    <motion.button
      type="button"
      onClick={alTocar}
      initial={sinMovimiento ? false : { opacity: 0, y: 24, rotate: giro * 2.5 }}
      whileInView={{ opacity: 1, y: 0, rotate: giro }}
      whileHover={sinMovimiento ? undefined : { rotate: 0, y: -6, scale: 1.02 }}
      viewport={{ once: true, margin: '-40px 0px' }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="group block w-full cursor-zoom-in"
      aria-label={`Ampliar: ${foto.alt}`}
    >
      <Marco foto={foto} className="relative">
        {/* La tira de cinta adhesiva */}
        <span
          aria-hidden
          className="pointer-events-none absolute -top-2.5 left-1/2 h-5 w-16 -translate-x-1/2 -rotate-2 rounded-[1px] bg-white/25 backdrop-blur-[1px]"
          style={{ boxShadow: '0 1px 3px rgb(0 0 0 / 0.25)' }}
        />

        {foto.pie && (
          <span className="fuente-mano mt-2 block px-1 text-center text-[0.95rem] leading-tight text-[#4a4038]">
            {foto.pie}
          </span>
        )}
      </Marco>
    </motion.button>
  )
}

/** La pila: la de encima y las otras asomando debajo. */
function Pila({ fotos, alTocar }: { fotos: Foto[]; alTocar: () => void }) {
  const sinMovimiento = useReducedMotion()
  const atras = Math.min(fotos.length - 1, 2) // más de dos asomando no se nota

  return (
    <motion.button
      type="button"
      onClick={alTocar}
      initial={sinMovimiento ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={sinMovimiento ? undefined : { y: -4 }}
      viewport={{ once: true, margin: '-40px 0px' }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="group relative block w-full cursor-zoom-in"
      aria-label={
        fotos.length > 1 ? `Ver las ${fotos.length} fotos` : `Ampliar: ${fotos[0].alt}`
      }
    >
      {/* Las de abajo: papel asomando, girado a lados distintos. No
          llevan foto — se ve solo el borde y no cuestan una descarga. */}
      {Array.from({ length: atras }, (_, i) => (
        <div
          key={i}
          aria-hidden
          className="absolute inset-0 rounded-sm bg-[#e8e1d5] shadow-[0_10px_30px_-18px_rgb(0_0_0/0.9)]"
          style={{
            transform: `rotate(${(i % 2 === 0 ? 1 : -1) * (3 + i * 2)}deg)`,
            opacity: 0.9 - i * 0.25,
          }}
        />
      ))}

      <Marco
        foto={fotos[0]}
        className="relative z-10 -rotate-1 transition-transform group-hover:rotate-0"
      >
        <span className="fuente-mano mt-2 block px-1 text-center text-[0.95rem] leading-tight text-[#4a4038]">
          {fotos.length > 1 ? `${fotos.length} fotos` : (fotos[0].pie ?? 'tocá para verla')}
        </span>
      </Marco>
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
        {/* Acá sí la foto entera, sin recortar: es el momento de verla. */}
        <FotoCifrada
          foto={foto}
          ajuste="contain"
          className="mx-auto max-h-[78dvh] w-auto max-w-full rounded-sm"
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

export function Galeria({
  fotos,
  formato = 'columna',
}: {
  fotos: Foto[]
  formato?: 'columna' | 'pila'
}) {
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
      {formato === 'pila' ? (
        <Pila fotos={fotos} alTocar={() => setAbierta(0)} />
      ) : (
        // Una sola columna, centrada y con ancho de polaroid: en el
        // teléfono dos por fila quedaban diminutas.
        <div className="mx-auto grid max-w-[19rem] grid-cols-1 gap-8">
          {fotos.map((foto, i) => (
            <Polaroid
              key={foto.src}
              foto={foto}
              giro={giroDe(foto, i)}
              alTocar={() => setAbierta(i)}
            />
          ))}
        </div>
      )}

      <AnimatePresence>
        {abierta !== null && (
          <Visor fotos={fotos} indice={abierta} cerrar={cerrar} mover={mover} />
        )}
      </AnimatePresence>
    </>
  )
}
