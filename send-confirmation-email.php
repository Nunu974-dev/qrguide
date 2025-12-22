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
$password = $data['password'] ?? null;
$existingAccount = $data['existingAccount'] ?? false;

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
    
    // Préparer la section des identifiants si nouveau compte
    $credentialsSection = '';
    $credentialsText = '';
    
    if ($password && !$existingAccount) {
        $credentialsSection = "
                <div class='box' style='background: #fff3cd; border-left: 4px solid #FFD700;'>
                    <h2>🔑 Vos identifiants de connexion</h2>
                    <p><strong>URL :</strong> <a href='https://qrguide.fr/login.html'>https://qrguide.fr/login.html</a></p>
                    <p><strong>Email :</strong> $customerEmail</p>
                    <p><strong>Mot de passe :</strong> <code style='background: #f4f4f4; padding: 8px 12px; border-radius: 4px; font-size: 1.1em;'>$password</code></p>
                    <p style='margin-top: 16px; color: #856404;'>⚠️ <strong>Important :</strong> Conservez précieusement ces identifiants. Vous pourrez modifier votre mot de passe après connexion.</p>
                    <div style='text-align: center; margin-top: 20px;'>
                        <a href='https://qrguide.fr/login.html' class='btn'>Se connecter maintenant</a>
                    </div>
                </div>
        ";
        
        $credentialsText = "\n\n🔑 VOS IDENTIFIANTS DE CONNEXION:\nURL: https://qrguide.fr/login.html\nEmail: $customerEmail\nMot de passe: $password\n\n⚠️ Conservez ces identifiants précieusement.\n";
    } else if ($existingAccount) {
        $credentialsSection = "
                <div class='box' style='background: #d1ecf1; border-left: 4px solid #0c5460;'>
                    <h2>🔑 Connexion à votre compte</h2>
                    <p>Vous avez déjà un compte QRGUIDE.</p>
                    <p>Connectez-vous avec vos identifiants habituels :</p>
                    <div style='text-align: center; margin-top: 20px;'>
                        <a href='https://qrguide.fr/login.html' class='btn'>Se connecter</a>
                    </div>
                </div>
        ";
        
        $credentialsText = "\n\n🔑 CONNEXION:\nConnectez-vous avec vos identifiants habituels sur https://qrguide.fr/login.html\n";
    }
    
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
            code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
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
                
                $credentialsSection
                
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
    
    $mail->AltBody = "Bonjour $customerName,\n\nMerci pour votre commande de $amount€ pour l'abonnement $planType.$credentialsText\n\nPROCHAINES ÉTAPES:\n1. Sous 24h : Formulaire à remplir\n2. Sous 48h : Création de votre guide\n3. Livraison : Guide + QR code par email\n\nContact : contact@qrguide.fr | 06 92 63 03 64";
    
    $mail->send();
    
    echo json_encode(['success' => true, 'message' => 'Email envoyé']);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $mail->ErrorInfo]);
}
?>
