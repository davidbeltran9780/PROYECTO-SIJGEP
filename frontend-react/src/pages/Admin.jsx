import { useState, useEffect } from 'react'
import api from '../api/axios'
import { useToast } from '../context/ToastContext'
import { useConfirm } from '../components/ConfirmModal'

export default function Admin() {
  const toast = useToast()
  const { confirmar, ConfirmUI } = useConfirm()
  const [pestana, setPestana] = useState(localStorage.getItem('pestanaAdmin') || 'usuarios')
  const [usuarios, setUsuarios] = useState([])
  const [backups, setBackups] = useState([])
  const [auditoria, setAuditoria] = useState([])
  const [modalAbierto, setModalAbierto] = useState(false)
  const [modalEditar, setModalEditar] = useState(false)
  const [usuarioEditando, setUsuarioEditando] = useState(null)
  const [nuevoUsuario, setNuevoUsuario] = useState({ nombre: '', email: '', password: '', rol: '' })

  const cargarUsuarios = () => {
    api.get('/usuarios').then(res => setUsuarios(res.data)).catch(console.error)
  }

  useEffect(() => { cargarUsuarios() }, [])

  useEffect(() => {
    if (pestana === 'backups') {
      api.get('/backups/listar').then(res => setBackups(res.data)).catch(console.error)
    }
    if (pestana === 'auditoria') {
      api.get('/auditoria/').then(res => setAuditoria(res.data)).catch(console.error)
    }
    localStorage.setItem('pestanaAdmin', pestana)
  }, [pestana])

  const guardarUsuario = async (e) => {
    e.preventDefault()
    try {
      await api.post('/usuarios', nuevoUsuario)
      setModalAbierto(false)
      setNuevoUsuario({ nombre: '', email: '', password: '', rol: '' })
      cargarUsuarios()
    } catch { toast.error('Error al crear usuario') }
  }

  const abrirEditar = (u) => {
    setUsuarioEditando({ ...u })
    setModalEditar(true)
  }

  const guardarEdicion = async (e) => {
    e.preventDefault()
    try {
      await api.put(`/usuarios/${usuarioEditando.id_usuarios}`, usuarioEditando)
      setModalEditar(false)
      cargarUsuarios()
    } catch { toast.error('Error al editar usuario') }
  }

  const eliminarUsuario = async (id) => {
    const ok = await confirmar('¿Eliminar este usuario?', 'Esta acción no se puede deshacer.')
    if (!ok) return
    try {
      await api.delete(`/usuarios/${id}`)
      cargarUsuarios()
      toast.exito('Usuario eliminado')
    } catch { toast.error('Error al eliminar usuario') }
  }

  const generarBackup = async () => {
    try {
      const res = await api.post('/backups/manual')
      toast.exito(res.data.msg || 'Backup generado correctamente')
      api.get('/backups/listar').then(r => setBackups(r.data)).catch(console.error)
    } catch (err) {
      toast.error('Error al generar backup: ' + (err.response?.data?.detail || err.message || 'Error desconocido'))
    }
  }

  const claseAccion = (accion) => {
    switch (accion) {
      case 'CREAR': return 'atiempo'
      case 'EDITAR': return 'proximo'
      case 'BORRAR': return 'urgente'
      case 'LOGIN': return 'atiempo'
      default: return ''
    }
  }

  return (
    <main className="content">
      {ConfirmUI}
      <div className="contenido">

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
                  <th>ID</th><th>Nombre</th><th>Email</th><th>Rol</th><th>Estado</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map(u => (
                  <tr key={u.id_usuarios}>
                    <td data-label="ID">{u.id_usuarios}</td>
                    <td data-label="Nombre">{u.nombre}</td>
                    <td data-label="Email">{u.email}</td>
                    <td data-label="Rol">{u.rol}</td>
                    <td data-label="Estado">
                      <span className={`badge ${u.estado === 'activo' ? 'activo' : 'cerrado'}`}>
                        {u.estado}
                      </span>
                    </td>
                    <td data-label="Acciones">
                      <button className="btn-accion-editar" onClick={() => abrirEditar(u)}>Editar</button>
                      {u.estado === 'activo'
                        ? <button className="btn-accion-eliminar" onClick={async () => {
                            const ok = await confirmar('¿Desactivar este usuario?')
                            if (!ok) return
                            await api.patch(`/usuarios/${u.id_usuarios}/desactivar`)
                            cargarUsuarios()
                            toast.exito('Usuario desactivado')
                          }}>Desactivar</button>
                        : <button className="btn-accion-activar" onClick={async () => {
                            const ok = await confirmar('¿Activar este usuario?')
                            if (!ok) return
                            await api.patch(`/usuarios/${u.id_usuarios}/activar`)
                            cargarUsuarios()
                            toast.exito('Usuario activado')
                          }}>Activar</button>
                      }
                      <button className="btn-accion-eliminar" onClick={() => eliminarUsuario(u.id_usuarios)}>Eliminar</button>
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
                <tr><th>Fecha</th><th>Hora</th><th>Archivo</th><th>Estado</th><th>Enlace</th></tr>
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
            <table>
              <thead>
                <tr>
                  <th>Fecha y Hora</th><th>Usuario</th><th>Rol</th>
                  <th>Acción</th><th>Tabla afectada</th><th>ID registro</th>
                </tr>
              </thead>
              <tbody>
                {auditoria.length === 0 ? (
                  <tr><td colSpan={6}>No hay registros de auditoría aún</td></tr>
                ) : (
                  auditoria.map(a => (
                    <tr key={a.id_auditoria}>
                      <td data-label="Fecha">{new Date(a.fecha).toLocaleString('es-CO')}</td>
                      <td data-label="Usuario">{a.nombre_usuario}</td>
                      <td data-label="Rol">{a.rol}</td>
                      <td data-label="Acción" className={claseAccion(a.accion)}>{a.accion}</td>
                      <td data-label="Tabla">{a.tabla_afectada}</td>
                      <td data-label="ID">{a.id_registro}</td>
                    </tr>
                  ))
                )}
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
                  <label htmlFor="nu-nombre">Nombre</label>
                  <input id="nu-nombre" type="text" required value={nuevoUsuario.nombre}
                    onChange={e => setNuevoUsuario({ ...nuevoUsuario, nombre: e.target.value })} />
                </div>
                <div className="form-group">
                  <label htmlFor="nu-email">Email</label>
                  <input id="nu-email" type="email" required value={nuevoUsuario.email}
                    onChange={e => setNuevoUsuario({ ...nuevoUsuario, email: e.target.value })} />
                </div>
                <div className="form-group">
                  <label htmlFor="nu-password">Contraseña</label>
                  <input id="nu-password" type="password" required value={nuevoUsuario.password}
                    onChange={e => setNuevoUsuario({ ...nuevoUsuario, password: e.target.value })} />
                </div>
                <div className="form-group">
                  <label htmlFor="nu-rol">Rol</label>
                  <select id="nu-rol" required value={nuevoUsuario.rol}
                    onChange={e => setNuevoUsuario({ ...nuevoUsuario, rol: e.target.value })}>
                    <option value="">Seleccionar...</option>
                    <option value="admin">Administrador</option>
                    <option value="abogado">Abogado</option>
                    <option value="secretaria">Secretaria</option>
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

      {/* Modal Editar Usuario */}
      {modalEditar && usuarioEditando && (
        <div className="modal" style={{ display: 'flex' }} onClick={e => e.target.className === 'modal' && setModalEditar(false)}>
          <div className="modal-contenido">
            <h3>Editar Usuario</h3>
            <form onSubmit={guardarEdicion}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="eu-nombre">Nombre</label>
                  <input id="eu-nombre" type="text" required value={usuarioEditando.nombre}
                    onChange={e => setUsuarioEditando({ ...usuarioEditando, nombre: e.target.value })} />
                </div>
                <div className="form-group">
                  <label htmlFor="eu-rol">Rol</label>
                  <select id="eu-rol" required value={usuarioEditando.rol}
                    onChange={e => setUsuarioEditando({ ...usuarioEditando, rol: e.target.value })}>
                    <option value="admin">Administrador</option>
                    <option value="abogado">Abogado</option>
                    <option value="secretaria">Secretaria</option>
                    <option value="ciudadano">Ciudadano</option>
                  </select>
                </div>
              </div>
              <div className="form-botones">
                <button type="button" className="btn-cancelar" onClick={() => setModalEditar(false)}>Cancelar</button>
                <button type="submit" className="btn-guardar">Guardar cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </main>
  )
}
