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
  const [porTipo, setPorTipo] = useState([])
  const [porMes, setPorMes] = useState([])
  const [alertasCount, setAlertasCount] = useState(0)
  const [vencimientosCount, setVencimientosCount] = useState(0)
  const [cargando, setCargando] = useState(true)
  const rol = localStorage.getItem('rol') || ''
  const nombre = localStorage.getItem('usuario') || ''
  const esCiudadano = rol === 'ciudadano'
  const esAdmin = ['admin', 'administrador'].includes(rol)

  useEffect(() => {
    if (esCiudadano) {
      api.get('/pqrs/mis-pqrs')
        .then(res => setMisPqrs(res.data))
        .catch(console.error)
        .finally(() => setCargando(false))
    } else {
      // Cargar expedientes y datos reales de reportes en paralelo
      Promise.all([
        api.get('/expedientes'),
        api.get('/casos'),
        esAdmin ? api.get('/reportes/casos-por-tipo') : Promise.resolve({ data: [] }),
        esAdmin ? api.get('/reportes/casos-por-mes') : Promise.resolve({ data: [] }),
        esAdmin ? api.get('/reportes/vencimientos') : Promise.resolve({ data: [] }),
      ])
        .then(([expRes, casosRes, tiposRes, mesesRes, vencRes]) => {
          setExpedientes(expRes.data)

          // Gráfica tipos — formatear para recharts
          setPorTipo(tiposRes.data.map(t => ({ name: t.tipo, value: t.cantidad })))

          // Gráfica meses
          setPorMes(mesesRes.data.map(m => ({ mes: m.mes, casos: m.cantidad })))

          // Alertas: casos activos con fecha de vencimiento
          const activos = casosRes.data.filter(c =>
            c.fecha_vencimiento && !['cerrado', 'archivado'].includes(c.estado)
          )
          const hoy = new Date()
          const urgentes = activos.filter(c => {
            const dias = Math.ceil((new Date(c.fecha_vencimiento) - hoy) / (1000 * 60 * 60 * 24))
            return dias <= 2
          })
          setAlertasCount(activos.length)
          setVencimientosCount(urgentes.length)
        })
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

  // Dashboard interno (admin, abogado, secretaria)
  return (
    <main className="content">

      {/* Tarjetas */}
      <div className="tarjetas">
        <a href="/expedientes" className="tarjeta verde">
          <span className="numero">{expedientes.length}</span>
          <p className="etiqueta">Expedientes activos</p>
        </a>
        <a href="/alertas" className="tarjeta amarilla">
          <span className="numero">{alertasCount}</span>
          <p className="etiqueta">Con vencimiento</p>
        </a>
        <a href="/alertas" className="tarjeta roja">
          <span className="numero">{vencimientosCount}</span>
          <p className="etiqueta">Urgentes</p>
        </a>
      </div>

      {/* Tabla de expedientes recientes */}
      {cargando ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <ProgressSpinner />
        </div>
      ) : (
        <>
          <h3 className="seccion-dashboard">Expedientes recientes</h3>
          <DataTable value={expedientes} paginator rows={5}
            emptyMessage="No hay expedientes registrados"
            tableClassName="tabla">
            <Column field="id_expediente" header="Expediente" />
            <Column field="tipo" header="Tipo" />
            <Column field="abogado_nombre" header="Abogado" />
            <Column field="fecha_creacion" header="Creado"
              body={r => r.fecha_creacion?.split('T')[0]} />
            <Column field="estado_caso" header="Estado" body={estadoTemplate} />
          </DataTable>
        </>
      )}

      {/* Gráficas — solo admin ve datos reales */}
      {esAdmin && (
        <>
          <h3 className="seccion-dashboard">Estadísticas generales</h3>
          <div className="graficas-grid">

            {porTipo.length > 0 && (
              <div className="grafica-card">
                <h4>Distribución por tipo de caso</h4>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={porTipo} dataKey="value" nameKey="name"
                      cx="50%" cy="50%" outerRadius={90} label>
                      {porTipo.map((_, i) => (
                        <Cell key={i} fill={COLORES[i % COLORES.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {porMes.length > 0 && (
              <div className="grafica-card">
                <h4>Casos radicados por mes</h4>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={porMes}>
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="casos" fill="#1E3A8A" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

          </div>
        </>
      )}

    </main>
  )
}
