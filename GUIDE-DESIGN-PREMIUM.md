# 🎨 Guide de Personnalisation - QRGUIDE

## ✨ Nouveautés Design Premium

Votre guide QRGUIDE a été mis à jour avec un design 4 étoiles incluant :

✅ **Header premium** avec logo et nom personnalisables  
✅ **Cartes carrées** sur tous les appareils (mobile & desktop)  
✅ **Design élégant** : gradients dorés, ombres multi-couches, animations fluides  
✅ **QR Code Wi-Fi** scannable pour connexion automatique  

---

## 🏠 Personnaliser le Logo et le Nom du Logement

### Option 1 : Modification Rapide (dans index.html)

Ouvrez `index.html` et modifiez ces lignes :

```html
<!-- LOGO : Remplacez l'URL par votre propre image -->
<img src="VOTRE_URL_LOGO_ICI" alt="Logo" class="property-logo" id="property-logo">

<!-- NOM : Changez le texte -->
<h1 class="property-name" id="property-name">Votre Nom de Logement ⭐⭐⭐⭐</h1>

<!-- LOCALISATION : Adaptez la ville -->
<p class="property-location">📍 Votre Ville, Région</p>
```

**Exemples d'URL pour le logo :**
- Upload sur Imgur.com : `https://i.imgur.com/XXXXX.jpg`
- Unsplash : `https://images.unsplash.com/photo-XXXXX?w=200&h=200`
- Votre propre serveur : `https://monsite.com/images/logo.png`

### Option 2 : Via le Dashboard Admin

1. Ouvrez `admin.html`
2. Créez ou éditez un client
3. Section **"15. Visuels"** :
   - **URL du logo** : Collez l'URL de votre logo
   - **Couleur principale** : Choisissez votre couleur de marque
4. Le système génère automatiquement la page personnalisée

---

## 📱 QR Code Wi-Fi - Comment ça marche

### Connexion Ultra-Simple pour vos voyageurs

Le QR Code Wi-Fi se génère **automatiquement** sur la page `Wi-Fi & Multimédia`.

**Fonctionnement :**
1. Le voyageur ouvre l'appareil photo de son smartphone
2. Il scanne le QR Code affiché
3. Son téléphone se connecte **automatiquement** au Wi-Fi
4. Aucun mot de passe à taper !

### Personnaliser les Identifiants Wi-Fi

Dans `pages/wifi-multimedia.html`, ligne ~30-40 :

```javascript
<div class="wifi-value-big" id="wifi-ssid">VOTRE_NOM_WIFI</div>
<div class="wifi-value-big" id="wifi-pass">VOTRE_MOT_DE_PASSE</div>
```

Le QR Code se met à jour automatiquement au chargement de la page.

---

## 🎨 Personnaliser les Couleurs du Site

### Dans `css/style.css` (lignes 1-30) :

```css
:root {
    --primary-color: #FF385C;        /* Couleur principale */
    --accent-gold: #D4AF37;          /* Or premium */
    --secondary-color: #00A699;      /* Couleur secondaire */
}
```

**Suggestions de palettes :**

**Bleu Élégant :**
```css
--primary-color: #2E5090;
--accent-gold: #C5A572;
--secondary-color: #5B9BD5;
```

**Vert Nature :**
```css
--primary-color: #2D7A3E;
--accent-gold: #D4AF37;
--secondary-color: #76B947;
```

**Rose Luxe :**
```css
--primary-color: #D946A6;
--accent-gold: #E4C087;
--secondary-color: #F06292;
```

---

## 📊 Cartes Carrées - Explication Technique

Les cartes sont maintenant **parfaitement carrées** grâce à :

```css
.category-card {
    aspect-ratio: 1 / 1; /* Ratio 1:1 = carré parfait */
}
```

**Grilles responsives :**
- Mobile : 2 colonnes
- Tablette (768px+) : 3 colonnes
- Desktop (1024px+) : 4 colonnes

Toutes les cartes restent carrées sur tous les appareils !

---

## 🌟 Effet Premium - Détails

### Ombres Multi-Couches
```css
--shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.12), 
             0 4px 12px rgba(0, 0, 0, 0.08);
```

### Gradients Élégants
- Header : Blanc → Gris clair
- Cartes Featured : Crème → Or
- Carte Urgence : Blanc → Rouge pâle

### Animations au Survol
- Translation verticale (-4px)
- Agrandissement (scale 1.02)
- Bordure dégradée qui apparaît

---

## 🔧 Maintenance

### Mettre à jour le Logo
1. Uploadez votre image (format carré recommandé : 200x200px minimum)
2. Copiez l'URL
3. Remplacez dans `index.html` ligne ~18

### Changer le Wi-Fi
1. Ouvrez `pages/wifi-multimedia.html`
2. Modifiez les valeurs SSID et Password
3. Le QR Code se régénère automatiquement

### Ajuster les Couleurs
1. Ouvrez `css/style.css`
2. Modifiez les variables CSS (lignes 1-30)
3. Tout le site s'adapte automatiquement

---

## 📱 Test de Qualité

### Checklist Design Premium ✓

- [x] Logo affiché en haute résolution
- [x] Nom du logement + étoiles visibles
- [x] Cartes carrées sur mobile
- [x] Cartes carrées sur tablette
- [x] Cartes carrées sur desktop
- [x] QR Code Wi-Fi fonctionnel
- [x] Animations fluides au clic/survol
- [x] Ombres élégantes et profondes
- [x] Gradients subtils et luxueux
- [x] Typographie lisible et moderne

---

## 🆘 Problèmes Courants

**Q : Le logo ne s'affiche pas**
- Vérifiez que l'URL est correcte et accessible
- Testez l'URL dans un navigateur
- Essayez une autre URL (Imgur, Unsplash)

**Q : Le QR Code Wi-Fi ne fonctionne pas**
- Vérifiez que le SSID et password sont corrects
- Certains Android nécessitent une app QR Code
- iOS 11+ : fonctionne avec l'appareil photo natif

**Q : Les cartes ne sont pas carrées**
- Vérifiez que `aspect-ratio: 1/1` est présent dans le CSS
- Videz le cache du navigateur (Ctrl+Shift+R)

**Q : Les couleurs ne changent pas**
- Modifiez bien les variables CSS dans `:root`
- Rechargez la page avec cache vidé

---

## 📞 Support

Besoin d'aide ? Consultez le README.md principal ou contactez le support technique.

**Version Premium** : v2.0  
**Date** : Décembre 2024
