import express from 'express';
import { config } from './config.js';
import Database from './database.js';

// Import App routes
import users from './users.js'; // File name for the right route

const port = process.env.PORT || 3000; // Port number

const app = express();

import path from 'path';
import { fileURLToPath } from 'url';

// Define __dirname in ES module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Vi skal ændre det her, til /Public
app.use(express.static(path.join(__dirname, "../Public")));
app.use(express.static(path.join(__dirname, "../Public/")));

app.use("/users", users); // Route for the right route
// Start the server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
  console.log(`http://localhost:${port}`);
});





