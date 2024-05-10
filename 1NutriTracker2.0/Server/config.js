import * as dotenv from 'dotenv';
dotenv.config({ path: `.env` });  // Adjust to the correct environment file




const server = process.env.AZURE_SQL_SERVER;
const database = process.env.AZURE_SQL_DATABASE;
const port = parseInt(process.env.AZURE_SQL_PORT);
const user = process.env.AZURE_SQL_USER;
const password = process.env.AZURE_SQL_PASSWORD;


export const config = {
    server: 'prog0803.database.windows.net',
    database: 'NutriTrackerDB',
    port: 1433,
    user: 'Gruppe',
    password: 'sql-1234',
    options: {
        encrypt: true,
        enableArithAbort: true
    }
};


