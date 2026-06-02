import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import { useToast } from '../context/ToastContext'
import { useConfirm } from '../components/ConfirmModal'

export default function Documentos() {
  const toast = useToast()
  const { confirmar, ConfirmUI } = useConfirm()
  const [searchParams] = useSearchParams()
  const expedienteIdParam = searchParams.get('id')

  const [busqueda, setBusqueda] = useState('')
  const [archivo, setArchivo] = useState(null)
  const [preview, setPreview] = useState(null)
  const [progreso, setProgreso] = useState(0)
  const [subiendo, setSubiendo] = useState(false)
  const [documentos, setDocumentos] = useState([])
  const [expedientes, setExpedientes] = useState([])
  const [expSeleccionado, setExpSeleccionado] = useState(expedienteIdParam || '')
  const [busquedaDocs, setBusquedaDocs] = useState('')
  const [modalEnviar, setModalEnviar] = useState(null)
  const inputRef = useRef()
  const docsRef = useRef()
  const rol = localStorage.getItem('rol') || ''
  const puedeSubir = ['admin', 'administrador', 'secretaria', 'abogado'].includes(rol)
  const esAdmin = ['admin', 'administrador'].includes(rol)

  useEffect(() => {
    api.get('/expedientes').then(res => setExpedientes(res.data)).catch(console.error)
  }, [])

  useEffect(() => {
    if (expSeleccionado) {
      cargarDocumentos()
      setTimeout(() => docsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    } else {
      setDocumentos([])
    }
  }, [expSeleccionado])

  const cargarDocumentos = () => {
    api.get(`/documentos/expediente/${expSeleccionado}`)
      .then(res => setDocumentos(res.data))
      .catch(console.error)
  }

  const seleccionar = (id) => {
    setExpSeleccionado(String(id) === expSeleccionado ? '' : String(id))
    setBusquedaDocs('')
  }

  const handleArchivo = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setArchivo(file)
    setProgreso(0)
    const url = URL.createObjectURL(file)
    if (file.type.startsWith('image/')) setPreview({ tipo: 'imagen', url })
    else if (file.type === 'application/pdf') setPreview({ tipo: 'pdf', url })
    else setPreview({ tipo: 'otro', nombre: file.name })
    let p = 0
    const iv = setInterval(() => { p += 10; setProgreso(p); if (p >= 100) clearInterval(iv) }, 100)
  }

  const subirArchivo = async () => {
    if (!archivo) return toast.info('Selecciona un archivo primero')
    setSubiendo(true)
    try {
      const formData = new FormData()
      formData.append('archivo', archivo)
      await api.post(`/documentos/subir?id_expediente=${expSeleccionado}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.exito('Archivo subido correctamente')
      setArchivo(null); setPreview(null); setProgreso(0)
      cargarDocumentos()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al subir el archivo')
    } finally { setSubiendo(false) }
  }

  const enviarDocumento = async () => {
    if (!modalEnviar) return
    try {
      await api.patch(`/documentos/${modalEnviar.id_documento}/enviar`)
      toast.exito('Documento enviado')
      setModalEnviar(null); cargarDocumentos()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al enviar')
      setModalEnviar(null)
    }
  }

  const eliminar = async (id) => {
    const ok = await confirmar('¿Eliminar este documento?', 'Esta acción no se puede deshacer.')
    if (!ok) return
    try {
      await api.delete(`/documentos/${id}`)
      cargarDocumentos(); toast.exito('Documento eliminado')
    } catch (err) { toast.error(err.response?.data?.detail || 'Error al eliminar') }
  }

  // Filtrar expedientes por búsqueda
  const expFiltrados = expedientes.filter(e => {
    const q = busqueda.toLowerCase()
    return (
      String(e.id_expediente).includes(q) ||
      `exp-${e.id_expediente}`.includes(q) ||
      (e.titulo || '').toLowerCase().includes(q) ||
      (e.tipo || '').toLowerCase().includes(q) ||
      (e.abogado_nombre || '').toLowerCase().includes(q) ||
      (e.estado_caso || '').toLowerCase().includes(q)
    )
  })

  // Filtrar documentos por búsqueda
  const docsFiltrados = documentos.filter(d => {
    const q = busquedaDocs.toLowerCase()
    return (
      (d.nombre_archivo || '').toLowerCase().includes(q) ||
      (d.tipo_formato || '').toLowerCase().includes(q) ||
      (d.subido_por_nombre || '').toLowerCase().includes(q) ||
      (d.estado || '').toLowerCase().includes(q)
    )
  })

  const expActual = expedientes.find(e => String(e.id_expediente) === expSeleccionado)

  return (
    <main className="content">
      {ConfirmUI}
      <div className="top">
        <h2>Gestión de Documentos</h2>
      </div>

      {/* ── Buscador de expedientes (siempre visible) ── */}
      <div className="barra-busqueda" style={{ maxWidth: '100%', marginBottom: '12px' }}>
        <input
          type="text"
          placeholder="🔍 Buscar expediente por número, título, tipo o abogado..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
        {busqueda && <button onClick={() => setBusqueda('')} title="Limpiar">✕</button>}
      </div>

      {/* ── Tabla de expedientes ── */}
      <table style={{ marginBottom: '2rem' }}>
        <thead>
          <tr>
            <th>EXP</th><th>Tipo</th><th>Título</th><th>Abogado</th><th>Estado</th><th>Documentos</th>
          </tr>
        </thead>
        <tbody>
          {expFiltrados.length === 0 ? (
            <tr><td colSpan={6}>{busqueda ? 'No se encontraron expedientes' : 'No hay expedientes registrados'}</td></tr>
          ) : expFiltrados.map(e => {
            const seleccionado = String(e.id_expediente) === expSeleccionado
            return (
              <tr
                key={e.id_expediente}
                onClick={() => seleccionar(e.id_expediente)}
                style={{
                  cursor: 'pointer',
                  background: seleccionado ? '#eff6ff' : undefined,
                  outline: seleccionado ? '2px solid #1e3a8a' : undefined,
                }}
              >
                <td data-label="EXP">
                  <span style={{
                    fontWeight: 'bold', fontSize: '12px',
                    color: '#1e3a8a', fontFamily: 'monospace'
                  }}>
                    EXP-{String(e.id_expediente).padStart(3, '0')}
                  </span>
                </td>
                <td data-label="Tipo">{e.tipo || '—'}</td>
                <td data-label="Título">{e.titulo || '—'}</td>
                <td data-label="Abogado">{e.abogado_nombre || <span style={{ color: '#aaa' }}>Sin asignar</span>}</td>
                <td data-label="Estado">
                  <span className={
                    e.estado_caso === 'activo' ? 'atiempo' :
                    e.estado_caso === 'en_proceso' ? 'proximo' :
                    e.estado_caso === 'cerrado' ? 'urgente' : 'archivado'
                  }>
                    {e.estado_caso || 'activo'}
                  </span>
                </td>
                <td data-label="Ver docs">
                  <span style={{
                    fontSize: '12px', color: seleccionado ? '#1e3a8a' : '#6b7280',
                    fontWeight: seleccionado ? 'bold' : 'normal'
                  }}>
                    {seleccionado ? '▼ Viendo docs' : '▶ Ver docs'}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* ── Sección de documentos del expediente seleccionado ── */}
      {expSeleccionado && expActual && (
        <div ref={docsRef}>
          <div style={{
            background: '#eff6ff', border: '1px solid #bfdbfe',
            borderRadius: '8px', padding: '10px 16px', marginBottom: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <span style={{ fontWeight: 'bold', color: '#1e3a8a', fontSize: '14px' }}>
              📂 EXP-{String(expActual.id_expediente).padStart(3, '0')} — {expActual.titulo || expActual.tipo}
            </span>
            <button
              onClick={() => setExpSeleccionado('')}
              style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '13px' }}
            >
              ✕ Cerrar
            </button>
          </div>

          {/* Buscador de documentos */}
          <div className="barra-busqueda" style={{ maxWidth: '100%', marginBottom: '12px' }}>
            <input
              type="text"
              placeholder="🔍 Buscar documento por nombre, formato o subido por..."
              value={busquedaDocs}
              onChange={e => setBusquedaDocs(e.target.value)}
            />
            {busquedaDocs && <button onClick={() => setBusquedaDocs('')} title="Limpiar">✕</button>}
          </div>

          <table style={{ marginBottom: '2rem' }}>
            <thead>
              <tr>
                <th>Archivo</th><th>Formato</th><th>Subido por</th>
                <th>Fecha</th><th>Estado</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {docsFiltrados.length === 0 ? (
                <tr><td colSpan={6}>{busquedaDocs ? 'No se encontraron resultados' : 'No hay documentos en este expediente'}</td></tr>
              ) : docsFiltrados.map(d => {
                const enviado = d.estado === 'enviado'
                const puedeEliminar = esAdmin || !enviado
                return (
                  <tr key={d.id_documento}>
                    <td data-label="Archivo">{d.nombre_archivo}</td>
                    <td data-label="Formato">{d.tipo_formato}</td>
                    <td data-label="Subido por">{d.subido_por_nombre}</td>
                    <td data-label="Fecha">{d.fecha_subida?.split('T')[0]}</td>
                    <td data-label="Estado">
                      <span style={{
                        padding: '3px 10px', borderRadius: '12px',
                        fontSize: '12px', fontWeight: 'bold',
                        background: enviado ? '#dcfce7' : '#fef9c3',
                        color: enviado ? '#166534' : '#854d0e'
                      }}>
                        {enviado ? '✅ Enviado' : '📝 Borrador'}
                      </span>
                    </td>
                    <td data-label="Acciones" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {!enviado && (
                        <button className="btn-accion-editar" onClick={() => setModalEnviar(d)}>Enviar</button>
                      )}
                      {puedeEliminar && (
                        <button className="btn-accion-eliminar" onClick={() => eliminar(d.id_documento)}>Eliminar</button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* Subida de archivo */}
          {puedeSubir && (
            <div className="upload-container">
              <label className="custom-file">
                <input type="file" accept=".pdf,image/*,.docx,.doc" onChange={handleArchivo} />
                <span>📁 {archivo ? archivo.name : 'Seleccionar archivo'}</span>
              </label>
              {progreso > 0 && (
                <div className="barra"><div className="progreso" style={{ width: `${progreso}%` }} /></div>
              )}
              {archivo && (
                <button className="nuevo" onClick={subirArchivo} disabled={subiendo} style={{ marginTop: '1rem' }}>
                  {subiendo ? 'Subiendo...' : '⬆️ Subir al servidor'}
                </button>
              )}
              <div className="preview">
                {preview?.tipo === 'imagen' && <img src={preview.url} alt="preview" style={{ maxWidth: '300px', borderRadius: '8px' }} />}
                {preview?.tipo === 'pdf' && <iframe src={preview.url} width="100%" height="400px" title="preview" />}
                {preview?.tipo === 'otro' && <p>📄 {preview.nombre}</p>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal confirmación de envío */}
      {modalEnviar && (
        <div className="modal" style={{ display: 'flex' }}
          onClick={e => e.target.className === 'modal' && setModalEnviar(null)}>
          <div className="modal-contenido" style={{ maxWidth: '420px', textAlign: 'center' }}>
            <h3>⚠️ Confirmar envío</h3>
            <p style={{ margin: '1rem 0' }}>
              Estás a punto de enviar <strong>"{modalEnviar.nombre_archivo}"</strong>.
            </p>
            <p style={{ color: '#dc2626', fontWeight: 'bold', marginBottom: '1.5rem' }}>
              Una vez enviado, no podrás eliminarlo. Solo un administrador podrá hacerlo.
            </p>
            <div className="form-botones">
              <button className="btn-cancelar" onClick={() => setModalEnviar(null)}>Cancelar</button>
              <button className="btn-guardar" onClick={enviarDocumento}>Sí, enviar</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
