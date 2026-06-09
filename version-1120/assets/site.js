(function() {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function() {
        var menuButton = document.querySelector(".mobile-menu-button");
        var mobileNav = document.querySelector(".mobile-nav");

        if (menuButton && mobileNav) {
            menuButton.addEventListener("click", function() {
                mobileNav.classList.toggle("is-open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var next = document.querySelector(".hero-next");
        var prev = document.querySelector(".hero-prev");
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });

            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        if (next) {
            next.addEventListener("click", function() {
                showSlide(current + 1);
            });
        }

        if (prev) {
            prev.addEventListener("click", function() {
                showSlide(current - 1);
            });
        }

        dots.forEach(function(dot, index) {
            dot.addEventListener("click", function() {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function() {
                showSlide(current + 1);
            }, 5200);
        }

        var inputs = Array.prototype.slice.call(document.querySelectorAll(".search-input"));
        var selects = Array.prototype.slice.call(document.querySelectorAll(".filter-select"));

        function normalize(value) {
            return (value || "").toString().trim().toLowerCase();
        }

        function filterCards() {
            var queryInput = document.querySelector(".search-input");
            var typeSelect = document.querySelector(".filter-type");
            var regionSelect = document.querySelector(".filter-region");
            var query = normalize(queryInput ? queryInput.value : "");
            var type = normalize(typeSelect ? typeSelect.value : "");
            var region = normalize(regionSelect ? regionSelect.value : "");
            var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));

            cards.forEach(function(card) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-tags"),
                    card.getAttribute("data-year")
                ].join(" "));
                var cardType = normalize(card.getAttribute("data-type"));
                var cardRegion = normalize(card.getAttribute("data-region"));
                var matchesQuery = !query || haystack.indexOf(query) !== -1;
                var matchesType = !type || cardType.indexOf(type) !== -1;
                var matchesRegion = !region || cardRegion.indexOf(region) !== -1;
                card.classList.toggle("hidden-by-filter", !(matchesQuery && matchesType && matchesRegion));
            });
        }

        inputs.forEach(function(input) {
            input.addEventListener("input", filterCards);
        });

        selects.forEach(function(select) {
            select.addEventListener("change", filterCards);
        });
    });
})();
