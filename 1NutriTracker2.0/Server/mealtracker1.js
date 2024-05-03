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



  
  export default router;
