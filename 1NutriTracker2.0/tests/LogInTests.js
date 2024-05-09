import chai from 'chai';
import sinon from 'sinon';
import sql from 'mssql';  // Tilføjer nødvendig import af sql
import bcrypt from 'bcrypt';  // Tilføjer nødvendig import af bcrypt
import { config } from '../Server/config.js';  // Opdateret sti til config fil
import Database from '../Server/database.js';  // Opdateret sti til database fil

const expect = chai.expect;

describe('Database Login Tests', function() {
    let database;
    let sandbox;

    beforeEach(function() {
        database = new Database(config);
        sandbox = sinon.createSandbox();
        // Setup stubs her
        sandbox.stub(sql, 'ConnectionPool').returns({
            connect: sinon.stub().resolves(),
            request: () => ({ input: sinon.stub().returnsThis(), query: sinon.stub() }),
            close: sinon.stub().resolves()
        });
        sandbox.stub(bcrypt, 'compare');
    });

    afterEach(function() {
        sandbox.restore();
    });

    // TILLAD KORREKT LOGIN
    it('should allow a user with correct username and password to log in', async function() {
        const queryResult = {
            recordset: [{ passwordHash: '$2b$10$examplehash', user_id: 1 }]
        };
        sql.ConnectionPool().request().query.resolves(queryResult);
        bcrypt.compare.resolves(true);  // Sikre at bcrypt sammenligningen returnerer sand

        const result = await database.loginUser('validUser', 'correctPassword');
        expect(result.success).to.be.true;
    });

    // AFVIS LOGIN VED FORKERT ADGANGSKODE
    it('should deny access with correct username and incorrect password', async function() {
        const queryResult = {
            recordset: [{ passwordHash: '$2b$10$examplehash', user_id: 1 }]
        };
        sql.ConnectionPool().request().query.resolves(queryResult);
        bcrypt.compare.resolves(false);  // bcrypt sammenligningen returnerer falsk

        const result = await database.loginUser('validUser', 'wrongPassword');
        expect(result.success).to.be.false;
        expect(result.message).to.equal('Invalid credentials');
    });
});
