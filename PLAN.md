# Plan — 10 días hasta el 24 de agosto

> **Fecha de entrega: lunes 24 de agosto de 2026** — dos años de habernos conocido.
> Ritmo: ~2 h por día. Lo que hace cada uno está separado, porque la mitad del
> trabajo es material que solo vos podés reunir.

---

## Estado general

- [x] **Día 0 (14 ago)** · Entorno, estética, contadores, portada — **y bastante más**
- [x] **Día 1 (15 ago)** · Línea del tiempo en móvil · **+ el chat de Instagram**
- [x] **Día 3 (16 ago)** · Fotos cifradas: polaroids, galería, ampliar al tocar
- [x] **Día 4 (17 ago)** · El candado: cifrado y contenido privado
- [x] **Día 5 (17 ago)** · Juego "¿quién dijo esto?"
- [ ] Día 2 (18 ago) · Línea del tiempo horizontal en computadora
- [x] **Día 6 (18 ago)** · Frasco de mensajitos: reescrito, cifrado y publicado
- [x] **Día 6 bis (19 ago) · Diccionario oso** — libro, 37 entradas y las citas
      cifradas (22 ago)
      (el "un día como hoy" ya está, adelantado el 17)
- [ ] Día 7 (20-21 ago) · El sobre de apertura, easter eggs
      (los peluches escondidos ya están, adelantados el 17)
- [ ] Día 8 (22 ago) · PWA, música, celebraciones del calendario, pulido
- [ ] Día 9 (23 ago) · Pruebas en móvil de verdad, ensayo general
- [ ] **Día 10 (24 ago) · Entregar** 🌻

*(el día 2 quedó atrás porque el 16 se adelantaron las fotos y el 17 el juego;
la web ya está publicada y se ve en el teléfono desde el 17 de agosto)*

---

## ✅ Día 0 — hecho el 14 de agosto

### Entorno y publicación
- [x] Vite 8 · React 19 · TypeScript 7 · Tailwind 4 · Motion · React Router 7
- [x] Repositorio `dosositos/dosositos.github.io` publicado con la identidad correcta
- [x] Identidad de git **local** al proyecto (la cuenta profesional no se toca)
- [x] Workflow de GitHub Actions listo para publicar con cada push
- [x] `private/` sellado en `.gitignore` y comprobado con `git check-ignore`

### Estética
- [x] Paleta nocturna sobria, con las flores y los peluches como colores con nombre
- [x] Modo osito (azul/dorado) y modo osita (ciruela/rosa), con el interruptor 🐻/🎀
- [x] Tipografías: Fraunces para títulos, Nunito para el cuerpo, Caveat manuscrita
- [x] Cielo estrellado con posiciones estables y lluvia de pétalos
- [x] Papel, cinta adhesiva y resplandor como utilidades reutilizables
- [x] `prefers-reduced-motion` respetado en todo

### Funciones
- [x] Los dos contadores, con toggle de tres formatos
- [x] Cálculo de fechas en horario de Nicaragua, probado contra casos límite
- [x] Cuentas regresivas: aniversario de novios y próximo 24
- [x] Celebraciones automáticas con texto propio (aniversarios, mesiversarios, cumpleaños)
- [x] "Quién ama más hoy", que alterna solo y sin guardar nada
- [x] La historia del oso blanco, con el scroll marcando el ritmo
      *(el 16 de agosto salió de la portada: no terminaba de quedar ahí.
      El componente y su texto siguen enteros, falta decidir dónde va)*
- [x] El ranking del drama (los emojis) con su remate
- [x] Playlist de Spotify incrustada, con espacio para el porqué de cada canción

### Adelantado de días siguientes
- [x] **Burbujas de chat** con citas de respuesta y reacciones *(era del día 4)*
- [x] **Cápsula del momento** a pantalla completa con URL propia *(era del día 3)*
- [x] Primer momento completo y real: la conversación del 25 de agosto
- [x] **La puerta con la frase-contraseña** *(era del día 4)* — valida descifrando
      de verdad, así que la respuesta no está en ninguna parte del sitio
- [x] Página de estadísticas con los números del chat, con su fecha de corte
- [x] Volver arriba al cambiar de página (las animaciones empezaban a media altura)

### Herramientas
- [x] `chat:parsear` — 154.726 mensajes procesados
- [x] `chat:frases` — 50.489 candidatas para el juego
- [x] `chat:dia` — la conversación de cualquier fecha, o buscar una frase
- [x] `fotos:optimizar` — a AVIF en dos tamaños
- [x] `secretos:cifrar` + descifrado en el navegador (AES-256-GCM)

---

## Lo que falta que hagas vos

Ordenado por lo que más nos atrasa si no llega:

1. **La lista de momentos** → `private/plantilla-momentos.md`. Es lo único que
   de verdad nos atrasa. Van **13 momentos escritos** (del 24 de agosto al 21
   de noviembre de 2024) más 2 apuntados sin escribir: el 24 de noviembre («el
   día que dijiste que sí») y el 1 de enero (las flores de lego). Siguen 2025
   entero y lo que va de 2026. Con la fecha y dos líneas por momento me alcanza.
2. **Las fotos** → a `fotos-originales/`. Hay 26 ya optimizadas y cifradas
   (fotos y videos); las que falten van de las mismas: las tirás ahí y corré
   `npm run fotos:optimizar` (desde el 16 de agosto eso ya no las publica en
   claro, las cifra).
   Los **pies de foto**: escritos en los momentos, ninguno en los "instantes".
   No es obligatorio, pero se leen lindo.
3. **Los retratos de Ovi, Boo y Nico** → hoy están puestos con emoji genérico
   (🦍 🐼 🧸) y eso se nota: el gorila del emoji no es Ovi. Hacen falta las tres
   fotos. Cómo tomarlas está más abajo, en «Los retratos de los peluches».
4. **El nacimiento de Boo** → es el único de los tres sin historia. Contame
   cuándo llegó, quién se lo dio a quién y qué pasó ese día, aunque la fecha
   quede lejísimos del orden que llevamos: sin eso, Boo anda por la web con una
   frase comodín.
5. **Los mensajitos del frasco** → 20-30 frases cortas tuyas. No bloquea nada:
   el frasco ya funciona con 29 borradores míos en `src/content/mensajitos.ts`.
   Reescribilos con tus palabras — es un archivo de texto, uno debajo del otro,
   y no hay que tocar ni una línea de código.
6. **Decidir qué momentos son privados** → los que lleven `privado: true`
   pedirán la contraseña otra vez. Hoy no hay ninguno, y puede quedar así: el
   candado de la entrada ya cubre todo.
7. **El diccionario oso** → las palabras que solo existen entre ustedes. Bloquea
   el día 6.
8. **La dedicatoria del sobre** → lo primero que va a leer. Tomate tu tiempo.
   Bloquea el día 7.

### Ya hecho, para no volver sobre eso

- ~~**La frase en `.env`**~~ — hecha. El cifrado corre solo con el hook y
  `npm run build` se cae si algo quedó sin cifrar.
- ~~**Revisar las frases del juego**~~ — 341 aprobadas el 16 de agosto, más 20
  inventadas revisadas por vos el 17. Si querés más, corré `npm run chat:frases`
  y aprobá: el juego se rehace y se cifra solo.
- ~~**Activar Pages**~~ — la web está publicada y se abre en el teléfono.

**La contrapartida de la frase en `.env`, para que no se te olvide:** dejó de
vivir solo en la cabeza de ustedes dos y está escrita en tu computadora. Contra
un desconocido con el enlace protege igual; contra alguien con acceso a tu
máquina, o contra un respaldo de la carpeta, ya no.

---

## Detalle por día

### Día 1 · Línea del tiempo (móvil)
- [x] Vos: los primeros 5 momentos + el export de Instagram
- [x] Yo: línea vertical con tarjetas alternando lados
- [x] Yo: cada momento con su flor, su marcador y su animación de entrada
- [x] Yo: enlace de cada tarjeta a su cápsula
- [x] Yo: pasar al momento anterior/siguiente sin volver a la lista
- [x] Vos: 5 momentos más, hasta el 19 de octubre de 2024 (16 ago)
- [x] Yo: escritos y con su conversación cifrada — la primera foto, la pizza de
      chimichurri, el cumpleaños 20, el nacimiento de Nico y los videos
- [x] Yo: los "instantes" — fotos sin momento exacto, intercaladas en la línea
- [x] Vos: 2 momentos más, hasta el 21 de noviembre de 2024, y 3 videos sueltos
      de octubre (17 ago)
- [x] Yo: escritos y con su conversación cifrada — las papas con helado y el
      nacimiento de Ovi; los tres videos quedaron como "instantes"
- [x] Vos: apuntados el 24 de noviembre y el 1 de enero (salen en la línea con
      su "por escribir")
- [ ] Vos: escribir esos dos y seguir con 2025 en adelante

### Día 1 bis · Instagram como segunda fuente
- [x] `chat:instagram` — 6.077 mensajes, con la codificación de Meta arreglada
- [x] `chat:dia` lee las dos fuentes juntas y marca cuál es cuál (📷 / 💬)
- [x] Los momentos de agosto llevan sus burbujas reales de Instagram
- [x] `chat:frases` mira las dos apps y anota la fuente de cada candidata
- [x] Estadísticas: bloque de Instagram + el total de las dos apps
- [ ] Los reels: 1.171 compartidos, todavía sin usar — sección aparte, otro día

### Día 2 · Línea del tiempo (computadora)
- [ ] Yo: versión horizontal que avanza con el scroll
- [ ] Yo: el cambio entre las dos versiones según el ancho de pantalla
- [ ] Yo: que el teclado también sirva para recorrerla

### Día 3 · Fotos — adelantado al 16 de agosto
- [x] Vos: decidido — **todas** las fotos y videos van cifrados
- [x] Yo: `fotos:optimizar` deja las AVIF en `private/media/`, no en `public/`
      (antes las publicaba en claro), y encadena solo el cifrado
- [x] Yo: `cifrar-medios.mjs` → `public/cifrado/media/` — binario `[IV][cifrado]`,
      no base64 (ahorra el 33 % del peso)
- [x] Yo: una sal para todo el lote, así la llave se deriva **una sola vez** por
      visita — 55 ms en la computadora, en vez de una vez por foto
- [x] Yo: las miniaturas también cifradas — un thumbnail en claro ya enseña la foto
- [x] Yo: nombres opacos (`0677bb9b….bin`, hash de la frase con el nombre real)
      y la tabla de nombres dentro del índice cifrado: los archivos no delatan
      ni cuántos momentos hay
- [x] Yo: medidas y color promedio de cada foto en el índice, para reservar el
      hueco exacto mientras descifra (y las medidas del mp4, leídas del `tkhd`)
- [x] Yo: `<FotoCifrada>` — descifra y arma un `blob:` en el navegador, con caché
- [x] Yo: polaroids con cinta adhesiva y giro leve, estable entre visitas
- [x] Yo: ampliar al tocar, con deslizar en el teléfono y teclado en la compu
- [x] Yo: carga diferida (`loading="lazy"`) y aparición suave
- [x] Yo: `revisar` se cae si aparece algo en claro en `public/media/` o si un
      momento pide una foto que no existe
- [x] Yo: cerrar la puerta (`olvidarClave`) borra de memoria fotos y chats
- [x] Vos: aprobadas — se ven en el teléfono (20 fotos y 6 videos)
- [ ] Vos: los pies de foto que faltan (los 5 "instantes")
- [ ] Yo: las fotos de los momentos que faltan, según vayan llegando

**Los videos van igual, con una salvedad:** cifrados no se pueden ir
reproduciendo mientras bajan, hay que bajarlos enteros y armarlos en memoria. Van
6 y el más pesado no llega a 2,5 MB, así que no se nota. Si algún día entra uno
de 40 MB, ese hay que pensarlo aparte.

### Día 4 · El candado — cerrado el 17 de agosto
- [x] Yo: la puerta con la frase-contraseña y su pista
- [x] Yo: que la clave se recuerde durante la visita y no la pida a cada rato
- [x] Vos: decidido — **todas** las conversaciones reales van cifradas
- [x] Yo: los chats movidos a `private/publicable/chats.json` y cifrados
- [x] Yo: seguro en `secretos:cifrar` — si la clave no abre lo ya publicado, no
      cifra nada (un error de tipeo dejaba la puerta cerrada para siempre)
- [x] Yo: el cifrado corre solo con un hook al tocar `private/publicable/`,
      y no rehace nada si el contenido no cambió
- [x] **Vos: `CLAVE_DOSOSITOS` en `.env`** — desde ahí todo se cifra solo
- [ ] Vos: decidir si algún momento lleva `privado: true` (hoy ninguno, y puede
      quedarse así: la puerta de entrada ya cubre todo)

### Día 5 · El juego — adelantado al 17 de agosto
- [x] Vos: aprobar frases — 341 aprobadas (254 de uno solo, 87 de los dos)
- [x] Yo: el puntaje de `chat:frases` reescrito para buscar lo gracioso y no lo
      bonito (dedazos, cosas concretas; la cursilería genérica resta)
- [x] Yo: **emparejar cómo escribimos** antes de que la frase entre al juego.
      Sin eso el juego se resolvía con la primera letra: yo escribo en
      minúscula, abrevio («m», «t», «q», «cn») y me como tildes; ella empieza
      en mayúscula y escribe completo. La tabla vive en
      `private/juego-normalizacion.json` y los dedazos NO se tocan
- [x] Yo: se avisa en la primera pantalla, porque hacerlo callado sería trampa
- [x] Yo: 3 vidas, puntaje con racha y las cuatro opciones (osito, osita, los
      dos, ninguno)
- [x] Yo: al responder, **de dónde salió la frase** — tres mensajes antes y tres
      después, cifrados igual que todo. Las de "los dos" traen un ejemplo de
      cada uno
- [x] Yo: finales personalizados según el puntaje, con lo de mandar la captura
- [x] Yo: `juego:preparar` corre solo con el hook al tocar las frases, y
      `npm run build` se cae si el juego cifrado se quedó atrás
- [x] Vos: revisadas las frases inventadas — quedaron 20, para que «ninguno»
      pueda ser la respuesta buena
- [x] Vos: jugado en el teléfono. Salió un fallo: a veces se resaltaba la
      burbuja equivocada en el contexto
- [x] Yo: arreglado — la burbuja se busca por parecido y, si no hay una clara,
      la frase se queda sin contexto antes que señalar la que no es
- [ ] Vos: si al jugar ves una frase que se resuelve sola, decímela y la
      arreglo en `private/juego-normalizacion.json`

### Día 6 · Secciones cortas
- [ ] Yo: diccionario oso-español
- [x] Yo: frasco de mensajitos con estrellitas de papel — adelantado al 17
      de agosto. Las estrellitas están dibujadas (no son el emoji ⭐: cada una
      lleva el color del mensajito que trae doblado adentro) y el nivel del
      frasco baja según las que le falten por abrir. No se repite ninguna
      hasta haberlas visto todas; cuando se acaban, se vuelve a llenar solo
- [ ] Los dos: decidir cómo se mueven las estrellitas dentro del vidrio. Hoy
      están quietas: entran una por una al cargar y ahí se quedan
- [ ] Vos: reescribir los 29 mensajitos con tus palabras
- [x] Yo: "un día como hoy" en la portada, sacado del chat — adelantado
      al 17 de agosto
- [ ] Vos: ojear los días que más importan (`npm run dia:preparar -- --ver 11-24`)
      y cambiar a mano los que no te gusten

**Cómo funciona:** `npm run dia:preparar` recorre los dos chats y para cada
fecha del calendario elige, año por año, el mejor pedacito de ese día: hasta
siete burbujas donde hablen los dos, sin cortar a nadie a media parrafada y sin
terminar en "ya estoy en casa". Puntúa el cariño, las risas y las fechas
marcadas (cumpleaños, Navidad, año nuevo, aniversarios), y castiga lo de todos
los días ("buenos días", "ya llegué"). Deja fuera enlaces, códigos, lo subido de
tono y los días de pelea: nadie revisa esas frases antes de que ella las lea.

Dos reglas salieron de equivocarse primero. Una: entre dos mensajes del mismo se
piden menos de 12 minutos, pero **entre uno y la respuesta del otro se permiten
hasta 3 horas**. Lo mejor que tienen no son charlas seguidas — son ella
escribiendo cuatro mensajes a las 7 de la mañana y él contestando a las 9,
saliendo de clase — y pidiendo conversación corrida se perdían enteros los
aniversarios. Dos: **siete burbujas y no seis**, porque la carta de ella ocupa
cinco y con seis ya no cabía la respuesta de él.

Sale un archivo por mes (`private/publicable/dia-como-hoy-08.json`), así el
teléfono baja 70 KB y no los 366 días. Son JSON legibles: si un día quedó
flojo, se edita a mano y se cifra solo. Hoy hay recuerdo para 365 de los 366
días — el que falta es el 29 de febrero.

