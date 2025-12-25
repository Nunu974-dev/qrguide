/* ===================================
   QRGUIDE - ADMIN JAVASCRIPT
   Dashboard admin connecté à Firestore
   =================================== */

// === VARIABLES GLOBALES ===
let currentUser = null;
let allUsers = [];
let currentClientId = null;

// === INITIALISATION ===
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎛️ Dashboard Admin chargé');
    
    // Vérifier authentification admin
    auth.onAuthStateChanged(async (user) => {
        if (!user) {
            window.location.href = '../login.html';
            return;
        }
        
        currentUser = user;
        
        // Vérifier rôle admin
        const userDoc = await db.collection('users').doc(user.uid).get();
        const userData = userDoc.data();
        
        if (!userData || userData.role !== 'admin') {
            alert('Accès réservé aux administrateurs');
            await auth.signOut();
            window.location.href = '../login.html';
            return;
        }
        
        // Charger les données
        await loadAllUsers();
        renderClients();
        updateClientsCount();
    });
    
    initNavigation();
    initFormListeners();
});

// === CHARGEMENT DES UTILISATEURS DEPUIS FIRESTORE ===
async function loadAllUsers() {
    try {
        const usersSnapshot = await db.collection('users')
            .where('role', '==', 'client')
            .orderBy('createdAt', 'desc')
            .get();
        
        allUsers = [];
        
        for (const userDoc of usersSnapshot.docs) {
            const userData = userDoc.data();
            
            // Charger les logements de cet utilisateur
            const logementsSnapshot = await db.collection('users')
                .doc(userDoc.id)
                .collection('logements')
                .get();
            
            const logements = [];
            logementsSnapshot.forEach(logementDoc => {
                logements.push({
                    id: logementDoc.id,
                    ...logementDoc.data()
                });
            });
            
            allUsers.push({
                uid: userDoc.id,
                ...userData,
                logements: logements
            });
        }
        
        console.log('✅ Utilisateurs chargés:', allUsers.length);
    } catch (error) {
        console.error('❌ Erreur chargement utilisateurs:', error);
        alert('Erreur lors du chargement des utilisateurs');
    }
}

// === NAVIGATION ===
function initNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.dataset.section;
            showSection(section);
        });
    });
}

function showSection(sectionName) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    document.getElementById(`section-${sectionName}`).classList.add('active');
    document.querySelector(`[data-section="${sectionName}"]`)?.classList.add('active');
}

function updateClientsCount() {
    document.getElementById('clients-count').textContent = allUsers.length;
}

// === RENDU DE LA LISTE DES CLIENTS ===
function renderClients() {
    const container = document.getElementById('clients-list');
    const emptyState = document.getElementById('empty-state');
    
    if (allUsers.length === 0) {
        container.innerHTML = '';
        emptyState.classList.add('show');
        return;
    }
    
    emptyState.classList.remove('show');
    
    container.innerHTML = allUsers.map(user => {
        const createdDate = user.createdAt ? new Date(user.createdAt.toDate()).toLocaleDateString('fr-FR') : 'N/A';
        const planText = user.plan === 'mensuel' ? '8€/mois' : '75€/an';
        const logementsCount = user.logements ? user.logements.length : 0;
        
        return `
        <div class="client-card" data-id="${user.uid}">
            <div class="client-card-header">
                <div>
                    <h3>${user.firstname} ${user.lastname}</h3>
                    <p>📧 ${user.email}</p>
                    <p>📞 ${user.phone || 'N/A'}</p>
                    <p>📍 ${user.postalCode || 'N/A'}</p>
                </div>
                <span class="client-status">✓ ${user.status || 'active'}</span>
            </div>
            <p style="margin-top: 12px;">
                <strong>Plan:</strong> ${planText}<br>
                <strong>Logements:</strong> ${logementsCount}/${user.maxLogements || 3}<br>
                <strong>Inscrit le:</strong> ${createdDate}
            </p>
            <div class="client-card-actions">
                <button class="btn-icon" onclick="viewUserDetails('${user.uid}')">👁️ Voir détails</button>
                <button class="btn-icon" onclick="viewUserLogements('${user.uid}')">🏠 Logements (${logementsCount})</button>
            </div>
        </div>
    `;
    }).join('');
}

