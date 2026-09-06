# A la luna, a pasitos de tortuga — plan para programarlo

> Documento de diseño cerrado el 25 de agosto de 2026, para implementar en la
> sesión siguiente. Todo lo de aquí ya está decidido con Armando: si algo se
> cambia, se cambia aquí primero.

Un juego de habilidad escondido en la portada. Sale de la fórmula que él le
repite: **«de aquí a la luna a pasitos de tortuga»**. Una tortuga sube saltando
hasta la luna, y arriba hay una carta que no existe en ninguna otra parte de la
web.

Es el primer sitio del regalo donde ella tiene que **fallar y volver a
intentar**. El juego de las frases se contesta; este se aprende.

---

## Lo que ya está decidido

| Qué | Cómo quedó |
|---|---|
| Gesto | Mantener y soltar. Una sola barra de fuerza |
| Personaje | La tortuga, por la frase |
| Capítulos | Tres, por peluche, en orden de llegada: **Boo → Ovi → Nico** |
| Poderes | **No hay** (decidido el 29 de agosto). Un solo gesto en todo el juego |
| Al caer | Vuelve al último hito. Intentos infinitos. Baja del hito y ya es caída, aunque quede parada más abajo |
| Tamaño de un capítulo | 32 plataformas y 5 estrellas, una cada seis o siete (decidido el 28 de agosto) |
| Los puntos de guardado | Una **estrellita de papel** de las del frasco, la misma en los tres capítulos |
| Aguantar de más | Se agota y se desmaya. Pierde el salto y hay que esperarla |
| Duración | 12-15 minutos la primera vez |
| Marcador | El récord de él, esperándola en cada capítulo |
| Premio | Una carta suya, solo ahí. Se escribe con él en la sesión |
| Entrada | Escondida: se toca la luna de la portada. La luna se hace notar |
| La luna en el capítulo | Cinemática al abrir, se va para arriba, espera en la cima y se va al llegar |
| Camino | Cada mundo con su material |
| El colado | Se cuela y estorba |
| El peluche | Espera sentado en la luna, y al llegar se sube al caparazón |
| Sonido | Vibración en Android, más sonidos cortos con interruptor |

---

## La mecánica

### El salto

La tortuga **camina sola** de un extremo al otro de la plataforma, dando la
vuelta al llegar al borde. Ese caminar es el reloj del juego: marca hacia dónde
va a salir y obliga a esperar el momento.

1. Ella aprieta en cualquier parte de la pantalla. La tortuga **se detiene** y
   empieza a llenarse una barra pegada a ella.
2. La barra sube de 0 a 1 en unos 900 ms, lineal, y **se queda arriba** si no
   suelta. No rebota ni se reinicia: castigar dos veces el mismo error es
   mezquino.
3. Al soltar, sale disparada en la dirección en la que venía caminando, con
   ángulo fijo de unos 65° y fuerza proporcional a la carga.
4. Si en pleno vuelo choca contra el borde del mundo, rebota flojito **y se da
   la vuelta**. Sin eso caía mirando a la pared, seguía caminando contra ella y
   el salto siguiente salía otra vez para el mismo lado.

Son dos decisiones en un solo dedo: **cuándo** (posición y dirección) y **cuánta
fuerza**. Con eso alcanza para que haya techo de habilidad sin pedirle un
segundo dedo.

### El cansancio

La barra no rebota, pero **quedarse esperando el momento perfecto sí cuesta**.
A los 2,1 segundos con el dedo apretado la tortuga se agota, se desmaya con sus
estrellitas dando vueltas y pierde el salto; se queda tirada 1,3 segundos y se
levanta sola.

Sin esto, la respuesta óptima era cargar a tope y esperar tranquila a que la
plataforma de enfrente estuviera perfecta. La caminata dejaba de ser el reloj
del juego. Ahora esperar tiene precio y hay que decidir en el momento.

**Avisa antes**: medio segundo antes la barra se pone roja y parpadea, y ella
tiembla más fuerte. Un castigo que no se ve venir no se aprende, solo enoja. Y
lo que se pierde es el salto, nunca el progreso: no baja al hito ni se le quita
nada, solo hay que esperarla.

Los tres números viven en `CANSANCIO`, en `luna.ts`, y está contado en el
cartel de la primera pantalla, en el segundo párrafo de `CARTEL`.

En computadora, la barra espaciadora hace lo mismo. No es el escenario
principal, pero que no quede tullido.

### Valores para empezar a tantear

Mundo lógico de 360 × 640. Se escala con **la más chica** de las dos medidas
(alto de pantalla contra 640, ancho contra 360) y se ancla abajo, porque lo que
sobra es cielo y el cielo va arriba. Escalando solo por el alto, en un teléfono
largo el mundo se salía por los costados y una plataforma pegada al borde
quedaba fuera de la pantalla. Estos números son un punto de partida, no un
resultado: se ajustan jugando.

- Gravedad: 2200 px/s²
- Impulso mínimo (carga 0): 540 px/s · máximo (carga 1): 930 px/s
  (eran 700 y 1400 hasta que se midieron: con 1400 el salto largo
  avanzaba 671 px de lado en un mundo que mide 360 de ancho, o sea que
  rebotaba de pared a pared. Con 930 avanza 288 y sube 154)
- Ángulo de salida: 65° desde la horizontal
- Velocidad de caminata: 55 px/s
- Tiempo de carga completa: 900 ms
- Coyote time: 90 ms después de dejar la plataforma, para que el borde perdone

