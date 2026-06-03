// ── Konstanten ────────────────────────────────────────────────

const API        = "https://api.parkendd.de/Zuerich";
const REFRESH_MS = 30000;

// SVG-Pin-ID → API-Lot-ID
const PIN_TO_API = {
  accu:             "zuerichparkhausaccu",
  albisriederplatz: "zuerichparkhausalbisriederplatz",
  bleicherweg:      "zuerichparkhausbleicherweg",
  centereleven:     "zuerichparkhauscentereleven",
  cityparking:      "zuerichparkhauscityparking",
  cityport:         "zuerichparkhauscityport",
  crowneplaza:      "zuerichparkhauscrowneplaza",
  dorflinde:        "zuerichparkhausdorflinde",
  feldegg:          "zuerichparkhausfeldegg",
  globus:           "zuerichparkhausglobus",
  hardau2:          "zuerichparkhaushardauii",
  hauptbahnhof:     "zuerichparkhaushauptbahnhof",
  helvetiaplatz:    "zuerichparkhaushelvetiaplatz",
  hohepromenade:    "zuerichparkhaushohepromenade",
  jelmoli:          "zuerichparkhausjelmoli",
  jungholz:         "zuerichparkhausjungholz",
  maxbillplatz:     "zuerichparkhausmaxbillplatz",
  messezuerichag:   "zuerichparkhausmessezuerichag",
  nordhaus:         "zuerichparkhausnordhaus",
  octavo:           "zuerichparkhausoctavo",
  opera:            "zuerichparkhausopéra",
  parkside:         "zuerichparkhausparkside",
  parkhyatt:        "zuerichparkhausparkhyatt",
  puls5parkgarage:  "zuerichpuls5parkgarage",
  pwest:            "zuerichparkhauspwest",
  theater11:        "zuerichparkplatztheater11",
  uniirchel:        "zuerichparkhausuniirchel",
  urania:           "zuerichparkhausurania",
  utoquai:          "zuerichparkhausutoquai",
  zueri11shopping:  "zuerichparkhauszueri11shopping",
  zuerichhorn:      "zuerichparkhauszuerichhorn",
};

// API-Lot-ID → Kreis (für Mini-Karte)
const API_TO_KREIS = {
  zuerichparkhausdorflinde:        "kreis12",
  zuerichparkhausaccu:             "kreis11",
  zuerichparkhauscentereleven:     "kreis11",
  zuerichparkhauscityport:         "kreis11",
  zuerichparkhausjungholz:         "kreis11",
  zuerichparkhausmaxbillplatz:     "kreis11",
  zuerichparkhausmessezuerichag:   "kreis11",
  zuerichparkhausnordhaus:         "kreis11",
  zuerichparkhausoctavo:           "kreis11",
  zuerichparkhausparkside:         "kreis11",
  zuerichparkhauszueri11shopping:  "kreis11",
  zuerichparkplatztheater11:       "kreis11",
  zuerichparkhausfeldegg:          "kreis7",
  zuerichparkhausutoquai:          "kreis7",
  zuerichparkhauszuerichhorn:      "kreis7",
  zuerichparkhausuniirchel:        "kreis6",
  zuerichparkhauspwest:            "kreis5",
  zuerichpuls5parkgarage:          "kreis5",
  zuerichparkhaushardauii:         "kreis4",
  zuerichparkhaushelvetiaplatz:    "kreis4",
  zuerichparkhauscrowneplaza:      "kreis4",
  zuerichparkhausalbisriederplatz: "kreis3",
  zuerichparkhausparkhyatt:        "kreis2",
  zuerichparkhausbleicherweg:      "kreis1",
  zuerichparkhauscityparking:      "kreis1",
  zuerichparkhausglobus:           "kreis1",
  zuerichparkhaushauptbahnhof:     "kreis1",
  zuerichparkhaushohepromenade:    "kreis1",
  zuerichparkhausjelmoli:          "kreis1",
  "zuerichparkhausopéra":          "kreis1",
  zuerichparkhausurania:           "kreis1",
};

// ── Zustand ───────────────────────────────────────────────────

let currentLotId    = null;
let lastFree        = null;
let animating       = false;
let refreshInterval = null;

