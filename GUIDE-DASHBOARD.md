# 🎛️ GUIDE DU DASHBOARD ADMIN - QRGUIDE

Guide complet pour utiliser votre dashboard d'administration.

---

## 🚀 Accès au Dashboard

**URL** : Ouvrez `admin.html` dans votre navigateur

```
file:///chemin/vers/QRGUIDE/admin.html
```

Ou après hébergement :
```
https://votre-site.com/admin.html
```

---

## 📋 Fonctionnalités principales

### 1. **Gestion des clients**

#### Créer un nouveau client
1. Cliquez sur **"➕ Nouveau Client"**
2. Remplissez le formulaire :
   - 🏠 **Nom du logement** (obligatoire)
   - 👤 **Nom du client** (obligatoire)
   - 📞 **Téléphone** (obligatoire)
   - 📍 **Adresse** (optionnel)

#### Informations d'arrivée
- ⏰ **Heure d'arrivée** (ex: 15:00)
- 🔑 **Procédure d'entrée** (étapes personnalisables)
- 📶 **Wi-Fi** (nom et mot de passe)

#### Informations de départ
- ⏰ **Heure de départ** (ex: 11:00)
- 🧹 **Information ménage**
- 🔑 **Restitution des clés** (étapes personnalisables)

#### Règlement
- 🔇 **Heures de calme**
- 👥 **Nombre max de personnes**
- 🚭 **Fumeurs** (autorisé/interdit)
- 🐾 **Animaux** (autorisé/interdit)

#### Parking
- 🅿️ **Parking inclus** (oui/non)
- 📍 **Numéro de place**
- 🔢 **Code d'accès**

3. Cliquez sur **"💾 Enregistrer"**

---

### 2. **Actions sur les clients**

Pour chaque client, vous avez 5 boutons :

| Bouton | Action | Description |
|--------|--------|-------------|
| **👁️ Voir** | Prévisualiser | Voir la page du client dans une fenêtre |
| **✏️ Éditer** | Modifier | Éditer toutes les informations |
| **📱 QR** | QR Code | Générer et télécharger le QR code |
| **📥 Export** | Exporter | Télécharger la page HTML complète |
| **🗑️ Supprimer** | Effacer | Supprimer le client (avec confirmation) |

---

### 3. **Recherche de clients**

Utilisez la barre de recherche pour filtrer vos clients :
```
🔍 Rechercher un client...
```

La recherche fonctionne sur :
- Nom du logement
- Nom du client
- Numéro de téléphone
- Nom du Wi-Fi

---

### 4. **Générer un QR Code**

1. Cliquez sur **"📱 QR"** pour un client
2. Le QR Code s'affiche avec l'URL
3. Cliquez sur **"💾 Télécharger"** pour enregistrer l'image
4. Imprimez et placez-le dans votre logement

**Format** : PNG 300x300 pixels

---

### 5. **Exporter un client**

**Option 1 : Export HTML individuel**
1. Cliquez sur **"📥 Export"** pour un client
2. Télécharge un fichier `.html` complet
3. Uploadez-le sur votre hébergeur

**Option 2 : Export de tous les clients**
1. Allez dans **"⚙️ Paramètres"**
2. Cliquez sur **"📥 Exporter tous les clients"**
3. Télécharge un fichier `qrguide_clients.json`
4. Conservez-le comme sauvegarde

---

### 6. **Importer des clients**

Pour restaurer ou transférer vos données :

1. Allez dans **"⚙️ Paramètres"**
2. Cliquez sur **"📤 Importer des clients"**
3. Sélectionnez votre fichier `.json`
4. Confirmez l'importation

⚠️ **Attention** : Cela remplacera toutes vos données actuelles !

---

## 🛠️ Personnalisation

### Ajouter une étape de procédure

**Pour l'arrivée :**
1. Dans le formulaire, section **"🕓 Arrivée"**
2. Cliquez sur **"➕ Ajouter une étape"**
3. Tapez votre texte
4. Cliquez sur **"🗑️"** pour supprimer une étape

**Pour le départ :**
1. Section **"🚪 Départ"**
2. Même principe pour "Restitution des clés"

---

## 💾 Sauvegarde des données

### Stockage local
- Les données sont stockées dans le **LocalStorage** de votre navigateur
- Elles restent même après fermeture du navigateur
- ⚠️ Si vous videz le cache, les données sont perdues

### Bonnes pratiques
1. **Exportez régulièrement** vos clients (JSON)
2. Conservez les exports comme **sauvegarde**
3. Testez l'**import** pour vérifier

---

## 🌐 Déploiement

### Étape 1 : Héberger le dashboard

Le dashboard doit être hébergé sur un serveur pour fonctionner à distance.

**Options recommandées :**

