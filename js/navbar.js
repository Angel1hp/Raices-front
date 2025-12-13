// js/navbar.js
console.log("✅ navbar.js cargado correctamente");

// =====================
// INICIALIZACIÓN SEGURA CON RETRY
// =====================
function inicializarNavbar() {
  console.log("🚀 Inicializando navbar...");
  
  // Verificar que los elementos existen
  const userMenuBtn = document.getElementById('userMenuBtn');
  const notificationsBtn = document.getElementById('notificationsBtn');
  
  if (!userMenuBtn || !notificationsBtn) {
    console.warn("⚠️ Elementos del navbar no encontrados, reintentando en 200ms...");
    setTimeout(inicializarNavbar, 200);
    return;
  }
  
  console.log("✅ Elementos del navbar encontrados");
  
  // Verificar sesión
  verificarSesionUsuario();
  
  // Configurar botones de logout
  configurarLogout();
  
  // Configurar dropdown de usuario
  configurarDropdownUsuario();
  
  // Configurar dropdown de notificaciones
  configurarDropdownNotificaciones();
  
  // Cerrar dropdowns al hacer click fuera
  configurarClickFuera();
  
  // Toggle del menú móvil
  configurarMenuMovil();
  
  // Actualizar badge del carrito
  setTimeout(() => {
    if (typeof actualizarBadgeCarrito === 'function') {
      actualizarBadgeCarrito();
    } else if (typeof window.actualizarBadgeCarrito === 'function') {
      window.actualizarBadgeCarrito();
    }
  }, 500);
  
  console.log("✅ Navbar inicializado completamente");
}

// =====================
// CONFIGURAR LOGOUT
// =====================
function configurarLogout() {
  const logoutBtn = document.getElementById('logoutBtn');
  const logoutBtnDropdown = document.getElementById('logoutBtnDropdown');
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', cerrarSesion);
    console.log("✅ Botón logout principal configurado");
  }
  
  if (logoutBtnDropdown) {
    logoutBtnDropdown.addEventListener('click', cerrarSesion);
    console.log("✅ Botón logout dropdown configurado");
  }
}

// =====================
// CONFIGURAR DROPDOWN DE USUARIO
// =====================
function configurarDropdownUsuario() {
  const userMenuBtn = document.getElementById('userMenuBtn');
  const userDropdown = document.getElementById('userDropdown');
  
  if (!userMenuBtn || !userDropdown) {
    console.error("❌ No se encontraron elementos del dropdown de usuario");
    return;
  }
  
  userMenuBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("👤 Click en menú de usuario");
    
    // Toggle dropdown de usuario
    const isActive = userDropdown.classList.toggle('active');
    userMenuBtn.classList.toggle('active');
    
    console.log(`Usuario dropdown: ${isActive ? 'ABIERTO' : 'CERRADO'}`);
    
    // Cerrar notificaciones si están abiertas
    const notificationsDropdown = document.getElementById('notificationsDropdown');
    const notificationsBtn = document.getElementById('notificationsBtn');
    if (notificationsDropdown && notificationsDropdown.classList.contains('active')) {
      notificationsDropdown.classList.remove('active');
      if (notificationsBtn) notificationsBtn.classList.remove('active');
      console.log("🔔 Notificaciones cerradas");
    }
  });
  
  console.log("✅ Dropdown de usuario configurado");
}

