# Configuration du Webhook Stripe

## 📋 Étapes de configuration

### 1. Accéder au Dashboard Stripe
- Connectez-vous sur https://dashboard.stripe.com
- Allez dans **Développeurs** → **Webhooks**

### 2. Créer un nouveau webhook
- Cliquez sur **"Add endpoint"** ou **"Ajouter un point de terminaison"**
- URL du webhook : `https://qrguide.fr/stripe-webhook.php`
- Sélectionnez l'événement à écouter : **`checkout.session.completed`**

### 3. Récupérer le secret du webhook
- Une fois créé, Stripe vous donne un **Signing Secret** (commence par `whsec_...`)
- Copiez ce secret

### 4. Ajouter le secret dans .env
Ajoutez cette ligne dans votre fichier `.env` :
```
STRIPE_WEBHOOK_SECRET=whsec_votre_secret_ici
```

### 5. Tester le webhook
- Dans Stripe Dashboard → Webhooks, cliquez sur votre webhook
- Utilisez l'onglet **"Send test webhook"** pour tester
- Vérifiez le fichier `webhook-log.txt` pour voir les logs

## 🔍 Vérification

Après un paiement réussi, le client devrait recevoir :
- ✅ Un email de confirmation
- ✅ Les prochaines étapes détaillées
- ✅ Les informations de contact

## 📝 Logs

Le fichier `webhook-log.txt` enregistre tous les événements reçus et les emails envoyés.

## ⚠️ Important

- Le webhook doit être configuré à la fois en mode **Test** et **Live**
- En production, utilisez toujours le `STRIPE_WEBHOOK_SECRET` pour sécuriser les requêtes
- Vérifiez que `email-config.php` existe avec les bons identifiants SMTP

## 🧪 Test manuel

Pour tester l'envoi d'email sans passer par Stripe, vous pouvez créer un fichier `test-webhook.php` temporaire.