**Paso fijo de simulación** (60 Hz) con acumulador, y el dibujo interpolado. Sin
esto, en un teléfono que baja a 40 fps la física cambia y el juego se vuelve
otro. Es la única parte donde no se puede improvisar.

### Caer

Cae fuera de pantalla, medio segundo de nada, y reaparece en el último hito
alcanzado. Sin pantalla de derrota y sin ningún texto que la regañe. Que el
reintento sea tan rápido que no dé tiempo a enojarse.

**Hitos:** tres o cuatro por capítulo, con cinco a ocho saltos entre uno y otro.
Se marcan claros, cada mundo con su material, y al pisarlos hay un guiño
mínimo. El progreso entre hitos no se guarda si cierra la página; el capítulo
alcanzado, sí.

---

## Los tres mundos

Cada capítulo abre con una pantalla de presentación del peluche (su retrato
bordado, que ya está en claro en `src/assets/peluches/`) y cierra ganándolo.

### 1 · Boo — la pista de Hot Wheels

**Su historia, encontrada en el chat el 25 de agosto de 2026:** Boo llegó el
**23 de diciembre de 2024**, en el arreglo de Hot Wheels que ella le regaló esa
Navidad, con un lazo amarillo. El resto del arreglo lo escogió alguien más; el
peluche lo escogió ella. Esa misma noche él le dijo que iba a dormir con el
osito, y diez días después Boo todavía olía a ella.

**El nombre viene de bamBOO**, por el panda. Eso le da al mundo su segundo
material: cañas de bambú creciendo entre los tramos de pista naranja, y el
cartel de presentación del capítulo puede jugar con el nombre.

- **Material:** tramos de pista naranja de Hot Wheels, con sus soportes, curvas
  y algún looping de fondo. Carritos parqueados de adorno, y todo apoyado en
  cañas de bambú que bajan y se pierden en lo oscuro.
- **La traba:** la pista **se desvanece** unos segundos después de que despega
  de ella. No hay vuelta atrás. Es la traducción de su frase de la esquina
  («nadie me tomó fotos»): lo que pisó, se borra.
- **Ayuda del mundo:** algunos tramos son de impulso, y si cae ahí la lanzan
  sola. Sirven para enseñarle sin explicarle qué se siente un salto largo.
- **Se gana:** a Boo, y nada más. Los poderes se quitaron del plan el 29 de
  agosto: se probaron dos (el empujón y el planeo) y ninguno hacía falta. Lo
  que sostiene el juego es un gesto y las trabas de cada mundo, y cada cosa que
  se le agrega encima es una regla más que explicar en un regalo que se juega
  una vez.
- **Es el primero**, así que es el que enseña: los primeros diez saltos son casi
  regalados y no hay desvanecimiento hasta pasado el primer hito.

### 2 · Ovi — las cajas

Ovi apareció en una caja de peluches viejos y se vino con él ese día. Es todo
rosa pastel y tiene complexión de gimnasio.

- **Material:** cajas de cartón apiladas, peluches viejos asomando, cinta de
  embalaje. Las cajas son de tamaños distintos y algunas están mal apiladas.
  Cada plataforma son dos, tres o cuatro cajas de hombro con hombro: de una sola
  pieza salía una tabla y no una caja.
- **La traba:** las cajas **ceden**. Al pisarlas se inclinan hacia el lado con
  más peso, así que el punto donde aterriza cambia el suelo del siguiente salto.
  Es un balancín que pivota en el medio, y lo que se lleva son 8 px de altura de
  salida entre saltar desde el medio y saltar desde la orilla: a barra llena,
  154 contra 146. Las estrellas y el suelo no ceden, que en algún lado hay que
  poder respirar.
  Y hay huecos que solo se pasan con la barra al tope: no hay manera de pasarlos
  a medias. Van dos por capítulo, marcados `alTope` en `luna.ts` para que el
  probador los comprenda en vez de darlos por error de diseño.
- **La caja forrada de cinta**, que es lo que complica. Alguien la envolvió
  entera y quedó lisa. Caminando por encima no pasa nada; **parada cargando la
  barra sí**: se va corriendo hacia el lado que la caja está bajando, hasta la
  punta, y la punta está hundida por el balancín. No la tira, la descoloca.
  Es la traba de Boo mirada por el otro lado —allá el tramo se borra y te apura
  por tiempo, acá la caja te corre y te apura por sitio— y ataca la barra, que
  es lo único que este juego tiene. Y refuerza la lección del mundo: en el medio
  de la caja no hay cuesta, así que el medio es a la vez el único sitio donde se
  puede cargar tranquila y el único desde donde el salto sale entero.
- **La caja de peluches**, que es lo que da sazón. Abierta y rebosando, de una
  así salió Ovi. Caer ahí no la para: la devuelve, con parte de lo que traía y
  hacia donde iba, y se apaga sola en tres o cuatro botes porque cada uno sale
  del anterior. Hace dos cosas: regala medio salto sin gastar barra ni pasito, y
  **recoge**. Va ancha y justo encima de una estrella, así que un fallo de los
  tramos de arriba cae en ella y vuelve para arriba en vez de irse hasta la
  estrella. No es el tramo de impulso de Boo con otro traje: aquel centra a la
  tortuga y la lanza siempre igual, este depende de cómo entres.
