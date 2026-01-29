/* ===================================
   QRGUIDE - ADMIN JAVASCRIPT
   Dashboard admin connecté à Firestore
   Version: 2.0.0
   =================================== */

// === VARIABLES GLOBALES ===
const ADMIN_VERSION = '2.0.1';
let currentUser = null;
let allUsers = [];
let currentClientId = null;

// === INITIALISATION ===
document.addEventListener('DOMContentLoaded', function() {
    console.log(`🎛️ Dashboard Admin chargé - Version ${ADMIN_VERSION}`);
    
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
        await loadAllGuides(); // Charger aussi les guides au démarrage
        renderClients();
        updateClientsCount();
        
        // Afficher le dashboard avec les stats
        console.log('📊 Calcul des statistiques dashboard...');
        updateDashboardStats();
        console.log('✅ Dashboard initialisé');
    });
    
    initNavigation();
    initFormListeners();
});

// === CHARGEMENT DES UTILISATEURS DEPUIS FIRESTORE ===
async function loadAllUsers() {
    try {
        console.log('🔍 Chargement des utilisateurs...');
        
        // Requête optimisée avec index Firebase
        const usersSnapshot = await db.collection('users')
            .where('role', '==', 'client')
            .orderBy('createdAt', 'desc')
            .get();
        
        console.log(`📊 Nombre d'utilisateurs trouvés avec role=client: ${usersSnapshot.size}`);
        
        allUsers = [];
        
        for (const userDoc of usersSnapshot.docs) {
            const userData = userDoc.data();
            console.log('👤 User trouvé:', {
                uid: userDoc.id,
                email: userData.email,
                role: userData.role,
                plan: userData.plan,
                createdAt: userData.createdAt
            });
            
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
        console.log('📋 Détails allUsers:', allUsers);
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

async function showSection(sectionName) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    document.getElementById(`section-${sectionName}`).classList.add('active');
    document.querySelector(`[data-section="${sectionName}"]`)?.classList.add('active');
    
    // Actualiser les stats si on affiche le dashboard
    if (sectionName === 'dashboard') {
        await loadAllUsers(); // Recharger les utilisateurs
        updateDashboardStats();
    }
    
    // Recharger les clients si on affiche la section clients
    if (sectionName === 'clients') {
        await loadAllUsers(); // Recharger les utilisateurs
        renderClients();
        updateClientsCount();
    }
    
    // Charger les guides si on affiche la section guides
    if (sectionName === 'guides') {
        await loadAllGuides();
    }
}

function updateClientsCount() {
    document.getElementById('clients-count').textContent = allUsers.length;
}

// === STATISTIQUES DASHBOARD ===
function updateDashboardStats() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Filtrer les clients par période
    const clientsToday = allUsers.filter(user => {
        const createdAt = user.createdAt?.toDate();
        return createdAt && createdAt >= startOfToday;
    });
    
    const clientsThisWeek = allUsers.filter(user => {
        const createdAt = user.createdAt?.toDate();
        return createdAt && createdAt >= startOfWeek;
    });
    
    const clientsThisMonth = allUsers.filter(user => {
        const createdAt = user.createdAt?.toDate();
        return createdAt && createdAt >= startOfMonth;
    });
    
    // Répartition par plan
    const planMensuel = allUsers.filter(u => u.plan === 'mensuel').length;
    const planAnnuel = allUsers.filter(u => u.plan === 'annuel').length;
    
    // Calcul des revenus (avec Pack Création 150€ inclus)
    // Mensuel : 150€ (pack) + 8€/mois
    // Annuel : 150€ (pack) + 75€/an
    const revenueMensuelRecurrent = (planMensuel * 8) + (planAnnuel * 75 / 12);
    const revenuePackCreation = (planMensuel + planAnnuel) * 150; // Pack Création pour chaque client
    const revenueTotal = revenuePackCreation + (revenueMensuelRecurrent * 12); // Total annuel
    
    // Compter les plaques A4 (1 par client avec Pack Création) et A5 (option, non tracké pour l'instant)
    const plaquesA4 = planMensuel + planAnnuel; // 1 plaque A4 offerte par client
    const plaquesA5 = 0; // À tracker plus tard dans Firestore
    
    // Mise à jour des cartes statistiques
    document.getElementById('stats-today').textContent = clientsToday.length;
    document.getElementById('stats-week').textContent = clientsThisWeek.length;
    document.getElementById('stats-month').textContent = clientsThisMonth.length;
    document.getElementById('stats-total').textContent = allUsers.length;
    
    document.getElementById('plan-mensuel').textContent = planMensuel;
    document.getElementById('plan-annuel').textContent = planAnnuel;
    document.getElementById('revenue-monthly').textContent = Math.round(revenueMensuelRecurrent) + '€/mois';
    
    // Mettre à jour les statistiques de plaques si les éléments existent
    const plaquesA4El = document.getElementById('plaques-a4');
    const plaquesA5El = document.getElementById('plaques-a5');
    const revenueTotalEl = document.getElementById('revenue-total');
    
    if (plaquesA4El) plaquesA4El.textContent = plaquesA4;
    if (plaquesA5El) plaquesA5El.textContent = plaquesA5;
    if (revenueTotalEl) revenueTotalEl.textContent = Math.round(revenueTotal) + '€/an';
    
    // Afficher les derniers clients
    renderRecentClients();
}

function renderRecentClients() {
    const container = document.getElementById('recent-clients-list');
    
    // Trier par date de création (plus récent en premier)
    const recentClients = [...allUsers]
        .filter(u => u.createdAt)
        .sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate())
        .slice(0, 5);
    
    if (recentClients.length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center;">Aucun client</p>';
        return;
    }
    
    container.innerHTML = recentClients.map(user => {
        const createdAt = user.createdAt.toDate();
        const formattedDate = createdAt.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const planBadge = user.plan === 'mensuel' 
            ? '<span style="background: #667eea; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">Mensuel</span>'
            : '<span style="background: #764ba2; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">Annuel</span>';
        
        return `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid #eee; cursor: pointer;" onclick="viewUserDetails('${user.uid}')">
                <div>
                    <h4 style="margin: 0 0 4px 0; color: #333;">${user.firstname} ${user.lastname}</h4>
                    <p style="margin: 0; color: #666; font-size: 0.9rem;">📧 ${user.email}</p>
                    <p style="margin: 4px 0 0 0; color: #999; font-size: 0.85rem;">📅 ${formattedDate}</p>
                </div>
                <div style="text-align: right;">
                    ${planBadge}
                    <p style="margin: 8px 0 0 0; color: #999; font-size: 0.85rem;">${user.logements ? user.logements.length : 0} logement(s)</p>
                </div>
            </div>
        `;
    }).join('');
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
                <strong>${l.nom || 'Sans nom'}</strong><br>
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
        auth.signOut().then(() => {
            window.location.href = '../login.html';
        });
    }
}

