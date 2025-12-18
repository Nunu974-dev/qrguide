# 🔥 Guide Installation Firebase + Système Multi-Utilisateurs QRGUIDE

## 🎯 Objectif Final

Après paiement Stripe :
1. ✅ Compte utilisateur créé automatiquement dans Firebase
2. ✅ Email de bienvenue avec mot de passe temporaire
3. ✅ Client peut se connecter sur login.html
4. ✅ Client accède à son panneau (max 3 logements)
5. ✅ Toi (super admin) tu vois tous les clients

---

## 📋 Étape 1 : Configuration Firebase Console

### 1. Créer/Configurer le projet Firebase

1. Va sur https://console.firebase.google.com
2. Clique **"Ajouter un projet"** ou sélectionne ton projet existant
3. Nom du projet : `qrguide` ou le nom de ton choix
4. Accepte les conditions et crée le projet

### 2. Activer Authentication

1. Dans le menu latéral → **Authentication**
2. Clique **"Commencer"**
3. Onglet **"Sign-in method"**
4. Active **"E-mail/Mot de passe"** (pas besoin du lien e-mail)
5. Sauvegarde

### 3. Activer Firestore Database

1. Dans le menu latéral → **Firestore Database**
2. Clique **"Créer une base de données"**
3. Mode : **"Commencer en mode production"** (plus sécurisé)
4. Emplacement : Choisis **"europe-west"** (le plus proche)
5. Activer

### 4. Configurer les règles Firestore

Dans Firestore → **Règles**, remplace par :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Utilisateurs : accès en lecture/écriture à son propre profil
    match /users/{userId} {
      allow read: if request.auth != null && 
                     (request.auth.uid == userId || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow write: if request.auth != null && request.auth.uid == userId;
      
      // Logements : client peut gérer ses logements, admin tout voir
      match /logements/{logementId} {
        allow read, write: if request.auth != null && 
                              (request.auth.uid == userId || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      }
    }
    
    // Admin peut tout lire
    match /{document=**} {
      allow read: if request.auth != null && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

Publie les règles.

### 5. Récupérer la configuration Web

1. Paramètres du projet (icône ⚙️) → **Général**
2. Scroll vers le bas → Section **"Vos applications"**
3. Clique sur l'icône **Web** `</>`
4. Nom de l'application : `QRGUIDE Web`
5. Copie la configuration qui ressemble à :

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "qrguide-xxxxx.firebaseapp.com",
  projectId: "qrguide-xxxxx",
  storageBucket: "qrguide-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:xxxxxxxxxxxx"
};
```

6. Colle cette config dans `firebase-config.js` (remplace les valeurs `VOTRE_...`)

### 6. Activer Firebase Admin SDK (pour le backend)

1. Paramètres du projet → **Comptes de service**
2. Clique **"Générer une nouvelle clé privée"**
3. Télécharge le fichier JSON (ex: `qrguide-xxxxx-firebase-adminsdk.json`)
4. ⚠️ **NE PAS COMMITER CE FICHIER !** Il contient des secrets

---

## 📋 Étape 2 : Installation Backend Firebase Admin

### 1. Installer Firebase Admin SDK

Dans le terminal :

```bash
cd /Users/julienchanewai/Desktop/QRGUIDE
npm install firebase-admin
```

### 2. Ajouter la config dans .env

Ouvre le fichier JSON téléchargé à l'étape précédente et copie les valeurs dans `.env` :

```env
# Firebase Admin SDK
FIREBASE_PROJECT_ID=qrguide-xxxxx
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@qrguide-xxxxx.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEF...\n-----END PRIVATE KEY-----\n"
```

⚠️ **Important** : La `FIREBASE_PRIVATE_KEY` doit être entre guillemets et contenir les `\n`

### 3. Modifier server.js pour créer des comptes

Ajoute au début de `server.js` :

```javascript
const admin = require('firebase-admin');

// Initialiser Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  })
});

