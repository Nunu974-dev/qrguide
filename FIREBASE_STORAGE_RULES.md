# Configuration des règles Firebase Storage

## Problème
L'upload de photo de profil hôte échoue avec l'erreur :
```
Firebase Storage: User does not have permission to access 'avatars/...'
```

## Solution

1. **Aller dans la console Firebase** : https://console.firebase.google.com
2. **Sélectionner votre projet** : qrguide-reunion (ou votre projet)
3. **Aller dans Storage** (menu latéral gauche)
4. **Cliquer sur l'onglet "Rules"**
5. **Remplacer les règles actuelles** par le contenu du fichier `storage.rules`
6. **Cliquer sur "Publier"**

## Règles à appliquer

Les règles définies dans `storage.rules` permettent :
- ✅ Lecture publique de toutes les images (pour afficher dans les guides)
- ✅ Écriture des photos de logements uniquement par le propriétaire
- ✅ Écriture des avatars uniquement par le propriétaire
- ✅ Protection contre les uploads non autorisés

## Vérification

Après avoir appliqué les règles, testez l'upload de photo de profil hôte dans l'interface.
L'erreur de permission devrait disparaître.

## Alternative rapide (moins sécurisée - pour test uniquement)

Si vous voulez tester rapidement, vous pouvez temporairement utiliser ces règles (NON RECOMMANDÉ EN PRODUCTION) :

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Mais remplacez-les ensuite par les règles sécurisées du fichier `storage.rules`.