// Referenzen auf SVG-Elemente (werden in initMapHover gesetzt)
let mapDistrictPaths = [];
let mapPinGroups     = [];
let mapDistrictItems = [];

// ── Karte laden ───────────────────────────────────────────────

async function loadMap() {
  const mapArea = document.getElementById("mapArea");
  if (!mapArea) return;

  try {
    const response = await fetch("assets/map.svg");
    const svg      = await response.text();
    mapArea.innerHTML = svg;
    initMapHover();
  } catch (error) {
    console.error("SVG konnte nicht geladen werden:", error);
  }
}

// ── Karten-Interaktion ────────────────────────────────────────

function resetMap() {
  mapDistrictPaths.forEach(path => {
    path.classList.remove("active");
    path.style.fill = "";
  });
  mapPinGroups.forEach(g => g.classList.remove("active"));
  mapDistrictItems.forEach(li => li.classList.remove("active"));
}

function activateDistrict(districtId) {
  resetMap();

  const path  = document.getElementById(districtId);
  const pins  = document.getElementById(districtId + "_2");
  const item  = document.querySelector(`.district-list li[data-district="${districtId}"]`);

  if (path) { path.classList.add("active"); path.style.fill = "#07DCC0"; }
  if (pins)   pins.classList.add("active");
  if (item)   item.classList.add("active");
}

function initMapHover() {
  const svg = document.querySelector("#mapArea svg");
  if (!svg) return;

  mapDistrictItems = Array.from(document.querySelectorAll(".district-list li"));
  mapDistrictPaths = Array.from(document.querySelectorAll("#districts > path[id^='kreis']"));
  mapPinGroups     = Array.from(document.querySelectorAll("#pins > g > g"));

  // Kreis-Liste
  mapDistrictItems.forEach(item => {
    item.addEventListener("mouseenter", () => activateDistrict(item.dataset.district));
    item.addEventListener("mouseleave", e => {
      if (!e.relatedTarget || !e.relatedTarget.closest(".district-list")) resetMap();
    });
  });

  // Karte: Kreis-Flächen
  mapDistrictPaths.forEach(path => {
    path.style.cursor = "pointer";
    path.addEventListener("mouseenter", () => activateDistrict(path.id));
  });

  // Karte: Pin-Symbole
  mapPinGroups.forEach(pinGroup => {
    pinGroup.style.cursor = "pointer";
    pinGroup.querySelectorAll("path").forEach(p => p.setAttribute("pointer-events", "stroke"));

    pinGroup.addEventListener("mouseenter", () => {
      const kreisId = pinGroup.parentElement.id.replace("_2", "");
      activateDistrict(kreisId);
    });

    pinGroup.addEventListener("click", () => {
      const apiId = PIN_TO_API[pinGroup.id] || pinGroup.id;
      showDetail(apiId);
    });
  });

  svg.addEventListener("mouseleave", resetMap);
}

// ── Hilfsfunktionen ───────────────────────────────────────────

function availClass(free, total) {
  if (total === 0 || free == null) return "muted";
  const p = free / total;
  if (p > 0.3) return "green";
  if (p > 0.1) return "orange";
  return "red";
}

function pinToKreis(apiId) {
  return API_TO_KREIS[apiId] || null;
}

// ── Auto-Animation ────────────────────────────────────────────

function animateCar(direction) {
  if (animating) return;
  animating = true;
  const car = document.getElementById("animCar");
  car.classList.remove("hidden", "entering", "exiting");
  car.style.transform = direction === "in" ? "scaleX(1)" : "scaleX(-1)";
  car.classList.add(direction === "in" ? "entering" : "exiting");
  car.addEventListener("animationend", () => {
    car.classList.add("hidden");
    car.classList.remove("entering", "exiting");
    animating = false;
  }, { once: true });
}

// ── Digitale Anzeige ──────────────────────────────────────────

function updateNumber(newVal) {
  const el   = document.getElementById("digitalNumber");
  const prev = lastFree;

  el.classList.remove("flash-up", "flash-down");
  void el.offsetWidth;
  el.textContent = newVal != null ? newVal : "–";

  if (prev !== null && newVal !== null) {
    if (newVal > prev) { el.classList.add("flash-up");   animateCar("out"); }
    else if (newVal < prev) { el.classList.add("flash-down"); animateCar("in");  }
  }
  lastFree = newVal;
}

