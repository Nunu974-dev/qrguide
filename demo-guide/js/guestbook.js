/* ===================================
   QRGUIDE - LIVRE D'OR
   Gestion des avis clients
   =================================== */

const REVIEWS_KEY = 'qrguide_reviews';
let reviews = [];

// === INITIALISATION ===
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('guestbook-form')) {
        loadReviews();
        displayReviews();
        
        // Gérer la soumission du formulaire
        document.getElementById('guestbook-form').addEventListener('submit', handleReviewSubmit);
    }
});

// === CHARGER LES AVIS ===
function loadReviews() {
    const stored = localStorage.getItem(REVIEWS_KEY);
    reviews = stored ? JSON.parse(stored) : [];
}

// === SAUVEGARDER LES AVIS ===
function saveReviews() {
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
}

// === SOUMETTRE UN AVIS ===
function handleReviewSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('guest-name').value.trim();
    const rating = document.querySelector('input[name="rating"]:checked').value;
    const comment = document.getElementById('guest-comment').value.trim();
    
    if (!name || !rating || !comment) {
        alert('⚠️ Veuillez remplir tous les champs');
        return;
    }
    
    // Créer le nouvel avis
    const newReview = {
        id: Date.now(),
        name: name,
        rating: parseInt(rating),
        comment: comment,
        date: new Date().toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
    };
    
    // Ajouter au début de la liste
    reviews.unshift(newReview);
    saveReviews();
    
    // Réinitialiser le formulaire
    document.getElementById('guestbook-form').reset();
    
    // Afficher les avis
    displayReviews();
    
    // Message de confirmation
    alert('✅ Merci pour votre avis ! Il est maintenant visible par tous les voyageurs.');
    
    // Scroll vers les avis
    document.getElementById('reviews-list').scrollIntoView({ behavior: 'smooth' });
}

// === AFFICHER LES AVIS ===
function displayReviews() {
    const reviewsList = document.getElementById('reviews-list');
    const emptyState = document.getElementById('empty-reviews');
    
    if (reviews.length === 0) {
        reviewsList.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    reviewsList.innerHTML = reviews.map(review => `
        <div class="review-card" data-id="${review.id}">
            <div class="review-header">
                <div class="review-author">
                    <span class="author-icon">👤</span>
                    <div>
                        <strong class="author-name">${escapeHtml(review.name)}</strong>
                        <span class="review-date">${review.date}</span>
                    </div>
                </div>
                <div class="review-rating">${getStars(review.rating)}</div>
            </div>
            <p class="review-comment">${escapeHtml(review.comment)}</p>
        </div>
    `).join('');
}

// === GÉNÉRER LES ÉTOILES ===
function getStars(rating) {
    return '⭐'.repeat(rating);
}

// === ÉCHAPPER HTML (sécurité) ===
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
