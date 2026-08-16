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
 * ║  Por lo mismo, acá no va el nombre de nadie más que el de     ║
 * ║  ustedes dos: las hermanas y los amigos se mencionan por       ║
 * ║  parentesco («mi hermanita», «su amiga»).                      ║
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

  {
    id: 'primera-foto',
    fecha: '2024-09-14',
    titulo: 'Tu primer enojo y nuestra primera foto',
    lugar: 'Casual, The Reef',
    resumen:
      'Me quedé sin cómo llegar a la cena y me respondiste "Aaa xd". Esa misma noche nos tomamos la primera foto.',
    relato:
      'Para entonces ya llevábamos varios jueves seguidos viendo películas en la camioneta, parqueados en la UAM, con hamburguesas del drive thru y lo que se nos antojara. Ese sábado era el cumpleaños de un amigo suyo: compramos un vape entre los dos para regalárselo, la cena primero y después la disco. A la cena no llegué. Yo dependía de mi amigo, que en ese momento salía con la amiga de ella, y a última hora no pudo ir; mi mamá se había llevado la camioneta porque yo ya no la necesitaba. Le avisé y me respondió con dos letras que me tuvieron sobrepensando toda la tarde. Después nos vimos, y la pasé tan bien que se me olvidó por completo que había existido el problema. De esa noche salió nuestra primera foto juntos.',
    flor: 'gerbera',
    destacado: true,
    icono: '📸',
    fotos: [
      {
        src: 'momento6-1',
        alt: 'Vos, en una de nuestras noches de jueves',
        pie: 'un jueves cualquiera',
      },
      { src: 'momento6-2', alt: 'Los dos, la primera foto juntos', pie: 'la primera' },
      { src: 'momento6-3', alt: 'Los dos, esa misma noche' },
    ],
    chat: { mensajes: 20, fuente: 'whatsapp', titulo: 'las dos letras' },
    nota: {
      autor: 'osito',
      texto:
        'Los dos introvertidos, en una disco, dejándonos tomar una foto delante de todo el mundo. Eso fue lo grande.',
    },
  },
  {
    id: 'pizza-de-chimichurri',
    fecha: '2024-09-28',
    titulo: 'La pizza de chorizos y chimichurri',
    lugar: 'Rock Munchies',
    resumen:
      'Lugar elegido por vos, con reseñas de TikTok y calificación de 10/10. Y una camioneta con la puerta trabada.',
    relato:
      'El lugar lo escogiste vos: te acordabas de haber ido hacía años y traías las reseñas revisadas. Yo llegué con un problema encima — mi mamá había chocado la camioneta la noche anterior y la puerta del copiloto se trababa —, así que te avisé que ibas a tener que subirte por atrás y pasarte adelante. Al final no hizo falta: entraste por tu puerta como siempre, solo que me tocaba abrírtela yo, con maña y con cuidado, cada vez. La pizza llevaba chorizos y chimichurri por encima y estaba deliciosa; el lugar tenía juegos de mesa y nos quedamos jugando UNO. Visto de afuera no parece gran cosa: comer pizza y jugar cartas. Y sin embargo es de las salidas que mejor recuerdo.',
    flor: 'cipres',
    icono: '🍕',
    fotos: [
      {
        src: 'momento7',
        alt: 'La pizza de chorizos con chimichurri por encima',
        pie: 'la famosa 10/10',
      },
    ],
    chat: { mensajes: 18, fuente: 'whatsapp' },
    nota: {
      autor: 'osito',
      texto:
        'Ese mes te abrí la puerta todas las veces. Culpa del golpe, pero me gustó la costumbre — y quizás por eso todavía te la abro.',
    },
  },
  {
    id: 'cumple-veinte',
    fecha: '2024-10-08',
    titulo: 'Mi primer cumpleaños con vos',
    lugar: 'Chiless',
    resumen:
      'Lo planeaste durante semanas. Fui al baño, volví, y la mesa tenía cosas que antes no estaban.',
    relato:
      'Yo no celebro mucho mis cumpleaños, así que no esperaba nada. Vos llevabas semanas armándolo. Querías darme ese mismo día un hoodie de los Bucks, pero tu tarjeta no hacía compras internacionales; pasaste días intentándolo hasta que le pediste el favor a un amigo, y cuando por fin salió el pedido había un huracán en Miami y se atrasó una semana. Aun así, ese día pediste un pastelito de Eladio y unos minicupcakes, y en el restaurante te ofrecieron esconderlo todo hasta que termináramos de comer. Fui al baño; cuando volví, la mesa estaba llena y yo tardé varios segundos en entender qué había pasado. Así sos: detallista de una manera que a mí todavía me desarma. Desde ese cumpleaños los quiero todos con vos.',
    flor: 'girasol',
    destacado: true,
    icono: '🎂',
    fotos: [
      { src: 'momento8-1', alt: 'El pastelito de Eladio', pie: 'el pastel de Eladio' },
      { src: 'momento8-2', alt: 'Los minicupcakes que pediste', pie: 'y los minicupcakes' },
    ],
    chat: { mensajes: 19, fuente: 'whatsapp', titulo: 'desde la medianoche' },
    nota: {
      autor: 'osito',
      texto: 'El hoodie llegó tarde por un huracán. El detalle llegó puntual, a las 12:00 en punto.',
    },
  },
  {
    id: 'nace-nico',
    fecha: '2024-10-13',
    titulo: 'El nacimiento de Nico',
    lugar: 'Metrocentro',
    resumen:
      'Te dije que tenía que pasar comprando el regalo de mi hermana. Era mentira: iba por un peluche rosado.',
    relato:
      'Salí de la casa un rato antes con la excusa de comprar el regalo de cumpleaños de mi hermanita. En realidad iba a comprarte un peluche. Lo elegí rosa pastel a propósito: en esa época todo lo tuyo era de ese color — el bolso, el termo, hasta la vibra que me transmitías — y yo te molestaba porque decías que tu color favorito era el rojo vino y no tenías nada de rojo vino. Se llamó Nico, y quedó de nuestro primogénito. Lo compré para que te acompañara mientras dormías, como si yo estuviera ahí.',
    flor: 'rosa-pastel',
    destacado: true,
    icono: '🧸',
    fotos: [
      { src: 'momento9-1', alt: 'Nico, recién llegado', pie: 'Nico' },
      {
        src: 'momento9-2',
        alt: 'Nico con el collar de flores de mi hermanita',
        pie: 'con el collar de mi hermanita',
      },
      { src: 'momento9-3', alt: 'Vos con mi hoodie café, abrazando a Nico' },
    ],
    chat: { mensajes: 16, fuente: 'whatsapp', titulo: 'la excusa y la sorpresa' },
    nota: {
      autor: 'osito',
      texto: 'Te dije que te iba a volver el cuarto entero rosa. Todavía voy en eso.',
    },
  },
  {
    id: 'los-videos',
    fecha: '2024-10-19',
    titulo: 'El día que te empecé a grabar',
    lugar: "Carl's Jr",
    resumen:
      'Unas hamburguesitas en una mesa de afuera, sin gente cerca. Y una cámara encendida que no te expliqué del todo.',
    relato:
      'Hamburguesas ya habíamos comido varias veces, pero siempre en el carro; esa fue la primera vez que nos sentamos en el local, en una mesa de afuera, sin nadie alrededor. Ese día empecé a grabarte. Te dije que era para tener el recuerdo, y era cierto, pero no era todo: en secreto estaba juntando material para armarte una compilación y dártela en tu cumpleaños. Terminaron siendo muchísimos videos. En cada uno hay un pedazo de mí mirándote.',
    flor: 'margarita',
    icono: '🎥',
    fotos: [
      {
        src: 'momento10',
        alt: 'Un pedacito del primer video que te grabé',
        pie: 'el primero de todos',
      },
    ],
    chat: { mensajes: 18, fuente: 'whatsapp' },
    nota: {
      autor: 'osito',
      texto: 'Me hago payaso solo para verte reír. Eso no ha cambiado ni un día.',
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
