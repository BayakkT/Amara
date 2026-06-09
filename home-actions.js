function getFilteredStreets() {
    if (typeof streetAlerts === "undefined") {
        return [];
    }
    if (currentRisk === "all") {
        return streetAlerts;
    }
    return streetAlerts.filter(function(street) {
        return street.risk === currentRisk;
    });
}

function clearMapLayers() {
    if (typeof circles !== "undefined" && Array.isArray(circles)) {
        circles.forEach(circle => map.removeLayer(circle));
        circles = [];
    }
    if (typeof streetLayers !== "undefined" && Array.isArray(streetLayers)) {
        streetLayers.forEach(layer => map.removeLayer(layer));
        streetLayers = [];
    }
    if (typeof alertMarkers !== "undefined" && Array.isArray(alertMarkers)) {
        alertMarkers.forEach(marker => map.removeLayer(marker));
        alertMarkers = [];
    }
}

function createStreetPopup(street) {
    let articleHtml = "";
    if (street.articles && street.articles.length > 0) {
        const firstArticle = street.articles[0];
        articleHtml =
            "<br><br>" +
            "<strong>Source :</strong> " + firstArticle.source + "<br>" +
            "<strong>Date :</strong> " + firstArticle.date + "<br>" +
            "<a href='" + firstArticle.url + "' target='_blank'>Voir l'article</a>";
    }
    return (
        "<strong>" + street.street + "</strong><br>" +
        street.commune + " · " + street.dept + "<br>" +
        street.riskLabel +
        articleHtml
    );
}

function getStreetGeometryById(streetId) {
    if (typeof streetGeometries === "undefined") {
        return null;
    }
    const foundStreet = streetGeometries.find(item => item.id === streetId);
    return !foundStreet ? null : foundStreet.geometry;
}

function renderMapZones() {
    clearMapLayers();

    // 1. Rendu sécurisé des cercles BDD
    if (typeof zones !== "undefined" && Array.isArray(zones)) {
        const filteredZones = currentRisk === "all" ? zones : zones.filter(z => (z.risk || z.risk_level) === currentRisk);
        filteredZones.forEach(function(zone) {
            try {
                const riskType = zone.risk || zone.risk_level || "medium";
                const color = riskColors[riskType] || riskColors["medium"];
                
                let coords = zone.coordinates;
                if (typeof coords === "string") coords = JSON.parse(coords);
                else if (zone.latitude && zone.longitude) coords = [parseFloat(zone.latitude), parseFloat(zone.longitude)];
                
                if (!coords || !Array.isArray(coords)) return;

                const circle = L.circle(coords, {
                    color: color.border,
                    fillColor: color.fill,
                    fillOpacity: 0.22,
                    weight: 3,
                    radius: zone.radius ? parseInt(zone.radius) : 350
                }).addTo(map);

                const name = zone.name || zone.street || "Zone signalée";
                circle.bindPopup("<strong>" + name + "</strong><br>" + (zone.district || zone.commune || ""));
                circles.push(circle);
            } catch(e) { console.error("Erreur rendu zone:", e); }
        });
    }

    // 2. Rendu des rues statiques (Tat)
    if (typeof streetAlerts !== "undefined" && typeof streetGeometries !== "undefined" && typeof streetRiskColors !== "undefined") {
        const filteredStreets = getFilteredStreets();
        filteredStreets.forEach(function(street) {
            try {
                const geometry = getStreetGeometryById(street.id);
                if (!geometry) return;

                const colors = streetRiskColors[street.risk];
                if (!colors) return;

                const glowLayer = L.polyline(geometry, {
                    color: colors.glow, weight: 20, opacity: 0.25, lineCap: "round", lineJoin: "round", interactive: false
                }).addTo(map);

                const lineLayer = L.polyline(geometry, {
                    color: colors.line, weight: 7, opacity: 0.9, lineCap: "round", lineJoin: "round"
                }).addTo(map);

                lineLayer.bindPopup(createStreetPopup(street));
                streetLayers.push(glowLayer, lineLayer);
            } catch(e) { console.error("Erreur rendu rue:", e); }
        });
    }

    // 3. Rendu et filtrage dynamique des points d'alertes BDD avec couleur dynamique
    if (typeof dynamicAlerts !== "undefined" && Array.isArray(dynamicAlerts)) {
        const filteredAlerts = currentRisk === "all" ? dynamicAlerts : dynamicAlerts.filter(a => (a.risk_level || a.riskLevel || a.risk) === currentRisk);
        
        filteredAlerts.forEach(alert => {
            try {
                if (!alert.latitude || !alert.longitude) return;

                // Détermination de la couleur dynamique correspondante au niveau de risque
                const riskType = alert.risk_level || alert.riskLevel || alert.risk || "medium";
                const markerColor = (riskColors[riskType] || riskColors["medium"]).fill;

                const alertIcon = L.divIcon({
                    className: 'custom-alert-icon',
                    html: `<div style="background-color: ${markerColor}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 6px rgba(0,0,0,0.6);"></div>`,
                    iconSize: [14, 14]
                });

                const marker = L.marker([parseFloat(alert.latitude), parseFloat(alert.longitude)], {icon: alertIcon}).addTo(map);
                marker.bindPopup(`<strong>📍 Signalement : ${alert.street}</strong><br>Heure : ${alert.incident_time || '00:00'}<br><em>${alert.description || ''}</em>`);
                alertMarkers.push(marker);
            } catch(e) { console.error("Erreur rendu marqueur:", e); }
        });
    }
}

