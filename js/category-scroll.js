// category-scroll.js - Drag-to-scroll con soporte táctil y mouse
document.addEventListener('DOMContentLoaded', () => {
  const wrapper = document.querySelector('.categories-wrapper');
  if (!wrapper) return;

  let isDown = false;
  let startX;
  let scrollStart;

  // Mouse
  wrapper.addEventListener('mousedown', (e) => {
    isDown = true;
    wrapper.classList.add('dragging');
    startX = e.pageX - wrapper.getBoundingClientRect().left;
    scrollStart = wrapper.scrollLeft;
    e.preventDefault();
  });

  wrapper.addEventListener('mouseleave', () => {
    if (isDown) {
      isDown = false;
      wrapper.classList.remove('dragging');
    }
  });

  wrapper.addEventListener('mouseup', () => {
    isDown = false;
    wrapper.classList.remove('dragging');
  });

  wrapper.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - wrapper.getBoundingClientRect().left;
    const walk = (x - startX) * 1.2; // multiplica la distancia para mayor sensibilidad
    wrapper.scrollLeft = scrollStart - walk;
  });

  // Touch (móviles)
  let touchStartX = 0;
  let touchScrollStart = 0;

  wrapper.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    touchStartX = e.touches[0].pageX - wrapper.getBoundingClientRect().left;
    touchScrollStart = wrapper.scrollLeft;
  }, {passive: true});

  wrapper.addEventListener('touchmove', (e) => {
    if (e.touches.length !== 1) return;
    const x = e.touches[0].pageX - wrapper.getBoundingClientRect().left;
    const walk = (x - touchStartX) * 1.2;
    wrapper.scrollLeft = touchScrollStart - walk;
  }, {passive: false});

  // Opcional: Ajuste para que cuando el contenido sea menor o igual a 5 tarjetas, desactivar el drag y bloquear scroll
  const categoryCount = wrapper.querySelectorAll('.category-btn').length;
  const visibleCards = 5;
  if (categoryCount <= visibleCards) {
    // bloquear scroll (no se necesita)
    wrapper.style.overflowX = 'hidden';
    wrapper.style.cursor = 'default';
  }
});
