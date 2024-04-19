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

router.post('/', async (req, res) => {
  try {
    // Create a signup entry
    const signupData = req.body;
    console.log(`Signup Data: ${JSON.stringify(signupData)}`);
    const rowsAffected = await database.create(signupData);
    res.status(201).json({ rowsAffected });
  } catch (err) {
    res.status(500).json({ error: err?.message });
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
