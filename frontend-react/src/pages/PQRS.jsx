import { useEffect, useState } from 'react'
import api from '../api/axios'

export default function PQRS() {
  const [pqrs, setPqrs] = useState([])
  const [modal, setModal] = useState(false)
  const rol = localStorage.getItem('rol') || ''
  const esCiudadano = rol === 'ciudadano'
  const [form, setForm] = useState({
    nombre_ciudadano: '',
    correo: '',
    tipo: '',
    descripcion: ''
  })

  useEffect(() => {
    const endpoint = esCiudadano ? '/pqrs/mis-pqrs' : '/pqrs'
    api.get(endpoint).then(res => setPqrs(res.data)).catch(console.error)
  }, [])

  const guardar = async (e) => {
    e.preventDefault()
    try {
      await api.post('/pqrs', form)
      setModal(false)
      const endpoint = esCiudadano ? '/pqrs/mis-pqrs' : '/pqrs'
      const res = await api.get(endpoint)
      setPqrs(res.data)
    } catch { alert('Error al crear PQRS') }
  }

  return (
    <main className="content">
      <div className="top">
        <h2>{esCiudadano ? 'Mis PQRS' : 'Lista de PQRS'}</h2>
        <button className="nuevo" onClick={() => setModal(true)}>Nuevo PQRS</button>
      </div>

      <table id="tablaPQRS">
        <thead>
          <tr>
            {esCiudadano ? (
              <><th>Radicado</th><th>Tipo</th><th>Descripción</th><th>Estado</th></>
            ) : (
              <><th>Nombre</th><th>Correo</th><th>Tipo</th><th>Mensaje</th><th>Respuesta</th><th>Estado</th></>
            )}
          </tr>
        </thead>
        <tbody>
          {pqrs.map((p) => (
            <tr key={p.id_pqrs || p.numero_radicado}>
              {esCiudadano ? (
                <>
                  <td data-label="Radicado">{p.numero_radicado}</td>
                  <td data-label="Tipo">{p.tipo}</td>
                  <td data-label="Descripción">{p.descripcion}</td>
                  <td data-label="Estado">
                    <span className={`estado ${p.estado}`}>{p.estado}</span>
                  </td>
                </>
              ) : (
                <>
                  <td data-label="Nombre">{p.nombre_ciudadano}</td>
                  <td data-label="Correo">{p.correo}</td>
                  <td data-label="Tipo">{p.tipo}</td>
                  <td data-label="Mensaje">{p.descripcion}</td>
                  <td data-label="Respuesta">
                    <span className="respuesta-pendiente">Pendiente</span>
                  </td>
                  <td data-label="Estado">
                    <span className={`estado ${p.estado}`}>{p.estado}</span>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {modal && (
        <div className="modal" style={{ display: 'flex' }} onClick={e => e.target.className === 'modal' && setModal(false)}>
          <div className="modal-content">
            <h2>Nuevo PQRS</h2>
            <form onSubmit={guardar} className="pqrs-form">
              <input type="text" placeholder="Nombre" required value={form.nombre_ciudadano}
                onChange={e => setForm({ ...form, nombre_ciudadano: e.target.value })} />
              <input type="email" placeholder="Correo" required value={form.correo}
                onChange={e => setForm({ ...form, correo: e.target.value })} />
              <select required value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
                <option value="">Tipo de solicitud</option>
                <option value="peticion">Petición</option>
                <option value="queja">Queja</option>
                <option value="reclamo">Reclamo</option>
                <option value="sugerencia">Sugerencia</option>
              </select>
              <textarea placeholder="Escribe tu mensaje" required value={form.descripcion}
                onChange={e => setForm({ ...form, descripcion: e.target.value })} />
              <div className="form-actions">
                <button type="submit" className="btn-guardar">Guardar</button>
                <button type="button" className="btn-cancelar" onClick={() => setModal(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
