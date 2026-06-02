import { createContext, useContext, useState, useCallback, useMemo, useRef, useEffect } from 'react'

const ToastCtx = createContext(null)

const DURACION = 4500

const CONFIG = {
  exito:       { icono: '✓', label: 'Éxito',        color: '#34C759', bg: 'rgba(52,199,89,0.14)',   borde: 'rgba(52,199,89,0.28)'   },
  error:       { icono: '✕', label: 'Error',         color: '#FF453A', bg: 'rgba(255,69,58,0.14)',   borde: 'rgba(255,69,58,0.28)'   },
  advertencia: { icono: '△', label: 'Advertencia',   color: '#FF9F0A', bg: 'rgba(255,159,10,0.14)',  borde: 'rgba(255,159,10,0.28)'  },
  info:        { icono: 'i', label: 'Información',   color: '#0A84FF', bg: 'rgba(10,132,255,0.14)',  borde: 'rgba(10,132,255,0.28)'  },
}

function ToastItem({ t, onQuitar }) {
  const c = CONFIG[t.tipo] || CONFIG.info
  const [saliendo, setSaliendo]   = useState(false)
  const [hover, setHover]         = useState(false)
  const [progreso, setProgreso]   = useState(100)

  const restanteRef  = useRef(DURACION)
  const inicioRef    = useRef(Date.now())
  const timeoutRef   = useRef(null)
  const intervaloRef = useRef(null)

  const cerrar = useCallback(() => {
    clearTimeout(timeoutRef.current)
    clearInterval(intervaloRef.current)
    setSaliendo(true)
    setTimeout(() => onQuitar(t.id), 260)
  }, [onQuitar, t.id])

  const iniciarTimer = useCallback(() => {
    inicioRef.current = Date.now()
    timeoutRef.current = setTimeout(cerrar, restanteRef.current)
    intervaloRef.current = setInterval(() => {
      const elapsed = Date.now() - inicioRef.current
      const left    = Math.max(0, restanteRef.current - elapsed)
      setProgreso((left / DURACION) * 100)
    }, 40)
  }, [cerrar])

  const pausarTimer = useCallback(() => {
    const elapsed = Date.now() - inicioRef.current
    restanteRef.current = Math.max(0, restanteRef.current - elapsed)
    clearTimeout(timeoutRef.current)
    clearInterval(intervaloRef.current)
  }, [])

  useEffect(() => {
    iniciarTimer()
    return () => { clearTimeout(timeoutRef.current); clearInterval(intervaloRef.current) }
  }, [])

  return (
    <div
      onMouseEnter={() => { setHover(true);  pausarTimer()  }}
      onMouseLeave={() => { setHover(false); iniciarTimer() }}
      style={{
        position: 'relative',
        width: '340px',
        padding: '16px',
        borderRadius: '18px',
        background: 'linear-gradient(145deg, rgba(32,32,38,0.94) 0%, rgba(20,20,26,0.97) 100%)',
        backdropFilter:         'blur(22px)',
        WebkitBackdropFilter:   'blur(22px)',
        border:     '1px solid rgba(255,255,255,0.07)',
        boxShadow: hover
          ? `0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px ${c.borde}, 0 1px 0 rgba(255,255,255,0.08) inset`
          : `0 12px 40px rgba(0,0,0,0.42), 0 0 0 1px rgba(255,255,255,0.04), 0 1px 0 rgba(255,255,255,0.06) inset`,
        animation:  saliendo ? 'toastSalir 0.26s ease-in forwards' : 'toastEntrar 0.3s ease-out forwards',
        overflow:   'hidden',
        transition: 'box-shadow 0.2s ease',
      }}
    >
      {/* ── Fila principal ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>

        {/* Ícono */}
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
          background: c.bg, border: `1px solid ${c.borde}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '15px', fontWeight: '800', color: c.color,
          fontStyle: t.tipo === 'info' ? 'italic' : 'normal',
        }}>
          {c.icono}
        </div>

        {/* Texto */}
        <div style={{ flex: 1, minWidth: 0, paddingTop: '1px' }}>
          <p style={{
            margin: 0, fontSize: '12px', fontWeight: '600',
            color: c.color, letterSpacing: '0.04em', textTransform: 'uppercase',
          }}>
            SIGJEP
          </p>
          <p style={{
            margin: '4px 0 0', fontSize: '14px', fontWeight: '500',
            color: 'rgba(255,255,255,0.88)', lineHeight: '1.45',
            wordBreak: 'break-word',
          }}>
            {t.mensaje}
          </p>
        </div>

        {/* Botón cerrar — solo en hover */}
        <button
          onClick={cerrar}
          style={{
            opacity: hover ? 1 : 0,
            transition: 'opacity 0.15s',
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '6px',
            color: 'rgba(255,255,255,0.45)',
            cursor: 'pointer',
            fontSize: '11px',
            width: '22px', height: '22px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, padding: 0, marginTop: '1px',
          }}
          title="Cerrar"
          aria-label="Cerrar notificación"
        >
          ✕
        </button>
      </div>

      {/* ── Barra de progreso ── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0,
        height: '2px', width: `${progreso}%`,
        background: `linear-gradient(90deg, ${c.color}55, ${c.color}cc)`,
        transition: 'width 0.04s linear',
        borderRadius: '0 0 0 18px',
      }} />
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const quitar = useCallback((id) => setToasts(prev => prev.filter(t => t.id !== id)), [])

  const agregar = useCallback((mensaje, tipo = 'info') => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, mensaje, tipo }])
  }, [])

  const api = useMemo(() => ({
    exito:       (m) => agregar(m, 'exito'),
    error:       (m) => agregar(m, 'error'),
    info:        (m) => agregar(m, 'info'),
    advertencia: (m) => agregar(m, 'advertencia'),
  }), [agregar])

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div style={{
        position: 'fixed', top: '62px', right: '20px',
        zIndex: 9999, display: 'flex', flexDirection: 'column',
        gap: '10px', alignItems: 'flex-end',
      }}>
        {toasts.map(t => <ToastItem key={t.id} t={t} onQuitar={quitar} />)}
      </div>
    </ToastCtx.Provider>
  )
}

export const useToast = () => useContext(ToastCtx)