// =====================
// CONFIGURAR DROPDOWN DE NOTIFICACIONES
// =====================
function configurarDropdownNotificaciones() {
  const notificationsBtn = document.getElementById('notificationsBtn');
  const notificationsDropdown = document.getElementById('notificationsDropdown');
  
  if (!notificationsBtn || !notificationsDropdown) {
    console.error("❌ No se encontraron elementos del dropdown de notificaciones");
    return;
  }
  
  notificationsBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("🔔 Click en notificaciones");
    
    // Toggle dropdown de notificaciones
    const isActive = notificationsDropdown.classList.toggle('active');
    notificationsBtn.classList.toggle('active');
    
    console.log(`Notificaciones dropdown: ${isActive ? 'ABIERTO' : 'CERRADO'}`);
    
    // Cerrar user dropdown si está abierto
    const userDropdown = document.getElementById('userDropdown');
    const userMenuBtn = document.getElementById('userMenuBtn');
    if (userDropdown && userDropdown.classList.contains('active')) {
      userDropdown.classList.remove('active');
      if (userMenuBtn) userMenuBtn.classList.remove('active');
      console.log("👤 Usuario dropdown cerrado");
    }
    
    // Cargar notificaciones si se abrió
    if (isActive) {
      cargarNotificaciones();
    }
  });
  
  // Configurar botón de marcar todas como leídas
  const markAllRead = document.getElementById('markAllRead');
  if (markAllRead) {
    markAllRead.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      marcarTodasComoLeidas();
    });
    console.log("✅ Botón 'marcar todas' configurado");
  }
  
  console.log("✅ Dropdown de notificaciones configurado");
}

// =====================
// CONFIGURAR CLICK FUERA
// =====================
function configurarClickFuera() {
  document.addEventListener('click', (e) => {
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    const notificationsBtn = document.getElementById('notificationsBtn');
    const notificationsDropdown = document.getElementById('notificationsDropdown');
    
    // Cerrar dropdown de usuario si se hace click fuera
    if (userDropdown && !userDropdown.contains(e.target) && !userMenuBtn?.contains(e.target)) {
      if (userDropdown.classList.contains('active')) {
        userDropdown.classList.remove('active');
        userMenuBtn?.classList.remove('active');
        console.log("👤 Usuario dropdown cerrado (click fuera)");
      }
    }
    
    // Cerrar dropdown de notificaciones si se hace click fuera
    if (notificationsDropdown && !notificationsDropdown.contains(e.target) && !notificationsBtn?.contains(e.target)) {
      if (notificationsDropdown.classList.contains('active')) {
        notificationsDropdown.classList.remove('active');
        notificationsBtn?.classList.remove('active');
        console.log("🔔 Notificaciones cerradas (click fuera)");
      }
    }
  });
  
  console.log("✅ Click fuera configurado");
}

// =====================
// CONFIGURAR MENÚ MÓVIL
// =====================
function configurarMenuMovil() {
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');
  
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      console.log("📱 Menú móvil toggled");
    });
    console.log("✅ Menú móvil configurado");
  }
}

