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
  if (etiqueta === 'BORRADOR') {
    const idx = texto.search(/BORRADOR\s*:/i)
    if (idx === -1) return ''
    return texto.slice(idx + texto.slice(idx).search(/:/) + 1).trim()
  }
  const todas = 'TIPO|PARTES|HECHOS|PRETENSIONES|RESUMEN|NORMAS|BORRADOR'
  const regex = new RegExp(`${etiqueta}:\\s*([\\s\\S]*?)(?=\\n(?:${todas})\\s*:|$)`, 'i')
  const match = texto.match(regex)
  return match ? match[1].trim() : ''
}

function SeccionIA({ titulo, contenido, color = '#1e3a8a' }) {
  if (!contenido) return null
  return (
    <div style={{ marginBottom: '16px', borderLeft: `3px solid ${color}`, paddingLeft: '12px' }}>
      <p style={{ fontWeight: '700', fontSize: '12px', color, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>
        {titulo}
      </p>
      <p style={{ fontSize: '13px', color: '#1f2937', whiteSpace: 'pre-wrap', lineHeight: '1.6', margin: 0 }}>
        {contenido}
      </p>
    </div>
  )
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
  const [subidoOk, setSubidoOk] = useState(false)
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
    setSubidoOk(false)
    setProgreso(0)
    let p = 0
    const intervalo = setInterval(() => {
      p += 10
      setProgreso(p)
      if (p >= 100) {
        clearInterval(intervalo)
        setSubidoOk(true)
      }
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
    const margen = 20
    const anchoUtil = doc.internal.pageSize.getWidth() - margen * 2
    let y = margen

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(40, 40, 40)

    const textoBorrador = extraerSeccion(resumen, 'BORRADOR')
    const contenido = textoBorrador || resumen

    const lineas = doc.splitTextToSize(contenido, anchoUtil)
    lineas.forEach(linea => {
      if (y > doc.internal.pageSize.getHeight() - margen) {
        doc.addPage()
        y = margen
      }
      doc.text(linea, margen, y)
      y += 6
    })

    doc.save(`borrador_respuesta_exp${expedienteId || 'sin_exp'}.pdf`)
    toast.exito('PDF descargado correctamente')
  }

  const descargarBorradorWord = async () => {
    if (!resumen) return toast.info('Primero genera un resumen con IA')

    const textoBorrador = extraerSeccion(resumen, 'BORRADOR')
    const textoNormas = extraerSeccion(resumen, 'NORMAS')
    const textoResumen = extraerSeccion(resumen, 'RESUMEN')
    const fecha = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })

    const lineasBorrador = (textoBorrador || resumen).split('\n').map(linea =>
      new Paragraph({ children: [new TextRun({ text: linea, size: 22, font: 'Times New Roman' })], spacing: { after: 120 } })
    )

    const doc = new Document({
      sections: [{
        properties: {
          page: { margin: { top: 1440, bottom: 1440, left: 1800, right: 1440 } }
        },
        children: [
          ...lineasBorrador,
          new Paragraph({ children: [new TextRun({ text: ' ' })], spacing: { after: 400 } }),
          new Paragraph({ children: [new TextRun({ text: '* Borrador generado por IA - Requiere revision antes de ser oficial', italics: true, size: 18, color: '888888' })] }),
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

<div className="ia-panel">

          {/* Card 1 — Documentos */}
          <div className="ia-card">
            <h3>Documentos</h3>
            <p style={{ marginBottom: '12px' }}><strong>{archivo ? archivo.name : 'Ninguno seleccionado'}</strong></p>
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
            {subidoOk && (
              <p style={{ color: '#166534', background: '#dcfce7', padding: '8px 12px', borderRadius: '8px', fontSize: '13px', marginTop: '10px' }}>
                ✅ Archivo cargado — ahora haz clic en "Analizar con IA"
              </p>
            )}
          </div>

          {/* Card 2 — Análisis IA */}
          <div className="ia-card">
            <h3>Análisis IA</h3>
            {cargando && <Spinner />}
            <p style={{ marginBottom: '12px' }}><strong>Tipo de caso:</strong> {clasificacion}</p>
            <button className="nuevo" onClick={clasificar} disabled={cargando}>
              🤖 Analizar con IA
            </button>
            <textarea
              readOnly
              value={resumen ? (extraerSeccion(resumen, 'RESUMEN') || resumen) : ''}
              placeholder="El resumen aparecerá aquí después del análisis..."
              style={{ width: '100%', height: '140px', marginTop: '10px', resize: 'vertical' }}
            />
            {resumen && (
              <p style={{ fontSize: '11px', color: '#6b7280', margin: '4px 0 0', fontStyle: 'italic' }}>
                📄 Descarga el PDF o Word para ver hechos, pretensiones, normas y borrador completo.
              </p>
            )}
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button
                className="nuevo"
                disabled={!resumen}
                style={{ flex: 1 }}
                onClick={() => {
                  if (!resumen) return
                  const partes = extraerSeccion(resumen, 'PARTES') || ''
                  const hechos = extraerSeccion(resumen, 'HECHOS') || ''
                  const pretensiones = extraerSeccion(resumen, 'PRETENSIONES') || ''
                  const textoResumen = extraerSeccion(resumen, 'RESUMEN') || ''
                  const textoNormas = extraerSeccion(resumen, 'NORMAS') || ''
                  const tipo = extraerSeccion(resumen, 'TIPO') || clasificacion
                  const fecha = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
                  const doc = new jsPDF()
                  const margen = 20
                  const ancho = doc.internal.pageSize.getWidth() - margen * 2
                  let y = margen
                  const escribir = (texto, bold = false, size = 10) => {
                    doc.setFontSize(size); doc.setFont('helvetica', bold ? 'bold' : 'normal')
                    doc.splitTextToSize(texto, ancho).forEach(l => {
                      if (y > doc.internal.pageSize.getHeight() - margen) { doc.addPage(); y = margen }
                      doc.text(l, margen, y); y += size * 0.5 + 2
                    })
                  }
                  const seccion = (titulo, contenido) => {
                    if (!contenido) return
                    doc.setDrawColor(180,180,180); doc.line(margen, y, margen+ancho, y); y += 5
                    escribir(titulo, true, 11); y += 2
                    escribir(contenido, false, 10); y += 5
                  }
                  doc.setTextColor(40,40,40)
                  escribir('SIGJEP — Sistema Inteligente de Gestión Jurídica', true, 13); y += 2
                  escribir('Asistente Jurídico con IA para Alcaldías Colombianas', false, 10); y += 2
                  escribir(`Fecha: ${fecha}   |   Expediente: ${expedienteId || 'No asignado'}   |   Tipo: ${tipo}`, false, 9); y += 4
                  seccion('PARTES', partes)
                  seccion('HECHOS', hechos)
                  seccion('PRETENSIONES', pretensiones)
                  seccion('ANÁLISIS JURÍDICO', textoResumen)
                  seccion('NORMAS APLICABLES', textoNormas)
                  doc.setDrawColor(180,180,180); doc.line(margen, y, margen+ancho, y); y += 4
                  doc.setFontSize(8); doc.setTextColor(150,150,150)
                  doc.text('Documento generado automáticamente por IA — Requiere revisión humana antes de ser oficial.', margen, y)
                  doc.save(`resumen_exp${expedienteId || 'sin_exp'}.pdf`)
                }}
              >
                📄 Resumen PDF
              </button>
              <button
                className="nuevo"
                disabled={!resumen}
                style={{ flex: 1 }}
                onClick={async () => {
                  if (!resumen) return
                  const partes = extraerSeccion(resumen, 'PARTES') || ''
                  const hechos = extraerSeccion(resumen, 'HECHOS') || ''
                  const pretensiones = extraerSeccion(resumen, 'PRETENSIONES') || ''
                  const textoResumen = extraerSeccion(resumen, 'RESUMEN') || ''
                  const textoNormas = extraerSeccion(resumen, 'NORMAS') || ''
                  const tipo = extraerSeccion(resumen, 'TIPO') || clasificacion
                  const fecha = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
                  const p = (texto, bold = false, size = 22) =>
                    new Paragraph({ children: [new TextRun({ text: texto, bold, size, font: 'Times New Roman' })], spacing: { after: 120 } })
                  const titulo = (texto) => p(texto, true, 24)
                  const bloque = (contenido) => contenido.split('\n').map(l => p(l))
                  const espacio = new Paragraph({ children: [new TextRun({ text: ' ' })], spacing: { after: 200 } })
                  const doc = new Document({
                    sections: [{ properties: { page: { margin: { top: 1440, bottom: 1440, left: 1800, right: 1440 } } }, children: [
                      p('SIGJEP — Sistema Inteligente de Gestión Jurídica', true, 26),
                      p('Asistente Jurídico con IA para Alcaldías Colombianas', false, 20),
                      p(`Fecha: ${fecha}   |   Expediente: ${expedienteId || 'No asignado'}   |   Tipo: ${tipo}`, false, 18),
                      espacio,
                      ...(partes ? [titulo('PARTES'), ...bloque(partes), espacio] : []),
                      ...(hechos ? [titulo('HECHOS'), ...bloque(hechos), espacio] : []),
                      ...(pretensiones ? [titulo('PRETENSIONES'), ...bloque(pretensiones), espacio] : []),
                      ...(textoResumen ? [titulo('ANÁLISIS JURÍDICO'), ...bloque(textoResumen), espacio] : []),
                      ...(textoNormas ? [titulo('NORMAS APLICABLES'), ...bloque(textoNormas), espacio] : []),
                      p('Documento generado automáticamente por IA — Requiere revisión humana antes de ser oficial.', false, 16),
                    ]}]
                  })
                  const blob = await Packer.toBlob(doc)
                  saveAs(blob, `resumen_exp${expedienteId || 'sin_exp'}.docx`)
                }}
              >
                📝 Resumen Word
              </button>
            </div>
          </div>

          {/* Card 3 — Descargas */}
          <div className="ia-card">
            <h3>Descargas</h3>

            <button className="nuevo" onClick={descargarPDF}
              style={{ marginBottom: '8px', width: '100%' }}
              disabled={!resumen}>
              📄 Descargar borrador PDF
            </button>

            <button className="nuevo" onClick={descargarBorradorWord}
              style={{ width: '100%', background: '#1d4ed8' }}
              disabled={!resumen}>
              📝 Descargar borrador Word
            </button>

            <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '12px', lineHeight: '1.5' }}>
              ⚠️ Este documento es solo una <strong>guía generada por IA</strong>. Descárgalo, revísalo y edítalo antes de usarlo oficialmente. No tiene validez jurídica sin revisión humana.
            </p>
          </div>

        </div>
      </div>
    </main>
  )
}
