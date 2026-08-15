import { createContext, use, useEffect, useState, type ReactNode } from 'react'

export type Tema = 'osito' | 'osita'

interface ContextoTema {
  tema: Tema
  cambiarTema: (t: Tema) => void
  alternar: () => void
}

const Contexto = createContext<ContextoTema | null>(null)

const LLAVE = 'dosositos:tema'

export function ProveedorTema({ children }: { children: ReactNode }) {
  const [tema, setTema] = useState<Tema>(() => {
    const guardado = localStorage.getItem(LLAVE)
    return guardado === 'osita' || guardado === 'osito' ? guardado : 'osito'
  })

  useEffect(() => {
    document.documentElement.dataset.tema = tema
    localStorage.setItem(LLAVE, tema)
    // La barra del navegador en el móvil también se pinta del color
    const meta = document.querySelector('meta[name="theme-color"]')
    meta?.setAttribute('content', tema === 'osito' ? '#070b1b' : '#100a1e')
  }, [tema])

  return (
    <Contexto.Provider
      value={{
        tema,
        cambiarTema: setTema,
        alternar: () => setTema((t) => (t === 'osito' ? 'osita' : 'osito')),
      }}
    >
      {children}
    </Contexto.Provider>
  )
}

export function useTema() {
  const ctx = use(Contexto)
  if (!ctx) throw new Error('useTema debe usarse dentro de <ProveedorTema>')
  return ctx
}

/** El botoncito que cambia de modo osito a modo osita. */
export function InterruptorTema({ className = '' }: { className?: string }) {
  const { tema, alternar } = useTema()

  return (
    <button
      onClick={alternar}
      aria-label={`Cambiar a modo ${tema === 'osito' ? 'osita' : 'osito'}`}
      title={`Modo ${tema}`}
      className={`group relative grid h-11 w-11 place-items-center rounded-full border border-borde bg-superficie/80 backdrop-blur transition-all duration-500 hover:border-acento hover:resplandor-caja ${className}`}
    >
      <span className="text-xl transition-transform duration-500 group-hover:scale-110">
        {tema === 'osito' ? '🐻' : '🎀'}
      </span>
    </button>
  )
}
