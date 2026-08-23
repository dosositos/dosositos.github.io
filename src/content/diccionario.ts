import type { EntradaDiccionario } from '@/types'

/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  EL DICCIONARIO OSO–ESPAÑOL                                  ║
 * ║                                                              ║
 * ║  Las palabras que solo existen entre ustedes dos.            ║
 * ║                                                              ║
 * ║  Acá va LA FICHA: la palabra, cómo se pronuncia en broma,    ║
 * ║  la categoría y la definición. Todo eso es la voz del que    ║
 * ║  cuenta —tuya— así que puede ir en claro, igual que los      ║
 * ║  relatos de los momentos.                                    ║
 * ║                                                              ║
 * ║  Lo que NO va acá: las citas. El ejemplo de uso y el pedazo  ║
 * ║  de chat donde nació cada palabra viven cifrados en          ║
 * ║  public/cifrado/diccionario.enc. Si alguna vez querés        ║
 * ║  agregar un ejemplo textual, va a private/publicable/,       ║
 * ║  nunca a este archivo.                                       ║
 * ║                                                              ║
 * ║  Los números y las fechas de `datos` no se escriben a mano:  ║
 * ║  salen de peinar los dos chats. Si los tocás acá, mienten.   ║
 * ║                                                              ║
 * ║  Aprobado por Armando el 22 de agosto de 2026. El registro   ║
 * ║  de qué entró, qué se cayó y por qué está en                 ║
 * ║  private/diccionario-candidatas.md                           ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

/** Lo que se lee en la pantalla del diccionario. */
export const TEXTOS = {
  seccion: 'diccionario',
  titulo: 'oso – español',
  subtitulo: 'las palabras que solo existen aquí',

  /** En la tapa, debajo del título. */
  tapa: {
    autores: 'recopilado por los dos',
    pie: 'edición única · un solo ejemplar',
    /** Lo que dice el lomo, de canto. */
    lomo: 'OSO – ESPAÑOL',
  },

  /** La invitación a abrirlo. */
  abrir: 'abrir el libro',

  /** El pie de la página, fuera del libro. */
  ayuda: 'pasá las hojas con el dedo, como un libro de verdad',
}

/**
 * La foto de la tapa.
 *
 * Va cifrada como todas las fotos del regalo: acá solo está su nombre
 * lógico, y <FotoCifrada> la abre en el teléfono. Los tres retratos de
 * los peluches son la única excepción del proyecto, y no es este caso.
 */
export const FOTO_TAPA = {
  src: 'diccionario/portada-ninos',
  alt: 'Los dos abrazados, de chiquitos, en una polaroid',
}

/**
 * Las entradas, en orden alfabético.
 *
 * Alfabético a propósito: así el libro se hojea como un diccionario y
 * la fecha de cada palabra sorprende sola, sin que el orden la anuncie.
 */
