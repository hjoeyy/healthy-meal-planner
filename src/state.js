import { getJSON } from './storage.js';

export const state = {
    selectedRecipe: null,
    pendingRecipe: null,
    specificDay: null,
    specific_meal_number: null,
    mealPlan: null
};


export function initializeState() {
    state.mealPlan = getJSON('mealPlan', {
        monday: Array(5).fill(null),
        tuesday: Array(5).fill(null),
        wednesday: Array(5).fill(null),
        thursday: Array(5).fill(null),
        friday: Array(5).fill(null),
        saturday: Array(5).fill(null),
        sunday: Array(5).fill(null)
    });
}

