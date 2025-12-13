// admin/js/dashboard.js
console.log('📊 Cargando dashboard...');

// =====================
// CARGAR ESTADÍSTICAS DEL DASHBOARD
// =====================
async function cargarDashboard() {
  try {
    console.log('📡 Cargando estadísticas...');

    const response = await fetchConAuth(`${API_URL}/dashboard`);
    
    if (!response.ok) {
      throw new Error('Error al cargar dashboard');
    }

    const result = await response.json();
    
    if (result.success) {
      actualizarEstadisticas(result.data);
      console.log('✅ Dashboard cargado:', result.data);
    } else {
      throw new Error(result.message || 'Error al cargar dashboard');
    }

  } catch (error) {
    console.error('❌ Error cargando dashboard:', error);
    mostrarNotificacion('Error al cargar estadísticas', 'error');
  }
}

// =====================
// ACTUALIZAR CARDS DE ESTADÍSTICAS
// =====================
function actualizarEstadisticas(data) {
  // Ventas hoy
  const ventasHoyEl = document.getElementById('ventasHoy');
  if (ventasHoyEl) {
    ventasHoyEl.textContent = formatearMoneda(data.ventas_hoy);
  }

  // Órdenes hoy
  const ordenesHoyEl = document.getElementById('ordenesHoy');
  if (ordenesHoyEl) {
    ordenesHoyEl.textContent = data.ordenes_hoy || 0;
  }

  // Órdenes pendientes
  const ordenesPendientesEl = document.getElementById('ordenesPendientesNum');
  if (ordenesPendientesEl) {
    ordenesPendientesEl.textContent = data.ordenes_pendientes || 0;
  }

  // Badge en menú lateral
  const badgeEl = document.getElementById('ordenesPendientes');
  if (badgeEl) {
    const pendientes = data.ordenes_pendientes || 0;
    badgeEl.textContent = pendientes;
    badgeEl.style.display = pendientes > 0 ? 'flex' : 'none';
  }

  // Clientes totales
  const clientesTotalEl = document.getElementById('clientesTotal');
  if (clientesTotalEl) {
    clientesTotalEl.textContent = data.total_clientes || 0;
  }

  console.log('✅ Estadísticas actualizadas');
}

