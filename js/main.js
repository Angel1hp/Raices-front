const API_URL = "https://raices-back.onrender.com/api/menu";
const API_CARRITO = "https://raices-back.onrender.com/api/carrito";

const grid = document.getElementById("menu-grid");
let comidas = [];
let bebidas = [];
let categorias = [];

// Sistema de carrito
window.carrito = [];
let carrito = window.carrito; // Mantener referencia local
let usuarioActual = null;

// =====================
// FUNCIONES GLOBALES - DECLARADAS INMEDIATAMENTE
// =====================

window.obtenerUsuarioActual = function() {
  const usuarioLS = localStorage.getItem('usuario');
  const usuarioSS = sessionStorage.getItem('usuario');
  
  if (usuarioLS) {
    try {
      return JSON.parse(usuarioLS);
    } catch (e) {
      return null;
    }
  }
  
  if (usuarioSS) {
    try {
      return JSON.parse(usuarioSS);
    } catch (e) {
      return null;
    }
  }
  
  return null;
};

window.verificarSesion = function() {
  const usuario = window.obtenerUsuarioActual();
  return usuario !== null && usuario.id !== undefined;
};

window.mostrarModalAuth = function() {
  const modal = document.getElementById('authModalOverlay');
  const closeBtn = document.getElementById('authModalClose');
  
  if (modal) {
    modal.classList.add('active');
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        window.cerrarModalAuth();
      }
    });
    
    if (closeBtn) {
      closeBtn.addEventListener('click', window.cerrarModalAuth);
    }
    
    document.addEventListener('keydown', window.handleEscKey);
  }
};

window.cerrarModalAuth = function() {
  const modal = document.getElementById('authModalOverlay');
  if (modal) {
    modal.classList.remove('active');
    document.removeEventListener('keydown', window.handleEscKey);
  }
};

window.handleEscKey = function(e) {
  if (e.key === 'Escape') {
    window.cerrarModalAuth();
  }
};

window.mostrarNotificacion = function(mensaje, tipo = 'info') {
  const notif = document.createElement('div');
  notif.className = `notification ${tipo}`;
  notif.textContent = mensaje;
  document.body.appendChild(notif);
  
  setTimeout(() => {
    notif.classList.add('hide');
    setTimeout(() => notif.remove(), 300);
  }, 2000);
};

