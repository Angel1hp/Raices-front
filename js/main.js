const API_URL = "http://localhost:3000/api/menu";

const grid = document.getElementById("menu-grid");
let comidas = [];
let bebidas = [];
let categorias = []; // Nueva variable para almacenar categorías

// Sistema de carrito
let carrito = [];

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOMContentLoaded ejecutado");
  
  // ✅ Cargar categorías PRIMERO, luego el menú
  cargarCategoriasYMenu();
  cargarCarritoDesdeLocalStorage();
  
  // ⏰ Esperar a que el navbar se cargue antes de configurar el carrito
  setTimeout(() => {
    configurarCarrito();
    // ✅ Actualizar badge inmediatamente después de configurar
    actualizarBadgeCarrito();
    console.log("✅ Badge actualizado al cargar página");
  }, 200);
  
  // Event listener único con delegación
  console.log("✅ Configurando event listener en grid");
  
  grid.addEventListener('click', (e) => {
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
      console.log("📦 Product ID (string):", productId);
      
      const prod = [...comidas, ...bebidas].find(p => p.id == productId);
      console.log("🍽️ Producto encontrado:", prod);
      
      if (prod) {
        agregarAlCarrito(prod);
      } else {
        console.error("❌ Producto no encontrado con ID:", productId);
      }
    }
    
    if (btnPlus) {
      console.log("➕ Botón plus clickeado");
      e.preventDefault();
      e.stopPropagation();
      
      const productId = btnPlus.getAttribute('data-product-id');
      const prod = [...comidas, ...bebidas].find(p => p.id == productId);
      
      if (prod) {
        agregarAlCarrito(prod);
      }
    }
    
    if (btnMinus) {
      console.log("➖ Botón minus clickeado");
      e.preventDefault();
      e.stopPropagation();
      
      const productId = btnMinus.getAttribute('data-product-id');
      quitarDelCarrito(productId);
    }
    
    if (btnDelete) {
      console.log("🗑️ Botón delete clickeado");
      e.preventDefault();
      e.stopPropagation();
      
      const productId = btnDelete.getAttribute('data-product-id');
      eliminarDelCarrito(productId);
    }
  });
  
  // Configurar búsqueda
  configurarBusqueda();
});

// =====================
// CARGAR CATEGORÍAS DINÁMICAS
// =====================
async function cargarCategoriasYMenu() {
  try {
    // Mostrar spinner mientras carga
    grid.innerHTML = `
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Preparando su experiencia culinaria...</p>
      </div>
    `;
    
    // 1. Cargar categorías desde la BD
    const resCategorias = await fetch(`${API_URL}/categorias`);
    if (!resCategorias.ok) throw new Error('Error al cargar categorías');
    
    categorias = await resCategorias.json();
    console.log("📂 Categorías cargadas:", categorias);
    
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
    grid.innerHTML = `<p class="error">Error al cargar el menú 😢</p>`;
    mostrarNotificacion("Error al cargar las categorías", "error");
  }
}

function renderizarBotonesCategorias() {
  const categoriesContainer = document.querySelector('.categories');
  
  if (!categoriesContainer) {
    console.error("❌ No se encontró el contenedor de categorías");
    return;
  }
  
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
// SISTEMA DE CARRITO
// =====================
function configurarCarrito() {
  const cartIcon = document.getElementById("cartIcon");
  const cartModal = document.getElementById("cartModal");
  const cartOverlay = document.getElementById("cartOverlay");
  const cartClose = document.getElementById("cartClose");
  const cartClear = document.getElementById("cartClear");
  const cartCheckout = document.getElementById("cartCheckout");

  console.log("🛒 Configurando carrito...");

  // Abrir carrito
  if (cartIcon) {
    cartIcon.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log("🛒 Click en carrito detectado");
      
      // ✅ VERIFICAR SESIÓN ANTES DE ABRIR
      if (!verificarSesion()) {
        console.log("❌ Usuario no autenticado");
        mostrarModalAuth();
        return;
      }
      
      console.log("🛒 Abriendo carrito...");
      console.log("📦 Carrito actual:", carrito);
      
      if (cartModal && cartOverlay) {
        cartModal.classList.add("open");
        cartOverlay.classList.add("active");
        document.body.style.overflow = 'hidden';
        
        // ✅ RENDERIZAR INMEDIATAMENTE AL ABRIR
        renderizarCarrito();
      }
    });
    console.log("✅ Evento click asignado al icono del carrito");
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
        
        alert(`🎉 Procesando pedido...\n\n📦 Items: ${itemsCount}\n💰 Total: S/ ${total}\n\n¡Gracias por tu compra!`);
        
        // Opcional: Vaciar carrito después del checkout
        // carrito = [];
        // guardarCarritoEnLocalStorage();
        // actualizarBadgeCarrito();
        // cerrarCarrito();
        
        // Redirigir a página de checkout si existe
        // window.location.href = 'checkout.html';
      } else {
        mostrarNotificacion("El carrito está vacío", "warning");
      }
    });
  }
  
  console.log("✅ Carrito configurado completamente");
}

