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
    request.input('Email', sql.Char(50), data.Email);
    request.input('fullName', sql.Char(50), data.fullName);

    const result = await request.query(
      `INSERT INTO Nutri.Signup (Email, fullName) VALUES (@Email, @fullName)`
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
      .input('signup_id', sql.Int, id)
      .query(`SELECT * FROM Nutri.Signup WHERE signup_id = @signup_id`);

    return result.recordset[0];
  }

  // UPDATE

  async update(id, data) {
    await this.connect();
    const request = this.poolconnection.request();
    request.input('signup_id', sql.Int, id);
    request.input('Email', sql.Char(50), data.Email);
    request.input('fullName', sql.Char(50), data.fullName);

    const result = await request.query(
      `UPDATE Nutri.Signup SET Email=@Email, fullName=@fullName WHERE signup_id = @signup_id`
    );
    return result.rowsAffected[0];
  }

// DELETE

  async delete(id) {
    await this.connect();
    const request = this.poolconnection.request();
    request.input('signup_id', sql.Int, id);
    const result = await request.query(`DELETE FROM Nutri.Signup WHERE signup_id = @signup_id`);
    return result.rowsAffected[0];
  }
}
