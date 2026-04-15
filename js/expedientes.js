const btnNuevo = document.querySelector(".nuevo");
const modal = document.getElementById("modalExpediente");
const cerrarModal = document.getElementById("cerrarModal");
const form = document.getElementById("formExpediente");
const tabla = document.querySelector("tbody");

// ABRIR MODAL
btnNuevo.addEventListener("click", () => {
  modal.style.display = "flex";
});

// CERRAR MODAL
cerrarModal.addEventListener("click", () => {
  modal.style.display = "none";
});

// GUARDAR EXPEDIENTE
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const tipo = document.getElementById("tipo").value;
  const demandante = document.getElementById("demandante").value;
  const fechaInput = document.getElementById("fecha").value;

  const hoy = new Date();
  const fechaExpediente = new Date(fechaInput);

  const diferenciaTiempo = fechaExpediente - hoy;
  const dias = Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24));

  let textoVence = "";
  let estado = "";
  let claseEstado = "";

  // 🔥 LÓGICA AUTOMÁTICA
  if (dias <= 0) {
    textoVence = "Vencido";
    estado = "Urgente";
    claseEstado = "urgente";
  } else if (dias === 1) {
    textoVence = "1 día";
    estado = "Urgente";
    claseEstado = "urgente";
  } else if (dias <= 3) {
    textoVence = dias + " días";
    estado = "Próximo";
    claseEstado = "proximo";
  } else {
    textoVence = dias + " días";
    estado = "A tiempo";
    claseEstado = "atiempo";
  }

  const fechaFormateada = new Date(fechaInput).toLocaleDateString("es-CO");

const fila = document.createElement("tr");
const id = Date.now(); // ID único

const tieneDocs = tieneDocumentos(id);

fila.innerHTML = `
  <td>${tipo}</td>
  <td>${demandante}</td>
  <td>${fechaFormateada}</td>
  <td>${textoVence}</td>
  <td class="${claseEstado}">${estado}</td>
  <td><button onclick="verDocumentos(${id})" class="${tieneDocs ? 'btn-subido' : 'btn-subir'}">
    📄 ${tieneDocs ? 'Subido' : 'Subir'}
  </button>
  </td>
`;

  tabla.appendChild(fila);

  form.reset();
  modal.style.display = "none";
});

function verDocumentos(id) {
  window.location.href = "documentos.html?id=" + id;
}

const checkboxes = document.querySelectorAll(".filtro input[type='checkbox']");
const filas = () => document.querySelectorAll("tbody tr");

checkboxes.forEach(cb => {
  cb.addEventListener("change", filtrar);
});

function tieneDocumentos(id) {
  const datos = JSON.parse(localStorage.getItem("documentos")) || {};
  return datos[id] && datos[id].length > 0;
}

function filtrar() {
  const activos = Array.from(checkboxes)
    .filter(cb => cb.checked)
    .map(cb => cb.parentElement.textContent.trim().toLowerCase());

  filas().forEach(fila => {
    const texto = fila.textContent.toLowerCase();

    if (activos.length === 0) {
      fila.style.display = "";
    } else {
      const coincide = activos.some(f => texto.includes(f));
      fila.style.display = coincide ? "" : "none";
    }
  });
}

window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});


