import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

const DURACION_MS = 60 * 60 * 1000      // 60 minutos (igual que el backend)
const AVISO_MS   = 5 * 60 * 1000        // avisar 5 minutos antes

export default function SesionExpirando() {
  const [visible, setVisible] = useState(false)
  const [cuenta, setCuenta] = useState(300) // segundos restantes
  const navigate = useNavigate()
  const timerAviso   = useRef(null)
  const timerExpira  = useRef(null)
  const timerCuenta  = useRef(null)

  const iniciarContadores = () => {
    clearTimeout(timerAviso.current)
    clearTimeout(timerExpira.current)
    clearInterval(timerCuenta.current)

    // Mostrar aviso 5 min antes de expirar
    timerAviso.current = setTimeout(() => {
      setVisible(true)
      setCuenta(300)
      timerCuenta.current = setInterval(() => {
        setCuenta(c => {
          if (c <= 1) { clearInterval(timerCuenta.current); return 0 }
          return c - 1
        })
      }, 1000)
    }, DURACION_MS - AVISO_MS)

    // Cerrar sesión al expirar
    timerExpira.current = setTimeout(() => {
      cerrarSesion()
    }, DURACION_MS)
  }

  useEffect(() => {
    if (!localStorage.getItem('token')) return
    iniciarContadores()
    return () => {
      clearTimeout(timerAviso.current)
      clearTimeout(timerExpira.current)
      clearInterval(timerCuenta.current)
    }
  }, [])

  const extender = async () => {
    try {
      const res = await api.post('/renovar-token')
      localStorage.setItem('token', res.data.access_token)
      setVisible(false)
      iniciarContadores()
    } catch {
      cerrarSesion()
    }
  }

  const cerrarSesion = () => {
    localStorage.clear()
    navigate('/')
  }

  const minutos = Math.floor(cuenta / 60)
  const segundos = String(cuenta % 60).padStart(2, '0')

  if (!visible) return null

  return (
    <div className="sesion-overlay">
      <div className="sesion-modal">
        <div className="sesion-icono">⏰</div>
        <h3>Tu sesión está por expirar</h3>
        <p>La sesión se cerrará en</p>
        <div className="sesion-cuenta">{minutos}:{segundos}</div>
        <p style={{ fontSize: '12px', color: '#6b7280' }}>
          ¿Deseas continuar trabajando?
        </p>
        <div className="sesion-botones">
          <button className="sesion-btn-extender" onClick={extender}>
            Extender sesión
          </button>
          <button className="sesion-btn-cerrar" onClick={cerrarSesion}>
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  )
}
