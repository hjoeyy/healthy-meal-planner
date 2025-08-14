import { updateCalendar, clearAllMeals, getMealPlan } from '../ui/meal-plan-ui.js';
import { makeModalDraggable, setupModalListeners } from '../ui/modal.js';
import { fetchShoppingList } from '../api.js';
import { getJSON, safeSetLocalStorage } from '../storage.js';
import { toastSuccessMessage } from '../ui/toast.js';

let selectedRecipe = null;
let calendarTargetDay = null;
let calendarTargetMealNum = null;
let pendingRecipe = null;
let specificDay = null;
let specific_meal_number = null;

document.addEventListener('DOMContentLoaded', () => {      
    const mainModal = document.querySelector('.modal-container');
    const confirmModal = document.getElementById('confirm-modal');
    const modalForm = document.querySelector('.modal-form');
    const closeButtons = document.querySelectorAll('.close-button');
    const mealPlan = getMealPlan();

    // Setup modal listeners
    setupModalListeners({
        modal: mainModal,
        confirmModal: confirmModal,
        closeButtons: closeButtons,
        modalForm: modalForm,
        onFormSubmit: (e) => {
            e.preventDefault();
            const day = modalForm.querySelector('[name=day]').value.toLowerCase();
            const mealNum = Number(modalForm.querySelector('[name=meal-num]').value) - 1;

            if (mealPlan[day] && mealPlan[day][mealNum]) {
                // Show confirm modal if slot is occupied
                confirmModal.classList.add('show-modal');
                mainModal.classList.remove('show-modal');
                pendingRecipe = selectedRecipe;
                specificDay = day;
                specific_meal_number = mealNum;
            } else {
                // Add meal directly if slot is empty
                mealPlan[day][mealNum] = selectedRecipe;
                safeSetLocalStorage('mealPlan', mealPlan);
                mainModal.classList.remove('show-modal');
                toastSuccessMessage();
                updateCalendar();
            }
        }
    });
    
    

     // Remove duplicate modal query
    document.addEventListener('click', (e) => {
        if (e.target.closest('.add-meal-button')) {
            e.preventDefault();
            const day = e.target.closest('[data-day]')?.dataset.day;
            const mealNum = e.target.closest('[data-meal]')?.dataset.meal;
            
            if (mainModal) { // Use mainModal instead of modal
                if (day && mealNum) {
                    mainModal.dataset.day = day;
                    mainModal.dataset.meal = mealNum;
                }
                mainModal.classList.add('show-modal');
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
            
            // Close both modals using correct references
            mainModal?.classList.remove('show-modal');
            confirmModal?.classList.remove('show-modal');
            
            toastSuccessMessage();
            updateCalendar?.();
            
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





