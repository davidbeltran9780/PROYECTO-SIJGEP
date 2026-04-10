// Datos de prueba - se reemplazarán con la llamada a api.js cuando el backend esté listo
const expedientes = [
  { id: "EXP-001", tipo: "Tutela", demandante: "Rodríguez", fechaLimite: "2026-04-11" },
  { id: "EXP-002", tipo: "Demanda", demandante: "Pérez", fechaLimite: "2026-04-13" },
  { id: "EXP-003", tipo: "PQRS", demandante: "Gómez", fechaLimite: "2026-04-20" },
]

// Recorre los expedientes y los clasifica según los días restantes
function cargarAlertas() {

  // Referencia a cada tabla del HTML
  let tablaUrgente = document.getElementById("tabla-urgente")
  let tablaProximo = document.getElementById("tabla-proximo")
  let tablaAtiempo = document.getElementById("tabla-atiempo")

  // Limpia las tablas antes de llenarlas
  tablaUrgente.innerHTML = ""
  tablaProximo.innerHTML = ""
  tablaAtiempo.innerHTML = ""

  // Recorre cada expediente y lo ubica en su tabla
  expedientes.forEach(function(exp) {

    let dias = calcularDias(exp.fechaLimite)

// Construye la fila HTML con los datos del expediente
    let fila = `<tr>
      <td>${exp.id}</td>
      <td>${exp.tipo}</td>
      <td>${exp.demandante}</td>
      <td>${exp.fechaLimite}</td>
      <td>${dias} día(s)</td>
    </tr>`

// Clasifica según los días restantes
    if (dias <= 2) {
      tablaUrgente.innerHTML += fila
    } else if (dias <= 5) {
      tablaProximo.innerHTML += fila
    } else {
      tablaAtiempo.innerHTML += fila
    }

  })
}

// Ejecuta la función cuando carga la página
cargarAlertas()













// Calcula los días que faltan entre hoy y una fecha límite





function calcularDias(fechaLimite) {
  let hoy = new Date()
  let limite = new Date(fechaLimite)
  let diferencia = limite - hoy
  return Math.ceil(diferencia / (1000 * 60 * 60 * 24))
}