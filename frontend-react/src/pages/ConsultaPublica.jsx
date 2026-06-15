import { useState, useEffect } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

const MODOS = [
  { key: 'radicado', label: '🔢 Por radicado',    placeholder: 'Ej: PQRS-20260519-456  o  EXP-001' },
  { key: 'nombre',   label: '👤 Por demandante',  placeholder: 'Nombre del demandante o ciudadano'  },
  { key: 'tipo',     label: '📂 Por tipo',         placeholder: ''                                   },
]

const TIPOS = [
  { value: 'tutela',          label: 'Tutela'              },
  { value: 'demanda',         label: 'Demanda'             },
  { value: 'derecho_peticion',label: 'Derecho de Petición' },
  { value: 'peticion',        label: 'Petición'            },
  { value: 'queja',           label: 'Queja'               },
  { value: 'reclamo',         label: 'Reclamo'             },
  { value: 'sugerencia',      label: 'Sugerencia'          },
  { value: 'pqrs',            label: 'PQRS'                },
  { value: 'otro',            label: 'Otro'                },
]

const COLOR_ESTADO = {
  activo:      '#3B82F6',
  recibido:    '#3B82F6',
  en_proceso:  '#F59E0B',
  respondido:  '#10B981',
  cerrado:     '#6B7280',
  archivado:   '#6B7280',
}

const COLOR_ORIGEN = {
  'PQRS':        { bg: 'rgba(139,92,246,0.2)', color: '#c4b5fd', label: 'PQRS'        },
  'Expediente':  { bg: 'rgba(14,165,233,0.2)', color: '#7dd3fc', label: 'Expediente'  },
}

function ResultadoCard({ item }) {
  const origen = COLOR_ORIGEN[item.origen] || COLOR_ORIGEN['Expediente']
  const colorEstado = COLOR_ESTADO[item.estado] || '#6B7280'
  const fecha = item.fecha ? new Date(item.fecha).toLocaleDateString('es-CO', {
    year: 'numeric', month: 'long', day: 'numeric'
  }) : '—'

  return (
    <div style={{
      background: 'rgba(255,255,255,0.08)',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: '12px',
      padding: '16px 18px',
      marginBottom: '10px',
      textAlign: 'left',
    }}>
      {/* Fila superior: radicado + badge origen */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '6px' }}>
        <span style={{
          fontFamily: 'monospace', fontSize: '13px',
          fontWeight: 'bold', color: '#fbbf24', letterSpacing: '0.03em'
        }}>
          {item.numero_radicado}
        </span>
        <span style={{
          background: origen.bg, color: origen.color,
          padding: '2px 10px', borderRadius: '20px',
          fontSize: '11px', fontWeight: '600', letterSpacing: '0.04em'
        }}>
          {origen.label}
        </span>
      </div>

      {/* Datos */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px' }}>
        {item.demandante && item.demandante !== 'Anónimo' && (
          <p style={{ color: 'white', margin: 0, fontSize: '13px', gridColumn: '1/-1' }}>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Demandante / Ciudadano</span><br />
            <strong>{item.demandante}</strong>
          </p>
        )}
        <p style={{ color: 'white', margin: 0, fontSize: '13px' }}>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Tipo</span><br />
          <strong style={{ textTransform: 'capitalize' }}>{item.tipo?.replace(/_/g, ' ')}</strong>
        </p>
        <p style={{ color: 'white', margin: 0, fontSize: '13px' }}>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Estado</span><br />
          <span style={{
            background: colorEstado + '33', color: colorEstado,
            padding: '2px 10px', borderRadius: '12px',
            fontSize: '12px', fontWeight: 'bold',
          }}>
            {item.estado}
          </span>
        </p>
        <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: '12px', gridColumn: '1/-1' }}>
          📅 Radicado: {fecha}
        </p>
      </div>
    </div>
  )
}

