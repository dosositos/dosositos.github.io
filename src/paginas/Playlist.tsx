import { motion } from 'motion/react'
import { PLAYLIST_SPOTIFY, playlist } from '@/content/playlist'

/**
 * Nuestras canciones.
 *
 * El reproductor de Spotify va incrustado (no podemos subir los MP3: son
 * canciones con derechos). Lo que de verdad importa está debajo: por qué
 * cada una es nuestra. Eso no lo tiene ningún reproductor.
 */
export function Playlist() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-24 pt-20">
      <header className="mb-10 text-center">
        <p className="text-[0.68rem] uppercase tracking-[0.3em] text-texto-suave/60">
          nuestras canciones
        </p>
        <h1 className="mt-4 font-display text-4xl texto-degradado sm:text-5xl">
          la banda sonora
        </h1>
        <p className="fuente-mano mt-4 text-xl text-texto-suave">
          dale play y bajá leyendo
        </p>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="papel overflow-hidden rounded-2xl p-3"
      >
        <iframe
          title="Nuestra playlist en Spotify"
          src={`https://open.spotify.com/embed/playlist/${PLAYLIST_SPOTIFY}?utm_source=generator&theme=0`}
          width="100%"
          height={352}
          style={{ borderRadius: 12, border: 0 }}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      </motion.div>

      <ul className="mt-12 space-y-4">
        {playlist.map((c, i) => (
          <motion.li
            key={`${c.titulo}-${c.artista}`}
            initial={{ opacity: 0, x: -14 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px 0px' }}
            transition={{ duration: 0.6, delay: i * 0.05 }}
            className="papel rounded-xl px-5 py-5"
          >
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-display text-xl text-texto">{c.titulo}</h2>
              <span className="shrink-0 text-xs uppercase tracking-[0.14em] text-texto-suave/70">
                {c.artista}
              </span>
            </div>
            <p className="fuente-mano mt-3 text-lg leading-snug text-texto-suave">{c.porQue}</p>
            {c.dedicadaPor && (
              <p className="mt-3 text-[0.68rem] uppercase tracking-[0.18em] text-acento/70">
                la dedicó {c.dedicadaPor}
              </p>
            )}
          </motion.li>
        ))}
      </ul>
    </div>
  )
}
