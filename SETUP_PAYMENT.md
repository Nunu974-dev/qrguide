# Configuration Guide QRGUIDE

## 🔐 Stripe Payment Setup

### 1. Créer un compte Stripe
1. Allez sur https://dashboard.stripe.com/register
2. Créez votre compte
3. Activez le mode Test

### 2. Obtenir vos clés API
1. Allez dans **Developers** → **API keys**
2. Copiez votre **Publishable key** (pk_test_...)
3. Collez-la dans `contact.html` ligne ~380 :
   ```javascript
   const stripe = Stripe('pk_test_VOTRE_CLE_ICI');
   ```

### 3. Créer les 3 produits Stripe OBLIGATOIRES
Dans le Dashboard Stripe :
1. **Products** → **Add Product**
2. Créez UNIQUEMENT ces 3 produits :

   **Abonnement Mensuel**
   - Name: "QRGuide - Abonnement Mensuel"
   - Price: 8€/month (recurring)
   - Copiez le Price ID (price_...)

   **Abonnement Annuel**
   - Name: "QRGuide - Abonnement Annuel"
   - Price: 75€/year (recurring)
   - Copiez le Price ID

   **Pack Création** (inclus automatiquement avec chaque abonnement)
   - Name: "QRGuide - Pack Création"
   - Price: 150€ (one-time)
   - Copiez le Price ID

   **Plaque QR Code** (optionnel, quantité variable)
   - Name: "QRGuide - Plaque Professionnelle"
   - Price: 45€ (one-time)
   - Copiez le Price ID

4. Remplacez les 4 Price IDs dans `contact.html` lignes 328-332 :
   ```javascript
   const STRIPE_PRICES = {
       mensuel: 'price_VOTRE_ID_MENSUEL',
       annuel: 'price_VOTRE_ID_ANNUEL',
       creation: 'price_VOTRE_ID_CREATION',
       plaque: 'price_VOTRE_ID_PLAQUE'
   };
   ```

### 4. Configurer le Success/Cancel URLs
Dans chaque produit Stripe, configurez :
- Success URL: `https://qrguide.fr/success.html`
- Cancel URL: `https://qrguide.fr/contact.html`

---

## 📧 EmailJS Setup (Formulaire de contact)

### 1. Créer un compte EmailJS
1. Allez sur https://www.emailjs.com/
2. Créez un compte gratuit (200 emails/mois)

### 2. Configurer le service Email
1. **Email Services** → **Add New Service**
2. Choisissez votre provider (Gmail recommandé)
3. Copiez le **Service ID**

### 3. Créer le template Email
1. **Email Templates** → **Create New Template**
2. Template Name: "QRGUIDE Contact Form"
3. Utilisez ce template :

   ```
   Nouvelle demande QRGUIDE

   Informations client :
   - Nom : {{nom}}
   - Email : {{email}}
   - Téléphone : {{telephone}}
   - Ville : {{ville}}

   Logement :
   - Type : {{type}}
   - Nombre : {{nombre}}

   Commande :
   - Formule : {{plan}}
   - Options : {{options}}
   - Total : {{total}}

   Message :
   {{message}}
   ```

4. Copiez le **Template ID**

### 4. Obtenir la Public Key
1. **Account** → **General**
2. Copiez votre **Public Key**

### 5. Ajouter les IDs dans contact.html
Ligne ~290 :
```javascript
emailjs.init('VOTRE_PUBLIC_KEY');
```

Ligne ~300 :
```javascript
emailjs.send('VOTRE_SERVICE_ID', 'VOTRE_TEMPLATE_ID', templateParams)
```

---

## ✅ Test

### Mode Test Stripe
Utilisez ces cartes de test :
- **Succès** : 4242 4242 4242 4242
- **Échec** : 4000 0000 0000 0002
- Date : n'importe quelle date future
- CVC : n'importe quels 3 chiffres

### Basculer en Production
1. Dans Stripe Dashboard, activez votre compte
2. Remplacez `pk_test_...` par `pk_live_...`
3. Utilisez les Price IDs de production

---

## 📝 Fichiers modifiés
- `contact.html` : Formulaire + Stripe + EmailJS
- `success.html` : Page de confirmation (à créer)
- `.env.example` : Template de configuration
