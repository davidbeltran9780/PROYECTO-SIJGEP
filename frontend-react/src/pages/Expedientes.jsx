import { useEffect, useState } from 'react'
import api from '../api/axios'

function calcularDias(fecha) {
  if (!fecha) return null
  return Math.ceil((new Date(fecha) - new Date()) / (1000 * 60 * 60 * 24))
}

export default function Expedientes() {
  const [expedientes, setExpedientes] = useState([])
  const [abogados, setAbogados] = useState([])
  const [modal, setModal] = useState(false)
  const rol = localStorage.getItem('rol') || ''
  const puedeCrear = ['admin', 'administrador', 'secretaria'].includes(rol)
  const puedeEliminar = ['admin', 'administrador'].includes(rol)
  const [form, setForm] = useState({
    tipo: 'tutela',
    titulo: '',
    descripcion: '',
    fecha_vencimiento: '',
    id_abogado_asignado: ''
  })

  const cargar = () => {
    api.get('/expedientes').then(res => setExpedientes(res.data)).catch(console.error)
  }

  useEffect(() => {
    cargar()
    if (puedeCrear) {
      api.get('/abogados').then(res => setAbogados(res.data)).catch(console.error)
    }
  }, [])

  const guardar = async (e) => {
    e.preventDefault()
    try {
      // 1. Crear caso con abogado asignado
      const payload = {
        ...form,
        id_abogado_asignado: form.id_abogado_asignado ? parseInt(form.id_abogado_asignado) : null
      }
      const resCaso = await api.post('/casos', payload)
      const idCaso = resCaso.data.id_caso

      // 2. Crear expediente vinculado al caso
      await api.post('/expedientes', { id_caso: idCaso })

      setModal(false)
      setForm({ tipo: 'tutela', titulo: '', descripcion: '', fecha_vencimiento: '', id_abogado_asignado: '' })
      cargar()
    } catch (err) {
      alert(err.response?.data?.detail || 'Error al crear expediente')
    }
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este expediente?')) return
    try {
      await api.delete(`/expedientes/${id}`)
      cargar()
    } catch { alert('Error al eliminar') }
  }

  const estadoClase = (fecha) => {
    const d = calcularDias(fecha)
    if (d === null) return 'atiempo'
    return d <= 2 ? 'urgente' : d <= 5 ? 'proximo' : 'atiempo'
  }

  const estadoTexto = (fecha) => {
    const d = calcularDias(fecha)
    if (d === null) return 'Sin fecha'
    return d <= 2 ? 'Urgente' : d <= 5 ? 'Próximo' : 'A tiempo'
  }

  return (
    <main className="content">
      <div className="top">
        <h2>Gestión de Expedientes</h2>
        {puedeCrear && (
          <button className="nuevo" onClick={() => setModal(true)}>Nuevo Expediente</button>
        )}
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th><th>Tipo</th><th>Título</th><th>Abogado asignado</th>
            <th>Fecha creación</th><th>Estado caso</th>
            {puedeEliminar && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {expedientes.length === 0 ? (
            <tr><td colSpan={puedeEliminar ? 7 : 6}>No hay expedientes registrados</td></tr>
          ) : (
            expedientes.map(e => (
              <tr key={e.id_expediente}>
                <td data-label="ID">{e.id_expediente}</td>
                <td data-label="Tipo">{e.tipo || '—'}</td>
                <td data-label="Título">{e.titulo || '—'}</td>
                <td data-label="Abogado">{e.abogado_nombre || <span style={{ color: '#aaa' }}>Sin asignar</span>}</td>
                <td data-label="Fecha">{e.fecha_creacion?.split('T')[0]}</td>
                <td data-label="Estado">
                  <span className={estadoClase(e.fecha_vencimiento)}>
                    {e.estado_caso || 'activo'}
                  </span>
                </td>
                {puedeEliminar && (
                  <td data-label="Acciones">
                    <button className="btn-accion-eliminar" onClick={() => eliminar(e.id_expediente)}>
                      Eliminar
                    </button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {modal && (
        <div className="modal" style={{ display: 'flex' }} onClick={e => e.target.className === 'modal' && setModal(false)}>
          <div className="modal-contenido">
            <h3>Nuevo Expediente</h3>
            <form onSubmit={guardar} className="form-grid">
              <div className="form-group">
                <label>Tipo de caso</label>
                <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
                  <option value="tutela">Tutela</option>
                  <option value="demanda">Demanda</option>
                  <option value="derecho_peticion">Derecho de petición</option>
                  <option value="pqrs">PQRS</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div className="form-group">
                <label>Título / Demandante</label>
                <input type="text" required value={form.titulo}
                  onChange={e => setForm({ ...form, titulo: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea value={form.descripcion}
                  onChange={e => setForm({ ...form, descripcion: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Fecha vencimiento</label>
                <input type="date" value={form.fecha_vencimiento}
                  onChange={e => setForm({ ...form, fecha_vencimiento: e.target.value })} />
              </div>
              {puedeCrear && (
                <div className="form-group">
                  <label>Abogado asignado</label>
                  <select value={form.id_abogado_asignado}
                    onChange={e => setForm({ ...form, id_abogado_asignado: e.target.value })}>
                    <option value="">Sin asignar</option>
                    {abogados.map(a => (
                      <option key={a.id_usuarios} value={a.id_usuarios}>{a.nombre}</option>
                    ))}
                  </select>
                </div>
              )}
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
