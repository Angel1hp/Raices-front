// js/auth-utils.js
// =====================
// UTILIDADES DE AUTENTICACIÓN GLOBALES
// =====================

console.log("🔐 auth-utils.js cargado");

// =====================
// OBTENER USUARIO ACTUAL
// =====================
window.obtenerUsuarioActual = function() {
  console.log("🔍 Buscando usuario actual...");
  
  const usuarioLS = localStorage.getItem('usuario');
  const usuarioSS = sessionStorage.getItem('usuario');
  
  console.log("📦 LocalStorage:", usuarioLS ? "✅ existe" : "❌ vacío");
  console.log("📦 SessionStorage:", usuarioSS ? "✅ existe" : "❌ vacío");
  
  if (usuarioLS) {
    try {
      const usuario = JSON.parse(usuarioLS);
      console.log("✅ Usuario encontrado en localStorage:", usuario);
      return usuario;
    } catch (e) {
      console.error("❌ Error al parsear usuario de localStorage:", e);
      return null;
    }
  }
  
  if (usuarioSS) {
    try {
      const usuario = JSON.parse(usuarioSS);
      console.log("✅ Usuario encontrado en sessionStorage:", usuario);
      return usuario;
    } catch (e) {
      console.error("❌ Error al parsear usuario de sessionStorage:", e);
      return null;
    }
  }
  
  console.log("❌ No se encontró usuario en ningún storage");
  return null;
};

// =====================
// VERIFICAR SI HAY SESIÓN ACTIVA
// =====================
window.verificarSesion = function() {
  const usuario = window.obtenerUsuarioActual();
  const haySesion = usuario !== null && usuario.id !== undefined;
  
  console.log(`🔐 Verificar sesión: ${haySesion ? '✅ ACTIVA' : '❌ INACTIVA'}`);
  
  return haySesion;
};

// =====================
// VERIFICAR SESIÓN Y REDIRIGIR SI NO HAY
// =====================
window.requerirAutenticacion = function(paginaDestino = 'login.html') {
  console.log("🔒 Verificando autenticación requerida...");
  
  if (!window.verificarSesion()) {
    console.log("❌ No autenticado, redirigiendo a:", paginaDestino);
    
    // Guardar la página actual para redirigir después del login
    localStorage.setItem('redirectAfterLogin', window.location.pathname);
    
    window.location.href = paginaDestino;
    return false;
  }
  
  console.log("✅ Usuario autenticado correctamente");
  return true;
};

// =====================
// GUARDAR USUARIO EN STORAGE
// =====================
window.guardarUsuario = function(usuario, recordar = false) {
  console.log("💾 Guardando usuario:", usuario);
  
  const usuarioStr = JSON.stringify(usuario);
  
  if (recordar) {
    localStorage.setItem('usuario', usuarioStr);
    console.log("✅ Usuario guardado en localStorage");
  } else {
    sessionStorage.setItem('usuario', usuarioStr);
    console.log("✅ Usuario guardado en sessionStorage");
  }
};

// =====================
// LIMPIAR SESIÓN
// =====================
window.limpiarSesion = async function() {
  console.log('🧹 Limpiando sesión...');
  
  const usuarioActual = window.obtenerUsuarioActual();
  
  // Vaciar carrito en BD si hay usuario
  if (usuarioActual && usuarioActual.id) {
    try {
      const API_CARRITO = "https://raices-back.onrender.com/api/carrito";
      await fetch(`${API_CARRITO}/cliente/${usuarioActual.id}`, {
        method: 'DELETE'
      });
      console.log('🗑️ Carrito vaciado en BD');
    } catch (error) {
      console.error('❌ Error al vaciar carrito:', error);
    }
  }
  
  // Limpiar storage
  localStorage.removeItem('usuario');
  sessionStorage.removeItem('usuario');
  localStorage.removeItem('carrito');
  
  console.log('✅ Sesión limpiada completamente');
};

// =====================
// MOSTRAR NOTIFICACIÓN
// =====================
window.mostrarNotificacion = function(mensaje, tipo = 'info') {
  console.log(`📢 Notificación [${tipo}]: ${mensaje}`);
  
  const notif = document.createElement('div');
  notif.className = `notification ${tipo}`;
  notif.textContent = mensaje;
  document.body.appendChild(notif);
  
  // Animar entrada
  setTimeout(() => notif.classList.add('show'), 10);
  
  // Animar salida y remover
  setTimeout(() => {
    notif.classList.remove('show');
    notif.classList.add('hide');
    setTimeout(() => notif.remove(), 300);
  }, 3000);
};

console.log("✅ Utilidades de autenticación disponibles globalmente");