import { motion } from 'motion/react'

/**
 * LA CAJA DE REGALO
 *
 * Está dibujada, no es un emoji ni una foto: así se puede abrir de
 * verdad — la tapa vuela, la boca queda destapada y la luz sale de
 * adentro, todo en la misma pieza.
 *
 * Los colores no son decorativos: el papel es `rosa-roja`, la flor del
 * contador de novios, y la cinta es `girasol`, la de cuando se
 * conocieron. La caja está hecha de las dos fechas. Los tonos claros y
 * oscuros van escritos a mano porque un gradiente necesita tres tonos
 * de cada color y la variable de CSS solo da uno.
 *
 * La perspectiva es de un punto: se ve la cara de enfrente y la de
 * arriba, que se estrecha y sube hacia el fondo. Con eso basta para
 * que se lea como una caja de verdad, y hace que la tapa se levante
 * en línea recta sin tener que dibujar un lado más.
 *
 * Lo que la saca de «dibujito» y la acerca a una caja de verdad son
 * cuatro cosas, y ninguna es el color: la sombra que la tapa tira
 * sobre la base, el canto claro donde se doblan las caras, el grano
 * del papel y que el moño tenga lazadas por detrás además de por
 * delante. Sin esas cuatro, es una caja de emoji con degradado.
 */

/* ── La geometría, en el sistema del viewBox (300 × 300) ─────────── */

/** La caja de abajo: solo se le ve la cara de enfrente. */
const BASE = { x1: 62, x2: 238, y1: 164, y2: 262 }

/** La tapa. Vuela un poco por fuera de la base, como las de verdad. */
const TAPA = { x1: 52, x2: 248, y1: 128, y2: 172 }

/** La fuga: cuánto sube y cuánto se estrecha la cara de arriba. */
const FUGA = { alto: 46, encoge: 26 }

/** El ancho de la cinta en la cara de enfrente. */
const CINTA = { x1: 136, x2: 164 }

/** Dónde cruza la otra cinta, medido en profundidad (0 = borde, 1 = fondo). */
const CRUCE = { desde: 0.38, hasta: 0.58 }

const n = (v: number) => Number(v.toFixed(2))

/**
 * Un punto de la cara de arriba de la tapa.
 * @param x  dónde cae en el borde de enfrente
 * @param t  0 en el borde de enfrente, 1 en el del fondo
 */
function enLaTapa(x: number, t: number): [number, number] {
  const ancho = TAPA.x2 - TAPA.x1
  const alFondo = TAPA.x1 + FUGA.encoge + ((x - TAPA.x1) * (ancho - 2 * FUGA.encoge)) / ancho
  return [n(x + (alFondo - x) * t), n(TAPA.y1 - FUGA.alto * t)]
}

/** Lo mismo para la boca de la base, que es más angosta que la tapa. */
function enLaBoca(x: number, t: number): [number, number] {
  const ancho = BASE.x2 - BASE.x1
  const alFondo = BASE.x1 + 23 + ((x - BASE.x1) * (ancho - 46)) / ancho
  return [n(x + (alFondo - x) * t), n(BASE.y1 - 41 * t)]
}

const puntos = (ps: [number, number][]) => ps.map(([x, y]) => `${x},${y}`).join(' ')

/** La cara de arriba de la tapa. */
const CARA_TAPA = puntos([
  enLaTapa(TAPA.x1, 0),
  enLaTapa(TAPA.x2, 0),
  enLaTapa(TAPA.x2, 1),
  enLaTapa(TAPA.x1, 1),
])

/** La boca destapada: lo que se ve cuando la tapa se va. */
const BOCA = puntos([
  enLaBoca(BASE.x1, 0),
  enLaBoca(BASE.x2, 0),
  enLaBoca(BASE.x2, 1),
  enLaBoca(BASE.x1, 1),
])

/** La cinta que sube por la tapa y sigue hacia el fondo. */
const CINTA_TAPA = puntos([
  enLaTapa(CINTA.x1, 0),
  enLaTapa(CINTA.x2, 0),
  enLaTapa(CINTA.x2, 1),
  enLaTapa(CINTA.x1, 1),
])

