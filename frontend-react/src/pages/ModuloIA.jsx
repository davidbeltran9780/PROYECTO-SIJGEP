import { useState, useEffect, useRef } from 'react'
import api from '../api/axios'
import Spinner from '../components/Spinner'
import { jsPDF } from 'jspdf'
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType
} from 'docx'
import { saveAs } from 'file-saver'
import { useToast } from '../context/ToastContext'
import { useConfirm } from '../components/ConfirmModal'

function extraerSeccion(texto, etiqueta) {
  const regex = new RegExp(`${etiqueta}:\\s*([\\s\\S]*?)(?=\\n[A-ZÁÉÍÓÚ]+:|$)`, 'i')
  const match = texto.match(regex)
  return match ? match[1].trim() : ''
}

export default function ModuloIA() {
  const toast = useToast()
  const { confirmar, ConfirmUI } = useConfirm()
  const [expedientes, setExpedientes] = useState([])
  const [expedienteId, setExpedienteId] = useState('')
  const [archivo, setArchivo] = useState(null)
  const [clasificacion, setClasificacion] = useState('-')
  const [resumen, setResumen] = useState('')
  const [cargando, setCargando] = useState(false)
  const [progreso, setProgreso] = useState(0)
  const [aprobado, setAprobado] = useState(false)
  const inputRef = useRef()

  useEffect(() => {
    api.get('/expedientes').then(res => setExpedientes(res.data)).catch(console.error)
  }, [])

  const handleArchivo = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setArchivo(file)
    setResumen('')
    setClasificacion('-')
    setAprobado(false)
    setProgreso(0)
    let p = 0
    const intervalo = setInterval(() => {
      p += 10
      setProgreso(p)
      if (p >= 100) clearInterval(intervalo)
    }, 100)
  }

  const clasificar = async () => {
    if (!archivo) return toast.info('Primero sube un archivo')
    setCargando(true)
    try {
      const formData = new FormData()
      formData.append('archivo', archivo)
      const res = await api.post('/ia/resumir', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      const texto = res.data.resumen || ''
      setResumen(texto)
      setAprobado(false)
      const match = texto.match(/TIPO:\s*(.+)/i)
      setClasificacion(match ? match[1].trim() : 'No identificado')
    } catch { toast.error('Error al analizar el documento') }
    finally { setCargando(false) }
  }

  const generarResumen = async () => {
    if (!archivo) return toast.info('Primero sube un archivo')
    setCargando(true)
    try {
      const formData = new FormData()
      formData.append('archivo', archivo)
      const res = await api.post('/ia/resumir', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setResumen(res.data.resumen || '')
      setAprobado(false)
    } catch { toast.error('Error al generar resumen') }
    finally { setCargando(false) }
  }

  const descargarPDF = () => {
    if (!resumen) return toast.info('Primero genera un resumen')
    const doc = new jsPDF()
    const margen = 15
    const anchoUtil = doc.internal.pageSize.getWidth() - margen * 2

    doc.setFillColor(30, 58, 138)
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 30, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('SIGJEP — Resumen Jurídico con IA', margen, 20)

    doc.setTextColor(60, 60, 60)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Expediente: ${expedienteId || 'No seleccionado'}`, margen, 40)
    doc.text(`Documento: ${archivo?.name || ''}`, margen, 47)
    doc.text(`Tipo detectado: ${clasificacion}`, margen, 54)
    doc.text(`Generado: ${new Date().toLocaleString('es-CO')}`, margen, 61)

    doc.setDrawColor(30, 58, 138)
    doc.setLineWidth(0.5)
    doc.line(margen, 66, doc.internal.pageSize.getWidth() - margen, 66)

    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(30, 30, 30)
    const lineas = doc.splitTextToSize(resumen, anchoUtil)
    doc.text(lineas, margen, 75)
    doc.save(`resumen_juridico_exp${expedienteId || 'sin_exp'}.pdf`)
    toast.exito('PDF descargado correctamente')
  }

  const descargarBorradorWord = async () => {
    if (!resumen) return toast.info('Primero genera un resumen con IA')

    const textoBorrador = extraerSeccion(resumen, 'BORRADOR')
    const textoNormas = extraerSeccion(resumen, 'NORMAS')
    const textoResumen = extraerSeccion(resumen, 'RESUMEN')
    const fecha = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({ text: 'ALCALDÍA MUNICIPAL', heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }),
          new Paragraph({ text: 'Sistema Inteligente de Gestión Jurídica — SIGJEP', alignment: AlignmentType.CENTER, spacing: { after: 200 } }),
          new Paragraph({ children: [new TextRun({ text: 'Fecha: ', bold: true }), new TextRun(fecha)], spacing: { after: 100 } }),
          new Paragraph({ children: [new TextRun({ text: 'Expediente No.: ', bold: true }), new TextRun(expedienteId || 'Sin expediente asignado')], spacing: { after: 100 } }),
          new Paragraph({ children: [new TextRun({ text: 'Tipo de caso: ', bold: true }), new TextRun(clasificacion)], spacing: { after: 300 } }),
          new Paragraph({ text: '─'.repeat(80), spacing: { after: 200 } }),
          new Paragraph({ text: 'RESUMEN DEL CASO', heading: HeadingLevel.HEADING_2, spacing: { after: 100 } }),
          new Paragraph({ text: textoResumen || 'No disponible', spacing: { after: 300 } }),
          new Paragraph({ text: 'NORMAS APLICABLES', heading: HeadingLevel.HEADING_2, spacing: { after: 100 } }),
          new Paragraph({ text: textoNormas || 'No identificadas', spacing: { after: 300 } }),
          new Paragraph({ text: 'BORRADOR DE RESPUESTA INSTITUCIONAL', heading: HeadingLevel.HEADING_2, spacing: { after: 200 } }),
          new Paragraph({ text: textoBorrador || resumen, spacing: { after: 400 } }),
          new Paragraph({ text: '─'.repeat(80), spacing: { after: 300 } }),
          new Paragraph({ text: '_______________________________', spacing: { after: 100 } }),
          new Paragraph({ text: 'Firma del Responsable', spacing: { after: 50 } }),
          new Paragraph({ text: 'Cargo: ____________________________', spacing: { after: 50 } }),
          new Paragraph({ children: [new TextRun({ text: 'Documento generado por IA — Requiere revisión humana antes de ser oficial', italics: true, color: '888888', size: 18 })], spacing: { before: 400 } }),
        ],
      }],
    })

    const blob = await Packer.toBlob(doc)
    saveAs(blob, `borrador_respuesta_exp${expedienteId || 'sin_exp'}.docx`)
    toast.exito('Borrador Word descargado')
  }

  const aprobar = async () => {
    if (!resumen) return toast.info('No hay resumen que aprobar')
    const ok = await confirmar('¿Marcar este borrador como revisado?', 'Indica que el borrador fue revisado por un responsable.')
    if (!ok) return
    setAprobado(true)
    toast.exito('Borrador marcado como revisado. Descárgalo y súbelo al expediente desde Documentos.')
  }

  const descartar = async () => {
    if (!resumen) return
    const ok = await confirmar('¿Descartar el resumen actual?', 'Se perderá el análisis generado.')
    if (!ok) return
    setResumen('')
    setClasificacion('-')
    setArchivo(null)
    setProgreso(0)
    setAprobado(false)
    toast.info('Resumen descartado')
  }

  return (
    <main className="content">
      {ConfirmUI}
      <div className="contenido">
        <h2>Asistente Jurídico con IA</h2>

        <select value={expedienteId} onChange={e => setExpedienteId(e.target.value)}
          style={{ marginBottom: '1rem', padding: '8px', width: '100%' }}>
          <option value="">Seleccionar expediente (opcional)</option>
          {expedientes.map(e => (
            <option key={e.id_expediente} value={e.id_expediente}>
              EXP-{e.id_expediente} — {e.titulo || e.tipo || 'Sin título'}
            </option>
          ))}
        </select>

        <div className="ia-panel">

          {/* Card 1 — Documentos */}
          <div className="ia-card">
            <h3>Documentos</h3>
            <p><strong>{archivo ? archivo.name : 'Ninguno seleccionado'}</strong></p>
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

          {/* Card 2 — Análisis IA */}
          <div className="ia-card">
            <h3>Análisis IA</h3>
            {cargando && <Spinner />}
            <p><strong>Tipo de caso:</strong> {clasificacion}</p>
            <button className="nuevo" onClick={clasificar} disabled={cargando}>
              🤖 Analizar con IA
            </button>
            <p style={{ marginTop: '1rem' }}><strong>Resumen completo:</strong></p>
            <textarea
              readOnly
              value={resumen}
              placeholder="El resumen aparecerá aquí después del análisis..."
              style={{ width: '100%', height: '140px', marginTop: '5px', resize: 'vertical' }}
            />
            <button className="nuevo" onClick={generarResumen} disabled={cargando}
              style={{ marginTop: '8px' }}>
              📝 Generar Resumen
            </button>
          </div>

          {/* Card 3 — Descargas */}
          <div className="ia-card">
            <h3>Descargas</h3>

            {aprobado && (
              <p style={{ color: '#166534', background: '#dcfce7', padding: '8px 12px', borderRadius: '8px', fontSize: '13px', marginBottom: '10px' }}>
                ✅ Borrador revisado — listo para subir al expediente
              </p>
            )}

            <button className="nuevo" onClick={descargarPDF}
              style={{ marginBottom: '8px', width: '100%' }}
              disabled={!resumen}>
              📄 Descargar Resumen en PDF
            </button>

            <button className="nuevo" onClick={descargarBorradorWord}
              style={{ marginBottom: '16px', width: '100%', background: '#1d4ed8' }}
              disabled={!resumen}>
              📝 Descargar Borrador en Word
            </button>

            <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px' }}>
              Descarga el Word, revísalo y súbelo al expediente desde el módulo Documentos.
            </p>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn-guardar" onClick={aprobar} disabled={!resumen || aprobado}>
                {aprobado ? 'Revisado ✅' : 'Marcar revisado'}
              </button>
              <button className="btn-cancelar" onClick={descartar} disabled={!resumen}>
                Descartar
              </button>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}
