import type { CapituloEscrito } from '@/types'

/**
 * A la luna, a pasitos de tortuga.
 *
 * ══════════════════════════════════════════════════════════════
 *  ESTE ARCHIVO ES TUYO. Son los números del juego y los textos
 *  de pantalla. Cambiá lo que querás y recargá: no hay lógica
 *  aquí adentro, así que no se puede romper nada.
 * ══════════════════════════════════════════════════════════════
 *
 * Cómo se juega: la tortuga camina sola de un lado a otro. Apretás
 * la pantalla y se detiene mientras se llena la barra; al soltar
 * sale disparada hacia donde venía caminando. Dos decisiones con un
 * solo dedo: cuándo y con cuánta fuerza.
 *
 * Todo se mide en un mundo imaginario de 360 de ancho por 640 de
 * alto, que después se estira al alto del teléfono. Así los números
 * significan lo mismo en cualquier pantalla.
 */

/** El tamaño del mundo imaginario. Mejor no tocarlo. */
export const MUNDO = {
  ancho: 360,
  alto: 640,
}

/**
 * El salto. Estos seis números son el juego entero: si saltar se
 * siente mal, se arregla aquí y en ningún otro lado.
 */
export const SALTO = {
  /** Cuánto tira la gravedad hacia abajo. Más = cae más pesado. */
  gravedad: 2200,

  /** Fuerza del salto más flojo, apenas tocando la pantalla. */
  impulsoMinimo: 540,

  /**
   * Fuerza del salto a barra llena.
   *
   * El plan traía 700 y 1400, tanteados a ojo. Midiéndolo con
   * `npm run luna:probar` resultó que con 1400 el salto largo avanza
   * 671 px de lado, y el mundo mide 360 de ancho: se pasaba de pared
   * a pared. Con 930 el salto más largo avanza unos 300 y sube unos
   * 160, que entra bien en la pantalla.
   */
  impulsoMaximo: 930,

  /**
   * Qué tan empinado sale, en grados. 90 sería recto para arriba y
   * 0 sería rasante. 65 es un buen salto de plataformas: sube y
   * avanza parecido.
   */
  angulo: 65,

  /**
   * Cuánto tarda la barra en llenarse, en milisegundos. Más alto
   * la vuelve más fácil de medir; más bajo, más nerviosa.
   */
  msDeCarga: 900,

  /**
   * El perdón del borde. Si se pasa de la orilla caminando, todavía
   * puede saltar durante estos milisegundos. Sin esto, los saltos
   * desde la punta se sienten robados.
   */
  msDePerdon: 90,
}

/**
 * El cansancio.
 *
 * Aguantar la barra llena esperando el momento perfecto no puede salir
 * gratis: si se queda apretado demasiado, la tortuga se agota, se
 * desmaya con sus estrellitas dando vueltas y hay que esperar a que se
 * levante. Pierde el salto.
 *
 * Avisa antes de que pase: la barra se pone roja y ella tiembla más.
 * Un castigo que no se ve venir no se aprende, solo enoja.
 */
export const CANSANCIO = {
  /** Desde que empieza a cargar hasta que se desmaya. */
  msDeAguante: 2100,

  /** Cuánto antes del desmayo empieza a avisar. */
  msDeAviso: 550,

  /** Cuánto se queda tirada antes de volver a caminar. */
  msTirada: 1300,
}

/**
 * Caerse.
 *
 * Bajar del último lazo que pisó cuenta como caída, aunque haya
 * quedado parada en una plataforma de más abajo. Es lo que hace que
 * los lazos sirvan de algo: como la pista de abajo sigue estando ahí,
 * si no fuera por esta regla errar un salto costaría nada más volver
 * a subir dos escalones.
 */
export const CAIDA = {
  /** Cuánto puede bajar del último lazo antes de que cuente. */
  margenBajoElLazo: 24,
}

/** La tortuga: cómo camina y cuánto ocupa. */
export const TORTUGA = {
  /** Velocidad de la caminata. Es el reloj del juego. */
  velocidad: 55,

  /** Lo que ocupa de ancho parada. Es lo que se usa para saber
   *  hasta dónde puede caminar antes de la orilla. */
  ancho: 30,

  /**
   * Del suelo a la coronilla. Va parada en dos patas.
   *
   * Este número la agranda o la achica entera, con todo su dibujo.
   * Con 38 se veía correcta en la computadora y diminuta en el
   * teléfono, y ella es el personaje que hay que mirar todo el rato.
   */
  alto: 50,
}

/**
 * La pista que se borra, que es la traba del capítulo de Boo.
 *
 * En cuanto despega de un tramo, ese tramo empieza a irse. No hay
 * vuelta atrás: lo que pisó, se borra. Es su frase de la esquina
 * hecha mecánica.
 *
 * No se borra nada hasta pasada la primera estrella. Los primeros
 * saltos son para aprender y aprender con el suelo desapareciendo no
 * se puede. Y al volver a una estrella después de caerse, la pista de
 * arriba vuelve entera: si no, la caída sería el final de la partida.
 *
 * Y se va poniendo más difícil: cada estrella que pisa le quita tiempo
 * a la pista, así que el último tramo del capítulo se borra a menos de
 * la mitad de lo que tardaba el primero.
 */
export const PISTA = {
  /** Desde que despega hasta que ese tramo ya no está, al principio. */
  msParaIrse: 2600,

  /** Cuánto tiempo menos dura la pista con cada estrella pisada. */
  msMenosPorEstrella: 380,

  /** Por apurada que se ponga, nunca se va más rápido que esto. */
  msMinimo: 1100,

  /** Cuánto antes de irse empieza a parpadear. */
  msDeAviso: 1200,
}

/**
 * Las cajas que ceden, que es la traba del capítulo de Ovi.
 *
 * Una pila de cajas de cartón no es una tabla atornillada: si te
 * parás en la orilla, se va para ese lado. Aquí es un balancín que
 * pivota en el medio, así que aterrizar a la derecha hunde la derecha
 * y **levanta la izquierda**, y el salto siguiente sale desde otra
 * altura. Aterrizar bien deja de ser llegar: es llegar *a un sitio*.
 *
 * No ceden todas. El suelo, las estrellas y los tramos de impulso van
 * firmes por regla: la estrella tiene que ser el sitio donde se
 * respira, y un tramo de impulso que se moviera arruinaría lo único
 * que el juego promete que sale siempre igual.
 */
