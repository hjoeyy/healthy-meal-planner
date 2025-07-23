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
makeModalDraggable(modalBox);


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

search_btn.addEventListener('click', updateSearchResults);
search.addEventListener('keypress', event => {
    if(event.key === 'Enter') {
        updateSearchResults();
    }
});

// Meal Plan 

let mealPlan = {
    monday: [null, null, null, null, null],
    tuesday: [null, null, null, null, null],
    wednesday: [null, null, null, null, null],
    thursday: [null, null, null, null, null],
    friday: [null, null, null, null, null],
    saturday: [null, null, null, null, null],
    sunday: [null, null, null, null, null]
}

// This function makes the modal draggable by clicking and dragging it
function makeModalDraggable(modal) {
    let offsetX = 0, offsetY = 0, startX = 0, startY = 0, isDragging = false;

    // When mouse is pressed down on the modal, start dragging
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
recipeCards.addEventListener('click', function(e) {
    if (e.target.classList.contains('add-plan-button')) {
        modal.classList.add('show-modal'); // Show the modal
        e.target.classList.add('clicked'); // indicate the specific recipe clicked
    }
});

// Listen for clicks on the close button to hide the modal
closeButton.addEventListener('click', () => {
    modal.classList.remove('show-modal'); // Hide the modal
});

// Listen for clicks on the window; if the click is on the modal background, hide the modal
window.addEventListener('click', e => {
    e.target === modal ? modal.classList.remove('show-modal') : false;
})

function updateMealPlan(day, meal_number, meal_plan = {}) {
    
}
modalForm.addEventListener('submit', updateMealPlan);

