import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts'
import api from '../api/axios'
import Paginacion from '../components/Paginacion'

const COLORES = ['#1E3A8A', '#16a34a', '#b45309', '#dc2626', '#6d28d9', '#0e7490']

export default function Reportes() {
  const [stats, setStats] = useState(null)
  const [porTipo, setPorTipo] = useState([])
  const [porEstado, setPorEstado] = useState([])
  const [porMes, setPorMes] = useState([])
  const [pqrsEstado, setPqrsEstado] = useState([])
  const [pqrsTipo, setPqrsTipo] = useState([])
  const [pqrsAlertas, setPqrsAlertas] = useState([])
  const [vencimientos, setVencimientos] = useState([])
  const [cargaAbogados, setCargaAbogados] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtroVencDesde, setFiltroVencDesde] = useState('')
  const [filtroVencHasta, setFiltroVencHasta] = useState('')
  const [filtroVencTipo, setFiltroVencTipo] = useState('')
  const [paginaVenc, setPaginaVenc] = useState(1)
  const [paginaPqrs, setPaginaPqrs] = useState(1)

  useEffect(() => {
    Promise.all([
      api.get('/reportes/estadisticas'),
      api.get('/reportes/casos-por-tipo'),
      api.get('/reportes/casos-por-estado'),
      api.get('/reportes/casos-por-mes'),
      api.get('/reportes/pqrs-por-estado'),
      api.get('/reportes/pqrs-por-tipo'),
      api.get('/reportes/pqrs-alertas'),
      api.get('/reportes/vencimientos'),
      api.get('/reportes/carga-por-abogado'),
    ])
      .then(([s, t, e, m, pe, pt, pa, v, a]) => {
        setStats(s.data)
        setPorTipo(t.data)
        setPorEstado(e.data)
        setPorMes(m.data)
        setPqrsEstado(pe.data)
        setPqrsTipo(pt.data)
        setPqrsAlertas(pa.data)
        setVencimientos(v.data)
        setCargaAbogados(a.data)
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

      {/* 2 — Tabla de vencimientos */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ margin: '16px 0 10px', fontSize: '15px', color: '#1e3a8a' }}>
          ⚠️ Casos próximos a vencer
        </h3>

        <div className="auditoria-filtros">
          <div className="auditoria-filtro-grupo">
            <label>Desde</label>
            <input type="date" value={filtroVencDesde} onChange={e => setFiltroVencDesde(e.target.value)} />
          </div>
          <div className="auditoria-filtro-grupo">
            <label>Hasta</label>
            <input type="date" value={filtroVencHasta} onChange={e => setFiltroVencHasta(e.target.value)} />
          </div>
          <div className="auditoria-filtro-grupo">
            <label>Tipo de caso</label>
            <select value={filtroVencTipo} onChange={e => setFiltroVencTipo(e.target.value)}>
              <option value="">Todos</option>
              {[...new Set(vencimientos.map(v => v.tipo))].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <button className="btn-auditoria-limpiar"
            onClick={() => { setFiltroVencDesde(''); setFiltroVencHasta(''); setFiltroVencTipo(''); setPaginaVenc(1) }}>
            Limpiar
          </button>
        </div>

        {(() => {
          const filtrados = vencimientos.filter(v => {
            if (filtroVencTipo && v.tipo !== filtroVencTipo) return false
            if (filtroVencDesde && v.fecha_vencimiento < filtroVencDesde) return false
            if (filtroVencHasta && v.fecha_vencimiento > filtroVencHasta) return false
            return true
          })
          const pagina = filtrados.slice((paginaVenc - 1) * 10, paginaVenc * 10)
          return (<>
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Título</th><th>Tipo</th><th>Fecha vencimiento</th><th>Días restantes</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.length === 0
                  ? <tr><td colSpan={5}>No hay casos con esos filtros</td></tr>
                  : pagina.map(v => (
                    <tr key={v.id_caso}>
                      <td>{v.id_caso}</td>
                      <td>{v.titulo}</td>
                      <td>{v.tipo}</td>
                      <td>{v.fecha_vencimiento}</td>
                      <td className={v.dias_restantes <= 2 ? 'urgente' : 'proximo'}>
                        {v.dias_restantes <= 0
                          ? `Vencido hace ${Math.abs(v.dias_restantes)} día(s)`
                          : `${v.dias_restantes} día(s)`}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            <Paginacion total={filtrados.length} pagina={paginaVenc} setPagina={setPaginaVenc} porPagina={10} />
          </>)
        })()}
      </div>

      {/* 3 — PQRS vencidas o próximas a vencer */}
      {pqrsAlertas.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ margin: '0 0 10px', fontSize: '15px', color: '#1e3a8a' }}>
            💬 PQRS pendientes de respuesta
          </h3>
          {(() => {
            const pagina = pqrsAlertas.slice((paginaPqrs - 1) * 10, paginaPqrs * 10)
            return (<>
              <table>
                <thead>
                  <tr>
                    <th>Radicado</th><th>Tipo</th><th>Solicitante</th><th>Fecha límite</th><th>Días restantes</th>
                  </tr>
                </thead>
                <tbody>
                  {pagina.map(p => (
                    <tr key={p.id_pqrs}>
                      <td style={{ fontFamily: 'monospace', fontWeight: '700', color: '#1e3a8a', fontSize: '12px' }}>
                        {p.numero_radicado}
                      </td>
                      <td>{p.tipo}</td>
                      <td>{p.nombre_ciudadano || 'Anónimo'}</td>
                      <td>{p.fecha_limite?.split('T')[0]}</td>
                      <td className={p.dias_restantes < 0 ? 'urgente' : p.dias_restantes <= 3 ? 'proximo' : ''}>
                        {p.dias_restantes < 0
                          ? `Vencida hace ${Math.abs(p.dias_restantes)} día(s)`
                          : p.dias_restantes === 0 ? 'Vence hoy'
                          : `${p.dias_restantes} día(s)`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Paginacion total={pqrsAlertas.length} pagina={paginaPqrs} setPagina={setPaginaPqrs} porPagina={10} />
            </>)
          })()}
        </div>
      )}

      {/* 4 — Gráficas */}
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

        {pqrsTipo.length > 0 && (
          <div className="grafica-card">
            <h4>PQRS por tipo</h4>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={pqrsTipo} dataKey="cantidad" nameKey="tipo" cx="50%" cy="50%" outerRadius={90} label>
                  {pqrsTipo.map((_, i) => (
                    <Cell key={i} fill={COLORES[i % COLORES.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {cargaAbogados.length > 0 && (
          <div className="grafica-card">
            <h4>Carga de trabajo por abogado</h4>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={cargaAbogados} layout="vertical">
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="nombre" width={120} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="casos_asignados" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

      </div>
    </main>
  )
}