const firestore = admin.firestore();
```

### 4. Modifier le webhook pour créer le compte

Dans le webhook Stripe, après le paiement réussi, ajoute :

```javascript
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
    try {
        const customerName = session.metadata.customerName || 'Client';
        const customerEmail = session.customer_email;
        const customerPhone = session.metadata.customerPhone || '';
        const plan = session.metadata.plan;
        
        // Générer un mot de passe temporaire
        const tempPassword = Math.random().toString(36).slice(-10) + 'Aa1!';
        
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
            role: 'client', // Rôle client (pas admin)
            plan: plan,
            maxLogements: 3,
            stripeCustomerId: session.customer,
            stripeSubscriptionId: session.subscription || null,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            firstLogin: true // Pour forcer changement de mot de passe
        });
        
        console.log('✅ Document Firestore créé');
        
        // Envoyer email avec mot de passe temporaire
        const customerName = session.metadata.customerName || 'Client';
        const plan = session.metadata.plan;
        const plaques = parseInt(session.metadata.plaqueQty || 0);
        const total = session.metadata.totalAmount;
        
        await sendConfirmationEmail(
            session.customer_email,
            customerName,
            plan,
            plaques,
            total,
            tempPassword // Ajouter le mot de passe dans l'email
        );
        
    } catch (error) {
        console.error('❌ Erreur création compte Firebase:', error);
    }
}
```

### 5. Modifier la fonction sendConfirmationEmail

Modifie les paramètres du template EmailJS pour inclure le mot de passe :

```javascript
async function sendConfirmationEmail(customerEmail, customerName, plan, plaques, total, tempPassword) {
    const templateParams = {
        to_email: customerEmail,
        customer_name: customerName,
        plan: plan === 'mensuel' ? 'Mensuelle (8€/mois)' : 'Annuelle (75€/an)',
        plaques: plaques > 0 ? `${plaques} plaque${plaques > 1 ? 's' : ''}` : 'Aucune',
        total: total + '€',
        login_url: 'https://qrguide.fr/login.html',
        temp_password: tempPassword
    };
    
    // ... reste du code identique
}
```

Puis dans EmailJS Dashboard, modifie ton template pour ajouter :

```html
<div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 5px;">
    <strong>🔐 Vos identifiants de connexion :</strong><br><br>
    <strong>Email :</strong> {{to_email}}<br>
    <strong>Mot de passe temporaire :</strong> <code style="background: #f8f9fa; padding: 4px 8px; border-radius: 4px;">{{temp_password}}</code><br><br>
    <a href="{{login_url}}" style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 12px;">Se connecter à mon compte</a>
</div>
```

---

## 📋 Étape 3 : Créer le compte Super Admin (TOI)

### 1. Créer ton compte manuellement dans Firebase Console

1. Va sur Firebase Console → **Authentication** → **Users**
2. Clique **"Ajouter un utilisateur"**
3. Email : `ton-email@exemple.com`
4. Mot de passe : choisis un mot de passe fort
5. Clique **"Ajouter un utilisateur"**
6. Copie l'**UID** de l'utilisateur créé (ex: `ABC123xyz...`)

### 2. Créer le document Firestore pour ton compte admin

1. Va sur **Firestore Database**
2. Clique **"Démarrer une collection"**
3. ID de collection : `users`
4. ID de document : **Colle ton UID copié**
5. Ajoute ces champs :

```
email: ton-email@exemple.com (string)
displayName: Ton Nom (string)
role: admin (string)
phone: 0692630364 (string)
createdAt: (timestamp - clique sur "timestamp" et laisse la date actuelle)
```

6. Enregistre

### 3. Teste la connexion

1. Va sur `https://qrguide.fr/login.html`
2. Entre ton email et mot de passe
3. Tu devrais être redirigé vers `admin.html` (super admin)

---

## 📋 Étape 4 : Déployer sur Render.com

### 1. Ajouter les variables d'environnement

Sur Render.com, ajoute ces nouvelles variables :

```
FIREBASE_PROJECT_ID=qrguide-xxxxx
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@qrguide-xxxxx.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEv...copie toute la clé...-----END PRIVATE KEY-----\n"
```

⚠️ La clé privée est longue, copie-la entièrement avec les `\n`

### 2. Redéployer

Clique **"Manual Deploy"** → "Deploy latest commit"

---

## 🧪 Étape 5 : Test du flux complet

1. **Va sur** `https://qrguide.fr/abonnement.html`
2. **Remplis** le formulaire avec un vrai email (le tien pour tester)
3. **Paie** avec la carte test : `4242 4242 4242 4242`
4. **Attends** 30 secondes
5. **Vérifie** ton email :
   - ✅ Email de confirmation reçu
   - ✅ Mot de passe temporaire présent
6. **Clique** sur le lien de connexion dans l'email
7. **Connecte-toi** avec le mot de passe temporaire
8. **Tu arrives** sur `mon-compte.html`
9. **Tu peux** créer jusqu'à 3 logements

### Vérifier dans Firebase Console

1. **Authentication** → Tu vois le nouvel utilisateur
2. **Firestore** → Collection `users` → Tu vois le nouveau document

---

## 🎨 Prochaines étapes

Une fois que tout fonctionne, je créerai :

1. ✅ `mon-compte.html` - Panneau client (gestion de 3 logements max)
2. ✅ Modification de `admin.html` - Super admin (vue de tous les clients)
3. ✅ Protection des pages (redirect si pas connecté)
4. ✅ Changement de mot de passe au premier login
5. ✅ Gestion de l'abonnement (voir formule, changer de plan, annuler)

---

## ❓ Questions fréquentes

### Comment créer d'autres admins ?
Crée un utilisateur dans Firebase Auth, puis dans Firestore mets `role: 'admin'`

### Un client peut avoir plus de 3 logements ?
Change `maxLogements` dans son document Firestore

### Comment supprimer un client ?
1. Firebase Auth → Supprime l'utilisateur
2. Firestore → Supprime son document dans `users/{userId}`
3. Stripe → Annule son abonnement

### Les clients peuvent voir les logements des autres ?
Non, les règles Firestore empêchent ça. Chaque client voit seulement ses logements.

---

Tu as configuré Firebase ? Donne-moi ta config et on continue ! 🚀
