/* ===================================
   QRGUIDE - JavaScript
   Guide de séjour digital pour Airbnb
   =================================== */

// === TOGGLE MORE INFO (Page d'accueil) ===
function toggleMoreInfo() {
  const moreCards = document.getElementById('more-cards');
  const arrow = document.getElementById('arrow');
  
  if (moreCards && arrow) {
    moreCards.classList.toggle('visible');
    arrow.classList.toggle('rotated');
  }
}

// === CHARGEMENT DU CONTENU ===
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ QRGUIDE chargé avec succès');
    
    // Initialiser les fonctionnalités
    initAccordions();
    initChecklistSaving();
    loadContentFromConfig();
    initSmoothTransitions();
    applyCustomColor();
    initLanguageSelector();
});

// === SYSTÈME DE TRADUCTION ===
// DÉSACTIVÉ - Utilisation de Google Translate à la place
function applyTranslations(lang) {
    console.log(`ℹ️ Système de traduction manuel désactivé - Google Translate utilisé`);
    // Ne rien faire - Google Translate gère la traduction
}

// === SÉLECTEUR DE LANGUE ===
// DÉSACTIVÉ - Utilisation de Google Translate à la place
function initLanguageSelector() {
    console.log(`ℹ️ Sélecteur de langue manuel désactivé - Google Translate utilisé`);
    // Ne rien faire - Google Translate gère la langue
}

// === APPLIQUER LA COULEUR PERSONNALISÉE ===
function applyCustomColor() {
    // Récupérer la couleur depuis localStorage
    const stored = localStorage.getItem('qrguide_clients');
    if (!stored) return;
    
    try {
        const clients = JSON.parse(stored);
        if (clients.length > 0) {
            const primaryColor = clients[0].primaryColor || '#C9A961';
            
            // Convertir hex en RGB
            const rgb = hexToRgb(primaryColor);
            if (rgb) {
                document.documentElement.style.setProperty('--primary-color', primaryColor);
                document.documentElement.style.setProperty('--primary-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
                console.log(`🎨 Couleur personnalisée appliquée: ${primaryColor}`);
            }
        }
    } catch (e) {
        console.error('Erreur lors de l\'application de la couleur:', e);
    }
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// === ACCORDÉONS (Page Urgence) ===
function initAccordions() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const accordionItem = this.parentElement;
            const isActive = accordionItem.classList.contains('active');
            
            // Fermer tous les autres accordéons
            document.querySelectorAll('.accordion-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Ouvrir/fermer l'accordéon cliqué
            if (!isActive) {
                accordionItem.classList.add('active');
            }
        });
    });
}

// === SAUVEGARDE CHECKLIST (Page Départ) ===
function initChecklistSaving() {
    const checkboxes = document.querySelectorAll('.checklist-item input[type="checkbox"]');
    const checklistId = 'qrguide-checkout-checklist';
    
    // Charger l'état sauvegardé
    const savedState = localStorage.getItem(checklistId);
    if (savedState) {
        const checkedItems = JSON.parse(savedState);
        checkboxes.forEach((checkbox, index) => {
            checkbox.checked = checkedItems[index] || false;
        });
    }
    
    // Sauvegarder quand une case est cochée/décochée
    checkboxes.forEach((checkbox, index) => {
        checkbox.addEventListener('change', function() {
            const checkedItems = Array.from(checkboxes).map(cb => cb.checked);
            localStorage.setItem(checklistId, JSON.stringify(checkedItems));
        });
    });
}

// === CHARGEMENT DU CONTENU DEPUIS CONFIG.JSON ===
function loadContentFromConfig() {
    // Vérifier si nous sommes sur une page qui nécessite le chargement de config
    const needsConfig = document.querySelector('[id*="checkin-time"], [id*="wifi-name"], [id*="contact"]');
    
    if (!needsConfig) return;
    
    // Charger le fichier de configuration
    fetch('../data/config.json')
        .then(response => {
            if (!response.ok) {
                console.warn('⚠️ Fichier config.json non trouvé, contenu par défaut utilisé');
                return null;
            }
            return response.json();
        })
        .then(config => {
            if (!config) return;
            
            console.log('✅ Configuration chargée');
            applyConfig(config);
        })
        .catch(error => {
            console.warn('⚠️ Erreur lors du chargement de config.json:', error);
        });
}

