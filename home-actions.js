function getFilteredZones() {
    if (currentRisk === "all") {
        return zones;
    }

    return zones.filter(function(zone) {
        return zone.risk === currentRisk;
    });
}

function getFilteredStreets() {
    if (typeof streetAlerts === "undefined") {
        return [];
    }

    if (currentRisk === "all") {
        return streetAlerts;
    }

    if (currentRisk === "high") {
        return streetAlerts.filter(function(street) {
            return street.risk === "high";
        });
    }

    if (currentRisk === "medium") {
        return streetAlerts.filter(function(street) {
            return street.risk === "medium";
        });
    }

    if (currentRisk === "safe") {
        return [];
    }

    return streetAlerts;
}

function clearMapLayers() {
    circles.forEach(function(circle) {
        map.removeLayer(circle);
    });

    streetLayers.forEach(function(layer) {
        map.removeLayer(layer);
    });

    circles = [];
    streetLayers = [];
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

let renderMapToken = 0;
const streetGeometryCache = {};

function getStaticStreetGeometry(street) {
    if (typeof streetGeometries === "undefined") {
        return null;
    }

    const match = streetGeometries.find(function(item) {
        return item.id === street.id;
    });

    if (!match) {
        return null;
    }

    return match.geometry;
}

function convertOsmGeometryToLeaflet(geojson) {
    if (!geojson) {
        return null;
    }

    if (geojson.type === "LineString") {
        return geojson.coordinates.map(function(coord) {
            return [coord[1], coord[0]];
        });
    }

    if (geojson.type === "MultiLineString") {
        return geojson.coordinates.map(function(line) {
            return line.map(function(coord) {
                return [coord[1], coord[0]];
            });
        });
    }

    return null;
}

async function fetchStreetGeometryFromOsm(street) {
    const query = street.street + ", " + street.commune + ", France";
    const url =
        "https://nominatim.openstreetmap.org/search" +
        "?format=json" +
        "&limit=5" +
        "&polygon_geojson=1" +
        "&q=" + encodeURIComponent(query);

    const response = await fetch(url);
    const results = await response.json();

    for (let i = 0; i < results.length; i++) {
        const geometry = convertOsmGeometryToLeaflet(results[i].geojson);

        if (geometry) {
            return geometry;
        }
    }

    return null;
}

async function getStreetGeometry(street) {
    if (streetGeometryCache[street.id]) {
        return streetGeometryCache[street.id];
    }

    try {
        const osmGeometry = await fetchStreetGeometryFromOsm(street);

        if (osmGeometry) {
            streetGeometryCache[street.id] = osmGeometry;
            return osmGeometry;
        }
    } catch (error) {
        console.log("OSM geometry not found for:", street.street, error);
    }

    const staticGeometry = getStaticStreetGeometry(street);
    streetGeometryCache[street.id] = staticGeometry;

    return staticGeometry;
}

function updateLegendCounts() {
    if (typeof streetAlerts === "undefined") {
        return;
    }

    const highCount = streetAlerts.filter(function(street) {
        return street.risk === "high";
    }).length;

    const mediumCount = streetAlerts.filter(function(street) {
        return street.risk === "medium";
    }).length;

    const highElement = document.getElementById("legendHighCount");
    const mediumElement = document.getElementById("legendMediumCount");

    if (highElement) {
        highElement.textContent = highCount + " rues";
    }

    if (mediumElement) {
        mediumElement.textContent = mediumCount + " rues";
    }
}

async function renderMapZones() {
    const currentToken = ++renderMapToken;
    clearMapLayers();
    updateLegendCounts();

    if (typeof streetAlerts === "undefined") {
        console.log("streetAlerts is not loaded");
        return;
    }

    const filteredStreets = getFilteredStreets();

    console.log("Number of streets to draw:", filteredStreets.length);

    for (let i = 0; i < filteredStreets.length; i++) {
        const street = filteredStreets[i];
        const geometry = await getStreetGeometry(street);

        if (currentToken !== renderMapToken) {
            return;
        }

        if (!geometry) {
            console.log("No geometry found for:", street.id, street.street);
            continue;
        }

        const colors = streetRiskColors[street.risk];

        if (!colors) {
            console.log("No color found for:", street.risk);
            continue;
        }

        const glowLayer = L.polyline(geometry, {
            color: colors.glow,
            weight: 18,
            opacity: 0.22,
            lineCap: "round",
            lineJoin: "round",
            interactive: false
        }).addTo(map);

        const lineLayer = L.polyline(geometry, {
            color: colors.line,
            weight: 6,
            opacity: 0.9,
            lineCap: "round",
            lineJoin: "round"
        }).addTo(map);

        lineLayer.bindPopup(createStreetPopup(street));

        streetLayers.push(glowLayer);
        streetLayers.push(lineLayer);
    }
}

function renderZonesList() {
    const list = document.getElementById("zonesList");
    list.innerHTML = "";

    const filteredZones = getFilteredZones();

    filteredZones.forEach(function(zone) {
        const card = document.createElement("div");
        card.className = "zone-card";

        card.innerHTML = `
            <h4>${zone.name}</h4>
            <p>${zone.district}</p>
            <span>${zone.riskLabel}</span>
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

function initHome() {
    setupFilters();
    setupMapControls();
    setupModal();
    setupOtherButtons();

    renderMapZones();
    renderZonesList();

    updatePanel(zones[5]);
}

initHome();