import { useEffect, useState } from 'react'
import api from '../api/axios'

function calcularDias(fecha) {
  return Math.ceil((new Date(fecha) - new Date()) / (1000 * 60 * 60 * 24))
}

export default function Expedientes() {
  const [expedientes, setExpedientes] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ tipo: 'Tutela', demandante: '', fecha: '' })

  useEffect(() => {
    api.get('/expedientes').then(res => setExpedientes(res.data)).catch(console.error)
  }, [])

  const guardar = async (e) => {
    e.preventDefault()
    try {
      await api.post('/expedientes', form)
      setModal(false)
      const res = await api.get('/expedientes')
      setExpedientes(res.data)
    } catch { alert('Error al crear expediente') }
  }

  const estadoClase = (fecha) => {
    const d = calcularDias(fecha)
    return d <= 2 ? 'urgente' : d <= 5 ? 'proximo' : 'atiempo'
  }

  const estadoTexto = (fecha) => {
    const d = calcularDias(fecha)
    return d <= 2 ? 'Urgente' : d <= 5 ? 'Próximo' : 'A tiempo'
  }

  return (
    <main className="content">
      <div className="top">
        <h2>Gestión de Expedientes</h2>
        <button className="nuevo" onClick={() => setModal(true)}>Nuevo Expediente</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Tipo</th><th>Demandante</th><th>Fecha</th>
            <th>Vence</th><th>Estado</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {expedientes.map(e => (
            <tr key={e.id_expediente}>
              <td data-label="Tipo">{e.tipo}</td>
              <td data-label="Demandante">{e.demandante || '—'}</td>
              <td data-label="Fecha">{e.fecha_creacion}</td>
              <td data-label="Vence">{e.fecha_limite ? `${calcularDias(e.fecha_limite)} día(s)` : '—'}</td>
              <td data-label="Estado">
                <span className={estadoClase(e.fecha_limite)}>{estadoTexto(e.fecha_limite)}</span>
              </td>
              <td data-label="Acciones">
                <button className="btn-accion-editar">Editar</button>
                <button className="btn-accion-eliminar">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modal && (
        <div className="modal" style={{ display: 'flex' }} onClick={e => e.target.className === 'modal' && setModal(false)}>
          <div className="modal-contenido">
            <h3>Nuevo Expediente</h3>
            <form onSubmit={guardar} className="form-grid">
              <div className="form-group">
                <label>Tipo</label>
                <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
                  <option>Tutela</option>
                  <option>Demanda</option>
                  <option>PQRS</option>
                </select>
              </div>
              <div className="form-group">
                <label>Demandante</label>
                <input type="text" required value={form.demandante}
                  onChange={e => setForm({ ...form, demandante: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Fecha límite</label>
                <input type="date" required value={form.fecha}
                  onChange={e => setForm({ ...form, fecha: e.target.value })} />
              </div>
              <div className="form-botones">
                <button type="button" className="btn-cancelar" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className="btn-guardar">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}