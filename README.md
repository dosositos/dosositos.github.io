# 🧸 dos ositos

Una madriguera en internet para osito y osita.

## Arrancar

```bash
npm install
npm run dev
```

Se abre en http://localhost:5173

## Qué archivos tocar

Todo el contenido vive en `src/content/`, y son archivos de texto con
comentarios que explican qué va en cada cosa:

| Archivo | Qué contiene |
|---|---|
| `config.ts` | Las fechas, los cumpleaños, los apodos, la pista de la contraseña |
| `momentos.ts` | La línea del tiempo: cada momento con sus fotos, chats y notas |
| `peluches.ts` | Ovi, Boo y Nico |
| `playlist.ts` | Nuestras canciones y por qué son nuestras |

## Herramientas

```bash
npm run chat:parsear     # lee private/chat.txt y saca los datos del chat
npm run chat:frases      # propone frases para el juego
npm run fotos:optimizar  # deja las fotos livianas para la web
npm run secretos:cifrar  # cifra lo privado antes de publicarlo
```

## Publicar

Con hacer `git push` a `main` se publica sola (GitHub Actions se encarga).
La configuración está en `.github/workflows/deploy.yml`.

En GitHub: **Settings → Pages → Source: GitHub Actions**.

---

Ver `PLAN.md` para el calendario y `CLAUDE.md` para las reglas del proyecto.
