const zones = [
    {
        id: 1,
        name: "Gare du Nord / Barbès",
        district: "10e / 18e · Paris",
        risk: "high",
        riskLabel: "Risque élevé",
        coordinates: [48.8827, 2.3558],
        radius: 450,
        description: "Zone très fréquentée avec plusieurs signalements en soirée et aux abords des transports.",
        advice: [
            "Évitez les rues isolées la nuit",
            "Restez proche des zones éclairées",
            "Privilégiez les grands axes"
        ]
    },
    {
        id: 2,
        name: "Châtelet-Les Halles",
        district: "1er · Paris",
        risk: "high",
        riskLabel: "Risque élevé",
        coordinates: [48.8625, 2.3472],
        radius: 380,
        description: "Zone très dense avec beaucoup de passages, surtout dans les transports et les accès souterrains.",
        advice: [
            "Restez attentive dans les couloirs du métro",
            "Évitez de rester seule dans les zones peu visibles",
            "Gardez votre téléphone accessible"
        ]
    },
    {
        id: 3,
        name: "Pigalle / Clichy",
        district: "9e / 18e · Paris",
        risk: "high",
        riskLabel: "Risque élevé",
        coordinates: [48.8836, 2.3336],
        radius: 420,
        description: "Quartier animé le soir avec certains signalements autour des bars et des sorties de métro.",
        advice: [
            "Évitez les déplacements seule tard le soir",
            "Restez dans les rues principales",
            "Prévenez une personne de confiance"
        ]
    },
    {
        id: 4,
        name: "Stalingrad / La Villette",
        district: "19e · Paris",
        risk: "high",
        riskLabel: "Risque élevé",
        coordinates: [48.8841, 2.3699],
        radius: 430,
        description: "Zone de passage avec certains endroits moins rassurants selon l'heure de la journée.",
        advice: [
            "Évitez les passages peu éclairés",
            "Privilégiez les trajets avec du monde",
            "Ne vous arrêtez pas longtemps seule"
        ]
    },
    {
        id: 5,
        name: "Porte de Bagnolet",
        district: "20e · Paris",
        risk: "high",
        riskLabel: "Risque élevé",
        coordinates: [48.8647, 2.4086],
        radius: 450,
        description: "Zone périphérique avec plusieurs axes de circulation et des espaces parfois peu surveillés.",
        advice: [
            "Évitez les zones proches des parkings isolés",
            "Restez visible sur les grands axes",
            "Favorisez les trajets courts"
        ]
    },
    {
        id: 6,
        name: "Nation / Cours de Vincennes",
        district: "11e / 12e · Paris",
        risk: "medium",
        riskLabel: "À surveiller",
        coordinates: [48.8484, 2.3959],
        radius: 400,
        description: "Zone de transition avec incidents ponctuels de harcèlement aux abords du métro et en soirée.",
        advice: [
            "Attention aux abords du métro la nuit",
            "Évitez les traversées de parcs isolés"
        ]
    },
    {
        id: 7,
        name: "République",
        district: "3e / 10e / 11e · Paris",
        risk: "medium",
        riskLabel: "À surveiller",
        coordinates: [48.8674, 2.3636],
        radius: 360,
        description: "Grande place très fréquentée avec des regroupements importants selon les heures.",
        advice: [
            "Restez dans les zones éclairées",
            "Évitez les petits passages autour de la place"
        ]
    },
    {
        id: 8,
        name: "Belleville",
        district: "19e / 20e · Paris",
        risk: "medium",
        riskLabel: "À surveiller",
        coordinates: [48.8722, 2.3768],
        radius: 390,
        description: "Quartier animé avec certaines rues moins fréquentées le soir.",
        advice: [
            "Préférez les rues principales",
            "Évitez les trajets seule tard le soir"
        ]
    },
    {
        id: 9,
        name: "Montparnasse",
        district: "14e / 15e · Paris",
        risk: "medium",
        riskLabel: "À surveiller",
        coordinates: [48.8421, 2.3219],
        radius: 340,
        description: "Zone de gare et de commerces avec beaucoup de passages en journée.",
        advice: [
            "Soyez attentive dans les zones de transport",
            "Évitez les rues vides autour de la gare"
        ]
    },
    {
        id: 10,
        name: "Jardin des Tuileries",
        district: "1er · Paris",
        risk: "safe",
        riskLabel: "Globalement sûr",
        coordinates: [48.8638, 2.3276],
        radius: 300,
        description: "Zone touristique et ouverte, généralement fréquentée en journée.",
        advice: [
            "Restez attentive en dehors des heures d'ouverture",
            "Évitez les espaces isolés le soir"
        ]
    },
    {
        id: 11,
        name: "Le Marais",
        district: "3e / 4e · Paris",
        risk: "safe",
        riskLabel: "Globalement sûr",
        coordinates: [48.8606, 2.3615],
        radius: 350,
        description: "Quartier vivant avec beaucoup de commerces, restaurants et passages.",
        advice: [
            "Privilégiez les rues commerçantes",
            "Restez attentive dans les petites rues tard le soir"
        ]
    },
    {
        id: 12,
        name: "Saint-Germain-des-Prés",
        district: "6e · Paris",
        risk: "safe",
        riskLabel: "Globalement sûr",
        coordinates: [48.8538, 2.3336],
        radius: 320,
        description: "Zone plutôt fréquentée et agréable, avec beaucoup de cafés et de restaurants.",
        advice: [
            "Restez dans les rues éclairées",
            "Évitez les quais isolés tard le soir"
        ]
    }
];

