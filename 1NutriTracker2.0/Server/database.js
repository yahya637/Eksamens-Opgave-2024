import sql from 'mssql';
import bcrypt from 'bcrypt';

export default class Database {
  config = {};
  poolconnection = null;
  connected = false;

  constructor(config) {
    this.config = config;
    console.log(`Database: config: ${JSON.stringify(config)}`);
  }

  async connect() {
    if (!this.poolconnection) { // Only connect if not already connected
        try {
            this.poolconnection = new sql.ConnectionPool(this.config);
            await this.poolconnection.connect();
            this.connected = true;
            console.log('Database connection successful');
        } catch (error) {
            console.error(`Error connecting to database: ${error}`);
            this.connected = false;
        }
    }
}

async disconnect() {
    if (this.poolconnection) {
        try {
            await this.poolconnection.close();
            this.poolconnection = null;
            this.connected = false;
            console.log('Database connection closed');
        } catch (error) {
            console.error(`Error closing database connection: ${error}`);
        }
    }
}

  async executeQuery(query) {
    await this.connect();
    const request = this.poolconnection.request();
    const result = await request.query(query);
    return result.rowsAffected[0];
  }

  // CREATE USER
  async create(data) {
    try {
      await this.connect();
      const request = this.poolconnection.request();

      // Hash the password before storing it
      const saltRounds = 10;  // Adjust saltRounds as needed
      const passwordHash = await bcrypt.hash(data.password, saltRounds);

      // Bind all parameters to the query
      request.input('username', sql.VarChar(50), data.username);
      request.input('email', sql.VarChar(50), data.email);
      request.input('fullName', sql.VarChar(50), data.fullName);
      request.input('passwordHash', sql.VarChar(256), passwordHash);  // Use the hashed password
      request.input('birthdate', sql.Date, data.birthdate);
      request.input('gender', sql.VarChar(10), data.gender);
      request.input('weight', sql.Decimal(5, 2), data.weight);

      // Execute the SQL query
      const result = await request.query(
        `INSERT INTO Nutri.Users (username, email, fullName, passwordHash, birthdate, gender, weight)
           VALUES (@username, @email, @fullName, @passwordHash, @birthdate, @gender, @weight)`
      );

      return result.rowsAffected[0];  // Return the number of rows affected
    } catch (error) {
      console.error('Failed to create user:', error);
      throw new Error('Error creating user in database');
    }
  }

  // CHECK IF USER EXISTS
  async userExists(username, email) {
    try {
      await this.connect();
      const request = this.poolconnection.request();
      request.input('username', sql.VarChar(50), username);
      request.input('email', sql.VarChar(50), email);

      const result = await request.query(`
          SELECT COUNT(*) as count FROM Nutri.Users WHERE username = @username OR email = @email
      `);

      console.log(result.recordset); // Check what's actually returned
      return result.recordset[0].count > 0;
    } catch (error) {
      console.error('Error checking user existence:', error);
      throw error;
    }
  }

  // READ ALL USERS
  async readAll() {
    await this.connect();
    const request = this.poolconnection.request();
    const result = await request.query(`SELECT * FROM Nutri.Users`);
    return result.recordset;
  }

  // READ USER BY ID
  async read(id) {
    await this.connect();
    const request = this.poolconnection.request();
    const result = await request
      .input('user_id', sql.Int, id)
      .query(`SELECT * FROM Nutri.Users WHERE user_id = @user_id`);

    return result.recordset[0];
  }

  // UPDATE USER
  async update(id, data) {
    await this.connect();
    const request = this.poolconnection.request();
    request.input('user_id', sql.Int, id);
    request.input('username', sql.VarChar(50), data.username);
    request.input('email', sql.VarChar(50), data.email);
    request.input('birthdate', sql.Date, data.birthdate);
    request.input('gender', sql.VarChar(10), data.gender);
    request.input('weight', sql.Decimal(5, 2), data.weight);

    const result = await request.query(
      `UPDATE Nutri.Users SET 
        username=@username, 
        email=@email, 
        birthdate=@birthdate,
        gender=@gender,
        weight=@weight
      WHERE user_id = @user_id`
    );
    return result.rowsAffected[0];
  }