function renderZonesList() {
    const list = document.getElementById("zonesList");
    if (!list) return;
    list.innerHTML = "";

    const filteredStreets = getFilteredStreets();
    filteredStreets.forEach(function(street) {
        const card = document.createElement("div");
        card.className = "zone-card";
        let dotClass = street.risk === "high" ? "high" : "medium";

        card.innerHTML = `
            <div>
                <div class="zone-card-title">
                    <span class="zone-card-dot ${dotClass}"></span>
                    ${street.street}
                </div>
                <p>${street.commune} · ${street.dept}</p>
            </div>
            <span class="card-risk ${street.risk}">${street.riskLabel}</span>
        `;
        list.appendChild(card);
    });
}

function formatStreetCount(count) {
    return count <= 1 ? count + " rue" : count + " rues";
}

function updateStreetLegend() {
    let staticHigh = typeof streetAlerts !== "undefined" ? streetAlerts.filter(s => s.risk === "high").length : 0;
    let staticMedium = typeof streetAlerts !== "undefined" ? streetAlerts.filter(s => s.risk === "medium").length : 0;

    let dynamicHigh = typeof dynamicAlerts !== "undefined" && Array.isArray(dynamicAlerts) ? dynamicAlerts.filter(a => (a.risk_level || a.riskLevel || a.risk) === "high").length : 0;
    let dynamicMedium = typeof dynamicAlerts !== "undefined" && Array.isArray(dynamicAlerts) ? dynamicAlerts.filter(a => (a.risk_level || a.riskLevel || a.risk) === "medium").length : 0;

    const totalHigh = staticHigh + dynamicHigh;
    const totalMedium = staticMedium + dynamicMedium;

    const highElement = document.getElementById("highStreetCount");
    const mediumElement = document.getElementById("mediumStreetCount");

    if (highElement) highElement.textContent = formatStreetCount(totalHigh);
    if (mediumElement) mediumElement.textContent = formatStreetCount(totalMedium);
}

function setupFilters() {
    const buttons = document.querySelectorAll(".filter-btn");
    buttons.forEach(function(button) {
        button.addEventListener("click", function() {
            buttons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
            currentRisk = button.dataset.risk;
            renderMapZones();
            renderZonesList();
        });
    });
}

// --- LOGIQUE DE CALCUL D'ITINÉRAIRE ---
async function geocodeAddress(address) {
    const url = "https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" + encodeURIComponent(address + ", Paris, France");
    const response = await fetch(url);
    const data = await response.json();
    if (data.length === 0) throw new Error("Adresse introuvable : " + address);
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
}

async function getRoute(points) {
    const coordinates = points.map(p => p.lon + "," + p.lat).join(";");
    const url = "https://router.project-osrm.org/route/v1/driving/" + coordinates + "?overview=full&geometries=geojson";
    const response = await fetch(url);
    const data = await response.json();
    if (!data.routes || data.routes.length === 0) throw new Error("Impossible de calculer cet itinéraire.");
    return data.routes[0];
}

function drawRoute(route, startPoint, endPoint, isSafeRoute) {
    clearRoute();
    const latLngs = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
    routeLine = L.polyline(latLngs, {
        color: isSafeRoute ? "#7b61c9" : "#bd5c93",
        weight: 6,
        opacity: 0.85
    }).addTo(map);

    const startMarker = L.marker([startPoint.lat, startPoint.lon]).addTo(map);
    const endMarker = L.marker([endPoint.lat, endPoint.lon]).addTo(map);
    routeMarkers.push(startMarker, endMarker);
    map.fitBounds(routeLine.getBounds(), { padding: [40, 40] });
}

