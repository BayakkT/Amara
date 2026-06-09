function getFilteredZones() {
    if (currentRisk === "all") {
        return zones;
    }
    return zones.filter(function(zone) {
        return zone.risk === currentRisk;
    });
}

function renderMapZones() {
    circles.forEach(function(circle) {
        map.removeLayer(circle);
    });
    circles = [];

    const filteredZones = getFilteredZones();

    filteredZones.forEach(function(zone) {
        const color = riskColors[zone.risk];

        const circle = L.circle(zone.coordinates, {
            color: color.border,
            fillColor: color.fill,
            fillOpacity: 0.22,
            weight: 3,
            radius: zone.radius
        }).addTo(map);

        circle.bindPopup(
            "<strong>" + zone.name + "</strong><br>" +
            zone.district + "<br>" +
            zone.riskLabel
        );

        circle.on("click", function() {
            updatePanel(zone);
            openSidePanel();
        });

        circles.push(circle);
    });
}

function renderZonesList() {
    const list = document.getElementById("zonesList");
    if (!list) return;
    list.innerHTML = "";

    const filteredZones = getFilteredZones();

    filteredZones.forEach(function(zone) {
        const card = document.createElement("div");
        card.className = "zone-card";

        card.innerHTML = `
            <div>
                <div class="zone-card-title">
                    <span class="zone-card-dot ${zone.risk}"></span>
                    <span>${zone.name}</span>
                </div>
                <p>${zone.district}</p>
            </div>
            <span class="card-risk ${zone.risk}">
                ${zone.riskLabel}
            </span>
        `;

        card.addEventListener("click", function() {
            updatePanel(zone);
            openSidePanel();
            map.setView(zone.coordinates, 14);
            window.scrollTo({ top: 0, behavior: "smooth" });
        });

        list.appendChild(card);
    });
}

function updatePanel(zone) {
    const panelTitle = document.getElementById("panelTitle");
    const panelDistrict = document.getElementById("panelDistrict");
    const panelRisk = document.getElementById("panelRisk");
    const panelDescription = document.getElementById("panelDescription");
    const adviceContainer = document.getElementById("panelAdvice");

    if (panelTitle) panelTitle.textContent = zone.name;
    if (panelDistrict) panelDistrict.textContent = zone.district;
    if (panelRisk) panelRisk.textContent = zone.riskLabel;
    if (panelDescription) panelDescription.textContent = zone.description;

    if (adviceContainer) {
        adviceContainer.innerHTML = "";
        if (zone.advice && Array.isArray(zone.advice)) {
            zone.advice.forEach(function(item) {
                const paragraph = document.createElement("p");
                paragraph.textContent = "◆ " + item;
                adviceContainer.appendChild(paragraph);
            });
        }
    }
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

function setupMapControls() {
    const zoomIn = document.getElementById("zoomIn");
    const zoomOut = document.getElementById("zoomOut");
    const resetMap = document.getElementById("resetMap");

    if (zoomIn) zoomIn.addEventListener("click", () => map.zoomIn());
    if (zoomOut) zoomOut.addEventListener("click", () => map.zoomOut());
    if (resetMap) resetMap.addEventListener("click", () => map.setView([48.8625, 2.35], 13));
}

function openSidePanel() {
    const panel = document.getElementById("sidePanel");
    if (panel) panel.style.display = "block";
}

function setupModal() {
    const modalOverlay = document.getElementById("modalOverlay");
    const openNavbar = document.getElementById("openAlertModalNavbar");
    const openSide = document.getElementById("openAlertModalSide");
    const closeButton = document.getElementById("closeModal");
    const form = document.getElementById("alertForm");
    const toast = document.getElementById("toast");
    const btnNow = document.getElementById("btnNow");

    // Bouton Heure actuelle "Maintenant"
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

    if (modalOverlay) {
        modalOverlay.addEventListener("click", function(event) {
            if (event.target === modalOverlay) modalOverlay.classList.remove("active");
        });
    }

    if (form) {
        form.addEventListener("submit", async function(event) {
            event.preventDefault();
            const streetValue = document.getElementById("street").value.trim();

            let lat = null, lon = null;
            try {
                // Requête de géocodage vers Nominatim OpenStreetMap limitée à la région Île-de-France
                const url = "https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" + encodeURIComponent(streetValue + ", Ile-de-France, France");
                const res = await fetch(url);
                const geoData = await res.json();
                if (geoData.length > 0) {
                    lat = parseFloat(geoData[0].lat);
                    lon = parseFloat(geoData[0].lon);
                }
            } catch(e) {
                console.error("Erreur géocodage :", e);
            }

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
                    // Met à jour instantanément la carte avec la nouvelle alerte positionnée
                    fetchAlerts();
                } else {
                    alert(result.message);
                }
            } catch (error) {
                alert("Erreur lors de l'envoi de la demande.");
            }
        });
    }
}

