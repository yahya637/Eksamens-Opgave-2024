import express from 'express';
import { config } from './config.js';
import Database from './database.js';

const router = express.Router();
router.use(express.json());

// Development only - don't do in production
console.log(config);

// Create database object
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
  const signupData = req.body;
  console.log(`Signup Data: ${JSON.stringify(signupData)}`);

  try {
      // Check if user already exists
      const exists = await database.userExists(signupData.username, signupData.email);
      if (exists) {
          return res.status(409).json({ message: 'Username or email already exists' });
      }

      const rowsAffected = await database.create(signupData);
      if (rowsAffected > 0) {
          res.status(201).json({ message: 'Signup successful!' });
      } else {
          // If no rows were affected, it means the user was not created.
          res.status(400).json({ message: 'Signup failed' });
      }
  } catch (err) {
      console.error('Signup Error:', err);
      res.status(500).json({ error: err?.message || 'Server error during signup' });
  }
});


// I users.js
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const loginResult = await database.loginUser(username, password);
    if (loginResult.success) {
      req.session.userId = loginResult.user_id;  
      req.session.username = loginResult.username;
      res.status(200).json({ message: 'Login successful', username: loginResult.username, user_id: loginResult.user_id });  // Tilføj user_id til respons
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
  const userId = req.params.id; // Forsikre dig om, at dette er den korrekte type (string eller number)
  const sessionUserId = req.session.userId; // Samme som ovenfor

  console.log("Session User ID:", sessionUserId, "Requested User ID:", userId);

  if (String(userId) !== String(sessionUserId)) {
    return res.status(403).json({ message: "Unauthorized to delete this profile" });
  }

  try {
    const rowsAffected = await database.delete(userId);
    if (rowsAffected > 0) {
      res.status(204).end(); // Ingen content at sende tilbage, men succes
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});


// FUNGERER IKKE DETTE VIRKER IKKE !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// Middleware til at tjekke om brugeren er logget ind
function ensureLoggedIn(req, res, next) {
  if (req.session.userId) {
      next();
  } else {
      res.redirect('../NutriHome.html'); 
  }
}

// Brug dette middleware på beskyttede routes DETTE VIRKER IKKE !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
router.get('/protected-route', ensureLoggedIn, (req, res) => {
  res.send('This is a protected content.');
});


export default router;