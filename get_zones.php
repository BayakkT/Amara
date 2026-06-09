<?php
header('Content-Type: application/json');
require 'db.php';

$stmt = $pdo->query("SELECT * FROM zones");
$zones = $stmt->fetchAll();

$formattedZones = [];
$riskLabels = [
    'high' => 'Risque élevé',
    'medium' => 'À surveiller',
    'safe' => 'Globalement sûr'
];

foreach ($zones as $zone) {
    $formattedZones[] = [
        'id' => $zone['id'],
        'name' => $zone['name'],
        'district' => $zone['district'],
        'risk' => $zone['risk'],
        'riskLabel' => $riskLabels[$zone['risk']],
        'coordinates' => [(float)$zone['latitude'], (float)$zone['longitude']],
        'radius' => (int)$zone['radius'],
        'description' => $zone['description'],
        'advice' => json_decode($zone['advice'])
    ];
}

echo json_encode($formattedZones);
?>