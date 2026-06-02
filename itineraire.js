let routeLine = null;
let routeMarkers = [];
let lastCalculatedRoute = null;

const PARIS_VIEWBOX = "2.2241,48.9022,2.4699,48.8156";
const PARIS_CENTER = { lat: 48.8566, lon: 2.3522 };

function normalizeAddress(value) {
  let address = value.trim().replace(/\s+/g, " ");

  if (address === "") {
    return "";
  }

  const lower = address.toLowerCase();
  const alreadyHasPlace =
    lower.includes("paris") ||
    lower.includes("france") ||
    lower.includes("saint-denis") ||
    lower.includes("aubervilliers") ||
    lower.includes("montreuil") ||
    lower.includes("les lilas") ||
    lower.includes("bagnolet") ||
    lower.includes("bobigny") ||
    lower.includes("pantin") ||
    lower.includes("ivry") ||
    lower.includes("villejuif") ||
    lower.includes("clichy") ||
    lower.includes("levallois") ||
    lower.includes("boulogne") ||
    lower.includes("vincennes");

  if (!alreadyHasPlace) {
    address += ", Paris";
  }

  if (!address.toLowerCase().includes("france")) {
    address += ", France";
  }

  return address;
}

async function fetchJson(url, customErrorMessage) {
  const controller = new AbortController();
  const timeoutId = setTimeout(function() {
    controller.abort();
  }, 9000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "Accept": "application/json" }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(customErrorMessage || "Erreur réseau.");
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

async function fetchJsonWithProxyFallback(url, customErrorMessage) {
  try {
    return await fetchJson(url, customErrorMessage);
  } catch (firstError) {
    const proxyUrl = "https://api.allorigins.win/raw?url=" + encodeURIComponent(url);

    try {
      return await fetchJson(proxyUrl, customErrorMessage);
    } catch (secondError) {
      throw new Error(customErrorMessage || firstError.message || "Impossible de contacter le service externe.");
    }
  }
}

function scoreNominatimResult(item) {
  let score = 0;
  const display = (item.display_name || "").toLowerCase();
  const type = (item.type || "").toLowerCase();
  const category = (item.category || item.class || "").toLowerCase();

  if (display.includes("paris")) score += 8;
  if (display.includes("île-de-france") || display.includes("ile-de-france")) score += 5;
  if (category === "place") score += 2;
  if (category === "highway") score += 5;
  if (type === "house" || type === "residential" || type === "tertiary" || type === "secondary") score += 5;
  if (item.importance) score += Number(item.importance);

  const lat = parseFloat(item.lat);
  const lon = parseFloat(item.lon);
  const distanceToParis = calculateDistanceMeters(lat, lon, PARIS_CENTER.lat, PARIS_CENTER.lon);

  if (distanceToParis < 35000) score += 6;
  if (distanceToParis > 80000) score -= 10;

  return score;
}

async function geocodeWithNominatim(address) {
  const normalizedAddress = normalizeAddress(address);
  const params = new URLSearchParams({
    format: "jsonv2",
    q: normalizedAddress,
    limit: "8",
    addressdetails: "1",
    countrycodes: "fr",
    viewbox: PARIS_VIEWBOX,
    bounded: "0"
  });

  const url = "https://nominatim.openstreetmap.org/search?" + params.toString();
  const data = await fetchJsonWithProxyFallback(url, "Le service d’adresse ne répond pas pour le moment.");

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("Adresse introuvable : " + address);
  }

  data.sort(function(a, b) {
    return scoreNominatimResult(b) - scoreNominatimResult(a);
  });

  return {
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon),
    displayName: data[0].display_name
  };
}

async function geocodeWithPhoton(address) {
  const normalizedAddress = normalizeAddress(address);
  const params = new URLSearchParams({
    q: normalizedAddress,
    lang: "fr",
    limit: "5",
    lat: String(PARIS_CENTER.lat),
    lon: String(PARIS_CENTER.lon)
  });

  const url = "https://photon.komoot.io/api/?" + params.toString();
  const data = await fetchJsonWithProxyFallback(url, "Le service d’adresse ne répond pas pour le moment.");

  if (!data.features || data.features.length === 0) {
    throw new Error("Adresse introuvable : " + address);
  }

  const feature = data.features[0];
  const properties = feature.properties || {};
  const coords = feature.geometry.coordinates;

  return {
    lat: coords[1],
    lon: coords[0],
    displayName: [properties.name, properties.street, properties.city, properties.country].filter(Boolean).join(", ")
  };
}

