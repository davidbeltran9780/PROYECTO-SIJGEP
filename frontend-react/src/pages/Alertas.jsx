import { useEffect, useState } from 'react'
import api from '../api/axios'

function calcularDias(fechaLimite) {
  const hoy = new Date()
  const limite = new Date(fechaLimite)
  const diff = Math.ceil((limite - hoy) / (1000 * 60 * 60 * 24))
  return diff
}

function TablaAlertas({ datos, clase, etiqueta }) {
  return (
    <div>
      <h3 className="seccion-alerta">{etiqueta}</h3>
      <table>
        <thead>
          <tr>
            <th>Expediente</th>
            <th>Tipo</th>
            <th>Demandante</th>
            <th>Fecha límite</th>
            <th>Días restantes</th>
          </tr>
        </thead>
        <tbody>
          {datos.length === 0 ? (
            <tr><td colSpan={5}>Sin expedientes en esta categoría</td></tr>
          ) : (
            datos.map((exp, i) => (
              <tr key={i}>
                <td data-label="Expediente">{exp.id_expediente}</td>
                <td data-label="Tipo">{exp.tipo}</td>
                <td data-label="Demandante">{exp.demandante || '—'}</td>
                <td data-label="Fecha límite">{exp.fecha_limite}</td>
                <td data-label="Días restantes" className={clase}>
                  {calcularDias(exp.fecha_limite)} día(s)
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
    api.get('/expedientes').then(res => {
      const todos = res.data
      setUrgentes(todos.filter(e => calcularDias(e.fecha_limite) <= 2))
      setProximos(todos.filter(e => calcularDias(e.fecha_limite) > 2 && calcularDias(e.fecha_limite) <= 5))
      setAtiempo(todos.filter(e => calcularDias(e.fecha_limite) > 5))
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