// === APPLIQUER LA CONFIGURATION ===
function applyConfig(config) {
    // Page Arrivée
    setTextContent('checkin-time', config.arrival?.time);
    setTextContent('wifi-name', config.arrival?.wifi?.name);
    setTextContent('wifi-password', config.arrival?.wifi?.password);
    setTextContent('contact-number', config.contact?.phone);
    setHref('contact-arrival', 'tel:' + config.contact?.phone);
    
    // Page Départ
    setTextContent('checkout-time', config.departure?.time);
    setTextContent('cleaning-info', config.departure?.cleaning);
    
    // Page Urgence
    setTextContent('owner-number', config.contact?.phone);
    setHref('owner-contact', 'tel:' + config.contact?.phone);
    
    // Procédure d'entrée
    if (config.arrival?.procedure) {
        const procedureContainer = document.getElementById('entry-procedure');
        if (procedureContainer && config.arrival.procedure.length > 0) {
            procedureContainer.innerHTML = '';
            config.arrival.procedure.forEach((step, index) => {
                const stepDiv = document.createElement('div');
                stepDiv.className = 'step';
                stepDiv.innerHTML = `
                    <div class="step-number">${index + 1}</div>
                    <p>${step}</p>
                `;
                procedureContainer.appendChild(stepDiv);
            });
        }
    }
    
    // Procédure de restitution des clés
    if (config.departure?.keyReturn) {
        const keyReturnContainer = document.getElementById('key-return');
        if (keyReturnContainer && config.departure.keyReturn.length > 0) {
            keyReturnContainer.innerHTML = '';
            config.departure.keyReturn.forEach((step, index) => {
                const stepDiv = document.createElement('div');
                stepDiv.className = 'step';
                stepDiv.innerHTML = `
                    <div class="step-number">${index + 1}</div>
                    <p>${step}</p>
                `;
                keyReturnContainer.appendChild(stepDiv);
            });
        }
    }
    
    console.log('✅ Configuration appliquée');
}

// === HELPERS ===
function setTextContent(id, value) {
    const element = document.getElementById(id);
    if (element && value) {
        element.textContent = value;
    }
}

function setHref(id, value) {
    const element = document.getElementById(id);
    if (element && value) {
        element.href = value;
    }
}

// === TRANSITIONS FLUIDES ===
function initSmoothTransitions() {
    // Ajouter une classe pour les animations au chargement
    document.body.classList.add('loaded');
    
    // Animation au clic sur les cartes
    const cards = document.querySelectorAll('.category-card, .place-card, .emergency-card');
    cards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Effet visuel au clic
            this.style.transform = 'scale(0.97)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
}

// === TRACKING OPTIONNEL (Google Analytics, etc.) ===
function trackPageView(pageName) {
    // Si vous utilisez Google Analytics ou un autre outil
    if (typeof gtag !== 'undefined') {
        gtag('event', 'page_view', {
            page_title: pageName,
            page_location: window.location.href
        });
    }
}

// === DÉTECTION DU MODE HORS LIGNE ===
window.addEventListener('online', function() {
    console.log('✅ Connexion internet rétablie');
});

window.addEventListener('offline', function() {
    console.log('⚠️ Mode hors ligne - Le contenu local est toujours accessible');
});

// === EASTER EGG - Clic multiple sur l'icône d'accueil ===
let clickCount = 0;
const homeIcon = document.querySelector('.welcome-header h1');
if (homeIcon) {
    homeIcon.addEventListener('click', function() {
        clickCount++;
        if (clickCount >= 5) {
            alert('🎉 Vous avez trouvé l\'Easter Egg ! Merci d\'utiliser QRGUIDE.');
            clickCount = 0;
        }
    });
}

// === TOGGLE MORE INFO ===
// Cette fonction est maintenant définie dans index.html
// function toggleMoreInfo() {
//     const content = document.getElementById('more-info-content');
//     const moreText = document.getElementById('more-info-text');
//     const lessText = document.getElementById('less-info-text');
//     
//     if (content.style.display === 'none') {
//         content.style.display = 'grid';
//         moreText.style.display = 'none';
//         lessText.style.display = 'inline';
//     } else {
//         content.style.display = 'none';
//         moreText.style.display = 'inline';
//         lessText.style.display = 'none';
//     }
// }

// === FONCTIONS D'EXPORT ===
window.QRGUIDE = {
    version: '1.1.3',
    initialized: true,
    config: null,
    reloadConfig: loadContentFromConfig
};

console.log('🏡 QRGUIDE v1.1.2 - Guide de séjour digital');
