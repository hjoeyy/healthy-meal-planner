import { getJSON, getString, safeSetLocalStorage } from '../storage.js';
import { displayError, toastSuccessMessage, toastErrorMessage } from '../ui/toast.js';
import { getRecipeData } from '../api.js';
import { attachFavoriteListeners } from '../ui/favorites-ui.js';
import { makeModalDraggable, setupModalListeners } from '../ui/modal.js';
import { getMealPlan } from '../ui/meal-plan-ui.js';
import { state } from '../state.js';

// Initialize state
let mealPlan = getMealPlan();
let pendingRecipe = null;
let specificDay = null;
let specific_meal_number = null;


// DOM Elements
const modalForm = document.querySelector('.modal-form');
const confirmYes = document.getElementById('confirm-yes');
const confirmNo = document.getElementById('confirm-no');


// Remove duplicate updateMealPlan function
// Move form handling to a separate function
function handleModalForm(e) {
    e.preventDefault();
    const day = (this.querySelector('[name=day]')).value.toLowerCase();
    const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    if (!validDays.includes(day)) {
        displayError('Not a valid day!');
        return;
    }

    const meal_number = Number((this.querySelector('[name=meal-num]')).value) - 1;

    if(meal_number < 0 || meal_number >= 5) {
        displayError('Please enter a number between 1 and 5');
        return;
    }

    if (!selectedRecipe || !day || isNaN(meal_number)) {
        toastErrorMessage();
        return;
    }

    if (mealPlan[day][meal_number]) {
        confirmModal.classList.add('show-modal');
        modal.classList.remove('show-modal');
        pendingRecipe = selectedRecipe;
        specificDay = day;
        specific_meal_number = meal_number;
    } else {
        mealPlan[day][meal_number] = selectedRecipe;
        safeSetLocalStorage('mealPlan', mealPlan);
        modal.classList.remove('show-modal');
        toastSuccessMessage();
    }
}

// Update event listener
if (modalForm) {
    modalForm.addEventListener('submit', handleModalForm);
}


console.log('hello world');
console.log('storage test:', getString('nonexistent', 'fallback'));

const modal = document.getElementById('modal');
const confirmModal = document.getElementById('confirm-modal');
const closeButtons = document.querySelectorAll('.close-button');

makeModalDraggable(modal);
makeModalDraggable(confirmModal);
setupModalListeners({ modal, confirmModal, closeButtons });

const search = document.getElementById('search');
const search_btn = document.getElementById('submit-btn');
const searchClearAllBtn = document.querySelector('.search-clear-all');
const recipeCards = document.querySelector('.recipe-cards');


let favoritesList = getJSON('favoritesList', []);
let selectedRecipe = null;

async function updateSearchResults(e) {
    if (e) e.preventDefault(); // prevent form default from happening
    console.log("updateSearchResults called!");
    console.log("Search input value:", search?.value);
    const input = search?.value;
    console.log("Input: ", input);
    if (!input) {
        displayError('Results cannot be empty');
        return;
    }

    try {
        const { results, cod } = await getRecipeData(input);
        if(!results || results.length === 0) {
            displayError('No recipes found. Try a different search term');
            return;
        }
        if (cod === '404') {
            displayError('Please enter valid search results');
            return;
        }
        let cardsHTML = '';
        for (let i = 0; i < results.length; i++) {
            if (recipeCards) {
                const recipeObj = {
                    id: results[i].id,
                    title: results[i].title,
                    image: results[i].image
                };
                const recipeData = encodeURIComponent(JSON.stringify(recipeObj));
                cardsHTML += `
                <div class="recipe-card">
                    <button class="favorite" data-id="${results[i].id}" data-recipe='${JSON.stringify(recipeObj)}'>
                        <svg class="heart-svg${favoritesList.some(fav => fav.id === results[i].id) ? ' favorited' : ''}" width="30px" height="30px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M12 6.00019C10.2006 3.90317 7.19377 3.2551 4.93923 5.17534C2.68468 7.09558 2.36727 10.3061 4.13778 12.5772C5.60984 14.4654 10.0648 18.4479 11.5249 19.7369C11.6882 19.8811 11.7699 19.9532 11.8652 19.9815C11.9483 20.0062 12.0393 20.0062 12.1225 19.9815C12.2178 19.9532 12.2994 19.8811 12.4628 19.7369C13.9229 18.4479 18.3778 14.4654 19.8499 12.5772C21.6204 10.3061 21.3417 7.07538 19.0484 5.17534C16.7551 3.2753 13.7994 3.90317 12 6.00019Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <img src=${results[i].image} width="200px" height="200px" />
                    <div class="title-wrapper">
                        <h3>${results[i].title}</h3>
                        <button class="add-plan-button" data-recipe="${recipeData}">Add to Plan</button>
                    </div>
                </div>`;
            }
        }
        if (recipeCards) recipeCards.innerHTML = cardsHTML;
        attachFavoriteListeners();
        search.value = '';
    } catch (error) {
        console.error('Search error: ', error);

        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            displayError('Network error - please check your internet connection');
        } else {
            displayError(error.message || 'Server error: something went wrong on our end, please try again');
        }
    }
}

