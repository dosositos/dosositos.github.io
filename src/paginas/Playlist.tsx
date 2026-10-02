import { motion } from 'motion/react'
import { useState } from 'react'
import { PLAYLIST_SPOTIFY, playlist } from '@/content/playlist'

/**
 * Nuestras canciones.
 *
 * El reproductor de Spotify va incrustado (no podemos subir los MP3: son
 * canciones con derechos). Lo que de verdad importa está debajo: por qué
 * cada una es nuestra. Eso no lo tiene ningún reproductor.
 */
/** El retraso escalonado de la lista llega hasta acá y no más: sin tope,
 *  la canción veinte esperaba un segundo entero para aparecer. */
const RETRASO_MAXIMO = 0.2

export function Playlist() {
  // Mientras Spotify arma su reproductor se ve un esqueleto del mismo alto,
  // no un hueco. Va detrás del iframe: si el aviso de «ya cargó» no llega
  // nunca, el reproductor lo tapa igual al pintarse.
  const [cargado, setCargado] = useState(false)

  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-24 pt-20 lg:max-w-6xl">
      <header className="mb-10 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-texto-suave/60">
          nuestras canciones
        </p>
        <h1 className="mt-4 font-display text-4xl texto-degradado sm:text-5xl">
          la banda sonora
        </h1>
        <p className="fuente-mano mt-4 text-xl text-texto-suave">
          dale play y bajá leyendo
        </p>
      </header>

      {/* En la computadora, el reproductor se queda pegado a la izquierda
          y la lista corre a la derecha: se puede ir cambiando de canción
          sin subir hasta arriba cada vez. En el teléfono, uno debajo del otro. */}
      <div className="lg:grid lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:items-start lg:gap-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="papel relative overflow-hidden rounded-2xl p-3 lg:sticky lg:top-24"
      >
        {!cargado && (
          <div
            aria-hidden
            className="anima-brillo-papel absolute inset-3 rounded-xl bg-superficie-2"
          />
        )}
        <iframe
          className="relative block"
          onLoad={() => setCargado(true)}
          title="Nuestra playlist en Spotify"
          src={`https://open.spotify.com/embed/playlist/${PLAYLIST_SPOTIFY}?utm_source=generator&theme=0`}
          width="100%"
          height={352}
          style={{ borderRadius: 12, border: 0 }}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      </motion.div>

      <ul className="mt-12 space-y-4 lg:mt-0">
        {playlist.map((c, i) => (
          <motion.li
            key={`${c.titulo}-${c.artista}`}
            initial={{ opacity: 0, x: -14 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px 0px' }}
            transition={{ duration: 0.6, delay: Math.min(i * 0.05, RETRASO_MAXIMO) }}
            className="papel rounded-xl px-5 py-5"
          >
            {/* Si el artista no cabe al lado del título, baja a la línea
                de abajo en vez de apretar el título contra el borde. */}
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h2 className="min-w-0 font-display text-xl text-texto">{c.titulo}</h2>
              <span className="text-xs uppercase tracking-[0.14em] text-texto-suave/70">
                {c.artista}
              </span>
            </div>
            <p className="fuente-mano mt-3 text-lg leading-snug text-texto-suave">{c.porQue}</p>
            {c.dedicadaPor && (
              <p className="mt-3 text-xs uppercase tracking-[0.18em] text-acento/70">
                la dedicó {c.dedicadaPor}
              </p>
            )}
          </motion.li>
        ))}
      </ul>
      </div>
    </div>
  )
}
