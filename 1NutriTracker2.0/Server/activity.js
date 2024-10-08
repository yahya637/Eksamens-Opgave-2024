import express from 'express';
import { config } from './config.js';
import Database from './database.js';

const router = express.Router();

router.use(express.json());     

const database = new Database(config);

// GET  Activities
router.get('/', async (_, res) => {
    try {
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

// GET user activities by user ID
router.get('/:userId', async (req, res) => {
  const userId = req.params.userId;
  console.log(`Fetching user activities for user ID: ${userId}`);

  try {
    // Fetch user activities by user ID
    const userActivities = await database.getUserActivitiesByUserId(userId);
    res.status(200).json(userActivities);
  } catch (err) {
    console.error('Error fetching user activities:', err);
    res.status(500).json({ error: err.message || 'Error fetching user activities from the database' });
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




// POST User BMR Calculations
router.post('/bmr', async (req, res) => {
  const bmrData = req.body;
  console.log(`BMR Data: ${JSON.stringify(bmrData)}`);

  try {
    const userExists = await database.userExistsById(bmrData.user_id);
    if (!userExists) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Insert the BMR calculations into the database
    const result = await database.createBMRData(bmrData);
    if (result.success) {
      res.status(201).json({ message: 'BMR calculations created' });
    } else {
      res.status(400).json({ message: result.error || 'Failed to create BMR calculations' });
    }
  } catch (err) {
    console.error('BMR Error:', err);
    res.status(500).json({ error: 'Server error during BMR calculations creation' });
  }
});

// GET BMR Calculations by user ID
router.get('/bmr/:userId', async (req, res) => {
  const userId = req.params.userId;
  console.log(`Fetching BMR calculations for user ID: ${userId}`);

  try {
    // Fetch BMR calculations by user ID
    const bmrCalculations = await database.getBMRDataByUserId(userId);
    res.status(200).json(bmrCalculations);
  } catch (err) {
    console.error('Error fetching BMR calculations:', err);
    res.status(500).json({ error: 'Error fetching BMR calculations from the database' });
  }
});

export default router;
