import { useState, useEffect } from 'react'
import api from '../api/axios'

export default function Admin() {
  const [pestana, setPestana] = useState(localStorage.getItem('pestanaAdmin') || 'usuarios')
  const [usuarios, setUsuarios] = useState([])
  const [backups, setBackups] = useState([])
  const [modalAbierto, setModalAbierto] = useState(false)
  const [nuevoUsuario, setNuevoUsuario] = useState({ nombre: '', email: '', password: '', rol: '' })

  useEffect(() => {
    api.get('/usuarios').then(res => setUsuarios(res.data)).catch(console.error)
  }, [])

  useEffect(() => {
    if (pestana === 'backups') {
      api.get('/backups/listar').then(res => setBackups(res.data)).catch(console.error)
    }
    localStorage.setItem('pestanaAdmin', pestana)
  }, [pestana])

  const generarBackup = async () => {
    try {
      await api.post('/backups/manual')
      alert('Backup generado correctamente')
    } catch {
      alert('Error al generar backup')
    }
  }

  const guardarUsuario = async (e) => {
    e.preventDefault()
    try {
      await api.post('/usuarios', nuevoUsuario)
      setModalAbierto(false)
      const res = await api.get('/usuarios')
      setUsuarios(res.data)
    } catch {
      alert('Error al crear usuario')
    }
  }

  return (
    <main className="content">
      <div className="contenido">

        {/* Tabs */}
        <div className="tabs-admin">
          {['usuarios', 'backups', 'auditoria'].map(t => (
            <button key={t} className={`tab-admin ${pestana === t ? 'activa' : ''}`}
              onClick={() => setPestana(t)}>
              {t.toUpperCase()}
            </button>
          ))}
        </div>
        <hr className="tab-separador" />

        {/* Panel Usuarios */}
        {pestana === 'usuarios' && (
          <div>
            <div className="top">
              <h2>Gestión de Usuarios</h2>
              <button className="nuevo" onClick={() => setModalAbierto(true)}>Nuevo Usuario</button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map(u => (
                  <tr key={u.id_usuarios}>
                    <td data-label="Nombre">{u.nombre}</td>
                    <td data-label="Email">{u.email}</td>
                    <td data-label="Rol">{u.rol}</td>
                    <td data-label="Estado">
                      <span className={`badge ${u.estado === 'activo' ? 'activo' : 'cerrado'}`}>
                        {u.estado}
                      </span>
                    </td>
                    <td data-label="Acciones">
                      <button className="btn-accion-editar">Editar</button>
                      <button className="btn-accion-eliminar">Desactivar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Panel Backups */}
        {pestana === 'backups' && (
          <div>
            <h2>Respaldos del Sistema</h2>
            <div className="backup-card">
              <div className="backup-icon">💾</div>
              <div className="backup-info">
                <h3>Generar Respaldo Manual</h3>
                <p>Crea un respaldo completo y lo sube a Google Drive</p>
              </div>
              <button className="nuevo" onClick={generarBackup}>Generar Backup Ahora</button>
            </div>
            <h3>Historial de Respaldos</h3>
            <table>
              <thead>
                <tr>
                  <th>Fecha</th><th>Hora</th><th>Archivo</th><th>Estado</th><th>Enlace</th>
                </tr>
              </thead>
              <tbody>
                {backups.map((b, i) => {
                  const fecha = new Date(b.fecha)
                  return (
                    <tr key={i}>
                      <td>{fecha.toLocaleDateString('es-CO')}</td>
                      <td>{fecha.toLocaleTimeString('es-CO')}</td>
                      <td>{b.archivo}</td>
                      <td><span className="badge activo">{b.estado}</span></td>
                      <td><a href={b.link_drive} target="_blank" className="btn-accion-editar">Ver en Drive</a></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Panel Auditoría */}
        {pestana === 'auditoria' && (
          <div>
            <h2>Log de Auditoría</h2>
            <p>Registro de acciones realizadas en el sistema</p>
            <table>
              <thead>
                <tr>
                  <th>Fecha y Hora</th><th>Usuario</th><th>Rol</th>
                  <th>Acción</th><th>Tabla afectada</th><th>ID registro</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>15/04/2026 10:30</td><td>Carlos Ruiz</td><td>Admin</td>
                  <td className="atiempo">CREAR</td><td>Usuarios</td><td>USR-045</td>
                </tr>
                <tr>
                  <td>15/04/2026 09:15</td><td>María Gómez</td><td>Secretaria</td>
                  <td className="proximo">EDITAR</td><td>Expedientes</td><td>EXP-123</td>
                </tr>
                <tr>
                  <td>14/04/2026 16:45</td><td>Juan Pérez</td><td>Abogado</td>
                  <td className="urgente">BORRAR</td><td>Documentos</td><td>DOC-789</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Modal Nuevo Usuario */}
      {modalAbierto && (
        <div className="modal" style={{ display: 'flex' }} onClick={e => e.target.className === 'modal' && setModalAbierto(false)}>
          <div className="modal-contenido">
            <h3>Nuevo Usuario</h3>
            <form onSubmit={guardarUsuario}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Nombre</label>
                  <input type="text" required value={nuevoUsuario.nombre}
                    onChange={e => setNuevoUsuario({ ...nuevoUsuario, nombre: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" required value={nuevoUsuario.email}
                    onChange={e => setNuevoUsuario({ ...nuevoUsuario, email: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Contraseña</label>
                  <input type="password" required value={nuevoUsuario.password}
                    onChange={e => setNuevoUsuario({ ...nuevoUsuario, password: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Rol</label>
                  <select required value={nuevoUsuario.rol}
                    onChange={e => setNuevoUsuario({ ...nuevoUsuario, rol: e.target.value })}>
                    <option value="">Seleccionar...</option>
                    <option value="administrador">Administrador</option>
                    <option value="abogado">Abogado</option>
                    <option value="auxiliar">Auxiliar</option>
                    <option value="ciudadano">Ciudadano</option>
                  </select>
                </div>
              </div>
              <div className="form-botones">
                <button type="button" className="btn-cancelar" onClick={() => setModalAbierto(false)}>Cancelar</button>
                <button type="submit" className="btn-guardar">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </main>
  )
}