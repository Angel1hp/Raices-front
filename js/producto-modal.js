// =====================
// MODAL DE PRODUCTO - Con soporte para bebidas
// =====================

let productoModalActual = null;
let cantidadModalActual = 1;

// Función para abrir el modal del producto (productos normales Y promociones)
window.abrirModalProducto = function(producto, esPromocion = false) {
  console.log("🔍 Abriendo modal del producto:", producto);
  console.log("🎁 Es promoción:", esPromocion);
  console.log("🥤 Es bebida:", producto.tipo === 'bebida');
  
  productoModalActual = producto;
  productoModalActual._esPromocion = esPromocion;
  cantidadModalActual = 1;
  
  const modal = document.getElementById('productModal');
  const overlay = document.getElementById('productModalOverlay');
  const modalImage = document.getElementById('productModalImage');
  const modalCategory = document.getElementById('productModalCategory');
  const modalTitle = document.getElementById('productModalTitle');
  const modalDescription = document.getElementById('productModalDescription');
  const modalPrice = document.getElementById('productModalPrice');
  const modalOldPrice = document.getElementById('productModalOldPrice');
  const modalDiscount = document.getElementById('productModalDiscount');
  const modalDiscountText = document.getElementById('productModalDiscountText');
  const modalQtyDisplay = document.getElementById('productModalQtyDisplay');
  
  // Establecer los datos del producto
  if (modalImage) modalImage.src = producto.imagen || 'img/default.jpg';
  
  // Categoría o badge - diferente para bebidas, promociones y comidas
  if (modalCategory) {
    if (esPromocion) {
      modalCategory.textContent = '🎁 PROMOCIÓN ESPECIAL';
      modalCategory.style.background = '#ffe600';
      modalCategory.style.color = '#2a2a2a';
    } else if (producto.tipo === 'bebida') {
      modalCategory.textContent = `🥤 ${producto.categoria || 'BEBIDA'}`;
      modalCategory.style.background = 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)';
      modalCategory.style.color = 'white';
    } else {
      modalCategory.textContent = producto.categoria || 'Sin categoría';
      modalCategory.style.background = '#f0f0f0';
      modalCategory.style.color = '#666';
    }
  }
  
  // Título (usar 'titulo' para promociones, 'nombre' para productos)
  let nombreProducto = producto.titulo || producto.nombre;
  
  // Agregar tamaño para bebidas
  if (producto.tipo === 'bebida' && producto.tamano_ml) {
    nombreProducto += ` (${producto.tamano_ml}ml)`;
  }
  
  if (modalTitle) modalTitle.textContent = nombreProducto;
  
  // Descripción - mejorada para bebidas
  let descripcionProducto = producto.descripcion || '';
  
  if (producto.tipo === 'bebida') {
    if (producto.tamano_ml && !descripcionProducto.includes(producto.tamano_ml)) {
      descripcionProducto = `Presentación de ${producto.tamano_ml}ml. ${descripcionProducto}`;
    }
    if (!descripcionProducto) {
      descripcionProducto = `Deliciosa bebida ${producto.categoria || ''} perfecta para acompañar tu comida.`;
    }
  } else if (esPromocion && !descripcionProducto) {
    descripcionProducto = '¡Aprovecha esta oferta especial!';
  } else if (!descripcionProducto) {
    descripcionProducto = 'Delicioso platillo de nuestra carta.';
  }
  
  if (modalDescription) modalDescription.textContent = descripcionProducto;
  
  // Precio
  const precioMostrar = producto.precio_oferta || producto.precio;
  if (modalPrice) modalPrice.textContent = `S/ ${parseFloat(precioMostrar).toFixed(2)}`;
  if (modalQtyDisplay) modalQtyDisplay.textContent = cantidadModalActual;
  
  // Manejar precio con descuento
  if (producto.precio_original && producto.precio_oferta) {
    const descuento = Math.round(((producto.precio_original - producto.precio_oferta) / producto.precio_original) * 100);
    if (modalOldPrice) {
      modalOldPrice.textContent = `S/ ${parseFloat(producto.precio_original).toFixed(2)}`;
      modalOldPrice.style.display = 'block';
    }
    if (modalDiscount && modalDiscountText) {
      modalDiscountText.textContent = `-${descuento}%`;
      modalDiscount.style.display = 'block';
    }
  } else {
    if (modalOldPrice) modalOldPrice.style.display = 'none';
    if (modalDiscount) modalDiscount.style.display = 'none';
  }
  
  // Actualizar información extra según tipo de producto
  actualizarInfoExtraModal(producto, esPromocion);
  
  // Abrir modal
  if (overlay) {
    overlay.classList.add('active');
    overlay.addEventListener('click', cerrarModalProducto);
  }
  if (modal) modal.classList.add('active');
  
  document.body.style.overflow = 'hidden';
  
  // Event listeners para controles de cantidad
  configurarControlesModalProducto();
};

