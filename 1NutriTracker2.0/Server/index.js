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

app.use(express.static(path.join(__dirname, "../Public/StartPage/SignUpPage")));
app.use(express.static(path.join(__dirname, "../Public/StartPage/HomePage")));

<<<<<<< Updated upstream

app.use("/items", items); // Route for the right route
=======
app.use("/users", users); // Route for the right route
>>>>>>> Stashed changes
// Start the server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
  console.log(`http://localhost:${port}`);
});




