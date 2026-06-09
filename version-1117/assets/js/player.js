(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    Array.prototype.forEach.call(document.querySelectorAll(".video-player"), function (root) {
      var video = root.querySelector("video");
      var cover = root.querySelector(".player-cover");
      var startButton = root.querySelector(".player-start");
      var stream = root.getAttribute("data-stream");
      var prepared = false;
      var hls = null;

      function prepare() {
        if (prepared || !video || !stream) {
          return;
        }
        prepared = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
      }

      function play() {
        prepare();
        root.classList.add("is-playing");
        var action = video.play();
        if (action && typeof action.catch === "function") {
          action.catch(function () {});
        }
      }

      if (cover) {
        cover.addEventListener("click", play);
      }
      if (startButton) {
        startButton.addEventListener("click", play);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            play();
          }
        });
      }
      window.addEventListener("pagehide", function () {
        if (hls && typeof hls.destroy === "function") {
          hls.destroy();
        }
      });
    });
  });
})();
