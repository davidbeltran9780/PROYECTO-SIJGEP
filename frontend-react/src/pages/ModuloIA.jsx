import { useState, useEffect } from 'react'
import api from '../api/axios'

export default function ModuloIA() {
  const [expedientes, setExpedientes] = useState([])
  const [expedienteId, setExpedienteId] = useState('')
  const [archivo, setArchivo] = useState(null)
  const [clasificacion, setClasificacion] = useState('-')
  const [resumen, setResumen] = useState('')
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    api.get('/expedientes').then(res => setExpedientes(res.data)).catch(console.error)
  }, [])

  const clasificar = async () => {
    if (!archivo) return alert('Selecciona un archivo primero')
    setCargando(true)
    try {
      const formData = new FormData()
      formData.append('file', archivo)
      const res = await api.post('/ia/clasificar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setClasificacion(res.data.tipo || '-')
    } catch { alert('Error al clasificar') }
    finally { setCargando(false) }
  }

  const generarResumen = async () => {
    if (!archivo) return alert('Selecciona un archivo primero')
    setCargando(true)
    try {
      const formData = new FormData()
      formData.append('file', archivo)
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>

          <div className="ia-card">
            <h3>Documentos</h3>
            <p><strong>{archivo ? archivo.name : 'Ninguno'}</strong></p>
            <input type="file" id="inputArchivo" hidden
              accept=".txt,.pdf,.docx,.doc,.jpg,.jpeg,.png"
              onChange={e => setArchivo(e.target.files[0])} />
            <button className="nuevo" onClick={() => document.getElementById('inputArchivo').click()}>
              Subir Archivo
            </button>
          </div>

          <div className="ia-card">
            <h3>Análisis IA</h3>
            {cargando && <p>Procesando con IA...</p>}
            <p><strong>Tipo de caso:</strong> {clasificacion}</p>
            <button className="nuevo" onClick={clasificar}>Analizar con IA</button>
            <p style={{ marginTop: '1rem' }}><strong>Resumen:</strong></p>
            <textarea readOnly value={resumen} style={{ width: '100%', height: '80px' }} />
            <button className="nuevo" onClick={generarResumen}>Generar Resumen</button>
          </div>

          <div className="ia-card">
            <h3>Borradores</h3>
            <button className="nuevo">Descargar Borrador</button>
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
