// ════════════════════════════════════════
//  Lógica del panel de administración
//  - Cambio de pestañas (Usuarios / Backups / Auditoría)
//  - Modal de Nuevo Usuario
// ════════════════════════════════════════


// Cambia entre las pestañas del panel de administración
function cambiarPestana(nombre) {
  // Quitar 'activa' de todos los botones de pestañas
  document.querySelectorAll(".tab-admin").forEach(function (b) {
    b.classList.remove("activa");
  });

  // Ocultar todos los paneles
  document.querySelectorAll(".tab-panel").forEach(function (p) {
    p.classList.remove("activa");
    p.style.display = "none";
  });

  // Activar el botón clickeado
  var botonActivo = document.querySelector(
    '.tab-admin[onclick*="' + nombre + '"]'
  );
  if (botonActivo) botonActivo.classList.add("activa");

  // Mostrar el panel correspondiente
  var panel = document.getElementById("panel-" + nombre);
  if (panel) {
    panel.classList.add("activa");
    panel.style.display = "block";
  }

  // Si se abre la pestaña de backups, cargar el historial real
  if (nombre === "backups") {
    cargarHistorialBackups();
  }

  // Guardar la pestaña activa en localStorage para recordarla al recargar
  localStorage.setItem("pestanaAdmin", nombre);
}


// Abrir modal de Nuevo Usuario
function abrirModalUsuario() {
  var modal = document.getElementById("modal-usuario");
  if (modal) modal.style.display = "flex";
}


// Cerrar modal de Nuevo Usuario
function cerrarModalUsuario() {
  var modal = document.getElementById("modal-usuario");
  if (modal) modal.style.display = "none";
}


// Conectar eventos cuando carga la página
document.addEventListener("DOMContentLoaded", function () {
  // Botón Cancelar del modal
  var btnCancelar = document.querySelector("#modal-usuario .btn-cancelar");
  if (btnCancelar) {
    btnCancelar.addEventListener("click", cerrarModalUsuario);
  }

  // Cerrar el modal al hacer clic en el fondo oscuro
  var modal = document.getElementById("modal-usuario");
  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal) cerrarModalUsuario();
    });
  }

  // Recuperar la pestaña activa guardada y activarla sin delay
  // cambiarPestana llama cargarHistorialBackups() internamente si es "backups"
  var pestanaGuardada = localStorage.getItem("pestanaAdmin");
  cambiarPestana(pestanaGuardada || "usuarios");
});


// Genera un backup manual y lo sube a Google Drive
async function generarBackup() {
  mostrarSpinner();
  try {
    const res = await fetch("http://127.0.0.1:8000/backups/manual", { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      mostrarExito("Backup creado: " + data.archivo);
    } else {
      mostrarError(data.detail || "Error al generar backup");
    }
  } catch (e) {
    mostrarError("No se pudo conectar con el servidor");
  } finally {
    ocultarSpinner();
  }
}


// Carga el historial de backups desde la BD y lo muestra en la tabla
async function cargarHistorialBackups() {
  try {
    const res = await fetch("http://127.0.0.1:8000/backups/listar");
    const data = await res.json();
    const tbody = document.querySelector("#panel-backups table tbody");
    if (!tbody) return;
    tbody.innerHTML = "";
    data.forEach(function(b) {
      const fecha = new Date(b.fecha);
      tbody.innerHTML += `
        <tr>
          <td data-label="Fecha">${fecha.toLocaleDateString("es-CO")}</td>
          <td data-label="Hora">${fecha.toLocaleTimeString("es-CO")}</td>
          <td data-label="Archivo">${b.archivo}</td>
          <td data-label="Estado"><span class="badge activo">${b.estado}</span></td>
          <td data-label="Enlace"><a href="${b.link_drive}" target="_blank" class="btn-accion-editar">Ver en Drive</a></td>
        </tr>`;
    });
  } catch (e) {
    console.error("Error cargando backups:", e);
  }
}