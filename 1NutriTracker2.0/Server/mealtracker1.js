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
      // Fetch user activities by user ID
      const createdMeals = await database.getAllMealsForMealtrackerByUserId(userId);
      res.status(200).json(createdMeals);
    } catch (err) {
      console.error('Error fetching user meals:', err);
      res.status(500).json({ error: err.message || 'Error fetching user meals  from the database' });
    }
  });
  
  export default router;
