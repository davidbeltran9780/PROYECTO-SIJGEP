// VARIABLES GLOBALES
let expedienteSeleccionado = null;
let archivoActual = null;
let listaArchivos = [];

const BACKEND_URL = "http://127.0.0.1:8000";

// SELECCIONAR EXPEDIENTE
window.seleccionarExpediente = function() {
    const select = document.getElementById("expedienteSelect");
    expedienteSeleccionado = select.value;
    console.log("Expediente seleccionado:", expedienteSeleccionado);
}

// SPINNER
function mostrarSpinner() {
    document.getElementById("spinner").style.display = "block";
    document.getElementById("overlaySpinner").style.display = "block";
}

function ocultarSpinner() {
    document.getElementById("spinner").style.display = "none";
    document.getElementById("overlaySpinner").style.display = "none";
}

// RENDERIZAR ARCHIVOS
function renderizarArchivos() {
    const contenedor = document.getElementById("listaArchivos");
    if (!contenedor) return;
    contenedor.innerHTML = "";

    listaArchivos.forEach((archivo) => {
        const item = document.createElement("div");
        item.classList.add("archivo-item");

        const nombre = document.createElement("div");
        nombre.classList.add("archivo-nombre");
        nombre.textContent = archivo.name;

        const barra = document.createElement("div");
        barra.classList.add("barra");

        const progreso = document.createElement("div");
        progreso.classList.add("progreso");

        barra.appendChild(progreso);
        item.appendChild(nombre);
        item.appendChild(barra);
        contenedor.appendChild(item);

        let porcentaje = 0;
        const intervalo = setInterval(() => {
            porcentaje += 10;
            progreso.style.width = porcentaje + "%";
            if (porcentaje >= 100) clearInterval(intervalo);
        }, 100);
    });
}

// SUBIR ARCHIVO
window.addEventListener("DOMContentLoaded", () => {
    const inputArchivo = document.getElementById("inputArchivo");
    if (inputArchivo) {
        inputArchivo.addEventListener("change", async function () {
            const archivo = inputArchivo.files[0];
            if (!archivo) return;

            mostrarSpinner();
            await new Promise(resolve => setTimeout(resolve, 1000));

            archivoActual = archivo;
            listaArchivos.push(archivo);

            document.getElementById("nombreArchivo").textContent = archivo.name;
            renderizarArchivos();
            ocultarSpinner();
        });
    }
});

// CLASIFICAR
window.clasificar = async function() {
    if (!archivoActual) {
        alert("Primero sube un archivo");
        return;
    }
    mostrarSpinner();
    await new Promise(r => setTimeout(r, 2000));
    document.getElementById("resultadoClasificacion").textContent = "Tutela";
    ocultarSpinner();
}

// RESUMIR CON IA
window.resumirArchivo = async function() {
    if (!archivoActual) {
        alert("Primero sube un archivo");
        return;
    }

    try {
        mostrarSpinner();

        const formData = new FormData();
        formData.append("archivo", archivoActual);

        const respuesta = await fetch(BACKEND_URL + "/ia/resumir", {
            method: "POST",
            body: formData
        });

        const data = await respuesta.json();

        if (data.resumen) {
            document.getElementById("resultadoResumen").value = data.resumen;
        } else {
            document.getElementById("resultadoResumen").value = "Error: " + data.error;
        }

    } catch (error) {
        console.error(error);
        alert("Error al conectar con el servidor: " + error.message);
    } finally {
        ocultarSpinner();
    }
}

// BORRADOR
window.descargarBorrador = function() {
    if (!archivoActual) {
        alert("Primero sube un archivo");
        return;
    }

    const contenido = `BORRADOR JURÍDICO\n\nExpediente: ${expedienteSeleccionado}\n\nDocumento analizado: ${archivoActual.name}\n\nSe recomienda actuación inmediata.`;

    const blob = new Blob([contenido], { type: "application/msword" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "borrador.doc";
    a.click();
}