  // LOGIN USER
  async loginUser(username, password) {
    try {
      await this.connect();
      const request = this.poolconnection.request();
      request.input('username', sql.VarChar(50), username);

      const result = await request.query('SELECT passwordHash, user_id FROM Nutri.Users WHERE username = @username');
      console.log('Database query result:', result.recordset); // Log result recordset for debugging
      if (result.recordset.length === 0) {
        console.log('No user found for username:', username);
        return { success: false, message: 'User not found' };
      }

      const { passwordHash, user_id } = result.recordset[0];
      console.log('Retrieved user_id:', user_id); // Log user_id for debugging

      if (!passwordHash) {
        console.log('Password hash not found for user:', username);
        return { success: false, message: 'No password set for this user.' };
      }
      const isMatch = await bcrypt.compare(password, passwordHash);
      if (!isMatch) {
        console.log('Password does not match for user:', username);
        return { success: false, message: 'Invalid credentials' };
      }
      return { success: true, user_id: user_id, username: username }; // This is also used for session management and displaying user data on the front-end
    } catch (error) {
      console.error('Database connection or query failed:', error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }

  // DELETE USER
  async delete(id) {
    await this.connect();
    const request = this.poolconnection.request();
    // Bind the user_id parameter to the query
    request.input('user_id', sql.Int, id);
    // It needs to delete user from all tables where user_id is a foreign key
    const result = await request.query(`
      DELETE FROM Nutri.UserActivities WHERE user_id = @user_id;
      DELETE FROM Nutri.Mealcreator WHERE user_id = @user_id;
      DELETE FROM Nutri.BmrCalculations WHERE user_id = @user_id;
      DELETE FROM Nutri.Users WHERE user_id = @user_id;
      DELETE FROM Nutri.consumedMeal WHERE user_id = @user_id;

    `);
    return result.rowsAffected[0];
  }





// GET ACTIVITIES FROM DATABASE
  async getAllActivitiesFromTracker() {
    try {
      await this.connect();
      const request = this.poolconnection.request();

      const result = await request.query(`
      SELECT * FROM Nutri.Activitytracker
    `);

      return result.recordset; // Returner en liste over alle aktiviteter fra Activity Tracker-tabellen
    } catch (error) {
      console.error('Failed to get activities from tracker:', error);
      throw new Error('Error getting activities from tracker in database');
    } finally {
      await this.disconnect();
    }
  }

async userExistsById(userId) {
  try {
    await this.connect();
    const request = this.poolconnection.request();
    request.input('user_id', sql.Int, userId);

    const result = await request.query(`
      SELECT COUNT(*) as count FROM Nutri.Users WHERE user_id = @user_id
    `);

    return result.recordset[0].count > 0;
  } catch (error) {
    console.error('Error checking user existence by ID:', error);
    throw error;
  }
}

// CREATE USER ACTIVITY
async createUserActivity(userActivityData) {
  try {
    await this.connect();
    const request = this.poolconnection.request();
    
    request.input('user_id', sql.Int, userActivityData.user_id);
    request.input('activity_id', sql.Int, userActivityData.activity_id);
    request.input('activity_name', sql.NVarChar, userActivityData.activity_name);
    request.input('duration', sql.Int, userActivityData.duration);
    request.input('total_kcal_burned', sql.Float, userActivityData.total_kcal_burned);

    const result = await request.query(`
      INSERT INTO nutri.UserActivities 
      (user_id, activity_id, activity_name, duration, total_kcal_burned)
      VALUES (@user_id, @activity_id, @activity_name, @duration, @total_kcal_burned)
    `);

    return result.rowsAffected[0]; // Return the number of rows affected
  } catch (error) {
    console.error('Failed to create user activity:', error);
    throw new Error('Error creating user activity in database');
  }
}

// GET ALL USER ACTIVITIES
async getAllUserActivities() {
  try {
    await this.connect();
    const request = this.poolconnection.request();
    const result = await request.query('SELECT * FROM nutri.UserActivities');
    return result.recordset; // Assuming you're using SQL Server
  } catch (error) {
    console.error('Failed to get user activities:', error);
    throw new Error('Error fetching user activities from database');
  }
}

// GET USER ACTIVITIES BY USER ID
async getUserActivitiesByUserId(userId) {
  try {
    await this.connect();
    const request = this.poolconnection.request();
    request.input('user_id', sql.Int, userId);

    const result = await request.query(`
      SELECT * FROM nutri.UserActivities WHERE user_id = @user_id
    `);

    return result.recordset;
  } catch (error) {
    console.error('Error fetching user activities by user ID:', error);
    throw new Error('Error fetching user activities by user ID from database');
  }
}


// SAVE MEAL - MEALCREATOR
async saveMeal(mealData) {
  try {
    await this.connect();

    for (let i = 0; i < mealData.length; i++) {
      const request = this.poolconnection.request();
      console.log("Saving:", mealData[i]);  // Log each meal item

      // Correctly mapping inputs to SQL parameters
      request.input('MealName', sql.VarChar, mealData[i].mealName);
      request.input('calcEnergy100g', sql.Float, mealData[i].totalNutrition.energy);
      request.input('calcProtein100g', sql.Float, mealData[i].totalNutrition.protein);
      request.input('calcFat100g', sql.Float, mealData[i].totalNutrition.fat);
      request.input('calcFiber100g', sql.Float, mealData[i].totalNutrition.fiber);
      request.input('user_id', sql.Int, mealData[i].user_id);  
      request.input('totalMealWeight', sql.Decimal(10, 2), mealData[i].totalMealWeight);

      const query = `
        INSERT INTO Nutri.Mealcreator 
        (MealName, calcEnergy100g, calcProtein100g, calcFat100g, calcFiber100g, user_id, totalMealWeight) 
        VALUES (@MealName, @calcEnergy100g, @calcProtein100g, @calcFat100g, @calcFiber100g, @user_id, @totalMealWeight);
      `;

      await request.query(query);
    }
    return { success: true, message: 'Meal saved successfully' };
  } catch (error) {
    console.error('Failed to save meal:', error);
    throw new Error('Error saving meal in database');
  } finally {
    await this.disconnect();
  }
}


// SAVE BMR CALCULATION
async createBMRData(bmrData) {
  try {
    await this.connect();

    const request = this.poolconnection.request();
    request.input('user_id', sql.Int, bmrData.user_id);
    request.input('bmr_mj', sql.Decimal(6, 2), bmrData.bmr_mj);
    request.input('bmr_kcal', sql.Decimal(8, 2), bmrData.bmr_kcal);
    request.input('calculation_date', sql.Date, bmrData.calculation_date); // Assuming you pass a JS Date object

    const query = `
      INSERT INTO Nutri.BmrCalculations (user_id, bmr_mj, bmr_kcal, calculation_date) 
      VALUES (@user_id, @bmr_mj, @bmr_kcal, @calculation_date);
    `;

    await request.query(query);
    return { success: true, message: 'BMR calculation saved successfully' };
  } catch (error) {
    console.error('Failed to save BMR calculation:', error);
    throw new Error('Error saving BMR calculation in database');
  } finally {
    await this.disconnect();
  }
}

// READ BMR CALCULATION BY USER ID
async getBMRDataByUserId(userId) {
  try {
    await this.connect();
    const request = this.poolconnection.request();
    request.input('user_id', sql.Int, userId);

    const result = await request.query(`
      SELECT * FROM Nutri.BmrCalculations WHERE user_id = @user_id
    `);

    return result.recordset;
  } catch (error) {
    console.error('Error fetching BMR data by user ID:', error);
    throw new Error('Error fetching BMR data by user ID from database');
  } finally {
    await this.disconnect();
  }
}
// GET MEALS BY USER ID - MEALCREATOR
async getAllMealsForMealtrackerBySessionId(userId) {
  await this.connect(); // Assuming this.connect() is defined somewhere to establish a database connection
  const request = this.poolconnection.request();
  request.input('userId', sql.Int, userId);

  const result = await request.query(`
      SELECT * FROM Nutri.Mealcreator WHERE user_Id = @userId
  `);

  return result.recordset;
}


// Mealtracker 

// GET USER MEALS BY USER ID
async getAllMealsForMealtrackerByUserId(userId) {
  try {
    await this.connect();
    const request = this.poolconnection.request();
    request.input('user_id', sql.Int, userId);

    const result = await request.query(`
      SELECT * FROM nutri.Mealcreator WHERE user_id = @user_id
    `);

    return result.recordset;
  } catch (error) {
    console.error('Error fetching meals by user ID:', error);
    throw new Error('Error fetching user meals by user ID from database');
  }
}



// CREATE INTAKE
async createIntake(userId, intakeDetails) {
  try {
    // Ensure database connection
    await this.connect();

    // Prepare SQL query
    const query = `
      INSERT INTO Nutri.consumedMeal (meal_Id, user_Id, mealName, consumedWeight, consumedEnergy, consumedProtein, consumedFat, consumedFiber, dateAdded, timeAdded, location)
      VALUES (@mealId, @userId, @mealName, @consumedWeight, @consumedEnergy, @consumedProtein, @consumedFat, @consumedFiber, @dateAdded, @timeAdded, @location);
    `;

    // Create request
    const request = this.poolconnection.request();

    // Set input parameters
    request.input('mealId', intakeDetails.mealId);
    request.input('userId', userId);
    request.input('mealName', intakeDetails.mealName);
    request.input('consumedWeight', intakeDetails.consumedWeight);
    request.input('consumedEnergy', intakeDetails.consumedEnergy);
    request.input('consumedProtein', intakeDetails.consumedProtein);
    request.input('consumedFat', intakeDetails.consumedFat);
    request.input('consumedFiber', intakeDetails.consumedFiber);
    request.input('dateAdded', intakeDetails.dateAdded);
    request.input('timeAdded', intakeDetails.timeAdded);
    request.input('location', intakeDetails.location);

    // Execute query
    const result = await request.query(query);

    // Return the inserted record (optional)
    return result.recordset;
  } catch (error) {
    console.error('Error creating intake:', error);
    throw error; // Rethrow the error for handling at a higher level
  }
}

// GET INTAKE BY USER ID
// GET INTAKE BY USER ID
async getIntakeMealsByUserId(userId, mealId = null) {
  try {
    await this.connect();
    const request = this.poolconnection.request();
    request.input('userId', sql.Int, userId);

    let sqlQuery = "SELECT * FROM Nutri.consumedMeal WHERE user_Id = @userId";

    if (mealId) {
      request.input('mealId', sql.Int, mealId);
      sqlQuery += " AND meal_Id = @mealId";
    }

    sqlQuery += " ORDER BY dateAdded DESC";

    const result = await request.query(sqlQuery);
    return result.recordset;
  } catch (error) {
    console.error('Error fetching intake by user ID:', error);
    throw new Error('Error fetching intake by user ID from database');
  }
}



}



