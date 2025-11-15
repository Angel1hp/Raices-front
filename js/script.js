// main JS: carga navbar y maneja menú dinámico
document.addEventListener('DOMContentLoaded', () => {
  // cargar navbar
  const container = document.getElementById('navbar-container');
  if(container){
    fetch('navbar.html')
      .then(r => r.text())
      .then(html => {
        container.innerHTML = html;
        initNavbar();
      })
      .catch(err => console.error('No se pudo cargar navbar', err));
  } else {
    // si no hay contenedor, aún intentamos inicializar si navbar ya está en el DOM
    initNavbar();
  }

  // Inicializar menú en menu.html
  initMenu();
  initContactForm();
});

function initNavbar(){
  const toggle = document.getElementById('menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  if(toggle && navLinks){
    toggle.addEventListener('click', () => navLinks.classList.toggle('show'));
  }
}


