# Configuration Email Contact

## Instructions pour activer l'envoi d'emails

### Étape 1 : Modifier send-contact-smtp.php

Ouvrez le fichier `send-contact-smtp.php` et modifiez les lignes 48-49 :

```php
$mail->Username = 'contact@qrguide.fr';  // VOTRE ADRESSE EMAIL HOSTINGER
$mail->Password = 'VOTRE_MOT_DE_PASSE';   // MOT DE PASSE DE L'EMAIL
```

Remplacez par vos vraies informations :
- **Username** : votre adresse email Hostinger (ex: contact@qrguide.fr)
- **Password** : le mot de passe de cette adresse email

### Étape 2 : Créer l'adresse email sur Hostinger

1. Connectez-vous à votre panel Hostinger
2. Allez dans "Emails"
3. Créez l'adresse `contact@qrguide.fr` (si pas déjà fait)
4. Notez bien le mot de passe

### Étape 3 : Tester

1. Allez sur votre site
2. Remplissez le formulaire de contact
3. Envoyez un message de test
4. Vérifiez votre boîte mail contact@qrguide.fr

### Configuration SMTP Hostinger

Les paramètres sont déjà configurés dans le fichier :
- **Serveur SMTP** : smtp.hostinger.com
- **Port** : 587
- **Sécurité** : STARTTLS
- **Authentification** : Oui

## Alternative : Utiliser mail() simple

Si vous préférez utiliser la fonction mail() PHP native (moins fiable) :

1. Modifiez `contact.html` ligne avec fetch
2. Changez `send-contact-smtp.php` en `send-contact.php`
3. Plus simple mais peut ne pas fonctionner selon la config serveur

## Fichiers concernés

- **send-contact.php** : Version simple avec mail()
- **send-contact-smtp.php** : Version SMTP (recommandée) ✅
- **contact.html** : Formulaire de contact
- **PHPMailer/** : Bibliothèque pour envoi SMTP

---

📧 Une fois configuré, tous les messages du formulaire arriveront à votre adresse contact@qrguide.fr
