(function () {
  var toggle = document.querySelector("[data-menu-toggle]");
  var menu = document.querySelector("[data-mobile-menu]");

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var index = 0;
    var timer = null;

    var show = function (next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    };

    var start = function () {
      if (slides.length < 2) {
        return;
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    };

    var stop = function () {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    };

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        stop();
        show(i);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  var filterInput = document.querySelector("[data-filter-input]");
  var filterType = document.querySelector("[data-filter-type]");
  var filterYear = document.querySelector("[data-filter-year]");
  var list = document.querySelector("[data-filter-list]");
  var empty = document.querySelector("[data-empty-state]");

  if (filterInput && list) {
    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");

    if (query) {
      filterInput.value = query;
    }

    var normalize = function (value) {
      return (value || "").toString().trim().toLowerCase();
    };

    var match = function (card, keyword, type, year) {
      var text = [
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.genre,
        card.dataset.tags
      ].join(" ").toLowerCase();
      var okKeyword = !keyword || text.indexOf(keyword) !== -1;
      var okType = !type || normalize(card.dataset.type).indexOf(type) !== -1;
      var okYear = !year || normalize(card.dataset.year) === year;
      return okKeyword && okType && okYear;
    };

    var apply = function () {
      var keyword = normalize(filterInput.value);
      var type = normalize(filterType ? filterType.value : "");
      var year = normalize(filterYear ? filterYear.value : "");
      var visible = 0;

      cards.forEach(function (card) {
        var isVisible = match(card, keyword, type, year);
        card.style.display = isVisible ? "" : "none";
        if (isVisible) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    };

    filterInput.addEventListener("input", apply);
    if (filterType) {
      filterType.addEventListener("change", apply);
    }
    if (filterYear) {
      filterYear.addEventListener("change", apply);
    }
    apply();
  }
}());
