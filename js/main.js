document.addEventListener('DOMContentLoaded', () => {
    const registrationSection = document.getElementById('registration');
    const form = document.getElementById('registration-form');
    const message = document.getElementById('form-message');
    const registerButtons = document.querySelectorAll('.btn-register');

    // =============================================
    // Yandex Metrika goals helper
    // =============================================
    function ymGoal(name) {
        if (typeof ym === 'function') {
            ym(110949451, 'reachGoal', name);
        }
    }

    // =============================================
    // Sticky CTA visibility
    // =============================================
    const stickyCta = document.getElementById('sticky-cta');
    if (stickyCta) {
        const hero = document.querySelector('.hero');
        const observer = new IntersectionObserver(
            ([entry]) => {
                stickyCta.classList.toggle('visible', !entry.isIntersecting);
            },
            { threshold: 0, rootMargin: '-300px 0px 0px 0px' }
        );
        if (hero) observer.observe(hero);

        // Scroll to form on sticky CTA click
        const stickyBtn = stickyCta.querySelector('[data-scroll-to]');
        if (stickyBtn && registrationSection) {
            stickyBtn.addEventListener('click', () => {
                ymGoal('sticky_cta_click');
                registrationSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        }
    }

    // =============================================
    // Scroll-to-form on tariff buttons
    // =============================================
    registerButtons.forEach((button) => {
        button.addEventListener('click', () => {
            ymGoal('cta_click');
            if (!registrationSection) {
                return;
            }
            registrationSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    if (!form) {
        return;
    }

    // =============================================
    // Social proof counter
    // =============================================
    fetch('api/count.php')
        .then(r => r.json())
        .then(data => {
            if (data.ok) {
                const countEl = document.getElementById('registered-count');
                const placesEl = document.getElementById('places-left');
                if (countEl) countEl.textContent = data.count;
                if (placesEl) placesEl.textContent = Math.max(0, 14 - data.count);
            }
        })
        .catch(() => {});

    // =============================================
    // Phone mask
    // =============================================
    const phoneInput = form.querySelector('input[name="phone"]');
    if (phoneInput) {
        phoneInput.addEventListener('input', () => {
            let value = phoneInput.value.replace(/\D/g, '');
            if (value.startsWith('7')) value = value.slice(1);
            if (value.startsWith('8')) value = value.slice(1);

            let masked = '+7';
            if (value.length > 0) masked += ' (' + value.slice(0, 3);
            if (value.length >= 4) masked += ') ' + value.slice(3, 6);
            if (value.length >= 7) masked += '-' + value.slice(6, 8);
            if (value.length >= 9) masked += '-' + value.slice(8, 10);

            phoneInput.value = masked;
        });
    }

    // =============================================
    // Real-time field validation on blur
    // =============================================
    const formFields = form.querySelectorAll('input[required], textarea[required]');
    formFields.forEach(field => {
        field.addEventListener('blur', () => {
            const isValid = field.value.trim().length > 0;
            field.classList.toggle('field-error', !isValid);
            field.classList.toggle('field-valid', isValid);
        });
    });

    // =============================================
    // 2-step form navigation
    // =============================================
    const step1 = document.getElementById('form-step-1');
    const step2 = document.getElementById('form-step-2');
    const nextBtn = document.getElementById('btn-next-step');
    const backBtn = document.getElementById('btn-back');

    if (nextBtn && step1 && step2) {
        nextBtn.addEventListener('click', () => {
            const name = step1.querySelector('input[name="name"]')?.value.trim();
            const phone = step1.querySelector('input[name="phone"]')?.value.trim();
            if (!name) { alert('Укажите имя'); return; }
            if (!phone || phone.replace(/\D/g, '').length < 10) { alert('Укажите корректный телефон'); return; }
            step1.classList.add('hidden');
            step2.classList.remove('hidden');
            ymGoal('form_step1_complete');
        });
    }

    if (backBtn && step1 && step2) {
        backBtn.addEventListener('click', () => {
            step2.classList.add('hidden');
            step1.classList.remove('hidden');
        });
    }

    // =============================================
    // Exit-intent popup
    // =============================================
    const exitPopup = document.getElementById('exit-popup');
    const exitClose = document.getElementById('exit-popup-close');

    if (exitPopup && !sessionStorage.getItem('exitPopupShown')) {
        document.addEventListener('mouseleave', (e) => {
            if (e.clientY <= 0) {
                exitPopup.classList.add('active');
                sessionStorage.setItem('exitPopupShown', 'true');
                ymGoal('exit_intent_shown');
            }
        });

        if (exitClose) {
            exitClose.addEventListener('click', () => exitPopup.classList.remove('active'));
        }

        exitPopup.addEventListener('click', (e) => {
            if (e.target === exitPopup || e.target.classList.contains('exit-popup-overlay')) {
                exitPopup.classList.remove('active');
            }
        });

        // Exit popup form submission
        const exitForm = document.getElementById('exit-popup-form');
        if (exitForm) {
            exitForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const phone = exitForm.querySelector('input[name="phone"]')?.value.trim();
                if (!phone || phone.replace(/\D/g, '').length < 10) {
                    alert('Укажите корректный телефон');
                    return;
                }
                ymGoal('exit_intent_phone');
                alert('Спасибо! Мы перезвоним вам в ближайшее время.');
                exitPopup.classList.remove('active');
                exitForm.reset();
            });
        }
    }

    // =============================================
    // Countdown timer
    // =============================================
    function updateCountdown() {
        const target = new Date('2026-08-15T10:00:00+03:00');
        const now = new Date();
        const diff = target - now;

        if (diff <= 0) return;

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        const dEl = document.getElementById('countdown-days');
        const hEl = document.getElementById('countdown-hours');
        const mEl = document.getElementById('countdown-minutes');
        if (dEl) dEl.textContent = days;
        if (hEl) hEl.textContent = hours;
        if (mEl) mEl.textContent = minutes;
    }

    updateCountdown();
    setInterval(updateCountdown, 60000);

    // =============================================
    // Scroll depth tracking
    // =============================================
    let trackedDepths = new Set();
    document.addEventListener('scroll', () => {
        const scrollPercent = Math.round(
            (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100
        );
        [25, 50, 75, 100].forEach(depth => {
            if (scrollPercent >= depth && !trackedDepths.has(depth)) {
                trackedDepths.add(depth);
                ymGoal('scroll_' + depth);
            }
        });
    });

    // =============================================
    // Form submission
    // =============================================
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const submitButton = form.querySelector('button[type="submit"]');
        const formData = new FormData(form);

        if (submitButton instanceof HTMLButtonElement) {
            submitButton.disabled = true;
        }

        if (message) {
            message.textContent = '';
            message.className = 'form-message';
        }

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok || !data.ok) {
                throw new Error(data.error || 'Не удалось отправить заявку.');
            }

            ymGoal('form_submit');

            if (message) {
                message.textContent = 'Заявка успешно отправлена. Мы свяжемся с вами в ближайшее время.';
                message.className = 'form-message success';
            }

            form.reset();
        } catch (error) {
            if (message) {
                message.textContent = error instanceof Error ? error.message : 'Не удалось отправить заявку.';
                message.className = 'form-message error';
            }
        } finally {
            if (submitButton instanceof HTMLButtonElement) {
                submitButton.disabled = false;
            }
        }
    });
});