- **Se gana:** a Ovi, y nada más. Aquí estuvo apuntado un poder, el salto de
  gimnasio, y se fue con los otros dos el 29 de agosto. El hueco que no da se
  pasa con la barra al tope, que para eso está.

### 3 · Nico — las almohadas

El primogénito. Rosa pálido, de pelo rizado, comprado para que la acompañara
mientras dormía. Es el capítulo más importante y va al final.

- **Material:** almohadas, sábanas revueltas, cobijas colgando. Luz de
  madrugada. La luna ya se ve grande.
- **La traba:** las almohadas **se hunden mientras está parada encima**. Se
  hunden despacio, pero cargar la barra toma tiempo, y ahí está el nudo: el
  mundo final ataca directamente la mecánica central del juego. Hay que decidir
  entre el salto seguro y el salto bueno.
- **Se gana:** a Nico, y con él los tres. También tuvo poder apuntado —
  perdonar una caída— y se fue el 29 de agosto con los demás: en el capítulo
  que ataca la mecánica central, perdonar el error es quitarle el nudo.

### 4 · El último trecho

Un tramo corto, de tres o cuatro minutos, con **las trabas de los tres mundos
mezcladas**: pista que se borra, cajas que ceden y almohadas que se hunden. Sin
material nuevo: es cielo abierto y la luna. Se juega con todo lo aprendido y ahí
se ve si lo aprendió.

Arriba está la carta.

---

## El peluche que espera en la luna

Boo, Ovi y Nico están **sentados encima de la luna desde el primer cuadro del
capítulo**, y ella sube hasta ahí a buscarlos. Salen ya en la cinemática de
entrada, cuando la luna se acerca a la pantalla: se ve quién está esperando, y
después la luna se va para arriba con él encima. Eso es el capítulo entero
contado sin una palabra.

Al alcanzar la cima, el peluche **baja de la luna y se le sube al caparazón**, y
recién entonces la luna se va. Ese orden importa: al revés, la luna se iría con
el peluche todavía encima, que es lo contrario de lo que acaba de pasar. Se le
sube solo por ese momento — no es ropita del ropero y no queda puesto.

En el tercer capítulo no baja. Ahí la luna no se escapa: sube ella. Se quedan
los dos arriba, uno al lado del otro, y sobre ese cuadro se abre la carta.

**No se dibuja: es el retrato bordado**, el mismo que ella conoce de los
carteles y de las esquinas de la web. Dibujar un panda a mano al lado del panda
de verdad no tenía sentido.

Se mira con **`npm run luna:peluche`**, que saca los ocho momentos del cierre en
los dos capítulos donde pasa, y con `npm run luna:llegada` para el tercero.

---

## El colado

El pato amarillo con peluca verde que no es de ellos. Aparece sin avisar, un par
de veces por capítulo, **parado justo en la plataforma a la que iba**. Ocupa el
sitio unos segundos y hay que esperarlo o buscar otro camino.

No mata ni empuja. Solo estorba, mira y se va. Que sea molesto y
gracioso a la vez es todo el punto. Que no aparezca nunca en el último trecho:
ahí ya no es chiste.

---

## El récord de él

Cada capítulo guarda **en cuántos pasitos** lo terminó él, y el tiempo como dato
secundario. Al cerrar cada capítulo sale la comparación, en la línea del chiste:
«a osito le tomó 214 pasitos. A vos, 189».

- Los récords de él viven en `src/content/luna.ts`, escritos a mano después de
  que él juegue. Mientras estén vacíos, la comparación no aparece: el juego
  funciona igual.
- **Hay que avisarle que juegue antes de entregarlo.** Sin eso, el rival no
  existe.
- Los de ella se guardan en `localStorage` y se muestran junto al de él la
  próxima vez.

---

## Dónde vive y cómo se entra

- Ruta nueva `/luna`, **fuera del menú**. No se enlaza desde ningún lado.
- En la portada, la luna que ya existe se vuelve tocable. **Se hace notar**: un
  brillo lento cada quince o veinte segundos, apenas, y un movimiento mínimo. Lo
  justo para que el ojo la agarre sin que parezca un botón.
- Al tocarla, transición de la portada al juego: la cámara sube en vez de
  cambiar de página.
- Si ya terminó, la luna queda distinta, más llena, y al tocarla se puede releer
  la carta sin volver a jugar.

---

## Cómo se programa

### Canvas, no DOM

El juego se dibuja en un `<canvas>` 2D. Motion sirve para animar una interfaz,
no para correr física a 60 fps, y el DOM con cien nodos moviéndose en un iPhone
no da. Alrededor del canvas sí va DOM normal: el HUD, los carteles entre
capítulos, la carta.

**El bucle vive fuera de React.** React monta el canvas, le pasa el capítulo y
se aparta. Nada de estado de React dentro del bucle: `useRef` para el motor y un
único `useState` para lo que cambia de veras (capítulo, hito, cinemática).

### Archivos previstos

```
src/paginas/Luna.tsx              ← la página: monta el canvas y el HUD
src/juego-luna/motor.ts           ← bucle, paso fijo, física, colisiones
src/juego-luna/entrada.ts         ← pointer y teclado → cargar y soltar
src/juego-luna/dibujo.ts          ← pintar el mundo, la cámara y la tortuga
src/juego-luna/mundos.ts          ← las trabas de cada capítulo
src/juego-luna/progreso.ts        ← localStorage: capítulo, pasitos, caídas
src/content/luna.ts               ← LO QUE TOCA ARMANDO: niveles, textos, récords
```

