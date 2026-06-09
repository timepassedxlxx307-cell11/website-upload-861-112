(function() {
    function initPlayer(player) {
        var video = player.querySelector("video");
        var source = video ? video.querySelector("source") : null;
        var overlay = player.querySelector(".player-overlay");
        var src = source ? source.getAttribute("src") : "";
        var loaded = false;
        var hls = null;

        if (!video || !src) {
            return;
        }

        function prepare() {
            if (loaded) {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = src;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(src);
                hls.attachMedia(video);
            } else {
                video.src = src;
            }

            loaded = true;
        }

        function start() {
            prepare();
            video.controls = true;

            if (overlay) {
                overlay.classList.add("is-hidden");
            }

            var playResult = video.play();

            if (playResult && typeof playResult.catch === "function") {
                playResult.catch(function() {
                    video.controls = true;
                });
            }
        }

        if (overlay) {
            overlay.addEventListener("click", start);
        }

        video.addEventListener("click", function() {
            if (video.paused) {
                start();
            }
        });

        video.addEventListener("ended", function() {
            if (overlay) {
                overlay.classList.remove("is-hidden");
            }
        });

        window.addEventListener("pagehide", function() {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", function() {
            Array.prototype.forEach.call(document.querySelectorAll(".video-player"), initPlayer);
        });
    } else {
        Array.prototype.forEach.call(document.querySelectorAll(".video-player"), initPlayer);
    }
})();
