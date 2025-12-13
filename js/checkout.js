// js/checkout.js - VERSIÓN CORREGIDA

const API_CHECKOUT = "https://raices-back.onrender.com/api/checkout";

let checkoutState = {
  step: 1,
  deliveryType: 'delivery',
  deliveryAddress: null,
  deliveryTime: null,
  deliveryReference: null,
  paymentMethod: null,
  comprobanteType: 'boleta',
  ruc: null,
  cardData: null,
  total: 0
};

console.log("🛒 checkout.js cargado");

// =====================
// ✅ INICIALIZAR CHECKOUT AL CARGAR LA PÁGINA
// =====================
document.addEventListener('DOMContentLoaded', () => {
  console.log("✅ Inicializando sistema de checkout...");
  
  // Verificar que existan los formularios
  const yapeForm = document.getElementById('yapeForm');
  const plinForm = document.getElementById('plinForm');
  const tarjetaForm = document.getElementById('tarjetaForm');
  
  console.log("📋 Formularios encontrados:", {
    yape: !!yapeForm,
    plin: !!plinForm,
    tarjeta: !!tarjetaForm
  });
  
  // ✅ Asegurarse de que todos estén ocultos al inicio
  if (yapeForm) yapeForm.style.display = 'none';
  if (plinForm) plinForm.style.display = 'none';
  if (tarjetaForm) tarjetaForm.style.display = 'none';
});

// =====================
// INICIAR CHECKOUT
// =====================
window.iniciarCheckout = function() {
  console.log("🚀 Iniciando checkout...");
   console.log("📦 window.carrito:", window.carrito); // ✅ Debug
  console.log("📦 Cantidad de items:", window.carrito?.length); // ✅ Debug
  const cartContent = document.querySelector('.cart-content');
  const checkoutContainer = document.getElementById('checkoutContainer');
  const cartFooter = document.querySelector('.cart-footer'); // ✅ Nuevo
  
  if (!cartContent || !checkoutContainer) {
    console.error("❌ Elementos no encontrados");
    return;
  }
  
  if (!window.carrito || window.carrito.length === 0) {
    window.mostrarNotificacion("El carrito está vacío", "warning");
    return;
  }
  
  // ✅ RESETEAR CHECKOUT ANTES DE INICIAR
  resetearCheckoutCompleto();
  
  // ✅ Ocultar contenido del carrito Y el footer
  cartContent.style.display = 'none';
  if (cartFooter) {
    cartFooter.style.display = 'none'; // ✅ Ocultar botones
  }
  
  checkoutContainer.classList.add('active');
  
  checkoutState.total = window.carrito.reduce((sum, item) => 
    sum + (parseFloat(item.precio_unitario) * item.cantidad), 0
  );
  
  autocompletarDatosUsuario();
  renderizarResumen();
  
  if (typeof window.actualizarMontosMetodosPago === 'function') {
    window.actualizarMontosMetodosPago(checkoutState.total);
  }
  
  mostrarPaso(1);
  
  console.log("✅ Checkout iniciado correctamente");
};

// =====================
// AUTOCOMPLETAR DATOS DEL USUARIO
// =====================
async function autocompletarDatosUsuario() {
  const usuarioActual = window.obtenerUsuarioActual();
  
  if (!usuarioActual || !usuarioActual.id) return;
  
  try {
    const response = await fetch(`https://raices-back.onrender.com/api/auth/cliente/${usuarioActual.id}`);
    
    if (!response.ok) {
      console.log("⚠️ No se pudieron obtener datos del usuario");
      return;
    }
    
    const data = await response.json();
    
    if (data.success && data.cliente) {
      const cliente = data.cliente;
      
      const direccionInput = document.getElementById('deliveryAddress');
      if (direccionInput && cliente.direccion) {
        direccionInput.value = cliente.direccion;
      }
      
      if (cliente.ruc) {
        checkoutState.ruc = cliente.ruc;
      }
      
      console.log("✅ Datos del usuario autocompletados");
    }
  } catch (error) {
    console.error("❌ Error al obtener datos del usuario:", error);
  }
}

