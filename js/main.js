document.addEventListener('DOMContentLoaded', () => {
    const METRIKA_ID = 110949451;
    const registrationSection = document.getElementById('registration');
    const pricingSection = document.getElementById('pricing');
    const form = document.getElementById('registration-form');
    const message = document.getElementById('form-message');
    const selectedPlan = document.getElementById('selected-plan');
    const nameInput = form ? form.querySelector('input[name="name"]') : null;
    const registerButtons = document.querySelectorAll('.btn-register');
    const secondaryButtons = document.querySelectorAll('[data-scroll-target]');

    const reachGoal = (goal, params) => {
        if (typeof ym === 'function') {
            ym(METRIKA_ID, 'reachGoal', goal, params || {});
        }
    };

    const scrollToTarget = (target) => {
        if (target === 'pricing' && pricingSection) {
            pricingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }

        if (registrationSection) {
            registrationSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const applyPlan = (plan) => {
        if (!selectedPlan) {
            return;
        }

        if (plan) {
            selectedPlan.hidden = false;
            selectedPlan.textContent = `Выбранный тариф: ${plan}`;
        } else {
            selectedPlan.hidden = true;
            selectedPlan.textContent = '';
        }
    };

    const goToRegistration = (plan) => {
        applyPlan(plan || '');
        scrollToTarget('registration');
        reachGoal('cta_click', { plan: plan || 'none' });

        window.setTimeout(() => {
            if (nameInput instanceof HTMLInputElement) {
                nameInput.focus({ preventScroll: true });
            }
        }, 450);
    };

    registerButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const plan = button.getAttribute('data-plan') || '';
            const target = button.getAttribute('data-scroll-target') || 'registration';

            if (target === 'pricing') {
                scrollToTarget('pricing');
                reachGoal('cta_click', { plan: 'to_pricing' });
                return;
            }

            goToRegistration(plan);
        });
    });

    secondaryButtons.forEach((button) => {
        if (button.classList.contains('btn-register')) {
            return;
        }

        button.addEventListener('click', () => {
            const target = button.getAttribute('data-scroll-target') || 'registration';
            scrollToTarget(target);
            reachGoal('cta_secondary', { target });
        });
    });

    if (!form) {
        return;
    }

    form.addEventListener('focusin', () => {
        reachGoal('form_focus');
    }, { once: true });

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

            if (message) {
                message.textContent = 'Заявка отправлена. Мы свяжемся с вами в ближайшее время, чтобы подтвердить место.';
                message.className = 'form-message success';
            }

            reachGoal('lead_submit');
            form.reset();
            applyPlan('');
        } catch (error) {
            if (message) {
                message.textContent = error instanceof Error ? error.message : 'Не удалось отправить заявку.';
                message.className = 'form-message error';
            }
            reachGoal('form_submit_fail');
        } finally {
            if (submitButton instanceof HTMLButtonElement) {
                submitButton.disabled = false;
            }
        }
    });
});
