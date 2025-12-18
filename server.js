// ===================================================
// 🚀 QRGUIDE - Backend Stripe (comme Cinnad'moun)
// ===================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 3000;

// ===========================
// Middleware
// ===========================
app.use(cors());
app.use(express.json());

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
// Créer une session de paiement Stripe
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

        // ===========================
        // Calcul du montant total
        // ===========================
        let totalAmount = PRICES.packCreation; // Toujours le pack création

        // Ajouter l'abonnement
        if (plan === 'mensuel') {
            totalAmount += PRICES.mensuel;
        } else if (plan === 'annuel') {
            totalAmount += PRICES.annuel;
        } else {
            return res.status(400).json({ error: 'Plan invalide. Choisissez "mensuel" ou "annuel".' });
        }

        // Ajouter les plaques QR
        const plaques = parseInt(plaqueQty) || 0;
        if (plaques > 0) {
            totalAmount += PRICES.plaqueQR * plaques;
        }

        // ===========================
        // Description détaillée
        // ===========================
        let description = `Pack Création QRGUIDE (${PRICES.packCreation}€) + Abonnement ${plan} `;
        
        if (plan === 'mensuel') {
            description += `(${PRICES.mensuel}€)`;
        } else {
            description += `(${PRICES.annuel}€)`;
        }

        if (plaques > 0) {
            description += ` + ${plaques} plaque${plaques > 1 ? 's' : ''} QR (${PRICES.plaqueQR * plaques}€)`;
        }

        // ===========================
        // Créer la session Stripe
        // ===========================
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            
            // Informations client
            customer_email: customerInfo.email,
            
            // Ligne de commande
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: 'QRGUIDE - Guide Numérique',
                            description: description,
                            images: ['https://qrguide.fr/img/logo.png'] // Logo optionnel
                        },
                        unit_amount: Math.round(totalAmount * 100) // Convertir en centimes
                    },
                    quantity: 1
                }
            ],
            
            // URLs de retour
            success_url: successUrl,
            cancel_url: cancelUrl,
            
            // Métadonnées (pour référence)
            metadata: {
                plan: plan,
                plaqueQty: plaques.toString(),
                customerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
                customerPhone: customerInfo.phone,
                packCreation: PRICES.packCreation.toString(),
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
// Webhook Stripe (optionnel - pour recevoir confirmation de paiement)
// ===========================
app.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
        return res.sendStatus(200); // Pas de webhook configuré
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
            
            // TODO: Envoyer email de confirmation, créer compte utilisateur, etc.
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
