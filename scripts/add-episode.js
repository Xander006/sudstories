#!/usr/bin/env node

const fs = require("node:fs/promises");
const path = require("node:path");
const readline = require("node:readline/promises");
const { stdin, stdout } = require("node:process");

const CONTENT_PATH = path.resolve(__dirname, "..", "content.json");
const KNOWN_AUDIO_HOSTS = [
  "spotify.com",
  "podcasts.apple.com",
  "music.amazon.com",
  "ausha.co"
];

function slugEpisodeNumber(episodes) {
  return String(episodes.length + 1).padStart(2, "0");
}

function formatFrenchDate(isoDate) {
  const [year, month, day] = isoDate.split("-").map(Number);
  const months = [
    "janvier",
    "fevrier",
    "mars",
    "avril",
    "mai",
    "juin",
    "juillet",
    "aout",
    "septembre",
    "octobre",
    "novembre",
    "decembre"
  ];

  return `${day} ${months[month - 1]} ${year}`;
}

function parseDurationMinutes(duration) {
  const match = duration.match(/\d+/);
  return match ? Number(match[0]) : null;
}

function validateIsoDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function buildTimeRequired(duration) {
  const minutes = parseDurationMinutes(duration);
  return minutes ? `PT${minutes}M` : "";
}

function compareEpisodesByDateDesc(left, right) {
  return right.publishedAt.localeCompare(left.publishedAt);
}

function isKnownAudioUrl(value) {
  try {
    const url = new URL(value);
    return KNOWN_AUDIO_HOSTS.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`));
  } catch (_) {
    return false;
  }
}

function warn(message) {
  stdout.write(`Attention: ${message}\n`);
}

async function askRequiredQuestion(rl, prompt, validator) {
  while (true) {
    const answer = (await rl.question(prompt)).trim();
    if (!answer) continue;
    if (!validator || validator(answer)) return answer;
    stdout.write("Valeur invalide. Reessaie.\n");
  }
}

async function main() {
  const raw = await fs.readFile(CONTENT_PATH, "utf8");
  const data = JSON.parse(raw);
  const episodes = Array.isArray(data.episodes) ? data.episodes : [];
  const episodeNumber = slugEpisodeNumber(episodes);
  const rl = readline.createInterface({ input: stdin, output: stdout });

  try {
    stdout.write(`Ajout de l'episode ${episodeNumber}\n`);

    const guest = await askRequiredQuestion(rl, "Invite: ");
    const topic = await askRequiredQuestion(rl, "Titre / sujet: ");
    const publishedAt = await askRequiredQuestion(
      rl,
      "Date de publication (YYYY-MM-DD): ",
      validateIsoDate
    );
    const duration = await askRequiredQuestion(rl, "Duree (ex: 58 min): ");
    const summary = await askRequiredQuestion(rl, "Resume: ");
    const quote = await askRequiredQuestion(rl, "Citation mise en avant: ");
    const listenUrl = await askRequiredQuestion(rl, "Lien d'ecoute: ", (value) => /^https?:\/\//.test(value));
    const notesUrl = (await rl.question("Lien des notes (optionnel): ")).trim();
    const timeRequired = buildTimeRequired(duration);

    if (!timeRequired) {
      throw new Error("Impossible de calculer timeRequired a partir de la duree. Utilise un format comme '58 min'.");
    }

    if (!isKnownAudioUrl(listenUrl)) {
      warn("le lien d'ecoute ne ressemble pas a une plateforme connue.");
    }

    const newestExisting = episodes
      .map((episode) => episode.publishedAt)
      .filter(Boolean)
      .sort()
      .at(-1);

    if (newestExisting && publishedAt < newestExisting) {
      warn(`la date saisie (${publishedAt}) est plus ancienne que l'episode le plus recent (${newestExisting}).`);
    }

    const newEpisode = {
      title: `Épisode ${episodeNumber} — ${topic}`,
      guest,
      date: formatFrenchDate(publishedAt),
      publishedAt,
      duration,
      timeRequired,
      summary,
      quote,
      listenUrl,
      notesUrl
    };

    episodes.push(newEpisode);
    data.episodes = episodes.sort(compareEpisodesByDateDesc);

    await fs.writeFile(CONTENT_PATH, `${JSON.stringify(data, null, 2)}\n`, "utf8");
    stdout.write(`Episode ajoute dans ${CONTENT_PATH}\n`);
  } finally {
    rl.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
