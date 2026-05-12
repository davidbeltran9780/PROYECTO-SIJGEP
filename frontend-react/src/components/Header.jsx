import { useState } from 'react'

export default function Header() {
  const [notifAbierto, setNotifAbierto] = useState(false)
  const usuario = localStorage.getItem('usuario') || 'Usuario'
  const rol = localStorage.getItem('rol') || 'Sin rol'

  return (
    <header className="header">
      <div className="header-izquierda">
        <img src="/Logo.png" alt="SIGJEP" className="logo" />
      </div>
      <div className="header-derecha">
        <span className="usuario">{usuario} — {rol}</span>

        <div className="notif-wrapper">
          <button className="notif-boton" onClick={() => setNotifAbierto(!notifAbierto)}>
            🔔
            <span className="notif-badge">3</span>
          </button>

          <div className={`notif-panel ${notifAbierto ? 'activo' : ''}`}>
            <div className="notif-header">
              <strong>Notificaciones</strong>
              <button className="notif-marcar-leidas" onClick={() => setNotifAbierto(false)}>
                Marcar todas como leídas
              </button>
            </div>
            <ul className="notif-lista">
              <li className="notif-item no-leida">
                <span className="notif-icono">⚠️</span>
                <div className="notif-texto">
                  <strong>Caso vencido</strong>
                  <p>EXP-002 venció hace 2 días</p>
                  <small>hace 1 hora</small>
                </div>
              </li>
              <li className="notif-item no-leida">
                <span className="notif-icono">⏰</span>
                <div className="notif-texto">
                  <strong>Caso próximo a vencer</strong>
                  <p>EXP-005 vence en 3 días</p>
                  <small>hace 4 horas</small>
                </div>
              </li>
            </ul>
            <a href="/alertas" className="notif-ver-todas">Ver todas las alertas →</a>
          </div>
        </div>
      </div>
    </header>
  )
}