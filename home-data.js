let zones = [];
let currentRisk = "all";
let circles = [];
let alertMarkers = [];
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

// Charger les zones polygonales/circulaires depuis PHP
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

// Charger et afficher dynamiquement les points d'alertes (BDD + PDF importé)
async function fetchAlerts() {
    try {
        const response = await fetch('get_alerts.php');
        const alerts = await response.json();
        
        // Nettoyer les anciens marqueurs présents
        alertMarkers.forEach(marker => map.removeLayer(marker));
        alertMarkers = [];

        alerts.forEach(alert => {
            if (!alert.latitude || !alert.longitude) return;

            // Création d'un point personnalisé avec ombre et bordure blanche
            const alertIcon = L.divIcon({
                className: 'custom-alert-icon',
                html: `<div style="background-color: #d93c8a; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 6px rgba(0,0,0,0.6);"></div>`,
                iconSize: [14, 14]
            });

            const marker = L.marker([parseFloat(alert.latitude), parseFloat(alert.longitude)], {icon: alertIcon}).addTo(map);
            marker.bindPopup(`<strong>📍 Signalement : ${alert.street}</strong><br>Heure : ${alert.incident_time}<br><em>${alert.description}</em>`);
            alertMarkers.push(marker);
        });
    } catch (error) {
        console.error("Erreur de chargement des alertes :", error);
    }
}