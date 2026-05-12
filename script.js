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