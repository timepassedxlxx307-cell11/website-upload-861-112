(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initHeader() {
    var header = $('.site-header');
    var button = $('.menu-button');
    var mobileNav = $('.mobile-nav');

    function updateHeader() {
      if (!header) {
        return;
      }
      header.classList.toggle('scrolled', window.scrollY > 20);
    }

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });

    if (button && mobileNav) {
      button.addEventListener('click', function () {
        var isOpen = mobileNav.classList.toggle('open');
        button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        button.textContent = isOpen ? '×' : '☰';
      });
    }
  }

  function initHero() {
    var hero = $('.hero');
    if (!hero) {
      return;
    }

    var slides = $all('.hero-slide', hero);
    var dots = $all('.hero-dot', hero);
    var prev = $('.hero-prev', hero);
    var next = $('.hero-next', hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('is-active', itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('is-active', itemIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide-to') || 0));
        restart();
      });
    });

    show(0);
    restart();
  }

  function initCardFilters() {
    var panel = $('.filter-panel');
    var cards = $all('.movie-card');
    if (!panel || !cards.length || $('#global-search-results')) {
      return;
    }

    var searchInput = $('[data-card-search]', panel);
    var typeSelect = $('[data-type-filter]', panel);
    var regionSelect = $('[data-region-filter]', panel);
    var yearSelect = $('[data-year-filter]', panel);
    var count = $('[data-visible-count]', panel);

    function matchesYear(cardYear, selected) {
      if (!selected) {
        return true;
      }
      var numeric = Number((cardYear || '').match(/\d{4}/));
      if (selected === '2022') {
        return numeric && numeric <= 2022;
      }
      return String(cardYear || '').indexOf(selected) !== -1;
    }

    function apply() {
      var query = (searchInput && searchInput.value || '').trim().toLowerCase();
      var type = typeSelect && typeSelect.value || '';
      var region = regionSelect && regionSelect.value || '';
      var year = yearSelect && yearSelect.value || '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.tags
        ].join(' ').toLowerCase();
        var ok = true;
        ok = ok && (!query || haystack.indexOf(query) !== -1);
        ok = ok && (!type || (card.dataset.type || '').indexOf(type) !== -1 || (card.dataset.tags || '').indexOf(type) !== -1);
        ok = ok && (!region || (card.dataset.region || '').indexOf(region) !== -1);
        ok = ok && matchesYear(card.dataset.year, year);
        card.classList.toggle('is-hidden', !ok);
        if (ok) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = '当前显示 ' + visible + ' 部';
      }
    }

    [searchInput, typeSelect, regionSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  }

  function movieCardTemplate(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span class="tag">' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a class="poster-link" href="./' + escapeHtml(movie.file) + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
      '    <img src="./' + escapeHtml(movie.cover) + '.jpg" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="play-mark">播放</span>',
      '  </a>',
      '  <div class="card-body">',
      '    <h3><a href="./' + escapeHtml(movie.file) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p class="card-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + ' · ' + escapeHtml(movie.year) + '</p>',
      '    <p class="card-desc">' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="tag-list">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function initGlobalSearch() {
    var results = $('#global-search-results');
    if (!results || !window.MOVIE_SEARCH_DATA) {
      return;
    }

    var input = $('#global-search-input');
    var typeFilter = $('#global-type-filter');
    var regionFilter = $('#global-region-filter');
    var count = $('#global-search-count');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function render() {
      var query = (input && input.value || '').trim().toLowerCase();
      var type = typeFilter && typeFilter.value || '';
      var region = regionFilter && regionFilter.value || '';
      var matches = window.MOVIE_SEARCH_DATA.filter(function (movie) {
        var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, (movie.tags || []).join(' '), movie.oneLine].join(' ').toLowerCase();
        var ok = true;
        ok = ok && (!query || haystack.indexOf(query) !== -1);
        ok = ok && (!type || String(movie.type || '').indexOf(type) !== -1 || String(movie.genre || '').indexOf(type) !== -1);
        ok = ok && (!region || String(movie.region || '').indexOf(region) !== -1);
        return ok;
      });
      var limited = matches.slice(0, 240);
      results.innerHTML = limited.map(movieCardTemplate).join('');
      if (count) {
        count.textContent = '共匹配 ' + matches.length + ' 部，显示前 ' + limited.length + ' 部';
      }
    }

    [input, typeFilter, regionFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', render);
        control.addEventListener('change', render);
      }
    });

    render();
  }

  function initPlayers() {
    $all('.movie-player').forEach(function (player) {
      var video = $('video', player);
      var button = $('.play-button', player);
      var status = $('.player-status', player);
      var source = player.getAttribute('data-video');
      var hlsInstance = null;
      var started = false;

      function setStatus(text) {
        if (status) {
          status.textContent = text;
        }
      }

      function startPlayback() {
        if (!video || !source) {
          setStatus('播放源暂不可用');
          return;
        }

        if (started) {
          video.play().catch(function () {});
          return;
        }

        started = true;
        setStatus('正在加载播放源...');

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            player.classList.add('is-loaded');
            setStatus('播放源已加载');
            video.play().catch(function () {
              setStatus('点击视频控件继续播放');
            });
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal && hlsInstance) {
              setStatus('播放源加载异常，请刷新或稍后重试');
              hlsInstance.destroy();
              hlsInstance = null;
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', function () {
            player.classList.add('is-loaded');
            setStatus('播放源已加载');
            video.play().catch(function () {
              setStatus('点击视频控件继续播放');
            });
          }, { once: true });
        } else {
          setStatus('当前浏览器需要 HLS 支持');
        }
      }

      if (button) {
        button.addEventListener('click', startPlayback);
      }

      player.addEventListener('click', function (event) {
        if (event.target === video) {
          return;
        }
        if (!started) {
          startPlayback();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initHeader();
    initHero();
    initCardFilters();
    initGlobalSearch();
    initPlayers();
  });
})();