// =====================
// VOLVER AL CARRITO
// =====================
window.volverAlCarrito = function() {
  console.log("◀️ Volviendo al carrito...");
  
  const cartContent = document.querySelector('.cart-content');
  const checkoutContainer = document.getElementById('checkoutContainer');
  const cartFooter = document.querySelector('.cart-footer'); // ✅ Nuevo
  
  if (cartContent && checkoutContainer) {
    cartContent.style.display = 'block';
    checkoutContainer.classList.remove('active');
    
    // ✅ Mostrar footer de nuevo
    if (cartFooter) {
      cartFooter.style.display = 'block';
    }
  }
  
  if (typeof window.renderizarCarrito === 'function') {
    window.renderizarCarrito();
  }
  
  // ✅ RESETEAR TODO AL VOLVER AL CARRITO
  resetearCheckoutCompleto();
  
  // ✅ VOLVER AL PASO 1
  mostrarPaso(1);
  
  console.log("✅ Vuelto al carrito y checkout reseteado");
};

// =====================
// RENDERIZAR RESUMEN
// =====================
function renderizarResumen() {
  const summaryItems = document.getElementById('checkoutSummaryItems');
  const summaryTotal = document.getElementById('checkoutSummaryTotal');
  
  if (!summaryItems || !summaryTotal) return;
  
  checkoutState.total = window.carrito.reduce((sum, item) => 
    sum + (parseFloat(item.precio_unitario) * item.cantidad), 0
  );
  
  summaryItems.innerHTML = window.carrito.map(item => `
    <div class="summary-item">
      <img src="${item.imagen || 'img/default.jpg'}" alt="${item.nombre}">
      <div class="summary-item-info">
        <div class="summary-item-name">${item.nombre}</div>
        <div class="summary-item-qty">Cantidad: ${item.cantidad}</div>
      </div>
      <div class="summary-item-price">
        S/ ${(parseFloat(item.precio_unitario) * item.cantidad).toFixed(2)}
      </div>
    </div>
  `).join('');
  
  summaryTotal.textContent = `S/ ${checkoutState.total.toFixed(2)}`;
  
  if (typeof window.actualizarMontosMetodosPago === 'function') {
    window.actualizarMontosMetodosPago(checkoutState.total);
  }
}

window.actualizarResumenCheckout = function() {
  const checkoutContainer = document.getElementById('checkoutContainer');
  if (checkoutContainer && checkoutContainer.classList.contains('active')) {
    renderizarResumen();
    console.log("✅ Resumen del checkout actualizado");
  }
};

// =====================
// MOSTRAR PASO
// =====================
function mostrarPaso(paso) {
  console.log(`📍 Mostrando paso ${paso}`);
  
  checkoutState.step = paso;
  
  document.querySelectorAll('.checkout-step').forEach((step, index) => {
    const stepNumber = index + 1;
    step.classList.remove('active', 'completed');
    
    if (stepNumber < paso) {
      step.classList.add('completed');
    } else if (stepNumber === paso) {
      step.classList.add('active');
    }
  });
  
  document.querySelectorAll('.checkout-step-content').forEach((content, index) => {
    content.style.display = (index + 1) === paso ? 'block' : 'none';
  });
  
  if (paso === 3 && checkoutState.ruc) {
    setTimeout(() => {
      const rucInput = document.getElementById('rucNumber');
      if (rucInput) {
        rucInput.value = checkoutState.ruc;
        const facturaOption = document.querySelector('.comprobante-option:last-child');
        if (facturaOption) {
          facturaOption.click();
        }
      }
    }, 100);
  }
}

// =====================
// PASO 1: ENTREGA
// =====================
window.continuarAPago = function() {
  console.log("🚀 Continuando a paso 2 (Pago)...");
  
  const direccion = document.getElementById('deliveryAddress')?.value;
  const referencia = document.getElementById('deliveryReference')?.value;
  const hora = document.getElementById('deliveryTime')?.value;
  
  if (!direccion || !hora) {
    window.mostrarNotificacion("Completa los datos de entrega", "warning");
    return;
  }
  
  checkoutState.deliveryAddress = direccion;
  checkoutState.deliveryReference = referencia || null;
  checkoutState.deliveryTime = hora;
  checkoutState.deliveryType = 'delivery';
  
  console.log("✅ Datos de entrega guardados:", checkoutState);
  
  mostrarPaso(2);
};

