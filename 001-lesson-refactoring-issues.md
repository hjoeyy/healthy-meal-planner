# Refactoring Issues in Your Meal Planner

## Issue 1: Case-Sensitive Day Input

**Problem**: In `updateMealPlan()` function (line 245), you're directly using the user input:
```javascript
const day = (this.querySelector('[name=day]')).value;
```

This means if someone types "Sunday" instead of "sunday", it won't match your mealPlan object keys.

**Solution**: Normalize the input to lowercase:
```javascript
const day = (this.querySelector('[name=day]')).value.toLowerCase();
```

## Issue 2: No Validation for Invalid Days

**Problem**: There's no check if the day exists in your mealPlan object.

**Solution**: Add validation:
```javascript
const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
if (!validDays.includes(day)) {
    // Show error message
    return;
}
```

## Issue 3: No Handling for Existing Meals

**Problem**: When adding a meal to a slot that already has one, it silently overwrites.

**Solution**: Check if slot is occupied and ask user what to do:
```javascript
if (mealPlan[day][meal_number]) {
    // Ask user if they want to overwrite or show error
}
```

## Issue 4: Search Bar Not Working on First Attempt

**Problem**: This is likely due to event listener timing or DOM not being ready.

**Solution**: Need to investigate the `attachSearchListeners()` function.

## Next Steps

1. Fix the case-sensitivity issue
2. Add proper validation
3. Handle existing meals
4. Debug the search functionality

Would you like to start with fixing the case-sensitivity issue first? 