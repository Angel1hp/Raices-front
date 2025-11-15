// js/login.js
const API_URL = "http://localhost:3000/api/auth";

const formLogin = document.getElementById("formLogin");
const togglePassword = document.querySelector(".toggle-password");
const passwordInput = document.getElementById("contrasena");

// Toggle mostrar/ocultar contraseña
if (togglePassword) {
  togglePassword.addEventListener("click", () => {
    const type = passwordInput.type === "password" ? "text" : "password";
    passwordInput.type = type;
    togglePassword.querySelector(".eye-icon").style.opacity = type === "text" ? "0.5" : "1";
  });
}

// Manejar envío del formulario
formLogin.addEventListener("submit", async (e) => {
  e.preventDefault();

  const usuario = document.getElementById("usuario").value.trim();
  const contrasena = document.getElementById("contrasena").value;
  const recordar = document.querySelector('input[name="recordar"]').checked;

  // Validaciones básicas
  if (!usuario || !contrasena) {
    mostrarNotificacion("Por favor completa todos los campos", "error");
    return;
  }

  // Deshabilitar botón mientras se procesa
  const btnSubmit = formLogin.querySelector(".btn-submit");
  const btnText = btnSubmit.querySelector("span");
  const originalText = btnText.textContent;
  btnText.textContent = "Iniciando sesión...";
  btnSubmit.disabled = true;

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ usuario, contrasena }),
    });

    const data = await response.json();

    if (response.ok) {
      // Guardar datos del usuario
      const datosUsuario = {
        id: data.cliente.id,
        nombre: data.cliente.nombre,
        usuario: data.cliente.usuario,
        email: data.cliente.email,
        token: data.token
      };

      // Guardar en localStorage o sessionStorage según "recordar"
      if (recordar) {
        localStorage.setItem("usuario", JSON.stringify(datosUsuario));
      } else {
        sessionStorage.setItem("usuario", JSON.stringify(datosUsuario));
      }

      mostrarNotificacion("¡Inicio de sesión exitoso! 🎉", "success");

      // Redirigir después de 1 segundo
      setTimeout(() => {
        const redirectUrl = localStorage.getItem("redirectAfterLogin");
        if (redirectUrl) {
          localStorage.removeItem("redirectAfterLogin");
          window.location.href = redirectUrl;
        } else {
          window.location.href = "menu.html";
        }
      }, 1000);

    } else {
      mostrarNotificacion(data.message || "Error al iniciar sesión", "error");
      btnText.textContent = originalText;
      btnSubmit.disabled = false;
    }

  } catch (error) {
    console.error("Error:", error);
    mostrarNotificacion("Error de conexión con el servidor", "error");
    btnText.textContent = originalText;
    btnSubmit.disabled = false;
  }
});

// Función para mostrar notificaciones
function mostrarNotificacion(mensaje, tipo = "info") {
  const notif = document.createElement("div");
  notif.className = `notification ${tipo}`;
  notif.textContent = mensaje;
  document.body.appendChild(notif);

  setTimeout(() => {
    notif.classList.add("hide");
    setTimeout(() => notif.remove(), 300);
  }, 3000);
}