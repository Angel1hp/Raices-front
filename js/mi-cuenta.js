// js/mi-cuenta.js

let clienteData = null;
let datosFormulario = null; // Para guardar departamentos, provincias, distritos

document.addEventListener('DOMContentLoaded', async () => {
  console.log("📄 mi-cuenta.js iniciado");
  
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
  
  // Cargar datos del formulario (ubicaciones)
  await cargarDatosFormulario();
  
  // Cargar datos del cliente
  await cargarDatosCliente(usuarioActual.id);
  
  // Configurar botones
  configurarBotones();
});

async function cargarDatosFormulario() {
  try {
    const response = await fetch('https://raices-back.onrender.com/api/auth/datos-formulario');
    
    if (!response.ok) throw new Error('Error al cargar datos del formulario');
    
    const data = await response.json();
    
    if (data.success) {
      datosFormulario = data.data;
      console.log("✅ Datos del formulario cargados:", datosFormulario);
    }
  } catch (error) {
    console.error('❌ Error al cargar datos del formulario:', error);
  }
}

async function cargarDatosCliente(clienteId) {
  try {
    console.log(`📡 Cargando datos del cliente ${clienteId}...`);
    
    const response = await fetch(`https://raices-back.onrender.com/api/auth/cliente/${clienteId}`);
    
    if (!response.ok) throw new Error('Error al cargar datos');
    
    const data = await response.json();
    
    if (data.success && data.cliente) {
      clienteData = data.cliente;
      console.log("✅ Datos del cliente cargados:", clienteData);
      mostrarDatosCliente(data.cliente);
    }
  } catch (error) {
    console.error('❌ Error al cargar datos:', error);
    window.mostrarNotificacion('Error al cargar tus datos', 'error');
  }
}

function mostrarDatosCliente(cliente) {
  // Información Personal
  document.getElementById('nombreCompleto').textContent = 
    `${cliente.nombre} ${cliente.apellido}`;
  document.getElementById('usuario').textContent = cliente.usuario;
  document.getElementById('email').textContent = cliente.email;
  document.getElementById('telefono').textContent = cliente.telefono || '-';
  
  // Dirección
  document.getElementById('direccion').textContent = cliente.direccion || '-';
  document.getElementById('distrito').textContent = cliente.distrito || '-';
  document.getElementById('provincia').textContent = cliente.provincia || '-';
  
  // Documento
  document.getElementById('numeroDocumento').textContent = cliente.numero_documento || '-';
  document.getElementById('ruc').textContent = cliente.ruc || 'No registrado';
  
  // Fecha
  document.getElementById('fechaRegistro').textContent = 
    new Date().toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' });
}

