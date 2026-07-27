document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registration-form');
    const message = document.getElementById('form-message');
    const selectedPlan = document.getElementById('selected-plan');
    const nameInput = form?.querySelector('[name="name"]');

    function reachGoal(goalName) {
        if (typeof ym === 'function') {
            ym(110949451, 'reachGoal', goalName);
        }
    }

    function scrollToTarget(target) {
        const elementId = target === 'pricing' ? 'pricing' : 'registration';
        const element = document.getElementById(elementId);

        if (!element) {
            return;
        }

        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    document.querySelectorAll('.btn-secondary[data-scroll-target]').forEach((button) => {
        button.addEventListener('click', () => {
            scrollToTarget(button.dataset.scrollTarget || 'registration');
        });
    });

    document.querySelectorAll('.btn-register').forEach((button) => {
        button.addEventListener('click', () => {
            const plan = button.dataset.plan;

            if (selectedPlan) {
                if (plan) {
                    selectedPlan.textContent = `Выбран тариф: ${plan}`;
                    selectedPlan.hidden = false;
                } else {
                    selectedPlan.textContent = '';
                    selectedPlan.hidden = true;
                }
            }

            scrollToTarget(button.dataset.scrollTarget || 'registration');
            reachGoal('cta_click');

            window.setTimeout(() => {
                nameInput?.focus();
            }, 500);
        });
    });

    if (!form) {
        return;
    }

    let formFocusTracked = false;

    form.addEventListener('focusin', () => {
        if (formFocusTracked) {
            return;
        }

        formFocusTracked = true;
        reachGoal('form_focus');
    });

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

            reachGoal('lead_submit');

            if (message) {
                message.textContent = 'Заявка отправлена! Мы перезвоним в течение дня и подтвердим место.';
                message.className = 'form-message success';
            }

            if (selectedPlan) {
                selectedPlan.textContent = '';
                selectedPlan.hidden = true;
            }

            form.reset();
        } catch (error) {
            reachGoal('form_submit_fail');

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