/** La otra cinta, la que cruza de lado a lado. */
const CINTA_CRUCE = puntos([
  enLaTapa(TAPA.x1, CRUCE.desde),
  enLaTapa(TAPA.x2, CRUCE.desde),
  enLaTapa(TAPA.x2, CRUCE.hasta),
  enLaTapa(TAPA.x1, CRUCE.hasta),
])

/* ── El moño ──────────────────────────────────────────────────────
   Va donde se cruzan las dos cintas. Son cuatro lazadas y no dos: las
   de atrás asoman apenas por el borde de las de adelante, y ese medio
   milímetro de diferencia es lo que le da bulto. Con dos lazadas
   queda una mariposa plana pegada a la tapa. */

const MONIO_X = 150
const MONIO_Y = 105

const TRAS_IZQ = 'M150,103 C126,76 88,76 82,96 C78,110 106,119 148,110 Z'
const TRAS_DER = 'M150,103 C174,76 212,76 218,96 C222,110 194,119 152,110 Z'
const LAZADA_IZQ = 'M150,105 C128,80 92,80 86,98 C81,113 108,122 148,112 Z'
const LAZADA_DER = 'M150,105 C172,80 208,80 214,98 C219,113 192,122 152,112 Z'
/** El hueco de sombra donde la cinta se recoge contra el nudo. */
const SOMBRA_IZQ = 'M150,105 C136,94 116,92 108,98 C103,102 118,111 147,111 Z'
const SOMBRA_DER = 'M150,105 C164,94 184,92 192,98 C197,102 182,111 153,111 Z'
/** El filo de luz por donde se dobla cada lazada. */
const FILO_IZQ = 'M147,100 C130,83 102,83 93,95'
const FILO_DER = 'M153,100 C170,83 198,83 207,95'
/** Las colas, que caen por delante de la tapa y terminan en pico. */
const COLA_IZQ = 'M147,110 C143,126 136,142 122,155 L134,163 L136,154 L145,159 C151,145 154,127 155,113 Z'
const COLA_DER = 'M154,110 C159,129 168,148 185,162 L171,169 L169,159 L159,164 C151,149 146,128 145,113 Z'

/** Las chispas que titilan alrededor. Posición y ritmo fijos, no al azar. */
const CHISPAS = [
  { x: 36, y: 108, r: 3.4, tarda: 3.2, espera: 0 },
  { x: 268, y: 138, r: 2.8, tarda: 3.8, espera: 0.7 },
  { x: 54, y: 228, r: 2.2, tarda: 4.4, espera: 1.4 },
  { x: 256, y: 210, r: 3, tarda: 3.5, espera: 2.1 },
  { x: 150, y: 44, r: 2.6, tarda: 4, espera: 1 },
  { x: 88, y: 60, r: 2, tarda: 3.6, espera: 2.6 },
  { x: 216, y: 54, r: 2.4, tarda: 4.2, espera: 0.4 },
]

/** Una chispita de cuatro puntas, de las de brillo. */
function chispa(x: number, y: number, r: number) {
  const l = r * 3.4
  return `M${x},${y - l} Q${x},${y} ${x + l},${y} Q${x},${y} ${x},${y + l} Q${x},${y} ${x - l},${y} Q${x},${y} ${x},${y - l} Z`
}

/** Los rayos que salen de la caja al abrirse. */
const RAYOS = Array.from({ length: 14 }, (_, i) => i * (360 / 14))

/**
 * `abierta` es la que se abre delante de ella; `yaAbierta` es la misma
 * caja destapada pero sin volver a representar el estallido, para
 * cuando vuelve a entrar otro día y el regalo ya no es una sorpresa.
 */
export type FaseCaja = 'cerrada' | 'temblando' | 'abierta' | 'yaAbierta'

