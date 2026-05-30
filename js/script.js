async function loadData() {
  const url = "https://api.parkendd.de/Zuerich";

  try {
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error(error);
    return false;
  }
}

async function loadMap() {
  const mapArea = document.getElementById("mapArea");

  if (!mapArea) {
    console.error("mapArea wurde nicht gefunden");
    return;
  }

  try {
    const response = await fetch("assets/map.svg");
    const svg = await response.text();

    mapArea.innerHTML = svg;
    initMapHover();

    console.log("SVG geladen");
  } catch (error) {
    console.error("SVG konnte nicht geladen werden:", error);
  }
}

function initMapHover() {
  const svg = document.querySelector("#mapArea svg");
  const districtItems = document.querySelectorAll(".district-list li");
  const districtPaths = document.querySelectorAll("#districts > path[id^='kreis']");
  const pinGroups = document.querySelectorAll("#pins > g");

  function resetMap() {
    districtPaths.forEach(path => {
      path.classList.remove("active");
      path.style.fill = "";
    });

    pinGroups.forEach(pinGroup => {
      pinGroup.classList.remove("active");
    });

    districtItems.forEach(item => {
      item.classList.remove("active");
    });
  }

  function activateDistrict(districtId) {
    resetMap();

    const activeDistrict = document.getElementById(districtId);
    const activePins = document.getElementById(`${districtId}_2`);
    const activeItem = document.querySelector(`.district-list li[data-district="${districtId}"]`);

    if (activeDistrict) {
      activeDistrict.classList.add("active");
      activeDistrict.style.fill = "#07DCC0";
    }

    if (activePins) {
      activePins.classList.add("active");
    }

    if (activeItem) {
      activeItem.classList.add("active");
    }
  }

  districtItems.forEach(item => {
    item.addEventListener("mouseenter", () => {
      activateDistrict(item.dataset.district);
    });

    item.addEventListener("mouseleave", event => {
      if (!event.relatedTarget || !event.relatedTarget.closest(".district-list")) {
        resetMap();
      }
    });
  });

  districtPaths.forEach(path => {
    path.style.cursor = "pointer";

    path.addEventListener("mouseenter", () => {
      activateDistrict(path.id);
    });
  });

  pinGroups.forEach(pinGroup => {
    pinGroup.style.cursor = "pointer";

    pinGroup.querySelectorAll("path").forEach(path => {
      path.setAttribute("pointer-events", "stroke");
    });

    pinGroup.addEventListener("mouseenter", () => {
      const districtGroup = pinGroup.parentElement;
      const districtId = districtGroup.id.replace("_2", "");

      activateDistrict(districtId);
    });

    pinGroup.addEventListener("click", () => {
      const parkingId = pinGroup.id;
      window.location.href = `parkhaus.html?id=${parkingId}`;
    });
  });

  svg.addEventListener("mouseleave", resetMap);
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadMap();

  const data = await loadData();
  console.log(data);
});