// ✅ FUNCIÓN GLOBAL PARA AGREGAR AL CARRITO
// ✅ FUNCIÓN GLOBAL PARA AGREGAR AL CARRITO
// ✅ FUNCIÓN GLOBAL PARA AGREGAR AL CARRITO - VERSIÓN CORREGIDA
window.agregarAlCarrito = async function(producto) {
  console.log("🛒 agregarAlCarrito llamado con producto:", producto);
  
  if (!window.verificarSesion()) {
    window.mostrarModalAuth();
    return;
  }
  
  const usuarioActual = window.obtenerUsuarioActual();
  
  if (!usuarioActual || !usuarioActual.id) {
    console.error("❌ No se pudo obtener el usuario");
    window.mostrarNotificacion("Error de sesión", "error");
    return;
  }
  
  // ✅ DETERMINAR EL TIPO DE PRODUCTO - LÓGICA CORREGIDA
  let producto_tipo = 'comida'; // Por defecto
  let producto_id = producto.id;
  
  console.log("🔍 Analizando producto:");
  console.log("  - ID:", producto_id);
  console.log("  - Nombre:", producto.nombre);
  console.log("  - Categoría:", producto.categoria);
  
  // 1. Si el ID empieza con "promo_", es una promoción
  if (String(producto.id).startsWith('promo_')) {
    producto_tipo = 'promocion';
    producto_id = String(producto.id).replace('promo_', '');
    console.log("✅ Tipo: PROMOCIÓN (detectado por prefijo promo_)");
  } 
  // 2. Si tiene la propiedad 'tipo' y es 'bebida' (viene del backend así)
  else if (producto.tipo === 'bebida') {
    producto_tipo = 'bebida';
    console.log("✅ Tipo: BEBIDA (detectado por propiedad tipo)");
  }
  // 3. Si tiene la propiedad 'tipo' y es 'comida'
  else if (producto.tipo === 'comida') {
    producto_tipo = 'comida';
    console.log("✅ Tipo: COMIDA (detectado por propiedad tipo)");
  }
  // 4. Si la categoría contiene "bebida"
  else if (producto.categoria && String(producto.categoria).toLowerCase().includes('bebida')) {
    producto_tipo = 'bebida';
    console.log("✅ Tipo: BEBIDA (detectado por categoría)");
  }
  // 5. Buscar en el array de bebidas SOLO si no es comida
  else if (bebidas && bebidas.length > 0) {
    const esBebida = bebidas.find(b => parseInt(b.id) === parseInt(producto.id));
    if (esBebida) {
      producto_tipo = 'bebida';
      console.log("✅ Tipo: BEBIDA (encontrado en array bebidas)");
    } else {
      // Si no está en bebidas, debe ser comida
      producto_tipo = 'comida';
      console.log("✅ Tipo: COMIDA (no encontrado en bebidas, por defecto)");
    }
  }
  // 6. Por defecto es comida
  else {
    producto_tipo = 'comida';
    console.log("✅ Tipo: COMIDA (valor por defecto)");
  }
  
  console.log(`📋 TIPO FINAL: ${producto_tipo.toUpperCase()}, ID: ${producto_id}`);
  
  try {
    const body = {
      cliente_id: usuarioActual.id,
      producto_id: parseInt(producto_id),
      producto_tipo: producto_tipo,
      cantidad: 1,
      precio_unitario: parseFloat(producto.precio || producto.precio_oferta)
    };
    
    console.log("📤 Enviando al servidor:", body);
    
    const response = await fetch(`${API_CARRITO}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ Error del servidor:", errorData);
      throw new Error(errorData.error || 'Error al agregar al carrito');
    }
    
    const result = await response.json();
    console.log("✅ Respuesta del servidor:", result);
    console.log(`✅ Producto agregado al carrito como ${producto_tipo}`);
    
    // Recargar carrito desde BD
    await cargarCarritoDesdeDB();
    
    window.mostrarNotificacion(`${producto.nombre || producto.titulo} agregado al carrito`);
  } catch (error) {
    console.error("❌ Error al agregar al carrito:", error);
    window.mostrarNotificacion("Error al agregar al carrito: " + error.message, "error");
  }
};

// =====================
// DOM CONTENT LOADED
// =====================
document.addEventListener("DOMContentLoaded", async () => {
  console.log("✅ DOMContentLoaded ejecutado");
  
  // ✅ Cargar categorías PRIMERO, luego el menú
  await cargarCategoriasYMenu();
  
  // ✅ Cargar carrito desde BD
  await cargarCarritoDesdeDB();
  
  // ⏰ Esperar a que el navbar se cargue antes de configurar el carrito
  setTimeout(() => {
    configurarCarrito();
    actualizarBadgeCarrito();
    console.log("✅ Badge actualizado al cargar página");
  }, 200);
  
  // Event listener único con delegación
  console.log("✅ Configurando event listener en grid");
  
  if (grid) {
  grid.addEventListener('click', async (e) => {
    console.log("🖱️ Click detectado en grid", e.target);
    
    const btnAdd = e.target.closest('.btn-add');
    const btnPlus = e.target.closest('.card-qty-btn:not(.remove)');
    const btnMinus = e.target.closest('.card-qty-btn.remove');
    const btnDelete = e.target.closest('.card-delete-btn');
    
    if (btnAdd) {
      console.log("➕ Botón agregar clickeado");
      e.preventDefault();
      e.stopPropagation();
      
      const productId = btnAdd.getAttribute('data-product-id');
      const productTipo = btnAdd.getAttribute('data-tipo'); // ✅ OBTENER TIPO
      console.log("📦 Product ID:", productId, "Tipo:", productTipo);
      
      // ✅ BUSCAR PRODUCTO CONSIDERANDO EL TIPO
      let prod;
      if (productTipo === 'bebida') {
        prod = bebidas.find(p => p.id == productId);
      } else {
        prod = comidas.find(p => p.id == productId);
      }
      
      console.log("🍽️ Producto encontrado:", prod);
      
      if (prod) {
        await window.agregarAlCarrito(prod);
      } else {
        console.error("❌ Producto no encontrado con ID:", productId, "Tipo:", productTipo);
      }
    }
    
    if (btnPlus) {
      console.log("➕ Botón plus clickeado");
      e.preventDefault();
      e.stopPropagation();
      
      const productId = btnPlus.getAttribute('data-product-id');
      const productTipo = btnPlus.getAttribute('data-tipo'); // ✅ OBTENER TIPO
      
      // ✅ BUSCAR PRODUCTO CONSIDERANDO EL TIPO
      let prod;
      if (productTipo === 'bebida') {
        prod = bebidas.find(p => p.id == productId);
      } else {
        prod = comidas.find(p => p.id == productId);
      }
      
      if (prod) {
        await window.agregarAlCarrito(prod);
      }
    }
    
    if (btnMinus) {
      console.log("➖ Botón minus clickeado");
      e.preventDefault();
      e.stopPropagation();
      
      const productId = btnMinus.getAttribute('data-product-id');
      await quitarDelCarrito(productId);
    }
    
    if (btnDelete) {
      console.log("🗑️ Botón delete clickeado");
      e.preventDefault();
      e.stopPropagation();
      
      const productId = btnDelete.getAttribute('data-product-id');
      await eliminarDelCarrito(productId);
    }
  });
}
  
  // Configurar búsqueda
  configurarBusqueda();
});

// =====================
// CARGAR CATEGORÍAS DINÁMICAS
// =====================
async function cargarCategoriasYMenu() {
  try {
    console.log("📂 Iniciando carga de categorías...");
    
    // Mostrar spinner mientras carga
    if (grid) {
      grid.innerHTML = `
        <div class="loading-spinner">
          <div class="spinner"></div>
          <p>Preparando su experiencia culinaria...</p>
        </div>
      `;
    }
    
    // 1. Cargar categorías desde la BD
    const resCategorias = await fetch(`${API_URL}/categorias`);
    if (!resCategorias.ok) {
      throw new Error('Error al cargar categorías: ' + resCategorias.status);
    }
    
    categorias = await resCategorias.json();
    console.log("📂 Categorías cargadas:", categorias);
    
    if (!categorias || categorias.length === 0) {
      console.warn("⚠️ No se encontraron categorías");
      return;
    }
    
    // 2. Renderizar botones de categoría
    renderizarBotonesCategorias();
    
    // 3. Cargar productos (comidas y bebidas)
    await cargarMenu();
    
    // 4. Mostrar la primera categoría
    if (categorias.length > 0) {
      mostrarCategoria(categorias[0].nombre);
    }
    
  } catch (error) {
    console.error("❌ Error cargando categorías y menú:", error);
    if (grid) {
      grid.innerHTML = `<p class="error">Error al cargar el menú: ${error.message}</p>`;
    }
    window.mostrarNotificacion("Error al cargar las categorías", "error");
  }
}

function renderizarBotonesCategorias() {
  const categoriesContainer = document.querySelector('.categories');
  
  if (!categoriesContainer) {
    console.error("❌ No se encontró el contenedor de categorías (.categories)");
    return;
  }
  
  console.log("🎨 Renderizando botones de categorías...");
  
  // Limpiar categorías existentes
  categoriesContainer.innerHTML = '';
  
  // Crear botones dinámicamente
  categorias.forEach((categoria, index) => {
    const button = document.createElement('button');
    button.className = `category-btn ${index === 0 ? 'active' : ''}`;
    button.setAttribute('data-cat', categoria.nombre);
    
    // Aplicar imagen de fondo al botón
    const imagenUrl = categoria.imagen || 'img/default-category.jpg';
    button.style.backgroundImage = `url('${imagenUrl}')`;
    button.style.backgroundSize = 'cover';
    button.style.backgroundPosition = 'center';
    
    // Contar productos de esta categoría
    const productosCat = obtenerProductosPorCategoria(categoria.nombre);
    const cantidadProductos = productosCat.length;
    
    // Crear estructura interna del botón
    button.innerHTML = `
      ${cantidadProductos > 0 ? `<span class="category-badge">${cantidadProductos}</span>` : ''}
      <span class="category-name">${categoria.nombre}</span>
      <div class="shine"></div>
    `;
    
    // Agregar tooltip con la descripción si existe
    if (categoria.descripcion) {
      button.title = categoria.descripcion;
    }
    
    // Event listener para cada botón
    button.addEventListener('click', () => {
      // Remover active de todos
      document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      
      // Agregar active al clickeado
      button.classList.add('active');
      
      // Limpiar búsqueda
      const searchInput = document.getElementById('searchInput');
      const clearSearch = document.getElementById('clearSearch');
      if (searchInput) {
        searchInput.value = '';
        if (clearSearch) clearSearch.classList.remove('show');
      }
      
      // Mostrar productos de esa categoría
      mostrarCategoria(categoria.nombre);
    });
    
    categoriesContainer.appendChild(button);
  });
  
  console.log(`✅ ${categorias.length} botones de categoría renderizados`);
}

// =====================
// CARGAR MENÚ
// =====================
// =====================
// CARGAR MENÚ
// =====================
async function cargarMenu() {
  try {
    console.log("🍽️ Cargando productos...");
    
    const resComidas = await fetch(`${API_URL}/comidas`);
    const resBebidas = await fetch(`${API_URL}/bebidas`);

    if (!resComidas.ok || !resBebidas.ok) {
      throw new Error('Error al cargar productos');
    }

    comidas = await resComidas.json();
    bebidas = await resBebidas.json();
    
    // ✅ AGREGAR PROPIEDAD 'tipo' A CADA PRODUCTO
    comidas = comidas.map(c => ({ ...c, tipo: 'comida' }));
    bebidas = bebidas.map(b => ({ ...b, tipo: 'bebida' }));

    console.log("✅ Productos cargados:", {
      comidas: comidas.length,
      bebidas: bebidas.length
    });
    
    console.log("📋 Ejemplo comida:", comidas[0]);
    console.log("📋 Ejemplo bebida:", bebidas[0]);
  } catch (error) {
    console.error("❌ Error cargando menú:", error);
    throw error;
  }
}

// =====================
// SISTEMA DE CARRITO CON BASE DE DATOS
// =====================

async function cargarCarritoDesdeDB() {
  usuarioActual = window.obtenerUsuarioActual();
  
  if (!usuarioActual || !usuarioActual.id) {
    console.log("❌ No hay usuario logueado");
    carrito = [];
window.carrito = carrito;  // ✅ Agregar
    window.actualizarBadgeCarrito(); // ✅ Actualizar badge aunque esté vacío
    return;
  }
  
  try {
    const response = await fetch(`${API_CARRITO}/${usuarioActual.id}`);
    if (!response.ok) throw new Error('Error al cargar carrito');
    
    carrito = await response.json();
window.carrito = carrito;  // ✅ Agregar
    console.log(`📦 Carrito cargado desde BD para cliente ${usuarioActual.id}:`, carrito);
    console.log(`📊 Total items: ${carrito.length}`);
    
    // Actualizar UI
    window.actualizarBadgeCarrito(); // ✅ Usar la función global
    actualizarTodosLosBotonesProductos();
  } catch (error) {
    console.error("❌ Error al cargar carrito:", error);
    carrito = [];
window.carrito = carrito;  // ✅ Agregar
    window.actualizarBadgeCarrito(); // ✅ Actualizar badge aunque esté vacío
  }
}

async function quitarDelCarrito(productoId) {
  const item = carrito.find(item => item.producto_id == productoId);
  
  if (!item) return;
  
  try {
    const nuevaCantidad = item.cantidad - 1;
    
    const response = await fetch(`${API_CARRITO}/${item.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cantidad: nuevaCantidad
      })
    });
    
    if (!response.ok) throw new Error('Error al actualizar carrito');
    
    console.log(`➖ Cantidad reducida`);
    
    await cargarCarritoDesdeDB();
    window.renderizarCarrito(); // ✅ Usar función global
  } catch (error) {
    console.error("❌ Error al quitar del carrito:", error);
    window.mostrarNotificacion("Error al actualizar carrito", "error");
  }
}

