(function () {
    var header = document.querySelector(".site-header");
    var navToggle = document.querySelector(".nav-toggle");
    var navMenu = document.querySelector(".nav-menu");

    function updateHeader() {
        if (!header) {
            return;
        }
        if (window.scrollY > 18) {
            header.classList.add("is-scrolled");
        } else {
            header.classList.remove("is-scrolled");
        }
    }

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    if (navToggle && navMenu) {
        navToggle.addEventListener("click", function () {
            navMenu.classList.toggle("is-open");
        });
    }

    var carousel = document.querySelector("[data-hero-carousel]");
    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var activeIndex = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === activeIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === activeIndex);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        }
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card-text]"));

    function applySearch(keyword) {
        var normalized = (keyword || "").trim().toLowerCase();
        cards.forEach(function (card) {
            var text = (card.getAttribute("data-card-text") || "").toLowerCase();
            card.classList.toggle("is-hidden-card", normalized.length > 0 && text.indexOf(normalized) === -1);
        });
    }

    searchInputs.forEach(function (input) {
        input.addEventListener("input", function () {
            applySearch(input.value);
        });
    });

    if (searchInputs.length && cards.length) {
        var queryValue = new URLSearchParams(window.location.search).get("q");
        if (queryValue) {
            searchInputs[0].value = queryValue;
            applySearch(queryValue);
        }
    }

    Array.prototype.slice.call(document.querySelectorAll(".search-box")).forEach(function (form) {
        form.addEventListener("submit", function (event) {
            var input = form.querySelector("[data-search-input]");
            if (form.getAttribute("data-search-mode") === "local" && input && cards.length) {
                event.preventDefault();
                applySearch(input.value);
            }
        });
    });

    window.initMoviePlayer = function (source) {
        var video = document.getElementById("movie-player");
        var overlay = document.querySelector(".player-overlay");
        var hlsInstance = null;
        var loaded = false;

        if (!video || !source) {
            return;
        }

        function attachVideo() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true });
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MEDIA_ATTACHED, function () {
                    hlsInstance.loadSource(source);
                });
                return;
            }
            video.src = source;
        }

        function playVideo() {
            attachVideo();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var start = function () {
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {});
                }
            };
            if (video.readyState > 0) {
                start();
            } else {
                video.addEventListener("loadedmetadata", start, { once: true });
                setTimeout(start, 280);
            }
        }

        if (overlay) {
            overlay.addEventListener("click", playVideo);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                playVideo();
            }
        });

        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    };
})();
