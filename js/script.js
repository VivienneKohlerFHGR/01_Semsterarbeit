const API = "https://api.parkendd.de/Zuerich";
const REFRESH_MS = 5000;
const CACHE_KEY = "zuerich_parking_cache";
const CACHE_TIME = 15000;

const PIN_TO_API = {
  accu: "zuerichparkhausaccu",
  albisriederplatz: "zuerichparkhausalbisriederplatz",
  bleicherweg: "zuerichparkhausbleicherweg",
  centereleven: "zuerichparkhauscentereleven",
  cityparking: "zuerichparkhauscityparking",
  cityport: "zuerichparkhauscityport",
  crowneplaza: "zuerichparkhauscrowneplaza",
  dorflinde: "zuerichparkhausdorflinde",
  feldegg: "zuerichparkhausfeldegg",
  globus: "zuerichparkhausglobus",
  hardau2: "zuerichparkhaushardauii",
  hauptbahnhof: "zuerichparkhaushauptbahnhof",
  helvetiaplatz: "zuerichparkhaushelvetiaplatz",
  hohepromenade: "zuerichparkhaushohepromenade",
  jelmoli: "zuerichparkhausjelmoli",
  jungholz: "zuerichparkhausjungholz",
  maxbillplatz: "zuerichparkhausmaxbillplatz",
  messezuerichag: "zuerichparkhausmessezuerichag",
  nordhaus: "zuerichparkhausnordhaus",
  octavo: "zuerichparkhausoctavo",
  opera: "zuerichparkhausopéra",
  parkside: "zuerichparkhausparkside",
  parkhyatt: "zuerichparkhausparkhyatt",
  puls5parkgarage: "zuerichpuls5parkgarage",
  pfingstweid: "zuerichparkhauspfingstweid",
  pwest: "zuerichparkhauspwest",
  uniirchel: "zuerichparkhausuniirchel",
  usznord: "zuerichparkhaususznord",
  uszsüd: "zuerichparkplatzuszsued",
  uszsued: "zuerichparkplatzuszsued",
  stampfenbach: "zuerichparkhausstampfenbach",
  talgarten: "zuerichparkhaustalgarten",
  theater11: "zuerichparkplatztheater11",
  urania: "zuerichparkhausurania",
  utoquai: "zuerichparkhausutoquai",
  zueri11shopping: "zuerichparkhauszueri11shopping",
  zuerichhorn: "zuerichparkhauszuerichhorn"
};

const PIN_NAMES = {
  accu: "Accu",
  albisriederplatz: "Albisriederplatz",
  bleicherweg: "Bleicherweg",
  centereleven: "Center Eleven",
  cityparking: "City Parking",
  cityport: "Cityport",
  crowneplaza: "Crowne Plaza",
  dorflinde: "Dorflinde",
  feldegg: "Feldegg",
  globus: "Globus",
  hardau2: "Hardau II",
  hauptbahnhof: "Hauptbahnhof",
  helvetiaplatz: "Helvetiaplatz",
  hohepromenade: "Hohe Promenade",
  jelmoli: "Jelmoli",
  jungholz: "Jungholz",
  maxbillplatz: "Max-Bill-Platz",
  messezuerichag: "Messe Zürich AG",
  nordhaus: "Nordhaus",
  octavo: "Octavo",
  opera: "Opéra",
  parkside: "Parkside",
  parkhyatt: "Park Hyatt",
  puls5parkgarage: "Puls 5 Parkgarage",
  pfingstweid: "Pfingstweid",
  pwest: "P West",
  uniirchel: "Uni Irchel",
  usznord: "USZ Nord",
  uszsüd: "USZ Süd",
  uszsued: "USZ Süd",
  stampfenbach: "Stampfenbach",
  talgarten: "Talgarten",
  theater11: "Theater 11",
  urania: "Urania",
  utoquai: "Utoquai",
  zueri11shopping: "Züri 11 Shopping",
  zuerichhorn: "Zürichhorn"
};

