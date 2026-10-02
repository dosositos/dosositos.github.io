# Plan de octubre — pulir lo que ya está

Escrito el 1 de octubre de 2026. La web está publicada y ella ya la usa:
**todo lo que llegue a `main` lo ve en minutos.** Por eso cada fase de aquí
se cierra con `npm run typecheck`, `npm run revisar`, `npm run build` y
fotos en un teléfono de 390 px antes de subirse.

## La regla de esta vuelta: el juego de la luna no se toca

Ella ya lo jugó y está cerrado. Nada de lo de abajo cambia cómo se juega:
ni la física, ni las plataformas, ni lo que se ve o se oye dentro del canvas.
Lo único permitido allá adentro son los arneses de `scripts/juego-luna/`.

Por eso se descartan dos ideas que estaban sueltas en `PLAN.md`:

- **La rayita de la última carga.** Le enseña a medir la fuerza, o sea,
  vuelve el juego más fácil. Eso es jugabilidad.
- **La luna que crece con los hitos y las estrellitas al pisarlos.** Son
  solo adorno, pero viven en el pintor del canvas, y un error ahí deja la
  pantalla en negro sobre algo que ella ya terminó. No vale el riesgo.

## Fase 0 — lo que ya se hizo hoy

- **`npm run luna:ver` vuelve a andar.** Al entrar por el capítulo uno salta
  el cuento con su botón, y después del bautizo salta la escuelita. Para el
  capítulo dos y el tres se siembra `escuelita: 'saltada'`. Probado en el 1 y
  el 2: el canvas pinta y no hay errores en la página.
- **Los 16 puntos y coma** de `momentos.ts` y `diccionario.ts` se fueron: se
  cambiaron por punto o por «, y». Eran de redacción, no estaban en ninguna cita.

## Fase 1 — el marco que comparten todas las páginas

Es lo que más se nota en el teléfono y lo que menos se ve en el código.

1. **La página baila de lado.** El peluche escondido en la esquina de
   abajo a la derecha (`PeluchesEscondidos.tsx`, `right-4` + `x: 32%` + el
   giro) se sale 12 px y en Android la página entera se arrastra de lado.
   Se corta con `overflow-x-clip` en el envoltorio de `App.tsx`; el peluche
   sigue asomándose igual porque el corte es en el borde de la pantalla.
2. **Volver atrás devuelve al mismo sitio.** Hoy `ScrollAlInicio` sube al
   inicio siempre, también con «atrás»: si ella sale de un momento, la línea
   del tiempo (unos 7000 px) se le reabre arriba de todo. Al avanzar se
   sube; al volver (`POP`) se restaura la posición guardada.
3. **El notch.** `viewport-fit=cover` está puesto pero ningún elemento usa
   `env(safe-area-inset-*)`. Los botones fijos y el pie lo usan ahora.
4. **La casita y el tema dejan de tapar texto.** Al bajar se esconden y al
   subir vuelven, que es lo que hace cualquier app en el teléfono.
5. **Movimiento reducido para todo.** `<MotionConfig reducedMotion="user">`
   en `App`: hoy el CSS lo respeta pero los `motion.*` de casi todas las
   páginas siguen moviéndose.
6. **Pasar de página con una transición.** Hoy las rutas cambian de golpe.
   Va un fundido corto con un poco de subida, como hoja que se acomoda. La
   luna queda fuera: tiene su propia entrada con la luna latiendo.

## Fase 2 — la librería: trazos a mano

**Rough Notation** (`rough-notation`, 0.5.1, unos 4 kB comprimidos). Dibuja
subrayados, círculos, resaltados y corchetes que parecen hechos con
marcador, y se animan como si alguien los estuviera trazando. Es justo lo que
le falta al scrapbook: hoy hay papel, cinta y letra manuscrita, pero nadie
raya nada encima.

**Por qué esta y no otras.** Se miraron tres más:

- `embla-carousel`: el visor de fotos ya desliza con el `drag` de Motion,
  así que traería una segunda forma de hacer lo mismo.
- `vaul` (cajones que suben desde abajo): no hay ningún panel que lo pida.
- `react-rough-notation`: es un envoltorio de la misma librería. Un hook
  propio de veinte líneas hace lo mismo, y además puede respetar el
  movimiento reducido (sin animación, el trazo aparece de una) y leer los
  colores del tema activo.

