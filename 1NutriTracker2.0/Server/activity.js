import express from 'express';
import { config } from './config.js';
import Database from './database.js';

const router = express.Router();

router.use(express.json());     

// Development only - don't do in production
console.log(config);

// From index.js the endpoint is /activities

// Create database object
const database = new Database(config);

// GET  Activities
router.get('/', async (_, res) => {
    try {
      // Fetch activities from the activity tracker
      const activities = await database.getAllActivitiesFromTracker();
      console.log('Activities from fetched successfully!');
      res.status(200).json(activities);
    } catch (err) {
      res.status(500).json({ error: err?.message });
    }
  });
  
  // POST User Activity
  router.post('/', async (req, res) => {
    const userActivityData = req.body;
    console.log(`User Activity Data: ${JSON.stringify(userActivityData)}`);
  
    try {
      // Check if the user exists
      const userExists = await database.userExistsById(userActivityData.user_id);
      if (!userExists) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Insert the user activity into the database
      const rowsAffected = await database.createUserActivity(userActivityData);
      if (rowsAffected > 0) {
        res.status(201).json({ message: 'User activity created' });
      } else {
        res.status(400).json({ message: 'Failed to create user activity' });
      }
    } catch (err) {
      console.error('User Activity Error:', err);
      res.status(500).json({ error: err?.message || 'Server error during user activity creation' });
    }
  });
  
// GET all User Activities
router.get('/all', async (req, res) => {
  try {
    const allUserActivities = await database.getAllUserActivities();
    res.status(200).json(allUserActivities);
  } catch (err) {
    console.error('Error fetching user activities:', err);
    res.status(500).json({ error: err.message || 'Error fetching user activities from the database' });
  }
});


  export default router;