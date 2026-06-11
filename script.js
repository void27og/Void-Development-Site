const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const packGrid = document.querySelector("[data-pack-grid]");
const sortToggle = document.querySelector("[data-sort-toggle]");
const motionPreferenceKey = "voidDevelopmentMotionPreference";
const motionPromptKey = "voidDevelopmentMotionPromptSeen";
let currentPacks = [];
let currentSort = "desc";
let galaxyAnimationFrame = 0;
let galaxyIdleTimer = 0;
let spaceDriftFrame = 0;
let spaceDriftItems = [];
let spaceDriftInitialized = false;

const borderGlowSelector = [
  ".page-hero",
  ".section-title-band",
  ".feature-card",
  ".studio-panel",
  ".glass-panel",
  ".mini-grid article",
  ".pack-card",
  ".website-card",
  ".loading-card",
  ".profile-card",
  ".socials-card",
].join(", ");

const gradientPositions = ["80% 55%", "69% 34%", "8% 6%", "41% 38%", "86% 85%", "82% 18%", "51% 4%"];
const gradientKeys = [
  "--gradient-one",
  "--gradient-two",
  "--gradient-three",
  "--gradient-four",
  "--gradient-five",
  "--gradient-six",
  "--gradient-seven",
];
const colorMap = [0, 1, 2, 0, 1, 2, 1];
const navIcons = {
  home: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11.4 12 4l8 7.4v8.1a1 1 0 0 1-1 1h-4.4v-5.8H9.4v5.8H5a1 1 0 0 1-1-1v-8.1Z"/></svg>`,
  packs: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.4 4.5 7.2 12 11l7.5-3.8L12 3.4Zm-8 6.2v7.3l7 3.6v-7.3L4 9.6Zm16 0-7 3.6v7.3l7-3.6V9.6Z"/></svg>`,
  websites: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.3 5.2h15.4a1.8 1.8 0 0 1 1.8 1.8v9.6a1.8 1.8 0 0 1-1.8 1.8H4.3a1.8 1.8 0 0 1-1.8-1.8V7a1.8 1.8 0 0 1 1.8-1.8Zm.2 3v7.9h15V8.2h-15Zm4.2 12h6.6v1.4H8.7v-1.4Z"/></svg>`,
  contact: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5a8 8 0 0 0-8 8v4.1c0 1.1.9 2 2 2h1.4v-5.4H5.8v-.7a6.2 6.2 0 0 1 12.4 0v.7h-1.6v5.4h1.8a3.6 3.6 0 0 1-3.5 2.9h-2.1v-1.6h2.1a2 2 0 0 0 1.9-1.3H18c1.1 0 2-.9 2-2v-4.1a8 8 0 0 0-8-8Z"/></svg>`,
};

function getSystemReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getMotionPreference() {
  const storedPreference = localStorage.getItem(motionPreferenceKey);
  if (storedPreference === "reduced") return true;
  if (storedPreference === "full") return false;
  return getSystemReducedMotion();
}

function isMotionReduced() {
  return document.documentElement.classList.contains("motion-reduced");
}

function updateMotionToggle(toggle) {
  const reduced = isMotionReduced();
  toggle.setAttribute("aria-pressed", String(reduced));
  toggle.setAttribute("aria-label", reduced ? "Enable full motion" : "Enable reduced motion");
  toggle.title = reduced ? "Enable full motion" : "Enable reduced motion";
}

function applyMotionPreference(reduced, persist = true) {
  document.documentElement.classList.toggle("motion-reduced", reduced);
  document.body.classList.toggle("reduce-motion", reduced);

  if (persist) {
    localStorage.setItem(motionPreferenceKey, reduced ? "reduced" : "full");
  }

  document.querySelectorAll("[data-motion-toggle]").forEach(updateMotionToggle);
  window.dispatchEvent(new CustomEvent("motionPreferenceChange", { detail: { reduced } }));
}

function setMotionPreferenceFromChoice(reduced) {
  localStorage.setItem(motionPromptKey, "true");
  applyMotionPreference(reduced);
}

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

