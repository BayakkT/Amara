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
    if (typeof circles !== "undefined") {
        circles.forEach(function(circle) {
            map.removeLayer(circle);
        });
        circles = [];
    }

    if (typeof streetLayers !== "undefined") {
        streetLayers.forEach(function(layer) {
            map.removeLayer(layer);
        });
        streetLayers = [];
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

    const foundStreet = streetGeometries.find(function(item) {
        return item.id === streetId;
    });

    return !foundStreet ? null : foundStreet.geometry;
}

function renderMapZones() {
    clearMapLayers();

    // 1. Affichage des Cercles (Base de données MySQL)
    const filteredZones = currentRisk === "all" ? zones : zones.filter(function(z) { return z.risk === currentRisk; });
    
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
            updatePanelFromZone(zone);
            openSidePanel();
        });

        circles.push(circle);
    });

    // 2. Affichage des Rues (Données de Tat)
    if (typeof streetAlerts === "undefined" || typeof streetGeometries === "undefined" || typeof streetRiskColors === "undefined") {
        return;
    }

    const filteredStreets = getFilteredStreets();

    filteredStreets.forEach(function(street) {
        const geometry = getStreetGeometryById(street.id);

        if (!geometry) return;

        const colors = streetRiskColors[street.risk];
        if (!colors) return;

        const glowLayer = L.polyline(geometry, {
            color: colors.glow,
            weight: 20,
            opacity: 0.25,
            lineCap: "round",
            lineJoin: "round",
            interactive: false
        }).addTo(map);

        const lineLayer = L.polyline(geometry, {
            color: colors.line,
            weight: 7,
            opacity: 0.9,
            lineCap: "round",
            lineJoin: "round"
        }).addTo(map);

        lineLayer.bindPopup(createStreetPopup(street));

        streetLayers.push(glowLayer);
        streetLayers.push(lineLayer);
    });
}

function renderZonesList() {
    const list = document.getElementById("zonesList");
    if (!list) return;

    list.innerHTML = "";

    // Afficher la liste des cercles (MySQL)
    const filteredZones = currentRisk === "all" ? zones : zones.filter(function(z) { return z.risk === currentRisk; });
    
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
            <span class="card-risk ${zone.risk}">${zone.riskLabel}</span>
        `;

        card.addEventListener("click", function() {
            updatePanelFromZone(zone);
            openSidePanel();
            map.setView(zone.coordinates, 14);
            window.scrollTo({ top: 0, behavior: "smooth" });
        });

        list.appendChild(card);
    });

    // Afficher la liste des rues (Tat)
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
            <span class="card-risk ${street.risk}">
                ${street.riskLabel}
            </span>
        `;

        card.addEventListener("click", function() {
            updatePanelFromStreet(street);
            openSidePanel();

            const geometry = getStreetGeometryById(street.id);
            if (geometry && geometry.length > 0) {
                map.setView(geometry[0], 15);
            }

            window.scrollTo({ top: 0, behavior: "smooth" });
        });

        list.appendChild(card);
    });
}

// Fonction pour mettre à jour le panneau latéral pour une zone circulaire (MySQL)
function updatePanelFromZone(zone) {
    const panelTitle = document.getElementById("panelTitle");
    const panelDistrict = document.getElementById("panelDistrict");
    const panelRisk = document.getElementById("panelRisk");
    const panelDescription = document.getElementById("panelDescription");
    const adviceContainer = document.getElementById("panelAdvice");

    if (!panelTitle) return;

    panelTitle.textContent = zone.name;
    panelDistrict.textContent = zone.district;
    panelRisk.textContent = zone.riskLabel;
    panelDescription.textContent = zone.description;
    
    adviceContainer.innerHTML = "";
    if(zone.advice && Array.isArray(zone.advice)) {
        zone.advice.forEach(function(item) {
            const paragraph = document.createElement("p");
            paragraph.textContent = "◆ " + item;
            adviceContainer.appendChild(paragraph);
        });
    }
}

