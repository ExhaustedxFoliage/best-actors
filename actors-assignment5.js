(() => {
    "use strict";

    const actors = {
        pitt: {
            name: "Brad Pitt",
            movies: [
                { id: "fight-club", title: "Fight Club", role: "Tyler Durden", year: 1999 },
                { id: "oceans-eleven", title: "Ocean's Eleven", role: "Rusty Ryan", year: 2001 },
                { id: "hollywood", title: "Once Upon a Time in Hollywood", role: "Cliff Booth", year: 2019 },
                { id: "vampire", title: "Interview with the Vampire", role: "Louis de Pointe du Lac", year: 1994 }
            ],
            biography: "Explore Pitt's different screen characters below: Tyler Durden in Fight Club, Rusty Ryan in Ocean's Eleven, and Cliff Booth in Once Upon a Time in Hollywood. Filter the films by release period and give each performance your own rating."
        },
        statham: {
            name: "Jason Statham",
            movies: [
                { id: "transporter", title: "The Transporter", role: "Frank Martin", year: 2002 },
                { id: "snatch", title: "Snatch", role: "Turkish", year: 2000 },
                { id: "crank", title: "Crank", role: "Chev Chelios", year: 2006 },
                { id: "expendables", title: "The Expendables", role: "Lee Christmas", year: 2010 }
            ],
            biography: "Explore Statham's screen characters below: Frank Martin in The Transporter, Turkish in Snatch, and Chev Chelios in Crank. Filter the films by release period and give each performance your own rating."
        }
    };

    const actor = {
        ...actors[document.body.dataset.actor],
        ratings: {},

        getMovies(category, searchText) {
            let selected;
            switch (category) {
                case "classic":
                    selected = this.movies.filter((movie) => movie.year < 2010);
                    break;
                case "modern":
                    selected = this.movies.filter((movie) => movie.year >= 2010);
                    break;
                default:
                    selected = this.movies;
            }
            return selected.filter((movie) => movie.title.toLowerCase().includes(searchText.toLowerCase().trim()));
        },

        rateMovie(movieId, value) {
            this.ratings[movieId] = value;
        }
    };

    const results = document.getElementById("movie-results");
    const search = document.getElementById("movie-search");
    const filters = Array.from(document.querySelectorAll("[data-movie-filter]"));
    const movieStatus = document.getElementById("movie-status");
    const ratingStatus = document.getElementById("rating-status");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let category = "all";

    function animateChange(element) {
        if (reduceMotion.matches) return;
        element.getAnimations().forEach((animation) => animation.cancel());
        element.animate([
            { opacity: 0.5, transform: "translateY(6px)" },
            { opacity: 1, transform: "translateY(0)" }
        ], { duration: 220, easing: "ease-out" });
    }

    function updateRating(row, movie) {
        const rating = actor.ratings[movie.id] || 0;
        row.querySelectorAll("[data-rating]").forEach((button) => {
            const value = Number(button.dataset.rating);
            button.classList.toggle("is-rated", value <= rating);
            button.setAttribute("aria-pressed", String(value === rating));
        });
        row.querySelector(".movie-rating-value").textContent = rating ? `Your rating: ${rating} / 5` : "Not rated yet";
    }

    function createMovieRow(movie) {
        const row = document.createElement("li");
        row.className = "actor-movie-row";
        row.dataset.movieId = movie.id;

        const details = document.createElement("div");
        const title = document.createElement("h3");
        title.textContent = movie.title;
        const role = document.createElement("p");
        role.textContent = `${movie.year} · ${actor.name} as ${movie.role}`;
        details.append(title, role);

        const ratingArea = document.createElement("div");
        ratingArea.className = "movie-rating";
        const stars = document.createElement("div");
        stars.className = "movie-stars";
        stars.setAttribute("role", "group");
        stars.setAttribute("aria-label", `Rate ${movie.title}`);

        for (let value = 1; value <= 5; value += 1) {
            const star = document.createElement("button");
            star.type = "button";
            star.className = "movie-star";
            star.dataset.rating = String(value);
            star.textContent = "★";
            star.setAttribute("aria-label", `Rate ${movie.title} ${value} out of 5`);
            star.addEventListener("click", () => {
                actor.rateMovie(movie.id, value);
                updateRating(row, movie);
                ratingStatus.textContent = `${movie.title}: you selected ${value} out of 5 stars.`;
                animateChange(ratingArea);
            });
            stars.append(star);
        }

        const valueLabel = document.createElement("p");
        valueLabel.className = "movie-rating-value";
        ratingArea.append(stars, valueLabel);
        row.append(details, ratingArea);
        updateRating(row, movie);
        return row;
    }

    function renderMovies() {
        const movies = actor.getMovies(category, search.value);
        results.replaceChildren();
        for (const movie of movies) {
            results.append(createMovieRow(movie));
        }
        movieStatus.textContent = movies.length ? `${movies.length} films to explore` : "No films match. Try another title or choose All films.";
        filters.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.movieFilter === category)));
        animateChange(results);
    }

    filters.forEach((button) => {
        button.addEventListener("click", () => {
            category = button.dataset.movieFilter;
            renderMovies();
        });
    });
    search.addEventListener("input", renderMovies);
    document.getElementById("clear-ratings").addEventListener("click", () => {
        actor.ratings = {};
        renderMovies();
        ratingStatus.textContent = "All your film ratings have been cleared.";
    });
    renderMovies();

    const moreText = document.getElementById("actor-more-biography");
    const readMoreButton = document.getElementById("actor-read-more");
    moreText.textContent = actor.biography;
    moreText.hidden = false;
    moreText.style.display = "none";
    readMoreButton.addEventListener("click", () => {
        const expanded = readMoreButton.getAttribute("aria-expanded") !== "true";
        moreText.style.display = expanded ? "block" : "none";
        readMoreButton.setAttribute("aria-expanded", String(expanded));
        readMoreButton.textContent = expanded ? "Read less" : "Read more";
        if (expanded) animateChange(moreText);
    });

    document.querySelectorAll(".navbar-nav, .sidebar-menu").forEach((menu) => {
        menu.addEventListener("keydown", (event) => {
            const links = Array.from(menu.querySelectorAll("a")).filter((link) => link.getClientRects().length > 0);
            const index = links.indexOf(document.activeElement);
            if (index === -1) return;
            let nextIndex;
            switch (event.key) {
                case "ArrowRight":
                case "ArrowDown":
                    nextIndex = (index + 1) % links.length;
                    break;
                case "ArrowLeft":
                case "ArrowUp":
                    nextIndex = (index - 1 + links.length) % links.length;
                    break;
                case "Home":
                    nextIndex = 0;
                    break;
                case "End":
                    nextIndex = links.length - 1;
                    break;
                default:
                    return;
            }
            event.preventDefault();
            links[nextIndex].focus();
        });
    });

    const themeButton = document.getElementById("actor-theme-toggle");
    const backgroundButton = document.getElementById("change-background");
    const backgroundStatus = document.getElementById("background-status");
    let dayBackgroundLabel = backgroundStatus.textContent;
    themeButton.addEventListener("click", () => {
        const night = document.body.classList.toggle("actor-night");
        themeButton.setAttribute("aria-pressed", String(night));
        themeButton.textContent = night ? "Use day theme" : "Use night theme";
        backgroundButton.disabled = night;
        if (night) {
            dayBackgroundLabel = backgroundStatus.textContent;
            backgroundStatus.textContent = "Night theme · day palette paused";
        } else {
            backgroundStatus.textContent = dayBackgroundLabel;
        }
    });

    const audio = document.getElementById("actor-chime");
    const soundStatus = document.getElementById("sound-status");
    audio.volume = 0.35;
    let playRequest = 0;
    document.getElementById("actor-play-sound").addEventListener("click", async () => {
        const request = ++playRequest;
        audio.pause();
        audio.currentTime = 0;
        soundStatus.textContent = "Loading notification sound...";
        try {
            await audio.play();
            if (request === playRequest) soundStatus.textContent = "Playing notification sound.";
        } catch (error) {
            if (request === playRequest) soundStatus.textContent = "Sound could not play. Press Play sound to try again.";
        }
    });
    audio.addEventListener("ended", () => { soundStatus.textContent = "Notification sound finished."; });
})();