export const CAJAS = {
  /**
   * Cuánto baja la punta de la caja con la inclinación al tope, en
   * unidades del mundo.
   *
   * **No es lo que se hunde ella.** La caja es un balancín, así que
   * el punto donde está parada baja `cede` por su distancia al medio
   * *dos veces*: una porque el peso ahí inclina más, y otra porque un
   * punto más lejos del pivote baja más. Y encima la tortuga nunca
   * llega al borde de verdad, que se le acaba el suelo a media
   * tortuga de la punta.
   *
   * En números: en una caja de 100 de ancho, lo más orillada que
   * puede estar es al 70% del semiancho, y ahí se hunde 15 × 0,7² ≈
   * 7 px. Eso es lo que se siente al saltar. Los 15 son lo que se ve
   * en el dibujo, que son unos 12 grados de inclinación.
   *
   * Se probó con 7 y la traba no existía: la caja se movía en
   * pantalla pero el salto salía igual, porque lo que llegaba al
   * juego eran tres píxeles y medio.
   */
  cede: 15,

  /**
   * Cuánto tarda en irse del todo hacia el lado donde está parada.
   * Corto: es peso, no un motor.
   */
  msParaCeder: 260,

  /**
   * Y cuánto tarda en volver a quedar derecha después de que se fue.
   * Más lento que lo anterior, porque volver a su sitio es lo que
   * hace la caja sola y ceder lo hace empujada.
   */
  msParaEnderezar: 520,
}

/**
 * La caja forrada de cinta, que es lo que complica el capítulo de Ovi.
 *
 * Alguien la envolvió entera y quedó lisa. Caminando por encima no
 * pasa nada: las paticas agarran. **Parada cargando la barra sí**: se
 * va resbalando hacia el lado que la caja está bajando, y como la caja
 * cede hacia donde ella está, cuanto más aguanta más se inclina y más
 * rápido se va, hasta quedarse en la punta.
 *
 * No la tira: se para en la orilla, igual que caminando. Al principio
 * sí la tiraba y era demasiado, porque con la carga que hace falta
 * para un salto normal ya se caía sola: la caja no era difícil, era
 * una trampa. El castigo es quedarse donde no querías, y como la
 * punta está hundida por el balancín, el salto sale corto y del lado
 * equivocado. Descoloca, no mata.
 *
 * Es la traba de Boo mirada por el otro lado. Allá el tramo se borra y
 * te apura por tiempo; acá la caja te va corriendo y te apura por
 * sitio. Y ataca la barra, que es lo único que este juego tiene.
 *
 * Lo mejor que hace es que **refuerza la lección del capítulo**. En el
 * medio de la caja no hay cuesta, así que el medio es el único sitio
 * donde se puede cargar tranquila — y es también el único desde donde
 * el salto sale a su altura entera, porque el balancín no la hunde.
 * Dos reglas distintas que enseñan lo mismo.
 */
export const CINTA = {
  /**
   * Cuánto la corre por segundo con la caja del todo inclinada,
   * mientras carga.
   *
   * En la orilla la inclinación anda por 0,7, así que son unos 39 px
   * por segundo de verdad: cargar medio salto ya la lleva a la punta y
   * la deja ahí. Con 20 no se sentía nada.
   */
  arrastre: 55,
}

/**
 * La caja abierta y rebosante de peluches viejos, que es lo que le da
 * sazón al capítulo de Ovi. De una caja así salió Ovi.
 *
 * Caer ahí no la para: la devuelve para arriba con parte de lo que
 * traía y hacia donde iba. Se agota sola, y sin guardar nada, porque
 * cada rebote sale del anterior: tres o cuatro y se queda quieta.
 *
 * No es el tramo de impulso de Boo con otro traje. Aquel centra a la
 * tortuga y la lanza siempre igual, así que es un regalo del camino y
 * el destino se puede poner al píxel. Este depende de cómo entres:
 * cayendo de alto rebota alto, cayendo flojo rebota poco, y si venías
 * rasante seguís yendo para allá. Es habilidad y no regalo.
 *
 * Tampoco cuenta como pasito, que no gastó barra.
 */
export const PELUCHES = {
  /** Qué parte de la velocidad de caída devuelve. */
  devuelve: 0.78,

  /**
   * Lo mínimo que devuelve **la primera vez que la toca**, caiga como
   * caiga.
   *
   * Sin esto la caja no servía de nada en el camino normal: llegando a
   * una plataforma que está más arriba se aterriza casi sin velocidad
   * de bajada, así que devolver una parte de casi nada era casi nada.
   * Con el piso, tocarla siempre regala un empujón de unos 50 px, que
   * es medio salto sin gastar barra ni pasito.
   *
   * Solo en la primera: los rebotes siguientes salen del anterior y
   * por eso se van apagando hasta que se queda quieta.
   */
  piso: 480,

  /** Por fuerte que caiga, nunca rebota más que esto. */
  tope: 780,

  /**
   * Por debajo de esto ya no rebota y se queda parada. Es lo que hace
   * que se agote sola en vez de quedarse botando para siempre.
   */
  minimo: 300,

  /**
   * Y lo que le queda del avance de lado en cada rebote.
   *
   * Poco a propósito: un montón de peluches se traga lo que llevabas
   * de lado y te devuelve casi para arriba. Con 0,86 la caja era un
   * cañón: entrabas rasante y te disparaba fuera de la pantalla.
   */
  frena: 0.4,

  /**
   * Desde qué parte de la caja el montón hace de cuenco, contado
   * desde el medio: en la mitad de afuera, un rebote que iba hacia
   * la orilla sale devuelto hacia el centro.
   *
   * Es lo que convierte la caja en una red de verdad. Frenando el
   * avance y nada más, cada bote la corría un poco hacia el mismo
   * lado y al tercero se salía: casi una de cada cuatro entradas
   * acababa en caída, y una red que te tira es peor que no tener red.
   * Y no es magia: un montón de peluches es un cuenco, se hunde en el
   * medio y sube en los bordes.
   */
  orilla: 0.55,
}

/**
 * Las almohadas que se hunden, que es la traba del capítulo de Nico.
 *
 * Una almohada no es una tabla: aguanta un rato y se va rindiendo bajo
 * el peso. Mientras la tortuga está apoyada, la almohada baja; en
 * cuanto despega, vuelve a inflarse sola, más despacio de lo que se
 * hundió.
 *
 * Es la traba que ataca la mecánica central del juego, y por eso este
 * capítulo va al final. Aquí **esperar cuesta**. En los otros dos, una
 * plataforma es un sitio donde pensar: la tortuga va y viene, se la
 * deja pasar de largo dos veces y se salta en la pasada buena, con la
 * carga buena, sin que eso valga nada. Sobre una almohada esa
 * comodidad tiene precio. Cada vuelta de la caminata que se deja
 * pasar, y cada milisegundo de barra, sale de la altura del salto
 * siguiente.
 *
 * De ahí la decisión que el capítulo pide todo el rato: **el salto
 * seguro o el salto bueno**. Salir ya, desde arriba, aunque no sea el
 * punto ideal ni la carga ideal; o esperar la pasada buena y salir
 * desde más abajo.
 *
 * Y de paso da vuelta una costumbre de los otros dos capítulos: aquí
 * una plataforma ancha es peor que una angosta, porque una ancha son
 * más segundos de caminata para volver al punto de salida.
 *
 * No la traga y no la tira. Al llegar al fondo se queda ahí: el
 * castigo es haber perdido la altura, y con eso alcanza. Una regla que
 * castiga no puede castigar dos veces — eso ya lo enseñó la caja
 * forrada de cinta, que empezó tirando a la tortuga y era una trampa.
 *
 * No se hunden todas. El suelo, las estrellas y los tramos de impulso
 * van firmes por la misma regla que en el cuarto de Ovi: la estrella
 * tiene que ser el sitio donde se respira.
 */
