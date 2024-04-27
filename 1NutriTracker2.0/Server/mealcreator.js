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
      // Log received data for debugging purposes
      // console.log('Received meal data:', mealData);
  
      const saveResult = await database.saveMeal(mealData);
      if (saveResult.success) {
        res.status(201).json({ message: saveResult.message });
      } else {
        // Include the failure message in the response for debugging
        res.status(400).json({ message: saveResult.message });
      }
    } catch (error) {
      console.error('Save meal error:', error);
      // Send back a detailed error message in development environment for debugging
      // Make sure to disable or remove detailed errors in production for security reasons
      res.status(500).json({ error: 'Internal Server Error', detail: error.message });
    }
  });
  
  

export default router;