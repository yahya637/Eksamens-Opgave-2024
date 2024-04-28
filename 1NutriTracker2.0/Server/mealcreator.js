import express from 'express';
import { config } from './config.js';
import Database from './database.js';

const router = express.Router();
router.use(express.json());

// Create database object
const database = new Database(config);


router.post('/saveMeal', async (req, res) => {
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