// =====================
// VERIFICAR SESIÓN
// =====================
function verificarSesionUsuario() {
  console.log("🔐 Verificando sesión...");
  
  const usuarioLocal = localStorage.getItem('usuario');
  const usuarioSession = sessionStorage.getItem('usuario');
  const usuario = usuarioLocal || usuarioSession;
  
  const loginLink = document.getElementById('loginLink');
  const registerBtn = document.getElementById('registerBtn');
  const userMenuContainer = document.getElementById('userMenuContainer');
  const notificationsContainer = document.getElementById('notificationsContainer');
  const userName = document.getElementById('userName');
  const userInitials = document.getElementById('userInitials');
  const userInitialsLarge = document.getElementById('userInitialsLarge');
  const userFullName = document.getElementById('userFullName');
  const userEmail = document.getElementById('userEmail');
  
  if (usuario) {
    try {
      const datosUsuario = JSON.parse(usuario);
      console.log('👤 Usuario logueado:', datosUsuario);
      
      // Ocultar botones de login y registro
      if (loginLink) loginLink.style.display = 'none';
      if (registerBtn) registerBtn.style.display = 'none';
      
      // Mostrar menú de usuario y notificaciones
      if (userMenuContainer) {
        userMenuContainer.style.display = 'block';
        console.log("✅ Menú de usuario visible");
      }
      if (notificationsContainer) {
        notificationsContainer.style.display = 'block';
        console.log("✅ Notificaciones visibles");
      }
      
      // Configurar datos del usuario
      const nombreCompleto = datosUsuario.nombre 
        ? `${datosUsuario.nombre} ${datosUsuario.apellido || ''}`.trim()
        : datosUsuario.usuario;
      
      if (userName) userName.textContent = nombreCompleto;
      if (userFullName) userFullName.textContent = nombreCompleto;
      if (userEmail) userEmail.textContent = datosUsuario.email || '';
      
      // Iniciales
      let iniciales = 'U';
      if (datosUsuario.nombre) {
        iniciales = `${datosUsuario.nombre.charAt(0)}${datosUsuario.apellido ? datosUsuario.apellido.charAt(0) : ''}`.toUpperCase();
      } else if (datosUsuario.usuario) {
        iniciales = datosUsuario.usuario.charAt(0).toUpperCase();
      }
      
      if (userInitials) userInitials.textContent = iniciales;
      if (userInitialsLarge) userInitialsLarge.textContent = iniciales;
      
      // Cargar notificaciones
      cargarNotificaciones();
      
    } catch (error) {
      console.error('❌ Error al parsear datos del usuario:', error);
      limpiarSesion();
    }
  } else {
    console.log("ℹ️ No hay sesión activa");
    // Sin sesión
    if (loginLink) loginLink.style.display = 'block';
    if (registerBtn) registerBtn.style.display = 'block';
    if (userMenuContainer) userMenuContainer.style.display = 'none';
    if (notificationsContainer) notificationsContainer.style.display = 'none';
  }
}

// =====================
// CARGAR NOTIFICACIONES
// =====================
async function cargarNotificaciones() {
  const usuarioActual = window.obtenerUsuarioActual ? window.obtenerUsuarioActual() : null;
  
  if (!usuarioActual || !usuarioActual.id) {
    console.log("❌ No hay usuario para cargar notificaciones");
    return;
  }
  
  try {
    console.log(`📡 Cargando notificaciones para cliente ${usuarioActual.id}...`);
    
    const response = await fetch(`http://localhost:3000/api/notificaciones/${usuarioActual.id}`);
    
    if (!response.ok) throw new Error('Error al cargar notificaciones');
    
    const notificaciones = await response.json();
    
    console.log(`✅ ${notificaciones.length} notificaciones cargadas`);
    
    renderizarNotificaciones(notificaciones);
    actualizarBadgeNotificaciones(notificaciones);
    
  } catch (error) {
    console.error('❌ Error al cargar notificaciones:', error);
  }
}

function renderizarNotificaciones(notificaciones) {
  const notificationsList = document.getElementById('notificationsList');
  
  if (!notificationsList) return;
  
  if (notificaciones.length === 0) {
    notificationsList.innerHTML = `
      <div class="notifications-empty">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        <p>No tienes notificaciones</p>
      </div>
    `;
    return;
  }
  
  notificationsList.innerHTML = notificaciones.map(notif => `
    <div class="notification-item ${notif.leida ? '' : 'unread'}" onclick="marcarComoLeida(${notif.id})">
      <div class="notification-icon ${notif.tipo || 'info'}">
        ${notif.tipo === 'success' ? '✓' : 'ℹ'}
      </div>
      <div class="notification-content">
        <div class="notification-title">${notif.titulo}</div>
        <div class="notification-message">${notif.mensaje}</div>
        <div class="notification-time">${formatearTiempo(notif.fecha)}</div>
      </div>
    </div>
  `).join('');
}

