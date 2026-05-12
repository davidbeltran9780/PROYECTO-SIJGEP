import { NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

export default function Sidebar() {
  const [abierto, setAbierto] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const ajustar = () => setAbierto(window.innerWidth > 768)
    ajustar()
    window.addEventListener('resize', ajustar)
    return () => window.removeEventListener('resize', ajustar)
  }, [])

  const cerrarSesion = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    localStorage.removeItem('rol')
    navigate('/')
  }

  const estiloLink = ({ isActive }) => ({
    display: 'block',
    padding: '12px 20px',
    color: 'white',
    textDecoration: 'none',
    fontSize: '13px',
    backgroundColor: isActive ? 'var(--azul-hover)' : 'transparent',
    borderLeft: isActive ? '4px solid #4da3ff' : '4px solid transparent',
    fontWeight: isActive ? 'bold' : 'normal',
  })

  return (
    <aside className="sidebar">

      <div style={{ background: 'var(--azul-hover)', cursor: 'pointer' }}
        onClick={() => setAbierto(!abierto)}>
        <span style={{ color: 'white', padding: '12px 20px', display: 'block', fontWeight: 'bold', fontSize: '13px' }}>
          ☰ Menú
        </span>
      </div>

      {abierto && (
        <>
          <NavLink to="/dashboard" style={estiloLink}>Dashboard</NavLink>
<NavLink to="/admin" style={estiloLink}>Admin</NavLink>
<NavLink to="/expedientes" style={estiloLink}>Expedientes</NavLink>
<NavLink to="/ia" style={estiloLink}>Módulo IA</NavLink>
<NavLink to="/alertas" style={estiloLink}>Alertas</NavLink>
<NavLink to="/documentos" style={estiloLink}>Documentos</NavLink>
<NavLink to="/reportes" style={estiloLink}>Reportes</NavLink>
<NavLink to="/pqrs" style={estiloLink}>PQRS</NavLink>
          <button className="logout" onClick={cerrarSesion}>
            Cerrar sesión
          </button>
        </>
      )}

    </aside>
  )
}