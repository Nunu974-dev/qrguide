<?php
// Fichier de test pour vérifier la configuration Stripe
header('Content-Type: application/json');

$checks = [];

// 1. Vérifier que vendor/autoload.php existe
$checks['composer'] = file_exists('vendor/autoload.php');

// 2. Vérifier que .env existe
$checks['env_file'] = file_exists('.env');

// 3. Essayer de charger Stripe
if ($checks['composer']) {
    try {
        require_once('vendor/autoload.php');
        $checks['stripe_loaded'] = class_exists('\Stripe\Stripe');
    } catch (Exception $e) {
        $checks['stripe_loaded'] = false;
        $checks['stripe_error'] = $e->getMessage();
    }
} else {
    $checks['stripe_loaded'] = false;
}

// 4. Vérifier la clé Stripe
if ($checks['env_file']) {
    $env = parse_ini_file('.env');
    $checks['stripe_key_exists'] = isset($env['STRIPE_SECRET_KEY']);
    $checks['stripe_key_format'] = isset($env['STRIPE_SECRET_KEY']) && 
        (strpos($env['STRIPE_SECRET_KEY'], 'sk_test_') === 0 || 
         strpos($env['STRIPE_SECRET_KEY'], 'sk_live_') === 0);
} else {
    $checks['stripe_key_exists'] = false;
    $checks['stripe_key_format'] = false;
}

// 5. Version PHP
$checks['php_version'] = PHP_VERSION;
$checks['php_ok'] = version_compare(PHP_VERSION, '7.1', '>=');

// Calculer le statut global
$allOk = $checks['composer'] && 
         $checks['env_file'] && 
         $checks['stripe_loaded'] && 
         $checks['stripe_key_exists'] && 
         $checks['stripe_key_format'] &&
         $checks['php_ok'];

$response = [
    'status' => $allOk ? 'OK' : 'ERROR',
    'checks' => $checks,
    'message' => $allOk ? 
        '✅ Tout est correctement configuré !' : 
        '❌ Configuration incomplète. Voir les détails ci-dessus.'
];

// Instructions si problème
if (!$allOk) {
    $response['instructions'] = [];
    
    if (!$checks['composer']) {
        $response['instructions'][] = '1. Installer Stripe PHP: composer require stripe/stripe-php';
    }
    
    if (!$checks['env_file']) {
        $response['instructions'][] = '2. Créer le fichier .env avec votre clé Stripe';
    }
    
    if (!$checks['stripe_key_exists'] || !$checks['stripe_key_format']) {
        $response['instructions'][] = '3. Ajouter STRIPE_SECRET_KEY=sk_test_... dans .env';
    }
    
    if (!$checks['php_ok']) {
        $response['instructions'][] = '4. PHP 7.1+ requis (version actuelle: ' . PHP_VERSION . ')';
    }
}

echo json_encode($response, JSON_PRETTY_PRINT);
?>
