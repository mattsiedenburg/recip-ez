# Recip-EZ 🍳

A simple and elegant recipe management application with grocery list functionality. Built with Node.js, Express, and vanilla JavaScript.

<img width="3810" height="3120" alt="Screenshot 2025-09-17 at 16-20-28 Recip-EZ - Recipe Manager" src="https://github.com/user-attachments/assets/81add5c5-0273-4560-bc2f-5d7be72bb7ab" />


## Features ✨

- **Recipe Management**: Add, view, and delete recipes with ingredients and instructions
- **Smart Grocery Lists**: Automatically add recipe ingredients to your shopping list
- **Interactive UI**: Clean, responsive design with intuitive navigation
- **Docker Support**: Easy deployment with Docker containers
- **Persistent Storage**: JSON-based data storage for recipes and grocery lists

## Quick Start 🚀

### Running with Docker (Recommended)

```bash
# Build the Docker image
docker build -t recip-ez .

# Run the container
docker run -p 3000:3000 recip-ez
```

Or use Docker Compose:

```bash
docker-compose up
```

### Running Locally

```bash
# Install dependencies
npm install

# Start the application
npm start

# For development with auto-reload
npm run dev
```

The application will be available at `http://localhost:3000`

## How to Use 📖

### Adding Recipes
1. Click on "➕ Add Recipe"
2. Fill in the recipe title, ingredients (name, amount, unit), and instructions
3. Click "Save Recipe"

### Managing Grocery Lists
1. View your recipes and click "🛒 Add to Grocery List" on any recipe
2. Navigate to "🛒 Grocery List" to see all items
3. Check off items as you shop
4. Remove individual items or clear the entire list

### Viewing Recipe Details
- Click on any recipe title to see the full details including ingredients and step-by-step instructions

## API Endpoints 🔌

The application provides a RESTful API:

### Recipes
- `GET /api/recipes` - Get all recipes
- `GET /api/recipes/:id` - Get a specific recipe
- `POST /api/recipes` - Create a new recipe
- `DELETE /api/recipes/:id` - Delete a recipe

### Grocery List
- `GET /api/grocery-list` - Get grocery list
- `POST /api/grocery-list` - Add ingredients to grocery list
- `PUT /api/grocery-list/:id` - Update grocery item (toggle checked)
- `DELETE /api/grocery-list/:id` - Remove grocery item
- `DELETE /api/grocery-list` - Clear entire grocery list

## Technical Details 🛠️

### Stack
- **Backend**: Node.js with Express
- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Storage**: JSON files (persistent across container restarts)
- **Containerization**: Docker with Alpine Linux

### Project Structure
```
recip-ez/
├── server.js              # Express server and API routes
├── package.json            # Node.js dependencies and scripts
├── public/                 # Frontend assets
│   ├── index.html         # Main HTML file
│   ├── style.css          # Styling
│   └── script.js          # Frontend JavaScript
├── data/                   # JSON storage (created automatically)
│   ├── recipes.json       # Recipe data
│   └── grocery-list.json  # Grocery list data
├── Dockerfile             # Docker configuration
├── docker-compose.yml     # Docker Compose setup
└── README.md              # This file
```

## Development 👨‍💻

### Prerequisites
- Node.js 18+ 
- Docker (for containerized deployment)

### Scripts
- `npm start` - Start the production server
- `npm run dev` - Start development server with auto-reload
- `npm test` - Run tests (placeholder)

### Environment Variables
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment mode (development/production)

## Contributing 🤝

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License 📄

MIT License - see [LICENSE](LICENSE) file for details.

## Future Enhancements 🎯

- Recipe search and filtering
- Recipe categories and tags
- Recipe sharing functionality
- Meal planning features
- Mobile app version
- Database integration (PostgreSQL/MongoDB)
- User authentication and multi-user support
- Recipe import from URLs
- Nutrition information
- Recipe photos