// === AFFICHER LES DÉTAILS D'UN UTILISATEUR ===
function viewUserDetails(userId) {
    const user = allUsers.find(u => u.uid === userId);
    if (!user) return;
    
    const logementsHTML = user.logements && user.logements.length > 0
        ? user.logements.map(l => `
            <div style="padding: 12px; background: #f8f9fa; border-radius: 8px; margin-bottom: 8px;">
                <strong>${l.nom_logement || 'Sans nom'}</strong><br>
                <small>Type: ${l.type || 'N/A'} | Ville: ${l.ville || 'N/A'}</small>
            </div>
        `).join('')
        : '<p>Aucun logement créé</p>';
    
    const html = `
        <h2>Détails de ${user.firstname} ${user.lastname}</h2>
        <div style="background: white; padding: 24px; border-radius: 12px; margin: 20px 0;">
            <h3>📋 Informations personnelles</h3>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Téléphone:</strong> ${user.phone || 'N/A'}</p>
            <p><strong>Code postal:</strong> ${user.postalCode || 'N/A'}</p>
            <p><strong>Plan:</strong> ${user.plan === 'mensuel' ? 'Mensuel (8€/mois)' : 'Annuel (75€/an)'}</p>
            <p><strong>Statut:</strong> ${user.status || 'active'}</p>
            <p><strong>Inscrit le:</strong> ${user.createdAt ? new Date(user.createdAt.toDate()).toLocaleDateString('fr-FR') : 'N/A'}</p>
            
            <h3 style="margin-top: 24px;">🏠 Logements (${user.logements ? user.logements.length : 0})</h3>
            ${logementsHTML}
        </div>
        <button class="btn-secondary" onclick="showSection('clients')">← Retour</button>
    `;
    
    document.getElementById('section-clients').innerHTML = html;
}

function viewUserLogements(userId) {
    viewUserDetails(userId);
}

// === RECHERCHE/FILTRAGE ===
function filterClients() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    
    const filtered = allUsers.filter(user => {
        const fullName = `${user.firstname} ${user.lastname}`.toLowerCase();
        const email = user.email.toLowerCase();
        const phone = (user.phone || '').toLowerCase();
        
        return fullName.includes(searchTerm) || 
               email.includes(searchTerm) || 
               phone.includes(searchTerm);
    });
    
    // Réafficher avec les résultats filtrés
    const container = document.getElementById('clients-list');
    const emptyState = document.getElementById('empty-state');
    
    if (filtered.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding: 40px;">Aucun résultat</p>';
        return;
    }
    
    container.innerHTML = filtered.map(user => {
        const createdDate = user.createdAt ? new Date(user.createdAt.toDate()).toLocaleDateString('fr-FR') : 'N/A';
        const planText = user.plan === 'mensuel' ? '8€/mois' : '75€/an';
        const logementsCount = user.logements ? user.logements.length : 0;
        
        return `
        <div class="client-card" data-id="${user.uid}">
            <div class="client-card-header">
                <div>
                    <h3>${user.firstname} ${user.lastname}</h3>
                    <p>📧 ${user.email}</p>
                    <p>📞 ${user.phone || 'N/A'}</p>
                    <p>📍 ${user.postalCode || 'N/A'}</p>
                </div>
                <span class="client-status">✓ ${user.status || 'active'}</span>
            </div>
            <p style="margin-top: 12px;">
                <strong>Plan:</strong> ${planText}<br>
                <strong>Logements:</strong> ${logementsCount}/${user.maxLogements || 3}<br>
                <strong>Inscrit le:</strong> ${createdDate}
            </p>
            <div class="client-card-actions">
                <button class="btn-icon" onclick="viewUserDetails('${user.uid}')">👁️ Voir détails</button>
                <button class="btn-icon" onclick="viewUserLogements('${user.uid}')">🏠 Logements (${logementsCount})</button>
            </div>
        </div>
    `;
    }).join('');
}

// === DÉCONNEXION ===
async function logout() {
    try {
        await auth.signOut();
        window.location.href = '../login.html';
    } catch (error) {
        console.error('Erreur déconnexion:', error);
    }
}

