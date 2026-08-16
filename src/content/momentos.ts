import type { Momento } from '@/types'

/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  LA LÍNEA DEL TIEMPO                                         ║
 * ║  Agregá momentos aquí, en cualquier orden: la web los         ║
 * ║  ordena sola por fecha. Con copiar uno y cambiarle los datos  ║
 * ║  ya está.                                                     ║
 * ║                                                               ║
 * ║  Los relatos de abajo son borradores míos a partir de lo que  ║
 * ║  me contaste. Corregilos sin piedad: la voz tiene que ser la  ║
 * ║  tuya, no la mía.                                             ║
 * ║                                                               ║
 * ║  ⚠  ESTE ARCHIVO SE PUBLICA EN CLARO. El repositorio es       ║
 * ║  público: todo lo que escribás aquí lo puede leer cualquiera  ║
 * ║  que sepa mirar el código, sin escribir la contraseña.        ║
 * ║                                                               ║
 * ║  Por eso NINGUNA conversación real vive aquí. Los mensajes    ║
 * ║  están en  private/publicable/chats.json,  se cifran con      ║
 * ║  `npm run secretos:cifrar`  y se abren en el teléfono con la  ║
 * ║  frase de la puerta. Abajo solo queda la ficha: cuántos       ║
 * ║  mensajes son y de qué app.                                   ║
 * ║                                                               ║
 * ║  Para acordarte de qué se dijeron cualquier día:              ║
 * ║      npm run chat:dia -- 2024-08-30                           ║
 * ╚══════════════════════════════════════════════════════════════╝
 */
