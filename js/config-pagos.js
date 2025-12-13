// =====================================================
// CONFIGURACIÓN DE MÉTODOS DE PAGO
// Crear archivo: js/config-pagos.js
// =====================================================

// 💳 Configuración de Yape
const YAPE_CONFIG = {
  telefono: '999 888 777',           // ✅ Cambiar por tu número
  qrImage: 'img/qr-yape.png',        // ✅ Ruta de tu QR real (opcional)
  nombre: 'Restaurant Raíces',
  cuentaNumero: '999888777'          // Número sin espacios
};

// 💰 Configuración de Plin
const PLIN_CONFIG = {
  telefono: '987 654 321',           // ✅ Cambiar por tu número
  qrImage: 'img/qr-plin.png',        // ✅ Ruta de tu QR real (opcional)
  nombre: 'Restaurant Raíces',
  cuentaNumero: '987654321'          // Número sin espacios
};

// 💳 Configuración de Tarjeta (Nombre del negocio)
const TARJETA_CONFIG = {
  nombreNegocio: 'Raíces Restaurant',
  ruc: '20123456789'                 // ✅ Tu RUC
};

// =====================================================
// Exportar configuraciones
// =====================================================
window.PAYMENT_CONFIG = {
  yape: YAPE_CONFIG,
  plin: PLIN_CONFIG,
  tarjeta: TARJETA_CONFIG
};

console.log('✅ Configuración de pagos cargada');

// =====================================================
// EJEMPLO DE USO:
// En cualquier archivo JS puedes acceder:
// const numeroYape = window.PAYMENT_CONFIG.yape.telefono;
// const numeroPlin = window.PAYMENT_CONFIG.plin.telefono;
// =====================================================