/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  EL FRASCO DE MENSAJITOS — las reglas y los textos de la     ║
 * ║  pantalla. Todo esto es texto plano: cambialo sin miedo.     ║
 * ║                                                              ║
 * ║  Los mensajitos NO están aquí. Viven cifrados en             ║
 * ║  public/cifrado/frasco.enc y se abren en el teléfono con la  ║
 * ║  misma frase de la puerta, igual que las conversaciones.     ║
 * ║  Para tocarlos:  private/publicable/frasco.json              ║
 * ║  (se cifra solo al guardar; el commit lleva public/cifrado/) ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

/**
 * Cuántas estrellitas puede abrir por día.
 *
 * El frasco no se lee de una sentada a propósito: si pudiera sacarlas
 * todas la primera tarde, en dos horas se acaba el regalo y nunca más
 * hay razón para volver. Con tres por día son casi dos semanas, y cada
 * una llega el día que le toca.
 *
 * El día se cuenta en horario de Nicaragua, no en el del teléfono.
 */
export const POR_DIA = 3

/** Lo que se lee en la pantalla del frasco. */
export const TEXTOS = {
  seccion: 'frasco de mensajitos',
  titulo: 'sacá una estrellita',
  entrada: 'cuando la necesités, cuando te acordés de mí, o porque sí',

  /** Debajo del frasco, según cómo venga el día. */
  cupo: {
    /** Todavía puede sacar. */
    disponible: (quedanHoy: number) =>
      quedanHoy === 1
        ? 'te queda una para hoy'
        : `te quedan ${quedanHoy} para hoy`,
    /** Ya sacó las del día. */
    agotado: 'ya sacaste las de hoy — mañana el frasco se vuelve a llenar',
  },

  sacar: 'sacar otra',
  cerrar: 'guardarla y cerrar el frasco',
  /** Cuando ya abrió todas las que hay escritas y el frasco se rellena. */
  seVolvioALlenar: 'el frasco estaba vacío, así que lo volví a llenar',

  /** El pie de la página. Recibe POR_DIA para no repetir el número a mano. */
  pie: (porDia: number) =>
    `Podés sacar ${porDia} por día. El frasco se acuerda de cuáles ya abriste —solo en este teléfono— para no repetirte ninguna hasta que las hayás visto todas.`,
}
