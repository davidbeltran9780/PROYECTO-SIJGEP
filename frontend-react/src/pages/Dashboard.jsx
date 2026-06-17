import { useEffect, useState } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { ProgressSpinner } from 'primereact/progressspinner'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import api from '../api/axios'

const COLORES = ['#1E3A8A', '#16a34a', '#b45309', '#dc2626', '#6d28d9', '#0e7490']

const PASOS_PQRS = [
  { key: 'recibido',    label: 'Recibido',    color: '#3b82f6' },
  { key: 'en_proceso',  label: 'En proceso',  color: '#f59e0b' },
  { key: 'respondido',  label: 'Respondido',  color: '#10b981' },
  { key: 'cerrado',     label: 'Cerrado',     color: '#6b7280' },
]

function LineaTiempo({ pqrs }) {
  if (!pqrs) return null
  const idxActual = PASOS_PQRS.findIndex(p => p.key === pqrs.estado)

  return (
    <div style={{
      background: 'white', border: '1px solid #e5e7eb',
      borderRadius: '10px', padding: '16px 20px', marginBottom: '20px'
    }}>
      <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px' }}>Solicitud más reciente</p>
      <p style={{ fontWeight: '700', fontSize: '13px', color: '#1e3a8a', margin: '0 0 16px', fontFamily: 'monospace' }}>
        {pqrs.numero_radicado} — {pqrs.tipo?.toUpperCase()}
      </p>

      {/* Línea de tiempo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        {PASOS_PQRS.map((paso, i) => {
          const activo = i <= idxActual
          const esActual = i === idxActual
          return (
            <div key={paso.key} style={{ display: 'flex', alignItems: 'center', flex: i < PASOS_PQRS.length - 1 ? 1 : 'none' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: esActual ? '32px' : '24px',
                  height: esActual ? '32px' : '24px',
                  borderRadius: '50%',
                  background: activo ? paso.color : '#e5e7eb',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '700', fontSize: esActual ? '13px' : '11px',
                  color: activo ? 'white' : '#9ca3af',
                  boxShadow: esActual ? `0 0 0 3px ${paso.color}33` : 'none',
                  transition: 'all 0.2s',
                  flexShrink: 0,
                }}>
                  {activo ? (esActual && paso.key !== 'cerrado' ? '●' : '✓') : '○'}
                </div>
                <span style={{
                  fontSize: '10px', fontWeight: esActual ? '700' : '400',
                  color: activo ? paso.color : '#9ca3af',
                  whiteSpace: 'nowrap',
                }}>
                  {paso.label}
                </span>
              </div>
              {i < PASOS_PQRS.length - 1 && (
                <div style={{
                  flex: 1, height: '2px', margin: '0 4px',
                  background: i < idxActual ? PASOS_PQRS[i].color : '#e5e7eb',
                  marginBottom: '18px',
                }} />
              )}
            </div>
          )
        })}
      </div>

      {pqrs.respuesta && (
        <div style={{
          marginTop: '14px', background: '#f0fdf4', border: '1px solid #86efac',
          borderRadius: '8px', padding: '10px 12px', fontSize: '13px', color: '#166534'
        }}>
          <strong>Respuesta:</strong> {pqrs.respuesta}
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const [expedientes, setExpedientes] = useState([])
  const [casos, setCasos] = useState([])
  const [misPqrs, setMisPqrs] = useState([])
  const [pqrsList, setPqrsList] = useState([])
  const [porTipo, setPorTipo] = useState([])
  const [porMes, setPorMes] = useState([])
  const [alertasCount, setAlertasCount] = useState(0)
  const [vencimientosCount, setVencimientosCount] = useState(0)
  const [pqrsVencidasCount, setPqrsVencidasCount] = useState(0)
  const [cargando, setCargando] = useState(true)
  const [filtroAbogado, setFiltroAbogado] = useState('')
  const [filtroDesde, setFiltroDesde] = useState('')
  const [filtroHasta, setFiltroHasta] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')

  const rol = localStorage.getItem('rol') || ''
  const nombre = localStorage.getItem('usuario') || ''
  const esCiudadano = rol === 'ciudadano'
  const esAdmin = ['admin', 'administrador'].includes(rol)
  const esAbogado = rol === 'abogado'
  const esSecretaria = rol === 'secretaria'

  const hora = new Date().getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 18 ? 'Buenas tardes' : 'Buenas noches'
  const rolLabel = { admin: 'Administrador', administrador: 'Administrador', abogado: 'Abogado', secretaria: 'Secretaria', ciudadano: 'Ciudadano' }[rol] || rol
  const fechaHoy = new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  const saludoBloque = (
    <div className="saludo-bloque" style={{ marginBottom: '20px' }}>
      <h2 className="saludo-titulo" style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#111827' }}>
        {saludo}, {nombre} 👋
      </h2>
      <p className="saludo-sub" style={{ margin: '4px 0 0', fontSize: '13px', color: '#6b7280' }}>
        {rolLabel} · {fechaHoy}
      </p>
    </div>
  )

  useEffect(() => {
    if (esCiudadano) {
      api.get('/pqrs/mis-pqrs')
        .then(res => setMisPqrs(res.data))
        .catch(console.error)
        .finally(() => setCargando(false))
    } else {
      Promise.all([
        api.get('/expedientes'),
        api.get('/casos'),
        esAdmin ? api.get('/reportes/casos-por-tipo') : Promise.resolve({ data: [] }),
        esAdmin ? api.get('/reportes/casos-por-mes') : Promise.resolve({ data: [] }),
        esAdmin ? api.get('/reportes/vencimientos') : Promise.resolve({ data: [] }),
        (esSecretaria || esAdmin) ? api.get('/pqrs') : Promise.resolve({ data: [] }),
        esAdmin ? api.get('/reportes/pqrs-alertas') : Promise.resolve({ data: [] }),
      ])
        .then(([expRes, casosRes, tiposRes, mesesRes, vencRes, pqrsRes, pqrsAlertasRes]) => {
          setExpedientes(expRes.data)
          setCasos(casosRes.data)
          setPqrsList(pqrsRes.data)
          setPorTipo(tiposRes.data.map(t => ({ name: t.tipo, value: t.cantidad })))
          setPorMes(mesesRes.data.map(m => ({ mes: m.mes, casos: m.cantidad })))

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
          setPqrsVencidasCount(pqrsAlertasRes.data.filter(p => p.dias_restantes < 0).length)
        })
        .catch(console.error)
        .finally(() => setCargando(false))
    }
  }, [])

  const calcularEstado = (rowData) => {
    const estadoCaso = rowData.estado_caso
    if (['cerrado', 'archivado'].includes(estadoCaso)) return estadoCaso
    if (!rowData.fecha_vencimiento) return 'atiempo'
    const dias = Math.ceil((new Date(rowData.fecha_vencimiento) - new Date()) / (1000 * 60 * 60 * 24))
    if (dias <= 2) return 'urgente'
    if (dias <= 5) return 'proximo'
    return 'atiempo'
  }

  const estadoTemplate = (rowData) => {
    const estado = calcularEstado(rowData)
    const dias = rowData.fecha_vencimiento
      ? Math.ceil((new Date(rowData.fecha_vencimiento) - new Date()) / (1000 * 60 * 60 * 24))
      : null
    if (estado === 'urgente') return <span className="urgente">Urgente {dias !== null ? `(${dias}d)` : ''}</span>
    if (estado === 'proximo') return <span className="proximo">Próximo {dias !== null ? `(${dias}d)` : ''}</span>
    if (estado === 'cerrado') return <span className="archivado">Cerrado</span>
    if (estado === 'archivado') return <span className="archivado">Archivado</span>
    return <span className="atiempo">A tiempo {dias !== null ? `(${dias}d)` : ''}</span>
  }

  // ── CIUDADANO ──────────────────────────────────────────────
  if (esCiudadano) {
    const pqrsMasReciente = misPqrs[0] || null
    const porEstado = ['recibido', 'en_proceso', 'respondido', 'cerrado'].map(e => ({
      name: e.replace('_', ' '),
      value: misPqrs.filter(p => p.estado === e).length
    })).filter(e => e.value > 0)

    return (
      <main className="content">
        {saludoBloque}

        <div className="tarjetas">
          <a href="/pqrs" className="tarjeta verde">
            <span className="numero">{misPqrs.length}</span>
            <p className="etiqueta">Mis PQRS</p>
          </a>
          <a href="/pqrs" className="tarjeta amarilla">
            <span className="numero">{misPqrs.filter(p => ['recibido', 'en_proceso'].includes(p.estado)).length}</span>
            <p className="etiqueta">Pendientes</p>
          </a>
          <a href="/pqrs" className="tarjeta verde">
            <span className="numero">{misPqrs.filter(p => p.estado === 'respondido').length}</span>
            <p className="etiqueta">Respondidas</p>
          </a>
          <a href="/pqrs-publico" className="tarjeta roja">
            <span className="numero">📨</span>
            <p className="etiqueta">Radicar nueva PQRS</p>
          </a>
        </div>

        {cargando ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><ProgressSpinner /></div>
        ) : misPqrs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>
            <p style={{ fontSize: '32px', margin: '0 0 8px' }}>📭</p>
            <p style={{ fontSize: '14px' }}>Aún no tienes solicitudes registradas.</p>
            <a href="/pqrs-publico" style={{ color: '#1e3a8a', fontWeight: '600', fontSize: '13px' }}>
              Radicar primera PQRS →
            </a>
          </div>
        ) : (
          <>
            <LineaTiempo pqrs={pqrsMasReciente} />

            <h3 className="seccion-dashboard">Todas mis solicitudes</h3>
            <DataTable value={misPqrs} paginator rows={5} emptyMessage="No hay PQRS" tableClassName="p-datatable-sm">
              <Column field="numero_radicado" header="Radicado" />
              <Column field="tipo" header="Tipo" />
              <Column field="estado" header="Estado" body={r => <span className={`estado ${r.estado}`}>{r.estado}</span>} />
              <Column field="fecha_creacion" header="Fecha" body={r => r.fecha_creacion?.split('T')[0]} />
            </DataTable>
          </>
        )}
      </main>
    )
  }

  // ── ABOGADO ────────────────────────────────────────────────
  if (esAbogado) {
    const casosPorTipo = Object.entries(
      casos.reduce((acc, c) => { acc[c.tipo] = (acc[c.tipo] || 0) + 1; return acc }, {})
    ).map(([name, value]) => ({ name, value }))

    const casosPorEstado = Object.entries(
      casos.reduce((acc, c) => { acc[c.estado] = (acc[c.estado] || 0) + 1; return acc }, {})
    ).map(([name, value]) => ({ name, value }))

    const casosUrgentes = casos.filter(c => {
      if (!c.fecha_vencimiento || ['cerrado', 'archivado'].includes(c.estado)) return false
      return Math.ceil((new Date(c.fecha_vencimiento) - new Date()) / (1000 * 60 * 60 * 24)) <= 5
    }).sort((a, b) => new Date(a.fecha_vencimiento) - new Date(b.fecha_vencimiento)).slice(0, 5)

    return (
      <main className="content">
        {saludoBloque}

        <div className="tarjetas">
          <a href="/expedientes" className="tarjeta verde">
            <span className="numero">{expedientes.length}</span>
            <p className="etiqueta">Mis expedientes</p>
          </a>
          <a href="/alertas" className="tarjeta amarilla">
            <span className="numero">{casos.filter(c => !['cerrado', 'archivado'].includes(c.estado)).length}</span>
            <p className="etiqueta">Casos activos</p>
          </a>
          <a href="/alertas" className="tarjeta roja">
            <span className="numero">{vencimientosCount}</span>
            <p className="etiqueta">Urgentes</p>
          </a>
        </div>

        {cargando ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><ProgressSpinner /></div>
        ) : (
          <>
            {casosUrgentes.length > 0 && (
              <>
                <h3 className="seccion-dashboard">Próximos a vencer</h3>
                <table>
                  <thead>
                    <tr><th>Expediente</th><th>Tipo</th><th>Título</th><th>Vencimiento</th><th>Estado</th></tr>
                  </thead>
                  <tbody>
                    {casosUrgentes.map(c => {
                      const dias = Math.ceil((new Date(c.fecha_vencimiento) - new Date()) / (1000 * 60 * 60 * 24))
                      return (
                        <tr key={c.id_caso}>
                          <td style={{ fontFamily: 'monospace', fontWeight: '700', color: '#1e3a8a', fontSize: '12px' }}>
                            EXP-{String(c.id_expediente || c.id_caso).padStart(3, '0')}
                          </td>
                          <td>{c.tipo}</td>
                          <td>{c.titulo || '—'}</td>
                          <td style={{ fontSize: '13px', color: '#6b7280' }}>{c.fecha_vencimiento}</td>
                          <td>
                            <span className={dias <= 2 ? 'urgente' : 'proximo'}>
                              {dias <= 2 ? `🔴 ${dias}d` : `🟡 ${dias}d`}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </>
            )}

            <h3 className="seccion-dashboard">Estadísticas de mis casos</h3>
            <div className="graficas-grid">
              {casosPorTipo.length > 0 && (
                <div className="grafica-card">
                  <h4>Casos por tipo</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={casosPorTipo} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} label>
                        {casosPorTipo.map((_, i) => <Cell key={i} fill={COLORES[i % COLORES.length]} />)}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
              {casosPorEstado.length > 0 && (
                <div className="grafica-card">
                  <h4>Casos por estado</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={casosPorEstado}>
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {casosPorEstado.map((_, i) => <Cell key={i} fill={COLORES[i % COLORES.length]} />)}
                      </Bar>
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

  // ── SECRETARIA ─────────────────────────────────────────────
  if (esSecretaria) {
    const pqrsPorTipo = Object.entries(
      pqrsList.reduce((acc, p) => { acc[p.tipo] = (acc[p.tipo] || 0) + 1; return acc }, {})
    ).map(([name, value]) => ({ name, value }))

    const pqrsPorEstado = Object.entries(
      pqrsList.reduce((acc, p) => { acc[p.estado] = (acc[p.estado] || 0) + 1; return acc }, {})
    ).map(([name, value]) => ({ name, value }))

    const pqrsPendientes = pqrsList.filter(p => ['recibido', 'en_proceso'].includes(p.estado)).length

    return (
      <main className="content">
        {saludoBloque}

        <div className="tarjetas">
          <a href="/expedientes" className="tarjeta verde">
            <span className="numero">{expedientes.length}</span>
            <p className="etiqueta">Expedientes</p>
          </a>
          <a href="/pqrs" className="tarjeta amarilla">
            <span className="numero">{pqrsList.length}</span>
            <p className="etiqueta">Total PQRS</p>
          </a>
          <a href="/pqrs" className="tarjeta roja">
            <span className="numero">{pqrsPendientes}</span>
            <p className="etiqueta">PQRS pendientes</p>
          </a>
          <a href="/alertas" className="tarjeta amarilla">
            <span className="numero">{vencimientosCount}</span>
            <p className="etiqueta">Casos urgentes</p>
          </a>
        </div>

        {cargando ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><ProgressSpinner /></div>
        ) : (
          <>
            <h3 className="seccion-dashboard">Expedientes recientes</h3>
            <DataTable value={expedientes} paginator rows={5} emptyMessage="Sin expedientes" tableClassName="p-datatable-sm">
              <Column field="id_expediente" header="Expediente" body={r => `EXP-${String(r.id_expediente).padStart(3,'0')}`} />
              <Column field="tipo" header="Tipo" />
              <Column field="abogado_nombre" header="Abogado" body={r => r.abogado_nombre || <span style={{ color: '#9ca3af' }}>Sin asignar</span>} />
              <Column field="fecha_creacion" header="Creado" body={r => r.fecha_creacion?.split('T')[0]} />
              <Column header="Estado" body={estadoTemplate} />
            </DataTable>

            <h3 className="seccion-dashboard">Estadísticas de PQRS</h3>
            <div className="graficas-grid">
              {pqrsPorTipo.length > 0 && (
                <div className="grafica-card">
                  <h4>PQRS por tipo</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={pqrsPorTipo} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} label>
                        {pqrsPorTipo.map((_, i) => <Cell key={i} fill={COLORES[i % COLORES.length]} />)}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
              {pqrsPorEstado.length > 0 && (
                <div className="grafica-card">
                  <h4>PQRS por estado</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={pqrsPorEstado}>
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {pqrsPorEstado.map((_, i) => <Cell key={i} fill={COLORES[i % COLORES.length]} />)}
                      </Bar>
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

  // ── ADMIN ──────────────────────────────────────────────────
  const rolLabel2 = { admin: 'Administrador', administrador: 'Administrador' }[rol] || rol

  return (
    <main className="content">
      {saludoBloque}

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
          <p className="etiqueta">Casos urgentes</p>
        </a>
        <a href="/alertas" className="tarjeta roja">
          <span className="numero">{pqrsVencidasCount}</span>
          <p className="etiqueta">PQRS vencidas</p>
        </a>
      </div>

      {cargando ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><ProgressSpinner /></div>
      ) : (
        <>
          <h3 className="seccion-dashboard">Expedientes recientes</h3>

          <div className="auditoria-filtros">
            <div className="auditoria-filtro-grupo">
              <label>Abogado</label>
              <input type="text" placeholder="Buscar abogado..."
                value={filtroAbogado} onChange={e => setFiltroAbogado(e.target.value)} />
            </div>
            <div className="auditoria-filtro-grupo">
              <label>Desde</label>
              <input type="date" value={filtroDesde} onChange={e => setFiltroDesde(e.target.value)} />
            </div>
            <div className="auditoria-filtro-grupo">
              <label>Hasta</label>
              <input type="date" value={filtroHasta} onChange={e => setFiltroHasta(e.target.value)} />
            </div>
            <div className="auditoria-filtro-grupo">
              <label>Estado</label>
              <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
                <option value="">Todos</option>
                <option value="urgente">🔴 Urgente</option>
                <option value="proximo">🟡 Próximo</option>
                <option value="atiempo">🟢 A tiempo</option>
                <option value="cerrado">Cerrado</option>
                <option value="archivado">Archivado</option>
              </select>
            </div>
            <button className="btn-auditoria-limpiar"
              onClick={() => { setFiltroAbogado(''); setFiltroDesde(''); setFiltroHasta(''); setFiltroEstado('') }}>
              Limpiar
            </button>
          </div>

          <DataTable
            value={expedientes.filter(e => {
              if (filtroAbogado && !e.abogado_nombre?.toLowerCase().includes(filtroAbogado.toLowerCase())) return false
              if (filtroDesde && e.fecha_creacion?.split('T')[0] < filtroDesde) return false
              if (filtroHasta && e.fecha_creacion?.split('T')[0] > filtroHasta) return false
              if (filtroEstado && calcularEstado(e) !== filtroEstado) return false
              return true
            })}
            paginator rows={5} emptyMessage="No hay expedientes con esos filtros" tableClassName="p-datatable-sm">
            <Column field="id_expediente" header="Expediente" body={r => `EXP-${String(r.id_expediente).padStart(3,'0')}`} />
            <Column field="tipo" header="Tipo" />
            <Column field="abogado_nombre" header="Abogado" />
            <Column field="fecha_creacion" header="Creado" body={r => r.fecha_creacion?.split('T')[0]} />
            <Column header="Estado" body={estadoTemplate} />
          </DataTable>

          <h3 className="seccion-dashboard">Estadísticas generales</h3>
          <div className="graficas-grid">
            {porTipo.length > 0 && (
              <div className="grafica-card">
                <h4>Distribución por tipo de caso</h4>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={porTipo} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                      {porTipo.map((_, i) => <Cell key={i} fill={COLORES[i % COLORES.length]} />)}
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
