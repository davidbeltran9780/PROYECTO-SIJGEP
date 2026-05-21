import { useEffect, useState } from 'react'
import api from '../api/axios'
import { jsPDF } from 'jspdf'

const ESTADOS = ['recibido', 'en_proceso', 'respondido', 'cerrado']

export default function PQRS() {
  const [pqrs, setPqrs] = useState([])
  const [casos, setCasos] = useState([])
  const [modal, setModal] = useState(false)
  const [modalRespuesta, setModalRespuesta] = useState(null) // pqrs seleccionada para responder
  const [textoRespuesta, setTextoRespuesta] = useState('')
  const [guardando, setGuardando] = useState(false)
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
    if (puedeGestionar) {
      api.get('/casos').then(res => setCasos(res.data)).catch(console.error)
    }
  }, [])

  const guardar = async (e) => {
    e.preventDefault()
    try {
      await api.post('/pqrs', form)
      setModal(false)
      setForm({ nombre_ciudadano: '', correo: '', tipo: '', descripcion: '' })
      cargar()
    } catch { alert('Error al crear PQRS') }
  }

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      await api.patch(`/pqrs/${id}/estado`, { estado: nuevoEstado })
      cargar()
    } catch (err) {
      alert(err.response?.data?.detail || 'Error al cambiar estado')
    }
  }

  const asignarCaso = async (id, idCaso) => {
    try {
      await api.put(`/pqrs/${id}/caso`, { id_caso: idCaso ? parseInt(idCaso) : null })
      cargar()
    } catch (err) {
      alert(err.response?.data?.detail || 'Error al asignar caso')
    }
  }

  // Abrir modal de respuesta
  const abrirResponder = (p) => {
    setModalRespuesta(p)
    setTextoRespuesta(p.respuesta || '')
  }

  // Guardar respuesta en BD
  const guardarRespuesta = async () => {
    if (!textoRespuesta.trim()) return alert('Escribe una respuesta antes de guardar')
    setGuardando(true)
    try {
      await api.patch(`/pqrs/${modalRespuesta.id_pqrs}/respuesta`, { respuesta: textoRespuesta })
      // Cambiar estado a respondido automáticamente
      await api.patch(`/pqrs/${modalRespuesta.id_pqrs}/estado`, { estado: 'respondido' })
      alert('✅ Respuesta guardada y estado cambiado a "respondido"')
      setModalRespuesta(null)
      cargar()
    } catch (err) {
      alert(err.response?.data?.detail || 'Error al guardar respuesta')
    } finally {
      setGuardando(false)
    }
  }

  // Descargar respuesta como PDF
  const descargarRespuestaPDF = (p) => {
    const texto = p.respuesta || textoRespuesta
    if (!texto) return alert('No hay respuesta para descargar')

    const doc = new jsPDF()
    const margen = 15
    const anchoUtil = doc.internal.pageSize.getWidth() - margen * 2

    // Encabezado
    doc.setFillColor(30, 58, 138)
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 30, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(15)
    doc.setFont('helvetica', 'bold')
    doc.text('SIGJEP — Respuesta Oficial', margen, 20)

    // Metadata
    doc.setTextColor(50, 50, 50)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Radicado: ${p.numero_radicado || modalRespuesta?.numero_radicado || ''}`, margen, 40)
    doc.text(`Ciudadano: ${p.nombre_ciudadano || modalRespuesta?.nombre_ciudadano || ''}`, margen, 47)
    doc.text(`Tipo: ${p.tipo || modalRespuesta?.tipo || ''}`, margen, 54)
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-CO')}`, margen, 61)

    doc.setDrawColor(30, 58, 138)
    doc.setLineWidth(0.5)
    doc.line(margen, 66, doc.internal.pageSize.getWidth() - margen, 66)

    doc.setFontSize(11)
    doc.setTextColor(20, 20, 20)
    const lineas = doc.splitTextToSize(texto, anchoUtil)
    doc.text(lineas, margen, 75)

    doc.save(`respuesta_${p.numero_radicado || modalRespuesta?.numero_radicado || 'pqrs'}.pdf`)
  }

  // Subir respuesta al expediente vinculado
  const subirRespuestaExpediente = async (p) => {
    const texto = p.respuesta
    if (!texto) return alert('No hay respuesta guardada para subir')

    const idExpediente = p.id_expediente || p.id_caso
    if (!idExpediente) return alert('Esta PQRS no tiene un caso/expediente vinculado')

    // Generar PDF en memoria y subirlo
    const doc = new jsPDF()
    const margen = 15
    const anchoUtil = doc.internal.pageSize.getWidth() - margen * 2

    doc.setFillColor(30, 58, 138)
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 30, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(15)
    doc.setFont('helvetica', 'bold')
    doc.text('SIGJEP — Respuesta Oficial', margen, 20)
    doc.setTextColor(50, 50, 50)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Radicado: ${p.numero_radicado}`, margen, 40)
    doc.text(`Ciudadano: ${p.nombre_ciudadano}`, margen, 47)
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-CO')}`, margen, 54)
    doc.setDrawColor(30, 58, 138)
    doc.setLineWidth(0.5)
    doc.line(margen, 59, doc.internal.pageSize.getWidth() - margen, 59)
    doc.setFontSize(11)
    doc.setTextColor(20, 20, 20)
    const lineas = doc.splitTextToSize(texto, anchoUtil)
    doc.text(lineas, margen, 68)

    const blob = doc.output('blob')
    const nombreArchivo = `respuesta_${p.numero_radicado}.pdf`
    const archivo = new File([blob], nombreArchivo, { type: 'application/pdf' })

    const formData = new FormData()
    formData.append('archivo', archivo)

    try {
      // Buscar el expediente vinculado al caso de esta PQRS
      const exps = await api.get('/expedientes')
      const exp = exps.data.find(e => e.id_caso === p.id_caso)
      if (!exp) return alert('No se encontró expediente vinculado a esta PQRS')

      await api.post(`/documentos/subir?id_expediente=${exp.id_expediente}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      alert(`✅ Respuesta subida al expediente #${exp.id_expediente}`)
    } catch (err) {
      alert(err.response?.data?.detail || 'Error al subir la respuesta')
    }
  }

  return (
    <main className="content">
      <div className="top">
        <h2>{esCiudadano ? 'Mis PQRS' : esAbogado ? 'PQRS de mis casos' : 'Lista de PQRS'}</h2>
        {!esAbogado && (
          <button className="nuevo" onClick={() => setModal(true)}>Nuevo PQRS</button>
        )}
      </div>

      <table id="tablaPQRS">
        <thead>
          <tr>
            {esCiudadano ? (
              <><th>Radicado</th><th>Tipo</th><th>Descripción</th><th>Estado</th><th>Respuesta</th></>
            ) : (
              <>
                <th>Nombre</th><th>Correo</th><th>Tipo</th><th>Mensaje</th>
                <th>Estado</th>
                {puedeGestionar && <th>Asignar caso</th>}
                <th>Acciones</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {pqrs.length === 0 ? (
            <tr><td colSpan={7}>No hay PQRS registradas</td></tr>
          ) : pqrs.map((p) => (
            <tr key={p.id_pqrs || p.numero_radicado}>
              {esCiudadano ? (
                <>
                  <td data-label="Radicado">{p.numero_radicado}</td>
                  <td data-label="Tipo">{p.tipo}</td>
                  <td data-label="Descripción">{p.descripcion}</td>
                  <td data-label="Estado">
                    <span className={`estado ${p.estado}`}>{p.estado}</span>
                  </td>
                  <td data-label="Respuesta">
                    {p.respuesta
                      ? <span style={{ color: '#166534', fontWeight: 'bold' }}>✅ Respondida</span>
                      : <span style={{ color: '#6b7280' }}>Pendiente</span>
                    }
                  </td>
                </>
              ) : (
                <>
                  <td data-label="Nombre">{p.nombre_ciudadano}</td>
                  <td data-label="Correo">{p.correo}</td>
                  <td data-label="Tipo">{p.tipo}</td>
                  <td data-label="Mensaje" style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.descripcion}
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
                  {puedeGestionar && (
                    <td data-label="Caso">
                      <select value={p.id_caso || ''}
                        onChange={e => asignarCaso(p.id_pqrs, e.target.value)}
                        style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', minWidth: '120px' }}>
                        <option value="">Sin caso</option>
                        {casos.map(c => (
                          <option key={c.id_caso} value={c.id_caso}>
                            #{c.id_caso} — {c.titulo}
                          </option>
                        ))}
                      </select>
                    </td>
                  )}
                  <td data-label="Acciones">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {puedeGestionar && (
                        <button className="btn-accion-editar"
                          onClick={() => abrirResponder(p)}
                          style={{ fontSize: '11px' }}>
                          {p.respuesta ? '✏️ Editar respuesta' : '💬 Responder'}
                        </button>
                      )}
                      {p.respuesta && (
                        <>
                          <button className="btn-accion-editar"
                            onClick={() => descargarRespuestaPDF(p)}
                            style={{ fontSize: '11px', background: '#1d4ed8' }}>
                            📄 Descargar PDF
                          </button>
                          {puedeGestionar && (
                            <button className="btn-accion-editar"
                              onClick={() => subirRespuestaExpediente(p)}
                              style={{ fontSize: '11px', background: '#059669' }}>
                              📤 Subir al expediente
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal nueva PQRS (ciudadano) */}
      {modal && (
        <div className="modal" style={{ display: 'flex' }}
          onClick={e => e.target.className === 'modal' && setModal(false)}>
          <div className="modal-content">
            <h2>Nuevo PQRS</h2>
            <form onSubmit={guardar} className="pqrs-form">
              <input type="text" placeholder="Nombre" required value={form.nombre_ciudadano}
                onChange={e => setForm({ ...form, nombre_ciudadano: e.target.value })} />
              <input type="email" placeholder="Correo" required value={form.correo}
                onChange={e => setForm({ ...form, correo: e.target.value })} />
              <select required value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
                <option value="">Tipo de solicitud</option>
                <option value="peticion">Petición</option>
                <option value="queja">Queja</option>
                <option value="reclamo">Reclamo</option>
                <option value="sugerencia">Sugerencia</option>
              </select>
              <textarea placeholder="Escribe tu mensaje" required value={form.descripcion}
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
          <div className="modal-contenido" style={{ maxWidth: '580px', width: '100%' }}>
            <h3>💬 Responder PQRS</h3>
            <p style={{ margin: '6px 0', fontSize: '13px', color: '#6b7280' }}>
              <strong>Radicado:</strong> {modalRespuesta.numero_radicado} &nbsp;|&nbsp;
              <strong>Ciudadano:</strong> {modalRespuesta.nombre_ciudadano}
            </p>
            <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#6b7280' }}>
              <strong>Solicitud:</strong> {modalRespuesta.descripcion}
            </p>
            <textarea
              value={textoRespuesta}
              onChange={e => setTextoRespuesta(e.target.value)}
              placeholder="Escribe la respuesta oficial aquí..."
              rows={8}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', fontSize: '13px', resize: 'vertical' }}
            />
            <div className="form-botones" style={{ marginTop: '12px' }}>
              <button className="btn-cancelar" onClick={() => setModalRespuesta(null)}>
                Cancelar
              </button>
              <button className="btn-accion-editar"
                onClick={() => descargarRespuestaPDF(modalRespuesta)}
                style={{ background: '#1d4ed8' }}
                disabled={!textoRespuesta.trim()}>
                📄 Vista previa PDF
              </button>
              <button className="btn-guardar" onClick={guardarRespuesta} disabled={guardando}>
                {guardando ? 'Guardando...' : '💾 Guardar respuesta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
