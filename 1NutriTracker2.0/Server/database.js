import sql from 'mssql';

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

  // CREATE

  async create(data) {
    await this.connect();
    const request = this.poolconnection.request();
    request.input('username', sql.VarChar(50), data.username);
    request.input('email', sql.VarChar(50), data.email);
    request.input('fullName', sql.VarChar(50), data.fullName);
    

    const result = await request.query(
      `INSERT INTO Nutri.Signup (username, email, fullName) VALUES (@username, @email, @fullName)`
    );
    return result.rowsAffected[0];
  }

  // READ ALL

  async readAll() {
    await this.connect();
    const request = this.poolconnection.request();
    const result = await request.query(`SELECT * FROM Nutri.Signup`);
    return result.recordset;
  }

  async read(id) {
    await this.connect();
    const request = this.poolconnection.request();
    const result = await request
      .input('user_id', sql.Int, id)
      .query(`SELECT * FROM Nutri.Signup WHERE user_id = @user_id`);

    return result.recordset[0];
  }

  // UPDATE

  async update(id, data) {
    await this.connect();
    const request = this.poolconnection.request();
    request.input('user_id', sql.Int, id);  // Make sure 'id' is used here, not data.user_id
    request.input('username', sql.VarChar(50), data.username);
    request.input('email', sql.VarChar(50), data.email);
    request.input('fullName', sql.VarChar(50), data.fullName);

    const result = await request.query(
        `UPDATE Nutri.Signup SET username=@username, email=@email, fullName=@fullName WHERE user_id = @user_id`
    );
    return result.rowsAffected[0];
}

// DELETE

  async delete(id) {
    await this.connect();
    const request = this.poolconnection.request();
    request.input('user_id', sql.Int, id);
    const result = await request.query(`DELETE FROM Nutri.Signup WHERE user_id = @user_id`);
    return result.rowsAffected[0];
   }}