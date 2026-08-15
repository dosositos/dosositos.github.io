# Plan — 10 días hasta el 24 de agosto

> **Fecha de entrega: lunes 24 de agosto de 2026** — dos años de habernos conocido.
> Ritmo: ~2 h por día. Lo que hace cada uno está separado, porque la mitad del
> trabajo es material que solo vos podés reunir.

---

## Estado general

- [x] **Día 0 (14 ago)** · Entorno, estética, contadores, portada — **y bastante más**
- [ ] Día 1 (15 ago) · Línea del tiempo en móvil
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
   bloquea los días 1, 2 y 3. Con la fecha y dos líneas por momento me alcanza.
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
- [ ] Vos: la lista de momentos
- [ ] Yo: línea vertical con tarjetas alternando lados
- [ ] Yo: cada momento con su flor, su marcador y su animación de entrada
- [ ] Yo: enlace de cada tarjeta a su cápsula

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
- [ ] Vos: decidir qué queda detrás de la contraseña
- [ ] Yo: la puerta con la frase-contraseña y su pista
- [ ] Yo: mover el contenido sensible a `private/publicable/` y cifrarlo
- [ ] Yo: que la clave se recuerde durante la visita y no la pida a cada rato

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

**El repositorio ya es público.** Todo lo que entre en `src/content/` se puede
leer desde hoy: los relatos, los momentos, las notas. No es un problema mientras
sea contenido tierno, pero **lo que no quieras que lea un desconocido tiene que
ir cifrado**, no en `src/content/`. Esa decisión es del día 4 y es tuya.

**Las fotos en un repositorio público son públicas.** Aunque nadie tenga el
enlace, técnicamente están ahí. Si hay fotos que solo deberían verse tras la
contraseña, decímelo y las trato aparte.

**La pista de la contraseña dice de quiénes son los nombres.** Protege de un
extraño; no de alguien del círculo de ustedes que se ponga a adivinar. Si querés
blindarla, cambiá la pista por algo que solo ella pueda descifrar.

**Los números del chat se congelaron hoy.** `src/content/estadisticas.ts` tiene
las cifras del 14 de agosto. Conviene volver a correr `npm run chat:parsear` el
día 22 o 23 y actualizarlas, para que la racha esté al día el 24.

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
