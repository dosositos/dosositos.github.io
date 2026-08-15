import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { origen } from '@/content/origen'

/**
 * La historia del oso blanco.
 *
 * Es una de las pocas pantallas donde el scroll manda: las líneas van
 * apareciendo a medida que se baja, y el oso del fondo se va acercando.
 * Por eso el cuerpo es tan simple — todo el peso está en el ritmo.
 */
export function OrigenDelApodo() {
  const seccion = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: seccion,
    offset: ['start end', 'end start'],
  })

  // El oso del fondo crece y se aclara mientras se lee la historia
  const escalaOso = useTransform(scrollYProgress, [0, 0.5, 1], [0.85, 1.05, 1.15])
  const opacidadOso = useTransform(scrollYProgress, [0, 0.35, 0.7, 1], [0, 0.14, 0.14, 0])

  return (
    <section
      ref={seccion}
      className="relative flex min-h-[85dvh] w-full flex-col items-center justify-center px-4 py-20"
      aria-label="El origen del apodo"
    >
      {/* El oso blanco, siempre detrás, nunca del todo visible */}
      <motion.div
        aria-hidden
        style={{ scale: escalaOso, opacity: opacidadOso }}
        className="pointer-events-none absolute inset-0 grid place-items-center"
      >
        <span className="select-none text-[18rem] leading-none grayscale sm:text-[24rem]">🐻‍❄️</span>
      </motion.div>

      <div className="relative z-10 mx-auto max-w-2xl text-center">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="mb-12 text-[0.68rem] uppercase tracking-[0.3em] text-texto-suave/60"
        >
          {origen.antetitulo}
        </motion.p>

        <div className="space-y-7">
          {origen.lineas.map((linea, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 22, filter: 'blur(6px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true, margin: '-120px' }}
              transition={{ duration: 1, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-2xl leading-relaxed text-texto sm:text-[2rem]"
            >
              {linea}
            </motion.p>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-120px' }}
          transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="resplandor mt-14 font-display text-3xl text-acento sm:text-4xl"
        >
          {origen.cierre}
        </motion.p>

        {origen.posdata && (
          <motion.p
            initial={{ opacity: 0, rotate: -3 }}
            whileInView={{ opacity: 1, rotate: -1.5 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.9 }}
            className="fuente-mano mt-10 text-xl text-texto-suave"
          >
            {origen.posdata}
          </motion.p>
        )}
      </div>
    </section>
  )
}
