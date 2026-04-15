const btnNuevo = document.getElementById("btnNuevo");
const modal = document.getElementById("modal");
const cerrarModal = document.getElementById("cerrarModal");
const form = document.getElementById("pqrsForm");


// ABRIR MODAL

btnNuevo.addEventListener("click", () => {

    modal.style.display = "flex";

});


// CERRAR MODAL

cerrarModal.addEventListener("click", () => {

    modal.style.display = "none";

});


// GUARDAR DATOS EN TABLA

form.addEventListener("submit", (e) => {

    e.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const correo = document.getElementById("correo").value;
    const tipo = document.getElementById("tipo").value;
    const mensaje = document.getElementById("mensaje").value;

    const tabla = document.getElementById("tbodyPQRS");

    const fila = document.createElement("tr");

    fila.innerHTML = `
        <td>${nombre}</td>
        <td>${correo}</td>
        <td>${tipo}</td>
        <td>${mensaje}</td>
    `;

    tabla.appendChild(fila);

    form.reset();

    modal.style.display = "none";

});