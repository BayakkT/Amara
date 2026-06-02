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

    if (!foundStreet) {
        return null;
    }

    return foundStreet.geometry;
}

function renderMapZones() {
    clearMapLayers();

    if (typeof streetAlerts === "undefined") {
        console.log("streetAlerts is not loaded");
        return;
    }

    if (typeof streetGeometries === "undefined") {
        console.log("streetGeometries is not loaded");
        return;
    }

    if (typeof streetRiskColors === "undefined") {
        console.log("streetRiskColors is not loaded");
        return;
    }

    const filteredStreets = getFilteredStreets();

    filteredStreets.forEach(function(street) {
        const geometry = getStreetGeometryById(street.id);

        if (!geometry) {
            console.log("No geometry found for:", street.id, street.street);
            return;
        }

        const colors = streetRiskColors[street.risk];

        if (!colors) {
            console.log("No color found for:", street.risk);
            return;
        }

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

    if (!list) {
        return;
    }

    list.innerHTML = "";

    const filteredStreets = getFilteredStreets();

    filteredStreets.forEach(function(street) {
        const card = document.createElement("div");
        card.className = "zone-card";

        let dotClass = "medium";

        if (street.risk === "high") {
            dotClass = "high";
        }

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

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });

        list.appendChild(card);
    });
}

function updatePanelFromStreet(street) {
    const panelTitle = document.getElementById("panelTitle");
    const panelDistrict = document.getElementById("panelDistrict");
    const panelRisk = document.getElementById("panelRisk");
    const panelDescription = document.getElementById("panelDescription");
    const adviceContainer = document.getElementById("panelAdvice");

    if (!panelTitle || !panelDistrict || !panelRisk || !panelDescription || !adviceContainer) {
        return;
    }

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
    if (count <= 1) {
        return count + " rue";
    }

    return count + " rues";
}

function updateStreetLegend() {
    if (typeof streetAlerts === "undefined") {
        return;
    }

    const highCount = streetAlerts.filter(function(street) {
        return street.risk === "high";
    }).length;

    const mediumCount = streetAlerts.filter(function(street) {
        return street.risk === "medium";
    }).length;

    const highElement = document.getElementById("highStreetCount");
    const mediumElement = document.getElementById("mediumStreetCount");

    if (highElement) {
        highElement.textContent = formatStreetCount(highCount);
    }

    if (mediumElement) {
        mediumElement.textContent = formatStreetCount(mediumCount);
    }
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

    if (zoomIn) {
        zoomIn.addEventListener("click", function() {
            map.zoomIn();
        });
    }

    if (zoomOut) {
        zoomOut.addEventListener("click", function() {
            map.zoomOut();
        });
    }

    if (resetMap) {
        resetMap.addEventListener("click", function() {
            map.setView([48.8625, 2.35], 13);
        });
    }
}

function setupModal() {
    const modalOverlay = document.getElementById("modalOverlay");
    const openButton = document.getElementById("openAlertModal");
    const closeButton = document.getElementById("closeModal");
    const form = document.getElementById("alertForm");
    const toast = document.getElementById("toast");

    if (openButton && modalOverlay) {
        openButton.addEventListener("click", function() {
            modalOverlay.classList.add("active");
        });
    }

    if (closeButton && modalOverlay) {
        closeButton.addEventListener("click", function() {
            modalOverlay.classList.remove("active");
        });
    }

    if (modalOverlay) {
        modalOverlay.addEventListener("click", function(event) {
            if (event.target === modalOverlay) {
                modalOverlay.classList.remove("active");
            }
        });
    }

    if (form) {
        form.addEventListener("submit", function(event) {
            event.preventDefault();

            if (modalOverlay) {
                modalOverlay.classList.remove("active");
            }

            form.reset();

            if (toast) {
                toast.classList.add("active");

                setTimeout(function() {
                    toast.classList.remove("active");
                }, 2500);
            }
        });
    }
}

function openSidePanel() {
    const panel = document.getElementById("sidePanel");

    if (panel) {
        panel.style.display = "block";
    }
}

function setupOtherButtons() {
    const closePanel = document.getElementById("closePanel");

    if (closePanel) {
        closePanel.addEventListener("click", function() {
            const panel = document.getElementById("sidePanel");

            if (panel) {
                panel.style.display = "none";
            }
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

    renderMapZones();
    renderZonesList();

    if (typeof streetAlerts !== "undefined" && streetAlerts.length > 0) {
        updatePanelFromStreet(streetAlerts[0]);
    }
}

document.addEventListener("DOMContentLoaded", function() {
    initHome();
});