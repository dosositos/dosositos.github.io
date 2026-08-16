# Plan — 10 días hasta el 24 de agosto

> **Fecha de entrega: lunes 24 de agosto de 2026** — dos años de habernos conocido.
> Ritmo: ~2 h por día. Lo que hace cada uno está separado, porque la mitad del
> trabajo es material que solo vos podés reunir.

---

## Estado general

- [x] **Día 0 (14 ago)** · Entorno, estética, contadores, portada — **y bastante más**
- [x] **Día 1 (15 ago)** · Línea del tiempo en móvil · **+ el chat de Instagram**
- [ ] Día 2 (16 ago) · Línea del tiempo horizontal en computadora
- [ ] Día 3 (17 ago) · Fotos: polaroids, galería, ampliar al tocar
- [ ] Día 4 (18 ago) · El candado: cifrado y contenido privado
- [ ] Día 5 (19 ago) · Juego "¿quién dijo esto?"
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

0. **Cifrar los chats — un comando, y hasta que no corra las conversaciones no
   se ven en la web.** La frase no está en ningún archivo del proyecto ni la
   tengo yo, así que este paso es tuyo y solo tuyo:

   ```bash
   npm run secretos:cifrar -- --clave "la frase de siempre"
   ```

   Sale `public/cifrado/chats.enc`, que sí se sube. Hay que volver a correrlo
   cada vez que cambie `private/publicable/chats.json`. Si te equivocás al
   escribir la frase, el script se planta y no toca nada.

   Ya no hace falta que te acuerdes: `npm run build` se cae si falta el
   archivo cifrado o si se quedó atrás del contenido, y con eso GitHub
   Actions no publica. Antes compilaba igual y la web salía sin un solo
   chat, en silencio — que es exactamente lo que pasó el 15 de agosto.

1. **La lista de momentos** → `private/plantilla-momentos.md`. Van 5 (hasta el
   2 de septiembre de 2024); faltan del 24 de noviembre en adelante. Es lo que
   bloquea los días 2 y 3. Con la fecha y dos líneas por momento me alcanza.
2. **Las fotos** → a `fotos-originales/` y `npm run fotos:optimizar`.
   Mejor que sobren.
3. **Revisar las frases del juego** → `private/frases-candidatas.json`,
   poner `"aprobada": true` en las buenas. Bloquea el día 5.
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

### Día 3 · Fotos
- [ ] Vos: fotos optimizadas y repartidas por momento
- [ ] Yo: polaroids con cinta adhesiva y giro leve
- [ ] Yo: ampliar al tocar, con gesto de deslizar en el teléfono
- [ ] Yo: carga diferida para que no pese al abrir

### Día 4 · El candado
- [x] Yo: la puerta con la frase-contraseña y su pista
- [x] Yo: que la clave se recuerde durante la visita y no la pida a cada rato
- [x] Vos: decidido — **todas** las conversaciones reales van cifradas
- [x] Yo: los chats movidos a `private/publicable/chats.json` y cifrados
- [x] Yo: seguro en `secretos:cifrar` — si la clave no abre lo ya publicado, no
      cifra nada (un error de tipeo dejaba la puerta cerrada para siempre)
- [ ] **Vos: correr `npm run secretos:cifrar -- --clave "la frase"`** — yo no
      tengo la frase, así que `public/cifrado/chats.enc` todavía no existe

### Día 5 · El juego
- [ ] Vos: aprobar frases
- [ ] Yo: buscar a mano las más raras y graciosas
- [ ] Yo: 3 vidas, puntaje y las cuatro opciones (osito, osita, los dos, ninguno)
- [ ] Yo: finales personalizados según el puntaje, con lo de mandar la captura

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

**Las fotos en un repositorio público son públicas.** Aunque nadie tenga el
enlace, técnicamente están ahí. Si hay fotos que solo deberían verse tras la
contraseña, decímelo y las trato aparte.

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
  gratuita, Pages exige que el repositorio sea público.
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
