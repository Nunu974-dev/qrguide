<?php
// Health check endpoint pour warm-up
// Utilisé pour réveiller le serveur avant les vraies requêtes
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

echo json_encode([
    'status' => 'ok',
    'timestamp' => time(),
    'message' => 'Backend is ready'
]);
?>
