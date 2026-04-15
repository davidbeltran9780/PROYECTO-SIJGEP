const inputArchivo = document.getElementById("archivo");
const barra = document.getElementById("progreso");
const preview = document.getElementById("preview");
const params = new URLSearchParams(window.location.search);
const expedienteId = params.get("id");

const id = params.get("id");

document.getElementById("tituloExpediente").innerText =
  "Documentos del expediente #" + id;
  
const titulo = document.getElementById("tituloExpediente");
titulo.textContent = "Documentos del expediente #" + expedienteId;

inputArchivo.addEventListener("change", (e) => {
  const archivo = e.target.files[0];

  if (!archivo) return;

  // 🔄 Simular carga (barra de progreso)
  let progreso = 0;

  const intervalo = setInterval(() => {
    progreso += 10;
    barra.style.width = progreso + "%";

    if (progreso >= 100) {
  clearInterval(intervalo);
  mostrarPreview(archivo);
  guardarDocumento(archivo);
}
  }, 100);
});

function mostrarPreview(archivo) {
  preview.innerHTML = "";

  const tipo = archivo.type;

  // 🖼️ IMÁGENES
  if (tipo.startsWith("image/")) {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(archivo);
    img.style.maxWidth = "300px";
    preview.appendChild(img);
  }

  // 📄 PDF
  else if (tipo === "application/pdf") {
    const iframe = document.createElement("iframe");
    iframe.src = URL.createObjectURL(archivo);
    iframe.width = "100%";
    iframe.height = "400px";
    preview.appendChild(iframe);
  }

  // ❌ OTROS
  else {
    preview.innerHTML = "<p>Archivo no soportado</p>";
  }
}

function guardarDocumento(archivo) {
  const datos = JSON.parse(localStorage.getItem("documentos")) || {};

  if (!datos[expedienteId]) {
    datos[expedienteId] = [];
  }

  datos[expedienteId].push({
    nombre: archivo.name,
    tipo: archivo.type,
    url: URL.createObjectURL(archivo)
  });

  localStorage.setItem("documentos", JSON.stringify(datos));
}

function cargarDocumentos() {
  const datos = JSON.parse(localStorage.getItem("documentos")) || {};
  const lista = datos[expedienteId] || [];

  lista.forEach(doc => {
    const contenedor = document.createElement("div");

    if (doc.tipo.startsWith("image/")) {
      contenedor.innerHTML = `<img src="${doc.url}" width="150">`;
    } else {
      contenedor.innerHTML = `<iframe src="${doc.url}" width="200" height="200"></iframe>`;
    }

    preview.appendChild(contenedor);
  });
}

cargarDocumentos();

const label = document.querySelector(".custom-file span");

inputArchivo.addEventListener("change", (e) => {
  const archivo = e.target.files[0];

  if (!archivo) return;

  label.textContent = archivo.name; // 🔥 muestra nombre

  let progreso = 0;

  const intervalo = setInterval(() => {
    progreso += 10;
    barra.style.width = progreso + "%";

    if (progreso >= 100) {
      clearInterval(intervalo);
      mostrarPreview(archivo);
      guardarDocumento(archivo);
    }
  }, 100);
});

