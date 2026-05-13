export default function Spinner({ texto = 'Procesando con IA...' }) {
  return (
    <>
      <div className="overlay-spinner" />
      <div className="spinner-contenedor">
        <div className="spinner" />
        <p style={{ marginTop: '15px', color: 'var(--texto)' }}>{texto}</p>
      </div>
    </>
  )
}