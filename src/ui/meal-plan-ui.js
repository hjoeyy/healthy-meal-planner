import { safeSetLocalStorage, getJSON } from '../storage.js';
import { displayError, toastSuccessMessage, clearAllToastSuccessMessage, updateToastSuccessMessage, deleteToastSuccessMessage, 
    generateToastSuccessMessage, clearShoppingListToastSuccessMessage, toastErrorMessage, getErrorMessage } from '../ui/toast.js';
import { attachFavoriteListeners } from './favorites-ui.js';
import { state } from '../state.js';

export function initializeMealPlan() {
    state.mealPlan = getJSON('mealPlan', {
        monday: [null, null, null, null, null],
        tuesday: [null, null, null, null, null],
        wednesday: [null, null, null, null, null],
        thursday: [null, null, null, null, null],
        friday: [null, null, null, null, null],
        saturday: [null, null, null, null, null],
        sunday: [null, null, null, null, null]
    });
}



let mealPlan = getJSON('mealPlan', {
    monday: [null, null, null, null, null],
    tuesday: [null, null, null, null, null],
    wednesday: [null, null, null, null, null],
    thursday: [null, null, null, null, null],
    friday: [null, null, null, null, null],
    saturday: [null, null, null, null, null],
    sunday: [null, null, null, null, null]
});

const modalRecipeCards = document.querySelector('.modal-recipe-cards');

// let mealPlan = JSON.parse(localStorage.getItem('mealPlan')) || {
//     monday: [null, null, null, null, null],
//     tuesday: [null, null, null, null, null],
//     wednesday: [null, null, null, null, null],
//     thursday: [null, null, null, null, null],
//     friday: [null, null, null, null, null],
//     saturday: [null, null, null, null, null],
//     sunday: [null, null, null, null, null]
// };

let selectedRecipe = null;
let calendarTargetDay = null;
let calendarTargetMealNum = null;
let pendingRecipe = null;
let specificDay = null;
let specific_meal_number = null;

let favoritesList = getJSON('favoritesList', []);
// let favoritesList = JSON.parse(localStorage.getItem('favoritesList')) || [];

export function getMealPlan() {
    return mealPlan;
}


function updateCalendar() {
    console.log('Starting updateCalendar');
    for (let day in mealPlan) {
        //console.log(mealPlan[day])
        mealPlan[day].forEach((recipe, meal_num) => {
            const cell = document.querySelector(`.meal[data-day="${day}"][data-meal="${meal_num + 1}"]`);
            if (cell) {
                if (recipe) {
                    cell.setAttribute('data-day', day.charAt(0).toUpperCase() + day.slice(1));
                    cell.innerHTML = 
                    `<button class="favorite" data-id="${recipe.id}">
                    <svg class="heart-svg${favoritesList.some(fav => fav.id === recipe.id) ? ' favorited' : ''}" width="30px" height="30px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M12 6.00019C10.2006 3.90317 7.19377 3.2551 4.93923 5.17534C2.68468 7.09558 2.36727 10.3061 4.13778 12.5772C5.60984 14.4654 10.0648 18.4479 11.5249 19.7369C11.6882 19.8811 11.7699 19.9532 11.8652 19.9815C11.9483 20.0062 12.0393 20.0062 12.1225 19.9815C12.2178 19.9532 12.2994 19.8811 12.4628 19.7369C13.9229 18.4479 18.3778 14.4654 19.8499 12.5772C21.6204 10.3061 21.3417 7.07538 19.0484 5.17534C16.7551 3.2753 13.7994 3.90317 12 6.00019Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    </button>
                    <img src="${recipe.image}" width="100" /><br>${recipe.title}
                    <button class="update-meal-button">Update Meal</button>
                    <button class="delete-meal-button">Delete Meal</button>`;

                    const updateButton = cell.querySelector('.update-meal-button');
                    const deleteButton = cell.querySelector('.delete-meal-button');

                    if (updateButton) {
                        updateButton.addEventListener('click', function() {
                            calendarTargetDay = day;
                            calendarTargetMealNum = meal_num;
                            openCalendarModal(day, meal_num);
                            modal.classList.add('show-modal');
                        });
                    }

                    if (deleteButton) {
                        deleteButton.addEventListener('click', function () {
                            mealPlan[day][meal_num] = null;
                            safeSetLocalStorage('mealPlan', mealPlan);
                            updateCalendar();
                            deleteToastSuccessMessage();
                        });
                    }
                } else {
                    cell.innerHTML = `<button class="calendar-add-meal-btn">+ Add Meal</button>`;
                    const addBtn = cell.querySelector('.calendar-add-meal-btn');
                    addBtn.addEventListener('click', function() {
                        calendarTargetDay = day;
                        calendarTargetMealNum = meal_num;
                        openCalendarModal(day, meal_num);
                    });
                }
            }
        });
    }
    attachFavoriteListeners();
}

/**
 * Shows the modal with recipe options for the given day and meal number.
 * When a recipe is clicked, it is added to the meal plan and the modal is
 * closed. If the slot was previously empty, shows a success toast message.
 * If the slot was previously occupied, shows an update toast message.
 *
 * @param {string} day - The day of the week (e.g. "monday")
 * @param {number} meal_num - The meal number (1-5)
 */
function openCalendarModal(day, meal_num) {

    const modalContainer = document.querySelector('.modal-container');
    const modalBox = modalContainer?.querySelector('.modal');
    
    console.log('Opening modal:', {
        isMobile: window.matchMedia('(max-width: 480px)').matches,
        modalFound: {
            container: !!modalContainer,
            box: !!modalBox
        },
        modalState: {
            containerClasses: modalContainer?.classList.toString(),
            boxDisplay: modalBox?.style.display
        }
    });

    
    if (!modalContainer || !modalBox) {
        console.error('Modal elements not found!');
        return;
    }

    // Show both elements
    modalContainer.classList.add('show-modal');
    modalBox.style.display = 'block';

       console.log('Modal before:', {
        modal: modal,
        classList: modal?.classList,
        isShowing: modal?.classList.contains('show-modal')
    });

    if (modalRecipeCards) {
        // Set up event delegation ONCE
        if (!modalRecipeCards._listenerSet) {
            modalRecipeCards.addEventListener('click', function(e) {
                if (e.target.classList.contains('add-meal-button')) {
                    const recipeData = e.target.getAttribute('data-recipe');
                    if (!recipeData) return;
                    const recipeObj = JSON.parse(decodeURIComponent(recipeData));
                    const wasEmpty = !mealPlan[calendarTargetDay][calendarTargetMealNum];
                    mealPlan[calendarTargetDay][calendarTargetMealNum] = recipeObj;
                    safeSetLocalStorage('mealPlan', mealPlan);

                    // Hide both elements
                    modalContainer.classList.remove('show-modal');
                    modalBox.style.display = 'none';

                    console.log('After closing modal:', {
                        modal: modal,
                        classList: modal?.classList,
                        isShowing: modal?.classList.contains('show-modal')
                    });

                    updateCalendar();
                    if (wasEmpty) {
                        toastSuccessMessage();
                    } else {
                        updateToastSuccessMessage();
                    }
                }
            });
            modalRecipeCards._listenerSet = true; // Prevent duplicate listeners
        }
    }
}

function clearAllMeals() {
    for (let day in mealPlan) {
        mealPlan[day] = [null, null, null, null, null];
    }
    safeSetLocalStorage('mealPlan', mealPlan);
    updateCalendar();
    clearAllToastSuccessMessage();
}



export { updateCalendar, openCalendarModal, clearAllMeals };