function configurarBotones() {
  // Editar información personal
  const btnEditPersonal = document.getElementById('btnEditPersonal');
  const formEditPersonal = document.getElementById('formEditPersonal');
  const btnCancelPersonal = document.getElementById('btnCancelPersonal');
  const infoPersonal = document.getElementById('infoPersonal');
  
  btnEditPersonal.addEventListener('click', () => {
    infoPersonal.style.display = 'none';
    formEditPersonal.style.display = 'block';
    
    // Llenar formulario
    document.getElementById('editNombre').value = clienteData.nombre;
    document.getElementById('editApellido').value = clienteData.apellido;
    document.getElementById('editEmail').value = clienteData.email;
    document.getElementById('editTelefono').value = clienteData.telefono || '';
  });
  
  btnCancelPersonal.addEventListener('click', () => {
    infoPersonal.style.display = 'grid';
    formEditPersonal.style.display = 'none';
  });
  
  formEditPersonal.addEventListener('submit', async (e) => {
    e.preventDefault();
    await guardarDatosPersonales();
  });
  
  // Editar dirección
  const btnEditDireccion = document.getElementById('btnEditDireccion');
  const formEditDireccion = document.getElementById('formEditDireccion');
  const btnCancelDireccion = document.getElementById('btnCancelDireccion');
  const infoDireccion = document.getElementById('infoDireccion');
  
  btnEditDireccion.addEventListener('click', () => {
    infoDireccion.style.display = 'none';
    formEditDireccion.style.display = 'block';
    
    // Llenar formulario
    document.getElementById('editDireccion').value = clienteData.direccion || '';
    
    // Cargar selectores de ubicación
    cargarSelectoresUbicacion();
  });
  
  btnCancelDireccion.addEventListener('click', () => {
    infoDireccion.style.display = 'grid';
    formEditDireccion.style.display = 'none';
  });
  
  formEditDireccion.addEventListener('submit', async (e) => {
    e.preventDefault();
    await guardarDireccion();
  });
  
  // Editar información fiscal (RUC)
  const btnEditFiscal = document.getElementById('btnEditFiscal');
  const formEditFiscal = document.getElementById('formEditFiscal');
  const btnCancelFiscal = document.getElementById('btnCancelFiscal');
  const infoFiscal = document.getElementById('infoFiscal');
  
  btnEditFiscal.addEventListener('click', () => {
    infoFiscal.style.display = 'none';
    formEditFiscal.style.display = 'block';
    
    const editRucInput = document.getElementById('editRuc');
    editRucInput.value = clienteData.ruc || '';
    
    // Validación en tiempo real
    editRucInput.addEventListener('input', (e) => {
      // Solo permitir números
      e.target.value = e.target.value.replace(/[^0-9]/g, '');
      
      // Limitar a 11 dígitos
      if (e.target.value.length > 11) {
        e.target.value = e.target.value.slice(0, 11);
      }
    });
  });
  
  btnCancelFiscal.addEventListener('click', () => {
    infoFiscal.style.display = 'grid';
    formEditFiscal.style.display = 'none';
  });
  
  formEditFiscal.addEventListener('submit', async (e) => {
    e.preventDefault();
    await guardarDatosFiscales();
  });
  
  // Cambiar contraseña
  const btnChangePassword = document.getElementById('btnChangePassword');
  const formChangePassword = document.getElementById('formChangePassword');
  const btnCancelPassword = document.getElementById('btnCancelPassword');
  
  btnChangePassword.addEventListener('click', () => {
    formChangePassword.style.display = 'block';
  });
  
  btnCancelPassword.addEventListener('click', () => {
    formChangePassword.style.display = 'none';
    formChangePassword.reset();
  });
  
  formChangePassword.addEventListener('submit', async (e) => {
    e.preventDefault();
    await cambiarContrasena();
  });
}

function cargarSelectoresUbicacion() {
  if (!datosFormulario) {
    console.error("❌ No hay datos de formulario cargados");
    return;
  }
  
  const selectDepartamento = document.getElementById('editDepartamento');
  const selectProvincia = document.getElementById('editProvincia');
  const selectDistrito = document.getElementById('editDistrito');
  
  // Limpiar selectores
  selectDepartamento.innerHTML = '<option value="">Seleccione departamento</option>';
  selectProvincia.innerHTML = '<option value="">Seleccione provincia</option>';
  selectDistrito.innerHTML = '<option value="">Seleccione distrito</option>';
  
  // Cargar departamentos
  datosFormulario.ubicaciones.departamentos.forEach(dep => {
    const option = document.createElement('option');
    option.value = dep.id;
    option.textContent = dep.nombre;
    selectDepartamento.appendChild(option);
  });
  
  // Event listeners para cascada
  selectDepartamento.addEventListener('change', (e) => {
    const departamentoId = e.target.value;
    
    if (!departamentoId) {
      selectProvincia.disabled = true;
      selectDistrito.disabled = true;
      selectProvincia.innerHTML = '<option value="">Seleccione provincia</option>';
      selectDistrito.innerHTML = '<option value="">Seleccione distrito</option>';
      return;
    }
    
    // Filtrar provincias
    selectProvincia.disabled = false;
    selectProvincia.innerHTML = '<option value="">Seleccione provincia</option>';
    selectDistrito.disabled = true;
    selectDistrito.innerHTML = '<option value="">Seleccione distrito</option>';
    
    const provinciasFiltradas = datosFormulario.ubicaciones.provincias.filter(
      prov => prov.departamento_id == departamentoId
    );
    
    provinciasFiltradas.forEach(prov => {
      const option = document.createElement('option');
      option.value = prov.id;
      option.textContent = prov.nombre;
      selectProvincia.appendChild(option);
    });
  });
  
  selectProvincia.addEventListener('change', (e) => {
    const provinciaId = e.target.value;
    
    if (!provinciaId) {
      selectDistrito.disabled = true;
      selectDistrito.innerHTML = '<option value="">Seleccione distrito</option>';
      return;
    }
    
    // Filtrar distritos
    selectDistrito.disabled = false;
    selectDistrito.innerHTML = '<option value="">Seleccione distrito</option>';
    
    const distritosFiltrados = datosFormulario.ubicaciones.distritos.filter(
      dist => dist.provincia_id == provinciaId
    );
    
    distritosFiltrados.forEach(dist => {
      const option = document.createElement('option');
      option.value = dist.id;
      option.textContent = dist.nombre;
      selectDistrito.appendChild(option);
    });
  });
  
  // Pre-seleccionar valores actuales si existen
  if (clienteData.departamento_id) {
    selectDepartamento.value = clienteData.departamento_id;
    selectDepartamento.dispatchEvent(new Event('change'));
    
    setTimeout(() => {
      if (clienteData.provincia_id) {
        selectProvincia.value = clienteData.provincia_id;
        selectProvincia.dispatchEvent(new Event('change'));
        
        setTimeout(() => {
          if (clienteData.distrito_id) {
            selectDistrito.value = clienteData.distrito_id;
          }
        }, 100);
      }
    }, 100);
  }
}