// =====================
// CARGAR ÓRDENES RECIENTES
// =====================
async function cargarOrdenesRecientes() {
  const tbody = document.querySelector('#tableOrdenes tbody');
  
  if (!tbody) {
    console.warn('⚠️ Tabla de órdenes no encontrada');
    return;
  }

  try {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 40px;">
          ${mostrarLoading('Cargando órdenes...')}
        </td>
      </tr>
    `;

    console.log('📡 Cargando órdenes recientes...');

    const response = await fetchConAuth('http://localhost:3000/api/checkout/ordenes/recientes?limit=10');
    
    if (!response.ok) {
      throw new Error('Error al cargar órdenes');
    }

    const ordenes = await response.json();
    
    console.log('✅ Órdenes recibidas:', ordenes);

    if (!ordenes || ordenes.length === 0) {
      tbody.innerHTML = mostrarVacio('No hay órdenes registradas');
      return;
    }

    tbody.innerHTML = ordenes.map(orden => `
      <tr>
        <td><strong>#${orden.id}</strong></td>
        <td>${orden.cliente_nombre || 'Cliente'}</td>
        <td>${formatearFechaHora(orden.fecha)}</td>
        <td><strong>${formatearMoneda(orden.total)}</strong></td>
        <td>${obtenerBadgeEstado(orden.estado)}</td>
        <td>
          <button 
            class="btn btn-sm btn-secondary" 
            onclick="verDetalleOrden(${orden.id})"
            title="Ver detalle"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
        </td>
      </tr>
    `).join('');

  } catch (error) {
    console.error('❌ Error cargando órdenes:', error);
    tbody.innerHTML = `
      <tr>
        <td colspan="6">
          ${mostrarError('Error al cargar órdenes recientes')}
        </td>
      </tr>
    `;
  }
}

// =====================
// VER DETALLE DE ORDEN
// =====================
async function verDetalleOrden(ordenId) {
  try {
    console.log('🔍 Ver detalle de orden:', ordenId);

    const response = await fetchConAuth(`http://localhost:3000/api/checkout/orden/${ordenId}`);
    
    if (!response.ok) {
      throw new Error('Error al cargar detalle');
    }

    const data = await response.json();
    
    const { orden, detalles } = data;

    const contenido = `
      <div style="margin-bottom: 20px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
          <div>
            <strong>Cliente:</strong><br>
            ${orden.cliente_nombre}
          </div>
          <div>
            <strong>Fecha:</strong><br>
            ${formatearFechaHora(orden.fecha)}
          </div>
          <div>
            <strong>Tipo de entrega:</strong><br>
            ${orden.tipo_entrega || 'Delivery'}
          </div>
          <div>
            <strong>Estado:</strong><br>
            ${obtenerBadgeEstado(orden.estado)}
          </div>
        </div>
        
        <div style="margin-bottom: 16px;">
          <strong>Dirección de entrega:</strong><br>
          ${orden.direccion_entrega || '-'}
          ${orden.referencia ? `<br><small style="color: #999;">${orden.referencia}</small>` : ''}
        </div>
        
        <div style="margin-bottom: 16px;">
          <strong>Hora de entrega:</strong><br>
          ${orden.hora_entrega || '-'}
        </div>

        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e2e8f0;">

        <strong>Productos:</strong>
        <table style="width: 100%; margin-top: 12px; font-size: 14px;">
          <thead>
            <tr style="background: #f7fafc;">
              <th style="padding: 8px; text-align: left;">Producto</th>
              <th style="padding: 8px; text-align: center;">Cant.</th>
              <th style="padding: 8px; text-align: right;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${detalles.map(item => `
              <tr>
                <td style="padding: 8px;">${item.producto_nombre || 'Producto'}</td>
                <td style="padding: 8px; text-align: center;">${item.cantidad}</td>
                <td style="padding: 8px; text-align: right;">${formatearMoneda(item.subtotal)}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr style="font-weight: bold; background: #f7fafc;">
              <td colspan="2" style="padding: 12px;">TOTAL:</td>
              <td style="padding: 12px; text-align: right;">${formatearMoneda(orden.total)}</td>
            </tr>
          </tfoot>
        </table>

        ${orden.numero_comprobante ? `
          <div style="margin-top: 16px; padding: 12px; background: #f0f9ff; border-radius: 8px;">
            <strong>Comprobante:</strong> ${orden.numero_comprobante}<br>
            <strong>Tipo:</strong> ${orden.tipo_comprobante === 'factura' ? 'Factura' : 'Boleta'}
          </div>
        ` : ''}
      </div>
    `;

    mostrarModal(`Orden #${ordenId}`, contenido);

  } catch (error) {
    console.error('❌ Error al ver detalle:', error);
    mostrarNotificacion('Error al cargar detalle de la orden', 'error');
  }
}

// =====================
// ACTUALIZAR DASHBOARD PERIÓDICAMENTE
// =====================
function iniciarActualizacionAutomatica() {
  // Actualizar cada 30 segundos
  setInterval(() => {
    console.log('🔄 Actualizando dashboard automáticamente...');
    cargarDashboard();
  }, 30000);
}

// =====================
// INICIALIZAR DASHBOARD
// =====================
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Inicializando dashboard...');
  
  // Cargar datos
  await cargarDashboard();
  await cargarOrdenesRecientes();
  
  // Iniciar actualización automática
  iniciarActualizacionAutomatica();
  
  console.log('✅ Dashboard inicializado correctamente');
});

// Hacer función global para el onclick
window.verDetalleOrden = verDetalleOrden;

console.log('✅ dashboard.js cargado');