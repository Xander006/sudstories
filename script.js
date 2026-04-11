const PAGE_SIZE = 3;

const featuredEpisode = document.querySelector("#featured-episode");
const episodeList = document.querySelector("#episode-list");
const episodesTitle = document.querySelector("#episodes-title");
const episodesKicker = episodesTitle
  ?.closest(".section-heading")
  ?.querySelector(".section-kicker");
const heroCount = document.querySelector("#hero-episode-count");
const heroLabel = document.querySelector("#hero-episode-label");

let visibleCount = PAGE_SIZE;
let site = {};
let episodes = [];
let platforms = {};

function isRealUrl(url) {
  return typeof url === "string" && url.trim() !== "" && url !== "#";
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return entities[char];
  });
}

function isNew(dateStr) {
  if (!dateStr) return false;

  const published = new Date(dateStr);
  if (Number.isNaN(published.getTime())) return false;

  const days = (Date.now() - published.getTime()) / (1000 * 60 * 60 * 24);
  return days >= 0 && days <= 14;
}

async function loadSiteData() {
  const response = await fetch("./content.json", { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Unable to load content.json (${response.status})`);
  }

  const data = await response.json();
  site = data.site || {};
  episodes = Array.isArray(data.episodes) ? data.episodes : [];
  platforms = site.platforms || {};
}

function showLoadingState() {
  if (featuredEpisode) {
    featuredEpisode.classList.add("is-loading");
    featuredEpisode.innerHTML = '<p class="content-loading">Chargement des episodes</p>';
  }

  if (episodeList) {
    episodeList.innerHTML = "";
  }
}

function showErrorState() {
  if (featuredEpisode) {
    featuredEpisode.classList.remove("is-loading");
    featuredEpisode.innerHTML = `
      <div class="featured-copy">
        <div class="featured-meta">
          <span class="pill">Indisponible</span>
        </div>
        <h3>Le contenu n'a pas pu etre charge.</h3>
        <p class="content-error">Verifie que <code>content.json</code> est bien servi par le site.</p>
      </div>
    `;
  }

  if (episodeList) {
    episodeList.innerHTML = "";
  }
}

function injectStructuredData() {
  const sameAs = Object.values(platforms).filter(isRealUrl);
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "PodcastSeries",
      name: site.name,
      url: site.url,
      description: site.description,
      image: site.image,
      inLanguage: site.language,
      genre: site.genre,
      sameAs
    },
    ...episodes.map((episode) => ({
      "@context": "https://schema.org",
      "@type": "PodcastEpisode",
      name: episode.title,
      datePublished: episode.publishedAt,
      timeRequired: episode.timeRequired,
      description: episode.summary,
      url: episode.listenUrl,
      image: site.image,
      inLanguage: site.language,
      partOfSeries: {
        "@type": "PodcastSeries",
        name: site.name
      }
    }))
  ];

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(structuredData);
  document.head.appendChild(script);
}

function buildShareButton(episode) {
  if (!isRealUrl(episode.listenUrl)) {
    return "";
  }

  return `
    <button
      class="share-btn"
      type="button"
      data-share-url="${escapeHtml(episode.listenUrl)}"
      data-share-title="${escapeHtml(episode.title)}"
      aria-label="Partager cet épisode"
    >
      Partager
    </button>
  `;
}

function buildExternalLink(className, href, label, ariaLabel) {
  if (!isRealUrl(href)) {
    return "";
  }

  return `
    <a
      class="${className}"
      href="${escapeHtml(href)}"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="${escapeHtml(ariaLabel)}"
    >
      ${escapeHtml(label)}
    </a>
  `;
}

function buildMetaPills(episode, featured = false) {
  const pills = [];

  if (featured) {
    pills.push('<span class="pill">À la une</span>');
  }

  if (isNew(episode.publishedAt)) {
    pills.push('<span class="pill pill-new">Nouveau</span>');
  }

  if (episode.date) {
    pills.push(`<span class="pill">${escapeHtml(episode.date)}</span>`);
  }

  if (episode.duration) {
    pills.push(`<span class="pill">${escapeHtml(episode.duration)}</span>`);
  }

  return pills.join("");
}

function renderFeaturedEpisode(episode) {
  if (!featuredEpisode) return;
  featuredEpisode.classList.remove("is-loading");

  if (!episode) {
    featuredEpisode.innerHTML = `
      <div class="featured-copy">
        <div class="featured-meta">
          <span class="pill">Bientôt</span>
        </div>
        <h3>Les épisodes arrivent.</h3>
        <p>Le site est prêt. La première histoire sera publiée ici dès sa mise en ligne.</p>
      </div>
    `;
    return;
  }

  const links = [
    buildExternalLink(
      "button button-primary",
      episode.listenUrl,
      "Écouter l'épisode",
      `Écouter ${episode.title}, ouverture dans un nouvel onglet`
    ),
    buildExternalLink(
      "button button-secondary",
      episode.notesUrl,
      "Voir les notes",
      `Voir les notes de ${episode.title}, ouverture dans un nouvel onglet`
    ),
    buildShareButton(episode)
  ]
    .filter(Boolean)
    .join("");

  featuredEpisode.innerHTML = `
    <div class="featured-copy">
      <div class="featured-meta">${buildMetaPills(episode, true)}</div>
      <h3>${escapeHtml(episode.title)}</h3>
      <p><strong>${escapeHtml(episode.guest)}</strong></p>
      <p>${escapeHtml(episode.summary)}</p>
      <div class="featured-links">${links}</div>
    </div>
    <aside class="featured-quote">
      <p>${escapeHtml(episode.quote || episode.summary)}</p>
    </aside>
  `;
}

function buildEpisodeCard(episode) {
  const links = [
    buildExternalLink(
      "text-link",
      episode.listenUrl,
      "Écouter",
      `Écouter ${episode.title}, ouverture dans un nouvel onglet`
    ),
    buildExternalLink(
      "text-link",
      episode.notesUrl,
      "Notes",
      `Voir les notes de ${episode.title}, ouverture dans un nouvel onglet`
    ),
    buildShareButton(episode)
  ]
    .filter(Boolean)
    .join("");

  return `
    <article class="episode-card">
      <div class="episode-meta">${buildMetaPills(episode)}</div>
      <h3>${escapeHtml(episode.title)}</h3>
      <p><strong>${escapeHtml(episode.guest)}</strong></p>
      <p>${escapeHtml(episode.summary)}</p>
      <div class="episode-links">${links}</div>
    </article>
  `;
}

function renderEpisodeList(items) {
  if (!episodeList) return;

  const rest = items.slice(1);
  const visible = rest.slice(0, visibleCount);
  const hasMore = visibleCount < rest.length;

  episodeList.innerHTML = visible.map(buildEpisodeCard).join("");

  const existing = document.querySelector(".load-more-btn");
  if (existing) existing.remove();

  if (!rest.length) return;

  if (hasMore) {
    const btn = document.createElement("button");
    btn.className = "load-more-btn";
    btn.type = "button";
    btn.textContent = `Voir plus d'épisodes (${rest.length - visibleCount} restants)`;
    btn.addEventListener("click", () => {
      visibleCount += PAGE_SIZE;
      renderEpisodeList(items);
    });
    episodeList.after(btn);
  }
}

function wirePlatformLinks() {
  document.querySelectorAll("[data-platform]").forEach((link) => {
    const key = link.dataset.platform;
    const href = platforms[key];
    const card = link.closest(".platform-card");

    if (!isRealUrl(href)) {
      link.removeAttribute("href");
      link.setAttribute("aria-disabled", "true");
      if (card) card.dataset.disabled = "true";
      return;
    }

    link.href = href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute(
      "aria-label",
      `Ouvrir Sud Stories sur ${link.textContent.trim()}, ouverture dans un nouvel onglet`
    );
  });
}

function syncEpisodeLabels(count) {
  if (episodesTitle && count === 1) {
    episodesTitle.textContent = "Le premier épisode";
    if (episodesKicker) episodesKicker.textContent = "Première publication";
  } else if (episodesTitle) {
    episodesTitle.textContent = "Les derniers épisodes";
    if (episodesKicker) episodesKicker.textContent = "Dernières publications";
  }

  if (episodesTitle && count === 0) {
    episodesTitle.textContent = "Les épisodes arrivent";
    if (episodesKicker) episodesKicker.textContent = "À venir";
  }

  if (heroCount) {
    heroCount.textContent = String(count);
  }

  if (heroLabel) {
    heroLabel.textContent = count === 1 ? "épisode publié" : "épisodes publiés";
  }
}

async function copyText(value) {
  if (!value) return false;

  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch (_) {
    return false;
  }
}

function setTemporaryLabel(element, nextLabel, duration = 2000) {
  const originalLabel = element.textContent;
  element.textContent = nextLabel;
  window.setTimeout(() => {
    element.textContent = originalLabel;
  }, duration);
}

function wireActionHandlers() {
  document.addEventListener("click", async (event) => {
    const copyBtn = event.target.closest("[data-copy-url]");
    if (copyBtn) {
      event.preventDefault();
      const copied = await copyText(copyBtn.dataset.copyUrl);
      if (copied) {
        setTemporaryLabel(copyBtn, "Copié !");
      }
      return;
    }

    const shareBtn = event.target.closest("[data-share-url]");
    if (!shareBtn) return;

    const url = shareBtn.dataset.shareUrl;
    const title = shareBtn.dataset.shareTitle;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (_) {
        // Fall back to clipboard when the share sheet is cancelled or unavailable.
      }
    }

    const copied = await copyText(url);
    if (copied) {
      setTemporaryLabel(shareBtn, "Lien copié !");
    }
  });
}

