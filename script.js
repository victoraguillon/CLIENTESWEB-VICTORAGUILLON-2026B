/* =============================================
   LÓGICA DE NAVEGACIÓN, MENÚ MÓVIL, FORMULARIO
   Y EFECTO DE CURSOR
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {
    // ----- ELEMENTOS DEL DOM -----
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.content-section');
    const sidebar = document.getElementById('sidebar');
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const cursorGlow = document.getElementById('cursorGlow');
    const contactForm = document.getElementById('contactForm');
    const formFeedback = document.getElementById('formFeedback');

    // ----- CAMBIO DE SECCIÓN ACTIVA -----
    function switchSection(sectionId) {
        sections.forEach(section => section.classList.remove('active'));
        navButtons.forEach(btn => {
            btn.classList.remove('active');
            btn.removeAttribute('aria-current');
        });

        const targetSection = document.getElementById(`section-${sectionId}`);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        const activeButton = document.querySelector(`.nav-btn[data-section="${sectionId}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
            activeButton.setAttribute('aria-current', 'page');
        }

        if (window.innerWidth <= 900) {
            sidebar.classList.remove('open');
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
        }
    }

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const sectionId = button.getAttribute('data-section');
            if (sectionId) {
                switchSection(sectionId);
            }
        });
    });

    // ----- MENÚ MÓVIL -----
    mobileMenuToggle.addEventListener('click', () => {
        const isOpen = sidebar.classList.toggle('open');
        mobileMenuToggle.setAttribute('aria-expanded', isOpen);
    });

    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 900) {
            const clickedInsideSidebar = sidebar.contains(e.target);
            const clickedToggle = mobileMenuToggle.contains(e.target);
            if (!clickedInsideSidebar && !clickedToggle && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
            }
        }
    });

    // ----- EFECTO DE LUZ QUE SIGUE AL CURSOR -----
    let mouseX = 0, mouseY = 0;
    let isMouseOnScreen = false;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (!isMouseOnScreen) {
            isMouseOnScreen = true;
            cursorGlow.style.opacity = '1';
        }
        cursorGlow.style.transform = `translate(${mouseX - 150}px, ${mouseY - 150}px)`;
    });

    document.addEventListener('mouseleave', () => {
        isMouseOnScreen = false;
        cursorGlow.style.opacity = '0';
    });

    document.addEventListener('mouseenter', () => {
        if (mouseX && mouseY) {
            isMouseOnScreen = true;
            cursorGlow.style.opacity = '1';
        }
    });

    // ----- FORMULARIO DE CONTACTO (SIMULACIÓN) -----
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn.querySelector('.btn-text').textContent;
        submitBtn.querySelector('.btn-text').textContent = 'Enviando...';
        submitBtn.disabled = true;

        setTimeout(() => {
            formFeedback.innerHTML = '<p style="color: var(--success);"><i class="fa-solid fa-circle-check"></i> ¡Mensaje enviado con éxito! Gracias por contactarme.</p>';
            contactForm.reset();
            submitBtn.querySelector('.btn-text').textContent = originalText;
            submitBtn.disabled = false;

            setTimeout(() => {
                formFeedback.innerHTML = '';
            }, 5000);
        }, 1500);
    });

    // ----- INICIALIZACIÓN -----
    const anyActive = document.querySelector('.content-section.active');
    if (!anyActive) {
        switchSection('personal');
    }
});

 // <!-- FINAL -->