### Día 7 · Magia
- [ ] Vos: la dedicatoria
- [ ] Yo: el sobre que se abre la primera vez
- [ ] Yo: easter eggs (escribir "osito", código Konami, clics secretos)
- [x] Yo: Ovi, Boo y Nico escondidos por las esquinas — adelantado al 17 de
      agosto. Uno por página (Ovi en la portada, Boo en la línea del tiempo,
      Nico en el frasco), asomándose medio cuerpo y bamboleándose despacio.
      Al tocarlos salen, dicen algo y se quedan; con los tres, el premio
- [ ] Vos: las tres fotos, para jubilar los emojis (ver «Los retratos» abajo)
- [ ] Los dos: decidir si se quedan siempre en la misma página o si aparecen
      por ahí, cambiando de sitio
- [ ] Yo: el oso blanco como guiño recurrente
- [ ] **Los dos: decidir dónde y cómo va la historia del oso blanco.**
      Está fuera de la portada desde el 16 de agosto, esperando lugar

### Día 8 · Redondear
- [ ] Yo: instalable en el teléfono (PWA) con ícono propio
- [ ] Yo: música de fondo instrumental, silenciada por defecto
- [ ] Yo: repaso de todas las animaciones y de los tiempos
- [ ] Vos: leer todos los textos y corregir mi voz por la tuya

### Día 9 · Antes de entregar
- [x] Activar Pages y publicar de verdad — hecho el 17 de agosto
- [x] Probar en el teléfono real — de ahí salieron dos arreglos: las flores de
      la línea del tiempo no aparecían y el juego resaltaba mal el contexto
- [ ] Volver a probarlo en el teléfono al final, con todo puesto
- [ ] Revisar que nada privado quedó en claro en el repositorio
- [ ] Abrir el enlace con datos móviles, sin wifi
- [ ] Comprobar que la contraseña funciona en un teléfono limpio
- [ ] Leer todo en voz alta buscando erratas

---

## Consideraciones y riesgos

**La puerta no protege lo que hay detrás.** Frena a quien abra el enlace, y eso
ya es bastante — pero el contenido de `src/content/` viaja dentro del código de
la página, así que alguien que sepa mirar el código fuente puede leer los
momentos y los relatos sin escribir la contraseña. La protección de verdad es el
cifrado, y cubre lo que vive en `private/publicable/`: hoy el saludo, las once
conversaciones y las 360 frases del juego con su contexto. Más las fotos, que
van por su propio camino cifrado.

**Entonces, la regla:** lo que te importaría que leyera un desconocido **no puede
vivir en `src/content/`**. Va cifrado. Si algún relato te incomoda, decímelo y lo
muevo.

**Eso ya está resuelto para los chats.** Ninguna conversación real vive en
`src/content/`. Las once están en `private/publicable/chats.json`, se cifran
solas y salen publicadas como `public/cifrado/chats.enc`, que sin la frase de la
puerta es ruido. En `momentos.ts` solo queda la ficha: cuántos mensajes son y de
qué app — y eso no le dice nada a nadie.

**Y para el juego.** Ninguna frase suya ni mía está en claro: viven en
`public/cifrado/juego.enc` con los mensajes de alrededor. Lo único en claro es
la aclaración de la primera pantalla, que es mi voz explicando las reglas.

Como ella ya escribió la frase para entrar, el chat se descifra solo al abrir la
cápsula: no ve ningún candado extra.

**Lo que sí sigue en claro** son los relatos, los títulos y las notas
manuscritas. Son tu voz contando la historia, no frases de ella, y esa parte se
puede leer desde el código fuente. Si alguno te incomoda, decímelo y se va
también al archivo cifrado.

**El repositorio ya es público.** Todo lo que entre en `src/content/` se puede
leer desde hoy: los relatos, los momentos, las notas. No pasa nada mientras sea
contenido tierno.

**Las fotos van todas cifradas — decidido el 16 de agosto.** En un repositorio
público, una foto subida en claro la puede ver cualquiera aunque no tenga el
enlace del sitio. Así que las AVIF ya optimizadas no van a vivir nunca en
`public/`: la cadena es `fotos-originales/` → `private/media/` → cifrado →
`public/cifrado/media/`. Quien clone el repositorio entero se lleva bytes
ilegibles. La línea del tiempo se ve completa recién después de escribir la
frase; quien entre sin ella lee los relatos y ve los huecos.

**Eso ya no hay que vigilarlo a mano:** `npm run revisar` corre antes de cada
build y se cae si aparece una sola foto en claro en `public/media/`, si un
momento pide una foto que no existe, si un nombre de tercero se coló en lo que
se publica sin cifrar, o si los chats o el juego cifrados se quedaron atrás del
contenido.

**Lo que sostiene todo eso es la frase.** AES-256-GCM no se rompe, pero la
frase tiene que ser adivinable por ella y por nadie más. Si termina siendo algo
corto y obvio, las 250.000 vueltas de PBKDF2 encarecen un ataque por diccionario
sin volverlo imposible. Contra un curioso que se topa con el repositorio sobra;
contra alguien decidido a entrar ahí en concreto, manda la frase. Varias
palabras que solo tengan sentido entre ustedes dos resuelven las dos cosas.

**Repositorio privado no reemplaza el cifrado.** Esconde el código, pero lo que
Pages sirve es público por definición: cualquiera con la URL del sitio se baja
`/media/foto.avif` sin pasar por la web. El cifrado, en cambio, funciona sin
necesidad de repositorio privado.

**La pista de la contraseña dice de quiénes son los nombres.** Protege de un
extraño; no de alguien del círculo de ustedes que se ponga a adivinar. Si querés
blindarla, cambiá la pista por algo que solo ella pueda descifrar.

**Los números del chat son una foto fija, y así se presentan.** La página de
estadísticas dice "hasta el 14 de agosto de 2026" en vez de fingir que está al
día. Exportar el chat es un rollo y no hay que hacerlo seguido: cuando quieras
refrescarlos, corré `npm run chat:parsear` y actualizá `src/content/estadisticas.ts`,
incluida la constante `CORTE`. Ningún texto de la web depende de que estén al día.

**El límite de GitHub Pages es 1 GB.** Con las fotos en AVIF vamos sobrados,
pero si entran videos hay que vigilarlo. Los largos, a YouTube no listado.

**La web lleva `noindex`**, así que no aparecerá en Google. El enlace se comparte
a mano o no llega a nadie.

**Nada se prueba solo en la computadora.** Se va a ver en el teléfono de ella:
esa es la pantalla que manda.

---

## Si vamos con el tiempo justo

Se entrega igual recortando en este orden (lo primero que se cae, arriba):

1. Línea del tiempo horizontal en computadora → se queda la vertical en ambas
2. Diccionario oso
3. Música de fondo
4. Easter eggs (los peluches escondidos ya están; faltan los otros guiños)

*(el frasco de mensajitos salió de esta lista el 17 de agosto: ya está hecho)*

**Nunca se caen:** los contadores, la línea del tiempo, las cápsulas con fotos
y chats, y el sobre de apertura. Eso es el regalo.

---

## Decisiones ya tomadas (para no volver sobre ellas)

- **Fechas a medianoche**, no a mediodía: el día del aniversario tiene que decir
  "2 años" desde la mañana.
- **URLs con `#`**: GitHub Pages no reescribe rutas y sin eso recargar da 404.
- **Chats reconstruidos**, no capturas: se leen mejor en el teléfono, se animan,
  y no publicamos fotos de perfil.
- **Música por Spotify incrustado**, no MP3: subirlos sería ilegal y pesadísimo.
- **Cifrado del lado del navegador** en vez de repositorio privado: con cuenta
  gratuita, Pages exige que el repositorio sea público — y aunque no lo exigiera,
  lo que Pages publica se puede bajar por URL igual.
- **Todas las fotos cifradas**, no unas sí y otras no: decidir foto por foto se
  vuelve un trabajo interminable y una portada en claro ya enseña de más.
- **"Un día como hoy" va por meses**, no en un solo archivo: son 366 días con
  sus años, y bajar los 12 meses en la portada serían 800 KB para enseñar seis
  burbujas. Cada mes cifrado pesa unos 70 KB y el teléfono baja el que toca.
- **Fotos sin momento exacto = "instantes"** (`src/content/instantes.ts`): salen
  en la misma línea del tiempo como un punto pequeño con una línea manuscrita,
  sin cápsula, sin chat y sin "abrir →". Si a uno le empiezan a salir párrafos,
  deja de ser instante y pasa a `momentos.ts`.
- **Las frases del juego van emparejadas** en mayúsculas, abreviaciones y tildes,
  y se avisa en pantalla. Los dedazos no se tocan: son el chiste, y están
  repartidos entre los dos.
- **El `margin` de los `viewport` de motion lleva siempre los dos ejes**
  (`'-60px 0px'`). Suelto recorta también por los lados y deja invisible
  cualquier cosa angosta pegada al borde, que fue lo que pasó con las flores de
  la línea del tiempo en el teléfono.
- **El frasco recuerda por huella, no por texto.** De los mensajitos que ella
  ya abrió, en el teléfono queda guardado un número corto por cada uno, no la
  frase. El localStorage lo lee cualquiera que agarre el teléfono, y ahí no
  tienen por qué quedar los mensajitos en claro. De paso, reordenar
  `mensajitos.ts` no descuadra la cuenta.
- **Lo que cambia cada día se siembra con la fecha, no con `Math.random`.**
  Los escondites de los peluches salen de `numeroDelDia()` (día de Nicaragua)
  mezclado con el id de cada uno. Al azar de verdad, ella podría abrir la
  portada tres veces y ver a Ovi solo en la tercera, y mandarla a buscarlo por
  mensaje sería imposible.
- **Los retratos de los peluches son la única foto en claro.** Van en
  `src/assets/peluches/`. Son ellos, no ustedes dos, y el guiño necesita que se
  asomen al instante: descifrar antes de aparecer mata la gracia.
- **Todo el código en español**, incluidos nombres de variables y archivos.

---

## La próxima sesión — su teléfono, y ya

**Preguntame «¿qué toca para hoy?» y con eso alcanza.** Leo esta sección y
arrancamos por donde diga, sin que tengás que acordarte de nada.

**El plan está terminado.** Las diez fases del juego están hechas: la escuelita,
el cuento de antes, los tres capítulos, la llegada, la carta, los récords, el
volver a subir, la luna de la portada, el ropero, los sonidos, la música, el
colado y los peluches esperando en la luna. **Lo único que queda no se puede hacer sin ella delante**, o mejor dicho
sin su teléfono.

**Y está subido.** Se esperó hasta tenerlo entero, que era la condición, y el 5
de septiembre se empujó. De aquí en adelante, lo que se toque lo va a ver ella
en cuanto se suba: conviene mirarlo dos veces.

### Lo único que falta: su Android

Los sonidos quedaron el 5 de septiembre y `npm run luna:sonidos` los mide y los
prueba jugando. **Lo que falta de esta fase no se puede hacer acá**, y se junta
todo para una sola pasada en el teléfono de ella, que es el aparato que manda:

- **Si los sonidos y la música se oyen y no molestan**, que es lo único que un
  banco no puede contestar. Los dos están bajos aposta, y los dos se suben con
  un número: `VOLUMEN_MAESTRO` en `src/juego-luna/sonidos.ts` para los pops (el
  más fuerte pica en 0.23 de lo que aguanta el altavoz) y `VOLUMEN` en
  `src/juego-luna/musica.ts` para las canciones, que van en 0.08 y que hasta el
  6 de septiembre no hacían nada en el iPhone.
- **Si la música tarda mucho en arrancar** en su conexión. Se baja y se descifra
  la canción entera antes de sonar: acá es un segundo o dos, en datos móviles
  puede ser más. Si molesta, se bajan a 48 kbps en `preparar-musica.mjs`.
- **Si el pato se ve bien contra los tres mundos.** El banco lo dibuja contra el
  fondo pelado, y lo que hay que juzgar es su peluca verde contra el bambú de
  Boo, el cartón de Ovi y las almohadas de Nico. Ahí sí que tiene que gritar que
  ese bicho no es de ahí.
- Ajustar los números de `luna.ts` jugándolo de verdad.
- **Si la luna apagada de la portada, al 55 %, todavía se ve de día.** Es el
  número más delicado de esa esquina: más apagada deja de dar ganas de tocarla,
  y sin tocarla no se entera nunca de que hay una puerta.
- **Si las siete clases de la escuelita se le hacen largas.** Se pueden juntar
  las tres de los tramos raros en una sola si aburren.
- Si la tortuga del cuento, ya a 15, camina como tortuga o sigue apurada.

### Ya está subido

Se subió el 5 de septiembre, cuando el juego quedó entero. La web está en su
mano. No lo va a ver el primer día: la luna no se abre hasta que encuentre a los
tres peluches, y cada uno se esconde en una página distinta. Pero va a pasar
solo.

### Antes de eso, si querés

- **Jugá los tres de punta a punta** para ver la llegada y la carta con la clave
  puesta, que es como las va a ver ella. Y al llegar arriba fijate en el botón
  nuevo de la carta: «subir otra vez».
- **Leé la carta entera en el teléfono**, que son siete párrafos y ella la va a
  leer bajando con el pulgar.
- **Mirá el cuarto de Nico jugando**, que las plumas y el temblor de las sábanas
  no se pueden juzgar en una foto.
- **Y probate el ropero.** Once cosas, y de salida solo hay tres: el gorrito de
  fiesta, los lentes redondos y el corbatín. Lo demás se gana subiendo.
- **Jugá con el teléfono destapado**, que ahora el sonido viene encendido: los
  pops y las cuatro canciones de fondo. El botón para callarlo está en el cartel
  del capítulo, debajo de «vestirla».
- **Y esperá al pato.** Se cuela dos veces por capítulo, sin avisar, en la
  plataforma a la que ibas. No te va a matar: si saltás igual te parás en su
  lomo. Nadie te lo explica en ninguna parte y así tiene que quedarse.
- **Mirá cómo cierra un capítulo.** El peluche que estuvo esperando arriba baja
  de la luna y se te sube al caparazón, y recién ahí la luna se va. En el
  tercero no baja: se quedan los dos arriba y sobre eso se abre la carta.
- **Y abrí la portada mirando la esquina de la derecha**, que la luna ahora
  entra derivando y llega la última.

### La música sonaba a todo volumen en el iPhone — 6 de septiembre

**`audio.volume` no hace nada en iOS.** Safari la deja de solo lectura a
propósito: allá el volumen lo manda el botón del teléfono. No avisa, no tira
error, simplemente se ignora.

La música se ponía así, y con eso en el iPhone sonaba al volumen del archivo
—o sea a todo lo que diera— mientras el código decía 0,08. Los dos ajustes que
hiciste, de 0,11 a 0,08, nunca hicieron nada: estabas oyendo el archivo crudo
las dos veces.

Ahora el `<audio>` se cuelga de un `GainNode` del **mismo contexto** que los
pops, y el volumen se controla igual en los dos teléfonos. Se comparte el
contexto y no se crea otro: dos aparatos de audio en la misma página compiten, y
en el teléfono eso se paga.

Se pensó en bajarle el volumen a los mp3 con ffmpeg, que también habría
funcionado. Se descartó por tres razones: no arregla la causa —cualquier control
de volumen futuro se estrella contra la misma pared—, deja la decisión metida en
seis megas de archivos que hay que volver a convertir y a subir para retocarla, y
cada conversión cuesta un poco de calidad. Con el `GainNode` es un número.

`npm run luna:sonidos` ahora comprueba las dos cosas: que la música pase por un
GainNode, y que el `volume` del elemento se quede en 1. Eso segundo es la prueba
de que nadie la volvió a enchufar por el camino de antes, que es lo que se
rompería en silencio.

**Y ojo con el número.** El 0,08 de `VOLUMEN` en `src/juego-luna/musica.ts` es
la primera vez que va a hacer algo. Si ahora queda demasiado bajo, es esa línea.

### El peluche en la luna, y la luna que entra — 5 de septiembre, sexta vuelta

**Los peluches ya no salen solo en dos carteles de texto.** Boo, Ovi y Nico
están sentados encima de la luna desde el primer cuadro del capítulo, y se ven
ya en la cinemática de entrada: la luna se acerca a la pantalla, se ve quién
está esperando, y se va para arriba con él encima. El capítulo entero contado
sin una palabra.

Al pisar la cima, el peluche **baja de la luna y se le sube al caparazón**, y
recién entonces la luna se va. Ese orden lo elegiste vos y es el que importa: al
revés, la luna se iría con el peluche todavía encima. La salida pasó de 2,6 a
4,4 segundos para que quepan las dos cosas, y a la luna le quedan sus 2,6 de
siempre.

Se le sube **solo por ese momento**. No es ropita del ropero: la luna se va,
sale el cartel del cierre y la próxima vez vuelve a estar arriba esperando.

En el tercer capítulo no baja, porque ahí la luna no se escapa: sube ella. Se
quedan los dos arriba, uno al lado del otro, y sobre ese cuadro se abre la
carta. No hubo que programar nada para eso — alcanzó con no moverlo. Por eso el
peluche no se sienta en la coronilla de la luna sino corrido: ahí es donde ella
aterriza.

