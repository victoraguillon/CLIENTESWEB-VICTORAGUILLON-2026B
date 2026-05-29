

document.addEventListener('DOMContentLoaded', () => {
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.content-section');
    const sidebar = document.getElementById('sidebar');
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const cursorGlow = document.getElementById('cursorGlow');
    const contactForm = document.getElementById('contactForm');
    const formFeedback = document.getElementById('formFeedback');

    
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

    // ----- FORMULARIO DE CONTACTO (envío por mailto) -----
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const subject = document.getElementById('subject').value.trim() || 'Nuevo mensaje desde el sitio';
        const message = document.getElementById('message').value.trim();
        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn.querySelector('.btn-text').textContent;

        const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=victormaguillono2b@gmail.com&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Nombre: ${name}\nCorreo: ${email}\n\n${message}`)}`;

        submitBtn.querySelector('.btn-text').textContent = 'Abriendo Gmail...';
        submitBtn.disabled = true;

        window.open(gmailLink, '_blank', 'noopener,noreferrer');

        setTimeout(() => {
            formFeedback.innerHTML = '<p style="color: var(--success);"><i class="fa-solid fa-circle-check"></i> Se abrió Gmail en una nueva pestaña. Completa y envía el mensaje para contactarme.</p>';
            submitBtn.querySelector('.btn-text').textContent = originalText;
            submitBtn.disabled = false;
        }, 1500);
    });

    const hobbyCards = document.querySelectorAll('.hobby-card');

    const createHobbyOverlay = (card) => {
        const image = card.querySelector('img.hobby-photo');
        const title = card.querySelector('h4').textContent;
        const text = card.querySelector('p').innerHTML;
        const iconHTML = card.querySelector('.hobby-icon-wrapper').innerHTML;

        const overlay = document.createElement('div');
        overlay.className = 'hobby-overlay';
        overlay.innerHTML = `
            <div class="hobby-overlay-content" role="dialog" aria-modal="true" aria-label="${title}">
                <button class="hobby-overlay-close" aria-label="Cerrar vista ampliada">×</button>
                <div class="hobby-icon-wrapper">${iconHTML}</div>
                <img src="${image?.src || ''}" alt="${image?.alt || title}" class="hobby-overlay-image">
                <h3 class="hobby-overlay-title">${title}</h3>
                <p class="hobby-overlay-text">${text}</p>
            </div>
        `;

        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';

        const closeOverlay = () => {
            document.body.style.overflow = '';
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
            document.removeEventListener('keydown', onKeydown);
        };

        const onKeydown = (e) => {
            if (e.key === 'Escape') {
                closeOverlay();
            }
        };

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeOverlay();
            }
        });

        const closeButton = overlay.querySelector('.hobby-overlay-close');
        if (closeButton) {
            closeButton.addEventListener('click', closeOverlay);
        }

        document.addEventListener('keydown', onKeydown);
    };

    hobbyCards.forEach(card => {
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');

        card.addEventListener('click', () => {
            createHobbyOverlay(card);
        });

        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                createHobbyOverlay(card);
            }
        });
    });

  
    const anyActive = document.querySelector('.content-section.active');
    if (!anyActive) {
        switchSection('personal');
    }
});

