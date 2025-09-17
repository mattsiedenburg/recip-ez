// DOM elements
const recipesSection = document.getElementById('recipesSection');
const addRecipeSection = document.getElementById('addRecipeSection');
const editRecipeSection = document.getElementById('editRecipeSection');
const groceryListSection = document.getElementById('groceryListSection');

const showRecipesBtn = document.getElementById('showRecipesBtn');
const showAddRecipeBtn = document.getElementById('showAddRecipeBtn');
const showGroceryListBtn = document.getElementById('showGroceryListBtn');

const addRecipeForm = document.getElementById('addRecipeForm');
const ingredientsList = document.getElementById('ingredientsList');
const addIngredientBtn = document.getElementById('addIngredientBtn');

const editRecipeForm = document.getElementById('editRecipeForm');
const editIngredientsList = document.getElementById('editIngredientsList');
const addEditIngredientBtn = document.getElementById('addEditIngredientBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');

const recipesList = document.getElementById('recipesList');
const groceryList = document.getElementById('groceryList');
const clearGroceryListBtn = document.getElementById('clearGroceryListBtn');
const removeCheckedBtn = document.getElementById('removeCheckedBtn');
const copyGroceryListBtn = document.getElementById('copyGroceryListBtn');
const addCustomItemBtn = document.getElementById('addCustomItemBtn');

const addCustomItemForm = document.getElementById('addCustomItemForm');
const customItemName = document.getElementById('customItemName');
const customItemAmount = document.getElementById('customItemAmount');
const customItemUnit = document.getElementById('customItemUnit');
const saveCustomItemBtn = document.getElementById('saveCustomItemBtn');
const cancelCustomItemBtn = document.getElementById('cancelCustomItemBtn');

const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const grocerySearchInput = document.getElementById('grocerySearchInput');

const recipeModal = document.getElementById('recipeModal');
const recipeDetails = document.getElementById('recipeDetails');

// State
let recipes = [];
let groceryItems = [];
let editingRecipeId = null;
let filteredRecipes = [];

// API Base URL
const API_BASE = '/api';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadRecipes();
    loadGroceryList();
});

// Event Listeners
function setupEventListeners() {
    // Navigation
    showRecipesBtn.addEventListener('click', () => showSection('recipes'));
    showAddRecipeBtn.addEventListener('click', () => showSection('addRecipe'));
    showGroceryListBtn.addEventListener('click', () => showSection('groceryList'));

    // Recipe form
    addRecipeForm.addEventListener('submit', handleAddRecipe);
    addIngredientBtn.addEventListener('click', addIngredientInput);

    // Edit recipe form
    editRecipeForm.addEventListener('submit', handleEditRecipe);
    addEditIngredientBtn.addEventListener('click', () => addEditIngredientInput());
    cancelEditBtn.addEventListener('click', () => showSection('recipes'));

    // Grocery list
    clearGroceryListBtn.addEventListener('click', clearGroceryList);
    removeCheckedBtn.addEventListener('click', removeCheckedItems);
    copyGroceryListBtn.addEventListener('click', copyGroceryListToClipboard);
    addCustomItemBtn.addEventListener('click', showAddCustomItemForm);
    
    // Custom item form
    saveCustomItemBtn.addEventListener('click', saveCustomItem);
    cancelCustomItemBtn.addEventListener('click', hideAddCustomItemForm);
    customItemName.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') saveCustomItem();
    });

    // Search functionality
    searchInput.addEventListener('input', handleSearch);
    clearSearchBtn.addEventListener('click', clearSearch);
    grocerySearchInput.addEventListener('input', handleGrocerySearch);

    // Modal
    document.querySelector('.close').addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === recipeModal) {
            closeModal();
        }
    });

    // Remove ingredient functionality
    ingredientsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-ingredient')) {
            const ingredientItem = e.target.closest('.ingredient-item');
            if (ingredientsList.children.length > 1) {
                ingredientItem.remove();
            }
        }
    });

    // Remove ingredient functionality for edit form
    editIngredientsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-ingredient')) {
            const ingredientItem = e.target.closest('.ingredient-item');
            if (editIngredientsList.children.length > 1) {
                ingredientItem.remove();
            }
        }
    });
}

