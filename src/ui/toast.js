

function displayError(message) {
    if(errorMessage) errorMessage.textContent = message;
    if(recipeCards) recipeCards.innerHTML = '';
    var t = document.getElementById('errorMessage');
    t.className = "show";
    setTimeout(function(){ t.className = t.className.replace("show", ""); }, 3000);
}

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

function generateToastSuccessMessage() {
    var t = document.getElementById('generate-success-toast-message');
    t.className = "show";
    setTimeout(function(){ t.className = t.className.replace("show", ""); }, 3000);
}

function clearShoppingListToastSuccessMessage() {
    var t = document.getElementById('clear-list-success-toast-message');
    t.className = "show";
    setTimeout(function(){ t.className = t.className.replace("show", ""); }, 3000);
}

function toastErrorMessage() {
    var t = document.getElementById('error-toast-message');
    t.className = "show";
    setTimeout(function(){ t.className = t.className.replace("show", ""); }, 3000);
}

function getErrorMessage(statusCode) {
    switch (statusCode) {
        case 401:
            return "Authentication error - please check API configuration";
        case 402:
            return "Daily API limit reached - try again tomorrow";
        case 403:
            return "Access forbidden - please check API permissions";
        case 404:
            return "No recipes found - try a different search term";
        case 429:
            return "Too many requests - please wait a moment and try again";
        case 500:
            return "Server error - please try again later";
        case 502:
        case 503:
        case 504:
            return "Service temporarily unavailable - please try again later";
        default:
            return "Something went wrong - please try again";
    }
}

export { displayError, toastSuccessMessage, clearAllToastSuccessMessage, updateToastSuccessMessage, deleteToastSuccessMessage, 
    generateToastSuccessMessage, clearShoppingListToastSuccessMessage, toastErrorMessage, getErrorMessage };