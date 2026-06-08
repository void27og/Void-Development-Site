const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const packGrid = document.querySelector("[data-pack-grid]");
const sortToggle = document.querySelector("[data-sort-toggle]");
let currentPacks = [];
let currentSort = "desc";
let galaxyAnimationFrame = 0;
let galaxyIdleTimer = 0;
let spaceDriftFrame = 0;
let spaceDriftItems = [];
let spaceDriftInitialized = false;

const fallbackPacks = [
  {
    title: "BridgeOverlay",
    slug: "bridgeoverlay",
    description: "A clean texture that replaces the clay textures in Minecraft 1.8.9 for The Bridge minigame.",
    downloads: 3273,
    followers: 0,
    icon_url: "",
    gallery: [],
    categories: ["16x", "combat", "simplistic"],
  },
  {
    title: "Rofl Sounds",
    slug: "rofl-sounds",
    description: "A fun ASMR-friendly PvP sound pack for Minecraft 1.8 games like Bedwars.",
    downloads: 1874,
    followers: 0,
    icon_url: "",
    gallery: [],
    categories: ["audio", "combat", "simplistic"],
  },
  {
    title: "JustAWoolOverlay",
    slug: "justawooloverlay",
    description: "A clean Bedwars and PvP wool overlay for focus and aesthetic.",
    downloads: 1288,
    followers: 1,
    icon_url: "",
    gallery: [],
    categories: ["128x", "blocks", "combat"],
  },
  {
    title: "GodbridgerEssential",
    slug: "godbridge",
    description: "A wool overlay designed specifically for godbridging and bridging practice.",
    downloads: 944,
    followers: 1,
    icon_url: "",
    gallery: [],
    categories: ["16x", "blocks", "combat"],
  },
  {
    title: "Shadow 16x",
    slug: "shadow",
    description: "A clean default-edit PvP minigame texture pack with 16x styling.",
    downloads: 861,
    followers: 0,
    icon_url: "",
    gallery: [],
    categories: ["audio", "combat", "fonts"],
  },
  {
    title: "RoseSky",
    slug: "rosesky",
    description: "A pink-themed sky overlay designed for Minecraft 1.8.",
    downloads: 263,
    followers: 0,
    icon_url: "",
    gallery: [],
    categories: ["environment", "realistic", "themed"],
  },
  {
    title: "Soul Skies",
    slug: "soulskies",
    description: "A sky overlay focused on atmosphere and cleaner PvP visuals.",
    downloads: 103,
    followers: 1,
    icon_url: "",
    gallery: [],
    categories: ["128x", "environment", "themed"],
  },
];

function syncHeader() {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 8);
}

function syncNavPill(targetLink) {
  if (!nav || !targetLink) return;

  const navRect = nav.getBoundingClientRect();
  const linkRect = targetLink.getBoundingClientRect();
  nav.style.setProperty("--pill-x", `${linkRect.left - navRect.left}px`);
  nav.style.setProperty("--pill-y", `${linkRect.top - navRect.top}px`);
  nav.style.setProperty("--pill-width", `${linkRect.width}px`);
  nav.style.setProperty("--pill-height", `${linkRect.height}px`);
}

function initNavPill() {
  if (!nav) return;

  const links = [...nav.querySelectorAll("a")];
  const activeLink = nav.querySelector("[aria-current='page']") || links[0];

  syncNavPill(activeLink);

  links.forEach((link) => {
    link.addEventListener("mouseenter", () => syncNavPill(link));
    link.addEventListener("focus", () => syncNavPill(link));
  });

  nav.addEventListener("mouseleave", () => syncNavPill(activeLink));
  window.addEventListener("resize", () => syncNavPill(nav.querySelector("[aria-current='page']") || activeLink));
}

function initPageTransitions() {
  document.body.classList.add("is-ready");

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (!link) return;

    const url = new URL(link.href, window.location.href);
    const isModifiedClick = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
    const isSameOrigin = url.origin === window.location.origin;
    const isPageFile = url.pathname.endsWith(".html") || url.pathname === "/" || url.pathname.endsWith("/");
    const isHashOnly = url.pathname === window.location.pathname && url.hash;

    if (isModifiedClick || link.target || !isSameOrigin || !isPageFile || isHashOnly) return;

    event.preventDefault();
    document.body.classList.add("is-leaving");
    window.setTimeout(() => {
      window.location.href = link.href;
    }, 220);
  });
}

function initGalaxy() {
  const field = document.createElement("div");
  field.className = "galaxy-field";
  field.setAttribute("aria-hidden", "true");
  field.innerHTML = `
    <img class="galaxy-image galaxy-image--main" src="assets/spiral.jpg" alt="">
  `;
  document.body.prepend(field);
}