export const ALMOHADAS = {
  /**
   * Cuánto baja la almohada del todo hundida, en unidades del mundo.
   *
   * A barra llena la tortuga sube 161 px desde el suelo firme; desde
   * el fondo de una almohada, 127. Esos 34 son la diferencia entre
   * pasar un tramo de 140 y quedarse corta, que es exactamente lo que
   * se está pidiendo decidir.
   */
  seHunde: 34,

  /**
   * Cuánto tarda en llegar al fondo, apoyada encima.
   *
   * Va **a ritmo parejo** y no frenando al final como las cajas de
   * Ovi. La caja se asienta y se acabó; la almohada tiene que decir
   * «seguís bajando» todo el rato, porque lo que enseña es que el
   * tiempo cuesta.
   *
   * Y va lento a propósito. Con 1600 ms una vuelta de la caminata la
   * hundía entera y ya no había nada que decidir: todos los saltos
   * salían del fondo. Con 3600, aterrizar y salir en seguida no cuesta
   * casi nada, dejar pasar una vuelta cuesta unos 20 px, y quedarse a
   * mirar cuesta los 34. Llenar la barra entera, por su cuenta, cuesta
   * 8: la barra pesa, pero lo que de verdad se paga es la espera.
   */
  msParaElFondo: 3600,

  /**
   * Y cuánto tarda en volver a estar entera, ya sin nadie encima.
   *
   * Más lento que hundirse, como cualquier cosa blanda. Y a propósito
   * más lento todavía que eso: volver a caer en una almohada que
   * acaba de pisar la encuentra a medio inflar, así que rebotar entre
   * dos no sirve para descansar.
   */
  msParaInflarse: 2400,
}

/**
 * Las cobijas enredadas, entre las almohadas de Nico.
 *
 * La almohada cobra por esperar. La cobija cobra por apurarse: parada
 * encima de una, la barra se llena más lento —primero hay que
 * desenredarse para tomar impulso— y el aguante antes del desmayo no
 * cambia ni un milisegundo.
 *
 * Sale la cuenta: llegar al tope desde una cobija son 1500 ms de los
 * 2100 que aguanta, y el aviso rojo empieza a los 1550. La barra llena
 * y la barra en rojo llegan casi juntas, y eso es todo el asunto: un
 * salto entero desde una cobija se paga mirando cómo se pone roja. Y
 * mientras tanto la cobija se hunde igual que una almohada, así que la
 * altura que se gana cargando se va yendo por abajo.
 *
 * **La regla de las cobijas:** ninguna va justo antes de un hueco
 * marcado `aPrisa`. Ese hueco pide salir en la pasada en que se
 * llegó, y la cobija pide cargar largo; juntas piden dos cosas que se
 * contradicen, y eso ya no es difícil, es injusto. Es la misma
 * lección que dejaron las cajas forradas y los huecos al tope en el
 * cuarto de Ovi. El probador la comprueba.
 */
export const COBIJAS = {
  /**
   * Cuánto tarda la barra en llenarse parada en una cobija, en
   * milisegundos. En cualquier otro sitio tarda `SALTO.msDeCarga`.
   *
   * De dónde sale: con 1200 quedarían 900 ms de aguante de los 1200
   * de siempre, o sea la cobija sin cobija. Con 1800 quedarían 300, y
   * el aviso rojo empezaría 250 ms antes de que la barra llegue al
   * tope: eso ya no es una decisión, es una prohibición con adorno.
   */
  msDeCarga: 1500,
}

/**
 * Lo que cae, que es la única traba de los tres capítulos.
 *
 * Cada tanto se cae algo de arriba. Si le pega a la tortuga, le
 * descompone **la barra** durante los saltos siguientes; si no le pega,
 * no pasó nada. Son dos cosas y las dos son la misma regla — lo que
 * cae, cae contra tu barra — porque cada regla de más es una regla que
 * explicar en un regalo que se juega una vez, y con dos que se explican
 * solas alcanza:
 *
 * - **El apurón** se la desboca: se llena a toda prisa y **no se queda
 *   en el tope**, se pasa y vuelve a cero. Le quita el control.
 * - **El apagón** se la apaga: la barra deja de verse. No cambia ni un
 *   número, le quita la información. Y no deja a ciegas — la tortuga
 *   tiembla más cuanto más llena está, así que se puede seguir midiendo
 *   mirándola a ella, que es de lo que se trata.
 *
 * **No se esquiva con un gesto nuevo.** La tortuga camina sola y se
 * queda quieta mientras carga, así que quitarse de abajo es decidir
 * cuándo cargar y cuándo dejarla andar — el único gesto que este juego
 * tiene. Por eso esto no es un poder de los que se tiraron: no hay nada
 * que aprender a usar, solo algo que ver venir.
 *
 * Y se ve venir de verdad: cae despacio, desde más arriba del borde de
 * la pantalla, y se deshace contra cualquier plataforma. O sea que el
 * nivel protege, y meterse debajo de algo es una decisión.
 */
export const LO_QUE_CAE = {
  /**
   * Cada cuánto cae uno, en segundos, entre estos dos. Nunca dos
   * juntos: lo que se está pidiendo es que se vea venir, y dos a la vez
   * es una lluvia de la que no se puede salir.
   *
   * Empezó en 7 a 12 y era demasiado poco: en una subida entera caían
   * tres o cuatro y le pegaban una vez, o ninguna.
   *
   * Y ojo con cómo se mide esto. El robot del arnés termina el
   * capítulo en un minuto, y ella va a tardar varios: cuenta lo que
   * pasa **por minuto**, no por subida, o se calibra para un jugador
   * que no existe. Con 5 a 9 caen unos ocho por minuto y le pegan
   * entre uno y tres, que es lo que se buscaba. En 2,5 a 5 —que era
   * lo que hacía falta para que el robot notara algo— a ella le
   * lloverían dieciséis por minuto.
   */
  cadaDesde: 5,
  cadaHasta: 9,

  /**
   * Lo rápido que baja, en píxeles del mundo por segundo.
   *
   * Aparece por encima del borde de arriba y la tortuga anda por el
   * 62 % de la pantalla, o sea unos 400 px más abajo. A 190 eso son
   * poco más de dos segundos de verlo bajar, y la caminata entera de un
   * lado al otro de una plataforma ancha son tres. Alcanza de sobra
   * para quitarse sin correr, que es lo único que hay que garantizar.
   *
   * Empezó en 105, que daban cinco segundos, y era **demasiado
   * tiempo**: en cinco segundos ella da dos o tres saltos, así que lo
   * que salía apuntando a 54 px de ella pasaba por su altura a 111,
   * 273 y 137. Un objeto que tarda más en llegar que ella en irse no
   * amenaza nada. Lo lento no era generoso, era inofensivo.
   */
  velocidad: 190,

  /**
   * Lo que mide de ancho. La tortuga mide 30.
   *
   * Es también su caja: lo que cae le pega cuando este cuadrado toca a
   * la tortuga, así que agrandarlo lo hace más vistoso **y** más
   * certero. Los dos a la vez, y por eso se mide con el arnés cada vez
   * que se toca.
   */
  ancho: 30,

  /**
   * Cuántos saltos dura el efecto.
   *
   * Tres es lo que hay entre dos estrellas en el tramo más corto: dura
   * lo suficiente para que se sienta y se acaba antes de poder costar
   * una caída entera.
   *
   * Y **hay que gastarlos**: caerse no lo quita. Al principio sí lo
   * quitaba, y con eso tirarse al vacío pasaba a ser la forma barata de
   * limpiárselo — el juego premiando lo único que castiga. Lo que sí se
   * va al caerse es lo que estuviera bajando en ese momento, que eso sí
   * sería una trampa puesta mientras ella no miraba.
   */
  saltosDeEfecto: 3,

  /**
   * Lo que tarda la barra desbocada en dar una vuelta entera, en
   * milisegundos. Normal son 900.
   *
   * Con 320 la vuelta completa entra tres veces en lo que se aguanta
   * sin desmayarse, así que el salto que se quiere sigue estando —
   * hay que agarrarlo al pasar en vez de esperarlo arriba. Con 150 era
   * puro azar, y el azar no es dificultad.
   */
  msDeCargaDesbocada: 320,

  /**
   * No cae nada hasta pasada la primera estrella de cada capítulo.
   *
   * La misma regla que la pista que se borra en el capítulo de Boo: los
   * primeros saltos son para aprender, y aprender con cosas cayendo
   * encima no se puede.
   */
  desdeLaPrimeraEstrella: true,
}

