(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }

    Array.prototype.forEach.call(document.querySelectorAll("[data-search-form]"), function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
          input && input.focus();
        }
      });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (slides.length) {
      var current = 0;
      var showSlide = function (index) {
        current = index;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      };
      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          showSlide(dotIndex);
        });
      });
      window.setInterval(function () {
        showSlide((current + 1) % slides.length);
      }, 5600);
    }

    var filterInput = document.querySelector("[data-filter-input]");
    var yearSelect = document.querySelector("[data-year-filter]");
    var regionSelect = document.querySelector("[data-region-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var empty = document.querySelector("[data-empty-state]");
    var runFilter = function () {
      var q = filterInput ? filterInput.value.trim().toLowerCase() : "";
      var year = yearSelect ? yearSelect.value : "";
      var region = regionSelect ? regionSelect.value : "";
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = [card.dataset.title, card.dataset.genre, card.dataset.year, card.dataset.region].join(" ").toLowerCase();
        var matched = (!q || haystack.indexOf(q) !== -1) && (!year || card.dataset.year === year) && (!region || card.dataset.region === region);
        card.style.display = matched ? "block" : "none";
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    };
    [filterInput, yearSelect, regionSelect].forEach(function (el) {
      if (el) {
        el.addEventListener("input", runFilter);
        el.addEventListener("change", runFilter);
      }
    });
  });
})();