// Actualizar información extra según tipo de producto
function actualizarInfoExtraModal(producto, esPromocion) {
  const extraInfo = document.querySelector('.product-modal-extra-info');
  
  if (!extraInfo) return;

  if (producto.tipo === 'bebida') {
    extraInfo.innerHTML = `
      <div class="product-modal-info-item">
        <span class="product-modal-info-icon">🥤</span>
        <span>${producto.tamano_ml ? producto.tamano_ml + 'ml' : 'Bebida'}</span>
      </div>
      <div class="product-modal-info-item">
        <span class="product-modal-info-icon">❄️</span>
        <span>Servida fría</span>
      </div>
      <div class="product-modal-info-item">
        <span class="product-modal-info-icon">✨</span>
        <span>Producto de calidad</span>
      </div>
    `;
  } else if (esPromocion) {
    extraInfo.innerHTML = `
      <div class="product-modal-info-item">
        <span class="product-modal-info-icon">🎁</span>
        <span>Oferta especial</span>
      </div>
      <div class="product-modal-info-item">
        <span class="product-modal-info-icon">⏰</span>
        <span>Por tiempo limitado</span>
      </div>
      <div class="product-modal-info-item">
        <span class="product-modal-info-icon">💰</span>
        <span>Mejor precio</span>
      </div>
    `;
  } else {
    extraInfo.innerHTML = `
      <div class="product-modal-info-item">
        <span class="product-modal-info-icon">🍽️</span>
        <span>Preparación rápida</span>
      </div>
      <div class="product-modal-info-item">
        <span class="product-modal-info-icon">✨</span>
        <span>Ingredientes frescos</span>
      </div>
      <div class="product-modal-info-item">
        <span class="product-modal-info-icon">🔥</span>
        <span>Receta tradicional</span>
      </div>
    `;
  }
}

// Configurar controles del modal
function configurarControlesModalProducto() {
  const btnClose = document.getElementById('productModalClose');
  const btnMinus = document.getElementById('productModalQtyMinus');
  const btnPlus = document.getElementById('productModalQtyPlus');
  const btnAddToCart = document.getElementById('productModalAddToCart');
  
  // Cerrar modal
  if (btnClose) {
    btnClose.onclick = cerrarModalProducto;
  }
  
  // Disminuir cantidad
  if (btnMinus) {
    btnMinus.onclick = () => {
      if (cantidadModalActual > 1) {
        cantidadModalActual--;
        actualizarCantidadModal();
      }
    };
  }
  
  // Aumentar cantidad
  if (btnPlus) {
    btnPlus.onclick = () => {
      cantidadModalActual++;
      actualizarCantidadModal();
    };
  }
  
  // Agregar al carrito
  if (btnAddToCart) {
    btnAddToCart.onclick = async () => {
      if (!productoModalActual) return;
      
      const nombreProducto = productoModalActual.titulo || productoModalActual.nombre;
      console.log(`🛒 Agregando ${cantidadModalActual} unidades de ${nombreProducto}`);
      
      // Agregar la cantidad seleccionada
      for (let i = 0; i < cantidadModalActual; i++) {
        await window.agregarAlCarrito(productoModalActual);
      }
      
      cerrarModalProducto();
      window.mostrarNotificacion(`${cantidadModalActual} ${nombreProducto}(s) agregado(s) al carrito`, 'success');
    };
  }
  
  // Cerrar con ESC
  document.addEventListener('keydown', handleEscModalProducto);
}

// Actualizar display de cantidad
function actualizarCantidadModal() {
  const qtyDisplay = document.getElementById('productModalQtyDisplay');
  const btnMinus = document.getElementById('productModalQtyMinus');
  
  if (qtyDisplay) {
    qtyDisplay.textContent = cantidadModalActual;
  }
  
  if (btnMinus) {
    btnMinus.disabled = cantidadModalActual <= 1;
  }
}

// Cerrar modal
function cerrarModalProducto() {
  const modal = document.getElementById('productModal');
  const overlay = document.getElementById('productModalOverlay');
  
  if (modal) modal.classList.remove('active');
  if (overlay) {
    overlay.classList.remove('active');
    overlay.removeEventListener('click', cerrarModalProducto);
  }
  
  document.body.style.overflow = '';
  document.removeEventListener('keydown', handleEscModalProducto);
  
  productoModalActual = null;
  cantidadModalActual = 1;
}

// Manejar tecla ESC
function handleEscModalProducto(e) {
  if (e.key === 'Escape') {
    cerrarModalProducto();
  }
}

console.log("✅ Modal de producto configurado con soporte para bebidas");