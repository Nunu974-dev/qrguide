<?php
// Version SMTP pour Hostinger - Plus fiable que mail()
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
    exit;
}

// Import PHPMailer (si pas installé via Composer, télécharger depuis GitHub)
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Si PHPMailer n'est pas installé, utilisez ces lignes (téléchargez PHPMailer d'abord)
require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

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

try {
    $mail = new PHPMailer(true);

    // Configuration SMTP Hostinger
    $mail->isSMTP();
    $mail->Host = 'smtp.hostinger.com';  // Serveur SMTP Hostinger
    $mail->SMTPAuth = true;
    $mail->Username = 'contact@qrguide.fr';  // VOTRE ADRESSE EMAIL HOSTINGER
    $mail->Password = 'VOTRE_MOT_DE_PASSE';   // MOT DE PASSE DE L'EMAIL
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;
    $mail->CharSet = 'UTF-8';

    // Expéditeur
    $mail->setFrom('contact@qrguide.fr', 'QRGUIDE Contact');
    $mail->addReplyTo($email, $nom);

    // Destinataire
    $mail->addAddress('contact@qrguide.fr');  // Où vous recevez les messages

    // Contenu
    $mail->isHTML(true);
    $mail->Subject = '[QRGUIDE Contact] ' . $sujet;
    
    $mail->Body = "
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset='UTF-8'>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #C7A961 0%, #8B7355 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9fa; padding: 30px 20px; }
            .field { margin-bottom: 20px; padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #C7A961; }
            .label { font-weight: bold; color: #C7A961; margin-bottom: 8px; display: block; }
            .value { color: #333; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h2 style='margin: 0; color: white;'>📧 Nouveau message de contact</h2>
            </div>
            <div class='content'>
                <div class='field'>
                    <span class='label'>👤 Nom complet</span>
                    <div class='value'>{$nom}</div>
                </div>
                <div class='field'>
                    <span class='label'>📧 Email</span>
                    <div class='value'><a href='mailto:{$email}'>{$email}</a></div>
                </div>
                <div class='field'>
                    <span class='label'>📱 Téléphone</span>
                    <div class='value'>{$telephone}</div>
                </div>
                <div class='field'>
                    <span class='label'>📋 Sujet</span>
                    <div class='value'>{$sujet}</div>
                </div>
                <div class='field'>
                    <span class='label'>💬 Message</span>
                    <div class='value'>" . nl2br($message) . "</div>
                </div>
            </div>
        </div>
    </body>
    </html>
    ";

    // Version texte
    $mail->AltBody = "Nouveau message de contact QRGUIDE\n\n"
        . "Nom: {$nom}\n"
        . "Email: {$email}\n"
        . "Téléphone: {$telephone}\n"
        . "Sujet: {$sujet}\n\n"
        . "Message:\n{$message}";

    $mail->send();
    
    echo json_encode([
        'success' => true,
        'message' => 'Message envoyé avec succès !'
    ]);

} catch (Exception $e) {
    error_log("Erreur PHPMailer: " . $mail->ErrorInfo);
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erreur lors de l\'envoi. Veuillez réessayer.'
    ]);
}
?>