function setupOtherButtons() {
    const closePanel = document.getElementById("closePanel");
    if (closePanel) {
        closePanel.addEventListener("click", function() {
            const panel = document.getElementById("sidePanel");
            if (panel) panel.style.display = "none";
        });
    }

    const showAllZones = document.getElementById("showAllZones");
    if (showAllZones) {
        showAllZones.addEventListener("click", function() {
            currentRisk = "all";
            const buttons = document.querySelectorAll(".filter-btn");
            buttons.forEach(function(button) {
                button.classList.remove("active");
                if (button.dataset.risk === "all") button.classList.add("active");
            });
            renderMapZones();
            renderZonesList();
        });
    }
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
    if (routeLine !== null) { map.removeLayer(routeLine); routeLine = null; }
    routeMarkers.forEach(marker => map.removeLayer(marker));
    routeMarkers = [];
}

function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
    const earthRadius = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return earthRadius * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function findDangerousZonesOnRoute(route) {
    const dangerousZones = zones.filter(z => z.risk === "high" || z.risk === "medium");
    const routeCoordinates = route.geometry.coordinates;
    const touchedZones = [];

    dangerousZones.forEach(function(zone) {
        let touchesZone = false;
        for (let i = 0; i < routeCoordinates.length; i++) {
            if (calculateDistanceMeters(routeCoordinates[i][1], routeCoordinates[i][0], zone.coordinates[0], zone.coordinates[1]) <= zone.radius + 120) {
                touchesZone = true;
                break;
            }
        }
        if (touchesZone) touchedZones.push(zone);
    });
    return touchedZones;
}

function createDetourPoint(startPoint, endPoint, zone) {
    const offsetMeters = zone.radius + 700;
    let perpendicularX = -(endPoint.lat - startPoint.lat);
    let perpendicularY = endPoint.lon - startPoint.lon;
    const length = Math.sqrt(perpendicularX * perpendicularX + perpendicularY * perpendicularY);
    
    perpendicularX = length === 0 ? 1 : perpendicularX / length;
    perpendicularY = length === 0 ? 0 : perpendicularY / length;

    return {
        lat: zone.coordinates[0] + (perpendicularY * offsetMeters) / 111320,
        lon: zone.coordinates[1] + (perpendicularX * offsetMeters) / (111320 * Math.cos(zone.coordinates[0] * Math.PI / 180))
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
            updateRouteResult(`<strong>Attention, zones à risque détectées :</strong> ${dangerousZones.map(z => z.name).join(", ")}.<br>Distance : ${formatDistance(route.distance)}<br>Cliquez sur "Éviter les zones à risque".`, "warning");
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

function initHome() {
    setupFilters();
    setupMapControls();
    setupModal();
    setupOtherButtons();
    setupRoutePlanner();

    fetchZones();
    fetchAlerts();
}

document.addEventListener("DOMContentLoaded", initHome);