async function eliminarDelCarrito(productoId) {
  const item = carrito.find(item => item.producto_id == productoId);
  
  if (!item) return;
  
  try {
    const response = await fetch(`${API_CARRITO}/${item.id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) throw new Error('Error al eliminar del carrito');
    
    console.log(`🗑️ Producto eliminado del carrito`);
    
    await cargarCarritoDesdeDB();
    window.renderizarCarrito(); // ✅ Usar función global
  } catch (error) {
    console.error("❌ Error al eliminar del carrito:", error);
    window.mostrarNotificacion("Error al eliminar del carrito", "error");
  }
}
async function vaciarCarrito() {
  usuarioActual = window.obtenerUsuarioActual();
  
  if (!usuarioActual || !usuarioActual.id) return;
  
  if (!confirm("¿Estás seguro de vaciar el carrito?")) return;
  
  try {
    const response = await fetch(`${API_CARRITO}/cliente/${usuarioActual.id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) throw new Error('Error al vaciar carrito');
    
    console.log(`🗑️ Carrito vaciado`);
    
    carrito = [];
window.carrito = carrito;  // ✅ Agregar
    actualizarBadgeCarrito();
    renderizarCarrito();
    actualizarTodosLosBotonesProductos();
    
    window.mostrarNotificacion("Carrito vaciado", "success");
  } catch (error) {
    console.error("❌ Error al vaciar carrito:", error);
    window.mostrarNotificacion("Error al vaciar carrito", "error");
  }
}

// =====================
// AGREGAR ESTA FUNCIÓN EN main.js
// Buscar la función configurarCarrito() y reemplazar la parte del cartCheckout
// =====================

function configurarCarrito() {
  const cartIcon = document.getElementById("cartIcon");
  const cartModal = document.getElementById("cartModal");
  const cartOverlay = document.getElementById("cartOverlay");
  const cartClose = document.getElementById("cartClose");
  const cartClear = document.getElementById("cartClear");
  const cartCheckout = document.getElementById("cartCheckout");

  console.log("🛒 Configurando carrito...");
  console.log("🎯 Elementos encontrados:", {
    cartIcon: !!cartIcon,
    cartModal: !!cartModal,
    cartOverlay: !!cartOverlay,
    cartCheckout: !!cartCheckout
  });

  if (cartIcon) {
    cartIcon.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      console.log("🛒 Click en icono del carrito");
      console.log("📦 Carrito actual:", carrito);
      console.log("📊 Cantidad de items:", carrito.length);
      
      if (!window.verificarSesion()) {
        console.log("❌ Usuario no autenticado");
        window.mostrarModalAuth();
        return;
      }
      
      console.log("✅ Usuario autenticado, abriendo modal...");
      
      if (cartModal && cartOverlay) {
        cartModal.classList.add("open");
        cartOverlay.classList.add("active");
        document.body.style.overflow = 'hidden';
        
        console.log("✅ Modal abierto, renderizando carrito...");
        window.renderizarCarrito();
      } else {
        console.error("❌ No se encontraron elementos del modal");
      }
    });
    console.log("✅ Event listener agregado al icono del carrito");
  } else {
    console.error("❌ No se encontró el icono del carrito");
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
    cartClear.addEventListener("click", () => {
      vaciarCarrito();
    });
  }

  // ✅ NUEVO: Configurar botón de checkout
  if (cartCheckout) {
    cartCheckout.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      console.log("🛒 Click en Proceder al Pago");
      console.log("📦 Carrito:", carrito);
      console.log("📊 Items:", carrito.length);
      
      if (carrito.length === 0) {
        window.mostrarNotificacion("El carrito está vacío", "warning");
        return;
      }
      
      // Verificar que la función iniciarCheckout exista
      if (typeof window.iniciarCheckout === 'function') {
        console.log("✅ Iniciando checkout...");
        window.iniciarCheckout();
      } else {
        console.error("❌ Función iniciarCheckout no disponible");
        window.mostrarNotificacion("Error al iniciar checkout. Recarga la página.", "error");
      }
    });
    
    console.log("✅ Event listener agregado al botón checkout");
  } else {
    console.error("❌ Botón checkout no encontrado");
  }
  
  console.log("✅ Carrito configurado completamente");
}

