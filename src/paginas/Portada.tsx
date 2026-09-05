import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { Contador } from '@/componentes/Contador'
import { LunaDePortada } from '@/componentes/LunaDePortada'
// El oso blanco está guardado por ahora, ver más abajo.
// import { OrigenDelApodo } from '@/componentes/OrigenDelApodo'
import { QuienAmaMas } from '@/componentes/QuienAmaMas'
import { Regalo } from '@/componentes/Regalo'
import { UnDiaComoHoy } from '@/componentes/UnDiaComoHoy'
import { FECHAS, OSITA, OSITO } from '@/content/config'
import { REGALO } from '@/content/regalo'
import { celebracionDeHoy } from '@/lib/celebraciones'
import { diasQueFaltan, proximoAniversario, proximoMesiversario } from '@/lib/tiempo'

const SECCIONES = [
  { a: '/linea-del-tiempo', icono: '📖', titulo: 'nuestra historia', texto: 'la línea del tiempo, momento por momento' },
  { a: '/juego', icono: '🎯', titulo: '¿quién dijo esto?', texto: 'a ver si te acordás de lo que decimos' },
  { a: '/diccionario', icono: '📓', titulo: 'diccionario oso', texto: 'las palabras que solo existen aquí' },
  { a: '/frasco', icono: '🫙', titulo: 'frasco de mensajitos', texto: 'sacá una estrellita cuando la necesités' },
  { a: '/playlist', icono: '🎵', titulo: 'nuestras canciones', texto: 'y por qué cada una es nuestra' },
  { a: '/estadisticas', icono: '📊', titulo: 'nuestro chat en números', texto: 'cuánto hablamos y quién gana en qué' },
]

