function registrar() {
  let correo = document.querySelector("input[type='email']").value;
  let password = document.querySelector("input[type='password']").value;
  let rol = document.querySelector("select").value;

  if (correo === "" || password === "" || rol === "Seleccionar rol") {
    alert("Completa todos los campos");
    return false;
  }

  // traer usuarios guardados
  let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

  // verificar si ya existe
  let existe = usuarios.find(user => user.correo === correo);

  if (existe) {
    alert("Este correo ya está registrado");
    return false;
  }

  // guardar nuevo usuario
  usuarios.push({ correo, password, rol });

  localStorage.setItem("usuarios", JSON.stringify(usuarios));
  localStorage.setItem("rol", rol);

  alert("Registro exitoso");

  window.location.href = "index.html"; // volver al login
  return false;
}

function login() {

  let correo = document.querySelector("input[type='email']").value.trim();
  let password = document.querySelector("input[type='password']").value.trim();

  let correoGuardado = localStorage.getItem("correo");
  let passwordGuardado = localStorage.getItem("password");
  let rolGuardado = localStorage.getItem("rol");

  let error = document.querySelector(".error");

  error.style.display = "none";

  if (correoGuardado === null || passwordGuardado === null) {
    error.innerText = "Primero debes registrarte";
    error.style.display = "block";
    return false;
  }

  if (correo === correoGuardado && password === passwordGuardado) {
    window.location.href = "dashboard.html";
  } else {
    error.innerText = "Correo o contraseña incorrectos";
    error.style.display = "block";
    localStorage.setItem("rolActivo", rolGuardado);
  }

  return false;
}
