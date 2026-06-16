import { useEffect, useState } from 'react'
import api from '../api/axios'
import { useToast } from '../context/ToastContext'

const ESTADOS = ['recibido', 'en_proceso', 'respondido', 'cerrado']

export default function PQRS() {
  const toast = useToast()
  const [busqueda, setBusqueda] = useState('')
  const [pqrs, setPqrs] = useState([])
  const [modal, setModal] = useState(false)
  const [modalRespuesta, setModalRespuesta] = useState(null)
  const [textoRespuesta, setTextoRespuesta] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [radicadoNuevo, setRadicadoNuevo] = useState('')

  const rol = localStorage.getItem('rol') || ''
  const emailGuardado = localStorage.getItem('email') || ''
  const nombreGuardado = localStorage.getItem('usuario') || ''
  const esCiudadano = rol === 'ciudadano'
  const esAbogado = rol === 'abogado'
  const puedeGestionar = ['admin', 'administrador', 'secretaria'].includes(rol)

  const [form, setForm] = useState({
    nombre_ciudadano: esCiudadano ? nombreGuardado : '',
    correo: esCiudadano ? emailGuardado : '',
    tipo: '',
    descripcion: ''
  })

  const cargar = () => {
    const endpoint = esCiudadano ? '/pqrs/mis-pqrs' : '/pqrs'
    api.get(endpoint).then(res => setPqrs(res.data)).catch(console.error)
  }

  useEffect(() => {
    cargar()
  }, [])

  const guardar = async (e) => {
    e.preventDefault()
    try {
      const res = await api.post('/pqrs', form)
      setModal(false)
      setForm({ nombre_ciudadano: esCiudadano ? nombreGuardado : '', correo: esCiudadano ? emailGuardado : '', tipo: '', descripcion: '' })
      setRadicadoNuevo(res.data.numero_radicado || '')
      cargar()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al crear PQRS')
    }
  }

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      await api.patch(`/pqrs/${id}/estado`, { estado: nuevoEstado })
      cargar()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al cambiar estado')
    }
  }

  const abrirResponder = (p) => {
    setModalRespuesta(p)
    setTextoRespuesta(p.respuesta || '')
  }

  const guardarRespuesta = async () => {
    if (!textoRespuesta.trim()) return toast.info('Escribe una respuesta antes de guardar')
    setGuardando(true)
    try {
      await api.patch(`/pqrs/${modalRespuesta.id_pqrs}/respuesta`, { respuesta: textoRespuesta })
      toast.exito('Respuesta guardada como borrador')
      setModalRespuesta(null)
      cargar()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al guardar respuesta')
    } finally {
      setGuardando(false)
    }
  }

  const enviarRespuestaCorreo = async () => {
    if (!textoRespuesta.trim()) return toast.info('Escribe una respuesta antes de enviar')
    setGuardando(true)
    try {
      await api.post(`/pqrs/${modalRespuesta.id_pqrs}/enviar-respuesta`, { respuesta: textoRespuesta })
      toast.exito(`Respuesta enviada al correo de ${modalRespuesta.nombre_ciudadano}`)
      setModalRespuesta(null)
      cargar()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al enviar la respuesta')
    } finally {
      setGuardando(false)
    }
  }

  const extraerMensaje = (descripcion = '') => {
    const idx = descripcion.indexOf('━━━ DESCRIPCIÓN ━━━')
    if (idx !== -1) return descripcion.slice(idx + '━━━ DESCRIPCIÓN ━━━'.length).trim()
    return descripcion
  }

  const pqrsFiltradas = pqrs.filter(p => {
    const q = busqueda.toLowerCase()
    return (
      (p.numero_radicado || '').toLowerCase().includes(q) ||
      (p.nombre_ciudadano || '').toLowerCase().includes(q) ||
      (p.correo || '').toLowerCase().includes(q) ||
      (p.tipo || '').toLowerCase().includes(q) ||
      (p.estado || '').toLowerCase().includes(q) ||
      (p.descripcion || '').toLowerCase().includes(q)
    )
  })

  return (
    <main className="content">
      {radicadoNuevo && (
        <div style={{
          background: '#f0fdf4', border: '1px solid #86efac',
          borderRadius: '10px', padding: '14px 18px',
          marginBottom: '16px', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px'
        }}>
          <div>
            <p style={{ margin: 0, fontWeight: '700', color: '#166534', fontSize: '14px' }}>
              ✅ PQRS radicada correctamente
            </p>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#166534' }}>
              Número de radicado: <strong style={{ fontFamily: 'monospace' }}>{radicadoNuevo}</strong>
            </p>
          </div>
          <button onClick={() => setRadicadoNuevo('')}
            style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '18px' }}>
            ✕
          </button>
        </div>
      )}

      <div className="top">
        <h2>{esCiudadano ? 'Mis PQRS' : esAbogado ? 'PQRS de mis casos' : 'Lista de PQRS'}</h2>
        {!esAbogado && (
          <button className="nuevo" onClick={() => setModal(true)}>Nuevo PQRS</button>
        )}
      </div>

      <div className="barra-busqueda">
        <input
          type="text"
          placeholder="🔍 Buscar por nombre, correo, tipo o estado..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
        {busqueda && (
          <button onClick={() => setBusqueda('')} title="Limpiar búsqueda">✕</button>
        )}
      </div>

      <table id="tablaPQRS">
        <thead>
          <tr>
            {esCiudadano ? (
              <><th>Radicado</th><th>Tipo</th><th>Descripción</th><th>Estado</th><th>Respuesta</th></>
            ) : (
              <>
                <th>Radicado</th><th>Nombre</th><th>Tipo</th><th>Mensaje</th>
                <th>Estado</th>
                {(puedeGestionar || esAbogado) && <th>Acciones</th>}
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {pqrsFiltradas.length === 0 ? (
            <tr><td colSpan={6}>{busqueda ? 'No se encontraron resultados' : 'No hay PQRS registradas'}</td></tr>
          ) : pqrsFiltradas.map((p) => (
            <tr key={p.id_pqrs || p.numero_radicado}>
              {esCiudadano ? (
                <>
                  <td data-label="Radicado">{p.numero_radicado}</td>
                  <td data-label="Tipo">{p.tipo}</td>
                  <td data-label="Descripción">{extraerMensaje(p.descripcion)}</td>
                  <td data-label="Estado">
                    <span className={`estado ${p.estado}`}>{p.estado}</span>
                  </td>
                  <td data-label="Respuesta">
                    {p.respuesta ? (
                      <div style={{
                        background: '#f0fdf4', border: '1px solid #86efac',
                        borderRadius: '6px', padding: '8px', fontSize: '13px', color: '#166534'
                      }}>
                        {p.respuesta}
                      </div>
                    ) : (
                      <span style={{ color: '#9ca3af', fontSize: '13px' }}>Pendiente de respuesta</span>
                    )}
                  </td>
                </>
              ) : (
                <>
                  <td data-label="Radicado" style={{ fontSize: '11px', color: '#6b7280', whiteSpace: 'nowrap' }}>{p.numero_radicado}</td>
                  <td data-label="Nombre">{p.nombre_ciudadano}</td>
                  <td data-label="Tipo">{p.tipo}</td>
                  <td data-label="Mensaje" style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {extraerMensaje(p.descripcion)}
                  </td>
                  <td data-label="Estado">
                    {puedeGestionar ? (
                      <select value={p.estado}
                        onChange={e => cambiarEstado(p.id_pqrs, e.target.value)}
                        style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                        {ESTADOS.map(est => (
                          <option key={est} value={est}>{est}</option>
                        ))}
                      </select>
                    ) : (
                      <span className={`estado ${p.estado}`}>{p.estado}</span>
                    )}
                  </td>
                  {(puedeGestionar || esAbogado) && (
                    <td data-label="Acciones">
                      <button className="btn-accion-editar"
                        onClick={() => abrirResponder(p)}
                        style={{ fontSize: '12px' }}>
                        {p.respuesta ? '✏️ Ver/Editar' : '💬 Responder'}
                      </button>
                    </td>
                  )}
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal nueva PQRS */}
      {modal && (
        <div className="modal" style={{ display: 'flex' }}
          onClick={e => e.target.className === 'modal' && setModal(false)}>
          <div className="modal-content">
            <h2>Nuevo PQRS</h2>
            <form onSubmit={guardar} className="pqrs-form">
              <input type="text" placeholder="Nombre" required
                value={form.nombre_ciudadano}
                onChange={e => setForm({ ...form, nombre_ciudadano: e.target.value })} />
              <input type="email" placeholder="Correo" required
                value={form.correo}
                onChange={e => setForm({ ...form, correo: e.target.value })} />
              <select required value={form.tipo}
                onChange={e => setForm({ ...form, tipo: e.target.value })}>
                <option value="">Tipo de solicitud</option>
                <option value="peticion">Petición</option>
                <option value="queja">Queja</option>
                <option value="reclamo">Reclamo</option>
                <option value="sugerencia">Sugerencia</option>
              </select>
              <textarea placeholder="Escribe tu mensaje" required
                value={form.descripcion}
                onChange={e => setForm({ ...form, descripcion: e.target.value })} />
              <div className="form-actions">
                <button type="submit" className="btn-guardar">Guardar</button>
                <button type="button" className="btn-cancelar" onClick={() => setModal(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal respuesta */}
      {modalRespuesta && (
        <div className="modal" style={{ display: 'flex' }}
          onClick={e => e.target.className === 'modal' && setModalRespuesta(null)}>
          <div className="modal-contenido" style={{ maxWidth: '560px', width: '100%' }}>
            <h3>💬 Responder PQRS</h3>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '6px 0' }}>
              <strong>Radicado:</strong> {modalRespuesta.numero_radicado} &nbsp;|&nbsp;
              <strong>Ciudadano:</strong> {modalRespuesta.nombre_ciudadano}
            </p>
            <p style={{ fontSize: '13px', color: '#374151', background: '#f9fafb', padding: '8px', borderRadius: '6px', marginBottom: '12px' }}>
              <strong>Solicitud:</strong> {modalRespuesta.descripcion}
            </p>
            <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Respuesta oficial:</label>
            <textarea
              value={textoRespuesta}
              onChange={e => setTextoRespuesta(e.target.value)}
              placeholder="Escribe la respuesta oficial aquí..."
              rows={7}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', fontSize: '13px', resize: 'vertical', marginTop: '6px' }}
            />
            <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px', marginBottom: '4px' }}>
              📧 El ciudadano recibirá la respuesta en: <strong>{modalRespuesta.correo}</strong>
            </p>
            <div className="form-botones" style={{ marginTop: '8px', flexWrap: 'wrap', gap: '8px' }}>
              <button className="btn-cancelar" onClick={() => setModalRespuesta(null)}>
                Cancelar
              </button>
              <button className="btn-accion-editar" onClick={guardarRespuesta}
                disabled={guardando || !textoRespuesta.trim()}
                style={{ fontSize: '13px' }}>
                {guardando ? 'Guardando...' : '💾 Guardar borrador'}
              </button>
              <button className="btn-guardar" onClick={enviarRespuestaCorreo}
                disabled={guardando || !textoRespuesta.trim()}>
                {guardando ? 'Enviando...' : '📧 Enviar respuesta al ciudadano'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