`src/content/luna.ts` sigue la regla de siempre: datos con comentarios, sin
lógica. Ahí van los récords, los textos de los carteles, el largo de cada
capítulo y las plataformas si se quieren tocar a mano.

### Dibujo

Todo vectorial, dibujado en el canvas con formas y trazos: pista naranja, cajas,
almohadas. Nada de imágenes generadas: pesan y hay que cifrarlas.

**La tortuga se dibuja a mano en código, y con detalle**, porque es el personaje
que se mira todo el rato. Vive aparte, en `src/juego-luna/tortuga.ts`: va parada
en dos patas, con brazos y piernas de dos huesos (hombro, codo, mano / cadera,
rodilla, pie), caparazón a la espalda, panza con las rayas del plastrón, y una
cara con dos ojos, cejas y boca que cambian de expresión.

El archivo está partido en dos mitades a propósito. `poseDe` traduce lo que está
pasando en el juego a una lista de ángulos, y el dibujo solo obedece: para
cambiar cómo se mueve se tocan números en un solo lugar. Lo que hay hoy:

- **Caminata** de ciclo completo: piernas en contrafase, brazos al revés de las
  piernas, y el cuerpo que sube y baja en cada paso. Sin ese sube y baja se ve
  patinando aunque las piernas se muevan bien.
- **Carga**: se agacha, echa los brazos atrás, aprieta los ojos y tiembla cada
  vez más según se llena la barra.
- **Aire**: subiendo va estirada; cayendo se encoge, abre los brazos y pone cara
  de susto. No son dos dibujos: se mezclan según la velocidad, y por eso el
  salto se ve como un movimiento y no como tres estampas pegadas.
- **Aterrizaje**: se aplasta y se estira de vuelta, corto, para que el suelo se
  sienta duro.
- **Desmayo**: se cae sentada, con las piernas al aire, los ojos hechos remolino
  y tres estrellitas girándole encima, y se levanta sola al final.
- **Parpadeo** cada tres segundos y pico, y respiración mientras carga.

El tamaño sale de `TORTUGA.alto` en `luna.ts` y el dibujo entero se estira solo:
agrandarla o achicarla es cambiar un número.

**Para verla sin jugar** están `private/notas/tortuga-banco.html` (todas las
poses, el ciclo de caminata y una tira a tamaño de teléfono, en
`/private/notas/tortuga-banco.html` con `npm run dev` andando) y
`private/notas/ver-tortuga.mjs`, que le saca la foto. `private/notas/ver-luna.mjs`
hace lo mismo con el juego de verdad, en un teléfono de 412 × 892. Dibujar a
ciegas y jugar para ver el resultado cuesta muchísimo más.

Los tres retratos bordados de los peluches ya existen en claro y se usan tal
cual en los carteles entre capítulos.

**Nada de esto se cifra**, porque no hay nada de ellos dos adentro. La única
excepción es la carta de la luna: esa va como todo lo demás, a
`private/publicable/` y cifrada por el hook.

### Lo que hay que respetar sí o sí

- **`prefers-reduced-motion`**: se apagan el parallax del fondo, las partículas
  y el temblor de cámara. La mecánica no se toca: un juego sin física no es un
  juego con menos movimiento, es otra cosa.
- **Nada de scroll en la página del juego.** Se aprendió con el diccionario: se
  mide por el alto de la ventana y entra entero. `touch-action: none` en el
  canvas para que el navegador no interprete el gesto como arrastre.
- **La barra del navegador de Safari** se come alto y aparece y desaparece sola.
  Medir con `visualViewport` y volver a medir cuando cambie.
- **`devicePixelRatio`** al escalar el canvas, o se ve borroso en el teléfono.
- **Móvil primero.** Se prueba en el teléfono antes de darlo por bueno.

---

## Cómo se siente el salto

**El teléfono de ella es Android, el de él es iPhone.** Eso decide esta sección
entera y conviene tenerlo presente en todo lo demás del proyecto: el aparato que
manda es el de ella.

- **Vibración**, que es lo que se eligió: `navigator.vibrate` funciona en
  Android, así que en el teléfono que importa se va a sentir. Un toque corto de
  unos 12 ms al soltar y uno más seco al caer. En el iPhone de él no va a pasar
  nada, y está bien: la API no existe en iOS, ni en Safari ni en ningún otro
  navegador de ahí, porque todos corren sobre WebKit.
- **Sonidos cortos y discretos**, generados con la Web Audio API sin descargar
  ningún archivo: un pop al soltar, un toc al aterrizar y algo apenas más
  alegre al pisar un hito. Cortos de verdad, de menos de 100 ms, y con
  interruptor a la vista. Arrancan apagados: que ella decida encenderlos y no se
  lleve un susto si abre el juego con gente alrededor.
- **Respuesta visual**, que es la que nunca falla: un fogonazo corto al soltar,
  la cámara que acusa el golpe al aterrizar y polvito al despegar. Con
  `prefers-reduced-motion` se queda solo el fogonazo.

El audio en el navegador solo puede empezar después de que la persona toque la
pantalla. No es problema aquí, porque el primer toque es el primer salto, pero
el contexto de audio se crea ahí y no antes.

---

## Las fases

