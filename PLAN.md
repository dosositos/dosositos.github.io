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
- [ ] Día 6 (19 ago) · Diccionario oso + frasco de mensajitos + "un día como hoy"
- [ ] Día 7 (20-21 ago) · El sobre de apertura, easter eggs, peluches escondidos
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
   de verdad nos atrasa. Van **11 momentos escritos** (del 24 de agosto al 19
   de octubre de 2024) más 2 apuntados sin escribir: el 24 de noviembre («el
   día que dijiste que sí») y el 1 de enero (las flores de lego). Siguen 2025
   entero y lo que va de 2026. Con la fecha y dos líneas por momento me alcanza.
2. **Las fotos** → a `fotos-originales/`. Hay 14 ya optimizadas y cifradas; las
   que falten van de las mismas: las tirás ahí y corré `npm run fotos:optimizar`
   (desde el 16 de agosto eso ya no las publica en claro, las cifra).
   Los **pies de foto**: 8 de 10 escritos en los momentos, ninguno en los
   "instantes". No es obligatorio, pero se leen lindo.
3. **Decidir qué momentos son privados** → los que lleven `privado: true`
   pedirán la contraseña otra vez. Hoy no hay ninguno, y puede quedar así: el
   candado de la entrada ya cubre todo.
4. **El diccionario oso** → las palabras que solo existen entre ustedes. Bloquea
   el día 6.
5. **Los mensajitos del frasco** → 20-30 frases cortas tuyas. Bloquea el día 6.
6. **La dedicatoria del sobre** → lo primero que va a leer. Tomate tu tiempo.
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
- [x] Vos: aprobadas — se ven en el teléfono (14 fotos y el video)
- [ ] Vos: los pies de foto que faltan (2 momentos y los 4 "instantes")
- [ ] Yo: las fotos de los momentos que faltan, según vayan llegando

**El video (`momento10.mp4`) va igual, con una salvedad:** cifrado no se puede ir
reproduciendo mientras baja, hay que bajarlo entero y armarlo en memoria. Con
900 KB no se nota. Si algún día entra uno de 40 MB, ese hay que pensarlo aparte.

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
- [ ] Yo: frasco de mensajitos con estrellitas de papel
- [ ] Yo: "un día como hoy" en la portada, sacado del chat

### Día 7 · Magia
- [ ] Vos: la dedicatoria
- [ ] Yo: el sobre que se abre la primera vez
- [ ] Yo: easter eggs (escribir "osito", código Konami, clics secretos)
- [ ] Yo: Ovi, Boo y Nico escondidos por las esquinas
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
2. Frasco de mensajitos
3. Diccionario oso
4. Música de fondo
5. Easter eggs

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
- **Todo el código en español**, incluidos nombres de variables y archivos.

---

## Por dónde seguimos — cerrado el 17 de agosto de 2026

**Cómo está la web ahora mismo:** publicada y andando en el teléfono. Puerta con
la frase, portada con contadores, línea del tiempo con 13 momentos (11 escritos,
2 apuntados) y 2 instantes, 14 fotos y un video cifrados, 11 conversaciones
reales, playlist, estadísticas y el juego de las frases entero.

**Lo primero al retomar (yo):** el día 2 — la línea del tiempo horizontal para
computadora. Es lo único que quedó atrasado del orden original, y es lo primero
que se cae si vamos con el tiempo justo, así que tampoco es urgente. Si preferís,
saltamos al día 6 (diccionario y frasco), que es contenido que se ve.

**Lo primero al retomar (vos):** los momentos de 2025 en adelante, en
`private/plantilla-momentos.md`. Con la fecha y dos líneas por momento me
alcanza. Todo lo demás que falta depende de eso o es de la última semana.

**Nada quedó a medias:** no hay ramas abiertas, ni archivos sin commitear, ni
pasos manuales pendientes. El cifrado corre solo con el hook y el build se cae
antes de publicar algo incompleto.

---

## Para la versión 2 (después del 24)

Ideas que quedaron fuera por tiempo, no por malas:

- El *Wrapped* de la relación — los datos ya están calculados
- Mapa de nuestros lugares
- Cartas que se desbloquean en fechas futuras
- Memorama con fotos
- Libro de metas juntos
- Que ella pueda agregar momentos sin tocar código
