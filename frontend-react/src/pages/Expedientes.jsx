import { useEffect, useState } from 'react'
import api from '../api/axios'
import { useToast } from '../context/ToastContext'
import { useConfirm } from '../components/ConfirmModal'

function calcularDias(fecha) {
  if (!fecha) return null
  return Math.ceil((new Date(fecha) - new Date()) / (1000 * 60 * 60 * 24))
}

export default function Expedientes() {
  const toast = useToast()
  const { confirmar, ConfirmUI } = useConfirm()
  const [expedientes, setExpedientes] = useState([])
  const [abogados, setAbogados] = useState([])
  const [modal, setModal] = useState(false)
  const [busqueda, setBusqueda] = useState('')
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
      api.get('/abogados')
        .then(res => setAbogados(res.data))
        .catch(err => {
          console.error('Error cargando abogados:', err)
          const detalle = err.response?.data?.detail || err.message || 'Error desconocido'
          console.warn('Detalle error /abogados:', detalle)
        })
    }
  }, [])

  const guardar = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...form,
        id_abogado_asignado: form.id_abogado_asignado ? parseInt(form.id_abogado_asignado) : null
      }
      const resCaso = await api.post('/casos', payload)
      const idCaso = resCaso.data.id_caso
      await api.post('/expedientes', { id_caso: idCaso })
      setModal(false)
      setForm({ tipo: 'tutela', titulo: '', descripcion: '', fecha_vencimiento: '', id_abogado_asignado: '' })
      cargar()
      toast.exito('Expediente creado correctamente')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al crear expediente')
    }
  }

  const asignarAbogado = async (idCaso, idAbogado) => {
    try {
      await api.put(`/casos/${idCaso}`, {
        id_abogado_asignado: idAbogado ? parseInt(idAbogado) : null
      })
      cargar()
      toast.exito('Abogado asignado correctamente')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al asignar abogado')
    }
  }

  const eliminar = async (id) => {
    const ok = await confirmar('¿Eliminar este expediente?', 'Esta acción no se puede deshacer.')
    if (!ok) return
    try {
      await api.delete(`/expedientes/${id}`)
      cargar()
      toast.exito('Expediente eliminado')
    } catch {
      toast.error('Error al eliminar')
    }
  }

  const estadoClase = (estado) => {
    switch (estado) {
      case 'activo':     return 'atiempo'
      case 'en_proceso': return 'proximo'
      case 'cerrado':    return 'urgente'
      case 'archivado':  return 'archivado'
      default:           return 'atiempo'
    }
  }

  const cambiarEstadoCaso = async (idCaso, nuevoEstado) => {
    try {
      await api.patch(`/casos/${idCaso}/estado`, { estado: nuevoEstado })
      cargar()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al cambiar estado')
    }
  }

  const cerrarCaso = async (idCaso) => {
    const ok = await confirmar('¿Cerrar este caso?', 'El caso pasará a estado cerrado.')
    if (!ok) return
    cambiarEstadoCaso(idCaso, 'cerrado')
  }

  const reactivarCaso = async (idCaso) => {
    const ok = await confirmar('¿Reactivar este caso?', 'El caso volverá a estado activo.')
    if (!ok) return
    cambiarEstadoCaso(idCaso, 'activo')
  }

  const expedientesFiltrados = expedientes.filter(e => {
    const q = busqueda.toLowerCase()
    return (
      String(e.id_expediente).includes(q) ||
      (e.titulo || '').toLowerCase().includes(q) ||
      (e.tipo || '').toLowerCase().includes(q) ||
      (e.abogado_nombre || '').toLowerCase().includes(q) ||
      (e.estado_caso || '').toLowerCase().includes(q)
    )
  })

  return (
    <main className="content">
      {ConfirmUI}
      <div className="top">
        <h2>Gestión de Expedientes</h2>
        {puedeCrear && (
          <button className="nuevo" onClick={() => setModal(true)}>Nuevo Expediente</button>
        )}
      </div>

      <div className="barra-busqueda">
        <input
          type="text"
          placeholder="🔍 Buscar por título, tipo, abogado o estado..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
        {busqueda && (
          <button onClick={() => setBusqueda('')} title="Limpiar búsqueda">✕</button>
        )}
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th><th>Tipo</th><th>Título</th><th>Abogado asignado</th>
            <th>Fecha creación</th><th>Estado</th>
            {puedeCrear && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {expedientesFiltrados.length === 0 ? (
            <tr><td colSpan={puedeCrear ? 7 : 6}>{busqueda ? 'No se encontraron resultados' : 'No hay expedientes registrados'}</td></tr>
          ) : (
            expedientesFiltrados.map(e => (
              <tr key={e.id_expediente}>
                <td data-label="ID">{e.id_expediente}</td>
                <td data-label="Tipo">{e.tipo || '—'}</td>
                <td data-label="Título">{e.titulo || '—'}</td>
                <td data-label="Abogado">
                  {puedeCrear ? (
                    <select
                      value={e.id_abogado_asignado || ''}
                      onChange={ev => asignarAbogado(e.id_caso, ev.target.value)}
                      style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', minWidth: '130px' }}
                    >
                      <option value="">Sin asignar</option>
                      {abogados.map(a => (
                        <option key={a.id_usuarios} value={a.id_usuarios}>{a.nombre}</option>
                      ))}
                    </select>
                  ) : (
                    e.abogado_nombre || <span style={{ color: '#aaa' }}>Sin asignar</span>
                  )}
                </td>
                <td data-label="Fecha">{e.fecha_creacion?.split('T')[0]}</td>
                <td data-label="Estado">
                  <span className={estadoClase(e.estado_caso)}>
                    {e.estado_caso || 'activo'}
                  </span>
                </td>
                {puedeCrear && (
                  <td data-label="Acciones" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {e.estado_caso !== 'cerrado' && e.estado_caso !== 'archivado' ? (
                      <button
                        onClick={() => cerrarCaso(e.id_caso)}
                        style={{
                          fontSize: '11px', padding: '4px 10px', borderRadius: '4px',
                          border: '1px solid #9ca3af', background: '#f3f4f6',
                          color: '#111827', cursor: 'pointer', fontFamily: 'inherit',
                          fontWeight: '600'
                        }}
                      >
                        Cerrar caso
                      </button>
                    ) : (
                      <button
                        className="btn-accion-activar"
                        onClick={() => reactivarCaso(e.id_caso)}
                        style={{ fontSize: '11px' }}
                      >
                        Reactivar
                      </button>
                    )}
                    {puedeEliminar && (
                      <button className="btn-accion-eliminar" onClick={() => eliminar(e.id_expediente)}
                        style={{ fontSize: '11px' }}>
                        Eliminar
                      </button>
                    )}
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
                <label htmlFor="exp-tipo">Tipo de caso</label>
                <select id="exp-tipo" value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
                  <option value="tutela">Tutela</option>
                  <option value="demanda">Demanda</option>
                  <option value="derecho_peticion">Derecho de petición</option>
                  <option value="pqrs">PQRS</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="exp-titulo">Título / Demandante</label>
                <input id="exp-titulo" type="text" required value={form.titulo}
                  onChange={e => setForm({ ...form, titulo: e.target.value })} />
              </div>
              <div className="form-group">
                <label htmlFor="exp-descripcion">Descripción</label>
                <textarea id="exp-descripcion" value={form.descripcion}
                  onChange={e => setForm({ ...form, descripcion: e.target.value })} />
              </div>
              <div className="form-group">
                <label htmlFor="exp-vencimiento">Fecha vencimiento</label>
                <input id="exp-vencimiento" type="date" value={form.fecha_vencimiento}
                  onChange={e => setForm({ ...form, fecha_vencimiento: e.target.value })} />
              </div>
              {puedeCrear && (
                <div className="form-group">
                  <label htmlFor="exp-abogado">Abogado asignado</label>
                  <select id="exp-abogado" value={form.id_abogado_asignado}
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
