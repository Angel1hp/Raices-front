// ===============================================
// BANNER DE PROMOCIONES - DISEÑO RÚSTICO + NEÓN
// ===============================================

async function cargarPromociones() {
  const slider = document.getElementById("promoSlider");
  
  if (!slider) return;
  
  // ✅ MOSTRAR SKELETON LOADER INMEDIATAMENTE
  slider.innerHTML = `
    <div class="promo-banner-slide skeleton-loading">
      <div class="skeleton-image"></div>
      <div class="promo-banner-content">
        <div class="skeleton-title"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-price"></div>
      </div>
    </div>
    <div class="promo-banner-slide skeleton-loading">
      <div class="skeleton-image"></div>
      <div class="promo-banner-content">
        <div class="skeleton-title"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-price"></div>
      </div>
    </div>
    <div class="promo-banner-slide skeleton-loading">
      <div class="skeleton-image"></div>
      <div class="promo-banner-content">
        <div class="skeleton-title"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-price"></div>
      </div>
    </div>
  `;
  
  try {
    const response = await fetch("http://localhost:3000/api/menu/promociones");
    const promos = await response.json();

    // Si no hay promociones
    if (promos.length === 0) {
      slider.innerHTML = `
        <div class="promo-banner-slide">
          <div class="promo-banner-content">
            <h3 class="promo-banner-title">Sin promociones</h3>
            <p class="promo-banner-desc">No hay ofertas disponibles</p>
          </div>
        </div>
      `;
      return;
    }

    // ✅ DUPLICAR PROMOCIONES SUFICIENTES VECES PARA SCROLL INFINITO
    // Duplicamos 4 veces para tener suficiente contenido
    let promosRepetidas = [];
    for (let i = 0; i < 4; i++) {
      promosRepetidas = promosRepetidas.concat(promos);
    }
    
    console.log(`🔄 Promociones originales: ${promos.length}`);
    console.log(`🔄 Total de tarjetas: ${promosRepetidas.length}`);

    // Construir HTML de todas las tarjetas
    const tarjetasHTML = promosRepetidas.map((promo, index) => crearPromoCard(promo, index)).join("");
    
    // ✅ DUPLICAR EL CONTENIDO COMPLETO PARA SCROLL INFINITO SIN CORTES
    slider.innerHTML = tarjetasHTML + tarjetasHTML;
    
    // ✅ Configurar eventos después de renderizar
    configurarEventosPromociones(promosRepetidas);
    
    // ✅ INICIAR ANIMACIÓN INFINITA
    iniciarScrollInfinito(slider);
    
    console.log(`✅ Banner de promociones configurado con scroll infinito`);

  } catch (error) {
    console.error("❌ Error al cargar promociones:", error);
    slider.innerHTML = `
      <div class="promo-banner-slide">
        <div class="promo-banner-content">
          <h3 class="promo-banner-title">Error</h3>
          <p class="promo-banner-desc">No se pudieron cargar las promociones</p>
        </div>
      </div>
    `;
  }
}

// ✅ FUNCIÓN PARA SCROLL INFINITO SUAVE
function iniciarScrollInfinito(slider) {
  // Detener cualquier animación CSS
  slider.style.animation = 'none';
  
  let scrollPosition = 0;
  const velocidad = 0.5; // píxeles por frame (ajustable)
  
  function animar() {
    scrollPosition += velocidad;
    
    // Obtener el ancho de la primera mitad del contenido
    const anchoContenido = slider.scrollWidth / 2;
    
    // Cuando llegamos a la mitad, reiniciamos sin que se note
    if (scrollPosition >= anchoContenido) {
      scrollPosition = 0;
    }
    
    // Aplicar la transformación
    slider.style.transform = `translateX(-${scrollPosition}px)`;
    
    requestAnimationFrame(animar);
  }
  
  // Iniciar la animación
  requestAnimationFrame(animar);
  
  // Pausar al hacer hover
  slider.addEventListener('mouseenter', () => {
    slider.style.animationPlayState = 'paused';
    velocidadActual = 0;
  });
  
  slider.addEventListener('mouseleave', () => {
    slider.style.animationPlayState = 'running';
  });
  
  // Variable para controlar la velocidad durante hover
  let velocidadActual = velocidad;
  
  function animarConPausa() {
    if (velocidadActual > 0) {
      scrollPosition += velocidadActual;
      
      const anchoContenido = slider.scrollWidth / 2;
      
      if (scrollPosition >= anchoContenido) {
        scrollPosition = 0;
      }
      
      slider.style.transform = `translateX(-${scrollPosition}px)`;
    }
    
    requestAnimationFrame(animarConPausa);
  }
  
  // Reemplazar la función de animación con la que soporta pausa
  slider.addEventListener('mouseenter', () => {
    velocidadActual = 0;
  });
  
  slider.addEventListener('mouseleave', () => {
    velocidadActual = velocidad;
  });
  
  requestAnimationFrame(animarConPausa);
}

