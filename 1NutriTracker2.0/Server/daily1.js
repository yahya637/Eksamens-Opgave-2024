import express from 'express';
import { config } from './config.js';
import Database from './database.js';

const router = express.Router();
router.use(express.json());

// Create database object
const database = new Database(config);


router.get('/userstats/:userId', async (req, res) => {
  const userId = req.params.userId;
  console.log(`Fetching statistics for user ID: ${userId}`);

  try {
      const userStats = await database.getUserStats(userId);
      res.status(200).json(userStats);
  } catch (err) {
      console.error('Error fetching user statistics:', err);
      res.status(500).json({ error: 'Error fetching user statistics from the database', details: err.message });
  }
});




export default router;