// Navigation
function showSection(section) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

    // Show selected section
    switch (section) {
        case 'recipes':
            recipesSection.classList.add('active');
            showRecipesBtn.classList.add('active');
            clearSearch(); // Reset search when returning to recipes
            loadRecipes();
            break;
        case 'addRecipe':
            addRecipeSection.classList.add('active');
            showAddRecipeBtn.classList.add('active');
            break;
        case 'editRecipe':
            editRecipeSection.classList.add('active');
            // Don't highlight any nav button for edit mode
            break;
        case 'groceryList':
            groceryListSection.classList.add('active');
            showGroceryListBtn.classList.add('active');
            loadGroceryList();
            break;
    }
}

// Recipe Management
async function loadRecipes() {
    try {
        const response = await fetch(`${API_BASE}/recipes`);
        recipes = await response.json();
        filteredRecipes = [...recipes];
        displayRecipes();
    } catch (error) {
        console.error('Error loading recipes:', error);
    }
}

function displayRecipes() {
    const recipesToShow = filteredRecipes.length > 0 || searchInput.value.trim() ? filteredRecipes : recipes;
    
    if (recipes.length === 0) {
        recipesList.innerHTML = `
            <div class="empty-state">
                <h3>No recipes yet!</h3>
                <p>Add your first recipe to get started.</p>
            </div>
        `;
        return;
    }

    if (recipesToShow.length === 0 && searchInput.value.trim()) {
        recipesList.innerHTML = `
            <div class="empty-state">
                <h3>No recipes found</h3>
                <p>No recipes match your search criteria. Try a different search term.</p>
            </div>
        `;
        return;
    }

    // Show search results info
    let searchInfo = '';
    if (searchInput.value.trim()) {
        searchInfo = `<div class="search-results-info">Showing ${recipesToShow.length} of ${recipes.length} recipes</div>`;
    }

    recipesList.innerHTML = searchInfo + recipesToShow.map(recipe => `
        <div class="recipe-card" onclick="showRecipeDetails(${recipe.id})">
            <h3>${recipe.title}</h3>
            <p class="ingredients-count">${recipe.ingredients.length} ingredients</p>
            <div class="actions" onclick="event.stopPropagation()">
                <button class="add-to-grocery-btn" onclick="addIngredientsToGroceryList(${recipe.id})">
                    🛒 Add to Grocery List
                </button>
            </div>
        </div>
    `).join('');
}

async function handleAddRecipe(e) {
    e.preventDefault();

    const title = document.getElementById('recipeTitle').value.trim();
    const instructions = document.getElementById('recipeInstructions').value.trim();

    // Collect ingredients
    const ingredientItems = document.querySelectorAll('.ingredient-item');
    const ingredients = [];

    ingredientItems.forEach(item => {
        const name = item.querySelector('.ingredient-name').value.trim();
        const amount = item.querySelector('.ingredient-amount').value.trim();
        const unit = item.querySelector('.ingredient-unit').value.trim();

        if (name) {
            ingredients.push({ name, amount, unit });
        }
    });

    if (!title || !instructions || ingredients.length === 0) {
        alert('Please fill in all required fields and add at least one ingredient.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/recipes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, ingredients, instructions }),
        });

        if (response.ok) {
            addRecipeForm.reset();
            resetIngredientsList();
            showSection('recipes');
            alert('Recipe added successfully!');
        } else {
            alert('Error adding recipe. Please try again.');
        }
    } catch (error) {
        console.error('Error adding recipe:', error);
        alert('Error adding recipe. Please try again.');
    }
}

function addIngredientInput() {
    const ingredientItem = document.createElement('div');
    ingredientItem.className = 'ingredient-item';
    ingredientItem.innerHTML = `
        <input type="text" placeholder="Ingredient name" class="ingredient-name" required>
        <input type="text" placeholder="Amount" class="ingredient-amount">
        <input type="text" placeholder="Unit" class="ingredient-unit">
        <button type="button" class="remove-ingredient">✖</button>
    `;
    ingredientsList.appendChild(ingredientItem);
}

function addEditIngredientInput(ingredient = null) {
    const ingredientItem = document.createElement('div');
    ingredientItem.className = 'ingredient-item';
    ingredientItem.innerHTML = `
        <input type="text" placeholder="Ingredient name" class="ingredient-name" required value="${ingredient ? ingredient.name : ''}">
        <input type="text" placeholder="Amount" class="ingredient-amount" value="${ingredient ? ingredient.amount : ''}">
        <input type="text" placeholder="Unit" class="ingredient-unit" value="${ingredient ? ingredient.unit : ''}">
        <button type="button" class="remove-ingredient">✖</button>
    `;
    editIngredientsList.appendChild(ingredientItem);
}

