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
| Poderes | Uno por peluche ganado. **Se gastan**: un uso por capítulo, sin recarga |
| Al caer | Vuelve al último hito. Intentos infinitos. Baja del hito y ya es caída, aunque quede parada más abajo |
| Tamaño de un capítulo | 32 plataformas y 5 lazos, uno cada seis o siete (decidido el 28 de agosto) |
| Aguantar de más | Se agota y se desmaya. Pierde el salto y hay que esperarla |
| Duración | 12-15 minutos la primera vez |
| Marcador | El récord de él, esperándola en cada capítulo |
| Premio | Una carta suya, solo ahí. Se escribe con él en la sesión |
| Entrada | Escondida: se toca la luna de la portada. La luna se hace notar |
| Camino | Cada mundo con su material |
| El colado | Se cuela y estorba |
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

Los tres números viven en `CANSANCIO`, en `luna.ts`. **Falta contarlo en el
cartel de la primera pantalla**, junto con lo del mantener y soltar.

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
  y algún looping de fondo. Carritos parqueados de adorno. Un lazo amarillo
  marca cada hito.
- **La traba:** la pista **se desvanece** unos segundos después de que despega
  de ella. No hay vuelta atrás. Es la traducción de su frase de la esquina
  («nadie me tomó fotos»): lo que pisó, se borra.
- **Ayuda del mundo:** algunos tramos son de impulso, y si cae ahí la lanzan
  sola. Sirven para enseñarle sin explicarle qué se siente un salto largo.
- **Se gana:** *el empujón*. Un impulso horizontal en pleno aire, una vez por
  capítulo, que salva un salto que salió corto.
- **Es el primero**, así que es el que enseña: los primeros diez saltos son casi
  regalados y no hay desvanecimiento hasta pasado el primer hito.

### 2 · Ovi — las cajas

Ovi apareció en una caja de peluches viejos y se vino con él ese día. Es todo
rosa pastel y tiene complexión de gimnasio.

- **Material:** cajas de cartón apiladas, peluches viejos asomando, cinta de
  embalaje. Las cajas son de tamaños distintos y algunas están mal apiladas.
- **La traba:** las cajas **ceden**. Al pisarlas se inclinan hacia el lado con
  más peso, así que el punto donde aterriza cambia el suelo del siguiente salto.
  Y hay huecos que solo se pasan con la barra al tope: no hay manera de pasarlos
  a medias.
- **Se gana:** *el salto de gimnasio*. Un salto a fuerza máxima con un extra,
  una vez por capítulo, para el hueco que no da.

### 3 · Nico — las almohadas

El primogénito. Rosa pálido, de pelo rizado, comprado para que la acompañara
mientras dormía. Es el capítulo más importante y va al final.

- **Material:** almohadas, sábanas revueltas, cobijas colgando. Luz de
  madrugada. La luna ya se ve grande.
- **La traba:** las almohadas **se hunden mientras está parada encima**. Se
  hunden despacio, pero cargar la barra toma tiempo, y ahí está el nudo: el
  mundo final ataca directamente la mecánica central del juego. Hay que decidir
  entre el salto seguro y el salto bueno.
- **Se gana:** *Nico te agarra*. Perdona una caída: en vez de bajar al hito,
  aparece debajo y la devuelve a la plataforma. Una sola vez.

### 4 · El último trecho

Un tramo corto, de tres o cuatro minutos, con los **tres poderes disponibles,
uno cada uno**. Sin material nuevo: es cielo abierto y la luna. Se juega con
todo lo aprendido y ahí se ve si lo aprendió.

Arriba está la carta.

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
único `useState` para lo que cambia de veras (capítulo, hito, poderes gastados).

### Archivos previstos

