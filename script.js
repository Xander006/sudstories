// Remplace les valeurs ci-dessous par tes vrais liens Apple Podcasts et tes métadonnées.
const episodes = [
  {
    title: "Épisode 01 — Lancer un projet entre mer et montagne",
    guest: "Invité à confirmer",
    date: "Avril 2026",
    duration: "32 min",
    summary:
      "Un premier échange sur le déclic, la prise de risque et la manière dont le Sud transforme un projet en aventure concrète.",
    quote:
      "Ici, on ne vend pas un décor. On raconte ce que le territoire change dans une trajectoire de vie.",
    listenUrl: "https://open.spotify.com/show/1w3CWTSWs3tRKEpSyODo94",
    notesUrl: "#"
  }
];

const platforms = {
  apple: "https://podcasts.apple.com/fr/podcast/sud-stories/id1891655073",
  spotify: "https://open.spotify.com/show/1w3CWTSWs3tRKEpSyODo94",
  amazon: "https://music.amazon.com/podcasts/cdf06260-950b-40bd-9c6b-81dc41aa478e/sud-stories"
};

const featuredEpisode = document.querySelector("#featured-episode");
const episodeList = document.querySelector("#episode-list");

function isRealUrl(url) {
  return typeof url === "string" && url.trim() !== "" && url !== "#";
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

  featuredEpisode.innerHTML = `
    <div class="featured-copy">
      <div class="featured-meta">
        <span class="pill">À la une</span>
        <span class="pill">${episode.date}</span>
        <span class="pill">${episode.duration}</span>
      </div>
      <h3>${episode.title}</h3>
      <p><strong>${episode.guest}</strong></p>
      <p>${episode.summary}</p>
      <div class="featured-links">${links}</div>
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

  return `
    <article class="episode-card">
      <div class="episode-meta">
        <span class="pill">${episode.date}</span>
        <span class="pill">${episode.duration}</span>
      </div>
      <h3>${episode.title}</h3>
      <p><strong>${episode.guest}</strong></p>
      <p>${episode.summary}</p>
      <div class="episode-links">${links}</div>
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

renderFeaturedEpisode(episodes[0]);
renderEpisodeList(episodes);
wirePlatformLinks();
