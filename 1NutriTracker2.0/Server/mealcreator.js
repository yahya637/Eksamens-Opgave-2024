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
  console.log(`Fetching user activities for user ID: ${userId}`);

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
  
  

export default router;