function wireFadeIn() {
  if (!("IntersectionObserver" in window)) {
    return;
  }

  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      fadeObserver.unobserve(entry.target);
    });
  }, { threshold: 0.1 });

  document.querySelectorAll(".section, .info-card, .platform-card").forEach((element) => {
    element.classList.add("fade-in");
    fadeObserver.observe(element);
  });
}

function wireActiveNav() {
  if (!("IntersectionObserver" in window)) {
    return;
  }

  const navLinks = document.querySelectorAll(".topbar-links a[href^='#']");
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      navLinks.forEach((link) => link.classList.remove("nav-active"));
      const active = document.querySelector(`.topbar-links a[href="#${entry.target.id}"]`);
      if (active) active.classList.add("nav-active");
    });
  }, { threshold: 0.4 });

  document.querySelectorAll("section[id]").forEach((section) => navObserver.observe(section));
}

function init() {
  visibleCount = PAGE_SIZE;
  injectStructuredData();
  syncEpisodeLabels(episodes.length);
  renderFeaturedEpisode(episodes[0]);
  renderEpisodeList(episodes);
  wirePlatformLinks();
  wireActionHandlers();
  wireFadeIn();
  wireActiveNav();
}

async function boot() {
  showLoadingState();

  try {
    await loadSiteData();
    init();
  } catch (error) {
    console.error(error);
    syncEpisodeLabels(0);
    showErrorState();
  }
}

boot();
