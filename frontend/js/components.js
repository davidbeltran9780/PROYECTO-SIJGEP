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

cargarComponente('../components/header.html', 'header-container');
cargarComponente('../components/sidebar.html', 'sidebar-container');
cargarComponente('../components/footer.html', 'footer-container');


