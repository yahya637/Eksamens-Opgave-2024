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
    try {
      console.log(`Database connecting...${this.connected}`);
      console.log(this.config)
      if (this.connected === false) {
        this.poolconnection = await sql.connect(this.config);
        this.connected = true;
        console.log('Database connection successful');
      } else {
        console.log('Database already connected');
      }
    } catch (error) {
      console.error(`Error connecting to database: ${JSON.stringify(error)}`);
      console.log(error)
    }
  }

  async disconnect() {
    try {
      this.poolconnection.close();
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

    request.input('title', sql.Char(50), data.title);
    request.input('priority', sql.Int, data.priority);
    request.input('status', sql.Bit, data.status);
    request.input('responsible', sql.Int, data.responsible);

    const result = await request.query(
      `INSERT INTO todo.todo (title, priority, status,responsible) VALUES (@title, @priority, @status,@responsible)`
    );

    return result.rowsAffected[0];
  }

  // REAL ALL

  async readAll() {
    await this.connect();
    const request = this.poolconnection.request();
    const result = await request.query(`SELECT * FROM todo.todo join todo.responsible on todo.responsible = responsible.person_id`);

    return result.recordsets[0];
  }

  async read(id) {
    await this.connect();

    const request = this.poolconnection.request();
    const result = await request
      .input('id', sql.Int, +id)
      .query(`SELECT * FROM todo.todo WHERE todo_id = @id join todo.responsible on todo.responsible = responsible.person_id`);


    return result.recordset[0];
  }


  // UPDATE

  async update(id, data) {
    await this.connect();

    const request = this.poolconnection.request();

    request.input('id', sql.Int, +id);
    request.input('title', sql.Char(50), data.title);
    request.input('priority', sql.Int, data.priority);
    request.input('status', sql.Bit, data.status);
    request.input('responsible', sql.Int, data.responsible);

    const result = await request.query(
      `UPDATE todo.todo SET title=@title, priority=@priority, status=@status,responsible=@responsible WHERE todo_id = @id` 
    );

    return result.rowsAffected[0];
  }


  // DELETE 

  async delete(id) {
    await this.connect();

    const idAsNumber = Number(id);

    const request = this.poolconnection.request();
    const result = await request
      .input('id', sql.Int, idAsNumber)
      .query(`DELETE FROM todo.todo WHERE todo_id = @id `); 

    return result.rowsAffected[0];
  }
}