function actualizarBadgeNotificaciones(notificaciones) {
  const badge = document.getElementById('notificationsBadge');
  
  if (!badge) return;
  
  const noLeidas = notificaciones.filter(n => !n.leida).length;
  
  if (noLeidas > 0) {
    badge.textContent = noLeidas;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}

async function marcarComoLeida(notificacionId) {
  try {
    await fetch(`http://localhost:3000/api/notificaciones/${notificacionId}/leer`, {
      method: 'PUT'
    });
    
    cargarNotificaciones();
  } catch (error) {
    console.error('❌ Error al marcar como leída:', error);
  }
}

async function marcarTodasComoLeidas() {
  const usuarioActual = window.obtenerUsuarioActual ? window.obtenerUsuarioActual() : null;
  
  if (!usuarioActual) return;
  
  try {
    await fetch(`http://localhost:3000/api/notificaciones/${usuarioActual.id}/leer-todas`, {
      method: 'PUT'
    });
    
    cargarNotificaciones();
    mostrarNotificacion('Todas las notificaciones marcadas como leídas', 'success');
  } catch (error) {
    console.error('❌ Error al marcar todas como leídas:', error);
  }
}

function formatearTiempo(fecha) {
  const ahora = new Date();
  const fechaNotif = new Date(fecha);
  const diff = Math.floor((ahora - fechaNotif) / 1000);
  
  if (diff < 60) return 'Justo ahora';
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
  if (diff < 604800) return `Hace ${Math.floor(diff / 86400)} días`;
  
  return fechaNotif.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
}

// =====================
// CERRAR SESIÓN
// =====================
function cerrarSesion() {
  console.log("🚪 Cerrando sesión...");
  
  if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
    limpiarSesion();
    
    if (typeof mostrarNotificacion === 'function') {
      mostrarNotificacion('Sesión cerrada correctamente', 'success');
    }
    
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
  }
}

async function limpiarSesion() {
  console.log('🧹 Limpiando sesión...');
  
  const usuarioActual = window.obtenerUsuarioActual ? window.obtenerUsuarioActual() : null;
  
  if (usuarioActual && usuarioActual.id) {
    try {
      const API_CARRITO = "http://localhost:3000/api/carrito";
      await fetch(`${API_CARRITO}/cliente/${usuarioActual.id}`, {
        method: 'DELETE'
      });
      console.log('🗑️ Carrito vaciado en BD');
    } catch (error) {
      console.error('❌ Error al vaciar carrito:', error);
    }
  }
  
  localStorage.removeItem('usuario');
  sessionStorage.removeItem('usuario');
  localStorage.removeItem('carrito');
  localStorage.removeItem('redirectAfterLogin');
  
  console.log('✅ Sesión limpiada');
}

function mostrarNotificacion(mensaje, tipo = 'info') {
  const notif = document.createElement('div');
  notif.className = `notification ${tipo}`;
  notif.textContent = mensaje;
  document.body.appendChild(notif);
  
  setTimeout(() => {
    notif.classList.add('hide');
    setTimeout(() => notif.remove(), 300);
  }, 2500);
}

// =====================
// INICIALIZAR CUANDO EL DOM ESTÉ LISTO
// =====================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializarNavbar);
} else {
  // El DOM ya está listo
  inicializarNavbar();
}
// ✅ AGREGAR AL FINAL DE navbar.js (después de las funciones existentes)

// =====================
// VER COMPROBANTE DENTRO DEL DROPDOWN
// =====================
window.verComprobante = function(ordenId, numeroComprobante) {
  console.log("📄 Ver comprobante en dropdown:", ordenId, numeroComprobante);
  
  // Cambiar a la vista del comprobante
  const listView = document.getElementById('notificationsListView');
  const comprobanteView = document.getElementById('notificationsComprobanteView');
  
  if (listView && comprobanteView) {
    listView.style.display = 'none';
    comprobanteView.style.display = 'flex';
    
    // Cargar el comprobante
    cargarComprobanteEnDropdown(ordenId, numeroComprobante);
  }
};

