document.addEventListener("DOMContentLoaded", () => {
    console.log("🔥 banner.js cargado correctamente");

    const slides = document.querySelectorAll(".slide");
    const dotsContainer = document.querySelector(".slider-dots");
    const btnNext = document.querySelector(".next");
    const btnPrev = document.querySelector(".prev");

    // Validaciones para evitar errores
    if (!slides.length) {
        console.error("❌ No se encontraron slides en el HTML.");
        return;
    }
    if (!dotsContainer) {
        console.error("❌ No se encontró el contenedor de dots.");
        return;
    }
    if (!btnNext || !btnPrev) {
        console.error("❌ Botones next/prev no encontrados.");
        return;
    }

    let slideIndex = 0;
    let autoSlideInterval;

    // Crear dots dinámicos
    slides.forEach((_, index) => {
        const dot = document.createElement("button");
        dot.addEventListener("click", () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });

    const dots = document.querySelectorAll(".slider-dots button");

    function showSlide(i) {
        slides.forEach(s => s.classList.remove("active"));
        dots.forEach(d => d.classList.remove("active"));

        slides[i].classList.add("active");
        dots[i].classList.add("active");
    }

    function nextSlide() {
        slideIndex = (slideIndex + 1) % slides.length;
        showSlide(slideIndex);
    }

    function prevSlide() {
        slideIndex = (slideIndex - 1 + slides.length) % slides.length;
        showSlide(slideIndex);
    }

    function goToSlide(i) {
        slideIndex = i;
        showSlide(i);
    }

    function startAutoSlide() {
        autoSlideInterval = setInterval(nextSlide, 5000);
    }

    function stopAutoSlide() {
        clearInterval(autoSlideInterval);
    }

    // Eventos de botones
    btnNext.addEventListener("click", () => {
        stopAutoSlide();
        nextSlide();
        startAutoSlide();
    });

    btnPrev.addEventListener("click", () => {
        stopAutoSlide();
        prevSlide();
        startAutoSlide();
    });

    // Inicializar slider
    showSlide(0);
    startAutoSlide();
});