// === GESTION DES GUIDES ===
let allGuides = [];
let filteredGuides = [];
let isLoadingGuides = false;

async function loadAllGuides() {
    // Empêcher les chargements simultanés
    if (isLoadingGuides) {
        console.log('⏳ Chargement déjà en cours, annulation...');
        return;
    }
    
    isLoadingGuides = true;
    
    try {
        console.log('📱 Chargement de tous les guides...');
        
        const guidesSnapshot = await db.collection('guides')
            .orderBy('createdAt', 'desc')
            .get();
        
        console.log(`📊 Nombre de guides trouvés dans Firestore: ${guidesSnapshot.size}`);
        
        allGuides = [];
        
        // Enrichir chaque guide avec les infos du propriétaire
        for (const doc of guidesSnapshot.docs) {
            const guideData = doc.data();
            
            console.log('📱 Guide trouvé:', {
                id: doc.id,
                guideId: guideData.guideId,
                nom: guideData.nom,
                userId: guideData.userId
            });
            
            let ownerInfo = null;
            
            // Récupérer les infos du propriétaire si userId existe
            if (guideData.userId) {
                try {
                    const userDoc = await db.collection('users').doc(guideData.userId).get();
                    if (userDoc.exists) {
                        const userData = userDoc.data();
                        ownerInfo = {
                            email: userData.email,
                            firstname: userData.firstname,
                            lastname: userData.lastname,
                            phone: userData.phone
                        };
                    }
                } catch (err) {
                    console.warn('Impossible de charger le propriétaire:', err);
                }
            }
            
            allGuides.push({
                id: doc.id,
                ...guideData,
                owner: ownerInfo
            });
        }
        
        filteredGuides = [...allGuides];
        
        console.log('✅ Guides chargés:', allGuides.length);
        
        // Mettre à jour le badge
        document.getElementById('guides-count').textContent = allGuides.length;
        
        // Calculer les statistiques
        updateGuidesStats();
        
        // Afficher les guides
        renderGuides();
        
    } catch (error) {
        console.error('❌ Erreur chargement guides:', error);
        alert('Erreur lors du chargement des guides');
    } finally {
        isLoadingGuides = false;
    }
}

