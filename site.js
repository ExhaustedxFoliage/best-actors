(() => {
  'use strict';
  const clock = document.querySelector('.clock');
  const time = clock.querySelector('time');
  const formatter = new Intl.DateTimeFormat('en-GB', {month:'short', day:'2-digit', hour:'2-digit', minute:'2-digit', second:'2-digit'});
  function updateClock() { const now = new Date(); time.dateTime = now.toISOString(); time.textContent = formatter.format(now); }
  updateClock(); setInterval(updateClock, 1000);
  let audio;
  clock.addEventListener('click', async () => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    try {
      audio ||= new AudioContext();
      await audio.resume();
      const oscillator = audio.createOscillator();
      const volume = audio.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audio.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(440, audio.currentTime + .1);
      volume.gain.setValueAtTime(.12, audio.currentTime);
      volume.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .16);
      oscillator.connect(volume); volume.connect(audio.destination);
      oscillator.start(); oscillator.stop(audio.currentTime + .17);
    } catch { /* Browsers without audio support still display the clock. */ }
  });
  const copy = document.getElementById('copy-info');
  if (copy) copy.addEventListener('click', async () => {
    const text = [document.querySelector('h1').textContent, document.querySelector('.biography-text').innerText, 'Selected performances:', ...Array.from(document.querySelectorAll('.film-card h3'), el => el.textContent)].join('\n\n');
    const status = document.getElementById('copy-status');
    try {
      if (!navigator.clipboard || !window.isSecureContext) throw new Error('Use fallback');
      await navigator.clipboard.writeText(text);
      status.textContent = 'Actor information copied!';
    } catch {
      const field = document.createElement('textarea');
      field.value = text; field.style.position = 'fixed'; field.style.opacity = '0';
      document.body.append(field); field.select();
      const copied = document.execCommand('copy'); field.remove(); copy.focus();
      status.textContent = copied ? 'Actor information copied!' : 'Copy is unavailable. Select the biography text to copy it manually.';
    }
  });
  const form = document.getElementById('feedback-form');
  const dialog = document.getElementById('feedback-success');
  if (form && dialog) {
    form.addEventListener('submit', event => {
      event.preventDefault();
      const empty = Array.from(form.querySelectorAll('[required]')).find(field => !field.value.trim());
      if (empty) { empty.setCustomValidity('Please fill out this field.'); empty.reportValidity(); return; }
      if (!form.reportValidity()) return;
      form.reset(); dialog.showModal();
    });
    form.addEventListener('input', event => event.target.setCustomValidity(''));
    document.getElementById('close-success').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      const rect = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
    });
  }
})();

// jQuery search and animated statistics, shared by all five actor pages.
if (window.jQuery) jQuery(function ($) {
  const $input = $('#actor-search-input');
  if (!$input.length) return;
  const $rows = $('.catalog-row');
  const $results = $('#actor-search-results');
  const actors = $('.site-header nav a').filter(function () { return $(this).text() !== 'Home'; }).map(function () {
    return { label: $(this).text(), href: $(this).attr('href'), kind: 'Actor' };
  }).get();
  const titles = $rows.map(function () {
    const $cells = $(this).children('td');
    return { label: $cells.eq(0).text(), role: $cells.eq(1).text(), href: '#popular-films', kind: $cells.eq(3).text() };
  }).get();
  function search() {
    const query = $input.val().trim().toLowerCase();
    let visible = 0;
    $rows.each(function () {
      const match = !query || $(this).text().toLowerCase().includes(query);
      this.hidden = !match;
      if (match) visible++;
    });
    $('#catalog-empty').prop('hidden', visible > 0);
    $results.empty();
    const matches = query ? actors.concat(titles).filter(item => (item.label + ' ' + (item.role || '')).toLowerCase().includes(query)) : [];
    matches.forEach(item => {
      const $link = $('<a>').attr('href', item.href).append($('<span>').text(item.label), $('<small>').text(item.kind));
      $('<li>').append($link).appendTo($results);
    });
    $results.prop('hidden', !matches.length);
    $('#search-status').text(query ? `${matches.length} search results · ${visible} titles in the table.` : 'Search the five actors and this actor’s film collection.');
  }
  $input.on('input', search);
  $('#clear-search').on('click', function () { $input.val(''); search(); $input.trigger('focus'); });
  $results.on('click', 'a[href="#popular-films"]', function () {
    $input.val($(this).find('span').text()); search();
  });
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const counters = $('.counter[data-count]');
  let started = false;
  function animateCounters() {
    if (started) return;
    started = true;
    counters.each(function () {
      const element = this;
      const target = Number(element.dataset.count);
      if (reduceMotion.matches) { element.textContent = target; return; }
      $({ count: 0 }).animate({ count: target }, {
        duration: 1500, easing: 'swing',
        step: function (value) { element.textContent = Math.floor(value); },
        complete: function () { element.textContent = target; }
      });
    });
  }
  const statistics = document.getElementById('actor-statistics');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { animateCounters(); observer.disconnect(); }
    }, { threshold: .25 });
    observer.observe(statistics.querySelector('.stats-grid'));
    // Also handle restored scroll positions and browsers that delay observer callbacks.
    const checkVisibility = () => {
      const bounds = statistics.querySelector('.stats-grid').getBoundingClientRect();
      if (bounds.top < window.innerHeight && bounds.bottom > 0) {
        animateCounters();
        observer.disconnect();
        window.removeEventListener('scroll', checkVisibility);
        window.removeEventListener('resize', checkVisibility);
      }
    };
    window.addEventListener('scroll', checkVisibility, { passive: true });
    window.addEventListener('resize', checkVisibility);
    checkVisibility();
  } else animateCounters();
});