/**
 * Los tramos de impulso: al caer ahí sale disparada sola, sin dedo.
 *
 * La tortuga se centra en el tramo antes de salir, así que el salto
 * es siempre el mismo y el destino se puede poner con precisión. Sirve
 * para enseñarle qué se siente un salto largo sin explicárselo.
 */
export const IMPULSO = {
  /** La fuerza del lanzamiento. La de la barra llena. */
  fuerza: 930,
}

/**
 * La luna, que es a donde se va.
 *
 * No está pegada a la pantalla todo el rato: llena y grande arriba a
 * un lado, se comía la pantalla y no dejaba mirar los saltos. Ahora
 * sale en una cinemática al empezar el capítulo, se va para arriba, y
 * está esperando de verdad arriba del último tramo. Al llegar se va
 * otra vez, y esa es la excusa para el capítulo siguiente.
 */
export const LUNA = {
  /** Su tamaño mientras espera arriba, en el primer capítulo. */
  radio: 44,

  /**
   * Y cuánto crece por cada capítulo que se sube.
   *
   * Es la única forma de que subir tres capítulos se sienta como
   * acercarse a algo: dentro de un capítulo la luna se acerca sola
   * porque vive en el mundo, pero al empezar el siguiente volvía a
   * estar igual de lejos que al principio de todo. En el cuarto de
   * Nico se ve casi la mitad más grande que en el de Boo, que es
   * exactamente lo que él le dice en la presentación.
   */
  crecePorCapitulo: 9,

  /** Cuánto más arriba de la última plataforma está. */
  sobreLaCima: 165,

  /** Lo que dura la cinemática de entrada. Un toque se la salta. */
  msDeEntrada: 3000,

  /** Lo que dura la de irse, al llegar arriba. */
  msDeSalida: 2600,
}

/**
 * La llegada, que pasa una sola vez: al ganar el último capítulo.
 *
 * En los tres capítulos la luna se escapa cuando ella alcanza la cima
 * — sube y se va, y eso es lo que hace que haya un capítulo siguiente.
 * Esta vez no se escapa. El último salto no cae: sale de la cima y
 * sigue subiendo, y la cámara la sigue mientras el mundo se queda
 * abajo.
 *
 * Los tiempos van en fracciones de la cinemática entera y no en
 * milisegundos sueltos, porque lo que importa es el orden: primero
 * sube, después se posa, después se sienta, y al final se abre la
 * cámara. Cambiando `ms` se estira o se acorta todo junto sin que se
 * descuadre ninguna de las cuatro.
 */
export const LLEGADA = {
  /** Lo que dura entera. No se puede saltar: es lo que vino a ver. */
  ms: 9000,

  /** Hasta acá va subiendo. Es más de la mitad porque es el viaje. */
  sube: 0.52,
  /** Se queda un momento parada encima, y acá empieza a sentarse. */
  sentandose: 0.7,
  /** Ya está sentada, y ahí es donde la cámara empieza a abrirse. */
  sentada: 0.8,

  /**
   * Cuánto se aleja la luna mientras ella sube, en píxeles del mundo.
   *
   * La luna espera a 165 de la cima, que caminando es nada: sin esto,
   * el viaje se acabaría en medio segundo. Se va yendo hacia arriba
   * mientras ella sube, cada vez más despacio, y ella la alcanza. Es
   * lo mismo que hace en los tres capítulos, solo que esta vez se
   * cansa antes que la tortuga.
   */
  seAleja: 1500,

  /**
   * De qué tamaño se ve al llegar. En el capítulo de Nico se ve a 62
   * de radio; acá termina más del triple, que es lo que hace que la
   * última parte sea un suelo y no un punto de luz.
   *
   * Estuvo en 240 y era demasiado: al llegar, la luna era más ancha
   * que la pantalla y se leía como una pared blanca con la punta
   * redondeada. Tiene que seguir cabiendo entera mientras ella se
   * para encima, porque si no, lo que se entiende recién al abrirse
   * la cámara es adónde llegó — y eso hay que saberlo al llegar.
   */
  radioAlLlegar: 198,

  /** Cuánto se hunde en la luna al pararse encima. */
  seHunde: 3,

  /**
   * Cuánto se aleja la cámara al final, de 1 (pegada) a esto. La luna
   * entera, chiquita ella encima, y todo lo demás cielo.
   */
  seAbre: 0.33,

  /**
   * Las estrellitas de papel que se van quedando atrás mientras sube.
   *
   * Son las del frasco y las de los puntos de guardado: lo único que
   * se repite en los tres mundos. Acá no se pisan ni guardan nada —
   * ya no hay dónde caerse— y son las que miden el camino recorrido,
   * que es para lo que sirvieron todo el juego. Se quedan colgadas
   * donde están y ella las va pasando: eso es lo que las hace medir
   * algo. Corriéndolas a otra velocidad se volvían decoración.
   */
  estrellitas: 18,
}

