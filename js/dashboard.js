// Obtener datos del usuario guardados al iniciar sesión
let nombre = localStorage.getItem("nombre")
let rol = localStorage.getItem("rol")
let alertas = localStorage.getItem("alertas") || 0


// Mostrar cantidad de alertas en el heade
document.getElementById("info-usuario").innerText = nombre + " - " + rol + " 🔔 " + alertas