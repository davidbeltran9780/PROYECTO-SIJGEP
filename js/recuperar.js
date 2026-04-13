function recuperarPassword() {
  let correo = document.querySelector("input[type='email']").value;
  let mensaje = document.getElementById("mensaje");

  if (correo === "") {
    alert("Por favor ingresa tu correo");
    return false;
  }

  mensaje.style.display = "block";
  mensaje.innerText = "Se envió un enlace para cambiar tu contraseña (simulado)";

  return false;
}