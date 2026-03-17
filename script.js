// ========================================
// FLAVOR FINDER - COMPLETE JAVASCRIPT
// All Features Working Including Favorites
// ========================================

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    'use strict';
    
    // ===== STATE MANAGEMENT =====
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    let currentView = 'grid';
    let currentPage = 1;
    const recipesPerPage = 4;
    
    // ===== DOM ELEMENTS =====
    const elements = {
        // Navigation
        navLinks: document.querySelectorAll('.nav-link'),
        navFavorites: document.getElementById('navFavorites'),
        favoritesCount: document.getElementById('favoritesCount'),
        mobileMenu: document.querySelector('.mobile-menu'),
        navMenu: document.querySelector('.nav-menu'),
        
        // Search
        heroSearchInput: document.getElementById('heroSearchInput'),
        heroSearchBtn: document.getElementById('heroSearchBtn'),
        searchInput: document.getElementById('searchInput'),
        searchBtn: document.getElementById('searchBtn'),
        
        // Filters
        categoryFilters: document.getElementById('categoryFilters'),
        trendingTags: document.querySelectorAll('.tag'),
        
        // Recipes
        recipesGrid: document.getElementById('recipesGrid'),
        favoritesGrid: document.getElementById('favoritesGrid'),
        viewBtns: document.querySelectorAll('.view-btn'),
        loadMoreBtn: document.getElementById('loadMoreBtn'),
        
        // Modal
        modal: document.getElementById('quickViewModal'),
        modalBody: document.getElementById('modalBody'),
        closeModal: document.querySelector('.close-modal'),
        
        // Toast
        toast: document.getElementById('toast'),
        toastMessage: document.getElementById('toastMessage'),
        
        // Newsletter
        newsletterBtn: document.getElementById('newsletterBtn'),
        newsletterEmail: document.getElementById('newsletterEmail')
    };
    
    // ===== INITIALIZATION =====
    function init() {
        updateFavoritesCount();
        loadFavorites();
        setupCategoryFilters();
        setupEventListeners();
        checkActiveSection();
    }
    
    // ===== FAVORITES FUNCTIONALITY =====
    
    // Toggle favorite
    function toggleFavorite(btn, recipeCard) {
        const recipeId = recipeCard.dataset.id;
        const isFavorite = favorites.includes(recipeId);
        
        if (isFavorite) {
            // Remove from favorites
            favorites = favorites.filter(id => id !== recipeId);
            btn.innerHTML = '<i class="far fa-heart"></i>';
            btn.classList.remove('active');
            showToast('Removed from favorites', 'info');
        } else {
            // Add to favorites
            favorites.push(recipeId);
            btn.innerHTML = '<i class="fas fa-heart"></i>';
            btn.classList.add('active');
            showToast('Added to favorites!', 'success');
            
            // Add to favorites grid
            addToFavoritesGrid(recipeCard);
        }
        
        // Update localStorage and count
        localStorage.setItem('favorites', JSON.stringify(favorites));
        updateFavoritesCount();
        
        // Refresh favorites grid
        loadFavorites();
    }
    
    // Add recipe to favorites grid
    function addToFavoritesGrid(recipeCard) {
        const cloneCard = recipeCard.cloneNode(true);
        const favBtn = cloneCard.querySelector('.favorite-btn');
        
        // Update favorite button
        favBtn.innerHTML = '<i class="fas fa-heart"></i>';
        favBtn.classList.add('active');
        
        // Add event listener to cloned button
        favBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const card = this.closest('.recipe-card');
            const originalCard = document.querySelector(`.recipe-card[data-id="${card.dataset.id}"]`);
            
            if (originalCard) {
                const originalBtn = originalCard.querySelector('.favorite-btn');
                originalBtn.innerHTML = '<i class="far fa-heart"></i>';
                originalBtn.classList.remove('active');
            }
            
            card.remove();
            favorites = favorites.filter(id => id !== card.dataset.id);
            localStorage.setItem('favorites', JSON.stringify(favorites));
            updateFavoritesCount();
            
            // Show empty state if no favorites
            if (elements.favoritesGrid.children.length === 0) {
                showEmptyFavorites();
            }
            
            showToast('Removed from favorites', 'info');
        });
        
        // Add quick view to cloned card
        const quickViewBtn = cloneCard.querySelector('.quick-view-btn');
        quickViewBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            openQuickView(this.dataset.id);
        });
        
        elements.favoritesGrid.appendChild(cloneCard);
    }
    
    // Load favorites from localStorage
    function loadFavorites() {
        elements.favoritesGrid.innerHTML = '';
        
        if (favorites.length === 0) {
            showEmptyFavorites();
            return;
        }
        
        favorites.forEach(recipeId => {
            const originalCard = document.querySelector(`.recipe-card[data-id="${recipeId}"]`);
            if (originalCard) {
                addToFavoritesGrid(originalCard);
            }
        });
    }
    
    // Show empty favorites state
    function showEmptyFavorites() {
        elements.favoritesGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-heart" style="font-size: 4rem; color: var(--gray-light); margin-bottom: var(--spacing-md);"></i>
                <h3>No favorites yet</h3>
                <p style="color: var(--gray); margin-bottom: var(--spacing-lg);">Start saving recipes you love by clicking the heart icon</p>
                <a href="#recipes" class="btn-primary" style="text-decoration: none;">Browse Recipes</a>
            </div>
        `;
    }
    
    // Update favorites count in navbar
    function updateFavoritesCount() {
        elements.favoritesCount.textContent = favorites.length;
    }
    
    // ===== SEARCH FUNCTIONALITY =====
    
    // Perform search
    function performSearch(searchTerm) {
        if (!searchTerm) {
            showAllRecipes();
            return;
        }
        
        searchTerm = searchTerm.toLowerCase().trim();
        const recipeCards = document.querySelectorAll('.recipe-card');
        let resultsCount = 0;
        
        recipeCards.forEach(card => {
            const title = card.dataset.title || '';
            const category = card.dataset.category || '';
            const description = card.querySelector('.card-description')?.textContent.toLowerCase() || '';
            
            if (title.includes(searchTerm) || category.includes(searchTerm) || description.includes(searchTerm)) {
                card.style.display = 'block';
                resultsCount++;
            } else {
                card.style.display = 'none';
            }
        });
        
        if (resultsCount === 0) {
            showToast(`No recipes found for "${searchTerm}"`, 'info');
        } else {
            showToast(`Found ${resultsCount} recipes`, 'success');
        }
    }
    
    // Show all recipes
    function showAllRecipes() {
        document.querySelectorAll('.recipe-card').forEach(card => {
            card.style.display = 'block';
        });
    }
    
    // ===== CATEGORY FILTERS =====
    
    // Setup category filters
    function setupCategoryFilters() {
        const categories = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Dessert'];
        
        categories.forEach(category => {
            const label = document.createElement('label');
            label.className = 'category-label';
            label.innerHTML = `
                <input type="checkbox" value="${category.toLowerCase()}" class="category-checkbox"> 
                ${category}
            `;
            elements.categoryFilters.appendChild(label);
        });
        
        // Add clear button
        const clearBtn = document.createElement('button');
        clearBtn.className = 'btn-outline';
        clearBtn.textContent = 'Clear All';
        clearBtn.style.marginLeft = 'var(--spacing-sm)';
        clearBtn.addEventListener('click', clearFilters);
        elements.categoryFilters.appendChild(clearBtn);
        
        // Add event listeners to checkboxes
        document.querySelectorAll('.category-checkbox').forEach(cb => {
            cb.addEventListener('change', filterByCategory);
        });
    }
    
    // Filter by category
    function filterByCategory() {
        const selectedCategories = [];
        document.querySelectorAll('.category-checkbox:checked').forEach(cb => {
            selectedCategories.push(cb.value);
        });
        
        const recipeCards = document.querySelectorAll('.recipe-card');
        
        if (selectedCategories.length === 0) {
            showAllRecipes();
            return;
        }
        
        let resultsCount = 0;
        recipeCards.forEach(card => {
            const cardCategory = card.dataset.category;
            if (selectedCategories.includes(cardCategory)) {
                card.style.display = 'block';
                resultsCount++;
            } else {
                card.style.display = 'none';
            }
        });
        
        showToast(`Showing ${resultsCount} recipes`, 'info');
    }
    
    // Clear all filters
    function clearFilters() {
        document.querySelectorAll('.category-checkbox').forEach(cb => {
            cb.checked = false;
        });
        showAllRecipes();
        showToast('Filters cleared', 'info');
    }
    
    // ===== QUICK VIEW MODAL =====
    
    // Open quick view modal
    function openQuickView(recipeId) {
        const recipeCard = document.querySelector(`.recipe-card[data-id="${recipeId}"]`);
        if (!recipeCard) return;
        
        const recipeData = {
            id: recipeId,
            title: recipeCard.querySelector('.card-title').textContent,
            image: recipeCard.querySelector('img').src,
            category: recipeCard.querySelector('.card-category').textContent,
            time: recipeCard.querySelector('.card-time').textContent,
            description: recipeCard.querySelector('.card-description').textContent,
            rating: recipeCard.querySelector('.card-rating span').textContent,
            isFavorite: favorites.includes(recipeId)
        };
        
        elements.modalBody.innerHTML = `
            <div class="quick-view-content">
                <div class="quick-view-image">
                    <img src="${recipeData.image}" alt="${recipeData.title}">
                </div>
                <div class="quick-view-details">
                    <div class="quick-view-header">
                        <span class="card-category">${recipeData.category}</span>
                        <span class="card-time">${recipeData.time}</span>
                    </div>
                    <h2>${recipeData.title}</h2>
                    <div class="quick-view-rating">
                        ${getRatingStars(recipeData.rating)}
                        <span>${recipeData.rating}</span>
                    </div>
                    <p class="quick-view-description">${recipeData.description}</p>
                    
                    <div class="quick-view-ingredients">
                        <h3>Ingredients</h3>
                        <ul>
                            <li><i class="fas fa-check-circle" style="color: var(--primary);"></i> 2 cups main ingredient</li>
                            <li><i class="fas fa-check-circle" style="color: var(--primary);"></i> 1 tbsp seasoning</li>
                            <li><i class="fas fa-check-circle" style="color: var(--primary);"></i> 3 cloves garlic</li>
                            <li><i class="fas fa-check-circle" style="color: var(--primary);"></i> Salt and pepper to taste</li>
                            <li><i class="fas fa-check-circle" style="color: var(--primary);"></i> 2 tbsp olive oil</li>
                        </ul>
                    </div>
                    
                    <div class="quick-view-instructions">
                        <h3>Instructions</h3>
                        <ol>
                            <li>Prepare all ingredients</li>
                            <li>Cook according to recipe</li>
                            <li>Serve and enjoy!</li>
                        </ol>
                    </div>
                    
                    <div class="quick-view-footer">
                        <button class="btn-primary" onclick="window.print()">
                            <i class="fas fa-print"></i> Print Recipe
                        </button>
                        <button class="btn-outline" id="modalFavoriteBtn">
                            <i class="${recipeData.isFavorite ? 'fas' : 'far'} fa-heart"></i> 
                            ${recipeData.isFavorite ? 'Saved' : 'Save to Favorites'}
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listener to modal favorite button
        const modalFavoriteBtn = document.getElementById('modalFavoriteBtn');
        if (modalFavoriteBtn) {
            modalFavoriteBtn.addEventListener('click', function() {
                const originalCard = document.querySelector(`.recipe-card[data-id="${recipeId}"]`);
                const originalBtn = originalCard.querySelector('.favorite-btn');
                
                toggleFavorite(originalBtn, originalCard);
                
                // Update modal button
                if (favorites.includes(recipeId)) {
                    this.innerHTML = '<i class="fas fa-heart"></i> Saved';
                } else {
                    this.innerHTML = '<i class="far fa-heart"></i> Save to Favorites';
                }
            });
        }
        
        elements.modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    
    // Close modal
    function closeModal() {
        elements.modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    // Get rating stars HTML
    function getRatingStars(rating) {
        const numRating = parseFloat(rating.replace(/[()]/g, ''));
        const fullStars = Math.floor(numRating);
        const hasHalf = numRating % 1 !== 0;
        let stars = '';
        
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star" style="color: #ffd700;"></i>';
        }
        if (hasHalf) {
            stars += '<i class="fas fa-star-half-alt" style="color: #ffd700;"></i>';
        }
        const remaining = 5 - Math.ceil(numRating);
        for (let i = 0; i < remaining; i++) {
            stars += '<i class="far fa-star" style="color: #ffd700;"></i>';
        }
        
        return stars;
    }
    
    // ===== TOAST NOTIFICATION =====
    
    // Show toast message
    function showToast(message, type = 'success') {
        elements.toastMessage.textContent = message;
        elements.toast.className = `toast toast-${type}`;
        elements.toast.classList.add('show');
        
        setTimeout(() => {
            elements.toast.classList.remove('show');
        }, 3000);
    }
    
    // ===== VIEW TOGGLE =====
    
    // Toggle grid/list view
    function toggleView(view) {
        currentView = view;
        elements.recipesGrid.className = `recipes-grid ${view}-view`;
        
        elements.viewBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
    }
    
    // ===== LOAD MORE RECIPES =====
    
    // Load more recipes
    function loadMoreRecipes() {
        const recipeCards = document.querySelectorAll('.recipe-card');
        const start = currentPage * recipesPerPage;
        const end = start + recipesPerPage;
        
        recipeCards.forEach((card, index) => {
            if (index >= start && index < end) {
                card.style.display = 'block';
                card.style.animation = 'fadeInUp 0.5s ease';
            }
        });
        
        currentPage++;
        
        if (currentPage * recipesPerPage >= recipeCards.length) {
            elements.loadMoreBtn.style.display = 'none';
            showToast('All recipes loaded!', 'info');
        }
    }
    
    // ===== NAVIGATION =====
    
    // Set active nav link
    function setActiveNav(activeLink) {
        elements.navLinks.forEach(link => {
            link.classList.remove('active');
        });
        activeLink.classList.add('active');
    }
    
    // Check active section on scroll
    function checkActiveSection() {
        const sections = {
            home: document.getElementById('home'),
            recipes: document.getElementById('recipes'),
            favorites: document.getElementById('favorites'),
            contact: document.getElementById('contact')
        };
        
        window.addEventListener('scroll', () => {
            const scrollPosition = window.scrollY + 100;
            
            Object.entries(sections).forEach(([key, section]) => {
                if (section) {
                    const sectionTop = section.offsetTop;
                    const sectionBottom = sectionTop + section.offsetHeight;
                    
                    if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                        elements.navLinks.forEach(link => {
                            link.classList.remove('active');
                            if (link.getAttribute('href') === `#${key}`) {
                                link.classList.add('active');
                            }
                        });
                    }
                }
            });
        });
    }
    
    // ===== NEWSLETTER =====
    
    // Handle newsletter subscription
    function handleNewsletter() {
        const email = elements.newsletterEmail.value.trim();
        
        if (!email) {
            showToast('Please enter your email', 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            showToast('Please enter a valid email address', 'error');
            return;
        }
        
        // Save to localStorage
        const subscribers = JSON.parse(localStorage.getItem('subscribers') || '[]');
        if (!subscribers.includes(email)) {
            subscribers.push(email);
            localStorage.setItem('subscribers', JSON.stringify(subscribers));
        }
        
        showToast('Thanks for subscribing! 🎉', 'success');
        elements.newsletterEmail.value = '';
    }
    
    // Validate email
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    // ===== EVENT LISTENERS =====
    
    function setupEventListeners() {
        // Favorite buttons
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            const recipeId = btn.dataset.id;
            if (favorites.includes(recipeId)) {
                btn.innerHTML = '<i class="fas fa-heart"></i>';
                btn.classList.add('active');
            }
            
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                const recipeCard = this.closest('.recipe-card');
                toggleFavorite(this, recipeCard);
            });
        });
        
        // Quick view buttons
        document.querySelectorAll('.quick-view-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                openQuickView(this.dataset.id);
            });
        });
        
        // Search buttons
        elements.searchBtn.addEventListener('click', () => {
            performSearch(elements.searchInput.value);
        });
        
        elements.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch(elements.searchInput.value);
            }
        });
        
        elements.heroSearchBtn.addEventListener('click', () => {
            performSearch(elements.heroSearchInput.value);
            document.getElementById('recipes').scrollIntoView({ behavior: 'smooth' });
        });
        
        elements.heroSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch(elements.heroSearchInput.value);
                document.getElementById('recipes').scrollIntoView({ behavior: 'smooth' });
            }
        });
        
        // Trending tags
        elements.trendingTags.forEach(tag => {
            tag.addEventListener('click', function() {
                const searchTerm = this.dataset.tag;
                elements.searchInput.value = searchTerm;
                elements.heroSearchInput.value = searchTerm;
                performSearch(searchTerm);
                document.getElementById('recipes').scrollIntoView({ behavior: 'smooth' });
            });
        });
        
        // View toggle
        elements.viewBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                toggleView(btn.dataset.view);
            });
        });
        
        // Load more
        elements.loadMoreBtn.addEventListener('click', loadMoreRecipes);
        
        // Nav links
        elements.navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                setActiveNav(this);
                
                const targetId = this.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
        
        // Nav favorites
        elements.navFavorites.addEventListener('click', () => {
            document.getElementById('favorites').scrollIntoView({ behavior: 'smooth' });
        });
        
        // Mobile menu
        elements.mobileMenu.addEventListener('click', () => {
            elements.navMenu.classList.toggle('show');
        });
        
        // Modal close
        elements.closeModal.addEventListener('click', closeModal);
        window.addEventListener('click', (e) => {
            if (e.target === elements.modal) {
                closeModal();
            }
        });
        
        // Newsletter
        elements.newsletterBtn.addEventListener('click', handleNewsletter);
        elements.newsletterEmail.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleNewsletter();
            }
        });
        
        // Close mobile menu on link click
        elements.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                elements.navMenu.classList.remove('show');
            });
        });
    }
    
    // ===== INITIALIZE =====
    init();
});


// Note: Add the additionalStyles to your CSS file
console.log('JavaScript loaded successfully!');