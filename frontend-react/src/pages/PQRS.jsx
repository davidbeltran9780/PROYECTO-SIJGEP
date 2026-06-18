import { useEffect, useState } from 'react'
import api from '../api/axios'
import { useToast } from '../context/ToastContext'
import { useConfirm } from '../components/ConfirmModal'

const ESTADOS = ['recibido', 'en_proceso', 'respondido', 'cerrado']
const FILAS_POR_PAGINA = 10

function Paginacion({ total, pagina, setPagina, filasPorPagina }) {
  const totalPaginas = Math.ceil(total / filasPorPagina)
  if (totalPaginas <= 1) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 4px', fontSize: '13px', color: '#6b7280' }}>
      <span>Mostrando {Math.min((pagina - 1) * filasPorPagina + 1, total)}–{Math.min(pagina * filasPorPagina, total)} de {total}</span>
      <div style={{ display: 'flex', gap: '4px' }}>
        <button onClick={() => setPagina(1)} disabled={pagina === 1} style={btnPag(pagina === 1)}>«</button>
        <button onClick={() => setPagina(p => p - 1)} disabled={pagina === 1} style={btnPag(pagina === 1)}>‹</button>
        {Array.from({ length: totalPaginas }, (_, i) => i + 1)
          .filter(p => p === 1 || p === totalPaginas || Math.abs(p - pagina) <= 1)
          .reduce((acc, p, i, arr) => {
            if (i > 0 && p - arr[i - 1] > 1) acc.push('...')
            acc.push(p)
            return acc
          }, [])
          .map((p, i) => p === '...'
            ? <span key={`e${i}`} style={{ padding: '0 6px' }}>…</span>
            : <button key={p} onClick={() => setPagina(p)} style={btnPag(false, p === pagina)}>{p}</button>
          )}
        <button onClick={() => setPagina(p => p + 1)} disabled={pagina === totalPaginas} style={btnPag(pagina === totalPaginas)}>›</button>
        <button onClick={() => setPagina(totalPaginas)} disabled={pagina === totalPaginas} style={btnPag(pagina === totalPaginas)}>»</button>
      </div>
    </div>
  )
}

function btnPag(disabled, activo = false) {
  return {
    padding: '4px 10px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '13px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    background: activo ? '#1e3a8a' : disabled ? '#f9fafb' : 'white',
    color: activo ? 'white' : disabled ? '#d1d5db' : '#374151',
    fontWeight: activo ? '700' : '400',
  }
}

