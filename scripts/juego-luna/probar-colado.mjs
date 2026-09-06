/**
 * ¿El colado se cuela donde debe?
 *
 *   npm run luna:cuela
 *
 * El pato tiene tres reglas y ninguna se puede comprobar jugando: son
 * un sorteo, y jugando una partida se ve una tirada. Acá se sortea mil
 * veces por capítulo y se comprueban las tres en las tres mil:
 *
 *   · son un par por capítulo, ni uno ni cinco
 *   · no en los primeros saltos, que son para agarrar el pulso
 *   · **nunca en el último trecho**, que ahí ya no es chiste
 *
 * Y una cuarta que no está en el plan pero se decidió al escribirlo:
 * nunca en una estrella, en un tramo de impulso ni en una caja de
 * peluches, porque esas tres ya hacen algo propio al aterrizar.
 *
 * Corre en node contra el mismo módulo que el teléfono, no contra una
 * copia: si la regla cambia y esto no, se entera acá.
 */
const { EL_COLADO, CAPITULOS } = await import('@/content/luna.ts')
const { dondeSeCuela } = await import('@/juego-luna/colado.ts')
const { construirNivel } = await import('@/juego-luna/mundos.ts')

const VECES = 1000

let quejas = 0
const quejarse = (texto) => {
  quejas += 1
  console.log(`   ⚠ ${texto}`)
}

console.log(`\n  El colado, sorteado ${VECES} veces por capítulo\n`)

for (const capitulo of CAPITULOS) {
  const { plataformas } = construirNivel(capitulo)
  const ultima = plataformas.length - 1

  /** Cuántas veces le tocó a cada plataforma, para ver el reparto. */
  const cuenta = new Map()
  let masBajo = Infinity
  let masAlto = -Infinity
  let malCuantos = 0
  let enProhibida = 0

  for (let v = 0; v < VECES; v += 1) {
    const elegidas = [...dondeSeCuela(plataformas)]

    if (elegidas.length !== EL_COLADO.cuantos) malCuantos += 1

    for (const i of elegidas) {
      cuenta.set(i, (cuenta.get(i) ?? 0) + 1)
      masBajo = Math.min(masBajo, i)
      masAlto = Math.max(masAlto, i)

      const p = plataformas[i]
      if (p.hito || p.impulso || p.rebote) enProhibida += 1
    }
  }

  const sinRepetir = new Set()
  for (const [i] of cuenta) sinRepetir.add(i)

  console.log(`  ${capitulo.numero} · ${capitulo.nombre}, sobre ${plataformas.length} tramos`)
  console.log(
    `     se coló entre la ${masBajo} y la ${masAlto}, en ${sinRepetir.size} tramos distintos`,
  )

  if (malCuantos > 0) {
    quejarse(`${malCuantos} sorteos no dieron ${EL_COLADO.cuantos} patos`)
  }
  if (masBajo < EL_COLADO.primeras) {
    quejarse(`se coló en la ${masBajo}, y las primeras ${EL_COLADO.primeras} son intocables`)
  }
  if (masAlto > ultima - EL_COLADO.ultimas) {
    quejarse(
      `se coló en la ${masAlto} de ${ultima}: eso ya es el último trecho, y ahí no es chiste`,
    )
  }
  if (enProhibida > 0) {
    quejarse(`${enProhibida} veces cayó en una estrella, un impulso o una caja de peluches`)
  }

  // Que se reparta. Si el sorteo se apelotonara en dos o tres tramos,
  // jugar dos veces seguidas sería ver al pato en el mismo sitio, y la
  // gracia de que se cuele es justamente que no se sabe dónde.
  const posibles = plataformas.filter(
    (p, i) =>
      i >= EL_COLADO.primeras &&
      i < plataformas.length - EL_COLADO.ultimas &&
      !p.hito &&
      !p.impulso &&
      !p.rebote,
  ).length

  if (sinRepetir.size < posibles) {
    quejarse(`hay ${posibles} tramos donde podría y solo usó ${sinRepetir.size}`)
  }
}

console.log('')
if (quejas === 0) {
  console.log('  ✓ un par por capítulo, nunca en los primeros saltos, nunca en el último trecho')
  console.log(`  ✓ y nunca encima de una estrella, un impulso ni una caja de peluches`)
} else {
  console.log(`  ⚠ ${quejas} regla(s) rotas`)
}
console.log('')

process.exit(quejas ? 1 : 0)
