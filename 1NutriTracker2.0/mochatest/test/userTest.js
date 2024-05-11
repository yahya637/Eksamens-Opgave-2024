import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../../Server/index.js';

const should = chai.should();
chai.use(chaiHttp);

describe('User Creation', function() {
    describe('POST /users/signuppage', function() {
        it('should create a new user if the user does not already exist', async function() {
            const newUser = {
                username: 'Hej2',
                email: 'hej@gmail.com2',
                password: 'password',
                fullName: 'Test User',
                birthdate: '1900-01-01',
                gender: 'Male',
                weight: 75
            };

            const res = await chai.request(server)
                .post('/users/signuppage')
                .send(newUser);

            res.should.have.status(201);
            res.body.should.be.an('object');
            res.body.should.have.property('message').eql('Signup successful!');
        });

        it('should not create a user if the username or email already exists', async function() {
            const existingUser = {
                username: 'ExistingUser',
                email: 'existing@gmail.com',
                password: 'password123',
                fullName: 'Existing User',
                birthdate: '1985-05-15',
                gender: 'Female',
                weight: 65
            };

            const res = await chai.request(server)
                .post('/users/signuppage')
                .send(existingUser);

            res.should.have.status(409);
            res.body.should.be.an('object');
            res.body.should.have.property('message').eql('Username or email already exists');
        });
        it('should not create a user if required fields are missing', async function() {
            const incompleteUser = {
                email: 'newuser@example.com',
                fullName: 'Incomplete User',
                birthdate: '1990-01-01',
                gender: 'male',
                weight: 70
            };

            const res = await chai.request(server)
                .post('/users/signuppage')
                .send(incompleteUser);

            res.should.have.status(400);
            res.body.should.be.an('object');
            res.body.should.have.property('message').eql('Please fill in all required fields!');
        });
    });
});
        
    