function updateGuidesStats() {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const guidesThisWeek = allGuides.filter(guide => {
        const createdAt = guide.createdAt?.toDate();
        return createdAt && createdAt >= weekAgo;
    }).length;
    
    const guidesThisMonth = allGuides.filter(guide => {
        const createdAt = guide.createdAt?.toDate();
        return createdAt && createdAt >= monthStart;
    }).length;
    
    document.getElementById('total-guides').textContent = allGuides.length;
    document.getElementById('guides-this-week').textContent = guidesThisWeek;
    document.getElementById('guides-this-month').textContent = guidesThisMonth;
}

function renderGuides() {
    const guidesList = document.getElementById('guides-list');
    const emptyState = document.getElementById('guides-empty-state');
    
    if (!guidesList) return;
    
    if (filteredGuides.length === 0) {
        guidesList.style.display = 'none';
        emptyState.style.display = 'flex';
        return;
    }
    
    guidesList.style.display = 'block';
    emptyState.style.display = 'none';
    guidesList.innerHTML = '';
    
    console.log(`📊 Affichage de ${filteredGuides.length} guides`);
    
    // Grouper les guides par client
    const guidesByOwner = {};
    filteredGuides.forEach(guide => {
        const ownerId = guide.userId || 'unknown';
        if (!guidesByOwner[ownerId]) {
            guidesByOwner[ownerId] = {
                owner: guide.owner,
                userId: ownerId,
                guides: []
            };
        }
        guidesByOwner[ownerId].guides.push(guide);
    });
    
    console.log(`👥 Nombre de clients: ${Object.keys(guidesByOwner).length}`);
    Object.entries(guidesByOwner).forEach(([ownerId, data]) => {
        console.log(`  - Client ${ownerId}: ${data.guides.length} guide(s)`);
    });
    
    // Afficher par client
    Object.values(guidesByOwner).forEach(({ owner, userId, guides }) => {
        // En-tête client
        const clientHeader = document.createElement('div');
        clientHeader.style.cssText = 'margin: 24px 0 16px 0; padding: 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; color: white;';
        clientHeader.innerHTML = `
            <h3 style="margin: 0 0 8px 0; font-size: 1.3rem;">
                👤 ${owner ? `${owner.firstname} ${owner.lastname}` : 'Client inconnu'}
            </h3>
            ${owner ? `
                <p style="margin: 0; opacity: 0.9; font-size: 0.95rem;">📧 ${owner.email}</p>
                ${owner.phone ? `<p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 0.95rem;">📞 ${owner.phone}</p>` : ''}
            ` : ''}
            <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 0.9rem;">📊 ${guides.length} logement(s)</p>
        `;
        guidesList.appendChild(clientHeader);
        
        // Grille de guides pour ce client
        const guidesGrid = document.createElement('div');
        guidesGrid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(450px, 1fr)); gap: 20px; margin-bottom: 32px;';
        
        guides.forEach(guide => {
        const card = document.createElement('div');
        card.className = 'client-card';
        
        const createdAt = guide.createdAt?.toDate();
        const formattedDate = createdAt ? createdAt.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }) : 'Date inconnue';
        
        card.innerHTML = `
            <div style="display: flex; gap: 16px;">
                ${guide.photo_url ? `
                    <img src="${guide.photo_url}" 
                         style="width: 120px; height: 120px; object-fit: cover; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" 
                         alt="${guide.nom}">
                ` : `
                    <div style="width: 120px; height: 120px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 3rem;">
                        🏠
                    </div>
                `}
                <div style="flex: 1;">
                    <h3 style="margin: 0 0 8px 0; color: #333; font-size: 1.3rem;">${guide.nom || 'Sans nom'}</h3>
                    <p style="margin: 0 0 4px 0; color: #666;">
                        <strong>📍</strong> ${guide.ville || 'Ville non spécifiée'}
                    </p>
                    <p style="margin: 0 0 4px 0; color: #666; font-size: 0.9rem;">
                        <strong>🆔</strong> <code style="background: #f8f9fa; padding: 2px 6px; border-radius: 4px;">${guide.guideId || guide.id}</code>
                    </p>
                    <p style="margin: 0 0 8px 0; color: #999; font-size: 0.85rem;">
                        📅 Créé le ${formattedDate}
                    </p>
                    ${guide.guideUrl ? `
                        <p style="margin: 0 0 12px 0; font-size: 0.85rem;">
                            🔗 <a href="${guide.guideUrl}" target="_blank" style="color: #667eea;">${guide.guideUrl}</a>
                        </p>
                    ` : ''}
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        <button class="btn-primary" style="padding: 8px 16px; font-size: 0.9rem;" onclick="window.open('/guide/${guide.guideId || guide.id}', '_blank')">
                            👁️ Voir
                        </button>
                        <button class="btn-secondary" style="padding: 8px 16px; font-size: 0.9rem; background: #d4af37; color: white;" onclick="editGuide('${guide.guideId || guide.id}')">
                            ✏️ Modifier
                        </button>
                        <button class="btn-secondary" style="padding: 8px 16px; font-size: 0.9rem;" onclick="copyGuideUrl('${guide.guideUrl}')">
                            📋 Copier lien
                        </button>
                        <button class="btn-secondary" style="padding: 8px 16px; font-size: 0.9rem;" onclick="showGuideQR('${guide.guideId || guide.id}', '${guide.guideUrl}')">
                            📱 QR Guide
                        </button>
                        <button class="btn-secondary" style="padding: 8px 16px; font-size: 0.9rem; background: #28a745; color: white;" onclick="showWiFiQR('${guide.guideId || guide.id}', '${escapeJs(guide.wifi_nom)}', '${escapeJs(guide.wifi_password)}')">
                            📶 QR WiFi
                        </button>
                        <button class="btn-danger" style="padding: 8px 16px; font-size: 0.9rem; background: #dc3545; color: white; border: none;" onclick="deleteGuide('${guide.guideId || guide.id}')">
                            🗑️ Supprimer
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        guidesGrid.appendChild(card);
        });
        
        guidesList.appendChild(guidesGrid);
    });
}

// Fonction helper pour échapper les caractères JavaScript
function escapeJs(str) {
    if (!str) return '';
    return str.replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\\/g, '\\\\');
}

function filterGuides() {
    const search = document.getElementById('guides-search').value.toLowerCase();
    
    filteredGuides = allGuides.filter(guide => {
        const nom = (guide.nom || '').toLowerCase();
        const ville = (guide.ville || '').toLowerCase();
        const id = (guide.guideId || guide.id || '').toLowerCase();
        
        return nom.includes(search) || ville.includes(search) || id.includes(search);
    });
    
    renderGuides();
}

function filterGuidesByStatus(status) {
    // Mettre à jour les boutons de filtre
    document.querySelectorAll('.btn-filter').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    const now = new Date();
    
    if (status === 'all') {
        filteredGuides = [...allGuides];
    } else if (status === 'recent') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredGuides = allGuides.filter(guide => {
            const createdAt = guide.createdAt?.toDate();
            return createdAt && createdAt >= weekAgo;
        });
    } else if (status === 'month') {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        filteredGuides = allGuides.filter(guide => {
            const createdAt = guide.createdAt?.toDate();
            return createdAt && createdAt >= monthStart;
        });
    }
    
    renderGuides();
}

function copyGuideUrl(url) {
    navigator.clipboard.writeText(url).then(() => {
        alert('📋 Lien copié dans le presse-papier !');
    }).catch(err => {
        console.error('Erreur copie:', err);
    });
}

function showGuideQR(guideId, guideUrl) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px; text-align: center;">
            <div class="modal-header">
                <h3>📱 QR Code du Guide</h3>
                <button class="btn-close" onclick="this.closest('.modal').remove()">✕</button>
            </div>
            <div class="modal-body">
                <div id="qr-container-${guideId}" style="display: flex; justify-content: center; margin: 24px 0;"></div>
                <p style="word-break: break-all; color: #666; font-size: 0.9rem;">${guideUrl}</p>
            </div>
            <div class="modal-footer">
                <button class="btn-primary" onclick="downloadGuideQR('${guideId}')">💾 Télécharger</button>
                <button class="btn-secondary" onclick="this.closest('.modal').remove()">Fermer</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Générer le QR code
    const qrContainer = document.getElementById(`qr-container-${guideId}`);
    const qrImg = document.createElement('img');
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(guideUrl)}`;
    qrImg.id = `qr-img-${guideId}`;
    qrContainer.appendChild(qrImg);
}

function downloadGuideQR(guideId) {
    const qrImg = document.getElementById(`qr-img-${guideId}`);
    if (qrImg) {
        const link = document.createElement('a');
        link.href = qrImg.src;
        link.download = `qrcode-guide-${guideId}.png`;
        link.click();
    }
}

// QR Code WiFi
function showWiFiQR(guideId, wifiName, wifiPassword) {
    if (!wifiName || !wifiPassword) {
        alert('⚠️ Informations WiFi manquantes pour ce guide');
        return;
    }
    
    // Format spécial pour QR WiFi
    const wifiString = `WIFI:T:WPA;S:${wifiName};P:${wifiPassword};;`;
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px; text-align: center;">
            <div class="modal-header">
                <h3>📶 QR Code WiFi</h3>
                <button class="btn-close" onclick="this.closest('.modal').remove()">✕</button>
            </div>
            <div class="modal-body">
                <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                    <p style="margin: 0 0 8px 0; color: #666;"><strong>Réseau:</strong> ${wifiName}</p>
                    <p style="margin: 0; color: #666;"><strong>Mot de passe:</strong> ${wifiPassword}</p>
                </div>
                <div id="qr-wifi-container-${guideId}" style="display: flex; justify-content: center; margin: 24px 0;"></div>
                <p style="color: #999; font-size: 0.85rem;">Scannez ce QR code pour vous connecter automatiquement au WiFi</p>
            </div>
            <div class="modal-footer">
                <button class="btn-primary" onclick="downloadWiFiQR('${guideId}', '${escapeJs(wifiName)}')">💾 Télécharger</button>
                <button class="btn-secondary" onclick="this.closest('.modal').remove()">Fermer</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Générer le QR code WiFi
    const qrContainer = document.getElementById(`qr-wifi-container-${guideId}`);
    const qrImg = document.createElement('img');
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(wifiString)}`;
    qrImg.id = `qr-wifi-img-${guideId}`;
    qrContainer.appendChild(qrImg);
}

function downloadWiFiQR(guideId, wifiName) {
    const qrImg = document.getElementById(`qr-wifi-img-${guideId}`);
    if (qrImg) {
        const link = document.createElement('a');
        link.href = qrImg.src;
        link.download = `qrcode-wifi-${wifiName || guideId}.png`;
        link.click();
    }
}

// Charger les guides quand on affiche la section
const originalShowSection = showSection;
showSection = function(sectionName) {
    originalShowSection(sectionName);
    
    if (sectionName === 'guides') {
        loadAllGuides();
    }
};

// === MODIFIER UN GUIDE ===
async function editGuide(guideId) {
    try {
        // Récupérer les données du guide
        const guideDoc = await db.collection('guides').doc(guideId).get();
        if (!guideDoc.exists) {
            alert('Guide introuvable');
            return;
        }
        
        const guideData = guideDoc.data();
        
        // Créer un modal avec un formulaire d'édition COMPLET
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 20px;';
        
        modal.innerHTML = `
            <div style="background: white; border-radius: 16px; max-width: 1000px; max-height: 90vh; overflow-y: auto; padding: 32px; width: 100%;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; position: sticky; top: 0; background: white; z-index: 10; padding-bottom: 16px; border-bottom: 2px solid #e9ecef;">
                    <h2 style="margin: 0; color: #d4af37;">✏️ Modifier le Guide - ${guideData.nom || 'Sans nom'}</h2>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" style="background: #f8f9fa; border: none; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; font-size: 1.2rem;">✕</button>
                </div>
                
                <div style="margin-bottom: 16px;">
                    <p style="background: #e3f2fd; padding: 12px; border-radius: 8px; margin-bottom: 20px;">
                        <strong>🆔 ID du guide :</strong> <code>${guideId}</code><br>
                        <strong>🔗 URL :</strong> <a href="/guide/${guideId}" target="_blank">/guide/${guideId}</a>
                    </p>
                    
                    <!-- SECTION 1: INFORMATIONS GÉNÉRALES -->
                    <h3 style="color: #d4af37; margin: 24px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #f0f0f0;">📋 Informations Générales</h3>
                    
                    <label style="display: block; font-weight: 600; margin-bottom: 8px;">Nom du logement *</label>
                    <input type="text" id="edit-nom" value="${guideData.nom || ''}" style="width: 100%; padding: 10px; border: 2px solid #e9ecef; border-radius: 8px; margin-bottom: 16px;">
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                        <div>
                            <label style="display: block; font-weight: 600; margin-bottom: 8px;">Adresse</label>
                            <input type="text" id="edit-adresse" value="${guideData.adresse || ''}" style="width: 100%; padding: 10px; border: 2px solid #e9ecef; border-radius: 8px;">
                        </div>
                        <div>
                            <label style="display: block; font-weight: 600; margin-bottom: 8px;">Ville *</label>
                            <input type="text" id="edit-ville" value="${guideData.ville || ''}" style="width: 100%; padding: 10px; border: 2px solid #e9ecef; border-radius: 8px;">
                        </div>
                    </div>
                    
                    <label style="display: block; font-weight: 600; margin-bottom: 8px;">Description</label>
                    <input type="text" id="edit-description" value="${guideData.description || ''}" style="width: 100%; padding: 10px; border: 2px solid #e9ecef; border-radius: 8px; margin-bottom: 16px;">
                    
                    <label style="display: block; font-weight: 600; margin-bottom: 8px;">URL de la photo</label>
                    <input type="text" id="edit-photo" value="${guideData.photo_url || ''}" style="width: 100%; padding: 10px; border: 2px solid #e9ecef; border-radius: 8px; margin-bottom: 16px;">
                    
                    <!-- SECTION 2: ARRIVÉE -->
                    <h3 style="color: #d4af37; margin: 24px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #f0f0f0;">✨ Page Arrivée</h3>
                    
                    <label style="display: block; font-weight: 600; margin-bottom: 8px;">Message de bienvenue</label>
                    <textarea id="edit-message" style="width: 100%; padding: 10px; border: 2px solid #e9ecef; border-radius: 8px; min-height: 100px; margin-bottom: 16px;">${guideData.message_bienvenue || ''}</textarea>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                        <div>
                            <label style="display: block; font-weight: 600; margin-bottom: 8px;">Heure d'arrivée</label>
                            <input type="time" id="edit-checkin" value="${guideData.checkin_time || ''}" style="width: 100%; padding: 10px; border: 2px solid #e9ecef; border-radius: 8px;">
                        </div>
                        <div>
                            <label style="display: block; font-weight: 600; margin-bottom: 8px;">Heure de départ</label>
                            <input type="time" id="edit-checkout" value="${guideData.checkout_time || ''}" style="width: 100%; padding: 10px; border: 2px solid #e9ecef; border-radius: 8px;">
                        </div>
                    </div>
                    
                    <label style="display: block; font-weight: 600; margin-bottom: 8px;">Instructions d'arrivée</label>
                    <textarea id="edit-instructions-arrivee" style="width: 100%; padding: 10px; border: 2px solid #e9ecef; border-radius: 8px; min-height: 80px; margin-bottom: 16px;">${guideData.instructions_arrivee || ''}</textarea>
                    
                    <label style="display: block; font-weight: 600; margin-bottom: 8px;">Code d'accès</label>
                    <input type="text" id="edit-code-acces" value="${guideData.code_acces || ''}" style="width: 100%; padding: 10px; border: 2px solid #e9ecef; border-radius: 8px; margin-bottom: 16px;">
                    
                    <label style="display: block; font-weight: 600; margin-bottom: 8px;">Parking</label>
                    <input type="text" id="edit-parking" value="${guideData.parking_info || ''}" style="width: 100%; padding: 10px; border: 2px solid #e9ecef; border-radius: 8px; margin-bottom: 16px;">
                    
                    <!-- SECTION 3: DÉPART -->
                    <h3 style="color: #d4af37; margin: 24px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #f0f0f0;">🚪 Page Départ</h3>
                    
                    <label style="display: block; font-weight: 600; margin-bottom: 8px;">Instructions de départ</label>
                    <textarea id="edit-instructions-depart" style="width: 100%; padding: 10px; border: 2px solid #e9ecef; border-radius: 8px; min-height: 100px; margin-bottom: 16px;">${guideData.instructions_depart || ''}</textarea>
                    
                    <label style="display: block; font-weight: 600; margin-bottom: 8px;">Restitution des clés</label>
                    <textarea id="edit-instructions-cles" style="width: 100%; padding: 10px; border: 2px solid #e9ecef; border-radius: 8px; min-height: 60px; margin-bottom: 16px;">${guideData.instructions_cles || ''}</textarea>
                    
                    <label style="display: block; font-weight: 600; margin-bottom: 8px;">Ménage et tri</label>
                    <textarea id="edit-menage-tri" style="width: 100%; padding: 10px; border: 2px solid #e9ecef; border-radius: 8px; min-height: 80px; margin-bottom: 16px;">${guideData.menage_tri || ''}</textarea>
                    
                    <!-- SECTION 4: WIFI & MULTIMÉDIA -->
                    <h3 style="color: #d4af37; margin: 24px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #f0f0f0;">📶 WiFi & Multimédia</h3>
                    
                    <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                        <p style="margin: 0 0 12px 0; font-weight: 600; color: #666;">📶 Wi-Fi</p>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                            <div>
                                <label style="display: block; font-weight: 500; margin-bottom: 8px; font-size: 0.9rem;">Nom du réseau WiFi</label>
                                <input type="text" id="edit-wifi-nom" value="${guideData.wifi_nom || ''}" style="width: 100%; padding: 8px; border: 1px solid #dee2e6; border-radius: 6px;">
                            </div>
                            <div>
                                <label style="display: block; font-weight: 500; margin-bottom: 8px; font-size: 0.9rem;">Mot de passe WiFi</label>
                                <input type="text" id="edit-wifi-password" value="${guideData.wifi_password || ''}" style="width: 100%; padding: 8px; border: 1px solid #dee2e6; border-radius: 6px;">
                            </div>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 12px;">
                            <div>
                                <label style="display: block; font-weight: 500; margin-bottom: 8px; font-size: 0.9rem;">Débit internet</label>
                                <input type="text" id="edit-wifi-debit" value="${guideData.wifi_debit || ''}" style="width: 100%; padding: 8px; border: 1px solid #dee2e6; border-radius: 6px;">
                            </div>
                            <div>
                                <label style="display: block; font-weight: 500; margin-bottom: 8px; font-size: 0.9rem;">Emplacement box</label>
                                <input type="text" id="edit-wifi-box" value="${guideData.wifi_box_emplacement || ''}" style="width: 100%; padding: 8px; border: 1px solid #dee2e6; border-radius: 6px;">
                            </div>
                        </div>
                    </div>
                    
                    <!-- SECTION 5: ÉQUIPEMENTS -->
                    <h3 style="color: #d4af37; margin: 24px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #f0f0f0;">🏠 Équipements</h3>
                    
                    <label style="display: block; font-weight: 600; margin-bottom: 8px;">Instructions climatisation</label>
                    <textarea id="edit-instructions-clim" style="width: 100%; padding: 10px; border: 2px solid #e9ecef; border-radius: 8px; min-height: 60px; margin-bottom: 16px;">${guideData.instructions_clim || ''}</textarea>
                    
                    <!-- SECTION 6: HÔTE -->
                    <h3 style="color: #d4af37; margin: 24px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #f0f0f0;">👤 Votre Hôte</h3>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                        <div>
                            <label style="display: block; font-weight: 600; margin-bottom: 8px;">Nom de l'hôte</label>
                            <input type="text" id="edit-hote-noms" value="${guideData.hote_noms || ''}" style="width: 100%; padding: 10px; border: 2px solid #e9ecef; border-radius: 8px;">
                        </div>
                        <div>
                            <label style="display: block; font-weight: 600; margin-bottom: 8px;">Téléphone</label>
                            <input type="text" id="edit-hote-telephone" value="${guideData.hote_telephone || ''}" style="width: 100%; padding: 10px; border: 2px solid #e9ecef; border-radius: 8px;">
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                        <div>
                            <label style="display: block; font-weight: 600; margin-bottom: 8px;">Email</label>
                            <input type="email" id="edit-hote-email" value="${guideData.hote_email || ''}" style="width: 100%; padding: 10px; border: 2px solid #e9ecef; border-radius: 8px;">
                        </div>
                        <div>
                            <label style="display: block; font-weight: 600; margin-bottom: 8px;">WhatsApp</label>
                            <input type="text" id="edit-hote-whatsapp" value="${guideData.hote_whatsapp || ''}" style="width: 100%; padding: 10px; border: 2px solid #e9ecef; border-radius: 8px;">
                        </div>
                    </div>
                    
                    <!-- SECTION 7: RÈGLES & INFOS -->
                    <h3 style="color: #d4af37; margin: 24px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #f0f0f0;">📖 Règles & Infos Pratiques</h3>
                    
                    <label style="display: block; font-weight: 600; margin-bottom: 8px;">Règles de la maison</label>
                    <textarea id="edit-regles" style="width: 100%; padding: 10px; border: 2px solid #e9ecef; border-radius: 8px; min-height: 80px; margin-bottom: 16px;">${guideData.regles || ''}</textarea>
                    
                    <label style="display: block; font-weight: 600; margin-bottom: 8px;">Tri des déchets</label>
                    <textarea id="edit-tri-dechets" style="width: 100%; padding: 10px; border: 2px solid #e9ecef; border-radius: 8px; min-height: 60px; margin-bottom: 16px;">${guideData.tri_dechets || ''}</textarea>
                    
                    <label style="display: block; font-weight: 600; margin-bottom: 8px;">Conseils et astuces locales</label>
                    <textarea id="edit-conseils" style="width: 100%; padding: 10px; border: 2px solid #e9ecef; border-radius: 8px; min-height: 80px; margin-bottom: 16px;">${guideData.conseils || ''}</textarea>
                    
                    <!-- BOUTONS D'ACTION -->
                    <div style="display: flex; gap: 12px; margin-top: 32px; position: sticky; bottom: 0; background: white; padding: 16px 0; border-top: 2px solid #e9ecef;">
                        <button onclick="saveGuideEdits('${guideId}')" style="flex: 1; padding: 14px; background: #d4af37; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 1rem;">
                            💾 Sauvegarder toutes les modifications
                        </button>
                        <button onclick="this.parentElement.parentElement.parentElement.parentElement.remove()" style="padding: 14px 24px; background: #6c757d; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
                            Annuler
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
    } catch (error) {
        console.error('❌ Erreur chargement guide:', error);
        alert('Erreur lors du chargement du guide');
    }
}