function initScrollReveal() {
  const targets = document.querySelectorAll(
    ".hero, .page-hero, .section-title-band, .feature-card, .studio-panel, .mini-grid article, .pack-card, .website-card, .profile-card, .socials-card, .loading-card",
  );

  if (!targets.length) return;

  targets.forEach((target) => target.classList.add("reveal-on-scroll"));

  if (!("IntersectionObserver" in window)) {
    targets.forEach((target) => target.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

  targets.forEach((target) => observer.observe(target));
}

function initSpaceDrift() {
  document.documentElement.classList.add("space-scene-ready");
}

function initRotaryGalaxy() {
  const rotaries = [...document.querySelectorAll("[data-rotary-galaxy]")].map((rotary) => ({
    rotary,
    links: [...rotary.querySelectorAll("[data-rotary-link]")],
  })).filter((item) => item.links.length);

  if (!rotaries.length) return;

  let frame = 0;

  function updateRotary() {
    rotaries.forEach(({ rotary, links }) => {
      const rect = rotary.getBoundingClientRect();
      const isCompact = rotary.classList.contains("social-rotary") || rotary.classList.contains("compact-rotary");
      const progress = isCompact
        ? Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height - window.innerHeight * 0.9)))
        : Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height - window.innerHeight)));
      const rotation = progress * 292;
      const activeIndex = Math.min(links.length - 1, Math.floor(progress * links.length));

      rotary.style.setProperty("--dial-rotation", `${rotation.toFixed(2)}deg`);
      rotary.style.setProperty("--dial-scale", `${(0.96 + Math.sin(progress * Math.PI) * 0.08).toFixed(3)}`);

      links.forEach((link, index) => {
        link.classList.toggle("is-active", index === activeIndex);
      });
    });
  }

  function requestRotaryUpdate() {
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(updateRotary);
  }

  updateRotary();
  window.addEventListener("scroll", requestRotaryUpdate, { passive: true });
  window.addEventListener("resize", requestRotaryUpdate);
}

function initSocialIconSwap() {
  const display = document.querySelector("[data-social-display]");
  const links = [...document.querySelectorAll("[data-social-icon]")];
  if (!display || !links.length) return;

  const icons = {
    github: `<svg viewBox="0 0 24 24" role="img"><path d="M12 2.3a9.7 9.7 0 0 0-3.1 18.9c.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.2-3.4-1.2-.5-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 0 1.6 1.1 1.6 1.1.9 1.6 2.5 1.1 3.1.9.1-.7.4-1.1.7-1.4-2.2-.3-4.6-1.1-4.6-4.8 0-1.1.4-1.9 1-2.6-.1-.3-.4-1.3.1-2.6 0 0 .8-.3 2.7 1a9.2 9.2 0 0 1 4.9 0c1.9-1.3 2.7-1 2.7-1 .5 1.3.2 2.3.1 2.6.6.7 1 1.5 1 2.6 0 3.7-2.3 4.5-4.6 4.8.4.3.8 1 .8 2v2.4c0 .3.2.6.7.5A9.7 9.7 0 0 0 12 2.3Z"/></svg>`,
    instagram: `<svg viewBox="0 0 24 24" role="img"><rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.4"/><circle cx="16.8" cy="7.2" r="1"/></svg>`,
    snapchat: `<svg viewBox="0 0 24 24" role="img"><path d="M12 3.4c2.4 0 4.2 1.9 4.2 4.5v2.4c0 .5.4.9 1.3 1.2.6.2 1.1.4 1.1.9 0 .6-.8 1-1.7 1.2-.2.1-.3.4-.1.7.5.8 1.2 1.1 2.1 1.4.4.1.6.5.5.9-.1.5-.7.7-1.2.8-.8.1-1.6.3-2.1.9-.4.4-.8.7-1.5.5-.8-.2-1.5-.7-2.6-.7s-1.8.5-2.6.7c-.7.2-1.1-.1-1.5-.5-.5-.6-1.3-.8-2.1-.9-.5-.1-1.1-.3-1.2-.8-.1-.4.1-.8.5-.9.9-.3 1.6-.6 2.1-1.4.2-.3.1-.6-.1-.7-.9-.2-1.7-.6-1.7-1.2 0-.5.5-.7 1.1-.9.9-.3 1.3-.7 1.3-1.2V7.9c0-2.6 1.8-4.5 4.2-4.5Z"/></svg>`,
    youtube: `<svg viewBox="0 0 24 24" role="img"><path d="M21 8.1a3 3 0 0 0-2.1-2.1C17 5.5 12 5.5 12 5.5s-5 0-6.9.5A3 3 0 0 0 3 8.1 31 31 0 0 0 2.5 12c0 1.4.2 2.8.5 3.9A3 3 0 0 0 5.1 18c1.9.5 6.9.5 6.9.5s5 0 6.9-.5a3 3 0 0 0 2.1-2.1c.3-1.1.5-2.5.5-3.9s-.2-2.8-.5-3.9ZM10.2 15V9l5.2 3-5.2 3Z"/></svg>`,
  };

  function setIcon(name) {
    if (!icons[name] || display.dataset.activeSocial === name) return;
    display.dataset.activeSocial = name;
    display.classList.add("is-switching");
    window.setTimeout(() => {
      display.innerHTML = `<span class="social-logo showcase-logo ${name}-logo">${icons[name]}</span>`;
      display.classList.remove("is-switching");
    }, 90);
  }

  links.forEach((link) => {
    link.addEventListener("mouseenter", () => setIcon(link.dataset.socialIcon));
    link.addEventListener("focus", () => setIcon(link.dataset.socialIcon));
  });

  setIcon(links[0].dataset.socialIcon);
}

