import { Fragment } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Link } from 'react-router-dom'
import { Galeria } from '@/componentes/Galeria'
import { momentos } from '@/content/momentos'
import { instantes } from '@/content/instantes'
import { FLORES } from '@/lib/flores'
import { fechaLarga, MESES_ES } from '@/lib/tiempo'
import type { Instante, Momento } from '@/types'

/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  LA LÍNEA DEL TIEMPO — pensada para el teléfono              ║
 * ║                                                              ║
 * ║  Un tallo vertical con una flor por momento. En el teléfono  ║
 * ║  el tallo va pegado a la izquierda y las tarjetas todas del  ║
 * ║  mismo lado (a 360 px de ancho, alternar solo hace que se    ║
 * ║  lea peor). De 640 px para arriba el tallo se va al centro   ║
 * ║  y las tarjetas empiezan a alternar.                          ║
 * ║                                                              ║
 * ║  La versión horizontal de computadora es el día 2 del plan.  ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

/**
 * Momentos y fotos sueltas viven en archivos distintos porque se
 * escriben distinto, pero en la línea van mezclados por fecha: es una
 * sola historia.
 */
type Entrada = { tipo: 'momento'; dato: Momento } | { tipo: 'instante'; dato: Instante }

const enOrden: Entrada[] = [
  ...momentos.map((dato): Entrada => ({ tipo: 'momento', dato })),
  ...instantes.map((dato): Entrada => ({ tipo: 'instante', dato })),
].sort((a, b) => (a.dato.fecha < b.dato.fecha ? -1 : 1))

const anioDe = (e: Entrada) => e.dato.fecha.slice(0, 4)

/** '2024-08-29' → '29 de agosto' (el año ya lo dice el separador). */
function diaYMes(fecha: string) {
  const [, mes, dia] = fecha.split('-')
  return `${Number(dia)} de ${MESES_ES[Number(mes) - 1]}`
}

