// ===============================================
// PROMOCIONES ESTÁTICAS - DISEÑO MODERNO
// ===============================================

// ✅ CACHE DE PROMOCIONES PARA EVITAR PETICIONES REPETIDAS
let promocionesCache = [];

async function cargarPromociones() {
  try {
    console.log("📦 Cargando promociones...");
    
    // ✅ Esperar a que las funciones globales estén disponibles
    let intentos = 0;
    const maxIntentos = 50;
    
    while (intentos < maxIntentos) {
      if (typeof window.agregarAlCarrito === 'function' && 
          typeof window.verificarSesion === 'function' &&
          typeof window.abrirModalProducto === 'function') {
        console.log("✅ Funciones del carrito y modal disponibles");
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
      intentos++;
    }
    
    const response = await fetch("http://localhost:3000/api/menu/promociones");
    const promos = await response.json();
    
    // ✅ GUARDAR EN CACHE
    promocionesCache = promos;

    const grid = document.getElementById("promoGrid");

    if (!grid) {
      console.error("❌ No se encontró el contenedor de promociones");
      return;
    }

    // Mostrar skeletons mientras carga
    grid.innerHTML = crearSkeletons(3);

    // Si no hay promociones
    if (promos.length === 0) {
      grid.innerHTML = `
        <div class="promo-empty">
          <div class="promo-empty-icon">🎉</div>
          <p class="promo-empty-text">No hay promociones disponibles en este momento</p>
        </div>
      `;
      return;
    }

    // Renderizar promociones después de un breve delay (para ver el skeleton)
    setTimeout(() => {
      const promosHTML = promos.map(promo => crearPromoCard(promo)).join("");
      grid.innerHTML = promosHTML;
      
      // Agregar animación de entrada
      const cards = grid.querySelectorAll('.promo-card');
      cards.forEach((card, index) => {
        setTimeout(() => {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          card.style.transition = 'all 0.5s ease';
          
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        }, index * 100);
      });
      
      console.log(`✅ ${promos.length} promociones cargadas`);
    }, 500);

  } catch (error) {
    console.error("❌ Error al cargar promociones:", error);
    
    const grid = document.getElementById("promoGrid");
    if (grid) {
      grid.innerHTML = `
        <div class="promo-empty">
          <div class="promo-empty-icon">⚠️</div>
          <p class="promo-empty-text">Error al cargar promociones. Intenta recargar la página.</p>
        </div>
      `;
    }
  }
}

// ===============================================
// CREAR TARJETA DE PROMOCIÓN - CON DATA ATTRIBUTES
// ===============================================
function crearPromoCard(promo) {
  const precioOriginal = promo.precio_original || promo.precio_oferta * 1.5;
  const ahorro = precioOriginal - promo.precio_oferta;
  const descuento = Math.round((ahorro / precioOriginal) * 100);

  return `
    <div class="promo-card" 
         data-promo-id="${promo.id}"
         data-promo-titulo="${encodeURIComponent(promo.titulo)}"
         data-promo-precio="${promo.precio_oferta}"
         data-promo-precio-original="${promo.precio_original || ''}"
         data-promo-imagen="${promo.imagen || 'img/default-promo.jpg'}"
         data-promo-descripcion="${encodeURIComponent(promo.descripcion || '')}"
         onclick="abrirModalPromocionRapido(this)">
      
      ${descuento > 0 ? `
        <div class="promo-badge">
          -${descuento}% OFF
        </div>
      ` : ''}
      
      <div class="promo-card-image">
        <img src="${promo.imagen || 'img/default-promo.jpg'}" alt="${promo.titulo}">
      </div>
      
      <div class="promo-card-content">
        <h3 class="promo-card-title">${promo.titulo}</h3>
        
        <p class="promo-card-description">
          ${promo.descripcion || '¡Aprovecha esta increíble oferta por tiempo limitado!'}
        </p>
        
        <div class="promo-card-prices">
          <span class="promo-price-current">S/ ${parseFloat(promo.precio_oferta).toFixed(2)}</span>
          ${promo.precio_original ? `
            <span class="promo-price-original">S/ ${parseFloat(promo.precio_original).toFixed(2)}</span>
          ` : ''}
        </div>
        
        <div class="promo-card-footer">
          ${ahorro > 0 ? `
            <div class="promo-saving">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
              Ahorras S/ ${ahorro.toFixed(2)}
            </div>
          ` : '<div></div>'}
          
          <button class="promo-add-button" onclick="event.stopPropagation(); window.agregarPromocionRapida(event, this)">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            Agregar
          </button>
        </div>
      </div>
    </div>
  `;
}

// ===============================================
// CREAR SKELETONS DE CARGA
// ===============================================
function crearSkeletons(cantidad = 3) {
  let html = '';
  for (let i = 0; i < cantidad; i++) {
    html += `
      <div class="promo-skeleton">
        <div class="promo-skeleton-image"></div>
        <div class="promo-skeleton-content">
          <div class="promo-skeleton-title"></div>
          <div class="promo-skeleton-text"></div>
          <div class="promo-skeleton-text" style="width: 60%;"></div>
          <div class="promo-skeleton-price"></div>
        </div>
      </div>
    `;
  }
  return html;
}

// ===============================================
// ✅ ABRIR MODAL RÁPIDO - SIN PETICIÓN EXTRA
// ===============================================
window.abrirModalPromocionRapido = function(cardElement) {
  console.log("🎁 Abriendo modal de promoción (rápido)");
  
  // Obtener datos directamente del elemento
  const promoId = cardElement.getAttribute('data-promo-id');
  const titulo = decodeURIComponent(cardElement.getAttribute('data-promo-titulo'));
  const precio = parseFloat(cardElement.getAttribute('data-promo-precio'));
  const precioOriginal = cardElement.getAttribute('data-promo-precio-original');
  const imagen = cardElement.getAttribute('data-promo-imagen');
  const descripcion = decodeURIComponent(cardElement.getAttribute('data-promo-descripcion') || '');
  
  // Crear objeto compatible con el modal
  const promocionParaModal = {
    id: `promo_${promoId}`,
    titulo: titulo,
    nombre: titulo,
    precio_oferta: precio,
    precio_original: precioOriginal ? parseFloat(precioOriginal) : null,
    precio: precio,
    imagen: imagen,
    descripcion: descripcion || "¡Aprovecha esta oferta especial!",
    categoria: "Promoción"
  };
  
  // Abrir modal
  if (typeof window.abrirModalProducto === 'function') {
    window.abrirModalProducto(promocionParaModal, true);
  } else {
    console.error("❌ window.abrirModalProducto no está disponible");
  }
};

// ===============================================
// ABRIR MODAL DE PROMOCIÓN (Legacy - mantener por compatibilidad)
// ===============================================
window.abrirModalPromocion = async function(promoId) {
  console.log("🎁 Abriendo modal de promoción:", promoId);
  
  // Primero intentar buscar en cache
  let promo = promocionesCache.find(p => p.id == promoId);
  
  // Si no está en cache, buscar en el servidor
  if (!promo) {
    try {
      const response = await fetch("http://localhost:3000/api/menu/promociones");
      const promos = await response.json();
      promocionesCache = promos;
      promo = promos.find(p => p.id == promoId);
    } catch (error) {
      console.error("❌ Error al obtener promoción:", error);
      return;
    }
  }
  
  if (!promo) {
    console.error("❌ Promoción no encontrada");
    return;
  }
  
  // Crear objeto compatible con el modal de producto
  const promocionParaModal = {
    id: `promo_${promo.id}`,
    titulo: promo.titulo,
    nombre: promo.titulo,
    precio_oferta: parseFloat(promo.precio_oferta),
    precio_original: promo.precio_original ? parseFloat(promo.precio_original) : null,
    precio: parseFloat(promo.precio_oferta),
    imagen: promo.imagen,
    descripcion: promo.descripcion || "¡Aprovecha esta oferta especial!",
    categoria: "Promoción"
  };
  
  // Abrir modal
  if (typeof window.abrirModalProducto === 'function') {
    window.abrirModalProducto(promocionParaModal, true);
  } else {
    console.error("❌ window.abrirModalProducto no está disponible");
  }
};

// ===============================================
// ✅ AGREGAR PROMOCIÓN RÁPIDA - VERSIÓN CORREGIDA
// ===============================================
window.agregarPromocionRapida = async function(event, cardElement) {
  event.stopPropagation(); // Evitar que se abra el modal
  
  console.log("➕ Agregando promoción al carrito (rápido)");
  console.log("🔍 Elemento recibido:", cardElement);
  
  // Verificar sesión
  if (typeof window.verificarSesion !== 'function') {
    console.error("❌ window.verificarSesion no está disponible");
    alert("El sistema aún se está cargando. Por favor, espera un momento.");
    return;
  }
  
  if (!window.verificarSesion()) {
    console.log("❌ Usuario no autenticado");
    if (typeof window.mostrarModalAuth === 'function') {
      window.mostrarModalAuth();
    } else {
      alert("Debes iniciar sesión para agregar productos al carrito");
    }
    return;
  }
  
  // ✅ OBTENER DATOS DIRECTAMENTE DEL ELEMENTO
  // El elemento puede ser el botón, así que buscamos la tarjeta padre
  const card = cardElement.closest('.promo-card');
  
  if (!card) {
    console.error("❌ No se encontró la tarjeta de promoción");
    return;
  }
  
  const promoId = card.getAttribute('data-promo-id');
  const titulo = decodeURIComponent(card.getAttribute('data-promo-titulo'));
  const precio = parseFloat(card.getAttribute('data-promo-precio'));
  const imagen = card.getAttribute('data-promo-imagen');
  const descripcion = decodeURIComponent(card.getAttribute('data-promo-descripcion') || '');
  
  console.log("📋 Datos extraídos:");
  console.log("  - ID:", promoId);
  console.log("  - Título:", titulo);
  console.log("  - Precio:", precio);
  
  if (!promoId) {
    console.error("❌ No se pudo obtener el ID de la promoción");
    return;
  }
  
  // Crear objeto producto para el carrito
  const productoPromo = {
    id: `promo_${promoId}`,
    nombre: titulo,
    titulo: titulo,
    precio_oferta: precio,
    precio: precio,
    imagen: imagen,
    descripcion: descripcion || "Promoción especial"
  };
  
  console.log("📦 Agregando al carrito:", productoPromo);
  
  // Agregar al carrito
  if (typeof window.agregarAlCarrito === 'function') {
    await window.agregarAlCarrito(productoPromo);
    
    // Feedback visual en el botón
    const btn = event.target.closest('.promo-add-button');
    if (btn) {
      const originalText = btn.innerHTML;
      btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg> ¡Agregado!';
      btn.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
      
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = '';
      }, 1500);
    }
    
    console.log("✅ Promoción agregada al carrito");
  } else {
    console.error("❌ window.agregarAlCarrito no está disponible");
  }
};