/**
 * ══════════════════════════════════════════════════════════════
 *  LOS CAPÍTULOS
 * ══════════════════════════════════════════════════════════════
 *
 * Cada línea de `plataformas` es un tramo del camino:
 *
 *   x        dónde empieza, de 0 (orilla izquierda) a 360 (derecha)
 *   ancho    cuánto mide
 *   altura   a qué altura está, contando desde el suelo. 0 es el
 *            suelo mismo y los números crecen hacia arriba
 *   hito     si es un lazo, o sea un punto de guardado
 *   impulso  'derecha' o 'izquierda' si es un tramo de impulso
 *   enreda   si es una cobija de las de Nico, donde la barra carga
 *            más lento
 *
 * Para tantear: el salto más flojo avanza unos 95 y sube unos 50, el
 * más fuerte avanza unos 290 y sube unos 155. O sea que **dos
 * plataformas nunca deberían estar a más de 150 de altura una de
 * otra**, y conviene dejarlas más cerca que eso.
 *
 * **Cada capítulo guarda menos que el anterior.** Boo tiene cinco
 * estrellas, Ovi cuatro y Nico tres, y en los tres la cima es una de
 * ellas. No es un número suelto: la estrella va firme siempre, así que
 * quitar una no alarga solo el trecho que hay que rehacer al caerse —
 * también convierte ese descanso en una caja que cede o en una
 * almohada que se hunde. El probador comprueba la cuenta.
 *
 * Antes de dar por bueno un cambio, comprobalo sin abrir el navegador:
 *
 *   npm run luna:probar
 *
 * Prueba cada salto de cada capítulo con todas las fuerzas de la barra
 * y avisa si algún tramo no se puede pasar. `npm run luna:mapa` dice a
 * qué distancias se puede aterrizar según lo que haya que subir.
 */

/** El capítulo uno: la pista de Hot Wheels y el bambú. */
const BOO: CapituloEscrito = {
  id: 'boo',
  nombre: 'Boo',
  numero: 1,
  material: 'pista',
  seDesvanece: true,
  cede: false,
  seHunde: false,
  presentacion: {
    titulo: 'Capítulo uno: Boo',
    texto: [
      'Boo llegó en diciembre, en el arreglo de Hot Wheels que me regalaste. Esa misma noche te dije que me iba a dormir con él, y diez días después todavía olía a vos.',
      'Su mundo es de pista naranja y de bambú, que de ahí le viene el nombre. Y la pista se borra detrás porque él dice que estuvo en casi todas nuestras fechas y que nadie le tomó fotos. Lo que pisás acá, se va.',
    ],
    boton: 'subir con Boo',
  },
  cierre: {
    titulo: 'Ganaste a Boo',
    texto:
      'Se te trepa al caparazón y ahí se queda, mirando para abajo lo que subiste. Uno de tres. Los otros dos están más arriba y la luna ya se fue para allá.',
  },

  /**
   * Jugado, no calculado: él lo subió en 24 y sin caerse ni una vez,
   * y lo hizo rebotando contra la pared para subirse a un tramo de
   * arriba en vez de seguir el zigzag.
   *
   * Después salió que 24 es también el mínimo que encuentra
   * `npm run luna:minimos`, o sea que este no se puede superar. Se
   * queda tal cual: es lo que hizo de verdad, y falsearlo hacia
   * arriba para dejarle margen sería regalarle la partida.
   */
  record: 24,
  plataformas: [
    // El suelo, ancho y tranquilo. Aquí se aprende a saltar.
    { x: 30, ancho: 310, altura: 0 },

    // ── Los primeros diez, regalados ──────────────────────────
    // Sube de 70 en 75, plataformas grandes y el zigzag ancho. La
    // pista todavía no se borra: hasta el primer lazo no pasa nada.
    { x: 205, ancho: 125, altura: 70 },
    { x: 40, ancho: 125, altura: 145 },
    { x: 200, ancho: 120, altura: 220 },
    { x: 45, ancho: 120, altura: 292 },
    { x: 205, ancho: 115, altura: 367 },
    { x: 40, ancho: 115, altura: 440 },
    { x: 205, ancho: 115, altura: 515 },
    { x: 45, ancho: 115, altura: 590 },
    { x: 200, ancho: 120, altura: 663 },
    { x: 35, ancho: 140, altura: 740, hito: true },

    // ── Desde aquí la pista se borra ──────────────────────────
    // Sube de 88 en 90 y las plataformas se achican. A mitad de
    // tramo, el primer impulso: se cae ahí y sale sola.
    { x: 210, ancho: 105, altura: 830 },
    { x: 45, ancho: 105, altura: 920 },
    { x: 215, ancho: 100, altura: 1008 },
    { x: 40, ancho: 110, altura: 1098, impulso: 'derecha' },
    { x: 230, ancho: 115, altura: 1238 },
    { x: 35, ancho: 130, altura: 1330, hito: true },

    // ── El tramo desparejo ────────────────────────────────────
    // Aquí se deja de poder repetir la misma carga: una sube 110 y
    // la siguiente 60, y hay una en el medio del mundo que obliga a
    // esperar a que la tortuga se dé la vuelta.
    { x: 215, ancho: 100, altura: 1440 },
    { x: 90, ancho: 95, altura: 1500 },
    { x: 225, ancho: 95, altura: 1595 },
    { x: 50, ancho: 100, altura: 1690 },
    { x: 185, ancho: 135, altura: 1780, hito: true },

    // ── Ya pesa ───────────────────────────────────────────────
    // De 100 a 110 y las plataformas más chicas hasta aquí.
    { x: 35, ancho: 95, altura: 1885 },
    { x: 145, ancho: 100, altura: 1985 },
    { x: 35, ancho: 115, altura: 2085 },
    { x: 220, ancho: 90, altura: 2200 },
    { x: 50, ancho: 90, altura: 2310 },
    { x: 180, ancho: 130, altura: 2415, hito: true },

    // ── El último trecho hasta la luna ────────────────────────
    // Y un impulso de regalo antes del final, que deja la cima a
    // tiro sin pedir puntería.
    { x: 40, ancho: 85, altura: 2525 },
    { x: 220, ancho: 85, altura: 2635 },
    { x: 45, ancho: 100, altura: 2745, impulso: 'derecha' },

    // La cima. Aquí, en el juego entero, está la carta. Va ancha a
    // propósito: el último salto antes del premio no es el sitio
    // para pedir puntería, y encima llega en volandas.
    { x: 195, ancho: 150, altura: 2885, hito: true },
  ],
}

