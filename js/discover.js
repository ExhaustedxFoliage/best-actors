(() => {
    'use strict';
    const form = document.getElementById('discovery-form');
    const query = document.getElementById('discovery-query');
    const grid = document.getElementById('discovery-grid');
    const status = document.getElementById('discovery-status');
    const loading = document.getElementById('discovery-loading');
    const message = document.getElementById('discovery-message');
    const retry = document.getElementById('retry-search');
    const sort = document.getElementById('result-sort');
    const error = document.getElementById('query-error');
    let controller;
    let requestId = 0;
    let results = [];
    let resultKind = 'shows';
    let lastSearch;

    function kind() { return form.elements.kind.value; }
    function updateSearchLabels() {
        const people = kind() === 'people';
        document.getElementById('query-label').textContent = people ? 'Actor name' : 'Series title';
        query.placeholder = people ? 'Try Brad Pitt or Antony Starr' : 'Try The Boys or Breaking Bad';
        sort.querySelector('[value="rating"]').disabled = people;
        if (people && sort.value === 'rating') sort.value = 'relevance';
    }
    function showMessage(title, text, canRetry = false) {
        message.hidden = false;
        document.getElementById('message-title').textContent = title;
        document.getElementById('message-text').textContent = text;
        retry.hidden = !canRetry;
    }
    function textElement(tag, text, className) {
        const element = document.createElement(tag);
        element.textContent = text;
        if (className) element.className = className;
        return element;
    }
    function allowedUrl(value, hosts) {
        try {
            const url = new URL(value);
            return url.protocol === 'https:' && hosts.includes(url.hostname) ? url.href : '';
        } catch { return ''; }
    }
    function plainSummary(value) {
        // Remote summaries contain HTML. Extract text only; never mount remote markup.
        const parsed = new DOMParser().parseFromString(String(value || ''), 'text/html');
        return parsed.body.textContent.replace(/\s+/g, ' ').trim();
    }
    function createCard(item) {
        const people = resultKind === 'people';
        const card = document.createElement('article');
        card.className = 'discovery-card';
        const imageArea = document.createElement('div');
        imageArea.className = 'discovery-image';
        imageArea.append(textElement('span', people ? 'Portrait unavailable' : 'Poster unavailable'));
        const imageUrl = allowedUrl(item.image?.medium || item.image?.original, ['static.tvmaze.com']);
        if (imageUrl) {
            const image = document.createElement('img');
            image.src = imageUrl;
            image.alt = people ? `Portrait of ${item.name}` : `${item.name} poster`;
            image.loading = 'lazy';
            image.addEventListener('error', () => image.remove(), { once: true });
            imageArea.append(image);
        }
        const content = document.createElement('div');
        content.className = 'discovery-card-content';
        content.append(textElement('h3', item.name));
        const metadata = people
            ? [item.country?.name || 'Country not listed', item.birthday ? `Born ${item.birthday}` : 'Birth date not listed']
            : [item.premiered?.slice(0, 4) || 'Year not listed', item.language || 'Language not listed', Number.isFinite(item.rating?.average) ? `★ ${item.rating.average} / 10` : 'Not rated'];
        content.append(textElement('p', metadata.join(' · '), 'result-meta'));
        let summary = people ? 'Explore this performer’s biography and television credits on TVmaze.' : plainSummary(item.summary);
        if (summary.length > 220) summary = summary.slice(0, 217).trimEnd() + '…';
        content.append(textElement('p', summary || 'No description is available for this series yet.', 'result-summary'));
        const href = allowedUrl(item.url, ['www.tvmaze.com', 'tvmaze.com']);
        if (href) {
            const link = textElement('a', people ? 'Explore actor on TVmaze ↗' : 'Explore series on TVmaze ↗');
            link.href = href;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            content.append(link);
        }
        card.append(imageArea, content);
        return card;
    }
    function renderResults() {
        const ordered = [...results];
        if (sort.value === 'name') ordered.sort((a, b) => a.name.localeCompare(b.name));
        if (sort.value === 'rating' && resultKind === 'shows') ordered.sort((a, b) => (b.rating?.average ?? -1) - (a.rating?.average ?? -1));
        grid.replaceChildren(...ordered.map(createCard));
    }
    async function search(term, type) {
        const clean = term.trim();
        if (!clean || clean.length > 100) {
            error.textContent = clean ? 'Use no more than 100 characters.' : 'Enter an actor name or a series title.';
            query.setAttribute('aria-invalid', 'true');
            query.focus();
            return;
        }
        query.value = clean;
        form.elements.kind.value = type === 'people' ? 'people' : 'shows';
        updateSearchLabels();
        error.textContent = '';
        query.removeAttribute('aria-invalid');
        if (controller) controller.abort();
        controller = new AbortController();
        const currentController = controller;
        const id = ++requestId;
        const timeout = setTimeout(() => currentController.abort(), 12000);
        lastSearch = { query: clean, kind: kind() };
        results = [];
        grid.replaceChildren();
        message.hidden = true;
        loading.hidden = false;
        grid.setAttribute('aria-busy', 'true');
        sort.disabled = true;
        status.textContent = `Searching TVmaze for “${clean}”…`;
        try {
            const response = await fetch(`https://api.tvmaze.com/search/${lastSearch.kind}?q=${encodeURIComponent(clean)}`, { signal: currentController.signal });
            if (!response.ok) throw new Error(response.status === 429 ? 'rate-limit' : 'request-failed');
            const data = await response.json();
            if (!Array.isArray(data)) throw new Error('invalid-response');
            if (id !== requestId) return;
            resultKind = lastSearch.kind;
            results = data.map(row => resultKind === 'people' ? row.person : row.show).filter(item => item && typeof item.name === 'string');
            try { localStorage.setItem('actorshub-discovery', JSON.stringify(lastSearch)); } catch { /* Searching works without storage. */ }
            status.textContent = `${results.length} ${resultKind === 'people' ? 'actors' : 'series'} found for “${clean}”.`;
            if (results.length) renderResults();
            else showMessage('No matches this time.', 'Try a shorter title, another spelling, or switch between TV series and Actors.');
        } catch (failure) {
            if (id !== requestId) return;
            status.textContent = 'The search could not be completed.';
            const explanation = failure.message === 'rate-limit'
                ? 'TVmaze is receiving too many requests. Wait a moment and try again.'
                : failure.name === 'AbortError' ? 'The request took too long. Check your connection and try again.'
                : 'We could not reach TVmaze. Check your connection and try again. Your actor collection is still available from the navigation.';
            showMessage('Let’s try that again.', explanation, true);
        } finally {
            clearTimeout(timeout);
            if (id === requestId) {
                loading.hidden = true;
                grid.removeAttribute('aria-busy');
                sort.disabled = false;
            }
        }
    }
    form.addEventListener('submit', event => { event.preventDefault(); search(query.value, kind()); });
    form.querySelectorAll('[name="kind"]').forEach(radio => radio.addEventListener('change', () => {
        updateSearchLabels();
        if (query.value.trim()) search(query.value, kind());
    }));
    query.addEventListener('input', () => { error.textContent = ''; query.removeAttribute('aria-invalid'); });
    document.querySelectorAll('[data-query]').forEach(button => button.addEventListener('click', () => search(button.dataset.query, button.dataset.kind)));
    retry.addEventListener('click', () => { if (lastSearch) search(lastSearch.query, lastSearch.kind); });
    sort.addEventListener('change', renderResults);
    let saved;
    try { saved = JSON.parse(localStorage.getItem('actorshub-discovery')); } catch { saved = null; }
    search(typeof saved?.query === 'string' && saved.query.trim() && saved.query.length <= 100 ? saved.query : 'The Boys', saved?.kind === 'people' ? 'people' : 'shows');
})();