export default function PQRS() {
  const toast = useToast()
  const { confirmar, ConfirmUI } = useConfirm()
  const [busqueda, setBusqueda] = useState('')
  const [filtroDesde, setFiltroDesde] = useState('')
  const [filtroHasta, setFiltroHasta] = useState('')
  const [pagina, setPagina] = useState(1)
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
    if (guardando) return
    setGuardando(true)
    try {
      const res = await api.post('/pqrs', form)
      setModal(false)
      setForm({ nombre_ciudadano: esCiudadano ? nombreGuardado : '', correo: esCiudadano ? emailGuardado : '', tipo: '', descripcion: '' })
      setRadicadoNuevo(res.data.numero_radicado || '')
      cargar()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al crear PQRS')
    } finally {
      setGuardando(false)
    }
  }

  const cambiarEstado = async (id, nuevoEstado) => {
    const ok = await confirmar(
      `¿Cambiar estado a "${nuevoEstado}"?`,
      'Esta acción cambiará el estado de la PQRS.'
    )
    if (!ok) return
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

  const enviarRespuestaCorreo = async (p) => {
    if (!p.respuesta?.trim()) return toast.info('Guarda un borrador de respuesta primero')
    setGuardando(true)
    try {
      await api.post(`/pqrs/${p.id_pqrs}/enviar-respuesta`, { respuesta: p.respuesta })
      toast.exito(`Respuesta enviada al correo de ${p.nombre_ciudadano}`)
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
    const coincideTexto = (
      (p.numero_radicado || '').toLowerCase().includes(q) ||
      (p.nombre_ciudadano || '').toLowerCase().includes(q) ||
      (p.correo || '').toLowerCase().includes(q) ||
      (p.tipo || '').toLowerCase().includes(q) ||
      (p.estado || '').toLowerCase().includes(q) ||
      (p.descripcion || '').toLowerCase().includes(q)
    )
    if (!coincideTexto) return false
    if (filtroDesde && p.fecha_creacion && p.fecha_creacion.split('T')[0] < filtroDesde) return false
    if (filtroHasta && p.fecha_creacion && p.fecha_creacion.split('T')[0] > filtroHasta) return false
    return true
  })

  const pqrsPagina = pqrsFiltradas.slice((pagina - 1) * FILAS_POR_PAGINA, pagina * FILAS_POR_PAGINA)

  return (
    <main className="content">
      {ConfirmUI}
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

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px', alignItems: 'center' }}>
        <div className="barra-busqueda" style={{ flex: 1, minWidth: '220px', marginBottom: 0 }}>
          <input
            type="text"
            placeholder="🔍 Buscar por nombre, correo, tipo o estado..."
            value={busqueda}
            onChange={e => { setBusqueda(e.target.value); setPagina(1) }}
          />
          {busqueda && <button onClick={() => setBusqueda('')} title="Limpiar búsqueda">✕</button>}
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontSize: '12px', color: '#6b7280', whiteSpace: 'nowrap' }}>Desde</label>
          <input type="date" value={filtroDesde}
            onChange={e => { setFiltroDesde(e.target.value); setPagina(1) }}
            style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px' }} />
          <label style={{ fontSize: '12px', color: '#6b7280', whiteSpace: 'nowrap' }}>Hasta</label>
          <input type="date" value={filtroHasta}
            onChange={e => { setFiltroHasta(e.target.value); setPagina(1) }}
            style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px' }} />
          {(filtroDesde || filtroHasta) && (
            <button onClick={() => { setFiltroDesde(''); setFiltroHasta(''); setPagina(1) }}
              style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#f9fafb', fontSize: '12px', cursor: 'pointer' }}>
              ✕ Limpiar fechas
            </button>
          )}
        </div>
      </div>

      <table id="tablaPQRS">
        <thead>
          <tr>
            {esCiudadano ? (
              <><th>Radicado</th><th>Tipo</th><th>Descripción</th><th>Estado</th><th>Respuesta</th></>
            ) : (
              <>
                <th>Radicado</th><th>Nombre</th><th>Tipo</th><th>Mensaje</th>
                <th>Creación</th><th>Vencimiento</th>
                <th>Estado</th>
                {(puedeGestionar || esAbogado) && <th>Acciones</th>}
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {pqrsFiltradas.length === 0 ? (
            <tr><td colSpan={6}>{busqueda ? 'No se encontraron resultados' : 'No hay PQRS registradas'}</td></tr>
          ) : pqrsPagina.map((p) => (
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
                  <td data-label="Mensaje" style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {extraerMensaje(p.descripcion)}
                  </td>
                  <td data-label="Creación" style={{ fontSize: '12px', whiteSpace: 'nowrap', color: '#374151' }}>
                    {p.fecha_creacion ? p.fecha_creacion.split('T')[0] : '—'}
                  </td>
                  <td data-label="Vencimiento" style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>
                    {p.fecha_vencimiento ? (
                      <span style={{ color: new Date(p.fecha_vencimiento) < new Date() ? '#dc2626' : '#374151', fontWeight: new Date(p.fecha_vencimiento) < new Date() ? '700' : '400' }}>
                        {p.fecha_vencimiento.split('T')[0]}
                      </span>
                    ) : '—'}
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
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                        <button
                          onClick={() => abrirResponder(p)}
                          style={{
                            width: '100px', fontSize: '11px', fontWeight: '600', padding: '4px 0',
                            borderRadius: '6px', border: '1px solid #3b82f6',
                            background: 'white', color: '#1e40af', cursor: 'pointer', lineHeight: 1.4,
                          }}>
                          {p.respuesta ? '✏️ Editar' : '💬 Responder'}
                        </button>
                        <button
                          onClick={() => enviarRespuestaCorreo(p)}
                          disabled={guardando || !p.respuesta?.trim() || ['respondido', 'cerrado'].includes(p.estado)}
                          title={!p.respuesta?.trim() ? 'Guarda un borrador primero' : p.estado === 'respondido' ? 'Ya fue enviada' : 'Enviar al ciudadano'}
                          style={{
                            width: '100px', fontSize: '11px', fontWeight: '600', padding: '4px 0',
                            borderRadius: '6px',
                            border: (p.respuesta?.trim() && !['respondido', 'cerrado'].includes(p.estado)) ? '1px solid #1e3a8a' : '1px solid #d1d5db',
                            background: (p.respuesta?.trim() && !['respondido', 'cerrado'].includes(p.estado)) ? '#1e3a8a' : 'white',
                            color: (p.respuesta?.trim() && !['respondido', 'cerrado'].includes(p.estado)) ? 'white' : '#9ca3af',
                            cursor: (p.respuesta?.trim() && !['respondido', 'cerrado'].includes(p.estado)) ? 'pointer' : 'not-allowed',
                            lineHeight: 1.4,
                          }}>
                          📧 Enviar
                        </button>
                      </div>
                    </td>
                  )}
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <Paginacion total={pqrsFiltradas.length} pagina={pagina} setPagina={setPagina} filasPorPagina={FILAS_POR_PAGINA} />

      {/* Modal nueva PQRS */}
      {modal && (
        <div className="modal" style={{ display: 'flex' }}
          onClick={e => !guardando && e.target.className === 'modal' && setModal(false)}>
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
                <button type="submit" className="btn-guardar" disabled={guardando}>
                  {guardando ? 'Guardando...' : 'Guardar'}
                </button>
                <button type="button" className="btn-cancelar" disabled={guardando} onClick={() => setModal(false)}>Cancelar</button>
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
              📧 La respuesta se enviará al correo: <strong>{modalRespuesta.correo}</strong>
            </p>
            <div className="form-botones" style={{ marginTop: '8px', gap: '8px' }}>
              <button className="btn-cancelar" onClick={() => setModalRespuesta(null)}>
                Cancelar
              </button>
              <button className="btn-guardar" onClick={guardarRespuesta}
                disabled={guardando || !textoRespuesta.trim()}>
                {guardando ? 'Guardando...' : '💾 Guardar borrador'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