// ===============================================
// AGREGAR PROMOCIÓN DIRECTAMENTE AL CARRITO (Legacy)
// ===============================================
window.agregarPromocionDirecta = async function(event, promoId) {
  event.stopPropagation(); // Evitar que se abra el modal
  
  console.log("➕ Agregando promoción al carrito:", promoId);
  
  // Verificar sesión
  if (typeof window.verificarSesion !== 'function') {
    console.error("❌ window.verificarSesion no está disponible");
    alert("El sistema aún se está cargando. Por favor, espera un momento.");
    return;
  }
  
  if (!window.verificarSesion()) {
    console.log("❌ Usuario no autenticado");
    if (typeof window.mostrarModalAuth === 'function') {
      window.mostrarModalAuth();
    } else {
      alert("Debes iniciar sesión para agregar productos al carrito");
    }
    return;
  }
  
  // Buscar en cache primero
  let promo = promocionesCache.find(p => p.id == promoId);
  
  // Si no está en cache, buscar en el servidor
  if (!promo) {
    try {
      const response = await fetch("http://localhost:3000/api/menu/promociones");
      const promos = await response.json();
      promocionesCache = promos;
      promo = promos.find(p => p.id == promoId);
    } catch (error) {
      console.error("❌ Error al obtener promoción:", error);
      window.mostrarNotificacion("Error al agregar la promoción", "error");
      return;
    }
  }
  
  if (!promo) {
    console.error("❌ Promoción no encontrada");
    return;
  }
  
  // Crear objeto producto para el carrito
  const productoPromo = {
    id: `promo_${promo.id}`,
    nombre: promo.titulo,
    titulo: promo.titulo,
    precio_oferta: parseFloat(promo.precio_oferta),
    precio: parseFloat(promo.precio_oferta),
    imagen: promo.imagen,
    descripcion: promo.descripcion || "Promoción especial"
  };
  
  // Agregar al carrito
  if (typeof window.agregarAlCarrito === 'function') {
    await window.agregarAlCarrito(productoPromo);
    
    // Feedback visual en el botón
    const btn = event.target.closest('.promo-add-button');
    if (btn) {
      const originalText = btn.innerHTML;
      btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg> ¡Agregado!';
      btn.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
      
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = '';
      }, 1500);
    }
    
    console.log("✅ Promoción agregada al carrito");
  } else {
    console.error("❌ window.agregarAlCarrito no está disponible");
  }
};