async function geocodeAddress(address) {
  try {
    return await geocodeWithNominatim(address);
  } catch (nominatimError) {
    try {
      return await geocodeWithPhoton(address);
    } catch (photonError) {
      throw new Error("Adresse introuvable : " + address + ". Essayez avec un numéro, une rue et la ville, par exemple : 20 rue de Rivoli, Paris.");
    }
  }
}

function getRouteProfile(travelMode) {
  if (travelMode === "walk") {
    return "foot";
  }

  if (travelMode === "bike") {
    return "bike";
  }

  return "driving";
}

async function getRoute(points, travelMode) {
  const coordinates = points.map(function(point) {
    return point.lon + "," + point.lat;
  }).join(";");

  const params = "overview=full&geometries=geojson&steps=true&alternatives=false";
  const profile = getRouteProfile(travelMode);
  const url = "https://router.project-osrm.org/route/v1/" + profile + "/" + coordinates + "?" + params;

  try {
    const data = await fetchJsonWithProxyFallback(url, "Impossible de calculer cet itinéraire. Vérifiez votre connexion ou réessayez plus tard.");

    if (!data.routes || data.routes.length === 0) {
      throw new Error("Impossible de calculer cet itinéraire.");
    }

    return data.routes[0];
  } catch (error) {
    if (profile === "driving") {
      throw error;
    }

    const fallbackUrl = "https://router.project-osrm.org/route/v1/driving/" + coordinates + "?" + params;
    const fallbackData = await fetchJsonWithProxyFallback(fallbackUrl, "Impossible de calculer cet itinéraire. Vérifiez votre connexion ou réessayez plus tard.");

    if (!fallbackData.routes || fallbackData.routes.length === 0) {
      throw new Error("Impossible de calculer cet itinéraire.");
    }

    fallbackData.routes[0].usedFallbackProfile = true;
    return fallbackData.routes[0];
  }
}

function getDisplayedDuration(route, travelMode) {
  if (travelMode === "walk") {
    return route.usedFallbackProfile ? route.distance / 1.35 : route.duration || route.distance / 1.35;
  }

  if (travelMode === "bike") {
    return route.usedFallbackProfile ? route.distance / 4.2 : route.duration || route.distance / 4.2;
  }

  return Math.max(route.duration * 1.55, route.distance / 7.5 + 420);
}

function getModeText(travelMode) {
  if (travelMode === "bike") {
    return "à vélo";
  }

  if (travelMode === "public") {
    return "en transport";
  }

  return "à pied";
}

function createRouteMarker(point, label) {
  const marker = L.marker([point.lat, point.lon]).addTo(map);
  marker.bindPopup("<strong>" + label + "</strong><br>" + escapeHtml(point.displayName || "Adresse sélectionnée"));
  routeMarkers.push(marker);
  return marker;
}

function drawRoute(route, startPoint, endPoint, isSafeRoute) {
  clearRoute();

  const latLngs = route.geometry.coordinates.map(function(coord) {
    return [coord[1], coord[0]];
  });

  routeLine = L.polyline(latLngs, {
    color: isSafeRoute ? "#7b61c9" : "#bd5c93",
    weight: 7,
    opacity: 0.9,
    lineCap: "round",
    lineJoin: "round"
  }).addTo(map);

  createRouteMarker(startPoint, "Départ");
  createRouteMarker(endPoint, "Destination");

  map.fitBounds(routeLine.getBounds(), { padding: [60, 60] });
}

function clearRoute() {
  if (routeLine !== null) {
    map.removeLayer(routeLine);
    routeLine = null;
  }

  routeMarkers.forEach(function(marker) {
    map.removeLayer(marker);
  });

  routeMarkers = [];
  lastCalculatedRoute = null;
}

function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  const earthRadius = 6371000;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c;
}

function toRadians(value) {
  return value * Math.PI / 180;
}

