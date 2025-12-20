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
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
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
    port: 465,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
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
async function sendConfirmationEmail(customerEmail, customerName, plan, plaques, total, tempPassword = null) {
    const planText = plan === 'mensuel' ? 'Mensuelle (8€/mois)' : 'Annuelle (75€/an)';
    const plaquesText = plaques > 0 ? `${plaques} plaque${plaques > 1 ? 's' : ''}` : 'Aucune';
    
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
                            <img src="https://qrguide.fr/img/logo.png" alt="QRGUIDE" style="height: 50px; margin-bottom: 20px;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Bienvenue chez QRGUIDE !</h1>
                            <p style="color: #ffffff; margin: 10px 0 0 0; opacity: 0.9;">Votre compte a été créé avec succès</p>
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
                                    <td style="color: #666; font-size: 14px;"><strong>🏷️ Plaques QR :</strong></td>
                                    <td style="color: #333; font-size: 14px; text-align: right;">${plaquesText}</td>
                                </tr>
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
                                            🚀 Accéder à mon compte
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            <p style="font-size: 14px; color: #666; line-height: 1.6; margin: 30px 0 0 0;">
                                Vous pouvez maintenant créer jusqu'à <strong>3 logements</strong> et générer vos guides QR personnalisés.
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
                <strong>Pack Création :</strong> 150€ (inclus)<br><br>
                <strong style="font-size: 20px; color: #C7A961;">Total payé : ${total}€</strong>
            </div>
            
            <div class="steps">
                <h2 style="color: #C7A961;">Prochaines étapes :</h2>
                
                <div class="step">
                    <span class="step-number">1</span>
                    <strong>Contact sous 2h</strong><br>
                    Nous vous appelons pour confirmer les détails
                </div>
                
                <div class="step">
                    <span class="step-number">2</span>
                    <strong>Création de votre guide</strong><br>
                    Nous créons votre guide personnalisé sous 48h
                </div>
                
                <div class="step">
                    <span class="step-number">3</span>
                    <strong>Livraison</strong><br>
                    Vous recevez votre guide + QR code + plaques si commandées
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
// Middleware
// ===========================
app.use(cors());

// ⚠️ IMPORTANT: Le webhook Stripe doit recevoir le body RAW
// On parse JSON SAUF pour la route /webhook
app.use((req, res, next) => {
    if (req.originalUrl === '/webhook') {
        next(); // Skip JSON parsing pour le webhook
    } else {
        express.json()(req, res, next);
    }
});

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
    packCreation: 150,  // Pack Création obligatoire
    mensuel: 8,         // Abonnement mensuel
    annuel: 75,         // Abonnement annuel
    plaqueQR: 45        // Prix par plaque QR
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
        let setupFeeAmount = PRICES.packCreation; // 150€
        const plaques = parseInt(plaqueQty) || 0;
        if (plaques > 0) {
            setupFeeAmount += PRICES.plaqueQR * plaques;
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
                customerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
                customerPhone: customerInfo.phone,
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
// Webhook Stripe - ENVOI EMAIL AUTOMATIQUE
// ===========================
app.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
        console.log('⚠️ Webhook non configuré');
        return res.sendStatus(200);
    }

    try {
        const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);

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
            const customerName = session.metadata.customerName || 'Client';
            const customerEmail = session.customer_email;
            const customerPhone = session.metadata.customerPhone || '';
            const plan = session.metadata.plan;
            const plaques = parseInt(session.metadata.plaqueQty || 0);
            const total = session.metadata.totalAmount;

            let tempPassword = null;

            try {
                // Générer un mot de passe temporaire
                tempPassword = Math.random().toString(36).slice(-8) + 'Aa1!';
                
                // Créer l'utilisateur Firebase Auth
                const userRecord = await admin.auth().createUser({
                    email: customerEmail,
                    password: tempPassword,
                    displayName: customerName,
                    emailVerified: false
                });
                
                console.log('✅ Utilisateur Firebase créé:', userRecord.uid);
                
                // Créer le document Firestore
                await firestore.collection('users').doc(userRecord.uid).set({
                    email: customerEmail,
                    displayName: customerName,
                    phone: customerPhone,
                    role: 'client',
                    plan: plan,
                    maxLogements: 3,
                    stripeCustomerId: session.customer,
                    stripeSubscriptionId: session.subscription || null,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    firstLogin: true
                });
                
                console.log('✅ Document Firestore créé');
                
            } catch (firebaseError) {
                console.error('❌ Erreur Firebase:', firebaseError.message);
                // Continue quand même pour envoyer l'email
            }

            // Envoyer email de confirmation via EmailJS
            await sendConfirmationEmail(
                customerEmail,
                customerName,
                plan,
                plaques,
                total,
                tempPassword
            );
        }

        res.json({ received: true });
    } catch (error) {
        console.error('❌ Erreur webhook:', error.message);
        res.status(400).send(`Webhook Error: ${error.message}`);
    }
});

// ===========================
// Démarrer le serveur
// ===========================
app.listen(PORT, () => {
    console.log(`🚀 QRGUIDE Backend démarré sur le port ${PORT}`);
    console.log(`✅ Stripe configuré avec clé: ${process.env.STRIPE_SECRET_KEY ? '✓ OK' : '❌ MANQUANTE'}`);
});
