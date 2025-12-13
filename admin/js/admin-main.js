// admin/js/admin-main.js - Funciones comunes del panel admin

// ✅ DECLARAR API_URL GLOBALMENTE
var API_URL = "http://localhost:3000/api/admin";

// =====================
// FUNCIÓN PARA VERIFICAR AUTENTICACIÓN (DEBE ESTAR AL INICIO)
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
// CARGAR DATOS DEL ADMIN EN SIDEBAR
// =====================
function cargarDatosAdmin() {
  const admin = obtenerAdmin();
  
  if (!admin) {
    console.error('❌ No hay datos de admin');
    return;
  }

  console.log('👤 Admin:', admin);

  // Actualizar nombre
  const userNameEl = document.getElementById('userName');
  if (userNameEl) {
    userNameEl.textContent = `${admin.nombre} ${admin.apellido}`;
  }

  // Actualizar rol
  const userRoleEl = document.getElementById('userRole');
  if (userRoleEl) {
    const roles = {
      'admin': 'Administrador',
      'gerente': 'Gerente',
      'cajero': 'Cajero',
      'cocinero': 'Cocinero',
      'mesero': 'Mesero'
    };
    userRoleEl.textContent = roles[admin.rol] || admin.rol;
  }

  // Actualizar avatar (iniciales)
  const userAvatarEl = document.getElementById('userAvatar');
  if (userAvatarEl) {
    const iniciales = `${admin.nombre.charAt(0)}${admin.apellido.charAt(0)}`.toUpperCase();
    userAvatarEl.textContent = iniciales;
  }
}

// =====================
// MARCAR ITEM DEL MENÚ COMO ACTIVO
// =====================
function marcarMenuActivo() {
  const currentPage = window.location.pathname.split('/').pop();
  
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    
    const href = item.getAttribute('href');
    if (href === currentPage) {
      item.classList.add('active');
    }
  });
}

// =====================
// FORMATEAR FECHA
// =====================
function formatearFecha(fecha) {
  if (!fecha) return '-';
  
  const date = new Date(fecha);
  const dia = String(date.getDate()).padStart(2, '0');
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const anio = date.getFullYear();
  
  return `${dia}/${mes}/${anio}`;
}

function formatearFechaHora(fecha) {
  if (!fecha) return '-';
  
  const date = new Date(fecha);
  const dia = String(date.getDate()).padStart(2, '0');
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const anio = date.getFullYear();
  const horas = String(date.getHours()).padStart(2, '0');
  const minutos = String(date.getMinutes()).padStart(2, '0');
  
  return `${dia}/${mes}/${anio} ${horas}:${minutos}`;
}

// =====================
// FORMATEAR MONEDA
// =====================
function formatearMoneda(monto) {
  if (monto === null || monto === undefined) return 'S/ 0.00';
  
  return `S/ ${parseFloat(monto).toFixed(2)}`;
}

// =====================
// BADGE DE ESTADO
// =====================
function obtenerBadgeEstado(estado) {
  const badges = {
    'pendiente': '<span class="status-badge warning">Pendiente</span>',
    'en_proceso': '<span class="status-badge warning">En Proceso</span>',
    'completado': '<span class="status-badge success">Completado</span>',
    'completada': '<span class="status-badge success">Completada</span>',
    'cancelado': '<span class="status-badge danger">Cancelado</span>',
    'cancelada': '<span class="status-badge danger">Cancelada</span>',
    'entregado': '<span class="status-badge success">Entregado</span>',
    'activo': '<span class="status-badge success">Activo</span>',
    'inactivo': '<span class="status-badge danger">Inactivo</span>'
  };
  
  return badges[estado] || `<span class="status-badge">${estado}</span>`;
}

// =====================
// LOADING
// =====================
function mostrarLoading(mensaje = 'Cargando...') {
  const loadingHTML = `
    <div style="text-align: center; padding: 40px; color: #999;">
      <div style="width: 40px; height: 40px; border: 3px solid #f3f4f6; border-top-color: #af6d6d; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px;"></div>
      <p>${mensaje}</p>
    </div>
  `;
  return loadingHTML;
}

function mostrarError(mensaje = 'Error al cargar datos') {
  return `
    <div style="text-align: center; padding: 40px; color: #ef4444;">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin: 0 auto 16px; display: block;">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <p style="font-weight: 600; margin-bottom: 8px;">Error</p>
      <p style="color: #999; font-size: 14px;">${mensaje}</p>
    </div>
  `;
}

function mostrarVacio(mensaje = 'No hay datos disponibles') {
  return `
    <tr>
      <td colspan="100" style="text-align: center; padding: 40px; color: #999;">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="margin: 0 auto 16px; display: block; opacity: 0.3;">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="8" y1="15" x2="16" y2="15"></line>
          <line x1="9" y1="9" x2="9.01" y2="9"></line>
          <line x1="15" y1="9" x2="15.01" y2="9"></line>
        </svg>
        <p>${mensaje}</p>
      </td>
    </tr>
  `;
}

// =====================
// CONFIRMAR ACCIÓN
// =====================
function confirmarAccion(mensaje, tipo = 'warning') {
  return confirm(mensaje);
}

// =====================
// MODAL SIMPLE
// =====================
function mostrarModal(titulo, contenido, botones = []) {
  // Crear overlay
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.2s;
  `;

  // Crear modal
  const modal = document.createElement('div');
  modal.style.cssText = `
    background: white;
    border-radius: 12px;
    padding: 24px;
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: slideUp 0.3s;
  `;

  modal.innerHTML = `
    <h3 style="margin: 0 0 16px; font-size: 20px; color: #2d3748;">${titulo}</h3>
    <div style="margin-bottom: 24px; color: #4a5568;">${contenido}</div>
    <div style="display: flex; gap: 12px; justify-content: flex-end;">
      ${botones.map(btn => `
        <button class="btn ${btn.class || 'btn-secondary'}" onclick="${btn.onclick}">
          ${btn.texto}
        </button>
      `).join('')}
      <button class="btn btn-secondary" onclick="this.closest('[style*=\\'position: fixed\\']').remove()">
        Cerrar
      </button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Cerrar al hacer click fuera
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });

  return overlay;
}

// =====================
// INICIALIZAR AL CARGAR
// =====================
document.addEventListener('DOMContentLoaded', () => {
  // Verificar autenticación
  if (!verificarAutenticacion()) {
    return;
  }

  // Cargar datos del admin
  cargarDatosAdmin();

  // Marcar menú activo
  marcarMenuActivo();

  console.log('✅ admin-main.js inicializado');
});

// =====================
// ESTILOS PARA ANIMACIONES
// =====================
if (!document.getElementById('admin-animations')) {
  const style = document.createElement('style');
  style.id = 'admin-animations';
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideUp {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

console.log('✅ admin-main.js cargado');
// =====================
// HACER FUNCIONES GLOBALES
// =====================
window.verificarAutenticacion = verificarAutenticacion;
window.obtenerAdmin = obtenerAdmin;
window.obtenerToken = obtenerToken;
window.cerrarSesion = cerrarSesion;
window.fetchConAuth = fetchConAuth;
window.mostrarNotificacion = mostrarNotificacion;
window.formatearFecha = formatearFecha;
window.formatearFechaHora = formatearFechaHora;
window.formatearMoneda = formatearMoneda;
window.obtenerBadgeEstado = obtenerBadgeEstado;
window.mostrarLoading = mostrarLoading;
window.mostrarError = mostrarError;
window.mostrarVacio = mostrarVacio;
window.confirmarAccion = confirmarAccion;
window.mostrarModal = mostrarModal;