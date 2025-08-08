
export function safeSetLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    }
    catch (error) {
        console.error(error.message);
        //displayError(error.message);
        if(error.name === 'QuotaExceededError') {
            //displayError('Local storage quota limit exceeded!');
            return false;
        }
        return false;
    }
    return true;
}

export function getJSON(key, fallback) {
    const raw = localStorage.getItem(key);
    if (raw === null) {
        return fallback;
    }
    try {
        const parsed = JSON.parse(raw);
        return parsed === undefined ? fallback : parsed; 
    }
    catch {
        return fallback;
    }
}

export function getString(key, fallback) {
    const parsed = getJSON(key, undefined);
    if (typeof parsed === 'string') {
        return parsed;
    }
    else {
        return fallback;
    }
}