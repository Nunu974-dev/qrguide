// ===================================================
// 🚀 QRGUIDE - Backend Stripe (comme Cinnad'moun)
// ===================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

// ===========================
// Configuration Firebase Admin
// ===========================
if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    // Option 1: JSON complet (recommandé pour Render)
    const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase Admin initialisé (JSON)');
} else if (process.env.FIREBASE_PROJECT_ID) {
    // Option 2: Variables séparées
    let privateKey = process.env.FIREBASE_PRIVATE_KEY || '';
    
    // Nettoyer la clé : enlever guillemets et remplacer \n
    privateKey = privateKey.replace(/^["']|["']$/g, ''); // Enlève guillemets début/fin
    privateKey = privateKey.replace(/\\n/g, '\n'); // Convertit \n en vrais retours
    
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: privateKey
        })
    });
    console.log('✅ Firebase Admin initialisé');
}
const firestore = admin.firestore();

// ===========================
// Configuration Nodemailer (SMTP Hostinger)
// ===========================
const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 587, // TLS au lieu de SSL (plus compatible avec Render)
    secure: false, // false pour port 587
    requireTLS: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    connectionTimeout: 10000, // 10 secondes
    greetingTimeout: 5000,
    socketTimeout: 10000
});

console.log('✅ Nodemailer configuré avec SMTP Hostinger');

// ===========================
// Price IDs Stripe (abonnements)
// ===========================
const STRIPE_PRICE_IDS = {
    mensuel: process.env.STRIPE_PRICE_MENSUEL || 'price_1SfjUQIuJcG0yZsyQmc6oFBE',
    annuel: process.env.STRIPE_PRICE_ANNUEL || 'price_1SfjVAIuJcG0yZsyaL4WutuC'
};

