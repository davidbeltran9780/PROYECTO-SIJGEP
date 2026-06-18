const estilo = (disabled, activo = false) => ({
  padding: '4px 10px', borderRadius: '6px', border: '1px solid #e5e7eb',
  fontSize: '13px', cursor: disabled ? 'not-allowed' : 'pointer',
  background: activo ? '#1e3a8a' : disabled ? '#f9fafb' : 'white',
  color: activo ? 'white' : disabled ? '#d1d5db' : '#374151',
  fontWeight: activo ? '700' : '400',
  lineHeight: 1.4,
})

export default function Paginacion({ total, pagina, setPagina, porPagina = 10 }) {
  const totalPaginas = Math.ceil(total / porPagina)
  if (totalPaginas <= 1) return null

  const paginas = Array.from({ length: totalPaginas }, (_, i) => i + 1)
    .filter(p => p === 1 || p === totalPaginas || Math.abs(p - pagina) <= 1)
    .reduce((acc, p, i, arr) => {
      if (i > 0 && p - arr[i - 1] > 1) acc.push('…')
      acc.push(p)
      return acc
    }, [])

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 4px', fontSize: '13px', color: '#6b7280', flexWrap: 'wrap', gap: '8px',
    }}>
      <span>
        {Math.min((pagina - 1) * porPagina + 1, total)}–{Math.min(pagina * porPagina, total)} de {total} registros
      </span>
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
        <button onClick={() => setPagina(1)} disabled={pagina === 1} style={estilo(pagina === 1)}>«</button>
        <button onClick={() => setPagina(p => p - 1)} disabled={pagina === 1} style={estilo(pagina === 1)}>‹</button>
        {paginas.map((p, i) =>
          p === '…'
            ? <span key={`e${i}`} style={{ padding: '4px 6px', color: '#9ca3af' }}>…</span>
            : <button key={p} onClick={() => setPagina(p)} style={estilo(false, p === pagina)}>{p}</button>
        )}
        <button onClick={() => setPagina(p => p + 1)} disabled={pagina === totalPaginas} style={estilo(pagina === totalPaginas)}>›</button>
        <button onClick={() => setPagina(totalPaginas)} disabled={pagina === totalPaginas} style={estilo(pagina === totalPaginas)}>»</button>
      </div>
    </div>
  )
}