// =====================
// ✅ PASO 2: PAGO - VERSIÓN CORREGIDA
// =====================
window.seleccionarMetodoPago = function(metodo) {
  console.log("💳 Método de pago seleccionado:", metodo);
  
  checkoutState.paymentMethod = metodo;
  
  // Actualizar botones activos
  document.querySelectorAll('.payment-method').forEach(opt => {
    opt.classList.remove('active');
  });
  
  if (event && event.currentTarget) {
    event.currentTarget.classList.add('active');
  }
  
  // ✅ OCULTAR TODOS LOS FORMULARIOS
  const formularios = document.querySelectorAll('.payment-form');
  console.log(`📋 Total de formularios encontrados: ${formularios.length}`);
  
  formularios.forEach(form => {
    form.style.display = 'none';
    console.log(`🔒 Formulario ocultado: ${form.id}`);
  });
  
  // ✅ MOSTRAR EL FORMULARIO SELECCIONADO
  const formId = `${metodo}Form`;
  const form = document.getElementById(formId);
  
  console.log(`🔍 Buscando formulario: ${formId}`);
  
  if (form) {
    // Verificar si el formulario tiene contenido
    if (!form.innerHTML.trim()) {
      console.error(`❌ El formulario ${formId} está vacío. Verifica que init-checkout.js se haya ejecutado.`);
      window.mostrarNotificacion("Error: formulario no inicializado. Recarga la página.", "error");
      return;
    }
    
    form.style.display = 'block';
    form.style.opacity = '1';
    
    console.log(`✅ Formulario ${metodo} mostrado`);
    console.log(`📝 Contenido del formulario: ${form.innerHTML.substring(0, 100)}...`);
    
    // Actualizar montos con un pequeño delay
    setTimeout(() => {
      if (metodo === 'yape') {
        const yapeAmount = document.getElementById('yapeAmount');
        if (yapeAmount) {
          yapeAmount.textContent = `S/ ${checkoutState.total.toFixed(2)}`;
          console.log(`💰 Monto Yape actualizado: S/ ${checkoutState.total.toFixed(2)}`);
        }
      } else if (metodo === 'plin') {
        const plinAmount = document.getElementById('plinAmount');
        if (plinAmount) {
          plinAmount.textContent = `S/ ${checkoutState.total.toFixed(2)}`;
          console.log(`💰 Monto Plin actualizado: S/ ${checkoutState.total.toFixed(2)}`);
        }
      }
    }, 100);
  } else {
    console.error(`❌ No se encontró el formulario: ${formId}`);
    console.log("📋 Formularios disponibles en el DOM:");
    document.querySelectorAll('.payment-form').forEach(f => {
      console.log(`  - ${f.id} (display: ${f.style.display}, contenido: ${f.innerHTML ? 'SÍ' : 'NO'})`);
    });
  }
};

// =====================
// TARJETA - PREVIEW
// =====================
function actualizarPreviewTarjeta() {
  const numero = document.getElementById('cardNumber')?.value || '•••• •••• •••• ••••';
  const titular = document.getElementById('cardHolder')?.value || 'NOMBRE DEL TITULAR';
  const expiry = document.getElementById('cardExpiry')?.value || 'MM/AA';
  
  const displayNumero = document.getElementById('cardNumberDisplay');
  const displayTitular = document.getElementById('cardHolderDisplay');
  const displayExpiry = document.getElementById('cardExpiryDisplay');
  
  if (displayNumero) displayNumero.textContent = numero.replace(/(.{4})/g, '$1 ').trim();
  if (displayTitular) displayTitular.textContent = titular;
  if (displayExpiry) displayExpiry.textContent = expiry;
}

window.formatearNumeroTarjeta = function(input) {
  let value = input.value.replace(/\s/g, '');
  value = value.replace(/(\d{4})/g, '$1 ').trim();
  input.value = value;
  actualizarPreviewTarjeta();
};

