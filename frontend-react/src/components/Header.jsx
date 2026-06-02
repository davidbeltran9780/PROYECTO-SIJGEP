import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import api from '../api/axios'

const RUTAS = {
  '/dashboard':    'Dashboard',
  '/expedientes':  'Expedientes',
  '/documentos':   'Documentos',
  '/pqrs':         'PQRS',
  '/alertas':      'Alertas',
  '/reportes':     'Reportes',
  '/ia':           'Módulo IA',
  '/admin':        'Administración',
  '/ayuda':        'Ayuda',
}

export default function Header() {
  const location = useLocation()
  const moduloActual = RUTAS[location.pathname] || ''
  const [notifAbierto, setNotifAbierto] = useState(false)
  const [avatarAbierto, setAvatarAbierto] = useState(false)
  const [notificaciones, setNotificaciones] = useState([])
  const [total, setTotal] = useState(0)
  const [leidas, setLeidas] = useState(false)
  const panelRef = useRef(null)
  const avatarRef = useRef(null)

  const usuario = localStorage.getItem('usuario') || 'Usuario'
  const rol = localStorage.getItem('rol') || 'Sin rol'
  const esInterno = ['admin', 'administrador', 'secretaria', 'abogado'].includes(rol)

  useEffect(() => {
    if (!esInterno) return
    api.get('/reportes/notificaciones')
      .then(res => {
        setNotificaciones(res.data.items || [])
        setTotal(res.data.total || 0)
      })
      .catch(() => {})
  }, [])

  // Cerrar paneles al hacer clic afuera
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setNotifAbierto(false)
      if (avatarRef.current && !avatarRef.current.contains(e.target)) setAvatarAbierto(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const marcarLeidas = () => {
    setLeidas(true)
    setTotal(0)
    setNotifAbierto(false)
  }

  const iniciales = usuario
    .split(' ')
    .slice(0, 2)
    .map(p => p[0]?.toUpperCase())
    .join('')

  const toggleMenu = () => document.body.classList.toggle('menu-abierto')

  return (
    <header className="header">
      {/* Bloque izquierdo con logo (escritorio) */}
      <div className="header-izquierda">
        <img src="/Logo.png" alt="SIGJEP" className="logo" />
      </div>

      <div className="header-derecha">
        {/* Hamburguesa — solo en móvil (CSS lo oculta en escritorio) */}
        <button className="btn-hamburguesa" onClick={toggleMenu} aria-label="Abrir menú" title="Abrir menú">
          ☰
        </button>

        {/* Módulo actual — izquierda del header derecho */}
        {moduloActual && (
          <span style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: '12px',
            fontWeight: '500',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            marginRight: 'auto',
            pointerEvents: 'none',
          }}>
            SIGJEP <span style={{ opacity: 0.4 }}>/</span> <span style={{ color: 'white', fontWeight: '700' }}>{moduloActual}</span>
          </span>
        )}

        {/* Nombre y rol — visible en escritorio, oculto en móvil via CSS */}
        <span className="usuario">{usuario} — {rol}</span>

        {/* Avatar — en escritorio muestra texto, en móvil muestra popup al presionar */}
        <div ref={avatarRef} style={{ position: 'relative', flexShrink: 0 }}>
          <button
            className="avatar-btn"
            onClick={() => setAvatarAbierto(!avatarAbierto)}
            title={`${usuario} — ${rol}`}
            aria-label="Menú de usuario"
          >
            {iniciales || '?'}
          </button>

          {/* Popup con nombre y rol — útil en móvil donde el texto está oculto */}
          {avatarAbierto && (
            <div className="avatar-popup">
              <strong>{usuario}</strong>
              <span>{rol}</span>
            </div>
          )}
        </div>

        {/* Campana — solo roles internos */}
        {esInterno && (
          <div className="notif-wrapper" ref={panelRef}>
            <button className="notif-boton" onClick={() => setNotifAbierto(!notifAbierto)} aria-label="Ver notificaciones" title="Ver notificaciones">
              🔔
              {total > 0 && !leidas && (
                <span className="notif-badge">{total}</span>
              )}
            </button>

            {notifAbierto && (
              <div className="notif-panel activo">
                <div className="notif-header">
                  <strong>Notificaciones</strong>
                  {total > 0 && !leidas && (
                    <button className="notif-marcar-leidas" onClick={marcarLeidas}>
                      Marcar como leídas
                    </button>
                  )}
                </div>
                <ul className="notif-lista">
                  {notificaciones.length === 0 ? (
                    <li className="notif-item" style={{ color: '#6b7280', fontSize: '13px', padding: '12px' }}>
                      Sin notificaciones pendientes ✅
                    </li>
                  ) : notificaciones.map((n, i) => (
                    <li key={i} className={`notif-item ${leidas ? '' : 'no-leida'}`}>
                      <span className="notif-icono">{n.icono}</span>
                      <div className="notif-texto">
                        <strong>{n.titulo}</strong>
                        <p>{n.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <a href="/alertas" className="notif-ver-todas">Ver todas las alertas →</a>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