// ===============================================
// CARGAR AL INICIAR LA PÁGINA
// ===============================================
document.addEventListener("DOMContentLoaded", cargarPromociones);

console.log("✅ promociones-banner.js cargado (versión estática optimizada)");

// ===============================================
// CREAR SKELETONS DE CARGA
// ===============================================
function crearSkeletons(cantidad = 3) {
  let html = '';
  for (let i = 0; i < cantidad; i++) {
    html += `
      <div class="promo-skeleton">
        <div class="promo-skeleton-image"></div>
        <div class="promo-skeleton-content">
          <div class="promo-skeleton-title"></div>
          <div class="promo-skeleton-text"></div>
          <div class="promo-skeleton-text" style="width: 60%;"></div>
          <div class="promo-skeleton-price"></div>
        </div>
      </div>
    `;
  }
  return html;
}

// ===============================================
// ABRIR MODAL DE PROMOCIÓN
// ===============================================
window.abrirModalPromocion = async function(promoId) {
  console.log("🎁 Abriendo modal de promoción:", promoId);
  
  try {
    // Obtener datos de la promoción
    const response = await fetch("http://localhost:3000/api/menu/promociones");
    const promos = await response.json();
    const promo = promos.find(p => p.id == promoId);
    
    if (!promo) {
      console.error("❌ Promoción no encontrada");
      return;
    }
    
    // Crear objeto compatible con el modal de producto
    const promocionParaModal = {
      id: `promo_${promo.id}`,
      titulo: promo.titulo,
      nombre: promo.titulo,
      precio_oferta: parseFloat(promo.precio_oferta),
      precio_original: promo.precio_original ? parseFloat(promo.precio_original) : null,
      precio: parseFloat(promo.precio_oferta),
      imagen: promo.imagen,
      descripcion: promo.descripcion || "¡Aprovecha esta oferta especial!",
      categoria: "Promoción"
    };
    
    // Abrir modal
    if (typeof window.abrirModalProducto === 'function') {
      window.abrirModalProducto(promocionParaModal, true);
    } else {
      console.error("❌ window.abrirModalProducto no está disponible");
    }
    
  } catch (error) {
    console.error("❌ Error al abrir modal de promoción:", error);
  }
};

