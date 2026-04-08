// Remplace les valeurs ci-dessous par tes vrais liens Apple Podcasts et tes métadonnées.
const episodes = [
  {
    title: "Épisode 01 — De Paris à Grasse : les coulisses d'un métier aussi rare que fascinant",
    guest: "Manon, parfumeur",
    date: "5 avril 2026",
    publishedAt: "2026-04-05",
    duration: "58 min",
    summary:
      "Comment devient-on parfumeur quand on quitte Paris pour Grasse ? Manon raconte les coulisses d'un métier plus rare qu'être astronaute — moins de 500 parfumeurs dans le monde — et ce que le Sud change dans une trajectoire de vie.",
    quote:
      "Moins de 500 parfumeurs dans le monde. C'est plus rare qu'être astronaute.",
    listenUrl: "https://open.spotify.com/episode/3AEDAU8YAFku1jHu6mKN4l",
    notesUrl: ""
  }
];

const platforms = {
  apple: "https://podcasts.apple.com/fr/podcast/sud-stories/id1891655073",
  spotify: "https://open.spotify.com/show/1w3CWTSWs3tRKEpSyODo94",
  amazon: "https://music.amazon.com/podcasts/cdf06260-950b-40bd-9c6b-81dc41aa478e/sud-stories",
  rss: "https://feed.ausha.co/5J8awtVWNgxv"
};

const featuredEpisode = document.querySelector("#featured-episode");
const episodeList = document.querySelector("#episode-list");

function isRealUrl(url) {
  return typeof url === "string" && url.trim() !== "" && url !== "#";
}

function isNew(dateStr) {
  if (!dateStr) return false;
  const published = new Date(dateStr);
  const days = (Date.now() - published.getTime()) / (1000 * 60 * 60 * 24);
  return days <= 14;
}

function buildShareButton(episode) {
  return `<button class="share-btn" data-share-url="${episode.listenUrl}" data-share-title="${episode.title}" aria-label="Partager cet épisode">Partager</button>`;
}

function buildExternalLink(className, href, label, ariaLabel) {
  if (!isRealUrl(href)) {
    return "";
  }

  return `<a class="${className}" href="${href}" target="_blank" rel="noopener noreferrer" aria-label="${ariaLabel}">${label}</a>`;
}

function renderFeaturedEpisode(episode) {
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
    )
  ]
    .filter(Boolean)
    .join("");

  const nouveauPill = isNew(episode.publishedAt) ? `<span class="pill pill-new">Nouveau</span>` : "";

  featuredEpisode.innerHTML = `
    <div class="featured-copy">
      <div class="featured-meta">
        <span class="pill">À la une</span>
        ${nouveauPill}
        <span class="pill">${episode.date}</span>
        <span class="pill">${episode.duration}</span>
      </div>
      <h3>${episode.title}</h3>
      <p><strong>${episode.guest}</strong></p>
      <p>${episode.summary}</p>
      <div class="featured-links">${links}${buildShareButton(episode)}</div>
    </div>
    <aside class="featured-quote">
      <p>"${episode.quote || episode.summary}"</p>
    </aside>
  `;
}

const PAGE_SIZE = 3;
let visibleCount = PAGE_SIZE;

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
    )
  ]
    .filter(Boolean)
    .join("");

  const nouveauPill = isNew(episode.publishedAt) ? `<span class="pill pill-new">Nouveau</span>` : "";

  return `
    <article class="episode-card">
      <div class="episode-meta">
        ${nouveauPill}
        <span class="pill">${episode.date}</span>
        <span class="pill">${episode.duration}</span>
      </div>
      <h3>${episode.title}</h3>
      <p><strong>${episode.guest}</strong></p>
      <p>${episode.summary}</p>
      <div class="episode-links">${links}${buildShareButton(episode)}</div>
    </article>
  `;
}

function renderEpisodeList(items) {
  const rest = items.slice(1);
  const visible = rest.slice(0, visibleCount);
  const hasMore = visibleCount < rest.length;

  episodeList.innerHTML = visible.map(buildEpisodeCard).join("");

  const existing = document.querySelector(".load-more-btn");
  if (existing) existing.remove();

  if (hasMore) {
    const btn = document.createElement("button");
    btn.className = "load-more-btn";
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

    if (!isRealUrl(href)) {
      link.removeAttribute("href");
      link.setAttribute("aria-disabled", "true");
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

const episodesTitle = document.querySelector("#episodes-title");
const episodesKicker = document.querySelector("#episodes-title")?.closest(".section-heading")?.querySelector(".section-kicker");
if (episodesTitle && episodes.length === 1) {
  episodesTitle.textContent = "Le premier épisode";
  if (episodesKicker) episodesKicker.textContent = "Première publication";
}

const heroCount = document.querySelector("#hero-episode-count");
const heroLabel = document.querySelector("#hero-episode-label");
if (heroCount) heroCount.textContent = episodes.length;
if (heroLabel) heroLabel.textContent = episodes.length === 1 ? "épisode publié" : "épisodes publiés";

renderFeaturedEpisode(episodes[0]);
renderEpisodeList(episodes);
wirePlatformLinks();

document.addEventListener("click", async (e) => {
  const copyBtn = e.target.closest("[data-copy-url]");
  if (copyBtn) {
    e.preventDefault();
    e.stopPropagation();
    await navigator.clipboard.writeText(copyBtn.dataset.copyUrl);
    const orig = copyBtn.textContent;
    copyBtn.textContent = "Copié !";
    setTimeout(() => { copyBtn.textContent = orig; }, 2000);
    return;
  }

  const btn = e.target.closest("[data-share-url]");
  if (!btn) return;
  const url = btn.dataset.shareUrl;
  const title = btn.dataset.shareTitle;
  if (navigator.share) {
    try { await navigator.share({ title, url }); } catch (_) {}
  } else {
    await navigator.clipboard.writeText(url);
    const original = btn.textContent;
    btn.textContent = "Lien copié !";
    setTimeout(() => { btn.textContent = original; }, 2000);
  }
});

// Fade-in on scroll
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll(".section, .info-card, .platform-card").forEach(el => {
  el.classList.add("fade-in");
  fadeObserver.observe(el);
});

// Active nav on scroll
const navLinks = document.querySelectorAll(".topbar-links a[href^='#']");
const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(l => l.classList.remove("nav-active"));
      const active = document.querySelector(`.topbar-links a[href="#${entry.target.id}"]`);
      if (active) active.classList.add("nav-active");
    }
  });
}, { threshold: 0.4 });

document.querySelectorAll("section[id]").forEach(s => navObserver.observe(s));
