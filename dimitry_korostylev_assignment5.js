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

const colors = [
    "#ececec",
    "#e6f0ff",
    "#f5eeee",
    "#eef5ee"
];

let colorNumber = 0;


feedbackForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const watched =
        document.querySelector('input[name="watched"]:checked');

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


    document.body.style.backgroundColor =
        colors[colorNumber];

    document.querySelector(".page-shell")
        .style.backgroundColor =
        colors[colorNumber];

    document.querySelector(".sidebar-area")
        .style.backgroundColor =
        colors[colorNumber];


    popupEmail.value =
        emailInput.value;

    popup.style.display =
        "block";
});


closePopup.addEventListener("click", function() {

    popup.style.display =
        "none";
});


window.addEventListener("click", function(event) {

    if (event.target === popup) {

        popup.style.display =
            "none";
    }
});


function subscriptionSuccess(message, callback) {

    alert(message);

    callback();
}


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


    subscriptionSuccess(
        "Subscription successful",
        function() {

            subscriptionForm.reset();

            popup.style.display =
                "none";
        }
    );
});


const questions =
    document.querySelectorAll(".faq-question");


questions.forEach(function(question) {

    question.addEventListener("click", function() {

        const answer =
            question.nextElementSibling;


        if (answer.style.display === "block") {

            answer.style.display =
                "none";

        } else {

            answer.style.display =
                "block";
        }

    });

});


const readMoreButton =
    document.getElementById("readMoreButton");

const extraBio =
    document.getElementById("extraBio");


readMoreButton.addEventListener("click", function() {

    if (extraBio.style.display === "block") {

        extraBio.style.display =
            "none";

        readMoreButton.textContent =
            "Read More";

    } else {

        extraBio.style.display =
            "block";

        readMoreButton.textContent =
            "Read Less";
    }

});


const greetingButton =
    document.getElementById("greetingButton");

const greeting =
    document.getElementById("greeting");


greetingButton.addEventListener("click", function() {

    const hour =
        new Date().getHours();

    let timeOfDay;


    if (hour < 12) {

        timeOfDay =
            "morning";

    } else if (hour < 18) {

        timeOfDay =
            "afternoon";

    } else {

        timeOfDay =
            "evening";
    }


    switch (timeOfDay) {

        case "morning":

            greeting.textContent =
                "Good morning! Welcome to ActorsHub.";

            break;


        case "afternoon":

            greeting.textContent =
                "Good afternoon! Welcome to ActorsHub.";

            break;


        case "evening":

            greeting.textContent =
                "Good evening! Welcome to ActorsHub.";

            break;


        default:

            greeting.textContent =
                "Welcome to ActorsHub.";
    }


    playSound();
});


const timeButton =
    document.getElementById("timeButton");

const buttonTime =
    document.getElementById("buttonTime");


timeButton.addEventListener("click", function() {

    const currentTime =
        new Date();

    buttonTime.textContent =
        "Current time: " +
        currentTime.toLocaleTimeString();

});


const actor = {

    name: "Antony Starr",

    country: "New Zealand",

    famousRole: "Homelander",


    getInfo: function() {

        return this.name +
            " is from " +
            this.country +
            " and is famous for playing " +
            this.famousRole +
            ".";
    }

};


const actorInfoButton =
    document.getElementById("actorInfoButton");

const actorInfo =
    document.getElementById("actorInfo");


actorInfoButton.addEventListener("click", function() {

    actorInfo.textContent =
        actor.getInfo();

});


const films = [
    "The Boys",
    "Banshee",
    "Outrageous Fortune"
];


let filmText =
    "Popular projects: ";


for (let i = 0; i < films.length; i++) {

    filmText += films[i];


    if (i < films.length - 1) {

        filmText += ", ";
    }

}


document.getElementById("filmList")
    .textContent =
    filmText;


const animationButton =
    document.getElementById("animationButton");

const actorPhoto =
    document.querySelector(".actor-photo");


animationButton.addEventListener("click", function() {

    actorPhoto.classList.add(
        "photo-animation"
    );


    setTimeout(function() {

        actorPhoto.classList.remove(
            "photo-animation"
        );

    }, 500);

});


function playSound() {

    const audioContext =
        new AudioContext();

    const oscillator =
        audioContext.createOscillator();

    const volume =
        audioContext.createGain();


    oscillator.connect(volume);

    volume.connect(
        audioContext.destination
    );


    oscillator.frequency.value =
        500;

    volume.gain.value =
        0.08;


    oscillator.start();

    oscillator.stop(
        audioContext.currentTime + 0.1
    );
}


const navigationLinks =
    document.querySelectorAll(
        ".navbar-nav .nav-link"
    );


document.addEventListener("keydown", function(event) {

    let currentIndex =
        -1;


    navigationLinks.forEach(
        function(link, index) {

            if (link === document.activeElement) {

                currentIndex =
                    index;
            }

        }
    );


    if (event.key === "ArrowRight") {

        currentIndex++;


        if (currentIndex >= navigationLinks.length) {

            currentIndex =
                0;
        }


        navigationLinks[currentIndex]
            .focus();
    }


    if (event.key === "ArrowLeft") {

        currentIndex--;


        if (currentIndex < 0) {

            currentIndex =
                navigationLinks.length - 1;
        }


        navigationLinks[currentIndex]
            .focus();
    }

});


function showDate() {

    const date =
        new Date();


    document.getElementById("currentDate")
        .textContent =
        date.toLocaleString();

}


showDate();


setInterval(
    showDate,
    1000
);