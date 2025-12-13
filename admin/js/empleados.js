// admin/js/empleados.js
console.log('👥 Cargando empleados.js...');

let empleadosData = [];

// =====================
// CARGAR EMPLEADOS
// =====================
async function cargarEmpleados() {
  const tbody = document.querySelector('#tableEmpleados tbody');
  
  if (!tbody) {
    console.error('❌ Tabla no encontrada');
    return;
  }

  try {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 40px;">
          ${mostrarLoading('Cargando empleados...')}
        </td>
      </tr>
    `;

    console.log('📡 Cargando empleados...');

    const response = await fetchConAuth(`${API_URL}/empleados`);
    
    if (!response.ok) {
      throw new Error('Error al cargar empleados');
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Error al cargar empleados');
    }

    empleadosData = result.empleados;
    
    console.log('✅ Empleados cargados:', empleadosData.length);

    renderizarEmpleados(empleadosData);

  } catch (error) {
    console.error('❌ Error cargando empleados:', error);
    tbody.innerHTML = `
      <tr>
        <td colspan="8">
          ${mostrarError('Error al cargar empleados')}
        </td>
      </tr>
    `;
    mostrarNotificacion('Error al cargar empleados', 'error');
  }
}

// =====================
// RENDERIZAR EMPLEADOS
// =====================
function renderizarEmpleados(empleados) {
  const tbody = document.querySelector('#tableEmpleados tbody');
  
  if (!tbody) return;

  if (empleados.length === 0) {
    tbody.innerHTML = mostrarVacio('No se encontraron empleados');
    return;
  }

  tbody.innerHTML = empleados.map(emp => `
    <tr>
      <td><strong>#${emp.id}</strong></td>
      <td>${emp.nombre} ${emp.apellido}</td>
      <td>${emp.usuario}</td>
      <td>${emp.email || '-'}</td>
      <td>
        <span style="
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          background: ${obtenerColorRol(emp.rol)};
          color: white;
        ">
          ${formatearRol(emp.rol)}
        </span>
      </td>
      <td>${emp.puesto || '-'}</td>
      <td>${obtenerBadgeEstado(emp.activo ? 'activo' : 'inactivo')}</td>
      <td>
        <div style="display: flex; gap: 4px;">
          <button 
            class="btn btn-sm btn-secondary" 
            onclick="verDetalleEmpleado(${emp.id})"
            title="Ver detalle"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
          <button 
            class="btn btn-sm btn-secondary" 
            onclick="editarEmpleado(${emp.id})"
            title="Editar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          ${emp.activo ? `
            <button 
              class="btn btn-sm" 
              style="background: #fee; color: #c33;"
              onclick="desactivarEmpleado(${emp.id})"
              title="Desactivar"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </button>
          ` : `
            <button 
              class="btn btn-sm" 
              style="background: #efe; color: #3c3;"
              onclick="activarEmpleado(${emp.id})"
              title="Activar"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </button>
          `}
        </div>
      </td>
    </tr>
  `).join('');
}

// =====================
// FILTRAR EMPLEADOS
// =====================
function filtrarEmpleados() {
  const searchTerm = document.getElementById('searchEmpleado')?.value.toLowerCase() || '';
  const rolFilter = document.getElementById('filterRol')?.value || '';
  const estadoFilter = document.getElementById('filterEstado')?.value || '';

  let filtrados = empleadosData;

  // Filtrar por búsqueda
  if (searchTerm) {
    filtrados = filtrados.filter(emp => 
      emp.nombre?.toLowerCase().includes(searchTerm) ||
      emp.apellido?.toLowerCase().includes(searchTerm) ||
      emp.usuario?.toLowerCase().includes(searchTerm) ||
      emp.email?.toLowerCase().includes(searchTerm)
    );
  }

  // Filtrar por rol
  if (rolFilter) {
    filtrados = filtrados.filter(emp => emp.rol === rolFilter);
  }

  // Filtrar por estado
  if (estadoFilter !== '') {
    const activo = estadoFilter === 'true';
    filtrados = filtrados.filter(emp => emp.activo === activo);
  }

  renderizarEmpleados(filtrados);
}

