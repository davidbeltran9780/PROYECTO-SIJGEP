/**
 * ═══════════════════════════════════════════════════════
 * SIGJEP — api.js
 * Sistema Inteligente de Gestión Jurídica para Entidades Públicas
 * ═══════════════════════════════════════════════════════
 * Archivo central de comunicación con el backend Python (FastAPI)
 * Todas las llamadas al servidor pasan por este archivo.
 * 
 * IMPORTANTE: Por ahora las funciones están preparadas pero
 * no se usan hasta que el backend de Python esté listo.
 * Cada módulo usa datos de prueba mientras tanto.
 * 
 * Equipo SENA — Programación de Software 223104 — 2026
 * ═══════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────
// URL BASE DEL BACKEND
// Cambiar a la URL de Railway cuando se despliegue
// ─────────────────────────────────────────────────────
const BACKEND_URL = "http://localhost:8000"


// ─────────────────────────────────────────────────────
// FUNCIÓN BASE
// Todas las funciones de abajo usan esta.
// Maneja los headers, el método y los errores.
// ─────────────────────────────────────────────────────

/**
 * Función base que maneja todas las peticiones al backend
 * @param {string} ruta - Ruta del endpoint, ejemplo: "/alertas"
 * @param {string} metodo - Método HTTP: GET, POST, PUT, DELETE
 * @param {object} datos - Datos a enviar (solo para POST y PUT)
 * @returns {Promise} - Datos que devuelve el servidor en JSON
 */
async function peticion(ruta, metodo = "GET", datos = null) {

  // Arma las opciones de la petición
  let opciones = {
    method: metodo,
    headers: {
      "Content-Type": "application/json",
      // Cuando el backend esté listo agregar el token JWT aquí:
      // "Authorization": "Bearer " + localStorage.getItem("token")
    }
  }

  // Si hay datos los convierte a JSON y los agrega
  if (datos) {
    opciones.body = JSON.stringify(datos)
  }

  // Hace la petición y espera la respuesta
  let respuesta = await fetch(BACKEND_URL + ruta, opciones)

  // Si el servidor responde con error lanza una excepción
  if (!respuesta.ok) {
    throw new Error("Error en la petición: " + respuesta.status)
  }

  // Convierte la respuesta a JSON y la devuelve
  return await respuesta.json()
}


// ─────────────────────────────────────────────────────
// AUTENTICACIÓN
// Responsable: Brayan David Trujillo Beltrán
// Usado en: index.html, registro.html, auth.js
// ─────────────────────────────────────────────────────

/**
 * Inicia sesión del usuario
 * Sugerencia: usar junto con verificarSesion() de utils.js
 * @param {string} correo
 * @param {string} password
 * @param {string} rol
 */
async function login(correo, password, rol) {
  return await peticion("/auth/login", "POST", { correo, password, rol })
}

/**
 * Registra un nuevo usuario
 * @param {string} nombre
 * @param {string} correo
 * @param {string} password
 * @param {string} rol
 */
async function registro(nombre, correo, password, rol) {
  return await peticion("/auth/registro", "POST", { nombre, correo, password, rol })
}


// ─────────────────────────────────────────────────────
// EXPEDIENTES
// Responsable: María Valentina Sabogal Cortes
// Usado en: expedientes.html, expedientes.js
// ─────────────────────────────────────────────────────

/**
 * Obtiene la lista de expedientes
 * Sugerencia: usar junto con calcularDias() de utils.js
 * para calcular los días restantes de cada expediente
 */
async function obtenerExpedientes() {
  return await peticion("/expedientes")
}

/**
 * Crea un nuevo expediente
 * Sugerencia: usar junto con confirmar() de utils.js
 * para pedir confirmación antes de guardar
 * @param {object} datos - Tipo, demandante, fecha, descripción
 */
async function crearExpediente(datos) {
  return await peticion("/expedientes", "POST", datos)
}

/**
 * Edita un expediente existente
 * @param {number} id - ID del expediente a editar
 * @param {object} datos - Datos actualizados
 */
async function editarExpediente(id, datos) {
  return await peticion("/expedientes/" + id, "PUT", datos)
}

/**
 * Elimina un expediente
 * Sugerencia: usar junto con confirmar() de utils.js
 * para pedir confirmación antes de eliminar
 * @param {number} id - ID del expediente a eliminar
 */
async function eliminarExpediente(id) {
  return await peticion("/expedientes/" + id, "DELETE")
}


// ─────────────────────────────────────────────────────
// DOCUMENTOS
// Responsable: María Valentina Sabogal Cortes
// Usado en: documentos.html, documentos.js
// ─────────────────────────────────────────────────────

/**
 * Obtiene los documentos de un expediente
 * @param {number} idExpediente
 */
async function obtenerDocumentos(idExpediente) {
  return await peticion("/documentos/" + idExpediente)
}

/**
 * Sube un documento al servidor
 * Sugerencia: usar junto con mostrarSpinner() de utils.js
 * porque la subida puede tardar más de 1 segundo
 * @param {File} archivo - Archivo PDF, JPG o Word
 * @param {number} idExpediente
 */