function cerrarCarrito() {
  const cartModal = document.getElementById("cartModal");
  const cartOverlay = document.getElementById("cartOverlay");
  
  if (cartModal) cartModal.classList.remove("open");
  if (cartOverlay) cartOverlay.classList.remove("active");
  document.body.style.overflow = '';
}

function obtenerCantidadEnCarrito(productoId, productoTipo = null) {
  if (String(productoId).startsWith('promo_')) {
    const idReal = parseInt(String(productoId).replace('promo_', ''));
    const item = carrito.find(item => 
      item.producto_id == idReal && item.producto_tipo === 'promocion'
    );
    return item ? item.cantidad : 0;
  }
  
  // ✅ SI SE PROPORCIONA EL TIPO, BUSCAR ESPECÍFICAMENTE ESE TIPO
  if (productoTipo) {
    const item = carrito.find(item => 
      item.producto_id == productoId && 
      item.producto_tipo === productoTipo
    );
    return item ? item.cantidad : 0;
  }
  
  // Fallback: buscar cualquier tipo excepto promociones
  const item = carrito.find(item => 
    item.producto_id == productoId && 
    item.producto_tipo !== 'promocion'
  );
  return item ? item.cantidad : 0;
}
function calcularTotal() {
  const total = carrito.reduce((total, item) => total + (parseFloat(item.precio_unitario) * item.cantidad), 0);
  return total.toFixed(2);
}

