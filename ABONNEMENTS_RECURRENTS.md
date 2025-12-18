# 🔄 Configuration Abonnements Récurrents Stripe

## 📋 Problème actuel

Votre système utilise actuellement **`mode: 'payment'`** qui ne fait qu'un **paiement unique**. La carte bancaire n'est **pas enregistrée** et les clients ne seront **pas rechargés automatiquement** chaque mois/an.

## ✅ Solution : Mode `subscription`

### Option 1 : Abonnement pur (RECOMMANDÉ pour simplicité)

#### 1️⃣ Créer les produits dans Stripe Dashboard

Allez sur https://dashboard.stripe.com/products et créez :

**Produit 1 : QRGUIDE Mensuel**
- Nom : `QRGUIDE - Formule Mensuelle`
- Prix récurrent : `8€ / mois`
- Copier le **Price ID** → ressemblera à `price_xxxxx_mensuel`

**Produit 2 : QRGUIDE Annuel**
- Nom : `QRGUIDE - Formule Annuelle`
- Prix récurrent : `75€ / an`
- Copier le **Price ID** → ressemblera à `price_xxxxx_annuel`

#### 2️⃣ Modifier server.js pour utiliser les abonnements

```javascript
const PRICE_IDS = {
    mensuel: 'price_xxxxx_mensuel',  // Remplacer par vos vrais Price IDs
    annuel: 'price_xxxxx_annuel'
};

app.post('/create-checkout-session', async (req, res) => {
    try {
        const { plan, plaqueQty, customerInfo, successUrl, cancelUrl } = req.body;

        // Pack Création + Plaques = paiement unique
        let setupFeeAmount = 150; // Pack création
        const plaques = parseInt(plaqueQty) || 0;
        if (plaques > 0) {
            setupFeeAmount += 45 * plaques;
        }

        const line_items = [
            // Abonnement récurrent
            {
                price: PRICE_IDS[plan],
                quantity: 1
            }
        ];

        // Ajouter frais de création + plaques en paiement unique
        if (setupFeeAmount > 0) {
            line_items.push({
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: 'Pack Création QRGUIDE' + (plaques > 0 ? ` + ${plaques} plaque(s) QR` : ''),
                        description: 'Paiement unique'
                    },
                    unit_amount: Math.round(setupFeeAmount * 100)
                },
                quantity: 1
            });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'subscription',  // ← MODE ABONNEMENT
            customer_email: customerInfo.email,
            line_items: line_items,
            success_url: successUrl,
            cancel_url: cancelUrl,
            
            // Important : permet d'ajouter des frais uniques
            payment_intent_data: {
                setup_future_usage: 'off_session'
            },
            
            metadata: {
                plan: plan,
                plaqueQty: plaques.toString(),
                customerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
                customerPhone: customerInfo.phone
            }
        });

        res.json({ sessionId: session.id });
    } catch (error) {
        console.error('❌ Erreur:', error);
        res.status(500).json({ error: error.message });
    }
});
```

#### 3️⃣ Avantages du mode `subscription`

✅ **Paiement automatique** chaque mois/an  
✅ **Carte bancaire enregistrée** de façon sécurisée par Stripe  
✅ **Webhooks automatiques** pour gérer renouvellements  
✅ **Customer Portal** pour que les clients gèrent leur abonnement  
✅ **Retry automatique** si paiement échoué  
✅ **Dunning management** (relances automatiques)

#### 4️⃣ Gérer les annulations/modifications

Stripe fournit un **Customer Portal** où les clients peuvent :
- Voir leurs factures
- Changer de formule (mensuel ↔ annuel)
- Mettre à jour leur CB
- Annuler l'abonnement

```javascript
// Route pour créer le lien vers le portal client
app.post('/create-customer-portal', async (req, res) => {
    const { customerId } = req.body;
    
    const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: 'https://qrguide.fr/compte'
    });
    
    res.json({ url: session.url });
});
```

---

### Option 2 : Paiement initial + setup pour futur

Si vous voulez garder le premier paiement comme un paiement unique (avec Pack Création) puis enregistrer la CB pour le futur :

```javascript
const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'setup',  // Enregistre la CB sans charger
    customer_email: customerInfo.email,
    success_url: successUrl,
    cancel_url: cancelUrl
});

// Puis créer un abonnement après avec la carte enregistrée
```

⚠️ **Plus complexe** - nécessite 2 étapes

---

## 🎯 Recommandation

**Utilisez Option 1 (mode subscription)** :
- 1er paiement = Pack Création (150€) + Plaques + 1er mois/an (8€ ou 75€)
- Puis renouvellement automatique chaque mois/an pour 8€ ou 75€
- La carte est enregistrée automatiquement par Stripe
- Vous n'avez rien à faire, Stripe gère tout

---

## 📧 Configuration Email Automatique

### 1️⃣ Créer un mot de passe d'application Gmail

1. Allez sur https://myaccount.google.com/apppasswords
2. Sélectionnez "Autre (nom personnalisé)"
3. Tapez "QRGUIDE Backend"
4. Copiez le mot de passe généré (16 caractères)

### 2️⃣ Configurer .env sur Render.com

Dans les Environment Variables de votre service Render :

```
EMAIL_USER=contact@qrguide.fr
EMAIL_PASSWORD=abcd efgh ijkl mnop  (mot de passe d'application)
```

### 3️⃣ Configurer le Webhook Stripe

1. Allez sur https://dashboard.stripe.com/webhooks
2. Cliquez "+ Add endpoint"
3. URL : `https://qrguide-backend.onrender.com/webhook`
4. Événements à écouter : `checkout.session.completed`
5. Copiez le **Signing secret** (commence par `whsec_`)
6. Ajoutez-le dans Render : `STRIPE_WEBHOOK_SECRET=whsec_...`

---

## 🧪 Test

1. Déployez le nouveau code sur Render
2. Allez sur qrguide.fr/abonnement.html
3. Remplissez le formulaire et payez avec carte test : `4242 4242 4242 4242`
4. Vous devriez recevoir un **email de confirmation automatique** avec votre logo
5. Dans Stripe Dashboard → Customers, vous verrez le client avec abonnement actif

---

## 💡 Bonus : Afficher le statut d'abonnement

Dans votre espace client, récupérez l'ID customer Stripe et affichez :
- Formule actuelle (mensuel/annuel)
- Date du prochain paiement
- Historique des factures
- Bouton "Gérer mon abonnement" → redirige vers Customer Portal

```javascript
const subscription = await stripe.subscriptions.retrieve(subscriptionId);
console.log('Prochain paiement:', new Date(subscription.current_period_end * 1000));
```

---

## 📞 Questions ?

Si vous avez besoin d'aide pour mettre en place les abonnements récurrents, demandez-moi !