// ===============================================
// AGREGAR PROMOCIÓN DIRECTAMENTE AL CARRITO
// ===============================================
window.agregarPromocionDirecta = async function(event, promoId) {
  event.stopPropagation(); // Evitar que se abra el modal
  
  console.log("➕ Agregando promoción al carrito:", promoId);
  
  // Verificar sesión
  if (typeof window.verificarSesion !== 'function') {
    console.error("❌ window.verificarSesion no está disponible");
    alert("El sistema aún se está cargando. Por favor, espera un momento.");
    return;
  }
  
  if (!window.verificarSesion()) {
    console.log("❌ Usuario no autenticado");
    if (typeof window.mostrarModalAuth === 'function') {
      window.mostrarModalAuth();
    } else {
      alert("Debes iniciar sesión para agregar productos al carrito");
    }
    return;
  }
  
  try {
    // Obtener datos de la promoción
    const response = await fetch("http://localhost:3000/api/menu/promociones");
    const promos = await response.json();
    const promo = promos.find(p => p.id == promoId);
    
    if (!promo) {
      console.error("❌ Promoción no encontrada");
      return;
    }
    
    // Crear objeto producto para el carrito
    const productoPromo = {
      id: `promo_${promo.id}`,
      nombre: promo.titulo,
      titulo: promo.titulo,
      precio_oferta: parseFloat(promo.precio_oferta),
      precio: parseFloat(promo.precio_oferta),
      imagen: promo.imagen,
      descripcion: promo.descripcion || "Promoción especial"
    };
    
    // Agregar al carrito
    if (typeof window.agregarAlCarrito === 'function') {
      await window.agregarAlCarrito(productoPromo);
      
      // Feedback visual en el botón
      const btn = event.target.closest('.promo-add-button');
      if (btn) {
        const originalText = btn.innerHTML;
        btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg> ¡Agregado!';
        btn.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
        
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.style.background = '';
        }, 1500);
      }
      
      console.log("✅ Promoción agregada al carrito");
    } else {
      console.error("❌ window.agregarAlCarrito no está disponible");
    }
    
  } catch (error) {
    console.error("❌ Error al agregar promoción:", error);
    window.mostrarNotificacion("Error al agregar la promoción", "error");
  }
};

// ===============================================
// CARGAR AL INICIAR LA PÁGINA
// ===============================================
document.addEventListener("DOMContentLoaded", cargarPromociones);

console.log("✅ promociones-banner.js cargado (versión estática)");