$(document).ready(function() {
    console.log("jQuery is ready!"); // Task 0

    // ==========================================
    // 1. SOUND EFFECTS (Web Audio API)
    // ==========================================
    function playClickSound() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.04);

            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.04);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.04);
        } catch (e) {
            console.log("Audio not supported or blocked");
        }
    }

    $(document).on('click', 'button, .btn', function() {
        playClickSound();
    });


    // ==========================================
    // 2. TIME & DATE (Живые часы)
    // ==========================================
    function updateDateTime() {
        const datetimeElement = document.getElementById('datetime-display');
        if (!datetimeElement) return;

        const now = new Date();
        const options = { 
            year: 'numeric', month: 'long', day: 'numeric', 
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true 
        };
        datetimeElement.textContent = now.toLocaleString('en-US', options);
    }
    updateDateTime();
    setInterval(updateDateTime, 1000);


    // ==========================================
    // 3. DYNAMIC RATING STARS
    // ==========================================
    $('#rating-stars .star').on('click', function() {
        let ratingValue = $(this).data('value');
        let message = '';
        switch(ratingValue) {
            case 1: message = '1 Star - Poor'; break;
            case 2: message = '2 Stars - Fair'; break;
            case 3: message = '3 Stars - Good'; break;
            case 4: message = '4 Stars - Very Good'; break;
            case 5: message = '5 Stars - Excellent!'; break;
            default: message = 'Rated';
        }

        $('#rating-stars .star').each(function(i) {
            if (i < ratingValue) {
                $(this).css({ color: '#ffc107', transform: 'scale(1.2)' });
            } else {
                $(this).css({ color: '#ccc', transform: 'scale(1.0)' });
            }
        });

        $('#rating-output').text(`You rated: ${message}`);
    });


    // ==========================================
    // 4. DYNAMIC MOVIE CATALOG (.map() & .filter())
    // ==========================================
    const moviesData = [
        { id: 1, title: "Drive", year: 2011, desc: "A mysterious Hollywood stuntman and getaway driver.", image: "https://static0.colliderimages.com/wordpress/wp-content/uploads/2021/09/DRIVE.jpg?q=70&fit=crop&w=600" },
        { id: 2, title: "La La Land", year: 2016, desc: "A pianist and an actress fall in love in LA.", image: "https://wallpaperaccess.com/full/184724.jpg" },
        { id: 3, title: "Blade Runner 2049", year: 2017, desc: "Discovery of a long-buried secret leads to Deckard.", image: "https://static0.srcdn.com/wordpress/wp-content/uploads/2017/05/Ryan-Gosling-from-the-Blade-Runner-2049-poster.jpg?q=50&fit=crop&w=600" },
        { id: 4, title: "Barbie", year: 2023, desc: "Stereotypical Barbie has an existential crisis.", image: "photos/barbie.webp" }
    ];

    const $container = $('#dynamic-cards-container');

    function renderMovies(arr) {
        if (!$container.length) return;
        $container.html(arr.map(movie => `
            <div class="col-12 col-md-6 col-lg-3 searchable-item">
                <div class="card actor-card h-100" style="transition: transform 0.3s ease;">
                    <img src="${movie.image}" class="card-img-top" alt="${movie.title}" style="height: 150px; object-fit: cover;">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${movie.title} (${movie.year})</h5>
                        <p class="card-text small">${movie.desc}</p>
                        <span class="badge bg-primary mt-auto">ID: ${movie.id}</span>
                    </div>
                </div>
            </div>
        `).join(''));
    }

    renderMovies(moviesData);

    $('#filter-all-btn').on('click', function() {
        renderMovies(moviesData);
        $(".searchable-item .card-title").each(function () { originalTitles.set(this, $(this).text()); });
        searchMovies();
    });

    $('#filter-recent-btn').on('click', function() {
        const filtered = moviesData.filter(m => m.year >= 2015);
        renderMovies(filtered);
        $(".searchable-item .card-title").each(function () { originalTitles.set(this, $(this).text()); });
        searchMovies();
    });


    // ==========================================
    // 5. PART 1. JQUERY SEARCH, FILTER & HIGHLIGHT
    // ==========================================
    $('#search-input').after($('<div>', { id: 'autocomplete-list' }));
    const suggestions = $('.searchable-item .card-title').map(function () { return $(this).text().trim(); }).get();
    const originalTitles = new Map();
    $('.searchable-item .card-title').each(function () { originalTitles.set(this, $(this).text()); });
    function searchMovies() {
        const query = $('#search-input').val().trim().toLowerCase();
        $('.searchable-item').each(function () {
            const title = $(this).find('.card-title')[0];
            const text = originalTitles.get(title) || $(this).text();
            $(this).toggle(text.toLowerCase().includes(query));
            if (!title) return;
            $(title).empty();
            let cursor = 0;
            let index;
            while (query && (index = text.toLowerCase().indexOf(query, cursor)) !== -1) {
                title.append(document.createTextNode(text.slice(cursor, index)));
                $('<mark>').text(text.slice(index, index + query.length)).appendTo(title);
                cursor = index + query.length;
            }
            title.append(document.createTextNode(text.slice(cursor)));
        });
    }
    $('#search-input').on('input keyup', function () {
        searchMovies();
        const query = $(this).val().trim().toLowerCase();
        const $list = $('#autocomplete-list').empty();
        suggestions.filter(title => query && title.toLowerCase().includes(query)).forEach(title => {
            $('<button>', { type: 'button', class: 'suggestion-item d-block w-100 p-2 text-start', text: title }).appendTo($list);
        });
    });
    $(document).on('click', '.suggestion-item', function () {
        $('#search-input').val($(this).text());
        $('#autocomplete-list').empty();
        searchMovies();
    });
    $(document).on('click', function (event) {
        if (!$(event.target).closest('#search-section').length) $('#autocomplete-list').empty();
    });

    // ==========================================
    // 6. PART 2. UX ENGAGEMENT ELEMENTS
    // ==========================================

    // Task 4: Scroll Progress Bar
    $(window).on('scroll', function() {
        let winScroll = $(window).scrollTop();
        let height = $(document).height() - $(window).height();
        let scrolled = (winScroll / height) * 100;
        $('#scroll-progress').css('width', scrolled + '%');
    });

    // Task 5: Animated Number Counter
    let counted = false;
    $(window).on('scroll', function() {
        let $statsSection = $('#stats-section');
        if ($statsSection.length) {
            let statsOffset = $statsSection.offset();
            if (statsOffset && !counted && $(window).scrollTop() + $(window).height() > statsOffset.top) {
                $('.counter').each(function() {
                    let $this = $(this);
                    let countTo = $this.attr('data-count') || 1000;
                    $({ countNum: 0 }).animate({
                        countNum: countTo
                    }, {
                        duration: 2000,
                        easing: 'swing',
                        step: function() {
                            $this.text(Math.floor(this.countNum));
                        },
                        complete: function() {
                            $this.text(this.countNum + "+");
                        }
                    });
                });
                counted = true;
            }
        }
    });

    // Task 6: Form Validation (с красными рамками ошибок) & Loading Spinner
    $('#feedback form').on('submit', function(e) {
        e.preventDefault();

        const nameInput = $('#name');
        const emailInput = $('#email');
        const commentInput = $('#comment');

        let isValid = true;
        let errorMessages = [];
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (nameInput.length && nameInput.val().trim() === '') {
            isValid = false;
            nameInput.addClass('is-invalid');
            errorMessages.push('Name is required.');
        } else if (nameInput.length) {
            nameInput.removeClass('is-invalid');
        }

        if (emailInput.length && (emailInput.val().trim() === '' || !emailRegex.test(emailInput.val().trim()))) {
            isValid = false;
            emailInput.addClass('is-invalid');
            errorMessages.push('Valid email address is required.');
        } else if (emailInput.length) {
            emailInput.removeClass('is-invalid');
        }

        if (commentInput.length && commentInput.val().trim() === '') {
            isValid = false;
            commentInput.addClass('is-invalid');
            errorMessages.push('Comment cannot be empty.');
        } else if (commentInput.length) {
            commentInput.removeClass('is-invalid');
        }

        if (!isValid) {
            alert('Please fix the following errors:\n- ' + errorMessages.join('\n- '));
            return;
        }

        // Лоадер и блокировка кнопки при успешной валидации
        let $submitBtn = $(this).find('button[type="submit"]');
        $submitBtn.prop('disabled', true);
        let originalText = $submitBtn.text();
        $submitBtn.html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Please wait...');

        setTimeout(function() {
            $submitBtn.prop('disabled', false);
            $submitBtn.text(originalText);
            showToast('Feedback validated successfully. Demo only: nothing was sent.');
            $('#feedback form')[0].reset();
            $('#name, #email, #comment').removeClass('is-invalid');
        }, 2000);
    });


    // ==========================================
    // 7. ACCORDION FOR FAQS
    // ==========================================
    $('.accordion-header-custom').on('click', function() {
        let $body = $(this).next('.accordion-body-custom');
        if ($body.length) {
            let isVisible = $body.is(':visible');
            $('.accordion-body-custom').slideUp();
            if (!isVisible) {
                $body.slideDown();
            }
        }
    });


    // ==========================================
    // 8. THEME BACKGROUND TOGGLE
    // ==========================================
    const colors = ['#cfe0f1', '#f3e8d8', '#e0eee5', '#eee4f2', '#ececec'];
    let colorIndex = 0;
    $('#theme-toggle-btn').on('click', function() {
        colorIndex = (colorIndex + 1) % colors.length;
        $('body').css({
            'background-color': colors[colorIndex],
            'transition': 'background-color 0.5s ease'
        });
    });


    // ==========================================
    // 9. POPUP MODAL (Subscribe / Contact)
    // ==========================================
    $('#open-popup-btn').on('click', function() {
        $('#popup-modal').css('display', 'flex');
    });
    $('#close-popup-btn, #popup-modal').on('click', function(e) {
        if (e.target === this || e.target.id === 'close-popup-btn') {
            $('#popup-modal').css('display', 'none');
        }
    });

    function showToast(message) {
        $('#mansur-toast').stop(true, true).text(message).fadeIn(150).delay(2400).fadeOut(350);
    }
    let copyTimer;
    $('#mansur-copy').on('click', async function () {
        try {
            await navigator.clipboard.writeText($('#mansur-share').val());
            clearTimeout(copyTimer);
            $(this).text('✓ Copied');
            $('#mansur-copy-tooltip').prop('hidden', false);
            showToast('Copied to clipboard!');
            copyTimer = setTimeout(() => { $('#mansur-copy').text('Copy link'); $('#mansur-copy-tooltip').prop('hidden', true); }, 3000);
        } catch (error) {
            $('#mansur-share')[0].select();
            showToast('Copy unavailable. Select the link and copy it manually.');
        }
    });
    $('#mansur-share').val(location.href.split('#')[0]);
    function loadVisibleImages() {
        $('img[data-src]:visible').each(function () {
            const bounds = this.getBoundingClientRect();
            if (bounds.top <= innerHeight && bounds.bottom >= 0) $(this).attr('src', $(this).attr('data-src')).removeAttr('data-src');
        });
    }
    $(window).on('scroll resize load', loadVisibleImages);
    $('.carousel').on('slide.bs.carousel', event => $(event.relatedTarget).find('img[data-src]').each(function () { $(this).attr('src', $(this).attr('data-src')).removeAttr('data-src'); }));
    loadVisibleImages();

});