/**
 * El banco de la carta de la luna. No es parte de la web.
 *
 * Monta `HojaDeLaCarta` en tres teléfonos de distinto alto, con
 * relleno de los mismos largos que la carta de verdad y encima de una
 * foto fija de la llegada, para juzgar el maquetado sin necesitar la
 * clave ni ganar los tres capítulos.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { HojaDeLaCarta } from '@/componentes/CartaDeLaLuna'
import { MarcadorDeLaLuna } from '@/componentes/MarcadorDeLaLuna'
import { CAPITULOS, LLEGADA } from '@/content/luna'
import { crearPintor } from '@/juego-luna/dibujo'
import { laLlegada } from '@/juego-luna/llegada'
import { construirNivel } from '@/juego-luna/mundos'
import '@/index.css'

/** Palabras de relleno, para llenar un largo dado sin decir nada. */
const RELLENO =
  'lorem la noche aquella el jueves de siempre un pedacito de papel doblado ' +
  'la mesa de la esquina y las flores que no eran de plástico un ratito más '

function deLargo(n: number) {
  let t = ''
  while (t.length < n) t += RELLENO
  return `${t.slice(0, n - 1).trim()}.`
}

/**
 * Relleno con los largos de la carta de verdad, medidos del JSON.
 *
 * Ni una palabra suya se copia acá, ni el título ni la firma: este
 * archivo se publica en claro y ella está cifrada por lo mismo que los
 * chats. Lo único que se toma prestado son los largos y los huecos
 * `{pasitos}` y `{caidas}`, que son estructura y no texto.
 */
const CARTA = {
  titulo: deLargo(20),
  apertura: `${deLargo(24)} {lasCaidas} ${deLargo(30)} {lasCaidas} ${deLargo(40)} {pasitos} ${deLargo(80)}`,
  aperturaSinCaidas: `${deLargo(40)} {pasitos} ${deLargo(110)}`,
  parrafos: [248, 238, 364, 321, 459, 375, 381].map(deLargo),
  cierre: deLargo(46),
  posdata: deLargo(51),
  firma: deLargo(10),
}

/** El cierre del último capítulo, que sí va en claro y vive en `luna.ts`. */
const ANTESALA = CAPITULOS[CAPITULOS.length - 1].cierre.texto

/** Los teléfonos donde esto se va a leer de verdad. */
const TELEFONOS = [
  { nombre: 'iPhone SE · 375 × 667', ancho: 375, alto: 667 },
  { nombre: 'Android de ella · 412 × 915', ancho: 412, alto: 915 },
  { nombre: 'iPhone 15 · 393 × 852', ancho: 393, alto: 852 },
]

/** El último cuadro de la llegada, dibujado detrás de la carta. */
function fondoDeLaLlegada(canvas: HTMLCanvasElement, ancho: number, alto: number) {
  const capitulo = CAPITULOS[CAPITULOS.length - 1]
  const nivel = construirNivel(capitulo)
  const l = laLlegada(1, nivel)
  const pintor = crearPintor(canvas, nivel)
  pintor.medir(ancho, alto)
  pintor.pintar({
    x: l.luna.x,
    y: l.tortugaY,
    mirando: 1,
    carga: 0,
    cargando: false,
    enSuelo: false,
    caminado: 0.3,
    vy: -260,
    reloj: LLEGADA.ms / 1000,
    desdeSalto: 9999,
    desdeAterrizaje: 9999,
    cayendo: false,
    agobio: 0,
    cansancio: 0,
    camara: l.tortugaY - pintor.altoDeLaVista() * l.altoDeCamara,
    hitoAlcanzado: nivel.cima.indice,
    vidaDeLaPista: nivel.plataformas.map(() => 1),
    avisoDeLaPista: 0.4,
    inclinacion: nivel.plataformas.map(() => 0),
    hundido: nivel.plataformas.map(() => 0),
    rebote: null,
    loQueCae: [],
    efecto: null,
    cine: 'llegada',
    cineAvance: 1,
    pasitos: 214,
    caidas: 9,
    plataformas: nivel.plataformas,
  })
}

function Telefono({
  nombre,
  ancho,
  alto,
  caidas,
  alFinal = false,
}: {
  nombre: string
  ancho: number
  alto: number
  caidas: number
  /** Bajada del todo, para poder juzgar el cierre y la firma. */
  alFinal?: boolean
}) {
  return (
    <figure style={{ margin: 0 }}>
      <div
        style={{
          position: 'relative',
          width: ancho,
          height: alto,
          overflow: 'hidden',
          borderRadius: 12,
          background: '#05070f',
        }}
      >
        <canvas
          ref={(c) => {
            if (c) fondoDeLaLlegada(c, ancho, alto)
          }}
          style={{ position: 'absolute', inset: 0 }}
        />
        <div
          ref={(d) => {
            if (!d || !alFinal) return
            // La hoja sube con un respiro: hay que esperarla puesta.
            setTimeout(() => {
              const rueda = d.firstElementChild
              if (rueda) rueda.scrollTop = rueda.scrollHeight
            }, 2600)
          }}
          style={{ position: 'absolute', inset: 0 }}
        >
          <HojaDeLaCarta
            carta={CARTA}
            pasitos={214}
            caidas={caidas}
            antesala={ANTESALA}
            marcador={
              <MarcadorDeLaLuna
                record={CAPITULOS[CAPITULOS.length - 1].record}
                pasitos={caidas === 0 ? 29 : 34}
                mejor={{ pasitos: caidas === 0 ? 29 : 32, caidas }}
              />
            }
          />
        </div>
      </div>
      <figcaption style={{ fontSize: 12, opacity: 0.6, padding: '6px 2px', color: '#f8f4e8' }}>
        {nombre} · {caidas === 0 ? 'sin caerse ni una vez' : `${caidas} caídas`}
      </figcaption>
    </figure>
  )
}

createRoot(document.getElementById('banco') as HTMLElement).render(
  <StrictMode>
    {/* La hoja lleva un <Link> a la portada, y sin router se cae. */}
    <MemoryRouter>
      <div
      style={{
        display: 'flex',
        gap: 14,
        padding: 14,
        background: '#05070f',
        minHeight: '100vh',
        fontFamily: 'system-ui',
        alignItems: 'flex-start',
      }}
    >
      {TELEFONOS.map((t) => (
        <Telefono key={t.nombre} {...t} caidas={9} />
      ))}
        <Telefono {...TELEFONOS[1]} nombre="la otra apertura · 412 × 915" caidas={0} />
        <Telefono {...TELEFONOS[1]} nombre="el final · 412 × 915" caidas={9} alFinal />
      </div>
    </MemoryRouter>
  </StrictMode>,
)
