import { useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

const TIPOS = [
  { value: 'tutela', label: 'Tutela' },
  { value: 'demanda', label: 'Demanda' },
  { value: 'pqrs', label: 'PQRS' },
  { value: 'derecho_peticion', label: 'Derecho de petición' },
  { value: 'peticion', label: 'Petición' },
  { value: 'queja', label: 'Queja' },
  { value: 'reclamo', label: 'Reclamo' },
  { value: 'sugerencia', label: 'Sugerencia' },
  { value: 'otro', label: 'Otro' },
]

const colorEstado = (estado) => {
  const colores = {
    recibido: '#3B82F6',
    activo: '#3B82F6',
    en_proceso: '#F59E0B',
    respondido: '#10B981',
    cerrado: '#6B7280',
    archivado: '#6B7280',
  }
  return colores[estado] || '#6B7280'
}

function ResultadoCard({ item }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.12)',
      borderRadius: '10px',
      padding: '16px 20px',
      marginBottom: '10px',
      textAlign: 'left',
    }}>
      <p style={{ color: 'white', margin: '5px 0' }}>
        <strong>Radicado:</strong> {item.numero_radicado}
      </p>
      <p style={{ color: 'white', margin: '5px 0' }}>
        <strong>Tipo:</strong> {item.tipo}
      </p>
      <p style={{ color: 'white', margin: '5px 0' }}>
        <strong>Estado:</strong>{' '}
        <span style={{
          background: colorEstado(item.estado),
          padding: '3px 10px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 'bold',
        }}>
          {item.estado}
        </span>
      </p>
      <p style={{ color: 'rgba(255,255,255,0.75)', margin: '5px 0', fontSize: '13px' }}>
        <strong>Fecha:</strong>{' '}
        {item.fecha ? new Date(item.fecha).toLocaleDateString('es-CO') : '—'}
      </p>
      {item.origen && (
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', margin: '5px 0' }}>
          Origen: {item.origen === 'pqrs' ? 'PQRS' : 'Caso jurídico'}
        </p>
      )}
    </div>
  )
}

export default function ConsultaProcesos() {
  const [modo, setModo] = useState('radicado') // 'radicado' | 'nombre' | 'tipo'
  const [valor, setValor] = useState('')
  const [tipoSeleccionado, setTipoSeleccionado] = useState('')
  const [resultados, setResultados] = useState(null)
  const [error, setError] = useState('')
  const [buscando, setBuscando] = useState(false)

  const buscar = async (e) => {
    e.preventDefault()
    setError('')
    setResultados(null)
    setBuscando(true)

    try {
      let res
      if (modo === 'radicado') {
        res = await axios.get(`${API_URL}/consulta/radicado/${valor.trim()}`)
        // Este endpoint devuelve un solo objeto
        setResultados([res.data])
      } else if (modo === 'nombre') {
        res = await axios.get(`${API_URL}/consulta/nombre/${encodeURIComponent(valor.trim())}`)
        setResultados(res.data)
      } else if (modo === 'tipo') {
        res = await axios.get(`${API_URL}/consulta/tipo/${tipoSeleccionado}`)
        setResultados(res.data)
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'No se encontraron resultados')
    } finally {
      setBuscando(false)
    }
  }

  const limpiar = () => {
    setValor('')
    setTipoSeleccionado('')
    setResultados(null)
    setError('')
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1E3A8A, #E5B93D)',
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      paddingTop: '40px',
      paddingBottom: '40px',
    }}>
      <div className="login-card" style={{ maxWidth: '560px', width: '100%' }}>
        <img src="/Logo.png" alt="SIGJEP" className="login-logo" />
        <h2 style={{ marginBottom: '6px' }}>Consulta de Procesos</h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', marginBottom: '20px' }}>
          Consulta el estado de tu proceso sin necesidad de crear una cuenta
        </p>

        {/* Selector de modo de búsqueda */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {[
            { key: 'radicado', label: '🔢 Por radicado' },
            { key: 'nombre', label: '👤 Por nombre' },
            { key: 'tipo', label: '📂 Por tipo' },
          ].map(op => (
            <button
              key={op.key}
              type="button"
              onClick={() => { setModo(op.key); limpiar() }}
              style={{
                flex: 1,
                padding: '8px 10px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: modo === op.key ? 'bold' : 'normal',
                background: modo === op.key ? 'white' : 'rgba(255,255,255,0.2)',
                color: modo === op.key ? '#1E3A8A' : 'white',
              }}
            >
              {op.label}
            </button>
          ))}
        </div>

        {/* Formulario */}
        <form onSubmit={buscar}>
          {modo === 'radicado' && (
            <input
              type="text"
              placeholder="Ej: PQRS-20260519141523-456"
              required
              value={valor}
              onChange={e => setValor(e.target.value)}
            />
          )}
          {modo === 'nombre' && (
            <input
              type="text"
              placeholder="Nombre del ciudadano"
              required
              value={valor}
              onChange={e => setValor(e.target.value)}
            />
          )}
          {modo === 'tipo' && (
            <select
              required
              value={tipoSeleccionado}
              onChange={e => setTipoSeleccionado(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', marginBottom: '10px', fontSize: '14px' }}
            >
              <option value="">Seleccionar tipo de proceso</option>
              {TIPOS.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          )}

          <button type="submit" className="btn-login" disabled={buscando}>
            {buscando ? 'Buscando...' : '🔍 Consultar'}
          </button>
        </form>

        {/* Error */}
        {error && (
          <p className="error" style={{ display: 'block', marginTop: '15px' }}>{error}</p>
        )}

        {/* Resultados */}
        {resultados && resultados.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', marginBottom: '10px' }}>
              {resultados.length} resultado(s) encontrado(s)
            </p>
            {resultados.map((item, i) => (
              <ResultadoCard key={i} item={item} />
            ))}
          </div>
        )}

        {/* Links de navegación */}
        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
          <Link to="/" style={{ color: 'rgba(255,255,255,0.8)' }}>← Volver al inicio</Link>
          <Link to="/registro" style={{ color: 'rgba(255,255,255,0.8)' }}>Crear cuenta →</Link>
        </div>
      </div>
    </div>
  )
}
