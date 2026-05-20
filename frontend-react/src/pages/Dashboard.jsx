import { useEffect, useState } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { ProgressSpinner } from 'primereact/progressspinner'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import api from '../api/axios'

const COLORES = ['#1E3A8A', '#22C55E', '#F59E0B', '#EF4444']

export default function Dashboard() {
  const [expedientes, setExpedientes] = useState([])
  const [misPqrs, setMisPqrs] = useState([])
  const [cargando, setCargando] = useState(true)
  const rol = localStorage.getItem('rol') || ''
  const nombre = localStorage.getItem('usuario') || ''
  const esCiudadano = rol === 'ciudadano'

  useEffect(() => {
    if (esCiudadano) {
      api.get('/pqrs/mis-pqrs')
        .then(res => setMisPqrs(res.data))
        .catch(console.error)
        .finally(() => setCargando(false))
    } else {
      api.get('/expedientes')
        .then(res => setExpedientes(res.data))
        .catch(console.error)
        .finally(() => setCargando(false))
    }
  }, [])

  const estadoTemplate = (rowData) => {
    const clase = rowData.estado === 'urgente' ? 'urgente'
      : rowData.estado === 'proximo' ? 'proximo' : 'atiempo'
    const texto = rowData.estado === 'urgente' ? 'Urgente'
      : rowData.estado === 'proximo' ? 'Próximo' : 'A tiempo'
    return <span className={clase}>{texto}</span>
  }

  // Dashboard ciudadano
  if (esCiudadano) {
    return (
      <main className="content">
        <h2>Bienvenido, {nombre}</h2>
        <div className="tarjetas">
          <a href="/pqrs" className="tarjeta verde">
            <span className="numero">{misPqrs.length}</span>
            <p className="etiqueta">Mis PQRS</p>
          </a>
          <a href="/consulta" className="tarjeta amarilla">
            <span className="numero">🔍</span>
            <p className="etiqueta">Consultar por radicado</p>
          </a>
        </div>

        <h3 className="seccion-dashboard">Mis solicitudes recientes</h3>
        {cargando ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <ProgressSpinner />
          </div>
        ) : misPqrs.length === 0 ? (
          <p>No tienes PQRS registradas aún.</p>
        ) : (
          <DataTable value={misPqrs} paginator rows={5}
            emptyMessage="No hay PQRS"
            tableClassName="tabla">
            <Column field="numero_radicado" header="Radicado" />
            <Column field="tipo" header="Tipo" />
            <Column field="estado" header="Estado" />
          </DataTable>
        )}
      </main>
    )
  }

  // Dashboard interno (admin, abogado, auxiliar)
  const datosTipos = [
    { name: 'Tutela', value: 40 },
    { name: 'Demanda', value: 30 },
    { name: 'PQRS', value: 30 },
  ]

  const datosMeses = [
    { mes: 'Ene', casos: 12 },
    { mes: 'Feb', casos: 19 },
    { mes: 'Mar', casos: 8 },
    { mes: 'Abr', casos: 15 },
    { mes: 'May', casos: 22 },
  ]

  return (
    <main className="content">

      {/* Tarjetas */}
      <div className="tarjetas">
        <a href="/expedientes" className="tarjeta verde">
          <span className="numero">{expedientes.length}</span>
          <p className="etiqueta">Expedientes activos</p>
        </a>
        <a href="/alertas" className="tarjeta amarilla">
          <span className="numero">0</span>
          <p className="etiqueta">Alertas</p>
        </a>
        <a href="/alertas" className="tarjeta roja">
          <span className="numero">0</span>
          <p className="etiqueta">Vencimientos</p>
        </a>
      </div>

      {/* Tabla */}
      {cargando ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <ProgressSpinner />
        </div>
      ) : (
        <DataTable value={expedientes} paginator rows={5}
          emptyMessage="No hay expedientes registrados"
          tableClassName="tabla">
          <Column field="id_expediente" header="Expediente" />
          <Column field="tipo" header="Tipo" />
          <Column field="fecha_limite" header="Vence" />
          <Column field="estado" header="Estado" body={estadoTemplate} />
        </DataTable>
      )}

      {/* Gráficas */}
      <h3 className="seccion-dashboard">Estadísticas generales</h3>
      <div className="graficas-grid">

        <div className="grafica-card">
          <h4>Distribución por tipo de caso</h4>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={datosTipos} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                {datosTipos.map((_, i) => (
                  <Cell key={i} fill={COLORES[i % COLORES.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="grafica-card">
          <h4>Casos radicados por mes</h4>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={datosMeses}>
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="casos" fill="#1E3A8A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
      <p className="nota-datos-simulados">
        * Datos simulados — la integración con la base de datos se realiza en la fase de backend.
      </p>

    </main>
  )
}