// ── Belegungsbalken ───────────────────────────────────────────

function updateBar(free, total) {
  const bar = document.getElementById("occBar");
  const pct = total > 0 ? Math.round(((total - free) / total) * 100) : 0;
  bar.className = "occ-bar-fill" + (pct > 85 ? " full" : pct > 60 ? " busy" : "");
  bar.style.width = pct + "%";
}

// ── Mini-Karte ────────────────────────────────────────────────

function buildMiniMap(activeKreis) {
  const districts = [
    { id: "kreis1",  x: 62, y: 52, w: 12, h: 10 },
    { id: "kreis2",  x: 58, y: 62, w: 14, h: 14 },
    { id: "kreis3",  x: 44, y: 56, w: 16, h: 18 },
    { id: "kreis4",  x: 44, y: 42, w: 16, h: 14 },
    { id: "kreis5",  x: 36, y: 34, w: 14, h: 18 },
    { id: "kreis6",  x: 58, y: 34, w: 18, h: 18 },
    { id: "kreis7",  x: 72, y: 32, w: 22, h: 28 },
    { id: "kreis8",  x: 72, y: 60, w: 16, h: 16 },
    { id: "kreis9",  x: 14, y: 38, w: 22, h: 26 },
    { id: "kreis10", x: 32, y: 20, w: 24, h: 18 },
    { id: "kreis11", x: 48, y:  6, w: 30, h: 18 },
    { id: "kreis12", x: 78, y:  8, w: 18, h: 22 },
  ];

  const rects = districts.map(d => {
    const active = d.id === activeKreis;
    const fill   = active ? "#b2f0ea" : "#c8cdd4";
    const stroke = active ? "#07DCC0" : "#a0a8b4";
    const sw     = active ? 1.5 : 0.5;
    return `<rect x="${d.x}" y="${d.y}" width="${d.w}" height="${d.h}"
      rx="2" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
  }).join("");

  const river = `<path d="M68 76 Q65 64 66 52 Q67 38 64 24"
    stroke="#1565C0" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;

  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" fill="#d4d8de"/>
    ${rects}
    ${river}
  </svg>`;
}

// ── Detail-Panel ──────────────────────────────────────────────

function renderDetail(lot) {
  const free  = lot.free_lots  ?? null;
  const total = lot.total_lots ?? 0;

  document.getElementById("cardName").textContent    = lot.name || lot.id;
  document.getElementById("cardAddress").textContent = lot.address || "Adresse nicht verfügbar";

  const statusEl = document.getElementById("cardStatus");
  const s        = lot.state || "unknown";
  statusEl.textContent = s === "open" ? "Geöffnet" : s === "closed" ? "Geschlossen" : "—";
  statusEl.className   = "card-status " + (s === "open" ? "open" : s === "closed" ? "closed" : "unknown");

  updateBar(free ?? 0, total);
  updateNumber(free);
}

async function fetchAndRender() {
  let data;
  try {
    const res = await fetch(API);
    data = await res.json();
  } catch (e) {
    console.error("API Fehler:", e);
    return;
  }
  if (!data || !data.lots) return;

  const lot = data.lots.find(l => l.id === currentLotId);
  if (!lot) return;

  renderDetail(lot);

  const kreisId = pinToKreis(lot.id);
  document.getElementById("mapThumb").innerHTML = buildMiniMap(kreisId);
}

async function showDetail(lotId) {
  currentLotId = lotId;
  lastFree     = null;
  animating    = false;

  document.getElementById("home-view").style.display    = "none";
  document.getElementById("detail-panel").style.display = "block";

  await fetchAndRender();

  if (refreshInterval) clearInterval(refreshInterval);
  refreshInterval = setInterval(fetchAndRender, REFRESH_MS);
}

function hideDetail() {
  if (refreshInterval) clearInterval(refreshInterval);
  refreshInterval = null;
  currentLotId    = null;
  lastFree        = null;
  animating       = false;

  document.getElementById("detail-panel").style.display = "none";
  document.getElementById("home-view").style.display    = "block";

  resetMap();
}

// ── Start ─────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", async () => {
  await loadMap();
  document.getElementById("back-btn").addEventListener("click", hideDetail);
});
