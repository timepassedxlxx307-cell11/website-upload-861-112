(function () {
  function createCard(movie) {
    var a = document.createElement("a");
    a.className = "movie-card";
    a.href = movie.href;
    a.dataset.title = movie.title;
    a.dataset.genre = movie.genre;
    a.dataset.year = movie.year;
    a.dataset.region = movie.region;
    a.innerHTML = "<span class=\"card-year\"></span><span class=\"card-play\">▶</span><img loading=\"lazy\"><span class=\"card-gradient\"></span><span class=\"card-content\"><strong></strong><em></em></span>";
    a.querySelector(".card-year").textContent = movie.year;
    var img = a.querySelector("img");
    img.src = movie.cover;
    img.alt = movie.title;
    a.querySelector("strong").textContent = movie.title;
    a.querySelector("em").textContent = movie.genre;
    return a;
  }

  function run() {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim().toLowerCase();
    var input = document.querySelector("[data-search-input]");
    var grid = document.querySelector("[data-search-results]");
    var title = document.querySelector("[data-search-title]");
    if (input) {
      input.value = params.get("q") || "";
    }
    if (!grid || !window.SiteMovies) {
      return;
    }
    var list = window.SiteMovies.filter(function (movie) {
      if (!query) {
        return true;
      }
      return [movie.title, movie.genre, movie.tags, movie.region, movie.year].join(" ").toLowerCase().indexOf(query) !== -1;
    }).slice(0, 120);
    if (title) {
      title.textContent = query ? "搜索结果" : "热门推荐";
    }
    grid.innerHTML = "";
    list.forEach(function (movie) {
      grid.appendChild(createCard(movie));
    });
    var empty = document.querySelector("[data-empty-state]");
    if (empty) {
      empty.classList.toggle("is-visible", list.length === 0);
    }
  }

  if (document.readyState !== "loading") {
    run();
  } else {
    document.addEventListener("DOMContentLoaded", run);
  }
})();