Se parte en fases porque los créditos se pueden acabar en cualquier momento, y
quedarse a medias de un capítulo es peor que no haberlo empezado. Cada fase de
aquí cierra sola: compila, pasa `npm run revisar` y se puede subir sin que la
web quede rara.

**La regla que lo hace posible:** mientras la luna de la portada no sea tocable,
el juego no existe para ella. La ruta `/luna` nace en la fase 1 sin enlace desde
ningún lado y así se queda hasta la última. Todo lo de en medio puede quedar a
la mitad sin que nadie lo note. **La fase 10 es la única que publica**, y no se
empieza hasta que lo demás esté cerrado.

| # | Fase | Deja jugable | Se puede parar |
|---|---|---|---|
| 0 | La carta | — | Sí |
| 1 | El motor pelado | El salto, en una plataforma | Sí |
| 2 | Mundo, cámara, hitos y probador | Un nivel de prueba, de punta a punta | Sí |
| 3 | Boo entero | Un capítulo de verdad | Sí, y es buen sitio |
| 4 | Ovi ✓ | Dos capítulos | Sí |
| 5 | Nico ✓ | Los tres capítulos | Sí |
| 6 | El último trecho y la carta ✓ | El juego completo | Sí |
| 7 | El prólogo ✓ | El juego con su escuelita delante | Sí |
| 8 | Teléfono y números — el sonido ✓; falta probarlo en su teléfono | El juego, pero que se sienta bien | Sí |
| 9 | El colado ✓ | Igual, con chiste | Sí |
| 10 | **La entrada por la luna** ✓ | El juego, para ella | Fin |

Al cerrar cada fase: `npm run typecheck`, `npm run revisar`, commit propio, y
dejar apuntada la siguiente en «La próxima sesión» de `PLAN.md`.

### 0 · La carta

Sin código. Él cuenta qué le quiere decir, se redacta con su voz, se pasa por
`/repasar-textos` y se guarda en `private/publicable/carta-luna.json`, que el
hook cifra a `public/cifrado/`.

Va primero porque es lo único que necesita cabeza fresca y no depende de nada, y
porque sin ella el juego no tiene para qué. No toca `src/`: el commit es la
carta cifrada y nada más.

### 1 · El motor pelado

- Ruta `/luna` fuera del menú y sin enlazar.
- Canvas medido con `visualViewport` y `devicePixelRatio`, sin scroll,
  `touch-action: none`.
- Paso fijo a 60 Hz con acumulador y dibujo interpolado. Esto va aquí y no
  después: montarlo encima de un bucle improvisado es rehacerlo.
- Gravedad, una plataforma, la tortuga caminando y dando la vuelta.
- Cargar y soltar con el dedo y con la barra espaciadora. Vibración corta y
  fogonazo al soltar.
- `src/content/luna.ts` desde el primer día con los números (gravedad, impulsos,
  ángulo, caminata, carga), aunque todavía no haya niveles. Ajustar el salto no
  puede costar tocar código.
- **El probador nació aquí y no en la fase 2**, porque hizo falta enseguida:
  `private/notas/probar-luna.mjs` corre el motor de verdad sin dibujar y saca la
  tabla de cuánto avanza y cuánto sube el salto en cada punto de la barra. Node
  lee los `.ts` del proyecto tal cual; el `@/` se lo enseña
  `private/notas/alias-luna.mjs`. Con eso salió el error de los impulsos sin
  abrir el navegador ni una vez.

**No se pasa a la 2 hasta que saltar se sienta bien.** Es la única fase donde
vale la pena gastar créditos repitiendo lo mismo. Lo que se puede medir va al
probador; lo que hay que sentir, al teléfono.

### 2 · El mundo: plataformas, cámara, hitos, caída y el probador

**Hecha el 28 de agosto.** Un nivel de prueba de 20 plataformas y 4 hitos
armado desde `luna.ts`, cámara que sigue, hitos que se pisan, caída fuera de
pantalla y reaparición en el último hito. `progreso.ts` con el `localStorage`:
capítulo alcanzado sí, progreso entre hitos no.

**Las plataformas se escriben con altura, no con `y`.** En `luna.ts` cada una
lleva `x`, `ancho` y `altura` contada desde el suelo y creciendo hacia arriba,
que es como se piensa un nivel: «esta va 100 más arriba que la anterior».
`mundos.ts` lo convierte a las coordenadas de pantalla, y esa conversión pasa
en un solo sitio.

**La luna se dibuja pegada a la pantalla y crece conforme se sube.** Puesta en
el mundo, a mil y pico de altura, no se veía hasta el último salto, y es
justamente lo que tiene que estar a la vista desde el principio.

**El probador creció y ahora contesta cuatro cosas**, todas sin abrir el
navegador:

1. Cuánto avanza y cuánto sube el salto con cada punto de la barra.
2. Si cada tramo del nivel se puede pasar: prueba cada uno desde todas las
   posiciones del recorrido y con todas las fuerzas, y dice con qué rango de
   barra sale y si queda apretado.
3. Si el nivel se puede jugar de punta a punta: un robot lo sube entero
   calculando cada salto, y reporta pasitos y caídas.
4. Si al caerse vuelve al último hito y no al principio.

