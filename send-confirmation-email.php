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
$plaqueQty = $data['plaqueQty'] ?? 0;
$password = $data['password'] ?? null;
$existingAccount = $data['existingAccount'] ?? false;

if (!$customerEmail) {
    http_response_code(400);
    echo json_encode(['error' => 'Email manquant']);
    exit();
}

// Préparer les détails de la commande
$planLabel = $planType === 'mensuel' ? 'Abonnement Mensuel' : 'Abonnement Annuel';
$plaqueLine = $plaqueQty > 0 ? "<li>$plaqueQty plaque(s) QR code personnalisée(s)</li>" : '';
$plaquePrix = $plaqueQty * 45; // 45€ par plaque

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
                <div class='credentials-box'>
                    <h2 style='margin-top: 0; color: #C7A961; font-size: 22px;'>🔑 Vos identifiants de connexion</h2>
                    <p style='margin: 15px 0;'>Votre compte a été créé avec succès. Utilisez ces identifiants pour vous connecter :</p>
                    <table style='width: 100%; margin: 20px 0;'>
                        <tr>
                            <td style='padding: 10px 0; font-weight: 600; color: #666;'>URL :</td>
                            <td style='padding: 10px 0;'><a href='https://qrguide.fr/login.html' style='color: #C7A961; text-decoration: none;'>https://qrguide.fr/login.html</a></td>
                        </tr>
                        <tr>
                            <td style='padding: 10px 0; font-weight: 600; color: #666;'>Email :</td>
                            <td style='padding: 10px 0;'><code>$customerEmail</code></td>
                        </tr>
                        <tr>
                            <td style='padding: 10px 0; font-weight: 600; color: #666;'>Mot de passe :</td>
                            <td style='padding: 10px 0;'><code>$password</code></td>
                        </tr>
                    </table>
                    <div class='alert'>
                        <strong>⚠️ Important :</strong> Conservez précieusement ces identifiants. Vous pourrez modifier votre mot de passe après votre première connexion.
                    </div>
                    <div style='text-align: center; margin-top: 25px;'>
                        <a href='https://qrguide.fr/login.html' class='btn'>Se connecter maintenant</a>
                    </div>
                </div>
        ";
        
        $credentialsText = "\n\n🔑 VOS IDENTIFIANTS DE CONNEXION:\nURL: https://qrguide.fr/login.html\nEmail: $customerEmail\nMot de passe: $password\n\n⚠️ Conservez ces identifiants précieusement.\n";
    } else if ($existingAccount) {
        $credentialsSection = "
                <div class='credentials-box' style='background: #e8f4f8;'>
                    <h2 style='margin-top: 0; color: #0c5460; font-size: 22px;'>🔑 Connexion à votre compte</h2>
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
            body { font-family: 'Inter', 'Arial', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #C7A961 0%, #E8D7A9 100%); color: white; padding: 40px 30px; text-align: center; }
            .logo { max-width: 150px; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
            .content { padding: 40px 30px; }
            .box { background: #f9f9f9; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #C7A961; }
            .box h2 { margin-top: 0; color: #C7A961; font-size: 20px; }
            .credentials-box { background: #fffdf7; border: 2px solid #C7A961; padding: 25px; border-radius: 12px; margin: 25px 0; }
            .credentials-box code { background: #fff; padding: 10px 15px; border-radius: 6px; font-size: 16px; display: inline-block; margin: 5px 0; border: 1px solid #ddd; font-family: 'Courier New', monospace; color: #C7A961; font-weight: bold; }
            .order-details { background: white; border: 1px solid #e0e0e0; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .order-details table { width: 100%; border-collapse: collapse; }
            .order-details td { padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
            .order-details td:first-child { font-weight: 600; color: #666; }
            .order-details td:last-child { text-align: right; }
            .order-details .total { font-size: 20px; font-weight: 700; color: #C7A961; border-bottom: none; padding-top: 15px; }
            .steps { background: white; padding: 25px; border-radius: 12px; margin: 25px 0; border: 1px solid #e0e0e0; }
            .steps h3 { color: #C7A961; margin-top: 0; }
            .steps ol { padding-left: 20px; }
            .steps li { margin: 12px 0; line-height: 1.8; }
            .btn { display: inline-block; background: linear-gradient(135deg, #C7A961 0%, #E8D7A9 100%); color: white; padding: 14px 35px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 15px 0; text-align: center; }
            .btn:hover { background: linear-gradient(135deg, #B89851 0%, #D8C799 100%); }
            .footer { background: #2c2c2c; color: #999; text-align: center; padding: 30px; font-size: 14px; }
            .footer a { color: #C7A961; text-decoration: none; }
            .alert { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 8px; margin: 15px 0; color: #856404; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <img src='https://qrguide.fr/img/logo_blanc.png' alt='QRGUIDE.FR' class='logo'>
                <h1>Merci pour votre commande !</h1>
            </div>
            
            <div class='content'>
                <p style='font-size: 16px;'>Bonjour <strong>$customerName</strong>,</p>
                
                <p style='font-size: 16px;'>Nous avons bien reçu votre paiement. Votre commande est confirmée et sera traitée dans les plus brefs délais.</p>
                
                <div class='order-details'>
                    <h3 style='margin-top: 0; color: #C7A961;'>📋 Détails de votre commande</h3>
                    <table>
                        <tr>
                            <td>$planLabel</td>
                            <td><strong>" . ($planType === 'mensuel' ? '79€/mois' : '790€/an') . "</strong></td>
                        </tr>
                        $plaqueLine
                        <tr class='total'>
                            <td>TOTAL</td>
                            <td>$amount€</td>
                        </tr>
                    </table>
                </div>
                
                $credentialsSection
                
                <div class='steps'>
                    <h3>📋 Prochaines étapes</h3>
                    <ol>
                        <li><strong>Sous 24h</strong> : Nous vous enverrons un formulaire pour collecter les informations de votre location (adresse, équipements, WiFi, activités locales, etc.)</li>
                        <li><strong>Sous 48h</strong> : Notre équipe créera votre guide numérique personnalisé</li>
                        <li><strong>Livraison</strong> : Vous recevrez par email votre guide digital + vos codes QR à imprimer</li>
                        <li><strong>Support continu</strong> : Modifications illimitées et assistance incluses</li>
                    </ol>
                </div>
                
                <div class='box'>
                    <h2>💡 Préparez dès maintenant</h2>
                    <p>Pour accélérer la création de votre guide, commencez à rassembler :</p>
                    <ul>
                        <li>📶 Nom du réseau WiFi et mot de passe</li>
                        <li>🏠 Liste complète des équipements disponibles</li>
                        <li>🍽️ Vos bonnes adresses (restaurants, commerces, activités)</li>
                        <li>📝 Instructions d'arrivée et de départ</li>
                        <li>📱 Numéros d'urgence et contacts utiles</li>
                    </ul>
                </div>
                
                <div style='text-align: center; margin: 30px 0;'>
                    <p style='color: #666;'>Une question ? Nous sommes là pour vous aider</p>
                    <p style='font-size: 16px;'>
                        📧 <a href='mailto:contact@qrguide.fr' style='color: #C7A961; text-decoration: none;'>contact@qrguide.fr</a><br>
                        📱 <a href='tel:0692630364' style='color: #C7A961; text-decoration: none;'>06 92 63 03 64</a>
                    </p>
                </div>
            </div>
            
            <div class='footer'>
                <p><strong>QRGUIDE.FR</strong></p>
                <p>Le guide numérique nouvelle génération pour locations saisonnières et hôtels</p>
                <p style='margin-top: 20px;'>
                    <a href='https://qrguide.fr'>Accueil</a> • 
                    <a href='https://qrguide.fr/tarifs.html'>Tarifs</a> • 
                    <a href='https://qrguide.fr/contact.html'>Contact</a>
                </p>
                <p style='margin-top: 20px; color: #666; font-size: 12px;'>
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
