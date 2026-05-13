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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/recuperar" element={<Recuperar />} />
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/admin" element={<Layout><Admin /></Layout>} />
        <Route path="/alertas" element={<Layout><Alertas /></Layout>} />
        <Route path="/expedientes" element={<Layout><Expedientes /></Layout>} />
        <Route path="/pqrs" element={<Layout><PQRS /></Layout>} />
        <Route path="/reportes" element={<Layout><Reportes /></Layout>} />
        <Route path="/ia" element={<Layout><ModuloIA /></Layout>} />
        {/* <Route path="/ia" element={
          <RutaProtegida rolesPermitidos={['abogado', 'admin', 'administrador']}>
            <Layout><ModuloIA /></Layout>
          </RutaProtegida>
        } />*/}
        <Route path="/documentos" element={<Layout><Documentos /></Layout>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App