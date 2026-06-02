import { useState, useCallback } from 'react'

function ConfirmModal({ mensaje, descripcion, onConfirm, onCancel }) {
  return (
    <div className="modal" style={{ display: 'flex' }}>
      <div className="modal-contenido" style={{ maxWidth: '400px', textAlign: 'center' }}>
        <p style={{ fontSize: '22px', marginBottom: '8px' }}>⚠️</p>
        <h3 style={{ marginBottom: '10px', fontSize: '16px' }}>{mensaje}</h3>
        {descripcion && (
          <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '16px' }}>{descripcion}</p>
        )}
        <div className="form-botones" style={{ justifyContent: 'center', marginTop: '20px' }}>
          <button className="btn-cancelar" onClick={onCancel}>Cancelar</button>
          <button className="btn-guardar" onClick={onConfirm}>Confirmar</button>
        </div>
      </div>
    </div>
  )
}

export function useConfirm() {
  const [estado, setEstado] = useState(null)

  const confirmar = useCallback((mensaje, descripcion = '') => {
    return new Promise(resolve => setEstado({ mensaje, descripcion, resolve }))
  }, [])

  const ConfirmUI = estado ? (
    <ConfirmModal
      mensaje={estado.mensaje}
      descripcion={estado.descripcion}
      onConfirm={() => { estado.resolve(true);  setEstado(null) }}
      onCancel={()  => { estado.resolve(false); setEstado(null) }}
    />
  ) : null

  return { confirmar, ConfirmUI }
}

export default ConfirmModal