const API_TO_KREIS = {
  zuerichparkhausdorflinde: "kreis12",
  zuerichparkhausaccu: "kreis11",
  zuerichparkhauscentereleven: "kreis11",
  zuerichparkhauscityport: "kreis11",
  zuerichparkhausjungholz: "kreis11",
  zuerichparkhausmaxbillplatz: "kreis11",
  zuerichparkhausmessezuerichag: "kreis11",
  zuerichparkhausnordhaus: "kreis11",
  zuerichparkhausoctavo: "kreis11",
  zuerichparkhausparkside: "kreis11",
  zuerichparkhauszueri11shopping: "kreis11",
  zuerichparkplatztheater11: "kreis11",
  zuerichparkhausfeldegg: "kreis7",
  zuerichparkhausutoquai: "kreis7",
  zuerichparkhauszuerichhorn: "kreis7",
  zuerichparkhaususznord: "kreis6",
  zuerichparkplatzuszsued: "kreis6",
  zuerichparkhausuniirchel: "kreis6",
  zuerichparkhausstampfenbach: "kreis6",
  zuerichparkhauspwest: "kreis5",
  zuerichpuls5parkgarage: "kreis5",
  zuerichparkhauspfingstweid: "kreis5",
  zuerichparkhaushardauii: "kreis4",
  zuerichparkhaushelvetiaplatz: "kreis4",
  zuerichparkhauscrowneplaza: "kreis4",
  zuerichparkhausalbisriederplatz: "kreis3",
  zuerichparkhausparkhyatt: "kreis2",
  zuerichparkhausbleicherweg: "kreis1",
  zuerichparkhauscityparking: "kreis1",
  zuerichparkhausglobus: "kreis1",
  zuerichparkhaushauptbahnhof: "kreis1",
  zuerichparkhaushohepromenade: "kreis1",
  zuerichparkhausjelmoli: "kreis1",
  zuerichparkhausopéra: "kreis1",
  zuerichparkhausurania: "kreis1",
  zuerichparkhaustalgarten: "kreis1"
};

let mapDistrictPaths = [];
let mapDistrictItems = [];
let clickablePins = [];
let refreshTimer = null;
let lastFreeLots  = null;
let carAnimating  = false;

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("mapArea")) initHomePage();
  if (document.querySelector(".detail-page")) initDetailPage();
});

async function initHomePage() {
  await loadMap();
}

async function loadMap() {
  const mapArea = document.getElementById("mapArea");
  if (!mapArea) return;

  try {
    const response = await fetch("assets/map.svg", { cache: "force-cache" });
    const svg = await response.text();

    mapArea.innerHTML = svg;

    initMapHover();
    makeAllMappedPinsClickable();
  } catch (error) {
    console.error("SVG konnte nicht geladen werden:", error);
    mapArea.innerHTML = `<p class="loading-text">Karte konnte nicht geladen werden.</p>`;
  }
}

function normalizeId(id) {
  return String(id)
    .toLowerCase()
    .trim()
    .replaceAll("ä", "ae")
    .replaceAll("ö", "oe")
    .replaceAll("ü", "ue")
    .replaceAll("é", "e")
    .replaceAll("è", "e")
    .replaceAll("à", "a")
    .replaceAll(" ", "")
    .replaceAll("_", "")
    .replaceAll("-", "");
}

function getApiIdFromSvgId(svgId) {
  const cleanSvgId = normalizeId(svgId);

  for (const key in PIN_TO_API) {
    if (normalizeId(key) === cleanSvgId) {
      return PIN_TO_API[key];
    }
  }

  return null;
}

function getApiIdFromElement(element) {
  if (!element) return null;

  let current = element;

  while (current && current !== document) {
    if (current.id) {
      const apiId = getApiIdFromSvgId(current.id);
      if (apiId) return apiId;
    }

    current = current.parentElement;
  }

  return null;
}

function findClickablePinElement(target) {
  let current = target;

  while (current && current !== document) {
    if (current.classList && current.classList.contains("clickable-pin")) {
      return current;
    }

    current = current.parentElement;
  }

  return null;
}

function initMapHover() {
  mapDistrictItems = Array.from(document.querySelectorAll(".district-list li"));
  mapDistrictPaths = Array.from(
    document.querySelectorAll("#districts > path[id^='kreis'], #districts > g[id^='kreis']")
  );

  mapDistrictItems.forEach(item => {
    item.addEventListener("mouseenter", () => activateDistrict(item.dataset.district));
    item.addEventListener("mouseleave", resetMap);
  });

  mapDistrictPaths.forEach(path => {
    path.addEventListener("mouseenter", () => activateDistrict(path.id));
    path.addEventListener("mouseleave", resetMap);
  });
}

function resetMap() {
  mapDistrictPaths.forEach(path => {
    path.classList.remove("active");
    path.style.fill = "";
  });

  mapDistrictItems.forEach(item => {
    item.classList.remove("active");
  });
}

function activateDistrict(districtId) {
  resetMap();

  const district = document.getElementById(districtId);
  const item = document.querySelector(`.district-list li[data-district="${districtId}"]`);

  if (district) {
    district.classList.add("active");

    if (district.tagName.toLowerCase() === "path") {
      district.style.fill = "#07DCC0";
    }
  }

  if (item) item.classList.add("active");
}