// Fonction pour envoyer email via Nodemailer
async function sendConfirmationEmail(customerEmail, customerName, plan, plaques, total, plaqueFormat, propertyCount, propertyType, message, tempPassword = null, isNewUser = true) {
    const planText = plan === 'mensuel' ? 'Mensuelle (8€/mois)' : 'Annuelle (75€/an)';
    
    // Détails complets des plaques avec dimensions et prix
    let plaquesText = 'Aucune';
    if (plaques > 0) {
        const formatUpper = plaqueFormat.toUpperCase();
        const dimensions = plaqueFormat === 'a5' ? '14.8 × 21 cm' : '21 × 29.7 cm';
        const pricePerPlaque = plaqueFormat === 'a5' ? 35 : 45;
        const totalPlaques = plaques * pricePerPlaque;
        plaquesText = `${plaques} × Format ${formatUpper} (${dimensions}) à ${pricePerPlaque}€/unité = ${totalPlaques}€`;
    }
    
    const propertyText = propertyCount ? `${propertyCount} logement${propertyCount > 1 ? 's' : ''}${propertyType ? ' (' + propertyType + ')' : ''}` : 'Non spécifié';
    
    const titleText = isNewUser ? 'Bienvenue chez QRGUIDE !' : 'Abonnement renouvelé !';
    const messageText = isNewUser 
        ? 'Votre compte a été créé avec succès.' 
        : 'Votre abonnement a été mis à jour.';
    
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8f9fa;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; padding: 40px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
                            <img src="https://qrguide.fr/img/logo.png" alt="QRGUIDE" style="height: 150px; margin-bottom: 20px;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">${titleText}</h1>
                            <p style="color: #ffffff; margin: 10px 0 0 0; opacity: 0.9;">${messageText}</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px;">
                            <p style="font-size: 16px; color: #333; margin: 0 0 20px 0;">Bonjour <strong>${customerName}</strong>,</p>
                            <p style="font-size: 16px; color: #666; line-height: 1.6; margin: 0 0 30px 0;">
                                Nous vous remercions pour votre abonnement ! Votre paiement a bien été enregistré et votre compte est maintenant actif.
                            </p>
                            <table width="100%" cellpadding="12" cellspacing="0" style="background: #f8f9fa; border-radius: 8px; margin-bottom: 30px;">
                                <tr>
                                    <td style="color: #666; font-size: 14px;"><strong>📋 Formule :</strong></td>
                                    <td style="color: #333; font-size: 14px; text-align: right;">${planText}</td>
                                </tr>
                                <tr>
                                    <td style="color: #666; font-size: 14px;"><strong>🏠 Logements :</strong></td>
                                    <td style="color: #333; font-size: 14px; text-align: right;">${propertyText}</td>
                                </tr>
                                <tr>
                                    <td style="color: #666; font-size: 14px;"><strong>🏷️ Plaques QR :</strong></td>
                                    <td style="color: #333; font-size: 14px; text-align: right;">${plaquesText}</td>
                                </tr>
                                ${message ? `
                                <tr>
                                    <td colspan="2" style="color: #666; font-size: 14px; padding-top: 12px; border-top: 1px solid #e9ecef;"><strong>💬 Commentaire :</strong><br><span style="color: #333; font-style: italic;">"${message}"</span></td>
                                </tr>
                                ` : ''}
                                <tr>
                                    <td style="color: #666; font-size: 14px; padding-top: 8px; border-top: 2px solid #e9ecef;"><strong>💰 Total :</strong></td>
                                    <td style="color: #667eea; font-size: 18px; font-weight: bold; text-align: right; padding-top: 8px; border-top: 2px solid #e9ecef;">${total}€</td>
                                </tr>
                            </table>
                            ${tempPassword ? `
                            <table width="100%" cellpadding="20" cellspacing="0" style="background: linear-gradient(135deg, #fff3cd 0%, #ffe8a1 100%); border-radius: 8px; border: 2px solid #ffc107; margin-bottom: 30px;">
                                <tr>
                                    <td>
                                        <h2 style="color: #856404; margin: 0 0 15px 0; font-size: 20px;">🔐 Vos identifiants de connexion</h2>
                                        <p style="color: #856404; margin: 0 0 10px 0; font-size: 14px;"><strong>Email :</strong> ${customerEmail}</p>
                                        <p style="color: #856404; margin: 0 0 20px 0; font-size: 14px;"><strong>Mot de passe temporaire :</strong></p>
                                        <div style="background: #ffffff; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 18px; font-weight: bold; color: #333; text-align: center; letter-spacing: 2px; margin-bottom: 20px;">
                                            ${tempPassword}
                                        </div>
                                        <p style="color: #856404; margin: 0; font-size: 13px;">⚠️ Changez ce mot de passe dès votre première connexion</p>
                                    </td>
                                </tr>
                            </table>
                            ` : ''}
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding: 20px 0;">
                                        <a href="https://qrguide.fr/login.html" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);">
                                            🚀 Se connecter maintenant
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #2196f3;">
                                <h3 style="color: #1565c0; margin: 0 0 15px 0; font-size: 18px;">📝 Prochaines étapes :</h3>
                                <ol style="color: #555; margin: 0; padding-left: 20px; line-height: 1.8;">
                                    <li><strong>Connectez-vous</strong> sur <a href="https://qrguide.fr/login.html" style="color: #667eea;">qrguide.fr/login.html</a> avec vos identifiants</li>
                                    <li><strong>Créez votre premier logement</strong> dans l'onglet "Mes Logements"</li>
                                    <li>Remplissez les informations de votre logement (équipements, Wi-Fi, recommandations...)</li>
                                    <li><strong>Notre équipe vérifie</strong> votre guide sous 24h</li>
                                    <li><strong>Vous recevez votre lien QRGUIDE</strong> + QR code à imprimer par email</li>
                                </ol>
                            </div>
                            <p style="font-size: 14px; color: #666; line-height: 1.6; margin: 20px 0 0 0;">
                                Vous pouvez créer jusqu'à <strong>3 logements</strong> avec votre abonnement et modifier vos guides à tout moment depuis votre espace personnel.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                            <p style="margin: 0 0 10px 0; font-size: 13px; color: #999;">
                                Besoin d'aide ? Contactez-nous à <a href="mailto:contact@qrguide.fr" style="color: #667eea; text-decoration: none;">contact@qrguide.fr</a>
                            </p>
                            <p style="margin: 0; font-size: 12px; color: #999;">
                                © 2024 QRGUIDE - Tous droits réservés
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;

    const mailOptions = {
        from: '"QRGUIDE" <noreply@qrguide.fr>',
        to: customerEmail,
        subject: tempPassword ? '🎉 Bienvenue sur QRGUIDE - Vos identifiants' : '✅ Confirmation de paiement QRGUIDE',
        html: htmlContent
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('📧 Email envoyé via SMTP Hostinger à:', customerEmail);
        return true;
    } catch (error) {
        console.error('❌ Erreur Nodemailer:', error.message);
        return false;
    }
}

