# 🔧 Déploiement des Règles Firebase

## ⚠️ ATTENTION : 2 Types de Règles Différentes !

Firebase a **DEUX systèmes distincts** avec des règles séparées :

### 1️⃣ **FIRESTORE DATABASE** = Base de données (utilisateurs, logements, guides)
### 2️⃣ **STORAGE** = Stockage de fichiers (photos, images)

---

## 📋 ÉTAPE 1 : Règles FIRESTORE DATABASE

### ➡️ Où ? 
Console Firebase → **Firestore Database** → **Règles** (onglet Rules)

### ➡️ Quoi copier ?
Le contenu du fichier **`firestore.rules`** :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Collection users
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /logements/{logementId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Collection guides - publique
    match /guides/{guideId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Pages (livre d'or)
    match /pages/{pageId} {
      allow read: if true;
      allow write: if true;
      
      match /entries/{entryId} {
        allow read: if true;
        allow write: if true;
      }
    }
  }
}
```

### ➡️ Comment ?
1. Allez sur [console.firebase.google.com](https://console.firebase.google.com)
2. Sélectionnez votre projet **qrguide**
3. Dans le menu gauche → **Firestore Database**
4. Cliquez sur l'onglet **Règles** (Rules)
5. **Remplacez TOUT le contenu** par le code ci-dessus
6. Cliquez sur **Publier** (Publish)

---

## 📁 ÉTAPE 2 : Règles STORAGE

### ➡️ Où ?
Console Firebase → **Storage** → **Règles** (onglet Rules)

### ➡️ Quoi copier ?
Le contenu du fichier **`storage.rules`** :

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Photos de logements
    match /logements/{userId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Avatars des hôtes
    match /avatars/{userId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Autres fichiers
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### ➡️ Comment ?
1. Dans la console Firebase, menu gauche → **Storage**
2. Cliquez sur l'onglet **Règles** (Rules)
3. **Remplacez TOUT le contenu** par le code ci-dessus
4. Cliquez sur **Publier** (Publish)

---

## ✅ Vérification

Après avoir publié les deux règles :

1. **Reconnectez-vous** sur votre site
2. Vous devriez voir :
   - ✅ Votre nom dans l'en-tête
   - ✅ Vos logements listés
   - ✅ Possibilité d'uploader des photos

---

## 🆘 En cas de problème

Si vous voyez encore "Missing or insufficient permissions" :

1. Vérifiez que vous avez publié les règles dans **LES DEUX endroits**
2. Déconnectez-vous et reconnectez-vous
3. Videz le cache de votre navigateur (Ctrl+Shift+R ou Cmd+Shift+R)
4. Vérifiez dans la console Firebase que les règles sont bien actives

---

## 📊 Résumé des Différences

| **Firestore Database** | **Storage** |
|------------------------|-------------|
| Base de données (texte, objets) | Fichiers (images, PDF, etc.) |
| `firestore.rules` | `storage.rules` |
| Collection `users`, `guides` | Dossiers `logements/`, `avatars/` |
| Onglet "Firestore Database" | Onglet "Storage" |

---

**⚠️ NE PAS CONFONDRE** : Les règles Storage ne vont PAS dans Firestore, et vice-versa !