// === AUTRES FONCTIONS (à désactiver pour l'instant) ===
function initFormListeners() {
    // Formulaire désactivé pour l'instant
    console.log('Formulaire création client désactivé (utiliser mon-compte.html)');
}

// === FILTRAGE ===
function filterClients() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const cards = document.querySelectorAll('.client-card');
    
    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(searchTerm) ? 'block' : 'none';
    });
}

// === FORMULAIRE ===
function initFormListeners() {
    const form = document.getElementById('client-form');
    form.addEventListener('submit', handleFormSubmit);
    
    // Toggle parking details
    const parkingCheckbox = document.getElementById('parking-included');
    if (parkingCheckbox) {
        parkingCheckbox.addEventListener('change', function() {
            const section = document.getElementById('parking-details-section');
            if (section) {
                section.style.display = this.checked ? 'block' : 'none';
            }
        });
    }
    
    // Synchroniser le color picker et l'input texte
    const colorPicker = document.getElementById('primary-color');
    const colorHex = document.getElementById('primary-color-hex');
    
    if (colorPicker && colorHex) {
        colorPicker.addEventListener('input', function() {
            colorHex.value = this.value.toUpperCase();
        });
        
        colorHex.addEventListener('input', function() {
            const hex = this.value.trim();
            if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
                colorPicker.value = hex;
            }
        });
    }
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const clientData = {
        id: currentClientId || generateId(),
        
        // 1. INFORMATIONS GÉNÉRALES
        propertyName: getValue('property-name'),
        propertyType: getRadioValue('property-type'),
        city: getValue('city'),
        floor: getValue('floor'),
        address: getValue('property-address'),
        maxGuests: getValue('max-guests'),
        targetCouple: getCheckboxValue('target-couple'),
        targetFamily: getCheckboxValue('target-family'),
        targetPro: getCheckboxValue('target-pro'),
        targetTourists: getCheckboxValue('target-tourists'),
        primaryColor: getValue('primary-color') || '#C9A961',
        
        // 2. ARRIVÉE
        checkinTime: getValue('checkin-time'),
        accessKeybox: getCheckboxValue('access-keybox'),
        accessDigicode: getCheckboxValue('access-digicode'),
        accessPhysical: getCheckboxValue('access-physical'),
        entryProcedure: getProcedureSteps(),
        arrivalContactName: getValue('arrival-contact-name'),
        arrivalContactPhone: getValue('arrival-contact-phone'),
        arrivalInstructions: getValue('arrival-instructions'),
        
        // 3. DÉPART
        checkoutTime: getValue('checkout-time'),
        departureTrash: getCheckboxValue('departure-trash'),
        departureDishes: getCheckboxValue('departure-dishes'),
        departureLinen: getCheckboxValue('departure-linen'),
        departureAC: getCheckboxValue('departure-ac'),
        departureRequested: getValue('departure-requested'),
        departureNotRequested: getValue('departure-not-requested'),
        keyReturn: getKeyReturnSteps(),
        departureMessage: getValue('departure-message'),
        
        // 4. ÉQUIPEMENTS
        equipOven: getCheckboxValue('equip-oven'),
        equipMicrowave: getCheckboxValue('equip-microwave'),
        equipCoffee: getCheckboxValue('equip-coffee'),
        equipKettle: getCheckboxValue('equip-kettle'),
        equipToaster: getCheckboxValue('equip-toaster'),
        equipDishwasher: getCheckboxValue('equip-dishwasher'),
        equipShower: getCheckboxValue('equip-shower'),
        equipBathtub: getCheckboxValue('equip-bathtub'),
        equipHairdryer: getCheckboxValue('equip-hairdryer'),
        equipTowels: getCheckboxValue('equip-towels'),
        equipAC: getCheckboxValue('equip-ac'),
        equipFan: getCheckboxValue('equip-fan'),
        equipWashing: getCheckboxValue('equip-washing'),
        equipIron: getCheckboxValue('equip-iron'),
        equipTV: getCheckboxValue('equip-tv'),
        equipNetflix: getCheckboxValue('equip-netflix'),
        equipSpeaker: getCheckboxValue('equip-speaker'),
        equipUSB: getCheckboxValue('equip-usb'),
        equipGames: getCheckboxValue('equip-games'),
        equipmentNotes: getValue('equipment-notes'),
        
        // 5. WI-FI & MULTIMÉDIA
        wifiName: getValue('wifi-name'),
        wifiPassword: getValue('wifi-password'),
        tvInstructions: getValue('tv-instructions'),
        streamingNetflix: getCheckboxValue('streaming-netflix'),
        streamingPrime: getCheckboxValue('streaming-prime'),
        streamingDisney: getCheckboxValue('streaming-disney'),
        streamingYoutube: getCheckboxValue('streaming-youtube'),
        streamingNotes: getValue('streaming-notes'),
        
        // 6. URGENCE
        emergencyName: getValue('emergency-name'),
        emergencyPhone: getValue('emergency-phone'),
        emergencyLocal: getValue('emergency-local'),
        emergencyWater: getValue('emergency-water'),
        emergencyElectricity: getValue('emergency-electricity'),
        emergencyEquipment: getValue('emergency-equipment'),
        safetyInstructions: getValue('safety-instructions'),
        
        // 7. À PROXIMITÉ
        proximityPlaces: getProximityItems(),
        
        // 8. BONNES ADRESSES
        restaurants: getValue('restaurants'),
        barsSnacks: getValue('bars-snacks'),
        localSpecialties: getValue('local-specialties'),
        marketInfo: getValue('market-info'),
        
        // 9. ACTIVITÉS & LOISIRS
        activitiesNature: getValue('activities-nature'),
        activitiesKids: getValue('activities-kids'),
        activitiesRain: getValue('activities-rain'),
        touristSites: getValue('tourist-sites'),
        
        // 10. MÉNAGE & ENTRETIEN
        trashManagement: getValue('trash-management'),
        linenManagement: getValue('linen-management'),
        cleaningProducts: getValue('cleaning-products'),
        longStayCleaning: getValue('long-stay-cleaning'),
        
        // 11. RÈGLEMENT & BON VOISINAGE
        quietHours: getValue('quiet-hours'),
        smokingAllowed: getCheckboxValue('smoking-allowed'),
        petsAllowed: getCheckboxValue('pets-allowed'),
        partiesAllowed: getCheckboxValue('parties-allowed'),
        petsPolicy: getValue('pets-policy'),
        buildingRules: getValue('building-rules'),
        
        // 12. STATIONNEMENT & ACCÈS
        parkingIncluded: getCheckboxValue('parking-included'),
        parkingType: getRadioValue('parking-type'),
        parkingSpot: getValue('parking-spot'),
        parkingCode: getValue('parking-code'),
        parkingInstructions: getValue('parking-instructions'),
        
        // 13. FAMILLE & ENFANTS
        babyBed: getCheckboxValue('baby-bed'),
        highChair: getCheckboxValue('high-chair'),
        babyBath: getCheckboxValue('baby-bath'),
        babyMonitor: getCheckboxValue('baby-monitor'),
        childSafety: getValue('child-safety'),
        kidsActivitiesNearby: getValue('kids-activities-nearby'),
        
        // 14. MESSAGE DE L'HÔTE
        hostName: getValue('host-name'),
        welcomeMessage: getValue('welcome-message'),
        messageTone: getRadioValue('message-tone'),
        thankYouMessage: getValue('thank-you-message'),
        inviteReview: getCheckboxValue('invite-review'),
        hostFavorites: getValue('host-favorites'),
        
        // 15. VISUELS
        logoUrl: getValue('logo-url'),
        primaryColor: getValue('primary-color'),
        photoUrls: getValue('photo-urls'),
        
        // 16. PARAMÈTRES TECHNIQUES
        langFr: getCheckboxValue('lang-fr'),
        langEn: getCheckboxValue('lang-en'),
        guideTone: getRadioValue('guide-tone'),
        allowUpdates: getCheckboxValue('allow-updates'),
        
        // BONUS PRO
        faqNotes: getValue('faq-notes'),
        
        // Métadonnées
        createdAt: currentClientId ? 
            clients.find(c => c.id === currentClientId)?.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    if (currentClientId) {
        // Mise à jour
        const index = clients.findIndex(c => c.id === currentClientId);
        clients[index] = clientData;
    } else {
        // Nouveau client
        clients.push(clientData);
    }
    
    saveClients();
    alert('✅ Client enregistré avec succès !');
    currentClientId = null;
    resetForm();
    showSection('clients');
}

