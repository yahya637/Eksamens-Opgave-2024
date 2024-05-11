import express from 'express';
import { config } from './config.js';
import Database from './database.js';

const router = express.Router();
router.use(express.json());

const database = new Database(config);

router.get('/', async (_, res) => {
  try {
    // Return a list of signups
    const signups = await database.readAll();
    console.log(`Signups: ${JSON.stringify(signups)}`);
    res.status(200).json(signups);
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});

router.post('/signuppage', async (req, res) => {
  const { username, email, password, fullName, birthdate, gender, weight } = req.body;
  console.log(`Signup Data: ${JSON.stringify(req.body)}`);

  // Check if all required fields are filled
  if (!username || !email || !password || !fullName || !birthdate || !gender || !weight) {
      return res.status(400).json({ message: 'Please fill in all required fields!' });
  }

  try {
      // Check if user already exists
      const exists = await database.userExists(username, email);
      if (exists) {
          return res.status(409).json({ message: 'Username or email already exists' });
      }

      const rowsAffected = await database.create(req.body);
      if (rowsAffected > 0) {
          res.status(201).json({ message: 'Signup successful!' });
      } else {
          res.status(400).json({ message: 'Signup failed' });
      }
  } catch (err) {
      console.error('Signup Error:', err);
      res.status(500).json({ error: err?.message || 'Server error during signup' });
  }
});



// users.js post login endpoint
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const loginResult = await database.loginUser(username, password);
    if (loginResult.success) {
      req.session.userId = loginResult.user_id;  
      req.session.username = loginResult.username;
      res.status(200).json({ message: 'Login successful', username: loginResult.username, user_id: loginResult.user_id });  
    } else {
      res.status(401).json({ message: loginResult.message });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get('/:id', async (req, res) => {
  try {
    // Get the signup entry with the specified ID
    const signupId = req.params.id;
    console.log(`User ID: ${signupId}`);
    if (signupId) {
      const result = await database.read(signupId);
      console.log(`User: ${JSON.stringify(result)}`);
      if (result) {
        res.status(200).json(result);
      } else {
        res.status(404).json({ message: "UserID not found" });
      }
    } else {
      res.status(404).json({ message: "Invalid ID" });
    }
  } catch (err) {
    console.error(`Error fetching user data: ${err.message}`, err);
    res.status(500).json({ error: err.message || "An unexpected error occurred" });
  }
});

router.put('/:id', async (req, res) => {
  try {
    // Update the signup entry with the specified ID
    const signupId = req.params.id;
    const signupData = req.body;
    if (signupId && signupData) {
      const rowsAffected = await database.update(signupId, signupData);
      res.status(200).json({ rowsAffected });
    } else {
      res.status(404).json({ message: "Invalid request" });
    }
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});

router.delete('/:id', async (req, res) => {
  const userId = req.params.id; 
  console.log("Requested User ID:", userId);

  try {
    const rowsAffected = await database.delete(userId);
    if (rowsAffected > 0) {
      res.status(204).end(); 
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    console.error("Deletion error:", err); 
    res.status(500).json({ error: err.message || 'Error during deletion' });
  }
});

// DELETE endpoint for user route
router.delete('/:id', async (req, res) => {
  const userId = req.params.id;
  const userExists = await database.checkUserExists(userId); 

  if (!userExists) {
      return res.status(404).send('User not found');
  }

  const deleteResult = await database.deleteUser(userId); 
  if (deleteResult) {
      res.status(204).send();
  } else {
      res.status(500).send('Error deleting user');
  }
});



export default router;