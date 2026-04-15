// 🔥 DATOS SIMULADOS
const datos = [
    { expediente: "EXP-001", tipo: "Tutela", estado: "Urgente", vence: "1 día" },
    { expediente: "EXP-002", tipo: "Demanda", estado: "Próximo", vence: "3 días" },
    { expediente: "EXP-003", tipo: "PQRS", estado: "A tiempo", vence: "10 días" },
    { expediente: "EXP-004", tipo: "Tutela", estado: "Urgente", vence: "2 días" }
];


// 🔹 GENERAR REPORTE
function generarReporte() {
    const tipo = document.getElementById("tipoReporte").value;

    let filtrados = datos;

    if (tipo) {
        filtrados = datos.filter(d => d.tipo === tipo);
    }

    renderTabla(filtrados);
    actualizarTarjetas(filtrados);
}


// 🔹 RENDER TABLA
function renderTabla(lista) {
    const tabla = document.getElementById("tablaReportes");
    tabla.innerHTML = "";

    lista.forEach(d => {
        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td>${d.expediente}</td>
            <td>${d.tipo}</td>
            <td class="${getClaseEstado(d.estado)}">${d.estado}</td>
            <td>${d.vence}</td>
        `;

        tabla.appendChild(fila);
    });
}


// 🔹 COLORES ESTADO
function getClaseEstado(estado) {
    if (estado === "Urgente") return "urgente";
    if (estado === "Próximo") return "proximo";
    return "atiempo";
}


// 🔹 TARJETAS
function actualizarTarjetas(lista) {
    document.getElementById("totalCasos").textContent = lista.length;

    const alertas = lista.filter(d => d.estado === "Próximo").length;
    const vencidos = lista.filter(d => d.estado === "Urgente").length;

    document.getElementById("totalAlertas").textContent = alertas;
    document.getElementById("totalVencidos").textContent = vencidos;
}


// 🔹 INICIAL
window.onload = () => {
    generarReporte();
};
