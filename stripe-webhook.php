<?php
// Webhook Stripe pour envoyer un email après paiement réussi
require_once('vendor/autoload.php');
require 'vendor/phpmailer/phpmailer/src/Exception.php';
require 'vendor/phpmailer/phpmailer/src/PHPMailer.php';
require 'vendor/phpmailer/phpmailer/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Charger la configuration email
$config = require 'email-config.php';

// Charger les variables d'environnement Stripe
if (file_exists('.env')) {
    $env = parse_ini_file('.env');
    $stripeSecretKey = $env['STRIPE_SECRET_KEY'];
    $webhookSecret = $env['STRIPE_WEBHOOK_SECRET'] ?? '';
} else {
    $stripeSecretKey = getenv('STRIPE_SECRET_KEY');
    $webhookSecret = getenv('STRIPE_WEBHOOK_SECRET') ?? '';
}

\Stripe\Stripe::setApiKey($stripeSecretKey);

// Récupérer le corps de la requête
$payload = @file_get_contents('php://input');
$sig_header = $_SERVER['HTTP_STRIPE_SIGNATURE'] ?? '';
$event = null;

// Logger pour debug
$logFile = 'webhook-log.txt';

try {
    // Vérifier la signature du webhook si le secret est configuré
    if ($webhookSecret) {
        $event = \Stripe\Webhook::constructEvent($payload, $sig_header, $webhookSecret);
    } else {
        // Mode développement : accepter sans vérification
        $event = json_decode($payload, false);
    }
    
    file_put_contents($logFile, date('Y-m-d H:i:s') . " - Event type: " . $event->type . "\n", FILE_APPEND);
    
    // Gérer l'événement de paiement réussi
    if ($event->type === 'checkout.session.completed') {
        $session = $event->data->object;
        
        // Récupérer les informations du client
        $customerEmail = $session->customer_details->email ?? $session->customer_email;
        $customerName = $session->customer_details->name ?? $session->client_reference_id;
        $amount = $session->amount_total / 100; // Convertir centimes en euros
        $planType = $session->metadata->plan_type ?? 'mensuel';
        
        file_put_contents($logFile, "Email: $customerEmail, Name: $customerName, Amount: $amount€\n", FILE_APPEND);
        
        // Préparer l'email
        $mail = new PHPMailer(true);
        
        try {
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
            
            // Copie pour l'admin
            $mail->addBCC($config['to_email']);
            
            // Contenu de l'email
            $mail->isHTML(true);
            $mail->Subject = '🎉 Confirmation de votre commande QRGUIDE';
            
            // Corps HTML de l'email
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
            
            // Version texte alternative
            $mail->AltBody = "
Bonjour $customerName,

Merci pour votre commande !

Nous avons bien reçu votre paiement de $amount€ pour votre abonnement $planType.

PROCHAINES ÉTAPES :
1. Sous 24h : Nous vous enverrons un formulaire à remplir
2. Sous 48h : Création de votre guide personnalisé
3. Livraison : Réception de votre guide + QR code par email
4. Support : Nous restons disponibles pour toute question

Besoin d'aide ?
📧 contact@qrguide.fr
📱 06 92 63 03 64

À très bientôt,
L'équipe QRGUIDE.FR
            ";
            
            // Envoyer l'email
            $mail->send();
            
            file_put_contents($logFile, "Email envoyé avec succès à $customerEmail\n", FILE_APPEND);
            
            http_response_code(200);
            echo json_encode(['status' => 'success', 'message' => 'Email sent']);
            
        } catch (Exception $e) {
            file_put_contents($logFile, "Erreur email: " . $mail->ErrorInfo . "\n", FILE_APPEND);
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $mail->ErrorInfo]);
        }
    } else {
        // Autres types d'événements
        file_put_contents($logFile, "Event ignoré: " . $event->type . "\n", FILE_APPEND);
        http_response_code(200);
        echo json_encode(['status' => 'ignored']);
    }
    
} catch(\UnexpectedValueException $e) {
    file_put_contents($logFile, "Erreur signature: " . $e->getMessage() . "\n", FILE_APPEND);
    http_response_code(400);
    exit();
} catch(\Stripe\Exception\SignatureVerificationException $e) {
    file_put_contents($logFile, "Erreur vérification: " . $e->getMessage() . "\n", FILE_APPEND);
    http_response_code(400);
    exit();
} catch(Exception $e) {
    file_put_contents($logFile, "Erreur générale: " . $e->getMessage() . "\n", FILE_APPEND);
    http_response_code(500);
    exit();
}
?>
