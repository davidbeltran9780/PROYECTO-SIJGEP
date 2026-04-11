// Verifica sesión activa - debe ir primero
//verificarSesion()


cargarUsuarioHeader()

// PRUEBA - borrar después
confirmar("¿Estás seguro de eliminar este expediente?").then(function(respuesta) {
  if (respuesta) {
    mostrarExito("Expediente eliminado correctamente")
  } else {
    mostrarError("Operación cancelada")
  }
})


document.querySelector(".logout").addEventListener("click", function() {
  localStorage.clear()
})