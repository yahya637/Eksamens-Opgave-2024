import express from 'express';
import { config } from './config.js';
import Database from './database.js';

// Import App routes
import items from './items.js'; // File name for the right route

const port = process.env.PORT || 3000; // Port number

const app = express();

import path from 'path';
import { fileURLToPath } from 'url';

// Define __dirname in ES module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.static(path.join(__dirname, "/Eksamens-Opgave-2024/1NutriTracker2.0/Public/StartPage/SignUpPage")));
app.use(express.static(path.join(__dirname, "/Eksamens-Opgave-2024/1NutriTracker2.0/Public/StartPage/HomePage")));


app.use("/items", items); // Route for the right route
// Start the server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
  console.log(`http://localhost:${port}`);
});
// han 



