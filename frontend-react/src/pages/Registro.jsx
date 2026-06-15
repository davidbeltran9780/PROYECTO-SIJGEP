import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'

function campo(errores, nombre) {
  return errores[nombre] ? 'campo-invalido' : ''
}

export default function Registro() {
  const [form, setForm] = useState({ nombre: '', correo: '', password: '', confirmar: '' })

  useEffect(() => {
    document.body.classList.add('login-body')
    return () => document.body.classList.remove('login-body')
  }, [])
  const [errores, setErrores] = useState({})
  const [errorServidor, setErrorServidor] = useState('')
  const navigate = useNavigate()

  const validar = () => {
    const e = {}
    if (!form.nombre.trim())
      e.nombre = 'El nombre es obligatorio'
    if (!form.correo.trim())
      e.correo = 'El correo es obligatorio'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo))
      e.correo = 'Formato de correo inválido'
    if (!form.password)
      e.password = 'La contraseña es obligatoria'
    else if (form.password.length < 6)
      e.password = 'Mínimo 6 caracteres'
    if (!form.confirmar)
      e.confirmar = 'Confirma tu contraseña'
    else if (form.password !== form.confirmar)
      e.confirmar = 'Las contraseñas no coinciden'
    return e
  }

  const handleRegistro = async (e) => {
    e.preventDefault()
    setErrorServidor('')
    const e2 = validar()
    if (Object.keys(e2).length > 0) { setErrores(e2); return }
    try {
      await api.post('/register', {
        nombre: form.nombre,
        email: form.correo,
        password: form.password,
        rol: 'ciudadano'
      })
      navigate('/')
    } catch (err) {
      setErrorServidor(err.response?.data?.detail || 'Error al registrarse')
    }
  }

  const set = (campo, valor) => {
    setForm(prev => ({ ...prev, [campo]: valor }))
    if (errores[campo]) setErrores(prev => ({ ...prev, [campo]: '' }))
  }

  return (
    <div style={{ background: 'linear-gradient(90deg, #E5B93D, #1E3A8A)', position: 'fixed', inset: 0, overflowY: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', boxSizing: 'border-box' }}>
      <div className="login-card">
        <img src="/Logo.png" alt="SIGJEP" className="login-logo" />
        <h2>Registro</h2>
        <form onSubmit={handleRegistro} noValidate>

          <div style={{ marginBottom: '12px' }}>
            <label htmlFor="reg-nombre" style={{ display: 'block', color: 'rgba(255,255,255,0.85)', fontSize: '12px', marginBottom: '4px' }}>
              Nombre completo *
            </label>
            <input
              id="reg-nombre"
              type="text"
              placeholder="Tu nombre completo"
              value={form.nombre}
              onChange={e => set('nombre', e.target.value)}
              className={errores.nombre ? 'campo-invalido' : ''}
              style={{ width: '100%' }}
            />
            {errores.nombre && <p className="msg-error">⚠ {errores.nombre}</p>}
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label htmlFor="reg-correo" style={{ display: 'block', color: 'rgba(255,255,255,0.85)', fontSize: '12px', marginBottom: '4px' }}>
              Correo electrónico *
            </label>
            <input
              id="reg-correo"
              type="email"
              placeholder="tucorreo@ejemplo.com"
              value={form.correo}
              onChange={e => set('correo', e.target.value)}
              className={errores.correo ? 'campo-invalido' : ''}
              style={{ width: '100%' }}
            />
            {errores.correo && <p className="msg-error">⚠ {errores.correo}</p>}
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label htmlFor="reg-password" style={{ display: 'block', color: 'rgba(255,255,255,0.85)', fontSize: '12px', marginBottom: '4px' }}>
              Contraseña * <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>(mínimo 6 caracteres)</span>
            </label>
            <input
              id="reg-password"
              type="password"
              placeholder="Contraseña"
              value={form.password}
              onChange={e => set('password', e.target.value)}
              className={errores.password ? 'campo-invalido' : ''}
              style={{ width: '100%' }}
            />
            {errores.password && <p className="msg-error">⚠ {errores.password}</p>}
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="reg-confirmar" style={{ display: 'block', color: 'rgba(255,255,255,0.85)', fontSize: '12px', marginBottom: '4px' }}>
              Confirmar contraseña *
            </label>
            <input
              id="reg-confirmar"
              type="password"
              placeholder="Repite tu contraseña"
              value={form.confirmar}
              onChange={e => set('confirmar', e.target.value)}
              className={errores.confirmar ? 'campo-invalido' : ''}
              style={{ width: '100%' }}
            />
            {errores.confirmar && <p className="msg-error">⚠ {errores.confirmar}</p>}
          </div>

          {errorServidor && <p className="error" style={{ display: 'block', marginBottom: '10px' }}>{errorServidor}</p>}
          <button type="submit" className="btn-login">Registrarse</button>
        </form>
        <p className="registro">¿Ya tienes cuenta? <Link to="/" style={{ color: 'white', fontWeight: 'bold' }}>Inicia sesión</Link></p>
      </div>
    </div>
  )
}
