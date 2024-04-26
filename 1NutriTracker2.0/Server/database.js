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
    if (!this.connected) {
      try {
        this.poolconnection = await sql.connect(this.config);
        this.connected = true;
        console.log('Database connection successful');
      } catch (error) {
        console.error(`Error connecting to database: ${JSON.stringify(error)}`);
        this.connected = false;
      }
    } else {
      console.log('Database already connected');
    }
  }

  async disconnect() {
    try {
      this.poolconnection.close();
      this.connected = false;
      console.log('Database connection closed');
    } catch (error) {
      console.error(`Error closing database connection: ${error}`);
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
    request.input('user_id', sql.Int, id);
    const result = await request.query(`DELETE FROM Nutri.Users WHERE user_id = @user_id`);
    return result.rowsAffected[0];
  }

  // Actibity Tracker

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


  async saveMeal(mealData) {
    try {
      await this.connect();
      

      mealData = mealData.data;
      mealData = JSON.parse(mealData);

      for (let i = 0; i < mealData.length; i++) {
        const request = this.poolconnection.request();
        console.log(mealData[i])
        request.input('MealName', sql.VarChar, mealData[i].mealName);
        request.input('calcEnergy100g', sql.Float, mealData[i].totalNutrition.energy);

        const query = `
        INSERT INTO Nutri.Mealcreator (MealName, calcEnergy100g, calcProtein100g, calcFat100g, calcFiber100g, User_id) 
        VALUES (@MealName, @calcEnergy100g, 1, 1, 1, 16);
      `;
  
        await request.query(query);
  
      
      }

      return { success: true, message: 'Meal data saved successfully' };
    } catch (error) {
      console.error('Save meal error:', error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }
}