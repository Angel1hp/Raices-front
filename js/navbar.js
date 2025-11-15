// js/navbar.js
console.log("✅ navbar.js cargado correctamente");

// Verificar sesión al cargar
document.addEventListener('DOMContentLoaded', () => {
  console.log("🚀 DOMContentLoaded ejecutado en navbar");
  verificarSesionUsuario();
  
  // Configurar botón de logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', cerrarSesion);
    console.log("✅ Botón logout configurado");
  }
  
  // Toggle del menú móvil
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');
  
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      console.log("📱 Menú móvil toggled");
    });
  }
});

function verificarSesionUsuario() {
  console.log("🔍 Verificando sesión...");
  
  // Buscar datos del usuario en localStorage o sessionStorage
  const usuarioLocal = localStorage.getItem('usuario');
  const usuarioSession = sessionStorage.getItem('usuario');
  const usuario = usuarioLocal || usuarioSession;
  
  console.log("📦 Usuario en storage:", usuario);
  
  const loginLink = document.getElementById('loginLink');
  const registerBtn = document.getElementById('registerBtn');
  const userInfo = document.getElementById('userInfo');
  const userName = document.getElementById('userName');
  const userInitials = document.getElementById('userInitials');
  const logoutBtn = document.getElementById('logoutBtn');
  
  if (usuario) {
    try {
      const datosUsuario = JSON.parse(usuario);
      console.log('👤 Usuario logueado:', datosUsuario);
      
      // Ocultar botones de login y registro
      if (loginLink) {
        loginLink.style.display = 'none';
        console.log("✅ Login link ocultado");
      }
      if (registerBtn) {
        registerBtn.style.display = 'none';
        console.log("✅ Register button ocultado");
      }
      
      // Mostrar información del usuario
      if (userInfo) {
        userInfo.style.display = 'flex';
        console.log("✅ User info mostrado");
        
        // Mostrar nombre completo o usuario
        const nombreCompleto = datosUsuario.nombre 
          ? `${datosUsuario.nombre} ${datosUsuario.apellido || ''}`.trim()
          : datosUsuario.usuario;
        
        if (userName) {
          userName.textContent = nombreCompleto;
          console.log("✅ Nombre usuario:", nombreCompleto);
        }
        
        // Mostrar iniciales en el avatar
        if (userInitials) {
          let iniciales = 'U';
          if (datosUsuario.nombre) {
            iniciales = `${datosUsuario.nombre.charAt(0)}${datosUsuario.apellido ? datosUsuario.apellido.charAt(0) : ''}`.toUpperCase();
          } else if (datosUsuario.usuario) {
            iniciales = datosUsuario.usuario.charAt(0).toUpperCase();
          }
          userInitials.textContent = iniciales;
          console.log("✅ Iniciales:", iniciales);
        }
      }
      
      // Mostrar botón de logout
      if (logoutBtn) {
        logoutBtn.style.display = 'flex';
        console.log("✅ Logout button mostrado");
      }
      
    } catch (error) {
      console.error('❌ Error al parsear datos del usuario:', error);
      limpiarSesion();
    }
  } else {
    console.log('❌ No hay sesión activa');
    // Mostrar botones de login y registro
    if (loginLink) loginLink.style.display = 'block';
    if (registerBtn) registerBtn.style.display = 'block';
    if (userInfo) userInfo.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'none';
  }
}

function cerrarSesion() {
  console.log("🚪 Cerrando sesión...");
  
  // Confirmar antes de cerrar sesión
  if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
    limpiarSesion();
    
    // Mostrar notificación
    mostrarNotificacion('Sesión cerrada correctamente', 'success');
    
    // Redirigir al inicio después de 1 segundo
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
  }
}

function limpiarSesion() {
  // Limpiar todos los datos de sesión
  localStorage.removeItem('usuario');
  sessionStorage.removeItem('usuario');
  localStorage.removeItem('carrito');
  localStorage.removeItem('redirectAfterLogin');
  
  console.log('🧹 Sesión limpiada');
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