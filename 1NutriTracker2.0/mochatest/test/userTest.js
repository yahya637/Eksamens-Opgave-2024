import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../../Server/index.js'; // Adjust the path as necessary

const should = chai.should();
chai.use(chaiHttp);

// Test for user creation
describe('User Creation', function() {
    describe('POST /users/signuppage', function() {
        it('should create a new user if the user does not already exist', async function() {
            const newUser = {
                username: 'Abekat',
                email: 'Abekat@gmail.com',
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
    });
});