Al lado está **`private/notas/mapa-saltos.mjs`**, que es la herramienta para
armar niveles: dice, para cada altura que haya que subir, a qué distancias se
puede aterrizar. La respuesta corta es que **la distancia cómoda ronda los 175
para cualquier subida**, y que subir más de 130 de una vez deja una ventana tan
estrecha que no vale la pena.

**Ojo con dónde vive el arnés.** Todo esto está en `private/notas/`, que git
ignora, así que no viaja con el repositorio y si se pierde esa carpeta se pierde
entero. No tiene nada privado adentro y podría vivir en `scripts/`. Está
apuntado en `PLAN.md` para decidirlo.

Un salto no llega «hasta donde alcanza»: tiene que estar *bajando* al pasar por
la altura de la plataforma. Apuntar al punto más alto del salto es fallar,
porque ahí la tortuga va parada en el aire y el motor solo la deja aterrizar
mientras baja.

### 3 · Boo entero

Pista naranja y bambú, el desvanecimiento de los tramos, los tramos de impulso,
las estrellitas de papel en los hitos, el cartel de presentación con su retrato
bordado y los primeros diez saltos regalados.

Aquí se probaron dos poderes, el empujón y el planeo, y **los dos se tiraron el
29 de agosto**: ninguno hacía falta y cada uno era una regla más en un juego que
se sostiene con un solo gesto.

Esta es la plantilla. Es la fase más cara de las tres y las dos siguientes
cuestan bastante menos porque ya son variaciones.

### 4 · Ovi ✓

Cajas apiladas que ceden hacia el lado con más peso y los huecos que solo se
pasan con la barra al tope. Sin nada nuevo que aprender: la misma barra de
siempre contra un suelo que ya no está quieto.

Hecha. El mundo vive en `src/juego-luna/mundo-cajas.ts`, la traba en el motor
(`moverLasCajas` y `alturaDeLaCaja`), y el banco para mirarlo sin jugarlo es
`npm run luna:cajas`. Aquí también entró **el nombre de la tortuga**, que se le
pregunta a ella antes del primer capítulo y manda en los textos de los tres.

### 5 · Nico

Almohadas que se hunden mientras está parada encima, luz de madrugada y la luna
ya grande. Aquí se decide, jugándolo, si da para dos hitos más.

**Va en dos vueltas, y la primera ya está: el prototipo.** El capítulo se juega
entero —la traba en el motor, las 32 plataformas, las 5 estrellas, el cartel y
el cierre— pero el mundo está dibujado con lo justo para poder juzgarlo: una
almohada que se lee como almohada y se ve hundirse, y nada más. Ni sábanas
revueltas, ni cobijas colgando, ni luz de madrugada, ni fondo. Eso es la segunda
vuelta.

Se partió así porque el capítulo de Ovi enseñó que lo caro es la mecánica y el
nivel, no el material, y que pintar un mundo cuyos números todavía se van a
mover es pintarlo dos veces.

**La traba, ya medida:** la almohada baja 34 px en 3,6 segundos y para en el
fondo. No la traga y no la tira. Saliendo en seguida se sube 146 px; tras cinco
segundos encima, 120. Eso es lo que hace que **esperar cueste**: dejar pasar una
vuelta de la caminata para saltar desde el punto bueno se paga en altura, igual
que aguantar la barra. De ahí la decisión del capítulo, el salto seguro o el
salto bueno.

Y da vuelta una costumbre de los otros dos: aquí una plataforma ancha es peor
que una angosta, porque es más camino que desandar.

**Tres huecos marcados `aPrisa`** en `luna.ts`, que es la marca hermana de
`alTope`: se pasan saliendo en la pasada en que se llegó y no se pasan desde la
almohada hundida. Van siempre hacia el lado al que la tortuga ya viene mirando,
y salen de una almohada angosta: pedir prisa y encima pedir media vuelta de
caminata para darse vuelta no es difícil, es injusto.

**Una regla que salió de escribir las pruebas:** ninguna almohada puede estar a
menos de 58 px de su estrella (los 34 que se hunde más los 24 de
`CAIDA.margenBajoElLazo`). Más cerca, hundirse la deja por debajo del umbral de
caída **estando parada**, y el primer salto que dé desde ahí cuenta como caída
aunque llegue perfecto. Lo comprueba `npm run luna:probar`.

### 6 · El último trecho, la carta y el marcador

Cielo abierto con las trabas de los tres mundos. El conteo de pasitos por
capítulo, guardado, y la comparación con el récord de él (vacío no muestra
nada). Al llegar arriba, la carta descifrada.

**Cerrando esta fase el juego está entero y sigue escondido.** Si los créditos
se acaban justo aquí, se acaban en el mejor lugar posible.

### 7 · El prólogo ✓ (4 de septiembre)

**Hecho: siete clases y el cuento de antes.** Vive en
`src/componentes/EscuelitaDeLaLuna.tsx`, con las clases escritas en `CLASES` de
`content/luna.ts`. Se juegan con el mismo motor y el mismo pintor que los
capítulos, sin cinemática de la luna y con `nadaCae` puesto: en una clase se
enseña una cosa, y un rayo desbocándole la barra mientras aprende a soltarla
enseña dos a la vez y ninguna bien.

Las siete, en este orden:

1. **Mantener y soltar.** La de al lado tan cerca y tan baja que no se puede
   fallar.
2. **El cansancio.** Una plataforma de pared a pared: no hay a dónde ir, así que
   lo único que se puede hacer es aguantar hasta marearse. Se aprende aquí, donde
   da risa, y no a mitad del capítulo dos.