function resetIngredientsList() {
    ingredientsList.innerHTML = `
        <div class="ingredient-item">
            <input type="text" placeholder="Ingredient name" class="ingredient-name" required>
            <input type="text" placeholder="Amount" class="ingredient-amount">
            <input type="text" placeholder="Unit" class="ingredient-unit">
            <button type="button" class="remove-ingredient">✖</button>
        </div>
    `;
}

async function deleteRecipe(recipeId) {
    if (!confirm('Are you sure you want to delete this recipe?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/recipes/${recipeId}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            loadRecipes();
        } else {
            alert('Error deleting recipe. Please try again.');
        }
    } catch (error) {
        console.error('Error deleting recipe:', error);
        alert('Error deleting recipe. Please try again.');
    }
}

function editRecipe(recipeId) {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return;

    editingRecipeId = recipeId;
    
    // Populate the edit form
    document.getElementById('editRecipeTitle').value = recipe.title;
    document.getElementById('editRecipeInstructions').value = recipe.instructions;
    
    // Clear and populate ingredients
    editIngredientsList.innerHTML = '';
    recipe.ingredients.forEach(ingredient => {
        addEditIngredientInput(ingredient);
    });
    
    // If no ingredients, add one empty ingredient
    if (recipe.ingredients.length === 0) {
        addEditIngredientInput();
    }
    
    showSection('editRecipe');
}

async function handleEditRecipe(e) {
    e.preventDefault();

    const title = document.getElementById('editRecipeTitle').value.trim();
    const instructions = document.getElementById('editRecipeInstructions').value.trim();

    // Collect ingredients
    const ingredientItems = editIngredientsList.querySelectorAll('.ingredient-item');
    const ingredients = [];

    ingredientItems.forEach(item => {
        const name = item.querySelector('.ingredient-name').value.trim();
        const amount = item.querySelector('.ingredient-amount').value.trim();
        const unit = item.querySelector('.ingredient-unit').value.trim();

        if (name) {
            ingredients.push({ name, amount, unit });
        }
    });

    if (ingredients.length === 0) {
        alert('Please add at least one ingredient.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/recipes/${editingRecipeId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title,
                ingredients,
                instructions,
            }),
        });

        if (response.ok) {
            // Clear form
            editRecipeForm.reset();
            editIngredientsList.innerHTML = '';
            addEditIngredientInput();
            editingRecipeId = null;
            
            // Show recipes section
            showSection('recipes');
        } else {
            alert('Error updating recipe. Please try again.');
        }
    } catch (error) {
        console.error('Error updating recipe:', error);
        alert('Error updating recipe. Please try again.');
    }
}

function showRecipeDetails(recipeId) {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return;

    recipeDetails.innerHTML = `
        <div class="recipe-detail">
            <h3>${recipe.title}</h3>
            
            <div class="ingredients-section">
                <h4>🥘 Ingredients</h4>
                <ul>
                    ${recipe.ingredients.map(ing => `
                        <li>${ing.name}${ing.amount ? ` - ${ing.amount}` : ''}${ing.unit ? ` ${ing.unit}` : ''}</li>
                    `).join('')}
                </ul>
            </div>
            
            <div class="instructions-section">
                <h4>📝 Instructions</h4>
                <div class="instructions">${recipe.instructions}</div>
            </div>
            
            <div class="modal-actions">
                <button class="add-to-grocery-btn" onclick="addIngredientsToGroceryList(${recipe.id}); closeModal();">
                    🛒 Add to Grocery List
                </button>
                <button class="edit-recipe-btn" onclick="editRecipe(${recipe.id}); closeModal();">
                    ✏️ Edit Recipe
                </button>
                <button class="delete-recipe-btn" onclick="deleteRecipe(${recipe.id}); closeModal();">
                    🗑️ Delete Recipe
                </button>
            </div>
        </div>
    `;

    recipeModal.style.display = 'block';
}

function closeModal() {
    recipeModal.style.display = 'none';
}

// Grocery List Management
async function loadGroceryList() {
    try {
        const response = await fetch(`${API_BASE}/grocery-list`);
        groceryItems = await response.json();
        displayGroceryList();
    } catch (error) {
        console.error('Error loading grocery list:', error);
    }
}