// Fonction pour notifier l'admin d'un nouvel achat
async function sendAdminNotification(customerEmail, customerName, plan, plaques, total, plaqueFormat, propertyCount, propertyType, message) {
    const planText = plan === 'mensuel' ? 'Mensuel (8€/mois)' : 'Annuel (75€/an)';
    
    // Détails plaques avec format et prix
    let plaquesDetails = 'Aucune';
    if (plaques > 0) {
        const formatUpper = plaqueFormat.toUpperCase();
        const dimensions = plaqueFormat === 'a5' ? '14.8 × 21 cm' : '21 × 29.7 cm';
        const pricePerPlaque = plaqueFormat === 'a5' ? 35 : 45;
        const totalPlaques = plaques * pricePerPlaque;
        plaquesDetails = `${plaques} × ${formatUpper} (${dimensions}) = ${totalPlaques}€`;
    }
    
    const propertyDetails = propertyCount ? `${propertyCount} logement${propertyCount > 1 ? 's' : ''}${propertyType ? ' - Type: ' + propertyType : ''}` : 'Non spécifié';
    
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
</head>
<body style="font-family: Arial, sans-serif; background-color: #f8f9fa; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 30px;">
        <h2 style="color: #C7A961; margin-top: 0;">🎉 Nouvelle vente QRGUIDE !</h2>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px;"><strong>👤 Client :</strong> ${customerName}</p>
            <p style="margin: 0 0 10px;"><strong>📧 Email :</strong> ${customerEmail}</p>
            <p style="margin: 0 0 10px;"><strong>📋 Formule :</strong> ${planText}</p>
            <p style="margin: 0 0 10px;"><strong>🏠 Logements :</strong> ${propertyDetails}</p>
            <p style="margin: 0 0 10px;"><strong>🏷️ Plaques QR :</strong> ${plaquesDetails}</p>
            ${message ? `<p style="margin: 10px 0; padding: 10px; background: #fff; border-left: 3px solid #C7A961;"><strong>💬 Message client :</strong><br><em>"${message}"</em></p>` : ''}
            <p style="margin: 15px 0 0 0;"><strong style="font-size: 20px; color: #C7A961;">💰 Total : ${total}€</strong></p>
        </div>
        
        <p style="color: #666; font-size: 14px;">
            L'utilisateur a été créé automatiquement dans Firebase et a reçu ses identifiants par email.
        </p>
    </div>
</body>
</html>
    `;

    const mailOptions = {
        from: '"QRGUIDE System" <noreply@qrguide.fr>',
        to: 'contact@qrguide.fr',
        subject: `💰 Nouvelle vente ${plan} - ${customerName}`,
        html: htmlContent
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('📧 Notification admin envoyée');
        return true;
    } catch (error) {
        console.error('❌ Erreur notification admin:', error.message);
        return false;
    }
}

// Template email de confirmation (pour référence - utilisé dans EmailJS dashboard)
const getConfirmationEmailTemplate = () => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Inter', -apple-system, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
        .header { background: linear-gradient(135deg, #C7A961 0%, #B89544 100%); padding: 40px 20px; text-align: center; }
        .header img { max-width: 200px; height: auto; }
        .content { padding: 40px 30px; }
        .success-icon { text-align: center; font-size: 60px; margin: 20px 0; }
        h1 { color: #C7A961; margin: 0 0 10px; }
        .info-box { background: #f8f9fa; border-left: 4px solid #C7A961; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .steps { margin: 30px 0; }
        .step { padding: 15px; margin: 10px 0; background: #ffffff; border: 1px solid #e9ecef; border-radius: 8px; }
        .step-number { display: inline-block; width: 30px; height: 30px; background: #C7A961; color: white; border-radius: 50%; text-align: center; line-height: 30px; font-weight: bold; margin-right: 10px; }
        .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #666; font-size: 14px; }
        .button { display: inline-block; background: #C7A961; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://qrguide.fr/img/logo_blanc.png" alt="QRGUIDE">
        </div>
        
        <div class="content">
            <div class="success-icon">🎉</div>
            <h1 style="text-align: center;">Paiement confirmé !</h1>
            <p style="text-align: center; font-size: 18px; color: #666;">Merci ${customerName} pour votre confiance</p>
            
            <div class="info-box">
                <strong>📋 Récapitulatif de votre commande :</strong><br><br>
                <strong>Formule :</strong> ${plan === 'mensuel' ? 'Mensuelle (8€/mois)' : 'Annuelle (75€/an)'}<br>
                ${plaques > 0 ? `<strong>Plaques QR :</strong> ${plaques} plaque${plaques > 1 ? 's' : ''}<br>` : ''}
                <strong>Pack Création :</strong> 35€ (inclus)<br><br>
                <strong style="font-size: 20px; color: #C7A961;">Total payé : ${total}€</strong>
            </div>
            
            <div class="steps">
                <h2 style="color: #C7A961;">Prochaines étapes :</h2>
                
                <div class="step">
                    <span class="step-number">1</span>
                    <strong>Connexion immédiate</strong><br>
                    Connectez-vous avec vos identifiants pour créer votre guide
                </div>
                
                <div class="step">
                    <span class="step-number">2</span>
                    <strong>Création de votre guide</strong><br>
                    Remplissez les informations et publiez instantanément
                </div>
                
                <div class="step">
                    <span class="step-number">3</span>
                    <strong>Livraison plaques (si commandées)</strong><br>
                    Réception de vos plaques QR sous 2 à 3 semaines
                </div>
            </div>
            
            <p style="text-align: center;">
                <strong>Des questions ?</strong><br>
                📧 <a href="mailto:contact@qrguide.fr" style="color: #C7A961;">contact@qrguide.fr</a><br>
                📞 <a href="tel:0692630364" style="color: #C7A961;">06 92 63 03 64</a>
            </p>
        </div>
        
        <div class="footer">
            <p><strong>QRGUIDE.FR</strong> - Le guide numérique nouvelle génération</p>
            <p>© 2025 QRGUIDE.FR - Tous droits réservés</p>
        </div>
    </div>
</body>
</html>

Créez ce template dans EmailJS avec les variables :
- {{to_email}}
- {{customer_name}}
- {{plan}}
- {{plaques}}
- {{total}}
`;

// ===========================
// Middleware CORS (avant tout)
// ===========================
app.use(cors());

// ===========================
// Middleware JSON avec EXCEPTION pour webhook
// La clé : sauvegarder rawBody AVANT parsing
// ===========================
app.use(
    express.json({
        verify: (req, res, buf) => {
            // Sauvegarder le raw body pour le webhook
            if (req.originalUrl === '/webhook') {
                req.rawBody = buf.toString('utf8');
            }
        }
    })
);

// ===========================
// Route de base (health check)
// ===========================
app.get('/', (req, res) => {
    res.json({ 
        status: 'QRGUIDE Backend prêt ✅',
        version: '1.0.0',
        endpoints: ['/create-checkout-session']
    });
});

// ===========================
// PRIX QRGUIDE
// ===========================
const PRICES = {
    packCreation: 35,  // Pack Création obligatoire
    mensuel: 8,         // Abonnement mensuel
    annuel: 75,         // Abonnement annuel
    plaqueA4: 58.90,       // Prix plaque QR format A4
    plaqueA5: 52.90        // Prix plaque QR format A5
};

// ===========================
// Créer une session de paiement Stripe (ABONNEMENT RÉCURRENT)
// ===========================
app.post('/create-checkout-session', async (req, res) => {
    try {
        const { 
            plan,           // 'mensuel' ou 'annuel'
            plaqueQty,      // Nombre de plaques QR (0, 1, 2...)
            customerInfo,   // Infos client (nom, email, téléphone)
            successUrl,     // URL de retour après paiement
            cancelUrl       // URL si annulation
        } = req.body;

        if (!plan || !['mensuel', 'annuel'].includes(plan)) {
            return res.status(400).json({ error: 'Plan invalide. Choisissez "mensuel" ou "annuel".' });
        }

        // ===========================
        // Pack Création + Plaques (paiement unique)
        // ===========================
        let setupFeeAmount = PRICES.packCreation; // 35€
        const plaques = parseInt(plaqueQty) || 0;
        const plaqueFormat = req.body.plaqueFormat || 'a4'; // A4 ou A5
        
        if (plaques > 0) {
            // Utiliser le bon prix selon le format
            const pricePerPlaque = plaqueFormat === 'a5' ? PRICES.plaqueA5 : PRICES.plaqueA4;
            setupFeeAmount += pricePerPlaque * plaques;
            console.log(`📦 ${plaques} plaque(s) ${plaqueFormat.toUpperCase()} × ${pricePerPlaque}€ = ${pricePerPlaque * plaques}€`);
        }

        // ===========================
        // Line items : Abonnement + Frais uniques
        // ===========================
        const line_items = [
            // 1. Abonnement récurrent (8€/mois ou 75€/an)
            {
                price: STRIPE_PRICE_IDS[plan],
                quantity: 1
            },
            // 2. Pack Création + Plaques (paiement unique)
            {
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: 'Pack Création QRGUIDE' + (plaques > 0 ? ` + ${plaques} plaque(s) QR` : ''),
                        description: 'Paiement unique (non récurrent)'
                    },
                    unit_amount: Math.round(setupFeeAmount * 100)
                },
                quantity: 1
            }
        ];

        // Calcul total premier paiement
        const abonnementPrice = plan === 'mensuel' ? PRICES.mensuel : PRICES.annuel;
        const totalAmount = setupFeeAmount + abonnementPrice;

        // ===========================
        // Créer la session Stripe en mode SUBSCRIPTION
        // ===========================
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'subscription',  // ← MODE ABONNEMENT RÉCURRENT
            
            customer_email: customerInfo.email,
            line_items: line_items,
            
            success_url: successUrl,
            cancel_url: cancelUrl,
            
            // Métadonnées
            metadata: {
                plan: plan,
                plaqueQty: plaques.toString(),
                plaqueFormat: req.body.plaqueFormat || 'a4',
                firstName: customerInfo.firstName,
                lastName: customerInfo.lastName,
                customerPhone: customerInfo.phone,
                postalCode: customerInfo.postalCode || '',
                propertyType: customerInfo.propertyType || '',
                propertyCount: customerInfo.propertyCount || '1',
                message: customerInfo.message || '',
                totalAmount: totalAmount.toString()
            }
        });

        // ===========================
        // Log pour debug (optionnel)
        // ===========================
        console.log('✅ Session Stripe créée:', {
            sessionId: session.id,
            plan: plan,
            plaques: plaques,
            montant: totalAmount + '€',
            email: customerInfo.email
        });

        // Retourner l'ID de session au frontend
        res.json({ 
            sessionId: session.id,
            amount: totalAmount
        });

    } catch (error) {
        console.error('❌ Erreur création session Stripe:', error);
        res.status(500).json({ 
            error: error.message || 'Erreur lors de la création de la session de paiement'
        });
    }
});

