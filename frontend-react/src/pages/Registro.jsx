import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'

export default function Registro() {
  const [form, setForm] = useState({ nombre: '', correo: '', password: '' })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleRegistro = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/register', {
        nombre: form.nombre,
        email: form.correo,
        password: form.password,
        rol: 'ciudadano'
      })
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al registrarse')
    }
  }

  return (
    <div className="login-body" style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="login-card">
        <img src="/Logo.png" alt="SIGJEP" className="login-logo" />
        <h2>Registro</h2>
        <form onSubmit={handleRegistro}>
          <input type="text" placeholder="Nombre completo" required
            value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
          <input type="email" placeholder="Correo electrónico" required
            value={form.correo} onChange={e => setForm({ ...form, correo: e.target.value })} />
          <input type="password" placeholder="Contraseña" required
            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          {error && <p className="error" style={{ display: 'block' }}>{error}</p>}
          <button type="submit" className="btn-login">Registrarse</button>
        </form>
        <p className="registro">¿Ya tienes cuenta? <Link to="/" style={{ color: 'white', fontWeight: 'bold' }}>Inicia sesión</Link></p>
      </div>
    </div>
  )
}
