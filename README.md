# 🏡 QRGUIDE - Guide de Séjour Digital pour Airbnb

Site web mobile-first accessible via QR code pour logements Airbnb.

## 📋 Description

QRGUIDE est un guide de séjour digital moderne et intuitif, conçu pour améliorer l'expérience des voyageurs dans les locations Airbnb. Accessible via un simple QR code, il centralise toutes les informations essentielles du logement.

## ✨ Fonctionnalités

- **Mobile-first** : Optimisé pour smartphones
- **Navigation intuitive** : 6 catégories principales
- **Design moderne** : Style Airbnb chaleureux et rassurant
- **Liens cliquables** : Appels téléphoniques et cartes Google Maps directs
- **Configuration facile** : Fichier JSON éditable sans toucher au code
- **Mode hors-ligne** : Fonctionne sans connexion internet
- **Sauvegarde locale** : Checklist de départ mémorisée

## 🗂️ Structure du projet

```
QRGUIDE/
├── index.html              # Page d'accueil avec grille de navigation
├── css/
│   └── style.css          # Styles mobile-first complets
├── js/
│   └── main.js            # Fonctionnalités JavaScript
├── pages/
│   ├── arrivee.html       # Procédure d'arrivée et Wi-Fi
│   ├── depart.html        # Consignes de départ
│   ├── equipements.html   # Guide des équipements
│   ├── proximite.html     # Lieux à proximité
│   ├── urgence.html       # Contacts d'urgence
│   └── infos.html         # Infos pratiques et règlement
├── data/
│   └── config.json        # Configuration éditable
└── README.md              # Ce fichier
```

## 🚀 Installation

1. **Téléchargez** tous les fichiers dans un dossier
2. **Éditez** `data/config.json` avec vos informations
3. **Hébergez** le dossier sur un serveur web

### Hébergement gratuit recommandé :

- **Netlify** (recommandé) : Glissez-déposez le dossier
- **Vercel** : Import direct depuis GitHub
- **GitHub Pages** : Hébergement gratuit avec Git
- **000webhost** : FTP classique

## ⚙️ Configuration

Éditez le fichier `data/config.json` pour personnaliser :

```json
{
  "arrival": {
    "time": "15h00",
    "procedure": [
      "Rendez-vous devant l'entrée principale",
      "Code de la boîte à clés : 1234A"
    ],
    "wifi": {
      "name": "Nom_WiFi",
      "password": "MotDePasse123"
    }
  },
  "contact": {
    "phone": "+33612345678",
    "name": "Votre Nom"
  }
}
```

### Paramètres éditables :

- Heures d'arrivée/départ
- Procédure d'entrée
- Wi-Fi (nom et mot de passe)
- Téléphone de contact
- Politique de ménage
- Consignes de départ

## 📱 Génération du QR Code

1. Hébergez votre site
2. Copiez l'URL (exemple : `https://monlogement.netlify.app`)
3. Générez un QR code gratuit :
   - [QR Code Generator](https://www.qr-code-generator.com/)
   - [QRCode Monkey](https://www.qrcode-monkey.com/)
4. Imprimez et affichez dans votre logement

## 🎨 Personnalisation avancée

### Modifier les couleurs (CSS)

Dans `css/style.css`, éditez les variables :

```css
:root {
    --primary-color: #FF385C;      /* Couleur principale */
    --secondary-color: #00A699;     /* Couleur secondaire */
    --emergency-color: #DC3545;     /* Couleur urgence */
}
```

### Ajouter du contenu HTML

Chaque page dans `pages/` peut être modifiée directement. Les sections suivent cette structure :

```html
<section class="info-section">
    <h2 class="section-title">🎯 Titre</h2>
    <div class="info-card">
        <p class="info-text">Votre contenu ici</p>
    </div>
</section>
```

## 📄 Pages disponibles

| Page | Description | Contenu principal |
|------|-------------|-------------------|
| **Arrivée** | Procédure d'entrée | Heure, code, Wi-Fi, contact |
| **Départ** | Consignes de sortie | Heure, checklist, ménage, clés |
| **Équipements** | Guide d'utilisation | Cuisine, salle de bain, TV, clim |
| **À proximité** | Lieux utiles | Supermarchés, restaurants, plages |
| **Urgence** | Contacts urgents | Propriétaire, pompiers, hôpital |
| **Infos pratiques** | Règlement | Horaires calme, parking, tri, astuces |

## 🔧 Technologies utilisées

- **HTML5** : Structure sémantique
- **CSS3** : Design moderne avec variables CSS
- **JavaScript Vanilla** : Pas de dépendances
- **LocalStorage** : Sauvegarde checklist
- **Google Fonts** : Police Inter

## ✅ Compatibilité

- ✅ iOS Safari (iPhone/iPad)
- ✅ Android Chrome
- ✅ Samsung Internet
- ✅ Firefox Mobile
- ✅ Desktop (bonus)

## 📊 Performance

- ⚡ Chargement < 1 seconde
- 📦 Poids total < 100 KB
- 🚀 Aucune dépendance externe
- 📱 100% responsive

## 🛠️ Support et personnalisation

### Besoin d'aide ?

1. Vérifiez que tous les fichiers sont bien uploadés
2. Testez l'URL sur votre smartphone
3. Vérifiez `config.json` (syntaxe JSON valide)

### Extensions possibles :

- 🌍 Version multilingue
- 📸 Galerie photos du logement
- 📅 Calendrier des événements locaux
- 🗺️ Carte interactive
- ⭐ Formulaire de feedback

## 📝 Licence

Ce projet est libre d'utilisation pour tous les propriétaires Airbnb.

## 🙏 Crédits

Développé avec ❤️ pour améliorer l'expérience des voyageurs.

---

## 🎯 Checklist de mise en ligne

- [ ] Éditer `config.json` avec vos informations
- [ ] Personnaliser les pages HTML si nécessaire
- [ ] Tester sur smartphone
- [ ] Uploader sur un hébergement
- [ ] Générer le QR code
- [ ] Imprimer et afficher dans le logement
- [ ] Tester le QR code avec votre téléphone

## 💡 Astuces

- Plastifiez le QR code pour le protéger
- Placez-le dans un endroit visible (table d'entrée)
- Ajoutez "Scannez-moi pour le guide du logement"
- Mettez à jour régulièrement vos infos

---

**Version** : 1.0.0  
**Dernière mise à jour** : Décembre 2024