// ===========================
// Webhook Stripe - AVEC RAWBODY SAUVEGARDÉ
// ===========================
app.post('/webhook', async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
        console.log('⚠️ STRIPE_WEBHOOK_SECRET non configuré');
        return res.sendStatus(200);
    }

    try {
        // Utiliser rawBody sauvegardé par la fonction verify
        const event = stripe.webhooks.constructEvent(
            req.rawBody, // Le raw body sauvegardé
            sig,
            endpointSecret
        );

        console.log('✅ Webhook vérifié:', event.type);

        // Gérer l'événement de paiement réussi
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            
            console.log('💰 Paiement réussi:', {
                email: session.customer_email,
                amount: session.amount_total / 100 + '€',
                plan: session.metadata.plan
            });
            
            // ============================================
            // CRÉER LE COMPTE UTILISATEUR FIREBASE
            // ============================================
            const firstName = session.metadata.firstName || '';
            const lastName = session.metadata.lastName || '';
            const customerName = `${firstName} ${lastName}`.trim() || 'Client';
            const customerEmail = session.customer_email;
            const customerPhone = session.metadata.customerPhone || '';
            const postalCode = session.metadata.postalCode || '';
            const plan = session.metadata.plan;
            const plaques = parseInt(session.metadata.plaqueQty || 0);
            const total = session.metadata.totalAmount;

            let tempPassword = null;
            let userRecord = null;
            let isNewUser = false;

            try {
                // ====================================
                // VÉRIFIER SI L'EMAIL EXISTE DÉJÀ
                // ====================================
                try {
                    userRecord = await admin.auth().getUserByEmail(customerEmail);
                    console.log('⚠️ Compte existant détecté:', userRecord.uid);
                    
                    // Récupérer le mot de passe depuis Firestore (si stocké)
                    const userDoc = await firestore.collection('users').doc(userRecord.uid).get();
                    if (userDoc.exists && userDoc.data().tempPassword) {
                        tempPassword = userDoc.data().tempPassword;
                        console.log('📧 Utilisation du mot de passe existant');
                    } else {
                        // Pas de mot de passe stocké, on envoie juste une notification
                        tempPassword = null;
                        console.log('📧 Compte existant sans mot de passe temporaire');
                    }
                    
                    // Mettre à jour l'abonnement dans Firestore
                    await firestore.collection('users').doc(userRecord.uid).update({
                        plan: plan,
                        stripeCustomerId: session.customer,
                        stripeSubscriptionId: session.subscription || null,
                        updatedAt: admin.firestore.FieldValue.serverTimestamp()
                    });
                    
                    console.log('✅ Abonnement mis à jour pour utilisateur existant');
                    
                } catch (authError) {
                    // L'email n'existe pas → Créer un nouveau compte
                    if (authError.code === 'auth/user-not-found') {
                        isNewUser = true;
                        
                        // Générer un mot de passe temporaire
                        tempPassword = Math.random().toString(36).slice(-8) + 'Aa1!';
                        
                        // Créer l'utilisateur Firebase Auth
                        userRecord = await admin.auth().createUser({
                            email: customerEmail,
                            password: tempPassword,
                            displayName: customerName,
                            emailVerified: false
                        });
                        
                        console.log('✅ Nouvel utilisateur Firebase créé:', userRecord.uid);
                        
                        // Créer le document Firestore
                        await firestore.collection('users').doc(userRecord.uid).set({
                            email: customerEmail,
                            firstname: firstName,
                            lastname: lastName,
                            displayName: customerName,
                            phone: customerPhone,
                            postalCode: postalCode,
                            role: 'client',
                            plan: plan,
                            maxLogements: 3,
                            stripeCustomerId: session.customer,
                            stripeSubscriptionId: session.subscription || null,
                            tempPassword: tempPassword, // Sauvegarder le mot de passe temporaire
                            createdAt: admin.firestore.FieldValue.serverTimestamp(),
                            firstLogin: true
                        });
                        
                        console.log('✅ Document Firestore créé');
                    } else {
                        throw authError; // Autre erreur
                    }
                }
                
            } catch (firebaseError) {
                console.error('❌ Erreur Firebase:', firebaseError.message);
                // Continue quand même pour envoyer l'email
            }

            // Envoyer email de confirmation au client
            const plaqueFormat = session.metadata.plaqueFormat || 'a4';
            const propertyCount = session.metadata.propertyCount || '1';
            const propertyType = session.metadata.propertyType || '';
            const message = session.metadata.message || '';
            
            await sendConfirmationEmail(
                customerEmail,
                customerName,
                plan,
                plaques,
                total,
                plaqueFormat,
                propertyCount,
                propertyType,
                message,
                tempPassword,
                isNewUser
            );
            
            // Envoyer notification à l'admin
            await sendAdminNotification(
                customerEmail,
                customerName,
                plan,
                plaques,
                total,
                plaqueFormat,
                propertyCount,
                propertyType,
                message
            );
            
            console.log(`📧 Emails envoyés (client ${isNewUser ? 'nouveau' : 'existant'} + admin)`);
        }

        res.json({ received: true });
    } catch (error) {
        console.error('❌ Erreur webhook:', error.message);
        res.status(400).send(`Webhook Error: ${error.message}`);
    }
});

