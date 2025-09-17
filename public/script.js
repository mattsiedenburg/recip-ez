// DOM elements
const recipesSection = document.getElementById('recipesSection');
const addRecipeSection = document.getElementById('addRecipeSection');
const groceryListSection = document.getElementById('groceryListSection');

const showRecipesBtn = document.getElementById('showRecipesBtn');
const showAddRecipeBtn = document.getElementById('showAddRecipeBtn');
const showGroceryListBtn = document.getElementById('showGroceryListBtn');

const addRecipeForm = document.getElementById('addRecipeForm');
const ingredientsList = document.getElementById('ingredientsList');
const addIngredientBtn = document.getElementById('addIngredientBtn');

const recipesList = document.getElementById('recipesList');
const groceryList = document.getElementById('groceryList');
const clearGroceryListBtn = document.getElementById('clearGroceryListBtn');

const recipeModal = document.getElementById('recipeModal');
const recipeDetails = document.getElementById('recipeDetails');

// State
let recipes = [];
let groceryItems = [];

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

    // Grocery list
    clearGroceryListBtn.addEventListener('click', clearGroceryList);

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
            loadRecipes();
            break;
        case 'addRecipe':
            addRecipeSection.classList.add('active');
            showAddRecipeBtn.classList.add('active');
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
        displayRecipes();
    } catch (error) {
        console.error('Error loading recipes:', error);
    }
}

function displayRecipes() {
    if (recipes.length === 0) {
        recipesList.innerHTML = `
            <div class="empty-state">
                <h3>No recipes yet!</h3>
                <p>Add your first recipe to get started.</p>
            </div>
        `;
        return;
    }

    recipesList.innerHTML = recipes.map(recipe => `
        <div class="recipe-card" onclick="showRecipeDetails(${recipe.id})">
            <h3>${recipe.title}</h3>
            <p class="ingredients-count">${recipe.ingredients.length} ingredients</p>
            <div class="actions" onclick="event.stopPropagation()">
                <button class="add-to-grocery-btn" onclick="addIngredientsToGroceryList(${recipe.id})">
                    🛒 Add to Grocery List
                </button>
                <button class="delete-recipe-btn" onclick="deleteRecipe(${recipe.id})">
                    🗑️ Delete
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

function displayGroceryList() {
    if (groceryItems.length === 0) {
        groceryList.innerHTML = `
            <div class="empty-state">
                <h3>Your grocery list is empty!</h3>
                <p>Add ingredients from your recipes to build your shopping list.</p>
            </div>
        `;
        return;
    }

    groceryList.innerHTML = groceryItems.map(item => `
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