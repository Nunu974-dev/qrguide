# 🚀 Guide Rapide : Activer les Paiements et le Formulaire de Contact

## ✅ Ce qui a été ajouté

1. **Paiement Stripe** : Bouton "Payer maintenant" avec redirection sécurisée
2. **Formulaire de contact EmailJS** : Bouton "Demander des infos" qui envoie un email
3. **Page de confirmation** : `success.html` après paiement réussi
4. **Guide de configuration** : `SETUP_PAYMENT.md` avec toutes les étapes

## 🔥 Configuration Express (15 minutes)

### Étape 1 : Stripe (5 min)
1. Crée un compte sur https://stripe.com
2. Va dans **Developers → API keys**
3. Copie ta **Publishable key** (pk_test_...)
4. Ouvre `contact.html` ligne 283
5. Remplace `'pk_test_VOTRE_CLE_STRIPE_ICI'` par ta clé

### Étape 2 : Créer les Produits Stripe (5 min)
1. Dans Stripe Dashboard → **Products**
2. Crée 5 produits :
   - **Mensuel** : 8€/mois (recurring monthly)
   - **Annuel** : 75€/an (recurring yearly)
   - **Création** : 35€ (one-time)
   - **Plaque** : 45€ (one-time)
   - **Pack Complet** : 240€ (one-time)
3. Copie chaque **Price ID** (price_...)
4. Remplace dans `contact.html` lignes 287-293

### Étape 3 : EmailJS (5 min)
1. Crée un compte sur https://www.emailjs.com (gratuit)
2. **Email Services** → Connecte Gmail
3. **Email Templates** → Crée un template avec ces variables :
   ```
   {{nom}}, {{email}}, {{telephone}}, {{ville}}, 
   {{type}}, {{nombre}}, {{plan}}, {{options}}, 
   {{total}}, {{message}}
   ```
4. Copie : Service ID, Template ID, Public Key
5. Remplace dans `contact.html` lignes 296-300

## 🎯 Test

**Carte de test Stripe :**
- Numéro : `4242 4242 4242 4242`
- Date : n'importe quelle date future
- CVC : `123`

**Test EmailJS :** Clique sur "Demander des infos"

## 📦 Fichiers modifiés
- ✅ `contact.html` : Formulaire + Stripe + EmailJS
- ✅ `success.html` : Page de confirmation (nouveau)
- ✅ `SETUP_PAYMENT.md` : Guide détaillé
- ✅ `.env.example` : Template de configuration

## 🆘 Besoin d'aide ?

**Erreur Stripe ?**
- Vérifie que la Publishable Key commence par `pk_test_` ou `pk_live_`
- Les Price IDs doivent commencer par `price_`

**Erreur EmailJS ?**
- Vérifie que les 3 IDs sont corrects
- Le template doit contenir toutes les variables {{nom}}, {{email}}, etc.

**Fichier détaillé :** Lis `SETUP_PAYMENT.md` pour le guide complet avec captures d'écran.

## 🚀 Passer en production

Quand tu es prêt :
1. Active ton compte Stripe (vérifie identité)
2. Remplace `pk_test_...` par `pk_live_...`
3. Crée les produits en mode LIVE
4. Utilise les nouveaux Price IDs
5. Teste une vraie transaction !

---

**Note :** Les fichiers sont déjà poussés sur GitHub. Fais un **Pull** sur Hostinger pour mettre à jour le site.
