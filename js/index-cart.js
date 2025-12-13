// js/index-cart.js - Sistema de carrito UNIFICADO con BD
// ✅ VERSIÓN CORREGIDA - Funciones globales disponibles inmediatamente

const API_CARRITO = "http://localhost:3000/api/carrito";
window.carrito = [];
let carrito = window.carrito; // Alias local para compatibilidad
let usuarioActual = null;

console.log("🚀 index-cart.js iniciando...");

// =====================
// FUNCIONES GLOBALES - DISPONIBLES INMEDIATAMENTE
// =====================
window.obtenerUsuarioActual = function() {
  const usuarioLS = localStorage.getItem('usuario');
  const usuarioSS = sessionStorage.getItem('usuario');
  
  if (usuarioLS) {
    try {
      return JSON.parse(usuarioLS);
    } catch (e) {
      console.error("Error parseando usuario de localStorage:", e);
      return null;
    }
  }
  
  if (usuarioSS) {
    try {
      return JSON.parse(usuarioSS);
    } catch (e) {
      console.error("Error parseando usuario de sessionStorage:", e);
      return null;
    }
  }
  
  return null;
};

window.verificarSesion = function() {
  const usuario = window.obtenerUsuarioActual();
  const estaLogueado = usuario !== null && usuario.id !== undefined;
  console.log("🔐 Verificar sesión:", estaLogueado, "Usuario:", usuario?.usuario || "ninguno");
  return estaLogueado;
};

window.mostrarNotificacion = function(mensaje, tipo = 'info') {
  console.log(`📢 Notificación [${tipo}]:`, mensaje);
  const notif = document.createElement('div');
  notif.className = `notification ${tipo}`;
  notif.textContent = mensaje;
  document.body.appendChild(notif);
  
  setTimeout(() => {
    notif.classList.add('hide');
    setTimeout(() => notif.remove(), 300);
  }, 2000);
};

// ✅ Hacer disponible la función de mostrar modal de auth
window.mostrarModalAuth = function() {
  console.log("🔒 Mostrando modal de autenticación");
  const modal = document.getElementById('authModalOverlay');
  const closeBtn = document.getElementById('authModalClose');
  
  if (!modal) {
    console.error("❌ Modal de autenticación no encontrado");
    alert("Por favor inicia sesión para continuar");
    window.location.href = 'login.html';
    return;
  }
  
  modal.classList.add('active');
  
  const cerrarModal = () => {
    modal.classList.remove('active');
    document.removeEventListener('keydown', handleEsc);
  };
  
  const handleEsc = (e) => {
    if (e.key === 'Escape') cerrarModal();
  };
  
  if (closeBtn) {
    closeBtn.onclick = cerrarModal;
  }
  
  modal.onclick = (e) => {
    if (e.target === modal) cerrarModal();
  };
  
  document.addEventListener('keydown', handleEsc);
};

console.log("✅ Funciones globales disponibles:", {
  obtenerUsuarioActual: typeof window.obtenerUsuarioActual,
  verificarSesion: typeof window.verificarSesion,
  mostrarNotificacion: typeof window.mostrarNotificacion,
  mostrarModalAuth: typeof window.mostrarModalAuth
});

