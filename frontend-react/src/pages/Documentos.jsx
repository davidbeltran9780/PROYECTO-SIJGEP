import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../api/axios'

export default function Documentos() {
  const [searchParams] = useSearchParams()
  const expedienteId = searchParams.get('id')
  const [archivo, setArchivo] = useState(null)
  const [preview, setPreview] = useState(null)
  const [progreso, setProgreso] = useState(0)
  const [subiendo, setSubiendo] = useState(false)
  const [documentos, setDocumentos] = useState([])
  const [expedientes, setExpedientes] = useState([])
  const [expSeleccionado, setExpSeleccionado] = useState(expedienteId || '')
  const inputRef = useRef()
  const rol = localStorage.getItem('rol') || ''
  const puedeSubir = ['admin', 'administrador', 'secretaria', 'abogado'].includes(rol)

  // Cargar lista de expedientes para el selector
  useEffect(() => {
    api.get('/expedientes')
      .then(res => setExpedientes(res.data))
      .catch(console.error)
  }, [])

  // Cargar documentos del expediente seleccionado
  useEffect(() => {
    if (expSeleccionado) {
      api.get(`/documentos/expediente/${expSeleccionado}`)
        .then(res => setDocumentos(res.data))
        .catch(console.error)
    } else {
      setDocumentos([])
    }
  }, [expSeleccionado])

  const handleArchivo = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setArchivo(file)
    setProgreso(0)

    const url = URL.createObjectURL(file)
    if (file.type.startsWith('image/')) {
      setPreview({ tipo: 'imagen', url })
    } else if (file.type === 'application/pdf') {
      setPreview({ tipo: 'pdf', url })
    } else {
      setPreview({ tipo: 'otro', nombre: file.name })
    }

    let p = 0
    const intervalo = setInterval(() => {
      p += 10
      setProgreso(p)
      if (p >= 100) clearInterval(intervalo)
    }, 100)
  }

  const subirArchivo = async () => {
    if (!archivo) return alert('Selecciona un archivo primero')
    if (!expSeleccionado) return alert('Selecciona un expediente primero')
    setSubiendo(true)
    try {
      const formData = new FormData()
      formData.append('archivo', archivo)
      await api.post(`/documentos/subir?id_expediente=${expSeleccionado}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      alert('Archivo subido correctamente ✅')
      setArchivo(null)
      setPreview(null)
      setProgreso(0)
      // Recargar documentos
      const res = await api.get(`/documentos/expediente/${expSeleccionado}`)
      setDocumentos(res.data)
    } catch (err) {
      alert(err.response?.data?.detail || 'Error al subir el archivo')
    } finally {
      setSubiendo(false)
    }
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este documento?')) return
    try {
      await api.delete(`/documentos/${id}`)
      const res = await api.get(`/documentos/expediente/${expSeleccionado}`)
      setDocumentos(res.data)
    } catch (err) {
      alert(err.response?.data?.detail || 'Error al eliminar')
    }
  }

  return (
    <main className="content">
      <div className="top">
        <h2>Gestión de Documentos</h2>
      </div>

      {/* Selector de expediente */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Expediente:</label>
        <select value={expSeleccionado} onChange={e => setExpSeleccionado(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', minWidth: '250px' }}>
          <option value="">Seleccionar expediente</option>
          {expedientes.map(exp => (
            <option key={exp.id_expediente} value={exp.id_expediente}>
              #{exp.id_expediente} — {exp.titulo || exp.tipo || 'Sin título'}
            </option>
          ))}
        </select>
      </div>

      {/* Lista de documentos */}
      {expSeleccionado && (
        <table style={{ marginBottom: '2rem' }}>
          <thead>
            <tr>
              <th>Archivo</th><th>Formato</th><th>Subido por</th><th>Fecha</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {documentos.length === 0 ? (
              <tr><td colSpan={5}>No hay documentos en este expediente</td></tr>
            ) : (
              documentos.map(d => (
                <tr key={d.id_documento}>
                  <td data-label="Archivo">{d.nombre_archivo}</td>
                  <td data-label="Formato">{d.tipo_formato}</td>
                  <td data-label="Subido por">{d.subido_por_nombre}</td>
                  <td data-label="Fecha">{d.fecha_subida?.split('T')[0]}</td>
                  <td data-label="Acciones">
                    <button className="btn-accion-eliminar" onClick={() => eliminar(d.id_documento)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {/* Subida */}
      {puedeSubir && expSeleccionado && (
        <div className="upload-container">
          <label className="custom-file">
            <input type="file" ref={inputRef} hidden
              accept=".pdf,image/*,.docx,.doc"
              onChange={handleArchivo} />
            <span onClick={() => inputRef.current.click()}>
              📁 {archivo ? archivo.name : 'Seleccionar archivo'}
            </span>
          </label>

          {progreso > 0 && (
            <div className="barra">
              <div className="progreso" style={{ width: `${progreso}%` }} />
            </div>
          )}

          {archivo && (
            <button className="nuevo" onClick={subirArchivo} disabled={subiendo}
              style={{ marginTop: '1rem' }}>
              {subiendo ? 'Subiendo...' : '⬆️ Subir al servidor'}
            </button>
          )}

          <div className="preview">
            {preview?.tipo === 'imagen' && (
              <img src={preview.url} alt="preview" style={{ maxWidth: '300px', borderRadius: '8px' }} />
            )}
            {preview?.tipo === 'pdf' && (
              <iframe src={preview.url} width="100%" height="400px" title="preview" />
            )}
            {preview?.tipo === 'otro' && (
              <p>📄 {preview.nombre}</p>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