function initMotionControls() {
  applyMotionPreference(getMotionPreference(), false);

  if (header && !header.querySelector("[data-motion-toggle]")) {
    const toggle = document.createElement("button");
    toggle.className = "motion-toggle";
    toggle.type = "button";
    toggle.dataset.motionToggle = "true";
    toggle.innerHTML = `
      <span class="motion-toggle-icon" aria-hidden="true"></span>
      <span class="motion-toggle-text">Motion</span>
    `;
    updateMotionToggle(toggle);
    toggle.addEventListener("click", () => {
      setMotionPreferenceFromChoice(!isMotionReduced());
    });
    header.insertBefore(toggle, navToggle || nav);
  }

  if (localStorage.getItem(motionPromptKey) === "true") return;

  const dialog = document.createElement("section");
  dialog.className = "motion-dialog";
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");
  dialog.setAttribute("aria-labelledby", "motion-dialog-title");
  dialog.innerHTML = `
    <div class="motion-dialog-card">
      <p class="section-kicker">Motion preference</p>
      <h2 id="motion-dialog-title">Choose your motion level.</h2>
      <p>This site uses animated stars, hover glow, and smooth transitions. Pick what feels best on your device.</p>
      <div class="motion-dialog-actions">
        <button class="button primary" type="button" data-motion-choice="full">Full motion</button>
        <button class="button ghost" type="button" data-motion-choice="reduced">Reduced motion</button>
      </div>
    </div>
  `;
  document.body.append(dialog);
  document.body.classList.add("has-motion-dialog");

  const choiceButtons = [...dialog.querySelectorAll("[data-motion-choice]")];
  choiceButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setMotionPreferenceFromChoice(button.dataset.motionChoice === "reduced");
      dialog.remove();
      document.body.classList.remove("has-motion-dialog");
    });
  });
  choiceButtons[0]?.focus({ preventScroll: true });
}

function parseHSL(hslStr) {
  const match = hslStr.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/);
  if (!match) return { h: 40, s: 80, l: 80 };
  return { h: parseFloat(match[1]), s: parseFloat(match[2]), l: parseFloat(match[3]) };
}

function applyGlowColorVars(card, glowColor, intensity) {
  const { h, s, l } = parseHSL(glowColor);
  const base = `${h}deg ${s}% ${l}%`;
  const opacities = [100, 60, 50, 40, 30, 20, 10];
  const keys = ["", "-60", "-50", "-40", "-30", "-20", "-10"];

  opacities.forEach((opacity, index) => {
    card.style.setProperty(`--glow-color${keys[index]}`, `hsl(${base} / ${Math.min(opacity * intensity, 100)}%)`);
  });
}

function applyGradientVars(card, colors) {
  gradientKeys.forEach((key, index) => {
    const color = colors[Math.min(colorMap[index], colors.length - 1)];
    card.style.setProperty(key, `radial-gradient(at ${gradientPositions[index]}, ${color} 0px, transparent 50%)`);
  });
  card.style.setProperty("--gradient-base", `linear-gradient(${colors[0]} 0 100%)`);
}

function getCenterOfElement(el) {
  const { width, height } = el.getBoundingClientRect();
  return [width / 2, height / 2];
}

function getEdgeProximity(el, x, y) {
  const [cx, cy] = getCenterOfElement(el);
  const dx = x - cx;
  const dy = y - cy;
  let kx = Infinity;
  let ky = Infinity;
  if (dx !== 0) kx = cx / Math.abs(dx);
  if (dy !== 0) ky = cy / Math.abs(dy);
  return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
}

function getCursorAngle(el, x, y) {
  const [cx, cy] = getCenterOfElement(el);
  const dx = x - cx;
  const dy = y - cy;
  if (dx === 0 && dy === 0) return 0;

  let degrees = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
  if (degrees < 0) degrees += 360;
  return degrees;
}

function handleBorderGlowPointerMove(event) {
  if (isMotionReduced()) return;

  const card = event.currentTarget;
  card._glowPointerX = event.clientX;
  card._glowPointerY = event.clientY;

  if (card._glowFrame) return;

  card._glowFrame = window.requestAnimationFrame(() => {
    const rect = card.getBoundingClientRect();
    const x = card._glowPointerX - rect.left;
    const y = card._glowPointerY - rect.top;
    const edge = getEdgeProximity(card, x, y);
    const angle = getCursorAngle(card, x, y);

    card.style.setProperty("--edge-proximity", `${(edge * 100).toFixed(3)}`);
    card.style.setProperty("--cursor-angle", `${angle.toFixed(3)}deg`);
    card._glowFrame = 0;
  });
}

