// admin/js/ordenes.js
console.log('📋 Cargando ordenes.js...');

let ordenesData = [];

// =====================
// CARGAR ÓRDENES
// =====================
async function cargarOrdenes() {
  const tbody = document.querySelector('#tableOrdenes tbody');
  
  if (!tbody) {
    console.error('❌ Tabla no encontrada');
    return;
  }

  try {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 40px;">
          ${mostrarLoading('Cargando órdenes...')}
        </td>
      </tr>
    `;

    console.log('📡 Cargando órdenes...');

    const response = await fetch('http://localhost:3000/api/checkout/ordenes/todas');
    
    if (!response.ok) {
      throw new Error('Error al cargar órdenes');
    }

    ordenesData = await response.json();
    
    console.log('✅ Órdenes cargadas:', ordenesData.length);

    renderizarOrdenes(ordenesData);
    actualizarEstadisticasOrdenes(ordenesData);

  } catch (error) {
    console.error('❌ Error cargando órdenes:', error);
    tbody.innerHTML = `
      <tr>
        <td colspan="8">
          ${mostrarError('Error al cargar órdenes')}
        </td>
      </tr>
    `;
    mostrarNotificacion('Error al cargar órdenes', 'error');
  }
}

// =====================
// RENDERIZAR ÓRDENES
// =====================
function renderizarOrdenes(ordenes) {
  const tbody = document.querySelector('#tableOrdenes tbody');
  const totalOrdenesEl = document.getElementById('totalOrdenes');
  
  if (!tbody) return;

  if (totalOrdenesEl) {
    totalOrdenesEl.textContent = `${ordenes.length} órdenes`;
  }

  if (ordenes.length === 0) {
    tbody.innerHTML = mostrarVacio('No hay órdenes registradas');
    return;
  }

  tbody.innerHTML = ordenes.map(orden => `
    <tr>
      <td><strong>#${orden.id}</strong></td>
      <td>${formatearFechaHora(orden.fecha)}</td>
      <td>
        ${orden.cliente_nombre || 'Cliente'}
        ${orden.cliente_email ? `<br><small style="color: #999;">${orden.cliente_email}</small>` : ''}
      </td>
      <td>
        <span style="font-size: 12px; color: #718096;">
          ${orden.tipo_entrega === 'delivery' ? '🚚 Delivery' : '🏪 Recojo'}
        </span>
      </td>
      <td><strong>${formatearMoneda(orden.total)}</strong></td>
      <td>${obtenerBadgeEstado(orden.estado)}</td>
      <td>
        <small style="color: #718096;">
          ${orden.numero_comprobante || '-'}
        </small>
      </td>
      <td>
        <div style="display: flex; gap: 4px;">
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
          ${orden.estado === 'pendiente' ? `
            <button 
              class="btn btn-sm" 
              style="background: #3b82f6; color: white;"
              onclick="cambiarEstadoOrden(${orden.id}, 'en_proceso')"
              title="Marcar en proceso"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </button>
          ` : ''}
          ${orden.estado === 'en_proceso' ? `
            <button 
              class="btn btn-sm" 
              style="background: #10b981; color: white;"
              onclick="cambiarEstadoOrden(${orden.id}, 'completado')"
              title="Marcar completada"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </button>
          ` : ''}
          ${orden.estado !== 'cancelado' && orden.estado !== 'completado' ? `
            <button 
              class="btn btn-sm" 
              style="background: #ef4444; color: white;"
              onclick="cambiarEstadoOrden(${orden.id}, 'cancelado')"
              title="Cancelar"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          ` : ''}
        </div>
      </td>
    </tr>
  `).join('');
}

// =====================
// ACTUALIZAR ESTADÍSTICAS
// =====================
function actualizarEstadisticasOrdenes(ordenes) {
  const hoy = new Date().toDateString();
  
  const ordenesHoy = ordenes.filter(o => new Date(o.fecha).toDateString() === hoy);
  const pendientes = ordenes.filter(o => o.estado === 'pendiente');
  const enProceso = ordenes.filter(o => o.estado === 'en_proceso');
  const completadas = ordenes.filter(o => o.estado === 'completado');

  const totalOrdenesHoyEl = document.getElementById('totalOrdenesHoy');
  const totalPendientesEl = document.getElementById('totalPendientes');
  const totalEnProcesoEl = document.getElementById('totalEnProceso');
  const totalCompletadasEl = document.getElementById('totalCompletadas');

  if (totalOrdenesHoyEl) totalOrdenesHoyEl.textContent = ordenesHoy.length;
  if (totalPendientesEl) totalPendientesEl.textContent = pendientes.length;
  if (totalEnProcesoEl) totalEnProcesoEl.textContent = enProceso.length;
  if (totalCompletadasEl) totalCompletadasEl.textContent = completadas.length;

  // Actualizar badge del sidebar
  const badgeEl = document.getElementById('ordenesPendientes');
  if (badgeEl) {
    badgeEl.textContent = pendientes.length;
    badgeEl.style.display = pendientes.length > 0 ? 'flex' : 'none';
  }
}

// =====================
// FILTRAR ÓRDENES
// =====================
function filtrarOrdenes() {
  const searchTerm = document.getElementById('searchOrden')?.value.toLowerCase() || '';
  const estadoFilter = document.getElementById('filterEstado')?.value || '';
  const fechaFilter = document.getElementById('filterFecha')?.value || '';

  let filtradas = ordenesData;

  // Filtrar por búsqueda
  if (searchTerm) {
    filtradas = filtradas.filter(orden => 
      orden.id?.toString().includes(searchTerm) ||
      orden.cliente_nombre?.toLowerCase().includes(searchTerm) ||
      orden.numero_comprobante?.toLowerCase().includes(searchTerm)
    );
  }

  // Filtrar por estado
  if (estadoFilter) {
    filtradas = filtradas.filter(orden => orden.estado === estadoFilter);
  }

  // Filtrar por fecha
  if (fechaFilter) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    filtradas = filtradas.filter(orden => {
      const fechaOrden = new Date(orden.fecha);
      fechaOrden.setHours(0, 0, 0, 0);

      switch(fechaFilter) {
        case 'hoy':
          return fechaOrden.getTime() === hoy.getTime();
        case 'ayer':
          const ayer = new Date(hoy);
          ayer.setDate(ayer.getDate() - 1);
          return fechaOrden.getTime() === ayer.getTime();
        case 'semana':
          const semanaAtras = new Date(hoy);
          semanaAtras.setDate(semanaAtras.getDate() - 7);
          return fechaOrden >= semanaAtras;
        case 'mes':
          const mesAtras = new Date(hoy);
          mesAtras.setMonth(mesAtras.getMonth() - 1);
          return fechaOrden >= mesAtras;
        default:
          return true;
      }
    });
  }

  renderizarOrdenes(filtradas);
}

// =====================
// VER DETALLE ORDEN (reutiliza la del dashboard)
// =====================
async function verDetalleOrden(ordenId) {
  try {
    console.log('🔍 Ver detalle de orden:', ordenId);

    const response = await fetch(`http://localhost:3000/api/checkout/orden/${ordenId}`);
    
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
            ${orden.cliente_email ? `<br><small style="color: #999;">${orden.cliente_email}</small>` : ''}
          </div>
          <div>
            <strong>Fecha:</strong><br>
            ${formatearFechaHora(orden.fecha)}
          </div>
          <div>
            <strong>Tipo de entrega:</strong><br>
            ${orden.tipo_entrega === 'delivery' ? '🚚 Delivery' : '🏪 Recojo'}
          </div>
          <div>
            <strong>Estado:</strong><br>
            ${obtenerBadgeEstado(orden.estado)}
          </div>
        </div>
        
        ${orden.tipo_entrega === 'delivery' ? `
          <div style="margin-bottom: 16px; padding: 12px; background: #f7fafc; border-radius: 8px;">
            <strong>Dirección de entrega:</strong><br>
            ${orden.direccion_entrega || '-'}
            ${orden.referencia ? `<br><small style="color: #999;">${orden.referencia}</small>` : ''}
            <br><strong>Hora:</strong> ${orden.hora_entrega || '-'}
          </div>
        ` : ''}

        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e2e8f0;">

        <strong>Productos:</strong>
        <table style="width: 100%; margin-top: 12px; font-size: 14px;">
          <thead>
            <tr style="background: #f7fafc;">
              <th style="padding: 8px; text-align: left;">Producto</th>
              <th style="padding: 8px; text-align: center;">Cant.</th>
              <th style="padding: 8px; text-align: right;">Precio Unit.</th>
              <th style="padding: 8px; text-align: right;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${detalles.map(item => `
              <tr>
                <td style="padding: 8px;">${item.producto_nombre || 'Producto'}</td>
                <td style="padding: 8px; text-align: center;">${item.cantidad}</td>
                <td style="padding: 8px; text-align: right;">${formatearMoneda(parseFloat(item.subtotal) / item.cantidad)}</td>
                <td style="padding: 8px; text-align: right;">${formatearMoneda(item.subtotal)}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr style="font-weight: bold; background: #f7fafc;">
              <td colspan="3" style="padding: 12px;">TOTAL:</td>
              <td style="padding: 12px; text-align: right; font-size: 18px; color: #af6d6d;">${formatearMoneda(orden.total)}</td>
            </tr>
          </tfoot>
        </table>

        ${orden.numero_comprobante ? `
          <div style="margin-top: 16px; padding: 12px; background: #f0f9ff; border-radius: 8px;">
            <strong>Comprobante:</strong> ${orden.numero_comprobante}<br>
            <strong>Tipo:</strong> ${orden.tipo_comprobante === 'factura' ? 'Factura' : 'Boleta'}
            ${orden.ruc ? `<br><strong>RUC:</strong> ${orden.ruc}` : ''}
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
// CAMBIAR ESTADO ORDEN
// =====================
async function cambiarEstadoOrden(ordenId, nuevoEstado) {
  const mensajes = {
    'en_proceso': '¿Marcar orden como En Proceso?',
    'completado': '¿Marcar orden como Completada?',
    'cancelado': '¿Cancelar esta orden?'
  };

  if (!confirm(mensajes[nuevoEstado] || '¿Cambiar estado?')) {
    return;
  }

  try {
    // Nota: Esta ruta necesita ser implementada en el backend
    const response = await fetch(`http://localhost:3000/api/checkout/orden/${ordenId}/estado`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ estado: nuevoEstado })
    });

    if (!response.ok) {
      throw new Error('Error al actualizar estado');
    }

    mostrarNotificacion('Estado actualizado correctamente', 'success');
    cargarOrdenes();

  } catch (error) {
    console.error('❌ Error:', error);
    mostrarNotificacion('Error al actualizar estado. Verifica que la ruta PUT exista en el backend.', 'error');
  }
}

// =====================
// INICIALIZAR
// =====================
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Inicializando órdenes...');
  cargarOrdenes();
  
  // Actualizar cada 30 segundos
  setInterval(cargarOrdenes, 30000);
});

// Hacer funciones globales
window.cargarOrdenes = cargarOrdenes;
window.filtrarOrdenes = filtrarOrdenes;
window.verDetalleOrden = verDetalleOrden;
window.cambiarEstadoOrden = cambiarEstadoOrden;

console.log('✅ ordenes.js cargado');