// js/registro.js
const API_URL = "http://localhost:3000/api/auth";

const formRegistro = document.getElementById("formRegistro");

// Variables globales para datos
let departamentos = [];
let provincias = [];
let distritos = [];

// ✅ FUNCIÓN DE NOTIFICACIÓN
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

// =====================
// MEDIDOR DE SEGURIDAD DE CONTRASEÑA
// =====================
function evaluarSeguridadContrasena(password) {
  let strength = 0;
  let feedback = "";
  
  if (!password) {
    return { strength: 0, feedback: "Ingresa una contraseña", class: "" };
  }

  // Criterios de seguridad
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  // Determinar nivel y mensaje
  if (strength <= 1) {
    feedback = "Muy débil";
    return { strength: 20, feedback, class: "very-weak" };
  } else if (strength === 2) {
    feedback = "Débil";
    return { strength: 40, feedback, class: "weak" };
  } else if (strength === 3) {
    feedback = "Aceptable";
    return { strength: 60, feedback, class: "medium" };
  } else if (strength === 4) {
    feedback = "Segura";
    return { strength: 80, feedback, class: "strong" };
  } else {
    feedback = "Muy segura";
    return { strength: 100, feedback, class: "very-strong" };
  }
}

// Event listener para contraseña
document.getElementById("contrasena").addEventListener("input", (e) => {
  const password = e.target.value;
  const result = evaluarSeguridadContrasena(password);
  
  const strengthBar = document.getElementById("strengthBar");
  const strengthText = document.getElementById("strengthText");
  
  strengthBar.style.width = `${result.strength}%`;
  strengthBar.className = `password-strength-fill ${result.class}`;
  strengthText.textContent = result.feedback;
  strengthText.className = `password-strength-text ${result.class}`;
});

// Toggle mostrar/ocultar contraseña
document.getElementById("togglePassword").addEventListener("click", function() {
  const passwordInput = document.getElementById("contrasena");
  const type = passwordInput.type === "password" ? "text" : "password";
  passwordInput.type = type;
  
  // Cambiar icono
  this.classList.toggle("active");
});

// =====================
// CARGAR DATOS DEL FORMULARIO
// =====================
document.addEventListener("DOMContentLoaded", async () => {
  await cargarDatosFormulario();
});

