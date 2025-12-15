// admin/js/productos.js
console.log('📦 Cargando productos.js...');

let productosData = [];
let tabActual = 'comidas';

// =====================
// CARGAR PRODUCTOS
// =====================
async function cargarProductos(tipo = 'comidas') {
  const grid = document.getElementById('productosGrid');
  
  if (!grid) {
    console.error('❌ Grid de productos no encontrado');
    return;
  }

  try {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 60px;">
        ${mostrarLoading('Cargando productos...')}
      </div>
    `;

    console.log(`📡 Cargando ${tipo}...`);

    let endpoint;
    if (tipo === 'comidas') {
      endpoint = 'https://raices-back.onrender.com/api/menu/comidas';
    } else if (tipo === 'bebidas') {
      endpoint = 'https://raices-back.onrender.com/api/menu/bebidas';
    } else if (tipo === 'promociones') {
      endpoint = 'https://raices-back.onrender.com/api/menu/promociones';
    }

    const response = await fetch(endpoint);
    
    if (!response.ok) {
      throw new Error('Error al cargar productos');
    }

    productosData = await response.json();
    
    console.log(`✅ ${tipo} cargados:`, productosData.length);

    // Cargar categorías si es comidas
    if (tipo === 'comidas') {
      await cargarCategoriasEnFiltro();
    }

    renderizarProductos(productosData);

  } catch (error) {
    console.error('❌ Error cargando productos:', error);
    grid.innerHTML = `
      <div style="grid-column: 1/-1;">
        ${mostrarError('Error al cargar productos')}
      </div>
    `;
    mostrarNotificacion('Error al cargar productos', 'error');
  }
}
async function cargarCategoriasEnFiltro() {
  try {
    const response = await fetch('https://raices-back.onrender.com/api/menu/categorias');
    const categorias = await response.json();
    
    const select = document.getElementById('filterCategoria');
    if (select) {
      select.innerHTML = '<option value="">Todas las categorías</option>' +
        categorias.map(cat => `<option value="${cat.nombre}">${cat.nombre}</option>`).join('');
    }
  } catch (error) {
    console.error('Error cargando categorías:', error);
  }
}

// =====================
// RENDERIZAR PRODUCTOS EN GRID
// =====================
function renderizarProductos(productos) {
  const grid = document.getElementById('productosGrid');
  
  if (!grid) return;

  if (productos.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 60px; color: #999;">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="margin: 0 auto 16px; display: block; opacity: 0.3;">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="8" y1="15" x2="16" y2="15"></line>
          <line x1="9" y1="9" x2="9.01" y2="9"></line>
          <line x1="15" y1="9" x2="15.01" y2="9"></line>
        </svg>
        <p>No hay productos disponibles</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = productos.map(producto => {
    // Detectar si es promoción
    const esPromocion = tabActual === 'promociones' || producto.titulo;
    const nombre = esPromocion ? producto.titulo : producto.nombre;
    const precio = esPromocion ? producto.precio_oferta : producto.precio;
    const disponible = producto.activo !== undefined ? producto.activo : producto.disponible;

    return `
      <div class="producto-card">
        <img 
          src="${producto.imagen || 'img/default.jpg'}" 
          alt="${nombre}" 
          class="producto-img"
          onerror="this.src='img/default.jpg'"
        >
        <div class="producto-body">
          <div class="producto-nombre">${nombre}</div>
          ${producto.descripcion ? `
            <p style="font-size: 13px; color: #718096; margin-bottom: 12px; line-height: 1.4;">
              ${producto.descripcion.substring(0, 80)}${producto.descripcion.length > 80 ? '...' : ''}
            </p>
          ` : ''}
          ${esPromocion && producto.items ? `
            <div style="font-size: 12px; color: #718096; margin-bottom: 8px;">
              <strong>Incluye:</strong><br>
              ${producto.items.map(item => `• ${item.cantidad}x ${item.nombre}`).join('<br>')}
            </div>
          ` : ''}
          <div class="producto-precio">${formatearMoneda(precio)}</div>
          ${disponible === false ? 
            '<span class="status-badge danger">No disponible</span>' : 
            '<span class="status-badge success">Disponible</span>'
          }
          <div class="producto-actions" style="margin-top: 12px;">
            <button 
              class="btn btn-secondary btn-sm" 
              style="flex: 1;"
              onclick="verDetalleProducto(${producto.id}, '${tabActual}')"
            >
              Ver
            </button>
            <button 
              class="btn btn-secondary btn-sm" 
              onclick="editarProducto(${producto.id}, '${tabActual}')"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button 
              class="btn btn-sm ${disponible ? 'btn-secondary' : ''}" 
              style="${disponible ? '' : 'background: #48bb78; color: white;'}"
              onclick="toggleDisponibilidad(${producto.id}, '${tabActual}', ${disponible})"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                ${disponible ? 
                  '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' :
                  '<polyline points="20 6 9 17 4 12"/>'
                }
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// =====================
// CAMBIAR TAB (COMIDAS/BEBIDAS/PROMOCIONES)
// =====================
function cambiarTab(tab) {
  console.log('📂 Cambiando a tab:', tab);
  
  tabActual = tab;
  
  // Actualizar botones
  document.getElementById('tabComidas')?.classList.toggle('active', tab === 'comidas');
  document.getElementById('tabBebidas')?.classList.toggle('active', tab === 'bebidas');
  document.getElementById('tabPromociones')?.classList.toggle('active', tab === 'promociones');
  
  // Mostrar/ocultar filtros según la pestaña
  const filtroCategoriaComida = document.getElementById('filtroCategoriaComida');
  const filtroTipoBebida = document.getElementById('filtroTipoBebida');
  
  if (filtroCategoriaComida) {
    filtroCategoriaComida.style.display = tab === 'comidas' ? 'block' : 'none';
  }
  
  if (filtroTipoBebida) {
    filtroTipoBebida.style.display = tab === 'bebidas' ? 'block' : 'none';
  }
  
  // Limpiar filtros
  if (document.getElementById('searchProducto')) {
    document.getElementById('searchProducto').value = '';
  }
  if (document.getElementById('filterCategoria')) {
    document.getElementById('filterCategoria').value = '';
  }
  if (document.getElementById('filterTipo')) {
    document.getElementById('filterTipo').value = '';
  }
  if (document.getElementById('filterDisponible')) {
    document.getElementById('filterDisponible').value = '';
  }
  
  // Cargar productos
  cargarProductos(tab);
}

// =====================
// FILTRAR PRODUCTOS
// =====================
function filtrarProductos() {
  const searchTerm = document.getElementById('searchProducto')?.value.toLowerCase() || '';
  const disponibleFilter = document.getElementById('filterDisponible')?.value || '';
  const categoriaFilter = document.getElementById('filterCategoria')?.value || '';
  const tipoFilter = document.getElementById('filterTipo')?.value || '';

  let filtrados = productosData;

  // Filtrar por búsqueda
  if (searchTerm) {
    filtrados = filtrados.filter(prod => {
      const nombre = tabActual === 'promociones' ? prod.titulo : prod.nombre;
      const descripcion = prod.descripcion || '';
      return nombre?.toLowerCase().includes(searchTerm) ||
             descripcion.toLowerCase().includes(searchTerm);
    });
  }

  // Filtrar por categoría (comidas)
  if (categoriaFilter && tabActual === 'comidas') {
    filtrados = filtrados.filter(prod => prod.categoria === categoriaFilter);
  }

  // Filtrar por tipo (bebidas)
  if (tipoFilter && tabActual === 'bebidas') {
    filtrados = filtrados.filter(prod => prod.categoria === tipoFilter);
  }

  // Filtrar por disponibilidad
  if (disponibleFilter !== '') {
    const disponible = disponibleFilter === 'true';
    if (tabActual === 'promociones') {
      filtrados = filtrados.filter(prod => prod.activo === disponible);
    } else {
      filtrados = filtrados.filter(prod => prod.disponible === disponible);
    }
  }

  console.log(`🔍 Filtrados: ${filtrados.length} de ${productosData.length}`);
  renderizarProductos(filtrados);
}

// =====================
// VER DETALLE PRODUCTO
// =====================
async function verDetalleProducto(id, tipo) {
  try {
    let endpoint;
    
    if (tipo === 'comidas') {
      endpoint = `https://raices-back.onrender.com/api/menu/comidas/${id}`;
    } else if (tipo === 'bebidas') {
      endpoint = `https://raices-back.onrender.com/api/menu/bebidas/${id}`;
    } else if (tipo === 'promociones') {
      endpoint = `https://raices-back.onrender.com/api/menu/promociones/${id}`;
    }

    const response = await fetch(endpoint);
    
    if (!response.ok) {
      throw new Error('Error al cargar producto');
    }

    const producto = await response.json();

    // Detectar si es promoción
    const esPromocion = tipo === 'promociones' || producto.titulo;
    const nombre = esPromocion ? producto.titulo : producto.nombre;
    const precio = esPromocion ? producto.precio_oferta : producto.precio;

    const contenido = `
      <div style="display: grid; gap: 20px;">
        <div style="text-align: center;">
          <img 
            src="${producto.imagen || 'img/default.jpg'}" 
            alt="${nombre}"
            style="max-width: 100%; max-height: 300px; border-radius: 12px; object-fit: cover;"
            onerror="this.src='img/default.jpg'"
          >
        </div>
        
        <div style="display: grid; gap: 12px;">
          <div style="display: grid; grid-template-columns: 120px 1fr; gap: 8px; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
            <strong>Nombre:</strong>
            <span>${nombre}</span>
          </div>
          
          ${producto.descripcion ? `
            <div style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
              <strong style="display: block; margin-bottom: 8px;">Descripción:</strong>
              <span style="color: #718096;">${producto.descripcion}</span>
            </div>
          ` : ''}
          
          ${esPromocion && producto.items && producto.items.length > 0 ? `
            <div style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
              <strong style="display: block; margin-bottom: 8px;">Incluye:</strong>
              <ul style="margin: 0; padding-left: 20px; color: #718096;">
                ${producto.items.map(item => `
                  <li>${item.cantidad}x ${item.nombre} (${formatearMoneda(item.precio)})</li>
                `).join('')}
              </ul>
            </div>
          ` : ''}
          
          <div style="display: grid; grid-template-columns: 120px 1fr; gap: 8px; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
            <strong>Precio:</strong>
            <span style="font-size: 20px; font-weight: 700; color: #af6d6d;">${formatearMoneda(precio)}</span>
          </div>
          
          ${producto.categoria && tipo !== 'promociones' ? `
            <div style="display: grid; grid-template-columns: 120px 1fr; gap: 8px; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
              <strong>Categoría:</strong>
              <span>${producto.categoria}</span>
            </div>
          ` : ''}
          
          ${tipo === 'bebidas' && producto.tamano_ml ? `
            <div style="display: grid; grid-template-columns: 120px 1fr; gap: 8px; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
              <strong>Tamaño:</strong>
              <span>${producto.tamano_ml} ml</span>
            </div>
          ` : ''}
          
          <div style="display: grid; grid-template-columns: 120px 1fr; gap: 8px; padding: 8px 0;">
            <strong>Estado:</strong>
            ${(esPromocion ? producto.activo : producto.disponible) ? 
              '<span class="status-badge success">Disponible</span>' : 
              '<span class="status-badge danger">No disponible</span>'
            }
          </div>
        </div>
      </div>
    `;

    mostrarModal(nombre, contenido);

  } catch (error) {
    console.error('❌ Error al ver detalle:', error);
    mostrarNotificacion('Error al cargar detalle del producto', 'error');
  }
}

// =====================
// EDITAR PRODUCTO
// =====================
async function editarProducto(id, tipo) {
  try {
    // Cargar datos actuales
    let endpoint;
    if (tipo === 'comidas') {
      endpoint = `https://raices-back.onrender.com/api/menu/comidas/${id}`;
    } else if (tipo === 'bebidas') {
      endpoint = `https://raices-back.onrender.com/api/menu/bebidas/${id}`;
    } else if (tipo === 'promociones') {
      endpoint = `https://raices-back.onrender.com/api/menu/promociones/${id}`;
    }

    const response = await fetch(endpoint);
    const producto = await response.json();

    const esPromocion = tipo === 'promociones';
    const nombre = esPromocion ? producto.titulo : producto.nombre;
    const precio = esPromocion ? producto.precio_oferta : producto.precio;
    const disponible = esPromocion ? producto.activo : producto.disponible;

    let contenido = '';

    if (tipo === 'comidas') {
      contenido = `
        <form id="formEditarProducto" style="display: grid; gap: 16px;">
          <div>
            <label style="display: block; margin-bottom: 4px; font-weight: 600;">Nombre *</label>
            <input type="text" id="nombre" value="${producto.nombre}" required style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 8px;">
          </div>
          <div>
            <label style="display: block; margin-bottom: 4px; font-weight: 600;">Descripción</label>
            <textarea id="descripcion" rows="3" style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 8px;">${producto.descripcion || ''}</textarea>
          </div>
          <div>
            <label style="display: block; margin-bottom: 4px; font-weight: 600;">Precio *</label>
            <input type="number" id="precio" value="${producto.precio}" step="0.01" required style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 8px;">
          </div>
          <div>
            <label style="display: block; margin-bottom: 4px; font-weight: 600;">URL de Imagen</label>
            <input type="url" id="imagen" value="${producto.imagen || ''}" style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 8px;">
          </div>
          <div>
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
              <input type="checkbox" id="disponible" ${producto.disponible ? 'checked' : ''}>
              <span>Producto disponible</span>
            </label>
          </div>
        </form>
      `;
    } else if (tipo === 'bebidas') {
      contenido = `
        <form id="formEditarProducto" style="display: grid; gap: 16px;">
          <div>
            <label style="display: block; margin-bottom: 4px; font-weight: 600;">Nombre *</label>
            <input type="text" id="nombre" value="${producto.nombre}" required style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 8px;">
          </div>
          <div>
            <label style="display: block; margin-bottom: 4px; font-weight: 600;">Descripción</label>
            <textarea id="descripcion" rows="3" style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 8px;">${producto.descripcion || ''}</textarea>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div>
              <label style="display: block; margin-bottom: 4px; font-weight: 600;">Precio *</label>
              <input type="number" id="precio" value="${producto.precio}" step="0.01" required style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 8px;">
            </div>
            <div>
              <label style="display: block; margin-bottom: 4px; font-weight: 600;">Tamaño (ml)</label>
              <input type="number" id="tamano_ml" value="${producto.tamano_ml || ''}" style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 8px;">
            </div>
          </div>
          <div>
            <label style="display: block; margin-bottom: 4px; font-weight: 600;">URL de Imagen</label>
            <input type="url" id="imagen" value="${producto.imagen || ''}" style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 8px;">
          </div>
          <div>
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
              <input type="checkbox" id="disponible" ${producto.disponible ? 'checked' : ''}>
              <span>Producto disponible</span>
            </label>
          </div>
        </form>
      `;
    } else if (tipo === 'promociones') {
  contenido = `
    <form id="formEditarProducto" style="display: grid; gap: 16px;">
      <div>
        <label style="display: block; margin-bottom: 4px; font-weight: 600;">Título *</label>
        <input type="text" id="titulo" value="${producto.titulo}" required style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 8px;">
      </div>
      <div>
        <label style="display: block; margin-bottom: 4px; font-weight: 600;">Descripción</label>
        <textarea id="descripcion" rows="3" style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 8px;">${producto.descripcion || ''}</textarea>
      </div>
      <div>
        <label style="display: block; margin-bottom: 4px; font-weight: 600;">Precio de Oferta *</label>
        <input type="number" id="precio_oferta" value="${producto.precio_oferta}" step="0.01" required style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 8px;">
      </div>
      <div>
        <label style="display: block; margin-bottom: 4px; font-weight: 600;">URL de Imagen</label>
        <input type="url" id="imagen" value="${producto.imagen || ''}" style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 8px;">
      </div>
      
      <div style="border: 2px solid #e2e8f0; border-radius: 8px; padding: 16px; background: #f7fafc;">
        <label style="display: block; margin-bottom: 8px; font-weight: 600;">Productos incluidos:</label>
        <div id="itemsActuales" style="display: grid; gap: 8px;">
          ${producto.items ? producto.items.map(item => `
            <div style="padding: 8px; background: white; border-radius: 6px; display: flex; justify-content: space-between;">
              <span>${item.cantidad}x ${item.nombre}</span>
              <span style="color: #718096;">${formatearMoneda(item.precio)}</span>
            </div>
          `).join('') : '<p style="color: #718096;">Sin items</p>'}
        </div>
        <small style="color: #718096; display: block; margin-top: 8px;">
          Para modificar los productos incluidos, usa la función de edición completa de promociones.
        </small>
      </div>
      
      <div>
        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
          <input type="checkbox" id="activo" ${producto.activo ? 'checked' : ''}>
          <span>Promoción activa</span>
        </label>
      </div>
    </form>
  `;
}

    const modal = mostrarModal(`Editar: ${nombre}`, contenido, [
      {
        texto: 'Guardar Cambios',
        class: 'btn-primary',
        onclick: `guardarEdicion(${id}, '${tipo}')`
      }
    ]);

    window.guardarEdicion = async function(idProducto, tipoProducto) {
      const form = document.getElementById('formEditarProducto');
      
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const data = {};

      if (tipoProducto === 'comidas' || tipoProducto === 'bebidas') {
        data.nombre = document.getElementById('nombre').value;
        data.descripcion = document.getElementById('descripcion')?.value || null;
        data.precio = parseFloat(document.getElementById('precio').value);
        data.imagen = document.getElementById('imagen')?.value || null;
        data.disponible = document.getElementById('disponible')?.checked;

        if (tipoProducto === 'bebidas') {
          data.tamano_ml = parseInt(document.getElementById('tamano_ml')?.value) || null;
        }
      } else if (tipoProducto === 'promociones') {
        data.titulo = document.getElementById('titulo').value;
        data.descripcion = document.getElementById('descripcion')?.value || null;
        data.precio_oferta = parseFloat(document.getElementById('precio_oferta').value);
        data.imagen = document.getElementById('imagen')?.value || null;
        data.activo = document.getElementById('activo')?.checked;
      }

      try {
        let updateEndpoint;
        if (tipoProducto === 'comidas') {
          updateEndpoint = `https://raices-back.onrender.com/api/menu/comidas/${idProducto}`;
        } else if (tipoProducto === 'bebidas') {
          updateEndpoint = `https://raices-back.onrender.com/api/menu/bebidas/${idProducto}`;
        } else if (tipoProducto === 'promociones') {
          updateEndpoint = `https://raices-back.onrender.com/api/menu/promociones/${idProducto}`;
        }

        const response = await fetch(updateEndpoint, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          throw new Error('Error al actualizar');
        }

        mostrarNotificacion('Producto actualizado exitosamente', 'success');
        modal.remove();
        cargarProductos(tipoProducto);

      } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('Error al actualizar producto', 'error');
      }
    };

  } catch (error) {
    console.error('Error al cargar producto para edición:', error);
    mostrarNotificacion('Error al cargar producto', 'error');
  }
}

// =====================
// TOGGLE DISPONIBILIDAD
// =====================
async function toggleDisponibilidad(id, tipo, disponibleActual) {
  const nuevoEstado = !disponibleActual;
  const accion = nuevoEstado ? 'activar' : 'desactivar';
  
  if (!confirm(`¿${accion.charAt(0).toUpperCase() + accion.slice(1)} este producto?`)) {
    return;
  }

  try {
    const endpoint = tipo === 'comidas'
      ? `https://raices-back.onrender.com/api/menu/comidas/${id}`
      : `https://raices-back.onrender.com/api/menu/bebidas/${id}`;

    // Nota: Esta ruta necesita ser implementada en el backend
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ disponible: nuevoEstado })
    });

    if (!response.ok) {
      throw new Error('Error al actualizar producto');
    }

    mostrarNotificacion(`Producto ${accion}do correctamente`, 'success');
    cargarProductos(tipo);

  } catch (error) {
    console.error('❌ Error:', error);
    mostrarNotificacion('Error al actualizar producto. Verifica que la ruta PUT exista en el backend.', 'error');
  }
}