// === UTILITAIRES FORMULAIRE ===
function getValue(id) {
    const element = document.getElementById(id);
    return element ? element.value : '';
}

function getCheckboxValue(id) {
    const element = document.getElementById(id);
    return element ? element.checked : false;
}

function getRadioValue(name) {
    const element = document.querySelector(`input[name="${name}"]:checked`);
    return element ? element.value : '';
}

function getProcedureSteps() {
    const inputs = document.querySelectorAll('.procedure-input');
    return Array.from(inputs).map(input => input.value).filter(v => v.trim());
}

function getKeyReturnSteps() {
    const inputs = document.querySelectorAll('.key-return-input');
    return Array.from(inputs).map(input => input.value).filter(v => v.trim());
}

function getProximityItems() {
    const items = document.querySelectorAll('.proximity-item');
    return Array.from(items).map(item => ({
        name: item.querySelector('.proximity-name')?.value || '',
        type: item.querySelector('.proximity-type')?.value || '',
        distance: item.querySelector('.proximity-distance')?.value || '',
        link: item.querySelector('.proximity-link')?.value || ''
    })).filter(item => item.name.trim());
}

// === GESTION DES LISTES DYNAMIQUES ===
function addProcedureStep() {
    const container = document.getElementById('entry-procedure-list');
    const count = container.querySelectorAll('.procedure-item').length + 1;
    const div = document.createElement('div');
    div.className = 'procedure-item';
    div.innerHTML = `
        <input type="text" class="procedure-input" placeholder="Étape ${count}">
        <button type="button" class="btn-remove" onclick="removeProcedureStep(this)">🗑️</button>
    `;
    container.appendChild(div);
}

