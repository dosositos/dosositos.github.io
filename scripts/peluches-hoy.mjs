/**
 * ¿Dónde están hoy los peluches?
 *
 *   npm run peluches:hoy
 *   npm run peluches:hoy -- 2026-08-24     (otro día)
 *   npm run peluches:hoy -- --semana       (los próximos siete)
 *
 * Importa el MISMO módulo que usa la web (`src/lib/escondites.ts`), no una
 * copia: si el reparto cambia, esto cambia con él. Sirve para dos cosas —
 * mandarle una pista por mensaje sin abrir la web, y saber si un peluche
 * que no aparece está mal escondido o mal dibujado.
 */

import { repartoDelDia } from '../src/lib/escondites.ts'
import { fechaNI, numeroDelDia } from '../src/lib/tiempo.ts'

/** Cómo se llama cada ruta cuando uno habla de ella. */
const PAGINAS = {
  '/': 'la portada',
  '/linea-del-tiempo': 'la línea del tiempo',
  '/juego': 'el juego de las frases',
  '/playlist': 'la playlist',
  '/estadisticas': 'las estadísticas',
  '/frasco': 'el frasco de mensajitos',
  '/diccionario': 'el diccionario',
}

const DONDE = {
  'arriba-izquierda': 'arriba a la izquierda — se ve al entrar, se pierde al bajar',
  'abajo-izquierda': 'abajo a la izquierda — hay que llegar al final de la página',
  'abajo-derecha': 'abajo a la derecha — hay que llegar al final de la página',
}

function mostrar(dia, titulo) {
  console.log(`\n  ${titulo}`)
  const reparto = repartoDelDia(dia)

  for (const { peluche, escondite, esquina } of reparto) {
    const quien = peluche.esImpostor ? `${peluche.nombre} (no es hijo)` : peluche.nombre
    console.log(`    ${quien.padEnd(22)} ${(PAGINAS[escondite.ruta] ?? escondite.ruta).padEnd(24)} ${DONDE[esquina]}`)
  }

  const afuera = 4 - reparto.length
  if (afuera > 0) console.log(`    (${afuera} sin sitio libre hoy)`)
}

const args = process.argv.slice(2)
const semana = args.includes('--semana')
const fecha = args.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a))

if (semana) {
  const hoy = new Date()
  for (let i = 0; i < 7; i++) {
    const d = new Date(hoy.getTime() + i * 86_400_000)
    mostrar(numeroDelDia(d), i === 0 ? 'hoy' : d.toISOString().slice(0, 10))
  }
} else if (fecha) {
  const [a, m, d] = fecha.split('-').map(Number)
  mostrar(numeroDelDia(fechaNI(a, m, d, 12)), fecha)
} else {
  mostrar(numeroDelDia(), 'hoy')
}

console.log()
