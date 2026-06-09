(function () {
  var header = document.querySelector('[data-header]');
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  function updateHeader() {
    if (!header) {
      return;
    }
    if (window.scrollY > 20) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function queueNext() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5600);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        queueNext();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        queueNext();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        queueNext();
      });
    }

    queueNext();
  }

  var filterInput = document.querySelector('.card-filter');
  var yearFilter = document.querySelector('.year-filter');
  var filterCards = Array.prototype.slice.call(document.querySelectorAll('.filter-grid .movie-card'));

  function applyCardFilter() {
    if (!filterCards.length) {
      return;
    }
    var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var year = yearFilter ? yearFilter.value : '';

    filterCards.forEach(function (card) {
      var text = [
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-category'),
        card.textContent
      ].join(' ').toLowerCase();
      var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
      var matchedYear = !year || card.getAttribute('data-year') === year;
      card.classList.toggle('is-hidden-by-filter', !(matchedKeyword && matchedYear));
    });
  }

  if (filterInput) {
    filterInput.addEventListener('input', applyCardFilter);
  }

  if (yearFilter) {
    yearFilter.addEventListener('change', applyCardFilter);
  }

  var searchInput = document.getElementById('site-search');
  var searchButton = document.getElementById('search-submit');
  var searchResults = document.getElementById('search-results');

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function renderSearchCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return '<article class="movie-card">' +
      '<a class="poster-link" href="' + escapeHtml(movie.url) + '">' +
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
      '<span class="poster-shade"></span><span class="play-badge">▶</span></a>' +
      '<div class="card-body"><div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
      '<h2><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h2>' +
      '<p>' + escapeHtml(movie.oneLine) + '</p><div class="tag-row">' + tags + '</div></div></article>';
  }

  function runSiteSearch() {
    if (!searchInput || !searchResults || !window.MOVIE_SEARCH_DATA) {
      return;
    }
    var keyword = searchInput.value.trim().toLowerCase();
    var items = window.MOVIE_SEARCH_DATA;
    var matched = keyword ? items.filter(function (movie) {
      return [
        movie.title,
        movie.year,
        movie.region,
        movie.type,
        movie.genre,
        (movie.tags || []).join(' '),
        movie.oneLine
      ].join(' ').toLowerCase().indexOf(keyword) !== -1;
    }) : items.slice(0, 36);

    searchResults.innerHTML = matched.slice(0, 240).map(renderSearchCard).join('');
  }

  if (searchInput) {
    searchInput.addEventListener('input', runSiteSearch);
  }

  if (searchButton) {
    searchButton.addEventListener('click', runSiteSearch);
  }
}());