function removeProcedureStep(button) {
    button.parentElement.remove();
}

function addKeyReturnStep() {
    const container = document.getElementById('key-return-list');
    const count = container.querySelectorAll('.procedure-item').length + 1;
    const div = document.createElement('div');
    div.className = 'procedure-item';
    div.innerHTML = `
        <input type="text" class="key-return-input" placeholder="Étape ${count}">
        <button type="button" class="btn-remove" onclick="removeKeyReturnStep(this)">🗑️</button>
    `;
    container.appendChild(div);
}

function removeKeyReturnStep(button) {
    button.parentElement.remove();
}

function addProximityItem() {
    const container = document.getElementById('proximity-list');
    const div = document.createElement('div');
    div.className = 'proximity-item';
    div.innerHTML = `
        <input type="text" class="proximity-name" placeholder="Nom">
        <select class="proximity-type">
            <option value="supermarche">Supermarché</option>
            <option value="restaurant">Restaurant</option>
            <option value="plage">Plage</option>
            <option value="activite">Activité</option>
            <option value="transport">Transport</option>
        </select>
        <input type="text" class="proximity-distance" placeholder="Distance">
        <input type="url" class="proximity-link" placeholder="Lien Google Maps">
        <button type="button" class="btn-remove" onclick="removeProximityItem(this)">🗑️</button>
    `;
    container.appendChild(div);
}

function removeProximityItem(button) {
    button.parentElement.remove();
}