/** El capítulo dos: el cuarto de las cajas de donde salió Ovi. */
const OVI: CapituloEscrito = {
  id: 'ovi',
  nombre: 'Ovi',
  numero: 2,
  material: 'cajas',
  seDesvanece: false,
  cede: true,
  seHunde: false,
  presentacion: {
    titulo: 'Capítulo dos: Ovi',
    texto: [
      'Ovi estaba en una caja de peluches viejos, con otros que llevaban años ahí metidos, y se vino conmigo ese mismo día. Todo rosa pastel y con esos brazos de gimnasio que tiene. Todavía no entiendo cómo nadie lo había sacado antes.',
      'Su mundo es el cuarto de donde salió: cajas apiladas y cinta de embalaje, con rótulos que nadie volvió a leer. Y las cajas ceden. Se van para el lado donde te parás, así que dónde caés decide desde qué altura sale el salto siguiente. No basta con caer en la caja, importa en qué parte de la caja caés.',
      'Dos cosas más, y las dos se aprenden de un susto. Las cajas envueltas en cinta no agarran. Si te quedás cargando encima, te van corriendo hasta la orilla. Y la que está llena de peluches viejos no te para. Te devuelve.',
    ],
    boton: 'subir con Ovi',
  },
  cierre: {
    titulo: 'Ganaste a Ovi',
    texto:
      'Se sube al caparazón y se acomoda al lado de Boo, que ya venía ahí. Dos de tres. El que falta es el más viejo de los tres y está todavía más arriba.',
  },

  /**
   * El mínimo que encuentra `npm run luna:minimos`, contando los
   * rebotes contra la pared y las cajas de peluches, que devuelven
   * medio salto sin gastar pasito.
   *
   * Va el mínimo a propósito: este capítulo se puede empatar y no se
   * puede ganar. El buscador se cree porque en el de Boo saca 24, que
   * es exactamente lo que él hizo jugando.
   */
  record: 30,
  plataformas: [
    // El suelo del cuarto, que es la única caja de verdad ancha. Aquí
    // no cede nada: la primera de todas va firme por regla.
    { x: 25, ancho: 315, altura: 0 },

    // ── Las cajas se presentan ────────────────────────────────
    // Sube de 78 en 83 y las cajas van anchas. La subida es más
    // fácil que la de Boo a propósito: lo nuevo que hay que
    // aprender aquí no es el salto, es que el suelo se mueve.
    { x: 200, ancho: 130, altura: 78 },
    { x: 40, ancho: 130, altura: 158 },
    { x: 195, ancho: 125, altura: 240 },
    { x: 45, ancho: 125, altura: 322 },
    { x: 200, ancho: 120, altura: 405 },
    { x: 40, ancho: 120, altura: 488 },
    { x: 190, ancho: 140, altura: 570, hito: true },

    // ── Y ahora sí ────────────────────────────────────────────
    // Se achican y suben de 92 en 100. Aquí aparece la primera caja
    // forrada de cinta, y va sola en medio de cajas normales para
    // que se note la diferencia. Al final del tramo, el primer hueco
    // que solo se pasa con la barra al tope: se llega corta dos
    // veces, y a la tercera se entiende que hay cargas que no se
    // pueden medir a ojo, hay que irse hasta el fondo.
    //
    // **La regla de las forradas:** la plataforma que viene después
    // de una va veinte o treinta más ancha que sus vecinas, y ninguna
    // forrada va justo antes de un hueco al tope. La cinta ya pide
    // decidir dónde pararse y cuánto aguantar; si encima el destino
    // pide puntería al píxel, el tramo deja de ser difícil y pasa a
    // ser injusto. Se probó con las dos cosas juntas y ni el robot
    // del probador salía de ahí.
    { x: 45, ancho: 110, altura: 662 },
    { x: 210, ancho: 105, altura: 755 },
    { x: 50, ancho: 105, altura: 848, resbala: true },
    { x: 200, ancho: 130, altura: 945 },
    { x: 60, ancho: 100, altura: 1089, alTope: true },
    { x: 195, ancho: 135, altura: 1170, hito: true },

    // ── La primera caja de peluches, y el tramo desparejo ─────
    // La caja de peluches va ancha y justo encima de la estrella, a
    // propósito por partida doble: de paso regala medio salto, y si
    // se cae de alguno de los tres tramos de arriba aterriza en ella
    // y la devuelve, en vez de irse hasta la estrella. Es la red del
    // capítulo, y viene de donde salió Ovi.
    //
    // Encima, el desparejo: una sube 100 y la siguiente 62, y las de
    // en medio van forradas de cinta. Con el suelo quieto esto era
    // solo cambiar de carga; aquí además hay que elegir dónde
    // pararse, y en las forradas no se puede aguantar.
    { x: 20, ancho: 200, altura: 1230, rebote: true },
    { x: 215, ancho: 110, altura: 1330 },
    { x: 40, ancho: 95, altura: 1394, resbala: true },
    { x: 195, ancho: 120, altura: 1494 },
    { x: 55, ancho: 90, altura: 1556, resbala: true },

    // Acá había una estrella y se le quitó: Ovi guarda una vez menos
    // que Boo. El trecho pasa a ir de 1170 a 2307 de un tirón, o sea
    // el desparejo entero más el segundo hueco al tope. Se puede pedir
    // porque encima de la estrella de abajo está la caja de peluches:
    // lo que se cae de acá rebota en ella y no baja más. Y la caja que
    // servía de descanso ahora cede como las demás.
    { x: 190, ancho: 130, altura: 1656 },

    // ── Ya pesa ───────────────────────────────────────────────
    // Las cajas más chicas del capítulo, dos de ellas forradas, y el
    // segundo hueco al tope, este ya sin aviso ninguno.
    { x: 40, ancho: 90, altura: 1756 },
    { x: 205, ancho: 85, altura: 1860, resbala: true },
    { x: 40, ancho: 115, altura: 1963 },
    { x: 215, ancho: 85, altura: 2068 },
    { x: 40, ancho: 95, altura: 2212, alTope: true },
    { x: 185, ancho: 130, altura: 2307, hito: true },

    // ── El último trecho hasta la luna ────────────────────────
    // Sin regalo de impulso, que ese es de Boo. Lo que hay aquí es la
    // segunda caja de peluches, otra vez encima de la estrella y
    // otra vez de red, y dos forradas en la subida final.
    { x: 140, ancho: 200, altura: 2367, rebote: true },
    { x: 35, ancho: 110, altura: 2467 },
    { x: 205, ancho: 95, altura: 2575, resbala: true },
    { x: 40, ancho: 115, altura: 2680 },
    { x: 200, ancho: 95, altura: 2785, resbala: true },

    // La cima. Ancha, como la de Boo: el último salto antes del
    // premio no es el sitio para pedir puntería.
    { x: 45, ancho: 150, altura: 2890, hito: true },
  ],
}

