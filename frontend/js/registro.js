function registrar() {

  let correo = document.getElementById("correo").value;
  let password = document.getElementById("password").value;

  // Guardar datos
  localStorage.setItem("correo", correo);
  localStorage.setItem("password", password);

  alert("Usuario registrado correctamente");

  // Redirigir al login
  window.location.href = "index.html";
    return false;
}

