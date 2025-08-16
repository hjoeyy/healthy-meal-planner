import { getJSON, safeSetLocalStorage } from './storage.js';

export const state = {
    selectedRecipe: null,
    pendingRecipe: null,
    specificDay: null,
    specific_meal_number: null,
    mealPlan: null,
    get favoritesList() {
        return getJSON('favoritesList', []);
    },
    
    set favoritesList(value) {
        safeSetLocalStorage('favoritesList', value);
    }
};