export const entradas: EntradaDiccionario[] = [
  {
    id: 'abriba',
    palabra: 'abriba',
    tipo: 'adv.',
    definicion:
      'Arriba, dicho mal a propósito. Estaba esperándola en el edificio B, le escribió «arriba» bien y enseguida lo mandó otra vez torcido; cuando ella no dijo nada, aclaró «no abrajo», que tampoco existe. Pasó una sola vez y quedó.',
    margen: 'ninguno de los dos preguntó nada',
    cifrada: true,
    datos: {
      veces: 2,
      reparto: { osito: 2, osita: 0 },
      nacio: '2025-06-05',
      hora: '18:36',
      acuño: 'osito',
      ultima: '2025-06-05',
    },
  },
  {
    id: 'barbaridad',
    palabra: 'qué barbaridad',
    alfabetiza: 'barbaridad',
    tipo: 'loc. interj.',
    definicion:
      'Sirve para el asombro bueno y para el malo sin cambiar de tono. La usan los dos, y es de las primeras cosas que él le escribió: está ahí desde el día uno.',
    datos: {
      veces: 104,
      reparto: { osito: 68, osita: 36 },
      nacio: '2024-08-25',
      hora: '20:58',
      acuño: 'osito',
      ultima: '2026-08-11',
    },
  },
  {
    id: 'cansadita',
    palabra: 'cansadita, -to',
    tipo: 'adj.',
    definicion:
      'El cansancio dicho en diminutivo, que es como se dice cuando uno quiere que lo cuiden. Ella lo usa el triple que él.',
    datos: {
      veces: 349,
      reparto: { osito: 91, osita: 258 },
      nacio: '2024-09-13',
      hora: '22:42',
      acuño: 'osita',
      ultima: '2026-08-12',
      formas: [
        { forma: 'cansadita', veces: 221 },
        { forma: 'cansadito', veces: 119 },
        { forma: 'cansaditos', veces: 9 },
      ],
    },
  },
  {
    id: 'chi',
    palabra: 'chi',
    tipo: 'adv.',
    definicion:
      'Sí, dicho como bebé. Lo empezó él una madrugada y ella se lo quedó: de 340 veces, 306 son de ella. Es la palabra que más rápido cambió de dueño.',
    acepciones: ['Su pareja es «ño». Nunca aparecen en el mismo mensaje.'],
    margen: 'nació a la medianoche en punto',
    cifrada: true,
    datos: {
      veces: 340,
      reparto: { osito: 34, osita: 306 },
      nacio: '2025-10-21',
      hora: '00:00',
      acuño: 'osito',
      ultima: '2026-08-14',
    },
  },
  {
    id: 'chichi',
    palabra: 'chichi',
    tipo: 's. f.',
    definicion:
      'Mimos, pedidos en el idioma de un bebé de dos años, que es el registro al que él baja cuando quiere que lo consientan. Como el resto de este capítulo, tiene doble filo y se usa sabiéndolo.',
    margen: 'del capítulo blando',
    cifrada: true,
    datos: {
      veces: 21,
      reparto: { osito: 15, osita: 6 },
      nacio: '2024-11-10',
      hora: '20:50',
      acuño: 'osito',
      ultima: '2026-08-04',
    },
  },
  {
    id: 'pipi',
    palabra: 'pipí',
    tipo: 's. m.',
    definicion:
      'Del capítulo blando. Es el más antiguo de los cuatro —octubre de 2024— y el único que usan los dos casi por igual: once veces ella, diez él.',
    cifrada: true,
    datos: {
      veces: 21,
      reparto: { osito: 10, osita: 11 },
      nacio: '2024-10-30',
      hora: '20:59',
      acuño: 'osito',
      ultima: '2026-08-04',
    },
  },
  {
    id: 'pipirisnai',
    palabra: 'pipirisnai',
    fonetica: 'pi·pi·ris·nái',
    tipo: 's. m.',
    definicion:
      'Del capítulo blando, y el más nuevo de todos: apareció en mayo de 2026, cuando ya llevaban veinte meses hablándose todos los días. Prueba de que el idioma sigue creciendo.',
    margen: 'el más nuevo del libro',
    cifrada: true,
    datos: {
      veces: 9,
      reparto: { osito: 7, osita: 2 },
      nacio: '2026-05-12',
      hora: '23:07',
      acuño: 'osita',
      ultima: '2026-08-14',
    },
  },
  {
    id: 'sapito',
    palabra: 'sapito',
    tipo: 's. m.',
    definicion:
      'Del capítulo blando. Este es enteramente de él: de las ocho veces que aparece, las ocho las escribió él. Ella nunca lo usó.',
    cifrada: true,
    datos: {
      veces: 8,
      reparto: { osito: 8, osita: 0 },
      nacio: '2025-05-09',
      hora: '20:53',
      acuño: 'osito',
      ultima: '2026-08-04',
    },
  },
  {
    id: 'chiquitina',
    palabra: 'chiquitina',
    tipo: 's. f.',
    definicion:
      'El diminutivo que él prefiere cuando «chiquita» le queda corto. No lo inventó él: ella le contó que ya le decían así de antes —en la casa o en el colegio, eso no quedó claro— y él se lo apropió sin pedir permiso.',
    datos: {
      veces: 170,
      reparto: { osito: 163, osita: 7 },
      nacio: '2024-09-08',
      acuño: 'osito',
      ultima: '2026-08-11',
    },
  },
  {
    id: 'chupones',
    palabra: 'chupones',
    tipo: 'errata célebre',
    definicion:
      'Quiso escribir «supones» y le salió «chupones». Se corrigió solo un segundo después, pero el mensaje ya estaba mandado. Una sola vez en dos años, y ahí quedó para siempre.',
    cifrada: true,
    datos: {
      veces: 1,
      reparto: { osito: 1, osita: 0 },
      nacio: '2025-03-24',
      hora: '11:25',
      acuño: 'osito',
      ultima: '2025-03-24',
    },
  },
  {
    id: 'corazon-de-melon',
    palabra: 'corazón de melón',
    tipo: 'loc. s.',
    definicion:
      'De la canción, pero ya sin canción. Ella lo dijo tres veces seguidas la primera vez, como quien insiste hasta que quede.',
    cifrada: true,
    datos: {
      veces: 64,
      reparto: { osito: 39, osita: 25 },
      nacio: '2024-10-15',
      acuño: 'osita',
    },
  },
  {
    id: 'coxinho',
    palabra: 'coxinho, -ha',
    fonetica: 'co·xi·ño',
    tipo: 'adj. cariñoso',
    definicion:
      'Cochino, pero dicho con amor. Salió de una película brasileña —la del perro, Caramelo—: el protagonista era un chef que hacía todo el tiempo una comida típica llamada coxinha, y cada vez que la nombraba parecía que estaba diciendo «cochina». Les dio risa y se quedó.',
    acepciones: [
      'La coxinha de verdad es un aperitivo de São Paulo: pechuga de pollo deshebrada envuelta en masa, empanada y frita. Que la palabra sirva para las dos cosas —el que no se bañó y el bocadito que se come caliente— no lo planeó nadie.',
      'Se estrenó una noche en que él confesó que no se había bañado en todo el día. Ella, en vez de retarlo, le puso el apodo. Desde entonces se usa sin necesidad de estar sucio.',
    ],
    cifrada: true,
    datos: {
      veces: 69,
      reparto: { osito: 35, osita: 34 },
      nacio: '2026-01-19',
      hora: '20:26',
      acuño: 'osita',
      ultima: '2026-07-25',
      formas: [
        { forma: 'coxinho', veces: 30 },
        { forma: 'coxinha', veces: 25 },
        { forma: 'coxinhito', veces: 7 },
        { forma: 'coxinhita', veces: 6 },
      ],
    },
  },
  {
    id: 'epi',
    palabra: 'Epi',
    tipo: 's. pr. · perro',
    definicion:
      'Salchicha gordito, con las patas tan gorditas como el resto de él. Es el adolescente de la casa: le encanta jugar y correr aunque de lejos no lo parezca, y se toma en serio su trabajo de defender el patio de las iguanas y de cualquier visita rara.',
    margen: 'guardián de iguanas',
    cifrada: true,
    datos: {
      veces: 70,
      reparto: { osito: 37, osita: 33 },
      nacio: '2024-10-04',
      hora: '21:55',
      acuño: 'osito',
      ultima: '2026-08-10',
    },
  },
  {
    id: 'fiona',
    palabra: 'Fiona',
    tipo: 's. pr. · perra',
    definicion:
      'Schnauzer cruzada con algo más, gordita y un poco amargada. No juega con los demás por compromiso: juega cuando ella quiere y no antes. Era del tío de él, que le puso así por la Fionna de Hora de Aventura — la versión mujer de Finn.',
    margen: 'juega cuando ella quiere',
    cifrada: true,
    datos: {
      veces: 29,
      reparto: { osito: 20, osita: 9 },
      nacio: '2024-10-04',
      hora: '21:57',
      acuño: 'osito',
      ultima: '2026-08-06',
    },
  },
  {
    id: 'flaquita',
    palabra: 'flaquita',
    tipo: 's. f.',
    definicion:
      'Suya y de nadie más: de 522 veces que se ha dicho, 514 las dijo él. Ella casi nunca la usa. No es un apodo suelto, es parte de un rito: todos los días, sin faltar uno, el mensaje de la mañana le pregunta cómo amaneció «mi flaquita maravillosa».',
    margen: 'todos los días, sin excepción',
    cifrada: true,
    datos: {
      veces: 522,
      reparto: { osito: 514, osita: 8 },
      nacio: '2024-10-20',
      hora: '23:19',
      acuño: 'osito',
      ultima: '2026-08-14',
    },
  },
  {
    id: 'futura-esposa',
    palabra: 'futura esposa · futuro esposo',
    tipo: 'loc. s.',
    definicion:
      'No es un apodo: es un plan, y se contesta. Él lo estrenó una noche de febrero de 2025; ella le devolvió «mi amado futuro esposo» diez minutos después, esa misma noche. Desde entonces ninguno de los dos dejó de decirlo.',
    margen: 'diez minutos tardó la respuesta',
    cifrada: true,
    datos: {
      veces: 221,
      reparto: { osito: 137, osita: 84 },
      nacio: '2025-02-26',
      hora: '21:22',
      acuño: 'osito',
      ultima: '2026-08-02',
      formas: [
        { forma: 'futura esposa', veces: 177 },
        { forma: 'futuro esposo', veces: 44 },
      ],
    },
  },
  {
    id: 'futura-madre',
    palabra: 'la madre de mis hijos',
    alfabetiza: 'madre de mis hijos',
    tipo: 'loc. s. f.',
    definicion:
      'El otro plan, el que va más lejos que el anterior. Apareció a las cuatro de la mañana de un 4 de enero, en medio de una lista de cosas que él quería para toda la vida. Casi siempre lo dice él: de 94 veces, 93.',
    acepciones: [
      'Con el tiempo se le fueron sumando cargos —futura esposa, compañera de vida, madre de todos mis hijos e hijas— hasta volverse una fórmula entera. Ahí es donde el saludo de la mañana se le empezó a ir de largo.',
    ],
    cifrada: true,
    datos: {
      veces: 94,
      reparto: { osito: 93, osita: 1 },
      nacio: '2025-01-04',
      hora: '04:02',
      acuño: 'osito',
      ultima: '2026-08-13',
    },
  },
  {
    id: 'frida',
    palabra: 'Frida',
    tipo: 's. pr. · perra',
    definicion:
      'Salchicha peluda, más chiquita que Epi y mayor que él. Fue la primera hija de él: la tuvo desde bebé, cuando era tan miedosa que había que dejarla dormir en su cama. Se amaban de esa manera que no hace falta explicarle a nadie.',
    acepciones: [
      'Ya no está. Se fue el 6 de junio de 2026, y por eso su última mención en el chat es de ese día. Ahora es un angelito que lo cuida desde el cielo, que es justo el lugar del que él le habla a ella todas las noches.',
    ],
    margen: 'mi angelito',
    cifrada: true,
    datos: {
      veces: 45,
      reparto: { osito: 33, osita: 12 },
      nacio: '2024-10-04',
      hora: '21:57',
      acuño: 'osito',
      ultima: '2026-06-06',
    },
  },
  {
    id: 'gashas',
    palabra: 'gashas · gachas',
    fonetica: 'ga·shas',
    tipo: 'interj.',
    definicion:
      'Gracias. La palabra más dicha de todo el libro: en dos años reemplazó a la de verdad. Y tiene una regla que ninguno de los dos acordó nunca — ella la escribe con sh y él con ch. Ella puso la sh 881 veces y la ch una sola; él puso la ch 381 veces y la sh cuatro. La misma palabra, cada uno con su letra.',
    margen: 'la campeona: 1.267 veces',
    cifrada: true,
    datos: {
      veces: 1267,
      reparto: { osito: 385, osita: 882 },
      nacio: '2025-01-14',
      hora: '17:54',
      acuño: 'osita',
      ultima: '2026-08-14',
      formas: [
        { forma: 'gashas', veces: 913 },
        { forma: 'gachas', veces: 384 },
        { forma: 'gasha', veces: 1 },
      ],
    },
  },
  {
    id: 'la-letania',
    // El título de verdad es la frase entera: llega descifrado del
    // sobre. Esto de acá es solo lo que se ve mientras abre.
    palabra: 'el saludo de la mañana',
    lemaCifrado: true,
    alfabetiza: 'el saludo de ella',
    letraIndice: '✦',
    tipo: 'fórmula de saludo, de ella',
    definicion:
      'El buenos días de ella. Empezó midiendo cuatro palabras en noviembre de 2024 y terminó siendo lo más largo que alguien escribió en dos años de conversación.',
    acepciones: [
      'Fue creciendo por capas: primero los adjetivos, después los juramentos, y al final unidades de medida inventadas para decir cuánto. En junio de 2025 tocó su techo.',
      'Se dijo 295 veces y ni una sola fue de él: esta es enteramente suya. Después de aquel verano se fue acortando sola, hasta quedar en unos cien caracteres, que siguen siendo diez veces el saludo original.',
    ],
    margen: 'la más larga del libro',
    cifrada: true,
    datos: {
      veces: 295,
      reparto: { osito: 0, osita: 295 },
      nacio: '2024-11-03',
      hora: '08:35',
      acuño: 'osita',
      ultima: '2026-07-25',
    },
  },
  {
    id: 'la-respuesta',
    palabra: 'la respuesta de la mañana',
    lemaCifrado: true,
    alfabetiza: 'el saludo de él',
    letraIndice: '✦',
    tipo: 'fórmula de saludo, de él',
    definicion:
      'Lo mismo, desde el otro lado, con más cargos: reina de mi corazón, princesa de mi alma, amor de mi vida, futura esposa, madre de todos mis hijos e hijas, compañera de vida. Empezó el último día de 2024 y va detrás de la letanía como quien contesta un saludo militar.',
    cifrada: true,
    datos: {
      veces: 162,
      reparto: { osito: 132, osita: 30 },
      nacio: '2024-12-31',
      hora: '12:47',
      acuño: 'osito',
      ultima: '2026-08-13',
    },
  },
  {
    id: 'las-medidas',
    palabra: 'las medidas del infinito',
    lemaCifrado: true,
    alfabetiza: 'medidas del infinito',
    letraIndice: '✦',
    tipo: 'fórmulas de él',
    definicion:
      'Su costumbre de no decir «mucho» nunca, y de medirlo cada vez con una unidad distinta. La primera fue el granito de arena, en octubre de 2024; las demás se fueron sumando sin sustituir a ninguna. No se reemplazan, se acumulan.',
    acepciones: [
      'El catálogo, hasta hoy: de aquí a la luna a pasitos de tortuga · por cada granito de arena de cada playa del mundo · por cada semilla de mostaza y de orquídea · por cada gota de lluvia que haya caído y que caerá · por cada átomo de este universo y de todos los que puedan existir · infinitamente como los números.',
    ],
    margen: 'nunca dice «mucho»',
    cifrada: true,
    datos: {
      veces: 361,
      reparto: { osito: 340, osita: 21 },
      nacio: '2024-10-28',
      acuño: 'osito',
      ultima: '2026-08-14',
      formas: [
        { forma: 'con todo mi ser', veces: 232 },
        { forma: 'granito de arena', veces: 95 },
        { forma: 'pasitos de tortuga', veces: 23 },
        { forma: 'semilla de mostaza', veces: 15 },
      ],
    },
  },
  {
    id: 'lara',
    palabra: 'Lara · larita',
    alfabetiza: 'lara',
    tipo: 's. pr. · perra',
    definicion:
      'La menor y la niña de él. Bullhuahua: chihuahua con bulldog. Chiquitita e inquieta, no para de morder a Epi para que juegue, corre sin cansarse, salta como una cabra y se sube a donde ella decida. Cuando está cansada se sube sola a las camas a dormir.',
    margen: 'salta como una cabra',
    cifrada: true,
    datos: {
      veces: 84,
      reparto: { osito: 50, osita: 34 },
      nacio: '2026-03-29',
      hora: '23:51',
      acuño: 'osita',
      ultima: '2026-08-13',
    },
  },
  {
    id: 'logaritmo',
    palabra: 'logaritmo',
    tipo: 's. m.',
    definicion:
      'El algoritmo de TikTok. Lo dijo ella en persona, cuando llevaban poquísimo de conocerse, y fue tan gracioso que él nunca la corrigió: año y medio después seguía diciéndolo así, y recordándole de quién había sido la culpa. En el chat solo aparece escrito por él, porque el original fue en voz alta.',
    margen: 'el original fue hablando',
    cifrada: true,
    datos: {
      veces: 4,
      reparto: { osito: 4, osita: 0 },
      nacio: '2025-02-21',
      hora: '11:47',
      acuño: 'osito',
      ultima: '2026-06-03',
    },
  },
  {
    id: 'motorcito',
    palabra: 'motorcito',
    tipo: 's. m.',
    definicion:
      'Lo que lo mantiene andando. No es un piropo, es una descripción técnica: el motorcito es el que corre por todos, el que no se cansa y hace que el resto del equipo funcione — como le dicen a De Paul.',
    datos: {
      veces: 21,
      reparto: { osito: 13, osita: 8 },
      nacio: '2024-12-09',
      hora: '23:16',
      acuño: 'osito',
      ultima: '2025-12-22',
    },
  },
  {
    id: 'musho',
    palabra: 'musho',
    tipo: 'adv.',
    definicion:
      'Mucho. Casi no vive solo: va pegado a «testraño». Su forma intensificada es repetirlo —musho musho— y no existe una tercera vuelta.',
    datos: {
      veces: 8,
      reparto: { osito: 5, osita: 2 },
      nacio: '2026-01-19',
      acuño: 'osito',
      ultima: '2026-07-28',
    },
  },
  {
    id: 'no-hay-de-queso',
    palabra: 'no hay de queso',
    alfabetiza: 'no hay de queso',
    tipo: 'loc. interj.',
    definicion:
      'De nada. La original es de Chespirito, pero acá se volvió un juego de nunca terminarla igual: ni de papa, nomás de papa, ni de pollo, ni de pan. La versión más usada de las cuatro es «ni de papa», con 71 apariciones.',
    acepciones: [
      'Él la trajo y ella se la robó: de las 148 veces que se ha dicho, ella la dice 102. Es lo único del libro que cambió de dueño del todo.',
    ],
    cifrada: true,
    datos: {
      veces: 148,
      reparto: { osito: 46, osita: 102 },
      nacio: '2025-01-22',
      hora: '00:10',
      acuño: 'osito',
      ultima: '2026-07-30',
      formas: [
        { forma: 'ni de papa', veces: 71 },
        { forma: 'nomás de papa', veces: 22 },
        { forma: 'ni de pan', veces: 12 },
      ],
    },
  },
  {
    id: 'no',
    palabra: 'ño',
    tipo: 'adv.',
    definicion:
      'No, de la misma familia que «chi». Ella lo estrenó suelto, una sola sílaba, sin explicar nada.',
    acepciones: [
      'Él no lo usa para contestar: lo mete dentro de las frases largas, donde nadie lo está esperando.',
    ],
    datos: {
      veces: 112,
      reparto: { osito: 20, osita: 92 },
      nacio: '2024-12-09',
      hora: '23:24',
      acuño: 'osita',
      ultima: '2026-08-12',
    },
  },
  {
    id: 'numinosa',
    palabra: 'numinosa',
    tipo: 'adj.',
    definicion:
      'Que inspira temor reverencial ante lo divino. Existe de verdad, está bien usada y aparece una sola vez en dos años: él la buscó a propósito, la metió en medio de una lista de adjetivos —linda, bella, hermosa, preciosa, increíble— y no la volvió a escribir nunca.',
    margen: 'la única bien escrita del capítulo',
    cifrada: true,
    datos: {
      veces: 1,
      reparto: { osito: 1, osita: 0 },
      nacio: '2025-06-05',
      acuño: 'osito',
      ultima: '2025-06-05',
    },
  },
  {
    id: 'osito',
    palabra: 'osito, osita',
    tipo: 's. m. y f.',
    definicion:
      'El apodo del que salió todo lo demás. Ella dormía abrazada a un oso blanco enorme; él le dijo que le tenía envidia, que quería ser él. Ella le contestó que entonces él también era su osito, y así quedó.',
    margen: 'de aquí sale el nombre de todo esto',
    datos: {
      veces: 1190,
      reparto: { osito: 286, osita: 904 },
      nacio: '2024-09-07',
      hora: '13:36',
      acuño: 'osita',
      ultima: '2026-08-14',
      formas: [
        { forma: 'osito', veces: 917 },
        { forma: 'osita', veces: 250 },
        { forma: 'ositos', veces: 38 },
      ],
    },
  },
  {
    id: 'polly',
    palabra: 'Polly',
    tipo: 's. pr. · perra',
    definicion:
      'La perrita de ella, y la mayor de todos. Se llama así por Polly Pocket. Es de las primeras cosas que se contaron: la presentó el 30 de agosto de 2024 —el mismísimo día del primer mensaje de WhatsApp— diciendo que iba a cumplir once años en noviembre, y que en enero cumplían once de estar juntas.',
    acepciones: [
      'Le gusta que le hagan caricias y que la anden molestando. Él la nombra con artículo, «la Polly», que es como se nombra en Nicaragua a los de la familia.',
    ],
    margen: 'por Polly Pocket',
    cifrada: true,
    datos: {
      veces: 161,
      reparto: { osito: 43, osita: 118 },
      nacio: '2024-08-30',
      hora: '19:31',
      acuño: 'osita',
      ultima: '2026-08-13',
    },
  },
  {
    id: 'resubir',
    palabra: 'RESUBIR',
    alfabetiza: 'resubir',
    tipo: 'errata célebre',
    definicion:
      'Quiso escribir «resubir», le salió «resumir», y se corrigió gritando en mayúsculas. Es la única vez que él escribe en mayúsculas en todo el chat sin estar riéndose — la risa vino después, en el mensaje siguiente.',
    margen: 'fue un 14 de febrero',
    cifrada: true,
    datos: {
      veces: 1,
      reparto: { osito: 1, osita: 0 },
      nacio: '2026-02-14',
      acuño: 'osito',
      ultima: '2026-02-14',
    },
  },
  {
    id: 'sabo',
    palabra: 'sabo',
    tipo: 'v.',
    definicion:
      'Sé. Como lo diría un niño que todavía no aprendió los verbos irregulares, que es exactamente el punto. Se usa sobre todo negado: «no sabo».',
    cifrada: true,
    datos: {
      veces: 6,
      reparto: { osito: 5, osita: 1 },
      nacio: '2025-02-26',
      hora: '20:23',
      acuño: 'osito',
      ultima: '2026-04-04',
    },
  },
  {
    id: 'sipiripi',
    palabra: 'sípiripi',
    fonetica: 'sí·pi·ri·pi',
    tipo: 'adv.',
    definicion:
      'Sí, pero cantado. Es de ella casi por completo, y las pocas veces que él lo escribe suena a que la está imitando.',
    datos: {
      veces: 333,
      reparto: { osito: 16, osita: 317 },
      nacio: '2024-11-23',
      hora: '21:46',
      acuño: 'osita',
      ultima: '2026-08-09',
      formas: [
        { forma: 'sipiripi', veces: 332 },
        { forma: 'sipiripiripi', veces: 1 },
      ],
    },
  },
  {
    id: 'sona-con-los-angelitos',
    palabra: 'soñá con los angelitos',
    alfabetiza: 'soñá con los angelitos',
    tipo: 'fórmula de despedida, de él',
    definicion:
      'Cómo se dice buenas noches en esta casa. No la inventó él: se la decía su mamá desde chiquito, y su abuela antes que ella. Pasarla adelante es la manera que encontró de darle algo que ya venía de antes.',
    acepciones: [
      '206 de 208 veces la dijo él: es, literalmente, lo último que ella lee casi todas las noches desde diciembre de 2024. La despedida de ella es otra — «me dormiré», 545 veces, 510 suyas.',
    ],
    cifrada: true,
    datos: {
      veces: 208,
      reparto: { osito: 206, osita: 2 },
      nacio: '2024-12-17',
      hora: '01:07',
      acuño: 'osito',
      ultima: '2026-08-12',
    },
  },
  {
    id: 'testrano',
    palabra: 'testraño',
    tipo: 'v.',
    definicion:
      'Te extraño, escrito mal a propósito. No es un dedazo: a los dos les gusta el español y lo cuidan, así que la falta está puesta a mano. Son pocas veces, pero repartidas a lo largo de año y medio.',
    acepciones: ['Su forma completa es «testraño musho», y esa sí es la máxima intensidad.'],
    cifrada: true,
    datos: {
      veces: 7,
      reparto: { osito: 7, osita: 0 },
      nacio: '2024-10-11',
      hora: '19:15',
      acuño: 'osito',
      ultima: '2026-01-19',
    },
  },
  {
    id: 'yaya',
    palabra: 'yaya · yayaya',
    tipo: 'interj.',
    definicion:
      'Ya entendí. La misma palabra repartida en dos: él la dice con dos sílabas y casi siempre detrás de un «ahh»; ella con tres o con cuatro. En dos años no se cruzaron nunca.',
    acepciones: ['yaya — de él: 178 de 200 veces. yayaya — de ella: 282 de 283.'],
    margen: 'cada uno con la suya',
    datos: {
      veces: 483,
      reparto: { osito: 179, osita: 304 },
      nacio: '2024-08-28',
      hora: '20:45',
      acuño: 'osito',
      ultima: '2026-08-07',
      formas: [
        { forma: 'yayaya', veces: 231 },
        { forma: 'yaya', veces: 200 },
        { forma: 'yayayaya', veces: 50 },
      ],
    },
  },
]