// =====================
// VOLVER A LA LISTA DE NOTIFICACIONES
// =====================
function volverAListaNotificaciones() {
  console.log("◀️ Volviendo a lista de notificaciones");
  
  const listView = document.getElementById('notificationsListView');
  const comprobanteView = document.getElementById('notificationsComprobanteView');
  
  if (listView && comprobanteView) {
    listView.style.display = 'flex';
    comprobanteView.style.display = 'none';
  }
}

// =====================
// CARGAR COMPROBANTE EN EL DROPDOWN
// =====================
async function cargarComprobanteEnDropdown(ordenId, numeroComprobante) {
  const container = document.getElementById('notificationsComprobanteContent');
  
  if (!container) {
    console.error("❌ Container del comprobante no encontrado");
    return;
  }
  
  // Mostrar loading
  container.innerHTML = `
    <div style="text-align: center; padding: 40px; color: #999;">
      <div style="width: 40px; height: 40px; border: 3px solid #f3f4f6; border-top-color: #af6d6d; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px;"></div>
      <p>Cargando comprobante...</p>
    </div>
  `;
  
  try {
    console.log("🔄 Cargando comprobante desde API:", ordenId);
    
    const response = await fetch(`http://localhost:3000/api/checkout/orden/${ordenId}`);
    
    if (!response.ok) {
      throw new Error('Error al cargar el comprobante');
    }
    
    const data = await response.json();
    console.log("✅ Datos del comprobante recibidos:", data);
    
    renderizarComprobanteMini(data.orden, data.detalles);
  } catch (error) {
    console.error("❌ Error al cargar comprobante:", error);
    container.innerHTML = `
      <div style="text-align: center; padding: 40px; color: #ef4444;">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin: 0 auto 16px; display: block;">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <p style="font-weight: 600; margin-bottom: 8px;">Error al cargar el comprobante</p>
        <p style="color: #999; font-size: 12px;">${error.message}</p>
      </div>
    `;
  }
}

// =====================
// RENDERIZAR COMPROBANTE VERSIÓN MINI
// =====================
function renderizarComprobanteMini(orden, detalles) {
  const container = document.getElementById('notificationsComprobanteContent');
  const esBoleta = orden.tipo_comprobante === 'boleta';
  
  const html = `
    <div class="comprobante-mini">
      <div class="comprobante-header">
        <div class="comprobante-empresa">Raíces</div>
        <div class="comprobante-ruc">R.U.C.: 20200406388</div>
        <div class="comprobante-direccion">
          Av. Cuba *** - Jesús María<br>
          Teléfono: 964 963 938
        </div>
      </div>
      
      <div class="comprobante-tipo">
        <div class="comprobante-tipo-titulo">
          ${esBoleta ? 'Boleta de Venta' : 'Factura'}
        </div>
        <div class="comprobante-tipo-numero">${orden.numero_comprobante}</div>
      </div>
      
      <div class="comprobante-info">
        <div class="comprobante-info-row">
          <span class="comprobante-info-label">Fecha:</span>
          <span class="comprobante-info-value">${formatearFecha(orden.fecha)}</span>
        </div>
        <div class="comprobante-info-row">
          <span class="comprobante-info-label">Hora:</span>
          <span class="comprobante-info-value">${formatearHora(orden.fecha)}</span>
        </div>
        <div class="comprobante-info-row">
          <span class="comprobante-info-label">Orden:</span>
          <span class="comprobante-info-value">#${orden.id}</span>
        </div>
      </div>
      
      <div class="comprobante-cliente">
        <div class="comprobante-cliente-titulo">CLIENTE</div>
        <div><strong>${orden.cliente_nombre}</strong></div>
        ${!esBoleta && orden.ruc ? `<div>RUC: ${orden.ruc}</div>` : ''}
        <div style="margin-top: 6px; font-size: 9px;">
          <strong>Entrega:</strong> ${orden.direccion_entrega}
          ${orden.referencia ? `<br>(${orden.referencia})` : ''}
        </div>
        <div style="font-size: 9px;">
          <strong>Hora:</strong> ${orden.hora_entrega}
        </div>
      </div>
      
      <div class="comprobante-items">
        <div class="comprobante-items-header">
          <div>Descripción</div>
          <div>Cant.</div>
          <div>Total</div>
        </div>
        ${detalles.map(item => `
          <div class="comprobante-item">
            <div class="comprobante-item-nombre">${item.producto_nombre}</div>
            <div class="comprobante-item-cant">${item.cantidad}</div>
            <div class="comprobante-item-total">S/ ${parseFloat(item.subtotal).toFixed(2)}</div>
          </div>
        `).join('')}
      </div>
      
      <div class="comprobante-totales">
        <div class="comprobante-total-row">
          <span>Op. Gravada:</span>
          <span>S/ ${parseFloat(orden.subtotal).toFixed(2)}</span>
        </div>
        <div class="comprobante-total-row">
          <span>IGV (18%):</span>
          <span>S/ ${parseFloat(orden.impuesto).toFixed(2)}</span>
        </div>
        <div class="comprobante-total-row final">
          <span>TOTAL:</span>
          <span>S/ ${parseFloat(orden.total).toFixed(2)}</span>
        </div>
      </div>
      
      <div class="comprobante-footer">
        <div class="comprobante-qr">📱</div>
        <div style="margin-top: 8px;">
          <strong>Pago:</strong> ${orden.metodo_pago?.toUpperCase() || 'CONTADO'}
        </div>
        <div class="comprobante-mensaje">
          Gracias por su preferencia.
        </div>
      </div>
    </div>
  `;
  
  container.innerHTML = html;
  console.log("✅ Comprobante mini renderizado");
}

