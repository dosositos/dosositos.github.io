import { CAPITULOS, ROPERO } from '@/content/luna'
import { ULTIMO_CAPITULO } from '@/juego-luna/mundos'
import type {
  Accesorio,
  EscenaLuna,
  ProgresoLuna,
  PuestoEnLaTortuga,
  RanuraDeLaTortuga,
} from '@/types'

/**
 * Quién decide qué se ganó, y qué trae puesto de verdad.
 *
 * Lo ganado **no se guarda**: se calcula del progreso cada vez que hace
 * falta. Guardar la lista sería guardar dos veces la misma verdad, y el
 * día que se toque una regla del ropero los teléfonos que ya jugaron se
 * quedarían con la lista vieja para siempre.
 *
 * Y por eso mismo `loPuesto` filtra: aunque en el teléfono haya algo
 * puesto, si con el progreso de ahora ya no le corresponde, no se
 * dibuja. Nadie queda con la corona por un guardado viejo.
 *
 * Vive fuera de React y fuera del canvas porque lo usan los dos, más
 * `npm run luna:ropero`, que comprueba desde node que cada cosa se
 * pueda ganar de verdad.
 */

/** Las ranuras en el orden en que se enseñan. De arriba abajo. */
export const RANURAS: RanuraDeLaTortuga[] = ['sombrero', 'cara', 'cuello', 'caparazon']

/**
 * En cuántos capítulos igualó o mejoró el récord de él.
 *
 * Igualar cuenta. El marcador ya dice «lo empataste» como un logro y no
 * como un casi, y pedir aquí una cosa distinta de la que dice esa
 * pantalla sería contradecirse con ella misma.
 */
export function recordesIgualados(progreso: ProgresoLuna): number {
  return CAPITULOS.filter((c) => {
    const mejor = progreso.mejorPorCapitulo[c.numero]
    return c.record && mejor && mejor.pasitos <= c.record
  }).length
}

/** ¿Subió algún capítulo entero sin caerse ni una vez? */
export function subioSinCaerse(progreso: ProgresoLuna): boolean {
  return Object.values(progreso.mejorPorCapitulo).some((m) => m.caidas === 0)
}

/**
 * ¿Está ganado este accesorio?
 *
 * Se pregunta contra **la cumbre y las llegadas**, no contra el
 * capítulo de esta vuelta. Llegar a la luna reinicia por dónde va, y si
 * el ropero mirara ese número ella perdería la corona y el caparazón
 * dorado en el mismo momento de ganárselos. Lo ganado, ganado.
 */
export function estaGanado(accesorio: Accesorio, progreso: ProgresoLuna): boolean {
  const llave = accesorio.llave
  switch (llave.como) {
    case 'siempre':
      return true
    case 'capitulo':
      return progreso.cumbre >= llave.cual
    case 'sinCaerse':
      return subioSinCaerse(progreso)
    case 'records':
      return recordesIgualados(progreso) >= llave.cuantos
    case 'luna':
      return progreso.llegadas > 0 || progreso.cumbre >= ULTIMO_CAPITULO
  }
}

/** Todo lo ganado, en el orden del catálogo. */
export function loGanado(progreso: ProgresoLuna): Accesorio[] {
  return ROPERO.filter((a) => estaGanado(a, progreso))
}

/**
 * Lo que trae puesto y de verdad le corresponde.
 *
 * Es lo único que mira el dibujo. Entre lo guardado y el canvas siempre
 * pasa por acá.
 */
export function loPuesto(progreso: ProgresoLuna): PuestoEnLaTortuga {
  const puesto: PuestoEnLaTortuga = {}
  for (const ranura of RANURAS) {
    const id = progreso.puesto[ranura]
    if (!id) continue
    const accesorio = ROPERO.find((a) => a.id === id && a.ranura === ranura)
    if (accesorio && estaGanado(accesorio, progreso)) puesto[ranura] = id
  }
  return puesto
}

/**
 * Lo que le falta para ganarse uno, dicho con palabras.
 *
 * Los textos viven en `content/luna.ts` y llegan aquí como parámetro en
 * vez de importarse. Es lo que deja que `npm run luna:ropero` compruebe
 * las reglas sin arrastrar la mitad del contenido.
 */
export function loQueLeFalta(
  accesorio: Accesorio,
  textos: {
    capitulo: string
    sinCaerse: string
    unRecord: string
    records: string
    luna: string
  },
): string {
  const llave = accesorio.llave
  switch (llave.como) {
    case 'siempre':
      return ''
    case 'capitulo':
      return textos.capitulo.replace('{cual}', String(llave.cual))
    case 'sinCaerse':
      return textos.sinCaerse
    case 'records':
      // Uno solo tiene su propia frase. «igualale el récord en 1
      // capítulos» es de las cosas que delatan que nadie leyó la
      // pantalla antes de publicarla.
      return llave.cuantos === 1
        ? textos.unRecord
        : textos.records.replace('{cuantos}', String(llave.cuantos))
    case 'luna':
      return textos.luna
  }
}

/**
 * Una tortuga quieta, para el probador del ropero.
 *
 * El dibujo pide una escena entera del juego, y en el ropero no hay
 * juego: no hay plataformas, ni cámara, ni nada cayendo. Esto arma la
 * escena mínima con la que se dibuja parada, respirando y parpadeando.
 *
 * `reloj` son los segundos, y es lo que la mantiene viva: sin él las
 * antenitas del cintillo no se bambolean y la bufanda no ondea, que es
 * la mitad de lo que hace que se quiera poner.
 */
export function escenaDeVitrina(reloj: number): EscenaLuna {
  return {
    x: 0,
    y: 0,
    mirando: 1,
    carga: 0,
    cargando: false,
    enSuelo: true,
    caminado: 0,
    vy: 0,
    reloj,
    desdeSalto: 9999,
    desdeAterrizaje: 9999,
    cayendo: false,
    agobio: 0,
    cansancio: 0,
    camara: 0,
    hitoAlcanzado: -1,
    vidaDeLaPista: [],
    avisoDeLaPista: 0,
    inclinacion: [],
    hundido: [],
    rebote: null,
    loQueCae: [],
    efecto: null,
    cine: 'jugando',
    cineAvance: 1,
    pasitos: 0,
    caidas: 0,
    plataformas: [],
  }
}