// ✅ HACER ESTA FUNCIÓN GLOBAL
window.actualizarBadgeCarrito = function() {
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
};

// También crear una versión local que llame a la global
function actualizarBadgeCarrito() {
  window.actualizarBadgeCarrito();
}

// ✅ HACER RENDERIZAR CARRITO GLOBAL
window.renderizarCarrito = function() {
  console.log("📄 Renderizando carrito...");
  console.log("📦 Items en carrito:", carrito);
  console.log("📊 Cantidad de items:", carrito.length);
  
  const cartItems = document.getElementById("cartItems");
  const cartEmpty = document.getElementById("cartEmpty");
  const cartFooter = document.getElementById("cartFooter");
  const cartSubtotal = document.getElementById("cartSubtotal");
  const cartTotal = document.getElementById("cartTotal");
  const cartCountModal = document.getElementById("cartCountModal");
  
  console.log("🎯 Elementos del DOM:", {
    cartItems: !!cartItems,
    cartEmpty: !!cartEmpty,
    cartFooter: !!cartFooter,
    cartSubtotal: !!cartSubtotal,
    cartTotal: !!cartTotal,
    cartCountModal: !!cartCountModal
  });
  
  if (!cartItems || !cartEmpty || !cartFooter) {
    console.error("❌ Elementos del carrito no encontrados en el DOM");
    return;
  }
  
  const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
  console.log("📊 Total items calculado:", totalItems);
  
  if (cartCountModal) {
    cartCountModal.textContent = totalItems;
  }
  
  if (carrito.length === 0) {
    console.log("📭 Mostrando carrito vacío");
    cartEmpty.style.display = "block";
    cartItems.style.display = "none";
    cartFooter.style.display = "none";
    return;
  }
  
  console.log(`✅ Mostrando ${carrito.length} productos en carrito`);
  
  cartEmpty.style.display = "none";
  cartItems.style.display = "flex";
  cartFooter.style.display = "block";
  
  const itemsHTML = carrito.map(item => {
    console.log("🎨 Renderizando item:", item);
    return `
      <div class="cart-item">
        <img src="${item.imagen || 'img/default.jpg'}" alt="${item.nombre}" class="cart-item-image">
        <div class="cart-item-details">
          <h3 class="cart-item-name">${item.nombre}</h3>
          <p class="cart-item-price">S/ ${parseFloat(item.precio_unitario).toFixed(2)}</p>
          <div class="cart-item-controls">
            <div class="cart-item-quantity">
              <button class="cart-qty-btn" onclick="window.quitarDelCarritoModal('${item.producto_id}')">−</button>
              <span class="cart-qty-value">${item.cantidad}</span>
              <button class="cart-qty-btn" onclick="window.agregarAlCarritoModalDB('${item.producto_id}')">+</button>
            </div>
            <button class="cart-item-remove" onclick="window.eliminarDelCarritoModal('${item.producto_id}')" title="Eliminar">🗑️</button>
          </div>
          <p class="cart-item-subtotal">Subtotal: S/ ${(parseFloat(item.precio_unitario) * item.cantidad).toFixed(2)}</p>
        </div>
      </div>
    `;
  }).join('');
  
  console.log("📝 HTML generado, insertando en DOM...");
  cartItems.innerHTML = itemsHTML;
  
  const total = calcularTotal();
  console.log("💰 Total calculado:", total);
  
  if (cartSubtotal) cartSubtotal.textContent = total;
  if (cartTotal) cartTotal.textContent = total;
  
  console.log("✅ Carrito renderizado completamente");
};

