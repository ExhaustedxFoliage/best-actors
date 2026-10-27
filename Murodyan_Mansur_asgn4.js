document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. SOUNDS EFFECTS (Web Audio API — no files)
    // ==========================================
    function playClickSound() {
        try {
            // audio context
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();

            // oscillator
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine'; // sine wave for a soft click sound
            // frequency: start at 600Hz and quickly drop to 200Hz for a click effect
            osc.frequency.setValueAtTime(600, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.04);

            // Volume
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.04);

            // Connections
            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.04);
        } catch (e) {
            console.log("Audio not supported or blocked");
        }
    }

    // for all buttons and elements with class 'btn', add click sound effect
    document.querySelectorAll('button, .btn').forEach(btn => {
        btn.addEventListener('click', playClickSound);
    });


    // ==========================================
    // 2. Dynamic Rating Stars (DOM & Events)
    // ==========================================
    const stars = document.querySelectorAll('#rating-stars .star');
    const ratingOutput = document.getElementById('rating-output');

    stars.forEach((star, index) => {
        star.addEventListener('click', () => {
            const ratingValue = index + 1;
            stars.headingCallback = ratingValue;
            
            // Switch statement to determine the message based on the rating value
            let message = '';
            switch(ratingValue) {
                case 1: message = '1 Star - Poor'; break;
                case 2: message = '2 Stars - Fair'; break;
                case 3: message = '3 Stars - Good'; break;
                case 4: message = '4 Stars - Very Good'; break;
                case 5: message = '5 Stars - Excellent!'; break;
                default: message = 'Rated';
            }

            // Higher-order function/loop for coloring stars
            stars.forEach((s, i) => {
                if (i < ratingValue) {
                    s.style.color = '#ffc107'; // golden
                    s.style.transform = 'scale(1.2)'; // bigger
                } else {
                    s.style.color = '#ccc';
                    s.style.transform = 'scale(1.0)';
                }
            });

            if (ratingOutput) {
                ratingOutput.textContent = `You rated: ${message}`;
            }
        });
    });


    // ==========================================
    // 3. ARRAYS, OBJECTS AND HIGHER-ORDER FUNCTIONS (.map, .filter)
    // ==========================================
    const moviesData = [
        { id: 1, title: "Drive", year: 2011, desc: "A mysterious Hollywood stuntman and getaway driver.", image: "https://static0.colliderimages.com/wordpress/wp-content/uploads/2021/09/DRIVE.jpg?q=70&fit=crop&w=600" },
        { id: 2, title: "La La Land", year: 2016, desc: "A pianist and an actress fall in love in LA.", image: "https://wallpaperaccess.com/full/184724.jpg" },
        { id: 3, title: "Blade Runner 2049", year: 2017, desc: "Discovery of a long-buried secret leads to Deckard.", image: "https://static0.srcdn.com/wordpress/wp-content/uploads/2017/05/Ryan-Gosling-from-the-Blade-Runner-2049-poster.jpg?q=50&fit=crop&w=600" },
        { id: 4, title: "Barbie", year: 2023, desc: "Stereotypical Barbie has an existential crisis.", image: "photos/barbie.webp" }
    ];

    const container = document.getElementById('dynamic-cards-container');

    function renderMovies(arr) {
        if (!container) return;
        // Method .map() for generation HTML-строк from array of objects
        container.innerHTML = arr.map(movie => `
            <div class="col-12 col-md-6 col-lg-3">
                <div class="card actor-card h-100" style="transition: transform 0.3s ease;">
                    <img src="${movie.image}" class="card-img-top" alt="${movie.title}" style="height: 150px; object-fit: cover;">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${movie.title} (${movie.year})</h5>
                        <p class="card-text small">${movie.desc}</p>
                        <span class="badge bg-primary mt-auto">ID: ${movie.id}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Render for all elements through higher-order function
    renderMovies(moviesData);

    // filtration with .filter()
    const filterAllBtn = document.getElementById('filter-all-btn');
    const filterRecentBtn = document.getElementById('filter-recent-btn');

    if (filterAllBtn && filterRecentBtn) {
        filterAllBtn.addEventListener('click', () => {
            renderMovies(moviesData);
        });

        filterRecentBtn.addEventListener('click', () => {
            const filtered = moviesData.filter(m => m.year >= 2015); // Higher-order function filter
            renderMovies(filtered);
        });
    }


    // ==========================================
    // 4. TIME; DATE
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
    // 5. BACKGROUND COLOR
    // ==========================================
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
        const colors = ['#121212', '#1a1d20', '#0d1b2a', '#1f2421', '#2b1b17', '#6482F2'];
        let colorIndex = 0;

        themeBtn.addEventListener('click', () => {
            colorIndex = (colorIndex + 1) % colors.length;
            const selectedColor = colors[colorIndex];
            document.body.style.setProperty('background-color', selectedColor, 'important');
            
            // Animation
            document.body.style.transition = 'background-color 0.5s ease';
        });
    }


    // ==========================================
    // 6. HELPER FUNC-S
    // ==========================================
    
    // Task 3: Popup Subscription / Contact Form
    const openPopupBtn = document.getElementById('open-popup-btn');
    const closePopupBtn = document.getElementById('close-popup-btn');
    const popupModal = document.getElementById('popup-modal');

    if (openPopupBtn && popupModal) {
        openPopupBtn.addEventListener('click', () => {
            popupModal.style.display = 'flex';
        });

        if (closePopupBtn) {
            closePopupBtn.addEventListener('click', () => {
                popupModal.style.display = 'none';
            });
        }

        window.addEventListener('click', (e) => {
            if (e.target === popupModal) {
                popupModal.style.display = 'none';
            }
        });
    }

    // Task 1: Form Validation
    const feedbackForm = document.querySelector('#feedback form');

    if (feedbackForm) {
        feedbackForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const commentInput = document.getElementById('comment');

            let isValid = true;
            let errorMessages = [];

            const emailRegex = /^[^\s@]+@astanait\.edu\.kz+[^\s@]+$/;

            if (!nameInput || nameInput.value.trim() === '') {
                isValid = false;
                if (nameInput) nameInput.classList.add('is-invalid');
                errorMessages.push('Name is required.');
            } else {
                if (nameInput) nameInput.classList.remove('is-invalid');
            }

            if (!emailInput || emailInput.value.trim() === '' || !emailRegex.test(emailInput.value.trim())) {
                isValid = false;
                if (emailInput) emailInput.classList.add('is-invalid');
                errorMessages.push('Valid email address is required.');
            } else {
                if (emailInput) emailInput.classList.remove('is-invalid');
            }

            if (!commentInput || commentInput.value.trim() === '') {
                isValid = false;
                if (commentInput) commentInput.classList.add('is-invalid');
                errorMessages.push('Comment / Opinion cannot be empty.');
            } else {
                if (commentInput) commentInput.classList.remove('is-invalid');
            }

            if (!isValid) {
                alert('Please fix the following errors:\n- ' + errorMessages.join('\n- '));
            } else {
                alert('Thank you for your feedback! The form was submitted successfully.');
                feedbackForm.reset();
                [nameInput, emailInput, commentInput].forEach(input => input && input.classList.remove('is-invalid'));
            }
        });
    }

    // Task 2: Accordion for FAQs (Goes in order)
    const accordionHeaders = document.querySelectorAll('.accordion-header-custom');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const body = header.nextElementSibling;
            if (body) {
                const isVisible = body.style.display === 'block';
                body.style.display = isVisible ? 'none' : 'block';
            }
        });
    });

});