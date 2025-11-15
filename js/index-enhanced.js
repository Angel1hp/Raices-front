// js/index-enhanced.js - Cargar platos destacados y especialidades

const API_URL = "http://localhost:3000/api/menu";

let comidas = [];
let bebidas = [];

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ index-enhanced.js cargado");
  cargarPlatosDestacados();
cargarCategorias(); // 👈 NUEVO

});

// =====================
// CARGAR PLATOS DESTACADOS
// =====================
async function cargarPlatosDestacados() {
  try {
    console.log("📡 Cargando platos desde API...");
    
    const resComidas = await fetch(`${API_URL}/comidas`);
    const resBebidas = await fetch(`${API_URL}/bebidas`);

    comidas = await resComidas.json();
    bebidas = await resBebidas.json();

    console.log("✅ Comidas cargadas:", comidas.length);
    console.log("✅ Bebidas cargadas:", bebidas.length);

    mostrarPlatosDestacados();
    mostrarEspecialidades();
    
  } catch (error) {
    console.error("❌ Error cargando platos:", error);
    mostrarErrorCarga();
  }
}
// =====================
// CARGAR CATEGORÍAS
// =====================
async function cargarCategorias() {
  try {
    console.log("📂 Cargando categorías desde la API...");

    const res = await fetch(`${API_URL}/categorias`);
    const categorias = await res.json();

    console.log("📂 Categorías recibidas:", categorias.length);

    mostrarCategorias(categorias);

  } catch (error) {
    console.error("❌ Error cargando categorías:", error);
  }
}

// =====================
// MOSTRAR PLATOS DESTACADOS (ENORMES DELIVERY)
// =====================
function mostrarPlatosDestacados() {
  const grid = document.getElementById("featured-dishes-grid");

  if (!grid) return console.error("❌ Grid de platos destacados no encontrado");

  const todosLosPlatos = [...comidas, ...bebidas];

  const platosDestacados = todosLosPlatos
    .sort(() => Math.random() - 0.5)
    .slice(0, 6);

  console.log("🍽️ Mostrando", platosDestacados.length, "platos destacados");

  grid.innerHTML = platosDestacados.map(plato => `
    <div class="delivery-card" data-id="${plato.id}">
      <div class="delivery-img">
        <img src="${plato.imagen || 'img/default.jpg'}" alt="${plato.nombre}">
      </div>

      <div class="delivery-info">
        <div class="delivery-text">
          <h3>${plato.nombre}</h3>
          <span class="delivery-price">S/ ${plato.precio}</span>
        </div>

<button class="delivery-btn" onclick="agregarDesdePagina('${plato.id}', event)">+</button>
      </div>
    </div>
  `).join('');
}

// =====================
// MOSTRAR ESPECIALIDADES (TAMBIÉN ENORMES DELIVERY)
// =====================
function mostrarEspecialidades() {
  const grid = document.getElementById("specialties-grid");

  if (!grid) return console.error("❌ Grid de especialidades no encontrado");

  const especialidades = comidas
    .filter(c => c.categoria && c.categoria.toLowerCase().includes("espe"))
    .slice(0, 3);

  const platosAMostrar = especialidades.length > 0 
    ? especialidades 
    : comidas.filter(c => c.categoria && c.categoria.toLowerCase().includes("plato")).slice(0, 3);

  if (platosAMostrar.length === 0) {
    grid.innerHTML = `<div class="loading-state">
      <p>No hay especialidades disponibles ahora</p>
    </div>`;
    return;
  }

  grid.innerHTML = platosAMostrar.map(plato => `
    <div class="delivery-card" data-id="${plato.id}">
      <div class="delivery-img">
        <img src="${plato.imagen || 'img/default.jpg'}" alt="${plato.nombre}">
      </div>

      <div class="delivery-info">
        <div class="delivery-text">
          <h3>${plato.nombre}</h3>
          <span class="delivery-price">S/ ${plato.precio}</span>
        </div>

<button class="delivery-btn" onclick="agregarDesdePagina('${plato.id}', event)">+</button>
      </div>
    </div>
  `).join('');

  document.querySelectorAll(".delivery-card").forEach(card => {
    card.addEventListener("click", () => {
      window.location.href = "menu.html";
    });
  });
}

// =====================
// AGREGAR AL CARRITO DESDE INDEX
// =====================
window.agregarDesdePagina = function(productoId, event) {
    if (event) event.stopPropagation(); // 🔥 evita redirección accidental

    console.log("➕ Agregar desde index:", productoId);

    const usuario = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');
    if (!usuario) {
        mostrarModalAuth();
        return;
    }

    const todosLosPlatos = [...comidas, ...bebidas];
    const producto = todosLosPlatos.find(p => p.id == productoId);

    if (!producto) return;

    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    const yaExiste = carrito.find(item => item.id == productoId);

    if (yaExiste) {
        yaExiste.cantidad++;
    } else {
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: parseFloat(producto.precio),
            imagen: producto.imagen,
            cantidad: 1
        });
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));

    if (typeof actualizarBadgeCarrito === "function") {
        actualizarBadgeCarrito();
    }

    mostrarNotificacion(`${producto.nombre} agregado`, "success");
};


// =====================
// MODAL DE AUTENTICACIÓN
// =====================
function mostrarModalAuth() {
  const modal = document.getElementById("authModalOverlay");
  const closeBtn = document.getElementById("authModalClose");

  if (!modal) return;

  modal.classList.add("active");

  closeBtn?.addEventListener("click", cerrarModalAuth);

  modal.addEventListener("click", e => {
    if (e.target === modal) cerrarModalAuth();
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") cerrarModalAuth();
  });
}

function cerrarModalAuth() {
  document.getElementById("authModalOverlay")?.classList.remove("active");
}

// =====================
// NOTIFICACIONES
// =====================
function mostrarNotificacion(mensaje, tipo = 'info') {
  const notif = document.createElement("div");
  notif.className = `notification ${tipo}`;
  notif.textContent = mensaje;

  document.body.appendChild(notif);

  setTimeout(() => {
    notif.classList.add("hide");
    setTimeout(() => notif.remove(), 300);
  }, 2000);
}

// =====================
// ERROR DE CARGA
// =====================
function mostrarErrorCarga() {
  const grid = document.getElementById("featured-dishes-grid");
  const specialtiesGrid = document.getElementById("specialties-grid");

  if (grid) {
    grid.innerHTML = `<div class="loading-state">
      <p style="color:red;">Error al cargar los platos.</p>
    </div>`;
  }

  if (specialtiesGrid) {
    specialtiesGrid.innerHTML = `<div class="loading-state">
      <p style="color:red;">Error al cargar especialidades.</p>
    </div>`;
  }
}
// =====================
// MOSTRAR CATEGORÍAS ENORMES EN INDEX
// =====================
function mostrarCategorias(categorias) {
  const grid = document.querySelector(".categories-grid");

  if (!grid) {
    console.error("❌ No existe categories-grid");
    return;
  }

  grid.innerHTML = categorias.map(cat => `
    <div class="delivery-card category-delivery" data-id="${cat.id}">
      <div class="delivery-img">
        <img src="${cat.imagen || 'img/default.jpg'}" alt="${cat.nombre}">
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

  // Redirección al menú
  document.querySelectorAll(".category-delivery").forEach(card => {
    card.addEventListener("click", () => {
      window.location.href = "menu.html?categoria=" + card.dataset.id;
    });
  });
}
