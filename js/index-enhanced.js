// js/index-enhanced.js - VERSIÓN CORREGIDA Y SIMPLIFICADA

const API_URL = "http://localhost:3000/api/menu";

let comidas = [];
let bebidas = [];

console.log("🚀 index-enhanced.js iniciando...");

// =====================
// ESPERAR A QUE EL DOM ESTÉ LISTO
// =====================
if (document.readyState === 'loading') {
  document.addEventListener("DOMContentLoaded", inicializar);
} else {
  inicializar();
}

async function inicializar() {
  console.log("✅ DOM cargado, iniciando carga de datos...");
  
  try {
    // Cargar todo en paralelo
    await Promise.all([
      cargarPlatosDestacados(),
      cargarCategorias()
    ]);
    
    console.log("✅ Todos los datos cargados correctamente");
  } catch (error) {
    console.error("❌ Error en la inicialización:", error);
  }
}

// =====================
// CARGAR PLATOS DESTACADOS
// =====================
async function cargarPlatosDestacados() {
  const grid = document.getElementById("featured-dishes-grid");
  const specialtiesGrid = document.getElementById("specialties-grid");
  
  if (!grid) {
    console.error("❌ No se encontró featured-dishes-grid");
    return;
  }
  
  if (!specialtiesGrid) {
    console.error("❌ No se encontró specialties-grid");
    return;
  }

  try {
    console.log("📡 Cargando platos desde:", API_URL);
    
    // Mostrar spinner
    grid.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Cargando platos deliciosos...</p>
      </div>
    `;
    
    specialtiesGrid.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Cargando especialidades...</p>
      </div>
    `;
    
    const [resComidas, resBebidas] = await Promise.all([
      fetch(`${API_URL}/comidas`),
      fetch(`${API_URL}/bebidas`)
    ]);

    if (!resComidas.ok) {
      throw new Error(`Error al cargar comidas: ${resComidas.status}`);
    }
    
    if (!resBebidas.ok) {
      throw new Error(`Error al cargar bebidas: ${resBebidas.status}`);
    }

    comidas = await resComidas.json();
    bebidas = await resBebidas.json();
    
    // Agregar propiedad 'tipo'
    comidas = comidas.map(c => ({ ...c, tipo: 'comida' }));
    bebidas = bebidas.map(b => ({ ...b, tipo: 'bebida' }));

    console.log("✅ Comidas cargadas:", comidas.length);
    console.log("✅ Bebidas cargadas:", bebidas.length);

    // Mostrar productos
    mostrarPlatosDestacados();
    mostrarEspecialidades();
    
  } catch (error) {
    console.error("❌ Error cargando platos:", error);
    mostrarErrorCarga();
  }
}

// =====================
// MOSTRAR PLATOS DESTACADOS
// =====================
function mostrarPlatosDestacados() {
  const grid = document.getElementById("featured-dishes-grid");
  
  if (!grid) {
    console.error("❌ Grid no encontrado");
    return;
  }

  const todosLosPlatos = [...comidas, ...bebidas];

  if (todosLosPlatos.length === 0) {
    grid.innerHTML = `
      <div class="loading-state">
        <p>No hay platos disponibles</p>
      </div>
    `;
    return;
  }

  // Seleccionar 6 platos aleatorios
  const platosDestacados = todosLosPlatos
    .sort(() => Math.random() - 0.5)
    .slice(0, 6);

  console.log("🍽️ Mostrando", platosDestacados.length, "platos destacados");

  grid.innerHTML = platosDestacados.map(plato => `
    <div class="delivery-card" data-id="${plato.id}">
      <div class="delivery-img">
        <img src="${plato.imagen || 'img/default.jpg'}" alt="${plato.nombre}" onerror="this.src='img/default.jpg'">
      </div>
      <div class="delivery-info">
        <div class="delivery-text">
          <h3>${plato.nombre}</h3>
          <span class="delivery-price">S/ ${plato.precio}</span>
        </div>
        <button class="delivery-btn" onclick="agregarDesdePagina(${plato.id}, '${plato.tipo}', event)">+</button>
      </div>
    </div>
  `).join('');
  
  // Agregar click para ir al menú (excepto en el botón)
  grid.querySelectorAll('.delivery-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (!e.target.closest('.delivery-btn')) {
        window.location.href = 'menu.html';
      }
    });
  });

  console.log("✅ Platos destacados renderizados");
}

