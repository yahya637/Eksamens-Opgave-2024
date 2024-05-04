import express from 'express';
import { config } from './config.js';
import Database from './database.js';

const router = express.Router();
router.use(express.json());

// Create database object
const database = new Database(config);

// GET user activities by user ID
router.get('/:userId', async (req, res) => {
  const userId = req.params.userId;
  console.log(`Fetching meals for user ID: ${userId}`);

  try {
      const createdMeals = await database.getAllMealsForMealtrackerByUserId(userId); // Reusing same function. 
      res.status(200).json(createdMeals);
  } catch (err) {
      console.error('Error fetching user meals:', err);
      res.status(500).json({ error: 'Error fetching user meals from the database', details: err.message });
  }
});


router.post('/saveMeal', async (req, res) => {
  console.log("Received meal data:", req.body); // Check if the data is what you expect
    try {
      const mealData = req.body;
      console.log('Received meal data:', mealData);  // Confirm the structure of received data
  
      const saveResult = await database.saveMeal(mealData);
      if (saveResult.success) {
        res.status(201).json({ message: saveResult.message });
      } else {
        res.status(400).json({ message: saveResult.message });
      }
    } catch (error) {
      console.error('Save meal error:', error);
      res.status(500).json({ error: 'Internal Server Error', detail: error.message });
    }
  });


  router.post('/ingredients', async (req, res) => {
    const { meal_id, foodName, weight, energy, protein, fat, fiber } = req.body;

    try {
        const result = await database.postIngredients(meal_id, foodName, weight, energy, protein, fat, fiber);
        res.status(201).json({ message: 'Ingredient added successfully', success: true });
    } catch (error) {
        console.error('Error posting ingredient:', error);
        res.status(500).json({ message: 'Failed to save ingredient', details: error.message });
    }
});

  

// GET route to fetch ingredients by meal ID
router.get('/ingredients/:mealId', async (req, res) => {
  const mealId = parseInt(req.params.mealId, 10);
  try {
    const ingredients = await database.getIngredientsByMealId(mealId);
    if (!ingredients.length) {
      res.status(404).json({ message: 'No ingredients found for this meal ID' });
    } else {
      res.status(200).json(ingredients);
    }
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});


  
  

export default router;