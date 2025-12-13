// js/init-checkout.js - VERSIÓN CORREGIDA
document.addEventListener('DOMContentLoaded', () => {
  console.log("🎬 init-checkout.js ejecutándose...");
  initializarPagos();
});

function initializarPagos() {
  console.log("💳 Inicializando métodos de pago...");
  
  // Configuración
  const YAPE_TELEFONO = '964 963 938';  // ✅ CAMBIAR
  const PLIN_TELEFONO = '964 963 938';  // ✅ CAMBIAR
  const YAPE_QR = 'img/qr-yape.png';    // ✅ Opcional
  const PLIN_QR = 'img/qr-plin.png';    // ✅ Opcional
  
  // =====================
  // FORMULARIO TARJETA
  // =====================
  const tarjetaForm = document.getElementById('tarjetaForm');
  if (tarjetaForm) {
    tarjetaForm.innerHTML = `
      <div class="card-preview">
        <div class="card-number-display" id="cardNumberDisplay">•••• •••• •••• ••••</div>
        <div class="card-info">
          <div class="card-holder" id="cardHolderDisplay">NOMBRE DEL TITULAR</div>
          <div class="card-expiry" id="cardExpiryDisplay">MM/AA</div>
        </div>
      </div>

      <div class="form-group">
        <label>Número de tarjeta</label>
        <input 
          type="text" 
          id="cardNumber" 
          placeholder="1234 5678 9012 3456" 
          maxlength="19"
          oninput="formatearNumeroTarjeta(this)"
        >
      </div>

      <div class="form-group">
        <label>Nombre del titular</label>
        <input 
          type="text" 
          id="cardHolder" 
          placeholder="NOMBRE COMPLETO"
          oninput="actualizarPreviewTarjeta()"
        >
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div class="form-group">
          <label>Fecha de expiración</label>
          <input 
            type="text" 
            id="cardExpiry" 
            placeholder="MM/AA"
            maxlength="5"
            oninput="formatearExpiracion(this)"
          >
        </div>

        <div class="form-group">
          <label>CVV</label>
          <input 
            type="text" 
            id="cardCVV" 
            placeholder="123"
            maxlength="3"
          >
        </div>
      </div>
    `;
    console.log("✅ Formulario de tarjeta creado");
  }
  
  // =====================
  // FORMULARIO YAPE
  // =====================
  const yapeForm = document.getElementById('yapeForm');
  if (yapeForm) {
    yapeForm.innerHTML = `
      <div class="qr-container">
        ${YAPE_QR ? `<img src="${YAPE_QR}" alt="QR Yape" class="qr-code-image" style="max-width: 200px; margin: 0 auto; display: block;">` : '<div class="qr-code">📱</div>'}
        <p class="qr-instructions">
          Escanea el código QR o envía al número:
        </p>
        <div class="qr-phone">
          📞 ${YAPE_TELEFONO}
        </div>
        <p class="qr-instructions" style="margin-top: 12px; font-size: 12px;">
          Monto a pagar: <strong id="yapeAmount">S/ 0.00</strong>
        </p>
      </div>

      <div class="form-group">
        <label>Número de operación *</label>
        <input 
          type="text" 
          id="yapeOperacion" 
          placeholder="Ingresa el número de operación"
        >
      </div>
    `;
    console.log("✅ Formulario de Yape creado");
  }
  
  // =====================
  // FORMULARIO PLIN
  // =====================
  const plinForm = document.getElementById('plinForm');
  if (plinForm) {
    plinForm.innerHTML = `
      <div class="qr-container">
        ${PLIN_QR ? `<img src="${PLIN_QR}" alt="QR Plin" class="qr-code-image" style="max-width: 200px; margin: 0 auto; display: block;">` : '<div class="qr-code">💰</div>'}
        <p class="qr-instructions">
          Escanea el código QR o envía al número:
        </p>
        <div class="qr-phone">
          📞 ${PLIN_TELEFONO}
        </div>
        <p class="qr-instructions" style="margin-top: 12px; font-size: 12px;">
          Monto a pagar: <strong id="plinAmount">S/ 0.00</strong>
        </p>
      </div>

      <div class="form-group">
        <label>Número de operación *</label>
        <input 
          type="text" 
          id="plinOperacion" 
          placeholder="Ingresa el número de operación"
        >
      </div>
    `;
    console.log("✅ Formulario de Plin creado");
  }
  
  // =====================
  // OCULTAR TODOS AL INICIO
  // =====================
  if (tarjetaForm) tarjetaForm.style.display = 'none';
  if (yapeForm) yapeForm.style.display = 'none';
  if (plinForm) plinForm.style.display = 'none';
  
  console.log('✅ Métodos de pago inicializados y ocultados');
}

// =====================
// ✅ FUNCIÓN PARA ACTUALIZAR MONTOS
// =====================
window.actualizarMontosMetodosPago = function(total) {
  console.log("💰 Actualizando montos de métodos de pago:", total);
  
  const yapeAmount = document.getElementById('yapeAmount');
  const plinAmount = document.getElementById('plinAmount');
  
  if (yapeAmount) {
    yapeAmount.textContent = `S/ ${parseFloat(total).toFixed(2)}`;
    console.log("  ✅ Monto Yape actualizado");
  } else {
    console.warn("  ⚠️ Elemento yapeAmount no encontrado");
  }
  
  if (plinAmount) {
    plinAmount.textContent = `S/ ${parseFloat(total).toFixed(2)}`;
    console.log("  ✅ Monto Plin actualizado");
  } else {
    console.warn("  ⚠️ Elemento plinAmount no encontrado");
  }
};

// =====================
// ✅ FUNCIONES PARA TARJETA (DEBEN ESTAR EN SCOPE GLOBAL)
// =====================
window.actualizarPreviewTarjeta = function() {
  const numero = document.getElementById('cardNumber')?.value || '•••• •••• •••• ••••';
  const titular = document.getElementById('cardHolder')?.value || 'NOMBRE DEL TITULAR';
  const expiry = document.getElementById('cardExpiry')?.value || 'MM/AA';
  
  const displayNumero = document.getElementById('cardNumberDisplay');
  const displayTitular = document.getElementById('cardHolderDisplay');
  const displayExpiry = document.getElementById('cardExpiryDisplay');
  
  if (displayNumero) displayNumero.textContent = numero.replace(/(.{4})/g, '$1 ').trim();
  if (displayTitular) displayTitular.textContent = titular;
  if (displayExpiry) displayExpiry.textContent = expiry;
};

window.formatearNumeroTarjeta = function(input) {
  let value = input.value.replace(/\s/g, '');
  value = value.replace(/(\d{4})/g, '$1 ').trim();
  input.value = value;
  window.actualizarPreviewTarjeta();
};

window.formatearExpiracion = function(input) {
  let value = input.value.replace(/\D/g, '');
  if (value.length >= 2) {
    value = value.slice(0, 2) + '/' + value.slice(2, 4);
  }
  input.value = value;
  window.actualizarPreviewTarjeta();
};

console.log("✅ init-checkout.js completamente cargado");