export default function ConsultaPublica() {
  useEffect(() => {
    document.body.classList.add('login-body')
    return () => document.body.classList.remove('login-body')
  }, [])

  const [modo, setModo]         = useState('radicado')
  const [valor, setValor]       = useState('')
  const [tipo, setTipo]         = useState('')
  const [resultados, setResultados] = useState(null)
  const [error, setError]       = useState('')
  const [buscando, setBuscando] = useState(false)

  const [filtroTipo, setFiltroTipo] = useState('')

  const limpiar = () => { setValor(''); setTipo(''); setFiltroTipo(''); setResultados(null); setError('') }

  const buscar = async (e) => {
    e.preventDefault()
    setError(''); setResultados(null); setBuscando(true)

    let q
    if (modo === 'tipo') {
      if (!tipo) { setError('Selecciona un tipo de proceso'); setBuscando(false); return }
      if (!filtroTipo.trim()) { setError('Ingresa un radicado o nombre para filtrar'); setBuscando(false); return }
      q = `${tipo}|${filtroTipo.trim()}`
    } else {
      q = valor.trim()
      if (!q) { setError('Ingresa un valor para buscar'); setBuscando(false); return }
    }

    try {
      const res = await axios.get(`${API_URL}/consulta/buscar`, { params: { q, modo } })
      setResultados(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'No se encontraron resultados')
    } finally {
      setBuscando(false)
    }
  }

  const modoActual = MODOS.find(m => m.key === modo)

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
        <h2 style={{ marginBottom: '4px' }}>Consulta de Procesos</h2>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px', marginBottom: '22px' }}>
          Consulta el estado de tutelas, demandas, PQRS y expedientes sin necesidad de cuenta
        </p>

        {/* Selector de modo */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', flexWrap: 'wrap' }}>
          {MODOS.map(m => (
            <button
              key={m.key}
              type="button"
              onClick={() => { setModo(m.key); limpiar() }}
              style={{
                flex: 1, minWidth: '100px',
                padding: '9px 10px',
                borderRadius: '8px', border: 'none',
                cursor: 'pointer', fontSize: '13px',
                fontWeight: modo === m.key ? '700' : '400',
                background: modo === m.key ? 'white' : 'rgba(255,255,255,0.15)',
                color: modo === m.key ? '#1E3A8A' : 'white',
                transition: 'all 0.15s',
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Formulario */}
        <form onSubmit={buscar}>
          {modo === 'tipo' ? (
            <>
              <select
                value={tipo}
                onChange={e => setTipo(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', marginBottom: '10px', fontSize: '14px' }}
              >
                <option value="">Seleccionar tipo de proceso...</option>
                {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <input
                type="text"
                placeholder="Radicado o nombre del demandante / ciudadano"
                value={filtroTipo}
                onChange={e => setFiltroTipo(e.target.value)}
                style={{ marginBottom: '10px' }}
              />
            </>
          ) : (
            <input
              type="text"
              placeholder={modoActual?.placeholder}
              required
              value={valor}
              onChange={e => setValor(e.target.value)}
              style={{ marginBottom: '10px' }}
            />
          )}

          <button type="submit" className="btn-login" disabled={buscando}>
            {buscando ? '⏳ Buscando...' : '🔍 Consultar'}
          </button>
        </form>

        {/* Error */}
        {error && (
          <p style={{
            background: 'rgba(220,38,38,0.18)', border: '1px solid rgba(220,38,38,0.35)',
            borderRadius: '8px', padding: '10px 14px',
            color: '#fca5a5', fontSize: '13px', marginTop: '14px'
          }}>
            ⚠️ {error}
          </p>
        )}

        {/* Resultados */}
        {resultados && (
          <div style={{ marginTop: '20px' }}>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', marginBottom: '12px' }}>
              {resultados.length} resultado(s) encontrado(s)
            </p>
            {resultados.map((item, i) => (
              <ResultadoCard key={i} item={item} />
            ))}
          </div>
        )}

        {/* Links */}
        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', fontSize: '13px', flexWrap: 'wrap', gap: '8px' }}>
          <Link to="/" style={{ color: 'rgba(255,255,255,0.8)' }}>← Inicio</Link>
          <Link to="/pqrs-publico" style={{ color: 'rgba(255,255,255,0.8)' }}>📨 Radicar PQRS →</Link>
        </div>
      </div>
    </div>
  )
}
