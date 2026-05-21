import { NavLink, useNavigate } from 'react-router-dom'

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

const cerrarMenu = () => document.body.classList.remove('menu-abierto')

export default function Sidebar() {
  const navigate = useNavigate()
  const rol = localStorage.getItem('rol') || ''

  const cerrarSesion = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    localStorage.removeItem('rol')
    cerrarMenu()
    navigate('/')
  }

  const linksVisibles = MENU_ITEMS.filter(item => item.roles.includes(rol))

  return (
    <>
      <div className="sidebar-overlay" onClick={cerrarMenu} />

      <aside className="sidebar">
        {/* Logo dentro del sidebar — solo visible en móvil */}
        <div className="sidebar-logo">
          <img src="/Logo.png" alt="SIGJEP" style={{ height: '40px', width: 'auto' }} />
        </div>

        {linksVisibles.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-sidebar-link${isActive ? ' activo' : ''}`}
            onClick={cerrarMenu}
          >
            {item.label}
          </NavLink>
        ))}

        <button className="logout" onClick={cerrarSesion}>
          Cerrar sesión
        </button>
      </aside>
    </>
  )
}
