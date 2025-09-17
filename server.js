const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Data storage files
const RECIPES_FILE = 'data/recipes.json';
const GROCERY_LIST_FILE = 'data/grocery-list.json';

// Ensure data directory exists
if (!fs.existsSync('data')) {
    fs.mkdirSync('data');
}

// Initialize data files if they don't exist
if (!fs.existsSync(RECIPES_FILE)) {
    fs.writeFileSync(RECIPES_FILE, JSON.stringify([]));
}

if (!fs.existsSync(GROCERY_LIST_FILE)) {
    fs.writeFileSync(GROCERY_LIST_FILE, JSON.stringify([]));
}

// Helper functions
const readRecipes = () => {
    try {
        const data = fs.readFileSync(RECIPES_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

const writeRecipes = (recipes) => {
    fs.writeFileSync(RECIPES_FILE, JSON.stringify(recipes, null, 2));
};

const readGroceryList = () => {
    try {
        const data = fs.readFileSync(GROCERY_LIST_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

const writeGroceryList = (groceryList) => {
    fs.writeFileSync(GROCERY_LIST_FILE, JSON.stringify(groceryList, null, 2));
};

// Routes

// Get all recipes
app.get('/api/recipes', (req, res) => {
    const recipes = readRecipes();
    res.json(recipes);
});

// Get a specific recipe
app.get('/api/recipes/:id', (req, res) => {
    const recipes = readRecipes();
    const recipe = recipes.find(r => r.id === parseInt(req.params.id));
    if (!recipe) {
        return res.status(404).json({ error: 'Recipe not found' });
    }
    res.json(recipe);
});

// Create a new recipe
app.post('/api/recipes', (req, res) => {
    const { title, ingredients, instructions } = req.body;
    
    if (!title || !ingredients || !instructions) {
        return res.status(400).json({ error: 'Title, ingredients, and instructions are required' });
    }

    const recipes = readRecipes();
    const newRecipe = {
        id: recipes.length > 0 ? Math.max(...recipes.map(r => r.id)) + 1 : 1,
        title,
        ingredients: ingredients.map(ing => ({
            name: ing.name,
            amount: ing.amount || '',
            unit: ing.unit || ''
        })),
        instructions,
        createdAt: new Date().toISOString()
    };

    recipes.push(newRecipe);
    writeRecipes(recipes);
    
    res.status(201).json(newRecipe);
});

// Update a recipe
app.put('/api/recipes/:id', (req, res) => {
    const { title, ingredients, instructions } = req.body;
    
    if (!title || !ingredients || !instructions) {
        return res.status(400).json({ error: 'Title, ingredients, and instructions are required' });
    }

    const recipes = readRecipes();
    const recipeIndex = recipes.findIndex(r => r.id === parseInt(req.params.id));
    
    if (recipeIndex === -1) {
        return res.status(404).json({ error: 'Recipe not found' });
    }

    // Update the recipe while preserving id and createdAt
    const updatedRecipe = {
        ...recipes[recipeIndex],
        title,
        ingredients: ingredients.map(ing => ({
            name: ing.name,
            amount: ing.amount || '',
            unit: ing.unit || ''
        })),
        instructions,
        updatedAt: new Date().toISOString()
    };

    recipes[recipeIndex] = updatedRecipe;
    writeRecipes(recipes);
    
    res.json(updatedRecipe);
});

// Delete a recipe
app.delete('/api/recipes/:id', (req, res) => {
    const recipes = readRecipes();
    const recipeIndex = recipes.findIndex(r => r.id === parseInt(req.params.id));
    
    if (recipeIndex === -1) {
        return res.status(404).json({ error: 'Recipe not found' });
    }

    recipes.splice(recipeIndex, 1);
    writeRecipes(recipes);
    
    res.json({ message: 'Recipe deleted successfully' });
});

// Get grocery list
app.get('/api/grocery-list', (req, res) => {
    const groceryList = readGroceryList();
    res.json(groceryList);
});

// Add ingredients to grocery list
app.post('/api/grocery-list', (req, res) => {
    const { ingredients } = req.body;
    
    if (!ingredients || !Array.isArray(ingredients)) {
        return res.status(400).json({ error: 'Ingredients array is required' });
    }

    const groceryList = readGroceryList();
    
    ingredients.forEach(ingredient => {
        const existingItem = groceryList.find(item => 
            item.name.toLowerCase() === ingredient.name.toLowerCase()
        );
        
        if (existingItem) {
            // If item exists, update amount if provided
            if (ingredient.amount && ingredient.unit) {
                existingItem.amount = ingredient.amount;
                existingItem.unit = ingredient.unit;
            }
        } else {
            // Add new item
            groceryList.push({
                id: groceryList.length > 0 ? Math.max(...groceryList.map(item => item.id)) + 1 : 1,
                name: ingredient.name,
                amount: ingredient.amount || '',
                unit: ingredient.unit || '',
                checked: false,
                addedAt: new Date().toISOString()
            });
        }
    });

    writeGroceryList(groceryList);
    res.json(groceryList);
});

// Update grocery list item (toggle checked status)
app.put('/api/grocery-list/:id', (req, res) => {
    const groceryList = readGroceryList();
    const itemIndex = groceryList.findIndex(item => item.id === parseInt(req.params.id));
    
    if (itemIndex === -1) {
        return res.status(404).json({ error: 'Grocery item not found' });
    }

    const { checked } = req.body;
    groceryList[itemIndex].checked = checked !== undefined ? checked : !groceryList[itemIndex].checked;
    
    writeGroceryList(groceryList);
    res.json(groceryList[itemIndex]);
});

// Delete grocery list item
app.delete('/api/grocery-list/:id', (req, res) => {
    const groceryList = readGroceryList();
    const itemIndex = groceryList.findIndex(item => item.id === parseInt(req.params.id));
    
    if (itemIndex === -1) {
        return res.status(404).json({ error: 'Grocery item not found' });
    }

    groceryList.splice(itemIndex, 1);
    writeGroceryList(groceryList);
    
    res.json({ message: 'Grocery item deleted successfully' });
});

// Clear grocery list
app.delete('/api/grocery-list', (req, res) => {
    writeGroceryList([]);
    res.json({ message: 'Grocery list cleared successfully' });
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Recip-EZ server running on port ${PORT}`);
});