import { useState } from 'react'
import api from '../api/axios'

export default function Recuperar() {
  const [correo, setCorreo] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [tipo, setTipo] = useState('')

  const handleRecuperar = async (e) => {
    e.preventDefault()
    try {
      await api.post('/auth/recuperar', { email: correo })
      setMensaje('Enlace enviado a tu correo')
      setTipo('ok')
    } catch {
      setMensaje('No se encontró el correo')
      setTipo('error')
    }
  }

  return (
    <div className="login-body" style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="login-card">
        <img src="/Logo.png" alt="SIGJEP" className="login-logo" />
        <h2>Recuperar contraseña</h2>
        <form onSubmit={handleRecuperar}>
          <input type="email" placeholder="Ingresa tu correo" required
            value={correo} onChange={e => setCorreo(e.target.value)} />
          <button type="submit">Enviar enlace</button>
          {mensaje && <p className={`mensaje ${tipo}`}>{mensaje}</p>}
        </form>
      </div>
    </div>
  )
}