function displayGroceryList(searchTerm = '') {
    let itemsToDisplay = groceryItems;
    
    // Filter items if search term is provided
    if (searchTerm) {
        itemsToDisplay = groceryItems.filter(item => 
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    
    if (groceryItems.length === 0) {
        groceryList.innerHTML = `
            <div class="empty-state">
                <h3>Your grocery list is empty!</h3>
                <p>Add ingredients from your recipes to build your shopping list.</p>
            </div>
        `;
        removeCheckedBtn.disabled = true;
        copyGroceryListBtn.disabled = true;
        return;
    }

    if (itemsToDisplay.length === 0 && searchTerm) {
        groceryList.innerHTML = `
            <div class="empty-state">
                <h3>No items found</h3>
                <p>No grocery items match your search for "${searchTerm}".</p>
            </div>
        `;
        removeCheckedBtn.disabled = true;
        copyGroceryListBtn.disabled = true;
        return;
    }

    groceryList.innerHTML = itemsToDisplay.map(item => `
        <div class="grocery-item ${item.checked ? 'checked' : ''}">
            <input type="checkbox" ${item.checked ? 'checked' : ''} 
                   onchange="toggleGroceryItem(${item.id})">
            <div class="grocery-item-content">
                <div class="grocery-item-name">${item.name}</div>
                ${item.amount || item.unit ? `<div class="grocery-item-amount">${item.amount} ${item.unit}</div>` : ''}
            </div>
            <button class="remove-grocery-btn" onclick="removeGroceryItem(${item.id})">✖</button>
        </div>
    `).join('');

    // Update button states based on all items, not just filtered ones
    const hasCheckedItems = groceryItems.some(item => item.checked);
    removeCheckedBtn.disabled = !hasCheckedItems;
    copyGroceryListBtn.disabled = false;
}

async function addIngredientsToGroceryList(recipeId) {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return;

    try {
        const response = await fetch(`${API_BASE}/grocery-list`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ingredients: recipe.ingredients }),
        });

        if (response.ok) {
            alert(`Ingredients from "${recipe.title}" added to grocery list!`);
            if (groceryListSection.classList.contains('active')) {
                loadGroceryList();
            }
        } else {
            alert('Error adding ingredients to grocery list. Please try again.');
        }
    } catch (error) {
        console.error('Error adding ingredients to grocery list:', error);
        alert('Error adding ingredients to grocery list. Please try again.');
    }
}

async function toggleGroceryItem(itemId) {
    try {
        const response = await fetch(`${API_BASE}/grocery-list/${itemId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ checked: !groceryItems.find(item => item.id === itemId).checked }),
        });

        if (response.ok) {
            loadGroceryList();
        }
    } catch (error) {
        console.error('Error toggling grocery item:', error);
    }
}

async function removeGroceryItem(itemId) {
    try {
        const response = await fetch(`${API_BASE}/grocery-list/${itemId}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            loadGroceryList();
        }
    } catch (error) {
        console.error('Error removing grocery item:', error);
    }
}

async function clearGroceryList() {
    if (!confirm('Are you sure you want to clear the entire grocery list?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/grocery-list`, {
            method: 'DELETE',
        });

        if (response.ok) {
            loadGroceryList();
        }
    } catch (error) {
        console.error('Error clearing grocery list:', error);
    }
}

async function toggleGroceryItem(itemId) {
    try {
        const response = await fetch(`${API_BASE}/grocery-list/${itemId}/toggle`, {
            method: 'PUT',
        });

        if (response.ok) {
            loadGroceryList();
        }
    } catch (error) {
        console.error('Error toggling grocery item:', error);
    }
}