// === SAUVEGARDER LES MODIFICATIONS ===
async function saveGuideEdits(guideId) {
    try {
        // Fonction helper pour récupérer une valeur de façon sécurisée
        const getValue = (id) => {
            const el = document.getElementById(id);
            return el ? el.value : '';
        };
        
        const updatedData = {
            // Informations générales
            nom: getValue('edit-nom'),
            adresse: getValue('edit-adresse'),
            ville: getValue('edit-ville'),
            description: getValue('edit-description'),
            photo_url: getValue('edit-photo'),
            
            // Arrivée
            message_bienvenue: getValue('edit-message'),
            checkin_time: getValue('edit-checkin'),
            checkout_time: getValue('edit-checkout'),
            instructions_arrivee: getValue('edit-instructions-arrivee'),
            code_acces: getValue('edit-code-acces'),
            parking_info: getValue('edit-parking'),
            
            // Départ
            instructions_depart: getValue('edit-instructions-depart'),
            instructions_cles: getValue('edit-instructions-cles'),
            menage_tri: getValue('edit-menage-tri'),
            
            // WiFi & Multimédia
            wifi_nom: getValue('edit-wifi-nom'),
            wifi_password: getValue('edit-wifi-password'),
            wifi_debit: getValue('edit-wifi-debit'),
            wifi_box_emplacement: getValue('edit-wifi-box'),
            
            // Équipements
            instructions_clim: getValue('edit-instructions-clim'),
            
            // Hôte
            hote_noms: getValue('edit-hote-noms'),
            hote_telephone: getValue('edit-hote-telephone'),
            hote_email: getValue('edit-hote-email'),
            hote_whatsapp: getValue('edit-hote-whatsapp'),
            
            // Règles & Infos
            regles: getValue('edit-regles'),
            tri_dechets: getValue('edit-tri-dechets'),
            conseils: getValue('edit-conseils'),
            
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Nettoyer les champs vides undefined pour éviter de supprimer les données existantes
        Object.keys(updatedData).forEach(key => {
            if (updatedData[key] === undefined || updatedData[key] === null) {
                delete updatedData[key];
            }
        });
        
        await db.collection('guides').doc(guideId).update(updatedData);
        
        alert('✅ Guide mis à jour avec succès !');
        
        // Fermer le modal
        document.querySelector('.modal').remove();
        
        // Recharger les guides
        await loadAllGuides();
        
    } catch (error) {
        console.error('❌ Erreur sauvegarde:', error);
        alert('Erreur lors de la sauvegarde : ' + error.message);
    }
}

// === SUPPRIMER UN GUIDE ===
async function deleteGuide(guideId) {
    if (!confirm(`⚠️ Êtes-vous sûr de vouloir supprimer ce guide ?\n\nID: ${guideId}\n\nCette action est irréversible !`)) {
        return;
    }
    
    try {
        await db.collection('guides').doc(guideId).delete();
        alert('✅ Guide supprimé avec succès !');
        await loadAllGuides();
    } catch (error) {
        console.error('❌ Erreur suppression:', error);
        alert('Erreur lors de la suppression : ' + error.message);
    }
}
