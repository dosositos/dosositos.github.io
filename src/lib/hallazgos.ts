/**
 * Lo que el teléfono se acuerda de los peluches escondidos.
 *
 * Vivía dentro de `PeluchesEscondidos.tsx`, y salió de ahí porque
 * apareció alguien más que necesita preguntarlo: **la luna de la
 * portada**, que no se abre hasta que ella los encuentre a los tres.
 *
 * Nada de esto es delicado. Si el navegador tiene el almacenamiento
 * cerrado, todo devuelve «no» y la madriguera funciona igual, solo que
 * empezando de cero en cada visita.
 */

const LLAVE = 'dosositos:peluches'
const LLAVE_PREMIO = 'dosositos:peluches:premio'
const LLAVE_DORMIDOS = 'dosositos:peluches:dormidos'

/**
 * El día en que dio con los tres por primera vez.
 *
 * Va en su propia llave y **`olvidarTodo` no la toca**. Las otras tres
 * se borran cada vez que los manda a dormir, que es justamente lo que
 * hace que mañana vuelvan a esconderse. Si la luna se apoyara en ellas
 * se cerraría esa misma noche y ella tendría que salir a buscarlos de
 * nuevo para releer la carta. Encontrados una vez, encontrados para
 * siempre.
 */
const LLAVE_LOS_TRES = 'dosositos:peluches:los-tres'

export function leerEncontrados(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(LLAVE) ?? '[]') as string[])
  } catch {
    return new Set()
  }
}

export function guardarEncontrados(ids: Set<string>) {
  try {
    localStorage.setItem(LLAVE, JSON.stringify([...ids]))
  } catch {
    // Sin localStorage el juego funciona igual, solo que empieza de cero
    // en cada visita.
  }
}

export function yaVioElPremio(): boolean {
  try {
    return localStorage.getItem(LLAVE_PREMIO) === 'si'
  } catch {
    return false
  }
}

export function anotarPremio() {
  try {
    localStorage.setItem(LLAVE_PREMIO, 'si')
  } catch {
    // ídem
  }
}

/** El día en que los mandó a dormir, o 0 si andan despiertos. */
export function leerDormidos(): number {
  try {
    return Number(localStorage.getItem(LLAVE_DORMIDOS) ?? 0)
  } catch {
    return 0
  }
}

export function olvidarTodo(dormirHoy: number) {
  try {
    localStorage.removeItem(LLAVE)
    localStorage.removeItem(LLAVE_PREMIO)
    if (dormirHoy) localStorage.setItem(LLAVE_DORMIDOS, String(dormirHoy))
    else localStorage.removeItem(LLAVE_DORMIDOS)
  } catch {
    // ídem
  }
}

/* ── La llave de la luna ─────────────────────────────────────────── */

/**
 * Los que están mirando a ver si la luna ya se abrió.
 *
 * Hace falta porque el momento importa: ella encuentra al tercero en la
 * portada misma, y la luna está ahí arriba en esa misma pantalla. Sin
 * este aviso se quedaría apagada hasta que recargara la página, y el
 * momento —que es gratis y es el mejor que tiene esta parte— se
 * perdería.
 */
const mirando = new Set<() => void>()

/** ¿Ya dio con los tres alguna vez? */
export function losTresYaEstan(): boolean {
  try {
    return !!localStorage.getItem(LLAVE_LOS_TRES)
  } catch {
    return false
  }
}

/**
 * Anotar que los encontró, con el día. Se puede llamar las veces que
 * sea: solo la primera escribe, y así la fecha guardada es la del día
 * en que de verdad pasó.
 */
export function anotarLosTres(dia: number) {
  try {
    if (localStorage.getItem(LLAVE_LOS_TRES)) return
    localStorage.setItem(LLAVE_LOS_TRES, String(dia))
  } catch {
    // Sin almacenamiento la luna se queda cerrada. No es lo ideal, pero
    // es mejor que abrirla de gratis: el aviso le dice qué hacer y los
    // peluches siguen ahí para encontrarlos.
    return
  }
  for (const avisar of mirando) avisar()
}

/** Mirar si la luna se abre. Devuelve cómo dejar de mirar. */
export function suscribirseALosTres(avisar: () => void): () => void {
  mirando.add(avisar)
  return () => {
    mirando.delete(avisar)
  }
}
