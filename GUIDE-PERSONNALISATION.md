# 📝 GUIDE DE PERSONNALISATION - QRGUIDE

Ce document explique comment personnaliser facilement votre site QRGUIDE.

## 🎯 Méthode simple (Recommandée)

### Étape 1 : Éditer config.json

Le fichier `data/config.json` contient toutes vos informations personnelles.

**Emplacement** : `data/config.json`

#### Informations d'arrivée

```json
"arrival": {
  "time": "15h00",                    // ← MODIFIEZ l'heure d'arrivée
  "procedure": [                      // ← MODIFIEZ les étapes
    "Votre étape 1",
    "Votre étape 2",
    "Votre étape 3"
  ],
  "wifi": {
    "name": "Nom_de_votre_WiFi",     // ← MODIFIEZ
    "password": "Votre_mot_de_passe"  // ← MODIFIEZ
  }
}
```

#### Contact

```json
"contact": {
  "phone": "+33612345678",           // ← MODIFIEZ votre numéro
  "name": "Votre Nom"                // ← MODIFIEZ votre nom
}
```

#### Départ

```json
"departure": {
  "time": "11h00",                   // ← MODIFIEZ l'heure de départ
  "cleaning": "Le ménage est inclus dans votre réservation.",
  "keyReturn": [
    "Étape 1 pour rendre les clés",
    "Étape 2"
  ]
}
```

### Étape 2 : Sauvegarder et tester

1. Sauvegardez le fichier `config.json`
2. Ouvrez `index.html` dans un navigateur
3. Vérifiez que vos modifications apparaissent

---

## 🎨 Personnalisation avancée

### Modifier les couleurs

**Fichier** : `css/style.css` (ligne 8-15)

```css
:root {
    --primary-color: #FF385C;      /* Couleur des boutons principaux */
    --primary-hover: #E31C5F;      /* Couleur au survol */
    --secondary-color: #00A699;    /* Couleur secondaire (maps) */
    --emergency-color: #DC3545;    /* Couleur urgence (rouge) */
}
```

**Exemples de palettes** :

**Bleu moderne :**
```css
--primary-color: #0066CC;
--primary-hover: #0052A3;
--secondary-color: #00A8E8;
```

**Vert nature :**
```css
--primary-color: #34A853;
--primary-hover: #2D8E47;
--secondary-color: #0F9D58;
```

**Orange chaleureux :**
```css
--primary-color: #FF6B35;
--primary-hover: #E55B2B;
--secondary-color: #F77F00;
```

### Modifier le titre d'accueil

**Fichier** : `index.html` (ligne 16-18)

```html
<h1>🏡 Bienvenue dans votre logement</h1>
<p class="subtitle">Toutes les infos utiles pour votre séjour</p>
```

Changez le texte comme vous le souhaitez :

```html
<h1>🌴 Bienvenue au Paradise Beach</h1>
<p class="subtitle">Votre guide de séjour complet</p>
```

### Modifier les icônes

Les icônes sont des emojis, vous pouvez les changer facilement :

**Dans index.html** :

```html
<div class="card-icon">🕓</div>  <!-- Arrivée -->
<div class="card-icon">🚪</div>  <!-- Départ -->
<div class="card-icon">🏠</div>  <!-- Équipements -->
<div class="card-icon">📍</div>  <!-- À proximité -->
<div class="card-icon">🚨</div>  <!-- Urgence -->
<div class="card-icon">❓</div>  <!-- Infos -->
```

**Emojis alternatifs** :
- Arrivée : 🏠 🔑 ⏰ 🚗
- Départ : 👋 🧳 🚪 ✈️
- Équipements : 🛋️ 🔌 📺 🍳
- Proximité : 🗺️ 🏖️ 🏪 🍽️
- Urgence : ⚠️ 🆘 📞 🚑
- Infos : ℹ️ 📋 📖 💡

---

## 📄 Modifier le contenu des pages

### Page Arrivée (arrivee.html)

**Modifier le code Wi-Fi** (ligne 35-40) :

```html
<p class="wifi-value" id="wifi-name">Nom_de_votre_WiFi</p>
<p class="wifi-value" id="wifi-password">Votre_mot_de_passe</p>
```

**Modifier le numéro de téléphone** (ligne 48-51) :

```html
<a href="tel:+33612345678" class="contact-button">
<p class="contact-number">+33 6 12 34 56 78</p>
```

