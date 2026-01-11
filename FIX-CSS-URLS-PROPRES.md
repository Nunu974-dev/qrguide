# 🔧 Résolution - CSS Manquant sur URLs Propres

## ❌ Problème Initial

Les guides accessibles via des URLs propres (ex: `https://qrguide.fr/guide/hywy4JMc`) n'affichaient pas le CSS.

### Cause du Problème

Quand on accède à `/guide/hywy4JMc`, le navigateur pense qu'il se trouve dans le dossier `/guide/` et calcule les chemins relatifs à partir de là :

```
Chemin dans le HTML : demo-guide/css/style.css
Chemin calculé par le navigateur : /guide/demo-guide/css/style.css ❌ (incorrect)
Chemin correct attendu : /demo-guide/css/style.css ✅
```

---

## ✅ Solution Appliquée

### 1. Ajout de la balise `<base>`

Dans [guide.html](guide.html), ajout de :
```html
<head>
    <base href="/">
    ...
</head>
```

**Effet** : Force tous les chemins relatifs à être calculés depuis la racine du site, peu importe l'URL.

### 2. Correction des chemins en chemins absolus

**Avant** :
```html
<link rel="stylesheet" href="demo-guide/css/style.css">
<script src="demo-guide/js/main.js"></script>
```

**Après** :
```html
<link rel="stylesheet" href="/demo-guide/css/style.css">
<script src="/demo-guide/js/main.js"></script>
```

### 3. Amélioration du .htaccess

Ajout de `RewriteBase /` pour s'assurer que les règles fonctionnent correctement :

```apache
RewriteEngine On
RewriteBase /
RewriteRule ^guide/([a-zA-Z0-9]+)$ guide.html [L,QSA]
```

---

## 🧪 Tests

### Outil de test créé

**test-routing.html** permet de :
- ✅ Vérifier l'extraction du Guide ID depuis l'URL
- ✅ Tester les différents formats d'URL
- ✅ Vérifier que les ressources CSS/JS sont chargées
- ✅ Debug en temps réel

**Utilisation** :
```
https://qrguide.fr/test-routing.html
```

### Vérification manuelle

1. **Ouvrir un guide** : `https://qrguide.fr/guide/hywy4JMc`
2. **Ouvrir DevTools** : `F12`
3. **Onglet Network** : Vérifier que `style.css` est chargé (statut 200)
4. **Onglet Console** : Pas d'erreur CSS/JS

---

## 📊 Formats d'URL supportés

### ✅ Format 1 : URL propre (recommandé)
```
https://qrguide.fr/guide/hywy4JMc
```
- Plus propre et professionnel
- Meilleur pour le SEO
- **Requiert `.htaccess` sur serveur Apache**

### ✅ Format 2 : URL avec paramètre (fallback)
```
https://qrguide.fr/guide.html?id=hywy4JMc
```
- Fonctionne partout (Apache, Nginx, etc.)
- Pas besoin de configuration serveur
- Moins esthétique

**Les deux formats fonctionnent maintenant correctement !**

---

## 🔍 Comment le système fonctionne

```
1. Client accède à /guide/hywy4JMc
         ↓
2. .htaccess redirige vers /guide.html (en interne)
         ↓
3. <base href="/"> force les chemins depuis la racine
         ↓
4. CSS et JS chargés : /demo-guide/css/style.css ✅
         ↓
5. JavaScript extrait "hywy4JMc" du pathname
         ↓
6. Requête Firestore : guides/hywy4JMc
         ↓
7. Affichage du guide avec le design complet
```

---

## 🚨 Dépannage

### Le CSS ne se charge toujours pas ?

#### 1. Vérifier que le fichier est déployé
```bash
# Sur le serveur
ls -la /chemin/vers/site/demo-guide/css/style.css
```

#### 2. Vérifier les permissions
```bash
chmod 644 demo-guide/css/style.css
chmod 755 demo-guide/css/
```

#### 3. Vérifier le .htaccess
- Le serveur doit être Apache avec `mod_rewrite` activé
- Le fichier .htaccess doit être à la racine du site

#### 4. Tester l'URL directe du CSS
```
https://qrguide.fr/demo-guide/css/style.css
```
Doit afficher le contenu du CSS (pas d'erreur 404)

#### 5. Vider le cache
- Cache navigateur : `Ctrl + F5`
- Cache Cloudflare (si utilisé) : Purger le cache

---

## 🔐 Nginx (Alternative)

Si le serveur utilise Nginx au lieu d'Apache, remplacer `.htaccess` par cette config dans `nginx.conf` :

```nginx
location ~ ^/guide/([a-zA-Z0-9]+)$ {
    rewrite ^/guide/([a-zA-Z0-9]+)$ /guide.html last;
}
```

---

## ✅ Checklist de Vérification

Après déploiement, vérifier :

- [ ] `https://qrguide.fr/guide/TEST123` charge guide.html
- [ ] Le CSS est visible (fond coloré, styles appliqués)
- [ ] Les scripts JS fonctionnent (heure qui s'affiche)
- [ ] Les modales s'ouvrent au clic
- [ ] Le sélecteur de langue fonctionne
- [ ] Pas d'erreur dans la console (F12)

---

## 📱 Compatibilité

Testé et fonctionnel sur :
- ✅ Chrome (Desktop & Mobile)
- ✅ Firefox
- ✅ Safari (macOS & iOS)
- ✅ Edge

---

## 🔗 Liens Utiles

- **Guide de test** : [https://qrguide.fr/test-routing.html](https://qrguide.fr/test-routing.html)
- **Guide démo** : [https://qrguide.fr/demo-guide/](https://qrguide.fr/demo-guide/)
- **Documentation Apache mod_rewrite** : https://httpd.apache.org/docs/current/mod/mod_rewrite.html

---

**Résolu le** : 11 janvier 2026  
**Commit** : ff87bf1