let currentRisk = "all";
let circles = [];
let routeLine = null;
let routeMarkers = [];
let lastStartPoint = null;
let lastEndPoint = null;

const map = L.map("map", {
    zoomControl: false
}).setView([48.8625, 2.35], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
}).addTo(map);

const riskColors = {
    high: {
        border: "#d93c8a",
        fill: "#d93c8a"
    },
    medium: {
        border: "#9f5488",
        fill: "#9f5488"
    },
    safe: {
        border: "#7b61c9",
        fill: "#7b61c9"
    }
};

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

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });

        list.appendChild(card);
    });
}

function updatePanel(zone) {
    document.getElementById("panelTitle").textContent = zone.name;
    document.getElementById("panelDistrict").textContent = zone.district;
    document.getElementById("panelRisk").textContent = zone.riskLabel;
    document.getElementById("panelDescription").textContent = zone.description;

    const adviceContainer = document.getElementById("panelAdvice");
    adviceContainer.innerHTML = "";

    zone.advice.forEach(function(item) {
        const paragraph = document.createElement("p");
        paragraph.textContent = "◆ " + item;
        adviceContainer.appendChild(paragraph);
    });
}

function setupFilters() {
    const buttons = document.querySelectorAll(".filter-btn");

    buttons.forEach(function(button) {
        button.addEventListener("click", function() {
            buttons.forEach(function(btn) {
                btn.classList.remove("active");
            });

            button.classList.add("active");
            currentRisk = button.dataset.risk;

            renderMapZones();
            renderZonesList();
        });
    });
}

function setupMapControls() {
    document.getElementById("zoomIn").addEventListener("click", function() {
        map.zoomIn();
    });

    document.getElementById("zoomOut").addEventListener("click", function() {
        map.zoomOut();
    });

    document.getElementById("resetMap").addEventListener("click", function() {
        map.setView([48.8625, 2.35], 13);
    });
}

function setupModal() {
    const modalOverlay = document.getElementById("modalOverlay");
    const openButton = document.getElementById("openAlertModal");
    const closeButton = document.getElementById("closeModal");
    const form = document.getElementById("alertForm");
    const toast = document.getElementById("toast");

    openButton.addEventListener("click", function() {
        modalOverlay.classList.add("active");
    });

    closeButton.addEventListener("click", function() {
        modalOverlay.classList.remove("active");
    });

    modalOverlay.addEventListener("click", function(event) {
        if (event.target === modalOverlay) {
            modalOverlay.classList.remove("active");
        }
    });

    form.addEventListener("submit", function(event) {
        event.preventDefault();

        modalOverlay.classList.remove("active");
        form.reset();

        toast.classList.add("active");

        setTimeout(function() {
            toast.classList.remove("active");
        }, 2500);
    });
}

function openSidePanel() {
    const panel = document.getElementById("sidePanel");
    panel.style.display = "block";
}

function setupOtherButtons() {
    document.getElementById("closePanel").addEventListener("click", function() {
        const panel = document.getElementById("sidePanel");
        panel.style.display = "none";
    });

    document.getElementById("showAllZones").addEventListener("click", function() {
        currentRisk = "all";

        const buttons = document.querySelectorAll(".filter-btn");

        buttons.forEach(function(button) {
            button.classList.remove("active");

            if (button.dataset.risk === "all") {
                button.classList.add("active");
            }
        });

        renderMapZones();
        renderZonesList();
    });
}

