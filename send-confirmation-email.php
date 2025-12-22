<?php
// Script simple pour envoyer l'email de confirmation depuis success.html
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Charger la configuration email
$config = require 'email-config.php';

// Récupérer les données
$json = file_get_contents('php://input');
$data = json_decode($json, true);

$customerEmail = $data['email'] ?? '';
$customerName = $data['name'] ?? 'Client';
$amount = $data['amount'] ?? 0;
$planType = $data['planType'] ?? 'mensuel';

if (!$customerEmail) {
    http_response_code(400);
    echo json_encode(['error' => 'Email manquant']);
    exit();
}

try {
    $mail = new PHPMailer(true);
    
    // Configuration SMTP
    $mail->isSMTP();
    $mail->Host = $config['smtp_host'];
    $mail->SMTPAuth = true;
    $mail->Username = $config['smtp_user'];
    $mail->Password = $config['smtp_pass'];
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = $config['smtp_port'];
    $mail->CharSet = 'UTF-8';
    
    // Expéditeur et destinataire
    $mail->setFrom($config['from_email'], 'QRGUIDE.FR');
    $mail->addAddress($customerEmail, $customerName);
    $mail->addBCC($config['to_email']); // Copie admin
    
    // Contenu
    $mail->isHTML(true);
    $mail->Subject = '🎉 Confirmation de votre commande QRGUIDE';
    
    $mail->Body = "
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset='UTF-8'>
        <style>
            body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; }
            .box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .steps { background: #fff; padding: 20px; border-left: 4px solid #FFD700; margin: 20px 0; }
            .steps ol { padding-left: 20px; }
            .steps li { margin: 10px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 0.9em; }
            .btn { display: inline-block; background: #FFD700; color: #333; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>🎉 Merci pour votre commande !</h1>
            </div>
            
            <div class='content'>
                <p>Bonjour <strong>$customerName</strong>,</p>
                
                <p>Nous avons bien reçu votre paiement de <strong>$amount€</strong> pour votre abonnement <strong>$planType</strong>.</p>
                
                <div class='box'>
                    <h2>✅ Paiement confirmé</h2>
                    <p>Votre commande a été validée avec succès.</p>
                </div>
                
                <div class='steps'>
                    <h3>📋 Prochaines étapes :</h3>
                    <ol>
                        <li><strong>Sous 24h</strong> : Nous vous enverrons un formulaire à remplir avec les informations de votre location (adresse, équipements, wifi, etc.)</li>
                        <li><strong>Sous 48h</strong> : Notre équipe créera votre guide personnalisé</li>
                        <li><strong>Livraison</strong> : Vous recevrez votre guide digital + le QR code par email</li>
                        <li><strong>Support</strong> : Nous restons disponibles pour toute modification ou question</li>
                    </ol>
                </div>
                
                <div class='box'>
                    <h3>💡 Conseil</h3>
                    <p>En attendant, préparez les informations suivantes :</p>
                    <ul>
                        <li>Code WiFi et nom du réseau</li>
                        <li>Liste des équipements disponibles</li>
                        <li>Vos bonnes adresses à partager</li>
                        <li>Instructions d'arrivée et de départ</li>
                    </ul>
                </div>
                
                <div style='text-align: center;'>
                    <a href='https://qrguide.fr/contact.html' class='btn'>Nous contacter</a>
                </div>
            </div>
            
            <div class='footer'>
                <p><strong>Besoin d'aide ?</strong></p>
                <p>📧 contact@qrguide.fr | 📱 06 92 63 03 64</p>
                <p style='margin-top: 20px; color: #999; font-size: 0.85em;'>
                    © 2025 QRGUIDE.FR - Tous droits réservés
                </p>
            </div>
        </div>
    </body>
    </html>
    ";
    
    $mail->AltBody = "Bonjour $customerName,\n\nMerci pour votre commande de $amount€ pour l'abonnement $planType.\n\nPROCHAINES ÉTAPES:\n1. Sous 24h : Formulaire à remplir\n2. Sous 48h : Création de votre guide\n3. Livraison : Guide + QR code par email\n\nContact : contact@qrguide.fr | 06 92 63 03 64";
    
    $mail->send();
    
    echo json_encode(['success' => true, 'message' => 'Email envoyé']);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $mail->ErrorInfo]);
}
?>
