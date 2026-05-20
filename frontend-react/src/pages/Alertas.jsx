import { useEffect, useState } from 'react'
import api from '../api/axios'

function calcularDias(fechaVencimiento) {
  if (!fechaVencimiento) return null
  const hoy = new Date()
  const limite = new Date(fechaVencimiento)
  return Math.ceil((limite - hoy) / (1000 * 60 * 60 * 24))
}

function TablaAlertas({ datos, clase, etiqueta }) {
  return (
    <div>
      <h3 className="seccion-alerta">{etiqueta}</h3>
      <table>
        <thead>
          <tr>
            <th>ID Caso</th>
            <th>Tipo</th>
            <th>Título</th>
            <th>Fecha vencimiento</th>
            <th>Días restantes</th>
          </tr>
        </thead>
        <tbody>
          {datos.length === 0 ? (
            <tr><td colSpan={5}>Sin casos en esta categoría</td></tr>
          ) : (
            datos.map((caso) => (
              <tr key={caso.id_caso}>
                <td data-label="ID">{caso.id_caso}</td>
                <td data-label="Tipo">{caso.tipo}</td>
                <td data-label="Título">{caso.titulo || '—'}</td>
                <td data-label="Vencimiento">{caso.fecha_vencimiento}</td>
                <td data-label="Días" className={clase}>
                  {calcularDias(caso.fecha_vencimiento)} día(s)
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default function Alertas() {
  const [urgentes, setUrgentes] = useState([])
  const [proximos, setProximos] = useState([])
  const [atiempo, setAtiempo] = useState([])

  useEffect(() => {
    api.get('/casos').then(res => {
      // Solo casos con fecha de vencimiento y no cerrados
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

      <TablaAlertas datos={urgentes} clase="urgente" etiqueta="🔴 Urgente — menos de 2 días" />
      <TablaAlertas datos={proximos} clase="proximo" etiqueta="🟡 Próximo — entre 2 y 5 días" />
      <TablaAlertas datos={atiempo} clase="atiempo" etiqueta="🟢 A tiempo — más de 5 días" />
    </main>
  )
}
