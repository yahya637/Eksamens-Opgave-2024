import { expect, assert } from 'chai';
import sinon from 'sinon';
import sql from 'mssql';  // Necessary import of sql
import bcrypt from 'bcrypt';  // Necessary import of bcrypt
import { config } from './config';  // Updated path to config file
import Database from './database.js';  // Updated path to database file

describe('Database Login Tests', function() {
    let database;
    let sandbox;

    beforeEach(function() {
        database = new Database(config);
        sandbox = sinon.createSandbox();
        // Setup stubs here
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

    // ALLOW CORRECT LOGIN
    it('should allow a user with correct username and password to log in', async function() {
        const queryResult = {
            recordset: [{ passwordHash: '$2b$10$$2b$10$o784o6gj82fRCaZmdXZqTeto9LOffcQ0wxv2dSpqaAh6D', user_id: 6 }]
        };
        sql.ConnectionPool().request().query.resolves(queryResult);
        bcrypt.compare.resolves(true);  // Ensure bcrypt comparison returns true

        const result = await database.loginUser('validUser', 'correctPassword');
        expect(result.success).to.be.true;
    });

    // DENY LOGIN WITH INCORRECT PASSWORD
    it('should deny access with correct username and incorrect password', async function() {
        const queryResult = {
            recordset: [{ passwordHash: '$2b$10$o784o6gj82fRCaZmdXZqTeto9LOffcQ0wxv2dSpqaAh6D', user_id: 6 }]
        };
        sql.ConnectionPool().request().query.resolves(queryResult);
        bcrypt.compare.resolves(false);  // bcrypt comparison returns false

        const result = await database.loginUser('validUser', 'wrongPassword');
        expect(result.success).to.be.false;
        expect(result.message).to.equal('Invalid credentials');
    });
});

beforeEach(function() {
    database = new Database(config);
    sandbox = sinon.createSandbox();
    const requestStub = {
        input: sinon.stub().returnsThis(),
        query: sinon.stub()
    };
    requestStub.query.resolves({ recordset: [{ passwordHash: '$2b$10$$2b$10$o784o6gj82fRCaZmdXZqTeto9LOffcQ0wxv2dSpqaAh6D', user_id: 6 }] });
    const connectionStub = {
        connect: sinon.stub().resolves(),
        request: () => requestStub,
        close: sinon.stub().resolves()
    };
    sandbox.stub(sql, 'ConnectionPool').returns(connectionStub);
    sandbox.stub(bcrypt, 'compare');
});

it('should allow a user with correct username and password to log in', async function() {
    bcrypt.compare.resolves(true);
    const result = await database.loginUser('validUser', 'correctPassword');
    expect(result.success).to.be.true;
});