window.formatearExpiracion = function(input) {
  let value = input.value.replace(/\D/g, '');
  if (value.length >= 2) {
    value = value.slice(0, 2) + '/' + value.slice(2, 4);
  }
  input.value = value;
  actualizarPreviewTarjeta();
};

window.continuarAComprobante = function() {
  if (!checkoutState.paymentMethod) {
    window.mostrarNotificacion("Selecciona un método de pago", "warning");
    return;
  }
  
  if (checkoutState.paymentMethod === 'tarjeta') {
    const numero = document.getElementById('cardNumber')?.value;
    const titular = document.getElementById('cardHolder')?.value;
    const expiry = document.getElementById('cardExpiry')?.value;
    const cvv = document.getElementById('cardCVV')?.value;
    
    if (!numero || !titular || !expiry || !cvv) {
      window.mostrarNotificacion("Completa los datos de la tarjeta", "warning");
      return;
    }
    
    checkoutState.cardData = { numero, titular, expiry };
  }
  
  if (checkoutState.paymentMethod === 'yape' || checkoutState.paymentMethod === 'plin') {
    const operacion = document.getElementById(`${checkoutState.paymentMethod}Operacion`)?.value;
    
    if (!operacion) {
      window.mostrarNotificacion("Ingresa el número de operación", "warning");
      return;
    }
    
    checkoutState.operacionId = operacion;
  }
  
  mostrarPaso(3);
};

// =====================
// PASO 3: COMPROBANTE
// =====================
window.seleccionarComprobante = function(tipo) {
  checkoutState.comprobanteType = tipo;
  
  document.querySelectorAll('.comprobante-option').forEach(opt => {
    opt.classList.remove('active');
  });
  
  event.currentTarget.classList.add('active');
  
  const rucInput = document.getElementById('rucInput');
  if (rucInput) {
    if (tipo === 'factura') {
      rucInput.classList.add('active');
    } else {
      rucInput.classList.remove('active');
    }
  }
};

