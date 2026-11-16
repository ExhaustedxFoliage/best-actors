(() => {
    'use strict';
    const usersKey = 'actorshub-users';
    const sessionKey = 'actorshub-session';
    const forms = window.ActorsForms;

    function readUsers() {
        const raw = localStorage.getItem(usersKey);
        if (!raw) return [];
        const users = JSON.parse(raw);
        if (!Array.isArray(users) || !users.every(user => user && typeof user.id === 'string' &&
            typeof user.name === 'string' && typeof user.email === 'string' && typeof user.phone === 'string' &&
            /^[a-f0-9]{64}$/.test(user.passwordHash) && /^[a-f0-9]{32}$/.test(user.salt) &&
            Number.isFinite(Date.parse(user.createdAt)))) throw new Error('invalid-storage');
        return users;
    }
    function currentUser() {
        const session = JSON.parse(localStorage.getItem(sessionKey) || 'null');
        if (!session || typeof session.userId !== 'string') return null;
        return readUsers().find(user => user.id === session.userId) || null;
    }
    function updateNavigation() {
        let user;
        try { user = currentUser(); } catch { user = null; }
        document.querySelectorAll('[data-account-login]').forEach(link => {
            link.textContent = user ? 'My profile' : 'Log in';
            link.href = user ? 'profile.html' : 'login.html';
            link.removeAttribute('aria-current');
            if (location.pathname.endsWith(user ? '/profile.html' : '/login.html')) link.setAttribute('aria-current', 'page');
        });
        document.querySelectorAll('[data-account-register]').forEach(link => { link.hidden = Boolean(user); });
    }
    const asHex = bytes => Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
    function randomHex() { return asHex(crypto.getRandomValues(new Uint8Array(16))); }
    async function passwordHash(password, salt) {
        if (!window.isSecureContext || !crypto.subtle) throw new Error('crypto-unavailable');
        // A unique salt keeps equal sample passwords from producing equal stored hashes.
        const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
        const saltBytes = Uint8Array.from(salt.match(/.{2}/g), pair => parseInt(pair, 16));
        const result = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: saltBytes, iterations: 150000, hash: 'SHA-256' }, key, 256);
        return asHex(new Uint8Array(result));
    }
    function setStatus(form, text, isError = false) {
        const output = form.querySelector('.form-status');
        output.textContent = text;
        output.dataset.error = String(isError);
    }
    function explainFailure(error) {
        if (error.message === 'crypto-unavailable') return 'Open the HTTPS website or localhost to create and use a demo account.';
        if (error.message === 'invalid-storage' || error instanceof SyntaxError) return 'Saved account data could not be read. Use another browser profile or clear this site’s saved account data, then register again.';
        return 'Your browser could not save or read this demo account. Allow site storage and try again.';
    }
    function setBusy(form, busy, text) {
        form.setAttribute('aria-busy', String(busy));
        form.querySelectorAll('input, button').forEach(field => { field.disabled = busy; });
        const button = form.querySelector('[type="submit"]');
        if (!button.dataset.label) button.dataset.label = button.textContent;
        button.textContent = busy ? text : button.dataset.label;
    }

    document.querySelectorAll('[data-password-toggle]').forEach(button => {
        button.addEventListener('click', () => {
            const field = document.getElementById(button.dataset.passwordToggle);
            const visible = field.type === 'password';
            field.type = visible ? 'text' : 'password';
            button.textContent = visible ? 'Hide' : 'Show';
            button.setAttribute('aria-pressed', String(visible));
        });
    });

    const register = document.getElementById('register-form');
    if (register) {
        const validation = forms.connect(register, {
            name: forms.rules.name,
            email: forms.rules.email,
            phone: forms.rules.phone,
            password: forms.rules.password,
            confirmation: value => value && value === register.elements.password.value ? '' : 'Enter the same password again.'
        });
        register.addEventListener('submit', async event => {
            event.preventDefault();
            if (register.getAttribute('aria-busy') === 'true' || !validation.validate()) return;
            setStatus(register, 'Creating your demo account…');
            setBusy(register, true, 'Creating account…');
            const email = register.elements.email.value.trim().toLowerCase();
            try {
                const salt = randomHex();
                const hash = await passwordHash(register.elements.password.value, salt);
                const users = readUsers();
                if (users.some(user => user.email === email)) {
                    setStatus(register, 'An account with this email already exists. Log in or use another email.', true);
                    return;
                }
                const user = {
                    id: randomHex(), name: register.elements.name.value.trim(), email,
                    phone: register.elements.phone.value.trim(), passwordHash: hash, salt,
                    createdAt: new Date().toISOString()
                };
                localStorage.setItem(usersKey, JSON.stringify([...users, user]));
                validation.reset();
                location.assign('login.html?registered=1');
            } catch (error) { setStatus(register, explainFailure(error), true); }
            finally { setBusy(register, false); }
        });
    }

    const login = document.getElementById('login-form');
    if (login) {
        const validation = forms.connect(login, { email: forms.rules.email, password: forms.rules.password });
        const params = new URLSearchParams(location.search);
        if (params.get('registered') === '1') setStatus(login, 'Account created. Log in with your email and sample password.');
        if (params.get('reason') === 'signin') setStatus(login, 'Log in to view your profile.');
        if (params.get('logout') === '1') setStatus(login, 'You have been logged out.');
        login.addEventListener('submit', async event => {
            event.preventDefault();
            if (login.getAttribute('aria-busy') === 'true' || !validation.validate()) return;
            setStatus(login, 'Checking your details…');
            setBusy(login, true, 'Logging in…');
            try {
                const email = login.elements.email.value.trim().toLowerCase();
                const user = readUsers().find(record => record.email === email);
                const hash = user ? await passwordHash(login.elements.password.value, user.salt) : null;
                if (!user || hash !== user.passwordHash) {
                    setStatus(login, 'Email or password is incorrect. Try again, or create a demo account.', true);
                    return;
                }
                localStorage.setItem(sessionKey, JSON.stringify({ userId: user.id }));
                validation.reset();
                location.assign('profile.html');
            } catch (error) { setStatus(login, explainFailure(error), true); }
            finally { setBusy(login, false); }
        });
    }

    const profile = document.getElementById('profile-details');
    function renderProfile() {
        if (!profile) return;
        try {
            const user = currentUser();
            if (!user) { profile.hidden = true; location.replace('login.html?reason=signin'); return; }
            document.getElementById('profile-name').textContent = user.name;
            document.getElementById('profile-email').textContent = user.email;
            document.getElementById('profile-phone').textContent = user.phone;
            document.getElementById('profile-date').textContent = new Intl.DateTimeFormat('en-GB', { dateStyle: 'long' }).format(new Date(user.createdAt));
            document.getElementById('profile-initials').textContent = user.name.split(/\s+/).slice(0, 2).map(part => Array.from(part)[0]).join('').toUpperCase();
            profile.hidden = false;
        } catch {
            profile.hidden = true;
            document.getElementById('profile-storage-error').hidden = false;
        }
    }
    document.getElementById('logout-button')?.addEventListener('click', () => {
        try {
            localStorage.removeItem(sessionKey);
            profile.hidden = true;
            location.replace('login.html?logout=1');
        } catch {
            document.getElementById('logout-status').textContent = 'Could not clear the session. Allow site storage, then try again.';
        }
    });
    window.addEventListener('storage', event => {
        if ([usersKey, sessionKey, null].includes(event.key)) { updateNavigation(); renderProfile(); }
    });
    window.addEventListener('pageshow', () => { updateNavigation(); renderProfile(); });
    updateNavigation();
    renderProfile();
})();