// === ACTIONS CLIENT ===
function editClient(id) {
    currentClientId = id;
    const client = clients.find(c => c.id === id);
    
    if (!client) return;
    
    // Titre du formulaire
    document.getElementById('form-title').textContent = '✏️ Modifier le client';
    document.getElementById('client-id').value = id;
    
    // 1. INFORMATIONS GÉNÉRALES
    setValue('property-name', client.propertyName);
    setRadioValue('property-type', client.propertyType);
    setValue('city', client.city);
    setValue('floor', client.floor);
    setValue('property-address', client.address);
    setValue('max-guests', client.maxGuests);
    setCheckboxValue('target-couple', client.targetCouple);
    setCheckboxValue('target-family', client.targetFamily);
    setCheckboxValue('target-pro', client.targetPro);
    setCheckboxValue('target-tourists', client.targetTourists);
    
    // 2. ARRIVÉE
    setValue('checkin-time', client.checkinTime);
    setCheckboxValue('access-keybox', client.accessKeybox);
    setCheckboxValue('access-digicode', client.accessDigicode);
    setCheckboxValue('access-physical', client.accessPhysical);
    setProcedureSteps(client.entryProcedure);
    setValue('arrival-contact-name', client.arrivalContactName);
    setValue('arrival-contact-phone', client.arrivalContactPhone);
    setValue('arrival-instructions', client.arrivalInstructions);
    
    // 3. DÉPART
    setValue('checkout-time', client.checkoutTime);
    setCheckboxValue('departure-trash', client.departureTrash);
    setCheckboxValue('departure-dishes', client.departureDishes);
    setCheckboxValue('departure-linen', client.departureLinen);
    setCheckboxValue('departure-ac', client.departureAC);
    setValue('departure-requested', client.departureRequested);
    setValue('departure-not-requested', client.departureNotRequested);
    setKeyReturnSteps(client.keyReturn);
    setValue('departure-message', client.departureMessage);
    
    // 4. ÉQUIPEMENTS
    setCheckboxValue('equip-oven', client.equipOven);
    setCheckboxValue('equip-microwave', client.equipMicrowave);
    setCheckboxValue('equip-coffee', client.equipCoffee);
    setCheckboxValue('equip-kettle', client.equipKettle);
    setCheckboxValue('equip-toaster', client.equipToaster);
    setCheckboxValue('equip-dishwasher', client.equipDishwasher);
    setCheckboxValue('equip-shower', client.equipShower);
    setCheckboxValue('equip-bathtub', client.equipBathtub);
    setCheckboxValue('equip-hairdryer', client.equipHairdryer);
    setCheckboxValue('equip-towels', client.equipTowels);
    setCheckboxValue('equip-ac', client.equipAC);
    setCheckboxValue('equip-fan', client.equipFan);
    setCheckboxValue('equip-washing', client.equipWashing);
    setCheckboxValue('equip-iron', client.equipIron);
    setCheckboxValue('equip-tv', client.equipTV);
    setCheckboxValue('equip-netflix', client.equipNetflix);
    setCheckboxValue('equip-speaker', client.equipSpeaker);
    setCheckboxValue('equip-usb', client.equipUSB);
    setCheckboxValue('equip-games', client.equipGames);
    setValue('equipment-notes', client.equipmentNotes);
    
    // 5. WI-FI & MULTIMÉDIA
    setValue('wifi-name', client.wifiName);
    setValue('wifi-password', client.wifiPassword);
    setValue('tv-instructions', client.tvInstructions);
    setCheckboxValue('streaming-netflix', client.streamingNetflix);
    setCheckboxValue('streaming-prime', client.streamingPrime);
    setCheckboxValue('streaming-disney', client.streamingDisney);
    setCheckboxValue('streaming-youtube', client.streamingYoutube);
    setValue('streaming-notes', client.streamingNotes);
    
    // 6. URGENCE
    setValue('emergency-name', client.emergencyName);
    setValue('emergency-phone', client.emergencyPhone);
    setValue('emergency-local', client.emergencyLocal);
    setValue('emergency-water', client.emergencyWater);
    setValue('emergency-electricity', client.emergencyElectricity);
    setValue('emergency-equipment', client.emergencyEquipment);
    setValue('safety-instructions', client.safetyInstructions);
    
    // 7. À PROXIMITÉ
    setProximityItems(client.proximityPlaces);
    
    // 8-16: Autres sections
    setValue('restaurants', client.restaurants);
    setValue('bars-snacks', client.barsSnacks);
    setValue('local-specialties', client.localSpecialties);
    setValue('market-info', client.marketInfo);
    setValue('activities-nature', client.activitiesNature);
    setValue('activities-kids', client.activitiesKids);
    setValue('activities-rain', client.activitiesRain);
    setValue('tourist-sites', client.touristSites);
    setValue('trash-management', client.trashManagement);
    setValue('linen-management', client.linenManagement);
    setValue('cleaning-products', client.cleaningProducts);
    setValue('long-stay-cleaning', client.longStayCleaning);
    setValue('quiet-hours', client.quietHours);
    setCheckboxValue('smoking-allowed', client.smokingAllowed);
    setCheckboxValue('pets-allowed', client.petsAllowed);
    setCheckboxValue('parties-allowed', client.partiesAllowed);
    setValue('pets-policy', client.petsPolicy);
    setValue('building-rules', client.buildingRules);
    setCheckboxValue('parking-included', client.parkingIncluded);
    setRadioValue('parking-type', client.parkingType);
    setValue('parking-spot', client.parkingSpot);
    setValue('parking-code', client.parkingCode);
    setValue('parking-instructions', client.parkingInstructions);
    setCheckboxValue('baby-bed', client.babyBed);
    setCheckboxValue('high-chair', client.highChair);
    setCheckboxValue('baby-bath', client.babyBath);
    setCheckboxValue('baby-monitor', client.babyMonitor);
    setValue('child-safety', client.childSafety);
    setValue('kids-activities-nearby', client.kidsActivitiesNearby);
    setValue('host-name', client.hostName);
    setValue('welcome-message', client.welcomeMessage);
    setRadioValue('message-tone', client.messageTone);
    setValue('thank-you-message', client.thankYouMessage);
    setCheckboxValue('invite-review', client.inviteReview);
    setValue('host-favorites', client.hostFavorites);
    setValue('logo-url', client.logoUrl);
    setValue('primary-color', client.primaryColor);
    setValue('photo-urls', client.photoUrls);
    setCheckboxValue('lang-fr', client.langFr);
    setCheckboxValue('lang-en', client.langEn);
    setRadioValue('guide-tone', client.guideTone);
    setCheckboxValue('allow-updates', client.allowUpdates);
    setValue('faq-notes', client.faqNotes);
    
    showSection('new-client');
}

