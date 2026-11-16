(() => {
    'use strict';
    const rules = {
        name(value) {
            const text = value.trim();
            if (!text) return 'Enter your name.';
            return text.length < 2 || text.length > 80 ? 'Use between 2 and 80 characters for your name.' : '';
        },
        email(value) {
            const text = value.trim();
            if (!text) return 'Enter your email address.';
            return text.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text) ? 'Enter an email like alex@example.com.' : '';
        },
        phone(value, optional = false) {
            const text = value.trim();
            if (!text) return optional ? '' : 'Enter your phone number.';
            const digits = text.replace(/\D/g, '');
            return !/^\+?[\d ()-]+$/.test(text) || digits.length < 10 || digits.length > 15
                ? 'Use 10–15 digits, with an optional +, spaces, brackets or hyphens.' : '';
        },
        password(value) {
            if (!value) return 'Enter a password.';
            if (value.length < 8 || value.length > 128) return 'Use between 8 and 128 characters.';
            return !/[a-z]/.test(value) || !/[A-Z]/.test(value) || !/\d/.test(value) || !/[^A-Za-z0-9\s]/.test(value)
                ? 'Include uppercase and lowercase letters, a number and a symbol.' : '';
        },
        comment(value) {
            if (!value.trim()) return 'Share a thought about this performance.';
            return value.length > 2000 ? 'Keep your feedback within 2,000 characters.' : '';
        }
    };

    function connect(form, fieldRules) {
        const touched = new Set();
        function validateField(name) {
            const field = form.elements.namedItem(name);
            const message = fieldRules[name](field.value);
            const output = document.getElementById(`${field.id}-error`);
            output.textContent = message;
            field.setAttribute('aria-invalid', String(Boolean(message)));
            return !message;
        }
        Object.keys(fieldRules).forEach(name => {
            const field = form.elements.namedItem(name);
            field.addEventListener('blur', () => { touched.add(name); validateField(name); });
            field.addEventListener('input', () => {
                if (touched.has(name)) validateField(name);
                if (name === 'password' && touched.has('confirmation')) validateField('confirmation');
            });
            field.addEventListener('change', () => { if (touched.has(name)) validateField(name); });
        });
        return {
            validate() {
                let firstInvalid;
                Object.keys(fieldRules).forEach(name => {
                    touched.add(name);
                    if (!validateField(name) && !firstInvalid) firstInvalid = form.elements.namedItem(name);
                });
                if (firstInvalid) firstInvalid.focus();
                return !firstInvalid;
            },
            reset() {
                form.reset();
                touched.clear();
                Object.keys(fieldRules).forEach(name => {
                    const field = form.elements.namedItem(name);
                    field.removeAttribute('aria-invalid');
                    document.getElementById(`${field.id}-error`).textContent = '';
                });
            }
        };
    }
    window.ActorsForms = { rules, connect };
})();