async function removeCheckedItems() {
    const checkedItems = groceryItems.filter(item => item.checked);
    
    if (checkedItems.length === 0) {
        return;
    }

    if (!confirm(`Are you sure you want to remove ${checkedItems.length} checked item(s)?`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/grocery-list/checked`, {
            method: 'DELETE',
        });

        if (response.ok) {
            loadGroceryList();
        }
    } catch (error) {
        console.error('Error removing checked items:', error);
    }
}

// Search functionality
function handleSearch() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    // Show/hide clear button
    if (searchTerm) {
        clearSearchBtn.classList.add('show');
    } else {
        clearSearchBtn.classList.remove('show');
    }
    
    if (!searchTerm) {
        filteredRecipes = [...recipes];
    } else {
        filteredRecipes = recipes.filter(recipe => {
            // Search in recipe title
            const titleMatch = recipe.title.toLowerCase().includes(searchTerm);
            
            // Search in ingredients
            const ingredientMatch = recipe.ingredients.some(ingredient => 
                ingredient.name.toLowerCase().includes(searchTerm) ||
                ingredient.amount.toLowerCase().includes(searchTerm) ||
                ingredient.unit.toLowerCase().includes(searchTerm)
            );
            
            // Search in instructions
            const instructionMatch = recipe.instructions.toLowerCase().includes(searchTerm);
            
            return titleMatch || ingredientMatch || instructionMatch;
        });
    }
    
    displayRecipes();
}

function clearSearch() {
    searchInput.value = '';
    clearSearchBtn.classList.remove('show');
    filteredRecipes = [...recipes];
    displayRecipes();
}

// Grocery search functionality
function handleGrocerySearch() {
    const searchTerm = grocerySearchInput.value.trim().toLowerCase();
    displayGroceryList(searchTerm);
}

// Copy grocery list to clipboard
async function copyGroceryListToClipboard() {
    if (groceryItems.length === 0) {
        return;
    }

    // Create a formatted grocery list text
    const uncheckedItems = groceryItems.filter(item => !item.checked);
    const checkedItems = groceryItems.filter(item => item.checked);
    
    let listText = "🛒 Grocery List\n";
    listText += "====================\n\n";
    
    if (uncheckedItems.length > 0) {
        listText += "📝 To Buy:\n";
        uncheckedItems.forEach(item => {
            const amount = item.amount && item.unit ? ` (${item.amount} ${item.unit})` : '';
            listText += `• ${item.name}${amount}\n`;
        });
        listText += "\n";
    }
    
    if (checkedItems.length > 0) {
        listText += "✅ Already Got:\n";
        checkedItems.forEach(item => {
            const amount = item.amount && item.unit ? ` (${item.amount} ${item.unit})` : '';
            listText += `• ${item.name}${amount}\n`;
        });
    }
    
    listText += `\nGenerated by Recip-EZ on ${new Date().toLocaleDateString()}`;

    try {
        await navigator.clipboard.writeText(listText);
        
        // Show visual feedback
        const originalText = copyGroceryListBtn.textContent;
        copyGroceryListBtn.textContent = "✓ Copied!";
        copyGroceryListBtn.classList.add('copied');
        
        setTimeout(() => {
            copyGroceryListBtn.textContent = originalText;
            copyGroceryListBtn.classList.remove('copied');
        }, 2000);
        
    } catch (err) {
        // Fallback for browsers that don't support clipboard API
        console.error('Failed to copy to clipboard:', err);
        
        // Create a temporary textarea for fallback copy
        const textArea = document.createElement('textarea');
        textArea.value = listText;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            textArea.remove();
            
            // Show visual feedback
            const originalText = copyGroceryListBtn.textContent;
            copyGroceryListBtn.textContent = "✓ Copied!";
            copyGroceryListBtn.classList.add('copied');
            
            setTimeout(() => {
                copyGroceryListBtn.textContent = originalText;
                copyGroceryListBtn.classList.remove('copied');
            }, 2000);
            
        } catch (fallbackErr) {
            textArea.remove();
            alert('Unable to copy to clipboard. Please manually select and copy the list.');
            console.error('Fallback copy failed:', fallbackErr);
        }
    }
}

// Custom item management
function showAddCustomItemForm() {
    addCustomItemForm.classList.remove('hidden');
    customItemName.focus();
}

function hideAddCustomItemForm() {
    addCustomItemForm.classList.add('hidden');
    customItemName.value = '';
    customItemAmount.value = '';
    customItemUnit.value = '';
}

async function saveCustomItem() {
    const name = customItemName.value.trim();
    const amount = customItemAmount.value.trim();
    const unit = customItemUnit.value.trim();
    
    if (!name) {
        alert('Please enter an item name.');
        customItemName.focus();
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/grocery-list`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ingredients: [{
                    name: name,
                    amount: amount,
                    unit: unit
                }]
            }),
        });

        if (response.ok) {
            hideAddCustomItemForm();
            loadGroceryList();
        } else {
            alert('Error adding item. Please try again.');
        }
    } catch (error) {
        console.error('Error adding custom item:', error);
        alert('Error adding item. Please try again.');
    }
}