// =====================
// FINALIZAR COMPRA
// =====================
window.finalizarCompra = async function(e) {
  console.log("🎯 finalizarCompra llamado");
  console.log("   Event:", e);
  
  // ✅ OBTENER EL BOTÓN DE FORMA SEGURA
  let btn;
  
  if (e && e.currentTarget) {
    btn = e.currentTarget;
    e.preventDefault();
    e.stopPropagation();
  } else {
    // Si no hay evento, buscar el botón manualmente
    const checkoutSteps = document.querySelectorAll('.checkout-step-content');
    const paso3 = checkoutSteps[2]; // Paso 3 (índice 2)
    btn = paso3?.querySelector('.checkout-btn-primary');
  }
  
  if (!btn) {
    console.error("❌ No se encontró el botón de finalizar compra");
    window.mostrarNotificacion("Error: No se pudo procesar. Recarga la página.", "error");
    return;
  }
  
  console.log("✅ Botón encontrado:", btn);
  console.log("   Estado disabled:", btn.disabled);
  console.log("   Texto actual:", btn.innerHTML.substring(0, 50));
  
  // ✅ PREVENIR DOBLE CLICK - SI YA ESTÁ PROCESANDO, SALIR
  if (btn.disabled) {
    console.warn("⚠️ El botón ya está deshabilitado. Compra en proceso o ya finalizada.");
    console.warn("   Por favor espera o recarga la página si el proceso se quedó trabado.");
    return;
  }
  
  const originalText = btn.innerHTML;
  
  console.log("📋 Estado actual del checkout:", JSON.stringify(checkoutState, null, 2));
  
  // ✅ VALIDACIÓN MÁS ROBUSTA
  try {
    // 1. Validar comprobante y RUC
    if (checkoutState.comprobanteType === 'factura') {
      const ruc = document.getElementById('rucNumber')?.value?.trim();
      console.log("🔍 Validando RUC:", ruc);
      
      if (!ruc) {
        window.mostrarNotificacion("Ingresa tu RUC", "warning");
        return;
      }
      
      if (ruc.length !== 11) {
        window.mostrarNotificacion("El RUC debe tener 11 dígitos", "warning");
        return;
      }
      
      if (!/^\d+$/.test(ruc)) {
        window.mostrarNotificacion("El RUC solo debe contener números", "warning");
        return;
      }
      
      checkoutState.ruc = ruc;
      console.log("✅ RUC válido:", ruc);
    } else {
      checkoutState.ruc = null;
      console.log("✅ Comprobante: Boleta (sin RUC)");
    }
    
    // 2. Validar que todos los datos estén completos
    if (!checkoutState.deliveryAddress) {
      window.mostrarNotificacion("Falta la dirección de entrega", "warning");
      mostrarPaso(1);
      return;
    }
    
    if (!checkoutState.deliveryTime) {
      window.mostrarNotificacion("Falta la hora de entrega", "warning");
      mostrarPaso(1);
      return;
    }
    
    if (!checkoutState.paymentMethod) {
      window.mostrarNotificacion("Falta seleccionar método de pago", "warning");
      mostrarPaso(2);
      return;
    }
    
    // 3. Validar usuario
    const usuarioActual = window.obtenerUsuarioActual();
    
    if (!usuarioActual || !usuarioActual.id) {
      throw new Error('Usuario no autenticado. Por favor, inicia sesión nuevamente.');
    }
    
    console.log("✅ Usuario:", usuarioActual.id);
    console.log("✅ Todas las validaciones pasadas");
    
    // 4. Deshabilitar botón y mostrar loading
    console.log("🔒 Deshabilitando botón...");
    btn.disabled = true;
    btn.style.opacity = '0.7';
    btn.style.cursor = 'not-allowed';
    btn.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px; justify-content: center;">
        <div style="width: 20px; height: 20px; border: 2px solid #fff; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        <span>Procesando...</span>
      </div>
    `;
    
    console.log("⏳ Botón deshabilitado correctamente");
    console.log("   Estado disabled:", btn.disabled);
    
    // 5. Preparar datos
    const checkoutData = {
      cliente_id: usuarioActual.id,
      tipo_entrega: 'delivery',
      direccion_entrega: checkoutState.deliveryAddress,
      referencia: checkoutState.deliveryReference || '',
      hora_entrega: checkoutState.deliveryTime,
      metodo_pago: checkoutState.paymentMethod,
      tipo_comprobante: checkoutState.comprobanteType,
      ruc: checkoutState.ruc,
      items: window.carrito.map(item => ({
        producto_id: item.producto_id,
        producto_tipo: item.producto_tipo,
        cantidad: item.cantidad,
        precio_unitario: parseFloat(item.precio_unitario)
      }))
    };
    
    console.log("📤 Datos a enviar:", JSON.stringify(checkoutData, null, 2));
    console.log("🌐 URL destino:", `${API_CHECKOUT}/procesar`);
    
    // 6. Enviar solicitud con timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      console.error("⏰ Timeout: La solicitud tardó más de 30 segundos");
    }, 30000);
    
    console.log("📡 Enviando solicitud HTTP POST...");
    const startTime = Date.now();
    
    const response = await fetch(`${API_CHECKOUT}/procesar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(checkoutData),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`📥 Respuesta recibida en ${duration}ms`);
    console.log("   Status:", response.status, response.statusText);
    
    // 7. Procesar respuesta
    if (!response.ok) {
      let errorMessage = 'Error al procesar la compra';
      
      try {
        const errorData = await response.json();
        console.error("❌ Error del servidor:", errorData);
        errorMessage = errorData.error || errorData.details || errorMessage;
      } catch (e) {
        console.error("❌ No se pudo parsear error del servidor:", e);
        const responseText = await response.text();
        console.error("   Response text:", responseText);
        errorMessage = `Error del servidor: ${response.status} ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }
    
    const result = await response.json();
    console.log("✅ Compra procesada exitosamente:");
    console.log("   Orden ID:", result.orden_id);
    console.log("   Comprobante:", result.numero_comprobante);
    console.log("   Total:", result.total);
    
    // 8. Mostrar éxito
    console.log("🎉 Mostrando pantalla de éxito...");
    mostrarExito(result.orden_id, result.numero_comprobante);
    
    // 9. Actualizar carrito
    console.log("🔄 Actualizando carrito...");
    if (typeof window.cargarCarritoDesdeDB === 'function') {
      await window.cargarCarritoDesdeDB();
    }
    
    if (typeof window.actualizarBadgeCarrito === 'function') {
      window.actualizarBadgeCarrito();
    }
    
    console.log("✅ Proceso completado exitosamente");
    console.log("ℹ️ El botón se reseteará cuando cierres el modal o inicies un nuevo checkout");
    
  } catch (error) {
    console.error("❌ ========== ERROR EN FINALIZAR COMPRA ==========");
    console.error("Tipo de error:", error.name);
    console.error("Mensaje:", error.message);
    console.error("Stack:", error.stack);
    console.error("================================================");
    
    // Manejar diferentes tipos de errores
    let mensajeError = "Error al procesar la compra";
    
    if (error.name === 'AbortError') {
      mensajeError = "La solicitud tardó demasiado. Por favor, intenta nuevamente.";
    } else if (error.message.includes('fetch') || error.message.includes('NetworkError')) {
      mensajeError = "Error de conexión. Verifica tu conexión a internet y que el servidor esté corriendo.";
    } else {
      mensajeError = error.message;
    }
    
    window.mostrarNotificacion(mensajeError, "error");
    
    // Restaurar botón SOLO EN CASO DE ERROR
    console.log("🔄 Restaurando botón tras error...");
    btn.disabled = false;
    btn.style.opacity = '1';
    btn.style.cursor = 'pointer';
    btn.innerHTML = originalText;
    console.log("✅ Botón restaurado");
  }
};

// =====================
// MOSTRAR ÉXITO
// =====================
function mostrarExito(ordenId, numeroComprobante) {
  console.log("🎉 Mostrando pantalla de éxito");
  
  document.querySelectorAll('.checkout-step-content').forEach(content => {
    content.style.display = 'none';
  });
  
  document.querySelector('.checkout-steps')?.style.setProperty('display', 'none');
  
  const successContainer = document.getElementById('checkoutSuccess');
  if (successContainer) {
    successContainer.classList.add('active');
    
    const orderNumberEl = successContainer.querySelector('.order-number');
    if (orderNumberEl) {
      orderNumberEl.textContent = `Orden #${ordenId} - Comprobante: ${numeroComprobante}`;
    }
  }
  
  window.mostrarNotificacion("¡Compra realizada con éxito! 🎉", "success");
  
  // ✅ LIMPIAR ESTADO INMEDIATAMENTE DESPUÉS DEL ÉXITO
  setTimeout(() => {
    resetearCheckoutCompleto();
  }, 500);
}

