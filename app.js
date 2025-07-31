console.log("APP.JS LOADED - TEST LOG");
console.log("window.location.pathname:", window.location.pathname);

const API_KEY = 'e17a54633c7f4e61bdc9b04dc00fd105';

const search = document.getElementById('search');
const search_btn = document.getElementById('submit-btn');
const errorMessage = document.getElementById('errorMessage');
const recipeCards = document.querySelector('.recipe-cards');
const addPlanButton = document.querySelectorAll('.add-plan-button');
const closeButton = document.querySelector('.close-button');
const modal = document.getElementById('modal');
const modalBox = document.querySelector('.modal');
const modalForm = document.querySelector('.modal-form');
const allRecipeCards = document.querySelectorAll('.recipe-card');
const modalRecipeCards = document.querySelector('.modal-recipe-cards');
const modalSearch = document.getElementById('modal-search');
const modalSearchBtn = document.getElementById('modal-search-btn');
const modalClearAllBtn = document.getElementById('modal-clear-all-btn');
const generateShoppingListButton = document.querySelector('.generate-shopping-list');
const calendar = document.querySelector('.calendar');
const addMealButton = document.querySelectorAll('.add-meal-button');
const allModalRecipeCards = document.querySelectorAll('.modal-recipe-card');
const clearAllButton = document.querySelector('.clear-all');
makeModalDraggable(modalBox);
// Meal Plan 

let mealPlan = JSON.parse(localStorage.getItem('mealPlan')) || {
    monday: [null, null, null, null, null],
    tuesday: [null, null, null, null, null],
    wednesday: [null, null, null, null, null],
    thursday: [null, null, null, null, null],
    friday: [null, null, null, null, null],
    saturday: [null, null, null, null, null],
    sunday: [null, null, null, null, null]
};
let selectedRecipe = null;
let calendarTargetDay = null;
let calendarTargetMealNum = null;


async function getRecipeData(input) {
    const url = `https://api.spoonacular.com/recipes/complexSearch?query=${input}&apiKey=${API_KEY}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            displayError('No results or issues fetching results');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        throw error;
    } finally {
        console.log('Final Block');
    }
}

async function updateSearchResults() {
    const input = search?.value;
    if (!input) {
        displayError('Results cannot be empty');
        return;
    }

    try {
        const { results, cod } = await getRecipeData(input);
        if (cod === '404') {
            displayError('Please enter valid search results');
            return;
        }
        let cardsHTML = '';
        let modalCardsHTML = '';
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
                    <button class="favorite"><img src="assets/heart-svgrepo-com.svg" alt="favorite-heart-icon" width="30px" height="30px" /></button>
                    <img src=${results[i].image} width="200px" height="200px" />
                    <div class="title-wrapper">
                        <h3>${results[i].title}</h3>
                        <button class="add-plan-button" data-recipe="${recipeData}">Add to Plan</button>
                    </div>
                </div>`;
            }
        }
        if (recipeCards) recipeCards.innerHTML = cardsHTML;
    } catch (error) {
        displayError('Server error: something went wrong on our end, please try again');
    }
}

function displayError(message) {
    if(errorMessage) errorMessage.textContent = message;
    if(recipeCards) recipeCards.innerHTML = '';
    var t = document.getElementById('errorMessage');
    t.className = "show";
    setTimeout(function(){ t.className = t.className.replace("show", ""); }, 3000);
}

if (search_btn && search && recipeCards) {
    search_btn.addEventListener('click', updateSearchResults);
    search.addEventListener('keypress', event => {
        if(event.key === 'Enter') updateSearchResults();
    });
}


// This function makes the modal draggable by clicking and dragging it
function makeModalDraggable(modal) {
    let offsetX = 0, offsetY = 0, startX = 0, startY = 0, isDragging = false;

    // When mouse is pressed down on the modal, start dragging
    if(modal) {
        modal.addEventListener('mousedown', function(e) {
            isDragging = true;
            startX = e.clientX; // Mouse X position when drag starts
            startY = e.clientY; // Mouse Y position when drag starts
            // Get modal's current position
            const rect = modal.getBoundingClientRect();
            offsetX = startX - rect.left;
            offsetY = startY - rect.top;
            document.body.style.userSelect = 'none'; // Prevents text selection while dragging
    });
    }

    // When mouse moves, if dragging, move the modal to follow the mouse
    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return; // Only move if dragging
        // Calculate new position for the modal
        let left = e.clientX - offsetX;
        let top = e.clientY - offsetY;
        // Move modal to new position
        modal.style.left = left + 'px';
        modal.style.top = top + 'px';
        modal.style.transform = 'none'; // Disable centering while dragging
        modal.style.position = 'fixed'; // Keep modal on top
    });

    // When mouse is released, stop dragging
    document.addEventListener('mouseup', function() {
        isDragging = false;
        document.body.style.userSelect = '';
    });
}

