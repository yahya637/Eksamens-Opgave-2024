import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import users from './users.js';
import activityRouter from './activity.js';
import mealcreator from './mealcreator.js';
import exp from 'constants';


const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = process.env.PORT || 3000;

app.use(express.json());

app.use(session({
  secret: 'your_secret_key', // ÆNDRES??????????????????????
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 * 2 } // maxAge: 2 days in milliseconds (1000ms * 60s * 60m * 24h * 2d)
}));

// Alt nedenunder til næste kommentar skal rettes, fungerer ikke korrekt !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
app.use(express.static(path.join(__dirname, "../Public")));

function ensureLoggedIn(req, res, next) {
  if (req.session.userId) {
    next();
  } else {
    res.redirect('/LogInPage.html');
  }
}

const protectedRoutes = ['/public/MyProfile.html', '/Daily.html', '/public/MealCreator2.0.html', '/ActivityTracker.html', '/public/MealTracker2.0.html'];

protectedRoutes.forEach(route => {
  app.get(route, ensureLoggedIn, (req, res) => {
    const filePath = path.join(__dirname, '../Public', route); // Korrekt sti til offentlige filer
    res.sendFile(filePath, err => {
      if (err) {
        console.error('Error sending file:', err);
        res.status(500).send('Internal Server Error');
      }
    });
  });
});
 // Skal rettes fungerer ikke, man kan stadig komme ind på de forskellige html sider uden at være logget ind !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!


app.use("/users", users);
app.use("/activities", activityRouter); 
app.use("/mealcreator", mealcreator);

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
  console.log(`http://localhost:${port}`);
});