function clearRoute() {
    if (typeof routeLine !== "undefined" && routeLine !== null) { map.removeLayer(routeLine); routeLine = null; }
    if (typeof routeMarkers !== "undefined") {
        routeMarkers.forEach(marker => map.removeLayer(marker));
        routeMarkers = [];
    }
}

function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
    const earthRadius = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return earthRadius * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function findDangerousZonesOnRoute(route) {
    const dangerousZones = zones.filter(z => (z.risk || z.risk_level) === "high" || (z.risk || z.risk_level) === "medium");
    const routeCoordinates = route.geometry.coordinates;
    const touchedZones = [];

    dangerousZones.forEach(function(zone) {
        let touchesZone = false;
        let zLat = zone.latitude ? parseFloat(zone.latitude) : zone.coordinates[0];
        let zLon = zone.longitude ? parseFloat(zone.longitude) : zone.coordinates[1];
        let zRadius = zone.radius ? parseInt(zone.radius) : 350;

        for (let i = 0; i < routeCoordinates.length; i++) {
            if (calculateDistanceMeters(routeCoordinates[i][1], routeCoordinates[i][0], zLat, zLon) <= zRadius + 120) {
                touchesZone = true;
                break;
            }
        }
        if (touchesZone) touchedZones.push(zone);
    });
    return touchedZones;
}

function createDetourPoint(startPoint, endPoint, zone) {
    let zLat = zone.latitude ? parseFloat(zone.latitude) : zone.coordinates[0];
    let zLon = zone.longitude ? parseFloat(zone.longitude) : zone.coordinates[1];
    let zRadius = zone.radius ? parseInt(zone.radius) : 350;

    const offsetMeters = zRadius + 700;
    let perpendicularX = -(endPoint.lat - startPoint.lat);
    let perpendicularY = endPoint.lon - startPoint.lon;
    const length = Math.sqrt(perpendicularX * perpendicularX + perpendicularY * perpendicularY);
    
    perpendicularX = length === 0 ? 1 : perpendicularX / length;
    perpendicularY = length === 0 ? 0 : perpendicularY / length;

    return {
        lat: zLat + (perpendicularY * offsetMeters) / 111320,
        lon: zLon + (perpendicularX * offsetMeters) / (111320 * Math.cos(zLat * Math.PI / 180))
    };
}

function formatDistance(meters) { return meters < 1000 ? Math.round(meters) + " m" : (meters / 1000).toFixed(1) + " km"; }
function formatDuration(seconds) { const min = Math.round(seconds / 60); return min < 60 ? min + " min" : Math.floor(min / 60) + " h " + (min % 60) + " min"; }

function updateRouteResult(message, type) {
    const result = document.getElementById("routeResult");
    if (!result) return;
    result.innerHTML = message;
    result.className = "route-result " + (type || "");
}

async function handleNormalRoute(event) {
    event.preventDefault();
    const startValue = document.getElementById("startInput").value.trim();
    const endValue = document.getElementById("endInput").value.trim();
    if (!startValue || !endValue) return;

    try {
        updateRouteResult("Calcul de l’itinéraire...", "loading");
        const startPoint = await geocodeAddress(startValue);
        const endPoint = await geocodeAddress(endValue);
        const route = await getRoute([startPoint, endPoint]);
        drawRoute(route, startPoint, endPoint, false);

        const dangerousZones = findDangerousZonesOnRoute(route);
        if (dangerousZones.length === 0) {
            updateRouteResult(`<strong>Itinéraire vérifié.</strong><br>Distance : ${formatDistance(route.distance)}<br>Durée : ${formatDuration(route.duration)}<br>Aucune zone à risque détectée.`, "safe");
        } else {
            let names = dangerousZones.map(z => z.name || z.street || "Zone").join(", ");
            updateRouteResult(`<strong>Attention, zones à risque détectées :</strong> ${names}.<br>Distance : ${formatDistance(route.distance)}<br>Cliquez sur "Éviter les zones à risque".`, "warning");
        }
    } catch (error) { updateRouteResult(error.message, "warning"); }
}