// Listen for clicks on any "Add to Plan" button inside recipe cards
if (recipeCards) {
    recipeCards.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-plan-button')) {
            selectedRecipe = JSON.parse(decodeURIComponent(e.target.getAttribute('data-recipe')));
            modal.classList.add('show-modal');
        }
    });
}

// Listen for clicks on the close button to hide the modal
if(closeButton) {
    closeButton.addEventListener('click', () => {
        modal.classList.remove('show-modal'); // Hide the modal
    });
}

// Listen for clicks on the window; if the click is on the modal background, hide the modal
window.addEventListener('click', e => {
    e.target === modal ? modal.classList.remove('show-modal') : false;
});

function toastSuccessMessage() {
    var t = document.getElementById('success-toast-message');
    t.className = "show";
    setTimeout(function(){ t.className = t.className.replace("show", ""); }, 3000);
}

function clearAllToastSuccessMessage() {
    var t = document.getElementById('clear-success-toast-message');
    t.className = "show";
    setTimeout(function(){ t.className = t.className.replace("show", ""); }, 3000);
}

function updateToastSuccessMessage() {
    var t = document.getElementById('update-success-toast-message');
    t.className = "show";
    setTimeout(function(){ t.className = t.className.replace("show", ""); }, 3000);
}

function deleteToastSuccessMessage() {
    var t = document.getElementById('delete-success-toast-message');
    t.className = "show";
    setTimeout(function(){ t.className = t.className.replace("show", ""); }, 3000);
}

function generateToastSuccessMessage() {
    var t = document.getElementById('generate-success-toast-message');
    t.className = "show";
    setTimeout(function(){ t.className = t.className.replace("show", ""); }, 3000);
}

function clearShoppingListToastSuccessMessage() {
    var t = document.getElementById('clear-list-success-toast-message');
    t.className = "show";
    setTimeout(function(){ t.className = t.className.replace("show", ""); }, 3000);
}

function toastErrorMessage() {
    var t = document.getElementById('error-toast-message');
    t.className = "show";
    setTimeout(function(){ t.className = t.className.replace("show", ""); }, 3000);
}

function updateMealPlan(e) {
    e.preventDefault();
    const day = (this.querySelector('[name=day]')).value;
    const meal_number = Number((this.querySelector('[name=meal-num]')).value) - 1;

    if (!selectedRecipe || !day || isNaN(meal_number)) {
        toastErrorMessage();
        return;
    }

    mealPlan[day][meal_number] = selectedRecipe;
    localStorage.setItem('mealPlan', JSON.stringify(mealPlan));
    modal.classList.remove('show-modal');
    toastSuccessMessage();
    updateCalendar?.(); // Only call if function exists (on meal plan page)
}

if(modalForm) {
    modalForm.addEventListener('submit', updateMealPlan);
}

// meal-plan section