```
src/paginas/Luna.tsx              ← la página: monta el canvas y el HUD
src/juego-luna/motor.ts           ← bucle, paso fijo, física, colisiones
src/juego-luna/entrada.ts         ← pointer y teclado → cargar y soltar
src/juego-luna/dibujo.ts          ← pintar el mundo, la cámara y la tortuga
src/juego-luna/mundos.ts          ← las trabas de cada capítulo
src/juego-luna/progreso.ts        ← localStorage: capítulo, récords, poderes
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
ningún lado y así se queda hasta la fase 9. Todo lo de en medio puede quedar a
la mitad sin que nadie lo note. **La fase 9 es la única que publica**, y no se
empieza hasta que lo demás esté cerrado.

| # | Fase | Deja jugable | Se puede parar |
|---|---|---|---|
| 0 | La carta | — | Sí |
| 1 | El motor pelado | El salto, en una plataforma | Sí |
| 2 | Mundo, cámara, hitos y probador | Un nivel de prueba, de punta a punta | Sí |
| 3 | Boo entero | Un capítulo de verdad | Sí, y es buen sitio |
| 4 | Ovi | Dos capítulos | Sí |
| 5 | Nico | Los tres capítulos | Sí |
| 6 | El último trecho y la carta | El juego completo | Sí |
| 7 | Teléfono y números | El juego, pero que se sienta bien | Sí |
| 8 | El colado | Igual, con chiste | Sí |
| 9 | **La entrada por la luna** | El juego, para ella | Fin |

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
los lazos amarillos en los hitos, el cartel de presentación con su retrato
bordado, los primeros diez saltos regalados y **el empujón**, que se gana al
cerrarlo.

El poder va dentro de su capítulo y no en una fase aparte: así el capítulo queda
completo y se puede parar sin dejar un poder colgando.

Esta es la plantilla. Es la fase más cara de las tres y las dos siguientes
cuestan bastante menos porque ya son variaciones.

### 4 · Ovi

Cajas apiladas que ceden hacia el lado con más peso, los huecos que solo se
pasan con la barra al tope, y **el salto de gimnasio**.

### 5 · Nico

Almohadas que se hunden mientras está parada encima, luz de madrugada, la luna
ya grande, y **Nico te agarra**. Aquí se decide, jugándolo, si da para dos hitos
más.

### 6 · El último trecho, la carta y el marcador

Cielo abierto con los tres poderes, uno cada uno. El conteo de pasitos por
capítulo, guardado, y la comparación con el récord de él (vacío no muestra
nada). Al llegar arriba, la carta descifrada.

**Cerrando esta fase el juego está entero y sigue escondido.** Si los créditos
se acaban justo aquí, se acaban en el mejor lugar posible.

### 7 · Teléfono y números

Se prueba en el Android de ella, entrando a `/luna` escribiendo la ruta a mano,
y se ajustan los números en `luna.ts`. También `prefers-reduced-motion` y los
sonidos con su interruptor, apagados de fábrica.

### 8 · El colado

El pato con peluca. Es adorno y va acá aposta: si el tiempo o los créditos
aprietan, se salta entero sin tocar nada más.

### 9 · La entrada por la luna y cosméticos extras

La luna de la portada tocable, con su brillo lento cada quince o veinte
segundos; la transición de cámara desde la portada; la luna más llena si ya
terminó, para releer la carta sin volver a jugar.

Es la fase que hace visible todo lo anterior, y por eso es la última. Antes de
empezarla hay que **recordarle que juegue los tres capítulos** para llenar los
récords: sin eso el rival no existe.

Añade un espacio para modificar al personaje, accesorios customizables para el personaje de la tortuga, entre otras cosas que se podrán desbloquear tras ciertos hitos. Puedes entrevistarme más sobre este tema cuando lleguemos a esta fase.

### Aparte, cuando haya un hueco

**El momento de Boo en la línea del tiempo** (23 de diciembre de 2024, el
arreglo de Hot Wheels, el lazo amarillo) y sacarle su frase comodín. No bloquea
ninguna fase y no toca el juego: es solo contenido, así que cabe en una sesión
corta o con pocos créditos. Sigue abierto cómo entra una fecha tan anterior a
todo lo demás en la línea.
