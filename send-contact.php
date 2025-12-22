<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
    exit;
}

// Récupérer les données du formulaire
$data = json_decode(file_get_contents('php://input'), true);

$nom = isset($data['nom']) ? htmlspecialchars($data['nom']) : '';
$email = isset($data['email']) ? filter_var($data['email'], FILTER_SANITIZE_EMAIL) : '';
$telephone = isset($data['telephone']) ? htmlspecialchars($data['telephone']) : 'Non renseigné';
$sujet = isset($data['sujet']) ? htmlspecialchars($data['sujet']) : '';
$message = isset($data['message']) ? htmlspecialchars($data['message']) : '';

// Validation
if (empty($nom) || empty($email) || empty($sujet) || empty($message)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Tous les champs obligatoires doivent être remplis']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email invalide']);
    exit;
}

// Configuration email
$destinataire = 'contact@qrguide.fr'; // Votre email Hostinger
$sujet_email = '[QRGUIDE Contact] ' . $sujet;

// Créer le message HTML
$message_html = "
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #C7A961 0%, #8B7355 100%); color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #C7A961; }
        .value { margin-top: 5px; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h2>📧 Nouveau message de contact</h2>
        </div>
        <div class='content'>
            <div class='field'>
                <div class='label'>👤 Nom :</div>
                <div class='value'>{$nom}</div>
            </div>
            <div class='field'>
                <div class='label'>📧 Email :</div>
                <div class='value'>{$email}</div>
            </div>
            <div class='field'>
                <div class='label'>📱 Téléphone :</div>
                <div class='value'>{$telephone}</div>
            </div>
            <div class='field'>
                <div class='label'>📋 Sujet :</div>
                <div class='value'>{$sujet}</div>
            </div>
            <div class='field'>
                <div class='label'>💬 Message :</div>
                <div class='value'>" . nl2br($message) . "</div>
            </div>
        </div>
    </div>
</body>
</html>
";

// Headers pour l'email HTML
$headers = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";
$headers .= "From: QRGUIDE Contact <noreply@qrguide.fr>\r\n";
$headers .= "Reply-To: {$email}\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

// Envoyer l'email
if (mail($destinataire, $sujet_email, $message_html, $headers)) {
    echo json_encode([
        'success' => true,
        'message' => 'Message envoyé avec succès !'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erreur lors de l\'envoi du message. Veuillez réessayer.'
    ]);
}
?>
