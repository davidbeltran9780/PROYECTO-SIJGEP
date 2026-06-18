import { useState, useEffect } from 'react'
import api from '../api/axios'
import { useToast } from '../context/ToastContext'
import { useConfirm } from '../components/ConfirmModal'
import Spinner from '../components/Spinner'
import Paginacion from '../components/Paginacion'

export default function Admin() {
  const toast = useToast()
  const { confirmar, ConfirmUI } = useConfirm()
  const [pestana, setPestana] = useState(localStorage.getItem('pestanaAdmin') || 'usuarios')
  const [paginaUsuarios, setPaginaUsuarios] = useState(1)
  const [paginaBackups, setPaginaBackups] = useState(1)
  const [paginaAuditoria, setPaginaAuditoria] = useState(1)
  const [usuarios, setUsuarios] = useState([])
  const [backups, setBackups] = useState([])
  const [auditoria, setAuditoria] = useState([])
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('')
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('')
  const [filtroBackupDesde, setFiltroBackupDesde] = useState('')
  const [filtroBackupHasta, setFiltroBackupHasta] = useState('')
  const [filtroNombre, setFiltroNombre] = useState('')
  const [filtroRol, setFiltroRol] = useState('')
  const [filtroUsuarioId, setFiltroUsuarioId] = useState('')
  const [filtroUsuarioEmail, setFiltroUsuarioEmail] = useState('')
  const [filtroUsuarioRol, setFiltroUsuarioRol] = useState('')
  const [filtroUsuarioEstado, setFiltroUsuarioEstado] = useState('')
  const [filtroUsuarioDesde, setFiltroUsuarioDesde] = useState('')
  const [filtroUsuarioHasta, setFiltroUsuarioHasta] = useState('')
  const [generandoBackup, setGenerandoBackup] = useState(false)
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
    const ok = await confirmar('¿Guardar cambios?', `Se actualizarán los datos de ${usuarioEditando.nombre}.`)
    if (!ok) return
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
    setGenerandoBackup(true)
    try {
      const res = await api.post('/backups/manual')
      toast.exito(res.data.msg || 'Backup generado correctamente')
      api.get('/backups/listar').then(r => setBackups(r.data)).catch(console.error)
    } catch (err) {
      toast.error('Error al generar backup: ' + (err.response?.data?.detail || err.message || 'Error desconocido'))
    } finally {
      setGenerandoBackup(false)
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
      {generandoBackup && <Spinner texto="Generando backup, por favor espere..." />}
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

            <div className="auditoria-filtros">
              <div className="auditoria-filtro-grupo">
                <label>ID</label>
                <input type="text" placeholder="Buscar ID..." value={filtroUsuarioId}
                  onChange={e => setFiltroUsuarioId(e.target.value)} />
              </div>
              <div className="auditoria-filtro-grupo">
                <label>Correo</label>
                <input type="text" placeholder="Buscar correo..." value={filtroUsuarioEmail}
                  onChange={e => setFiltroUsuarioEmail(e.target.value)} />
              </div>
              <div className="auditoria-filtro-grupo">
                <label>Rol</label>
                <select value={filtroUsuarioRol} onChange={e => setFiltroUsuarioRol(e.target.value)}>
                  <option value="">Todos</option>
                  <option value="administrador">Administrador</option>
                  <option value="abogado">Abogado</option>
                  <option value="secretaria">Secretaria</option>
                  <option value="ciudadano">Ciudadano</option>
                </select>
              </div>
              <div className="auditoria-filtro-grupo">
                <label>Estado</label>
                <select value={filtroUsuarioEstado} onChange={e => setFiltroUsuarioEstado(e.target.value)}>
                  <option value="">Todos</option>
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
              <button className="btn-auditoria-limpiar" onClick={() => {
                setFiltroUsuarioId(''); setFiltroUsuarioEmail('')
                setFiltroUsuarioRol(''); setFiltroUsuarioEstado('')
                setPaginaUsuarios(1)
              }}>Limpiar</button>
            </div>

            {(() => {
              const usuariosFiltrados = usuarios.filter(u => {
                if (filtroUsuarioId && !String(u.id_usuarios).includes(filtroUsuarioId)) return false
                if (filtroUsuarioEmail && !u.email?.toLowerCase().includes(filtroUsuarioEmail.toLowerCase())) return false
                if (filtroUsuarioRol) {
                  const esAdmin = filtroUsuarioRol === 'administrador' && ['admin', 'administrador'].includes(u.rol)
                  if (!esAdmin && u.rol !== filtroUsuarioRol) return false
                }
                if (filtroUsuarioEstado && u.estado !== filtroUsuarioEstado) return false
                return true
              })
              const usuariosPagina = usuariosFiltrados.slice((paginaUsuarios-1)*10, paginaUsuarios*10)
              return (<>
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Nombre</th><th>Email</th><th>Rol</th><th>Estado</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuariosPagina.length === 0 ? (
                  <tr><td colSpan={6}>No hay usuarios con esos filtros</td></tr>
                ) : usuariosPagina.map(u => (
                  <tr key={u.id_usuarios}>
                    <td data-label="ID">{u.id_usuarios}</td>
                    <td data-label="Nombre">{u.nombre}</td>
                    <td data-label="Email">{u.email}</td>
                    <td data-label="Rol">{u.rol === 'admin' ? 'administrador' : u.rol}</td>
                    <td data-label="Estado">
                      <span className={`badge ${u.estado === 'activo' ? 'activo' : 'cerrado'}`}>
                        {u.estado}
                      </span>
                    </td>
                    <td data-label="Acciones">
                      <button className="btn-accion-editar" title="Editar usuario" aria-label="Editar usuario" onClick={() => abrirEditar(u)}>Editar</button>
                      {u.estado === 'activo'
                        ? <button className="btn-accion-eliminar" title="Desactivar usuario" aria-label="Desactivar usuario" onClick={async () => {
                            const ok = await confirmar('¿Desactivar este usuario?')
                            if (!ok) return
                            await api.patch(`/usuarios/${u.id_usuarios}/desactivar`)
                            cargarUsuarios()
                            toast.exito('Usuario desactivado')
                          }}>Desactivar</button>
                        : <button className="btn-accion-activar" title="Activar usuario" aria-label="Activar usuario" onClick={async () => {
                            const ok = await confirmar('¿Activar este usuario?')
                            if (!ok) return
                            await api.patch(`/usuarios/${u.id_usuarios}/activar`)
                            cargarUsuarios()
                            toast.exito('Usuario activado')
                          }}>Activar</button>
                      }
                      <button className="btn-accion-eliminar" title="Eliminar usuario permanentemente" aria-label="Eliminar usuario" onClick={() => eliminarUsuario(u.id_usuarios)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Paginacion total={usuariosFiltrados.length} pagina={paginaUsuarios} setPagina={setPaginaUsuarios} porPagina={10} />
            </>)
            })()}
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

            <div className="auditoria-filtros">
              <div className="auditoria-filtro-grupo">
                <label htmlFor="bk-desde">Desde</label>
                <input id="bk-desde" type="date" value={filtroBackupDesde}
                  onChange={e => setFiltroBackupDesde(e.target.value)} />
              </div>
              <div className="auditoria-filtro-grupo">
                <label htmlFor="bk-hasta">Hasta</label>
                <input id="bk-hasta" type="date" value={filtroBackupHasta}
                  onChange={e => setFiltroBackupHasta(e.target.value)} />
              </div>
              <button className="btn-auditoria-limpiar"
                onClick={() => { setFiltroBackupDesde(''); setFiltroBackupHasta('') }}>
                Limpiar
              </button>
            </div>

            {(() => {
              const backupsFiltrados = backups.filter(b => {
                const fecha = new Date(b.fecha)
                if (filtroBackupDesde && fecha < new Date(filtroBackupDesde)) return false
                if (filtroBackupHasta && fecha > new Date(filtroBackupHasta + 'T23:59:59')) return false
                return true
              })
              const backupsPagina = backupsFiltrados.slice((paginaBackups-1)*10, paginaBackups*10)
              return (<>
            <table>
              <thead>
                <tr><th>Fecha</th><th>Hora</th><th>Archivo</th><th>Estado</th><th>Enlace</th></tr>
              </thead>
              <tbody>
                {backupsPagina.length === 0
                  ? <tr><td colSpan={5}>No hay backups con esos filtros</td></tr>
                  : backupsPagina.map((b, i) => {
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
            <Paginacion total={backupsFiltrados.length} pagina={paginaBackups} setPagina={setPaginaBackups} porPagina={10} />
            </>)
            })()}
          </div>
        )}

        {/* Panel Auditoría */}
        {pestana === 'auditoria' && (
          <div>
            <div className="top">
              <h2>Log de Auditoría</h2>
              <button className="nuevo" onClick={async () => {
                const res = await api.get('/auditoria/exportar', { responseType: 'blob' })
                const url = window.URL.createObjectURL(new Blob([res.data]))
                const a = document.createElement('a')
                a.href = url
                a.download = 'auditoria_sijgep.csv'
                a.click()
                window.URL.revokeObjectURL(url)
              }}>Exportar CSV</button>
            </div>

            {/* Filtro por fechas */}
            <div className="auditoria-filtros">
              <div className="auditoria-filtro-grupo">
                <label htmlFor="audit-desde">Desde</label>
                <input
                  id="audit-desde"
                  type="date"
                  value={filtroFechaDesde}
                  onChange={e => setFiltroFechaDesde(e.target.value)}
                />
              </div>
              <div className="auditoria-filtro-grupo">
                <label htmlFor="audit-hasta">Hasta</label>
                <input
                  id="audit-hasta"
                  type="date"
                  value={filtroFechaHasta}
                  onChange={e => setFiltroFechaHasta(e.target.value)}
                />
              </div>
              <div className="auditoria-filtro-grupo">
                <label htmlFor="audit-nombre">Usuario</label>
                <input
                  id="audit-nombre"
                  type="text"
                  placeholder="Buscar usuario..."
                  value={filtroNombre}
                  onChange={e => setFiltroNombre(e.target.value)}
                />
              </div>
              <div className="auditoria-filtro-grupo">
                <label htmlFor="audit-rol">Rol</label>
                <select
                  id="audit-rol"
                  value={filtroRol}
                  onChange={e => setFiltroRol(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="administrador">Administrador</option>
                  <option value="abogado">Abogado</option>
                  <option value="secretaria">Secretaria</option>
                  <option value="ciudadano">Ciudadano</option>
                </select>
              </div>
              <button
                className="btn-auditoria-limpiar"
                onClick={() => { setFiltroFechaDesde(''); setFiltroFechaHasta(''); setFiltroNombre(''); setFiltroRol('') }}
              >
                Limpiar
              </button>
            </div>

            {(() => {
              const auditoriaFiltrada = auditoria.filter(a => {
                const fecha = new Date(a.fecha)
                if (filtroFechaDesde && fecha < new Date(filtroFechaDesde)) return false
                if (filtroFechaHasta && fecha > new Date(filtroFechaHasta + 'T23:59:59')) return false
                if (filtroNombre && !a.nombre_usuario?.toLowerCase().includes(filtroNombre.toLowerCase())) return false
                if (filtroRol) {
                  const esAdmin = filtroRol === 'administrador' && ['admin', 'administrador'].includes(a.rol)
                  if (!esAdmin && a.rol !== filtroRol) return false
                }
                return true
              })
              const auditoriaPagina = auditoriaFiltrada.slice((paginaAuditoria-1)*15, paginaAuditoria*15)
              return (<>
            <table>
              <thead>
                <tr>
                  <th>Fecha y Hora</th><th>Usuario</th><th>Rol</th>
                  <th>Acción</th><th>Tabla afectada</th><th>ID</th>
                  <th>Detalle del cambio</th><th>IP</th><th>Resultado</th>
                </tr>
              </thead>
              <tbody>
                {auditoriaPagina.length === 0
                  ? <tr><td colSpan={9}>No hay registros con esos filtros</td></tr>
                  : auditoriaPagina.map(a => (
                    <tr key={a.id_auditoria}>
                      <td data-label="Fecha">{new Date(a.fecha).toLocaleString('es-CO')}</td>
                      <td data-label="Usuario">{a.nombre_usuario}</td>
                      <td data-label="Rol">{a.rol}</td>
                      <td data-label="Acción" className={claseAccion(a.accion)}>{a.accion}</td>
                      <td data-label="Tabla">{a.tabla_afectada}</td>
                      <td data-label="ID">{a.id_registro}</td>
                      <td data-label="Detalle" style={{ fontSize: '11px', color: '#6b7280' }}>{a.detalle || '—'}</td>
                      <td data-label="IP" style={{ fontSize: '11px' }}>{a.ip_address || '—'}</td>
                      <td data-label="Resultado">
                        <span className={`badge ${a.resultado === 'fallido' ? 'cerrado' : 'activo'}`}>
                          {a.resultado || 'exitoso'}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            <Paginacion total={auditoriaFiltrada.length} pagina={paginaAuditoria} setPagina={setPaginaAuditoria} porPagina={15} />
            </>)
            })()}
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
