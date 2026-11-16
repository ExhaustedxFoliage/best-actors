$(document).ready(function () {
    "use strict";
    console.log("jQuery is ready!");

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const $search = $("#movie-search");
    const $suggestions = $("#movie-suggestions");
    const titles = $("#movie option").map(function () { return this.value ? $(this).text() : null; }).get();
    let activeSuggestion = -1;
    let toastTimer;

    function notify(message) {
        const $toast = $("#actor-toast");
        clearTimeout(toastTimer);
        $toast.stop(true, true).text(message).fadeIn(reducedMotion.matches ? 0 : 160);
        toastTimer = setTimeout(() => $toast.fadeOut(reducedMotion.matches ? 0 : 350), 3200);
    }

    function closeSuggestions() {
        $suggestions.prop("hidden", true);
        $search.attr("aria-expanded", "false").removeAttr("aria-activedescendant");
        activeSuggestion = -1;
    }

    function highlightResults() {
        const query = $search.val().trim();
        $("#movie-results h3").each(function () {
            const title = $(this).text();
            $(this).empty();
            if (!query) { $(this).text(title); return; }
            let cursor = 0;
            let index;
            while ((index = title.toLowerCase().indexOf(query.toLowerCase(), cursor)) !== -1) {
                this.append(document.createTextNode(title.slice(cursor, index)));
                $("<mark>").text(title.slice(index, index + query.length)).appendTo(this);
                cursor = index + query.length;
            }
            this.append(document.createTextNode(title.slice(cursor)));
        });
    }

    function updateSearch() {
        $search[0].dispatchEvent(new CustomEvent("actor:search"));
        const query = $search.val().trim().toLowerCase();
        $suggestions.empty();
        activeSuggestion = -1;
        $search.removeAttr("aria-activedescendant");
        const matches = query ? $(titles).filter(function () { return this.toLowerCase().includes(query); }).get() : [];
        matches.forEach((title, index) => {
            $("<li>", { id: `movie-suggestion-${index}`, role: "option", "aria-selected": "false", text: title }).appendTo($suggestions);
        });
        $suggestions.prop("hidden", matches.length === 0);
        $search.attr("aria-expanded", String(matches.length > 0));
    }

    function chooseSuggestion($option) {
        $search.val($option.text());
        $("[data-movie-filter='all']").trigger("click");
        updateSearch();
        closeSuggestions();
        $search.trigger("focus");
    }

    $search.on("input", updateSearch).on("keydown", function (event) {
        const $options = $suggestions.children();
        if (event.key === "Escape") { closeSuggestions(); return; }
        if ($suggestions.prop("hidden") || !$options.length) return;
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            activeSuggestion = (activeSuggestion + (event.key === "ArrowDown" ? 1 : -1) + $options.length) % $options.length;
            $options.attr("aria-selected", "false").eq(activeSuggestion).attr("aria-selected", "true");
            $search.attr("aria-activedescendant", $options.eq(activeSuggestion).attr("id"));
        } else if (event.key === "Enter" && activeSuggestion >= 0) {
            event.preventDefault();
            chooseSuggestion($options.eq(activeSuggestion));
        }
    });
    $suggestions.on("pointerdown", "[role='option']", event => event.preventDefault());
    $suggestions.on("click", "[role='option']", function () { chooseSuggestion($(this)); });
    $search.on("blur", closeSuggestions);
    $("#movie-results").on("actor:movies-rendered", highlightResults);
    $("[data-movie-filter]").on("click", closeSuggestions);
    $("#movie-results").on("click", "[data-rating]", function () { notify($(this).attr("aria-label") + ": selected."); });
    $("#clear-ratings").on("click", () => notify("Film ratings cleared."));

    $("#actor-feedback-form, #actor-subscription-form").on("actor:validated", function (event) {
        event.preventDefault();
        const form = this;
        const $form = $(form);
        if ($form.attr("aria-busy") === "true") return;
        const $button = $form.find("[type='submit']");
        const original = $button.text();
        const dialog = form.closest("dialog");
        let cancelled = false;
        const cancel = () => { cancelled = true; };
        if (dialog) dialog.addEventListener("close", cancel, { once: true });
        const $controls = $form.find("input, select, textarea, button").filter(":enabled");
        $form.attr("aria-busy", "true");
        $controls.prop("disabled", true);
        $button.empty().append($("<span>", { class: "actor-submit-spinner", "aria-hidden": "true" }), document.createTextNode(" Please wait…"));
        setTimeout(function () {
            $controls.prop("disabled", false);
            $button.text(original);
            $form.removeAttr("aria-busy");
            if (dialog) dialog.removeEventListener("close", cancel);
            if (cancelled || (dialog && !dialog.open)) return;
            event.originalEvent.detail.complete();
            notify("Form validated successfully. Demo only: nothing was sent or saved.");
            if (form.id === "actor-feedback-form") $form.find("input:visible").first().trigger("focus");
        }, 1000);
    });

    const shareUrl = new URL(location.href);
    shareUrl.hash = "";
    shareUrl.search = "";
    $("#actor-share-url").val(shareUrl.href);
    let copyTimer;
    $("#copy-actor-link").on("click", async function () {
        const $button = $(this);
        try {
            await navigator.clipboard.writeText($("#actor-share-url").val());
            clearTimeout(copyTimer);
            $button.text("✓ Copied");
            $("#copy-tooltip").prop("hidden", false);
            notify("Copied to clipboard!");
            copyTimer = setTimeout(() => { $button.text("Copy link"); $("#copy-tooltip").prop("hidden", true); }, 3000);
        } catch (error) {
            $("#actor-share-url")[0].select();
            notify("Copy unavailable. Select the link and press Ctrl+C or use your device's Copy command.");
        }
    });

    function loadImage(image) {
        const $image = $(image);
        if (!$image.attr("data-src")) return;
        $image.one("error", function () { $(this).addClass("actor-image-error").attr("alt", $(this).attr("alt") + " (image unavailable)"); });
        $image.attr("src", $image.attr("data-src")).removeAttr("data-src");
    }

    let counterStarted = false;
    function updateViewport() {
        const top = $(window).scrollTop();
        const height = $(window).height();
        const total = $(document).height() - height;
        const progress = total > 0 ? Math.min(100, Math.max(0, top / total * 100)) : 100;
        $("#reading-progress").attr("aria-valuenow", Math.round(progress)).children().css("width", progress + "%");
        $("img[data-src]:visible").each(function () {
            const bounds = this.getBoundingClientRect();
            if (bounds.top <= height && bounds.bottom >= 0) loadImage(this);
        });
        const $counter = $("#film-counter");
        if (!counterStarted && $counter.length && $counter.offset().top < top + height) {
            counterStarted = true;
            $({ count: 0 }).animate({ count: titles.length }, {
                duration: reducedMotion.matches ? 0 : 1100,
                step: value => $counter.text(Math.floor(value)),
                complete: () => $counter.text(titles.length)
            });
        }
    }
    $(window).on("scroll resize load", updateViewport);
    $(".carousel").on("slide.bs.carousel", event => $(event.relatedTarget).find("img[data-src]").each(function () { loadImage(this); }));
    $(".carousel").on("slid.bs.carousel", updateViewport);
    updateViewport();
});