function initBorderGlow() {
  const cards = [...document.querySelectorAll(borderGlowSelector)];
  if (!cards.length) return;

  cards.forEach((card) => {
    if (card.dataset.borderGlowReady === "true") return;

    const radius = Number.parseFloat(getComputedStyle(card).borderRadius) || 26;
    card.dataset.borderGlowReady = "true";
    card.classList.add("border-glow-card");
    card.style.setProperty("--card-bg", "#120f17");
    card.style.setProperty("--edge-sensitivity", "30");
    card.style.setProperty("--border-radius", `${radius}px`);
    card.style.setProperty("--glow-padding", "34px");
    card.style.setProperty("--cone-spread", "25");
    card.style.setProperty("--fill-opacity", card.classList.contains("page-hero") ? "0.28" : "0.42");
    applyGlowColorVars(card, "212 88 86", 0.82);
    applyGradientVars(card, ["#e8f2ff", "#6ea8ff", "#d8b978"]);

    const edgeLight = document.createElement("span");
    edgeLight.className = "edge-light";
    edgeLight.setAttribute("aria-hidden", "true");
    card.prepend(edgeLight);
    card.addEventListener("pointermove", handleBorderGlowPointerMove);
  });
}

function getNavIconKey(link) {
  const href = link.getAttribute("href") || "";
  if (href.includes("resource-packs")) return "packs";
  if (href.includes("websites")) return "websites";
  if (href.includes("contact")) return "contact";
  return "home";
}

function setDockItemSize(link, size) {
  link.style.setProperty("--dock-size", `${size.toFixed(2)}px`);
}

function syncDockMagnification(mouseX) {
  if (!nav) return;
  if (isMotionReduced()) {
    resetDockMagnification();
    return;
  }

  nav._dockMouseX = mouseX;

  if (nav._dockFrame) return;

  nav._dockFrame = window.requestAnimationFrame(() => {
    const links = [...nav.querySelectorAll("a")];
    const baseSize = 50;
    const magnification = 70;
    const distance = 180;
    const sizes = links.map((link) => {
      const rect = link.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      const proximity = Math.max(0, 1 - Math.abs(nav._dockMouseX - center) / distance);
      return baseSize + (magnification - baseSize) * proximity;
    });

    links.forEach((link, index) => setDockItemSize(link, sizes[index]));
    nav._dockFrame = 0;
  });
}

function resetDockMagnification() {
  if (!nav) return;
  nav.querySelectorAll("a").forEach((link) => setDockItemSize(link, 50));
}

