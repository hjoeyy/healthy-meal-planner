import {renderShoppingList, clearAllShoppingItems } from '../ui/shopping-list-ui.js';
import { displayError, toastSuccessMessage, clearAllToastSuccessMessage, updateToastSuccessMessage, deleteToastSuccessMessage, 
    generateToastSuccessMessage, clearShoppingListToastSuccessMessage, toastErrorMessage, getErrorMessage } from '../ui/toast.js';
import { getRecipeData } from '../api.js';

document.addEventListener('DOMContentLoaded', () => {
    const clearShoppingList = document.querySelector('.clear-list');
    const exportOrPrintList = document.querySelector('.export-print');
    renderShoppingList();
    // Wire up any other event listeners here

    if (clearShoppingList) clearShoppingList.addEventListener('click', clearAllShoppingItems);
    if (exportOrPrintList) exportOrPrintList.addEventListener('click', () => window.print());
});