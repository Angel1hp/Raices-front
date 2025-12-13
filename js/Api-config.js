// api-config.js - Configuración centralizada de la API
// =====================================================

// 🌐 URL del backend
const API_BASE_URL = "https://raices-back.onrender.com";

// 📡 Endpoints de la API
const API_ENDPOINTS = {
  // Auth
  AUTH: `${API_BASE_URL}/api/auth`,
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTRO: `${API_BASE_URL}/api/auth/registro`,
  DATOS_FORMULARIO: `${API_BASE_URL}/api/auth/datos-formulario`,
  
  // Menu
  MENU: `${API_BASE_URL}/api/menu`,
  COMIDAS: `${API_BASE_URL}/api/menu/comidas`,
  BEBIDAS: `${API_BASE_URL}/api/menu/bebidas`,
  CATEGORIAS: `${API_BASE_URL}/api/menu/categorias`,
  
  // Carrito
  CARRITO: `${API_BASE_URL}/api/carrito`,
  
  // Checkout
  CHECKOUT: `${API_BASE_URL}/api/checkout`,
  ORDENES: `${API_BASE_URL}/api/checkout/ordenes`,
};

// Exportar para uso global
window.API_CONFIG = {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: API_ENDPOINTS
};

console.log("✅ API Config cargada:", API_BASE_URL);