function pointToSegmentDistanceMeters(point, segmentStart, segmentEnd) {
  const lat = point[1];
  const lon = point[0];
  const lat1 = segmentStart[0];
  const lon1 = segmentStart[1];
  const lat2 = segmentEnd[0];
  const lon2 = segmentEnd[1];

  const metersPerDegreeLat = 111320;
  const metersPerDegreeLon = 111320 * Math.cos(toRadians(lat));

  const x = lon * metersPerDegreeLon;
  const y = lat * metersPerDegreeLat;
  const x1 = lon1 * metersPerDegreeLon;
  const y1 = lat1 * metersPerDegreeLat;
  const x2 = lon2 * metersPerDegreeLon;
  const y2 = lat2 * metersPerDegreeLat;

  const dx = x2 - x1;
  const dy = y2 - y1;

  if (dx === 0 && dy === 0) {
    return Math.sqrt((x - x1) * (x - x1) + (y - y1) * (y - y1));
  }

  let t = ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy);
  t = Math.max(0, Math.min(1, t));

  const projectedX = x1 + t * dx;
  const projectedY = y1 + t * dy;

  return Math.sqrt((x - projectedX) * (x - projectedX) + (y - projectedY) * (y - projectedY));
}

function getStreetGeometryMap() {
  const streetGeometryById = new Map();

  if (typeof streetGeometries === "undefined") {
    return streetGeometryById;
  }

  streetGeometries.forEach(function(item) {
    streetGeometryById.set(item.id, item.geometry);
  });

  return streetGeometryById;
}

function findDangerousAlertsOnRoute(route) {
  const touchedAlerts = [];
  const routeCoordinates = route.geometry.coordinates;
  const streetGeometryById = getStreetGeometryMap();

  if (typeof streetAlerts !== "undefined") {
    streetAlerts.forEach(function(street) {
      if (street.risk !== "high" && street.risk !== "medium") {
        return;
      }

      const geometry = streetGeometryById.get(street.id);

      if (!geometry || geometry.length < 2) {
        return;
      }

      let touchesStreet = false;

      for (let i = 0; i < routeCoordinates.length && !touchesStreet; i += 3) {
        for (let j = 0; j < geometry.length - 1; j++) {
          const distance = pointToSegmentDistanceMeters(routeCoordinates[i], geometry[j], geometry[j + 1]);

          if (distance <= 90) {
            touchesStreet = true;
            break;
          }
        }
      }

      if (touchesStreet) {
        touchedAlerts.push({
          name: street.street + " (" + street.commune + ")",
          risk: street.risk,
          coordinates: geometry[Math.floor(geometry.length / 2)],
          radius: 180,
          source: "street"
        });
      }
    });
  }

  if (typeof zones !== "undefined") {
    zones.forEach(function(zone) {
      if (zone.risk !== "high" && zone.risk !== "medium") {
        return;
      }

      let touchesZone = false;

      for (let i = 0; i < routeCoordinates.length; i++) {
        const lon = routeCoordinates[i][0];
        const lat = routeCoordinates[i][1];
        const distance = calculateDistanceMeters(lat, lon, zone.coordinates[0], zone.coordinates[1]);

        if (distance <= zone.radius + 120) {
          touchesZone = true;
          break;
        }
      }

      if (touchesZone) {
        touchedAlerts.push({
          name: zone.name,
          risk: zone.risk,
          coordinates: zone.coordinates,
          radius: zone.radius,
          source: "zone"
        });
      }
    });
  }

  return touchedAlerts;
}

function createDetourPoint(startPoint, endPoint, alert) {
  const centerLat = alert.coordinates[0];
  const centerLon = alert.coordinates[1];
  const offsetMeters = (alert.radius || 300) + 850;

  const dx = endPoint.lon - startPoint.lon;
  const dy = endPoint.lat - startPoint.lat;

  let perpendicularX = -dy;
  let perpendicularY = dx;
  const length = Math.sqrt(perpendicularX * perpendicularX + perpendicularY * perpendicularY);

  if (length === 0) {
    perpendicularX = 1;
    perpendicularY = 0;
  } else {
    perpendicularX = perpendicularX / length;
    perpendicularY = perpendicularY / length;
  }

  const metersPerDegreeLat = 111320;
  const metersPerDegreeLon = 111320 * Math.cos(toRadians(centerLat));

  return {
    lat: centerLat + (perpendicularY * offsetMeters) / metersPerDegreeLat,
    lon: centerLon + (perpendicularX * offsetMeters) / metersPerDegreeLon,
    displayName: "Point de détour"
  };
}

