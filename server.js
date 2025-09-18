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

// Helper functions - Centralized file operations and validation
const fileOps = {
    readRecipes() {
        try {
            const data = fs.readFileSync(RECIPES_FILE, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error reading recipes:', error);
            return [];
        }
    },

    writeRecipes(recipes) {
        try {
            fs.writeFileSync(RECIPES_FILE, JSON.stringify(recipes, null, 2));
        } catch (error) {
            console.error('Error writing recipes:', error);
            throw error;
        }
    },

    readGroceryList() {
        try {
            const data = fs.readFileSync(GROCERY_LIST_FILE, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error reading grocery list:', error);
            return [];
        }
    },

    writeGroceryList(groceryList) {
        try {
            fs.writeFileSync(GROCERY_LIST_FILE, JSON.stringify(groceryList, null, 2));
        } catch (error) {
            console.error('Error writing grocery list:', error);
            throw error;
        }
    }
};

const validation = {
    validateRecipe(title, ingredients, instructions) {
        if (!title || !ingredients || !instructions) {
            return { isValid: false, error: 'Title, ingredients, and instructions are required' };
        }
        return { isValid: true };
    },

    validateGroceryIngredients(ingredients) {
        if (!ingredients || !Array.isArray(ingredients)) {
            return { isValid: false, error: 'Ingredients array is required' };
        }
        return { isValid: true };
    },

    processIngredients(ingredients) {
        return ingredients.map(ing => ({
            name: ing.name,
            amount: ing.amount || '',
            unit: ing.unit || ''
        }));
    }
};

// Routes - Optimized with centralized validation and error handling

// Get all recipes
app.get('/api/recipes', (req, res) => {
    try {
        const recipes = fileOps.readRecipes();
        res.json(recipes);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load recipes' });
    }
});

// Get a specific recipe
app.get('/api/recipes/:id', (req, res) => {
    try {
        const recipes = fileOps.readRecipes();
        const recipe = recipes.find(r => r.id === parseInt(req.params.id));
        if (!recipe) {
            return res.status(404).json({ error: 'Recipe not found' });
        }
        res.json(recipe);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load recipe' });
    }
});

// Create a new recipe
app.post('/api/recipes', (req, res) => {
    const { title, ingredients, instructions, tags } = req.body;
    
    const validation_result = validation.validateRecipe(title, ingredients, instructions);
    if (!validation_result.isValid) {
        return res.status(400).json({ error: validation_result.error });
    }

    try {
        const recipes = fileOps.readRecipes();
        const newRecipe = {
            id: recipes.length > 0 ? Math.max(...recipes.map(r => r.id)) + 1 : 1,
            title,
            ingredients: validation.processIngredients(ingredients),
            instructions,
            tags: tags || [], // Include tags with empty array as default
            createdAt: new Date().toISOString()
        };

        recipes.push(newRecipe);
        fileOps.writeRecipes(recipes);
        
        res.status(201).json(newRecipe);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create recipe' });
    }
});

// Update a recipe
app.put('/api/recipes/:id', (req, res) => {
    const { title, ingredients, instructions, tags } = req.body;
    
    const validation_result = validation.validateRecipe(title, ingredients, instructions);
    if (!validation_result.isValid) {
        return res.status(400).json({ error: validation_result.error });
    }

    try {
        const recipes = fileOps.readRecipes();
        const recipeIndex = recipes.findIndex(r => r.id === parseInt(req.params.id));
        
        if (recipeIndex === -1) {
            return res.status(404).json({ error: 'Recipe not found' });
        }

        // Update the recipe while preserving id and createdAt
        const updatedRecipe = {
            ...recipes[recipeIndex],
            title,
            ingredients: validation.processIngredients(ingredients),
            instructions,
            tags: tags || [], // Include tags with empty array as default
            updatedAt: new Date().toISOString()
        };

        recipes[recipeIndex] = updatedRecipe;
        fileOps.writeRecipes(recipes);
        
        res.json(updatedRecipe);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update recipe' });
    }
});

// Delete a recipe
app.delete('/api/recipes/:id', (req, res) => {
    try {
        const recipes = fileOps.readRecipes();
        const recipeIndex = recipes.findIndex(r => r.id === parseInt(req.params.id));
        
        if (recipeIndex === -1) {
            return res.status(404).json({ error: 'Recipe not found' });
        }

        recipes.splice(recipeIndex, 1);
        fileOps.writeRecipes(recipes);
        
        res.json({ message: 'Recipe deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete recipe' });
    }
});

// Get grocery list
app.get('/api/grocery-list', (req, res) => {
    try {
        const groceryList = fileOps.readGroceryList();
        res.json(groceryList);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load grocery list' });
    }
});

// Add ingredients to grocery list
app.post('/api/grocery-list', (req, res) => {
    const { ingredients } = req.body;
    
    const validation_result = validation.validateGroceryIngredients(ingredients);
    if (!validation_result.isValid) {
        return res.status(400).json({ error: validation_result.error });
    }

    try {
        const groceryList = fileOps.readGroceryList();
        
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

        fileOps.writeGroceryList(groceryList);
        res.json(groceryList);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add ingredients to grocery list' });
    }
});

// Update grocery list item (toggle checked status)
app.put('/api/grocery-list/:id', (req, res) => {
    try {
        const groceryList = fileOps.readGroceryList();
        const itemIndex = groceryList.findIndex(item => item.id === parseInt(req.params.id));
        
        if (itemIndex === -1) {
            return res.status(404).json({ error: 'Grocery item not found' });
        }

        const { checked } = req.body;
        groceryList[itemIndex].checked = checked !== undefined ? checked : !groceryList[itemIndex].checked;
        
        fileOps.writeGroceryList(groceryList);
        res.json(groceryList[itemIndex]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update grocery item' });
    }
});

// Toggle grocery item checked status
app.put('/api/grocery-list/:id/toggle', (req, res) => {
    try {
        const groceryList = fileOps.readGroceryList();
        const itemIndex = groceryList.findIndex(item => item.id === parseInt(req.params.id));
        
        if (itemIndex === -1) {
            return res.status(404).json({ error: 'Grocery item not found' });
        }

        groceryList[itemIndex].checked = !groceryList[itemIndex].checked;
        fileOps.writeGroceryList(groceryList);
        
        res.json(groceryList[itemIndex]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to toggle grocery item' });
    }
});

// Remove checked grocery items (must come before /:id route)
app.delete('/api/grocery-list/checked', (req, res) => {
    try {
        const groceryList = fileOps.readGroceryList();
        const uncheckedItems = groceryList.filter(item => !item.checked);
        const removedCount = groceryList.length - uncheckedItems.length;
        
        fileOps.writeGroceryList(uncheckedItems);
        
        res.json({ 
            message: `${removedCount} checked item(s) removed successfully`,
            removedCount 
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove checked items' });
    }
});

// Delete grocery list item
app.delete('/api/grocery-list/:id', (req, res) => {
    try {
        const groceryList = fileOps.readGroceryList();
        const itemIndex = groceryList.findIndex(item => item.id === parseInt(req.params.id));
        
        if (itemIndex === -1) {
            return res.status(404).json({ error: 'Grocery item not found' });
        }

        groceryList.splice(itemIndex, 1);
        fileOps.writeGroceryList(groceryList);
        
        res.json({ message: 'Grocery item deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete grocery item' });
    }
});

// Clear grocery list
app.delete('/api/grocery-list', (req, res) => {
    try {
        fileOps.writeGroceryList([]);
        res.json({ message: 'Grocery list cleared successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to clear grocery list' });
    }
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Recip-EZ server running on port ${PORT}`);
});