Es el retrato bordado, no un dibujo nuevo. Dibujar un panda a mano al lado del
panda que ella ya conoce no tenía sentido.

**Y la luna de la portada ahora entra.** Todo lo demás de esa pantalla tiene
animación de entrada —el regalo aparece, el título sube desenfocado, el contador
se desliza— y la luna estaba puesta desde el primer cuadro, que al lado de lo
otro se veía pegada. Ahora deriva desde fuera de cuadro, de más a la derecha y
de más arriba, creciendo un poco. **Llega la última, en 0,9 y tardando segundo y
medio**: es una puerta escondida y no puede ser lo primero que se mueve. Lo que
tiene que pasar es que ella lea el encabezado y después note, de reojo, que algo
se acomodó en la esquina.

Se miran con `npm run luna:peluche` (los ocho momentos del cierre, en los dos
capítulos donde pasa) y con `npm run luna:puerta`, que ahora saca también la
tira de cómo entra la luna: en una sola foto una animación no se ve.

**Una que costó y conviene no repetir.** El pintor pasó a pedirle el retrato a
`lib/retratos.ts`, que arma su catálogo con `import.meta.glob`. Eso es de Vite y
node no lo sabe leer, así que `npm run luna:probar` se cayó antes de empezar:
importa el pintor. Ahora la dirección del retrato entra desde fuera, como la
ropita. **Todo lo que importe el pintor tiene que poder correr en node.**

### El colado — 5 de septiembre, quinta vuelta. Con esto el plan cierra

El pato de la hermanita, el mismo que anda escondido por la web, ahora se cuela
en el juego. Dibujado en `src/juego-luna/colado.ts`, vectorial como la tortuga:
ni una imagen que bajar, cifrar y esperar. Mide 26×34 contra los 30×50 de ella,
que es lo que lo deja en colado y no en jefe.

**Se para en la plataforma a la que ella iba**, dos veces por capítulo, sin
avisar. Ocupa el sitio cuatro segundos y se va caminando. Si ella salta igual,
**se le para en el lomo**, catorce píxeles por encima de la plataforma: no le
cuesta un pasito ni una caída, y lo que le cuesta es que el salto siguiente sale
de más arriba de lo que calculaba. Eso fue lo que elegiste de las tres opciones,
y es lo que cumple al pie de la letra el «no mata ni empuja» del plan.

Toda la física son tres líneas en `alturaEn`, dentro del motor: mientras el pato
está ahí, el suelo de ese trozo sube. Por ese único sitio pasan el aterrizaje,
el caminar y el quedarse pegada al suelo, así que las tres salen solas — y
cuando el pato se va, el frame siguiente devuelve la plataforma y ella baja.

**Nunca en los últimos cuatro tramos.** Ahí ella está contando lo que le falta
para igualar el récord de él, y un pato tapándole la cima no da risa. Tampoco en
los primeros cuatro, ni encima de una estrella, un impulso o una caja de
peluches, que esas ya hacen algo propio al aterrizar.

**Y no se explica en ninguna parte, a propósito.** Es lo único del juego que no
tiene cartel ni clase en la escuelita. Explicado sería una mecánica más. Sin
explicar es una sorpresa.

Hizo falta un arnés por pregunta, porque ninguna la contesta el código leído.
`npm run luna:colado` lo dibuja: sus cuadros, su tamaño al lado de la tortuga, y
ella en su lomo con la línea marcada. `npm run luna:cuela` sortea mil veces por
capítulo, que las reglas son un sorteo y jugando se ve una tirada sola. Y
`npm run luna:probar` dice, de cada partida del robot, **dónde se asomó y si
ella se le paró encima**, que es lo único que podía estar mal en silencio.

### La música de fondo, y el sonido encendido de fábrica — 5 de septiembre, cuarta vuelta

**Los sonidos ahora vienen encendidos.** Un interruptor apagado no se toca
nunca, y el juego se siente distinto con ellos. Solo un «no» escrito por ella lo
apaga; el que nunca eligió nada cae del lado de encendido.

**Y hay música de fondo**: cuatro canciones en bucle, en orden al azar, a un
quinto de volumen. El mismo botón manda sobre las dos cosas — cuando alguien
quiere que se calle, quiere que se calle todo.

Llegaron a 192 kbps en estéreo, 17 MB entre las cuatro. Se convierten a 64 kbps
en mono, que a ese volumen y por el altavoz de un teléfono —que es mono de
todas formas— no se distingue, y bajan a 6 MB. Eso lo hace
`npm run musica:preparar`, que además les borra los metadatos.

**Van cifradas, en el mismo lote que las fotos.** El repositorio es público y
subir cuatro canciones enteras en claro no es una opción. Comparten la sal, así
que el teléfono deriva la llave una sola vez para las fotos y para la música;
con un lote aparte serían otras 250.000 vueltas de PBKDF2 justo al entrar al
juego. El precio es que una canción se baja y se descifra entera antes de sonar,
y por eso la siguiente se va bajando mientras suena la de ahora.

Arranca con el primer toque de ella, sea cual sea, porque el navegador no deja
que una página empiece a sonar sola. Se calla al salir de `/luna` y mientras la
página no se vea, que es para cuando deje el juego abierto y se vaya a contestar
un mensaje.

`npm run luna:sonidos` creció con esto: comprueba que de fábrica venga
encendido, que la música arranque, y que **al acabarse una canción entre otra**
— le adelanta el reloj hasta el final en vez de esperar tres minutos y medio.
`npm run revisar` cuenta las canciones: sin ellas el juego se queda mudo y nadie
se entera hasta que ella entre, que es el fallo silencioso de siempre.

### Los sonidos — 5 de septiembre, tercera vuelta

Nueve sonidos, armados con la Web Audio API. No se baja ningún archivo: cada
uno son dos o tres osciladores con su sobre, escritos como datos en `RECETAS`,
dentro de `src/juego-luna/sonidos.ts`.

El pop de soltar y el toc de aterrizar son los cortos, por debajo de 50 ms
medidos. Son los que se van a oír miles de veces en una subida, y ahí medio
segundo cansa a los tres minutos. Los otros siete son la estrella, la caída, el
mareo, el impulso, la caja que la devuelve, el golpe y la llegada a la cima. El
apurón y el apagón suenan igual aposta: por el oído lo que pasó es lo mismo, y
darles dos sonidos sería un idioma más que aprender.

**Arrancan apagados, y apagado quiere decir apagado.** Con el interruptor en no,
la Web Audio API no se toca ni una vez: no se crea el contexto siquiera. El
interruptor sale en la portada de la escuelita y en el cartel de cada capítulo,
dice cómo está y no qué hace, y al encenderlo suena el pop del salto una vez,
que es la única manera de enterarse de qué se acaba de encender.

Se llama desde `alEvento`, una sola línea en `Luna.tsx` y otra en
`EscuelitaDeLaLuna.tsx`, al lado de la vibración. Quién suena y quién no vive en
`sonidos.ts`, junto a la receta.

**`npm run luna:sonidos`** hace las dos mitades. Dibuja los nueve a la misma
escala con una marca cada 100 ms, y mide sobre lo grabado —no sobre lo que dice
la receta— cuánto duran, cuánto pican y si terminan en silencio de verdad o van
a chasquear. Después se mete a `/#/luna`, da ocho saltos y cuenta osciladores:
encendido creó diez, apagado creó cero y ni siquiera el contexto. Esa segunda
mitad es la que hacía falta: un banco que solo se mira a sí mismo habría dado
los nueve por perfectos aunque nadie los llamara nunca desde el juego.

### Y lo que se arregló el 5 de septiembre, segunda vuelta

**La raya en el cielo.** Al lado de la luna de la portada se veía una línea
recta vertical, de arriba abajo. Era real y era del código: el halo de la luna
es un cuadrado con un degradado redondo dentro, más ancho que el disco, y la
caja que recortaba la luna se lo cortaba a filo por la izquierda. Ahora acá no
se recorta nada — la luna se sale por la derecha y quien la corta es la franja
de la portada, con `overflow-x-clip`, que muerde solo a lo ancho y deja que el
resplandor siga saliéndose por arriba y por abajo.

**«Te faltaron 4 pasitos» decía lo contrario de lo que pasó.** El récord es el
mínimo, así que subir en más pasitos que él es haber dado unos **de más**, no
haberse quedado corta. Y encima sonaba a que no llegó, cuando llegó igual. Ahora
dice «te sobraron».

**La tortuga del cuento iba muy rápido.** El ciclo de la caminata va por
distancia y no por tiempo —así los pies no patinan—, o sea que el número que
dice cuánto avanza dice también qué tan rápido pedalea. Bajó de 26 a 15.

**Y los tres se veían pegoteados a su espalda.** Estaban dibujados después que
ella, así que salían enteros y por delante de todo, como tres calcomanías. Ahora
se pintan **antes**: el caparazón les tapa las patitas y lo que se ve es a tres
asomándose por encima de él, que es como se viaja en una tortuga. Van más atrás,
además, porque el tercero le quedaba detrás de la cabeza.

### Lo que se arregló el 5 de septiembre, probándolo en el teléfono

Cinco cosas que solo salieron jugándolo en un iPhone 14 Pro Max, y una de
ellas era grave.

**La pantalla en negro.** Vestir a la tortuga antes de empezar dejaba el juego
sin pintar y no se podía jugar. La historia y la escuelita se van con su propio
`return`, así que mientras están puestas el canvas del capítulo no existe; al
volver hay que montar el motor otra vez, y el efecto que lo monta no se
enteraba porque sus dependencias eran el capítulo y el nivel, y ninguno de los
dos cambia por salir de la escuelita. Ahora depende también de si el canvas está
puesto. **No se notaba mirando el cartel**, que se pinta igual con el negro
detrás, así que `npm run luna:antes` mira ahora el canvas de verdad: cuenta
cuántos colores tiene, y uno que no pinta nadie sale de un solo color.

**El cuento estaba congelado.** La tortuga movía las paticas sin avanzar —o sea,
corría en el sitio— y los peluches flotaban en el cielo sin llegar a subírsele
nunca. Estaban en dos sitios distintos: ella en un canvas chiquito y ellos en
imágenes de HTML al lado. Ahora el camino entero es un solo canvas a lo ancho de
la pantalla: ella **cruza el cuadro** y vuelve a entrar por la izquierda,
levanta polvito con las paticas, hay una raya de suelo contra la que se mide que
avanza, y las estrellas del cielo titilan. Y va más despacio que en el juego: a
la velocidad de allá parecía que corría, y es una tortuga.

**Los tres se le suben al caparazón de verdad**, dibujados en el mismo lienzo,
apoyados en el caparazón —que le queda a la espalda y en alto, no en la barriga—
y trepándose de a uno con su animación.

**Y no arrancan montados.** En el juego cada peluche se gana subiendo su
capítulo, así que empezar el cuento con los tres encima le contaba un final que
todavía no jugó. Ahora se los ve **esperándola**, cada uno a su altura y
bamboleándose, y recién después se suben. Ninguno queda encima de la luna:
sentado ahí lo que se leía es que ese ya llegó.

**Y la luna de la portada.** No llegaba al borde: la portada centra a sus hijos,
así que a un hijo con ancho propio lo centraba dentro del hueco que dejaba el
margen negativo y la corría diez píxeles en vez de veinte. Estirada no hay nada
que centrar. Y el aire de arriba y de abajo —transparente, y puesto solo para
que el recorte no le corte el resplandor— estaba contando en la página: sumaba
ciento veinte píxeles de nada alrededor, y con la separación entera de la
portada encima quedaba un hueco vacío con una luna en el medio. Eso no se lee
como una luna que está ahí desde siempre, se lee como que le estamos señalando
que apareció algo.

### Lo que se hizo el 4 de septiembre, cuarta vuelta: la escuelita y el cuento

#### Por qué una tortuga

Lo que el juego nunca explicó. Se abría con Boo contando de dónde venía, y nadie
decía nunca por qué la que sube es el animal más lento que hay.

Nueve cuadros, antes de todo lo demás. Alguien dijo «te quiero de aquí a la
luna», el pájaro dijo que quedaba muy alto y el cohete pidió que le pagaran. La
tortuga no dijo nada, dio un pasito, y cuando le dijeron que así iba a tardar
toda la vida dijo que bueno. Después se le treparon los tres al caparazón.

Lleva caminando **el tiempo que llevan ellos dos**, contado de verdad desde
`content/config.ts`. Es la única cifra del cuento y es la que lo ancla: sin ella
la tortuga lleva caminando un rato inventado.

Se pasa tocando y no solo, porque cada quien lee a su velocidad. Se puede saltar.
Y el último cuadro es la bisagra: la primera vez termina en que **todavía no
tiene nombre** y de ahí se pasa a ponérselo, que es la pantalla que ya existía y
que hasta ahora salía de la nada. Cuando ya lo tiene, la nombra y sale a jugar.

Sale antes de la escuelita la primera vez y **antes del capítulo uno cada vez
que se vuelve a empezar**. La tortuga es la de verdad, el mismo dibujo del juego
y con la ropita que traiga puesta.

#### La escuelita

Siete pantallitas donde nada cuesta nada: no se cuentan pasitos, no se anotan
caídas y no cae nada del cielo. Mantener y soltar, el cansancio, la estrellita,
la pista que se borra, el tramo de impulso, la caja que cede y la almohada que
se hunde.

**La estrellita y caerse iban separadas en el plan y son la misma clase.** Una
estrella no significa nada hasta que te caés y la pantalla te devuelve ahí. Se
pisa, se tira al vacío a propósito, y ahí se entiende.

**La del cansancio es una plataforma de pared a pared.** No hay a dónde ir, así
que lo único que se puede hacer es aguantar hasta marearse. Fue la que obligó a
que una clase se pase por lo que pasa y no por llegar arriba: cinco se pasan
llegando, esa mareándose y la de la estrellita cayéndose.

**Se ofrece una sola vez por teléfono**, y se puede saltar entera. Se guarda cuál
de las dos fue, porque no dejan a la misma persona del otro lado: a quien la hizo
se le quita el «cómo se juega» del cartel de Boo, que es lo otro que esta fase
venía a arreglar, y a quien se la saltó se le deja, porque es lo único que le
queda explicándole el juego.

`npm run luna:escuelita` las juega con un robot y avisa si alguna no se puede
pasar. `npm run luna:antes` saca las fotos en el teléfono y comprueba que la
escuelita no vuelva a salir la segunda vez.

#### Que el juego se pueda volver a jugar

Al pisar la luna, el juego **empieza otra vuelta**: se vuelve a entrar por el
capítulo de Boo. Y en la carta, al lado de «volver a la madriguera», hay ahora
un «subir otra vez».

Esto obligó a partir el guardado en dos, y era lo delicado de toda la sesión.
`capitulo` es **por dónde va esta vuelta** y se borra al llegar; `cumbre` es el
capítulo más alto de siempre y `llegadas` cuántas veces llegó, y esos dos no se
borran nunca. Con un solo número, llegar a la luna le habría quitado la corona y
el caparazón dorado en el mismo momento de ganárselos, y le habría cerrado la
luna de la portada la misma tarde en que subió. El ropero pregunta por la cumbre
y la portada por las llegadas.

Los pasitos y las caídas sí se ponen a cero, y la carta recibe los de **antes**
de borrar, que son de los que habla. `npm run luna:probar` comprueba las once
cosas de esa cuenta, con un `localStorage` de mentira.

#### Y la luna de la portada, más escondida

Es más grande que antes, se metió en la esquina y **se desvanece hacia el
borde**: lo que se ve es una luna asomada, no un botón. Cerrada va al 55 % y con
el halo a la mitad.

Se desvanece en vez de cortarse porque el borde de la página no cae exactamente
donde termina su caja —depende del respiro lateral de la portada y del ancho del
teléfono—, así que el tajo quedaba a diez píxeles del filo, a la vista, y lo que
se leía era un rectángulo.

**El aviso de tocarla cerrada son ahora cuatro palabras: «aún te falta algo».**
Antes decía dónde estaban escondidos los peluches, y con eso le resolvía el
acertijo de una: lo que le quedaba no era buscar, era ir a recoger. Y debajo de
la luna llena ya no hay línea. Si subió, sabe qué hay arriba.

### Lo que se hizo el 4 de septiembre, tercera vuelta

#### La puerta

La luna está en el cielo de la portada, arriba a la derecha del título, con un
brillo que pasa cada dieciocho segundos. Tiene tres caras: apagada mientras le
falten peluches, encendida con los tres, y llena y más grande cuando ya subió,
con la línea «la carta sigue allá arriba» debajo.

Tocarla sin los tres saca un papelito que dice qué le falta, con la pista
entera. Un acertijo que no se puede resolver no es un secreto, es una puerta
trabada.

