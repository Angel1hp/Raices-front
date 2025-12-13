// admin/js/clientes.js
console.log('👥 Cargando clientes.js...');

let clientesData = [];

// =====================
// CARGAR CLIENTES
// =====================
async function cargarClientes() {
  const tbody = document.querySelector('#tableClientes tbody');
  
  if (!tbody) {
    console.error('❌ Tabla no encontrada');
    return;
  }

  try {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 40px;">
          ${mostrarLoading('Cargando clientes...')}
        </td>
      </tr>
    `;

    console.log('📡 Cargando clientes...');

    const response = await fetch('http://localhost:3000/api/clientes');
    
    if (!response.ok) {
      throw new Error('Error al cargar clientes');
    }

    clientesData = await response.json();
    
    console.log('✅ Clientes cargados:', clientesData.length);

    renderizarClientes(clientesData);
    actualizarEstadisticasClientes(clientesData);

  } catch (error) {
    console.error('❌ Error cargando clientes:', error);
    tbody.innerHTML = `
      <tr>
        <td colspan="8">
          ${mostrarError('Error al cargar clientes. Verifica que la ruta /api/clientes exista en el backend.')}
        </td>
      </tr>
    `;
    mostrarNotificacion('Error al cargar clientes', 'error');
  }
}

// =====================
// RENDERIZAR CLIENTES
// =====================
function renderizarClientes(clientes) {
  const tbody = document.querySelector('#tableClientes tbody');
  const totalClientesTextEl = document.getElementById('totalClientesText');
  
  if (!tbody) return;

  if (totalClientesTextEl) {
    totalClientesTextEl.textContent = `${clientes.length} clientes`;
  }

  if (clientes.length === 0) {
    tbody.innerHTML = mostrarVacio('No hay clientes registrados');
    return;
  }

  tbody.innerHTML = clientes.map(cliente => `
    <tr>
      <td><strong>#${cliente.id}</strong></td>
      <td>
        ${cliente.nombre} ${cliente.apellido}
        ${cliente.usuario ? `<br><small style="color: #999;">@${cliente.usuario}</small>` : ''}
      </td>
      <td>
        <a href="mailto:${cliente.email}" style="color: #af6d6d; text-decoration: none;">
          ${cliente.email}
        </a>
      </td>
      <td>
        ${cliente.telefono ? `
          <a href="tel:${cliente.telefono}" style="color: #718096; text-decoration: none;">
            ${cliente.telefono}
          </a>
        ` : '-'}
      </td>
      <td>
        <small style="color: #718096;">
          ${cliente.distrito || '-'}
          ${cliente.provincia ? `<br>${cliente.provincia}` : ''}
        </small>
      </td>
      <td>
        <small style="color: #718096;">
          ${formatearFecha(cliente.fecha_registro)}
        </small>
      </td>
      <td>
        <strong style="color: #af6d6d;">
          ${cliente.total_ordenes || 0}
        </strong>
      </td>
      <td>
        <div style="display: flex; gap: 4px;">
          <button 
            class="btn btn-sm btn-secondary" 
            onclick="verDetalleCliente(${cliente.id})"
            title="Ver detalle"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
          <button 
            class="btn btn-sm btn-secondary" 
            onclick="verOrdenesCliente(${cliente.id})"
            title="Ver órdenes"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// =====================
// ACTUALIZAR ESTADÍSTICAS
// =====================
function actualizarEstadisticasClientes(clientes) {
  const totalClientesEl = document.getElementById('totalClientes');
  const nuevosEsteMesEl = document.getElementById('nuevosEsteMes');
  const clientesActivosEl = document.getElementById('clientesActivos');
  const promedioComprasEl = document.getElementById('promedioCompras');

  // Total clientes
  if (totalClientesEl) {
    totalClientesEl.textContent = clientes.length;
  }

  // Nuevos este mes
  if (nuevosEsteMesEl) {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const nuevos = clientes.filter(c => {
      const fechaReg = new Date(c.fecha_registro);
      return fechaReg >= inicioMes;
    });
    nuevosEsteMesEl.textContent = nuevos.length;
  }

  // Clientes activos (que tienen al menos 1 orden)
  if (clientesActivosEl) {
    const activos = clientes.filter(c => (c.total_ordenes || 0) > 0);
    clientesActivosEl.textContent = activos.length;
  }

  // Promedio de compras
  if (promedioComprasEl) {
    const totalOrdenes = clientes.reduce((sum, c) => sum + (c.total_ordenes || 0), 0);
    const promedio = clientes.length > 0 ? (totalOrdenes / clientes.length).toFixed(1) : 0;
    promedioComprasEl.textContent = promedio;
  }
}

// =====================
// FILTRAR CLIENTES
// =====================
function filtrarClientes() {
  const searchTerm = document.getElementById('searchCliente')?.value.toLowerCase() || '';

  let filtrados = clientesData;

  if (searchTerm) {
    filtrados = filtrados.filter(cliente => 
      cliente.nombre?.toLowerCase().includes(searchTerm) ||
      cliente.apellido?.toLowerCase().includes(searchTerm) ||
      cliente.email?.toLowerCase().includes(searchTerm) ||
      cliente.telefono?.includes(searchTerm) ||
      cliente.usuario?.toLowerCase().includes(searchTerm)
    );
  }

  renderizarClientes(filtrados);
}

// =====================
// ORDENAR CLIENTES
// =====================
function ordenarClientes() {
  const sortBy = document.getElementById('sortClientes')?.value || 'fecha_desc';

  let ordenados = [...clientesData];

  switch(sortBy) {
    case 'fecha_desc':
      ordenados.sort((a, b) => new Date(b.fecha_registro) - new Date(a.fecha_registro));
      break;
    case 'fecha_asc':
      ordenados.sort((a, b) => new Date(a.fecha_registro) - new Date(b.fecha_registro));
      break;
    case 'nombre_asc':
      ordenados.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
      break;
    case 'nombre_desc':
      ordenados.sort((a, b) => (b.nombre || '').localeCompare(a.nombre || ''));
      break;
    case 'ordenes_desc':
      ordenados.sort((a, b) => (b.total_ordenes || 0) - (a.total_ordenes || 0));
      break;
  }

  renderizarClientes(ordenados);
}

// =====================
// VER DETALLE CLIENTE
// =====================
async function verDetalleCliente(id) {
  try {
    console.log('🔍 Ver detalle de cliente:', id);

    const response = await fetch(`http://localhost:3000/api/auth/cliente/${id}`);
    
    if (!response.ok) {
      throw new Error('Error al cargar cliente');
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Error al cargar cliente');
    }

    const cliente = data.cliente;

    const contenido = `
      <div style="display: grid; gap: 12px;">
        <div style="display: grid; grid-template-columns: 120px 1fr; gap: 8px; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
          <strong>ID:</strong>
          <span>#${cliente.id}</span>
        </div>
        <div style="display: grid; grid-template-columns: 120px 1fr; gap: 8px; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
          <strong>Nombre:</strong>
          <span>${cliente.nombre} ${cliente.apellido}</span>
        </div>
        <div style="display: grid; grid-template-columns: 120px 1fr; gap: 8px; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
          <strong>Usuario:</strong>
          <span>${cliente.usuario}</span>
        </div>
        <div style="display: grid; grid-template-columns: 120px 1fr; gap: 8px; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
          <strong>Email:</strong>
          <span>${cliente.email}</span>
        </div>
        <div style="display: grid; grid-template-columns: 120px 1fr; gap: 8px; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
          <strong>Teléfono:</strong>
          <span>${cliente.telefono || '-'}</span>
        </div>
        <div style="display: grid; grid-template-columns: 120px 1fr; gap: 8px; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
          <strong>Dirección:</strong>
          <span>${cliente.direccion || '-'}</span>
        </div>
        <div style="display: grid; grid-template-columns: 120px 1fr; gap: 8px; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
          <strong>Ubicación:</strong>
          <span>
            ${cliente.distrito || '-'}
            ${cliente.provincia ? `, ${cliente.provincia}` : ''}
            ${cliente.departamento ? `, ${cliente.departamento}` : ''}
          </span>
        </div>
        <div style="display: grid; grid-template-columns: 120px 1fr; gap: 8px; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
          <strong>Documento:</strong>
          <span>${cliente.numero_documento || '-'}</span>
        </div>
        ${cliente.ruc ? `
          <div style="display: grid; grid-template-columns: 120px 1fr; gap: 8px; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
            <strong>RUC:</strong>
            <span>${cliente.ruc}</span>
          </div>
        ` : ''}
        <div style="display: grid; grid-template-columns: 120px 1fr; gap: 8px; padding: 8px 0;">
          <strong>Registro:</strong>
          <span>${formatearFechaHora(cliente.fecha_registro)}</span>
        </div>
      </div>
    `;

    mostrarModal(`Cliente: ${cliente.nombre} ${cliente.apellido}`, contenido, [
      {
        texto: 'Ver Órdenes',
        class: 'btn-primary',
        onclick: `verOrdenesCliente(${id})`
      }
    ]);

  } catch (error) {
    console.error('❌ Error al ver detalle:', error);
    mostrarNotificacion('Error al cargar detalle del cliente', 'error');
  }
}

// =====================
// VER ÓRDENES DEL CLIENTE
// =====================
async function verOrdenesCliente(clienteId) {
  try {
    console.log('📋 Ver órdenes del cliente:', clienteId);

    const response = await fetch(`http://localhost:3000/api/checkout/ordenes/${clienteId}`);
    
    if (!response.ok) {
      throw new Error('Error al cargar órdenes');
    }

    const ordenes = await response.json();

    if (ordenes.length === 0) {
      mostrarModal('Órdenes del Cliente', '<p style="text-align: center; padding: 40px; color: #999;">Este cliente aún no ha realizado compras.</p>');
      return;
    }

    const contenido = `
      <div style="max-height: 400px; overflow-y: auto;">
        <table style="width: 100%; font-size: 14px;">
          <thead style="position: sticky; top: 0; background: white;">
            <tr style="background: #f7fafc;">
              <th style="padding: 8px; text-align: left;">ID</th>
              <th style="padding: 8px; text-align: left;">Fecha</th>
              <th style="padding: 8px; text-align: right;">Total</th>
              <th style="padding: 8px; text-align: center;">Estado</th>
            </tr>
          </thead>
          <tbody>
            ${ordenes.map(orden => `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 8px;"><strong>#${orden.id}</strong></td>
                <td style="padding: 8px;">${formatearFecha(orden.fecha)}</td>
                <td style="padding: 8px; text-align: right;"><strong>${formatearMoneda(orden.total)}</strong></td>
                <td style="padding: 8px; text-align: center;">${obtenerBadgeEstado(orden.estado)}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr style="background: #f7fafc; font-weight: bold;">
              <td colspan="2" style="padding: 12px;">TOTAL (${ordenes.length} órdenes):</td>
              <td style="padding: 12px; text-align: right; color: #af6d6d;">
                ${formatearMoneda(ordenes.reduce((sum, o) => sum + parseFloat(o.total), 0))}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    `;

    mostrarModal('Órdenes del Cliente', contenido);

  } catch (error) {
    console.error('❌ Error al ver órdenes:', error);
    mostrarNotificacion('Error al cargar órdenes del cliente', 'error');
  }
}

// =====================
// EXPORTAR CLIENTES
// =====================
function exportarClientes() {
  mostrarNotificacion('Función de exportación en desarrollo', 'info');
  // TODO: Implementar exportación a CSV/Excel
}

// =====================
// INICIALIZAR
// =====================
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Inicializando clientes...');
  cargarClientes();
});

// Hacer funciones globales
window.filtrarClientes = filtrarClientes;
window.ordenarClientes = ordenarClientes;
window.verDetalleCliente = verDetalleCliente;
window.verOrdenesCliente = verOrdenesCliente;
window.exportarClientes = exportarClientes;

console.log('✅ clientes.js cargado');