async function guardarDatosPersonales() {
  const nombre = document.getElementById('editNombre').value;
  const apellido = document.getElementById('editApellido').value;
  const email = document.getElementById('editEmail').value;
  const telefono = document.getElementById('editTelefono').value;
  
  try {
    const response = await fetch(`https://raices-back.onrender.com/api/auth/actualizar/${clienteData.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, apellido, email, telefono })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error al actualizar');
    }
    
    window.mostrarNotificacion('Datos actualizados correctamente', 'success');
    
    // Recargar datos
    await cargarDatosCliente(clienteData.id);
    
    // Cerrar formulario
    document.getElementById('infoPersonal').style.display = 'grid';
    document.getElementById('formEditPersonal').style.display = 'none';
    
  } catch (error) {
    console.error('❌ Error:', error);
    window.mostrarNotificacion(error.message, 'error');
  }
}

async function guardarDireccion() {
  const direccion = document.getElementById('editDireccion').value;
  const distrito_id = document.getElementById('editDistrito').value;
  
  if (!distrito_id) {
    window.mostrarNotificacion('Debe seleccionar un distrito', 'error');
    return;
  }
  
  try {
    const response = await fetch(`https://raices-back.onrender.com/api/auth/actualizar/${clienteData.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ direccion, distrito_id })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error al actualizar');
    }
    
    window.mostrarNotificacion('Dirección actualizada correctamente', 'success');
    
    await cargarDatosCliente(clienteData.id);
    
    document.getElementById('infoDireccion').style.display = 'grid';
    document.getElementById('formEditDireccion').style.display = 'none';
    
  } catch (error) {
    console.error('❌ Error:', error);
    window.mostrarNotificacion(error.message, 'error');
  }
}

async function guardarDatosFiscales() {
  const ruc = document.getElementById('editRuc').value.trim();
  
  // Validar RUC si se ingresó
  if (ruc && ruc.length > 0) {
    // Validar que solo sean números
    if (!/^\d+$/.test(ruc)) {
      window.mostrarNotificacion('El RUC solo debe contener números', 'error');
      return;
    }
    
    // Validar longitud (RUC debe tener 11 dígitos)
    if (ruc.length !== 11) {
      window.mostrarNotificacion('El RUC debe tener exactamente 11 dígitos', 'error');
      return;
    }
  }
  
  try {
    const response = await fetch(`https://raices-back.onrender.com/api/auth/actualizar/${clienteData.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ruc: ruc || null })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error al actualizar');
    }
    
    window.mostrarNotificacion('Información fiscal actualizada correctamente', 'success');
    
    await cargarDatosCliente(clienteData.id);
    
    document.getElementById('infoFiscal').style.display = 'grid';
    document.getElementById('formEditFiscal').style.display = 'none';
    
  } catch (error) {
    console.error('❌ Error:', error);
    window.mostrarNotificacion(error.message, 'error');
  }
}

async function cambiarContrasena() {
  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  
  if (newPassword !== confirmPassword) {
    window.mostrarNotificacion('Las contraseñas no coinciden', 'error');
    return;
  }
  
  if (newPassword.length < 6) {
    window.mostrarNotificacion('La contraseña debe tener al menos 6 caracteres', 'error');
    return;
  }
  
  try {
    const response = await fetch(`https://raices-back.onrender.com/api/auth/cambiar-contrasena/${clienteData.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error al cambiar contraseña');
    }
    
    window.mostrarNotificacion('Contraseña cambiada correctamente', 'success');
    
    document.getElementById('formChangePassword').style.display = 'none';
    document.getElementById('formChangePassword').reset();
    
  } catch (error) {
    console.error('❌ Error:', error);
    window.mostrarNotificacion(error.message, 'error');
  }
}