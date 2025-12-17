<?php
// Activer CORS pour les requêtes AJAX
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Gérer les requêtes OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Vérifier que c'est une requête POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Charger Stripe PHP (via Composer ou installation manuelle)
require_once('vendor/autoload.php');

// Configuration Stripe
// IMPORTANT: Remplacez par votre clé secrète Stripe
$stripeSecretKey = 'sk_test_VOTRE_CLE_SECRETE_ICI';
\Stripe\Stripe::setApiKey($stripeSecretKey);

try {
    // Récupérer les données envoyées
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    // Valider les données
    if (!isset($data['amount']) || !isset($data['currency'])) {
        throw new Exception('Montant ou devise manquant');
    }

    $amount = (int)$data['amount']; // Montant en centimes (ex: 15800 pour 158€)
    $currency = $data['currency']; // Ex: 'eur'
    $customerEmail = $data['email'] ?? '';
    $customerName = $data['name'] ?? '';
    $planType = $data['planType'] ?? 'mensuel';
    $description = $data['description'] ?? 'Abonnement QRGUIDE';

    // Créer la session de paiement Stripe
    $session = \Stripe\Checkout\Session::create([
        'payment_method_types' => ['card'],
        'line_items' => [[
            'price_data' => [
                'currency' => $currency,
                'product_data' => [
                    'name' => 'QRGUIDE - ' . ucfirst($planType),
                    'description' => $description,
                ],
                'unit_amount' => $amount,
            ],
            'quantity' => 1,
        ]],
        'mode' => 'payment',
        'success_url' => $data['success_url'] ?? 'https://qrguide.fr/success.html?session_id={CHECKOUT_SESSION_ID}',
        'cancel_url' => $data['cancel_url'] ?? 'https://qrguide.fr/abonnement.html',
        'customer_email' => $customerEmail,
        'client_reference_id' => $customerName,
        'billing_address_collection' => 'required',
        'metadata' => [
            'plan_type' => $planType,
            'customer_name' => $customerName,
        ]
    ]);

    // Retourner l'ID de session
    echo json_encode([
        'sessionId' => $session->id,
        'url' => $session->url
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
