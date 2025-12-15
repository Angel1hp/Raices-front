// admin/js/admin-auth.js

// ✅ NO declarar API_URL aquí, ya está en admin-main.js
// const API_URL = "https://raices-back.onrender.com/api/admin"; ❌ ELIMINAR ESTA LÍNEA

// =====================
// TOGGLE PASSWORD
// =====================
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('contrasena');

if (togglePassword) {
  togglePassword.addEventListener('click', () => {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    togglePassword.style.opacity = type === 'text' ? '1' : '0.5';
  });
}

// =====================
// LOGIN FORM
// =====================
const formLoginAdmin = document.getElementById('formLoginAdmin');

if (formLoginAdmin) {
  formLoginAdmin.addEventListener('submit', async (e) => {
    e.preventDefault();

    const usuario = document.getElementById('usuario').value.trim();
    const contrasena = document.getElementById('contrasena').value;

    if (!usuario || !contrasena) {
      mostrarNotificacion('Por favor completa todos los campos', 'error');
      return;
    }

    const btnLogin = document.getElementById('btnLogin');
    const btnText = btnLogin.querySelector('span');
    const originalText = btnText.textContent;

    // Deshabilitar botón
    btnLogin.disabled = true;
    btnText.textContent = 'Iniciando sesión...';
    btnLogin.innerHTML = `
      <div class="spinner"></div>
      <span>${btnText.textContent}</span>
    `;

    try {
      console.log('🔐 Intentando login:', usuario);

      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ usuario, contrasena })
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Login exitoso:', data);

        // Guardar token y datos del admin
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('admin', JSON.stringify(data.admin));

        mostrarNotificacion('¡Bienvenido! Redirigiendo...', 'success');

        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 1000);

      } else {
        console.error('❌ Error en login:', data.message);
        mostrarNotificacion(data.message || 'Error al iniciar sesión', 'error');
        
        // Restaurar botón
        btnLogin.disabled = false;
        btnLogin.innerHTML = `
          <span>${originalText}</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        `;
      }

    } catch (error) {
      console.error('❌ Error de conexión:', error);
      mostrarNotificacion('Error de conexión con el servidor', 'error');
      
      // Restaurar botón
      btnLogin.disabled = false;
      btnLogin.innerHTML = `
        <span>${originalText}</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="5" y1="12" x2="19" y2="12"/>
          <polyline points="12 5 19 12 12 19"/>
        </svg>
      `;
    }
  });
}

// =====================
// FUNCIÓN PARA VERIFICAR AUTENTICACIÓN
// =====================
function verificarAutenticacion() {
  const token = localStorage.getItem('adminToken');
  const currentPage = window.location.pathname.split('/').pop();

  // Si está en login y tiene token, redirigir a dashboard
  if (currentPage === 'index.html' && token) {
    window.location.href = 'dashboard.html';
    return false;
  }

  // Si NO está en login y NO tiene token, redirigir a login
  if (currentPage !== 'index.html' && !token) {
    window.location.href = 'index.html';
    return false;
  }

  return true;
}

// =====================
// FUNCIÓN PARA OBTENER DATOS DEL ADMIN
// =====================
function obtenerAdmin() {
  const adminData = localStorage.getItem('admin');
  if (adminData) {
    try {
      return JSON.parse(adminData);
    } catch (error) {
      console.error('Error al parsear datos del admin:', error);
      return null;
    }
  }
  return null;
}

// =====================
// FUNCIÓN PARA OBTENER TOKEN
// =====================
function obtenerToken() {
  return localStorage.getItem('adminToken');
}

// =====================
// FUNCIÓN PARA CERRAR SESIÓN
// =====================
async function cerrarSesion() {
  const confirmar = confirm('¿Estás seguro de que deseas cerrar sesión?');
  
  if (!confirmar) return;

  try {
    const token = obtenerToken();

    if (token) {
      await fetch(`${API_URL}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    }

  } catch (error) {
    console.error('Error al cerrar sesión:', error);
  } finally {
    // Limpiar localStorage
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');

    mostrarNotificacion('Sesión cerrada correctamente', 'success');

    setTimeout(() => {
      window.location.href = 'index.html';
    }, 500);
  }
}

// =====================
// FUNCIÓN PARA HACER PETICIONES AUTENTICADAS
// =====================
async function fetchConAuth(url, options = {}) {
  const token = obtenerToken();

  if (!token) {
    window.location.href = 'index.html';
    throw new Error('No hay token de autenticación');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    // Si el token es inválido, redirigir a login
    if (response.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('admin');
      window.location.href = 'index.html';
      throw new Error('Sesión expirada');
    }

    return response;

  } catch (error) {
    console.error('Error en petición:', error);
    throw error;
  }
}

// =====================
// FUNCIÓN PARA MOSTRAR NOTIFICACIONES
// =====================
function mostrarNotificacion(mensaje, tipo = 'info') {
  const container = document.getElementById('notification-container') || crearContainerNotificaciones();
  
  const notification = document.createElement('div');
  notification.className = `notification ${tipo}`;
  
  const iconos = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };
  
  notification.innerHTML = `
    <span style="font-size: 18px;">${iconos[tipo] || 'ℹ'}</span>
    <span>${mensaje}</span>
  `;
  
  container.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('hide');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function crearContainerNotificaciones() {
  const container = document.createElement('div');
  container.id = 'notification-container';
  document.body.appendChild(container);
  return container;
}

// =====================
// VERIFICAR AUTENTICACIÓN AL CARGAR
// =====================
document.addEventListener('DOMContentLoaded', () => {
  verificarAutenticacion();
});

console.log('✅ admin-auth.js cargado');