async function geocodeAddress(address) {
    const fullAddress = address + ", Paris, France";
    const url = "https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" + encodeURIComponent(fullAddress);

    const response = await fetch(url);
    const data = await response.json();

    if (data.length === 0) {
        throw new Error("Adresse introuvable : " + address);
    }

    return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        displayName: data[0].display_name
    };
}

async function getRoute(points) {
    const coordinates = points.map(function(point) {
        return point.lon + "," + point.lat;
    }).join(";");

    const url = "https://router.project-osrm.org/route/v1/driving/" + coordinates + "?overview=full&geometries=geojson&steps=true";

    const response = await fetch(url);
    const data = await response.json();

    if (!data.routes || data.routes.length === 0) {
        throw new Error("Impossible de calculer cet itinéraire.");
    }

    return data.routes[0];
}

function drawRoute(route, startPoint, endPoint, isSafeRoute) {
    clearRoute();

    const latLngs = route.geometry.coordinates.map(function(coord) {
        return [coord[1], coord[0]];
    });

    routeLine = L.polyline(latLngs, {
        color: isSafeRoute ? "#7b61c9" : "#bd5c93",
        weight: 6,
        opacity: 0.85
    }).addTo(map);

    const startMarker = L.marker([startPoint.lat, startPoint.lon]).addTo(map);
    startMarker.bindPopup("Départ");

    const endMarker = L.marker([endPoint.lat, endPoint.lon]).addTo(map);
    endMarker.bindPopup("Destination");

    routeMarkers.push(startMarker);
    routeMarkers.push(endMarker);

    map.fitBounds(routeLine.getBounds(), {
        padding: [40, 40]
    });
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
}

function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
    const earthRadius = 6371000;

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadius * c;
}

function toRadians(value) {
    return value * Math.PI / 180;
}

function findDangerousZonesOnRoute(route) {
    const dangerousZones = zones.filter(function(zone) {
        return zone.risk === "high" || zone.risk === "medium";
    });

    const routeCoordinates = route.geometry.coordinates;

    const touchedZones = [];

    dangerousZones.forEach(function(zone) {
        let touchesZone = false;

        for (let i = 0; i < routeCoordinates.length; i++) {
            const lon = routeCoordinates[i][0];
            const lat = routeCoordinates[i][1];

            const distance = calculateDistanceMeters(
                lat,
                lon,
                zone.coordinates[0],
                zone.coordinates[1]
            );

            if (distance <= zone.radius + 120) {
                touchesZone = true;
                break;
            }
        }

        if (touchesZone) {
            touchedZones.push(zone);
        }
    });

    return touchedZones;
}

