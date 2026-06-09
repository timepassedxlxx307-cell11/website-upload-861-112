(function () {
  var boxes = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
  boxes.forEach(function (box) {
    var video = box.querySelector('video');
    var button = box.querySelector('.start-layer');
    var url = box.getAttribute('data-stream');
    var bound = false;

    var bind = function () {
      if (bound || !video || !url) return;
      bound = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
    };

    var play = function () {
      bind();
      if (button) button.classList.add('hidden');
      var attempt = video.play();
      if (attempt && attempt.catch) {
        attempt.catch(function () {});
      }
    };

    if (button) {
      button.addEventListener('click', play);
    }
    if (video) {
      video.addEventListener('click', play);
      video.addEventListener('play', function () {
        if (button) button.classList.add('hidden');
      });
    }
  });
})();