// =====================
// MOSTRAR ESPECIALIDADES
// =====================
function mostrarEspecialidades() {
  const grid = document.getElementById("specialties-grid");

  if (!grid) {
    console.error("❌ Grid de especialidades no encontrado");
    return;
  }

  // Buscar especialidades
  let platosAMostrar = comidas.filter(c => 
    c.categoria && c.categoria.toLowerCase().includes("espe")
  ).slice(0, 3);

  // Si no hay especialidades, mostrar platos principales
  if (platosAMostrar.length === 0) {
    platosAMostrar = comidas.filter(c => 
      c.categoria && c.categoria.toLowerCase().includes("plato")
    ).slice(0, 3);
  }

  // Si aún no hay, mostrar los primeros 3
  if (platosAMostrar.length === 0) {
    platosAMostrar = comidas.slice(0, 3);
  }

  if (platosAMostrar.length === 0) {
    grid.innerHTML = `
      <div class="loading-state">
        <p>No hay especialidades disponibles</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = platosAMostrar.map(plato => `
    <div class="delivery-card" data-id="${plato.id}">
      <div class="delivery-img">
        <img src="${plato.imagen || 'img/default.jpg'}" alt="${plato.nombre}" onerror="this.src='img/default.jpg'">
      </div>
      <div class="delivery-info">
        <div class="delivery-text">
          <h3>${plato.nombre}</h3>
          <span class="delivery-price">S/ ${plato.precio}</span>
        </div>
        <button class="delivery-btn" onclick="agregarDesdePagina(${plato.id}, 'comida', event)">+</button>
      </div>
    </div>
  `).join('');
  
  // Agregar click para ir al menú
  grid.querySelectorAll('.delivery-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (!e.target.closest('.delivery-btn')) {
        window.location.href = 'menu.html';
      }
    });
  });

  console.log("✅ Especialidades renderizadas:", platosAMostrar.length);
}

// =====================
// CARGAR CATEGORÍAS
// =====================
async function cargarCategorias() {
  const grid = document.querySelector(".categories-grid");

  if (!grid) {
    console.error("❌ No existe categories-grid");
    return;
  }

  try {
    console.log("📂 Cargando categorías...");
    
    // Mostrar spinner
    grid.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Cargando categorías...</p>
      </div>
    `;

    const res = await fetch(`${API_URL}/categorias`);
    
    if (!res.ok) {
      throw new Error(`Error al cargar categorías: ${res.status}`);
    }
    
    const categorias = await res.json();

    console.log("📂 Categorías recibidas:", categorias.length);

    if (!categorias || categorias.length === 0) {
      grid.innerHTML = `
        <div class="loading-state">
          <p>No hay categorías disponibles</p>
        </div>
      `;
      return;
    }

    mostrarCategorias(categorias, grid);

  } catch (error) {
    console.error("❌ Error cargando categorías:", error);
    grid.innerHTML = `
      <div class="loading-state">
        <p style="color:red;">Error al cargar categorías</p>
      </div>
    `;
  }
}

// =====================
// MOSTRAR CATEGORÍAS
// =====================
function mostrarCategorias(categorias, grid) {
  if (!grid) {
    console.error("❌ Grid no proporcionado");
    return;
  }

  grid.innerHTML = categorias.map(cat => `
    <div class="delivery-card category-delivery" data-id="${cat.id}">
      <div class="delivery-img">
        <img src="${cat.imagen || 'img/default.jpg'}" alt="${cat.nombre}" onerror="this.src='img/default.jpg'">
      </div>
      <div class="delivery-info">
        <div class="delivery-text">
          <h3>${cat.nombre}</h3>
          <span class="delivery-price">Ver platos</span>
        </div>
        <button class="delivery-btn">→</button>
      </div>
    </div>
  `).join('');

  // Redirigir al menú con categoría
  grid.querySelectorAll(".category-delivery").forEach(card => {
    card.addEventListener("click", () => {
      const categoriaId = card.dataset.id;
      const categoriaNombre = card.querySelector('h3').textContent;
      window.location.href = `menu.html?categoria=${encodeURIComponent(categoriaNombre)}`;
    });
  });

  console.log("✅ Categorías renderizadas");
}