// Listen for clicks on any "Add to Plan" button inside recipe cards
if (recipeCards) {
    recipeCards.addEventListener('click', function(e) {
        const addPlanBtn = e.target.closest('.add-plan-button');
        if (addPlanBtn) {
            selectedRecipe = JSON.parse(decodeURIComponent(addPlanBtn.getAttribute('data-recipe')));
            modal.classList.add('show-modal');
        }
    });
}

function updateMealPlan(e) {
    e.preventDefault();
    const day = (this.querySelector('[name=day]')).value.toLowerCase();
    const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    if (!validDays.includes(day)) { // make sure user is entering a valid day
        displayError('Not a valid day!');
        return;
    }
    const meal_number = Number((this.querySelector('[name=meal-num]')).value) - 1;
    console.log(meal_number);
    if(meal_number < 0 || meal_number >= 5) { // make sure user is not going out of range
        displayError('Please enter a number between 1 and 5');
        return;
    }

    if (!selectedRecipe || !day || isNaN(meal_number)) {
        toastErrorMessage();
        return;
    }

    if (mealPlan[day][meal_number]) {
        // ask user if they want to overwrite the existing meal
        confirmModal.classList.add('show-modal');
        modal.classList.remove('show-modal');
        pendingRecipe = selectedRecipe; 
        specificDay = day;
        specific_meal_number = meal_number;
        return;
        // if yes, overwrite
    } else {
        mealPlan[day][meal_number] = selectedRecipe;
        safeSetLocalStorage('mealPlan', mealPlan);
        modal.classList.remove('show-modal');
        toastSuccessMessage();
        updateCalendar?.();
    }
}

function attachSearchListeners() {
    if (search_btn && search && recipeCards && searchClearAllBtn) {
        search_btn.addEventListener('click', updateSearchResults);
        search.addEventListener('keydown', event => {
            if (event.key === 'Enter') updateSearchResults();
        });
        searchClearAllBtn.addEventListener('click', function() {
            if (recipeCards) recipeCards.innerHTML = '';
        });
        search.addEventListener('keydown', event => {
            if (event.key === 'Delete' && recipeCards) recipeCards.innerHTML = '';
        });
    }
}

window.addEventListener('DOMContentLoaded', () => {

    // Setup modal listeners
    setupModalListeners({
        modal,
        confirmModal,
        closeButtons,
        modalForm,
        onFormSubmit: handleModalForm
    });

    // Add confirm modal button handlers
    if (confirmYes) {
        confirmYes.addEventListener('click', () => {
            // Update meal plan with pending recipe
            mealPlan[specificDay][specific_meal_number] = pendingRecipe;
            safeSetLocalStorage('mealPlan', mealPlan);
            
            // Close confirm modal
            confirmModal.classList.remove('show-modal');
            
            // Show success message
            toastSuccessMessage();
            
            // Reset state
            pendingRecipe = null;
            specificDay = null;
            specific_meal_number = null;
        });
    }

    if (confirmNo) {
        confirmNo.addEventListener('click', () => {
            // Just close the confirm modal
            confirmModal.classList.remove('show-modal');
            
            // Reset state
            pendingRecipe = null;
            specificDay = null;
            specific_meal_number = null;
        });
    }

    attachSearchListeners();

});