// =====================
// ✅ FUNCIÓN PARA RESETEAR COMPLETAMENTE EL CHECKOUT
// =====================
function resetearCheckoutCompleto() {
  console.log("🔄 Reseteando checkout completamente...");
  
  // 1. Resetear estado
  checkoutState = {
    step: 1,
    deliveryType: 'delivery',
    deliveryAddress: null,
    deliveryTime: null,
    deliveryReference: null,
    paymentMethod: null,
    comprobanteType: 'boleta',
    ruc: null,
    cardData: null,
    total: 0
  };
  
  // 2. Limpiar campos del paso 1 (Entrega)
  const deliveryAddress = document.getElementById('deliveryAddress');
  const deliveryReference = document.getElementById('deliveryReference');
  const deliveryTime = document.getElementById('deliveryTime');
  
  if (deliveryAddress) deliveryAddress.value = '';
  if (deliveryReference) deliveryReference.value = '';
  if (deliveryTime) deliveryTime.value = '';
  
  // 3. Limpiar campos del paso 2 (Pago)
  // Tarjeta
  const cardNumber = document.getElementById('cardNumber');
  const cardHolder = document.getElementById('cardHolder');
  const cardExpiry = document.getElementById('cardExpiry');
  const cardCVV = document.getElementById('cardCVV');
  
  if (cardNumber) cardNumber.value = '';
  if (cardHolder) cardHolder.value = '';
  if (cardExpiry) cardExpiry.value = '';
  if (cardCVV) cardCVV.value = '';
  
  // Yape
  const yapeOperacion = document.getElementById('yapeOperacion');
  if (yapeOperacion) yapeOperacion.value = '';
  
  // Plin
  const plinOperacion = document.getElementById('plinOperacion');
  if (plinOperacion) plinOperacion.value = '';
  
  // Desactivar métodos de pago
  document.querySelectorAll('.payment-method').forEach(opt => {
    opt.classList.remove('active');
  });
  
  // Ocultar todos los formularios de pago
  document.querySelectorAll('.payment-form').forEach(form => {
    form.style.display = 'none';
  });
  
  // 4. Limpiar campos del paso 3 (Comprobante)
  const rucNumber = document.getElementById('rucNumber');
  if (rucNumber) rucNumber.value = '';
  
  // Resetear a boleta
  document.querySelectorAll('.comprobante-option').forEach((opt, index) => {
    if (index === 0) {
      opt.classList.add('active');
    } else {
      opt.classList.remove('active');
    }
  });
  
  const rucInput = document.getElementById('rucInput');
  if (rucInput) rucInput.classList.remove('active');
  
  // 5. Resetear preview de tarjeta
  const cardNumberDisplay = document.getElementById('cardNumberDisplay');
  const cardHolderDisplay = document.getElementById('cardHolderDisplay');
  const cardExpiryDisplay = document.getElementById('cardExpiryDisplay');
  
  if (cardNumberDisplay) cardNumberDisplay.textContent = '•••• •••• •••• ••••';
  if (cardHolderDisplay) cardHolderDisplay.textContent = 'NOMBRE DEL TITULAR';
  if (cardExpiryDisplay) cardExpiryDisplay.textContent = 'MM/AA';
  
  // ✅ 6. RESETEAR TODOS LOS BOTONES DE FINALIZAR COMPRA
  const checkoutSteps = document.querySelectorAll('.checkout-step-content');
  checkoutSteps.forEach((step, index) => {
    const btns = step.querySelectorAll('.checkout-btn-primary');
    btns.forEach(btn => {
      // Solo resetear si es el botón de "Finalizar Compra"
      if (btn.textContent.includes('Finalizar') || btn.onclick?.toString().includes('finalizarCompra')) {
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
        btn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
          Finalizar Compra
        `;
        console.log(`  ✅ Botón de finalizar compra reseteado en paso ${index + 1}`);
      }
    });
  });
  
  console.log("✅ Checkout reseteado completamente");
}

// =====================
// CERRAR Y VOLVER AL INICIO
// =====================
window.cerrarCheckoutExitoso = function() {
  console.log("🚪 Cerrando checkout exitoso...");
  
  // Cerrar modal del carrito
  const cartModal = document.getElementById('cartModal');
  const cartOverlay = document.getElementById('cartOverlay');
  
  if (cartModal) cartModal.classList.remove('open');
  if (cartOverlay) cartOverlay.classList.remove('active');
  document.body.style.overflow = '';
  
  // Reset checkout
  const checkoutContainer = document.getElementById('checkoutContainer');
  const cartContent = document.querySelector('.cart-content');
  const successContainer = document.getElementById('checkoutSuccess');
  const cartFooter = document.querySelector('.cart-footer'); // ✅ Nuevo
  
  if (checkoutContainer) checkoutContainer.classList.remove('active');
  if (cartContent) cartContent.style.display = 'block';
  if (successContainer) successContainer.classList.remove('active');
  
  // ✅ Mostrar footer de nuevo
  if (cartFooter) {
    cartFooter.style.display = 'block';
  }
  
  document.querySelector('.checkout-steps')?.style.removeProperty('display');
  
  // ✅ RESETEAR TODO COMPLETAMENTE
  resetearCheckoutCompleto();
  
  // ✅ VOLVER AL PASO 1
  mostrarPaso(1);
  
  console.log("✅ Checkout cerrado y reseteado");
};

console.log("✅ checkout.js completamente cargado");

// ✅ Agregar estilos para el spinner si no existen
if (!document.getElementById('checkout-spinner-styles')) {
  const style = document.createElement('style');
  style.id = 'checkout-spinner-styles';
  style.textContent = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}