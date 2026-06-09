<?php
// Forcer l'affichage des erreurs
ini_set('display_errors', 1);
error_reporting(E_ALL);
ini_set('max_execution_time', 300);

// Forcer l'affichage en temps réel dans le navigateur
@ob_end_flush();

require 'db.php';

$pdf_data = [
    ["loc" => "Rue de Buenos Aires, Paris 7e", "desc" => "Féminicide possible / mort suspecte"],
    ["loc" => "Rue de l'Egalite, Les Lilas", "desc" => "Féminicide par partenaire"],
    ["loc" => "Avenue Jean-Baptiste-Clement, Villetaneuse", "desc" => "Féminicide / meurtre du conjoint"],
    ["loc" => "Vigneux-sur-Seine", "desc" => "Graves violences conjugales / brûlures"],
    ["loc" => "Passage des Tourelles, Paris 20e", "desc" => "Féminicide par le mari"],
    ["loc" => "Avenue Jean-Jaures, Villetaneuse", "desc" => "Tentative de féminicide / fusillade"],
    ["loc" => "Chevilly-Larue", "desc" => "Féminicide par le mari"],
    ["loc" => "Rue Jules-Ferry, Choisy-le-Roi", "desc" => "Féminicide / coups de couteau"],
    ["loc" => "Fleury-Merogis", "desc" => "Tentative de féminicide dans la rue"],
    ["loc" => "Rue de Belleville, Paris 19e", "desc" => "Tentative de féminicide / coups de couteau"],
    ["loc" => "Bretigny-sur-Orge", "desc" => "Féminicide par partenaire"],
    ["loc" => "Viarmes", "desc" => "Féminicide-suicide / fusillade"],
    ["loc" => "Louveciennes", "desc" => "Féminicide par ex-partenaire"],
    ["loc" => "Limeil-Brevannes", "desc" => "Féminicide par le mari"],
    ["loc" => "Avenue Jean-Baptiste-Clement, Bobigny", "desc" => "Féminicide / coups de couteau"],
    ["loc" => "Montfermeil", "desc" => "Féminicide par partenaire"],
    ["loc" => "Rue de Torcy, Paris 18e", "desc" => "Féminicide-suicide suspecté"],
    ["loc" => "Rue Maurice-Braunstein, Mantes-la-Jolie", "desc" => "Féminicide par ex-partenaire"],
    ["loc" => "Noisy-le-Sec", "desc" => "Féminicide par partenaire"],
    ["loc" => "Rue de Montfort, Coignieres", "desc" => "Féminicide par partenaire"],
    ["loc" => "Maisons-Alfort", "desc" => "Féminicide par ex-partenaire / coups de couteau"],
    ["loc" => "Rue David-d'Angers, Paris 19e", "desc" => "Féminicide par partenaire (policier)"],
    ["loc" => "Rue du Moutier, Aubervilliers", "desc" => "Féminicide par partenaire"],
    ["loc" => "Rue Dulong, Paris 17e", "desc" => "Féminicide-suicide suspecté"],
    ["loc" => "38 Rue Albert-Thomas, Champigny-sur-Marne", "desc" => "Féminicide par le mari"],
    ["loc" => "Rue Albert-Thuret, Chevilly-Larue", "desc" => "Féminicide par le mari"],
    ["loc" => "Rue Pouchet, Paris 17e", "desc" => "Femme tuée à l'arme blanche"],
    ["loc" => "Ecquevilly", "desc" => "Féminicide par ex-petit ami"],
    ["loc" => "Rue de Montval, Marly-le-Roi", "desc" => "Féminicide par ex-partenaire"],
    ["loc" => "Avenue Jean-Baptiste-Clement, Villetaneuse", "desc" => "Tentative de féminicide sur femme enceinte"],
    ["loc" => "Rue du Tour-du-Parc, Bouqueval", "desc" => "Féminicide par partenaire"],
    ["loc" => "Rue des Campanules, Gargenville", "desc" => "Féminicide par le mari / coups"],
    ["loc" => "Avenue Salvador-Allende, Montreuil", "desc" => "Féminicide par le mari / défenestration"],
    ["loc" => "Rue du Square-Delambre, Paris 14e", "desc" => "Féminicide par partenaire / coups"],
    ["loc" => "Rue Gabriel-Peri, Le Kremlin-Bicetre", "desc" => "Tentative de féminicide"],
    ["loc" => "Rue Jean-Louis, Gentilly", "desc" => "Féminicide par ex-partenaire / barre de fer"]
];

echo "Début de l'importation... Veuillez patienter environ 40 secondes.<br><br>";
flush(); // Pousse le texte vers le navigateur

foreach($pdf_data as $item) {
    $url = "https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" . urlencode($item['loc'] . ", Ile-de-France, France");
    
    // Ajout d'une sécurité pour SSL si le serveur d'entreprise bloque la vérification du certificat
    $opts = [
        "http" => [
            "header" => "User-Agent: AmaraApp/1.0\r\n"
        ],
        "ssl" => [
            "verify_peer" => false,
            "verify_peer_name" => false,
        ],
    ];
    
    $context = stream_context_create($opts);
    $response = @file_get_contents($url, false, $context);
    
    if ($response === false) {
        echo "<span style='color:red;'>Erreur de connexion (géocodage) pour : " . $item['loc'] . "</span><br>";
        flush();
        continue;
    }

    $data = json_decode($response, true);
    
    $lat = isset($data[0]) ? $data[0]['lat'] : null;
    $lon = isset($data[0]) ? $data[0]['lon'] : null;
    
    try {
        $stmt = $pdo->prepare("INSERT INTO alerts (street, incident_time, risk_level, description, latitude, longitude) VALUES (?, '00:00', 'high', ?, ?, ?)");
        $stmt->execute([$item['loc'], $item['desc'], $lat, $lon]);
        echo "✅ Inséré : " . $item['loc'] . "<br>";
    } catch (Exception $e) {
        echo "❌ Erreur SQL pour " . $item['loc'] . " : " . $e->getMessage() . "<br>";
    }
    
    flush();
    sleep(1); 
}

echo "<br><strong>Importation des données du PDF terminée !</strong>";
?>