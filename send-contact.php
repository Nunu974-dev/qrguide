<?php
// Configuration stricte des erreurs pour debug
error_reporting(E_ALL);
ini_set('display_errors', 0); // Ne pas afficher les erreurs au client
ini_set('log_errors', 1);

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

// Configuration email - MODIFIER CETTE ADRESSE
$destinataire = 'contact@qrguide.fr'; // Remplacez par votre vraie adresse email Hostinger
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
        .header { background: linear-gradient(135deg, #C7A961 0%, #8B7355 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 8px 8px; }
        .field { margin-bottom: 15px; padding: 12px; background: white; border-radius: 6px; }
        .label { font-weight: bold; color: #C7A961; margin-bottom: 5px; }
        .value { margin-top: 5px; color: #333; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h2 style='margin: 0; color: white;'>📧 Nouveau message de contact</h2>
        </div>
        <div class='content'>
            <div class='field'>
                <div class='label'>👤 Nom :</div>
                <div class='value'>{$nom}</div>
            </div>
            <div class='field'>
                <div class='label'>📧 Email :</div>
                <div class='value'><a href='mailto:{$email}'>{$email}</a></div>
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

// Message texte alternatif
$message_text = "Nouveau message de contact QRGUIDE\n\n";
$message_text .= "Nom: {$nom}\n";
$message_text .= "Email: {$email}\n";
$message_text .= "Téléphone: {$telephone}\n";
$message_text .= "Sujet: {$sujet}\n\n";
$message_text .= "Message:\n{$message}";

// Headers pour l'email avec boundary pour multipart
$boundary = md5(time());
$headers = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: multipart/alternative; boundary=\"{$boundary}\"\r\n";
$headers .= "From: QRGUIDE.FR <noreply@qrguide.fr>\r\n";
$headers .= "Reply-To: {$email}\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";

// Corps du message multipart
$body = "--{$boundary}\r\n";
$body .= "Content-Type: text/plain; charset=UTF-8\r\n";
$body .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
$body .= $message_text . "\r\n";
$body .= "--{$boundary}\r\n";
$body .= "Content-Type: text/html; charset=UTF-8\r\n";
$body .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
$body .= $message_html . "\r\n";
$body .= "--{$boundary}--";

// Envoyer l'email
try {
    $mail_sent = mail($destinataire, $sujet_email, $body, $headers);
    
    if ($mail_sent) {
        // Log succès (optionnel)
        error_log("Email envoyé avec succès à {$destinataire} depuis {$email}");
        
        echo json_encode([
            'success' => true,
            'message' => 'Message envoyé avec succès !'
        ]);
    } else {
        // Log erreur
        error_log("Échec envoi email à {$destinataire} depuis {$email}");
        
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Erreur serveur lors de l\'envoi. Veuillez réessayer.'
        ]);
    }
} catch (Exception $e) {
    error_log("Exception lors de l'envoi d'email: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erreur lors de l\'envoi du message.'
    ]);
}
?>
