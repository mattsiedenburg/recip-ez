// DOM Elements Cache - Optimized with single query
const elements = {
    // Sections
    recipesSection: document.getElementById('recipesSection'),
    addRecipeSection: document.getElementById('addRecipeSection'),
    editRecipeSection: document.getElementById('editRecipeSection'),
    groceryListSection: document.getElementById('groceryListSection'),
    
    // Navigation
    showRecipesBtn: document.getElementById('showRecipesBtn'),
    showAddRecipeBtn: document.getElementById('showAddRecipeBtn'),
    showGroceryListBtn: document.getElementById('showGroceryListBtn'),
    
    // Recipe Forms
    addRecipeForm: document.getElementById('addRecipeForm'),
    recipeTitle: document.getElementById('recipeTitle'),
    ingredientsList: document.getElementById('ingredientsList'),
    addIngredientBtn: document.getElementById('addIngredientBtn'),
    cancelAddRecipeBtn: document.getElementById('cancelAddRecipeBtn'),
    
    editRecipeForm: document.getElementById('editRecipeForm'),
    editIngredientsList: document.getElementById('editIngredientsList'),
    addEditIngredientBtn: document.getElementById('addEditIngredientBtn'),
    cancelEditBtn: document.getElementById('cancelEditBtn'),
    
    // Display
    recipesList: document.getElementById('recipesList'),
    recipesGrid: document.getElementById('recipesGrid'),
    
    // Grocery List
    groceryList: document.getElementById('groceryList'),
    clearGroceryListBtn: document.getElementById('clearGroceryListBtn'),
    removeCheckedBtn: document.getElementById('removeCheckedBtn'),
    copyGroceryListBtn: document.getElementById('copyGroceryListBtn'),
    addCustomItemBtn: document.getElementById('addCustomItemBtn'),
    
    // Custom Item Form
    addCustomItemForm: document.getElementById('addCustomItemForm'),
    customItemName: document.getElementById('customItemName'),
    customItemAmount: document.getElementById('customItemAmount'),
    customItemUnit: document.getElementById('customItemUnit'),
    saveCustomItemBtn: document.getElementById('saveCustomItemBtn'),
    cancelCustomItemBtn: document.getElementById('cancelCustomItemBtn'),
    
    // Search
    searchInput: document.getElementById('searchInput'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    grocerySearchInput: document.getElementById('grocerySearchInput'),
    
    // View Toggle
    gridViewBtn: document.getElementById('gridViewBtn'),
    listViewBtn: document.getElementById('listViewBtn'),
    
    // Modal
    recipeModal: document.getElementById('recipeModal'),
    recipeDetails: document.getElementById('recipeDetails')
};

// Utility Functions - Centralized API and DOM operations
const api = {
    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`API request failed for ${endpoint}:`, error);
            throw error;
        }
    },
    
    // Recipe API methods
    recipes: {
        getAll: () => api.request('/recipes'),
        getById: (id) => api.request(`/recipes/${id}`),
        create: (data) => api.request('/recipes', { method: 'POST', body: JSON.stringify(data) }),
        update: (id, data) => api.request(`/recipes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id) => api.request(`/recipes/${id}`, { method: 'DELETE' })
    },
    
    // Grocery List API methods
    groceryList: {
        get: () => api.request('/grocery-list'),
        addIngredients: (ingredients) => api.request('/grocery-list', { 
            method: 'POST', 
            body: JSON.stringify({ ingredients }) 
        }),
        toggleItem: (id) => api.request(`/grocery-list/${id}/toggle`, { method: 'PUT' }),
        removeItem: (id) => api.request(`/grocery-list/${id}`, { method: 'DELETE' }),
        removeChecked: () => api.request('/grocery-list/checked', { method: 'DELETE' }),
        clear: () => api.request('/grocery-list', { method: 'DELETE' })
    }
};

const ui = {
    // Form validation
    validateRecipeForm(title, instructions, ingredients) {
        if (!title.trim() || !instructions.trim() || ingredients.length === 0) {
            showNotification('Please fill in all required fields and add at least one ingredient.', 'error');
            return false;
        }
        return true;
    },
    
    // Ingredient collection helper
    collectIngredients(container) {
        const ingredientItems = container.querySelectorAll('.ingredient-item');
        const ingredients = [];
        
        ingredientItems.forEach(item => {
            const name = item.querySelector('.ingredient-name').value.trim();
            const amount = item.querySelector('.ingredient-amount').value.trim();
            const unit = item.querySelector('.ingredient-unit').value.trim();
            
            if (name) {
                ingredients.push({ name, amount, unit });
            }
        });
        
        return ingredients;
    },
    
    // Create ingredient input HTML
    createIngredientInput(ingredient = null) {
        return `
            <input type="text" placeholder="Ingredient name" class="ingredient-name" required value="${ingredient ? ingredient.name : ''}">
            <input type="text" placeholder="Amount" class="ingredient-amount" value="${ingredient ? ingredient.amount : ''}">
            <input type="text" placeholder="Unit" class="ingredient-unit" value="${ingredient ? ingredient.unit : ''}">
            <button type="button" class="remove-ingredient">✖</button>
        `;
    },
    
    // Focus management
    focusElement(element, delay = 100) {
        setTimeout(() => element.focus(), delay);
    }
};

// State
let recipes = [];
let groceryItems = [];
let editingRecipeId = null;
let filteredRecipes = [];
let currentView = 'grid'; // 'grid' or 'list'

// API Base URL
const API_BASE = '/api';
function showNotification(message, type = 'success') {
    // Remove any existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadRecipes();
    loadGroceryList();
});

// Event Listeners
// Event Listeners - Optimized with event delegation where possible
function setupEventListeners() {
    // Navigation
    elements.showRecipesBtn.addEventListener('click', () => showSection('recipes'));
    elements.showAddRecipeBtn.addEventListener('click', () => showSection('addRecipe'));
    elements.showGroceryListBtn.addEventListener('click', () => showSection('groceryList'));

    // Recipe forms
    elements.addRecipeForm.addEventListener('submit', handleAddRecipe);
    elements.addIngredientBtn.addEventListener('click', addIngredientInput);
    elements.cancelAddRecipeBtn.addEventListener('click', () => showSection('recipes'));

    // Edit recipe form
    elements.editRecipeForm.addEventListener('submit', handleEditRecipe);
    elements.addEditIngredientBtn.addEventListener('click', () => addEditIngredientInput(null, true));
    elements.cancelEditBtn.addEventListener('click', () => showSection('recipes'));

    // Grocery list
    elements.clearGroceryListBtn.addEventListener('click', clearGroceryList);
    elements.removeCheckedBtn.addEventListener('click', removeCheckedItems);
    elements.copyGroceryListBtn.addEventListener('click', copyGroceryListToClipboard);
    elements.addCustomItemBtn.addEventListener('click', showAddCustomItemForm);
    
    // Custom item form
    elements.saveCustomItemBtn.addEventListener('click', saveCustomItem);
    elements.cancelCustomItemBtn.addEventListener('click', hideAddCustomItemForm);
    elements.customItemName.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') saveCustomItem();
    });

    // Search functionality
    elements.searchInput.addEventListener('input', handleSearch);
    elements.clearSearchBtn.addEventListener('click', clearSearch);
    elements.grocerySearchInput.addEventListener('input', handleGrocerySearch);

    // View toggle functionality
    elements.gridViewBtn.addEventListener('click', () => setView('grid'));
    elements.listViewBtn.addEventListener('click', () => setView('list'));

    // Modal
    document.querySelector('.close').addEventListener('click', closeModal);
    
    // Global event listeners with delegation
    setupGlobalEventListeners();
}

function setupGlobalEventListeners() {
    // Window click for modal
    window.addEventListener('click', (e) => {
        if (e.target === elements.recipeModal) {
            closeModal();
        }
    });
    
    // Global keyboard shortcuts
    document.addEventListener('keydown', handleGlobalKeydown);

    // Event delegation for ingredient removal (both forms)
    [elements.ingredientsList, elements.editIngredientsList].forEach(container => {
        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-ingredient')) {
                const ingredientItem = e.target.closest('.ingredient-item');
                if (container.children.length > 1) {
                    ingredientItem.remove();
                }
            }
        });
    });
}

function handleGlobalKeydown(e) {
    if (e.key === 'Escape') {
        if (elements.recipeModal.style.display === 'block') {
            closeModal();
        } else if (!elements.addCustomItemForm.classList.contains('hidden')) {
            hideAddCustomItemForm();
        } else if (elements.addRecipeSection.classList.contains('active')) {
            showSection('recipes');
        } else if (elements.editRecipeSection.classList.contains('active')) {
            showSection('recipes');
        }
    }
}

// Navigation - Optimized section management
function showSection(section) {
    // Hide all sections and nav buttons
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

    const sectionConfig = {
        recipes: {
            element: elements.recipesSection,
            button: elements.showRecipesBtn,
            onShow: () => {
                clearSearch();
                loadRecipes();
                ui.focusElement(elements.searchInput);
            }
        },
        addRecipe: {
            element: elements.addRecipeSection,
            button: elements.showAddRecipeBtn,
            onShow: () => ui.focusElement(elements.recipeTitle)
        },
        editRecipe: {
            element: elements.editRecipeSection,
            button: null // No nav button for edit mode
        },
        groceryList: {
            element: elements.groceryListSection,
            button: elements.showGroceryListBtn,
            onShow: () => {
                loadGroceryList();
                ui.focusElement(elements.grocerySearchInput);
            }
        }
    };

    const config = sectionConfig[section];
    if (config) {
        config.element.classList.add('active');
        if (config.button) {
            config.button.classList.add('active');
        }
        if (config.onShow) {
            config.onShow();
        }
    }
}

// Recipe Management - Optimized with centralized API calls
async function loadRecipes() {
    try {
        recipes = await api.recipes.getAll();
        filteredRecipes = [...recipes];
        displayRecipes();
    } catch (error) {
        showNotification('Error loading recipes. Please try again.', 'error');
    }
}

function displayRecipes() {
    const recipesToShow = filteredRecipes.length > 0 || elements.searchInput.value.trim() ? filteredRecipes : recipes;
    
    if (recipes.length === 0) {
        elements.recipesGrid.innerHTML = `
            <div class="empty-state">
                <h3>No recipes yet!</h3>
                <p>Add your first recipe to get started.</p>
            </div>
        `;
        elements.recipesList.innerHTML = '';
        return;
    }

    if (recipesToShow.length === 0 && elements.searchInput.value.trim()) {
        elements.recipesGrid.innerHTML = `
            <div class="empty-state">
                <h3>No recipes found</h3>
                <p>No recipes match your search criteria. Try a different search term.</p>
            </div>
        `;
        elements.recipesList.innerHTML = '';
        return;
    }

    // Show search results info
    let searchInfo = '';
    if (elements.searchInput.value.trim()) {
        searchInfo = `<div class="search-results-info">Showing ${recipesToShow.length} of ${recipes.length} recipes</div>`;
    }

    if (currentView === 'grid') {
        elements.recipesGrid.innerHTML = searchInfo + recipesToShow.map(recipe => `
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
        elements.recipesList.innerHTML = '';
    } else {
        elements.recipesList.innerHTML = searchInfo + recipesToShow.map(recipe => `
            <div class="recipe-list-item" onclick="showRecipeDetails(${recipe.id})">
                <div class="recipe-list-info">
                    <h3 class="recipe-list-name">${recipe.title}</h3>
                    <span class="recipe-list-ingredients">${recipe.ingredients.length} ingredients</span>
                </div>
                <div class="recipe-list-actions" onclick="event.stopPropagation()">
                    <button class="add-to-grocery-btn" onclick="addIngredientsToGroceryList(${recipe.id})">
                        🛒 Add to Grocery List
                    </button>
                </div>
            </div>
        `).join('');
        elements.recipesGrid.innerHTML = '';
    }
}

