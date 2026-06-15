import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from './context/ToastContext'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Footer from './components/Footer'
import Login from './pages/Login'
import Registro from './pages/Registro'
import Recuperar from './pages/Recuperar'
import Dashboard from './pages/Dashboard'
import Admin from './pages/Admin'
import Alertas from './pages/Alertas'
import Expedientes from './pages/Expedientes'
import PQRS from './pages/PQRS'
import Reportes from './pages/Reportes'
import ModuloIA from './pages/ModuloIA'
import Documentos from './pages/Documentos'
import ConsultaPublica from './pages/ConsultaPublica'
import PQRSPublico from './pages/PQRSPublico'
import Ayuda from './pages/Ayuda'
import Configuracion from './pages/Configuracion'
import RutaProtegida from './components/RutaProtegida'
import Accesibilidad from './components/Accesibilidad'
import SesionExpirando from './components/SesionExpirando'

function Layout({ children }) {
  return (
    <>
      <Header />
      <Sidebar />
      {children}
      <Footer />
      <Accesibilidad />
      <SesionExpirando />
    </>
  )
}

// Shortcut para no repetir tanto
function Protegida({ roles, children }) {
  return (
    <RutaProtegida rolesPermitidos={roles}>
      <Layout>{children}</Layout>
    </RutaProtegida>
  )
}

const TODOS = ['admin', 'administrador', 'abogado', 'secretaria', 'ciudadano']
const INTERNOS = ['admin', 'administrador', 'abogado', 'secretaria']
const ADMIN = ['admin', 'administrador']
const JURIDICO = ['admin', 'administrador', 'abogado']
const SIN_ABOGADO = ['admin', 'administrador', 'secretaria', 'abogado', 'ciudadano']

function App() {
  return (
    <ToastProvider>
    <BrowserRouter>
      <Routes>
        {/* Públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/recuperar" element={<Recuperar />} />
        <Route path="/consulta" element={<ConsultaPublica />} />
        <Route path="/consulta-estado" element={<ConsultaPublica />} />
        <Route path="/pqrs-publico" element={<PQRSPublico />} />

        {/* Todos los logueados */}
        <Route path="/dashboard" element={<Protegida roles={TODOS}><Dashboard /></Protegida>} />
        <Route path="/pqrs" element={<Protegida roles={SIN_ABOGADO}><PQRS /></Protegida>} />
        <Route path="/ayuda" element={<Protegida roles={TODOS}><Ayuda /></Protegida>} />
        <Route path="/configuracion" element={<Protegida roles={TODOS}><Configuracion /></Protegida>} />

        {/* Internos (no ciudadano) */}
        <Route path="/expedientes" element={<Protegida roles={INTERNOS}><Expedientes /></Protegida>} />
        <Route path="/documentos" element={<Protegida roles={INTERNOS}><Documentos /></Protegida>} />
        <Route path="/alertas" element={<Protegida roles={INTERNOS}><Alertas /></Protegida>} />

        {/* Jurídico (admin + abogado) */}
        <Route path="/ia" element={<Protegida roles={JURIDICO}><ModuloIA /></Protegida>} />

        {/* Solo admin */}
        <Route path="/admin" element={<Protegida roles={ADMIN}><Admin /></Protegida>} />
        <Route path="/reportes" element={<Protegida roles={ADMIN}><Reportes /></Protegida>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
    </ToastProvider>
  )
}

export default App