**Cómo se usa.** Un hook en `src/lib/trazo.ts` (`useTrazo`) que dibuja al
entrar en pantalla, una sola vez, con un color de los que ya existen. Nada de
colores nuevos. Dónde va:

- **Portada:** un subrayado ondulado bajo el título y un círculo alrededor
  del número grande del contador.
- **Estadísticas:** un círculo alrededor de la cifra ganadora de cada duelo y
  un resaltado sobre la cifra más grande.
- **Diccionario:** un resaltado de marcador sobre la palabra de cada entrada.
- **Momento:** un corchete al margen de la nota de osito, como anotación a
  mano en el borde de la hoja.
- **Juego:** un círculo sobre el puntaje final.

Es una sola dependencia, y Motion ya cubre todo el movimiento: con esto no
hace falta otra librería de animación.

## Fase 3 — cada página

### Portada
- **Escritorio:** la luna queda cortada con una raya vertical en el borde del
  `max-w-5xl`. Tiene que llegar al borde de la pantalla, como en el teléfono.
- El botón para cambiar el formato del contador mide unos 28 px: se sube a 44.
- En el formato «vivo», el número parte la línea y la tarjeta cambia de alto
  cada segundo. Se fija el alto.
- Las tarjetas de sección solo responden al hover. Les va un `whileTap`.

### Línea del tiempo
- «abrir →» solo aparece con hover, así que en el teléfono no existe. Va
  siempre visible, en manuscrita.
- Las letras de 10 px (las fechas y los rótulos) suben a 12 px como mínimo.
- El separador de año se queda pegado arriba (`sticky`) mientras se recorre
  ese año.
- Las tarjetas destacadas llevan cinta adhesiva y un giro leve, como la
  galería.
- **La versión horizontal para computadora** (lo único atrasado del plan
  original): desde 1024 px, una cinta con scroll horizontal y `scroll-snap`.
  El tallo va al medio y las tarjetas se alternan arriba y abajo. La rueda
  del ratón mueve la cinta, y hay flechas a los lados. En el teléfono queda
  exactamente como está.

### Momento
- «volver» y «← toda nuestra historia» miden 36 px: suben a 44.
- Mientras la foto se descifra hoy solo se ve el color dominante. Va un brillo
  de papel que pasa por encima, como el esqueleto que ya tiene el chat.
- El visor de fotos tiene flechas visibles en computadora.

### Juego («¿quién dijo esto?»)
- El marcador queda debajo de la casita y el tema. Se baja lo necesario.
- En lugar de «3 / 10» en letra chiquita, va una tira de diez estrellitas
  de papel que se van llenando.

### Diccionario
- Las pestañas del índice miden 30 px de ancho con letra de 9 px. Se agrandan
  hasta que se puedan tocar sin atinarle.
- Los textos del expediente de 10 px suben a 12.

### Playlist
- El retraso escalonado se acumula y la canción 20 espera un segundo entero
  para aparecer. Se pone un tope.
- Mientras carga el reproductor de Spotify se ve un hueco. Va un esqueleto
  del mismo alto.
- En computadora, el reproductor queda pegado a la izquierda y la lista a la
  derecha.

### Estadísticas
- Las cifras cuentan hacia arriba al entrar en pantalla.
- En los duelos con porcentaje extremo se recorta 🐻. Los apodos se acomodan
  en varias líneas cuando no caben.

### Frasco
- «sacar otra» y «guardar» suben a 44 px.
- El papelito se desdobla al salir, con un pliegue.

## Fase 4 — cerrar

1. `/repasar-textos` sobre todo texto nuevo de pantalla.
2. `npm run typecheck`, `npm run revisar`, `npm run build`.
3. Fotos de cada página a 390 px y a 1440 px, mirándolas una por una.
4. Los arneses del juego que miran el canvas (`luna:ver`, `luna:puerta`),
   para comprobar que la fase 1 —el marco que lo envuelve— no lo rompió.
5. Commit por fase, merge de `nico-cobijas` a `main` y push.

## Lo que queda fuera porque necesita algo de Armando

- El momento de Boo (23 de diciembre de 2024) y los dos borradores: «El día
  que dijiste que sí» y «Las flores que armamos juntos». Hace falta que llenés
  `private/plantilla-momentos.md`.
- La pasada en el Android de ella que está en `PLAN.md`.
