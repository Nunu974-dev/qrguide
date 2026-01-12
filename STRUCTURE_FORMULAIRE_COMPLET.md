# Structure complète du formulaire de création/modification

## PAGE 1 : ARRIVÉE (arrivee.html)
- ✅ `message_bienvenue` - Message de bienvenue
- ✅ `premier_pas_1` - Premier pas étape 1
- ✅ `premier_pas_2` - Premier pas étape 2
- ✅ `premier_pas_3` - Premier pas étape 3
- ✅ `premier_pas_4` - Premier pas étape 4
- ❌ LIEN VERS WiFi (pas de champs WiFi directs ici)
- ✅ `parking_info` - Informations parking
- ✅ `checkin_time` - Heure d'arrivée
- ✅ `checkout_time` - Heure de départ
- ✅ `hote_telephone` - Téléphone de contact

## PAGE 2 : WIFI & MULTIMÉDIA (wifi-multimedia.html)
### Section QR Code WiFi
- ✅ `wifi_nom` - Nom du réseau (SSID)
- ✅ `wifi_password` - Mot de passe WiFi

### Section Caractéristiques WiFi
- ❌ `wifi_debit` - Débit (ex: "Fibre 500 Mbps")
- ❌ `wifi_securite` - Type sécurité (ex: "WPA2")

### Section Problème WiFi - Instructions
- ❌ `wifi_box_emplacement` - Où se trouve la box
- ❌ `wifi_box_redemarrage` - Comment redémarrer la box