function initDockNav() {
  if (!nav) return;

  const links = [...nav.querySelectorAll("a")];
  nav.setAttribute("role", "toolbar");
  nav.setAttribute("aria-label", "Primary navigation dock");

  links.forEach((link) => {
    if (link.dataset.dockReady === "true") return;

    const label = link.textContent.trim();
    const iconKey = getNavIconKey(link);
    link.dataset.dockReady = "true";
    link.dataset.label = label;
    link.setAttribute("aria-label", label);
    link.innerHTML = `
      <span class="dock-icon">${navIcons[iconKey]}</span>
      <span class="dock-label" role="tooltip">${label}</span>
    `;
    setDockItemSize(link, 50);

    link.addEventListener("focus", () => setDockItemSize(link, 70));
    link.addEventListener("blur", () => setDockItemSize(link, 50));
  });

  nav.addEventListener("mousemove", (event) => syncDockMagnification(event.clientX));
  nav.addEventListener("mouseleave", resetDockMagnification);
  window.addEventListener("resize", resetDockMagnification);
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
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { alpha: true });

  field.className = "galaxy-field";
  field.setAttribute("aria-hidden", "true");
  canvas.className = "galaxy-canvas";
  field.append(canvas);
  document.body.prepend(field);

  if (!context) return;

  let reducedMotion = isMotionReduced();
  const smallScreen = window.matchMedia("(max-width: 760px)").matches;
  const lowPower = (navigator.hardwareConcurrency || 4) <= 4 || smallScreen;
  const maxDpr = lowPower ? 1 : 1.5;
  const targetFps = lowPower ? 24 : 30;
  let width = 0;
  let height = 0;
  let dpr = 1;
  let stars = [];
  let lastFrame = 0;
  let pointerX = 0.5;
  let pointerY = 0.5;
  let smoothPointerX = 0.5;
  let smoothPointerY = 0.5;
  let pointerActive = 0;
  let smoothPointerActive = 0;

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function createStars() {
    const area = Math.min(1400000, width * height);
    const density = lowPower ? 0.000105 : 0.00015;
    const count = Math.max(90, Math.min(lowPower ? 170 : 260, Math.floor(area * density)));

    stars = Array.from({ length: count }, () => {
      const arm = Math.random() * Math.PI * 2;
      const radius = Math.pow(Math.random(), 1.85);
      const swirl = radius * 4.4;
      const angle = arm + swirl + randomBetween(-0.55, 0.55);
      const spread = randomBetween(-0.09, 0.09) * (1 - radius);
      const hue = Math.random() > 0.82 ? randomBetween(40, 48) : randomBetween(195, 218);

      return {
        angle,
        radius,
        spread,
        hue,
        alpha: randomBetween(0.28, 0.92),
        size: randomBetween(0.65, lowPower ? 1.45 : 1.9),
        speed: randomBetween(0.000018, 0.00005) * (Math.random() > 0.5 ? 1 : -1),
        twinkle: randomBetween(0.7, 1.8),
      };
    });
  }

  function resizeGalaxy() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    createStars();
    drawGalaxy(performance.now());
  }

  function drawGalaxy(time) {
    const cx = width * 0.5;
    const cy = height * 0.52;
    const maxRadius = Math.min(width, height) * (smallScreen ? 0.68 : 0.78);

    context.clearRect(0, 0, width, height);
    context.globalCompositeOperation = "source-over";
    context.fillStyle = "#000004";
    context.fillRect(0, 0, width, height);

    const core = context.createRadialGradient(cx, cy, 0, cx, cy, maxRadius * 0.56);
    core.addColorStop(0, "rgba(232, 242, 255, 0.12)");
    core.addColorStop(0.25, "rgba(110, 168, 255, 0.11)");
    core.addColorStop(1, "rgba(0, 0, 0, 0)");
    context.fillStyle = core;
    context.fillRect(0, 0, width, height);

    smoothPointerX += (pointerX - smoothPointerX) * 0.045;
    smoothPointerY += (pointerY - smoothPointerY) * 0.045;
    smoothPointerActive += (pointerActive - smoothPointerActive) * 0.045;

    context.globalCompositeOperation = "lighter";
    stars.forEach((star) => {
      const rotation = reducedMotion ? 0 : time * star.speed;
      const angle = star.angle + rotation + star.spread;
      const radius = star.radius * maxRadius;
      const ellipseY = Math.sin(angle) * radius * 0.38;
      let x = cx + Math.cos(angle) * radius;
      let y = cy + ellipseY;

      if (smoothPointerActive > 0.01) {
        const dx = x - smoothPointerX * width;
        const dy = y - smoothPointerY * height;
        const distance = Math.max(70, Math.hypot(dx, dy));
        const force = Math.max(0, 1 - distance / 260) * smoothPointerActive * 14;
        x += (dx / distance) * force;
        y += (dy / distance) * force;
      }

      const twinkle = reducedMotion ? 1 : 0.78 + Math.sin(time * 0.0012 * star.twinkle + star.angle * 8) * 0.22;
      context.beginPath();
      context.fillStyle = `hsla(${star.hue}, 88%, 78%, ${star.alpha * twinkle})`;
      context.arc(x, y, star.size, 0, Math.PI * 2);
      context.fill();
    });

    context.globalCompositeOperation = "source-over";
  }

  function animateGalaxy(time) {
    if (reducedMotion) {
      galaxyAnimationFrame = 0;
      return;
    }

    galaxyAnimationFrame = window.requestAnimationFrame(animateGalaxy);
    if (document.visibilityState !== "visible") return;
    if (time - lastFrame < 1000 / targetFps) return;

    lastFrame = time;
    drawGalaxy(time);
  }

  function handleGalaxyPointerMove(event) {
    pointerX = event.clientX / Math.max(1, width);
    pointerY = event.clientY / Math.max(1, height);
    pointerActive = 1;
    window.clearTimeout(galaxyIdleTimer);
    galaxyIdleTimer = window.setTimeout(() => {
      pointerActive = 0;
    }, 900);
  }

  resizeGalaxy();
  window.addEventListener("resize", resizeGalaxy);
  window.addEventListener("pointermove", handleGalaxyPointerMove, { passive: true });
  window.addEventListener("motionPreferenceChange", (event) => {
    reducedMotion = event.detail.reduced;
    pointerActive = 0;
    smoothPointerActive = 0;
    if (reducedMotion) {
      window.cancelAnimationFrame(galaxyAnimationFrame);
      galaxyAnimationFrame = 0;
      drawGalaxy(performance.now());
    } else if (!galaxyAnimationFrame) {
      galaxyAnimationFrame = window.requestAnimationFrame(animateGalaxy);
    }
  });

  if (!reducedMotion) {
    galaxyAnimationFrame = window.requestAnimationFrame(animateGalaxy);
  }
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
    initBorderGlow();
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
  initBorderGlow();
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
    if (event.target instanceof Element && event.target.closest("a")) {
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
initMotionControls();
initGalaxy();
initDockNav();
initPageTransitions();
initScrollReveal();
initSpaceDrift();
initBorderGlow();
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