function formatearFecha(fecha) {
  const date = new Date(fecha);
  const dia = String(date.getDate()).padStart(2, '0');
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const anio = date.getFullYear();
  return `${dia}/${mes}/${anio}`;
}

function formatearHora(fecha) {
  const date = new Date(fecha);
  const horas = String(date.getHours()).padStart(2, '0');
  const minutos = String(date.getMinutes()).padStart(2, '0');
  return `${horas}:${minutos}`;
}

// =====================
// DESCARGAR/IMPRIMIR COMPROBANTE
// =====================
function descargarComprobanteDesdeDropdown() {
  console.log("🖨️ Descargando comprobante...");
  // Por ahora, abrir en modal completo para imprimir
  const comprobanteContent = document.getElementById('notificationsComprobanteContent');
  if (comprobanteContent) {
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>Comprobante</title>');
    printWindow.document.write('<style>body{font-family: monospace; padding: 20px;}</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(comprobanteContent.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  }
}

// =====================
// CONFIGURAR BOTONES DEL DROPDOWN
// =====================
document.addEventListener('DOMContentLoaded', () => {
  // Botón de volver
  const backBtn = document.getElementById('notificationsBackBtn');
  if (backBtn) {
    backBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      volverAListaNotificaciones();
    });
    console.log("✅ Botón volver configurado");
  }
  
  // Botón de descargar
  const downloadBtn = document.getElementById('notificationsDownloadBtn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      descargarComprobanteDesdeDropdown();
    });
    console.log("✅ Botón descargar configurado");
  }
});

// =====================
// RECARGAR NOTIFICACIONES AUTOMÁTICAMENTE
// =====================
window.recargarNotificaciones = function() {
  console.log("🔄 Recargando notificaciones...");
  cargarNotificaciones();
};

// Recargar notificaciones cada 30 segundos
setInterval(() => {
  const usuarioActual = window.obtenerUsuarioActual ? window.obtenerUsuarioActual() : null;
  if (usuarioActual && usuarioActual.id) {
    // Solo recargar si estamos en la vista de lista (no en comprobante)
    const listView = document.getElementById('notificationsListView');
    if (listView && listView.style.display !== 'none') {
      cargarNotificaciones();
    }
  }
}, 30000);