function Tarjeta({ momento, aLaIzquierda }: { momento: Momento; aLaIzquierda: boolean }) {
  const sinMovimiento = useReducedMotion()
  const flor = FLORES[momento.flor]

  return (
    <li className="relative list-none">
      <div
        className={`flex items-start gap-4 sm:gap-0 ${
          aLaIzquierda ? 'sm:flex-row' : 'sm:flex-row-reverse'
        }`}
      >
        {/* ── La tarjeta ─────────────────────────────────────── */}
        <div className={`min-w-0 flex-1 ${aLaIzquierda ? 'sm:pr-10 sm:text-right' : 'sm:pl-10'}`}>
          <motion.div
            initial={sinMovimiento ? false : { opacity: 0, y: 28, x: aLaIzquierda ? -12 : 12 }}
            whileInView={{ opacity: 1, y: 0, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              to={`/momento/${momento.id}`}
              className="papel group block rounded-2xl px-5 py-5 transition-all duration-500 hover:-translate-y-1 hover:border-acento"
            >
              {/* El acento de color de su flor */}
              <span
                className={`block h-0.5 w-8 rounded-full ${aLaIzquierda ? 'sm:ms-auto' : ''}`}
                style={{ backgroundColor: flor.color }}
                aria-hidden
              />

              <p className="mt-3 text-[0.66rem] uppercase tracking-[0.22em] text-texto-suave/60">
                {momento.fechaTexto ?? diaYMes(momento.fecha)}
                {momento.lugar && (
                  <>
                    <span className="mx-1.5 opacity-40">·</span>
                    {momento.lugar}
                  </>
                )}
              </p>

              <h2
                className={`mt-2 font-display leading-tight text-texto transition-colors group-hover:text-acento ${
                  momento.destacado ? 'text-2xl sm:text-[1.7rem]' : 'text-xl'
                }`}
              >
                {momento.titulo}
              </h2>

              <p className="mt-2 text-[0.95rem] leading-relaxed text-texto-suave">
                {momento.resumen}
              </p>

              {/* Lo que trae adentro */}
              <p
                className={`mt-3 flex flex-wrap items-center gap-2 text-[0.68rem] text-texto-suave/60 ${
                  aLaIzquierda ? 'sm:justify-end' : ''
                }`}
              >
                {momento.borrador ? (
                  <span className="rounded-full border border-dashed border-borde px-2 py-0.5">
                    por escribir
                  </span>
                ) : (
                  <>
                    {momento.chat && (
                      <span className="rounded-full border border-borde px-2 py-0.5">
                        {momento.chat.mensajes} mensajes
                      </span>
                    )}
                    {momento.fotos && (
                      <span className="rounded-full border border-borde px-2 py-0.5">
                        {momento.fotos.length} fotos
                      </span>
                    )}
                    {momento.privado && (
                      <span className="rounded-full border border-borde px-2 py-0.5">🔒 privado</span>
                    )}
                    <span className="opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      abrir →
                    </span>
                  </>
                )}
              </p>
            </Link>
          </motion.div>
        </div>

        {/* ── La flor sobre el tallo ─────────────────────────── */}
        <div className="order-first flex w-10 shrink-0 justify-center pt-6 sm:order-none sm:w-0 sm:pt-0">
          <motion.span
            initial={sinMovimiento ? false : { scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
            className="grid place-items-center rounded-full sm:absolute sm:left-1/2 sm:top-6 sm:-translate-x-1/2"
            // 40 px es justo el ancho de la columna del tallo: así el centro
            // de la flor cae exactamente sobre la línea, sin desbordarse.
            style={{
              width: momento.destacado ? 40 : 32,
              height: momento.destacado ? 40 : 32,
              backgroundColor: 'var(--t-fondo)',
              border: `2px solid ${flor.color}`,
              boxShadow: momento.destacado ? `0 0 22px -4px ${flor.color}` : undefined,
              fontSize: momento.destacado ? '1.05rem' : '0.85rem',
            }}
            aria-hidden
          >
            {momento.icono ?? flor.emoji}
          </motion.span>
        </div>

        {/* La mitad vacía: es lo que empuja la tarjeta a su lado */}
        <div className="hidden flex-1 sm:block" />
      </div>
    </li>
  )
}

/**
 * Una foto sin momento exacto. Deliberadamente más callada que una
 * tarjeta: sin papel, sin borde, sin "abrir →". Solo la fecha, una
 * línea a mano y un punto chiquito sobre el tallo.
 */
function Suelta({ instante, aLaIzquierda }: { instante: Instante; aLaIzquierda: boolean }) {
  const sinMovimiento = useReducedMotion()
  const color = instante.flor ? FLORES[instante.flor].color : 'var(--t-borde)'

  return (
    <li className="relative list-none">
      <div
        className={`flex items-start gap-4 sm:gap-0 ${
          aLaIzquierda ? 'sm:flex-row' : 'sm:flex-row-reverse'
        }`}
      >
        <div className={`min-w-0 flex-1 ${aLaIzquierda ? 'sm:pr-10 sm:text-right' : 'sm:pl-10'}`}>
          <motion.div
            initial={sinMovimiento ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="py-1"
          >
            <p className="text-[0.62rem] uppercase tracking-[0.22em] text-texto-suave/45">
              {instante.fechaTexto ?? diaYMes(instante.fecha)}
              {instante.lugar && (
                <>
                  <span className="mx-1.5 opacity-40">·</span>
                  {instante.lugar}
                </>
              )}
            </p>

            <p className="fuente-mano mt-1 text-lg leading-snug text-texto-suave">
              {instante.texto}
            </p>

            {instante.fotos && instante.fotos.length > 0 && (
              <div
                className={`mt-3 max-w-[15rem] ${aLaIzquierda ? 'sm:ms-auto' : ''}`}
              >
                <Galeria fotos={instante.fotos} />
              </div>
            )}
          </motion.div>
        </div>

        {/* El punto: la versión callada de la flor */}
        <div className="order-first flex w-10 shrink-0 justify-center pt-4 sm:order-none sm:w-0 sm:pt-0">
          <motion.span
            initial={sinMovimiento ? false : { scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="block rounded-full sm:absolute sm:left-1/2 sm:top-4 sm:-translate-x-1/2"
            style={{
              width: 11,
              height: 11,
              backgroundColor: 'var(--t-fondo)',
              border: `1.5px solid ${color}`,
            }}
            aria-hidden
          />
        </div>

        <div className="hidden flex-1 sm:block" />
      </div>
    </li>
  )
}

function SeparadorDeAnio({ anio }: { anio: string }) {
  return (
    // Pegado al tallo: a la izquierda en el teléfono, centrado en pantalla ancha.
    <li className="relative flex list-none justify-start py-2 sm:justify-center">
      <motion.p
        initial={{ opacity: 0, scale: 0.92 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="rounded-full border border-borde bg-fondo px-4 py-1 font-display text-sm tracking-[0.18em] text-texto-suave"
      >
        {anio}
      </motion.p>
    </li>
  )
}

export function LineaDelTiempo() {
  const primero = enOrden[0].dato
  const ultimo = enOrden[enOrden.length - 1].dato
  const escritos = momentos.filter((m) => !m.borrador).length

  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-24 pt-20">
      <header className="mb-14 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-4xl leading-tight texto-degradado sm:text-5xl"
        >
          nuestra historia
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.35 }}
          className="fuente-mano mx-auto mt-4 max-w-md text-xl text-texto-suave"
        >
          desde {fechaLarga(new Date(`${primero.fecha}T12:00:00-06:00`))}
        </motion.p>

        <p className="mt-3 text-[0.7rem] uppercase tracking-[0.2em] text-texto-suave/50">
          {escritos} momentos guardados · tocá cualquiera para abrirlo
        </p>
      </header>

      <div className="relative">
        {/* El tallo: pegado a la izquierda en el teléfono, al centro en pantalla ancha */}
        <div
          className="pointer-events-none absolute bottom-0 left-5 top-0 w-px sm:left-1/2"
          style={{
            background:
              'linear-gradient(to bottom, transparent, var(--t-borde) 5%, var(--t-borde) 95%, transparent)',
          }}
          aria-hidden
        />

        <ol className="relative space-y-10">
          {enOrden.map((entrada, i) => {
            const anio = anioDe(entrada)
            const anioAnterior = i > 0 ? anioDe(enOrden[i - 1]) : null
            const aLaIzquierda = i % 2 === 1

            return (
              <Fragment key={entrada.dato.id}>
                {anio !== anioAnterior && <SeparadorDeAnio anio={anio} />}
                {entrada.tipo === 'momento' ? (
                  <Tarjeta momento={entrada.dato} aLaIzquierda={aLaIzquierda} />
                ) : (
                  <Suelta instante={entrada.dato} aLaIzquierda={aLaIzquierda} />
                )}
              </Fragment>
            )
          })}
        </ol>
      </div>

      {/* El final abierto: la historia sigue */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="fuente-mano mt-16 text-center text-2xl text-texto-suave"
      >
        …y todo lo que falta 🌻
      </motion.p>

      <p className="mt-3 text-center text-[0.7rem] uppercase tracking-[0.2em] text-texto-suave/40">
        el último: {diaYMes(ultimo.fecha)} de {ultimo.fecha.slice(0, 4)}
      </p>
    </div>
  )
}
