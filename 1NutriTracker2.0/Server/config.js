import * as dotenv from 'dotenv';
dotenv.config({ path: `.env` }); 

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


