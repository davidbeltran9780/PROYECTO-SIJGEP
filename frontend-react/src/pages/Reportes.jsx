import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts'
import api from '../api/axios'

const COLORES = ['#1E3A8A', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

export default function Reportes() {
  const [stats, setStats] = useState(null)
  const [porTipo, setPorTipo] = useState([])
  const [porEstado, setPorEstado] = useState([])
  const [porMes, setPorMes] = useState([])
  const [pqrsEstado, setPqrsEstado] = useState([])
  const [vencimientos, setVencimientos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/reportes/estadisticas'),
      api.get('/reportes/casos-por-tipo'),
      api.get('/reportes/casos-por-estado'),
      api.get('/reportes/casos-por-mes'),
      api.get('/reportes/pqrs-por-estado'),
      api.get('/reportes/vencimientos'),
    ])
      .then(([s, t, e, m, p, v]) => {
        setStats(s.data)
        setPorTipo(t.data)
        setPorEstado(e.data)
        setPorMes(m.data)
        setPqrsEstado(p.data)
        setVencimientos(v.data)
      })
      .catch(console.error)
      .finally(() => setCargando(false))
  }, [])

  if (cargando) return <main className="content"><p>Cargando reportes...</p></main>

  return (
    <main className="content">
      <div className="top">
        <h2>Reportes del Sistema</h2>
      </div>

      {/* 1 — Tarjetas resumen */}
      {stats && (
        <div className="tarjetas">
          <div className="tarjeta verde">
            <span className="numero">{stats.total_casos}</span>
            <span className="etiqueta">Casos totales</span>
          </div>
          <div className="tarjeta roja">
            <span className="numero">{stats.casos_cerrados}</span>
            <span className="etiqueta">Casos cerrados</span>
          </div>
          <div className="tarjeta verde">
            <span className="numero">{stats.total_expedientes}</span>
            <span className="etiqueta">Expedientes</span>
          </div>
          <div className="tarjeta amarilla">
            <span className="numero">{stats.total_pqrs}</span>
            <span className="etiqueta">PQRS</span>
          </div>
          <div className="tarjeta verde">
            <span className="numero">{stats.total_usuarios}</span>
            <span className="etiqueta">Usuarios activos</span>
          </div>
        </div>
      )}

      {/* 2 — Tabla de vencimientos (justo debajo de tarjetas) */}
      {vencimientos.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ margin: '16px 0 10px', fontSize: '15px', color: '#1e3a8a' }}>
            ⚠️ Casos próximos a vencer
          </h3>
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Título</th><th>Tipo</th><th>Fecha vencimiento</th><th>Días restantes</th>
              </tr>
            </thead>
            <tbody>
              {vencimientos.map(v => (
                <tr key={v.id_caso}>
                  <td>{v.id_caso}</td>
                  <td>{v.titulo}</td>
                  <td>{v.tipo}</td>
                  <td>{v.fecha_vencimiento}</td>
                  <td className={v.dias_restantes <= 2 ? 'urgente' : 'proximo'}>
                    {v.dias_restantes <= 0 ? `Vencido hace ${Math.abs(v.dias_restantes)} día(s)` : `${v.dias_restantes} día(s)`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 3 — Gráficas */}
      <div className="graficas-grid">

        {porTipo.length > 0 && (
          <div className="grafica-card">
            <h4>Casos por tipo</h4>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={porTipo} dataKey="cantidad" nameKey="tipo" cx="50%" cy="50%" outerRadius={90} label>
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

        {porEstado.length > 0 && (
          <div className="grafica-card">
            <h4>Casos por estado</h4>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={porEstado}>
                <XAxis dataKey="estado" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cantidad" fill="#1E3A8A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {porMes.length > 0 && (
          <div className="grafica-card">
            <h4>Casos por mes (últimos 12 meses)</h4>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={porMes}>
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="cantidad" stroke="#1E3A8A" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {pqrsEstado.length > 0 && (
          <div className="grafica-card">
            <h4>PQRS por estado</h4>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={pqrsEstado}>
                <XAxis dataKey="estado" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cantidad" fill="#22C55E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

      </div>
    </main>
  )
}
