# Plan — 10 días hasta el 24 de agosto

> **Fecha de entrega: lunes 24 de agosto de 2026** — dos años de habernos conocido.
> Ritmo: ~2 h por día. Lo que hace cada uno está separado, porque la mitad del
> trabajo es material que solo vos podés reunir.

---

## Estado general

- [x] **Día 0 (14 ago)** · Entorno, estética, contadores, portada — **y bastante más**
- [x] **Día 1 (15 ago)** · Línea del tiempo en móvil · **+ el chat de Instagram**
- [ ] Día 2 (16 ago) · Línea del tiempo horizontal en computadora
- [x] **Día 3 (16 ago)** · Fotos cifradas: polaroids, galería, ampliar al tocar
- [ ] Día 4 (18 ago) · El candado: cifrado y contenido privado
- [x] **Día 5 (17 ago)** · Juego "¿quién dijo esto?"
- [ ] Día 6 (20 ago) · Diccionario oso + frasco de mensajitos + "un día como hoy"
- [ ] Día 7 (21 ago) · El sobre de apertura, easter eggs, peluches escondidos
- [ ] Día 8 (22 ago) · PWA, música, celebraciones del calendario, pulido
- [ ] Día 9 (23 ago) · Pruebas en móvil de verdad, publicación, ensayo general
- [ ] **Día 10 (24 ago) · Entregar** 🌻

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

0. **Poner la frase en `.env`. Una vez, y no volvés a tocar el tema.**

   Creá `C:\Carpeta vacia\.env` con una sola línea:

   ```
   CLAVE_DOSOSITOS=la frase de siempre
   ```

   `.gitignore` ya excluye `.env`, así que no llega a GitHub. A partir de ahí
   el cifrado corre solo: cada vez que yo toque `private/publicable/`, un hook
   vuelve a cifrar sin que ninguno de los dos se acuerde de hacerlo.

   La primera vez hay que arrancarlo a mano, porque el hook solo reacciona a
   cambios:

   ```bash
   npm run secretos:cifrar
   ```

   Y `npm run build` se cae si falta el archivo cifrado o si se quedó atrás
   del contenido, con lo que GitHub Actions no publica. Antes compilaba igual
   y la web salía sin un solo chat, en silencio — que es exactamente lo que
   pasó el 15 de agosto.

   **La contrapartida, para que la tengas presente:** la frase deja de vivir
   solo en la cabeza de ustedes dos y pasa a estar escrita en tu computadora.
   Contra un desconocido con el enlace protege igual. Contra alguien que tenga
   acceso a tu máquina, o contra un respaldo de la carpeta del proyecto, ya no.

1. **La lista de momentos** → `private/plantilla-momentos.md`. Van 11 escritos
   (hasta el 19 de octubre de 2024) más 2 días de fotos sueltas. Seguís vos:
   noviembre en adelante, empezando por el 24. Con la fecha y dos líneas por
   momento me alcanza.
2. **Las fotos** → a `fotos-originales/` (ya hay 13 + un video). No corras
   `npm run fotos:optimizar` todavía: hasta que el día 3 esté hecho, eso deja
   las fotos en claro en `public/media/`.
3. ~~**Revisar las frases del juego**~~ — hecho el 16 de agosto: 341 aprobadas.
   Si querés más, volvé a correr `npm run chat:frases` y aprobá; el juego se
   rehace y se cifra solo.
4. **Decidir qué momentos son privados** → los que lleven `privado: true`
   pedirán la contraseña. Bloquea el día 4.
5. **El diccionario oso** → las palabras que solo existen entre ustedes.
6. **Los mensajitos del frasco** → 20-30 frases cortas tuyas.
7. **La dedicatoria del sobre** → lo primero que va a leer. Tomate tu tiempo.
8. **En GitHub: Settings → Pages → Source: GitHub Actions.** Un clic, y sin eso
   no se publica nada.

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
- [ ] Vos: faltan los momentos del 24 de noviembre en adelante

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
- [ ] Vos: aprobar cómo se ven y decidir los pies de foto
- [ ] Yo: las fotos de los momentos que faltan, según vayan llegando

