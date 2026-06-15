import { useState, useEffect } from 'react'
import api from '../api/axios'
import { useToast } from '../context/ToastContext'

export default function Configuracion() {
  const { showToast } = useToast()
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [pwActual, setPwActual] = useState('')
  const [pwNueva, setPwNueva] = useState('')
  const [pwConfirm, setPwConfirm] = useState('')
  const [guardandoPerfil, setGuardandoPerfil] = useState(false)
  const [guardandoPw, setGuardandoPw] = useState(false)

  useEffect(() => {
    api.get('/perfil').then(res => {
      setNombre(res.data.nombre)
      setEmail(res.data.email)
    }).catch(() => {})
  }, [])

  const guardarNombre = async (e) => {
    e.preventDefault()
    if (!nombre.trim()) return
    setGuardandoPerfil(true)
    try {
      await api.put('/perfil', { nombre })
      localStorage.setItem('usuario', nombre)
      showToast('Nombre actualizado correctamente', 'success')
    } catch {
      showToast('Error al actualizar el nombre', 'error')
    } finally {
      setGuardandoPerfil(false)
    }
  }

  const guardarPassword = async (e) => {
    e.preventDefault()
    if (pwNueva !== pwConfirm) {
      showToast('Las contraseñas nuevas no coinciden', 'error')
      return
    }
    if (pwNueva.length < 6) {
      showToast('La contraseña debe tener al menos 6 caracteres', 'error')
      return
    }
    setGuardandoPw(true)
    try {
      await api.put('/perfil', { password_actual: pwActual, password_nueva: pwNueva })
      showToast('Contraseña actualizada correctamente', 'success')
      setPwActual('')
      setPwNueva('')
      setPwConfirm('')
    } catch (err) {
      const msg = err.response?.data?.detail || 'Error al cambiar la contraseña'
      showToast(msg, 'error')
    } finally {
      setGuardandoPw(false)
    }
  }

  return (
    <main className="content">
      <h2>Configuración</h2>
      <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '13px' }}>
        Administra tu perfil y preferencias de cuenta.
      </p>

      <div className="config-grid">

        {/* Información del perfil */}
        <div className="config-card">
          <h3 className="config-card-titulo">👤 Información del perfil</h3>
          <form onSubmit={guardarNombre}>
            <div className="config-campo">
              <label>Correo electrónico</label>
              <input type="email" value={email} disabled
                style={{ background: '#f3f4f6', color: '#9ca3af', cursor: 'not-allowed' }} />
              <small style={{ color: '#9ca3af' }}>El correo no se puede cambiar</small>
            </div>
            <div className="config-campo">
              <label>Nombre completo</label>
              <input type="text" value={nombre}
                onChange={e => setNombre(e.target.value)}
                placeholder="Tu nombre" required />
            </div>
            <button type="submit" className="config-btn-guardar" disabled={guardandoPerfil}>
              {guardandoPerfil ? 'Guardando...' : 'Guardar nombre'}
            </button>
          </form>
        </div>

        {/* Cambiar contraseña */}
        <div className="config-card">
          <h3 className="config-card-titulo">🔐 Cambiar contraseña</h3>
          <form onSubmit={guardarPassword}>
            <div className="config-campo">
              <label>Contraseña actual</label>
              <input type="password" value={pwActual}
                onChange={e => setPwActual(e.target.value)}
                placeholder="Escribe tu contraseña actual" required />
            </div>
            <div className="config-campo">
              <label>Nueva contraseña</label>
              <input type="password" value={pwNueva}
                onChange={e => setPwNueva(e.target.value)}
                placeholder="Escribe tu contraseña nueva" required />
            </div>
            <div className="config-campo">
              <label>Confirmar nueva contraseña</label>
              <input type="password" value={pwConfirm}
                onChange={e => setPwConfirm(e.target.value)}
                placeholder="Confirma tu contraseña nueva" required />
            </div>
            <button type="submit" className="config-btn-guardar" disabled={guardandoPw}>
              {guardandoPw ? 'Guardando...' : 'Cambiar contraseña'}
            </button>
          </form>
        </div>

      </div>
    </main>
  )
}
