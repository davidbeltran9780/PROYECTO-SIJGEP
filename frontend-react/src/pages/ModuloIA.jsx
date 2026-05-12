import { useState, useEffect, useRef } from 'react'
import api from '../api/axios'

export default function ModuloIA() {
  const [expedientes, setExpedientes] = useState([])
  const [expedienteId, setExpedienteId] = useState('')
  const [archivo, setArchivo] = useState(null)
  const [clasificacion, setClasificacion] = useState('-')
  const [resumen, setResumen] = useState('')
  const [cargando, setCargando] = useState(false)
  const [progreso, setProgreso] = useState(0)
  const inputRef = useRef()

  useEffect(() => {
    api.get('/expedientes').then(res => setExpedientes(res.data)).catch(console.error)
  }, [])

  const handleArchivo = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setArchivo(file)
    setProgreso(0)
    let p = 0
    const intervalo = setInterval(() => {
      p += 10
      setProgreso(p)
      if (p >= 100) clearInterval(intervalo)
    }, 100)
  }

  const clasificar = async () => {
    if (!archivo) return alert('Primero sube un archivo')
    setCargando(true)
    try {
      const formData = new FormData()
      formData.append('archivo', archivo)
      const res = await api.post('/ia/clasificar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setClasificacion(res.data.tipo || '-')
    } catch { alert('Error al clasificar') }
    finally { setCargando(false) }
  }

  const generarResumen = async () => {
    if (!archivo) return alert('Primero sube un archivo')
    setCargando(true)
    try {
      const formData = new FormData()
      formData.append('archivo', archivo)
      const res = await api.post('/ia/resumir', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setResumen(res.data.resumen || '')
    } catch { alert('Error al generar resumen') }
    finally { setCargando(false) }
  }

  return (
    <main className="content">
      <div className="contenido">
        <h2>Asistente Jurídico con IA</h2>

        <select value={expedienteId} onChange={e => setExpedienteId(e.target.value)}
          style={{ marginBottom: '1rem', padding: '8px', width: '100%' }}>
          <option value="">Seleccionar expediente</option>
          {expedientes.map(e => (
            <option key={e.id_expediente} value={e.id_expediente}>
              EXP-{e.id_expediente}
            </option>
          ))}
        </select>

        <div className="ia-panel">

          <div className="ia-card">
            <h3>Documentos</h3>
            <p><strong>{archivo ? archivo.name : 'Ninguno'}</strong></p>
            <input type="file" ref={inputRef} hidden
              accept=".txt,.pdf,.docx,.doc,.jpg,.jpeg,.png"
              onChange={handleArchivo} />
            <button className="nuevo" onClick={() => inputRef.current.click()}>
              📁 Subir Archivo
            </button>
            {progreso > 0 && (
              <div className="barra" style={{ marginTop: '10px' }}>
                <div className="progreso" style={{ width: `${progreso}%` }} />
              </div>
            )}
          </div>

          <div className="ia-card">
            <h3>Análisis IA</h3>
            {cargando && (
              <div>
                <p>Procesando con IA...</p>
                <div className="barra">
                  <div className="progreso" style={{ width: '100%' }} />
                </div>
              </div>
            )}
            <p><strong>Tipo de caso:</strong> {clasificacion}</p>
            <button className="nuevo" onClick={clasificar} disabled={cargando}>
              Analizar con IA
            </button>
            <p style={{ marginTop: '1rem' }}><strong>Resumen:</strong></p>
            <textarea readOnly value={resumen}
              style={{ width: '100%', height: '120px', marginTop: '5px' }} />
            <button className="nuevo" onClick={generarResumen} disabled={cargando}
              style={{ marginTop: '8px' }}>
              Generar Resumen
            </button>
          </div>

          <div className="ia-card">
            <h3>Borradores</h3>
            <button className="nuevo" onClick={() => {
              if (!archivo) return alert('Primero sube un archivo')
              const contenido = `BORRADOR JURÍDICO\n\nExpediente: ${expedienteId}\nDocumento: ${archivo.name}\n\nResumen:\n${resumen}`
              const blob = new Blob([contenido], { type: 'application/msword' })
              const a = document.createElement('a')
              a.href = URL.createObjectURL(blob)
              a.download = 'borrador.doc'
              a.click()
            }}>
              Descargar Borrador
            </button>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '8px' }}>
              <button className="btn-guardar">Aprobar</button>
              <button className="btn-cancelar">Descartar</button>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}