// Función local que llama a la global
function renderizarCarrito() {
  window.renderizarCarrito();
}

function actualizarBotonesProducto(productoId, productoTipo = null) {
  // ✅ CONSTRUIR SELECTOR QUE INCLUYA EL TIPO
  let selector;
  
  if (productoTipo === 'promocion' || String(productoId).startsWith('promo_')) {
    selector = `.menu-card[data-id="${productoId}"][data-tipo="promocion"]`;
  } else if (productoTipo) {
    // ✅ USAR TANTO ID COMO TIPO PARA HACER EL SELECTOR ÚNICO
    selector = `.menu-card[data-id="${productoId}"][data-tipo="${productoTipo}"]`;
  } else {
    // Fallback: buscar por ID solamente
    selector = `.menu-card[data-id="${productoId}"]`;
  }
  
  console.log("🔍 Selector usado:", selector);
  
  const cards = document.querySelectorAll(selector);
  console.log(`📦 Cards encontradas: ${cards.length}`);
  
  cards.forEach(card => {
    const btnAdd = card.querySelector('.btn-add');
    const qtyControls = card.querySelector('.card-quantity-controls');
    const qtyDisplay = card.querySelector('.card-qty-display');
    
    // ✅ OBTENER CANTIDAD CONSIDERANDO EL TIPO
    const cantidad = obtenerCantidadEnCarrito(productoId, productoTipo);
    
    console.log(`📊 Cantidad para ${productoTipo} ID ${productoId}: ${cantidad}`);
    
    if (cantidad > 0) {
      if (btnAdd) btnAdd.style.display = "none";
      if (qtyControls) {
        qtyControls.classList.add("active");
        if (qtyDisplay) qtyDisplay.textContent = cantidad;
        
        const firstBtn = qtyControls.querySelector('[data-product-id]');
        if (firstBtn) {
          if (cantidad === 1) {
            firstBtn.outerHTML = `<button class="card-delete-btn" data-product-id="${productoId}" data-tipo="${productoTipo || 'comida'}">🗑️</button>`;
          } else {
            if (firstBtn.classList.contains('card-delete-btn')) {
              firstBtn.outerHTML = `<button class="card-qty-btn remove" data-product-id="${productoId}" data-tipo="${productoTipo || 'comida'}">−</button>`;
            }
          }
        }
      }
    } else {
      if (btnAdd) btnAdd.style.display = "flex";
      if (qtyControls) qtyControls.classList.remove("active");
    }
  });
}


function actualizarTodosLosBotonesProductos() {
  console.log("🔄 Actualizando todos los botones de productos...");
  
  // ✅ ACTUALIZAR COMIDAS CON SU TIPO
  comidas.forEach(prod => {
    actualizarBotonesProducto(prod.id, 'comida');
  });
  
  // ✅ ACTUALIZAR BEBIDAS CON SU TIPO
  bebidas.forEach(prod => {
    actualizarBotonesProducto(prod.id, 'bebida');
  });
  
  // ✅ ACTUALIZAR PROMOCIONES
  const promocionesEnCarrito = carrito.filter(item => item.producto_tipo === 'promocion');
  promocionesEnCarrito.forEach(item => {
    actualizarBotonesProducto(`promo_${item.producto_id}`, 'promocion');
  });
  
  console.log("✅ Botones actualizados correctamente");
}


// =====================
// MOSTRAR CATEGORÍA
// =====================
function mostrarCategoria(categoria) {
  console.log("📂 Mostrando categoría:", categoria);
  let productosMostrar = obtenerProductosPorCategoria(categoria);
  mostrarProductos(productosMostrar);
}