**Se enciende sola, sin recargar.** Ella va a encontrar al tercero en la portada
misma; cierra el cartel de los peluches y la luna ya está prendida en esa misma
pantalla. Eso salió gratis y no hubo que inventarle ninguna ceremonia.

**Encontrarlos una vez vale para siempre.** Los peluches se olvidan cada noche
para volver a esconderse mañana, pero la llave de la luna se guarda aparte
(`dosositos:peluches:los-tres`) y esa no se borra. Si no, la luna se le cerraría
la misma noche y tendría que buscarlos de nuevo para releer la carta.

Para mirarla sin jugar: **`npm run luna:puerta`** (con `npm run dev` en otra
terminal). Fotografía los seis estados y comprueba sola que cerrada no deje
pasar y que abierta lleve al juego.

#### El ropero de la tortuga

Ropita de juego, que es lo que elegiste: un gorrito de fiesta, un gorro de lana,
un cintillo de antenitas, una corona de papel, lentes redondos, lentes de sol,
un corbatín, una bufanda y tres caparazones de colores. Once cosas en cuatro
ranuras, una por ranura.

Se entra desde el cartel de cada capítulo, con un botón debajo del de empezar, y
se puede saltar entera. Arriba está ella misma, dibujada de verdad y andando:
al tocar algo se lo pone en el momento, que es lo único que hace que valga la
pena tener ropero.

**Tres son de salida y ocho se ganan.** Ganar cada capítulo, subir uno sin
caerte, igualarle a osito el récord en uno, en dos y en los tres, y llegar a la
luna. Lo bloqueado se ve igual, apagado y con lo que hay que hacer escrito
debajo: escondido, el ropero se vería medio vacío el primer día y sin nada que
perseguir.

**Lo ganado no se guarda, se calcula del progreso cada vez.** Así el día que
quieras cambiar una regla, cambia para todos y no solo para quien empiece de
cero.

Para mirarlo: **`npm run luna:ropero`** (los dibujos, uno por uno y todos
juntos) y **`npm run luna:vestir`** (la pantalla en el teléfono).

### Antes de eso, si querés

- **Jugá Ovi y Nico** para ver la llegada y la carta con la clave puesta y
  después de haber subido, que es como las va a ver ella. Los récords ya no
  hacen falta para eso: están puestos.
- **Leé la carta entera en el teléfono**, que ahora son siete párrafos y ella la
  va a leer bajando con el pulgar.
- **Y mirá el cuarto de Nico jugando**, que las plumas y el temblor de las
  sábanas no se pueden juzgar en una foto: en un cuadro fijo un vaivén no se ve.

### Lo que se hizo el 4 de septiembre, segunda vuelta: el cuarto de Nico

El capítulo se leía quieto: estaba bien dibujado y no pasaba nada. Se le
pusieron dos cosas, y **ninguna toca un solo número de la física**, que era la
condición.

- **Las plumas.** Salen del golpe de aterrizar y del empujón de despegar,
  flotan por delante de la tortuga meciéndose y se apagan. Es lo único del
  capítulo que reacciona a lo que ella hace, y es lo que hace que la almohada se
  sienta de plumas en vez de ser una forma de color. Solo en el cuarto de Nico:
  de una pista de Hot Wheels y de una caja de cartón no salen plumas.
- **Las sábanas de abajo tiemblan mientras hay peso encima**, y cuanto más
  hundida, más. Esto es lo que más falta hacía: la traba de este capítulo es un
  suelo que se mueve mientras una lo mira, y con la tela de abajo quieta el
  hundimiento se leía como que la plataforma cambia de sitio, no como que hay
  algo cediendo bajo el peso.

**Y se arregló el banco**, que estaba roto desde que se añadió lo que cae: la
escena de `almohadas-banco.html` no traía `loQueCae` ni `efecto`, el pintor se
caía en el segundo panel y el banco llevaba semanas enseñando uno solo. Se
notaba y no se miró.

### Lo que se cerró el 4 de septiembre: la llegada, la carta y los récords

**La llegada.** Al pisar la cima del último capítulo escrito, la luna ya no se
escapa. Sale de la cima y sigue subiendo mil ochocientos sesenta píxeles, con
el cuarto apagándose abajo y las estrellitas de papel encendiéndose al pasarles
cerca. Se para encima, se sienta, y la cámara se abre hasta que queda la luna
entera, ella chiquita arriba, y todo lo demás cielo. Dura nueve segundos y no se
puede saltar: es lo que vino a ver.

Tres cosas que solo se vieron midiendo, y ninguna se veía a ojo:

- **La luna hay que traerla al centro del mundo mientras sube.** La cámara de
  este juego solo persigue de arriba abajo. A lo ancho el mundo está quieto y la
  cima cae donde le tocó, casi nunca en el medio, así que dejando la luna encima
  de la cima la tortuga terminaba encaramada en el borde del disco y con media
  luna fuera de la pantalla.
- **El cuarto no se acaba porque se salga de la pantalla.** Es más alto que
  ella, y las cortinas de Nico subían pegadas a la tortuga hasta la luna y se
  veían de fondo en el último cuadro, que es cielo y nada más.
- **Y ese apagado tiene que viajar como parámetro, nunca como `globalAlpha`.**
  Envolver el bloque no hizo absolutamente nada: `dibujarCortina` y sus seis
  hermanas fijan el suyo adentro y se lo llevan puesto. Es la misma lección que
  dejó el desvanecimiento de la pista, escrita en la cabecera de
  `mundo-almohadas.ts` desde hace semanas, y volvió a morder.

La cuenta vive en `src/juego-luna/llegada.ts` y no en el motor ni en el pintor,
porque la necesitan los dos y tienen que estar de acuerdo.

**La carta ya estaba escrita** desde el 27 de agosto, y lo que faltaba era
abrirla: no había una sola línea en `src/` que la leyera. Sale encima de la
llegada y no en vez de ella, con el canvas congelado en su último cuadro.

Y se le cambiaron dos cosas, que las pidió él:

- **Se fue lo del peaje.** Decía «esta carta no está en ninguna otra parte de la
  web, la única manera de abrirla era subiendo» y «me parecía que había que
  ganárselo». Leído del otro lado, eso le dice que no se merecía la carta hasta
  ganar un juego. Ahora dice que no tenía que ganarse nada y que se la dejó
  arriba porque de subir despacio es de lo que habla.
- **Dos párrafos nuevos**, sacados del diccionario y no inventados. Uno es que
  «de aquí a la luna a pasitos de tortuga» no es una frase suelta: es una de sus
  medidas del infinito, la que tiene camino, y por eso es la que está al final
  de uno. El otro son los dos rituales de todos los días, el saludo de la mañana
  y el «soñá con los angelitos» de la noche, que es cómo una promesa así se
  cumple de verdad: de a poquito.

**Los récords, que eran lo último que faltaba del juego:**

- **Boo: 24**, jugado por él y sin caerse ni una vez, rebotando contra la pared
  para subirse a un tramo de arriba en vez de seguir el zigzag.
- **Ovi: 30**, que es el mínimo. Este se empata y no se gana.
- **Nico: 30**, que es el mínimo más uno. El último es el único que ella puede
  ganar, y por un pasito.

Los mínimos salen de `npm run luna:minimos`, una anchura primero sobre el grafo
de «de qué tramo se llega a qué tramo de un salto», con las aristas sacadas
simulando el vuelo con la física del motor: rebotes contra las paredes, cajas de
peluches que devuelven medio salto gratis y tramos de impulso que no cuestan
pasito. **El buscador se cree porque en Boo saca 24**, que es exactamente lo que
él hizo jugando, truco de la pared incluido.

El marcador sale al cerrar cada capítulo, debajo de los pasitos de esa subida, y
en el último va arriba, sobre la luna quieta, porque ahí abajo ya está la carta.
Un capítulo sin récord no enseña nada y se cierra igual.

**Y los detalles que se les fueron poniendo encima**, que es lo que hace que se
note que esto llevó horas y no una tarde:

- Las estrellitas del viaje **se encienden al pasarles cerca** y se apagan
  detrás. Eso es lo que las hace medir el camino en vez de decorarlo.
- La tortuga **hace sombra sobre la luna** al pararse encima. Sin ella quedaba
  pegada como una calcomanía en vez de posada sobre algo. Va gris cálida y no
  negra: la luna es lo más claro de la pantalla y una sombra negra ahí pesa como
  un agujero.
- La carta va **pegada con dos pedacitos de cinta**, torcidos y de distinto
  largo, sobre un papel con su fibra y la luz cayéndole por arriba. Es el mismo
  lenguaje del resto de la web, y una hoja perfectamente puesta no la pegó
  nadie.

**Los bancos nuevos**, que hacen falta porque esto pasa una sola vez en todo el
juego y dura nueve segundos que no se pueden parar: `npm run luna:llegada` saca
los catorce cuadros de la cinemática y `npm run luna:carta` la hoja en tres
teléfonos con el final scrolleado. Y cuatro comprobaciones más en
`npm run luna:probar`.

**Una regla nueva, que costó un susto:** `scripts/` se publica igual que `src/`.
El banco de la carta llevaba copiados el título, la apertura y la firma de
verdad para que el relleno tuviera los largos justos, y eso iba camino del
repositorio público. Ahora va todo con relleno. Está anotado en `CLAUDE.md`.

### Lo que cae, la traba que es de los tres capítulos

Hasta ahora cada capítulo tenía la suya y no había ninguna común. Esta cae del
cielo en los tres, después de la primera estrella, y en vez de tocar el suelo
—que es lo que hacen las otras tres— le pega a **la barra**, que es lo único que
este juego tiene. Son dos cosas, y las dos son la misma regla que explicar:

- **El apurón** desboca la barra: se llena en 320 ms en vez de 900 y **no se
  queda en el tope**, se pasa y vuelve a cero. Le quita el control. El salto que
  se quiere sigue estando —la barra da 6,6 vueltas enteras antes del desmayo—
  pero hay que agarrarlo al pasar en vez de esperarlo arriba.
- **El apagón** apaga la barra: deja de dibujarse. No toca ni un número, le
  quita la información. Y no deja a ciegas, que sería injusto: la tortuga
  tiembla más cuanto más llena está la barra, así que se sigue pudiendo medir
  mirándola a ella. Eso ya estaba en el juego desde la primera fase y resultó
  ser lo que hace que este efecto se pueda pagar.

**Por qué no son los poderes otra vez.** Los poderes se tiraron porque eran un
gesto más que aprender a usar. Esto no se usa: le pasa. Y esquivarlo es el
gesto de siempre — la tortuga camina sola y se queda quieta mientras carga, así
que quitarse de abajo es decidir cuándo cargar y cuándo dejarla andar.

**Y son globales, con el mismo dibujo en los tres mundos.** No hay un carrito
en Boo, una caja en Ovi y una almohada en Nico. Un objeto que se pareciera al
mundo por donde cae contaría de dónde salió, que no importa; lo que hace falta
saber es a qué le va a pegar, y eso se dice con una silueta:

- **El apurón es un rayo** dorado. Nadie necesita que le expliquen que un rayo
  significa que algo va a ir rápido.
- **El apagón es un ojo tachado**, el mismo de mostrar y ocultar la contraseña
  que ella ha visto mil veces en cualquier formulario.

Los dos llevan un halo suave del color del propio icono, que es lo que los
despega del cielo sin tener que pintarlos de blanco, y **se bambolean en vez de
girar en redondo**: es la diferencia entre una silueta que se lee al vuelo y una
que hay que perseguir con la mirada.

Antes eran los dos la barra de carga en pequeño, con el argumento de que el
objeto era la barra que venía a descomponer. Se leía **después de pensarlo**, y
un icono que hay que interpretar ya llegó tarde: cuando uno de estos entra en
pantalla, ella está mirando el salto siguiente.

**Lo que lo hace justo**, que es todo lo que hay que cuidar aquí:

- **Se ve venir.** Asoma por encima del borde de arriba y tarda 2,7 segundos en
  llegar a la altura de las paticas. Reaccionar es cuestión de uno. Está medido
  en `npm run luna:probar`.
- **No cae nada hasta pasada la primera estrella**, igual que la pista de Boo no
  se borra hasta entonces: los primeros saltos son para aprender.
- **Apunta a la plataforma donde anda, no a ella.** Así el azar queda donde
  tiene que estar: no en si viene o no, sino en dónde va a estar ella dentro de
  la plataforma cuando llegue, que es la misma decisión que el juego pide todo
  el rato. Saltando a otra se esquiva.
- **Las plataformas no lo paran.** Va por delante de todo, en primer plano.
- **Dura tres saltos, y hay que gastarlos: caerse no lo quita.** Al principio sí
  lo quitaba, por la regla de que algo que castiga no castiga dos veces. Estaba
  mal aplicada — el efecto no es el castigo de la caída, es un estado que se
  gasta con el uso — y salía algo peor: **tirarse al vacío pasaba a ser la forma
  barata de quitárselo**, o sea que el juego premiaba lo único que castiga. Con
  la barra desbocada y un hueco largo por delante, dejarse caer era la jugada
  buena.
- **Lo que sí se va al caerse es lo que estuviera bajando**, y el siguiente se
  hace esperar el intervalo entero. Ahí la regla sí valía: reaparecer con algo ya
  encima que ella no vio caer es una trampa puesta mientras no miraba, lo mismo
  que se arregló con las cajas torcidas y las almohadas hundidas.
- **Nunca dos a la vez**, que de una lluvia no se sale.
- **El cartel sale una sola vez por cada uno.** El dibujo dice a qué le va a
  pegar; qué hace exactamente hay que decirlo con letras la primera vez, y a la
  segunda ya lo sabe.

### Y lo que costó tres vueltas de arnés: que le pegara alguna vez

La primera versión estaba puesta y no le pegaba **nunca**. Armando lo jugó y
preguntó si el ritmo estaba bajo o si los objetos se deshacían contra algo.
Medido con el robot jugando los tres capítulos, eran tres cosas a la vez, y
ninguna se veía sin medirla:

- **Apuntaba a donde ella estaba, no a donde iba a estar.** Salían apuntando a
  54 px de ella y pasaban por su altura a 111, 273 y 137: en los cinco segundos
  que tardaban en bajar, ella ya había saltado a otro tramo, y con el zigzag,
  casi siempre al otro lado de la pantalla. Ahora apuntan a la plataforma, que
  no se mueve.
- **El techo los paraba todos.** Se deshacían contra cualquier tramo, para que
  el nivel protegiera. Con treinta y dos plataformas en zigzag, casi cualquier
  sitio donde ella pueda estar tiene algo encima: paraba seis de cada seis. **Una
  traba que el nivel anula no es una traba**, así que se quitó. Lo que sostiene
  la regla nueva es el dibujo: lo que cae va en primer plano, más cerca que el
  mundo, y algo que pasa por delante de una plataforma no tiene por qué chocarse
  con ella.
- **Y caía demasiado despacio.** Cinco segundos de vuelo parecían generosos y
  eran inofensivos: en cinco segundos ella da dos o tres saltos. A 190 px/s son
  2,7 segundos, que siguen siendo de sobra para quitarse.

**Y una lección de cómo se mide, que vale para cualquier cosa que pase por
tiempo:** el robot del arnés termina el capítulo en un minuto porque juega
perfecto y no se demora nunca. Ella va a tardar varios, entre lo que piensa cada
salto y lo que se cae. Contar golpes **por subida** calibra el juego para un
jugador que no existe; se cuenta por minuto. Con el ritmo afinado para que el
robot notara algo, a ella le habrían llovido dieciséis por minuto.

**El primer intento del apagón no se veía.** Iba todo ceniza oscura, con el
argumento de que un objeto brillante no puede anunciar que algo se apaga. Se
perdía contra el cielo de los tres capítulos: no se veía venir, y eso rompe la
única promesa que esta traba hace. Ahora lleva el resto de dorado y el contorno
claro. **Un objeto que hay que esquivar se dibuja para verse, y el motivo
poético va después.**

El banco es `npm run luna:cae`, y hace falta por dos razones: jugando no cae
nada hasta la primera estrella, y lo que hay que juzgar —si se entienden solos—
se mira con los dos juntos, a la misma luz y encima de los tres mundos.


### Lo que cambió el 3 de septiembre: el cuarto, vestido

El capítulo de Nico dejó de ser el prototipo. Lo que se hizo, y por qué cada
cosa está donde está:

- **La almohada se partió en dos o tres.** Es la misma lección que dejaron las
  cajas de Ovi: una plataforma de 100 a 155 de ancho por 20 de alto, dibujada
  de una pieza, es un colchoncito de siete a uno y no la forma de ninguna
  almohada. Partida y con cada trozo de su grosor, se lee de una que es un
  montón mal puesto — que es justo lo que explica que la cosa se hunda.
- **Y la cobija no se partió**, que es un bulto y no un montón. Salió un regalo
  que no vi venir: ahora las almohadas tienen juntas verticales y la cobija no,
  o sea que se distingue **por la forma además de por el color**, que era lo
  que más falta hacía.
