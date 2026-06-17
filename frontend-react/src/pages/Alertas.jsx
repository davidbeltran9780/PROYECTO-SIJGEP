import { useEffect, useState } from 'react'
import api from '../api/axios'

function calcularDias(fecha) {
  if (!fecha) return null
  return Math.ceil((new Date(fecha) - new Date()) / (1000 * 60 * 60 * 24))
}

const COLORES = {
  urgente: { bg: '#fff1f2', border: '#fecdd3', badge: '#991b1b', badgeBg: '#fee2e2', texto: '#991b1b' },
  proximo: { bg: '#fffbeb', border: '#fde68a', badge: '#92400e', badgeBg: '#fef3c7', texto: '#92400e' },
  atiempo: { bg: '#f0fdf4', border: '#bbf7d0', badge: '#166534', badgeBg: '#dcfce7', texto: '#166534' },
  vencido: { bg: '#fef2f2', border: '#fca5a5', badge: '#7f1d1d', badgeBg: '#fee2e2', texto: '#7f1d1d' },
}

function BadgeTipo({ tipo }) {
  const esPQRS = tipo === 'pqrs'
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: '10px',
      fontSize: '10px', fontWeight: '700', textTransform: 'uppercase',
      background: esPQRS ? '#ede9fe' : '#dbeafe',
      color: esPQRS ? '#6d28d9' : '#1e40af',
    }}>
      {esPQRS ? 'PQRS' : 'Caso'}
    </span>
  )
}

function TablaAlertas({ datos, categoria, icono, etiqueta, rango }) {
  const c = COLORES[categoria]
  return (
    <div style={{ marginBottom: '28px', border: `1px solid ${c.border}`, borderRadius: '12px', overflow: 'hidden' }}>
      <div style={{
        background: c.bg, borderBottom: `1px solid ${c.border}`,
        padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        <span style={{ fontSize: '20px', lineHeight: 1 }}>{icono}</span>
        <div>
          <span style={{ fontWeight: '700', fontSize: '14px', color: c.texto }}>{etiqueta}</span>
          <span style={{ marginLeft: '10px', fontSize: '12px', color: c.badge, fontWeight: '500' }}>{rango}</span>
        </div>
        <span style={{
          marginLeft: 'auto', background: c.badgeBg, color: c.badge,
          border: `1px solid ${c.border}`, borderRadius: '20px',
          padding: '2px 12px', fontSize: '12px', fontWeight: '700',
        }}>
          {datos.length} {datos.length === 1 ? 'registro' : 'registros'}
        </span>
      </div>

      {datos.length === 0 ? (
        <div style={{ padding: '24px 20px', textAlign: 'center', color: '#9ca3af', fontSize: '14px', background: 'white' }}>
          Sin registros en esta categoría
        </div>
      ) : (
        <table style={{ margin: 0, borderRadius: 0 }}>
          <thead>
            <tr>
              <th style={{ width: '70px' }}>Tipo</th>
              <th style={{ width: '140px' }}>Referencia</th>
              <th style={{ width: '120px' }}>Categoría</th>
              <th>Descripción</th>
              <th style={{ width: '150px' }}>Fecha límite</th>
              <th style={{ width: '130px', textAlign: 'center' }}>Días restantes</th>
            </tr>
          </thead>
          <tbody>
            {datos.map((item, i) => {
              const oscuro = categoria === 'vencido'
              return (
              <tr key={i}>
                <td><BadgeTipo tipo={item._tipo} /></td>
                <td style={{ fontFamily: 'monospace', fontWeight: '700', color: '#1e3a8a', fontSize: '12px' }}>
                  {item._ref}
                </td>
                <td style={{ color: '#374151', fontSize: '13px' }}>{item._categoria}</td>
                <td style={{ color: '#111827', fontWeight: '500' }}>{item._desc}</td>
                <td style={{ color: '#6b7280', fontSize: '13px', whiteSpace: 'nowrap' }}>
                  {item._limite
                    ? new Date(item._limite).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })
                    : '—'}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span style={{
                    display: 'inline-block', padding: '3px 10px', borderRadius: '12px',
                    fontSize: '12px', fontWeight: '700', background: c.badgeBg, color: c.badge,
                  }}>
                    {item._dias < 0
                      ? `Vencido hace ${Math.abs(item._dias)}d`
                      : item._dias === 0 ? 'Vence hoy'
                      : `${item._dias}d`}
                  </span>
                </td>
              </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default function Alertas() {
  const [casos, setCasos] = useState([])
  const [pqrsAlertas, setPqrsAlertas] = useState([])

  const rol = localStorage.getItem('rol') || ''
  const esInterno = ['admin', 'administrador', 'secretaria'].includes(rol)

  useEffect(() => {
    api.get('/casos').then(res => {
      setCasos(res.data.filter(c =>
        c.fecha_vencimiento && !['cerrado', 'archivado'].includes(c.estado)
      ))
    }).catch(console.error)

    if (esInterno) {
      api.get('/reportes/pqrs-alertas').then(res => setPqrsAlertas(res.data)).catch(console.error)
    }
  }, [])

  // Normalizar casos a formato común
  const itemsCasos = casos.map(c => ({
    _tipo: 'caso',
    _ref: `EXP-${String(c.id_caso).padStart(3, '0')}`,
    _categoria: c.tipo || '—',
    _desc: c.titulo || '—',
    _limite: c.fecha_vencimiento,
    _dias: calcularDias(c.fecha_vencimiento),
  }))

  // Normalizar PQRS a formato común
  const itemsPQRS = pqrsAlertas.map(p => ({
    _tipo: 'pqrs',
    _ref: p.numero_radicado,
    _categoria: p.tipo || '—',
    _desc: p.nombre_ciudadano || 'Anónimo',
    _limite: p.fecha_limite,
    _dias: p.dias_restantes,
  }))

  const todos = [...itemsCasos, ...itemsPQRS]

  const vencidos = todos.filter(i => i._dias < 0).sort((a, b) => a._dias - b._dias)
  const urgentes = todos.filter(i => i._dias >= 0 && i._dias <= 2).sort((a, b) => a._dias - b._dias)
  const proximos = todos.filter(i => i._dias > 2 && i._dias <= 5).sort((a, b) => a._dias - b._dias)
  const atiempo  = todos.filter(i => i._dias > 5).sort((a, b) => a._dias - b._dias)

  return (
    <main className="content">
      <div className="top">
        <h2>Alertas de Vencimiento</h2>
      </div>

      <TablaAlertas datos={urgentes} categoria="urgente" icono="🔴" etiqueta="Urgente"   rango="Menos de 2 días para vencer" />
      <TablaAlertas datos={proximos} categoria="proximo" icono="🟡" etiqueta="Próximo"   rango="Entre 2 y 5 días para vencer" />
      <TablaAlertas datos={atiempo}  categoria="atiempo" icono="🟢" etiqueta="A tiempo"  rango="Más de 5 días para vencer" />
      <TablaAlertas datos={vencidos} categoria="vencido" icono="🔺" etiqueta="Vencidos"  rango="Ya superaron el plazo" />
    </main>
  )
}
