import { Link, Route, Routes, useLocation } from 'react-router-dom'
import { CieloEstrellado } from '@/componentes/CieloEstrellado'
import { Petalos } from '@/componentes/Petalos'
import { InterruptorTema, ProveedorTema } from '@/componentes/ProveedorTema'
import { Momento } from '@/paginas/Momento'
import { Playlist } from '@/paginas/Playlist'
import { Portada } from '@/paginas/Portada'

/** Marcador temporal mientras construimos cada sección. */
function EnConstruccion({ titulo, nota }: { titulo: string; nota: string }) {
  return (
    <div className="mx-auto grid min-h-[70dvh] w-full max-w-2xl place-items-center px-6 text-center">
      <div className="papel rounded-2xl px-8 py-12">
        <span className="anima-flotar block text-5xl">🧸</span>
        <h1 className="mt-6 font-display text-3xl texto-degradado">{titulo}</h1>
        <p className="fuente-mano mt-4 text-lg text-texto-suave">{nota}</p>
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

function Marco() {
  const { pathname } = useLocation()
  const enPortada = pathname === '/'

  return (
    <>
      <CieloEstrellado cantidad={90} />
      <Petalos cantidad={14} />

      <div className="fixed right-4 top-4 z-50 flex items-center gap-2 sm:right-6 sm:top-6">
        {!enPortada && (
          <Link
            to="/"
            aria-label="Volver al inicio"
            className="grid h-11 w-11 place-items-center rounded-full border border-borde bg-superficie/80 text-lg backdrop-blur transition-colors hover:border-acento"
          >
            🏠
          </Link>
        )}
        <InterruptorTema />
      </div>

      <main className="relative">
        <Routes>
          <Route path="/" element={<Portada />} />
          <Route
            path="/linea-del-tiempo"
            element={<EnConstruccion titulo="nuestra historia" nota="aquí va la línea del tiempo — día 3 del plan" />}
          />
          <Route path="/momento/:id" element={<Momento />} />
          <Route
            path="/juego"
            element={<EnConstruccion titulo="¿quién dijo esto?" nota="el juego de las frases — día 6" />}
          />
          <Route
            path="/diccionario"
            element={<EnConstruccion titulo="diccionario oso-español" nota="las palabras que solo existen aquí — día 7" />}
          />
          <Route path="/playlist" element={<Playlist />} />
          <Route
            path="/frasco"
            element={<EnConstruccion titulo="frasco de mensajitos" nota="las estrellitas de papel — día 7" />}
          />
          <Route
            path="*"
            element={<EnConstruccion titulo="te perdiste, osita" nota="esta página no existe todavía" />}
          />
        </Routes>
      </main>

      <footer className="pb-10 text-center text-xs text-texto-suave/50">
        hecho con las manos por {' '}osito{' '} para {' '}osita
      </footer>
    </>
  )
}

export default function App() {
  return (
    <ProveedorTema>
      <Marco />
    </ProveedorTema>
  )
}
