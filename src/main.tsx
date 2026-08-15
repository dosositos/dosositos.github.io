import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// Usamos HashRouter (URLs con #/) porque GitHub Pages no sabe reescribir
// rutas: con BrowserRouter, recargar en /momento/primera-cita daría 404.
// Así cada momento tiene su enlace propio y compartible: .../#/momento/xxx
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
