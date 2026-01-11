# 🎨 GUIDE - Design des Guides Clients

## ✅ Problème résolu

Les guides créés par les clients utilisent maintenant **automatiquement le même design** que le guide démo.

---

## 📋 Comment ça fonctionne ?

### 1. **Fichier unique pour tous les guides**
Tous les guides clients utilisent le même fichier : `/guide.html?id=XXX`

### 2. **Design centralisé**
Le fichier `guide.html` charge :
- ✅ **CSS** : `demo-guide/css/style.css` (design premium)
- ✅ **JavaScript** : `demo-guide/js/main.js` et `translations.js`
- ✅ **Structure HTML** : Identique au guide démo

### 3. **Données dynamiques**
Chaque guide charge ses propres données depuis Firestore :
```
Collection: guides
Document ID: XXX (8 caractères)
```

---

## 🧪 Tester le système

### Option 1 : Créer un guide de test
1. Ouvrez : `https://qrguide.fr/test-guide-generation.html`
2. Cliquez sur **"🚀 Créer un Guide de Test"**
3. Cliquez sur **"👁️ Voir le guide"**
4. Vérifiez que le design est identique au guide démo

### Option 2 : Créer un vrai guide
1. Connectez-vous à votre compte : `https://qrguide.fr/mon-compte.html`
2. Créez un nouveau logement avec vos informations
3. Cliquez sur le lien du guide généré
4. Vérifiez que tout s'affiche correctement

---

## 🎨 Ce qui est partagé entre tous les guides

### Design
- ✅ Header avec photo et météo
- ✅ Horloge en temps réel
- ✅ Sélecteur de langues (🇫🇷 🇬🇧 🇪🇸 🇩🇪)
- ✅ Cartes de navigation colorées
- ✅ Modales élégantes pour chaque section
- ✅ Footer avec logo

### Fonctionnalités
- ✅ Traduction multilingue
- ✅ Météo en temps réel
- ✅ Navigation fluide
- ✅ Responsive mobile
- ✅ Animations et transitions

### Sections
- ✨ Bienvenue / Arrivée
- 🚪 Départ
- 📶 Wi-Fi
- 🏠 Équipements
- 🍽️ Restaurants
- 🌴 Activités
- 📍 Commerces à proximité
- 🚨 Urgence
- ❤️ Votre hôte
- 📋 Infos pratiques

---

## 🔧 Structure technique

```
guide.html (fichier principal)
    │
    ├── Charge le CSS : demo-guide/css/style.css
    │   └── Tous les styles du guide premium
    │
    ├── Charge les JS :
    │   ├── demo-guide/js/main.js (fonctionnalités principales)
    │   └── demo-guide/js/translations.js (traductions)
    │
    └── Récupère les données :
        └── Firestore > Collection: guides > Doc: {guideId}
```

---

## ✨ Personnalisation par client

Chaque guide peut avoir ses propres :
- 📸 Photo de couverture
- 🏠 Nom du logement
- 📍 Ville et localisation
- 📶 Identifiants Wi-Fi
- 🍽️ Restaurants favoris
- 🌴 Activités recommandées
- ❤️ Message de l'hôte
- ... et bien plus !

**Mais le design reste identique** : professionnel, moderne et élégant.

---

## 🚨 Résolution de problèmes

### Le guide ne s'affiche pas correctement ?

#### 1. Vérifier l'URL
✅ Format correct : `https://qrguide.fr/guide.html?id=XXXXXXXX`
❌ Format incorrect : `https://qrguide.fr/guide/XXXXXXXX` (sans .htaccess)

#### 2. Vérifier que le CSS est chargé
1. Ouvrir le guide dans le navigateur
2. Appuyer sur `F12` (Outils de développement)
3. Aller dans l'onglet **Network**
4. Vérifier que `style.css` est bien chargé (code 200)

#### 3. Vérifier que les données existent
1. Ouvrir Firebase Console
2. Firestore Database > Collection `guides`
3. Chercher le document avec l'ID de votre guide
4. Vérifier que les données sont présentes

#### 4. Vérifier dans la console
1. Ouvrir le guide
2. Appuyer sur `F12`
3. Onglet **Console**
4. Chercher les erreurs (texte rouge)

---

## 📱 Compatibilité

Le guide est testé et fonctionne sur :
- ✅ iPhone (Safari)
- ✅ Android (Chrome)
- ✅ Desktop (Chrome, Firefox, Safari, Edge)
- ✅ Tablettes iPad et Android

---

## 💡 Astuces

### Copier le design du guide démo
Si vous voulez copier exactement le design du guide démo pour un autre projet :

```bash
# Copier le CSS
cp demo-guide/css/style.css votre-projet/

# Copier les JS
cp demo-guide/js/main.js votre-projet/
cp demo-guide/js/translations.js votre-projet/

# Adapter le HTML
# Utiliser guide.html comme modèle
```

### Modifier la couleur principale
Dans `demo-guide/css/style.css`, ligne 8 :
```css
--primary-color: #C9A961; /* COULEUR PERSONNALISABLE */
```

Changez la valeur hexadécimale pour personnaliser la couleur.

---

## 📞 Support

Si un guide client ne s'affiche pas correctement :

1. **Tester avec test-guide-generation.html**
2. **Vérifier la console navigateur** (F12)
3. **Vérifier Firestore** (données présentes ?)
4. **Vérifier le réseau** (CSS/JS chargés ?)

Contact : contact@qrguide.fr

---

**Dernière mise à jour** : 11 janvier 2026  
**Version** : 2.0