3. **La estrellita, y caerse.** El plan las tenía separadas y son la misma: la
   estrella no significa nada hasta que una se cae y la pantalla la devuelve ahí.
   Se pisa y se tira al vacío a propósito.
4. **La pista que se borra**, la traba de Boo.
5. **El tramo de impulso.**
6. **La caja que cede**, la traba de Ovi.
7. **La almohada que se hunde**, la traba de Nico, y la última: es la que pide
   prisa, y pedir prisa antes de que sepa medir la barra sería enseñarle a
   apurarse en vez de a saltar.

**Cómo se pasa una clase depende de la clase.** Cinco se pasan llegando arriba,
la del cansancio mareándose y la de la estrellita cayéndose. Eso es lo que dice
`objetivo`, y es lo que deja que la clase de aguantar la barra sea una
plataforma sin salida en vez de un nivel.

**Se ofrece una sola vez por teléfono**, y se puede saltar entera. Se guarda
cuál de las dos fue (`escuelita: 'hecha' | 'saltada'`), porque no dejan a la
misma persona del otro lado: **a quien la hizo se le quita el «cómo se juega»
del cartel de Boo**, que era lo otro que esta fase venía a arreglar; a quien se
la saltó se le deja, que es lo único que le queda explicándole el juego.

Y delante de todo, **el cuento** (`HistoriaDeLaTortuga.tsx`): por qué una
tortuga. Nueve cuadros que se pasan tocando, con la luna subiendo, ella
caminando dibujada de verdad y los tres trepándosele al caparazón. Sale la
primera vez y **cada vez que se vuelve a empezar**. El último cuadro es la
bisagra: la primera vez termina en que todavía no tiene nombre y de ahí se pasa
al bautizo; cuando ya lo tiene, la nombra y sale a jugar.

Para mirarlo: **`npm run luna:escuelita`** juega las siete clases con un robot y
avisa si alguna no se puede pasar; **`npm run luna:antes`** saca las fotos del
cuento y de las clases en el teléfono, y comprueba que la escuelita no vuelva a
salir la segunda vez.

### 8 · Teléfono y números

Se prueba en el Android de ella, entrando a `/luna` escribiendo la ruta a mano,
y se ajustan los números en `luna.ts`.

`prefers-reduced-motion` y la vibración estaban desde antes. **Los sonidos
quedaron el 5 de septiembre**: nueve, armados con la Web Audio API sin bajar
ningún archivo, en `src/juego-luna/sonidos.ts`. El interruptor sale en la
portada de la escuelita y en el cartel de cada capítulo, y arranca apagado.

Lo comprueba `npm run luna:sonidos`, que hace dos cosas distintas. Dibuja los
nueve a la misma escala y mide sobre lo grabado —no sobre la receta— cuánto
duran, cuánto pican y si terminan en silencio de verdad. Y después se mete al
juego, da saltos y cuenta osciladores: encendido tiene que crear alguno, y
apagado no puede crear ni el contexto. Eso último es la promesa entera de
«apagado de fábrica», y sin la segunda mitad el banco daría los nueve por
buenos aunque nadie los llamara nunca.

### 9 · El colado — hecho el 5 de septiembre

El pato con peluca, dibujado en `src/juego-luna/colado.ts`. Vectorial como la
tortuga: ni una imagen que bajar, cifrar y esperar. Mide 26×34 contra los 30×50
de ella, que es lo que lo deja en colado y no en jefe.

**Qué pasa si ella salta igual.** El pato es sólido: se le para en el lomo, 14
px por encima de la plataforma. No la mata ni la empuja —no le cuesta ni un
pasito ni una caída—, y lo que sí le cuesta es que el salto siguiente sale de
más arriba de lo que calculaba. Cuando el pato se va, baja.

Todo eso son tres líneas en `alturaEn`, dentro del motor: mientras el pato está
ahí, el suelo de ese trozo sube. Por ese único sitio pasan el aterrizaje, el
caminar y el quedarse pegada al suelo, así que las tres cosas salen solas.

**Dónde se cuela.** Lo sortea `dondeSeCuela`, en `colado.ts`, al empezar el
capítulo: dos por capítulo, nunca en los primeros cuatro tramos y **nunca en los
últimos cuatro** —ahí ella está contando los pasitos que le faltan para igualar
el récord de él y un pato tapándole la cima no da risa—, y nunca encima de una
estrella, un impulso o una caja de peluches, que esas ya hacen algo propio al
aterrizar.

Aparece al aterrizar ella en la plataforma de abajo, o sea **en la que iba a
usar**, y la ve llegar desde donde está parada. Apareciendo mientras vuela sería
una trampa, y apareciendo debajo no lo vería nunca.

**Nada de esto se explica en ninguna parte, a propósito.** No hay cartel, no hay
clase en la escuelita y no sale en el manual del cartel de Boo. Es lo único del
juego que no se explica: si se explicara dejaría de ser una sorpresa y pasaría a
ser una mecánica.

Se mira con **`npm run luna:colado`** (sus cuadros, su tamaño al lado de la
tortuga, y ella parada en su lomo con la línea del lomo marcada) y se comprueba
con **`npm run luna:cuela`**, que sortea mil veces por capítulo — las reglas son
un sorteo, y jugando una partida se ve una tirada. Y `npm run luna:probar` dice,
de cada partida del robot, dónde se asomó y si se le paró encima.

