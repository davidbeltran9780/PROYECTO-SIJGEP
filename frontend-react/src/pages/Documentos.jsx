import { useState, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../api/axios'

export default function Documentos() {
  const [searchParams] = useSearchParams()
  const expedienteId = searchParams.get('id')
  const [archivo, setArchivo] = useState(null)
  const [preview, setPreview] = useState(null)
  const [progreso, setProgreso] = useState(0)
  const [subiendo, setSubiendo] = useState(false)
  const inputRef = useRef()

  const handleArchivo = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setArchivo(file)
    setProgreso(0)

    // Preview
    const url = URL.createObjectURL(file)
    if (file.type.startsWith('image/')) {
      setPreview({ tipo: 'imagen', url })
    } else if (file.type === 'application/pdf') {
      setPreview({ tipo: 'pdf', url })
    } else {
      setPreview({ tipo: 'otro', nombre: file.name })
    }

    // Barra de progreso simulada
    let p = 0
    const intervalo = setInterval(() => {
      p += 10
      setProgreso(p)
      if (p >= 100) clearInterval(intervalo)
    }, 100)
  }

  const subirArchivo = async () => {
    if (!archivo) return alert('Selecciona un archivo primero')
    setSubiendo(true)
    try {
      const formData = new FormData()
      formData.append('file', archivo)
      if (expedienteId) formData.append('id_expediente', expedienteId)
      await api.post('/documentos/subir', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      alert('Archivo subido correctamente ✅')
    } catch {
      alert('Error al subir el archivo')
    } finally {
      setSubiendo(false)
    }
  }

  return (
    <main className="content">
      <div className="top">
        <h2>Gestión de Documentos</h2>
      </div>

      {expedienteId && (
        <h3>Documentos del expediente #{expedienteId}</h3>
      )}

      <div className="upload-container">

        <label className="custom-file">
          <input type="file" ref={inputRef} hidden
            accept=".pdf,image/*,.docx,.doc,.txt"
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
    </main>
  )
}