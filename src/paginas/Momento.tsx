import { motion } from 'motion/react'
import { Link, useParams } from 'react-router-dom'
import { Chat } from '@/componentes/Chat'
import { momentos } from '@/content/momentos'
import { fechaLarga } from '@/lib/tiempo'

/**
 * La cápsula del tiempo: un momento a pantalla completa.
 * Tiene URL propia (#/momento/el-mensaje-de-instagram), así que se
 * puede compartir o guardar uno solo.
 */
export function Momento() {
  const { id } = useParams()
  const momento = momentos.find((m) => m.id === id)

  if (!momento) {
    return (
      <div className="grid min-h-[70dvh] place-items-center px-6 text-center">
        <div>
          <p className="fuente-mano text-2xl text-texto-suave">
            Este momento todavía no existe, osita.
          </p>
          <Link to="/" className="mt-6 inline-block text-sm text-acento underline">
            volver
          </Link>
        </div>
      </div>
    )
  }

  const fecha = new Date(`${momento.fecha}T12:00:00-06:00`)

  return (
    <article className="mx-auto w-full max-w-2xl px-5 pb-24 pt-20">
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="mb-12 text-center"
      >
        {momento.icono && <div className="mb-5 text-5xl">{momento.icono}</div>}

        <p className="text-[0.68rem] uppercase tracking-[0.26em] text-texto-suave/60">
          {momento.fechaTexto ?? fechaLarga(fecha)}
          {momento.lugar && ` · ${momento.lugar}`}
        </p>

        <h1 className="mt-4 font-display text-4xl leading-tight texto-degradado sm:text-5xl">
          {momento.titulo}
        </h1>

        <p className="fuente-mano mx-auto mt-5 max-w-lg text-xl text-texto-suave">
          {momento.resumen}
        </p>
      </motion.header>

      {momento.relato && (
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="mx-auto mb-12 max-w-xl text-center text-lg leading-relaxed text-texto/90"
        >
          {momento.relato}
        </motion.p>
      )}

      {momento.chat && (
        <div className="mb-12">
          <Chat mensajes={momento.chat} titulo="lo que nos dijimos" />
        </div>
      )}

      {momento.nota && (
        <motion.aside
          initial={{ opacity: 0, rotate: -3, y: 16 }}
          whileInView={{ opacity: 1, rotate: -1.5, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
          className="papel mx-auto max-w-sm rounded-lg px-6 py-5 text-center"
        >
          <p className="fuente-mano text-xl leading-snug text-texto">{momento.nota.texto}</p>
          <p className="mt-3 text-[0.62rem] uppercase tracking-[0.2em] text-texto-suave/50">
            — {momento.nota.autor}
          </p>
        </motion.aside>
      )}

      <div className="mt-16 text-center">
        <Link
          to="/linea-del-tiempo"
          className="rounded-full border border-borde px-5 py-2 text-sm text-texto-suave transition-colors hover:border-acento hover:text-acento"
        >
          ← toda nuestra historia
        </Link>
      </div>
    </article>
  )
}