function cerrarCarrito() {
  const cartModal = document.getElementById("cartModal");
  const cartOverlay = document.getElementById("cartOverlay");
  
  if (cartModal) cartModal.classList.remove("open");
  if (cartOverlay) cartOverlay.classList.remove("active");
  document.body.style.overflow = '';
  
  console.log("🚪 Carrito cerrado");
}

// VERIFICAR SESION
function verificarSesion() {
  const usuario = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');
  return usuario !== null;
}

function agregarAlCarrito(producto) {
  // Verificar si el usuario ha iniciado sesión
  if (!verificarSesion()) {
    mostrarModalAuth();
    return;
  }

  const itemExistente = carrito.find(item => item.id == producto.id);
  
  if (itemExistente) {
    itemExistente.cantidad++;
    console.log(`➕ Cantidad actualizada: ${producto.nombre} x${itemExistente.cantidad}`);
  } else {
    carrito.push({
      id: producto.id,
      nombre: producto.nombre,
      precio: parseFloat(producto.precio),
      imagen: producto.imagen,
      cantidad: 1
    });
    console.log(`✅ Producto agregado: ${producto.nombre}`);
  }
  
  console.log("📦 Carrito actualizado:", carrito);
  
  guardarCarritoEnLocalStorage();
  actualizarBadgeCarrito();
  actualizarBotonesProducto(producto.id);
  mostrarNotificacion(`${producto.nombre} agregado al carrito`);
}

function quitarDelCarrito(productoId) {
  const item = carrito.find(item => item.id == productoId);
  
  if (item) {
    item.cantidad--;
    console.log(`➖ Cantidad reducida: ${item.nombre} x${item.cantidad}`);
    
    if (item.cantidad <= 0) {
      carrito = carrito.filter(item => item.id != productoId);
      console.log(`🗑️ Producto eliminado del carrito`);
    }
  }
  
  guardarCarritoEnLocalStorage();
  actualizarBadgeCarrito();
  actualizarBotonesProducto(productoId);
  renderizarCarrito();
}

function eliminarDelCarrito(productoId) {
  const item = carrito.find(item => item.id == productoId);
  if (item) {
    console.log(`🗑️ Eliminando: ${item.nombre}`);
  }
  
  carrito = carrito.filter(item => item.id != productoId);
  guardarCarritoEnLocalStorage();
  actualizarBadgeCarrito();
  actualizarBotonesProducto(productoId);
  renderizarCarrito();
}

