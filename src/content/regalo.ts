/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  EL REGALO                                                    ║
 * ║  La caja que se ve al entrar, antes que nada. Se toca, se      ║
 * ║  abre, inunda la pantalla de luz y adentro está el video.      ║
 * ║                                                               ║
 * ║  Todo lo de aquí es texto: cambialo sin miedo.                 ║
 * ║                                                               ║
 * ║  ⚠  EL ENLACE DEL VIDEO NO ESTÁ AQUÍ.                          ║
 * ║  Este archivo se publica EN CLARO — el repositorio es público  ║
 * ║  y cualquiera puede leerlo sin escribir la contraseña. Un      ║
 * ║  video «no listado» de YouTube deja de serlo en cuanto su      ║
 * ║  enlace está a la vista de todos.                              ║
 * ║                                                               ║
 * ║  El enlace vive en  private/publicable/regalo.json  y llega    ║
 * ║  al teléfono cifrado, igual que los chats y las fotos. Para    ║
 * ║  ponerlo: abrí ese archivo, pegalo, guardá. El cifrado corre   ║
 * ║  solo (el hook) y en el mismo commit va public/cifrado/.       ║
 * ║                                                               ║
 * ║  Para apagar el regalo cuando ya pasó el día: activo: false.   ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

export const REGALO = {
  /** En false, la portada arranca como siempre y la caja no aparece. */
  activo: true,

  /** La etiqueta colgada del moño, escrita a mano. */
  etiqueta: 'para mi osita',

  /** Lo que se lee debajo de la caja cerrada. */
  invitacion: 'tocalo',

  /** Si vuelve a entrar otro día, la caja ya está abierta. */
  invitacionAbierto: 'tocalo otra vez',

  /* ── Lo que sale cuando se abre ──────────────────────────── */

  /** El titular, arriba del todo. */
  titulo: 'dos años',

  /**
   * El mensaje. Cada línea es un párrafo aparte, y se van escribiendo
   * una detrás de otra. Que no sean muchas: esto se lee de pie, con la
   * pantalla iluminada y probablemente llorando.
   */
  lineas: [
    'Hoy hace exactamente dos años los dos íbamos entrando a un lugar donde ninguno quería estar, yo con mis lentes negros y vos con los blancos, y no nos dijimos ni una sola palabra.',
    'Bastaba con que uno se quedara en su casa esa noche para que nada de esto existiera. Ni los jueves, ni el sushi, ni las flores, ni nosotros.',
    'Dos años después te hice esto con las manos, para que tengas dónde guardarlo todo. Pero antes quiero que veas una cosa.',
  ],

  /** La firma del mensaje. */
  firma: '— tu osito',

  /** El botón que lleva al video. */
  boton: 'abrilo',

  /** Debajo del botón, chiquito. */
  aviso: 'ponete los audífonos',

  /** Para volver a la web sin ver el video. */
  cerrar: 'ahorita no',
} as const

/**
 * Lo que llega descifrado de public/cifrado/regalo.enc.
 * Se escribe en private/publicable/regalo.json, no aquí.
 */
export interface SobreRegalo {
  enlace: string
  pie?: string
}
