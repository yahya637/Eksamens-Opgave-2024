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
router.post('/:userId/intake', async (req, res) => {
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


  
  export default router;