- **La línea que se pisa se dibuja entera y de un trazo**, por encima de las
  juntas. Es la decisión que hizo posible partir la almohada: la forma puede
  estar rota en tres, pero en un capítulo donde el suelo se está moviendo
  mientras una lo mira, a qué altura se pisa no puede tener ni una
  interrupción. Y entra catorce píxeles por cada lado, porque las esquinas de
  una almohada son redondas y una línea hasta el borde se quedaba flotando.
- **El hoyo de las paticas** es solo dibujo, y va más ancho que la tortuga a
  propósito: debajo de ella no se ve nada, y lo que tiene que leerse es el
  hundido asomando por los dos lados. La física no se tocó — la almohada se
  hunde entera y pareja. Hundir distinto según dónde se pare ya es la traba de
  Ovi, y dos capítulos con la misma traba no son dos capítulos.
- **Las sábanas colgando** debajo de cada almohada, que son lo que hacen las
  cajas de abajo en Ovi y las cañas debajo de la pista en Boo: sin ellas la
  fila entera se lee como un estante flotando.
- **El fondo son las cortinas y los pliegues.** Las cortinas van a los dos
  lados y de punta a punta, como el bambú y las torres, y son **lo único vivo
  del capítulo**: el aire de la madrugada moviendo la tela. Otra lluvia de
  motas hubiera sido el polvo de Ovi con otro nombre. Los pliegues de la
  sábana cruzan el fondo de lado a lado, que es el sitio que en Boo ocupan las
  vías.
- **La primera plataforma es la cama**, con su colchón y la sábana bajera
  arremangada, y no lleva almohadas encima: es de donde se sale y tiene que
  leerse como el sitio firme del capítulo.
- **La luna crece un capítulo a la vez**: 44 en Boo, 53 en Ovi, 62 en Nico. Era
  la única forma de que subir tres capítulos se sintiera como acercarse a algo
  — dentro de un capítulo la luna se acerca sola porque vive en el mundo, pero
  al empezar el siguiente volvía a estar igual de lejos que al principio de
  todo. Ahora en el cuarto de Nico se ve casi la mitad más grande, que es
  exactamente lo que él le dice en la presentación.
- **Y la luz de la madrugada**, que baja de la luna y se pone más fuerte
  cuanto más arriba: es la única señal de que se está llegando, en un capítulo
  donde la luna no se vuelve a ver hasta el final.


### Lo que cambió el 1 de septiembre, con lo que jugaste

Lo jugaste y dijiste dos cosas: que esperar sí cuesta, pero que no pesa como
último nivel; y que cada capítulo tendría que guardar menos que el anterior,
dejando el primero como está.

- **Cada capítulo guarda menos: Boo cinco, Ovi cuatro, Nico tres.** La cima
  sigue siendo una estrella en los tres. Y hay un regalo que no vi venir al
  escribirlo: la estrella va **firme** siempre, así que quitar una no solo
  alarga el trecho que hay que rehacer, además **convierte ese descanso en
  piso que se mueve**. Las dos que perdió Nico eran las almohadas más anchas
  de su tramo, o sea tres segundos de caminata viéndolas hundirse. El capítulo
  se puso más duro sin tocar un solo número.
- **Dónde cayó cada corte.** Ovi pierde la de 1656, así que el trecho va de
  1170 a 2307 de un tirón: el desparejo entero más el segundo hueco al tope.
  Se puede pedir porque encima de la estrella de abajo está la caja de
  peluches, que es la red del capítulo. Nico pierde las de 540 y 1584 y le
  quedan 1096, 2156 y la cima, que reparte **un hueco a prisa por trecho** y
  ninguno con dos.
- **Las cobijas enredadas, la segunda traba de Nico.** Parada en una, la barra
  se llena en 1500 ms en vez de 900, y el aguante antes del desmayo sigue
  siendo el mismo: el tope llega a los 1500 y el aviso rojo empieza a los
  1550, o sea que un salto entero desde una cobija se paga mirando cómo se
  pone roja. Y la cobija se hunde como cualquier almohada, así que cobra en
  tiempo **y** en altura. La almohada cobra por esperar; la cobija cobra por
  apurarse. Es la traba del capítulo multiplicada por sí misma, que es la
  razón de que vaya en el tercero y no en otro.
- **La regla de las cobijas:** ninguna va justo antes de un hueco marcado
  `aPrisa`. Ese hueco pide salir en la pasada en que se llegó y la cobija pide
  cargar largo, y pedir las dos cosas juntas no es difícil, es injusto. Es la
  misma lección que dejaron las forradas y los huecos al tope en el cuarto de
  Ovi. El probador la comprueba en los tres capítulos.
- **Van cuatro cobijas**, en 1184, 1408, 1762 y 2334. La primera está sola y
  perdonando: lo que hay que saltar desde ella son 64 px, el tramo más corto
  del capítulo, porque la primera vez que la barra se arrastra no puede ser
  también la vez que hace falta el tope.
- **Se dibuja distinta de un vistazo**, que era la parte que no se podía dar
  por buena compilando: color más caliente, esquinas duras (una almohada no
  tiene esquinas) y una punta que cuelga. Lo que cambia encima de una cobija
  es el ritmo de la barra, y eso no se ve hasta que ya se está cargando; si el
  dibujo no avisa antes, deja de ser una traba y pasa a ser una sorpresa. Está
  visto en `npm run luna:almohadas`, que ahora trae las dos pegadas.

### El arnés mintió tres veces seguidas, y por la misma razón

Vale la pena anotarlo porque es la séptima vez y ya no es mala suerte. La
cobija le cambia el reloj a la barra, y **la cuenta de cuánto hay que apretar
para una barra dada estaba escrita en cinco sitios**: el probador de tramos, el
salto suelto, el robot que juega el capítulo, el trepador de la prueba de los
hitos y su propia copia de la balística. Enseñarle la cobija a cuatro dejaba al
quinto soltando el botón con el 60 % de la barra que había pedido: se quedaba
dando vueltas sin caerse ni llegar, y el probador decía que el nivel no se
pasaba. El nivel se pasaba perfectamente.

Quedó arreglado de raíz: la puntería de los dos robots es ahora **una sola**,
a nivel de módulo, y quién decide cuánto tarda la barra es `msDeCargaEn` en
`src/juego-luna/mundos.ts`, que usan el juego y el arnés. La próxima traba que
le toque el reloj se enseña en un sitio.

### Cómo está el juego ahora mismo (fase 5, los tres capítulos enteros)

Publicado en `https://dosositos.github.io/#/luna`, sin enlace desde ningún lado
y detrás del candado. **Los tres capítulos se juegan enteros y están los tres
vestidos**, y al ganar uno se pasa al siguiente sin salir de la pantalla.

**Por qué el de Nico se hizo en dos tandas.** El capítulo de Ovi enseñó que lo
caro es la mecánica y el nivel, no el material. Y los números de un capítulo se
mueven mientras se juega: pintar el cuarto antes de saber si la almohada se
hunde a buen ritmo es pintarlo dos veces. Así que primero se jugó con lo mínimo
dibujado, y el cuarto entró después, cuando los números ya no se movían.

- **La traba de Nico son dos.** Las almohadas se hunden mientras está parada
  encima: 34 px en 3,6 segundos, a ritmo parejo, y paran en el fondo. No la
  tragan y no la tiran. Saliendo en seguida se suben 146 px; tras cinco
  segundos encima, 120. Y las cobijas enredadas le frenan la barra, que es lo
  contrario: cobran por apurarse en vez de por esperar.
  Eso es lo que hace que **esperar cueste**: dejar pasar una vuelta de la
  caminata para saltar desde el punto bueno se paga en altura, igual que
  aguantar la barra.
- Y da vuelta una costumbre de los otros dos capítulos: aquí una plataforma
  ancha es peor que una angosta, porque son más segundos de caminata para
  volver al punto de salida.
- **Tres huecos marcados `aPrisa`**, que es la marca hermana de `alTope` de
  Ovi: se pasan saliendo en la pasada en que se llegó y no se pasan desde la
  almohada hundida. El probador los comprueba en vez de darlos por error.
- **La almohada tiene su banco**, `npm run luna:almohadas`: la misma almohada
  entera, a medias y en el fondo, una al lado de la otra y quietas. Hundiéndose
  jugando pasa despacio y mientras una está mirando otra cosa. Desde que el
  cuarto está vestido sirve además para mirar quieto el decorado, que jugando
  pasa detrás de la tortuga.

- **Un solo gesto en todo el juego.** Mantener y soltar. Ni poderes ni
  habilidades: se probaron dos y se tiraron los dos. Lo que cae tampoco añade
  gesto — no se usa, le pasa, y quitarse de abajo es decidir cuándo cargar.
- **Y una traba que es de los tres capítulos:** lo que cae. El apurón le desboca
  la barra y el apagón se la apaga, tres saltos cada uno. Ver más arriba.
- **Le pregunta el nombre a la tortuga** antes de la primera partida, y ese
  nombre manda en todos los textos de los tres capítulos.
- **32 plataformas por capítulo, y las estrellas van bajando:** cinco en Boo,
  cuatro en Ovi, tres en Nico, con la cima siempre marcada. Son las estrellitas
  de papel del frasco, iguales en los tres mundos, y en los tres son suelo
  firme.
- **La traba de Boo:** la pista se borra detrás. Parpadea siete veces
  acelerando y se va. Cada estrella pisada le quita 380 ms de vida, con piso de
  1,1 segundos, así que el capítulo se apura solo.
- **La traba de Ovi:** las cajas ceden hacia donde está parada. Saltar desde el
  medio llega a 154 px de altura y saltar desde la orilla a 146, así que el
  punto donde aterriza decide el salto siguiente.
- **Y dos cajas más que hacen algo.** La **forrada de cinta** no agarra mientras
  carga: se va corriendo hasta la punta, que está hundida, así que el salto sale
  corto y del lado equivocado. No la tira, la descoloca. La **de peluches** no
  la para: la devuelve, con parte de lo que traía, y se apaga sola en tres o
  cuatro botes. Va ancha y encima de una estrella, así que además recoge lo que
  se cae de los tramos de arriba.
- **Dos huecos que solo se pasan con la barra al tope**, uno por mitad del
  capítulo de Ovi. Van marcados `alTope` en `luna.ts` y el probador los
  comprueba en vez de darlos por error.
- **Dos tramos de impulso** en Boo, que lanzan solos y siempre igual. Ovi no
  tiene: cada mundo con lo suyo.
- **La luna** se presenta **cuando ella le da al botón**, no al abrir la
  página: corriendo detrás del cartel se gastaba entera sin que nadie pudiera
  verla. Se va para arriba, espera sobre la última plataforma y se va otra vez
  al llegar. Un toque salta la presentación, pero no en el primer suspiro: el
  mismo dedo que le dio al botón no puede comerse lo que acaba de destapar.
- **El fondo vive:** en Boo, vías de pista con carros corriendo por encima y
  matas de bambú a los lados. En Ovi, torres de cajas contra las dos paredes del
  cuarto y polvo flotando en la luz, con una mota de cada tres del rosa de Ovi.
  En Nico, las cortinas de los dos lados meciéndose con el aire de la madrugada
  y los pliegues largos de la sábana cruzando el fondo.

### El adelanto, para antes de que el juego exista

Al final de una página por día —debajo de la firma, hasta abajo del todo— la
tortuga pasa caminando tranquila, se da cuenta de que la están viendo, le sale
un «!» encima de la cabeza, pega el brinco y se va corriendo por donde vino.
Tres segundos, y el susto con la huida son uno: hay que estar mirando.

- Es **la misma tortuga**, no una versión chiquita: el dibujo y las poses salen
  de `src/juego-luna/tortuga.ts` sin copiar una línea. La idea es que el día
  que ella abra el juego reconozca a alguien.
- La animación vive en `src/juego-luna/asomo.ts` y no tiene estado: se le pide
  la foto del milisegundo `ms` y devuelve dónde está y cómo. Por eso tiene
  banco (`npm run luna:asomo`) igual que el mundo y el personaje.
- **Una página por día y una sola**, y nunca la del juego. Se salta las páginas
  donde ese día hay un peluche escondido abajo: los dos guiños viven en el
  mismo rincón y juntos se estorban. `npm run luna:asomo -- --semana` dice
  dónde cae cada día.
- **Arranca cuando ella llega hasta abajo, no cuando carga la página.** Y le
  exige haber bajado de verdad (`scrollY > 0`) además de que el alto de la
  página lleve un rato quieto: media web llega cifrada, y en el primer pintado
  las estadísticas miden una pantalla. Sin esas dos condiciones la tortuga
  entraba y se iba mientras ella todavía miraba el cargando.

### Los comandos que hacen falta

```bash
npm run dev              # y npm run dev:telefono para la red de casa
npm run luna:probar      # ¿se pasa el capítulo? y todas las pruebas del juego
npm run luna:probar -- 3 # el de Nico. Sin número, el de Boo; con 2, el de Ovi
npm run luna:mapa        # a qué distancia se aterriza según lo que haya que subir
npm run luna:ver         # fotos del juego andando (-- 5173 3 para el de Nico)
npm run luna:pista       # el banco del mundo de Boo, sin jugarlo
npm run luna:cajas       # el banco del mundo de Ovi
npm run luna:almohadas   # el banco del mundo de Nico: almohada y cobija
npm run luna:cae         # el banco de lo que cae: el apurón y el apagón
npm run luna:tortuga     # el banco de poses del personaje
npm run luna:asomo       # el banco del adelanto (-- --semana: dónde cae cada día)
```

**Lo que más ahorra:** los bancos. El mundo y el personaje se ajustan
mirándolos, no jugando hasta el tramo que se está tocando. El de las cajas se
escribió antes que el capítulo y por eso el capítulo salió en una tarde.

### Lo que aprendí y no quiero volver a aprender

- **El arnés miente antes que el juego.** Van seis veces que una prueba nueva
  dice que el motor está roto y el roto es la prueba. En la fase 4 el probador
  comparaba el aterrizaje contra la línea de la plataforma, y como la caja ya
  había cedido debajo de la tortuga, leía como fallados aterrizajes buenos: el
  capítulo entero salía cinco puntos más difícil de lo que era. Antes de creerle
  a una prueba que falla, romper el código a propósito y ver si la caza.
- **Las dos de la fase 5 fueron la misma prueba, dos veces.** Para ver si una
  almohada vuelve a inflarse hay que dejarla sola, y la primera versión la
  ponía debajo de la tortuga: el salto de irse volvía a caer encima y la hundía
  de nuevo antes de que nadie mirara. Puesta al lado tampoco: saltar de costado
  contaba como caerse, porque la caída se mide contra el sitio donde reapareció
  y ese sitio era la almohada sin hundir. Las dos veces la prueba decía que el
  motor no inflaba nada, y el motor infla perfectamente. Al final se salta
  hacia arriba, a un techo de pared a pared que es imposible fallar.
- **Y la segunda dejó una regla del nivel.** Si una almohada está a menos de 58
  px de su estrella (los 34 que se hunde más los 24 de `margenBajoElLazo`),
  hundirse deja a la tortuga por debajo del umbral de caída **estando parada**,
  y el primer salto que dé desde ahí cuenta como caída aunque llegue perfecto.
  Ya tiene prueba en `npm run luna:probar`.
- **Y miente también cuando espera por reloj.** La tortuga camina sola y no se
  para nunca, así que «esperá tantos frames y ya estará en la orilla» es
  mentira. Las pruebas del capítulo de Ovi esperan a que **esté** donde tiene
  que estar, mirándole la x frame a frame.
- **La firma del congelamiento.** Si la tortuga se queda clavada en una pose
  agachada y se arregla al saltar, es que el reloj de la pose dejó de correr.
  Pasó dos veces y ya tiene prueba en `npm run luna:probar`.
- **`ctx.globalAlpha` no se asigna dentro de una función de dibujo.** Se lo
  lleva puesto todo lo que venga después. El desvanecimiento de un tramo entero
  se rompió por un `globalAlpha = 1` suelto: el alfa viaja como parámetro.
- **Una plataforma no es un objeto, es varios.** Dibujada de una sola pieza, una
  caja de 100 de ancho por 20 de alto sale una tabla y no una caja. Partida en
  dos, tres o cuatro cajas de hombro con hombro, cada una queda casi cuadrada y
  el material se lee de una.
- **Lo que pasa por tiempo se mide por minuto, no por partida.** El robot del
  arnés termina un capítulo en un minuto y ella va a tardar varios. Cualquier
  cosa que caiga, aparezca o expire con el reloj, calibrada contra la carrera
  del robot, sale cuatro veces más frecuente de lo que parece.
- **Una traba que el nivel anula no es una traba.** Lo que cae se deshacía
  contra cualquier plataforma para que el nivel protegiera, y en un zigzag de
  treinta y dos tramos el techo paraba seis de cada seis: la traba no existía.
  Antes de dar por buena una regla que «el nivel modula», medí cuánto queda de
  ella con el nivel de verdad puesto.
