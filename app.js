console.log("APP.JS LOADED - TEST LOG");
console.log("window.location.pathname:", window.location.pathname);

const API_KEY = 'e17a54633c7f4e61bdc9b04dc00fd105';

const search = document.getElementById('search');
const search_btn = document.getElementById('submit-btn');
const errorMessage = document.getElementById('errorMessage');
const recipeCards = document.querySelector('.recipe-cards');
const addPlanButton = document.querySelectorAll('.add-plan-button');
const closeButtons = document.querySelectorAll('.close-button');
const modal = document.getElementById('modal');
const confirmModal = document.getElementById('confirm-modal');
const modalBox = document.querySelector('.modal');
const confirmModalBox = document.querySelector('.confirm-modal');
const modalForm = document.querySelector('.modal-form');
const allRecipeCards = document.querySelectorAll('.recipe-card');
const modalRecipeCards = document.querySelector('.modal-recipe-cards');
const modalSearch = document.getElementById('modal-search');
const modalSearchBtn = document.getElementById('modal-search-btn');
const modalClearAllBtn = document.getElementById('modal-clear-all-btn');
const confirmYes = document.getElementById('confirm-yes');
const confirmNo = document.getElementById('confirm-no');
const generateShoppingListButton = document.querySelector('.generate-shopping-list');
const calendar = document.querySelector('.calendar');
const addMealButton = document.querySelectorAll('.add-meal-button');
const allModalRecipeCards = document.querySelectorAll('.modal-recipe-card');
const clearAllButton = document.querySelector('.clear-all');
const favoriteRecipeCards = document.querySelector('.favorite-recipe-cards');
makeModalDraggable(modalBox);
makeModalDraggable(confirmModalBox);
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
let pendingRecipe = null;
let specificDay = null;
let specific_meal_number = null;
let favoritesList = JSON.parse(localStorage.getItem('favoritesList')) || [];

function getErrorMessage(statusCode) {
    switch (statusCode) {
        case 401:
            return "Authentication error - please check API configuration";
        case 402:
            return "Daily API limit reached - try again tomorrow";
        case 403:
            return "Access forbidden - please check API permissions";
        case 404:
            return "No recipes found - try a different search term";
        case 429:
            return "Too many requests - please wait a moment and try again";
        case 500:
            return "Server error - please try again later";
        case 502:
        case 503:
        case 504:
            return "Service temporarily unavailable - please try again later";
        default:
            return "Something went wrong - please try again";
    }
}


async function getRecipeData(input) {
    const url = `https://api.spoonacular.com/recipes/complexSearch?query=${input}&apiKey=${API_KEY}`;
    console.log("Making API request to: ", url);

    try {
        const response = await fetch(url);
        console.log("Response status: ", response.status);
        console.log("Response: ", response);
        if (!response.ok) {
            const errorMessage = getErrorMessage(response.status);
            console.error("API Error: ", response.status, response.statusText);
            throw new Error(errorMessage); // ← Throw the error instead of just displaying it
        }
        const data = await response.json();
        console.log("✅ API Response:", data);
        return data;
    } catch (error) {
        console.error("💥 getRecipeData error:", error);
        throw error;
    } finally {
        console.log('Final Block');
    }
}

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
    } catch (error) {
        console.error('Search error: ', error);

        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            displayError('Network error - please check your internet connection');
        } else {
            displayError(error.message || 'Server error: something went wrong on our end, please try again');
        }
    }
}

function displayError(message) {
    if(errorMessage) errorMessage.textContent = message;
    if(recipeCards) recipeCards.innerHTML = '';
    var t = document.getElementById('errorMessage');
    t.className = "show";
    setTimeout(function(){ t.className = t.className.replace("show", ""); }, 3000);
}

function attachSearchListeners() {
    console.log("Attaching search listeners", search_btn, search, recipeCards);
    if (search_btn && search && recipeCards) {
        search_btn.addEventListener('click', updateSearchResults);
        search.addEventListener('keypress', event => {
            if(event.key === 'Enter') updateSearchResults();
        });
    }
}

window.addEventListener('DOMContentLoaded', () => {
    attachSearchListeners();
});


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
        const addPlanBtn = e.target.closest('.add-plan-button');
        if (addPlanBtn) {
            selectedRecipe = JSON.parse(decodeURIComponent(addPlanBtn.getAttribute('data-recipe')));
            modal.classList.add('show-modal');
        }
    });
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

// Listen for clicks on the close button to hide the modal
if(closeButtons) {
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            modal.classList.remove('show-modal'); // Hide the modal
            confirmModal.classList.remove('show-modal');
        });
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
        localStorage.setItem('mealPlan', JSON.stringify(mealPlan));
        modal.classList.remove('show-modal');
        toastSuccessMessage();
        updateCalendar?.();
    }
}

if (confirmYes) {
    confirmYes.addEventListener('click', () => {
        mealPlan[specificDay][specific_meal_number] = pendingRecipe;
        localStorage.setItem('mealPlan', JSON.stringify(mealPlan));
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
    attachFavoriteListeners();
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






function attachFavoriteListeners() {
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
                    localStorage.setItem('favoritesList', JSON.stringify(favoritesList));
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
                    localStorage.setItem('favoritesList', JSON.stringify(favoritesList));
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
    favoritesList = JSON.parse(localStorage.getItem('favoritesList')) || [];
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


if (window.location.pathname.endsWith('favorites.html')) {
    loadFavorites();
}

function hi() {
    console.log(favoritesList);
}
