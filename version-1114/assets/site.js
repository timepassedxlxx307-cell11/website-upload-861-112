(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var header = document.querySelector("[data-header]");
    var toggle = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    function setHeaderState() {
      if (!header) {
        return;
      }
      if (window.scrollY > 20) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
    }

    setHeaderState();
    window.addEventListener("scroll", setHeaderState, { passive: true });

    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        mobileNav.classList.toggle("open");
        document.body.classList.toggle("menu-open", mobileNav.classList.contains("open"));
      });
    }

    setupHero();
    setupGlobalSearch();
    setupPageFilter();
  });

  function setupHero() {
    var slider = document.querySelector("[data-hero]");
    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function advance(step) {
      show(index + step);
      restart();
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        advance(-1);
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        advance(1);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        restart();
      });
    });

    show(0);
    restart();
  }

  function normalize(text) {
    return String(text || "").trim().toLowerCase();
  }

  function setupGlobalSearch() {
    var root = document.querySelector("[data-global-search]");
    if (!root || !window.SEARCH_ITEMS) {
      return;
    }

    var input = root.querySelector("[data-search-input]");
    var type = root.querySelector("[data-search-type]");
    var year = root.querySelector("[data-search-year]");
    var results = root.querySelector("[data-search-results]");

    function render() {
      var q = normalize(input && input.value);
      var selectedType = type ? type.value : "";
      var selectedYear = year ? year.value : "";

      if (!q && !selectedType && !selectedYear) {
        results.classList.remove("open");
        results.innerHTML = "";
        return;
      }

      var matched = window.SEARCH_ITEMS.filter(function (item) {
        var text = normalize([item.title, item.region, item.type, item.genre, item.tags, item.year].join(" "));
        var okQuery = !q || text.indexOf(q) !== -1;
        var okType = !selectedType || item.type.indexOf(selectedType) !== -1 || item.genre.indexOf(selectedType) !== -1;
        var okYear = !selectedYear || item.year === selectedYear;
        return okQuery && okType && okYear;
      }).slice(0, 18);

      if (!matched.length) {
        results.classList.add("open");
        results.innerHTML = "<div class=\"search-result-item\"><div></div><div><strong>未找到匹配影片</strong><span>请尝试其他关键词</span></div></div>";
        return;
      }

      results.classList.add("open");
      results.innerHTML = matched.map(function (item) {
        return "<a class=\"search-result-item\" href=\"" + item.url + "\"><img src=\"" + item.cover + "\" alt=\"" + escapeHtml(item.title) + "\"><div><strong>" + escapeHtml(item.title) + "</strong><span>" + escapeHtml(item.region + " · " + item.type + " · " + item.year) + "</span></div></a>";
      }).join("");
    }

    [input, type, year].forEach(function (node) {
      if (node) {
        node.addEventListener("input", render);
        node.addEventListener("change", render);
      }
    });

    document.addEventListener("click", function (event) {
      if (!root.contains(event.target)) {
        results.classList.remove("open");
      }
    });
  }

  function setupPageFilter() {
    var root = document.querySelector("[data-page-filter]");
    if (!root) {
      return;
    }

    var input = root.querySelector("[data-filter-input]");
    var type = root.querySelector("[data-filter-type]");
    var year = root.querySelector("[data-filter-year]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));

    function apply() {
      var q = normalize(input && input.value);
      var selectedType = type ? type.value : "";
      var selectedYear = year ? year.value : "";

      cards.forEach(function (card) {
        var text = normalize([card.dataset.title, card.dataset.type, card.dataset.genre, card.dataset.tags, card.dataset.year].join(" "));
        var okQuery = !q || text.indexOf(q) !== -1;
        var okType = !selectedType || (card.dataset.type || "").indexOf(selectedType) !== -1 || (card.dataset.genre || "").indexOf(selectedType) !== -1;
        var okYear = !selectedYear || card.dataset.year === selectedYear;
        card.classList.toggle("hidden", !(okQuery && okType && okYear));
      });
    }

    [input, type, year].forEach(function (node) {
      if (node) {
        node.addEventListener("input", apply);
        node.addEventListener("change", apply);
      }
    });
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>'"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        "\"": "&quot;"
      }[char];
    });
  }

  window.initMoviePlayer = function (stream) {
    var video = document.querySelector("[data-player-video]");
    var overlay = document.querySelector("[data-player-overlay]");
    var button = document.querySelector("[data-player-start]");
    var loaded = false;
    var hls = null;

    if (!video || !stream) {
      return;
    }

    function attach() {
      if (!loaded) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
        loaded = true;
      }

      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      video.controls = true;
      video.play().catch(function () {});
    }

    if (overlay) {
      overlay.addEventListener("click", attach);
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.stopPropagation();
        attach();
      });
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        video.play().catch(function () {});
      }
    });

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
