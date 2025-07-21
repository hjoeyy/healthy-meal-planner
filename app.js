const API_KEY = 'e17a54633c7f4e61bdc9b04dc00fd105';

const search = document.getElementById('search');
const search_btn = document.getElementById('submit-btn');
const errorMessage = document.getElementById('errorMessage');
const recipeCards = document.querySelector('.recipe-cards');
const addPlanButton = document.querySelector('.add-plan-button');
const closeButton = document.querySelector('.close-button');
const modal = document.getElementById('modal');



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

function popUpForm() {

}


addPlanButton.addEventListener('click', popUpForm);