export const momentos: Momento[] = [
  {
    id: 'area74',
    fecha: '2024-08-24',
    titulo: 'La noche de los lentes de sol',
    lugar: 'Area 74',
    resumen:
      'Un evento de lentes de sol. Ella los llevaba blancos, yo negros. No nos dijimos ni una palabra.',
    relato:
      'Yo fui con mi primo y un amigo; ella, con sus amigas de secundaria, por un cumpleaños. Nos vimos por primera vez en la entrada. Ninguno de los dos es de salir a esos lugares — ella ni siquiera pensaba ir —, así que lo normal habría sido que esa noche no existiera. Pasó todo lo contrario: mi amigo se acercó a su amiga, y de ahí salió que yo le había parecido atractivo. Volví a casa aburridísimo y con una sonrisa que no me cabía, dispuesto a seguirla en Instagram para escribirle al día siguiente. Ya la seguía. Y ella a mí. Desde hacía rato, sin que ninguno lo recordara.',
    flor: 'girasol',
    destacado: true,
    icono: '🕶️',
    // Ese día no se escribieron: no se conocían todavía. Pero la noche
    // siguiente se la contaron entera por Instagram, y ahí está.
    chat: { mensajes: 12, fuente: 'instagram', titulo: 'cómo nos lo contamos al día siguiente' },
    nota: {
      autor: 'osito',
      texto: 'Los dos mirando, los dos con lentes, y ninguno se dio cuenta.',
    },
  },
  {
    id: 'el-mensaje-de-instagram',
    fecha: '2024-08-25',
    titulo: 'Le escribí por Instagram',
    resumen:
      'Al día siguiente de Area 74. Y lo primero que le confesé fue que me arrepentía de no haberle hablado.',
    relato:
      'Un día. Eso fue lo que aguanté. Le escribí a las siete de la tarde y no paramos hasta quedarnos dormidos. Ella estaba estudiando para una prueba de Cálculo de las siete de la mañana y no se pudo concentrar nada; me lo dijo con tres caritas tristes. Descubrimos que estudiábamos en la misma universidad, que ella iba en segundo y yo en tercero, que llevábamos años siguiéndonos sin saberlo. Después de dos frases de cortesía ya le estaba diciendo que me arrepentía de algo, y ese algo era no haberle hablado en Area 74. Ella lo resolvió en un mensaje: que ya lo había compensado por escribirle hoy.',
    flor: 'tulipan-violeta',
    icono: '💬',
    chat: { mensajes: 21, fuente: 'instagram' },
    nota: {
      autor: 'osito',
      texto: 'Esa primera carita triste fue la primera de 411. Ya se veía venir.',
    },
  },
  {
    id: 'el-primer-helado',
    fecha: '2024-08-29',
    titulo: 'El primer jueves',
    lugar: 'La universidad',
    resumen:
      'Un helado en el food court que se derritió entero, porque teníamos cosas más importantes que atender.',
    relato:
      'Quedamos en vernos un jueves después de clases, el primero de todos los jueves que vinieron después. De camino pasé frente a un baño, volteé sin querer y vi de espaldas a una muchacha de pelo café con mechones rubios mirándose al espejo. Fue un segundo, no le vi la cara, y nunca la había visto en persona — pero algo dentro de mí me dijo que era ella. No me podía quedar ahí a esperar, así que seguí al food court. Cuando la vi caminar hacia mi mesa se me fue el aire. Estábamos nerviosísimos, y el calor no ayudaba: los helados se nos derritieron encima mientras nosotros seguíamos hablando, con el helado ya en segundo plano. Después nos movimos a unas bancas de la universidad y ahí sí, se nos fueron las horas.',
    flor: 'margarita',
    destacado: true,
    icono: '🍦',
    chat: { mensajes: 19, fuente: 'instagram' },
    nota: {
      autor: 'osito',
      texto:
        'Tan imperfectamente perfecto que se lo voy a contar a nuestros hijos. Y así empezaron los jueves.',
    },
  },
  {
    id: 'primer-mensaje-whatsapp',
    fecha: '2024-08-30',
    titulo: 'El primer "holaa"',
    resumen: 'A las 4:19 de la tarde empezó un chat que no ha parado desde entonces.',
    relato:
      'El primer mensaje de WhatsApp fue un "holaa" mío, a las 4:19 de la tarde del 30 de agosto de 2024. Nada memorable, nada preparado. Y desde ese día no hemos dejado pasar ninguno sin escribirnos.',
    flor: 'nube',
    icono: '💌',
    chat: { mensajes: 1, fuente: 'whatsapp' },
  },
  {
    id: 'primer-sushi',
    fecha: '2024-08-31',
    titulo: 'Nuestro primer sushi',
    lugar: 'Sushi Itto',
    resumen:
      'La primera de todas las veces. La fui a traer a su casa y me terminé sentando de su lado de la mesa.',
    relato:
      'Nuestro platillo estrella tuvo su primera vez un sábado. La pasé a traer a su casa — me tocó esperarla en la esquina del callejón, porque había una reunión y le daba pena — y nos sentamos frente a frente. Duré poco así: me cambié de lugar para quedar a su lado. Hablamos toda la cena, nos enseñamos nuestra canción favorita, comimos riquísimo y después nos quedamos un rato más en el parqueo, donde todo fluyó mejor que la primera vez. Todavía no nos dimos ningún beso. Ya de vuelta en nuestras casas, pasada la medianoche, nos mandamos las canciones por Spotify: la mía, "Carta a Dios" de Eladio Carrión; la de ella, "Heaven" de Bryan Adams. Ella ya había buscado la mía por su cuenta cinco minutos antes.',
    flor: 'rosa-amarilla',
    icono: '🍣',
    chat: { mensajes: 18, fuente: 'whatsapp' },
    nota: {
      autor: 'osito',
      texto: 'Desde esa noche ya sabíamos cuál iba a ser nuestra salida para siempre.',
    },
  },
  {
    id: 'primer-beso',
    fecha: '2024-09-02',
    titulo: 'Nuestro primer beso',
    lugar: 'Metrocentro',
    resumen:
      'Le pregunté qué me daba si le ganaba. Dijo que qué quería. Dije un beso. Y gané.',
    relato:
      'Un lunes: yo salía del gimnasio y ella de clase. La fui a traer a la universidad y nos metimos a Dreamspot, el arcade. Fue la cita más divertida y más espontánea de todas, porque los dos somos competitivos y ahí eso se nota. En uno de los juegos le pregunté qué me daba si le ganaba; me devolvió la pregunta de qué quería yo, y le dije que un beso. Dicho y hecho: gané, gracias a mis habilidades de videojugador profesional, y ahí fue nuestro primer piquito. Todavía me acuerdo de la sensación exacta. En el parqueo nos dimos más.',
    flor: 'hibisco',
    destacado: true,
    icono: '💋',
    chat: { mensajes: 11, fuente: 'whatsapp' },
    nota: {
      autor: 'osito',
      texto: 'Vos dijiste que era una anécdota más. Mirá dónde quedó guardada.',
    },
  },

  // ── De aquí para abajo: apuntados, todavía sin escribir ──────────
  // Salen en la línea del tiempo con su fecha y un "por escribir".
  // Llená la plantilla (private/plantilla-momentos.md) y los completo.
  {
    id: 'somos-novios',
    fecha: '2024-11-24',
    titulo: 'El día que dijiste que sí',
    resumen:
      'Con un ramo de rosas amarillas, rosadas y rojas, nubes blancas y ciprés. Y vos dijiste que sí.',
    flor: 'rosa-roja',
    destacado: true,
    icono: '🌹',
    borrador: true,
    nota: {
      autor: 'osito',
      texto: 'Todavía me tiembla la mano de acordarme.',
    },
  },
  {
    id: 'flores-de-lego',
    fecha: '2025-01-01',
    fechaTexto: 'falta la fecha',
    titulo: 'Las flores que armamos juntos',
    resumen:
      'Un tulipán amarillo, uno violeta, una rosa roja y un hibisco rosa. Pieza por pieza, los dos.',
    flor: 'tulipan-amarillo',
    icono: '🌷',
    borrador: true,
  },
]
