# Configuration Stripe Payment Links - QRGUIDE

## ✅ Solution ultra simple (pas de PHP, pas de Composer)

Les Payment Links Stripe sont des liens directs créés dans le Dashboard Stripe. C'est la méthode la plus simple pour accepter des paiements !

## 📋 Étapes de configuration

### 1. Créer les Payment Links dans Stripe

Allez sur : https://dashboard.stripe.com/test/payment-links

#### Payment Link 1 : Formule Mensuelle (158€)

1. Cliquez sur **"+ Nouveau lien de paiement"**
2. Remplissez :
   - **Produit** : Pack Création + Abonnement Mensuel
   - **Prix** : 158€ (paiement unique)
   - **Description** : Pack Création (35€) + Premier mois d'abonnement (8€)
3. **Paramètres avancés** :
   - URL de réussite : `https://qrguide.fr/success.html`
   - URL d'annulation : `https://qrguide.fr/abonnement.html`
   - Collecte email client : ✅ Activé
   - Collecte adresse : ✅ Activé
4. Cliquez sur **"Créer le lien"**
5. **Copiez le lien** (commence par `https://buy.stripe.com/...`)

#### Payment Link 2 : Formule Annuelle (225€)

1. Cliquez sur **"+ Nouveau lien de paiement"**
2. Remplissez :
   - **Produit** : Pack Création + Abonnement Annuel
   - **Prix** : 225€ (paiement unique)
   - **Description** : Pack Création 35€) + Abonnement annuel (75€)
3. **Paramètres avancés** :
   - URL de réussite : `https://qrguide.fr/success.html`
   - URL d'annulation : `https://qrguide.fr/abonnement.html`
   - Collecte email client : ✅ Activé
   - Collecte adresse : ✅ Activé
4. Cliquez sur **"Créer le lien"**
5. **Copiez le lien**

### 2. Mettre à jour le code

Dans le fichier `abonnement.html`, lignes ~640-644, remplacez les liens :

```javascript
const STRIPE_PAYMENT_LINKS = {
    mensuel: 'https://buy.stripe.com/VOTRE_LIEN_MENSUEL',
    annuel: 'https://buy.stripe.com/VOTRE_LIEN_ANNUEL'
};
```

### 3. Tester

1. Allez sur https://qrguide.fr/abonnement.html
2. Sélectionnez une formule
3. Cliquez sur "Payer maintenant"
4. Vous êtes redirigé vers Stripe
5. Testez avec la carte : **4242 4242 4242 4242**

### 4. Passer en production

1. Créez les mêmes Payment Links en mode **Live** (pas Test)
2. Remplacez les liens dans le code
3. C'est tout ! ✅

## 🎯 Avantages des Payment Links

✅ **Zero code** - Pas de PHP, pas de Composer
✅ **Sécurisé** - Stripe héberge tout
✅ **Simple** - 5 minutes de config
✅ **Fiable** - Solution officielle Stripe
✅ **Mobile-ready** - Optimisé automatiquement

## 💡 Pour les plaques QR (optionnel)

Pour le moment, les plaques ne sont pas gérées automatiquement. 

**Option 1** : Créer des Payment Links supplémentaires
- Formule Mensuel + 1 plaque (203€)
- Formule Mensuel + 2 plaques (248€)
- Etc.

**Option 2** : Demander aux clients de vous contacter pour les plaques

## 📞 Support

Si vous avez des questions :
- Documentation Stripe : https://stripe.com/docs/payment-links
- Pas besoin d'installer quoi que ce soit sur le serveur ! 🎉
