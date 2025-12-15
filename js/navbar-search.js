// js/navbar-search.js - Buscador adaptado a tu navbar

/**
 * BUSCADOR DEL NAVBAR
 * Compatible con la estructura existente de navbar.html
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('🔍 Inicializando buscador del navbar...');
  
  // Seleccionar el input de búsqueda de tu navbar
  const searchInput = document.querySelector('.search-bar');
  
  if (!searchInput) {
    console.warn('⚠️ No se encontró el input de búsqueda (.search-bar)');
    return;
  }

  console.log('✅ Input de búsqueda encontrado');

  // Función para realizar la búsqueda
  function performSearch(searchTerm) {
    if (!searchTerm || searchTerm.trim() === '') {
      console.log('⚠️ Término de búsqueda vacío');
      return;
    }

    const trimmedSearch = searchTerm.trim();
    console.log('🔍 Buscando:', trimmedSearch);

    // Verificar en qué página estamos
    const currentPage = window.location.pathname.split('/').pop();
    
    // Si ya estamos en menu.html, actualizar búsqueda directamente
    if (currentPage === 'menu.html') {
      // Buscar el input de búsqueda de la página de menú
      const menuSearchInput = document.querySelector('#searchInput') ||
                              document.querySelector('.search-input') ||
                              document.querySelector('input[type="search"]');
      
      if (menuSearchInput) {
        // Actualizar el valor del input
        menuSearchInput.value = trimmedSearch;
        
        // Disparar evento de input para activar el filtrado
        const event = new Event('input', { bubbles: true });
        menuSearchInput.dispatchEvent(event);
        
        // También disparar change por si acaso
        const changeEvent = new Event('change', { bubbles: true });
        menuSearchInput.dispatchEvent(changeEvent);
        
        // Limpiar el input del navbar
        searchInput.value = '';
        
        // Scroll suave hacia los productos
        setTimeout(() => {
          const menuGrid = document.querySelector('#menu-grid');
          if (menuGrid) {
            menuGrid.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start',
              inline: 'nearest'
            });
          }
        }, 300);
        
        console.log('✅ Búsqueda aplicada en menu.html');
      } else {
        console.warn('⚠️ No se encontró el input de búsqueda en menu.html');
      }
    } else {
      // Si estamos en otra página, redirigir a menu.html con el parámetro
      console.log('📍 Redirigiendo a menu.html con búsqueda');
      window.location.href = `menu.html?search=${encodeURIComponent(trimmedSearch)}`;
    }
  }

  // Manejar Enter en el input
  searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const searchTerm = searchInput.value;
      performSearch(searchTerm);
    }
  });

  // Manejar click en el icono de búsqueda (si existe)
  const searchIcon = document.querySelector('.search-icon');
  if (searchIcon) {
    searchIcon.style.cursor = 'pointer';
    searchIcon.addEventListener('click', function() {
      const searchTerm = searchInput.value;
      performSearch(searchTerm);
    });
    console.log('✅ Click en icono configurado');
  }

  // Aplicar búsqueda desde URL al cargar menu.html
  if (window.location.pathname.includes('menu.html')) {
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    
    if (searchParam) {
      console.log('🔍 Parámetro de búsqueda en URL:', searchParam);
      
      // Esperar a que el DOM y los scripts del menú estén listos
      setTimeout(() => {
        const menuSearchInput = document.querySelector('#searchInput') ||
                                document.querySelector('.search-input') ||
                                document.querySelector('input[type="search"]');
        
        if (menuSearchInput) {
          // Actualizar valor
          menuSearchInput.value = searchParam;
          
          // Disparar eventos
          const inputEvent = new Event('input', { bubbles: true });
          menuSearchInput.dispatchEvent(inputEvent);
          
          const changeEvent = new Event('change', { bubbles: true });
          menuSearchInput.dispatchEvent(changeEvent);
          
          console.log('✅ Búsqueda desde URL aplicada');
          
          // Scroll hacia resultados después de un delay
          setTimeout(() => {
            const menuGrid = document.querySelector('#menu-grid');
            if (menuGrid) {
              menuGrid.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
              });
            }
          }, 500);
          
          // Limpiar URL (opcional)
          // window.history.replaceState({}, document.title, 'menu.html');
        } else {
          console.warn('⚠️ Input de búsqueda del menú no encontrado aún, reintentando...');
          
          // Reintentar después de más tiempo
          setTimeout(() => {
            const retryInput = document.querySelector('#searchInput') ||
                              document.querySelector('.search-input');
            if (retryInput) {
              retryInput.value = searchParam;
              const event = new Event('input', { bubbles: true });
              retryInput.dispatchEvent(event);
              console.log('✅ Búsqueda aplicada en segundo intento');
            }
          }, 1000);
        }
      }, 500);
    }
  }

  // Opcional: Limpiar búsqueda con Escape
  searchInput.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      searchInput.value = '';
      searchInput.blur();
    }
  });

  // Opcional: Agregar placeholder dinámico
  const placeholders = [
    'Buscar ceviche...',
    'Buscar lomo saltado...',
    'Buscar pollo a la brasa...',
    'Buscar ají de gallina...',
    'Buscar productos...'
  ];
  
  let placeholderIndex = 0;
  setInterval(() => {
    if (document.activeElement !== searchInput) {
      placeholderIndex = (placeholderIndex + 1) % placeholders.length;
      searchInput.placeholder = placeholders[placeholderIndex];
    }
  }, 3000);

  console.log('✅ Buscador del navbar configurado correctamente');
});

/**
 * NOTA: Este script funciona con tu estructura actual:
 * - Input: .search-bar
 * - Container: .search-container
 * - Icon: .search-icon
 * 
 * Funcionalidades:
 * ✅ Enter para buscar
 * ✅ Click en icono para buscar
 * ✅ Redirección a menu.html desde otras páginas
 * ✅ Búsqueda directa en menu.html sin recargar
 * ✅ URL con parámetros: menu.html?search=termino
 * ✅ Escape para limpiar
 * ✅ Placeholder dinámico
 */