### Section Télévision
- ❌ `tv_marque` - Marque et taille (ex: "Smart TV Samsung 55"")
- ❌ `tv_plateformes` - Plateformes disponibles (Netflix, Prime, YouTube, Disney+, etc.) [ARRAY]
- ❌ `tv_box` - Box TV et chaînes (ex: "Box SFR - 200+ chaînes")
- ❌ `tv_telecommande` - Où sont les télécommandes
- ❌ `tv_instructions_1` - Instruction 1 (Allumer)
- ❌ `tv_instructions_2` - Instruction 2 (Changer source)
- ❌ `tv_instructions_3` - Instruction 3 (Volume)

### Section Enceinte Bluetooth
- ❌ `enceinte_marque` - Marque et modèle (ex: "JBL Charge 5")
- ❌ `enceinte_nom_bluetooth` - Nom Bluetooth pour connexion
- ❌ `enceinte_emplacement` - Où se trouve l'enceinte
- ❌ `enceinte_chargeur` - Où est le chargeur
- ❌ `enceinte_caracteristiques` - Caractéristiques (autonomie, étanche, etc.)

### Section Autres équipements multimédia
- ❌ `multimedia_bureau` - Espace bureau
- ❌ `multimedia_prises_usb` - Prises USB disponibles
- ❌ `multimedia_chargeurs` - Chargeurs disponibles
- ❌ `multimedia_casque` - Casque audio

### Section Conseils multimédia
- ❌ `multimedia_conseils` - Conseils d'utilisation [ARRAY]

## PAGE 3 : ÉQUIPEMENTS (equipements.html)
### Cuisine
- ❌ `cuisine_plaques` - Type et instructions (ex: "Induction - Allumage tactile")
- ❌ `cuisine_four` - Instructions four
- ❌ `cuisine_cafe` - Machine à café (ex: "Nespresso - Capsules fournies")
- ❌ `cuisine_frigo` - Réfrigérateur
- ❌ `cuisine_lave_vaisselle` - Lave-vaisselle
- ❌ **AUTRES** [ARRAY dynamique - champs actuels `equipements_cuisine`]

### Salle de bain
- ❌ `sdb_douche` - Type douche et instructions
- ❌ `sdb_produits` - Produits fournis
- ❌ `sdb_seche_cheveux` - Sèche-cheveux et emplacement
- ❌ `sdb_serviettes` - Serviettes fournies
- ❌ **AUTRES** [ARRAY dynamique - champs actuels `equipements_sdb`]

### Climatisation & Chauffage
- ✅ `instructions_clim` - Instructions climatisation/chauffage
- ❌ `clim_telecommande_emplacement` - Où est la télécommande

### Linge & Nettoyage
- ❌ `linge_lave_linge` - Lave-linge et emplacement
- ❌ `linge_lessive` - Lessive fournie
- ❌ `linge_aspirateur` - Aspirateur et emplacement
- ❌ `linge_produits_entretien` - Produits d'entretien et emplacement

### Règles importantes équipements
- ❌ `equipements_regles_importantes` - Règles de sécurité [ARRAY]

## PAGE 4 : DÉPART (depart.html)
- ✅ `checkout_time` - Heure de départ
- ❌ `depart_checklist` - Checklist automatique ou personnalisée? [Par défaut fournie]
- ✅ `menage_tri` - Informations sur le ménage
- ✅ `instructions_cles` - Instructions pour les clés
- ❌ `depart_message_remerciement` - Message de remerciement personnalisé

## PAGE 5 : BONNES ADRESSES (bonnes-adresses.html)
### Restaurants
- ✅ `restaurants` - [ARRAY d'objets]
  - ❌ `coup_de_coeur` - Boolean (mettre en avant)
  - ✅ `nom` - Nom du restaurant
  - ✅ `description` - Description
  - ✅ `distance` - Distance (ex: "8 min à pied" ou "5 min en voiture")
  - ✅ `prix` - Fourchette de prix (ex: "20-35€/pers")
  - ✅ `horaires` - Horaires
  - ✅ `url_maps` - Lien Google Maps

### Snacks & Boulangeries
- ❌ `snacks` - [ARRAY d'objets] - même structure que restaurants
  - ❌ `coup_de_coeur`
  - nom, description, distance, prix, horaires, url_maps

### Bars & Glaciers
- ❌ `bars` - [ARRAY d'objets] - même structure
  - ❌ `coup_de_coeur`
  - nom, description, distance, horaires, url_maps

## PAGE 6 : ACTIVITÉS (activites.html)
### Plages
- ✅ `activites` - [ARRAY d'objets actuels - À RESTRUCTURER]
  - ❌ `type` - Type (plage, randonnée, sport, culture, etc.)
  - ❌ `coup_de_coeur` - Boolean
  - ✅ `nom` - Nom
  - ✅ `description` - Description
  - ✅ `distance` - Distance
  - ❌ `tags` - [ARRAY] Tags (ex: ["Surveillée", "Parking", "Douches", "Restaurants"])
  - ✅ `url_maps` - Lien

### Randonnées
- ❌ `niveau` - Niveau (Facile/Moyen/Difficile)
- ❌ `duree` - Durée
- ❌ `caracteristiques` - [ARRAY] (Famille, Baignade possible, etc.)

### Autres activités (Sports nautiques, Culture, etc.)
- Même structure que plages/randonnées

## PAGE 7 : PROXIMITÉ (proximite.html)
### Commerces
- ✅ `commerces` - [ARRAY d'objets]
  - ❌ `type` - Type (Supermarché, Pharmacie, Station essence, etc.)
  - ✅ `nom` - Nom
  - ✅ `description` - Description
  - ✅ `distance` - Distance
  - ✅ `horaires` - Horaires
  - ✅ `url_maps` - Lien

## PAGE 8 : URGENCES (urgence.html)
- ✅ `urgences` - Numéros d'urgence et informations
- ❌ `urgences_hopital_nom` - Nom hôpital le plus proche
- ❌ `urgences_hopital_distance` - Distance hôpital
- ❌ `urgences_hopital_adresse` - Adresse hôpital
- ❌ `urgences_pharmacie_garde` - Pharmacie de garde info
- ❌ `urgences_veterinaire` - Vétérinaire info

## PAGE 9 : VOTRE HÔTE (votre-hote.html)
- ✅ `hote_nom` - Nom de l'hôte
- ✅ `hote_telephone` - Téléphone
- ✅ `hote_email` - Email
- ✅ `message_hote` - Message personnel de l'hôte
- ❌ `hote_photo` - Photo de l'hôte
- ❌ `hote_langues` - Langues parlées [ARRAY]
- ❌ `hote_disponibilite` - Disponibilité (ex: "9h-20h tous les jours")

## PAGE 10 : INFOS PRATIQUES (infos.html)
- ✅ `regles` - Règlement intérieur
- ✅ `conseils` - Conseils pratiques
- ✅ `infos_supplementaires` - Informations supplémentaires
- ❌ `meteo_meilleure_saison` - Meilleure saison
- ❌ `transports_bus` - Infos transports en commun
- ❌ `transports_taxi` - Numéros de taxi
- ❌ `culture_locale` - Infos culture locale

## RÉSUMÉ DES CHAMPS À AJOUTER AU FORMULAIRE

### ✅ DÉJÀ PRÉSENTS (26 champs)
message_bienvenue, premier_pas_1-4, parking_info, checkin_time, checkout_time, hote_telephone, wifi_nom, wifi_password, instructions_clim, menage_tri, instructions_cles, restaurants (array), snacks (array incomplet), activites (array), commerces (array), urgences, hote_nom, hote_email, message_hote, regles, conseils, infos_supplementaires

### ❌ MANQUANTS (60+ champs)
**WiFi/Multimédia (15)**: wifi_debit, wifi_securite, wifi_box_emplacement, tv_marque, tv_plateformes, tv_box, tv_telecommande, tv_instructions_1-3, enceinte_marque, enceinte_nom_bluetooth, enceinte_emplacement, multimedia_bureau

**Équipements (12)**: cuisine_plaques, cuisine_four, cuisine_cafe, cuisine_frigo, sdb_douche, sdb_produits, sdb_serviettes, clim_telecommande_emplacement, linge_lave_linge, linge_aspirateur, linge_produits_entretien, equipements_regles

**Bonnes adresses (5)**: Structure bars, coup_de_coeur flags pour restaurants/snacks/bars

**Activités (5)**: Restructuration avec type, niveau, durée, tags, coup_de_coeur

**Hôte (4)**: hote_photo, hote_langues, hote_disponibilite

**Infos (4)**: meteo_meilleure_saison, transports_bus, transports_taxi, culture_locale

**Départ (2)**: depart_message_remerciement

**Urgences (5)**: urgences_hopital_nom, urgences_hopital_distance, urgences_hopital_adresse, urgences_pharmacie_garde, urgences_veterinaire