function updateCalendar() {
    
    for (let day in mealPlan) {
        //console.log(mealPlan[day])
        mealPlan[day].forEach((recipe, meal_num) => {
            const cell = document.querySelector(`.meal[data-day="${day}"][data-meal="${meal_num + 1}"]`);
            if (cell) {
                if (recipe) {

                    cell.innerHTML = 
                    `<button class="favorite">
                    <svg class="heart-svg" width="30px" height="30px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                            localStorage.setItem('mealPlan', JSON.stringify(mealPlan));
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
}

function openCalendarModal(day, meal_num) {
    if (modalRecipeCards) {
        // Always show the modal
        modal.classList.add('show-modal');
        // Set up event delegation ONCE
        if (!modalRecipeCards._listenerSet) {
            modalRecipeCards.addEventListener('click', function(e) {
                if (e.target.classList.contains('add-meal-button')) {
                    const recipeData = e.target.getAttribute('data-recipe');
                    if (!recipeData) return;
                    const recipeObj = JSON.parse(decodeURIComponent(recipeData));
                    const wasEmpty = !mealPlan[calendarTargetDay][calendarTargetMealNum];
                    mealPlan[calendarTargetDay][calendarTargetMealNum] = recipeObj;
                    localStorage.setItem('mealPlan', JSON.stringify(mealPlan));
                    modal.classList.remove('show-modal');
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
    localStorage.setItem('mealPlan', JSON.stringify(mealPlan));
    updateCalendar();
    clearAllToastSuccessMessage();
}



if (clearAllButton) clearAllButton.addEventListener('click', clearAllMeals);


if (document.querySelector('.calendar')) {
    updateCalendar();
}

async function updateModalSearchResults() {
    const input = modalSearch?.value;
    if (!input) {
        // Optionally show an error in the modal
        return;
    }
    try {
        const { results, cod } = await getRecipeData(input);
        if (cod === '404') {
            // Optionally show an error in the modal
            return;
        }
        let modalCardsHTML = '';
        for (let i = 0; i < results.length; i++) {
            const recipeObj = {
                id: results[i].id,
                title: results[i].title,
                image: results[i].image
            };
            const recipeData = encodeURIComponent(JSON.stringify(recipeObj));
            modalCardsHTML += `
            <div class="modal-recipe-card">
                <img src="${results[i].image}" width="50px" height="50px" />
                <div class="modal-title-wrapper">
                    <h3>${results[i].title}</h3>
                    <button class="add-meal-button" data-recipe="${recipeData}">Add Meal</button>
                </div>
            </div>`;
        }
        if (modalRecipeCards) modalRecipeCards.innerHTML = modalCardsHTML;
    } catch (error) {
        // Optionally show an error in the modal
    }
}

if (modalSearchBtn && modalSearch && modalClearAllBtn) {
    modalSearchBtn.addEventListener('click', updateModalSearchResults);
    modalSearch.addEventListener('keypress', event => {
        if(event.key === 'Enter') updateModalSearchResults();
    });
    modalClearAllBtn.addEventListener('click', function() {
        if (modalRecipeCards) modalRecipeCards.innerHTML = '';
    });
}

// Shopping List
  
async function fetchShoppingList() { // fetch the shopping list for the meals
    const recipeIds = [];
    const ingredientsList = [];
    const duplicateRemover = new Set();
    const uniqueIngredients = [];
    for (let day in mealPlan) {
        for (let mealSlot of mealPlan[day]) { // collect all meal IDs
            if (mealSlot !== null) {
                recipeIds.push(mealSlot.id);
            }
        }
    }

    for (let id of recipeIds) {
        console.log("Recipe IDs before API: ", recipeIds);
        const url = `https://api.spoonacular.com/recipes/${id}/ingredientWidget.json?apiKey=${API_KEY}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                if (response.status === 402) {
                    displayError('Error fetching API data, API daily limit reached');
                } else if (response.status === 401) {
                    displayError('Error fetching API data on our end');
                } else {
                    displayError('No results or issues fetching results');
                }
                return;
            }
            const data = await response.json();
            const { ingredients, cod } = data;
            if (cod === '404') {
                displayError('Please enter valid search results');
                return;
            }
            for (let ingredient of ingredients) {
                ingredientsList.push(ingredient.name);
            }
            for (let uniqueIngredient of ingredientsList) {
                if (!duplicateRemover.has(uniqueIngredient)) {
                    duplicateRemover.add(uniqueIngredient);
                    uniqueIngredients.push(uniqueIngredient);
                }
            }
            localStorage.setItem('shoppingList', JSON.stringify(uniqueIngredients));
            generateToastSuccessMessage();
        } catch (error) {
            displayError('Server error: something went wrong on our end, please try again');
            return;
        } finally {
            console.log('Final Block');
        }
    }
}


if (window.location.pathname.endsWith('shopping-list.html')) {
    let id = 1;
    window.addEventListener('DOMContentLoaded', () => {
        const shoppingList = document.querySelector('.shopping-list-ul');
        const ingredients = JSON.parse(localStorage.getItem('shoppingList')) || [];
        let shoppingListHTML = '';
        console.log("Shopping list page loaded!");
        console.log("Ingredients from localStorage:", ingredients);
        console.log("shoppingList element:", shoppingList);
        for (let ingredient of ingredients) { // add each ingredient to the shopping list
            shoppingListHTML += `
            <div class="item"><input type="checkbox" id="${id++}" class="box" /><li>${ingredient}</li></div>
            `;
        }
        if (shoppingList) shoppingList.innerHTML = shoppingListHTML;
        let boxes = document.getElementsByClassName('box').length;

        function save() { // save checked boxes to localStorage
            for(let i = 1; i <= boxes; i++) {
                var checkbox = document.getElementById(String(i));
                localStorage.setItem("checkbox" + String(i), checkbox.checked);
            }
        }
        
        for (let i = 1; i <= boxes; i++) { // if user checked then set it as checked to save to localStorage
            if (localStorage.length > 0) {
                var checked = JSON.parse(localStorage.getItem("checkbox" + String(i)));
                document.getElementById(String(i)).checked = checked;
            }
        }
        window.addEventListener('change', save);
    });
}

const clearShoppingList = document.querySelector('.clear-list');
const exportOrPrintList = document.querySelector('.export-print');


if (generateShoppingListButton) generateShoppingListButton.addEventListener('click', fetchShoppingList);

function clearAllShoppingItems() {
    let ingredients = JSON.parse(localStorage.getItem('shoppingList')) || [];
    localStorage.setItem('shoppingList', ingredients = []);
    const shoppingList = document.querySelector('.shopping-list-ul');
    if (shoppingList) shoppingList.innerHTML = '';
    clearShoppingListToastSuccessMessage();
}

if (clearShoppingList) clearShoppingList.addEventListener('click', clearAllShoppingItems);
if (exportOrPrintList) exportOrPrintList.addEventListener('click', () => window.print());


const favoriteButtons = document.querySelectorAll('.favorite');

favoriteButtons.forEach(button => {
    const heartSvg = button.querySelector('.heart-svg');
    button.addEventListener('click', function () {
        heartSvg.classList.toggle('favorited');
    });
});