function updatePanelFromStreet(street) {
    const panelTitle = document.getElementById("panelTitle");
    const panelDistrict = document.getElementById("panelDistrict");
    const panelRisk = document.getElementById("panelRisk");
    const panelDescription = document.getElementById("panelDescription");
    const adviceContainer = document.getElementById("panelAdvice");

    if (!panelTitle) return;

    panelTitle.textContent = street.street;
    panelDistrict.textContent = street.commune + " · " + street.dept;
    panelRisk.textContent = street.riskLabel;

    let description = "Rue signalée sur la carte Amara.";
    if (street.articles && street.articles.length > 0) {
        description = street.articles[0].summary;
    }
    panelDescription.textContent = description;

    adviceContainer.innerHTML = "";
    const advice = [
        "Restez sur les axes principaux et bien éclairés.",
        "Évitez de rester seule longtemps dans cette rue, surtout tard le soir.",
        "Prévenez une personne de confiance si vous devez passer par ici."
    ];

    advice.forEach(function(item) {
        const paragraph = document.createElement("p");
        paragraph.textContent = "◆ " + item;
        adviceContainer.appendChild(paragraph);
    });
}

function formatStreetCount(count) {
    if (count <= 1) return count + " rue";
    return count + " rues";
}

function updateStreetLegend() {
    if (typeof streetAlerts === "undefined") return;

    const highCount = streetAlerts.filter(function(street) { return street.risk === "high"; }).length;
    const mediumCount = streetAlerts.filter(function(street) { return street.risk === "medium"; }).length;

    const highElement = document.getElementById("highStreetCount");
    const mediumElement = document.getElementById("mediumStreetCount");

    if (highElement) highElement.textContent = formatStreetCount(highCount);
    if (mediumElement) mediumElement.textContent = formatStreetCount(mediumCount);
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
    const zoomIn = document.getElementById("zoomIn");
    const zoomOut = document.getElementById("zoomOut");
    const resetMap = document.getElementById("resetMap");

    if (zoomIn) zoomIn.addEventListener("click", function() { map.zoomIn(); });
    if (zoomOut) zoomOut.addEventListener("click", function() { map.zoomOut(); });
    if (resetMap) resetMap.addEventListener("click", function() { map.setView([48.8625, 2.35], 13); });
}

function setupModal() {
    const modalOverlay = document.getElementById("modalOverlay");
    const openButton = document.getElementById("openAlertModal");
    const closeButton = document.getElementById("closeModal");
    const form = document.getElementById("alertForm");
    const toast = document.getElementById("toast");

    if (openButton && modalOverlay) {
        openButton.addEventListener("click", function() { modalOverlay.classList.add("active"); });
    }

    if (closeButton && modalOverlay) {
        closeButton.addEventListener("click", function() { modalOverlay.classList.remove("active"); });
    }

    if (modalOverlay) {
        modalOverlay.addEventListener("click", function(event) {
            if (event.target === modalOverlay) {
                modalOverlay.classList.remove("active");
            }
        });
    }

    // Gestion de l'ajout d'alerte en PHP
    if (form) {
        form.addEventListener("submit", async function(event) {
            event.preventDefault();

            const alertData = {
                street: document.getElementById("street").value,
                time: document.getElementById("time").value,
                riskLevel: document.getElementById("riskLevel").value,
                message: document.getElementById("message").value
            };

            try {
                const response = await fetch('add_alert.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(alertData)
                });

                const result = await response.json();

                if (result.success) {
                    if (modalOverlay) modalOverlay.classList.remove("active");
                    form.reset();

                    if (toast) {
                        toast.textContent = result.message; 
                        toast.classList.add("active");
                        setTimeout(function() { toast.classList.remove("active"); }, 2500);
                    }
                } else {
                    alert(result.message);
                }
            } catch (error) {
                console.error("Erreur lors de l'envoi de l'alerte :", error);
                alert("Une erreur s'est produite lors de l'envoi de l'alerte.");
            }
        });
    }
}

function openSidePanel() {
    const panel = document.getElementById("sidePanel");
    if (panel) panel.style.display = "block";
}

function setupOtherButtons() {
    const closePanel = document.getElementById("closePanel");
    if (closePanel) {
        closePanel.addEventListener("click", function() {
            const panel = document.getElementById("sidePanel");
            if (panel) panel.style.display = "none";
        });
    }

    const showAllButton = document.getElementById("showAllZones");
    if (showAllButton) {
        showAllButton.addEventListener("click", function() {
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
}

function initHome() {
    updateStreetLegend();
    setupFilters();
    setupMapControls();
    setupModal();
    setupOtherButtons();

    // Lancer la récupération des données de la BDD et le rendu
    fetchZones();

    // Afficher les données statiques (rues) de Tat en attendant la BDD
    renderMapZones();
    renderZonesList();

    if (typeof streetAlerts !== "undefined" && streetAlerts.length > 0) {
        updatePanelFromStreet(streetAlerts[0]);
    }
}

document.addEventListener("DOMContentLoaded", function() {
    initHome();
});