function crearPromoCard(promo, index) {
  // Usar un ID único que incluya el índice para evitar duplicados
  const uniqueId = `${promo.id}_${index}`;
  
  return `
    <div class="promo-banner-slide" data-promo-id="${promo.id}" data-promo-index="${index}" data-promo-titulo="${promo.titulo}" data-promo-precio="${promo.precio_oferta}" data-promo-imagen="${promo.imagen}" data-promo-descripcion="${promo.descripcion || ''}">
      <img src="${promo.imagen}" alt="${promo.titulo}">

      <div class="promo-banner-content">
        <h3 class="promo-banner-title">${promo.titulo}</h3>
        <p class="promo-banner-desc">${promo.descripcion ?? ""}</p>
        <div class="promo-banner-price">S/ ${promo.precio_oferta}</div>
        <button class="promo-add-btn" onclick="agregarPromocionAlCarrito('${promo.id}', event)">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          Agregar
        </button>
      </div>
    </div>
  `;
}

// Configurar eventos de click en las promociones
function configurarEventosPromociones(promos) {
  const slides = document.querySelectorAll('.promo-banner-slide');
  
  slides.forEach((slide) => {
    const promoId = slide.getAttribute('data-promo-id');
    const promoTitulo = slide.getAttribute('data-promo-titulo');
    const promoPrecio = slide.getAttribute('data-promo-precio');
    const promoImagen = slide.getAttribute('data-promo-imagen');
    const promoDescripcion = slide.getAttribute('data-promo-descripcion');
    
    if (!promoId) return;
    
    // Click en toda la tarjeta
    slide.addEventListener('click', (e) => {
      // Evitar doble trigger si se clickea el botón
      if (e.target.closest('.promo-add-btn')) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      console.log("🎁 Promoción clickeada:", promoTitulo);
      
      // Verificar si las funciones existen
      if (typeof verificarSesion !== 'function') {
        console.error("❌ Función verificarSesion no disponible");
        return;
      }
      
      if (typeof agregarAlCarrito !== 'function') {
        console.error("❌ Función agregarAlCarrito no disponible");
        return;
      }
      
      // Verificar sesión
      if (!verificarSesion()) {
        console.log("❌ Usuario no autenticado");
        if (typeof mostrarModalAuth === 'function') {
          mostrarModalAuth();
        } else {
          alert("Debes iniciar sesión para agregar productos al carrito");
        }
        return;
      }
      
      // Crear objeto producto compatible con el carrito
      const productoPromo = {
        id: `promo_${promoId}`,
        nombre: promoTitulo,
        precio: parseFloat(promoPrecio),
        imagen: promoImagen,
        descripcion: promoDescripcion || "Promoción especial"
      };
      
      console.log("📦 Agregando promoción al carrito:", productoPromo);
      
      // Agregar al carrito usando la función existente
      agregarAlCarrito(productoPromo);
      
      // Feedback visual
      slide.style.transform = 'scale(0.95)';
      setTimeout(() => {
        slide.style.transform = '';
      }, 200);
    });
  });
}

// Función global para agregar desde el botón
window.agregarPromocionAlCarrito = function(promoId, event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  console.log("🎁 Botón de promoción clickeado:", promoId);
  
  const slide = document.querySelector(`[data-promo-id="${promoId}"]`);
  if (!slide) {
    console.error("❌ No se encontró la tarjeta de promoción");
    return;
  }
  
  const promoTitulo = slide.getAttribute('data-promo-titulo');
  const promoPrecio = slide.getAttribute('data-promo-precio');
  const promoImagen = slide.getAttribute('data-promo-imagen');
  const promoDescripcion = slide.getAttribute('data-promo-descripcion');
  
  // Verificar si las funciones existen
  if (typeof verificarSesion !== 'function') {
    console.error("❌ Función verificarSesion no disponible");
    alert("Error: Funciones del carrito no disponibles. Recarga la página.");
    return;
  }
  
  // Verificar sesión
  if (!verificarSesion()) {
    console.log("❌ Usuario no autenticado");
    if (typeof mostrarModalAuth === 'function') {
      mostrarModalAuth();
    } else {
      alert("Debes iniciar sesión para agregar productos al carrito");
    }
    return;
  }
  
  if (typeof agregarAlCarrito !== 'function') {
    console.error("❌ Función agregarAlCarrito no disponible");
    alert("Error: Funciones del carrito no disponibles. Recarga la página.");
    return;
  }
  
  // Crear objeto producto compatible con el carrito
  const productoPromo = {
    id: `promo_${promoId}`,
    nombre: promoTitulo,
    precio: parseFloat(promoPrecio),
    imagen: promoImagen,
    descripcion: promoDescripcion || "Promoción especial"
  };
  
  console.log("📦 Agregando promoción al carrito:", productoPromo);
  
  // Agregar al carrito
  agregarAlCarrito(productoPromo);
  
  // Feedback visual
  slide.style.transform = 'scale(0.95)';
  setTimeout(() => {
    slide.style.transform = '';
  }, 200);
}

document.addEventListener("DOMContentLoaded", cargarPromociones);