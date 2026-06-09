<?php
header('Content-Type: application/json');
require 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['street'], $data['time'], $data['riskLevel'], $data['message'])) {
    $lat = isset($data['latitude']) ? $data['latitude'] : null;
    $lon = isset($data['longitude']) ? $data['longitude'] : null;

    $sql = "INSERT INTO alerts (street, incident_time, risk_level, description, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    
    try {
        $stmt->execute([$data['street'], $data['time'], $data['riskLevel'], $data['message'], $lat, $lon]);
        echo json_encode(["success" => true, "message" => "Alerte ajoutée avec succès."]);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => "Erreur : " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Données incomplètes."]);
}
?>