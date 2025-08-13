import { updateCalendar, clearAllMeals, getMealPlan } from '../ui/meal-plan-ui.js';
import { makeModalDraggable, setupModalListeners } from '../ui/modal.js';
import { fetchShoppingList } from '../api.js';

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modal');
    const confirmModal = document.getElementById('confirm-modal');
    const closeButtons = document.querySelectorAll('.close-button');

    // Initialize modals with all necessary event listeners
    if (modal && confirmModal) {
        makeModalDraggable(modal);
        makeModalDraggable(confirmModal);
        
        // Setup modal listeners for close on click outside and escape key
        setupModalListeners({ 
            modal, 
            confirmModal, 
            closeButtons 
        });
    }

    // Handle add meal button with event delegation
    document.addEventListener('click', (e) => {
        if (e.target.closest('.add-meal-button')) {
            e.preventDefault();
            const day = e.target.closest('[data-day]')?.dataset.day;
            const mealNum = e.target.closest('[data-meal]')?.dataset.meal;
            
            if (modal) {
                // Store which cell was clicked
                if (day && mealNum) {
                    modal.dataset.day = day;
                    modal.dataset.meal = mealNum;
                }
                modal.classList.add('show-modal');
            }
        }
    });

    // Rest of your existing code...
    const clearAllButton = document.querySelector('.clear-all');
    const calendar = document.querySelector('.calendar');
    // ... rest of your existing code
    const confirmYes = document.getElementById('confirm-yes');
    const confirmNo = document.getElementById('confirm-no');
    const generateShoppingListButton = document.querySelector('.generate-shopping-list');

    
    if (clearAllButton) clearAllButton.addEventListener('click', clearAllMeals);
    if (document.querySelector('.calendar')) {
        updateCalendar();
    }

    if (generateShoppingListButton) generateShoppingListButton.addEventListener('click', fetchShoppingList);

    if (confirmYes) {
        confirmYes.addEventListener('click', () => {
            mealPlan[specificDay][specific_meal_number] = pendingRecipe;
            safeSetLocalStorage('mealPlan', mealPlan);
            confirmModal.classList.remove('show-modal');
            toastSuccessMessage();
            updateCalendar?.(); // Only call if function exists (on meal plan page)
            // Reset temp vars
            specificDay = null;
            specific_meal_number = null;
            pendingRecipe = null;
        });
    }
    
    if (confirmNo) {
        confirmNo.addEventListener('click', () => {
            confirmModal.classList.remove('show-modal');
            specificDay = null;
            specific_meal_number = null;
            pendingRecipe = null;
        });
    }
});


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

export { updateMealPlan };

