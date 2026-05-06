function cargarComponente(url, idContenedor) {
    fetch(url)
        .then(response => response.text())
        .then(html => {
            const contenedor = document.getElementById(idContenedor);
            if (contenedor) {
                contenedor.innerHTML = html;
            } else {
                console.error('No encontró el div:', idContenedor);
            }
        });
}

fetch('../components/header.html')
    .then(response => response.text())
    .then(html => {
        const contenedor = document.getElementById('header-container');
        if (contenedor) {
            contenedor.innerHTML = html;
            cargarUsuarioHeader();
        }
    });
cargarComponente('../components/sidebar.html', 'sidebar-container');
cargarComponente('../components/footer.html', 'footer-container');

// Ajuste responsive del menú lateral:
// abierto por defecto en escritorio, cerrado en móvil.
function ajustarMenuResponsive() {
  const menu = document.querySelector(".sidebar details");
  if (!menu) return;
  if (window.innerWidth <= 768) {
    menu.removeAttribute("open");
  } else {
    menu.setAttribute("open", "");
  }
}

// Esperar a que el sidebar termine de cargar (se inyecta asíncrono)
const observer = new MutationObserver(function () {
  if (document.querySelector(".sidebar details")) {
    ajustarMenuResponsive();
    observer.disconnect();
  }
});
observer.observe(document.body, { childList: true, subtree: true });

// Reajustar si el usuario cambia el tamaño de la ventana
window.addEventListener("resize", ajustarMenuResponsive);


// ════════════════════════════════════════
//  Campana de notificaciones (header)
// ════════════════════════════════════════

function toggleNotificaciones(event) {
  event.stopPropagation();
  const panel = document.getElementById("notif-panel");
  if (panel) panel.classList.toggle("activo");
}

function marcarTodasLeidas() {
  document.querySelectorAll(".notif-item.no-leida").forEach(function (item) {
    item.classList.remove("no-leida");
  });
  const badge = document.getElementById("notif-badge");
  if (badge) {
    badge.textContent = "";
    badge.setAttribute("data-count", "0");
  }
}

// Cerrar el panel al hacer clic fuera
document.addEventListener("click", function (e) {
  const panel = document.getElementById("notif-panel");
  const boton = document.querySelector(".notif-boton");
  if (!panel || !boton) return;
  if (panel.classList.contains("activo") && !panel.contains(e.target) && !boton.contains(e.target)) {
    panel.classList.remove("activo");
  }
});