$(document).ready(function() {
    console.log("jQuery is ready!");
    const searchData = ["Antony Starr", "Homelander", "The Boys", "Lucas Hood", "Banshee", "Van and Jethro West", "Outrageous Fortune", "Jim Carrey", "Brad Pitt", "Jason Statham"];
    let selectedRating = 0;
    let countersStarted = false;
    const originalHighlightText = {};
    $("[data-highlight]").each(function(index) {
        originalHighlightText[index] = $(this).text();
        $(this).attr("data-highlight-index", index);
    });
    function escapeRegExp(text) {
        return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
    function highlightMatches(query) {
        $("[data-highlight]").each(function() {
            const index = $(this).attr("data-highlight-index");
            const originalText = originalHighlightText[index];
            if (query === "") {
                $(this).text(originalText);
                return;
            }
            const regex = new RegExp("(" + escapeRegExp(query) + ")", "gi");
            $(this).html(originalText.replace(regex, '<span class="search-highlight">$1</span>'));
        });
    }
    function filterSearch() {
        const query = $("#searchInput").val().trim().toLowerCase();
        let visibleCount = 0;
        $(".search-item").each(function() {
            const searchable = $(this).data("search").toLowerCase();
            const matches = searchable.includes(query);
            $(this).toggle(matches);
            if (matches) {
                visibleCount++;
            }
        });
        $("#noResults").toggle(visibleCount === 0);
        highlightMatches(query);
    }
    function showSuggestions() {
        const query = $("#searchInput").val().trim().toLowerCase();
        $("#suggestions").empty();
        if (query === "") {
            $("#suggestions").hide();
            return;
        }
        const matches = searchData.filter(function(item) {
            return item.toLowerCase().includes(query);
        }).slice(0, 6);
        if (matches.length === 0) {
            $("#suggestions").hide();
            return;
        }
        matches.forEach(function(item) {
            $("<div>").addClass("suggestion-item").text(item).appendTo("#suggestions");
        });
        $("#suggestions").show();
    }
    $("#searchInput").on("keyup input", function() {
        filterSearch();
        showSuggestions();
    });
    $(document).on("click", ".suggestion-item", function() {
        $("#searchInput").val($(this).text());
        $("#suggestions").hide();
        filterSearch();
    });
    $(document).on("click", function(event) {
        if (!$(event.target).closest(".search-box").length) {
            $("#suggestions").hide();
        }
    });
    function updateScrollProgress() {
        const scrollTop = $(window).scrollTop();
        const documentHeight = $(document).height() - $(window).height();
        const progress = documentHeight > 0 ? scrollTop / documentHeight * 100 : 0;
        $("#scrollProgress").css("width", progress + "%");
    }
    function startCounters() {
        if (countersStarted) {
            return;
        }
        const section = $("#stats");
        if (!section.length) {
            return;
        }
        const windowBottom = $(window).scrollTop() + $(window).height();
        if (windowBottom >= section.offset().top + 80) {
            countersStarted = true;
            $(".counter").each(function() {
                const element = $(this);
                const target = Number(element.data("target"));
                $({ value: 0 }).animate({ value: target }, {
                    duration: 1600,
                    easing: "swing",
                    step: function() {
                        element.text(Math.floor(this.value));
                    },
                    complete: function() {
                        element.text(target);
                    }
                });
            });
        }
    }
    function lazyLoadImages() {
        const windowBottom = $(window).scrollTop() + $(window).height() + 200;
        $("img.lazy-image").each(function() {
            const image = $(this);
            if (image.hasClass("loaded") || !image.is(":visible")) {
                return;
            }
            const imageTop = image.offset().top;
            if (imageTop <= windowBottom) {
                const realSource = image.attr("data-src");
                if (realSource) {
                    image.attr("src", realSource).removeAttr("data-src").addClass("loaded");
                }
            }
        });
    }
    $(window).on("scroll resize", function() {
        updateScrollProgress();
        startCounters();
        lazyLoadImages();
    });
    $("#antonyCarousel").on("slid.bs.carousel", function() {
        lazyLoadImages();
    });
    updateScrollProgress();
    startCounters();
    lazyLoadImages();
    function showToast(message) {
        $("#toast").stop(true, true).text(message).fadeIn(250).delay(1800).fadeOut(500);
    }
    function showStars(rating) {
        $(".star").each(function() {
            const value = Number($(this).data("rating"));
            const selected = value <= rating;
            $(this).text(selected ? "★" : "☆").toggleClass("selected", selected);
        });
    }
    $(".star").on("mouseenter", function() {
        showStars(Number($(this).data("rating")));
    });
    $(".star").on("click", function() {
        selectedRating = Number($(this).data("rating"));
        $("#rating").val(selectedRating);
        $("#ratingText").text(selectedRating + "/5");
        showStars(selectedRating);
    });
    $("#starRating").on("mouseleave", function() {
        showStars(selectedRating);
    });
    $("#readMoreButton").on("click", function() {
        $("#extraBio").slideToggle(250);
        $(this).text($(this).text() === "Read More" ? "Read Less" : "Read More");
    });
    $("#greetingButton").on("click", function() {
        const hour = new Date().getHours();
        const greeting = hour < 12 ? "Good morning! Welcome to ActorsHub." : hour < 18 ? "Good afternoon! Welcome to ActorsHub." : "Good evening! Welcome to ActorsHub.";
        $("#greeting").text(greeting);
        showToast("Greeting updated");
    });
    $("#timeButton").on("click", function() {
        $("#buttonTime").text("Current time: " + new Date().toLocaleTimeString());
    });
    $("#actorInfoButton").on("click", function() {
        $("#actorInfo").text("Antony Starr is from New Zealand and is famous for playing Homelander.");
    });
    $("#animationButton").on("click", function() {
        $("#actorPhoto").toggleClass("photo-animation");
        showToast("Photo animation toggled");
    });
    $("#copyButton").on("click", function() {
        const text = $("#copyText").text();
        const button = $(this);
        const finishCopy = function() {
            $("#copyIcon").text("✓ Copied");
            $("#copyTooltip").stop(true, true).fadeIn(150).delay(1200).fadeOut(300);
            showToast("Copied to clipboard!");
            setTimeout(function() {
                $("#copyIcon").text("Copy");
                button.prop("disabled", false);
            }, 1600);
        };
        button.prop("disabled", true);
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(finishCopy).catch(function() {
                button.prop("disabled", false);
                showToast("Copy failed");
            });
        } else {
            const temp = $("<textarea>").val(text).appendTo("body").select();
            document.execCommand("copy");
            temp.remove();
            finishCopy();
        }
    });
    $(document).on("copy", function() {
        $("#copyTooltip").stop(true, true).fadeIn(150).delay(900).fadeOut(300);
    });
    function validateFeedback() {
        if ($("#name").val().trim() === "") {
            showToast("Please enter your name");
            return false;
        }
        const email = $("#email").val().trim();
        if (email === "" || !email.includes("@")) {
            showToast("Please enter a correct email");
            return false;
        }
        if ($("#character").val() === "") {
            showToast("Please choose a character");
            return false;
        }
        if ($('input[name="watched"]:checked').length === 0) {
            showToast("Please choose Yes or No");
            return false;
        }
        if (selectedRating === 0) {
            showToast("Please choose a rating");
            return false;
        }
        if ($("#comment").val().trim() === "") {
            showToast("Please write a comment");
            return false;
        }
        return true;
    }
    $("#feedbackForm").on("submit", function(event) {
        event.preventDefault();
        if (!validateFeedback()) {
            return;
        }
        const button = $("#submitButton");
        $("#submitSpinner").show();
        $("#submitText").text("Please wait...");
        button.prop("disabled", true);
        setTimeout(function() {
            $("#submitSpinner").hide();
            $("#submitText").text("Send");
            button.prop("disabled", false);
            $("#popupEmail").val($("#email").val());
            showToast("Form submitted successfully");
            $("#subscriptionPopup").fadeIn(250);
        }, 1400);
    });
    $("#closePopup").on("click", function() {
        $("#subscriptionPopup").fadeOut(200);
    });
    $("#subscriptionPopup").on("click", function(event) {
        if (event.target === this) {
            $(this).fadeOut(200);
        }
    });
    $("#subscriptionForm").on("submit", function(event) {
        event.preventDefault();
        const email = $("#popupEmail").val().trim();
        const password = $("#password").val();
        const confirmPassword = $("#confirmPassword").val();
        if (email === "" || !email.includes("@")) {
            showToast("Enter a correct email");
            return;
        }
        if (password.length < 6) {
            showToast("Password must be at least 6 characters");
            return;
        }
        if (password !== confirmPassword) {
            showToast("Passwords do not match");
            return;
        }
        this.reset();
        $("#subscriptionPopup").fadeOut(200);
        showToast("Subscription successful");
    });
    $(".faq-question").on("click", function() {
        $(this).next(".faq-answer").slideToggle(200);
    });
    $("#currentDate").text("Current date: " + new Date().toLocaleDateString());
});