### 10 · La entrada por la luna y cosméticos extras

Es la fase que hace visible todo lo anterior, y por eso es la última.

**La puerta está hecha (4 de septiembre).** La luna vive en el cielo de la
portada, en la esquina derecha y en `LunaDePortada.tsx`, y es lo único en toda
la web que apunta a `/luna`. Brilla cada dieciocho segundos, y al tocarla se
agranda hasta comerse la pantalla y aterriza en el azul noche del canvas, que es
el mismo color, así que no hay corte.

**Y se le bajó el tono (4 de septiembre, tercera vuelta).** Es más grande que
antes, se mete en la esquina y **se desvanece hacia el borde**, así que lo que
se ve es una luna asomada y no un botón. Cerrada va al 55 % y con el halo a la
mitad. Al tocarla sin los tres ya no sale la pista entera: sale «aún te falta
algo» y nada más, porque decirle dónde buscar le resolvía el acertijo de una y
lo que le quedaba no era buscar, era ir a recoger. Y debajo de la luna llena ya
no hay línea: si subió, sabe qué hay arriba, y el cartelito convertía lo único
secreto de la web en un aviso más.

**La condición, tal como se pidió:** no se abre hasta que encuentre a los tres
peluches. El colado da lo mismo, ese no es hijo de nadie. Tocarla sin tenerlos
saca un papelito que dice qué le falta, con la pista entera: dónde andan y cómo
se asoman. Un acertijo que no se puede resolver no es un secreto, es una puerta
trabada, y la toca dos veces y no la toca nunca más.

Tres detalles que costaron más de lo que parecen:

- **La llave se guarda aparte.** Los peluches se olvidan cada noche al mandarlos
  a dormir, que es lo que hace que mañana vuelvan a esconderse. Haber dado con
  los tres se anota en `dosositos:peluches:los-tres`, que `olvidarTodo` no toca.
  Apoyada en las otras llaves, la luna se le habría cerrado esa misma noche.
- **Se enciende sin recargar.** Ella va a encontrar al tercero en la portada
  misma. `lib/hallazgos.ts` avisa a quien esté mirando y la luna se prende ahí
  mismo; cierra el cartel de los peluches y ya está encendida en esa pantalla.
- **Tiene su propia franja de cielo**, no cuelga del encabezado. Colgada quedaba
  mejor hasta el día en que se apague el regalo de la portada: sin él el
  encabezado sube y la luna se le monta al botón del tema.

Y `npm run luna:puerta` fotografía los seis estados y comprueba sola que
cerrada no deje pasar y que abierta sí.

**El ropero, también hecho.** Lo otro que pedía la fase:

> Añade un espacio para modificar al personaje, accesorios customizables para el
> personaje de la tortuga, entre otras cosas que se podrán desbloquear tras
> ciertos hitos.

Preguntado el 4 de septiembre y contestado: **ropita de juego, no reliquias**.
Un gorrito de fiesta, unos lentes de sol, una bufanda. No cuentan nada de ellos
dos y no tienen por qué. Lo que hacen es darle un motivo para volver a subir un
capítulo que ya ganó, que es lo único que al juego le faltaba.

Once cosas en cuatro ranuras: la cabeza, la cara, el cuello y el caparazón. Una
por ranura, así que puede andar con gorro, lentes y bufanda a la vez pero no con
dos gorros. Tres son de salida y las otras ocho se ganan: ganando cada capítulo,
subiendo uno sin caerse, igualándole los récords a él y llegando arriba.

- El catálogo es de Armando y vive en `ROPERO`, en `luna.ts`: nombre, la línea
  que dice y qué hay que hacer. Los dibujos son canvas y viven aparte, en
  `juego-luna/accesorios.ts`. El `id` amarra las dos mitades y
  `npm run luna:ropero` avisa si una se queda sin la otra.
- **Lo ganado no se guarda, se calcula.** Guardar la lista sería guardar dos
  veces la misma verdad, y el día que se toque una regla los teléfonos que ya
  jugaron se quedarían con la lista vieja para siempre. Se guarda solo lo puesto.
- Se entra desde el cartel del capítulo, con un botón chiquito y **debajo** del
  de empezar: vestirla es lo de al lado, no el camino.
- Se cambia en caliente. El pintor lleva la ropa en una propiedad, igual que
  `movimientoReducido`, así probarse un gorro no tira el nivel sembrado.

Dos cosas que costaron: **la bufanda** tenía que salir por encima del caparazón
al volar, porque mandada para atrás sin subirla se veía un aro rosado alrededor
del cuerpo, como un flotador. Y **lo bloqueado se lee en imperativo y solo**
(«ganá el capítulo 1»): con un «te falta» delante salía «te falta ganá el
capítulo 1», que no es español de ninguna parte.

**Y antes de enseñárselo** hay que recordarle que juegue los tres capítulos para
llenar los récords: sin eso el rival no existe. Esos ya están puestos.

### Aparte, cuando haya un hueco

**El momento de Boo en la línea del tiempo** (23 de diciembre de 2024, el
arreglo de Hot Wheels, el lazo amarillo) y sacarle su frase comodín. No bloquea
ninguna fase y no toca el juego: es solo contenido, así que cabe en una sesión
corta o con pocos créditos. Sigue abierto cómo entra una fecha tan anterior a
todo lo demás en la línea.
