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
| Al caer | Vuelve al último hito. Intentos infinitos |
| Duración | 15-25 minutos la primera vez |
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

Son dos decisiones en un solo dedo: **cuándo** (posición y dirección) y **cuánta
fuerza**. Con eso alcanza para que haya techo de habilidad sin pedirle un
segundo dedo.

En computadora, la barra espaciadora hace lo mismo. No es el escenario
principal, pero que no quede tullido.

### Valores para empezar a tantear

Mundo lógico de 360 × 640, escalado al alto de la pantalla. Estos números son un
punto de partida, no un resultado: se ajustan jugando.

- Gravedad: 2200 px/s²
- Impulso mínimo (carga 0): 700 px/s · máximo (carga 1): 1400 px/s
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
almohadas. **La tortuga se dibuja a mano en código** (caparazón, cabeza, cuatro
paticas, dos fotogramas de caminata y uno de salto). Nada de imágenes
generadas: pesan y hay que cifrarlas.

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

## El orden de mañana

1. **La carta.** Primero, mientras hay cabeza fresca: él cuenta qué le quiere
   decir, se redacta con su voz, se guarda en `private/publicable/` y el hook la
   cifra. Sin la carta, el juego no tiene para qué.
2. **El motor pelado** (60-90 min): canvas, paso fijo, gravedad, una plataforma,
   la tortuga caminando, cargar y saltar. Sin arte y sin mundos. **No se sigue
   hasta que saltar se sienta bien**; si el gesto no es rico, lo demás no lo
   salva.
3. **Plataformas, cámara, hitos y caída.**
4. **Capítulo de Boo entero**, con su material y su traba. Es la plantilla de
   los otros dos.
5. **Ovi y Nico**, que ya son variaciones.
6. **Los poderes**, los tres, con su gasto.
7. **El último trecho y la carta.**
8. **La entrada por la luna de la portada** y el guardado del progreso.
9. **El colado**, que es adorno y va al final aposta: si el tiempo aprieta, es
   lo primero que se cae sin que nadie lo note.
10. **Prueba en el teléfono de verdad**, y ajuste de números.

Cabe en una sesión larga si el arte se mantiene simple. Si hay que partirlo, el
corte natural es después del punto 5.

### Cómo se prueba

Como el libro del diccionario: un `private/notas/probar-luna.mjs` que corra el
motor sin dibujar, con una secuencia de saltos grabada, y compruebe que cada
capítulo se puede terminar y que ningún salto exigido es imposible con carga
máxima. Que la dificultad la decida el diseño y no un descuido de números.

---

## Lo que queda abierto

- **El día que Boo llega a la línea del tiempo**: la fecha ya está —23 de
  diciembre de 2024— y hay que escribir el momento y sacarle a Boo la frase
  comodín. No bloquea el juego, pero conviene hacerlo el mismo día para que las
  dos cosas cuenten la misma historia.
- **Si el capítulo de Nico da para dos hitos más**: se decide jugándolo.
- **Los récords de él**: hay que recordarle que juegue los tres capítulos antes
  de enseñárselo, o el rival no existe.
