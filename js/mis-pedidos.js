// js/mis-pedidos.js

let pedidosData = [];
let filtroActual = 'todos';

document.addEventListener('DOMContentLoaded', async () => {
  console.log("📄 mis-pedidos.js iniciado");
  
  // ✅ Verificar sesión usando la función global
  if (!window.requerirAutenticacion) {
    console.error("❌ auth-utils.js no está cargado");
    window.location.href = 'login.html';
    return;
  }
  
  // Verificar autenticación
  if (!window.requerirAutenticacion()) {
    return; // La función ya redirige si no hay sesión
  }
  
  const usuarioActual = window.obtenerUsuarioActual();
  console.log("👤 Usuario actual:", usuarioActual);
  
  // Cargar pedidos
  await cargarPedidos(usuarioActual.id);
  
  // Configurar filtros
  configurarFiltros();
  
  // Configurar modal
  configurarModal();
});

async function cargarPedidos(clienteId) {
  try {
    const response = await fetch(`http://localhost:3000/api/checkout/ordenes/${clienteId}`);
    
    if (!response.ok) throw new Error('Error al cargar pedidos');
    
    pedidosData = await response.json();
    
    console.log('📦 Pedidos cargados:', pedidosData);
    
    // Actualizar estadísticas
    actualizarEstadisticas();
    
    // Actualizar contadores de filtros
    actualizarContadores();
    
    // Renderizar pedidos
    renderizarPedidos();
    
  } catch (error) {
    console.error('❌ Error al cargar pedidos:', error);
    document.getElementById('pedidosList').innerHTML = `
      <div class="pedidos-empty">
        <p>Error al cargar los pedidos. Intenta recargar la página.</p>
      </div>
    `;
  }
}

function actualizarEstadisticas() {
  const totalPedidos = pedidosData.length;
  const totalGastado = pedidosData.reduce((sum, pedido) => sum + parseFloat(pedido.total), 0);
  
  document.getElementById('totalPedidos').textContent = totalPedidos;
  document.getElementById('totalGastado').textContent = `S/ ${totalGastado.toFixed(2)}`;
}

function actualizarContadores() {
  const countTodos = pedidosData.length;
  const countPendiente = pedidosData.filter(p => p.estado === 'pendiente').length;
  const countCompletado = pedidosData.filter(p => p.estado === 'completado').length;
  const countCancelado = pedidosData.filter(p => p.estado === 'cancelado').length;
  
  document.getElementById('countTodos').textContent = countTodos;
  document.getElementById('countPendiente').textContent = countPendiente;
  document.getElementById('countCompletado').textContent = countCompletado;
  document.getElementById('countCancelado').textContent = countCancelado;
}

function configurarFiltros() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remover active de todos
      filterBtns.forEach(b => b.classList.remove('active'));
      
      // Agregar active al clickeado
      btn.classList.add('active');
      
      // Actualizar filtro
      filtroActual = btn.dataset.filter;
      
      // Renderizar pedidos filtrados
      renderizarPedidos();
    });
  });
}

function renderizarPedidos() {
  const pedidosList = document.getElementById('pedidosList');
  const pedidosEmpty = document.getElementById('pedidosEmpty');
  
  // Filtrar pedidos
  let pedidosFiltrados = pedidosData;
  
  if (filtroActual !== 'todos') {
    pedidosFiltrados = pedidosData.filter(p => p.estado === filtroActual);
  }
  
  // Si no hay pedidos
  if (pedidosFiltrados.length === 0) {
    pedidosList.style.display = 'none';
    pedidosEmpty.style.display = 'block';
    return;
  }
  
  pedidosList.style.display = 'block';
  pedidosEmpty.style.display = 'none';
  
  // Renderizar pedidos
  pedidosList.innerHTML = pedidosFiltrados.map(pedido => `
    <div class="pedido-card" onclick="abrirDetallePedido(${pedido.id})">
      <div class="pedido-card-header">
        <div class="pedido-info">
          <div class="pedido-numero">Pedido #${pedido.id} - ${pedido.numero_comprobante || ''}</div>
          <div class="pedido-fecha">${formatearFecha(pedido.fecha)}</div>
        </div>
        <span class="pedido-estado ${pedido.estado}">${pedido.estado}</span>
      </div>
      
      <div class="pedido-detalles">
        <div class="detalle-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span>${pedido.tipo_entrega === 'delivery' ? 'Delivery' : 'Recojo en tienda'}</span>
        </div>
        <div class="detalle-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span>${formatearHora(pedido.fecha)}</span>
        </div>
      </div>
      
      <div class="pedido-footer">
        <div class="pedido-total">Total: S/ ${parseFloat(pedido.total).toFixed(2)}</div>
        <button class="btn-ver-detalle" onclick="event.stopPropagation(); abrirDetallePedido(${pedido.id})">
          Ver Detalle
        </button>
      </div>
    </div>
  `).join('');
}

function configurarModal() {
  const modalOverlay = document.getElementById('modalOverlay');
  const modalPedido = document.getElementById('modalPedido');
  const modalClose = document.getElementById('modalClose');
  
  modalClose.addEventListener('click', cerrarModal);
  modalOverlay.addEventListener('click', cerrarModal);
}

