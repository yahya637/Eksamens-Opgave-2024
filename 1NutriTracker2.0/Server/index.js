import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import users from './users.js';
import activityRouter from './activity.js';
import mealcreator from './mealcreator.js';
import mealtracker from './mealtracker1.js';
import daily from './daily1.js';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = process.env.PORT || 3000;

app.use(express.json());

app.use(session({
  secret: 'your_secret_key', 
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24} // 1 days in milliseconds 
}));

app.use(express.static(path.join(__dirname, "../Public")));

app.use("/users", users);
app.use("/activities", activityRouter); 
app.use("/mealcreator", mealcreator);
app.use("/mealtracker1", mealtracker);
app.use("/daily", daily);

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
  console.log(`http://localhost:${port}`);
});

export default app