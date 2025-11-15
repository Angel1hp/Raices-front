// js/menu-filters.js - Sistema de filtros y paginación

// Variables globales
let productosFiltrados = [];
let paginaActual = 1;
const productosPorPagina = 9; // 3 filas x 3 columnas
let minPrecio = 0;
let maxPrecio = 100;

// Esperar a que main.js esté listo
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ menu-filters.js cargado");
  
  // Esperar a que los productos se carguen
  setTimeout(() => {
    inicializarFiltros();
  }, 500);
});

// =====================
// INICIALIZAR FILTROS
// =====================
function inicializarFiltros() {
  console.log("🔧 Inicializando filtros");
  
  // Calcular el precio máximo real de los productos
  if (typeof comidas !== 'undefined' && typeof bebidas !== 'undefined') {
    const todosLosProductos = [...comidas, ...bebidas];
    if (todosLosProductos.length > 0) {
      const precios = todosLosProductos.map(p => parseFloat(p.precio));
      maxPrecio = Math.ceil(Math.max(...precios));
      
      // Actualizar inputs
      document.getElementById('maxPrice').value = maxPrecio;
      document.getElementById('priceRange').max = maxPrecio;
      document.getElementById('priceRange').value = maxPrecio;
      document.getElementById('maxPriceLabel').textContent = `S/ ${maxPrecio}`;
      
      console.log(`💰 Precio máximo detectado: S/ ${maxPrecio}`);
    }
  }
  
  configurarEventosFiltros();
}

// =====================
// CONFIGURAR EVENTOS
// =====================
function configurarEventosFiltros() {
  const minPriceInput = document.getElementById('minPrice');
  const maxPriceInput = document.getElementById('maxPrice');
  const priceRange = document.getElementById('priceRange');
  const clearFilters = document.getElementById('clearFilters');
  const quickFilters = document.querySelectorAll('.quick-filter-btn');

  // Inputs de precio
  if (minPriceInput) {
    minPriceInput.addEventListener('input', (e) => {
      minPrecio = parseFloat(e.target.value) || 0;
      aplicarFiltros();
    });
  }

  if (maxPriceInput) {
    maxPriceInput.addEventListener('input', (e) => {
      const valor = parseFloat(e.target.value) || maxPrecio;
      maxPrecio = valor;
      priceRange.value = valor;
      document.getElementById('maxPriceLabel').textContent = `S/ ${valor}`;
      aplicarFiltros();
    });
  }

  // Range slider
  if (priceRange) {
    priceRange.addEventListener('input', (e) => {
      const valor = parseFloat(e.target.value);
      maxPrecio = valor;
      maxPriceInput.value = valor;
      document.getElementById('maxPriceLabel').textContent = `S/ ${valor}`;
      aplicarFiltros();
    });
  }

  // Limpiar filtros
  if (clearFilters) {
    clearFilters.addEventListener('click', () => {
      minPrecio = 0;
      maxPrecio = Math.ceil(Math.max(...[...comidas, ...bebidas].map(p => parseFloat(p.precio))));
      minPriceInput.value = 0;
      maxPriceInput.value = maxPrecio;
      priceRange.value = maxPrecio;
      document.getElementById('maxPriceLabel').textContent = `S/ ${maxPrecio}`;
      
      // Quitar clase active de filtros rápidos
      quickFilters.forEach(btn => btn.classList.remove('active'));
      
      aplicarFiltros();
      console.log("🧹 Filtros limpiados");
    });
  }

  // Filtros rápidos
  quickFilters.forEach(btn => {
    btn.addEventListener('click', () => {
      const range = btn.dataset.range.split('-');
      minPrecio = parseFloat(range[0]);
      maxPrecio = parseFloat(range[1]);
      
      minPriceInput.value = minPrecio;
      maxPriceInput.value = maxPrecio;
      priceRange.value = maxPrecio;
      document.getElementById('maxPriceLabel').textContent = `S/ ${maxPrecio}`;
      
      // Activar botón
      quickFilters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      aplicarFiltros();
    });
  });

  console.log("✅ Eventos de filtros configurados");
}

// =====================
// APLICAR FILTROS
// =====================
function aplicarFiltros() {
  console.log(`🔍 Aplicando filtros: S/ ${minPrecio} - S/ ${maxPrecio}`);
  
  // Obtener productos actuales según categoría activa
  const categoriaActiva = document.querySelector('.category-btn.active');
  if (!categoriaActiva) return;
  
  const categoria = categoriaActiva.dataset.cat;
  let productos = obtenerProductosPorCategoria(categoria);
  
  // Aplicar filtro de búsqueda si existe
  const searchInput = document.getElementById('searchInput');
  if (searchInput && searchInput.value.trim()) {
    const searchTerm = searchInput.value.toLowerCase().trim();
    productos = productos.filter(prod => 
      prod.nombre.toLowerCase().includes(searchTerm) ||
      (prod.descripcion && prod.descripcion.toLowerCase().includes(searchTerm))
    );
  }
  
  // Filtrar por precio
  productosFiltrados = productos.filter(prod => {
    const precio = parseFloat(prod.precio);
    return precio >= minPrecio && precio <= maxPrecio;
  });
  
  console.log(`✅ ${productosFiltrados.length} productos encontrados`);
  
  // Actualizar contador
  const totalProducts = document.getElementById('totalProducts');
  if (totalProducts) {
    totalProducts.textContent = productosFiltrados.length;
  }
  
  // Resetear a página 1
  paginaActual = 1;
  
  // Mostrar productos paginados
  mostrarProductosPaginados();
}

