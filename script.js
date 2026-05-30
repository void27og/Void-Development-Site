const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const packGrid = document.querySelector("[data-pack-grid]");
const sortToggle = document.querySelector("[data-sort-toggle]");
let currentPacks = [];
let currentSort = "desc";

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
initNavPill();
initPageTransitions();
loadModrinthPacks();
if (packGrid) {
  window.setInterval(() => {
    if (document.visibilityState === "visible") {
      loadModrinthPacks();
    }
  }, 60000);
}
window.addEventListener("scroll", syncHeader, { passive: true });
