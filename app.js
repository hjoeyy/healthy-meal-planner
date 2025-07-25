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
    const input = search.value;
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
        for (let i = 0; i < results.length; i++) {
            cardsHTML += `
            <div class="recipe-card">
                <button class="favorite"><img src="assets/heart-svgrepo-com.svg" alt="favorite-heart-icon" width="30px" height="30px" /></button>
                <img src=${results[i].image} width="200px" height="200px" />
                <div class="title-wrapper">
                    <h3>${results[i].title}</h3>
                    <button class="add-plan-button">Add to Plan</button>
                </div>
            </div>`;
        }
        recipeCards.innerHTML = cardsHTML;
    } catch (error) {
        displayError('Server error: something went wrong on our end, please try again');
    }
}

function displayError(message) {
    errorMessage.textContent = message;
    recipeCards.innerHTML = '';
}

if (search_btn) {
    search_btn.addEventListener('click', updateSearchResults);
}

if (search) {
    search.addEventListener('keypress', event => {
        if(event.key === 'Enter') {
            updateSearchResults();
        }
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
            selectedRecipe = JSON.parse(e.target.getAttribute('data-recipe'));
            modal.classList.add('show-modal'); // Show the modal
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
function toastErrorMessage() {
    var t = document.getElementById('error-toast-message');
    t.className = "show";
    setTimeout(function(){ t.className = t.className.replace("show", ""); }, 3000);
}

function updateMealPlan(e) {
    e.preventDefault();
    const day = (this.querySelector('[name=day]')).value;
    const meal_number = Number((this.querySelector('[name=meal-num]')).value) - 1;
    allRecipeCards.forEach(recipe_card => {
        const button = recipe_card.querySelector('.add-plan-button');
        if (!button) return; // skip if no button

        // get data-recipe
        const recipeData = button.getAttribute('data-recipe');
        if (!recipeData) return; // skip if no recipe data

        const recipeObj = JSON.parse(recipeData);
        
        if (recipeObj.id === selectedRecipe.id) { // check if the recipe matches the clicked one
            // add recipe to meal plan
            mealPlan[day][meal_number] = recipeObj;
            localStorage.setItem('mealPlan', JSON.stringify(mealPlan));
            modal.classList.remove('show-modal');
            toastSuccessMessage();
        }
    });
}

if(modalForm) {
    modalForm.addEventListener('submit', updateMealPlan);
}

// meal-plan section

const calendar = document.querySelector('.calendar');
const addMealButton = document.querySelectorAll('.add-meal-button');
const modalRecipeCards = document.querySelector('.modal-recipe-cards');
const allModalRecipeCards = document.querySelectorAll('.modal-recipe-card');
const clearAllButton = document.querySelector('.clear-all');


function updateCalendar() {
    
    for (let day in mealPlan) {
        //console.log(mealPlan[day])
        mealPlan[day].forEach((recipe, meal_num) => {
            const cell = document.querySelector(`.meal[data-day="${day}"][data-meal="${meal_num + 1}"]`);
            console.log(cell);
            if (cell) {
                if (recipe) {

                    cell.innerHTML = 
                    `<img src="${recipe.image}" width="100" /><br>${recipe.title}
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
                        modal.classList.add('show-modal');
                    });
                }
            }
        });
    }
}

function openCalendarModal(day, meal_num) {
    // Only add the event listener once!
    if (modalRecipeCards) {
        // Remove any previous listener to avoid duplicates
        modalRecipeCards.onclick = function(e) {
            if (e.target.classList.contains('add-meal-button')) {
                const recipeData = e.target.getAttribute('data-recipe');
                if (!recipeData) return;
                const recipeObj = JSON.parse(recipeData);

                
                // Use the globally set calendarTargetDay and calendarTargetMealNum
                const wasEmpty = !mealPlan[calendarTargetDay][calendarTargetMealNum];
                mealPlan[calendarTargetDay][calendarTargetMealNum] = recipeObj;
                localStorage.setItem('mealPlan', JSON.stringify(mealPlan));
                modal.classList.remove('show-modal');
                updateCalendar();

                if(wasEmpty) {
                    toastSuccessMessage();
                } else {
                     updateToastSuccessMessage();
                }
            }
        };
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



clearAllButton.addEventListener('click', clearAllMeals);


if (document.querySelector('.calendar')) {
    updateCalendar();
}
