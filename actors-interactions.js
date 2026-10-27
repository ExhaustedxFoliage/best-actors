(() => {
    "use strict";

    function validateField(field) {
        let message = "";
        const value = field.value.trim();
        const length = field.type === "password" ? field.value.length : value.length;

        if (field.required && value === "") {
            message = field.tagName === "SELECT" ? "Please choose a movie." : "This field is required.";
        } else if (field.type === "email" && field.validity.typeMismatch) {
            message = "Please enter a valid email address (e.g. name@example.com).";
        } else if (field.minLength > 0 && length < field.minLength) {
            message = `Use at least ${field.minLength} characters.`;
        } else if (field.maxLength > 0 && field.value.length > field.maxLength) {
            message = `Use no more than ${field.maxLength} characters.`;
        } else if (field.id === "confirm-password" && field.value !== document.getElementById("subscription-password").value) {
            message = "Passwords do not match.";
        }

        const error = document.getElementById(`${field.id}-error`);
        error.textContent = message;
        field.classList.toggle("is-invalid", message !== "");
        field.setAttribute("aria-invalid", String(message !== ""));
        return message === "";
    }

    function clearForm(form) {
        form.reset();
        form.querySelectorAll("[required]").forEach((field) => {
            field.classList.remove("is-invalid");
            field.removeAttribute("aria-invalid");
            document.getElementById(`${field.id}-error`).textContent = "";
        });
    }

    function connectForm(form, onSuccess) {
        const fields = Array.from(form.querySelectorAll("[required]"));
        const steps = Array.from(form.querySelectorAll("[data-form-step]"));
        const nextButton = form.querySelector("[data-form-next]");
        const backButton = form.querySelector("[data-form-back]");
        const resetButton = form.querySelector("[data-form-reset]");
        const submitButton = form.querySelector('[type="submit"]');
        let currentStep = 0;

        function showStep(index) {
            steps.forEach((step, stepIndex) => {
                step.hidden = stepIndex !== index;
                step.classList.toggle("is-current", stepIndex === index);
            });
            backButton.hidden = index === 0;
            nextButton.hidden = index === steps.length - 1;
            submitButton.hidden = index !== steps.length - 1;
            form.querySelector("[data-step-status]").textContent = `Step ${index + 1} of ${steps.length}`;
        }

        function moveStep(index, onStepChanged) {
            currentStep = index;
            onStepChanged(currentStep);
        }

        function nextStep() {
            const stepFields = Array.from(steps[currentStep].querySelectorAll("[required]"));
            const firstInvalid = stepFields.map(validateField).indexOf(false);
            if (firstInvalid !== -1) {
                stepFields[firstInvalid].focus();
                return;
            }
            moveStep(currentStep + 1, showStep);
            steps[currentStep].querySelector("input, select, textarea").focus();
        }

        if (steps.length > 0) {
            nextButton.addEventListener("click", nextStep);
            backButton.addEventListener("click", () => {
                moveStep(currentStep - 1, showStep);
                steps[currentStep].querySelector("input, select, textarea").focus();
            });
            resetButton.hidden = false;
            resetButton.addEventListener("click", () => {
                clearForm(form);
                form.querySelector(".actor-form-status").textContent = "";
                moveStep(0, showStep);
                steps[0].querySelector("input").focus();
            });
            moveStep(0, showStep);
        }

        form.noValidate = true;
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            if (steps.length > 0 && currentStep < steps.length - 1) {
                nextStep();
                return;
            }
            const results = fields.map(validateField);
            const firstInvalid = results.indexOf(false);
            if (firstInvalid !== -1) {
                if (steps.length > 0) {
                    const invalidStep = steps.findIndex((step) => step.contains(fields[firstInvalid]));
                    moveStep(invalidStep, showStep);
                }
                fields[firstInvalid].focus();
                return;
            }
            onSuccess();
            if (steps.length > 0) moveStep(0, showStep);
        });
        fields.forEach((field) => {
            field.addEventListener("input", () => {
                if (field.getAttribute("aria-invalid") === "true") validateField(field);
                if (field.id === "subscription-password") {
                    const confirmation = document.getElementById("confirm-password");
                    if (confirmation.value !== "") validateField(confirmation);
                }
            });
            field.addEventListener("change", () => {
                if (field.getAttribute("aria-invalid") === "true") validateField(field);
            });
        });
    }

    const feedbackForm = document.getElementById("actor-feedback-form");
    const feedbackStatus = document.getElementById("feedback-status");
    connectForm(feedbackForm, () => {
        feedbackStatus.textContent = "Your feedback passed validation. This demo does not send or save your details.";
        clearForm(feedbackForm);
    });
    feedbackForm.addEventListener("input", () => { feedbackStatus.textContent = ""; });

    document.querySelectorAll(".actor-faq-toggle").forEach((button) => {
        const answer = document.getElementById(button.getAttribute("aria-controls"));
        answer.hidden = false;
        answer.inert = true;
        button.addEventListener("click", () => {
            const open = button.getAttribute("aria-expanded") !== "true";
            button.setAttribute("aria-expanded", String(open));
            answer.setAttribute("aria-hidden", String(!open));
            answer.inert = !open;
            answer.classList.toggle("is-open", open);
        });
    });

    const popup = document.getElementById("actor-subscription");
    const openButton = document.getElementById("open-subscription");
    const subscriptionForm = document.getElementById("actor-subscription-form");
    const subscriptionStatus = document.getElementById("subscription-status");

    openButton.addEventListener("click", () => {
        subscriptionStatus.textContent = "";
        popup.showModal();
        document.body.classList.add("actor-popup-open");
    });
    document.getElementById("close-subscription").addEventListener("click", () => popup.close());
    popup.addEventListener("click", (event) => {
        const bounds = popup.getBoundingClientRect();
        const outside = event.clientX < bounds.left || event.clientX > bounds.right ||
            event.clientY < bounds.top || event.clientY > bounds.bottom;
        if (event.target === popup && outside) popup.close();
    });
    popup.addEventListener("close", () => {
        clearForm(subscriptionForm);
        document.body.classList.remove("actor-popup-open");
        openButton.focus();
    });
    connectForm(subscriptionForm, () => {
        subscriptionStatus.textContent = "Subscription form validated successfully. This demo does not create an account or send your details.";
        popup.close();
    });

    const colors = ["#cfe0f1", "#f3e8d8", "#e0eee5", "#eee4f2"];
    const colorNames = ["Blue", "Sand", "Mint", "Lilac"];
    let colorIndex = 0;
    document.getElementById("change-background").addEventListener("click", () => {
        colorIndex = (colorIndex + 1) % colors.length;
        document.body.style.backgroundColor = colors[colorIndex];
        document.body.style.setProperty("--actor-background", colors[colorIndex]);
        document.getElementById("background-status").textContent = `Background: ${colorNames[colorIndex]}`;
    });

    const changeTextButton = document.getElementById("change-text");
    if (changeTextButton) {
        changeTextButton.addEventListener("click", () => {
            const heading = document.querySelector("h1");
            const highlighted = heading.classList.toggle("actor-highlighted");
            heading.textContent = highlighted ? "My Favorite Actor" : document.body.dataset.actorName;
            changeTextButton.setAttribute("aria-pressed", String(highlighted));
        });
    }

    const clock = document.getElementById("actor-date-time");
    const dateFormat = new Intl.DateTimeFormat("en-US", {
        year: "numeric", month: "long", day: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true
    });
    function updateClock() {
        const now = new Date();
        clock.dateTime = now.toISOString();
        clock.textContent = dateFormat.format(now);
    }
    updateClock();
    window.setInterval(updateClock, 1000);
})();
