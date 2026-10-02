import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react'
import { Link, NavigationType, Route, Routes, useLocation, useNavigationType } from 'react-router-dom'
import { AsomoDeLaTortuga } from '@/componentes/AsomoDeLaTortuga'
import { Candado } from '@/componentes/Candado'
import { CieloEstrellado } from '@/componentes/CieloEstrellado'
import { PeluchesEscondidos } from '@/componentes/PeluchesEscondidos'
import { Petalos } from '@/componentes/Petalos'
import { InterruptorTema, ProveedorTema } from '@/componentes/ProveedorTema'
import { ScrollAlInicio } from '@/componentes/ScrollAlInicio'
import { Diccionario } from '@/paginas/Diccionario'
import { Estadisticas } from '@/paginas/Estadisticas'
import { Frasco } from '@/paginas/Frasco'
import { Juego } from '@/paginas/Juego'
import { LineaDelTiempo } from '@/paginas/LineaDelTiempo'
import { Momento } from '@/paginas/Momento'
import { Playlist } from '@/paginas/Playlist'
import { Portada } from '@/paginas/Portada'

/* El juego de la luna es, de lejos, lo más pesado que hay acá: el motor, el
   pintor y los tres mundos. Y es lo último que ella va a abrir, porque la luna
   no se toca hasta que tenga a los tres peluches — o sea, días. Pidiéndolo
   aparte, la portada le baja liviana y el juego se baja recién cuando entra. */
const Luna = lazy(async () => ({ default: (await import('@/paginas/Luna')).Luna }))

/** Lo que se ve mientras el juego baja.
 *
 * Mismo fondo exacto que la pantalla del juego, para que al terminar de bajar
 * no parpadee nada: la luna de verdad aparece donde estaba esta. Sin texto
 * aposta — es un segundo, y un cartel que alcanza a leerse a medias molesta
 * más de lo que explica. Pero algo tiene que latir: una pantalla negra y
 * quieta ya nos pareció una vez un juego roto.
 */
function LunaCargando() {
  return (
    <div className="fixed inset-0 z-30 grid place-items-center overflow-hidden bg-[#0b1026]">
      <div className="anima-latido h-16 w-16 rounded-full bg-margarita shadow-[0_0_46px_rgba(248,244,232,0.4)]" />
    </div>
  )
}

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

/** Cuánto hay que bajar antes de que la casita y el tema se aparten. */
const UMBRAL_BOTONES = 80

/**
 * ¿Se esconden los botones de arriba?
 *
 * Al bajar se apartan (tapaban justo la línea que ella estaba leyendo) y
 * al subir vuelven, que es lo que hace cualquier app en el teléfono. Cerca
 * del inicio siempre se ven. Un cuadro como mucho por evento de scroll.
 */
function useBotonesEscondidos(activo: boolean, pathname: string) {
  const [escondidos, setEscondidos] = useState(false)

  useEffect(() => {
    // Página nueva, botones a la vista.
    setEscondidos(false)
    if (!activo) return

    let ultimo = window.scrollY
    let cuadro = 0
    const mirar = () => {
      if (cuadro) return
      cuadro = requestAnimationFrame(() => {
        cuadro = 0
        const y = window.scrollY
        // Unos píxeles de holgura: el dedo tiembla, y sin esto parpadean.
        if (y < UMBRAL_BOTONES) setEscondidos(false)
        else if (y > ultimo + 6) setEscondidos(true)
        else if (y < ultimo - 6) setEscondidos(false)
        else return
        ultimo = y
      })
    }
    window.addEventListener('scroll', mirar, { passive: true })
    return () => {
      cancelAnimationFrame(cuadro)
      window.removeEventListener('scroll', mirar)
    }
  }, [activo, pathname])

  return activo && escondidos
}

/** La hoja que se acomoda al pasar de página: un fundido con un poco de
 *  subida al entrar, y un fundido más corto al irse. Al salir solo se
 *  apaga, sin moverse: un `transform` que se queda puesto rompe los
 *  `fixed` de adentro (la galería, el regalo). */
function Hoja({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } }}
      exit={{ opacity: 0, transition: { duration: 0.15, ease: 'easeIn' } }}
    >
      {children}
    </motion.div>
  )
}