// =====================
// MOSTRAR PRODUCTOS PAGINADOS
// =====================
function mostrarProductosPaginados() {
  const inicio = (paginaActual - 1) * productosPorPagina;
  const fin = inicio + productosPorPagina;
  const productosPagina = productosFiltrados.slice(inicio, fin);
  
  console.log(`📄 Mostrando página ${paginaActual}: productos ${inicio + 1} - ${Math.min(fin, productosFiltrados.length)}`);
  
  // Usar la función existente de main.js
  if (typeof mostrarProductos === 'function') {
    mostrarProductos(productosPagina);
  }
  
  // Actualizar paginación
  actualizarPaginacion();
}

// =====================
// ACTUALIZAR PAGINACIÓN
// =====================
function actualizarPaginacion() {
  const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);
  const paginationContainer = document.getElementById('paginationContainer');
  const paginationPages = document.getElementById('paginationPages');
  const prevBtn = document.getElementById('prevPage');
  const nextBtn = document.getElementById('nextPage');
  
  if (!paginationContainer || !paginationPages) return;
  
  // Mostrar/ocultar paginación
  if (totalPaginas <= 1) {
    paginationContainer.style.display = 'none';
    return;
  }
  
  paginationContainer.style.display = 'flex';
  
  // Generar números de página
  paginationPages.innerHTML = '';
  
  const maxPaginasVisibles = 5;
  let inicioPagina = Math.max(1, paginaActual - Math.floor(maxPaginasVisibles / 2));
  let finPagina = Math.min(totalPaginas, inicioPagina + maxPaginasVisibles - 1);
  
  if (finPagina - inicioPagina < maxPaginasVisibles - 1) {
    inicioPagina = Math.max(1, finPagina - maxPaginasVisibles + 1);
  }
  
  // Primera página
  if (inicioPagina > 1) {
    paginationPages.appendChild(crearBotonPagina(1));
    if (inicioPagina > 2) {
      paginationPages.appendChild(crearEllipsis());
    }
  }
  
  // Páginas visibles
  for (let i = inicioPagina; i <= finPagina; i++) {
    paginationPages.appendChild(crearBotonPagina(i));
  }
  
  // Última página
  if (finPagina < totalPaginas) {
    if (finPagina < totalPaginas - 1) {
      paginationPages.appendChild(crearEllipsis());
    }
    paginationPages.appendChild(crearBotonPagina(totalPaginas));
  }
  
  // Botones prev/next
  if (prevBtn) {
    prevBtn.disabled = paginaActual === 1;
    prevBtn.onclick = () => {
      if (paginaActual > 1) {
        paginaActual--;
        mostrarProductosPaginados();
      }
    };
  }
  
  if (nextBtn) {
    nextBtn.disabled = paginaActual === totalPaginas;
    nextBtn.onclick = () => {
      if (paginaActual < totalPaginas) {
        paginaActual++;
        mostrarProductosPaginados();
      }
    };
  }
  
  console.log(`📊 Paginación actualizada: ${paginaActual}/${totalPaginas}`);
}

// =====================
// CREAR BOTÓN DE PÁGINA
// =====================
function crearBotonPagina(numero) {
  const btn = document.createElement('button');
  btn.className = 'pagination-number';
  btn.textContent = numero;
  
  if (numero === paginaActual) {
    btn.classList.add('active');
  }
  
  btn.addEventListener('click', () => {
    paginaActual = numero;
    mostrarProductosPaginados();
  });
  
  return btn;
}

// =====================
// CREAR ELLIPSIS
// =====================
function crearEllipsis() {
  const ellipsis = document.createElement('span');
  ellipsis.className = 'pagination-ellipsis';
  ellipsis.textContent = '...';
  return ellipsis;
}

// =====================
// HACER FUNCIONES GLOBALES
// =====================
window.aplicarFiltros = aplicarFiltros;
window.mostrarProductosPaginados = mostrarProductosPaginados;

// Hook en las funciones de main.js
if (typeof mostrarCategoria !== 'undefined') {
  const originalMostrarCategoria = mostrarCategoria;
  window.mostrarCategoria = function(categoria) {
    originalMostrarCategoria(categoria);
    setTimeout(() => {
      aplicarFiltros();
    }, 100);
  };
}

console.log("✅ Sistema de filtros y paginación listo");