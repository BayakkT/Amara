<?php
header('Content-Type: application/json');
require 'db.php';

$stmt = $pdo->query("SELECT * FROM alerts WHERE latitude IS NOT NULL AND longitude IS NOT NULL");
echo json_encode($stmt->fetchAll());
?>