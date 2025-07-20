const API_KEY = 'e17a54633c7f4e61bdc9b04dc00fd105';

const search = document.getElementById('search');
const errorMessage = document.getElementById('errorMessage');


async function getRecipeData(userSearch) {
    const url = `https://api.spoonacular.com/recipes/complexSearch?query=${userSearch}&apiKey=${API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        throw error;
    } finally {
        console.log('Final Block');
    }
}