// =====================
// MODAL NUEVO PRODUCTO
// =====================
function abrirModalNuevoProducto() {
  const contenido = `
    <div style="margin-bottom: 16px;">
      <label style="display: block; margin-bottom: 8px; font-weight: 600;">Tipo de producto:</label>
      <select id="tipoProducto" onchange="cambiarFormularioTipo(this.value)" style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 8px;">
        <option value="">Seleccionar...</option>
        <option value="comida">Comida</option>
        <option value="bebida">Bebida</option>
        <option value="promocion">Promoción</option>
      </select>
    </div>
    
    <div id="formularioProducto" style="display: none;">
      <!-- El formulario se cargará dinámicamente -->
    </div>
  `;

  const modal = mostrarModal('Nuevo Producto', contenido, [
    {
      texto: 'Guardar Producto',
      class: 'btn-primary',
      onclick: 'guardarNuevoProducto()'
    }
  ]);

  // Hacer funciones accesibles globalmente
window.cambiarFormularioTipo = function(tipo) {
  const formulario = document.getElementById('formularioProducto');
  
  if (!tipo) {
    formulario.style.display = 'none';
    return;
  }

  formulario.style.display = 'block';

  if (tipo === 'comida') {
    formulario.innerHTML = `
      <form id="formNuevoProducto" style="display: grid; gap: 16px;">
        <div>
          <label style="display: block; margin-bottom: 4px; font-weight: 600; font-size: 14px;">Nombre *</label>
          <input type="text" id="nombre" required style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 8px;">
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 4px; font-weight: 600; font-size: 14px;">Descripción</label>
          <textarea id="descripcion" rows="3" style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 8px;"></textarea>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div>
            <label style="display: block; margin-bottom: 4px; font-weight: 600; font-size: 14px;">Precio *</label>
            <input type="number" id="precio" step="0.01" required style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 8px;">
          </div>
          <div>
            <label style="display: block; margin-bottom: 4px; font-weight: 600; font-size: 14px;">Categoría *</label>
            <select id="categoria_id" required style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 8px;">
              <option value="">Cargando...</option>
            </select>
          </div>
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 4px; font-weight: 600; font-size: 14px;">URL de Imagen</label>
          <input type="url" id="imagen" placeholder="https://..." style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 8px;">
          <small style="color: #718096;">Opcional: URL de la imagen del producto</small>
        </div>
        
        <div>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" id="disponible" checked>
            <span>Producto disponible</span>
          </label>
        </div>
      </form>
    `;
    cargarCategoriasComida();
    
  } else if (tipo === 'bebida') {
    formulario.innerHTML = `
      <form id="formNuevoProducto" style="display: grid; gap: 16px;">
        <div>
          <label style="display: block; margin-bottom: 4px; font-weight: 600; font-size: 14px;">Nombre *</label>
          <input type="text" id="nombre" required style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 8px;">
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 4px; font-weight: 600; font-size: 14px;">Descripción</label>
          <textarea id="descripcion" rows="3" style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 8px;"></textarea>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;">
          <div>
            <label style="display: block; margin-bottom: 4px; font-weight: 600; font-size: 14px;">Precio *</label>
            <input type="number" id="precio" step="0.01" required style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 8px;">
          </div>
          <div>
            <label style="display: block; margin-bottom: 4px; font-weight: 600; font-size: 14px;">Tamaño (ml)</label>
            <input type="number" id="tamano_ml" placeholder="500" style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 8px;">
          </div>
          <div>
            <label style="display: block; margin-bottom: 4px; font-weight: 600; font-size: 14px;">Tipo</label>
            <select id="tipo" style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 8px;">
              <option value="Gaseosa">Gaseosa</option>
              <option value="Jugo">Jugo</option>
              <option value="Agua">Agua</option>
              <option value="Chicha">Chicha</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 4px; font-weight: 600; font-size: 14px;">URL de Imagen</label>
          <input type="url" id="imagen" placeholder="https://..." style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 8px;">
        </div>
        
        <div>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" id="disponible" checked>
            <span>Producto disponible</span>
          </label>
        </div>
      </form>
    `;
    
  } else if (tipo === 'promocion') {
    formulario.innerHTML = `
      <form id="formNuevoProducto" style="display: grid; gap: 16px;">
        <div>
          <label style="display: block; margin-bottom: 4px; font-weight: 600; font-size: 14px;">Título *</label>
          <input type="text" id="titulo" required style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 8px;">
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 4px; font-weight: 600; font-size: 14px;">Descripción</label>
          <textarea id="descripcion" rows="3" style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 8px;"></textarea>
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 4px; font-weight: 600; font-size: 14px;">Precio de Oferta *</label>
          <input type="number" id="precio_oferta" step="0.01" required style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 8px;">
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 4px; font-weight: 600; font-size: 14px;">URL de Imagen</label>
          <input type="url" id="imagen" placeholder="https://..." style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 8px;">
        </div>
        
        <div style="border: 2px solid #e2e8f0; border-radius: 8px; padding: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <label style="font-weight: 600; font-size: 14px;">Productos incluidos *</label>
            <button type="button" onclick="agregarItemPromocion()" class="btn btn-sm btn-secondary">
              + Agregar producto
            </button>
          </div>
          <div id="itemsPromocion" style="display: grid; gap: 12px;">
            <!-- Items se agregarán aquí -->
          </div>
          <small style="color: #718096; display: block; margin-top: 8px;">
            Agrega al menos un producto a la promoción
          </small>
        </div>
        
        <div>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" id="activo" checked>
            <span>Promoción activa</span>
          </label>
        </div>
      </form>
    `;
    
    // Cargar productos disponibles
    cargarProductosDisponibles();
  }
};

// 2. Nueva función para cargar productos disponibles (para promociones)
// =====================
// CARGAR PRODUCTOS DISPONIBLES (para promociones)
// =====================
async function cargarProductosDisponibles() {
  try {
    const response = await fetch('https://raices-back.onrender.com/api/menu/productos-disponibles');
    
    if (!response.ok) {
      throw new Error('Error al cargar productos');
    }
    
    const productos = await response.json();
    console.log('✅ Productos disponibles cargados:', productos.length);
    
    // Guardar globalmente
    window.productosDisponibles = productos;
    
    // Agregar primer item por defecto
    setTimeout(() => {
      agregarItemPromocion();
    }, 100);
    
  } catch (error) {
    console.error('❌ Error cargando productos:', error);
    mostrarNotificacion('Error al cargar productos disponibles', 'error');
  }
}

// =====================
// AGREGAR ITEM A PROMOCIÓN
// =====================
// =====================
// AGREGAR ITEM A PROMOCIÓN
// =====================
window.agregarItemPromocion = function() {
  const container = document.getElementById('itemsPromocion');
  
  if (!container) {
    console.error('❌ Container itemsPromocion no encontrado');
    return;
  }
  
  if (!window.productosDisponibles || window.productosDisponibles.length === 0) {
    mostrarNotificacion('No hay productos disponibles', 'warning');
    return;
  }
  
  // Separar y agrupar por tipo y categoría
  const comidas = window.productosDisponibles.filter(p => p.tipo === 'comida');
  const bebidas = window.productosDisponibles.filter(p => p.tipo === 'bebida');
  
  // Agrupar comidas por categoría
  const comidasPorCategoria = {};
  comidas.forEach(comida => {
    const cat = comida.categoria || 'Sin categoría';
    if (!comidasPorCategoria[cat]) {
      comidasPorCategoria[cat] = [];
    }
    comidasPorCategoria[cat].push(comida);
  });
  
  // Agrupar bebidas por tipo
  const bebidasPorTipo = {};
  bebidas.forEach(bebida => {
    const tipo = bebida.categoria || 'Otro';
    if (!bebidasPorTipo[tipo]) {
      bebidasPorTipo[tipo] = [];
    }
    bebidasPorTipo[tipo].push(bebida);
  });
  
  const itemId = Date.now();
  
  // Iconos por categoría de comida
  const iconosComida = {
    'Entradas': '🥗',
    'Platos principales': '🍽️',
    'Platos de fondo': '🍛',
    'Postres': '🍰',
    'Sopas': '🍲',
    'Ensaladas': '🥙',
    'default': '🍴'
  };
  
  // Iconos por tipo de bebida
  const iconosBebida = {
    'Gaseosa': '🥤',
    'Jugo': '🧃',
    'Agua': '💧',
    'Chicha': '🍹',
    'Café': '☕',
    'Té': '🍵',
    'default': '🥤'
  };
  
  const itemHTML = `
    <div id="item-${itemId}" style="display: grid; grid-template-columns: 2fr 1fr auto; gap: 8px; padding: 12px; background: #f7fafc; border-radius: 8px;">
      <select class="item-producto" required style="padding: 8px; border: 2px solid #e2e8f0; border-radius: 6px; font-size: 14px;">
        <option value="">Seleccionar producto...</option>
        
        ${Object.keys(comidasPorCategoria).length > 0 ? 
          Object.keys(comidasPorCategoria).sort().map(categoria => {
            const icono = iconosComida[categoria] || iconosComida['default'];
            return `
              <optgroup label="${icono} ${categoria.toUpperCase()}">
                ${comidasPorCategoria[categoria].map(p => {
                  const precio = parseFloat(p.precio) || 0;
                  return `<option value="${p.id}" data-tipo="${p.tipo}" data-precio="${precio}">
                    ${p.nombre} - S/. ${precio.toFixed(2)}
                  </option>`;
                }).join('')}
              </optgroup>
            `;
          }).join('') 
        : ''}
        
        ${Object.keys(bebidasPorTipo).length > 0 ? 
          Object.keys(bebidasPorTipo).sort().map(tipo => {
            const icono = iconosBebida[tipo] || iconosBebida['default'];
            return `
              <optgroup label="${icono} ${tipo.toUpperCase()}">
                ${bebidasPorTipo[tipo].map(p => {
                  const precio = parseFloat(p.precio) || 0;
                  return `<option value="${p.id}" data-tipo="${p.tipo}" data-precio="${precio}">
                    ${p.nombre} - S/. ${precio.toFixed(2)}
                  </option>`;
                }).join('')}
              </optgroup>
            `;
          }).join('') 
        : ''}
      </select>
      
      <input type="number" class="item-cantidad" min="1" value="1" required 
        style="padding: 8px; border: 2px solid #e2e8f0; border-radius: 6px; font-size: 14px;"
        placeholder="Cant.">
      
      <button type="button" onclick="eliminarItemPromocion(${itemId})" 
        class="btn btn-sm" style="background: #e53e3e; color: white; padding: 8px 12px;" title="Eliminar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  `;
  
  container.insertAdjacentHTML('beforeend', itemHTML);
  console.log('✅ Item agregado:', itemId);
};
// =====================
// AGREGAR ITEM PARA EDICIÓN
// =====================
window.agregarItemPromocionEdit = function() {
  const container = document.getElementById('itemsPromocionEdit');
  
  if (!container) {
    console.error('❌ Container no encontrado');
    return;
  }
  
  // Remover mensaje de "no hay productos" si existe
  const emptyMsg = container.querySelector('p');
  if (emptyMsg) emptyMsg.remove();
  
  // Separar y agrupar por tipo y categoría
  const comidas = window.productosDisponiblesEdit.filter(p => p.tipo === 'comida');
  const bebidas = window.productosDisponiblesEdit.filter(p => p.tipo === 'bebida');
  
  // Agrupar comidas por categoría
  const comidasPorCategoria = {};
  comidas.forEach(comida => {
    const cat = comida.categoria || 'Sin categoría';
    if (!comidasPorCategoria[cat]) {
      comidasPorCategoria[cat] = [];
    }
    comidasPorCategoria[cat].push(comida);
  });
  
  // Agrupar bebidas por tipo
  const bebidasPorTipo = {};
  bebidas.forEach(bebida => {
    const tipo = bebida.categoria || 'Otro';
    if (!bebidasPorTipo[tipo]) {
      bebidasPorTipo[tipo] = [];
    }
    bebidasPorTipo[tipo].push(bebida);
  });
  
  const itemId = Date.now();
  
  // Iconos por categoría
  const iconosComida = {
    'Entradas': '🥗',
    'Platos principales': '🍽️',
    'Platos de fondo': '🍛',
    'Postres': '🍰',
    'Sopas': '🍲',
    'Ensaladas': '🥙',
    'default': '🍴'
  };
  
  const iconosBebida = {
    'Gaseosa': '🥤',
    'Jugo': '🧃',
    'Agua': '💧',
    'Chicha': '🍹',
    'Café': '☕',
    'Té': '🍵',
    'default': '🥤'
  };
  
  const itemHTML = `
    <div id="item-edit-${itemId}" style="display: grid; grid-template-columns: 2fr 1fr auto; gap: 8px; padding: 12px; background: #f7fafc; border-radius: 8px;">
      <select class="item-producto" required style="padding: 8px; border: 2px solid #e2e8f0; border-radius: 6px; font-size: 14px;">
        <option value="">Seleccionar producto...</option>
        
        ${Object.keys(comidasPorCategoria).length > 0 ? 
          Object.keys(comidasPorCategoria).sort().map(categoria => {
            const icono = iconosComida[categoria] || iconosComida['default'];
            return `
              <optgroup label="${icono} ${categoria.toUpperCase()}">
                ${comidasPorCategoria[categoria].map(p => {
                  const precio = parseFloat(p.precio) || 0;
                  return `<option value="${p.id}" data-tipo="${p.tipo}" data-precio="${precio}">
                    ${p.nombre} - S/. ${precio.toFixed(2)}
                  </option>`;
                }).join('')}
              </optgroup>
            `;
          }).join('') 
        : ''}
        
        ${Object.keys(bebidasPorTipo).length > 0 ? 
          Object.keys(bebidasPorTipo).sort().map(tipo => {
            const icono = iconosBebida[tipo] || iconosBebida['default'];
            return `
              <optgroup label="${icono} ${tipo.toUpperCase()}">
                ${bebidasPorTipo[tipo].map(p => {
                  const precio = parseFloat(p.precio) || 0;
                  return `<option value="${p.id}" data-tipo="${p.tipo}" data-precio="${precio}">
                    ${p.nombre} - S/. ${precio.toFixed(2)}
                  </option>`;
                }).join('')}
              </optgroup>
            `;
          }).join('') 
        : ''}
      </select>
      
      <input type="number" class="item-cantidad" min="1" value="1" required 
        style="padding: 8px; border: 2px solid #e2e8f0; border-radius: 6px; font-size: 14px;"
        placeholder="Cant.">
      
      <button type="button" onclick="eliminarItemPromocionEdit('item-edit-${itemId}')" 
        class="btn btn-sm" style="background: #e53e3e; color: white; padding: 8px 12px;" title="Eliminar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  `;
  
  container.insertAdjacentHTML('beforeend', itemHTML);
};
// =====================
// ELIMINAR ITEM DE PROMOCIÓN
// =====================
window.eliminarItemPromocion = function(itemId) {
  const item = document.getElementById(`item-${itemId}`);
  if (item) {
    item.remove();
    console.log('✅ Item eliminado:', itemId);
  }
};

  window.guardarNuevoProducto = async function() {
  const tipoProducto = document.getElementById('tipoProducto').value;
  const form = document.getElementById('formNuevoProducto');
  
  if (!tipoProducto) {
    mostrarNotificacion('Selecciona el tipo de producto', 'warning');
    return;
  }

  if (!form || !form.checkValidity()) {
    form?.reportValidity();
    return;
  }

  let data = {};
  let endpoint = '';

  if (tipoProducto === 'comida') {
    data = {
      nombre: document.getElementById('nombre').value,
      descripcion: document.getElementById('descripcion')?.value || null,
      precio: parseFloat(document.getElementById('precio').value),
      categoria_id: parseInt(document.getElementById('categoria_id').value),
      imagen: document.getElementById('imagen')?.value || null,
      disponible: document.getElementById('disponible')?.checked || true
    };
    endpoint = 'https://raices-back.onrender.com/api/menu/comidas';
    
  } else if (tipoProducto === 'bebida') {
    data = {
      nombre: document.getElementById('nombre').value,
      descripcion: document.getElementById('descripcion')?.value || null,
      precio: parseFloat(document.getElementById('precio').value),
      tamano_ml: parseInt(document.getElementById('tamano_ml')?.value) || null,
      tipo: document.getElementById('tipo')?.value || 'Otro',
      imagen: document.getElementById('imagen')?.value || null,
      disponible: document.getElementById('disponible')?.checked || true
    };
    endpoint = 'https://raices-back.onrender.com/api/menu/bebidas';
    
  } else if (tipoProducto === 'promocion') {
    // Recolectar items
    const itemsElements = document.querySelectorAll('#itemsPromocion > div');
    const items = [];
    
    itemsElements.forEach(itemEl => {
      const select = itemEl.querySelector('.item-producto');
      const cantidad = itemEl.querySelector('.item-cantidad');
      
      if (select.value) {
        const option = select.options[select.selectedIndex];
        items.push({
          producto_id: parseInt(select.value),
          tipo: option.dataset.tipo,
          cantidad: parseInt(cantidad.value),
          precio_unitario: parseFloat(option.dataset.precio)
        });
      }
    });
    
    if (items.length === 0) {
      mostrarNotificacion('Debes agregar al menos un producto a la promoción', 'warning');
      return;
    }
    
    data = {
      titulo: document.getElementById('titulo').value,
      descripcion: document.getElementById('descripcion')?.value || null,
      precio_oferta: parseFloat(document.getElementById('precio_oferta').value),
      imagen: document.getElementById('imagen')?.value || null,
      activo: document.getElementById('activo')?.checked || true,
      items: items
    };
    endpoint = 'https://raices-back.onrender.com/api/menu/promociones';
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al crear producto');
    }

    const result = await response.json();

    mostrarNotificacion('Producto creado exitosamente', 'success');
    document.querySelector('.modal-overlay')?.remove();
    
    // Recargar la pestaña correcta
    if (tipoProducto === 'comida') {
      cargarProductos('comidas');
    } else if (tipoProducto === 'bebida') {
      cargarProductos('bebidas');
    } else if (tipoProducto === 'promocion') {
      cargarProductos('promociones');
    }

  } catch (error) {
    console.error('Error:', error);
    mostrarNotificacion(error.message || 'Error al crear producto', 'error');
  }
};
}

