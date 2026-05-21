import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

export default function Recuperar() {
  const [correo, setCorreo] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [tipo, setTipo] = useState('')
  const [cargando, setCargando] = useState(false)

  const handleRecuperar = async (e) => {
    e.preventDefault()
    setCargando(true)
    setMensaje('')
    try {
      await api.post('/recuperar-password', { email: correo })
      setMensaje('¡Enlace enviado! Revisa tu correo.')
      setTipo('ok')
    } catch {
      setMensaje('No se encontró ninguna cuenta con ese correo.')
      setTipo('error')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div style={{
      background: 'linear-gradient(90deg, #E5B93D, #1E3A8A)',
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <div className="login-card">
        <img src="/Logo.png" alt="SIGJEP" className="login-logo" />
        <h2>Recuperar contraseña</h2>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', marginBottom: '12px', textAlign: 'center' }}>
          Te enviaremos un enlace para restablecer tu contraseña.
        </p>

        <form onSubmit={handleRecuperar}>
          <input
            type="email"
            placeholder="Ingresa tu correo"
            required
            value={correo}
            onChange={e => setCorreo(e.target.value)}
            disabled={cargando}
          />

          <button
            type="submit"
            className="btn-login"
            disabled={cargando}
            style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {cargando ? (
              <>
                <span style={{
                  width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)',
                  borderTopColor: 'white', borderRadius: '50%',
                  display: 'inline-block', animation: 'girar 0.7s linear infinite'
                }} />
                Enviando...
              </>
            ) : (
              '📧 Enviar enlace'
            )}
          </button>

          {mensaje && (
            <p style={{
              marginTop: '12px',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              textAlign: 'center',
              background: tipo === 'ok' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
              color: tipo === 'ok' ? '#86efac' : '#fca5a5',
              border: `1px solid ${tipo === 'ok' ? '#86efac' : '#fca5a5'}`,
            }}>
              {tipo === 'ok' ? '✅ ' : '❌ '}{mensaje}
            </p>
          )}
        </form>

        <p style={{ marginTop: '16px', fontSize: '13px', textAlign: 'center' }}>
          <Link to="/" style={{ color: 'rgba(255,255,255,0.8)' }}>← Volver al inicio de sesión</Link>
        </p>
      </div>

      {/* Animación del spinner */}
      <style>{`
        @keyframes girar {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