function createDetourPoint(startPoint, endPoint, zone) {
    const centerLat = zone.coordinates[0];
    const centerLon = zone.coordinates[1];

    const offsetMeters = zone.radius + 700;

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
        lon: centerLon + (perpendicularX * offsetMeters) / metersPerDegreeLon
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

function updateRouteResult(message, type) {
    const result = document.getElementById("routeResult");
    result.innerHTML = message;

    result.className = "route-result";

    if (type) {
        result.classList.add(type);
    }
}

async function handleNormalRoute(event) {
    event.preventDefault();

    const startValue = document.getElementById("startInput").value.trim();
    const endValue = document.getElementById("endInput").value.trim();
    const travelMode = document.getElementById("travelMode").value;

    if (startValue === "" || endValue === "") {
        updateRouteResult("Veuillez remplir le point de départ et la destination.", "warning");
        return;
    }

    try {
        updateRouteResult("Calcul de l’itinéraire en cours...", "loading");

        const startPoint = await geocodeAddress(startValue);
        const endPoint = await geocodeAddress(endValue);

        lastStartPoint = startPoint;
        lastEndPoint = endPoint;

        const route = await getRoute([startPoint, endPoint]);
        drawRoute(route, startPoint, endPoint, false);

        const dangerousZones = findDangerousZonesOnRoute(route);

        const modeText = travelMode === "walk" ? "à pied" : "en transport";

        if (dangerousZones.length === 0) {
            updateRouteResult(
                "<strong>Itinéraire " + modeText + " vérifié.</strong><br>" +
                "Distance : " + formatDistance(route.distance) + "<br>" +
                "Durée estimée : " + formatDuration(route.duration) + "<br>" +
                "Aucune zone à risque importante n’a été détectée sur ce trajet.",
                "safe"
            );
        } else {
            const names = dangerousZones.map(function(zone) {
                return zone.name;
            }).join(", ");

            updateRouteResult(
                "<strong>Attention, cet itinéraire traverse des zones signalées.</strong><br>" +
                "Distance : " + formatDistance(route.distance) + "<br>" +
                "Durée estimée : " + formatDuration(route.duration) + "<br>" +
                "Zones concernées : " + names + ".<br>" +
                "Vous pouvez cliquer sur « Éviter les zones à risque » pour proposer un trajet plus prudent.",
                "warning"
            );
        }

    } catch (error) {
        updateRouteResult(error.message, "warning");
    }
}

async function handleSafeRoute() {
    const startValue = document.getElementById("startInput").value.trim();
    const endValue = document.getElementById("endInput").value.trim();
    const travelMode = document.getElementById("travelMode").value;

    if (startValue === "" || endValue === "") {
        updateRouteResult("Veuillez remplir le point de départ et la destination.", "warning");
        return;
    }

    try {
        updateRouteResult("Recherche d’un itinéraire plus sûr...", "loading");

        const startPoint = await geocodeAddress(startValue);
        const endPoint = await geocodeAddress(endValue);

        lastStartPoint = startPoint;
        lastEndPoint = endPoint;

        const firstRoute = await getRoute([startPoint, endPoint]);
        const dangerousZones = findDangerousZonesOnRoute(firstRoute);

        if (dangerousZones.length === 0) {
            drawRoute(firstRoute, startPoint, endPoint, true);

            updateRouteResult(
                "<strong>Votre itinéraire semble déjà éviter les zones principales à risque.</strong><br>" +
                "Distance : " + formatDistance(firstRoute.distance) + "<br>" +
                "Durée estimée : " + formatDuration(firstRoute.duration),
                "safe"
            );

            return;
        }

        const firstDangerousZone = dangerousZones[0];
        const detourPoint = createDetourPoint(startPoint, endPoint, firstDangerousZone);

        const safeRoute = await getRoute([startPoint, detourPoint, endPoint]);
        drawRoute(safeRoute, startPoint, endPoint, true);

        const remainingDangerousZones = findDangerousZonesOnRoute(safeRoute);
        const modeText = travelMode === "walk" ? "à pied" : "en transport";

        if (remainingDangerousZones.length === 0) {
            updateRouteResult(
                "<strong>Itinéraire plus sûr proposé " + modeText + ".</strong><br>" +
                "Distance : " + formatDistance(safeRoute.distance) + "<br>" +
                "Durée estimée : " + formatDuration(safeRoute.duration) + "<br>" +
                "Le trajet évite les principales zones signalées.",
                "safe"
            );
        } else {
            const names = remainingDangerousZones.map(function(zone) {
                return zone.name;
            }).join(", ");

            updateRouteResult(
                "<strong>Itinéraire alternatif proposé.</strong><br>" +
                "Distance : " + formatDistance(safeRoute.distance) + "<br>" +
                "Durée estimée : " + formatDuration(safeRoute.duration) + "<br>" +
                "Attention : certaines zones sensibles peuvent encore être proches du trajet : " + names + ".",
                "warning"
            );
        }

    } catch (error) {
        updateRouteResult(error.message, "warning");
    }
}

function setupRoutePlanner() {
    const routeForm = document.getElementById("routeForm");
    const safeRouteButton = document.getElementById("safeRouteButton");
    const clearRouteButton = document.getElementById("clearRouteButton");

    routeForm.addEventListener("submit", handleNormalRoute);

    safeRouteButton.addEventListener("click", handleSafeRoute);

    clearRouteButton.addEventListener("click", function() {
        clearRoute();

        document.getElementById("startInput").value = "";
        document.getElementById("endInput").value = "";

        updateRouteResult("Aucun itinéraire vérifié pour le moment.");
    });
}

function init() {
    setupFilters();
    setupMapControls();
    setupModal();
    setupOtherButtons();
    setupRoutePlanner();

    renderMapZones();
    renderZonesList();

    updatePanel(zones[5]);
}

init();