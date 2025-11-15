// js/index-cart.js - Sistema de carrito para index.html

let carrito = [];

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ index-cart.js cargado");
  
  cargarCarritoDesdeLocalStorage();
  
  // ⏰ Esperar a que el navbar se cargue antes de configurar el carrito
  setTimeout(() => {
    configurarCarrito();
    actualizarBadgeCarrito();
  }, 200);
});

// =====================
// VERIFICAR SESIÓN
// =====================
function verificarSesion() {
  const usuario = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');
  console.log("🔍 Verificando sesión:", usuario ? "✅ Logueado" : "❌ No logueado");
  return usuario !== null;
}

// =====================
// MODAL DE AUTENTICACIÓN
// =====================
function mostrarModalAuth() {
  console.log("Mostrando modal de autenticación");
  const modal = document.getElementById('authModalOverlay');
  const closeBtn = document.getElementById('authModalClose');
  
  if (modal) {
    modal.classList.add('active');
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        cerrarModalAuth();
      }
    });
    
    if (closeBtn) {
      closeBtn.addEventListener('click', cerrarModalAuth);
    }
    
    document.addEventListener('keydown', handleEscKeyAuth);
  } else {
    console.error("❌ Modal de autenticación no encontrado");
  }
}

function cerrarModalAuth() {
  const modal = document.getElementById('authModalOverlay');
  if (modal) {
    modal.classList.remove('active');
    document.removeEventListener('keydown', handleEscKeyAuth);
  }
}

function handleEscKeyAuth(e) {
  if (e.key === 'Escape') {
    cerrarModalAuth();
  }
}

// =====================
// SISTEMA DE CARRITO
// =====================
function configurarCarrito() {
  const cartIcon = document.getElementById("cartIcon");
  const cartModal = document.getElementById("cartModal");
  const cartOverlay = document.getElementById("cartOverlay");
  const cartClose = document.getElementById("cartClose");
  const cartClear = document.getElementById("cartClear");
  const cartCheckout = document.getElementById("cartCheckout");

  console.log("🛒 Configurando carrito en index...");
  console.log("Cart Icon:", cartIcon);
  console.log("Cart Modal:", cartModal);

  // Abrir carrito
  if (cartIcon) {
    cartIcon.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log("🛒 Click en carrito detectado");
      
      // ✅ VERIFICAR SESIÓN ANTES DE ABRIR
      if (!verificarSesion()) {
        console.log("❌ Usuario no autenticado - Mostrando modal de login");
        mostrarModalAuth();
        return;
      }
      
      console.log("🛒 Abriendo carrito...");
      console.log("📦 Carrito actual:", carrito);
      
      if (cartModal && cartOverlay) {
        cartModal.classList.add("open");
        cartOverlay.classList.add("active");
        document.body.style.overflow = 'hidden';
        
        renderizarCarrito();
      }
    });
    console.log("✅ Evento click asignado al icono del carrito");
  } else {
    console.error("❌ cartIcon no encontrado");
  }

  // Cerrar carrito
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

  // Vaciar carrito
  if (cartClear) {
    cartClear.addEventListener("click", () => {
      if (confirm("¿Estás seguro de vaciar el carrito?")) {
        carrito = [];
        guardarCarritoEnLocalStorage();
        actualizarBadgeCarrito();
        renderizarCarrito();
        mostrarNotificacion("Carrito vaciado", "success");
      }
    });
  }

  // Checkout
  if (cartCheckout) {
    cartCheckout.addEventListener("click", () => {
      if (carrito.length > 0) {
        const total = calcularTotal();
        const itemsCount = carrito.reduce((sum, item) => sum + item.cantidad, 0);
        
        // Redirigir al menú para hacer el checkout
        window.location.href = 'menu.html';
      } else {
        mostrarNotificacion("El carrito está vacío", "warning");
      }
    });
  }
  
  console.log("✅ Carrito configurado en index");
}

function cerrarCarrito() {
  const cartModal = document.getElementById("cartModal");
  const cartOverlay = document.getElementById("cartOverlay");
  
  if (cartModal) cartModal.classList.remove("open");
  if (cartOverlay) cartOverlay.classList.remove("active");
  document.body.style.overflow = '';
  
  console.log("🚪 Carrito cerrado");
}

function calcularTotal() {
  const total = carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  return total.toFixed(2);
}

function actualizarBadgeCarrito() {
  const badge = document.getElementById("cartBadge");
  const cartCountModal = document.getElementById("cartCountModal");
  const cartTotalDisplay = document.getElementById("cartTotalDisplay");
  const cartTotalNav = document.getElementById("cartTotalNav");
  
  const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
  const totalPrecio = calcularTotal();
  
  console.log(`🔄 Actualizando badge en index: ${totalItems} items, S/ ${totalPrecio}`);
  
  // Actualizar badge de cantidad
  if (badge) {
    if (totalItems > 0) {
      badge.textContent = totalItems;
      badge.style.display = "flex";
    } else {
      badge.style.display = "none";
    }
  }
  
  // Actualizar contador en modal
  if (cartCountModal) {
    cartCountModal.textContent = totalItems;
  }
  
  // Actualizar total en navbar
  if (cartTotalDisplay && cartTotalNav) {
    if (totalItems > 0) {
      cartTotalNav.textContent = totalPrecio;
      cartTotalDisplay.style.display = "block";
    } else {
      cartTotalDisplay.style.display = "none";
    }
  }
}