// =====================
// MODAL NUEVO EMPLEADO
// =====================
function abrirModalNuevoEmpleado() {
  const contenido = `
    <form id="formNuevoEmpleado" style="display: grid; gap: 16px;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <div>
          <label style="display: block; margin-bottom: 4px; font-weight: 600; font-size: 14px;">Nombre *</label>
          <input type="text" id="nombre" required style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 8px;">
        </div>
        <div>
          <label style="display: block; margin-bottom: 4px; font-weight: 600; font-size: 14px;">Apellido *</label>
          <input type="text" id="apellido" required style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 8px;">
        </div>
      </div>
      
      <div>
        <label style="display: block; margin-bottom: 4px; font-weight: 600; font-size: 14px;">Email *</label>
        <input type="email" id="email" required style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 8px;">
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <div>
          <label style="display: block; margin-bottom: 4px; font-weight: 600; font-size: 14px;">Usuario *</label>
          <input type="text" id="usuario" required style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 8px;">
        </div>
        <div>
          <label style="display: block; margin-bottom: 4px; font-weight: 600; font-size: 14px;">Teléfono</label>
          <input type="tel" id="telefono" style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 8px;">
        </div>
      </div>
      
      <div>
        <label style="display: block; margin-bottom: 4px; font-weight: 600; font-size: 14px;">Contraseña *</label>
        <input type="password" id="contrasena" required minlength="6" style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 8px;">
        <small style="color: #718096;">Mínimo 6 caracteres</small>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <div>
          <label style="display: block; margin-bottom: 4px; font-weight: 600; font-size: 14px;">Rol *</label>
          <select id="rol" required style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 8px;">
            <option value="">Seleccionar...</option>
            <option value="admin">Administrador</option>
            <option value="gerente">Gerente</option>
            <option value="cocinero">Cocinero</option>
            <option value="mesero">Mesero</option>
            <option value="cajero">Cajero</option>
          </select>
        </div>
        <div>
          <label style="display: block; margin-bottom: 4px; font-weight: 600; font-size: 14px;">Puesto</label>
          <input type="text" id="puesto" placeholder="Ej: Chef Principal" style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 8px;">
        </div>
      </div>
    </form>
  `;

  const modal = mostrarModal('Nuevo Empleado', contenido, [
    {
      texto: 'Crear Empleado',
      class: 'btn-primary',
      onclick: 'guardarNuevoEmpleado()'
    }
  ]);

  // Hacer la función accesible globalmente
  window.guardarNuevoEmpleado = async function() {
    const form = document.getElementById('formNuevoEmpleado');
    
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const data = {
      nombre: document.getElementById('nombre').value,
      apellido: document.getElementById('apellido').value,
      email: document.getElementById('email').value,
      telefono: document.getElementById('telefono').value,
      usuario: document.getElementById('usuario').value,
      contrasena: document.getElementById('contrasena').value,
      rol: document.getElementById('rol').value,
      puesto: document.getElementById('puesto').value,
      establecimiento_id: 1
    };

    try {
      const response = await fetchConAuth(`${API_URL}/empleados`, {
        method: 'POST',
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.success) {
        mostrarNotificacion('Empleado creado exitosamente', 'success');
        modal.remove();
        cargarEmpleados();
      } else {
        throw new Error(result.message);
      }

    } catch (error) {
      console.error('Error:', error);
      mostrarNotificacion(error.message || 'Error al crear empleado', 'error');
    }
  };
}

// =====================
// HELPERS
// =====================
function obtenerColorRol(rol) {
  const colores = {
    'admin': '#dc2626',
    'gerente': '#ea580c',
    'cocinero': '#16a34a',
    'mesero': '#2563eb',
    'cajero': '#9333ea'
  };
  return colores[rol] || '#64748b';
}

function formatearRol(rol) {
  const roles = {
    'admin': 'Administrador',
    'gerente': 'Gerente',
    'cocinero': 'Cocinero',
    'mesero': 'Mesero',
    'cajero': 'Cajero'
  };
  return roles[rol] || rol;
}

async function verDetalleEmpleado(id) {
  const empleado = empleadosData.find(e => e.id === id);
  if (!empleado) return;

  const contenido = `
    <div style="display: grid; gap: 12px;">
      <div style="display: grid; grid-template-columns: 120px 1fr; gap: 8px; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
        <strong>ID:</strong>
        <span>#${empleado.id}</span>
      </div>
      <div style="display: grid; grid-template-columns: 120px 1fr; gap: 8px; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
        <strong>Nombre:</strong>
        <span>${empleado.nombre} ${empleado.apellido}</span>
      </div>
      <div style="display: grid; grid-template-columns: 120px 1fr; gap: 8px; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
        <strong>Usuario:</strong>
        <span>${empleado.usuario}</span>
      </div>
      <div style="display: grid; grid-template-columns: 120px 1fr; gap: 8px; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
        <strong>Email:</strong>
        <span>${empleado.email || '-'}</span>
      </div>
      <div style="display: grid; grid-template-columns: 120px 1fr; gap: 8px; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
        <strong>Teléfono:</strong>
        <span>${empleado.telefono || '-'}</span>
      </div>
      <div style="display: grid; grid-template-columns: 120px 1fr; gap: 8px; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
        <strong>Rol:</strong>
        <span style="padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; background: ${obtenerColorRol(empleado.rol)}; color: white; display: inline-block;">
          ${formatearRol(empleado.rol)}
        </span>
      </div>
      <div style="display: grid; grid-template-columns: 120px 1fr; gap: 8px; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
        <strong>Puesto:</strong>
        <span>${empleado.puesto || '-'}</span>
      </div>
      <div style="display: grid; grid-template-columns: 120px 1fr; gap: 8px; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
        <strong>Fecha Ingreso:</strong>
        <span>${formatearFecha(empleado.fecha_ingreso)}</span>
      </div>
      <div style="display: grid; grid-template-columns: 120px 1fr; gap: 8px; padding: 8px 0;">
        <strong>Estado:</strong>
        ${obtenerBadgeEstado(empleado.activo ? 'activo' : 'inactivo')}
      </div>
    </div>
  `;

  mostrarModal(`Empleado #${id}`, contenido);
}

function editarEmpleado(id) {
  mostrarNotificacion('Función en desarrollo', 'info');
}

async function desactivarEmpleado(id) {
  if (!confirm('¿Desactivar este empleado?')) return;

  try {
    const response = await fetchConAuth(`${API_URL}/empleados/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ activo: false })
    });

    const result = await response.json();

    if (result.success) {
      mostrarNotificacion('Empleado desactivado', 'success');
      cargarEmpleados();
    }

  } catch (error) {
    mostrarNotificacion('Error al desactivar empleado', 'error');
  }
}

async function activarEmpleado(id) {
  try {
    const response = await fetchConAuth(`${API_URL}/empleados/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ activo: true })
    });

    const result = await response.json();

    if (result.success) {
      mostrarNotificacion('Empleado activado', 'success');
      cargarEmpleados();
    }

  } catch (error) {
    mostrarNotificacion('Error al activar empleado', 'error');
  }
}

// =====================
// INICIALIZAR
// =====================
document.addEventListener('DOMContentLoaded', () => {
  cargarEmpleados();
});

// Hacer funciones globales
window.abrirModalNuevoEmpleado = abrirModalNuevoEmpleado;
window.filtrarEmpleados = filtrarEmpleados;
window.verDetalleEmpleado = verDetalleEmpleado;
window.editarEmpleado = editarEmpleado;
window.desactivarEmpleado = desactivarEmpleado;
window.activarEmpleado = activarEmpleado;

console.log('✅ empleados.js cargado');