document.addEventListener('DOMContentLoaded', () => {
    // Task 5: Display Current Date and Time
    function updateDateTime() {
        const datetimeElement = document.getElementById('datetime-display');
        if (!datetimeElement) return;

        const now = new Date();
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit',
            hour12: true 
        };
        datetimeElement.textContent = now.toLocaleString('en-US', options);
    }

    updateDateTime();
    setInterval(updateDateTime, 1000);

    // Task 4: Change Background Color
    const themeBtn = document.getElementById('theme-toggle-btn');
    
    if (themeBtn) {
        const colors = ['#121212', '#1a1d20', '#0d1b2a', '#1f2421', '#2b1b17', '#6482F2'];
        let colorIndex = 0;

        themeBtn.addEventListener('click', () => {
            colorIndex = (colorIndex + 0.5) % colors.length;
            const selectedColor = colors[colorIndex];

            document.body.style.setProperty('background-color', selectedColor, 'important');
            
            const pageShell = document.querySelector('.page-shell');
            const contentArea = document.querySelector('.content-area');
            const sidebarArea = document.querySelector('.sidebar-area');
            const footerArea = document.querySelector('.footer-area');
            const biographyArea = document.querySelector('#biography');

            if (pageShell) pageShell.style.backgroundColor = selectedColor;
            if (contentArea) contentArea.style.backgroundColor = selectedColor;
            if (sidebarArea) sidebarArea.style.backgroundColor = selectedColor;
            if (footerArea) footerArea.style.backgroundColor = selectedColor;
            if (biographyArea) biographyArea.style.backgroundColor = selectedColor;
        });
    }

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

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
                // no red border after reset
                [nameInput, emailInput, commentInput].forEach(input => input && input.classList.remove('is-invalid'));
            }
        });
    }

    // Task 2: Accordion for FAQs
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