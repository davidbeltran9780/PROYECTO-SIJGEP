import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'

export default function Login() {
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [mostrarPass, setMostrarPass] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await api.post('/login', { email: correo, password })
      localStorage.setItem('token', res.data.access_token || '')
      localStorage.setItem('rol', res.data.rol || '')
      localStorage.setItem('usuario', res.data.nombre || correo)
      localStorage.setItem('email', res.data.email || correo)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al iniciar sesión')
    }
  }

  return (
    <div style={{
      background: 'linear-gradient(90deg, #E5B93D, #1E3A8A)',
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <div className="login-card">
        <img src="/Logo.png" alt="SIGJEP" className="login-logo" />
        <h2>Acceso</h2>
        <form onSubmit={handleLogin}>
          <input type="email" placeholder="Correo electrónico" required
            value={correo} onChange={e => setCorreo(e.target.value)} />
          <div className="input-group">
            <input
              type={mostrarPass ? 'text' : 'password'}
              id="password"
              placeholder="Contraseña"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <span className="toggle-password" onClick={() => setMostrarPass(!mostrarPass)}>
              {mostrarPass ? '🙈' : '👁️'}
            </span>
          </div>
          <Link to="/recuperar" className="forgot-password">¿Olvidaste tu contraseña?</Link>
          {error && <p className="error" style={{ display: 'block' }}>{error}</p>}
          <button type="submit" className="btn-login">Iniciar sesión</button>
        </form>
        <p className="registro">
          ¿No tienes cuenta?{' '}
          <Link to="/registro" style={{ color: 'white', fontWeight: 'bold' }}>Regístrate</Link>
        </p>
        <p style={{ marginTop: '12px', fontSize: '13px', textAlign: 'center' }}>
          <Link to="/consulta" style={{ color: 'rgba(255,255,255,0.8)' }}>
            🔍 Consultar estado de proceso sin cuenta
          </Link>
        </p>
      </div>
    </div>
  )
}