function deleteClient(id) {
    if (!confirm('⚠️ Voulez-vous vraiment supprimer ce client ?')) return;
    
    clients = clients.filter(c => c.id !== id);
    saveClients();
}

function viewClient(id) {
    const client = clients.find(c => c.id === id);
    if (!client) return;
    
    // Générer et afficher la page
    const pageHTML = generateClientPage(client);
    const blob = new Blob([pageHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    document.getElementById('preview-iframe').src = url;
    document.getElementById('preview-modal').classList.add('show');
}

function closePreview() {
    document.getElementById('preview-modal').classList.remove('show');
}

// === QR CODE ===
function generateQR(id) {
    const client = clients.find(c => c.id === id);
    if (!client) return;
    
    // URL fictive - en production, ce serait l'URL réelle du site
    const url = `https://qrguide.app/${client.id}`;
    
    const container = document.getElementById('qr-code-container');
    container.innerHTML = '';
    
    QRCode.toCanvas(url, {
        width: 300,
        margin: 2,
        color: {
            dark: '#000000',
            light: '#FFFFFF'
        }
    }, function(error, canvas) {
        if (error) {
            console.error(error);
            return;
        }
        container.appendChild(canvas);
    });
    
    document.getElementById('qr-url').textContent = url;
    document.getElementById('qr-modal').classList.add('show');
}

function closeQRModal() {
    document.getElementById('qr-modal').classList.remove('show');
}

function downloadQR() {
    const canvas = document.querySelector('#qr-code-container canvas');
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = canvas.toDataURL();
    link.click();
}

// === EXPORT / IMPORT ===
function exportClient(id) {
    const client = clients.find(c => c.id === id);
    if (!client) return;
    
    const data = JSON.stringify(client, null, 2);
    downloadFile(`${client.propertyName}.json`, data);
}

function exportAllData() {
    const data = JSON.stringify(clients, null, 2);
    downloadFile('qrguide-clients.json', data);
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const data = JSON.parse(event.target.result);
                if (Array.isArray(data)) {
                    clients = data;
                } else {
                    clients.push(data);
                }
                saveClients();
                alert('✅ Données importées avec succès !');
            } catch (error) {
                alert('❌ Erreur lors de l\'importation');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

function clearAllData() {
    if (!confirm('⚠️ ATTENTION : Toutes les données seront supprimées définitivement !')) return;
    
    clients = [];
    saveClients();
    alert('🗑️ Toutes les données ont été supprimées');
}

// === HELPERS ===
function downloadFile(filename, content) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

function generateId() {
    return 'client_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function resetForm() {
    document.getElementById('client-form').reset();
    document.getElementById('form-title').textContent = '➕ Nouveau Client';
    currentClientId = null;
}

function setValue(id, value) {
    const element = document.getElementById(id);
    if (element) element.value = value || '';
}

function setCheckboxValue(id, value) {
    const element = document.getElementById(id);
    if (element) element.checked = !!value;
}

function setRadioValue(name, value) {
    const element = document.querySelector(`input[name="${name}"][value="${value}"]`);
    if (element) element.checked = true;
}

function setProcedureSteps(steps) {
    const container = document.getElementById('entry-procedure-list');
    container.innerHTML = '';
    (steps || []).forEach((step, index) => {
        const div = document.createElement('div');
        div.className = 'procedure-item';
        div.innerHTML = `
            <input type="text" class="procedure-input" placeholder="Étape ${index + 1}" value="${step}">
            <button type="button" class="btn-remove" onclick="removeProcedureStep(this)">🗑️</button>
        `;
        container.appendChild(div);
    });
}

function setKeyReturnSteps(steps) {
    const container = document.getElementById('key-return-list');
    container.innerHTML = '';
    (steps || []).forEach((step, index) => {
        const div = document.createElement('div');
        div.className = 'procedure-item';
        div.innerHTML = `
            <input type="text" class="key-return-input" placeholder="Étape ${index + 1}" value="${step}">
            <button type="button" class="btn-remove" onclick="removeKeyReturnStep(this)">🗑️</button>
        `;
        container.appendChild(div);
    });
}

function setProximityItems(items) {
    const container = document.getElementById('proximity-list');
    container.innerHTML = '';
    (items || []).forEach(item => {
        const div = document.createElement('div');
        div.className = 'proximity-item';
        div.innerHTML = `
            <input type="text" class="proximity-name" placeholder="Nom" value="${item.name || ''}">
            <select class="proximity-type">
                <option value="supermarche" ${item.type === 'supermarche' ? 'selected' : ''}>Supermarché</option>
                <option value="restaurant" ${item.type === 'restaurant' ? 'selected' : ''}>Restaurant</option>
                <option value="plage" ${item.type === 'plage' ? 'selected' : ''}>Plage</option>
                <option value="activite" ${item.type === 'activite' ? 'selected' : ''}>Activité</option>
                <option value="transport" ${item.type === 'transport' ? 'selected' : ''}>Transport</option>
            </select>
            <input type="text" class="proximity-distance" placeholder="Distance" value="${item.distance || ''}">
            <input type="url" class="proximity-link" placeholder="Lien Google Maps" value="${item.link || ''}">
            <button type="button" class="btn-remove" onclick="removeProximityItem(this)">🗑️</button>
        `;
        container.appendChild(div);
    });
}

// === GÉNÉRATION DE PAGE CLIENT ===
function generateClientPage(client) {
    return `<!DOCTYPE html>
<html lang="${client.langFr ? 'fr' : 'en'}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${client.propertyName} - Guide</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <header class="header">
        <h1>${client.propertyName}</h1>
        <p>Bienvenue chez ${client.hostName || 'nous'} !</p>
    </header>
    
    <main class="container">
        <div class="category-grid">
            <a href="pages/arrivee.html" class="category-card">
                <div class="card-icon">🔑</div>
                <h2>Arrivée</h2>
                <p>Accès et Wi-Fi</p>
            </a>
            
            <a href="pages/depart.html" class="category-card">
                <div class="card-icon">🚪</div>
                <h2>Départ</h2>
                <p>Informations de sortie</p>
            </a>
            
            <!-- Autres catégories... -->
        </div>
    </main>
</body>
</html>`;
}

function logout() {
    if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
        alert('👋 À bientôt !');
        // En production: redirection vers page de login
    }
}
