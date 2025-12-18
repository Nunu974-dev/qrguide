# 🚀 Déploiement du Backend QRGUIDE sur Render.com

Ce guide vous explique comment héberger **gratuitement** le backend Node.js de QRGUIDE sur Render.com (comme votre site Cinnad'moun).

---

## 📋 Prérequis

- ✅ Un compte GitHub (pour pusher le code)
- ✅ Un compte Render.com (gratuit)
- ✅ Votre clé secrète Stripe (sur https://dashboard.stripe.com/test/apikeys)

---

## 🎯 Étape 1 : Préparer le code pour GitHub

### 1.1 Créer le fichier `.env` local (pour tester)

```bash
cd /Users/julienchanewai/Desktop/QRGUIDE
cp .env.example .env
```

Ouvrez `.env` et ajoutez votre clé Stripe :
```env
STRIPE_SECRET_KEY=sk_test_VOTRE_VRAIE_CLE_ICI
PORT=3000
```

### 1.2 Vérifier que `.gitignore` exclut `.env`

Le fichier `.gitignore` doit contenir :
```
.env
node_modules/
.DS_Store
```

✅ **Déjà fait !** Votre `.gitignore` est correct.

---

## 🎯 Étape 2 : Pusher le code sur GitHub

```bash
cd /Users/julienchanewai/Desktop/QRGUIDE

# Ajouter tous les fichiers
git add server.js package.json .env.example .gitignore

# Commit
git commit -m "Backend Node.js avec Stripe - montants dynamiques"

# Push
git push origin main
```

⚠️ **Vérification importante :** Votre fichier `.env` ne doit PAS être sur GitHub !

---

## 🎯 Étape 3 : Créer le service sur Render.com

### 3.1 Se connecter à Render

1. Allez sur https://render.com
2. Connectez-vous (ou créez un compte gratuit)
3. Connectez votre compte GitHub

### 3.2 Créer un nouveau Web Service

1. Cliquez sur **"New +"** → **"Web Service"**
2. Sélectionnez votre repo **qrguide**
3. Configurez :

| Paramètre | Valeur |
|-----------|--------|
| **Name** | `qrguide-backend` |
| **Region** | Europe (Paris) ou plus proche |
| **Branch** | `main` |
| **Root Directory** | (laisser vide) |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | **Free** 🆓 |

4. Cliquez sur **"Create Web Service"**

### 3.3 Ajouter les variables d'environnement

Une fois le service créé :

1. Allez dans l'onglet **"Environment"**
2. Cliquez sur **"Add Environment Variable"**
3. Ajoutez :

| Key | Value |
|-----|-------|
| `STRIPE_SECRET_KEY` | `sk_test_VOTRE_VRAIE_CLE` |

4. Cliquez sur **"Save Changes"**

Le service va redémarrer automatiquement.

---

## 🎯 Étape 4 : Récupérer l'URL du backend

Une fois déployé (5-10 minutes), vous aurez une URL comme :

```
https://qrguide-backend.onrender.com
```

📋 **Copiez cette URL !** Vous en aurez besoin pour le frontend.

---

## 🎯 Étape 5 : Mettre à jour le frontend

### 5.1 Modifier `abonnement.html`

Ouvrez `/Users/julienchanewai/Desktop/QRGUIDE/abonnement.html` et remplacez :

```javascript
// AVANT
const BACKEND_URL = 'https://qrguide-backend.onrender.com'; // ⚠️ À MODIFIER

// APRÈS (avec votre vraie URL Render)
const BACKEND_URL = 'https://qrguide-backend.onrender.com'; // ✅ URL réelle
```

### 5.2 Ajouter votre clé publique Stripe

Dans le même fichier, remplacez :

```javascript
// AVANT
const stripe = Stripe('pk_test_VOTRE_CLE_PUBLIQUE_STRIPE'); // ⚠️ À MODIFIER

// APRÈS (avec votre vraie clé publique)
const stripe = Stripe('pk_test_51Q...'); // ✅ Votre clé publique
```

Trouvez votre clé publique sur : https://dashboard.stripe.com/test/apikeys

### 5.3 Commit et push

```bash
git add abonnement.html
git commit -m "Configuration backend Render + clé publique Stripe"
git push origin main
```

---

## 🧪 Étape 6 : Tester le paiement

1. Allez sur **https://qrguide.fr/abonnement.html**
2. Sélectionnez une formule (Mensuel ou Annuel)
3. Remplissez le formulaire
4. Cliquez sur **"Payer maintenant"**
5. Vous devriez être redirigé vers Stripe Checkout

### Carte de test Stripe

Utilisez ces informations pour tester :

- **Numéro** : `4242 4242 4242 4242`
- **Date** : N'importe quelle date future
- **CVC** : N'importe quel 3 chiffres
- **Code postal** : N'importe lequel

---

## 🔍 Vérifier que tout fonctionne

### Dans Render.com

1. Allez dans votre service **qrguide-backend**
2. Cliquez sur **"Logs"**
3. Vous devriez voir :

```
🚀 QRGUIDE Backend démarré sur le port 10000
✅ Stripe configuré avec clé: ✓ OK
```

### Dans Stripe Dashboard

1. Allez sur https://dashboard.stripe.com/test/payments
2. Après un test de paiement, vous devriez voir la transaction

---

## ⚡ Optimisation : Éviter le temps de réveil (comme Cinnad'moun)

Render.com met en veille les services gratuits après 15 minutes d'inactivité.  
Premier paiement = 30-50 secondes d'attente.

### Solution : Ping automatique au chargement de page

Ajoutez dans `abonnement.html` (comme Cinnad'moun) :

```javascript
// Réveiller le backend au chargement
fetch(`${BACKEND_URL}/`)
    .then(res => res.json())
    .then(data => console.log('✅ Backend prêt:', data.status))
    .catch(() => console.log('⚠️ Backend en cours de réveil...'));
```

---

## 📊 Montants calculés automatiquement

Le backend calcule automatiquement :

| Formule | Calcul | Total |
|---------|--------|-------|
| **Mensuel** | 150€ (Pack) + 8€ (Mois 1) | **158€** |
| **Annuel** | 150€ (Pack) + 75€ (An 1) | **225€** |
| **Mensuel + 1 plaque** | 158€ + 45€ | **203€** |
| **Mensuel + 2 plaques** | 158€ + 90€ | **248€** |
| **Annuel + 1 plaque** | 225€ + 45€ | **270€** |

Tout est dans `server.js` lignes 26-31 :
```javascript
const PRICES = {
    packCreation: 150,
    mensuel: 8,
    annuel: 75,
    plaqueQR: 45
};
```

---

## 🆘 Problèmes courants

### Le backend ne démarre pas

Vérifiez les logs Render :
```
Settings → Logs
```

### Erreur "STRIPE_SECRET_KEY missing"

Vérifiez que la variable d'environnement est bien configurée :
```
Environment → Environment Variables
```

### Paiement ne fonctionne pas

1. Vérifiez la console du navigateur (F12)
2. Vérifiez que `BACKEND_URL` est correct
3. Vérifiez que votre clé publique Stripe est valide

---

## 🎉 C'est fini !

Votre backend est maintenant :
- ✅ Hébergé gratuitement sur Render.com
- ✅ Calcule automatiquement les montants
- ✅ Gère les plaques QR sans config manuelle
- ✅ Identique à votre site Cinnad'moun

**Plus besoin de créer des Payment Links manuellement !** 🚀