function setView(view) {
    currentView = view;
    
    // Update button states
    if (view === 'grid') {
        elements.gridViewBtn.classList.add('active');
        elements.listViewBtn.classList.remove('active');
        elements.recipesGrid.classList.add('active');
        elements.recipesList.classList.remove('active');
    } else {
        elements.gridViewBtn.classList.remove('active');
        elements.listViewBtn.classList.add('active');
        elements.recipesGrid.classList.remove('active');
        elements.recipesList.classList.add('active');
    }
    
    // Re-render recipes in the new view
    displayRecipes();
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

// Ingredient Management - Consolidated functions
function addIngredientInput() {
    const ingredientItem = document.createElement('div');
    ingredientItem.className = 'ingredient-item';
    ingredientItem.innerHTML = ui.createIngredientInput();
    elements.ingredientsList.appendChild(ingredientItem);
}

function addEditIngredientInput(ingredient = null, autoFocus = false) {
    const ingredientItem = document.createElement('div');
    ingredientItem.className = 'ingredient-item';
    ingredientItem.innerHTML = ui.createIngredientInput(ingredient);
    elements.editIngredientsList.appendChild(ingredientItem);
    
    // Only focus if explicitly requested (when user clicks add ingredient)
    if (autoFocus) {
        const nameField = ingredientItem.querySelector('.ingredient-name');
        ui.focusElement(nameField, 10);
    }
}

function resetIngredientsList() {
    elements.ingredientsList.innerHTML = `
        <div class="ingredient-item">
            ${ui.createIngredientInput()}
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

// Grocery List Management - Optimized with centralized API calls
async function loadGroceryList() {
    try {
        groceryItems = await api.groceryList.get();
        displayGroceryList();
    } catch (error) {
        showNotification('Error loading grocery list. Please try again.', 'error');
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
        elements.groceryList.innerHTML = `
            <div class="empty-state">
                <h3>Your grocery list is empty!</h3>
                <p>Add ingredients from your recipes to build your shopping list.</p>
            </div>
        `;
        elements.removeCheckedBtn.disabled = true;
        elements.copyGroceryListBtn.disabled = true;
        return;
    }

    if (itemsToDisplay.length === 0 && searchTerm) {
        elements.groceryList.innerHTML = `
            <div class="empty-state">
                <h3>No items found</h3>
                <p>No grocery items match your search for "${searchTerm}".</p>
            </div>
        `;
        elements.removeCheckedBtn.disabled = true;
        elements.copyGroceryListBtn.disabled = true;
        return;
    }

    elements.groceryList.innerHTML = itemsToDisplay.map(item => `
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
    elements.removeCheckedBtn.disabled = !hasCheckedItems;
    elements.copyGroceryListBtn.disabled = false;
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
            showNotification(`Ingredients from "${recipe.title}" added to grocery list!`, 'success');
            if (groceryListSection.classList.contains('active')) {
                loadGroceryList();
            }
        } else {
            showNotification('Error adding ingredients to grocery list. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Error adding ingredients to grocery list:', error);
        showNotification('Error adding ingredients to grocery list. Please try again.', 'error');
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

// Search functionality - Optimized
function handleSearch() {
    const searchTerm = elements.searchInput.value.trim().toLowerCase();
    
    // Show/hide clear button
    elements.clearSearchBtn.classList.toggle('show', !!searchTerm);
    
    if (!searchTerm) {
        filteredRecipes = [...recipes];
    } else {
        filteredRecipes = recipes.filter(recipe => {
            // Search in recipe title, ingredients, and instructions
            const titleMatch = recipe.title.toLowerCase().includes(searchTerm);
            const ingredientMatch = recipe.ingredients.some(ingredient => 
                ingredient.name.toLowerCase().includes(searchTerm) ||
                ingredient.amount.toLowerCase().includes(searchTerm) ||
                ingredient.unit.toLowerCase().includes(searchTerm)
            );
            const instructionMatch = recipe.instructions.toLowerCase().includes(searchTerm);
            
            return titleMatch || ingredientMatch || instructionMatch;
        });
    }
    
    displayRecipes();
}

function clearSearch() {
    elements.searchInput.value = '';
    elements.clearSearchBtn.classList.remove('show');
    filteredRecipes = [...recipes];
    displayRecipes();
}

// Grocery search functionality
function handleGrocerySearch() {
    const searchTerm = elements.grocerySearchInput.value.trim().toLowerCase();
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