async function abrirDetallePedido(ordenId) {
  try {
    const response = await fetch(`http://localhost:3000/api/checkout/orden/${ordenId}`);
    
    if (!response.ok) throw new Error('Error al cargar detalle');
    
    const data = await response.json();
    
    renderizarDetalleModal(data);
    
    // Mostrar modal
    document.getElementById('modalOverlay').classList.add('active');
    document.getElementById('modalPedido').classList.add('active');
    document.body.style.overflow = 'hidden';
    
  } catch (error) {
    console.error('❌ Error al cargar detalle:', error);
    mostrarNotificacion('Error al cargar el detalle del pedido', 'error');
  }
}

function renderizarDetalleModal(data) {
  const { orden, detalles } = data;
  
  const modalBody = document.getElementById('modalBody');
  
  modalBody.innerHTML = `
    <!-- Información de la orden -->
    <div class="modal-section">
      <h3>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
        </svg>
        Información del Pedido
      </h3>
      <div class="info-grid-modal">
        <div class="info-item-modal">
          <span class="info-label-modal">Número de Orden</span>
          <span class="info-value-modal">#${orden.id}</span>
        </div>
        <div class="info-item-modal">
          <span class="info-label-modal">Comprobante</span>
          <span class="info-value-modal">${orden.numero_comprobante || '-'}</span>
        </div>
        <div class="info-item-modal">
          <span class="info-label-modal">Fecha</span>
          <span class="info-value-modal">${formatearFechaCompleta(orden.fecha)}</span>
        </div>
        <div class="info-item-modal">
          <span class="info-label-modal">Estado</span>
          <span class="pedido-estado ${orden.estado}">${orden.estado}</span>
        </div>
        <div class="info-item-modal">
          <span class="info-label-modal">Tipo de Entrega</span>
          <span class="info-value-modal">${orden.tipo_entrega === 'delivery' ? 'Delivery' : 'Recojo en tienda'}</span>
        </div>
        <div class="info-item-modal">
          <span class="info-label-modal">Método de Pago</span>
          <span class="info-value-modal">${orden.metodo_pago || '-'}</span>
        </div>
      </div>
      ${orden.direccion_entrega ? `
        <div class="info-item-modal" style="margin-top: 12px;">
          <span class="info-label-modal">Dirección de Entrega</span>
          <span class="info-value-modal">${orden.direccion_entrega}</span>
        </div>
      ` : ''}
      ${orden.referencia ? `
        <div class="info-item-modal" style="margin-top: 12px;">
          <span class="info-label-modal">Referencia</span>
          <span class="info-value-modal">${orden.referencia}</span>
        </div>
      ` : ''}
    </div>

    <!-- Productos del pedido -->
    <div class="modal-section">
      <h3>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <path d="M16 10a4 4 0 0 1-8 0"></path>
        </svg>
        Productos
      </h3>
      <div class="productos-list-modal">
        ${detalles.map(detalle => `
          <div class="producto-item-modal">
            <img src="${detalle.producto_imagen || 'img/default.jpg'}" alt="${detalle.producto_nombre}">
            <div class="producto-info-modal">
              <h4>${detalle.producto_nombre}</h4>
              <p>Cantidad: ${detalle.cantidad}</p>
            </div>
            <div class="producto-precio-modal">
              S/ ${parseFloat(detalle.subtotal).toFixed(2)}
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Resumen de pago -->
    <div class="modal-section">
      <h3>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="1" x2="12" y2="23"></line>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
        Resumen de Pago
      </h3>
      <div class="resumen-pago-modal">
        <div class="resumen-item">
          <span>Subtotal</span>
          <span>S/ ${parseFloat(orden.subtotal || 0).toFixed(2)}</span>
        </div>
        <div class="resumen-item">
          <span>IGV (18%)</span>
          <span>S/ ${parseFloat(orden.impuesto || 0).toFixed(2)}</span>
        </div>
        <div class="resumen-item total">
          <span>Total</span>
          <span>S/ ${parseFloat(orden.total).toFixed(2)}</span>
        </div>
      </div>
    </div>
  `;
}

function cerrarModal() {
  document.getElementById('modalOverlay').classList.remove('active');
  document.getElementById('modalPedido').classList.remove('active');
  document.body.style.overflow = '';
}

// Funciones de formato
function formatearFecha(fecha) {
  const date = new Date(fecha);
  return date.toLocaleDateString('es-PE', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

function formatearFechaCompleta(fecha) {
  const date = new Date(fecha);
  return date.toLocaleDateString('es-PE', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatearHora(fecha) {
  const date = new Date(fecha);
  return date.toLocaleTimeString('es-PE', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

function mostrarNotificacion(mensaje, tipo = 'info') {
  const notif = document.createElement('div');
  notif.className = `notification ${tipo}`;
  notif.textContent = mensaje;
  document.body.appendChild(notif);
  
  setTimeout(() => {
    notif.classList.add('hide');
    setTimeout(() => notif.remove(), 300);
  }, 3000);
}