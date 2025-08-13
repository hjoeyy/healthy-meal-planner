import { getJSON, getString, safeSetLocalStorage } from '../src/storage.js';
import { getMealPlan } from '../src/ui/meal-plan-ui.js';
import { displayError, toastSuccessMessage, clearAllToastSuccessMessage, updateToastSuccessMessage, deleteToastSuccessMessage, 
    generateToastSuccessMessage, clearShoppingListToastSuccessMessage, toastErrorMessage, getErrorMessage } from '../src/ui/toast.js';

const API_KEY = 'e17a54633c7f4e61bdc9b04dc00fd105';
const spinner = document.querySelector('.spinner');


async function getRecipeData(input) {
    const url = `https://api.spoonacular.com/recipes/complexSearch?query=${input}&apiKey=${API_KEY}`;

    try {
        if (spinner) spinner.style.display = 'block';
        const response = await fetch(url);
        if (!response.ok) {
            const errorMessage = getErrorMessage(response.status);
            console.error("API Error: ", response.status, response.statusText);
            throw new Error(errorMessage); // ← Throw the error instead of just displaying it
        }
        const data = await response.json();
        if (spinner) spinner.style.display = 'none';
        return data;
    } catch (error) {
        if (spinner) spinner.style.display = 'none';
        throw error;
    } finally {
        console.log('Final Block');
    }
}

async function fetchShoppingList() { // fetch the shopping list for the meals
    const recipeIds = [];
    const currentMealPlan = getMealPlan();
    const ingredientsList = [];
    const duplicateRemover = new Set();
    const uniqueIngredients = [];
    for (let day in currentMealPlan) {
        for (let mealSlot of currentMealPlan[day]) { // collect all meal IDs
            if (mealSlot !== null) {
                recipeIds.push(mealSlot.id);
            }
        }
    }
    if (spinner) spinner.style.display = 'block';
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
            safeSetLocalStorage('shoppingList', uniqueIngredients);
            generateToastSuccessMessage();
        } catch (error) {
            displayError('Server error: something went wrong on our end, please try again');
            return;
        } finally {
            console.log('Final Block');
        }
    }
    if (spinner) spinner.style.display = 'none';
}

export { getRecipeData, fetchShoppingList };