- **Un objeto que hay que esquivar se dibuja para verse; el motivo poético va
  después.** El apagón se dibujó primero todo ceniza oscura, razonando que algo
  brillante no puede anunciar que la luz se apaga. Contra el cielo de los tres
  capítulos no se veía venir, y no verlo venir rompe la única promesa que esa
  traba hace. La coherencia de un dibujo vale menos que su legibilidad cuando el
  dibujo es una amenaza.
- **Antes de limpiar algo al reaparecer, preguntá si caerse sale a cuenta.** El
  efecto de lo que cae se borraba en el checkpoint, razonando que un castigo no
  castiga dos veces. Con eso, tirarse al vacío era la forma barata de quitárselo:
  el juego premiaba lo único que castiga. Se limpia lo que ella no pudo ver venir
  —las cajas torcidas, las almohadas hundidas, lo que estuviera cayendo— y no lo
  que se gasta con el uso.
- **Y por lo mismo: un icono se lee o no se lee, no se interpreta.** Lo que cae
  llevó primero la forma de la barra de carga, que era la idea bonita —el objeto
  es la barra que viene a descomponerse—. Había que pensarlo un segundo, y ese
  segundo no existe: cuando el objeto entra en pantalla, ella está mirando el
  salto siguiente. Un rayo y un ojo tachado no se piensan.
- **Nada translúcido y con lados rectos se pone delante de la luna.** Las
  sábanas que cuelgan debajo de las almohadas de Nico eran paños opacos con los
  lados a plomo, y en la presentación —donde la luna pasa por detrás, enorme—
  cada una se recortaba contra ella como un ladrillo gris. Se arreglaron
  arrancando ya translúcidas, con los lados curvos y el borde de abajo en
  ondas: una sábana colgando en la penumbra es una sombra con forma, no un
  objeto. Lo mismo vale para cualquier cosa que se le cruce por delante.
- **Lo blanco pesa.** La cinta de embalaje y los rótulos, puestos al brillo del
  papel de verdad, eran lo más claro de la pantalla después de la luna. Todo lo
  que no es la tortuga ni el suelo va un punto por debajo de lo que uno cree.
- **Una regla que castiga no puede castigar dos veces.** La caja forrada de
  cinta empezó tirando a la tortuga si aguantaba de más, y con la carga que hace
  falta para un salto normal ya se caía sola: no era difícil, era una trampa.
  Ahora se para en la punta. El castigo es quedarse donde no querías.
- **Una red que te tira es peor que no tener red.** El rebote de la caja de
  peluches conservaba el avance de lado, así que cada bote la corría hacia el
  mismo lado y al tercero se salía: una de cada cuatro entradas acababa en
  caída. Se arregló haciendo del montón un cuenco, que es lo que un montón de
  peluches es.
- **Antes de tocar el nivel, mirá dónde se atasca el robot.** `npm run
  luna:probar` ahora lo dice: en qué plataforma se quedó, cuánto tiempo y qué
  tenía que saltar desde ahí. Sin eso, cada vuelta eran veinte minutos de
  adivinar.

### Lo que sigue esperando, después del juego

1. El **momento de Boo** en la línea del tiempo (23 de diciembre de 2024) y
   sacarle su frase comodín de `src/content/peluches.ts`.
2. Los dos momentos apuntados sin escribir: el 24 de noviembre de 2024 y las
   flores de lego, que además no tiene fecha.
3. La **línea del tiempo horizontal para computadora**, lo único atrasado del
   orden original.
4. Probar el **diccionario** en el teléfono de verdad.
5. **PWA**: hoy no hay manifest ni ícono.
6. Los **13 puntos y coma** de `src/content/momentos.ts` y los 5 de
   `src/content/diccionario.ts`, que son de mi redacción y no citas.

El plan completo del juego, con la mecánica, los tres mundos, los valores de la
física y las diez fases, vive en **`plan-juego-luna.md`**, en la raíz. Se lee
antes de escribir la primera línea.

### Lo que se cerró en la fase 5, primera vuelta (el prototipo)

- **El capítulo de Nico se juega entero.** La traba en el motor
  (`hundirLasAlmohadas` y `superficieDe`), las 32 plataformas y las 5 estrellas
  en `src/content/luna.ts`, el cartel con su retrato y el cierre. Sin vestir: el
  mundo dibujado es una almohada que se lee como almohada y se ve hundirse, y
  nada más.
- **Su banco, `npm run luna:almohadas`**, escrito antes que el capítulo, igual
  que el de las cajas. Enseña la misma almohada entera, a medias, en el fondo, y
  el hueco que pide prisa saliendo ya y tras cinco segundos.
- **Seis pruebas nuevas en `npm run luna:probar -- 3`**: que se hunda despacio y
  pare en el fondo, lo que cuesta demorarse (26 px de altura), que ningún tramo
  quede imposible desde el fondo salvo los marcados, que la estrella no se
  hunda, que la almohada se infle sola al irse y que ninguna esté demasiado
  cerca de su estrella. Comprobadas rompiendo el motor a propósito.
- **`aPrisa`, la marca hermana de `alTope`.** El probador ya no da por error un
  hueco que se pasa saliendo en la pasada en que se llegó, y avisa si uno
  marcado así se sigue pasando a los cuatro segundos.
- **El robot del probador aprendió a contar el hundimiento.** Apuntaba desde la
  altura que tenía al empezar a cargar y soltaba veinte píxeles más abajo, así
  que fallaba justo los saltos que el capítulo está pidiendo. Es la misma
  trampa que la caja forrada de cinta, en el otro eje.

### Lo que se cerró en la fase 4, con tu segunda vuelta

- **La luna ya no se presenta detrás del cartel.** Antes su cinemática arrancaba
  al abrir la página, con el texto tapando la pantalla, así que cuando le dabas
  a empezar ya se había ido. Ahora el motor arranca en espera —la tortuga camina
  por el suelo, que eso sí invita— y la luna sale cuando le das al botón. Y el
  toque que se la salta no vale en el primer medio segundo.
- **El capítulo de Ovi tiene dos cajas más que hacen algo**, la forrada de cinta
  y la de peluches, contadas arriba. Con eso el mundo dejó de ser «las mismas
  plataformas pero torcidas».

### Lo que se cerró en la fase 4

Además del capítulo de Ovi entero, tres cosas que pediste.

- **Los poderes se fueron también del plan.** `plan-juego-luna.md` todavía le
  prometía a Ovi el salto de gimnasio y a Nico el perdonar una caída, aunque
  los poderes se habían tirado el 29. Ya no. En `PLAN.md` las bitácoras viejas
  se quedan tachadas en vez de borradas, porque cuentan por qué se probaron y
  por qué se fueron.
- **El guardado se queda como estaba, y ahora está escrito.** Se guarda el
  capítulo alcanzado y nada más: recargar la página vuelve a empezar ese
  capítulo, pero nunca hay que repetir uno ganado. Guardar la estrella exacta
  convertiría cerrar la página en una manera de guardar partida.
- **La tortuga ya no se llama «la tortuga».** Antes del primer capítulo hay una
  pantalla que le pregunta cómo se llama, con la tortuga caminando por abajo
  mientras decide. Lo que escriba manda en todos los textos de los tres
  capítulos. Puede dejarlo para después y se le vuelve a preguntar la próxima
  vez: mientras no le ponga uno, la puerta sigue abierta, y esa es la única
  manera de cambiarlo porque no hay pantalla de ajustes.
  - En los textos de `luna.ts` el hueco se escribe `{tortuga}` y `{Tortuga}`.
    Son dos porque sin nombre el hueco se llena con un artículo y en español
    eso cambia de forma según dónde caiga.

### Lo que se cerró el 29, con tu tercera vuelta

- **El bambú de la derecha estaba en espejo.** La caña nítida iba pegada al
  borde y las apagadas hacia adentro, o sea al revés que la mata de la
  izquierda. Ahora las dos matas se abren hacia el medio de la pantalla.
- **La tortuga se congelaba mientras la luna se despedía.** Misma firma que la
  vez del atasco en la orilla: el paso de física se cortaba durante la
  cinemática y el reloj de la pose se paraba con él, dejándola agachada en el
  golpe del aterrizaje. Ahora sigue caminando por la cima mientras la luna se
  va, y hay prueba en `npm run luna:probar`.
- **El desvanecimiento solo parpadeaba en la primera caña del soporte.** Era un
  `ctx.globalAlpha = 1` suelto dentro de los soportes, que se llevaba puesto el
  alfa de todo lo que venía después. Ahora el alfa viaja como parámetro y no
  como estado del canvas.
- **Los soportes de bambú, más cortos y sutiles**: de 74 píxeles a 34, con un
  nudo en vez de tres, y apagados.
- **Los loopings se fueron.** Eran aros flotando sin principio ni final. En su
  lugar hay **vías de pista que cruzan el mundo entero ondulando, con carros
  corriendo por encima**, muy apagadas. El fondo vive sin estorbar, y de paso se
  entiende que la subida es un rincón de una pista de carreras enorme.
- **Los poderes se fueron del juego entero.** Se probaron dos, el empujón y el
  planeo, y ninguno hacía falta. Fuera el marcador, el aire, el estado en el
  progreso, la pose de planeo y su prueba. El juego se sostiene con un gesto y
  las trabas de cada mundo, y cada regla de más es una regla que explicar en un
  regalo que se juega una vez.

### Lo que se afinó el 29, con tu segunda vuelta

- **El bambú estaba sucio y saturado.** Era una mancha verde: seis cañas por
  lado, todas del mismo color, planas y llenas de hojas. Ahora son tres por
  lado, cada una a su distancia, y eso decide su color, su grosor y lo que se
  ve. Cada caña lleva un degradado de lado a lado que la convierte en un
  cilindro en vez de un palo, el verde se fue hacia el azul de la noche, y las
  hojas quedaron solo en la caña de adelante y cada tres nudos.
- **El parpadeo de la pista, arreglado.** El tiempo estaba bien y la animación
  no: se apagaba hasta un 22% y de ahí desaparecía de golpe. Ahora parpadea
  encendido y apagado, siete veces, **acelerando 2,6 veces** de las primeras a
  las últimas, y el último trocito se apaga entero. El aviso empieza antes
  (1200 ms en vez de 900) sin que el tramo dure más.
  - El parpadeo sale de la vida del tramo y no del reloj: con el reloj,
    acelerar la frecuencia salta de fase y sale un temblor sucio.
  - Y quedó medido en `npm run luna:probar`, que cuenta los parpadeos, comprueba
    que se aceleran y que termina en cero.
- **La luna dejó de saturar y pasó a ser el cuento.** Ya no está pegada a la
  pantalla todo el rato. Ahora:
  - **Al empezar el capítulo hay una cinemática**: sale llena y grande en el
    medio, respira, y se va para arriba hasta salirse de la pantalla. Con eso se
    entiende sin una sola palabra que vamos detrás de ella.
  - **Durante la subida no está.** El cielo se queda con las estrellas y ya.
  - **Espera arriba del último tramo**, en el mundo, así que se la ve aparecer
    cuando la cámara llega. Al pisar la cima **se va otra vez**, y el cartel del
    final espera a que termine de irse.
  - Un toque se salta la presentación. La primera vez vale la pena mirarla, a la
    quinta no.
- ~~**El empujón se cambió por el planeo.**~~ *(El planeo se fue en la vuelta
  siguiente; queda apuntado por lo que enseñó.)* Tenías razón las dos veces: un poder
  de un golpe hay que acertarlo, se gasta entero de una y nunca se llega a
  aprender qué hace. El planeo es lo contrario: **mantené el dedo apretado
  mientras caés y la tortuga abre las cuatro patas y baja despacio**, como una
  hoja, avanzando de lado igual. Un salto que salía corto llega.
  - Trae un tanque de aire de 1,5 segundos por capítulo, que se gasta solo
    mientras lo mantengas y no se recarga.
  - Medido: un salto flojo llega a 186 px, y planeando a 342, gastando algo más
    de medio tanque.
  - Tiene su pose: la tortuga se abre y se aplana, y se la ve todo el rato.
  - El icono de abajo a la izquierda es un paracaídas y los tres puntitos son el
    tanque. Se agranda mientras planeás.

### Lo que se afinó el 28 de noche, con lo que jugaste

Todo esto salió de tu lista, punto por punto.

- **El texto de Boo.** Fuera lo de que el resto del arreglo lo escogió otra
  persona: tenías razón, eso achica el regalo en vez de contarlo. Y el nombre ya
  no viene de «bamBOO» con el chiste subrayado, viene del bambú y se acabó.
- **Los puntos de guardado dejaron de ser el lazo de Boo.** Ahora son
  **estrellitas de papel**, las mismas del frasco: dobladas a mano, con un
  pliegue de cada dos en sombra, apagadas hasta que las pisás y encendidas
  después. Sirven para los tres capítulos porque no son de ningún peluche, son
  de ustedes dos.
- **El mundo dejó de parecer un prototipo.** Cuatro cosas:
  - La pista es un canal y no una tabla. De perfil se ven las dos paredes, el
    hueco en sombra por donde correría el carro, las costillas del refuerzo y
    las lengüetas de enganche de las puntas.
  - Los soportes ya no flotan: son cañas de bambú que bajan y se pierden en lo
    oscuro, y van más apagadas que las del fondo porque están en la sombra del
    tramo.
  - El bambú va en **matas** de tres a cinco cañas, inclinadas y de distinto
    grosor, y **de punta a punta del capítulo**. Una caña con las dos puntas a
    la vista parece un palo colgado del aire.
  - Hay **carritos parqueados** cada tres tramos, siempre hacia una punta y
    nunca donde aterriza la tortuga. Y los loopings tienen dos rieles con sus
    travesaños, y las rampas se apagan en vez de cortarse en seco.
- ~~**Los poderes se ven con un icono.**~~ *(Se fue el 29 con los poderes.)*
- **La pista se borra cada vez más rápido.** Cada estrella que pisa le quita
  380 ms, con un piso de 1,1 segundos. En el capítulo de Boo eso es
  2,6s → 2,2s → 1,8s → 1,5s → 1,1s: el último tramo se borra en menos de la
  mitad de lo que tardaba el primero, sin haber movido una plataforma.
- ~~**El empujón se rehízo entero.**~~ *(Y a la vuelta siguiente se fue del
  juego, igual que el planeo que vino después.)*

### El prólogo, apuntado como fase 7

Lo de que hay mucha información de golpe en el cartel de Boo tiene razón, y la
solución que pediste es un **prólogo antes del capítulo uno**: una escuelita
donde se aprende a jugar y nada cuesta nada. Queda escrito en
`plan-juego-luna.md` como la **fase 7**, después de los tres mundos y del último
trecho, que es donde vos dijiste. Enseña una cosa por pantalla: mantener y
soltar, el cansancio, la estrellita, los tramos que se borran y los de impulso,
los que traigan Ovi y Nico.

Mientras esa fase no exista, el cómo se juega sigue debajo de la historia de
Boo, porque quitarlo ahora dejaría el capítulo sin explicar a nadie. El día que
esté el prólogo, el cartel de Boo se queda solo con Boo.

### Lo que quedó hecho en la fase 3

- **El capítulo de Boo entero**, en `CAPITULOS` dentro de `src/content/luna.ts`.
  32 plataformas y 5 lazos, con la curva que salió del probador: los diez
  primeros saltos se pasan en uno de cada cuatro intentos y los últimos en uno
  de cada diez.
- **La pista se borra.** En cuanto despega de un tramo, ese tramo empieza a
  irse: parpadea cada vez más rápido y a los 2,4 segundos ya no está ni para
  pisarlo ni para verlo. Es la frase de Boo hecha mecánica.
  - Hasta el primer lazo no se borra nada, que es el trato de los diez saltos
    regalados.
  - Al volver a un lazo después de caerse, **la pista de arriba vuelve entera**.
    Sin eso, la primera caída sería el final de la partida.
  - Volver a pisar un tramo que ya se está yendo no lo salva.
- **Los tramos de impulso.** Al caer en uno, la tortuga se centra y sale
  disparada sola con la barra llena. Como sale siempre igual, el destino se
  puede poner al píxel. Hay dos: uno a mitad del capítulo y otro justo antes de
  la cima, para que el último salto llegue en volandas.
- ~~**El empujón**, el poder de Boo.~~ *(Se fue el 29, con los dos poderes y su
  estado en el progreso.)*
- **El cartel de presentación**, con el retrato bordado de Boo, su historia y el
  chiste de bamBOO. Debajo, solo en el primer capítulo, va el cómo se juega.
- **El mundo dibujado**: pista naranja de Hot Wheels con sus soportes y sus
  costillas, cañas de bambú creciendo por los bordes, loopings apagados al
  fondo, galones amarillos en los tramos de impulso y el lazo dorado en los
  hitos.
- **Un banco para mirar el mundo sin jugarlo**, `npm run luna:pista`, hermano
  del de la tortuga. Enseña la salida, un lazo, un tramo de impulso, la pista
  borrándose y la cima, todo de un vistazo. Fue lo que hizo barata la fase.
