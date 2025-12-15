// admin/js/reportes.js
console.log('📊 Cargando reportes.js...');

// =====================
// CARGAR ESTADÍSTICAS
// =====================
async function cargarEstadisticas() {
  const periodo = document.getElementById('periodoReporte')?.value || 'mes';
  
  try {
    // Cargar datos del dashboard
    const response = await fetch('https://raices-back.onrender.com/api/admin/dashboard', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      }
    });

    if (!response.ok) throw new Error('Error al cargar datos');

    const data = await response.json();
    const stats = data.data;

    // Actualizar tarjetas de resumen
    document.getElementById('totalOrdenes').textContent = stats.total_ordenes || 0;
    document.getElementById('ingresosTotales').textContent = formatearMoneda(parseFloat(stats.ingresos_totales) || 0);
    document.getElementById('ticketPromedio').textContent = formatearMoneda(parseFloat(stats.ticket_promedio) || 0);
    document.getElementById('clientesActivos').textContent = stats.total_clientes || 0;

    // Cargar datos adicionales
    await cargarProductosPopulares(periodo);
    await cargarVentasPorCategoria(periodo);
    await cargarHorariosPico(periodo);

    console.log('✅ Estadísticas cargadas');

  } catch (error) {
    console.error('❌ Error cargando estadísticas:', error);
    mostrarNotificacion('Error al cargar estadísticas', 'error');
  }
}

// =====================
// PRODUCTOS MÁS VENDIDOS
// =====================
async function cargarProductosPopulares(periodo) {
  const container = document.getElementById('productosPopulares');
  
  try {
    // Por ahora usamos datos de ejemplo
    // TODO: Crear endpoint en el backend para obtener productos más vendidos
    const productosEjemplo = [
      { nombre: 'Ceviche de Pescado', cantidad: 45, ingresos: 1125 },
      { nombre: 'Lomo Saltado', cantidad: 38, ingresos: 1140 },
      { nombre: 'Aji de Gallina', cantidad: 32, ingresos: 800 },
      { nombre: 'Causa Rellena', cantidad: 28, ingresos: 560 },
      { nombre: 'Arroz con Pollo', cantidad: 25, ingresos: 625 }
    ];

    if (productosEjemplo.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #999;">
          No hay datos disponibles para este período
        </div>
      `;
      return;
    }

    container.innerHTML = productosEjemplo.map((producto, index) => `
      <div class="producto-popular">
        <div class="producto-rank">${index + 1}</div>
        <div class="producto-info">
          <div class="producto-nombre">${producto.nombre}</div>
          <div class="producto-stats">
            ${producto.cantidad} unidades vendidas • ${formatearMoneda(producto.ingresos)} en ventas
          </div>
        </div>
        <div style="font-size: 24px; font-weight: 700; color: #48bb78;">
          ${formatearMoneda(producto.ingresos)}
        </div>
      </div>
    `).join('');

  } catch (error) {
    console.error('❌ Error:', error);
    container.innerHTML = `
      <div style="text-align: center; padding: 40px; color: #ef4444;">
        Error al cargar datos
      </div>
    `;
  }
}

// =====================
// VENTAS POR CATEGORÍA
// =====================
async function cargarVentasPorCategoria(periodo) {
  const container = document.getElementById('ventasPorCategoria');
  
  try {
    // Datos de ejemplo
    // TODO: Crear endpoint en el backend
    const categorias = [
      { nombre: 'Platos de Fondo', ventas: 4500, porcentaje: 35 },
      { nombre: 'Entradas', ventas: 3200, porcentaje: 25 },
      { nombre: 'Bebidas', ventas: 2600, porcentaje: 20 },
      { nombre: 'Postres', ventas: 1800, porcentaje: 14 },
      { nombre: 'Promociones', ventas: 780, porcentaje: 6 }
    ];

    const maxVentas = Math.max(...categorias.map(c => c.ventas));

    container.innerHTML = categorias.map(cat => `
      <div class="categoria-bar">
        <div class="categoria-nombre">${cat.nombre}</div>
        <div class="categoria-progress">
          <div class="categoria-fill" style="width: ${(cat.ventas / maxVentas * 100)}%">
            ${cat.porcentaje}%
          </div>
        </div>
        <div class="categoria-monto">${formatearMoneda(cat.ventas)}</div>
      </div>
    `).join('');

  } catch (error) {
    console.error('❌ Error:', error);
    container.innerHTML = `
      <div style="text-align: center; padding: 40px; color: #ef4444;">
        Error al cargar datos
      </div>
    `;
  }
}

// =====================
// HORARIOS PICO
// =====================
async function cargarHorariosPico(periodo) {
  const container = document.getElementById('horariosPico');
  
  try {
    // Datos de ejemplo
    // TODO: Crear endpoint en el backend
    const horarios = [
      { hora: '12:00 - 13:00', ordenes: 45 },
      { hora: '13:00 - 14:00', ordenes: 62 },
      { hora: '14:00 - 15:00', ordenes: 38 },
      { hora: '19:00 - 20:00', ordenes: 52 },
      { hora: '20:00 - 21:00', ordenes: 48 },
      { hora: '21:00 - 22:00', ordenes: 28 }
    ];

    const maxOrdenes = Math.max(...horarios.map(h => h.ordenes));

    container.innerHTML = horarios.map(h => `
      <div class="horario-item">
        <div class="horario-hora">${h.hora}</div>
        <div class="horario-bar">
          <div class="horario-fill" style="width: ${(h.ordenes / maxOrdenes * 100)}%"></div>
        </div>
        <div class="horario-cantidad">${h.ordenes} órdenes</div>
      </div>
    `).join('');

  } catch (error) {
    console.error('❌ Error:', error);
    container.innerHTML = `
      <div style="text-align: center; padding: 40px; color: #ef4444;">
        Error al cargar datos
      </div>
    `;
  }
}

// =====================
// INICIALIZAR
// =====================
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Inicializando reportes...');
  cargarEstadisticas();
});

console.log('✅ reportes.js cargado');