/** El capítulo tres: la cama deshecha de donde nunca se fue Nico. */
const NICO: CapituloEscrito = {
  id: 'nico',
  nombre: 'Nico',
  numero: 3,
  material: 'almohadas',
  seDesvanece: false,
  cede: false,
  seHunde: true,
  presentacion: {
    titulo: 'Capítulo tres: Nico',
    texto: [
      'Nico es el primero de los tres, el que te compraron para que no durmieras sola. Rosa pálido y de pelo rizado. Va al final porque es el más viejo, y porque es el capítulo que más me costó.',
      'Su mundo es la cama de madrugada, con las sábanas revueltas y las cobijas colgando. Desde acá la luna ya se ve grande.',
      'Y las almohadas se hunden mientras estás parada encima. Despacio, pero sin parar. Cada vuelta que dejás pasar caminando y cada rato que aguantás la barra salen de la altura del salto siguiente. Aquí esperar cuesta.',
      'Algunas de esas cobijas están tiradas entre las almohadas. Parada en una, la barra se llena más lento, porque primero hay que desenredarse. Pero te cansás igual de rápido que siempre, así que el salto entero desde una cobija te llega con la barra ya en rojo. Esperar cuesta y apurarse también.',
    ],
    boton: 'subir con Nico',
  },
  cierre: {
    titulo: 'Ganaste a Nico',
    texto:
      'Se sube al caparazón y se acomoda entre Boo y Ovi, que ya venían ahí. Tres de tres. Arriba ya no queda nada más que la luna.',
  },

  /**
   * El mínimo es 29, y acá va uno más: el último es el único que ella
   * puede ganar, y por un pasito. Después de dos capítulos que como
   * mucho se empatan, el final tiene que dejarse.
   */
  record: 30,
  plataformas: [
    // La cama, ancha y firme. Aquí no se hunde nada: la primera de
    // todas va firme por regla, igual que en los otros dos.
    { x: 25, ancho: 315, altura: 0 },

    // ── Las almohadas se presentan ────────────────────────────
    // Sube de 74 en 78 y van anchas. La subida es floja a propósito:
    // lo que hay que aprender aquí no es el salto, es que el suelo
    // baja mientras una se lo piensa. Y va anchas también a
    // propósito, que es donde más se nota: una almohada ancha son
    // tres segundos de caminata para volver al punto de salida, y
    // esos tres segundos se ven bajar.
    { x: 200, ancho: 135, altura: 74 },
    { x: 40, ancho: 135, altura: 150 },
    { x: 195, ancho: 130, altura: 228 },
    { x: 45, ancho: 130, altura: 306 },
    { x: 200, ancho: 125, altura: 384 },
    { x: 40, ancho: 125, altura: 462 },
    // En Boo y en Ovi acá había una estrella; en Nico no. El primer
    // tramo entero se sube sin nada que guarde, y la almohada ancha
    // que servía de descanso ahora se hunde como las demás — siendo la
    // más ancha del tramo, son tres segundos de caminata viéndola
    // bajar.
    { x: 190, ancho: 145, altura: 540 },

    // ── Y ahora sí ────────────────────────────────────────────
    // Se achican y suben de 86 en 90. Al final del tramo, el primer
    // hueco de los que solo se pasan **saliendo en seguida**: se
    // llega corta dos veces, y a la tercera se entiende que la
    // pasada buena es la primera y no la mejor.
    //
    // **La regla de los huecos a prisa:** van siempre hacia el lado
    // al que la tortuga ya viene mirando cuando aterriza, y la
    // almohada de la que salen va angosta. Pedir prisa y encima
    // pedir esperar media vuelta de caminata para darse vuelta es
    // pedir dos cosas que se contradicen, y eso ya no es difícil,
    // es injusto.
    { x: 45, ancho: 115, altura: 624 },
    { x: 205, ancho: 115, altura: 710 },
    { x: 50, ancho: 100, altura: 796 },
    { x: 195, ancho: 130, altura: 924, aPrisa: true },
    { x: 50, ancho: 115, altura: 1010 },
    { x: 190, ancho: 145, altura: 1096, hito: true },

    // ── El tramo desparejo ────────────────────────────────────
    // Una sube 64 y la siguiente 96, así que no se puede repetir la
    // misma carga dos veces; y como cada tanteo cuesta altura, medir
    // a ojo sale más caro que en los otros dos capítulos.
    // La primera cobija, sola y perdonando. Lo que hay que saltar
    // desde ella son 64 px, el tramo más corto del capítulo entero: la
    // primera vez que la barra se arrastra no puede ser también la vez
    // que hace falta el tope. Se aprende qué hace, no se paga por
    // aprenderlo.
    { x: 45, ancho: 110, altura: 1184, enreda: true },
    { x: 200, ancho: 110, altura: 1248 },
    { x: 55, ancho: 115, altura: 1344 },
    // Y la segunda, ya en medio del desparejo y ya cobrando: de acá
    // hay que subir 88 con la barra lenta.
    { x: 210, ancho: 100, altura: 1408, enreda: true },
    { x: 60, ancho: 105, altura: 1496 },
    // La otra estrella que Nico no tiene. Le deja tres: 1096, 2156 y
    // la cima, o sea un hueco a prisa por trecho y ninguno de los tres
    // con dos. Caerse en el desparejo cuesta mil píxeles de vuelta,
    // que es el precio de ser el último capítulo.
    { x: 185, ancho: 145, altura: 1584 },

    // ── Ya pesa ───────────────────────────────────────────────
    // Las almohadas más angostas del capítulo, que aquí es un regalo
    // y no un castigo: menos camino que desandar para volver al
    // punto de salida. Y el segundo hueco a prisa, este sin aviso.
    { x: 40, ancho: 105, altura: 1672 },
    // Cobija, y dos plataformas más arriba el hueco a prisa. Dos, no
    // una: la regla de las cobijas es que ninguna va justo antes de un
    // «a prisa», porque el hueco pide salir ya y la cobija pide cargar
    // largo. Separadas por una almohada normal se leen como lo que
    // son, dos trabas distintas, en vez de como una zancadilla.
    { x: 205, ancho: 100, altura: 1762, enreda: true },
    { x: 45, ancho: 100, altura: 1852 },
    { x: 200, ancho: 110, altura: 1980, aPrisa: true },
    { x: 45, ancho: 110, altura: 2068 },
    { x: 185, ancho: 145, altura: 2156, hito: true },

    // ── El último trecho hasta la luna ────────────────────────
    // Sin regalo de impulso, que ese es de Boo, y sin red de
    // peluches, que esa es de Ovi. Lo único que hay aquí es lo que
    // el capítulo enseña, tres veces seguidas y con el tercero a
    // prisa.
    { x: 40, ancho: 105, altura: 2244 },
    // La última cobija, y la única del trecho final. Con tres estrellas
    // nada más, caerse acá cuesta volver desde 2156.
    { x: 200, ancho: 105, altura: 2334, enreda: true },
    { x: 45, ancho: 100, altura: 2424 },
    { x: 195, ancho: 120, altura: 2552, aPrisa: true },
    { x: 50, ancho: 115, altura: 2638 },

    // La cima. Ancha, como las otras dos: el último salto antes del
    // premio no es el sitio para pedir puntería. Y firme, que es una
    // estrella: se llega y se respira.
    { x: 190, ancho: 155, altura: 2726, hito: true },
  ],
}

/** Los capítulos, en orden de llegada de los peluches. */
export const CAPITULOS: CapituloEscrito[] = [BOO, OVI, NICO]

/**
 * La ayuda de abajo.
 *
 * «Mantené apretado y soltá» hace falta los primeros segundos y
 * después estorba: es una línea de texto encima del juego. Se va sola
 * cuando ya está claro que entendió, y vuelve a asomarse si pasa un
 * rato largo sin saltar, por si se quedó trabada.
 */
export const AYUDA = {
  /** Después de cuántos saltos se va sola. */
  saltosParaIrse: 3,

  /** Si pasa este rato sin saltar, vuelve. */
  msDeOlvido: 30000,
}

/**
 * El bautizo: la primera pantalla de todas, una sola vez.
 *
 * La tortuga es de ella, y hasta ahora no tenía nombre. Se le pregunta
 * antes del primer capítulo y lo que escriba manda en todos los textos
 * del juego, en los tres capítulos.
 *
 * Se puede dejar para después sin que pase nada: el juego la llama «la
 * tortuga» y se lo vuelve a preguntar la próxima vez. Lo que no hay es
 * una pantalla de ajustes para cambiarlo, así que mientras no lo
 * ponga, la puerta sigue abierta.
 *
 * En los textos de aquí abajo, `{tortuga}` y `{Tortuga}` son el hueco
 * donde entra el nombre. Sin nombre puesto se llenan solos con «la
 * tortuga» y «La tortuga».
 */