function obtenerProductosPorCategoria(categoria) {
  const categoriaNormalizada = categoria.toLowerCase().trim();
  
  if (categoriaNormalizada.includes('bebida')) {
    return bebidas;
  }
  
  return comidas.filter(c => {
    const categoriaComida = c.categoria.toLowerCase().trim();
    return categoriaComida === categoriaNormalizada || 
           categoriaComida.includes(categoriaNormalizada) ||
           categoriaNormalizada.includes(categoriaComida);
  });
}

// =====================
// MOSTRAR PRODUCTOS
// =====================
// Busca esta función y reemplázala:
function mostrarProductos(productos) {
  if (!grid) return;
  
  grid.innerHTML = "";

  if (!productos.length) {
    grid.innerHTML = `<p class="no-products">No hay productos disponibles en esta categoría.</p>`;
    return;
  }

  productos.forEach(prod => {
    const productoTipo = prod.tipo || 'comida';
    const cantidad = obtenerCantidadEnCarrito(prod.id, productoTipo);
    const card = document.createElement('div');
    card.className = 'menu-card';
    card.setAttribute('data-id', prod.id);
    card.setAttribute('data-tipo', productoTipo);
    
    const esBebida = prod.tipo === 'bebida';
    
    let descripcion = prod.descripcion || "";
    
    let contenidoEspecifico = '';
    if (esBebida) {
      contenidoEspecifico = `
        <div class="bebida-info">
          ${prod.tamano_ml ? `<span class="bebida-tamano">🍹 ${prod.tamano_ml}ml</span>` : ''}
          ${prod.categoria ? `<span class="bebida-tipo">🥤 ${prod.categoria}</span>` : ''}
        </div>
      `;
    }
    
    card.innerHTML = `
      <div class="menu-img">
        <img src="${prod.imagen || 'img/default.jpg'}" alt="${prod.nombre}">
        ${esBebida ? '<span class="product-badge bebida">🥤 Bebida</span>' : ''}
      </div>
      <div class="card-content">
        <div class="card-clickable">
          <h4>${prod.nombre}</h4>
          ${esBebida ? contenidoEspecifico : `<p class="product-description">${descripcion}</p>`}
        </div>
        <div class="card-footer">
          <div class="price-container">
            <span class="price">S/ ${prod.precio}</span>
          </div>
          <button class="btn-add" data-product-id="${prod.id}" data-tipo="${productoTipo}" style="display: ${cantidad > 0 ? 'none' : 'flex'}">
            + 
          </button>
          <div class="card-quantity-controls ${cantidad > 0 ? 'active' : ''}" data-product-id="${prod.id}" data-tipo="${productoTipo}">
            ${cantidad === 1 
              ? `<button class="card-delete-btn" data-product-id="${prod.id}" data-tipo="${productoTipo}">🗑️</button>` 
              : `<button class="card-qty-btn remove" data-product-id="${prod.id}" data-tipo="${productoTipo}">−</button>`
            }
            <span class="card-qty-display">${cantidad}</span>
            <button class="card-qty-btn" data-product-id="${prod.id}" data-tipo="${productoTipo}">+</button>
          </div>
        </div>
      </div>
    `;
    
    card.addEventListener('click', (e) => {
      if (e.target.closest('.btn-add') || 
          e.target.closest('.card-quantity-controls') || 
          e.target.closest('.card-qty-btn') ||
          e.target.closest('.card-delete-btn')) {
        return;
      }
      
      window.abrirModalProducto(prod);
    });
    
    card.style.cursor = 'pointer';
    grid.appendChild(card);
  });

  console.log(`✅ ${productos.length} productos mostrados`);
}

// =====================
// FILTRO DE BÚSQUEDA
// =====================
function configurarBusqueda() {
  const searchInput = document.getElementById('searchInput');
  const clearSearch = document.getElementById('clearSearch');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase().trim();
      
      if (searchTerm) {
        clearSearch?.classList.add('show');
      } else {
        clearSearch?.classList.remove('show');
      }
      
      if (searchTerm) {
        const categoriaActual = document.querySelector('.category-btn.active')?.dataset.cat;
        if (categoriaActual) {
          let productos = obtenerProductosPorCategoria(categoriaActual);
          
          const productosFiltrados = productos.filter(prod => 
            prod.nombre.toLowerCase().includes(searchTerm) ||
            (prod.descripcion && prod.descripcion.toLowerCase().includes(searchTerm))
          );
          
          mostrarProductos(productosFiltrados);
        }
      } else {
        const categoriaActual = document.querySelector('.category-btn.active')?.dataset.cat;
        if (categoriaActual) {
          mostrarCategoria(categoriaActual);
        }
      }
    });
  }

  if (clearSearch) {
    clearSearch.addEventListener('click', () => {
      searchInput.value = '';
      clearSearch.classList.remove('show');
      const categoriaActual = document.querySelector('.category-btn.active')?.dataset.cat;
      if (categoriaActual) {
        mostrarCategoria(categoriaActual);
      }
      searchInput.focus();
    });
  }
}