function obtenerCantidadEnCarrito(productoId) {
  const item = carrito.find(item => item.id == productoId);
  return item ? item.cantidad : 0;
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
  
  console.log(`🔄 Actualizando badge: ${totalItems} items, S/ ${totalPrecio}`);
  
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
  console.log("🔄 Renderizando carrito...");
  console.log("📦 Items en carrito:", carrito);
  
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
  
  // Actualizar contador en el header del modal
  const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
  if (cartCountModal) {
    cartCountModal.textContent = totalItems;
  }
  
  if (carrito.length === 0) {
    console.log("🔭 Carrito vacío");
    cartEmpty.style.display = "block";
    cartItems.style.display = "none";
    cartFooter.style.display = "none";
    return;
  }
  
  console.log(`✅ Mostrando ${carrito.length} productos en carrito`);
  
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
            <button class="cart-qty-btn" onclick="quitarDelCarritoModal('${item.id}')">−</button>
            <span class="cart-qty-value">${item.cantidad}</span>
            <button class="cart-qty-btn" onclick="agregarAlCarritoModal('${item.id}')">+</button>
          </div>
          <button class="cart-item-remove" onclick="eliminarDelCarritoModal('${item.id}')" title="Eliminar">🗑️</button>
        </div>
        <p class="cart-item-subtotal">Subtotal: S/ ${(item.precio * item.cantidad).toFixed(2)}</p>
      </div>
    </div>
  `).join('');
  
  const total = calcularTotal();
  if (cartSubtotal) cartSubtotal.textContent = total;
  if (cartTotal) cartTotal.textContent = total;
  
  console.log(`💰 Total calculado: S/ ${total}`);
}

function actualizarBotonesProducto(productoId) {
  const cards = document.querySelectorAll(`.menu-card[data-id="${productoId}"]`);
  
  cards.forEach(card => {
    const btnAdd = card.querySelector('.btn-add');
    const qtyControls = card.querySelector('.card-quantity-controls');
    const qtyDisplay = card.querySelector('.card-qty-display');
    const cantidad = obtenerCantidadEnCarrito(productoId);
    
    if (cantidad > 0) {
      if (btnAdd) btnAdd.style.display = "none";
      if (qtyControls) {
        qtyControls.classList.add("active");
        if (qtyDisplay) qtyDisplay.textContent = cantidad;
        
        const firstBtn = qtyControls.querySelector('[data-product-id]');
        if (firstBtn) {
          if (cantidad === 1) {
            firstBtn.outerHTML = `<button class="card-delete-btn" data-product-id="${productoId}">🗑️</button>`;
          } else {
            if (firstBtn.classList.contains('card-delete-btn')) {
              firstBtn.outerHTML = `<button class="card-qty-btn remove" data-product-id="${productoId}">−</button>`;
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

// LocalStorage
function guardarCarritoEnLocalStorage() {
  localStorage.setItem('carrito', JSON.stringify(carrito));
  console.log("💾 Carrito guardado en localStorage");
}

function cargarCarritoDesdeLocalStorage() {
  const carritoGuardado = localStorage.getItem('carrito');
  if (carritoGuardado) {
    carrito = JSON.parse(carritoGuardado);
    console.log("📦 Carrito cargado desde localStorage:", carrito);
    
    // ✅ Actualizar badge inmediatamente después de cargar
    setTimeout(() => {
      actualizarBadgeCarrito();
      console.log("✅ Badge actualizado después de cargar carrito");
    }, 300);
  } else {
    console.log("🔭 No hay carrito guardado");
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

// =====================
// Cargar menú
// =====================
async function cargarMenu() {
  try {
    const resComidas = await fetch(`${API_URL}/comidas`);
    const resBebidas = await fetch(`${API_URL}/bebidas`);

    comidas = await resComidas.json();
    bebidas = await resBebidas.json();

    console.log("✅ Productos cargados:", {
      comidas: comidas.length,
      bebidas: bebidas.length
    });
  } catch (error) {
    console.error("❌ Error cargando menú:", error);
    throw error;
  }
}

// =====================
// Mostrar categoría
// =====================
function mostrarCategoria(categoria) {
  console.log("📂 Mostrando categoría:", categoria);
  let productosMostrar = obtenerProductosPorCategoria(categoria);
  mostrarProductos(productosMostrar);
}

function obtenerProductosPorCategoria(categoria) {
  // Normalizar el nombre de la categoría para comparación
  const categoriaNormalizada = categoria.toLowerCase().trim();
  
  // Si es bebidas, retornar el array de bebidas
  if (categoriaNormalizada.includes('bebida')) {
    return bebidas;
  }
  
  // Para comidas, filtrar por categoría exacta o parcial
  return comidas.filter(c => {
    const categoriaComida = c.categoria.toLowerCase().trim();
    return categoriaComida === categoriaNormalizada || 
           categoriaComida.includes(categoriaNormalizada) ||
           categoriaNormalizada.includes(categoriaComida);
  });
}

// =====================
// Mostrar productos
// =====================
function mostrarProductos(productos) {
  grid.innerHTML = "";

  if (!productos.length) {
    grid.innerHTML = `<p class="no-products">No hay productos disponibles en esta categoría.</p>`;
    return;
  }

  productos.forEach(prod => {
    const cantidad = obtenerCantidadEnCarrito(prod.id);
    const card = document.createElement('div');
    card.className = 'menu-card';
    card.setAttribute('data-id', prod.id);
    
    card.innerHTML = `
      <div class="menu-img">
        <img src="${prod.imagen || 'img/default.jpg'}" alt="${prod.nombre}">
      </div>
      <div class="card-content">
        <div>
          <h4>${prod.nombre}</h4>
          <p>${prod.descripcion || ""}</p>
        </div>
        <div class="card-footer">
          <div class="price-container">
            <span class="price">S/ ${prod.precio}</span>
          </div>
          <button class="btn-add" data-product-id="${prod.id}" style="display: ${cantidad > 0 ? 'none' : 'flex'}">
            + 
          </button>
          <div class="card-quantity-controls ${cantidad > 0 ? 'active' : ''}" data-product-id="${prod.id}">
            ${cantidad === 1 
              ? `<button class="card-delete-btn" data-product-id="${prod.id}">🗑️</button>` 
              : `<button class="card-qty-btn remove" data-product-id="${prod.id}">−</button>`
            }
            <span class="card-qty-display">${cantidad}</span>
            <button class="card-qty-btn" data-product-id="${prod.id}">+</button>
          </div>
        </div>
      </div>
    `;
    
    grid.appendChild(card);
  });

  console.log(`✅ ${productos.length} productos mostrados`);
}

// =====================
// Filtro de búsqueda
// =====================
function configurarBusqueda() {
  const searchInput = document.getElementById('searchInput');
  const clearSearch = document.getElementById('clearSearch');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase().trim();
      
      if (searchTerm) {
        clearSearch.classList.add('show');
      } else {
        clearSearch.classList.remove('show');
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
// MODAL DE AUTENTICACIÓN
// =====================
function mostrarModalAuth() {
  const modal = document.getElementById('authModalOverlay');
  const closeBtn = document.getElementById('authModalClose');
  
  if (modal) {
    modal.classList.add('active');
    
    // Cerrar al hacer clic en el overlay
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        cerrarModalAuth();
      }
    });
    
    // Cerrar al hacer clic en el botón X
    if (closeBtn) {
      closeBtn.addEventListener('click', cerrarModalAuth);
    }
    
    // Cerrar con tecla ESC
    document.addEventListener('keydown', handleEscKey);
  }
}

function cerrarModalAuth() {
  const modal = document.getElementById('authModalOverlay');
  if (modal) {
    modal.classList.remove('active');
    document.removeEventListener('keydown', handleEscKey);
  }
}

function handleEscKey(e) {
  if (e.key === 'Escape') {
    cerrarModalAuth();
  }
}

// Funciones para el modal del carrito
window.agregarAlCarritoModal = function(productoId) {
  console.log("➕ agregarAlCarritoModal llamado:", productoId);
  const prod = [...comidas, ...bebidas].find(p => p.id == productoId);
  if (prod) {
    agregarAlCarrito(prod);
    renderizarCarrito();
  }
}

window.quitarDelCarritoModal = function(productoId) {
  console.log("➖ quitarDelCarritoModal llamado:", productoId);
  quitarDelCarrito(productoId);
}

window.eliminarDelCarritoModal = function(productoId) {
  console.log("🗑️ eliminarDelCarritoModal llamado:", productoId);
  if (confirm("¿Eliminar este producto del carrito?")) {
    eliminarDelCarrito(productoId);
  }
}