export const BAUTIZO = {
  titulo: '¿Cómo se llama?',
  parrafos: [
    'Esta es la que sube, y hasta hoy no tiene nombre. Es tuya: ponele el que querás y así se va a llamar de aquí hasta arriba.',
  ],
  /** Lo que se ve escrito flojito adentro de la casilla, sin escribir nada. */
  ejemplo: 'la tortuga',
  boton: 'así se llama',
  saltar: 'mejor después',
  pie: 'Si ahorita no se te ocurre, dale nomás y te lo vuelvo a preguntar la próxima.',
}

/**
 * El cartel de antes de empezar.
 *
 * Va porque el cansancio no se puede aprender cayéndose: si se desmaya
 * sin haber avisado nunca de que aguantar la barra tenía un límite,
 * parece que el juego se rompió. Es el mismo trato que la primera
 * pantalla del juego de las frases.
 */
export const CARTEL = {
  titulo: 'Antes de subir, osita',
  parrafos: [
    '{Tortuga} camina sola de un lado al otro y no se para nunca. Apretá la pantalla y ahí sí se para, se agacha y la barra se le va llenando. Cuando soltás, sale disparada hacia donde venía mirando. Un solo dedo, y dos cosas que decidir: cuándo y con cuánta fuerza.',
    'Aguantar la barra cansa. Si te quedás apretando de más se marea, se cae de espaldas con las estrellitas dando vueltas y pierde ese salto. Antes de que pase, la barra se pone roja. No perdés nada más, solo hay que esperar a que se levante.',
    'Las estrellitas de papel guardan por dónde ibas, como las del frasco. Si te caés volvés a la última que pisaste, nunca hasta abajo del todo.',
  ],
  boton: 'a la luna',
  pie: 'Se sube a pasitos. No hay apuro.',
}

/** Los textos de pantalla del juego. */
export const TEXTOS = {
  ayudaTocar: 'mantené apretado y soltá',
  ayudaTeclado: 'o la barra espaciadora',
  /** Al pisar una estrella. Discreto y corto: se lee de reojo. */
  hito: 'guardado aquí',
  /**
   * Lo que sale la **primera vez** que le pega cada cosa de las que
   * caen, y solo esa vez. El dibujo del objeto ya dice a qué le va a
   * pegar, pero lo que hace exactamente hay que decirlo con letras una
   * vez — igual que la estrella, que se enciende y late y aun así hay
   * que escribir «guardado aquí».
   */
  golpeApuron: 'se te desbocó la barra, ya no para en el tope',
  golpeApagon: 'te apagó la barra, guiate por el temblor',
  llegada: 'llegaste',
  /** Lo acumulado de todas las veces, debajo de lo de esta subida. */
  enTotal: 'en total',
  /** El botón para seguir con el capítulo siguiente, recién ganado el de ahora. */
  seguir: 'seguir con',

  /* ── El marcador contra él ──────────────────────────────────
     Sale debajo de los pasitos de esta subida, y solo en los
     capítulos que tienen récord puesto. Sin récord no sale nada y el
     capítulo se cierra igual. */

  /** Lo suyo, siempre. `{pasitos}` es su número. */
  recordDeEl: 'a osito le tomó {pasitos} pasitos',
  /** Y el remate, según cómo le fue. Solo uno de los tres. */
  leGanaste: 'le ganaste',
  loEmpataste: 'lo empataste',
  /** `{cuantos}` viene con su palabra: «un pasito» o «4 pasitos». */
  teFalta: 'te faltaron {cuantos}',
  teFaltaUno: 'te faltó un pasito',
  /** Su mejor de antes, cuando esta subida no fue la mejor. */
  tuMejor: 'tu mejor acá: {pasitos} pasitos',
  /* Acá vivía «el capítulo que falta todavía lo estoy haciendo».
     Era verdad con dos capítulos escritos y dejó de serlo con tres:
     ahora, al ganar el último, no falta ninguno — se llega a la luna
     y sale la carta. */

  /* ── Arriba, cuando ya no queda capítulo ────────────────────
     Acá no sale el cierre de siempre con los pasitos y las caídas:
     esos números están adentro de la carta, que es donde significan
     algo. Lo único que hace esta pantalla es dejar leer. */

  /** Si por lo que sea la carta no se pudo abrir. */
  cartaNoAbre: 'la carta no quiso abrirse, probá recargando',
  /** Para salir del juego cuando ya la leyó. */
  volver: 'volver a la madriguera',
}

/**
 * La luna de la portada, que es la puerta del juego.
 *
 * Está a la vista desde el primer día y se hace notar, pero no se abre
 * de gratis: primero tiene que encontrar a los tres peluches
 * escondidos por la madriguera. El colado da lo mismo, ese no es hijo
 * de nadie.
 *
 * Que se pueda tocar estando cerrada es a propósito. Lo primero que va
 * a pasar es que la toque y le salga el aviso de abajo, y a partir de
 * ahí buscar a Ovi, a Boo y a Nico deja de ser un juego suelto y pasa a
 * ser el camino a otra cosa.
 */
export const ENTRADA_POR_LA_LUNA = {
  /** Lo que dice el lector de pantalla mientras está cerrada. */
  etiqueta: 'la luna',
  /** Y cuando ya se puede subir. */
  etiquetaAbierta: 'la luna, a pasitos de tortuga',

  /**
   * El aviso de tocarla sin tenerlos a los tres.
   *
   * Da la pista entera. Un acertijo que no se puede resolver no es un
   * secreto, es una puerta trabada: si no le dice dónde buscar, la
   * toca dos veces y no la vuelve a tocar nunca.
   */
  cerrada: {
    titulo: 'Todavía no',
    texto:
      'Antes de irte tan lejos los quiero a los tres en casa. Andan escondidos por la madriguera, con medio cuerpo afuera en alguna esquina.',
  },

  /** Y lo que le sale debajo cuando ya subió hasta arriba. */
  llena: 'la carta sigue allá arriba',
}

/**
 * La carta que espera arriba, y que es lo que el juego promete desde
 * su primera línea.
 *
 * No está acá: llega descifrada de `public/cifrado/carta-luna.enc`,
 * como los chats y por la misma razón. Se escribe en
 * `private/publicable/carta-luna.json` y el hook la cifra sola.
 *
 * `{pasitos}` y `{caidas}` se rellenan con lo acumulado de todas las
 * veces, que es lo que mide subir tres capítulos. Y hay dos aperturas
 * porque una que hable de caídas a quien no se cayó ni una vez le
 * está contando la subida de otra.
 */
export interface SobreCartaDeLaLuna {
  titulo: string
  apertura: string
  aperturaSinCaidas: string
  parrafos: string[]
  cierre: string
  posdata: string
  firma: string
}
