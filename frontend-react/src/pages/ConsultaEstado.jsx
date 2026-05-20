import { useState } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

export default function ConsultaEstado() {
  const [radicado, setRadicado] = useState('')
  const [resultado, setResultado] = useState(null)
  const [error, setError] = useState('')
  const [buscando, setBuscando] = useState(false)

  const buscar = async (e) => {
    e.preventDefault()
    setError('')
    setResultado(null)
    setBuscando(true)

    try {
      const res = await axios.get(`${API_URL}/pqrs/consultar/${radicado}`)
      setResultado(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'No se encontró el radicado')
    } finally {
      setBuscando(false)
    }
  }

  const colorEstado = (estado) => {
    const colores = {
      recibido: '#3B82F6',
      en_proceso: '#F59E0B',
      respondido: '#10B981',
      cerrado: '#6B7280',
    }
    return colores[estado] || '#6B7280'
  }

  return (
    <div style={{
      background: 'linear-gradient(90deg, #E5B93D, #1E3A8A)',
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <div className="login-card" style={{ maxWidth: '500px' }}>
        <img src="/Logo.png" alt="SIGJEP" className="login-logo" />
        <h2>Consultar estado de PQRS</h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', marginBottom: '20px' }}>
          Ingrese su número de radicado para ver el estado de su solicitud
        </p>

        <form onSubmit={buscar}>
          <input
            type="text"
            placeholder="Ej: PQRS-20260519141523-456"
            required
            value={radicado}
            onChange={e => setRadicado(e.target.value)}
          />
          <button type="submit" className="btn-login" disabled={buscando}>
            {buscando ? 'Buscando...' : 'Consultar'}
          </button>
        </form>

        {error && (
          <p className="error" style={{ display: 'block', marginTop: '15px' }}>{error}</p>
        )}

        {resultado && (
          <div style={{
            marginTop: '20px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'left',
          }}>
            <p style={{ color: 'white', margin: '8px 0' }}>
              <strong>Radicado:</strong> {resultado.numero_radicado}
            </p>
            <p style={{ color: 'white', margin: '8px 0' }}>
              <strong>Tipo:</strong> {resultado.tipo}
            </p>
            <p style={{ color: 'white', margin: '8px 0' }}>
              <strong>Estado:</strong>{' '}
              <span style={{
                background: colorEstado(resultado.estado),
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'bold',
              }}>
                {resultado.estado}
              </span>
            </p>
            <p style={{ color: 'white', margin: '8px 0' }}>
              <strong>Fecha:</strong> {new Date(resultado.fecha_creacion).toLocaleDateString('es-CO')}
            </p>
          </div>
        )}

        <p style={{ marginTop: '20px', fontSize: '13px' }}>
          <a href="/" style={{ color: 'white' }}>← Volver al inicio</a>
        </p>
      </div>
    </div>
  )
}
