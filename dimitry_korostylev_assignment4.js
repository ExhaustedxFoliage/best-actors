document.addEventListener("DOMContentLoaded", function () {
    const feedbackForm = document.querySelector("#feedback form");
    const dateLine = document.querySelector(".footer-banner p:last-child");
    const pageShell = document.querySelector(".page-shell");
    const sidebar = document.querySelector(".sidebar-area");
    const contentArea = document.querySelector(".content-area");

    const backgroundColors = [
        "#ececec",
        "#f1ece6",
        "#e8f1ec",
        "#eceef5"
    ];

    let colorIndex = 0;

    function updateDateTime() {
        const now = new Date();

        const formattedDate = now.toLocaleString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit"
        });

        dateLine.textContent = "Current date and time: " + formattedDate;
    }

    updateDateTime();
    setInterval(updateDateTime, 1000);

    const popupStyle = document.createElement("style");

    popupStyle.textContent = `
        .dimitry-popup-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.55);
            display: none;
            align-items: center;
            justify-content: center;
            padding: 20px;
            z-index: 9999;
        }

        .dimitry-popup-box {
            width: 100%;
            max-width: 520px;
            max-height: 90vh;
            overflow-y: auto;
            background: #f3f3f3;
            border: 5px solid #5f79ef;
            border-radius: 14px;
            padding: 24px;
            color: #5f79ef;
            position: relative;
        }

        .dimitry-popup-close {
            position: absolute;
            top: 10px;
            right: 14px;
            border: none;
            background: transparent;
            color: #5f79ef;
            font-size: 30px;
            line-height: 1;
            cursor: pointer;
        }

        .dimitry-popup-title {
            font-size: 26px;
            font-weight: 800;
            text-align: center;
            margin-bottom: 20px;
        }

        .dimitry-popup-box label {
            font-weight: 600;
            margin-bottom: 6px;
        }

        .dimitry-popup-box input {
            width: 100%;
            padding: 9px 12px;
            margin-bottom: 14px;
            border: 2px solid #5f79ef;
            border-radius: 6px;
            outline: none;
        }

        .dimitry-popup-submit {
            width: 100%;
            border: 1px solid #5f79ef;
            border-radius: 6px;
            background: #5f79ef;
            color: white;
            padding: 10px;
            font-weight: 600;
            cursor: pointer;
        }

        .dimitry-faq {
            margin-top: 24px;
        }

        .dimitry-faq h3 {
            font-size: 20px;
            font-weight: 700;
            text-align: center;
            margin-bottom: 12px;
        }

        .dimitry-faq-item {
            border-bottom: 1px solid #c7c7c7;
        }

        .dimitry-faq-question {
            width: 100%;
            border: none;
            background: transparent;
            color: #5f79ef;
            text-align: left;
            padding: 12px 0;
            font-weight: 700;
            cursor: pointer;
        }

        .dimitry-faq-answer {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease;
            color: #444;
        }

        .dimitry-faq-answer p {
            margin: 0;
            padding: 0 0 12px;
        }
    `;

    document.head.appendChild(popupStyle);

    const popup = document.createElement("div");

    popup.className = "dimitry-popup-overlay";
    popup.id = "dimitrySubscriptionPopup";

    popup.innerHTML = `
        <div class="dimitry-popup-box">

            <button type="button" class="dimitry-popup-close">
                &times;
            </button>

            <h2 class="dimitry-popup-title">
                ActorsHub Subscription
            </h2>

            <form id="dimitrySubscriptionForm">

                <label for="dimitryPopupEmail">
                    Email
                </label>

                <input
                    type="email"
                    id="dimitryPopupEmail"
                    placeholder="example@email.com"
                >

                <label for="dimitryPassword">
                    Password
                </label>

                <input
                    type="password"
                    id="dimitryPassword"
                    placeholder="Minimum 6 characters"
                >

                <label for="dimitryConfirmPassword">
                    Confirm password
                </label>

                <input
                    type="password"
                    id="dimitryConfirmPassword"
                    placeholder="Repeat password"
                >

                <button type="submit" class="dimitry-popup-submit">
                    Subscribe
                </button>

            </form>

            <div class="dimitry-faq">

                <h3>FAQ</h3>

                <div class="dimitry-faq-item">

                    <button type="button" class="dimitry-faq-question">
                        What is ActorsHub?
                    </button>

                    <div class="dimitry-faq-answer">
                        <p>
                            ActorsHub is a simple website with information about popular actors and their roles.
                        </p>
                    </div>

                </div>

                <div class="dimitry-faq-item">

                    <button type="button" class="dimitry-faq-question">
                        Why should I subscribe?
                    </button>

                    <div class="dimitry-faq-answer">
                        <p>
                            You can receive news and updates about actors and movies.
                        </p>
                    </div>

                </div>

                <div class="dimitry-faq-item">

                    <button type="button" class="dimitry-faq-question">
                        Can I close this form?
                    </button>

                    <div class="dimitry-faq-answer">
                        <p>
                            Yes. Click the close button or click outside the pop-up window.
                        </p>
                    </div>

                </div>

            </div>

        </div>
    `;

    document.body.appendChild(popup);

    const closeButton = popup.querySelector(".dimitry-popup-close");
    const subscriptionForm = popup.querySelector("#dimitrySubscriptionForm");
    const popupEmail = popup.querySelector("#dimitryPopupEmail");
    const password = popup.querySelector("#dimitryPassword");
    const confirmPassword = popup.querySelector("#dimitryConfirmPassword");
    const faqQuestions = popup.querySelectorAll(".dimitry-faq-question");

    function openPopup(email) {
        popupEmail.value = email;
        popup.style.display = "flex";
    }

    function closePopup() {
        popup.style.display = "none";
    }

    closeButton.addEventListener("click", closePopup);

    popup.addEventListener("click", function (event) {
        if (event.target === popup) {
            closePopup();
        }
    });

    faqQuestions.forEach(function (question) {
        question.addEventListener("click", function () {
            const answer = question.nextElementSibling;

            if (answer.style.maxHeight) {
                answer.style.maxHeight = null;
            } else {
                answer.style.maxHeight = answer.scrollHeight + "px";
            }
        });
    });

    subscriptionForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const emailValue = popupEmail.value.trim();
        const passwordValue = password.value;
        const confirmValue = confirmPassword.value;

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (emailValue === "") {
            alert("Email is required.");
            return;
        }

        if (!emailPattern.test(emailValue)) {
            alert("Please enter a correct email address.");
            return;
        }

        if (passwordValue.length < 6) {
            alert("Password must contain at least 6 characters.");
            return;
        }

        if (passwordValue !== confirmValue) {
            alert("Passwords do not match.");
            return;
        }

        alert("Subscription completed successfully.");

        subscriptionForm.reset();

        closePopup();
    });

    feedbackForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.querySelector("#name");
        const email = document.querySelector("#email");
        const character = document.querySelector("#character");

        const watched =
            document.querySelector('input[name="watched"]:checked');

        const comment =
            document.querySelector("#comment");

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (name.value.trim() === "") {
            alert("Please enter your name.");
            name.focus();
            return;
        }

        if (email.value.trim() === "") {
            alert("Please enter your email.");
            email.focus();
            return;
        }

        if (!emailPattern.test(email.value.trim())) {
            alert("Please enter a correct email address.");
            email.focus();
            return;
        }

        if (character.selectedIndex === 0) {
            alert("Please choose your favorite character.");
            character.focus();
            return;
        }

        if (!watched) {
            alert("Please choose if you have watched The Boys.");
            return;
        }

        if (comment.value.trim() === "") {
            alert("Please write a comment.");
            comment.focus();
            return;
        }

        colorIndex =
            (colorIndex + 1) % backgroundColors.length;

        const newColor =
            backgroundColors[colorIndex];

        document.body.style.backgroundColor =
            newColor;

        pageShell.style.backgroundColor =
            newColor;

        sidebar.style.backgroundColor =
            newColor;

        contentArea.style.backgroundColor =
            newColor;

        openPopup(email.value.trim());
    });
});