function formatNumber(value) {
  return new Intl.NumberFormat("en", { notation: value >= 10000 ? "compact" : "standard" }).format(value || 0);
}

function getPackImage(pack) {
  const firstImage = Array.isArray(pack.gallery) ? pack.gallery[0] : null;
  return firstImage?.url || firstImage?.raw_url || pack.icon_url || "";
}

function createTag(text) {
  return `<span>${text}</span>`;
}

function sortPacksByDownloads(packs) {
  return [...packs].sort((a, b) => {
    const first = Number(a.downloads || 0);
    const second = Number(b.downloads || 0);
    return currentSort === "desc" ? second - first : first - second;
  });
}

function updateSortLabel() {
  if (!sortToggle) return;
  const isDescending = currentSort === "desc";
  sortToggle.textContent = isDescending ? "Downloads: high to low" : "Downloads: low to high";
  sortToggle.setAttribute("aria-label", isDescending ? "Sort downloads ascending" : "Sort downloads descending");
}

function renderPacks(packs, isFallback = false) {
  if (!packGrid) return;

  const resourcePacks = sortPacksByDownloads(
    packs.filter((pack) => !pack.project_type || pack.project_type === "resourcepack"),
  );

  if (!resourcePacks.length) {
    packGrid.innerHTML = `<article class="loading-card">No resource packs found for this Modrinth profile.</article>`;
    return;
  }

  packGrid.innerHTML = resourcePacks.map((pack) => {
    const image = getPackImage(pack);
    const url = `https://modrinth.com/resourcepack/${pack.slug}`;
    const tags = [...(pack.categories || []), ...(pack.additional_categories || [])].slice(0, 4);

    return `
      <article class="pack-card">
        <a class="pack-media" href="${url}" target="_blank" rel="noreferrer" aria-label="Open ${pack.title} on Modrinth">
          ${image ? `<img src="${image}" alt="${pack.title} gallery preview" loading="lazy">` : `<div class="pack-placeholder">${pack.title.slice(0, 2)}</div>`}
        </a>
        <div class="pack-content">
          <div class="pack-title-row">
            <img src="${pack.icon_url || image || "assets/hero-void-development.png"}" alt="" loading="lazy">
            <div>
              <h3>${pack.title}</h3>
              <p>${formatNumber(pack.downloads)} downloads | ${formatNumber(pack.followers)} followers</p>
            </div>
          </div>
          <p>${pack.description}</p>
          <div class="tag-row">${tags.map(createTag).join("")}</div>
          <a class="text-link" href="${url}" target="_blank" rel="noreferrer">View on Modrinth</a>
        </div>
      </article>
    `;
  }).join("");

  if (isFallback) {
    packGrid.insertAdjacentHTML("afterbegin", `<article class="loading-card warning">Showing fallback pack names because live Modrinth data could not be reached.</article>`);
  }

  initScrollReveal();
  initSpaceDrift();
}

async function loadModrinthPacks() {
  if (!packGrid) return;

  try {
    const response = await fetch("https://api.modrinth.com/v2/user/voiddevelopment/projects");

    if (!response.ok) throw new Error(`Modrinth returned ${response.status}`);

    const projects = await response.json();
    currentPacks = projects;
    renderPacks(currentPacks);
  } catch (error) {
    currentPacks = fallbackPacks;
    renderPacks(currentPacks, true);
  }
}

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      nav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
}

if (sortToggle) {
  updateSortLabel();
  sortToggle.addEventListener("click", () => {
    currentSort = currentSort === "desc" ? "asc" : "desc";
    updateSortLabel();
    renderPacks(currentPacks.length ? currentPacks : fallbackPacks);
  });
}

syncHeader();
initGalaxy();
initNavPill();
initPageTransitions();
initScrollReveal();
initSpaceDrift();
initRotaryGalaxy();
initSocialIconSwap();
loadModrinthPacks();
if (packGrid) {
  window.setInterval(() => {
    if (document.visibilityState === "visible") {
      loadModrinthPacks();
    }
  }, 60000);
}
window.addEventListener("scroll", syncHeader, { passive: true });