async function cargarDatosFormulario() {
  try {
    console.log("Cargando datos del formulario...");
    
    const response = await fetch(`${API_URL}/datos-formulario`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log("Datos recibidos:", result);

    if (result.success) {
      const { ubicaciones, generos, tiposDocumento } = result.data;

      // Almacenar datos globalmente
      departamentos = ubicaciones.departamentos;
      provincias = ubicaciones.provincias;
      distritos = ubicaciones.distritos;

      // Llenar select de géneros
      const selectGenero = document.getElementById("genero");
      selectGenero.innerHTML = '<option value="">Selecciona una opción</option>';
      generos.forEach(g => {
        selectGenero.innerHTML += `<option value="${g.id}">${g.nombre}</option>`;
      });

      // Llenar select de tipos de documento
      const selectTipoDoc = document.getElementById("tipo_documento");
      selectTipoDoc.innerHTML = '<option value="">Selecciona una opción</option>';
      tiposDocumento.forEach(td => {
        selectTipoDoc.innerHTML += `<option value="${td.id}">${td.nombre}</option>`;
      });

      // Llenar select de departamentos
      const selectDepartamento = document.getElementById("departamento");
      selectDepartamento.innerHTML = '<option value="">Selecciona un departamento</option>';
      departamentos.forEach(d => {
        selectDepartamento.innerHTML += `<option value="${d.id}">${d.nombre}</option>`;
      });

      console.log("✅ Datos cargados:", {
        departamentos: departamentos.length,
        provincias: provincias.length,
        distritos: distritos.length
      });
      
      // Configurar eventos de cascada
      configurarCascadaUbicacion();
      
      mostrarNotificacion("Datos cargados correctamente", "success");
    } else {
      throw new Error(result.message || "Error al cargar datos");
    }
  } catch (error) {
    console.error("Error cargando datos del formulario:", error);
    mostrarNotificacion("Error al cargar datos del formulario. Verifica la conexión.", "error");
  }
}

// =====================
// CASCADA DE UBICACIÓN
// =====================
function configurarCascadaUbicacion() {
  const selectDepartamento = document.getElementById("departamento");
  const selectProvincia = document.getElementById("provincia");
  const selectDistrito = document.getElementById("distrito");

  // Cuando se selecciona un departamento
  selectDepartamento.addEventListener("change", function() {
    const departamentoId = parseInt(this.value);
    
    // Resetear provincia y distrito
    selectProvincia.innerHTML = '<option value="">Selecciona una provincia</option>';
    selectDistrito.innerHTML = '<option value="">Selecciona provincia primero</option>';
    selectDistrito.disabled = true;

    if (!departamentoId) {
      selectProvincia.disabled = true;
      return;
    }

    // Filtrar provincias por departamento
    const provinciasFiltradas = provincias.filter(p => p.departamento_id === departamentoId);
    
    provinciasFiltradas.forEach(p => {
      selectProvincia.innerHTML += `<option value="${p.id}">${p.nombre}</option>`;
    });

    selectProvincia.disabled = false;
    console.log(`✅ ${provinciasFiltradas.length} provincias cargadas para departamento ${departamentoId}`);
  });

  // Cuando se selecciona una provincia
  selectProvincia.addEventListener("change", function() {
    const provinciaId = parseInt(this.value);
    
    // Resetear distrito
    selectDistrito.innerHTML = '<option value="">Selecciona un distrito</option>';

    if (!provinciaId) {
      selectDistrito.disabled = true;
      return;
    }

    // Filtrar distritos por provincia
    const distritosFiltrados = distritos.filter(d => d.provincia_id === provinciaId);
    
    distritosFiltrados.forEach(d => {
      selectDistrito.innerHTML += `<option value="${d.id}">${d.nombre}</option>`;
    });

    selectDistrito.disabled = false;
    console.log(`✅ ${distritosFiltrados.length} distritos cargados para provincia ${provinciaId}`);
  });
}

// =====================
// MANEJAR ENVÍO DEL FORMULARIO
// =====================
formRegistro.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Obtener datos del formulario
  const rucInput = document.getElementById("ruc");
  const rucValue = rucInput.value.trim();
  
  const formData = {
    nombre: document.getElementById("nombre").value.trim(),
    apellido: document.getElementById("apellido").value.trim(),
    email: document.getElementById("email").value.trim(),
    usuario: document.getElementById("usuario").value.trim(),
    contrasena: document.getElementById("contrasena").value,
    telefono: document.getElementById("telefono").value.trim(),
    direccion: document.getElementById("direccion").value.trim(),
    tipo_documento_id: parseInt(document.getElementById("tipo_documento").value),
    numero_documento: document.getElementById("numero_documento").value.trim(),
    genero_id: parseInt(document.getElementById("genero").value),
    distrito_id: parseInt(document.getElementById("distrito").value),
    ruc: rucValue !== '' ? rucValue : null
  };

  console.log("📦 Datos a enviar:", formData);

  // Validaciones
  if (formData.contrasena.length < 6) {
    mostrarNotificacion("La contraseña debe tener al menos 6 caracteres", "error");
    return;
  }

  if (!/^[0-9]{8,12}$/.test(formData.numero_documento)) {
    mostrarNotificacion("Número de documento inválido", "error");
    return;
  }

  if (!/^[0-9]{9}$/.test(formData.telefono)) {
    mostrarNotificacion("El teléfono debe tener 9 dígitos", "error");
    return;
  }

  // Validación de RUC (solo si se ingresó)
  if (formData.ruc && !/^[0-9]{11}$/.test(formData.ruc)) {
    mostrarNotificacion("El RUC debe tener 11 dígitos", "error");
    return;
  }

  // Validar que se haya seleccionado distrito
  if (!formData.distrito_id) {
    mostrarNotificacion("Debes seleccionar un distrito", "error");
    return;
  }

  // Deshabilitar botón
  const btnSubmit = formRegistro.querySelector(".btn-submit");
  const btnText = btnSubmit.querySelector("span");
  const originalText = btnText.textContent;
  btnText.textContent = "Registrando...";
  btnSubmit.disabled = true;

  try {
    const response = await fetch(`${API_URL}/registro`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    console.log("Respuesta del servidor:", data);

    if (response.ok) {
      mostrarNotificacion("¡Registro exitoso! Redirigiendo al login...", "success");
      
      setTimeout(() => {
        window.location.href = "login.html";
      }, 2000);

    } else {
      mostrarNotificacion(data.message || "Error al registrar", "error");
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

// =====================
// VALIDACIONES EN TIEMPO REAL
// =====================

// Validación del número de documento
document.getElementById("numero_documento").addEventListener("input", (e) => {
  e.target.value = e.target.value.replace(/[^0-9]/g, "");
});

// Validación del teléfono
document.getElementById("telefono").addEventListener("input", (e) => {
  e.target.value = e.target.value.replace(/[^0-9]/g, "").slice(0, 9);
});

// Validación del RUC
document.getElementById("ruc").addEventListener("input", (e) => {
  e.target.value = e.target.value.replace(/[^0-9]/g, "").slice(0, 11);
});