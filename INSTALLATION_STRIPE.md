# Configuration Stripe pour QRGUIDE

## Paiement simplifié (comme Airbnb)

Le système calcule dynamiquement le montant total côté client et l'envoie à Stripe pour paiement.

## Installation

### 1. Installer la bibliothèque Stripe PHP

Sur votre serveur Hostinger, connectez-vous en SSH et exécutez :

```bash
cd /home/votre-username/public_html
composer require stripe/stripe-php
```

Si Composer n'est pas installé, téléchargez Stripe PHP manuellement :
1. Allez sur https://github.com/stripe/stripe-php/releases
2. Téléchargez la dernière version
3. Extrayez dans un dossier `vendor/` à la racine de votre site

### 2. Configurer votre clé secrète Stripe

Éditez le fichier `create-checkout-session.php` ligne 23 :

```php
$stripeSecretKey = 'sk_test_VOTRE_CLE_SECRETE_ICI';
```

**Où trouver votre clé secrète ?**
1. Allez sur https://dashboard.stripe.com/apikeys
2. Copiez la "Secret key" (commence par `sk_test_...` en mode test)
3. **IMPORTANT** : En production, utilisez la clé `sk_live_...`

### 3. Tester le paiement

1. Allez sur https://qrguide.fr/abonnement.html
2. Remplissez le formulaire
3. Cliquez sur "Payer maintenant"
4. Vous serez redirigé vers Stripe

**Carte de test :**
- Numéro : 4242 4242 4242 4242
- Date : n'importe quelle date future
- CVC : n'importe quel 3 chiffres

### 4. Passer en production

Quand vous êtes prêt :
1. Activez votre compte Stripe (vérification d'identité)
2. Remplacez la clé secrète par la version live (`sk_live_...`)
3. Testez avec une vraie carte

## Comment ça marche

```
Client                    Serveur (PHP)              Stripe
------                    -------------              ------
1. Remplit formulaire
2. Calcule total (158€)
3. Clique "Payer"
4. → Envoie à PHP ----→ 5. Crée session Stripe --→ 6. Génère URL
                         7. ← Retourne URL ←------- 8. Session créée
9. ← Redirige vers URL
10. Paie sur Stripe
11. ← Redirige vers success.html
```

## Avantages de cette méthode

✅ **Simple** : Pas besoin de créer 4 produits différents dans Stripe
✅ **Flexible** : Le montant est calculé dynamiquement (comme Airbnb)
✅ **Sécurisé** : La clé secrète Stripe reste côté serveur
✅ **Standard** : Méthode utilisée par 90% des sites e-commerce

## Problèmes courants

**Erreur "composer: command not found"**
→ Demandez à votre hébergeur d'activer Composer ou installez Stripe PHP manuellement

**Erreur "Class 'Stripe\Stripe' not found"**
→ Le chemin vers `vendor/autoload.php` est incorrect, vérifiez ligne 17 du fichier PHP

**Erreur "No such API key"**
→ Vous n'avez pas remplacé la clé secrète dans le fichier PHP

## Support

En cas de problème :
- Documentation Stripe : https://stripe.com/docs/payments/checkout
- Support Hostinger pour Composer : https://www.hostinger.fr/tutoriels/composer
