# Plan — 10 días hasta el 24 de agosto

> **Fecha de entrega: lunes 24 de agosto de 2026** — dos años de habernos conocido.
> Ritmo: ~2 h por día. Lo que hace cada uno está separado, porque la mitad del
> trabajo es material que solo vos podés reunir.

---

## Estado

- [x] **Día 0 — hoy (14 ago)** · Entorno montado, sistema de diseño, contadores vivos, portada
- [ ] Día 1 (15 ago) · Recolección de material + línea del tiempo (móvil)
- [ ] Día 2 (16 ago) · Línea del tiempo horizontal en computadora
- [ ] Día 3 (17 ago) · Cápsula del tiempo: fotos polaroid y notas
- [ ] Día 4 (18 ago) · Burbujas de chat reconstruidas + candado de privacidad
- [ ] Día 5 (19 ago) · Juego "¿quién dijo esto?"
- [ ] Día 6 (20 ago) · Diccionario oso + frasco de mensajitos + "un día como hoy"
- [ ] Día 7 (21 ago) · El sobre de apertura, easter eggs, peluches escondidos
- [ ] Día 8 (22 ago) · PWA, música, celebraciones del calendario, pulido
- [ ] Día 9 (23 ago) · Pruebas en móvil de verdad, publicación, ensayo general
- [ ] **Día 10 (24 ago) · Entregar** 🌻

---

## Lo que tenés que reunir vos (empezá hoy, es lo que puede atrasarnos)

Esto no lo puedo hacer yo y todo lo demás depende de ello:

1. **El chat.** Exportá el WhatsApp *sin archivos* y ponelo en `private/chat.txt`.
   Después corré `npm run chat:parsear`. Es lo primero, porque desbloquea el
   juego, las estadísticas y "un día como hoy".
2. **Los momentos.** Una lista suelta, sin formato, de los ~30 sucesos con su
   fecha aproximada. Un renglón cada uno. Yo los convierto en relatos y vos los
   corregís.
3. **Las fotos.** Metelas en `fotos-originales/` (podés organizarlas por
   carpetas) y corré `npm run fotos:optimizar`. No las selecciones con calma
   todavía: mejor sobrar que faltar.
4. **La frase-contraseña.** Una frase que ella sepa y nadie más. Se escribe una
   sola vez al entrar.
5. **Las palabras del diccionario oso** y **los mensajitos del frasco** (unos
   20-30 mensajes cortos tuyos).

---

## Detalle por día

### Día 1 · Línea del tiempo (móvil)
- [ ] Vos: lista cruda de momentos con fechas
- [ ] Vos: `npm run chat:parsear` y me pasás lo que imprime
- [ ] Yo: línea vertical con tarjetas alternando lados, animación al hacer scroll
- [ ] Yo: cada momento con su flor y su marcador

### Día 2 · Línea del tiempo (computadora)
- [ ] Yo: versión horizontal que avanza con el scroll
- [ ] Yo: el cambio entre las dos versiones según el ancho de pantalla

### Día 3 · Cápsula del tiempo
- [ ] Yo: pantalla completa al abrir un momento, con su propia URL compartible
- [ ] Yo: fotos en polaroid con cinta adhesiva, ampliables al tocarlas
- [ ] Yo: notas manuscritas
- [ ] Vos: primeros 5 momentos con texto real

### Día 4 · Chats y candado
- [ ] Yo: burbujas de chat idénticas a WhatsApp pero con nuestra estética
- [ ] Yo: aparición escalonada de los mensajes, como si se escribieran
- [ ] Yo: la puerta con la frase-contraseña
- [ ] Vos: elegir qué conversaciones van en qué momento

### Día 5 · El juego
- [ ] Vos: revisar `private/frases-candidatas.json` y aprobar las buenas
- [ ] Yo: buscar a mano las frases más raras y graciosas del chat
- [ ] Yo: el juego con 3 vidas, puntaje y los finales personalizados
- [ ] Yo: pantalla final con invitación a mandarle la captura

### Día 6 · Secciones cortas
- [ ] Yo: diccionario oso-español
- [ ] Yo: frasco de mensajitos con estrellitas de papel
- [ ] Yo: "un día como hoy" en la portada

### Día 7 · Magia
- [ ] Yo: el sobre que se abre la primera vez, con la dedicatoria
- [ ] Yo: easter eggs (escribir "osito", código Konami, clics secretos)
- [ ] Yo: Ovi, Boo y Nico escondidos por las esquinas
- [ ] Vos: escribir la dedicatoria del sobre

### Día 8 · Redondear
- [ ] Yo: instalable en el teléfono (PWA) con ícono propio
- [ ] Yo: música de fondo con control de volumen y la playlist
- [ ] Yo: celebraciones automáticas (aniversarios, mesiversarios, cumpleaños)
- [ ] Yo: repaso de todas las animaciones

### Día 9 · Antes de entregar
- [ ] Probar en el teléfono real, no solo en el navegador
- [ ] Revisar que ningún dato privado quede en claro en el repositorio
- [ ] Publicar y verificar el enlace desde datos móviles
- [ ] Leer todos los textos en voz alta buscando erratas

---

## Si vamos con el tiempo justo

Se entrega igual recortando en este orden (de lo primero que se cae a lo último):

1. Línea del tiempo horizontal en computadora → se queda la vertical en ambas
2. Frasco de mensajitos
3. Diccionario oso
4. Música de fondo

**Nunca se caen:** los contadores, la línea del tiempo, las cápsulas con fotos
y el sobre de apertura. Eso es el regalo.

---

## Para la versión 2 (después del 24)

Ideas que quedaron fuera por tiempo, no por malas:

- El *Wrapped* de la relación (los datos ya los calcula `npm run chat:parsear`)
- Mapa de nuestros lugares
- Cartas que se desbloquean en fechas futuras
- Memorama con fotos
- Libro de metas juntos
