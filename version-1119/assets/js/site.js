(function () {
  var menu = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.site-nav');
  if (menu && nav) {
    menu.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  if (slides.length) {
    var index = 0;
    var show = function (next) {
      slides[index].classList.remove('active');
      if (dots[index]) dots[index].classList.remove('active');
      index = next;
      slides[index].classList.add('active');
      if (dots[index]) dots[index].classList.add('active');
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    setInterval(function () {
      show((index + 1) % slides.length);
    }, 5200);
  }

  var inputs = Array.prototype.slice.call(document.querySelectorAll('.search-input'));
  inputs.forEach(function (input) {
    var target = input.getAttribute('data-target') || '.movie-card';
    var cards = Array.prototype.slice.call(document.querySelectorAll(target));
    input.addEventListener('input', function () {
      var q = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
        card.classList.toggle('hidden-card', q && text.indexOf(q) === -1);
      });
    });
  });

  var tags = Array.prototype.slice.call(document.querySelectorAll('.filter-tag'));
  tags.forEach(function (tag) {
    tag.addEventListener('click', function () {
      var group = tag.closest('.filter-row');
      var value = tag.getAttribute('data-filter') || '';
      var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
      if (group) {
        Array.prototype.slice.call(group.querySelectorAll('.filter-tag')).forEach(function (btn) {
          btn.classList.remove('active');
        });
      }
      tag.classList.add('active');
      cards.forEach(function (card) {
        var text = card.getAttribute('data-search') || '';
        card.classList.toggle('hidden-card', value && text.indexOf(value) === -1);
      });
    });
  });
})();
