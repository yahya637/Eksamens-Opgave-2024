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

import bcrypt from 'bcrypt'; // for hashing passwords

router.post('/signuppage', async (req, res) => {
  try {
    const { username, email, fullName, password } = req.body; // 
    const hashedPassword = await bcrypt.hash(password, 10); // 10

    const signupData = { username, email, fullName, password: hashedPassword };
    console.log(`Signup Data: ${JSON.stringify(signupData)}`);
    const rowsAffected = await database.create(signupData);

    res.status(201).json({ rowsAffected });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await database.getUserByUsername(username); // Assume this function retrieves user data by username

    if (user && await bcrypt.compare(password, user.password)) {
      // Passwords match
      // Here you can create a session or token to keep the user logged in
      res.status(200).json({ message: "Login successful" });
    } else {
      // Passwords do not match or user does not exist
      res.status(401).json({ error: "Invalid username or password" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err?.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    // Update the signup entry with the specified ID
    const signupId = req.params.id;
    const signupData = req.body;
    console.log(`Updating User ID: ${signupId} with Data: ${JSON.stringify(signupData)}`);

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
  try {
    // Delete the signup entry with the specified ID
    const signupId = req.params.id;
    console.log(`Deleting USER ID: ${signupId}`);

    if (signupId) {
      const rowsAffected = await database.delete(signupId);
      res.status(204).json({ rowsAffected });
    } else {
      res.status(404).json({ message: "Invalid ID" });
    }
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});

export default router;
