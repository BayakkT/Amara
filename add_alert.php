<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');
require 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['street'], $data['time'], $data['riskLevel'], $data['message'])) {
    $sql = "INSERT INTO alerts (street, incident_time, risk_level, description) VALUES (?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    
    try {
        $stmt->execute([
            $data['street'],
            $data['time'],
            $data['riskLevel'],
            $data['message']
        ]);
        echo json_encode(["success" => true, "message" => "Alerte ajoutée avec succès."]);
    } catch (Exception $e) {
        // On affiche l'erreur exacte venant de la base de données
        echo json_encode(["success" => false, "message" => "Erreur SQL : " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Données incomplètes."]);
}
?>