- **Dos pruebas nuevas en `npm run luna:probar`**: que el lazo no se borre y que
  el tramo pisado sí, y vuelva entero al caerse. (Había una tercera, del empujón,
  y se fue con él.)

### Dos cosas que aprendí peleándome con esto

- **Los tramos de impulso rompían la comprobación de los tramos.** El probador
  daba «NO SE PASA» en los dos que llegan a un impulso, y el nivel estaba bien:
  como el impulso lanza en el mismo frame del aterrizaje, mirar dónde quedó
  parada no sirve. Ahora, si el destino es de impulso, lo que se comprueba es
  que el impulso se haya disparado.
- **Mi primera prueba del desvanecimiento decía que el motor estaba roto y el
  roto era el banco de pruebas.** Hacía aparecer a la tortuga veinte píxeles por
  encima del tramo, y eso deja la línea de la caída cuatro píxeles por debajo de
  sus pies: al primer saltito se caía, volvía al principio y la pista se
  restauraba antes de que yo mirara. Van dos veces en dos días que el arnés
  miente antes que el juego.


### Lo que se hizo la noche del 28, con lo que jugaste

- **El cartel de antes de empezar.** Cuenta el mantener y soltar, el cansancio
  (que era lo importante: desmayarse sin aviso previo parece un error del
  juego) y para qué sirven los lazos. Está en `CARTEL`, en
  `src/content/luna.ts`. Detrás del texto el juego ya corre, con la tortuga
  caminando por el suelo, pero el dedo no hace nada hasta que le da al botón.
- **Los lazos avisan.** Al pisar uno sale «guardado aquí» arriba, dos segundos
  y se va solo. El lazo encendido y latiendo se pasaba por alto jugando.
- **Caerse cuesta.** Ahora se cae al bajar del último lazo, no al salir de la
  pantalla. Eso era lo que hacía que casi nunca te cayeras: errar un salto te
  dejaba dos escalones más abajo y volvías a subir como si nada, así que los
  lazos no llegaban a usarse jamás. Y se la ve caerse entera hasta que sale por
  abajo de la pantalla, con la cámara quieta. El margen es un número,
  `CAIDA.margenBajoElLazo`.
- **La ayuda de abajo se va sola** después del tercer salto, y vuelve si pasa
  medio minuto sin saltar. Los dos números están en `AYUDA`.
- **El arnés de pruebas se mudó a `scripts/juego-luna/`** y viaja con el
  repositorio. Con nombres de siempre: `npm run luna:probar` (¿se puede pasar el
  nivel?), `npm run luna:mapa` (a qué distancias se puede aterrizar),
  `npm run luna:ver` (fotos del juego andando) y `npm run luna:tortuga` (el
  banco de poses). Las fotos que sacan siguen cayendo en `private/notas/`.

### Lo del 28 por la noche, después de que lo jugaras publicado

- **El `localStorage` anda en tu iPhone.** Comprobado por vos: el total se
  guarda al llegar arriba y sigue ahí al volver a entrar.
- **Los lazos quedaron bien.** No se tocan más.
- **Arreglado el atasco de la orilla.** La tortuga se quedaba plantada,
  aplastada y parpadeando, y se soltaba al saltar. Era mío, de la noche
  anterior: la comprobación del aterrizaje perdona dos píxeles por fuera de la
  punta y la de «¿tengo suelo debajo para caminar?» no perdonaba ninguno, así
  que aterrizando justo en esos dos píxeles quedaba en tierra de nadie. Cada
  frame se dejaba caer, el aterrizaje la volvía a subir y le reiniciaba la pose
  del golpe: sesenta aterrizajes por segundo. Ahora las dos usan el mismo margen
  (`ORILLA`) y al aterrizar se la mete adentro de la plataforma en el mismo
  frame del golpe, que es donde no se nota.
- **El probador lo caza solo de ahora en adelante.** `npm run luna:probar` barre
  la punta de una plataforma por los diecisiete sitios donde puede caer, medio
  píxel a la vez, y avisa si en alguno se planta. Con el error puesto de vuelta
  lo encuentra: se plantaba en dos de los diecisiete. El rango malo eran dos
  píxeles y a ojo no se encuentra nunca.
- **El último salto ya no es el más difícil.** Era el más apretado de todos
  (7,1% de los intentos buenos, el probador ya lo llamaba «justo») y el plan
  dice que el salto antes del premio no es el sitio para pedir puntería. La cima
  se corrió de `x: 110` a `x: 150` y quedó en 14,5%, como el resto.

### Sigue estando fácil, y por qué no lo arreglo achicando plataformas

Lo subiste en 19 pasitos sin caerte, que es exactamente lo que hace el robot.
El nivel de prueba es fácil porque es **regular**: todos los tramos suben lo
mismo y alternan de lado, así que una sola carga aprendida sirve para los veinte
saltos. No hay nada que leer.

La salida no es achicar las plataformas. En un teléfono, achicar el blanco es
dificultad de pulso, y contra esa no se aprende, solo se falla más. Y el juego
es para ella, no para vos.

Lo que sí lo pone difícil está en el plan y llega en la fase 3:

1. **El desvanecimiento de Boo.** La pista se borra detrás. No se puede bajar a
   rehacer un tramo, y eso convierte cada caída en volver al lazo de verdad.
2. **La irregularidad.** Cuando escriba las 32 plataformas de Boo, los tramos no
   van a subir todos lo mismo ni alternar siempre de lado. Dos seguidas del
   mismo lado obligan a esperar a que la tortuga se dé la vuelta, y eso ya es
   una decisión.
3. **El largo.** 32 en vez de 20, con los lazos cada seis o siete.
4. **El colado**, que se para justo en la plataforma a la que ibas.

### Una que quedó abierta

**¿Se guarda el lazo dentro del capítulo?** Hoy no: al recargar la página se
empieza el capítulo desde abajo, y lo único que se guarda es el capítulo ganado.
Está así a propósito y está escrito en `progreso.ts`, pero esa decisión se tomó
cuando un capítulo duraba 50 segundos. Con 32 plataformas son tres o cuatro
minutos, y en el Android de ella el navegador mata las pestañas de atrás cuando
le entra una llamada. *Mi voto: guardar también el último lazo del capítulo en
curso, en la fase 3. El motivo que había en contra era que cerrar la página se
volviera una manera de guardar partida, y no aplica: las caídas ya son infinitas
y gratis, no hay nada que hacer trampa.*

### Las decisiones que me dejaste

- **El arnés se versiona.** Hecho.
- **La ayuda de abajo se va.** Hecha, con los números a la vista en `AYUDA`.
- **El nombre de la tortuga sigue abierto.** Mi voto sigue siendo que se lo
  pongás vos, o que se lo ponga ella la primera vez que juegue. Mientras tanto
  es «la tortuga» y el cartel del final no la nombra.
- **Cuántas plataformas: 32 por capítulo y 5 lazos.** Me dijiste que lo pensara
  yo con lo que hablamos, y esto es lo que sale de los números. El de prueba
  tiene 20 y el robot lo sube en 50 segundos jugando perfecto, o sea unos 2,6
  segundos por salto contando la caminata hasta la orilla. Tres capítulos así
  son tres minutos, no los 15-25 que dice el plan. Con 32 plataformas cada
  capítulo son unos 85 segundos limpios, y jugando de verdad (con caídas, y en
  Boo con la pista desvaneciéndose detrás) se va a los tres o cuatro minutos.
  Los tres capítulos más el último trecho quedan entre 12 y 15 minutos, que es
  adonde creo que hay que apuntar: los 15-25 del plan son mucho rato de pulso
  fino en un teléfono. Los lazos van cada seis o siete plataformas.

### Ideas que se me ocurrieron y no están en el plan

Ninguna es urgente y todas se pueden tirar a la basura.

- **La marca de la última carga.** Que la barra deje una rayita fina donde
  quedó el último salto que dio. Ayuda muchísimo a aprender a medir la fuerza,
  y no le regala nada: sigue siendo su pulso. Creo que esta vale de verdad.
- **El hito podría hacer algo más.** Hoy el lazo se enciende y late. Al pisarlo
  por primera vez podría soltar unas estrellitas hacia arriba, como el frasco.
- **Contar los pasitos a la vista, chiquito, en una esquina.** El plan los
  guarda para el final del capítulo. Verlos mientras sube puede ser bonito
  («voy en 40 pasitos») o puede volverlo una competencia contra sí misma. No lo
  tengo claro y por eso no lo hice.
- **Que la luna reaccione al final.** Cuando ya está cerca, que crezca un
  poquito con cada hito, o que el halo se abra al pisar el último. Es barato y
  se vería.

### Lo que ya está anotado de antes y sigue esperando

- Los **13 puntos y coma** de `src/content/momentos.ts` y los 5 de
  `src/content/diccionario.ts`, que son de mi redacción y no citas.
- El **momento de Boo** en la línea del tiempo (23 de diciembre de 2024) y
  sacarle su frase comodín de `src/content/peluches.ts`.

El plan completo —mecánica, los tres mundos, valores de la física y orden de
trabajo— vive en **`plan-juego-luna.md`**, en la raíz. Se lee antes de escribir
la primera línea.

**Lo del 28 de agosto (fase 2):**

- **El mundo.** Nivel de 20 plataformas y 4 hitos, cámara que sigue a la
  tortuga, hitos que guardan el avance, caída con reaparición en el último hito
  y `progreso.ts` con el `localStorage`.
- **Las plataformas se escriben con altura desde el suelo**, no con
  coordenadas de pantalla: `{ x, ancho, altura }`, y `mundos.ts` convierte.
- **El probador ahora juega.** Un robot sube el nivel entero calculando cada
  salto: lo termina en 19 pasitos sin caerse, y la prueba de la caída confirma
  que vuelve al hito. Al lado quedó `mapa-saltos.mjs`, que dice a qué
  distancias se puede aterrizar según lo que haya que subir. La regla que salió
  de ahí: **la distancia cómoda ronda los 175 sea cual sea la subida**.
- **El primer nivel que escribí era tramposo** y el probador lo cazó: seis
  tramos salían apretadísimos, uno con solo el 0,2% de los intentos buenos. El
  de ahora tiene entre 6% y 23% en todos, y va de fácil a difícil de abajo
  arriba.

**Lo del 27 de agosto (fases 0 y 1):**

- **La carta ya está escrita y cifrada** en `public/cifrado/carta-luna.enc`.
  Deja dos huecos, `{caidas}` y `{pasitos}`, que llena el juego en la fase 6.
- **El motor pelado anda**: ruta `/luna` sin enlazar desde ningún lado, canvas
  medido con `visualViewport` y `devicePixelRatio`, paso fijo de 60 Hz con
  acumulador y dibujo interpolado, la tortuga caminando y dando la vuelta, la
  barra de fuerza, la vibración y el fogonazo. La tortuga está dibujada a mano
  en `dibujo.ts`: no hay una sola imagen.
- **El probador se adelantó de la fase 2 a la 1** y encontró el primer error
  antes de abrir el navegador: los impulsos del plan (700 y 1400) mandaban el
  salto largo 671 px de lado en un mundo de 360 de ancho. Quedaron en 540 y 930.
- **La tortuga se rehízo entera** (28 de agosto). Era un caparazón con paticas y
  ahora es un personaje: parada en dos patas, brazos y piernas con codo y
  rodilla, caparazón a la espalda, panza, y cara con cejas y boca que cambia de
  expresión. Camina con ciclo completo, se agacha y tiembla al cargar, se estira
  al subir, se encoge y se asusta al caer, se aplasta al aterrizar y parpadea.
  Vive en `src/juego-luna/tortuga.ts` y su tamaño es un número de `luna.ts`.
  Para verla sin jugar está el banco de poses de `private/notas/`.
- **Mecánica nueva, idea de Armando: el cansancio.** Aguantar la barra
  esperando el momento perfecto ya no sale gratis. A los 2,1 segundos se agota,
  se desmaya con estrellitas y pierde el salto; medio segundo antes la barra se
  pone roja avisando. No baja al hito ni pierde nada más: solo hay que
  esperarla. Los números están en `CANSANCIO`, en `luna.ts`.
- **Dos arreglos que salieron de mirarlo en el teléfono:** al chocar contra el
  borde del mundo ahora se da la vuelta (antes caía mirando a la pared y volvía
  a saltar contra ella), y el mundo se escala con la medida más chica de las
  dos, porque escalando solo por el alto se salía por los costados en un
  teléfono largo.
- **Nueva regla de voz:** nada de punto y coma en lo redactado en nombre de
  Armando. Está en `.claude/skills/repasar-textos/voz-del-proyecto.md`.
- **Queda pendiente, cuando haya un hueco:** sacar los 13 puntos y coma que se
  colaron en los relatos de `src/content/momentos.ts` y los 5 de
  `src/content/diccionario.ts`. Son de redacción mía, no citas.

**El plan está partido en diez fases** (sección «Las fases» del mismo archivo),
pensadas para que quedarse sin créditos a media sesión no duela: cada una
compila, pasa `npm run revisar` y se sube sola. La carta es la fase 0 y la
entrada por la luna de la portada es la 9, la única que hace visible el juego
para ella. Mientras esa no se haga, todo lo demás puede quedar a medias sin que
se note.

**La web se entregó el 24 de agosto de 2026**, con el regalo de la portada: la
caja que se abre, la luz y el video. Ese mismo día se arregló la carta para que
se lea bien en Safari. De aquí en adelante todo lo que se haga es para una web
que ella ya tiene en la mano, así que nada puede quedar a medias entre una
sesión y otra.

**Lo del 25 de agosto:**

- El skill del repaso **pasa a vivir en el repositorio**, como
  `.claude/skills/repasar-textos/` —es el `humanizer`, renombrado para que no
  choque con la copia global—, con una hoja al lado, `voz-del-proyecto.md`,
  que dice qué se repasa, qué no se toca nunca y cómo suena el español de aquí.
  Ahora es parte del flujo: se escribe, se pasa el skill, se revisa, se
  commitea. Está anotado en `CLAUDE.md`.
- **Apareció la historia de Boo**, que era el hueco más viejo del plan. Vino en
  el arreglo de Hot Wheels que ella le regaló en Navidad, con su lazo amarillo.
  Buscando en el chat salió la fecha: **23 de diciembre de 2024**, el día que se
  vieron de cinco a diez de la noche y se dieron los regalos. Esa noche él
  escribió que iba a dormir con el osito, y diez días después Boo todavía olía
  a ella. El nombre, además, viene de bamBOO, por el panda.
- **El teléfono de ella es Android; el de él es iPhone.** Salió al planear el
  juego y vale para todo lo demás: el aparato que manda al probar es el de ella.
  Lo medido contra Safari sigue sirviendo como el caso más estrecho, pero no es
  el que decide.
- Con eso **se cierra la decisión que estaba abierta**: Boo no cae años antes de
  conocerse, cae en pleno primer diciembre juntos y entra como un momento normal
  de la línea del tiempo. Falta escribirlo en `src/content/momentos.ts` y
  sacarle a Boo la frase comodín de `src/content/peluches.ts`.

**Lo que sigue esperando, después del juego:**

1. **El momento de Boo** en la línea del tiempo, con su fecha ya encontrada.
2. **Los dos momentos apuntados sin escribir**: el 24 de noviembre de 2024 y las
   flores de lego, que además no tiene fecha.
3. **La línea del tiempo horizontal para computadora**, lo único atrasado del
   orden original.
4. **Probar el diccionario en el teléfono de verdad**: si alguna ficha quedó
   cortada y si el gesto pesa bien (`ZONA_MUERTA` y `DUREZA` en
   `src/componentes/Libro.tsx`).
5. **PWA**: hoy no hay manifest ni ícono, así que agregarla a la pantalla de
   inicio no le pone carátula propia.

---

## Lo que se cerró el 22 de agosto de 2026 (el diccionario)

**Cómo está la web ahora mismo:** publicada y andando en el teléfono. Puerta con
la frase, portada con contadores y "un día como hoy", línea del tiempo con 15
momentos (13 escritos, 2 apuntados) y 5 instantes, 20 fotos y 6 videos cifrados,
13 conversaciones reales, playlist, estadísticas, el juego de las frases entero,
el frasco de mensajitos, los tres peluches escondidos por las esquinas con sus
retratos bordados, y **el diccionario oso–español**: 37 entradas en un libro de
81 hojas que se pasan con el dedo.

**Lo primero al volver:** que ella —o vos— abra `/diccionario` en el iPhone y
me digás **si alguna ficha quedó cortada**. Las hojas ya no se ruedan (en Safari
no se podía), así que lo que no entra pasa a la vuelta; está medido en cuatro
tamaños, pero un teléfono de verdad manda más que cualquier medición mía.
Lo segundo, si el gesto quedó bien de peso: son dos números en
`src/componentes/Libro.tsx` (`ZONA_MUERTA` y `DUREZA`) y se ajustan en un minuto.