#### Netlify
1. Créez un compte sur [netlify.com](https://netlify.com)
2. Glissez-déposez le dossier QRGUIDE
3. Votre dashboard : `https://votre-nom.netlify.app/admin.html`

#### Vercel
1. Créez un compte sur [vercel.com](https://vercel.com)
2. Importez votre projet
3. Déployez : `https://votre-projet.vercel.app/admin.html`

---

### Étape 2 : Créer des pages pour chaque client

**Méthode manuelle :**
1. Exportez un client (bouton 📥)
2. Renommez le fichier : `client-jean-dupont.html`
3. Uploadez sur votre hébergeur
4. URL : `https://votre-site.com/client-jean-dupont.html`

**Méthode automatique (avancée) :**
Créez un dossier `/clients/` et générez automatiquement :
```
/clients/client_123456.html
/clients/client_789012.html
```

---

### Étape 3 : Générer les QR codes

Pour chaque client :
1. Notez l'URL de sa page
2. Générez le QR Code depuis le dashboard
3. Téléchargez l'image
4. Imprimez et plastifiez

---

## 🔒 Sécurité

### Protection du dashboard

Le dashboard actuel n'a **pas d'authentification**. Voici comment le protéger :

#### Option 1 : Fichier .htaccess (Apache)
```apache
AuthType Basic
AuthName "Zone Protégée"
AuthUserFile /chemin/.htpasswd
Require valid-user
```

#### Option 2 : Netlify Password Protection
1. Settings → Access Control
2. Activer "Password Protection"
3. Définir un mot de passe

#### Option 3 : Authentification JavaScript simple
```javascript
const PASSWORD = "votre_mot_de_passe";
const entered = prompt("Mot de passe :");
if (entered !== PASSWORD) {
    window.location.href = "index.html";
}
```

---

## 🆘 Dépannage

### Les clients ne s'affichent pas
- Vérifiez la console (F12) pour les erreurs
- Videz le cache : `Ctrl + Shift + Delete`
- Vérifiez que `admin.js` est bien chargé

### Le QR Code ne se génère pas
- Vérifiez votre connexion internet (librairie CDN)
- Ouvrez la console pour voir l'erreur
- Utilisez un générateur externe : [qr-code-generator.com](https://www.qr-code-generator.com/)

### Les données ont disparu
- Les données sont dans le **LocalStorage**
- Si vous avez vidé le cache, elles sont perdues
- **Solution** : Restaurez depuis votre dernier export JSON

### L'export HTML ne fonctionne pas
- Vérifiez les popups bloquées
- Autorisez les téléchargements
- Essayez sur un autre navigateur

---

## 📊 Workflow recommandé

### 1. Configuration initiale
```
✓ Créer tous vos clients
✓ Vérifier les informations
✓ Exporter en JSON (sauvegarde)
```

### 2. Pour chaque client
```
✓ Exporter la page HTML
✓ Uploader sur votre hébergeur
✓ Générer le QR Code
✓ Télécharger et imprimer
✓ Plastifier et afficher dans le logement
```

### 3. Maintenance
```
✓ Mettre à jour les infos si besoin
✓ Exporter à nouveau
✓ Re-uploader la page
✓ Le QR Code reste le même !
```

---

## 🎨 Personnalisation avancée

### Modifier les couleurs du dashboard

Dans `css/admin.css`, ligne 8 :

```css
:root {
    --admin-primary: #FF385C;      /* Couleur principale */
    --admin-sidebar-bg: #2C3E50;   /* Couleur sidebar */
}
```

### Ajouter des champs personnalisés

Dans `admin.html`, ajoutez dans le formulaire :

```html
<div class="form-group">
    <label for="mon-champ">Mon nouveau champ</label>
    <input type="text" id="mon-champ" placeholder="Valeur">
</div>
```

Dans `admin.js`, ajoutez dans `handleFormSubmit` :

```javascript
monChamp: getValue('mon-champ'),
```

---

## 💡 Astuces

### Dupliquer un client
1. Éditez un client existant
2. Modifiez le nom
3. Enregistrez → Crée un nouveau client

### Batch import
Créez un fichier JSON avec tous vos clients :
```json
[
  {
    "propertyName": "Appartement 1",
    "clientName": "Jean Dupont",
    ...
  },
  {
    "propertyName": "Appartement 2",
    "clientName": "Marie Martin",
    ...
  }
]
```

Importez-le en une fois !

---

## 📞 Support

Si vous avez des questions :
1. Vérifiez ce guide
2. Consultez le README.md
3. Ouvrez la console (F12) pour voir les erreurs

---

**Version Dashboard** : 1.0.0  
**Dernière mise à jour** : Décembre 2024

Bon travail avec votre Dashboard QRGUIDE ! 🎉
