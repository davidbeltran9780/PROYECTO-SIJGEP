import { useEffect, useState } from 'react'
import api from '../api/axios'

function calcularDias(fechaVencimiento) {
  if (!fechaVencimiento) return null
  const hoy = new Date()
  const limite = new Date(fechaVencimiento)
  return Math.ceil((limite - hoy) / (1000 * 60 * 60 * 24))
}

const COLORES = {
  urgente: { bg: '#fff1f2', border: '#fecdd3', badge: '#dc2626', badgeBg: '#fee2e2', texto: '#991b1b' },
  proximo: { bg: '#fffbeb', border: '#fde68a', badge: '#d97706', badgeBg: '#fef3c7', texto: '#92400e' },
  atiempo: { bg: '#f0fdf4', border: '#bbf7d0', badge: '#16a34a', badgeBg: '#dcfce7', texto: '#166534' },
}

function BadgeDias({ dias, tipo }) {
  const c = COLORES[tipo]
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '700',
      background: c.badgeBg,
      color: c.badge,
      whiteSpace: 'nowrap',
    }}>
      {dias} día{dias !== 1 ? 's' : ''}
    </span>
  )
}

function TablaAlertas({ datos, tipo, icono, etiqueta, rango }) {
  const c = COLORES[tipo]
  return (
    <div style={{
      marginBottom: '32px',
      border: `1px solid ${c.border}`,
      borderRadius: '12px',
      overflow: 'hidden',
    }}>
      {/* Encabezado de sección */}
      <div style={{
        background: c.bg,
        borderBottom: `1px solid ${c.border}`,
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <span style={{ fontSize: '20px', lineHeight: 1 }}>{icono}</span>
        <div>
          <span style={{ fontWeight: '700', fontSize: '14px', color: c.texto }}>{etiqueta}</span>
          <span style={{ marginLeft: '10px', fontSize: '12px', color: c.badge, fontWeight: '500' }}>{rango}</span>
        </div>
        <span style={{
          marginLeft: 'auto',
          background: c.badgeBg,
          color: c.badge,
          border: `1px solid ${c.border}`,
          borderRadius: '20px',
          padding: '2px 12px',
          fontSize: '12px',
          fontWeight: '700',
        }}>
          {datos.length} caso{datos.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Tabla */}
      {datos.length === 0 ? (
        <div style={{
          padding: '24px 20px',
          textAlign: 'center',
          color: '#9ca3af',
          fontSize: '14px',
          background: 'white',
        }}>
          Sin casos en esta categoría
        </div>
      ) : (
        <table style={{ margin: 0, borderRadius: 0 }}>
          <thead>
            <tr>
              <th style={{ width: '90px' }}>Expediente</th>
              <th style={{ width: '130px' }}>Tipo</th>
              <th>Título</th>
              <th style={{ width: '150px' }}>Fecha vencimiento</th>
              <th style={{ width: '130px', textAlign: 'center' }}>Días restantes</th>
            </tr>
          </thead>
          <tbody>
            {datos.map((caso) => (
              <tr key={caso.id_caso}>
                <td data-label="Expediente" style={{ fontFamily: 'monospace', fontWeight: '700', color: '#1e3a8a', fontSize: '12px' }}>
                  EXP-{String(caso.id_caso).padStart(3, '0')}
                </td>
                <td data-label="Tipo" style={{ color: '#374151' }}>
                  {caso.tipo || '—'}
                </td>
                <td data-label="Título" style={{ color: '#111827', fontWeight: '500' }}>
                  {caso.titulo || '—'}
                </td>
                <td data-label="Vencimiento" style={{ color: '#6b7280', fontSize: '13px', whiteSpace: 'nowrap' }}>
                  {caso.fecha_vencimiento
                    ? new Date(caso.fecha_vencimiento).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })
                    : '—'}
                </td>
                <td data-label="Días restantes" style={{ textAlign: 'center' }}>
                  <BadgeDias dias={calcularDias(caso.fecha_vencimiento)} tipo={tipo} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default function Alertas() {
  const [urgentes, setUrgentes] = useState([])
  const [proximos, setProximos] = useState([])
  const [atiempo, setAtiempo] = useState([])

  useEffect(() => {
    api.get('/casos').then(res => {
      const activos = res.data.filter(c =>
        c.fecha_vencimiento && c.estado !== 'cerrado' && c.estado !== 'archivado'
      )
      setUrgentes(activos.filter(c => calcularDias(c.fecha_vencimiento) <= 2))
      setProximos(activos.filter(c => {
        const d = calcularDias(c.fecha_vencimiento)
        return d > 2 && d <= 5
      }))
      setAtiempo(activos.filter(c => calcularDias(c.fecha_vencimiento) > 5))
    }).catch(console.error)
  }, [])

  return (
    <main className="content">
      <div className="top">
        <h2>Alertas de Vencimiento</h2>
      </div>

      <TablaAlertas
        datos={urgentes} tipo="urgente"
        icono="🔴" etiqueta="Urgente"
        rango="Menos de 2 días para vencer"
      />
      <TablaAlertas
        datos={proximos} tipo="proximo"
        icono="🟡" etiqueta="Próximo"
        rango="Entre 2 y 5 días para vencer"
      />
      <TablaAlertas
        datos={atiempo} tipo="atiempo"
        icono="🟢" etiqueta="A tiempo"
        rango="Más de 5 días para vencer"
      />
    </main>
  )
}
