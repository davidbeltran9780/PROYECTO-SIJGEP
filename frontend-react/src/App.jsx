import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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
import ConsultaEstado from './pages/ConsultaEstado'
import RutaProtegida from './components/RutaProtegida'

function Layout({ children }) {
  return (
    <>
      <Header />
      <Sidebar />
      {children}
      <Footer />
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

const TODOS = ['admin', 'administrador', 'abogado', 'auxiliar', 'ciudadano']
const INTERNOS = ['admin', 'administrador', 'abogado', 'auxiliar']
const ADMIN = ['admin', 'administrador']
const JURIDICO = ['admin', 'administrador', 'abogado']

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/recuperar" element={<Recuperar />} />
        <Route path="/consulta" element={<ConsultaEstado />} />

        {/* Todos los logueados */}
        <Route path="/dashboard" element={<Protegida roles={TODOS}><Dashboard /></Protegida>} />
        <Route path="/pqrs" element={<Protegida roles={TODOS}><PQRS /></Protegida>} />

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
  )
}

export default App
