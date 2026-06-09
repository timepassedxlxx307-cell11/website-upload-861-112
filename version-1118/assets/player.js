function initMoviePlayer(video, trigger, cover, source) {
  var ready = false;
  var hls = null;

  var attach = function () {
    if (ready || !video || !source) {
      return;
    }

    ready = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
  };

  var play = function () {
    attach();
    if (cover) {
      cover.classList.add("is-hidden");
    }
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  };

  if (trigger) {
    trigger.addEventListener("click", play);
  }

  if (video) {
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener("play", function () {
      if (cover) {
        cover.classList.add("is-hidden");
      }
    });
    video.addEventListener("emptied", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  }
}