function renderizarCarrito() {
  console.log("🔄 Renderizando carrito en index...");
  console.log("📦 Items en carrito:", carrito);
  
  const cartItems = document.getElementById("cartItems");
  const cartEmpty = document.getElementById("cartEmpty");
  const cartFooter = document.getElementById("cartFooter");
  const cartSubtotal = document.getElementById("cartSubtotal");
  const cartTotal = document.getElementById("cartTotal");
  const cartCountModal = document.getElementById("cartCountModal");
  
  if (!cartItems || !cartEmpty || !cartFooter) {
    console.error("❌ Elementos del carrito no encontrados en index");
    return;
  }
  
  // Actualizar contador en el header del modal
  const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
  if (cartCountModal) {
    cartCountModal.textContent = totalItems;
  }
  
  if (carrito.length === 0) {
    console.log("📭 Carrito vacío en index");
    cartEmpty.style.display = "block";
    cartItems.style.display = "none";
    cartFooter.style.display = "none";
    return;
  }
  
  console.log(`✅ Mostrando ${carrito.length} productos en carrito (index)`);
  
  cartEmpty.style.display = "none";
  cartItems.style.display = "flex";
  cartFooter.style.display = "block";
  
  cartItems.innerHTML = carrito.map(item => `
    <div class="cart-item">
      <img src="${item.imagen || 'img/default.jpg'}" alt="${item.nombre}" class="cart-item-image">
      <div class="cart-item-details">
        <h3 class="cart-item-name">${item.nombre}</h3>
        <p class="cart-item-price">S/ ${item.precio.toFixed(2)}</p>
        <div class="cart-item-controls">
          <div class="cart-item-quantity">
            <button class="cart-qty-btn" onclick="quitarDelCarritoIndex('${item.id}')">−</button>
            <span class="cart-qty-value">${item.cantidad}</span>
            <button class="cart-qty-btn" onclick="agregarAlCarritoIndex('${item.id}')">+</button>
          </div>
          <button class="cart-item-remove" onclick="eliminarDelCarritoIndex('${item.id}')" title="Eliminar">🗑️</button>
        </div>
        <p class="cart-item-subtotal">Subtotal: S/ ${(item.precio * item.cantidad).toFixed(2)}</p>
      </div>
    </div>
  `).join('');
  
  const total = calcularTotal();
  if (cartSubtotal) cartSubtotal.textContent = total;
  if (cartTotal) cartTotal.textContent = total;
  
  console.log(`💰 Total calculado en index: S/ ${total}`);
}

// LocalStorage
function guardarCarritoEnLocalStorage() {
  localStorage.setItem('carrito', JSON.stringify(carrito));
  console.log("💾 Carrito guardado en localStorage desde index");
}

function cargarCarritoDesdeLocalStorage() {
  const carritoGuardado = localStorage.getItem('carrito');
  if (carritoGuardado) {
    carrito = JSON.parse(carritoGuardado);
    console.log("📦 Carrito cargado desde localStorage en index:", carrito);
  } else {
    console.log("📭 No hay carrito guardado");
  }
}

// Notificación
function mostrarNotificacion(mensaje, tipo = 'info') {
  const notif = document.createElement('div');
  notif.className = `notification ${tipo}`;
  notif.textContent = mensaje;
  document.body.appendChild(notif);
  
  setTimeout(() => {
    notif.classList.add('hide');
    setTimeout(() => notif.remove(), 300);
  }, 2000);
}

// Funciones globales para el modal del carrito en index
window.agregarAlCarritoIndex = function(productoId) {
  console.log("➕ agregarAlCarritoIndex llamado:", productoId);
  const item = carrito.find(item => item.id == productoId);
  if (item) {
    item.cantidad++;
    guardarCarritoEnLocalStorage();
    actualizarBadgeCarrito();
    renderizarCarrito();
  }
}

window.quitarDelCarritoIndex = function(productoId) {
  console.log("➖ quitarDelCarritoIndex llamado:", productoId);
  const item = carrito.find(item => item.id == productoId);
  
  if (item) {
    item.cantidad--;
    if (item.cantidad <= 0) {
      carrito = carrito.filter(item => item.id != productoId);
    }
  }
  
  guardarCarritoEnLocalStorage();
  actualizarBadgeCarrito();
  renderizarCarrito();
}

window.eliminarDelCarritoIndex = function(productoId) {
  console.log("🗑️ eliminarDelCarritoIndex llamado:", productoId);
  if (confirm("¿Eliminar este producto del carrito?")) {
    carrito = carrito.filter(item => item.id != productoId);
    guardarCarritoEnLocalStorage();
    actualizarBadgeCarrito();
    renderizarCarrito();
  }
}