export function Portada() {
  const celebracion = celebracionDeHoy()
  // Solo cuentan las fechas de novios: el 24 de noviembre y el 24 de cada mes.
  const proximoNovios = proximoAniversario(11, 24)
  const proximoMes = proximoMesiversario(24)
  const faltanAniversario = diasQueFaltan(proximoNovios)
  const faltanMes = diasQueFaltan(proximoMes)

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-16 px-5 pb-24 pt-16 sm:gap-20 sm:pt-24">
      {/* ── El regalo ────────────────────────────────────────────
          Va antes que el título a propósito: es lo primero que tiene
          que ver al pasar la puerta. Mientras esté activo, él se
          encarga de anunciar la celebración del día; por eso el
          cartelito de abajo se calla, para no decirlo dos veces. */}
      <Regalo />

      {/* ── La luna ──────────────────────────────────────────────
          Un pedazo de cielo sobre el título, pegada a la esquina
          derecha y asomada por el borde. Es la única puerta al juego de
          la tortuga, y no se abre hasta que encuentre a los tres
          peluches escondidos.

          **`self-stretch` y no `w-full`.** Son dos maneras de ocupar el
          ancho y solo una sirve acá: la portada centra a sus hijos, y a
          un hijo con ancho propio lo centra dentro del hueco que deja
          el margen negativo, así que el `-mr-5` la corría diez píxeles
          en vez de veinte y la luna se quedaba a un dedo del filo.
          Estirada no hay nada que centrar y el margen se come entero el
          respiro lateral de la portada, que es lo que la pone contra el
          borde de la pantalla en cualquier teléfono.

          Y `-my-9` porque esto no es una sección: es una luna en el
          cielo. Con la separación entera de la portada quedaba un hueco
          vacío arriba y otro abajo, y eso no se lee como una luna que
          está ahí desde siempre, se lee como que le estamos señalando
          que apareció algo.

          **`overflow-x-clip` y no `overflow-hidden`.** Esta franja es
          la que corta la luna, que se sale por la derecha, y tiene que
          cortarla **solo a lo ancho**: `clip` deja que a lo alto siga
          saliéndose, que es lo que necesitan el resplandor de la luna
          y el papelito que le cuelga debajo. Con `hidden` los dos
          quedaban cortados a filo y aparecía una raya recta en el
          cielo. */}
      <div className="-my-9 -mr-5 flex justify-end self-stretch overflow-x-clip">
        <LunaDePortada />
      </div>

      {/* ── Encabezado ───────────────────────────────────────── */}
      <header className="text-center">

        {celebracion && !REGALO.activo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
            className="papel mb-8 inline-block rounded-full px-5 py-2"
          >
            <span className="fuente-mano text-base text-acento">{celebracion.titulo}</span>
          </motion.div>
        )}

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="text-[0.7rem] uppercase tracking-[0.34em] text-texto-suave/70"
        >
          {OSITO.apodo} &nbsp;·&nbsp; {OSITA.apodo}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          className="mt-4 font-display text-5xl leading-[1.05] sm:text-7xl"
        >
          <span className="texto-degradado">dos ositos</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="fuente-mano mx-auto mt-5 max-w-md text-xl text-texto-suave"
        >
          una madriguera para guardar todo lo que hemos vivido
        </motion.p>
      </header>

      {/* ── El oso blanco: de dónde viene el apodo ─────────────
          Guardado, no borrado. En la portada no terminaba de quedar;
          queda pendiente decidir cómo se cuenta y dónde va. El
          componente y su texto (src/content/origen.ts) siguen enteros:
          para volver a verlo, descomentá la línea de abajo. */}
      {/* <OrigenDelApodo /> */}

      {/* ── Los dos contadores ───────────────────────────────── */}
      <section className="flex w-full flex-col items-center gap-8 md:flex-row md:items-stretch md:justify-center">
        <Contador
          desde={FECHAS.nosConocimos.fecha}
          titulo={FECHAS.nosConocimos.titulo}
          subtitulo={FECHAS.nosConocimos.subtitulo}
          flor="var(--color-girasol)"
          retraso={0}
        />
        <Contador
          desde={FECHAS.novios.fecha}
          titulo={FECHAS.novios.titulo}
          subtitulo={FECHAS.novios.subtitulo}
          flor="var(--color-rosa-roja)"
          retraso={0.15}
        />
      </section>

      {/* ── Cuentas regresivas ───────────────────────────────── */}
      <section className="flex flex-wrap items-center justify-center gap-3 text-center">
        <span className="rounded-full border border-borde px-4 py-2 text-sm text-texto-suave">
          {faltanAniversario === 0
            ? '🌹 hoy es nuestro aniversario'
            : `🌹 faltan ${faltanAniversario} días para el aniversario`}
        </span>
        <span className="rounded-full border border-borde px-4 py-2 text-sm text-texto-suave">
          {faltanMes === 0 ? '🌸 hoy es 24, feliz mesiversario' : `🌸 faltan ${faltanMes} días para el 24`}
        </span>
      </section>

      {/* ── Quién ama más hoy ────────────────────────────────── */}
      <QuienAmaMas />

      {/* ── Un día como hoy ──────────────────────────────────── */}
      <UnDiaComoHoy />

      {/* ── Accesos a las secciones ──────────────────────────── */}
      <nav className="grid w-full gap-4 sm:grid-cols-2">
        {SECCIONES.map((s, i) => (
          <motion.div
            key={s.a}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px 0px' }}
            transition={{ duration: 0.6, delay: i * 0.08 }}
          >
            <Link
              to={s.a}
              className="papel group flex items-center gap-4 rounded-xl px-5 py-5 transition-all duration-500 hover:-translate-y-1 hover:border-acento"
            >
              <span className="text-3xl transition-transform duration-500 group-hover:scale-110">
                {s.icono}
              </span>
              <span>
                <span className="block font-display text-lg text-texto">{s.titulo}</span>
                <span className="block text-sm text-texto-suave">{s.texto}</span>
              </span>
            </Link>
          </motion.div>
        ))}
      </nav>
    </div>
  )
}
