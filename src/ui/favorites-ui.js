import { getJSON, safeSetLocalStorage } from '../storage.js'
import { toastSuccessMessage } from '../ui/toast.js';
import { state } from '../state.js';

const favoriteRecipeCards = document.querySelector('.favorite-recipe-cards');
let favoritesList = getJSON('favoritesList', []);

function attachFavoriteListeners() {
    const mealPlan = getJSON('mealPlan', []);
    console.log("Meal Plan: ", mealPlan);
    const favoriteButtons = document.querySelectorAll('.favorite');
    favoriteButtons.forEach(button => {
        // Remove any previous click listeners by replacing the node
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);

        const heartSvg = newButton.querySelector('.heart-svg');
        newButton.addEventListener('click', function () {
            const mealID = this.dataset.id;
            heartSvg.classList.toggle('favorited');
            let foundMeal = null;
            Object.keys(mealPlan).forEach(day => {
                mealPlan[day].forEach(meal => {
                    if (meal && meal.id === Number(mealID)) {
                        foundMeal = meal;
                        console.log('mealID:', mealID, 'foundMeal:', foundMeal);
                    }
                });
            });
            if (!foundMeal && this.dataset.recipe) {
                console.log('Found meal earlier: ', foundMeal);
                foundMeal = JSON.parse(this.dataset.recipe);

            }
            if (!foundMeal) return;
            console.log('Before push:', favoritesList);
            if (heartSvg.classList.contains('favorited')) {
                if (!favoritesList.some(fav => fav.id === foundMeal.id)) {
                    console.log('Already in favorites?', favoritesList.some(fav => fav.id === foundMeal.id));
                    console.log('Found meal: ', foundMeal);
                    favoritesList.push(foundMeal);
                    console.log('After push:', favoritesList);
                    safeSetLocalStorage('favoritesList', favoritesList);
                }
            } else {
                const index = favoritesList.findIndex(fav => {
                    console.log('Comparing:', fav.id, foundMeal.id);
                    return fav.id === foundMeal.id;
                });
                if (index !== -1) {
                    console.log('Before removal:', favoritesList);
                    favoritesList.splice(index, 1);
                    console.log('After removal:', favoritesList);
                    safeSetLocalStorage('favoritesList', favoritesList);
                    console.log('localStorage after set:', localStorage.getItem('favoritesList'));
                    if (window.location.pathname.endsWith('favorites.html')) {
                        loadFavorites();
                    }
                }
            }
            if (window.location.pathname.endsWith('favorites.html')) {
                loadFavorites();
            }
        });
    });
}




function loadFavorites() {
    favoritesList = getJSON('favoritesList', []);
    console.log('Rendering favorites:', favoritesList);
    let favoritesHTML = '';
    favoritesList.forEach(favorite => {
        const recipeData = encodeURIComponent(JSON.stringify(favorite));
        favoritesHTML += `
        <div class="favorite-recipe-card">
            <button class="favorite" data-id="${favorite.id}" data-recipe='${JSON.stringify(favorite)}'>
                <svg class="heart-svg${favoritesList.some(fav => fav.id === Number(favorite.id)) ? ' favorited' : ''}" width="30px" height="30px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M12 6.00019C10.2006 3.90317 7.19377 3.2551 4.93923 5.17534C2.68468 7.09558 2.36727 10.3061 4.13778 12.5772C5.60984 14.4654 10.0648 18.4479 11.5249 19.7369C11.6882 19.8811 11.7699 19.9532 11.8652 19.9815C11.9483 20.0062 12.0393 20.0062 12.1225 19.9815C12.2178 19.9532 12.2994 19.8811 12.4628 19.7369C13.9229 18.4479 18.3778 14.4654 19.8499 12.5772C21.6204 10.3061 21.3417 7.07538 19.0484 5.17534C16.7551 3.2753 13.7994 3.90317 12 6.00019Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
            <img src="${favorite.image}" width="200px" height="200px" />
                <div class="title-wrapper">
                    <h3>${favorite.title}</h3>
                    <button class="add-plan-button" data-recipe="${recipeData}">Add to Plan</button>
                </div>
        </div>`
    });
    favoriteRecipeCards.innerHTML = favoritesHTML;
    attachFavoriteListeners();
}

export { attachFavoriteListeners, loadFavorites };