// =====================
// FUNCIONES GLOBALES PARA EL MODAL DEL CARRITO
// =====================
// =====================
// FUNCIONES GLOBALES PARA EL MODAL DEL CARRITO
// =====================
// =====================
// FUNCIONES GLOBALES PARA EL MODAL DEL CARRITO
// =====================
window.agregarAlCarritoModalDB = async function(productoId) {
  console.log("➕ agregarAlCarritoModalDB llamado:", productoId);
  
  // Buscar el item en el carrito
  const itemEnCarrito = carrito.find(item => item.producto_id == productoId);
  
  if (!itemEnCarrito) {
    console.error("❌ Item no encontrado en carrito");
    return;
  }
  
  console.log("📦 Item encontrado en carrito:", itemEnCarrito);
  console.log("  - Tipo:", itemEnCarrito.producto_tipo);
  console.log("  - ID:", itemEnCarrito.producto_id);
  
  // Crear objeto producto según el tipo
  let prod;
  
  if (itemEnCarrito.producto_tipo === 'promocion') {
    // Para promociones, usar los datos del carrito directamente
    prod = {
      id: `promo_${itemEnCarrito.producto_id}`,
      nombre: itemEnCarrito.nombre,
      titulo: itemEnCarrito.nombre,
      precio: parseFloat(itemEnCarrito.precio_unitario),
      precio_oferta: parseFloat(itemEnCarrito.precio_unitario),
      imagen: itemEnCarrito.imagen,
      descripcion: itemEnCarrito.descripcion || "Promoción especial",
      tipo: 'promocion'
    };
    console.log("🎁 Promoción detectada:", prod);
  } else if (itemEnCarrito.producto_tipo === 'comida') {
    // Buscar en el array de comidas
    prod = comidas.find(c => c.id == productoId);
    console.log("🍽️ Comida encontrada:", prod);
  } else if (itemEnCarrito.producto_tipo === 'bebida') {
    // Buscar en el array de bebidas
    prod = bebidas.find(b => b.id == productoId);
    console.log("🥤 Bebida encontrada:", prod);
  }
  
  if (!prod) {
    console.error("❌ Producto no encontrado en arrays locales");
    return;
  }
  
  await window.agregarAlCarrito(prod);
  window.renderizarCarrito();
  
  // Actualizar resumen del checkout si está activo
  if (typeof window.actualizarResumenCheckout === 'function') {
    window.actualizarResumenCheckout();
  }
};

window.quitarDelCarritoModal = async function(productoId) {
  console.log("➖ quitarDelCarritoModal llamado:", productoId);
  
  // Buscar el item en el carrito
  const item = carrito.find(item => item.producto_id == productoId);
  
  if (!item) {
    console.error("❌ Item no encontrado en carrito");
    return;
  }
  
  console.log("📦 Item encontrado:", item);
  
  try {
    const nuevaCantidad = item.cantidad - 1;
    
    const response = await fetch(`${API_CARRITO}/${item.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cantidad: nuevaCantidad
      })
    });
    
    if (!response.ok) throw new Error('Error al actualizar carrito');
    
    console.log(`➖ Cantidad reducida`);
    
    await cargarCarritoDesdeDB();
    window.renderizarCarrito();
    
    // Actualizar resumen del checkout si está activo
    if (typeof window.actualizarResumenCheckout === 'function') {
      window.actualizarResumenCheckout();
    }
  } catch (error) {
    console.error("❌ Error al quitar del carrito:", error);
    window.mostrarNotificacion("Error al actualizar carrito", "error");
  }
};

window.eliminarDelCarritoModal = async function(productoId) {
  console.log("🗑️ eliminarDelCarritoModal llamado:", productoId);
  
  if (!confirm("¿Eliminar este producto del carrito?")) {
    return;
  }
  
  // Buscar el item en el carrito
  const item = carrito.find(item => item.producto_id == productoId);
  
  if (!item) {
    console.error("❌ Item no encontrado en carrito");
    return;
  }
  
  console.log("📦 Item a eliminar:", item);
  
  try {
    const response = await fetch(`${API_CARRITO}/${item.id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) throw new Error('Error al eliminar del carrito');
    
    console.log(`🗑️ Producto eliminado del carrito`);
    
    await cargarCarritoDesdeDB();
    window.renderizarCarrito();
    
    // Actualizar resumen del checkout si está activo
    if (typeof window.actualizarResumenCheckout === 'function') {
      window.actualizarResumenCheckout();
    }
  } catch (error) {
    console.error("❌ Error al eliminar del carrito:", error);
    window.mostrarNotificacion("Error al eliminar del carrito", "error");
  }
};

console.log("✅ main.js cargado completamente - Funciones globales disponibles");