function formatDistance(meters) {
  if (meters < 1000) {
    return Math.round(meters) + " m";
  }

  return (meters / 1000).toFixed(1) + " km";
}

function formatDuration(seconds) {
  const minutes = Math.round(seconds / 60);

  if (minutes < 60) {
    return minutes + " min";
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return hours + " h " + remainingMinutes + " min";
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function updateRouteResult(message, type) {
  const result = document.getElementById("routeResult");

  if (!result) {
    return;
  }

  result.className = "route-result";

  if (!message) {
    result.innerHTML = "";
    return;
  }

  result.innerHTML = message;
  result.classList.add("visible");

  if (type) {
    result.classList.add(type);
  }
}

function buildRouteSummary(route, travelMode, alerts, isSafeRoute) {
  const modeText = getModeText(travelMode);
  const duration = getDisplayedDuration(route, travelMode);

  let message =
    "<strong>Itinéraire " + modeText + " calculé.</strong><br>" +
    "Distance : " + formatDistance(route.distance) + "<br>" +
    "Durée estimée : " + formatDuration(duration) + "<br>";

  if (travelMode === "public") {
    message += "La durée du transport est une estimation, sans horaires RATP/SNCF en temps réel pour le moment.<br>";
  }

  if (alerts.length === 0) {
    message += isSafeRoute ?
      "Le trajet évite les principales rues et zones signalées." :
      "Aucune rue ou zone à risque importante n’a été détectée sur ce trajet.";

    return { message: message, type: "safe" };
  }

  const names = alerts.map(function(alert) {
    return alert.name;
  }).slice(0, 6).join(", ");

  message += "Attention : ce trajet passe près de : " + escapeHtml(names) + ".";

  return { message: message, type: "warning" };
}

async function calculateRoute(avoidRisk) {
  const startInput = document.getElementById("startInput");
  const endInput = document.getElementById("endInput");
  const travelMode = document.getElementById("travelMode").value;

  const startValue = startInput.value.trim();
  const endValue = endInput.value.trim();

  if (startValue === "" || endValue === "") {
    updateRouteResult("Veuillez entrer un départ et une destination.", "warning");
    return;
  }

  updateRouteResult("Calcul de l’itinéraire en cours...", "loading");

  try {
    const startPoint = await geocodeAddress(startValue);
    const endPoint = await geocodeAddress(endValue);

    const normalRoute = await getRoute([startPoint, endPoint], travelMode);
    const normalAlerts = findDangerousAlertsOnRoute(normalRoute);

    let routeToDraw = normalRoute;
    let alertsToShow = normalAlerts;
    let isSafeRoute = false;

    if (avoidRisk && normalAlerts.length > 0) {
      const alertToAvoid = normalAlerts.slice().sort(function(a, b) {
        if (a.risk === b.risk) return 0;
        return a.risk === "high" ? -1 : 1;
      })[0];

      const detourPoint = createDetourPoint(startPoint, endPoint, alertToAvoid);
      const detourRoute = await getRoute([startPoint, detourPoint, endPoint], travelMode);
      const detourAlerts = findDangerousAlertsOnRoute(detourRoute);

      if (detourAlerts.length <= normalAlerts.length) {
        routeToDraw = detourRoute;
        alertsToShow = detourAlerts;
        isSafeRoute = true;
      }
    }

    drawRoute(routeToDraw, startPoint, endPoint, isSafeRoute);
    lastCalculatedRoute = {
      route: routeToDraw,
      startPoint: startPoint,
      endPoint: endPoint,
      travelMode: travelMode,
      isSafeRoute: isSafeRoute
    };

    const summary = buildRouteSummary(routeToDraw, travelMode, alertsToShow, isSafeRoute);
    updateRouteResult(summary.message, summary.type);
  } catch (error) {
    clearRoute();
    updateRouteResult(escapeHtml(error.message || "Impossible de calculer cet itinéraire."), "warning");
  }
}


function openRouteSidePanel(focusInput) {
  const mainLayout = document.querySelector(".main-layout");
  const sidePanel = document.getElementById("sidePanel");

  if (!mainLayout || !sidePanel) {
    return;
  }

  mainLayout.classList.remove("side-panel-closed");
  sidePanel.classList.remove("is-closed");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

  setTimeout(function() {
    if (typeof map !== "undefined" && map.invalidateSize) {
      map.invalidateSize();
    }

    if (focusInput) {
      const startInput = document.getElementById("startInput");
      if (startInput) {
        startInput.focus();
      }
    }
  }, 250);
}

function closeRouteSidePanel() {
  const mainLayout = document.querySelector(".main-layout");
  const sidePanel = document.getElementById("sidePanel");

  if (!mainLayout || !sidePanel) {
    return;
  }

  sidePanel.classList.add("is-closed");
  mainLayout.classList.add("side-panel-closed");

  setTimeout(function() {
    if (typeof map !== "undefined" && map.invalidateSize) {
      map.invalidateSize();
    }
  }, 250);
}

function setupRouteSidePanelToggle() {
  const closeRoutePanel = document.getElementById("closeRoutePanel");
  const itineraryLink = document.querySelector('a[href="#routePlanner"]');

  if (closeRoutePanel) {
    closeRoutePanel.addEventListener("click", function() {
      closeRouteSidePanel();
    });
  }

  if (itineraryLink) {
    itineraryLink.addEventListener("click", function(event) {
      event.preventDefault();
      openRouteSidePanel(true);
    });
  }
}

function setupModeButtons() {
  const travelModeInput = document.getElementById("travelMode");
  const modeButtons = document.querySelectorAll(".mode-option");
  const safeRouteButton = document.getElementById("safeRouteButton");
  const startInput = document.getElementById("startInput");
  const endInput = document.getElementById("endInput");

  if (!travelModeInput || modeButtons.length === 0) {
    return;
  }

  modeButtons.forEach(function(button) {
    button.addEventListener("click", function() {
      const selectedMode = button.dataset.mode;

      travelModeInput.value = selectedMode;

      modeButtons.forEach(function(item) {
        const isActive = item === button;
        item.classList.toggle("active", isActive);
        item.setAttribute("aria-pressed", isActive ? "true" : "false");
      });

      if (startInput && endInput && startInput.value.trim() !== "" && endInput.value.trim() !== "") {
        calculateRoute(safeRouteButton ? safeRouteButton.checked : false);
      }
    });
  });
}

function setupRoutePlanner() {
  const routeForm = document.getElementById("routeForm");
  const safeRouteButton = document.getElementById("safeRouteButton");
  const clearRouteButton = document.getElementById("clearRouteButton");
  const swapRouteButton = document.getElementById("swapRouteButton");
  const startInput = document.getElementById("startInput");
  const endInput = document.getElementById("endInput");

  setupModeButtons();

  if (!routeForm || !safeRouteButton || !clearRouteButton || !swapRouteButton || !startInput || !endInput) {
    return;
  }

  routeForm.addEventListener("submit", function(event) {
    event.preventDefault();
    calculateRoute(safeRouteButton.checked);
  });

  safeRouteButton.addEventListener("change", function() {
    if (startInput.value.trim() === "" || endInput.value.trim() === "") {
      return;
    }

    calculateRoute(safeRouteButton.checked);
  });

  clearRouteButton.addEventListener("click", function() {
    clearRoute();
    startInput.value = "";
    endInput.value = "";
    safeRouteButton.checked = false;
    updateRouteResult("");
  });

  swapRouteButton.addEventListener("click", function() {
    const oldStart = startInput.value;
    startInput.value = endInput.value;
    endInput.value = oldStart;

    if (startInput.value.trim() !== "" && endInput.value.trim() !== "") {
      calculateRoute(safeRouteButton.checked);
    }
  });
}

document.addEventListener("DOMContentLoaded", function() {
  setupRoutePlanner();
  setupRouteSidePanelToggle();
});
