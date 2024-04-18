import express from 'express';
import { config } from './config.js';
import Database from './database.js';

// Import App routes
import items from './items.js';

const port = process.env.PORT || 3000;

const app = express();

// Connect App routes
app.use('/signup', items);

// Start the server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
