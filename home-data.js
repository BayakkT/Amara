let zones = [];
let currentRisk = "all";
let circles = [];
let streetLayers = []; 
let alertMarkers = [];
let dynamicAlerts = []; 

const map = L.map("map", {
    zoomControl: false
}).setView([48.8625, 2.35], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
}).addTo(map);

// Couleurs de la carte initiales (Rose et Vrai Violet)
const riskColors = {
    high: { border: "#d93c8a", fill: "#d93c8a" },     // Rose / Magenta
    medium: { border: "#6b21a8", fill: "#6b21a8" },   // Vrai Violet Foncé
    safe: { border: "#4f46e5", fill: "#4f46e5" }      
};

const streetRiskColors = {
    high: {
        glow: "#f472b6", 
        line: "#d93c8a"  
    },
    medium: {
        glow: "#d8b4fe", 
        line: "#6b21a8"  
    }
};

const streetGeometryById = new Map();

if (typeof streetGeometries !== "undefined") {
    streetGeometries.forEach(function(item) {
        streetGeometryById.set(item.id, item.geometry);
    });
}

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

async function fetchAlerts() {
    try {
        const response = await fetch('get_alerts.php');
        dynamicAlerts = await response.json(); 
        
        renderMapZones();
        renderZonesList();
        
        if (typeof updateStreetLegend === "function") {
            updateStreetLegend();
        }
    } catch (error) {
        console.error("Erreur de chargement des alertes :", error);
    }
}