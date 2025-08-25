import { getRecipeData } from '../api.js';
import { displayError, toastSuccessMessage, clearAllToastSuccessMessage, updateToastSuccessMessage, deleteToastSuccessMessage, 
    generateToastSuccessMessage, clearShoppingListToastSuccessMessage, toastErrorMessage, getErrorMessage } from '../ui/toast.js';


const modalBox = document.querySelector('.modal');
const confirmModalBox = document.querySelector('.confirm-modal');
const modalForm = document.querySelector('.modal-form');
const allRecipeCards = document.querySelectorAll('.recipe-card');
const modalRecipeCards = document.querySelector('.modal-recipe-cards');
const modalSearch = document.getElementById('modal-search');
const modalSearchBtn = document.getElementById('modal-search-btn');
const modalClearAllBtn = document.getElementById('modal-clear-all-btn');
const addMealButton = document.querySelectorAll('.add-meal-button');
const allModalRecipeCards = document.querySelectorAll('.modal-recipe-card');
const spinner = document.querySelector('.spinner');

makeModalDraggable(modalBox);
makeModalDraggable(confirmModalBox);

export function makeModalDraggable(modal) {
    if (!modal) return; // Early return if no modal
    let offsetX = 0, offsetY = 0, startX = 0, startY = 0, isDragging = false;

    // When mouse is pressed down on the modal, start dragging

    function handleStart(e) {
        isDragging = true;
        if (e.type === 'mousedown') {
            startX = e.clientX; // Mouse X position when drag starts
            startY = e.clientY; // Mouse Y position when drag starts
        } else if (e.type === 'touchstart') {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }
        // Get modal's current position
        const rect = modal.getBoundingClientRect();
        offsetX = startX - rect.left;
        offsetY = startY - rect.top;
        document.body.style.userSelect = 'none';
    }

    // When mouse moves, if dragging, move the modal to follow the mouse
    function handleMove(e) {
        if (!isDragging) return; // Only move if dragging
        e.preventDefault();
        let clientX, clientY;
        // Calculate new position for the modal
        if (e.type == 'mousemove') {
            clientX = e.clientX;
            clientY = e.clientY;
        } else if (e.type == 'touchmove') {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }

        let left = clientX - offsetX;
        let top = clientY - offsetY;
        // Move modal to new position
        modal.style.left = left + 'px';
        modal.style.top = top + 'px';
        modal.style.transform = 'none'; // Disable centering while dragging
        modal.style.position = 'fixed'; // Keep modal on top
    }

    // When mouse is released, stop dragging
    function handleEnd() {
        isDragging = false;
        document.body.style.userSelect = '';
    }

    modal.addEventListener('mousedown', handleStart);
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);

    modal.addEventListener('touchstart', handleStart, { passive: false});
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleEnd);
}

export function setupModalListeners({closeButtons, modalForm, onFormSubmit}) {
    //if (!modal || !confirmModal) return; // check if null

    const mainModalContainer = document.querySelector('.modal-container');
    const confirmModalContainer = document.getElementById('confirm-modal');

    console.log('DEBUG: Modal Elements:', {
        mainModalExists: !!mainModalContainer,
        confirmModalExists: !!confirmModalContainer,
        closeButtonsCount: closeButtons?.length
    });


    if(closeButtons) {
        closeButtons.forEach((btn, index) => {
            btn.addEventListener('click', (e) => {
                console.log('Close button clicked');
                e.preventDefault();
                e.stopPropagation(); // Prevent event from bubbling to window
                mainModalContainer?.classList.remove('show-modal');
                confirmModalContainer?.classList.remove('show-modal');
            });
        });
    }
    
    // Close on click outside
    window.addEventListener('click', (e) => {
        console.log({
            clickTarget: e.target,
            targetClasses: e.target.classList,
            targetParent: e.target.parentElement,
            isDirectModalContainer: e.target.classList.contains('modal-container'),
            path: e.composedPath()
        });
        if (e.target === mainModalContainer) {
            mainModalContainer.classList.remove('show-modal');
        }
        if (e.target === confirmModalContainer) {
            confirmModalContainer.classList.remove('show-modal');
        }
    });

       // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            mainModalContainer?.classList.remove('show-modal');
            confirmModalContainer?.classList.remove('show-modal');
        }
    });
    
    if(modalForm && onFormSubmit) {
        modalForm.addEventListener('submit', onFormSubmit);
    }
}

export async function updateModalSearchResults() {
    const input = modalSearch?.value;
    if (spinner) spinner.style.display = 'block';
    if (!input) {
        // Optionally show an error in the modal
        displayError("Invalid input");
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
        if (spinner) spinner.style.display = 'none';
        modalSearch.value = '';
    } catch (error) {
        // Optionally show an error in the modal
        if (spinner) spinner.style.display = 'none';
        console.error('Search error: ', error);
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            displayError('Network error - please check your internet connection');
        } else {
            displayError(error.message || 'Server error: something went wrong on our end, please try again');
        }
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