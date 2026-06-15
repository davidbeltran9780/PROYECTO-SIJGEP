import { NavLink, useNavigate } from 'react-router-dom'

const MENU_ITEMS = [
  { to: '/dashboard',   label: 'Dashboard',   title: 'Ir al panel principal',          roles: ['admin', 'administrador', 'abogado', 'secretaria', 'ciudadano'] },
  { to: '/admin',       label: 'Admin',        title: 'Administración del sistema',     roles: ['admin', 'administrador'] },
  { to: '/expedientes', label: 'Expedientes',  title: 'Gestión de expedientes',         roles: ['admin', 'administrador', 'abogado', 'secretaria'] },
  { to: '/documentos',  label: 'Documentos',   title: 'Gestión de documentos',          roles: ['admin', 'administrador', 'abogado', 'secretaria'] },
  { to: '/ia',          label: 'Módulo IA',    title: 'Asistente de inteligencia artificial', roles: ['admin', 'administrador', 'abogado'] },
  { to: '/alertas',     label: 'Alertas',      title: 'Alertas de vencimiento',         roles: ['admin', 'administrador', 'abogado', 'secretaria'] },
  { to: '/reportes',    label: 'Reportes',     title: 'Reportes y estadísticas',        roles: ['admin', 'administrador'] },
  { to: '/pqrs',        label: 'PQRS',         title: 'Peticiones, Quejas, Reclamos y Sugerencias', roles: ['admin', 'administrador', 'secretaria', 'abogado', 'ciudadano'] },
  { to: '/ayuda',       label: 'Ayuda',        title: 'Centro de ayuda',                roles: ['admin', 'administrador', 'abogado', 'secretaria', 'ciudadano'] },
]

const cerrarMenu = () => document.body.classList.remove('menu-abierto')
const toggleSidebarDesktop = () => document.body.classList.toggle('sidebar-oculto')

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

        {/* Botón cerrar sidebar — solo escritorio */}
        <button
          className="btn-cerrar-sidebar"
          onClick={toggleSidebarDesktop}
          title="Cerrar menú lateral"
          aria-label="Cerrar menú lateral"
        >
          ← Cerrar menú
        </button>

        {linksVisibles.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-sidebar-link${isActive ? ' activo' : ''}`}
            onClick={cerrarMenu}
            title={item.title}
            aria-label={item.title}
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
