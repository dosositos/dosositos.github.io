/**
 * El asomo de la tortuga: la foto del banco, o dónde se asoma qué día.
 *
 *   npm run dev            (en otra terminal)
 *   npm run luna:asomo                  la animación, fotograma a fotograma
 *   npm run luna:asomo -- --semana      en qué página cae los próximos siete días
 *   npm run luna:asomo -- 2026-09-14    en qué página cae ese día
 *
 * La foto queda en private/notas/asomo.png. Lo del reparto sale del
 * MISMO módulo que usa la web (`src/lib/asomo-del-dia.ts`), así que no
 * se puede despistar de lo que ella va a ver.
 */
import { asomoDelDia } from '../../src/lib/asomo-del-dia.ts'
import { fechaNI, numeroDelDia } from '../../src/lib/tiempo.ts'

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

function mostrar(dia, titulo) {
  const { ruta, lado } = asomoDelDia(dia)
  const donde = PAGINAS[ruta] ?? ruta
  const porDonde = lado === 1 ? 'entra por la izquierda' : 'entra por la derecha'
  console.log(`    ${titulo.padEnd(12)} ${donde.padEnd(24)} ${porDonde}`)
}

const args = process.argv.slice(2)
const semana = args.includes('--semana')
const fecha = args.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a))

if (semana || fecha) {
  console.log('\n  al final de la página, debajo de la firma\n')

  if (fecha) {
    const [a, m, d] = fecha.split('-').map(Number)
    mostrar(numeroDelDia(fechaNI(a, m, d, 12)), fecha)
  } else {
    const hoy = new Date()
    for (let i = 0; i < 7; i += 1) {
      const d = new Date(hoy.getTime() + i * 86_400_000)
      mostrar(numeroDelDia(d), i === 0 ? 'hoy' : d.toISOString().slice(0, 10))
    }
  }

  console.log()
} else {
  const { chromium } = await import('playwright-core')

  const nav = await chromium.launch({ channel: 'chrome' })
  const pag = await nav.newPage({ viewport: { width: 1600, height: 1200 }, deviceScaleFactor: 1 })

  const fallos = []
  pag.on('console', (m) => { if (m.type() === 'error') fallos.push(m.text()) })
  pag.on('pageerror', (e) => fallos.push(String(e)))

  const puerto = args.find((a) => /^\d+$/.test(a)) ?? 5173
  await pag.goto(`http://localhost:${puerto}/scripts/juego-luna/asomo-banco.html`, { waitUntil: 'networkidle' })
  await pag.waitForTimeout(600)

  await pag.locator('#lienzo').screenshot({ path: 'private/notas/asomo.png' })

  console.log(fallos.length ? '⚠ errores:\n' + fallos.join('\n') : '✓ sin errores en la página')
  console.log('foto en private/notas/asomo.png')
  await nav.close()
}
