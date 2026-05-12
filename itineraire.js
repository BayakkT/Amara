let routeLine = null;
let routeMarkers = [];

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

setupRoutePlanner();