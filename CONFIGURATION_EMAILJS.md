# Configuration EmailJS pour QRGUIDE

## 📧 Recevoir les emails sur contact@qrguide.fr

### Étape 1 : Créer un compte EmailJS
1. Allez sur : https://dashboard.emailjs.com/sign-up
2. Inscrivez-vous gratuitement (100 emails/mois)

### Étape 2 : Ajouter votre service email
1. Dans le dashboard, cliquez sur **"Add New Service"**
2. Choisissez votre fournisseur email :
   - **Gmail** : Si contact@qrguide.fr est sur Gmail/Google Workspace
   - **Outlook** : Si c'est sur Outlook/Office 365
   - **Autre** : Selon votre hébergeur

3. Connectez votre compte **contact@qrguide.fr**
4. Notez le **Service ID** (ex: `service_xyz123`)

### Étape 3 : Créer le template d'email

1. Allez dans **"Email Templates"** → **"Create New Template"**
2. Utilisez ce modèle :

**Sujet du template :**
```
Nouvelle commande QRGUIDE - {{nom}}
```

**Contenu du template :**
```
Nouvelle commande reçue sur QRGUIDE.FR

INFORMATIONS CLIENT :
=====================
Nom : {{nom}}
Email : {{email}}
Téléphone : {{telephone}}

COMMANDE :
==========
Formule choisie : {{plan}}
Nombre de logements : {{nb_logements}}

Message du client :
{{message}}

---
Email automatique depuis qrguide.fr
```

3. Sauvegardez et notez le **Template ID** (ex: `template_abc456`)

### Étape 4 : Récupérer votre Public Key

1. Allez dans **"Account"** → **"General"**
2. Copiez votre **Public Key** (ex: `abcD1234EfgH5678`)

### Étape 5 : Mettre à jour contact.html

Ouvrez `/Users/julienchanewai/Desktop/QRGUIDE/contact.html` et remplacez :

```javascript
const EMAILJS_CONFIG = {
    publicKey: 'VOTRE_PUBLIC_KEY',      // Remplacez par votre Public Key
    serviceId: 'VOTRE_SERVICE_ID',      // Remplacez par votre Service ID
    templateId: 'VOTRE_TEMPLATE_ID'     // Remplacez par votre Template ID
};
```

Par vos vraies valeurs :

```javascript
const EMAILJS_CONFIG = {
    publicKey: 'abcD1234EfgH5678',      // Votre vraie Public Key
    serviceId: 'service_xyz123',        // Votre vrai Service ID
    templateId: 'template_abc456'       // Votre vrai Template ID
};
```

### Étape 6 : Tester

1. Ouvrez `contact.html` dans votre navigateur
2. Remplissez le formulaire
3. Soumettez
4. Vérifiez votre boîte mail **contact@qrguide.fr**

---

## ✅ Checklist

- [ ] Compte EmailJS créé
- [ ] Service email ajouté et connecté à contact@qrguide.fr
- [ ] Template créé avec les bonnes variables
- [ ] Public Key copiée
- [ ] Service ID copié
- [ ] Template ID copié
- [ ] Valeurs mises à jour dans contact.html
- [ ] Test réussi

---

## 🆘 En cas de problème

**"EmailJS is not defined"**
→ Vérifiez que le script EmailJS est chargé dans le `<head>` de contact.html

**"Invalid public key"**
→ Vérifiez que vous avez bien copié la Public Key complète

**"Template not found"**
→ Vérifiez que le Template ID correspond bien à un template existant

**Emails non reçus**
→ Vérifiez vos spams et que le service email est bien connecté à contact@qrguide.fr

---

## 📞 Support EmailJS

Documentation : https://www.emailjs.com/docs/
Support : https://www.emailjs.com/contact/
