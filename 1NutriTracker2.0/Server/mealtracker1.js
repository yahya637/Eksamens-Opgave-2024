import express from 'express';
import { config } from './config.js';
import Database from './database.js';

const router = express.Router();
router.use(express.json());

// Development only - don't do in production
console.log(config);

// Create database object
const database = new Database(config);

// GET user activities by user ID
router.get('/:userId', async (req, res) => {
  const userId = req.params.userId;
  console.log(`Fetching user activities for user ID: ${userId}`);

  try {
      const createdMeals = await database.getAllMealsForMealtrackerByUserId(userId);
      res.status(200).json(createdMeals);
  } catch (err) {
      console.error('Error fetching user meals:', err);
      res.status(500).json({ error: 'Error fetching user meals from the database', details: err.message });
  }
});

// POST new meal
router.post('/:userId/register', async (req, res) => {
  const userId = req.params.userId;
  const intakeDetails = req.body;
  console.log('Creating new intake for user', userId, ':', intakeDetails);

  try {
      // Assuming database.createIntake(userId, intakeDetails) creates a new intake for the user
      const newIntake = await database.createIntake(userId, intakeDetails);
      res.status(201).json(newIntake);
  } catch (err) {
      console.error('Error creating new intake:', err);
      res.status(500).json({ error: 'Error creating new intake in the database', details: err.message });
  }
});

// POST new ingreedient individually
router.post('/:userId/register/ingredient', async (req, res) => {
  const userId = req.params.userId;
  const ingredientDetails = req.body;
  console.log('Creating new ingredient for user', userId, ':', ingredientDetails);

  try {
      const newIngredient = await database.createIngredientIntake(userId, ingredientDetails);
      res.status(201).json(newIngredient);
  } catch (err) {
      console.error('Error creating new ingredient:', err);
      res.status(500).json({ error: 'Error creating new ingredient in the database', details: err.message });
  }
}
);



// GET User meals by user ID, optionally filtered by meal ID
router.get('/:userId/intake', async (req, res) => {
  const userId = req.params.userId;
  const mealId = req.query.mealId; // Obtain mealId from query parameters if it exists

  console.log(`Fetching user meals for user ID: ${userId}`, mealId ? `and meal ID: ${mealId}` : '');

  try {
      const meals = await database.getIntakeMealsByUserId(userId, mealId);
      if (meals.length === 0) {
          console.log('No meals found for this user:', userId);
          return res.status(404).json({ error: 'No meals found for this user' });
      }
      console.log(`Sending back meals data for user ID: ${userId}`, meals);
      res.status(200).json(meals);
  }
  catch (err) {
      console.error('Error fetching user meals:', err);
      res.status(500).json({ error: 'Error fetching user meals from the database', details: err.message });
  }
});

// DELETE meal by Consumed ID
router.delete('/:userId/intake/:consumedId', async (req, res) => {
  const { userId, consumedId } = req.params;
  console.log(`Deleting meal for user ID: ${userId} and consumed ID: ${consumedId}`);

  try {
    const rowsDeleted = await database.deleteIntakeByConsumedId(consumedId);
    if (rowsDeleted > 0) {
      res.status(200).json({ message: "Intake deleted successfully" });
    } else {
      res.status(404).json({ error: "No intake found with the provided ID" });
    }
  } catch (err) {
    console.error('Error deleting meal:', err);
    res.status(500).json({ error: 'Error deleting meal from the database', details: err.message });
  }
});


// PUT update meal by Consumed ID
router.put('/:userId/intake/:consumedId', async (req, res) => {
  const { userId, consumedId } = req.params;
  const updatedIntake = req.body;
  console.log(`Updating meal for user ID: ${userId} and consumed ID: ${consumedId}`);

  try {
      const rowsUpdated = await database.updateIntakeByConsumedId(consumedId, updatedIntake);
      if (rowsUpdated > 0) {
          res.status(200).json({ message: "Intake updated successfully" });
      } else {
          res.status(404).json({ error: "No intake found with the provided ID" });
      }
  } catch (err) {
      console.error('Error updating meal:', err);
      res.status(500).json({ error: 'Error updating meal in the database', details: err.message });
  }
});

router.get('/:userId/water', async (req, res) => {
  const userId = req.params.userId;
  console.log('getting water intake for user', userId);

  try {
      // Assuming database.createIntake(userId, intakeDetails) creates a new intake for the user
      const intake = await database.getWaterIntake(userId);
      res.status(201).json(intake);
  } catch (err) {
      console.error('Error creating new intake:', err);
      res.status(500).json({ error: 'Error creating new intake in the database', details: err.message });
  }
});
  
router.post('/:userId/water', async (req, res) => {
  const userId = req.params.userId;
  const intakeDetails = req.body; // Antages at være i formatet { date: 'YYYY-MM-DD', amount: 250 }

  console.log('Creating water intake', userId);

  try {
    // Opretter et nyt indtag for brugeren
    await database.createWaterIntake(userId, intakeDetails);
    res.status(201).json({ message: 'Water intake created' });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error', detaljer: err.message });
  }
});



  export default router;
