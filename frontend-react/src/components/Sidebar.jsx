import { NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

const MENU_ITEMS = [
  { to: '/dashboard',   label: 'Dashboard',   roles: ['admin', 'administrador', 'abogado', 'secretaria', 'ciudadano'] },
  { to: '/admin',       label: 'Admin',        roles: ['admin', 'administrador'] },
  { to: '/expedientes', label: 'Expedientes',  roles: ['admin', 'administrador', 'abogado', 'secretaria'] },
  { to: '/documentos',  label: 'Documentos',   roles: ['admin', 'administrador', 'abogado', 'secretaria'] },
  { to: '/ia',          label: 'Módulo IA',    roles: ['admin', 'administrador', 'abogado'] },
  { to: '/alertas',     label: 'Alertas',      roles: ['admin', 'administrador', 'abogado', 'secretaria'] },
  { to: '/reportes',    label: 'Reportes',     roles: ['admin', 'administrador'] },
  { to: '/pqrs',        label: 'PQRS',         roles: ['admin', 'administrador', 'secretaria', 'abogado', 'ciudadano'] },
]

export default function Sidebar() {
  const [abierto, setAbierto] = useState(false)
  const navigate = useNavigate()
  const rol = localStorage.getItem('rol') || ''

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

  // Filtrar links según rol del usuario
  const linksVisibles = MENU_ITEMS.filter(item => item.roles.includes(rol))

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
          {linksVisibles.map(item => (
            <NavLink key={item.to} to={item.to} style={estiloLink}>
              {item.label}
            </NavLink>
          ))}
          <button className="logout" onClick={cerrarSesion}>
            Cerrar sesión
          </button>
        </>
      )}

    </aside>
  )
}
