import { attachFavoriteListeners, loadFavorites } from '../ui/favorites-ui.js';

if (window.location.pathname.endsWith('favorites.html')) {
    loadFavorites();
}

if (favoriteRecipeCards) {
    favoriteRecipeCards.addEventListener('click', function(e) {
        console.log("Clicked element:", e.target);
        const addPlanBtn = e.target.closest('.add-plan-button');
        console.log("Closest add-plan-button:", addPlanBtn);
        if (addPlanBtn) {
            selectedRecipe = JSON.parse(decodeURIComponent(addPlanBtn.getAttribute('data-recipe')));
            modal.classList.add('show-modal');
        }
    });
}

loadFavorites();