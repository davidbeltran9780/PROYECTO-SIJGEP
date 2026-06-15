import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'

export default function Login() {
  const [correo, setCorreo] = useState('')

  useEffect(() => {
    document.body.classList.add('login-body')
    return () => document.body.classList.remove('login-body')
  }, [])
  const [password, setPassword] = useState('')
  const [mostrarPass, setMostrarPass] = useState(false)
  const [error, setError] = useState('')
  const [errores, setErrores] = useState({})
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    const e2 = {}
    if (!correo.trim()) e2.correo = 'El correo es obligatorio'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) e2.correo = 'Formato de correo inválido'
    if (!password) e2.password = 'La contraseña es obligatoria'
    if (Object.keys(e2).length > 0) { setErrores(e2); return }
    setErrores({})
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
      position: 'fixed', inset: 0,
      overflowY: 'auto',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      boxSizing: 'border-box',
    }}>
      <div className="login-card">
        <img src="/Logo.png" alt="SIGJEP" className="login-logo" />
        <h2>Acceso</h2>
        <form onSubmit={handleLogin} noValidate>
          <div style={{ marginBottom: '10px' }}>
            <label htmlFor="login-correo" style={{ display: 'block', color: 'rgba(255,255,255,0.85)', fontSize: '12px', marginBottom: '4px' }}>
              Correo electrónico
            </label>
            <input
              id="login-correo"
              type="email"
              placeholder="tucorreo@ejemplo.com"
              value={correo}
              onChange={e => { setCorreo(e.target.value); setErrores(p => ({ ...p, correo: '' })) }}
              className={errores.correo ? 'campo-invalido' : ''}
              style={{ width: '100%' }}
            />
            {errores.correo && <p className="msg-error">⚠ {errores.correo}</p>}
          </div>
          <div style={{ marginBottom: '6px' }}>
            <label htmlFor="login-password" style={{ display: 'block', color: 'rgba(255,255,255,0.85)', fontSize: '12px', marginBottom: '4px' }}>
              Contraseña
            </label>
            <div className="input-group">
              <input
                id="login-password"
                type={mostrarPass ? 'text' : 'password'}
                placeholder="Contraseña"
                value={password}
                onChange={e => { setPassword(e.target.value); setErrores(p => ({ ...p, password: '' })) }}
                className={errores.password ? 'campo-invalido' : ''}
              />
              <span className="toggle-password" onClick={() => setMostrarPass(!mostrarPass)}
                role="button" aria-label={mostrarPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                {mostrarPass ? '🙈' : '👁️'}
              </span>
            </div>
            {errores.password && <p className="msg-error">⚠ {errores.password}</p>}
          </div>
          <Link to="/recuperar" className="forgot-password">¿Olvidaste tu contraseña?</Link>
          {error && <p className="error" style={{ display: 'block' }}>{error}</p>}
          <button type="submit" className="btn-login">Iniciar sesión</button>
        </form>
        <p className="registro">
          ¿No tienes cuenta?{' '}
          <Link to="/registro" style={{ color: 'white', fontWeight: 'bold' }}>Regístrate</Link>
        </p>
        <div style={{ marginTop: '12px', fontSize: '13px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Link to="/pqrs-publico" style={{ color: 'white', fontWeight: '600' }}>
            📨 Radicar PQRS sin cuenta
          </Link>
          <Link to="/consulta" style={{ color: 'rgba(255,255,255,0.8)' }}>
            🔍 Consultar estado de proceso
          </Link>
        </div>
      </div>
    </div>
  )
}