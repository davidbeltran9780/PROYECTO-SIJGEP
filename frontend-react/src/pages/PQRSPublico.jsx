import { useState, useEffect } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

const TIPOS = [
  { value: 'peticion',         label: 'Petición',            dias: 15, anonima: false },
  { value: 'queja',            label: 'Queja',               dias: 15, anonima: true  },
  { value: 'reclamo',          label: 'Reclamo',             dias: 15, anonima: true  },
  { value: 'sugerencia',       label: 'Sugerencia',          dias: 15, anonima: true  },
  { value: 'derecho_peticion', label: 'Derecho de Petición', dias: 10, anonima: false },
]

const DOCS = ['Cédula de Ciudadanía', 'Tarjeta de Identidad', 'Cédula Extranjera', 'Pasaporte', 'NIT']

function diasHabilesDesde(dias) {
  const fecha = new Date()
  let contados = 0
  while (contados < dias) {
    fecha.setDate(fecha.getDate() + 1)
    const dia = fecha.getDay()
    if (dia !== 0 && dia !== 6) contados++
  }
  return fecha.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
}

const estiloLabel = { color: 'rgba(255,255,255,0.85)', fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }

export default function PQRSPublico() {
  useEffect(() => {
    document.body.classList.add('login-body')
    return () => document.body.classList.remove('login-body')
  }, [])

  // paso: 1 = formulario (con verificación inline), 2 = exitoso
  const [paso, setPaso] = useState(1)
  const [enviando, setEnviando] = useState(false)
  const [radicado, setRadicado] = useState('')
  const [error, setError] = useState('')

  // Verificación de correo (para anónimos)
  const [codigoEnviado, setCodigoEnviado] = useState(false)
  const [codigoVerificado, setCodigoVerificado] = useState(false)
  const [codigoInput, setCodigoInput] = useState('')
  const [enviandoCodigo, setEnviandoCodigo] = useState(false)
  const [verificandoCodigo, setVerificandoCodigo] = useState(false)
  const [mensajeCodigo, setMensajeCodigo] = useState('')

  const [form, setForm] = useState({
    tipo: '',
    anonima: false,
    nombre: '',
    tipo_doc: 'Cédula de Ciudadanía',
    numero_doc: '',
    correo: '',
    telefono: '',
    municipio: '',
    asunto: '',
    descripcion: '',
    acepta_datos: false,
  })

  const tipoInfo = TIPOS.find(t => t.value === form.tipo)
  const puedeAnonima = tipoInfo?.anonima || false

  const set = (campo, valor) => {
    setForm(prev => ({ ...prev, [campo]: valor }))
    // Si cambia el correo, resetear verificación
    if (campo === 'correo') {
      setCodigoEnviado(false)
      setCodigoVerificado(false)
      setCodigoInput('')
      setMensajeCodigo('')
    }
    // Si desmarca anónimo, limpiar verificación
    if (campo === 'anonima' && !valor) {
      setCodigoEnviado(false)
      setCodigoVerificado(false)
      setCodigoInput('')
      setMensajeCodigo('')
    }
  }

  const enviarCodigo = async () => {
    if (!form.correo.trim()) return setMensajeCodigo('Ingresa el correo primero')
    setEnviandoCodigo(true)
    setMensajeCodigo('')
    try {
      await axios.post(`${API_URL}/pqrs/verificar-correo`, { correo: form.correo.trim() })
      setCodigoEnviado(true)
      setCodigoVerificado(false)
      setCodigoInput('')
      setMensajeCodigo('✅ Código enviado al correo')
    } catch (e) {
      setMensajeCodigo('❌ ' + (e.response?.data?.detail || 'No se pudo enviar el código'))
    } finally {
      setEnviandoCodigo(false)
    }
  }

  const verificarCodigo = async () => {
    if (!codigoInput.trim()) return setMensajeCodigo('Ingresa el código')
    setVerificandoCodigo(true)
    setMensajeCodigo('')
    try {
      const res = await axios.post(`${API_URL}/pqrs/confirmar-codigo`, {
        correo: form.correo.trim(),
        codigo: codigoInput.trim(),
      })
      if (res.data.valido) {
        setCodigoVerificado(true)
        setMensajeCodigo('✅ Correo verificado correctamente')
      } else {
        setMensajeCodigo('❌ ' + (res.data.detalle || 'Código incorrecto'))
      }
    } catch (e) {
      setMensajeCodigo('❌ ' + (e.response?.data?.detail || 'Error al verificar'))
    } finally {
      setVerificandoCodigo(false)
    }
  }

  const enviar = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.tipo) return setError('Selecciona el tipo de solicitud')
    if (!form.anonima && !form.nombre.trim()) return setError('El nombre es obligatorio')
    if (!form.anonima && !form.numero_doc.trim()) return setError('El número de documento es obligatorio')
    if (!form.correo.trim()) return setError('El correo es obligatorio para notificarte el radicado')
    if (!form.municipio.trim()) return setError('El municipio es obligatorio')
    if (!form.descripcion.trim()) return setError('Describe tu solicitud')
    if (!form.acepta_datos) return setError('Debes aceptar el tratamiento de datos personales (Ley 1581/2012)')
    if (form.anonima && !codigoVerificado) return setError('Debes verificar tu correo electrónico antes de radicar una solicitud anónima')

    const descripcionCompleta = [
      '━━━ DATOS DEL SOLICITANTE ━━━',
      `Municipio: ${form.municipio}`,
      form.telefono ? `Teléfono: ${form.telefono}` : null,
      !form.anonima ? `Documento: ${form.tipo_doc} ${form.numero_doc}` : null,
      form.asunto ? `\nAsunto: ${form.asunto}` : null,
      '\n━━━ DESCRIPCIÓN ━━━',
      form.descripcion,
    ].filter(Boolean).join('\n')

    setEnviando(true)
    try {
      const res = await axios.post(`${API_URL}/pqrs`, {
        nombre_ciudadano: form.anonima ? 'Anónimo' : form.nombre.trim(),
        correo: form.correo.trim(),
        tipo: form.tipo,
        descripcion: descripcionCompleta,
      })
      setRadicado(res.data.numero_radicado)
      setPaso(2)
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al enviar la solicitud. Intenta nuevamente.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1E3A8A, #E5B93D)',
      position: 'fixed', inset: 0,
      overflowY: 'auto',
      display: 'flex', justifyContent: 'center',
      alignItems: 'flex-start', padding: '40px 16px',
      boxSizing: 'border-box',
    }}>
      <div className="login-card" style={{ maxWidth: '580px', width: '100%' }}>
        <img src="/Logo.png" alt="SIGJEP" className="login-logo" />

        {/* ── PASO 2: Confirmación ── */}
        {paso === 2 ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
            <h2 style={{ marginBottom: '8px' }}>¡Solicitud enviada!</h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', marginBottom: '20px' }}>
              Tu solicitud fue radicada correctamente. Se envió el número de radicado a <strong>{form.correo}</strong>.
            </p>

            <div style={{
              background: 'rgba(255,255,255,0.12)', borderRadius: '12px',
              padding: '20px', marginBottom: '20px', textAlign: 'left'
            }}>
              <p style={{ color: 'white', margin: '6px 0', fontSize: '13px' }}>
                <strong>Número de radicado:</strong>
              </p>
              <p style={{
                color: '#fbbf24', fontWeight: 'bold', fontSize: '15px',
                fontFamily: 'monospace', letterSpacing: '0.05em',
                background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px',
                wordBreak: 'break-all', margin: '4px 0 16px'
              }}>
                {radicado}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px', margin: '4px 0' }}>
                📧 También te lo enviamos al correo registrado.
              </p>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px', margin: '4px 0' }}>
                ⏱ Fecha estimada de respuesta: <strong style={{ color: 'white' }}>
                  {diasHabilesDesde(tipoInfo?.dias || 15)}
                </strong> ({tipoInfo?.dias || 15} días hábiles — Ley 1755/2015)
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link to="/consulta-estado" className="btn-login" style={{ textAlign: 'center', textDecoration: 'none' }}>
                🔍 Consultar estado con el radicado
              </Link>
              <Link to="/" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px' }}>
                ← Volver al inicio
              </Link>
            </div>
          </div>

        ) : (
          /* ── PASO 1: Formulario ── */
          <>
            <h2 style={{ marginBottom: '4px' }}>Radicar PQRS</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', marginBottom: '20px' }}>
              Peticiones, Quejas, Reclamos y Sugerencias — Ley 1437/2011 · Ley 1755/2015
            </p>

            <form onSubmit={enviar}>

              {/* Tipo */}
              <label style={estiloLabel}>Tipo de solicitud *</label>
              <select
                required
                value={form.tipo}
                onChange={e => { set('tipo', e.target.value); set('anonima', false) }}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', marginBottom: '4px', fontSize: '14px' }}
              >
                <option value="">Seleccionar tipo...</option>
                {TIPOS.map(t => (
                  <option key={t.value} value={t.value}>
                    {t.label} — respuesta en {t.dias} días hábiles
                  </option>
                ))}
              </select>

              {tipoInfo && (
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', marginBottom: '14px' }}>
                  ⏱ La entidad tiene hasta <strong style={{ color: 'white' }}>{tipoInfo.dias} días hábiles</strong> para responder (Ley 1755/2015)
                </p>
              )}

              {/* Opción anónima */}
              {puedeAnonima && (
                <label style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  color: 'rgba(255,255,255,0.85)', fontSize: '13px',
                  marginBottom: '14px', cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={form.anonima}
                    onChange={e => set('anonima', e.target.checked)}
                    style={{ width: '16px', height: '16px' }}
                  />
                  Enviar de forma anónima
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>(quejas, reclamos y sugerencias)</span>
                </label>
              )}

              {/* Datos personales — solo si no es anónimo */}
              {!form.anonima && (
                <>
                  <label style={estiloLabel}>Nombre completo *</label>
                  <input
                    type="text"
                    placeholder="Nombre y apellidos"
                    value={form.nombre}
                    onChange={e => set('nombre', e.target.value)}
                    style={{ marginBottom: '10px' }}
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                    <div>
                      <label style={estiloLabel}>Tipo de documento *</label>
                      <select
                        value={form.tipo_doc}
                        onChange={e => set('tipo_doc', e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', fontSize: '13px' }}
                      >
                        {DOCS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={estiloLabel}>Número de documento *</label>
                      <input
                        type="text"
                        placeholder="Ej: 1234567890"
                        value={form.numero_doc}
                        onChange={e => set('numero_doc', e.target.value)}
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Correo */}
              <label style={estiloLabel}>
                Correo electrónico * <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: '400' }}>(recibirás el número de radicado)</span>
              </label>
              <input
                type="email"
                placeholder="tucorreo@ejemplo.com"
                value={form.correo}
                onChange={e => set('correo', e.target.value)}
                style={{ marginBottom: '10px' }}
              />

              {/* Teléfono y Municipio */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <label style={estiloLabel}>Teléfono</label>
                  <input
                    type="tel"
                    placeholder="Ej: 3001234567"
                    value={form.telefono}
                    onChange={e => set('telefono', e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={estiloLabel}>Municipio *</label>
                  <input
                    type="text"
                    placeholder="Ej: Medellín"
                    value={form.municipio}
                    onChange={e => set('municipio', e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {/* Asunto */}
              <label style={estiloLabel}>Asunto (resumen breve)</label>
              <input
                type="text"
                placeholder="Ej: Solicitud de información sobre impuesto predial"
                value={form.asunto}
                onChange={e => set('asunto', e.target.value)}
                style={{ marginBottom: '10px' }}
              />

              {/* Descripción */}
              <label style={estiloLabel}>
                Descripción detallada * <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: '400' }}>(hechos y solicitud)</span>
              </label>
              <textarea
                placeholder="Describe detalladamente los hechos, lo que solicitas y el resultado esperado..."
                required
                value={form.descripcion}
                onChange={e => set('descripcion', e.target.value)}
                rows={5}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', fontSize: '13px', resize: 'vertical', marginBottom: '14px' }}
              />

              {/* Tratamiento de datos */}
              <label style={{
                display: 'flex', alignItems: 'flex-start', gap: '10px',
                color: 'rgba(255,255,255,0.8)', fontSize: '12px',
                marginBottom: '16px', cursor: 'pointer', lineHeight: '1.5'
              }}>
                <input
                  type="checkbox"
                  checked={form.acepta_datos}
                  onChange={e => set('acepta_datos', e.target.checked)}
                  style={{ marginTop: '2px', width: '16px', height: '16px', flexShrink: 0 }}
                />
                <span>
                  Autorizo el tratamiento de mis datos personales conforme a la{' '}
                  <strong style={{ color: 'white' }}>Ley 1581 de 2012</strong> (Protección de Datos Personales).
                  La información será usada únicamente para gestionar esta solicitud. *
                </span>
              </label>

              {/* ── Verificación de correo (solo anónimos) ── */}
              {form.anonima && (
                <div style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: codigoVerificado ? '1px solid #86efac' : '1px solid rgba(255,255,255,0.25)',
                  borderRadius: '10px',
                  padding: '14px',
                  marginBottom: '16px',
                }}>
                  <p style={{ color: 'white', fontWeight: '600', fontSize: '13px', margin: '0 0 8px' }}>
                    🔐 Verificación de correo electrónico
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', margin: '0 0 12px' }}>
                    Al ser una solicitud anónima, necesitamos verificar que el correo existe para poder enviarte la respuesta.
                  </p>

                  {!codigoVerificado ? (
                    <>
                      <button
                        type="button"
                        onClick={enviarCodigo}
                        disabled={enviandoCodigo || !form.correo.trim()}
                        style={{
                          width: '100%', padding: '10px', borderRadius: '8px',
                          background: '#1e40af', color: 'white', border: 'none',
                          cursor: 'pointer', fontSize: '13px', fontWeight: '600',
                          marginBottom: '10px', opacity: (!form.correo.trim() || enviandoCodigo) ? 0.6 : 1
                        }}
                      >
                        {enviandoCodigo ? '⏳ Enviando...' : codigoEnviado ? '🔄 Reenviar código' : '📧 Enviar código de verificación'}
                      </button>

                      {codigoEnviado && (
                        <>
                          <label style={{ ...estiloLabel, marginTop: '4px' }}>
                            Código de verificación *
                          </label>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                              type="text"
                              placeholder="Código de 6 dígitos"
                              value={codigoInput}
                              onChange={e => setCodigoInput(e.target.value)}
                              style={{
                                flex: 1, letterSpacing: '0.15em',
                                fontSize: '18px', textAlign: 'center', marginBottom: 0
                              }}
                            />
                            <button
                              type="button"
                              onClick={verificarCodigo}
                              disabled={verificandoCodigo || !codigoInput.trim()}
                              style={{
                                padding: '10px 16px', borderRadius: '8px',
                                background: '#15803d', color: 'white', border: 'none',
                                cursor: 'pointer', fontSize: '13px', fontWeight: '600',
                                whiteSpace: 'nowrap',
                                opacity: (!codigoInput.trim() || verificandoCodigo) ? 0.6 : 1
                              }}
                            >
                              {verificandoCodigo ? '...' : 'Verificar'}
                            </button>
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <p style={{ color: '#86efac', fontWeight: '600', fontSize: '13px', margin: 0 }}>
                      ✅ Correo verificado — puedes radicar la solicitud
                    </p>
                  )}

                  {mensajeCodigo && (
                    <p style={{
                      fontSize: '12px', marginTop: '8px', marginBottom: 0,
                      color: mensajeCodigo.startsWith('✅') ? '#86efac' : '#fca5a5'
                    }}>
                      {mensajeCodigo}
                    </p>
                  )}
                </div>
              )}

              {error && (
                <p style={{
                  background: 'rgba(220,38,38,0.2)', border: '1px solid rgba(220,38,38,0.4)',
                  borderRadius: '8px', padding: '10px 14px',
                  color: '#fca5a5', fontSize: '13px', marginBottom: '14px'
                }}>
                  ⚠️ {error}
                </p>
              )}

              <button
                type="submit"
                className="btn-login"
                disabled={enviando || (form.anonima && !codigoVerificado)}
                style={{ opacity: (form.anonima && !codigoVerificado) ? 0.5 : 1 }}
              >
                {enviando ? '⏳ Enviando...' : '📨 Radicar solicitud'}
              </button>
            </form>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <Link to="/" style={{ color: 'rgba(255,255,255,0.8)' }}>← Volver al inicio</Link>
              <Link to="/consulta-estado" style={{ color: 'rgba(255,255,255,0.8)' }}>Consultar radicado →</Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
