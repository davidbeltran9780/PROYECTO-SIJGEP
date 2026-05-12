import { useEffect, useState } from 'react'
import api from '../api/axios'

export default function Reportes() {
  const [expedientes, setExpedientes] = useState([])
  const [filtrados, setFiltrados] = useState([])
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [tipo, setTipo] = useState('')

  useEffect(() => {
    api.get('/expedientes').then(res => {
      setExpedientes(res.data)
      setFiltrados(res.data)
    }).catch(console.error)
  }, [])

  const generar = () => {
    let resultado = [...expedientes]
    if (tipo) resultado = resultado.filter(e => e.tipo === tipo)
    if (fechaInicio) resultado = resultado.filter(e => new Date(e.fecha_creacion) >= new Date(fechaInicio))
    if (fechaFin) resultado = resultado.filter(e => new Date(e.fecha_creacion) <= new Date(fechaFin))
    setFiltrados(resultado)
  }

  return (
    <main className="content">
      <div className="contenido">
        <h2>Reportes del Sistema</h2>

        <div className="filtros">
          <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
          <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
          <select value={tipo} onChange={e => setTipo(e.target.value)}>
            <option value="">Tipo de caso</option>
            <option value="Tutela">Tutela</option>
            <option value="Demanda">Demanda</option>
            <option value="PQRS">PQRS</option>
          </select>
          <button className="nuevo" onClick={generar}>Generar Reporte</button>
        </div>

        <div className="tarjetas">
          <div className="tarjeta verde">
            <span className="numero">{filtrados.length}</span>
            <span className="etiqueta">Casos</span>
          </div>
          <div className="tarjeta amarilla">
            <span className="numero">{filtrados.filter(e => {
              const d = Math.ceil((new Date(e.fecha_limite) - new Date()) / (1000 * 60 * 60 * 24))
              return d > 2 && d <= 5
            }).length}</span>
            <span className="etiqueta">Alertas</span>
          </div>
          <div className="tarjeta roja">
            <span className="numero">{filtrados.filter(e => {
              const d = Math.ceil((new Date(e.fecha_limite) - new Date()) / (1000 * 60 * 60 * 24))
              return d <= 2
            }).length}</span>
            <span className="etiqueta">Vencidos</span>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Expediente</th><th>Tipo</th><th>Estado</th><th>Vence</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map(e => (
              <tr key={e.id_expediente}>
                <td>{e.id_expediente}</td>
                <td>{e.tipo}</td>
                <td>{e.estado}</td>
                <td>{e.fecha_limite}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