function makeAllMappedPinsClickable() {
  const svg = document.querySelector("#mapArea svg");
  if (!svg) return;

  clickablePins = [];

  const elementsWithId = Array.from(svg.querySelectorAll("[id]"));

  elementsWithId.forEach(element => {
    const apiId = getApiIdFromSvgId(element.id);
    if (!apiId) return;

    element.classList.add("clickable-pin");
    element.dataset.apiId = apiId;

    element.style.cursor = "pointer";
    element.style.pointerEvents = "all";

    element.querySelectorAll("*").forEach(child => {
      child.style.cursor = "pointer";
      child.style.pointerEvents = "all";
    });

    try {
      const box = element.getBBox();
      const hitArea = document.createElementNS("http://www.w3.org/2000/svg", "rect");

      hitArea.setAttribute("x", box.x - 4);
      hitArea.setAttribute("y", box.y - 4);
      hitArea.setAttribute("width", box.width + 8);
      hitArea.setAttribute("height", box.height + 8);
      hitArea.setAttribute("fill", "transparent");
      hitArea.setAttribute("class", "pin-hit-area");
      hitArea.dataset.apiId = apiId;
      hitArea.dataset.pinId = element.id;

      hitArea.style.cursor = "pointer";
      hitArea.style.pointerEvents = "all";

      element.appendChild(hitArea);
    } catch (error) {
      console.warn("Hitbox konnte nicht erstellt werden:", element.id);
    }

    clickablePins.push(element);
  });

  svg.addEventListener("click", event => {
    const hitArea = event.target.closest(".pin-hit-area");
    const pin = findClickablePinElement(event.target);

    const lotId =
      hitArea?.dataset.apiId ||
      pin?.dataset.apiId ||
      getApiIdFromElement(event.target);

    if (!lotId) return;

    event.preventDefault();
    event.stopPropagation();

    window.location.href = `parkhaus.html?id=${encodeURIComponent(lotId)}`;
  });

  svg.addEventListener("mouseover", event => {
    const hitArea = event.target.closest(".pin-hit-area");
    const pinId = hitArea?.dataset.pinId;
    const pin = pinId ? document.getElementById(pinId) : findClickablePinElement(event.target);

    const lotId =
      hitArea?.dataset.apiId ||
      pin?.dataset.apiId ||
      getApiIdFromElement(event.target);

    if (!lotId) return;

    const kreisId = API_TO_KREIS[lotId];
    if (kreisId) activateDistrict(kreisId);

    if (pin) pin.classList.add("pin-hover");

    const label = document.getElementById("pinLabel");
    if (label && pin) {
      label.textContent = getPinName(pin.id);
      label.classList.add("visible");
    }
  });

  svg.addEventListener("mouseout", event => {
    const hitArea = event.target.closest(".pin-hit-area");
    const pinId = hitArea?.dataset.pinId;
    const pin = pinId ? document.getElementById(pinId) : findClickablePinElement(event.target);

    if (pin) {
      pin.classList.remove("pin-hover");
      resetMap();

      const label = document.getElementById("pinLabel");
      if (label) label.classList.remove("visible");
    }
  });
}

function getPinName(svgId) {
  const cleanSvgId = normalizeId(svgId);

  for (const key in PIN_NAMES) {
    if (normalizeId(key) === cleanSvgId) {
      return PIN_NAMES[key];
    }
  }

  return "Parkhaus";
}

/* Auto-Animation */

function playCarAnimation(type) {
  if (carAnimating) return;
  const car = document.getElementById("animCar");
  if (!car) return;

  carAnimating = true;
  car.src = type === "enter"
    ? "assets/einfahrendes_auto.svg"
    : "assets/ausfahrendes_auto.svg";

  car.classList.remove("car-enter", "car-exit");
  void car.offsetWidth; // reflow erzwingen
  car.classList.add(type === "enter" ? "car-enter" : "car-exit");

  car.addEventListener("animationend", () => {
    car.classList.remove("car-enter", "car-exit");
    carAnimating = false;
  }, { once: true });
}

/* Detailseite */

function initDetailPage() {
  lastFreeLots = null;
  const params = new URLSearchParams(window.location.search);
  const lotId = params.get("id");

  if (!lotId) {
    showDetailError("Kein Parkhaus ausgewählt.");
    return;
  }

  const cached = getCachedApiData();

  if (cached) {
    const lot = cached.lots?.find(item => item.id === lotId);
    if (lot) renderDetail(lot);
  }

  loadDetail(lotId);

  if (refreshTimer) clearInterval(refreshTimer);
  refreshTimer = setInterval(() => loadDetail(lotId), REFRESH_MS);
}

