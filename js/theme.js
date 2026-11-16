(() => {
    'use strict';
    const key = 'actorshub-theme';
    const preference = window.matchMedia('(prefers-color-scheme: dark)');
    let selected;
    try { selected = localStorage.getItem(key); } catch { selected = null; }

    function applyTheme(theme) {
        document.documentElement.dataset.theme = theme;
        document.querySelectorAll('.theme-toggle').forEach(button => {
            button.setAttribute('aria-checked', String(theme === 'dark'));
        });
    }
    applyTheme(selected === 'light' || selected === 'dark' ? selected : preference.matches ? 'dark' : 'light');
    document.addEventListener('DOMContentLoaded', () => {
        applyTheme(document.documentElement.dataset.theme);
        document.querySelectorAll('.theme-toggle').forEach(button => {
            button.addEventListener('click', () => {
                selected = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
                applyTheme(selected);
                try { localStorage.setItem(key, selected); } catch { /* The current page still changes when storage is unavailable. */ }
            });
        });
    });
    window.addEventListener('storage', event => {
        if (event.key !== key && event.key !== null) return;
        selected = event.newValue;
        applyTheme(selected === 'light' || selected === 'dark' ? selected : preference.matches ? 'dark' : 'light');
    });
    preference.addEventListener('change', () => {
        if (selected !== 'light' && selected !== 'dark') applyTheme(preference.matches ? 'dark' : 'light');
    });
})();
