import { getJSON, safeSetLocalStorage } from '../storage.js';
import { clearShoppingListToastSuccessMessage } from './toast.js';

let id = 1;


function renderShoppingList() {
    id = 1;
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

    // function save() { // save checked boxes to localStorage
    //     for(let i = 1; i <= boxes; i++) {
    //         const checkbox = document.getElementById(String(i));
    //         //localStorage.setItem("checkbox" + String(i), checkbox.checked);
    //         if (checkbox) {
    //             safeSetLocalStorage(`checkbox${i}`, checkbox.checked);
    //         }
    //     }
    // }

    document.querySelector('.shopping-list-ul').addEventListener('change', (e) => {
        // Check if the changed element is a checkbox
        if (e.target.matches('input[type="checkbox"]')) {
            const id = e.target.id;
            safeSetLocalStorage(`checkbox${id}`, e.target.checked);
        }
    });
    
    for (let i = 1; i <= boxes; i++) { // if user checked then set it as checked to save to localStorage
        if (localStorage.length > 0) {
            var checked = JSON.parse(localStorage.getItem("checkbox" + String(i)));
            document.getElementById(String(i)).checked = checked;
        }
    }
}


function clearAllShoppingItems() {
    //localStorage.setItem('shoppingList', ingredients = []);
    safeSetLocalStorage('shoppingList', []);
    const shoppingList = document.querySelector('.shopping-list-ul');
    if (shoppingList) shoppingList.innerHTML = '';
    clearShoppingListToastSuccessMessage();
}

export { renderShoppingList, clearAllShoppingItems };