async function fetchParkingData() {
  const cached = getCachedApiData();

  if (cached) {
    return cached;
  }

  const response = await fetch(API, { cache: "no-store" });
  const data = await response.json();

  localStorage.setItem(CACHE_KEY, JSON.stringify({
    time: Date.now(),
    data
  }));

  return data;
}

function getCachedApiData() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const cached = JSON.parse(raw);
    const isFresh = Date.now() - cached.time < CACHE_TIME;

    return isFresh ? cached.data : null;
  } catch {
    return null;
  }
}

async function loadDetail(lotId) {
  try {
    const data = await fetchParkingData();

    if (!data || !data.lots) {
      showDetailError("API-Daten konnten nicht gelesen werden.");
      return;
    }

    const lot = data.lots.find(item => item.id === lotId);

    if (!lot) {
      showDetailError("Parkhaus nicht gefunden.");
      console.warn("Gesuchte ID:", lotId);
      console.log("Verfügbare Lots:", data.lots);
      return;
    }

    renderDetail(lot);
  } catch (error) {
    console.error("API Fehler:", error);
    showDetailError("API konnte nicht geladen werden.");
  }
}

function renderDetail(lot) {
  const name = lot.name || lot.id || "Parkhaus";
  const address = lot.address || "Adresse nicht verfügbar";
  const free = getNumber(lot.free, lot.free_lots, lot.Free);
  const total = getNumber(lot.total, lot.total_lots, lot.Total);
  const state = lot.state || lot.status || "unknown";

  document.getElementById("detailName").textContent = name;
  document.getElementById("detailAddress").textContent = address;
  document.getElementById("detailFree").textContent = free !== null ? free : "–";
  document.getElementById("detailStatus").textContent = getStatusText(state);

  if (lastFreeLots !== null && free !== null) {
    if (free < lastFreeLots) playCarAnimation("exit");
    else if (free > lastFreeLots) playCarAnimation("enter");
  }
  lastFreeLots = free;

  updateAvailabilityBar(free, total);
  updateMiniMap(API_TO_KREIS[lot.id]);
}

function getNumber(...values) {
  for (const value of values) {
    if (typeof value === "number") return value;

    if (typeof value === "string" && value.trim() !== "" && !isNaN(value)) {
      return Number(value);
    }
  }

  return null;
}

function getStatusText(state) {
  if (state === "open") return "Geöffnet";
  if (state === "closed") return "Geschlossen";
  return "Status unbekannt";
}

function updateAvailabilityBar(free, total) {
  const fill = document.getElementById("availabilityFill");
  if (!fill) return;

  if (free === null || total === null || total <= 0) {
    fill.style.width = "0%";
    fill.style.background = "#cccccc";
    return;
  }

  const occupied = total - free;
  const percent = Math.max(0, Math.min(100, Math.round((occupied / total) * 100)));

  fill.style.width = percent + "%";

  if (percent >= 90) {
    fill.style.background = "#FF3131";
  } else if (percent >= 70) {
    fill.style.background = "#ff9aa2";
  } else {
    fill.style.background = "#07DCC0";
  }
}

async function updateMiniMap(activeKreis) {
  const miniMap = document.getElementById("miniMap");
  if (!miniMap) return;

  try {
    const response = await fetch("assets/map.svg", { cache: "force-cache" });
    const svgText = await response.text();

    miniMap.innerHTML = svgText;

    const svg = miniMap.querySelector("svg");
    if (!svg) return;

    svg.classList.add("mini-original-map");

    const pins = svg.querySelector("#pins");
    if (pins) pins.remove();

    svg.querySelectorAll("[id^='kreis']").forEach(kreis => {
      kreis.classList.remove("active");
      kreis.style.fill = "#d7d7d7";
    });

    const active = svg.querySelector(`#${activeKreis}`);
    if (active) {
      active.style.fill = "#07DCC0";
    }

    svg.querySelectorAll("path, polygon, circle, rect").forEach(el => {
      el.style.pointerEvents = "none";
    });

  } catch (error) {
    console.error("Mini-Karte konnte nicht geladen werden:", error);
  }
}

function showDetailError(message) {
  const name = document.getElementById("detailName");
  const address = document.getElementById("detailAddress");
  const status = document.getElementById("detailStatus");
  const free = document.getElementById("detailFree");

  if (name) name.textContent = "Fehler";
  if (address) address.textContent = message;
  if (status) status.textContent = "";
  if (free) free.textContent = "–";
}