**Los peluches y el frasco ya están publicados.** El frasco salió el 18 de
agosto de noche, con los mensajitos reescritos, cifrados y con cupo diario (ver
abajo). `/frasco` ya no es la página «en construcción», y `src/App.tsx` volvió a
quedar igual en el repo y en la máquina.

**Lo del 18 de agosto:** se resolvieron dos de las tres decisiones cortas —los
escondites rotan por día y las estrellitas caen y se sacuden—, **llegaron los
retratos de los peluches**, y de noche **se rehízo y publicó el frasco entero**.
La decisión que sigue abierta es la tercera: cómo entra Boo en la línea del
tiempo, que espera a tener su fecha.

### El diccionario — 22 de agosto

Ella hizo un borrador de 20 palabras leyendo el chat. Está en
`private/diccionario-borrador-de-ella.md` (llegó a la raíz del repo con citas
textuales adentro; se movió antes de que un `git add .` lo publicara en claro).

**Lo que salió de comprobarlo contra los 160.803 mensajes:**

- Tres cosas del borrador estaban mal: «no hay de queso» la trajo él pero hoy
  la dice más ella (102 contra 46); «logaritmo» no aparece nunca escrito por
  ella, solo él citándola; y «dólar → dolor» **no existe** en ninguna de las dos
  fuentes.
- Aparecieron palabras que el borrador no tenía: `chi` (340 veces, la empezó él
  a la medianoche del 21 de octubre de 2025 y ella se la quedó), `ño`, `ta`, y
  sobre todo **la letanía**: «Cómo amaneció mi osito bello, hermoso, precioso…»,
  295 veces, todas de ella, que empezó midiendo 28 caracteres y llegó a 1.162
  el 8 de junio de 2025.
- `yaya` es de él (178 de 200) y `yayaya` es de ella (282 de 283). No se cruzan
  nunca. El borrador las tenía como una sola.

**Para aprobar: `private/diccionario-candidatas.md`** — 30 entradas con casilla,
la definición ya redactada para corregir, y los datos duros de cada una.

**El libro ya funciona** en `/diccionario`, con las 29 entradas aprobadas: tapa
de cuero con la polaroid de ustedes dos de chiquitos
(cifrada, como todas las fotos), papel con grano, canto de páginas que adelgaza
mientras avanzás, hojas que se pasan con el dedo y pestañas alfabéticas en el
canto. En el teléfono se lee de a una página; en computadora se abre de par en
par. Motor en `src/componentes/Libro.tsx`, contenido en
`src/content/diccionario.ts`.

**Aprobado el 22 de agosto.** Quedaron **29 entradas**: se cayeron alaa, okok,
bienn, ta y el «dólar → dolor», que no existía en ninguna de las dos fuentes.
Entraron con arreglos suyos: el origen brasileño de coxinho (la película del
perro, Caramelo), que testraño y abriba están mal escritos **a propósito** y no
son dedazos, que «no hay de queso» es de Chespirito y que la variación más usada
es «ni de papa» (71 veces), que «soñá con los angelitos» se lo decía su mamá y
antes su abuela, y que numinosa la buscó él aposta. Se sumaron «la madre de mis
hijos» y el par futura esposa / futuro esposo.

**El hallazgo de esa pasada:** en «gashas» cada uno tiene su letra. Ella escribe
sh (881 veces) y ch una sola vez; él escribe ch (381) y sh cuatro. Nadie lo
acordó nunca. Y «futuro esposo» lo estrenó ella **diez minutos después** de que
él dijera «mi amada futura esposa», la misma noche del 26 de febrero de 2025.

**Polly, Epi, Fiona y Lara son mascotas** —Polly de ella; Epi, Fiona y Lara de
él— así que no van a `nombres-prohibidos.json`. Igual no se nombran en claro.

**Las citas ya están cifradas — 22 de agosto, de noche.**
`npm run diccionario:preparar` peina los dos chats y arma
`private/publicable/diccionario.json`, que el hook convierte en
`public/cifrado/diccionario.enc`. De ahí salen tres cosas:

- **Dónde nació cada palabra**: el pedazo de conversación de aquel día, con la
  burbuja que la estrena resaltada. Son las burbujas de verdad.
- **La curva de uso mes a mes**, en la hoja del nacimiento, con el mes del pico
  en rojo. En las fórmulas mide el largo en vez de las veces: ahí se ve cómo el
  saludo de ella pasó de cuatro palabras a 1.150 caracteres.
- **El título de las tres fórmulas.** Esas entradas son una frase entera de
  ellos, así que el título no puede vivir en claro: llega descifrado, y en
  `src/` solo queda un nombre de referencia y la letra del índice.

**Ninguna hoja tiene scroll.** En Safari de iPhone, un contenedor con scroll
metido dentro de un `preserve-3d` no se puede rodar —bug viejo de WebKit— y por
eso las fichas largas quedaban cortadas sin manera de llegar al final. Ahora lo
que no entra pasa a la hoja siguiente, como en un diccionario de papel.
`private/notas/ver-desbordes.mjs` lo comprueba en cuatro tamaños, incluido el
iPhone con la barra del navegador puesta, que es donde menos alto queda.

**La página del diccionario tampoco rueda**: el libro se mide por el alto de la
pantalla y entra entero, así el dedo no tiene que adivinar si está pasando una
hoja o bajando la página. Y el gesto pide compromiso — 14 px de recorrido y que
sea claramente horizontal — antes de mover el papel.

**El libro quedó en 81 hojas y 37 entradas**, con un apartado final de frases
(las tres fórmulas, bajo la pestaña ✦), una entrada por cada mascota —Polly de
ella; Epi, Fiona, Lara y Frida de él— y una contratapa al pasar la última hoja. Se prueba solo con
`node private/notas/probar-libro.mjs`: recorre el libro entero y comprueba que
ninguna hoja quede en blanco, que ir y volver caiga donde debe, que lo cifrado
llegue y que el índice del canto lleve a donde dice.

Para verlo: `node private/notas/ver-libro.mjs` saca las capturas y
`node private/notas/ver-desbordes.mjs` comprueba que ninguna ficha se salga de
su hoja en 360, 390 y 1440 de ancho.

### Lo que toca, en orden

1. **La historia de Boo.** Contame su historia y lo escribo como momento de
   la línea del tiempo. Es el único de los tres que no tiene la suya, y por eso
   su frase de la esquina es un comodín («Yo estuve en casi todas estas fechas.
   Nadie me tomó fotos»). La fecha va a quedar lejísimos de todo lo demás —
   probablemente años antes de conocerse — y eso está bien: la línea ordena
   sola, y con la fecha ya puesta decidimos cómo se muestra, que es la decisión
   que quedó abierta abajo. Además su ficha en `src/content/peluches.ts` sigue
   diciendo «FALTA: quién se lo regaló a quién y cuándo» — hoy no se publica
   porque el resumen la reemplaza por su frase, pero está esperando.
2. **La línea del tiempo horizontal para computadora**, que es lo único atrasado
   del orden original.
3. **Probar el diccionario en el teléfono de verdad.** Está terminado y las
   pruebas pasan, pero el arrastre con el pulgar y las sombras durante el giro
   solo se juzgan bien en un teléfono real.

### El frasco de mensajitos — publicado el 18 de agosto (de noche)

Se tiró todo lo que había y se rehízo con material de verdad:

- **Los 29 borradores se borraron.** No sonaban a él: eran frases largas, con
  mayúscula inicial y punto final. Medido sobre sus 79.239 mensajes, Armando
  escribe con mediana de 19 caracteres, empieza en mayúscula el 3,5 % de las
  veces y casi no usa emojis (0,3 %).
- **Ahora son 34**, de los cuales **20 son frases textuales suyas** sacadas del
  chat con `private/notas/` y las dos fuentes (WhatsApp + Instagram), 6 armadas
  con fórmulas que repite («de aquí a la luna a pasitos de tortuga», «mi
  solecito, mi cielo, mi estrellita») y 8 escritas imitándolo. Él aprobó,
  rechazó y editó uno por uno en `private/mensajitos-candidatos.md`, que queda
  como el registro de qué salió de dónde.
- **Van capitalizados y sin abreviaciones**, por decisión suya: en un papelito
  de regalo la minúscula y la «q» se leen como descuido, no como voz.
- **No hay ninguno de tono `chiste`.** Los rechazó todos. El tono sigue
  existiendo en el tipo y en la paleta por si alguna vez vuelve.
- **El frasco entero va cifrado.** Varios mensajitos son frases reales del chat
  y `src/` se publica en claro, así que se movieron a
  `private/publicable/frasco.json` → `public/cifrado/frasco.enc`. En
  `src/content/mensajitos.ts` solo quedan `POR_DIA` y los textos de pantalla.
- **Tres por día, contados en horario de Nicaragua** (`POR_DIA` en
  `src/content/mensajitos.ts`). Sin límite, el frasco se lee entero la primera
  tarde y después no queda nada por lo que volver; con tres son casi dos
  semanas. Al agotar el cupo el botón «sacar otra» desaparece —más claro que un
  botón apagado— y el frasco se sigue sacudiendo al tocarlo, pero no sale nada.
- **La última del día sigue desdoblada al volver.** Si cierra la página sin
  querer, no perdió una de las tres. Se guardan las huellas, nunca el texto.

Probado en el navegador con `private/notas/ver-frasco.mjs`: saca las tres, la
cuarta no sale, sobrevive a la recarga y al día siguiente no repite ninguna de
las de ayer. **Ojo con el tiempo de descifrado**: PBKDF2 con 250.000 vueltas
tarda más de 1,8 s, así que cualquier prueba automática que mire la pantalla
antes de eso ve el frasco vacío y parece un fallo que no existe.

### Los retratos de los peluches — hechos

Ya están, y no son fotos: son **ilustraciones de parche bordado** generadas en
higgsfield.ai (Nano Banana Pro, imagen de referencia + prompt, 2 créditos cada
una) a partir de las fotos de los tres. La foto realista de un peluche sobre el
fondo nocturno se veía como un recorte pegado; el parche bordado, con su borde
de puntada, se lleva bien con el papel y la cinta adhesiva del resto.

Los prompts y el porqué de cada decisión quedaron en
`private/notas/retratos-peluches-higgsfield.md`, por si hay que regenerar
alguno. Lo que más costó acertar y conviene no perder:

- **Nada de códigos de color en el prompt.** Se le pide al modelo que saque el
  color de la foto de referencia *y que neutralice la luz de la habitación*.
  Las fotos de Ovi y Nico salieron subexpuestas y con tinte cálido: el color
  medido en el archivo es el del peluche mal iluminado, no el del peluche. Y
  las variables de `index.css` tampoco sirven, que son decisiones de diseño
  para el halo.
- **Lo que sí va explícito son los detalles que el modelo borra** hacia el
  peluche genérico: los ojos ámbar de Boo (todo panda de IA los tiene negros),
  el lazo floral y los ojos cerrados de Nico, las dos texturas de Ovi.
- **El recorte deja halo verde.** Se generan sobre fondo chroma verde y ningún
  quitafondos recorta perfecto: quedaban entre 3.000 y 9.000 píxeles verdosos
  en el contorno, invisibles sobre blanco y clarísimos sobre el fondo nocturno.
  Los limpia `npm run peluches:preparar`, que además los centra y los achica.
  Ese script es el único paso entre la imagen recortada a mano y la web.

### Cómo funciona el juego de los peluches (18 de agosto, segunda vuelta)

Después de verlos en el teléfono cambió casi todo menos la idea:

- **Van pegados a la página, no a la pantalla.** Antes eran `fixed` y viajaban
  con el scroll como los botones de casa y de tema, o sea que no había nada que
  buscar. Ahora son `absolute` dentro del `<main>`: el que se esconde arriba
  está al entrar y se pierde al bajar, y el que se esconde abajo obliga a
  recorrer toda la página. En la línea del tiempo y en el juego van siempre
  arriba — mandarla al fondo de quince momentos es una tarea, no un guiño.
- **Nunca dos en la misma página el mismo día.** El reparto del día se encarga
  aunque las listas de escondites se pisen.
- **Sombra corta y oscura, no resplandor.** El halo de color los delataba desde
  la otra punta de la pantalla y encima los dejaba borrosos.
- **Al encontrarlo sale al centro, grande, con el fondo apagado detrás**, dice
  lo suyo, muestra «1 de 3» y **desaparece de la esquina**. Encontrado es
  encontrado: quedarse ahí de adorno le quitaba sentido a haberlo buscado.
- **El premio los muestra grandes, uno debajo del otro**, con nombre y ficha —
  ahí sí se miran con calma los retratos bordados. Y **el colado también sale
  en él**: con su cara si lo encontró, y si no como su silueta en negro con un
  signo de interrogación, que ya es media pista para mañana.
- **Del premio se sale de una sola forma: mandándolos a dormir.** El botón, la
  tecla y el fondo hacen lo mismo. No es pereza de diseño: sin una salida que
  borre lo encontrado, los tres quedaban marcados para siempre y no volvían a
  esconderse nunca. Así el ciclo cierra solo — encontrarlos, verlos, que
  duerman, y mañana otra vez.
- **El colado.** Un cuarto peluche que no es hijo: el pato de la hermanita, que
  «se coló cuando dejamos la puerta abierta». No cuenta para el «1 de 3» y no
  hace falta encontrarlo para el premio, aunque aparece en él. Va siempre con
  su color de fábrica: amarillo, peluca verde y pico naranja.
- **`npm run peluches:hoy` dice dónde está cada uno.** Importa el mismo módulo
  que la web (`src/lib/escondites.ts`), no una copia, así que no puede
  desfasarse. Sirve para mandarle una pista por mensaje y, sobre todo, para
  saber si un peluche que no aparece está mal escondido o mal dibujado — que
  fue exactamente la duda la primera vez que no aparecieron.
- **Los de abajo no van pegados al filo.** Con `bottom-6` caían dentro del
  `pb-24` de las páginas: llegar al final no alcanzaba para verlos, había que
  llegar al final *y* saber que estaban ahí. Ahora van a `bottom-28`.
- **Las fichas a medio escribir no se publican.** La `descripcion` de un peluche
  se ve en el premio desde que este se rediseñó, y la de Boo todavía dice
  «FALTA: quién se lo regaló…». Mientras empiece por «FALTA», en su lugar habla
  el peluche con su propia frase. Sigue haciendo falta escribirla, pero ya no se
  publica sola.

**Todo esto está visto en el navegador**, no solo compilado: con
`private/notas/ver-peluches.mjs` y sus dos hermanos, que abren la web con Chrome
en tamaño de teléfono, pasan la puerta con la frase de `.env` y sacan capturas.
Están en `private/` porque usan esa frase, y nunca la imprimen. Si algo visual
vuelve a fallar, ese es el camino corto: `npm run dev` y correrlos.

### Decisiones ya tomadas (18 de agosto)

1. **Los peluches rotan de escondite, uno por día.** Cada uno tiene tres
   escondites en `src/content/peluches.ts` y el del día sale de la fecha de
   Nicaragua mezclada con su id — no de `Math.random`. Así el mismo día están
   siempre en el mismo lugar y se los puede mandar a buscar por mensaje («hoy
   Ovi anda en la playlist»), pero mañana ya se movieron. Encontrado se queda
   encontrado aunque después se mude. En 30 días el reparto sale parejo, unos
   diez días en cada sitio. Cuidado al agregar escondites: dos peluches pueden
   compartir ruta, pero nunca ruta **y** esquina.
2. **Las estrellitas caen al entrar y se sacuden al tocar el frasco.** Entran
   desde arriba, escalonadas, y se asientan con un rebote corto; después se
   quedan quietas. Flotar todo el tiempo cansa en una página que se mira fijo y
   gasta batería.

   La primera versión no se veía: dependía de `useAnimationControls` disparado
   desde un efecto y, si esa conexión no llegaba a hacerse, las estrellitas se
   quedaban en su estado inicial —`opacity: 0`— y el frasco parecía vacío.
   Ahora la caída es declarativa (el navegador la corre al montar, no hay nada
   que conectar) y la sacudida se repite cambiando la `key` de un span interno,
   que lo remonta. **Moraleja para lo que venga: si una animación tiene que
   verse sí o sí, que no dependa de un efecto.**

### La decisión que queda abierta

**¿Cómo entra Boo en la línea del tiempo?** Su fecha va a caer años antes de
todo lo demás. O se muestra como un momento normal y la línea empieza mucho
antes de agosto de 2024, o le hacemos un apartado de «lo que ya existía antes de
nosotros». **Lo que yo haría:** verlo con la fecha ya puesta y decidir
mirándolo; con un solo momento suelto tan atrás capaz que ni molesta. Por eso
espera a que me contés su historia.

## Para la versión 2 (después del 24)

Ideas que quedaron fuera por tiempo, no por malas:

- El *Wrapped* de la relación — los datos ya están calculados
- Mapa de nuestros lugares
- Cartas que se desbloquean en fechas futuras
- Memorama con fotos
- Libro de metas juntos
- Que ella pueda agregar momentos sin tocar código
