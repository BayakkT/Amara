let zones = [];
let currentRisk = "all";
let circles = [];
let streetLayers = [];

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

const streetRiskColors = {
    high: {
        glow: "#8b2be2",
        line: "#6d28d9"
    },
    medium: {
        glow: "#d946ef",
        line: "#a855f7"
    }
};

const streetGeometryById = new Map();

if (typeof streetGeometries !== "undefined") {
    streetGeometries.forEach(function(item) {
        streetGeometryById.set(item.id, item.geometry);
    });
}

// Récupération des zones depuis MySQL via PHP
async function fetchZones() {
    try {
        const response = await fetch('get_zones.php');
        zones = await response.json();
        
        renderMapZones();
        renderZonesList();
    } catch (error) {
        console.error("Erreur lors de la récupération des zones :", error);
    }
}