function Marco() {
  const location = useLocation()
  const { pathname } = location
  const vuelve = useNavigationType() === NavigationType.Pop
  const enPortada = pathname === '/'

  /* El juego de la luna se toma la pantalla entera: nada de pétalos,
     peluches escondidos ni pie de página encima del canvas. El botón
     de la casa sí se queda, que es por donde se sale. */
  const enLuna = pathname === '/luna'

  const escondidos = useBotonesEscondidos(!enLuna, pathname)

  const rutas = (
    <Routes location={location}>
      <Route path="/" element={<Portada />} />
      <Route path="/linea-del-tiempo" element={<LineaDelTiempo />} />
      <Route path="/momento/:id" element={<Momento />} />
      <Route path="/juego" element={<Juego />} />
      <Route path="/diccionario" element={<Diccionario />} />
      <Route path="/playlist" element={<Playlist />} />
      <Route path="/estadisticas" element={<Estadisticas />} />
      <Route path="/frasco" element={<Frasco />} />
      {/* Fuera del menú y sin enlace desde ningún lado hasta que
          la luna de la portada se vuelva tocable. */}
      <Route
        path="/luna"
        element={
          <Suspense fallback={<LunaCargando />}>
            <Luna />
          </Suspense>
        }
      />
      <Route
        path="*"
        element={<EnConstruccion titulo="te perdiste, osita" nota="esta página no existe todavía" />}
      />
    </Routes>
  )

  return (
    <>
      {!enLuna && <Petalos cantidad={14} />}

      {/* En la luna los botones se quedan exactamente donde estaban: el
          juego se arma alrededor de ellos y ahí no se esconden nunca. En
          el resto, respetan el notch (`safe-area`) y se apartan al bajar. */}
      <div
        className={
          enLuna
            ? 'fixed right-4 top-4 z-50 flex items-center gap-2 sm:right-6 sm:top-6'
            : `fixed right-[max(1rem,env(safe-area-inset-right))] top-[max(1rem,env(safe-area-inset-top))] z-50 flex items-center gap-2 transition-transform duration-300 ease-suave focus-within:translate-y-0 motion-reduce:transition-none sm:right-[max(1.5rem,env(safe-area-inset-right))] sm:top-[max(1.5rem,env(safe-area-inset-top))] ${
                escondidos ? 'pointer-events-none -translate-y-[calc(100%+max(1.5rem,env(safe-area-inset-top)))]' : ''
              }`
        }
      >
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

      {/* Los peluches se anclan a la PÁGINA y no a la pantalla: así el que
          se esconde abajo obliga a recorrer todo el scroll. El envoltorio
          tiene que abarcar también el pie — anclados solo al <main>, el
          alto del pie los dejaba flotando a media altura en vez de en la
          esquina de abajo.

          `overflow-x-clip` corta lo que se asoma de lado: el peluche de la
          esquina de abajo a la derecha se salía 12 px y en Android la
          página entera bailaba. `clip` y no `hidden`, que no se vuelve
          contenedor de scroll y un `sticky` de adentro seguiría pegándose
          a la pantalla. En la luna no hace falta, y ahí no se toca nada. */}
      <div className={enLuna ? 'relative' : 'relative overflow-x-clip'}>
        {!enLuna && <PeluchesEscondidos />}

        <main className="relative">
          {enLuna ? (
            /* La luna no se anima al entrar ni al salir: tiene su propia
               entrada, con la luna latiendo, y un fundido encima peleaba
               con la de la portada. Y su movimiento sigue como estaba
               (`never` es lo que había antes de este MotionConfig): el
               juego ya decide solo qué hacer con menos movimiento. */
            <MotionConfig reducedMotion="never">
              <ScrollAlInicio key={pathname} clave={location.key} vuelve={vuelve} />
              {rutas}
            </MotionConfig>
          ) : (
            <AnimatePresence mode="wait">
              <Hoja key={pathname}>
                <ScrollAlInicio clave={location.key} vuelve={vuelve} />
                {rutas}
              </Hoja>
            </AnimatePresence>
          )}
        </main>

        <footer className="px-[max(1rem,env(safe-area-inset-left))] pb-[max(2.5rem,calc(env(safe-area-inset-bottom)+1rem))] text-center text-xs text-texto-suave/50">
          hecho con las manos por {' '}osito{' '} para {' '}osita
        </footer>

        {/* Debajo de la firma, lo último de la página: la tortuga del
            juego de la luna pasa caminando, se asusta de que la miren y
            se esconde. Una página por día, y en el juego nunca: ahí
            vive, y adelantar algo que ya se está viendo no es adelantar
            nada. */}
        {!enLuna && <AsomoDeLaTortuga />}
      </div>
    </>
  )
}

export default function App() {
  return (
    // `reducedMotion="user"`: si el teléfono pide menos movimiento, los
    // `motion.*` dejan de desplazarse y solo se funden. El CSS ya lo hacía.
    <MotionConfig reducedMotion="user">
      <ProveedorTema>
        {/* El cielo va fuera del candado: la puerta también merece estrellas */}
        <CieloEstrellado cantidad={70} />
        <Candado>
          <Marco />
        </Candado>
      </ProveedorTema>
    </MotionConfig>
  )
}