// ===========================
// Endpoint: Synchroniser les IDs Stripe dans Firestore
// ===========================
app.post('/sync-stripe-ids', async (req, res) => {
    try {
        const { email, userId } = req.body;
        
        if (!email || !userId) {
            return res.status(400).json({ error: 'Email et userId requis' });
        }
        
        console.log('🔍 Recherche abonnement Stripe pour:', email);
        
        // Chercher le client Stripe par email
        const customers = await stripe.customers.list({
            email: email,
            limit: 1
        });
        
        if (customers.data.length === 0) {
            console.log('⚠️ Aucun client Stripe trouvé pour', email);
            return res.json({ customerId: null, subscriptionId: null });
        }
        
        const customer = customers.data[0];
        console.log('✅ Client Stripe trouvé:', customer.id);
        
        // Récupérer les abonnements du client
        const subscriptions = await stripe.subscriptions.list({
            customer: customer.id,
            status: 'active',
            limit: 1
        });
        
        if (subscriptions.data.length === 0) {
            console.log('⚠️ Aucun abonnement actif pour', customer.id);
            return res.json({ customerId: customer.id, subscriptionId: null });
        }
        
        const subscription = subscriptions.data[0];
        console.log('✅ Abonnement actif trouvé:', subscription.id);
        
        // Mettre à jour Firestore
        await firestore.collection('users').doc(userId).update({
            stripeCustomerId: customer.id,
            stripeSubscriptionId: subscription.id,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('✅ Firestore mis à jour avec les IDs Stripe');
        
        res.json({
            customerId: customer.id,
            subscriptionId: subscription.id
        });
        
    } catch (error) {
        console.error('Erreur sync-stripe-ids:', error);
        res.status(500).json({ error: error.message });
    }
});

// ===========================
// Endpoint: Récupérer les informations de paiement
// ===========================
app.post('/get-payment-info', async (req, res) => {
    try {
        const { customerId, subscriptionId } = req.body;
        
        if (!customerId || !subscriptionId) {
            return res.status(400).json({ error: 'Customer ID et Subscription ID requis' });
        }
        
        // Récupérer la subscription Stripe
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        
        // Récupérer le payment method
        const paymentMethod = await stripe.paymentMethods.retrieve(
            subscription.default_payment_method
        );
        
        // Préparer les données à renvoyer
        const paymentInfo = {
            card: {
                brand: paymentMethod.card.brand,
                last4: paymentMethod.card.last4,
                exp_month: paymentMethod.card.exp_month,
                exp_year: paymentMethod.card.exp_year
            },
            nextBilling: subscription.current_period_end
        };
        
        res.json(paymentInfo);
    } catch (error) {
        console.error('Erreur get-payment-info:', error);
        res.status(500).json({ error: error.message });
    }
});

// ===========================
// Endpoint: Notifier le gestionnaire d'un nouveau guide créé
// ===========================
app.post('/notify-new-guide', async (req, res) => {
    try {
        const { guideName, guideId, guideUrl, clientEmail, clientName, ville, photoUrl } = req.body;
        
        const adminEmail = process.env.ADMIN_EMAIL || 'contact@qrguide.fr';
        
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8f9fa;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; padding: 40px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
                            <img src="https://qrguide.fr/img/logo.png" alt="QRGUIDE" style="height: 100px; margin-bottom: 20px;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🎉 Nouveau Guide Créé !</h1>
                            <p style="color: #ffffff; margin: 10px 0 0 0; opacity: 0.9;">Un client vient de créer un guide</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px;">
                            ${photoUrl ? `
                            <div style="text-align: center; margin-bottom: 30px;">
                                <img src="${photoUrl}" alt="Photo du logement" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                            </div>
                            ` : ''}
                            
                            <h2 style="color: #d4af37; margin: 0 0 20px 0;">📋 Détails du guide</h2>
                            
                            <table width="100%" cellpadding="10" cellspacing="0" style="border: 2px solid #e9ecef; border-radius: 8px; margin-bottom: 30px;">
                                <tr style="background-color: #f8f9fa;">
                                    <td style="font-weight: 600; color: #333;">🏠 Nom du logement:</td>
                                    <td style="color: #666;">${guideName}</td>
                                </tr>
                                <tr>
                                    <td style="font-weight: 600; color: #333;">📍 Ville:</td>
                                    <td style="color: #666;">${ville || 'Non spécifiée'}</td>
                                </tr>
                                <tr style="background-color: #f8f9fa;">
                                    <td style="font-weight: 600; color: #333;">🔗 ID du guide:</td>
                                    <td style="color: #666; font-family: monospace;">${guideId}</td>
                                </tr>
                                <tr>
                                    <td style="font-weight: 600; color: #333;">👤 Client:</td>
                                    <td style="color: #666;">${clientName}</td>
                                </tr>
                                <tr style="background-color: #f8f9fa;">
                                    <td style="font-weight: 600; color: #333;">📧 Email client:</td>
                                    <td style="color: #666;">${clientEmail}</td>
                                </tr>
                            </table>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${guideUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                                    👁️ Voir le guide
                                </a>
                            </div>
                            
                            <div style="background-color: #fffbf0; border-left: 4px solid #d4af37; padding: 16px; border-radius: 8px; margin-top: 30px;">
                                <p style="margin: 0; color: #666; font-size: 14px;">
                                    <strong>URL du guide:</strong><br>
                                    <a href="${guideUrl}" style="color: #d4af37; word-break: break-all;">${guideUrl}</a>
                                </p>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 24px; text-align: center; border-top: 1px solid #e9ecef;">
                            <p style="margin: 0; color: #999; font-size: 14px;">
                                <a href="https://qrguide.fr/demo-guide/admin.html" style="color: #667eea; text-decoration: none;">Accéder au Dashboard Admin</a>
                            </p>
                            <p style="margin: 8px 0 0 0; color: #999; font-size: 12px;">
                                © ${new Date().getFullYear()} QRGUIDE.FR - Tous droits réservés
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

        const mailOptions = {
            from: `"QRGUIDE Notifications" <${process.env.SMTP_USER}>`,
            to: adminEmail,
            subject: `🎉 Nouveau guide créé : ${guideName}`,
            html: htmlContent
        };

        await transporter.sendMail(mailOptions);
        console.log('✅ Email envoyé au gestionnaire:', adminEmail);

        res.json({ success: true, message: 'Email envoyé' });
    } catch (error) {
        console.error('Erreur notify-new-guide:', error);
        res.status(500).json({ error: error.message });
    }
});

// ===========================
// Démarrer le serveur
// ===========================
app.listen(PORT, () => {
    console.log(`🚀 QRGUIDE Backend démarré sur le port ${PORT}`);
    console.log(`✅ Stripe configuré avec clé: ${process.env.STRIPE_SECRET_KEY ? '✓ OK' : '❌ MANQUANTE'}`);
});