async function handleSafeRoute() {
    const startValue = document.getElementById("startInput").value.trim();
    const endValue = document.getElementById("endInput").value.trim();
    if (!startValue || !endValue) return;

    try {
        updateRouteResult("Recherche d’un itinéraire sécurisé...", "loading");
        const startPoint = await geocodeAddress(startValue);
        const endPoint = await geocodeAddress(endValue);
        const firstRoute = await getRoute([startPoint, endPoint]);
        const dangerousZones = findDangerousZonesOnRoute(firstRoute);

        if (dangerousZones.length === 0) {
            drawRoute(firstRoute, startPoint, endPoint, true);
            updateRouteResult("L'itinéraire initial évite déjà les zones à risques.", "safe");
            return;
        }

        const detourPoint = createDetourPoint(startPoint, endPoint, dangerousZones[0]);
        const safeRoute = await getRoute([startPoint, detourPoint, endPoint]);
        drawRoute(safeRoute, startPoint, endPoint, true);
        updateRouteResult(`<strong>Itinéraire sécurisé alternatif généré.</strong><br>Distance : ${formatDistance(safeRoute.distance)}<br>Durée : ${formatDuration(safeRoute.duration)}`, "safe");
    } catch (error) { updateRouteResult(error.message, "warning"); }
}

function setupRoutePlanner() {
    const routeForm = document.getElementById("routeForm");
    const safeRouteButton = document.getElementById("safeRouteButton");
    const clearRouteButton = document.getElementById("clearRouteButton");

    if (routeForm) routeForm.addEventListener("submit", handleNormalRoute);
    if (safeRouteButton) safeRouteButton.addEventListener("click", handleSafeRoute);
    if (clearRouteButton) {
        clearRouteButton.addEventListener("click", function() {
            clearRoute();
            document.getElementById("startInput").value = "";
            document.getElementById("endInput").value = "";
            updateRouteResult("Aucun itinéraire vérifié pour le moment.");
        });
    }
}

function setupMapControls() {
    const zoomIn = document.getElementById("zoomIn");
    const zoomOut = document.getElementById("zoomOut");
    const resetMap = document.getElementById("resetMap");

    if (zoomIn) zoomIn.addEventListener("click", () => map.zoomIn());
    if (zoomOut) zoomOut.addEventListener("click", () => map.zoomOut());
    if (resetMap) resetMap.addEventListener("click", () => map.setView([48.8625, 2.35], 13));
}

function setupModal() {
    const modalOverlay = document.getElementById("modalOverlay");
    const openNavbar = document.getElementById("openAlertModalNavbar");
    const openSide = document.getElementById("openAlertModalSide");
    const closeButton = document.getElementById("closeModal");
    const form = document.getElementById("alertForm");
    const toast = document.getElementById("toast");
    const btnNow = document.getElementById("btnNow");

    if (btnNow) {
        btnNow.addEventListener("click", function() {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            document.getElementById("time").value = `${hours}:${minutes}`;
        });
    }

    if (openNavbar) openNavbar.addEventListener("click", () => modalOverlay.classList.add("active"));
    if (openSide) openSide.addEventListener("click", () => modalOverlay.classList.add("active"));
    if (closeButton) closeButton.addEventListener("click", () => modalOverlay.classList.remove("active"));

    if (form) {
        form.addEventListener("submit", async function(event) {
            event.preventDefault();
            const streetValue = document.getElementById("street").value.trim();

            let lat = null, lon = null;
            try {
                const url = "https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" + encodeURIComponent(streetValue + ", Ile-de-France, France");
                const res = await fetch(url);
                const geoData = await res.json();
                if (geoData.length > 0) {
                    lat = parseFloat(geoData[0].lat);
                    lon = parseFloat(geoData[0].lon);
                }
            } catch(e) { console.error(e); }

            const alertData = {
                street: streetValue,
                time: document.getElementById("time").value,
                riskLevel: document.getElementById("riskLevel").value,
                message: document.getElementById("message").value,
                latitude: lat,
                longitude: lon
            };

            try {
                const response = await fetch('add_alert.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(alertData)
                });
                const result = await response.json();

                if (result.success) {
                    modalOverlay.classList.remove("active");
                    form.reset();
                    if (toast) {
                        toast.textContent = result.message;
                        toast.classList.add("active");
                        setTimeout(() => toast.classList.remove("active"), 2500);
                    }
                    fetchAlerts();
                }
            } catch (error) { alert("Erreur."); }
        });
    }
}

function initHome() {
    setupFilters();
    setupMapControls();
    setupModal();
    setupRoutePlanner();
    updateStreetLegend();

    fetchZones();
    fetchAlerts();
}

document.addEventListener("DOMContentLoaded", initHome);