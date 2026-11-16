const feedbackForm = document.getElementById("feedbackForm");
const popup = document.getElementById("subscriptionPopup");
const closePopup = document.getElementById("closePopup");
const subscriptionForm = document.getElementById("subscriptionForm");

const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const characterInput = document.getElementById("character");
const commentInput = document.getElementById("comment");

const popupEmail = document.getElementById("popupEmail");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");

const colors = ["#ececec", "#e6f0ff", "#f5eeee", "#eef5ee"];
let colorNumber = 0;

feedbackForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const watched = document.querySelector('input[name="watched"]:checked');

    if (nameInput.value.trim() === "") {
        alert("Please enter your name");
        return;
    }

    if (emailInput.value.trim() === "") {
        alert("Please enter your email");
        return;
    }

    if (!emailInput.value.includes("@")) {
        alert("Please enter a correct email");
        return;
    }

    if (characterInput.selectedIndex === 0) {
        alert("Please choose a character");
        return;
    }

    if (watched === null) {
        alert("Please choose Yes or No");
        return;
    }

    if (commentInput.value.trim() === "") {
        alert("Please write a comment");
        return;
    }

    colorNumber++;

    if (colorNumber === colors.length) {
        colorNumber = 0;
    }

    document.body.style.backgroundColor = colors[colorNumber];
    document.querySelector(".page-shell").style.backgroundColor = colors[colorNumber];
    document.querySelector(".sidebar-area").style.backgroundColor = colors[colorNumber];

    popupEmail.value = emailInput.value;

    popup.style.display = "block";
});

closePopup.addEventListener("click", function() {
    popup.style.display = "none";
});

window.addEventListener("click", function(event) {
    if (event.target === popup) {
        popup.style.display = "none";
    }
});

subscriptionForm.addEventListener("submit", function(event) {
    event.preventDefault();

    if (popupEmail.value.trim() === "") {
        alert("Email is required");
        return;
    }

    if (!popupEmail.value.includes("@")) {
        alert("Incorrect email");
        return;
    }

    if (password.value.length < 6) {
        alert("Password must be at least 6 characters");
        return;
    }

    if (password.value !== confirmPassword.value) {
        alert("Passwords do not match");
        return;
    }

    alert("Subscription successful");

    subscriptionForm.reset();

    popup.style.display = "none";
});

const questions = document.querySelectorAll(".faq-question");

questions.forEach(function(question) {
    question.addEventListener("click", function() {
        const answer = question.nextElementSibling;

        if (answer.style.display === "block") {
            answer.style.display = "none";
        } else {
            answer.style.display = "block";
        }
    });
});

function showDate() {
    const date = new Date();

    document.getElementById("currentDate").textContent =
        date.toLocaleString();
}

showDate();

setInterval(showDate, 1000);