**El video (`momento10.mp4`) va igual, con una salvedad:** cifrado no se puede ir
reproduciendo mientras baja, hay que bajarlo entero y armarlo en memoria. Con
900 KB no se nota. Si algún día entra uno de 40 MB, ese hay que pensarlo aparte.

### Día 4 · El candado
- [x] Yo: la puerta con la frase-contraseña y su pista
- [x] Yo: que la clave se recuerde durante la visita y no la pida a cada rato
- [x] Vos: decidido — **todas** las conversaciones reales van cifradas
- [x] Yo: los chats movidos a `private/publicable/chats.json` y cifrados
- [x] Yo: seguro en `secretos:cifrar` — si la clave no abre lo ya publicado, no
      cifra nada (un error de tipeo dejaba la puerta cerrada para siempre)
- [x] Yo: el cifrado corre solo con un hook al tocar `private/publicable/`,
      y no rehace nada si el contenido no cambió
- [ ] **Vos: poner `CLAVE_DOSOSITOS` en `.env` y correr `npm run secretos:cifrar`
      una vez.** Sin eso `public/cifrado/chats.enc` no existe y la web se
      publica sin conversaciones

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
- [ ] Vos: revisar las 14 frases inventadas de `private/frases-inventadas.json`
      (son mías, imitándolos, para que «ninguno» pueda ser la respuesta buena)
- [ ] Vos: jugarlo en el teléfono y decirme si alguna frase se entiende sola

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
- [ ] Activar Pages y publicar de verdad
- [ ] Probar en el teléfono real, no en el navegador de la computadora
- [ ] Revisar que nada privado quedó en claro en el repositorio
- [ ] Abrir el enlace con datos móviles, sin wifi
- [ ] Comprobar que la contraseña funciona en un teléfono limpio
- [ ] Leer todo en voz alta buscando erratas

---

## Consideraciones y riesgos

**La puerta no protege lo que hay detrás, todavía.** Frena a quien abra el
enlace, y eso ya es bastante — pero el contenido de `src/content/` viaja dentro
del código de la página, así que alguien que sepa mirar el código fuente puede
leer los momentos y los relatos sin escribir la contraseña. La protección de
verdad es el cifrado, y solo cubre lo que metamos en `private/publicable/`.
Hoy ahí solo está el saludo de bienvenida.

**Entonces, la regla:** lo que te importaría que leyera un desconocido **no puede
vivir en `src/content/`**. Va cifrado. Decime qué momentos, chats y frases entran
en esa categoría y los muevo — es lo que falta del día 4.

**Eso ya está resuelto para los chats.** Ninguna conversación real vive en
`src/content/`. Las seis están en `private/publicable/chats.json`, se cifran con
`npm run secretos:cifrar` y salen publicadas como `public/cifrado/chats.enc`, que
sin la frase de la puerta es ruido. En `momentos.ts` solo queda la ficha: cuántos
mensajes son y de qué app — y eso no le dice nada a nadie.

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

**Ojo mientras tanto:** `public/media/` no está en `.gitignore`. Hasta que el
día 3 esté hecho, no hay que correr `fotos:optimizar` y hacer commit, porque
eso sube las fotos en claro. Hoy no hay ninguna en el repositorio.

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
- **Todo el código en español**, incluidos nombres de variables y archivos.

---

## Para la versión 2 (después del 24)

Ideas que quedaron fuera por tiempo, no por malas:

- El *Wrapped* de la relación — los datos ya están calculados
- Mapa de nuestros lugares
- Cartas que se desbloquean en fechas futuras
- Memorama con fotos
- Libro de metas juntos
- Que ella pueda agregar momentos sin tocar código
