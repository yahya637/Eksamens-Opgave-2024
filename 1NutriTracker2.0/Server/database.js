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

  // READ ALL USER

  async readAll() {
    await this.connect();
    const request = this.poolconnection.request();
    const result = await request.query(`SELECT * FROM Nutri.Users`);
    return result.recordset;
  }

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
    request.input('fullName', sql.VarChar(50), data.fullName);
    request.input('passwordHash', sql.VarChar(256), data.passwordHash); // Assuming you want to update the passwordHash
    request.input('birthdate', sql.Date, data.birthdate);
    request.input('gender', sql.VarChar(10), data.gender);
    request.input('weight', sql.Decimal(5, 2), data.weight);

    const result = await request.query(
      `UPDATE Nutri.Users SET 
        username=@username, 
        email=@email, 
        fullName=@fullName,
        passwordHash=@passwordHash,
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
    await this.connect();  // Ensure the database is connected
    const request = this.poolconnection.request();
    request.input('username', sql.VarChar(50), username);  // Correctly set up the input parameter

    const result = await request.query('SELECT passwordHash, user_id FROM Nutri.Users WHERE username = @username');
    if (result.recordset.length > 0) {
      const { passwordHash, user_id } = result.recordset[0];

      // Check if the passwordHash is actually retrieved and not null
      if (!passwordHash) {
        return { success: false, message: 'No password set for this user.' };
      }

      const isMatch = await bcrypt.compare(password, passwordHash);
      if (isMatch) {
        return { success: true, user_id: user_id };  // Success with user ID
      } else {
        return { success: false, message: 'Invalid credentials' };  // Incorrect password
      }
    } else {
      return { success: false, message: 'User not found' };  // No user found
    }
  } catch (error) {
    console.error('Database connection or query failed:', error);
    return { success: false, message: 'Login failed due to server error' };
  }
}



// DELETE USER

  async delete(id) {
    await this.connect();
    const request = this.poolconnection.request();
    request.input('user_id', sql.Int, id);
    const result = await request.query(`DELETE FROM Nutri.Users WHERE user_id = @user_id`);
    return result.rowsAffected[0];
   }}

 
  