// =====================
// CARGAR CARRITO DESDE BD
// =====================
async function cargarCarritoDesdeDB() {
  usuarioActual = window.obtenerUsuarioActual();
  
  if (!usuarioActual || !usuarioActual.id) {
    console.log("ℹ️ No hay usuario logueado en index");
    window.carrito = []; // ✅ Actualizar global
    carrito = window.carrito;
    actualizarBadgeCarrito();
    return;
  }
  
  try {
    console.log(`📦 Cargando carrito del usuario ${usuarioActual.id}...`);
    const response = await fetch(`${API_CARRITO}/${usuarioActual.id}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log("ℹ️ No hay carrito previo");
        window.carrito = []; // ✅ Actualizar global
        carrito = window.carrito;
      } else {
        throw new Error('Error al cargar carrito');
      }
    } else {
      window.carrito = await response.json(); // ✅ Actualizar global
      carrito = window.carrito;
      console.log(`✅ Carrito cargado: ${carrito.length} items`);
    }
    
    actualizarBadgeCarrito();
  } catch (error) {
    console.error("❌ Error al cargar carrito:", error);
    window.carrito = []; // ✅ Actualizar global
    carrito = window.carrito;
    actualizarBadgeCarrito();
  }
}

// ✅ Hacer la función global para que index-enhanced pueda usarla
window.cargarCarritoDesdeDB = cargarCarritoDesdeDB;

// =====================
// DOM CONTENT LOADED
// =====================
document.addEventListener("DOMContentLoaded", async () => {
  console.log("📄 DOM cargado en index-cart.js");
  
  // Esperar un poco para que el navbar se cargue
  setTimeout(async () => {
    console.log("⏰ Timeout completado, configurando carrito...");
    await cargarCarritoDesdeDB();
    configurarCarrito();
    actualizarBadgeCarrito();
  }, 300);
});

// =====================
// CONFIGURAR CARRITO
// =====================
function configurarCarrito() {
  const cartIcon = document.getElementById("cartIcon");
  const cartModal = document.getElementById("cartModal");
  const cartOverlay = document.getElementById("cartOverlay");
  const cartClose = document.getElementById("cartClose");
  const cartClear = document.getElementById("cartClear");
  const cartCheckout = document.getElementById("cartCheckout");

  console.log("🛒 Configurando carrito en index...");

  if (cartIcon) {
    cartIcon.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (!window.verificarSesion()) {
        console.log("❌ Usuario no autenticado al abrir carrito");
        window.mostrarModalAuth();
        return;
      }
      
      console.log("✅ Usuario autenticado, abriendo carrito...");
      
      if (cartModal && cartOverlay) {
        cartModal.classList.add("open");
        cartOverlay.classList.add("active");
        document.body.style.overflow = 'hidden';
        renderizarCarrito();
      }
    });
    console.log("✅ Click handler agregado al carrito");
  } else {
    console.warn("⚠️ cartIcon no encontrado");
  }

  if (cartClose) {
    cartClose.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      cerrarCarrito();
    });
  }

  if (cartOverlay) {
    cartOverlay.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      cerrarCarrito();
    });
  }

  if (cartClear) {
    cartClear.addEventListener("click", async () => {
      if (confirm("¿Estás seguro de vaciar el carrito?")) {
        await vaciarCarrito();
      }
    });
  }

  if (cartCheckout) {
    cartCheckout.addEventListener("click", () => {
    if (carrito.length > 0) {
      // ✅ Iniciar checkout en lugar de redirigir
      if (typeof window.iniciarCheckout === 'function') {
        window.iniciarCheckout();
      } else {
        console.error("❌ Función iniciarCheckout no disponible");
        window.mostrarNotificacion("Error al iniciar checkout", "error");
      }
    } else {
      window.mostrarNotificacion("El carrito está vacío", "warning");
    }
  });
  }
}

function cerrarCarrito() {
  const cartModal = document.getElementById("cartModal");
  const cartOverlay = document.getElementById("cartOverlay");
  
  if (cartModal) cartModal.classList.remove("open");
  if (cartOverlay) cartOverlay.classList.remove("active");
  document.body.style.overflow = '';
}

// =====================
// VACIAR CARRITO EN BD
// =====================
async function vaciarCarrito() {
  usuarioActual = window.obtenerUsuarioActual();
  
  if (!usuarioActual || !usuarioActual.id) return;
  
  try {
    const response = await fetch(`${API_CARRITO}/cliente/${usuarioActual.id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) throw new Error('Error al vaciar carrito');
    
    console.log(`🗑️ Carrito vaciado en BD`);
    
    window.carrito = []; // ✅ Actualizar global
    carrito = window.carrito;
    actualizarBadgeCarrito();
    renderizarCarrito();
    
    window.mostrarNotificacion("Carrito vaciado", "success");
  } catch (error) {
    console.error("❌ Error al vaciar carrito:", error);
    window.mostrarNotificacion("Error al vaciar carrito", "error");
  }
}

// =====================
// CALCULAR TOTAL
// =====================
function calcularTotal() {
  const total = carrito.reduce((total, item) => 
    total + (parseFloat(item.precio_unitario) * item.cantidad), 0
  );
  return total.toFixed(2);
}

// =====================
// ACTUALIZAR BADGE
// =====================
function actualizarBadgeCarrito() {
  const badge = document.getElementById("cartBadge");
  const cartCountModal = document.getElementById("cartCountModal");
  const cartTotalDisplay = document.getElementById("cartTotalDisplay");
  const cartTotalNav = document.getElementById("cartTotalNav");
  
  const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
  const totalPrecio = calcularTotal();
  
  console.log(`📊 Actualizando badge: ${totalItems} items, S/ ${totalPrecio}`);
  
  if (badge) {
    if (totalItems > 0) {
      badge.textContent = totalItems;
      badge.style.display = "flex";
    } else {
      badge.style.display = "none";
    }
  }
  
  if (cartCountModal) {
    cartCountModal.textContent = totalItems;
  }
  
  if (cartTotalDisplay && cartTotalNav) {
    if (totalItems > 0) {
      cartTotalNav.textContent = totalPrecio;
      cartTotalDisplay.style.display = "block";
    } else {
      cartTotalDisplay.style.display = "none";
    }
  }
}

// ✅ HACER LA FUNCIÓN GLOBAL
window.actualizarBadgeCarrito = actualizarBadgeCarrito;

// =====================
// RENDERIZAR CARRITO
// =====================
function renderizarCarrito() {
  console.log("📄 Renderizando carrito en index...");
  
  const cartItems = document.getElementById("cartItems");
  const cartEmpty = document.getElementById("cartEmpty");
  const cartFooter = document.getElementById("cartFooter");
  const cartSubtotal = document.getElementById("cartSubtotal");
  const cartTotal = document.getElementById("cartTotal");
  const cartCountModal = document.getElementById("cartCountModal");
  
  if (!cartItems || !cartEmpty || !cartFooter) {
    console.error("❌ Elementos del carrito no encontrados");
    return;
  }
  
  const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
  
  if (cartCountModal) {
    cartCountModal.textContent = totalItems;
  }
  
  if (carrito.length === 0) {
    cartEmpty.style.display = "block";
    cartItems.style.display = "none";
    cartFooter.style.display = "none";
    return;
  }
  
  cartEmpty.style.display = "none";
  cartItems.style.display = "flex";
  cartFooter.style.display = "block";
  
  cartItems.innerHTML = carrito.map(item => `
    <div class="cart-item">
      <img src="${item.imagen || 'img/default.jpg'}" alt="${item.nombre}" class="cart-item-image">
      <div class="cart-item-details">
        <h3 class="cart-item-name">${item.nombre}</h3>
        <p class="cart-item-price">S/ ${parseFloat(item.precio_unitario).toFixed(2)}</p>
        <div class="cart-item-controls">
          <div class="cart-item-quantity">
            <button class="cart-qty-btn" onclick="quitarDelCarritoIndex(${item.id})">−</button>
            <span class="cart-qty-value">${item.cantidad}</span>
            <button class="cart-qty-btn" onclick="agregarMasIndex(${item.id})">+</button>
          </div>
          <button class="cart-item-remove" onclick="eliminarDelCarritoIndex(${item.id})" title="Eliminar">🗑️</button>
        </div>
        <p class="cart-item-subtotal">Subtotal: S/ ${(parseFloat(item.precio_unitario) * item.cantidad).toFixed(2)}</p>
      </div>
    </div>
  `).join('');
  
  const total = calcularTotal();
  if (cartSubtotal) cartSubtotal.textContent = total;
  if (cartTotal) cartTotal.textContent = total;
}

// =====================
// FUNCIONES PARA EL MODAL DEL CARRITO
// =====================
window.agregarMasIndex = async function(carritoItemId) {
  const item = carrito.find(i => i.id === carritoItemId);
  if (!item) return;
  
  try {
    const response = await fetch(`${API_CARRITO}/${carritoItemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cantidad: item.cantidad + 1 })
    });
    
    if (!response.ok) throw new Error('Error al actualizar');
    
    await cargarCarritoDesdeDB(); // ✅ Esto ya actualiza window.carrito
    renderizarCarrito();
  } catch (error) {
    console.error("❌ Error:", error);
    window.mostrarNotificacion("Error al actualizar carrito", "error");
  }
};

window.quitarDelCarritoIndex = async function(carritoItemId) {
  const item = carrito.find(i => i.id === carritoItemId);
  if (!item) return;
  
  try {
    const nuevaCantidad = item.cantidad - 1;
    
    const response = await fetch(`${API_CARRITO}/${carritoItemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cantidad: nuevaCantidad })
    });
    
    if (!response.ok) throw new Error('Error al actualizar');
    
    await cargarCarritoDesdeDB();
    renderizarCarrito();
  } catch (error) {
    console.error("❌ Error:", error);
    window.mostrarNotificacion("Error al actualizar carrito", "error");
  }
};

window.eliminarDelCarritoIndex = async function(carritoItemId) {
  if (!confirm("¿Eliminar este producto del carrito?")) return;
  
  try {
    const response = await fetch(`${API_CARRITO}/${carritoItemId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) throw new Error('Error al eliminar');
    
    await cargarCarritoDesdeDB();
    renderizarCarrito();
  } catch (error) {
    console.error("❌ Error:", error);
    window.mostrarNotificacion("Error al eliminar del carrito", "error");
  }
};

console.log("✅ index-cart.js completamente cargado");
console.log("📋 Funciones disponibles:", {
  verificarSesion: typeof window.verificarSesion,
  obtenerUsuarioActual: typeof window.obtenerUsuarioActual,
  mostrarNotificacion: typeof window.mostrarNotificacion,
  mostrarModalAuth: typeof window.mostrarModalAuth,
  actualizarBadgeCarrito: typeof window.actualizarBadgeCarrito,
  cargarCarritoDesdeDB: typeof window.cargarCarritoDesdeDB
});