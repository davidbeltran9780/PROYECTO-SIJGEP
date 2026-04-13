

function formatearFecha(fecha) {
  let fechaObj = new Date(fecha)
  let formato = { year: 'numeric', month: 'long', day: 'numeric' }
  return fechaObj.toLocaleDateString('es-CO', formato)
}

// PRUEBA - //
console.log(formatearFecha("2026-04-11"))


function mostrarError(mensaje) {
  let overlay = document.createElement("div")
  overlay.className = "overlay-error"
  
  let div = document.createElement("div")
  div.innerHTML = `<p style="font-size:28px">⚠️</p>
                   <p style="font-weight:bold; color:var(--rojo); margin:10px 0">Error</p>
                   <p>${mensaje}</p>`
  div.className = "mensaje-error"
  
  document.body.appendChild(overlay)
  document.body.appendChild(div)
  
  setTimeout(function() {
    div.remove()
    overlay.remove()
  }, 3000)
}



function mostrarExito(mensaje) {
  let overlay = document.createElement("div")
  overlay.className = "overlay-error"
  
  let div = document.createElement("div")
  div.innerHTML = `<p style="font-size:28px">✅</p>
                   <p style="font-weight:bold; color:var(--verde); margin:10px 0">Éxito</p>
                   <p>${mensaje}</p>`
  div.className = "mensaje-exito"
  
  document.body.appendChild(overlay)
  document.body.appendChild(div)
  
  setTimeout(function() {
    div.remove()
    overlay.remove()
  }, 3000)
}

function mostrarSpinner() {
  let overlay = document.createElement("div")
  overlay.className = "overlay-spinner"
  overlay.id = "overlay-spinner"

  let contenedor = document.createElement("div")
  contenedor.className = "spinner-contenedor"
  contenedor.id = "spinner-contenedor"
  contenedor.innerHTML = `
    <div class="spinner"></div>
    <p style="margin-top:15px; color:var(--texto)">Cargando...</p>
  `
  document.body.appendChild(overlay)
  document.body.appendChild(contenedor)
}

function ocultarSpinner() {
  let contenedor = document.getElementById("spinner-contenedor")
  let overlay = document.getElementById("overlay-spinner")
  if (contenedor) contenedor.remove()
  if (overlay) overlay.remove()
}


function verificarSesion() {
  let nombre = localStorage.getItem("nombre")
  let rol = localStorage.getItem("rol")
  if (!nombre || !rol) {
    window.location.href = "index.html"
  }
}




function confirmar(mensaje) {

  // Retorna una Promise que espera la respuesta del usuario
  return new Promise(function(resolver) {

    // Crea el fondo oscuro detrás del modal
    let overlay = document.createElement("div")
    overlay.className = "overlay-confirmar"

    // Crea el cuadro del modal con el mensaje y los botones
    let modal = document.createElement("div")
    modal.className = "modal-confirmar"
    modal.innerHTML = `
      <p>⚠️</p>
      <p>${mensaje}</p>
      <div class="botones">
        <button class="boton-confirmar" id="btn-confirmar">Confirmar</button>
        <button class="boton-cancelar" id="btn-cancelar">Cancelar</button>
      </div>
    `

    // Agrega los elementos al HTML
    document.body.appendChild(overlay)
    document.body.appendChild(modal)

    // Cuando el usuario hace clic en Confirmar
    document.getElementById("btn-confirmar").addEventListener("click", function() {
      overlay.remove()
      modal.remove()
      resolver(true) // resuelve la Promise con true
    })

    // Cuando el usuario hace clic en Cancelar
    document.getElementById("btn-cancelar").addEventListener("click", function() {
      overlay.remove()
      modal.remove()
      resolver(false) // resuelve la Promise con false
    })

  })
}

function calcularDias(fechaLimite) {
  let hoy = new Date()
  let limite = new Date(fechaLimite)
  let diferencia = limite - hoy
  return Math.ceil(diferencia / (1000 * 60 * 60 * 24))
}

function cargarUsuarioHeader() {
  let nombre = localStorage.getItem("nombre") || "Usuario"
  let rol = localStorage.getItem("rol") || "Sin rol"
  let alertas = localStorage.getItem("alertas") || 0

  let info = document.getElementById("info-usuario")
  let num = document.getElementById("num-alertas")

  if (info) {
    info.innerText = nombre + " - " + rol
  }

  if (num) {
    num.innerText = alertas
  }
}

function cerrarSesion() {
  // Borra todos los datos de sesión guardados en localStorage
  localStorage.clear()
  // Redirige al login
  window.location.href = "index.html"
}

function obtenerRol() {
  return localStorage.getItem("rol")
}

function estaAutorizado(rolesPermitidos) {
  let rol = obtenerRol()
  return rolesPermitidos.includes(rol)
}