async function cargarCategoriasComida() {
  try {
    const response = await fetch('https://raices-back.onrender.com/api/menu/categorias');
    const categorias = await response.json();
    
    const select = document.getElementById('categoria_id');
    if (select) {
      select.innerHTML = '<option value="">Seleccionar...</option>' +
        categorias.map(cat => `<option value="${cat.id}">${cat.nombre}</option>`).join('');
    }
  } catch (error) {
    console.error('Error cargando categorías:', error);
  }
}

// =====================
// INICIALIZAR
// =====================
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Inicializando productos...');
  
  // Mostrar filtro de categorías por defecto (ya que iniciamos en comidas)
  const filtroCategoriaComida = document.getElementById('filtroCategoriaComida');
  if (filtroCategoriaComida) {
    filtroCategoriaComida.style.display = 'block';
  }
  
  // Cargar categorías primero
  await cargarCategoriasEnFiltro();
  
  // Luego cargar productos
  cargarProductos('comidas');
});

// Hacer funciones globales
window.cambiarTab = cambiarTab;
window.filtrarProductos = filtrarProductos;
window.verDetalleProducto = verDetalleProducto;
window.editarProducto = editarProducto;
window.toggleDisponibilidad = toggleDisponibilidad;
window.abrirModalNuevoProducto = abrirModalNuevoProducto;

console.log('✅ productos.js cargado');