export function CajaDeRegalo({
  fase,
  etiqueta,
  sinMovimiento = false,
}: {
  fase: FaseCaja
  /** Lo que dice la etiqueta colgada de la cinta. */
  etiqueta?: string
  sinMovimiento?: boolean
}) {
  const abierta = fase === 'abierta' || fase === 'yaAbierta'
  /** Solo la primera vez: el golpe de luz y los rayos. */
  const estalla = fase === 'abierta' && !sinMovimiento

  /** El vaivén de siempre. Con movimiento reducido, quieta. */
  const respiracion = sinMovimiento || abierta ? {} : { y: [0, -7, 0] }

  return (
    <svg viewBox="0 0 300 300" aria-hidden className="h-full w-full overflow-visible">
      <defs>
        {/* El papel: la luz entra por arriba a la izquierda */}
        <linearGradient id="rg-papel-frente" x1="0" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#cf4058" />
          <stop offset="42%" stopColor="#b8324a" />
          <stop offset="100%" stopColor="#5f1523" />
        </linearGradient>
        <linearGradient id="rg-papel-tapa" x1="0" y1="0" x2="0.75" y2="1">
          <stop offset="0%" stopColor="#dd5168" />
          <stop offset="50%" stopColor="#c23c53" />
          <stop offset="100%" stopColor="#72192a" />
        </linearGradient>
        <linearGradient id="rg-papel-arriba" x1="0.12" y1="0" x2="0.88" y2="1">
          <stop offset="0%" stopColor="#f08398" />
          <stop offset="48%" stopColor="#d2495f" />
          <stop offset="100%" stopColor="#93283d" />
        </linearGradient>

        {/* La sombra que la tapa tira sobre la base */}
        <linearGradient id="rg-sombra-tapa" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3d0d18" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#3d0d18" stopOpacity="0" />
        </linearGradient>

        {/* La cinta es satén: una banda clara entre dos oscuras */}
        <linearGradient id="rg-cinta" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7d4d0f" />
          <stop offset="13%" stopColor="#d1932f" />
          <stop offset="33%" stopColor="#fdeec6" />
          <stop offset="50%" stopColor="#f0a52e" />
          <stop offset="74%" stopColor="#b0741b" />
          <stop offset="100%" stopColor="#6d420c" />
        </linearGradient>
        <linearGradient id="rg-cinta-cruce" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c48423" />
          <stop offset="32%" stopColor="#fdeec6" />
          <stop offset="68%" stopColor="#eda029" />
          <stop offset="100%" stopColor="#83530f" />
        </linearGradient>
        <linearGradient id="rg-monio" x1="0.2" y1="0" x2="0.75" y2="1">
          <stop offset="0%" stopColor="#fff3d2" />
          <stop offset="34%" stopColor="#f5c257" />
          <stop offset="72%" stopColor="#d9932c" />
          <stop offset="100%" stopColor="#9a5f10" />
        </linearGradient>
        <linearGradient id="rg-monio-tras" x1="0.3" y1="0" x2="0.7" y2="1">
          <stop offset="0%" stopColor="#c98a26" />
          <stop offset="100%" stopColor="#7d4d0f" />
        </linearGradient>

        {/* Adentro: oscuro en los bordes, encendido en el fondo */}
        <radialGradient id="rg-adentro" cx="0.5" cy="0.78" r="0.9">
          <stop offset="0%" stopColor="#fff4d6" />
          <stop offset="32%" stopColor="#f0a52e" />
          <stop offset="70%" stopColor="#6d2418" />
          <stop offset="100%" stopColor="#1d0509" />
        </radialGradient>

        {/* Sombra de contacto contra el suelo */}
        <radialGradient id="rg-sombra">
          <stop offset="0%" stopColor="#000" stopOpacity="0.85" />
          <stop offset="55%" stopColor="#000" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>

        {/* El resplandor que sale de la boca */}
        <radialGradient id="rg-luz">
          <stop offset="0%" stopColor="#fff6df" stopOpacity="0.95" />
          <stop offset="30%" stopColor="#f7cf7c" stopOpacity="0.6" />
          <stop offset="65%" stopColor="#f0a52e" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#f0a52e" stopOpacity="0" />
        </radialGradient>

        {/* Para los brillos anchos: la luz de una ventana no tiene borde */}
        <filter id="rg-suave" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="13" />
        </filter>

        {/* Grano de papel: ruido gris que se multiplica encima del color */}
        <filter id="rg-grano" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>

        {/* Las motitas estampadas del papel de regalo */}
        <pattern id="rg-motitas" width="17" height="17" patternUnits="userSpaceOnUse" patternTransform="rotate(16)">
          <circle cx="4" cy="4" r="0.9" fill="#fff" fillOpacity="0.13" />
          <circle cx="12" cy="11" r="0.6" fill="#fff" fillOpacity="0.09" />
          <path d="M12.5,2 q0,2.1 2.1,2.1 q-2.1,0 -2.1,2.1 q0,-2.1 -2.1,-2.1 q2.1,0 2.1,-2.1 Z" fill="#ffe9b8" fillOpacity="0.2" />
        </pattern>

        {/* El grano y las motitas, solo dentro del cartón */}
        <clipPath id="rg-solo-base">
          <rect x={BASE.x1} y={BASE.y1} width={BASE.x2 - BASE.x1} height={BASE.y2 - BASE.y1} rx="4" />
        </clipPath>
        <clipPath id="rg-solo-tapa">
          <rect x={TAPA.x1} y={TAPA.y1} width={TAPA.x2 - TAPA.x1} height={TAPA.y2 - TAPA.y1} rx="4" />
          <polygon points={CARA_TAPA} />
        </clipPath>
      </defs>

      {/* ── La sombra en el suelo ─────────────────────────────────── */}
      <motion.ellipse
        cx="150"
        cy="264"
        rx="106"
        ry="15"
        fill="url(#rg-sombra)"
        animate={
          sinMovimiento || abierta
            ? { scaleX: 1, opacity: abierta ? 0.4 : 1 }
            : { scaleX: [1, 0.9, 1], opacity: [1, 0.72, 1] }
        }
        transition={{ duration: 6, repeat: abierta || sinMovimiento ? 0 : Infinity, ease: 'easeInOut' }}
        style={{ transformBox: 'view-box', transformOrigin: '150px 268px' }}
      />

      {/* ── Todo lo que flota y tiembla junto ─────────────────────── */}
      <motion.g
        animate={
          fase === 'temblando'
            ? { rotate: [0, -3.2, 3.2, -2.4, 2, -1, 0], y: [0, -3, 0, -3, 0, -1, 0] }
            : respiracion
        }
        transition={
          fase === 'temblando'
            ? { duration: 0.55, ease: 'easeInOut' }
            : { duration: 6, repeat: sinMovimiento || abierta ? 0 : Infinity, ease: 'easeInOut' }
        }
        style={{ transformBox: 'view-box', transformOrigin: '150px 262px' }}
      >
        {/* ── La luz que sale de adentro ──────────────────────────── */}
        <motion.g
          initial={false}
          animate={{ opacity: abierta ? 1 : 0 }}
          transition={{ duration: 0.5, delay: abierta ? 0.18 : 0 }}
        >
          <motion.circle
            cx="150"
            cy="140"
            r="150"
            fill="url(#rg-luz)"
            initial={false}
            animate={{ scale: estalla ? [0.2, 1.5] : abierta ? 1.05 : 0.2 }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
            style={{ transformBox: 'view-box', transformOrigin: '150px 140px' }}
          />
          <motion.g
            initial={false}
            animate={{ scale: estalla ? [0.3, 1.35] : 0.3, opacity: estalla ? [0.9, 0] : 0 }}
            transition={{ duration: 1.3, ease: 'easeOut' }}
            style={{ transformBox: 'view-box', transformOrigin: '150px 145px' }}
          >
            {RAYOS.map((giro) => (
              <polygon
                key={giro}
                points="147,145 153,145 157,-50 143,-50"
                fill="#ffe9b8"
                opacity="0.35"
                transform={`rotate(${giro} 150 145)`}
              />
            ))}
          </motion.g>
        </motion.g>

        {/* ── La base ─────────────────────────────────────────────── */}
        <g>
          {/* La boca: se ve recién cuando vuela la tapa */}
          <polygon points={BOCA} fill="url(#rg-adentro)" />
          <polygon points={BOCA} fill="none" stroke="#4d1120" strokeWidth="3" />

          {/* La cara de enfrente */}
          <rect
            x={BASE.x1}
            y={BASE.y1}
            width={BASE.x2 - BASE.x1}
            height={BASE.y2 - BASE.y1}
            rx="4"
            fill="url(#rg-papel-frente)"
          />
          <g clipPath="url(#rg-solo-base)">
            <rect x={BASE.x1} y={BASE.y1} width={BASE.x2 - BASE.x1} height={BASE.y2 - BASE.y1} fill="url(#rg-motitas)" />
            <rect
              x={BASE.x1}
              y={BASE.y1}
              width={BASE.x2 - BASE.x1}
              height={BASE.y2 - BASE.y1}
              filter="url(#rg-grano)"
              opacity="0.2"
              style={{ mixBlendMode: 'overlay' }}
            />
            {/* La esquina derecha se va de la luz, y el suelo devuelve algo */}
            <rect x={BASE.x2 - 34} y={BASE.y1} width="34" height={BASE.y2 - BASE.y1} fill="#4f1120" opacity="0.4" />
            <rect x={BASE.x1} y={BASE.y2 - 12} width={BASE.x2 - BASE.x1} height="12" fill="#ff9aa8" opacity="0.07" />
            <ellipse cx="104" cy="196" rx="52" ry="42" fill="#fff" opacity="0.07" filter="url(#rg-suave)" />
          </g>

          {/* La cinta que baja por enfrente */}
          <rect
            x={CINTA.x1}
            y={BASE.y1}
            width={CINTA.x2 - CINTA.x1}
            height={BASE.y2 - BASE.y1}
            fill="url(#rg-cinta)"
          />

          {/* La sombra de la tapa, encima de todo lo de la base */}
          <g clipPath="url(#rg-solo-base)">
            <rect x={BASE.x1} y={BASE.y1} width={BASE.x2 - BASE.x1} height="26" fill="url(#rg-sombra-tapa)" />
          </g>
        </g>

        {/* ── La tapa, que es la que vuela ────────────────────────── */}
        <motion.g
          initial={false}
          animate={
            estalla
              ? { y: [0, -12, -340], rotate: [0, -1.5, -18], opacity: [1, 1, 0] }
              : abierta
                ? { y: -340, rotate: -18, opacity: 0 }
                : { y: 0, rotate: 0, opacity: 1 }
          }
          transition={{ duration: estalla ? 1 : 0.01, ease: [0.3, 0, 0.2, 1], times: [0, 0.22, 1] }}
          style={{ transformBox: 'view-box', transformOrigin: '150px 128px' }}
        >
          {/* La cara de arriba y la de enfrente */}
          <polygon points={CARA_TAPA} fill="url(#rg-papel-arriba)" />
          <rect
            x={TAPA.x1}
            y={TAPA.y1}
            width={TAPA.x2 - TAPA.x1}
            height={TAPA.y2 - TAPA.y1}
            rx="4"
            fill="url(#rg-papel-tapa)"
          />

          <g clipPath="url(#rg-solo-tapa)">
            <rect x="40" y="70" width="220" height="115" fill="url(#rg-motitas)" />
            <rect
              x="40"
              y="70"
              width="220"
              height="115"
              filter="url(#rg-grano)"
              opacity="0.2"
              style={{ mixBlendMode: 'overlay' }}
            />
            {/* El canto vivo del doblez, la sombra del borde bajo y la
                esquina que se va de la luz */}
            <rect x={TAPA.x1} y={TAPA.y1} width={TAPA.x2 - TAPA.x1} height="1.6" fill="#ffd9e0" opacity="0.55" />
            <rect x={TAPA.x1} y={TAPA.y2 - 9} width={TAPA.x2 - TAPA.x1} height="9" fill="#4d1120" opacity="0.45" />
            <rect x={TAPA.x2 - 34} y={TAPA.y1} width="34" height={TAPA.y2 - TAPA.y1} fill="#4f1120" opacity="0.32" />
            <polygon points={CARA_TAPA} fill="#fff" opacity="0.07" />
            <ellipse cx="112" cy="104" rx="46" ry="17" fill="#fff" opacity="0.1" filter="url(#rg-suave)" />
            <ellipse cx="100" cy="152" rx="42" ry="16" fill="#fff" opacity="0.07" filter="url(#rg-suave)" />
          </g>

          {/* Las cintas: primero la que cruza, encima la que sube */}
          <polygon points={CINTA_CRUCE} fill="url(#rg-cinta-cruce)" />
          <polygon points={CINTA_TAPA} fill="url(#rg-cinta)" />
          <rect
            x={CINTA.x1}
            y={TAPA.y1}
            width={CINTA.x2 - CINTA.x1}
            height={TAPA.y2 - TAPA.y1}
            fill="url(#rg-cinta)"
          />
          <rect x={CINTA.x1} y={TAPA.y1} width={CINTA.x2 - CINTA.x1} height="1.6" fill="#fff3d4" opacity="0.7" />

          {/* La etiqueta, colgada de la cinta con su hilito */}
          {etiqueta && (
            <g>
              <path
                d="M141,151 C130,158 121,167 113,176"
                fill="none"
                stroke="#f3d377"
                strokeWidth="1.6"
                strokeLinecap="round"
                opacity="0.8"
              />
              <g transform="rotate(-14 88 190)">
                <rect x="34" y="172" width="108" height="36" rx="5" fill="#f6f1e7" />
                <rect x="34" y="172" width="108" height="36" rx="5" fill="none" stroke="#c9b89a" strokeWidth="1" />
                <rect x="34" y="200" width="108" height="8" rx="4" fill="#000" opacity="0.06" />
                <circle cx="44" cy="190" r="2.6" fill="none" stroke="#c9b89a" strokeWidth="1.2" />
                <text
                  x="92"
                  y="196"
                  textAnchor="middle"
                  fill="#8e2438"
                  fontSize="15"
                  style={{ fontFamily: 'var(--font-mano)', fontWeight: 600 }}
                >
                  {etiqueta}
                </text>
              </g>
            </g>
          )}

          {/* El moño */}
          <motion.g
            animate={sinMovimiento || abierta ? {} : { scale: [1, 1.035, 1] }}
            transition={{ duration: 4.5, repeat: sinMovimiento || abierta ? 0 : Infinity, ease: 'easeInOut' }}
            style={{ transformBox: 'view-box', transformOrigin: `${MONIO_X}px ${MONIO_Y}px` }}
          >
            {/* Las colas primero: caen por detrás del nudo */}
            <path d={COLA_IZQ} fill="url(#rg-monio)" />
            <path d={COLA_DER} fill="url(#rg-monio)" />
            <path d={COLA_DER} fill="#7d4d0f" opacity="0.22" />

            {/* Las lazadas de atrás, que son las que dan el bulto */}
            <path d={TRAS_IZQ} fill="url(#rg-monio-tras)" />
            <path d={TRAS_DER} fill="url(#rg-monio-tras)" />

            {/* Las de adelante */}
            <path d={LAZADA_IZQ} fill="url(#rg-monio)" />
            <path d={LAZADA_DER} fill="url(#rg-monio)" />
            <path d={SOMBRA_IZQ} fill="#9a5f10" opacity="0.42" />
            <path d={SOMBRA_DER} fill="#9a5f10" opacity="0.42" />
            <path d={FILO_IZQ} fill="none" stroke="#fff6de" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
            <path d={FILO_DER} fill="none" stroke="#fff6de" strokeWidth="2" strokeLinecap="round" opacity="0.5" />

            {/* El nudo */}
            <ellipse cx={MONIO_X} cy={MONIO_Y + 1} rx="14" ry="11" fill="url(#rg-monio)" />
            <path
              d={`M${MONIO_X - 13},${MONIO_Y - 4} Q${MONIO_X},${MONIO_Y + 3} ${MONIO_X + 13},${MONIO_Y - 4}`}
              fill="none"
              stroke="#9a5f10"
              strokeWidth="1.4"
              opacity="0.35"
            />
            <ellipse cx={MONIO_X - 4} cy={MONIO_Y - 3} rx="6" ry="4" fill="#fff6de" opacity="0.6" />
          </motion.g>
        </motion.g>

        {/* ── Las chispas ────────────────────────────────────────── */}
        {CHISPAS.map((c) => (
          <motion.path
            key={`${c.x}-${c.y}`}
            d={chispa(c.x, c.y, c.r)}
            fill="var(--color-rosa-amarilla)"
            initial={{ opacity: 0.2, scale: 0.7 }}
            animate={sinMovimiento ? { opacity: 0.35, scale: 1 } : { opacity: [0.15, 0.95, 0.15], scale: [0.7, 1.15, 0.7] }}
            transition={{
              duration: c.tarda,
              repeat: sinMovimiento ? 0 : Infinity,
              delay: c.espera,
              ease: 'easeInOut',
            }}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          />
        ))}
      </motion.g>
    </svg>
  )
}