// =====================
// AGREGAR AL CARRITO DESDE INDEX
// =====================
window.agregarDesdePagina = async function(productoId, productoTipo, event) {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }

  console.log("➕ Agregar desde index:", productoId, "Tipo:", productoTipo);

  // Verificar sesión
  if (typeof window.verificarSesion !== 'function' || !window.verificarSesion()) {
    console.log("❌ Usuario no autenticado");
    if (typeof mostrarModalAuth === 'function') {
      mostrarModalAuth();
    } else {
      alert("Debes iniciar sesión para agregar productos al carrito");
    }
    return;
  }

  const usuarioActual = window.obtenerUsuarioActual ? window.obtenerUsuarioActual() : null;
  
  if (!usuarioActual || !usuarioActual.id) {
    console.error("❌ No se pudo obtener el usuario");
    if (typeof window.mostrarNotificacion === 'function') {
      window.mostrarNotificacion("Error de sesión", "error");
    }
    return;
  }

  // Buscar el producto
  const todosLosPlatos = [...comidas, ...bebidas];
  const producto = todosLosPlatos.find(p => p.id == productoId);

  if (!producto) {
    console.error("❌ Producto no encontrado:", productoId);
    return;
  }

  console.log("📦 Producto encontrado:", producto);

  try {
    const body = {
      cliente_id: usuarioActual.id,
      producto_id: parseInt(productoId),
      producto_tipo: productoTipo,
      cantidad: 1,
      precio_unitario: parseFloat(producto.precio)
    };

    console.log("📤 Enviando al servidor:", body);

    const response = await fetch(API_CARRITO, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al agregar al carrito');
    }

    const result = await response.json();
    console.log("✅ Producto agregado:", result);

    // Recargar carrito
    if (typeof cargarCarritoDesdeDB === 'function') {
      await cargarCarritoDesdeDB();
    }

    // Actualizar badge
    if (typeof window.actualizarBadgeCarrito === 'function') {
      window.actualizarBadgeCarrito();
    }

    // Notificación
    if (typeof window.mostrarNotificacion === 'function') {
      window.mostrarNotificacion(`${producto.nombre} agregado al carrito`, "success");
    }

    // Feedback visual
    if (event && event.target) {
      const btn = event.target.closest('.delivery-btn');
      if (btn) {
        const originalText = btn.textContent;
        btn.textContent = '✓';
        btn.style.background = '#22c55e';
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '';
        }, 500);
      }
    }

  } catch (error) {
    console.error("❌ Error al agregar al carrito:", error);
    if (typeof window.mostrarNotificacion === 'function') {
      window.mostrarNotificacion("Error al agregar: " + error.message, "error");
    } else {
      alert("Error al agregar al carrito: " + error.message);
    }
  }
};

// =====================
// ERROR DE CARGA
// =====================
function mostrarErrorCarga() {
  const grid = document.getElementById("featured-dishes-grid");
  const specialtiesGrid = document.getElementById("specialties-grid");

  if (grid) {
    grid.innerHTML = `
      <div class="loading-state">
        <p style="color:red;">❌ Error al cargar los platos</p>
        <button onclick="location.reload()" style="margin-top:10px; padding:8px 16px; background:#ef4444; color:white; border:none; border-radius:6px; cursor:pointer;">
          Reintentar
        </button>
      </div>
    `;
  }

  if (specialtiesGrid) {
    specialtiesGrid.innerHTML = `
      <div class="loading-state">
        <p style="color:red;">❌ Error al cargar especialidades</p>
      </div>
    `;
  }
}

console.log("✅ index-enhanced.js cargado completamente");