async function subirDocumento(archivo, idExpediente) {
  let formData = new FormData()
  formData.append("archivo", archivo)
  formData.append("idExpediente", idExpediente)
  return await fetch(BACKEND_URL + "/documentos", {
    method: "POST",
    body: formData
  }).then(r => r.json())
}


// ─────────────────────────────────────────────────────
// ALERTAS Y DASHBOARD
// Responsable: Daniel Santiago Dionisio Ruiz
// Usado en: alertas.html, alertas.js, dashboard.js
// ─────────────────────────────────────────────────────

/**
 * Obtiene la lista de alertas de vencimiento
 * Sugerencia: usar junto con calcularDias() de utils.js
 * para clasificar en urgente, próximo o a tiempo
 */
async function obtenerAlertas() {
  return await peticion("/alertas")
}

/**
 * Obtiene el resumen del dashboard
 * Total de expedientes activos, alertas y vencimientos
 */
async function obtenerResumenDashboard() {
  return await peticion("/dashboard/resumen")
}

/**
 * Obtiene los datos del usuario activo
 * Sugerencia: usar junto con cargarUsuarioHeader() de utils.js
 * para mostrar nombre, rol y alertas en el header
 */
async function obtenerDatosUsuario() {
  return await peticion("/usuario/perfil")
}


// ─────────────────────────────────────────────────────
// MÓDULO IA
// Responsable: Miguel Ángel Corredor Obando
// Usado en: modulo-ia.html, ia.js
// ─────────────────────────────────────────────────────

/**
 * Clasifica automáticamente el tipo de caso de un documento
 * Sugerencia: usar junto con mostrarSpinner() de utils.js
 * porque Gemini puede tardar hasta 10 segundos
 * @param {number} idDocumento
 */
async function clasificarDocumento(idDocumento) {
  return await peticion("/ia/clasificar", "POST", { idDocumento })
}

/**
 * Genera un resumen jurídico del documento
 * Sugerencia: usar junto con mostrarSpinner() de utils.js
 * @param {number} idDocumento
 */
async function generarResumen(idDocumento) {
  return await peticion("/ia/resumen", "POST", { idDocumento })
}

/**
 * Genera un borrador de respuesta en Word
 * Sugerencia: usar junto con mostrarSpinner() de utils.js
 * El backend devuelve un archivo Word para descargar
 * @param {number} idDocumento
 */
async function generarBorrador(idDocumento) {
  return await peticion("/ia/borrador", "POST", { idDocumento })
}


// ─────────────────────────────────────────────────────
// REPORTES
// Responsable: Miguel Ángel Corredor Obando
// Usado en: reportes.html, reportes.js
// ─────────────────────────────────────────────────────

/**
 * Obtiene las estadísticas del sistema con filtros
 * Sugerencia: usar junto con formatearFecha() de utils.js
 * para formatear las fechas de los filtros
 * @param {object} filtros - fechaInicio, fechaFin, tipo, abogado
 */
async function obtenerReportes(filtros) {
  return await peticion("/reportes", "POST", filtros)
}


// ─────────────────────────────────────────────────────
// PQRS
// Responsable: Brayan David Trujillo Beltrán
// Usado en: pqrs.html, pqrs.js
// ─────────────────────────────────────────────────────

/**
 * Crea una nueva PQRS del ciudadano
 * Sugerencia: usar junto con mostrarExito() de utils.js
 * para mostrar el número de radicado al ciudadano
 * @param {object} datos - nombre, tipo, descripción, documentos
 */
async function crearPQRS(datos) {
  return await peticion("/pqrs", "POST", datos)
}

/**
 * Consulta el estado de una PQRS por número de radicado
 * @param {string} numeroRadicado
 */
async function consultarPQRS(numeroRadicado) {
  return await peticion("/pqrs/" + numeroRadicado)
}


// ─────────────────────────────────────────────────────
// ADMINISTRACIÓN DE USUARIOS
// Responsable: pendiente de asignar
// Usado en: admin-usuarios.html, admin-usuarios.js
// ─────────────────────────────────────────────────────

/**
 * Obtiene la lista de todos los usuarios del sistema
 * Sugerencia: usar junto con estaAutorizado() de utils.js
 * para verificar que solo el admin puede acceder
 */
async function obtenerUsuarios() {
  return await peticion("/usuarios")
}

/**
 * Crea un nuevo usuario del sistema
 * @param {object} datos - nombre, correo, rol
 */
async function crearUsuario(datos) {
  return await peticion("/usuarios", "POST", datos)
}

/**
 * Edita un usuario existente
 * @param {number} id
 * @param {object} datos
 */
async function editarUsuario(id, datos) {
  return await peticion("/usuarios/" + id, "PUT", datos)
}

/**
 * Activa o desactiva un usuario
 * Sugerencia: usar junto con confirmar() de utils.js
 * antes de desactivar
 * @param {number} id
 * @param {boolean} activo
 */
async function cambiarEstadoUsuario(id, activo) {
  return await peticion("/usuarios/" + id + "/estado", "PUT", { activo })
}