import { useState, useEffect, useRef } from 'react'

const FONT_STEP = 2
const FONT_MIN = 10
const FONT_MAX = 22
const FONT_DEFAULT = 13

export default function Accesibilidad() {
  const [abierto, setAbierto] = useState(false)
  const [fontSize, setFontSize] = useState(FONT_DEFAULT)
  const [contraste, setContraste] = useState(false)
  const [dislexia, setDislexia] = useState(false)
  const [daltonismo, setDaltonismo] = useState(false)
  const [lector, setLector] = useState(false)
  const lectorRef = useRef(false)
  const panelRef = useRef(null)

  // Aplicar fontSize solo cuando cambia del default
  useEffect(() => {
    let tag = document.getElementById('acc-font-style')
    if (fontSize === FONT_DEFAULT) {
      if (tag) tag.textContent = ''
      return
    }
    if (!tag) {
      tag = document.createElement('style')
      tag.id = 'acc-font-style'
      document.head.appendChild(tag)
    }
    const b = fontSize
    tag.textContent = `
      body, body p, body span, body td, body th, body li,
      body a, body label, body input, body select,
      body textarea, body button, body small, body strong,
      body div, body section {
        font-size: ${b}px !important;
        word-break: break-word !important;
        overflow-wrap: break-word !important;
      }
      body h1 { font-size: ${Math.round(b * 2)}px !important; }
      body h2 { font-size: ${Math.round(b * 1.6)}px !important; }
      body h3 { font-size: ${Math.round(b * 1.3)}px !important; }
      body h4, body h5, body h6 { font-size: ${Math.round(b * 1.1)}px !important; }
      body input, body select, body textarea { max-width: 100% !important; box-sizing: border-box !important; }
      body .modal-contenido { max-width: 100% !important; box-sizing: border-box !important; }
    `
  }, [fontSize])

  // Aplicar clases al body
  useEffect(() => {
    document.body.classList.toggle('acc-contraste', contraste)
  }, [contraste])

  useEffect(() => {
    document.body.classList.toggle('acc-dislexia', dislexia)
  }, [dislexia])

  useEffect(() => {
    document.body.classList.toggle('acc-daltonismo', daltonismo)
  }, [daltonismo])

  // Lector de pantalla con debounce — espera que el mouse se detenga
  useEffect(() => {
    lectorRef.current = lector
    let timer = null
    let ultimoTexto = ''

    const handler = (e) => {
      if (!lectorRef.current) return
      const el = e.target
      const texto = (el.innerText || el.alt || el.placeholder || el.title || '').trim()
      if (!texto || texto === ultimoTexto) return

      clearTimeout(timer)
      timer = setTimeout(() => {
        ultimoTexto = texto
        window.speechSynthesis.cancel()
        const u = new SpeechSynthesisUtterance(texto)
        u.lang = 'es-ES'
        u.rate = 1
        window.speechSynthesis.speak(u)
      }, 400)
    }

    const cancelar = () => {
      clearTimeout(timer)
    }

    document.addEventListener('mouseover', handler)
    document.addEventListener('mouseout', cancelar)

    return () => {
      document.removeEventListener('mouseover', handler)
      document.removeEventListener('mouseout', cancelar)
      clearTimeout(timer)
      window.speechSynthesis.cancel()
    }
  }, [lector])

  // Cerrar panel al hacer clic afuera
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setAbierto(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const resetear = () => {
    setFontSize(FONT_DEFAULT)
    setContraste(false)
    setDislexia(false)
    setDaltonismo(false)
    setLector(false)
    const tag = document.getElementById('acc-font-style')
    if (tag) tag.textContent = ''
    window.speechSynthesis.cancel()
  }

  const aumentar = () => setFontSize(f => Math.min(f + FONT_STEP, FONT_MAX))
  const disminuir = () => setFontSize(f => Math.max(f - FONT_STEP, FONT_MIN))

  return (
    <div className="acc-widget" ref={panelRef}>
      <button
        className="acc-boton-flotante"
        onClick={() => setAbierto(o => !o)}
        title="Opciones de accesibilidad"
        aria-label="Abrir panel de accesibilidad"
      >
        🤝
      </button>

      {abierto && (
        <div className="acc-panel">
          <div className="acc-panel-titulo">Accesibilidad</div>

          <div className="acc-grid">
            <button className="acc-opcion" onClick={aumentar} title="Aumentar letra">
              <span className="acc-icono">A+</span>
              <span className="acc-label">Aumentar Letra</span>
            </button>

            <button className="acc-opcion" onClick={disminuir} title="Disminuir letra">
              <span className="acc-icono">A-</span>
              <span className="acc-label">Disminuir Letra</span>
            </button>

            <button
              className={`acc-opcion ${contraste ? 'acc-activo' : ''}`}
              onClick={() => setContraste(c => !c)}
              title="Alto contraste"
            >
              <span className="acc-icono">☀️</span>
              <span className="acc-label">Contraste</span>
            </button>

            <button
              className={`acc-opcion ${dislexia ? 'acc-activo' : ''}`}
              onClick={() => setDislexia(d => !d)}
              title="Fuente para dislexia"
            >
              <span className="acc-icono">Aᵦ</span>
              <span className="acc-label">Dislexia</span>
            </button>

            <button
              className={`acc-opcion ${lector ? 'acc-activo' : ''}`}
              onClick={() => setLector(l => !l)}
              title="Lector de pantalla"
            >
              <span className="acc-icono">👂</span>
              <span className="acc-label">Lector</span>
            </button>

            <button
              className={`acc-opcion ${daltonismo ? 'acc-activo' : ''}`}
              onClick={() => setDaltonismo(d => !d)}
              title="Modo daltonismo"
            >
              <span className="acc-icono">👁️</span>
              <span className="acc-label">Daltonismo</span>
            </button>
          </div>

          <button className="acc-reset" onClick={resetear} title="Restablecer todo">
            ↺ Restablecer
          </button>
        </div>
      )}
    </div>
  )
}