### Page Équipements (equipements.html)

**Ajouter un équipement** :

```html
<div class="equipment-item">
    <span class="equipment-icon">🔥</span>
    <div>
        <p class="equipment-name">Nom de l'équipement</p>
        <p class="equipment-note">Instructions d'utilisation</p>
    </div>
</div>
```

### Page À proximité (proximite.html)

**Ajouter un lieu** :

```html
<div class="place-card">
    <div class="place-info">
        <h3 class="place-name">Nom du lieu</h3>
        <p class="place-distance">🚶 10 min à pied</p>
        <p class="place-description">Description</p>
    </div>
    <a href="https://www.google.com/maps/search/Nom+du+lieu" target="_blank" class="map-button">
        📍 Ouvrir
    </a>
</div>
```

### Page Urgence (urgence.html)

**Modifier le numéro du propriétaire** (ligne 21-24) :

```html
<a href="tel:+33612345678" class="emergency-button">
<p class="contact-number large-number">+33 6 12 34 56 78</p>
```

### Page Infos pratiques (infos.html)

**Modifier la politique animaux** (ligne 33) :

```html
<p class="info-text">
    <strong>Non autorisés</strong> sauf accord préalable du propriétaire.
</p>
```

OU

```html
<p class="info-text">
    <strong>Acceptés</strong> avec supplément de 20€/séjour.
</p>
```

---

## 🗺️ Liens Google Maps personnalisés

Pour créer un lien vers un lieu précis :

1. Ouvrez Google Maps
2. Cherchez votre lieu
3. Cliquez sur "Partager"
4. Copiez le lien
5. Remplacez dans le code :

```html
<!-- Avant -->
<a href="https://www.google.com/maps/search/Carrefour+City" target="_blank">

<!-- Après -->
<a href="https://goo.gl/maps/VotreCode" target="_blank">
```

---

## 📱 Tester vos modifications

### Sur ordinateur

1. Ouvrez `index.html` dans Chrome
2. Appuyez sur `F12`
3. Cliquez sur l'icône mobile (📱) en haut à gauche
4. Sélectionnez "iPhone 12 Pro" ou similaire

### Sur smartphone

#### Méthode 1 : USB
1. Connectez votre smartphone à votre PC
2. Activez le débogage USB (Android)
3. Accédez aux fichiers depuis Chrome

#### Méthode 2 : Hébergement local
1. Installez XAMPP ou MAMP
2. Placez les fichiers dans `htdocs`
3. Accédez à `http://localhost/QRGUIDE`

---

## 🚀 Mise en ligne

### Option 1 : Netlify (Recommandée)

1. Créez un compte sur [netlify.com](https://netlify.com)
2. Glissez-déposez le dossier QRGUIDE
3. Votre site est en ligne !
4. URL : `https://votre-nom.netlify.app`

### Option 2 : GitHub Pages

1. Créez un dépôt GitHub
2. Uploadez tous les fichiers
3. Activez GitHub Pages dans les paramètres
4. URL : `https://votre-nom.github.io/QRGUIDE`

### Option 3 : Vercel

1. Créez un compte sur [vercel.com](https://vercel.com)
2. Importez votre projet
3. Déployez en un clic
4. URL : `https://votre-projet.vercel.app`

---

## 🔍 Dépannage

### Le Wi-Fi ne s'affiche pas

Vérifiez `data/config.json` :
```json
"wifi": {
  "name": "VotreWiFi",   // Vérifiez les guillemets
  "password": "MotDePasse"
}
```

### Les couleurs ne changent pas

1. Videz le cache du navigateur : `Ctrl + F5`
2. Vérifiez que `style.css` est bien chargé
3. Ouvrez la console (F12) pour voir les erreurs

### Les liens téléphone ne fonctionnent pas

Format correct :
```html
<a href="tel:+33612345678">  <!-- Avec + et code pays -->
```

Format incorrect :
```html
<a href="tel:06 12 34 56 78">  <!-- Espaces non recommandés -->
```

---

## 📞 Aide supplémentaire

Si vous avez besoin d'aide :

1. Vérifiez la console du navigateur (F12)
2. Lisez le README.md
3. Testez sur un autre navigateur
4. Comparez avec les fichiers d'origine

---

**Bon courage pour la personnalisation ! 🎨**
