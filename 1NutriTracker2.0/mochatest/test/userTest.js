import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../../Server/index.js'; // Adjust the path as necessary

const should = chai.should();
chai.use(chaiHttp);

describe('User Deletion', function() {
    describe('DELETE /users/:id', function() {
        it('should DELETE a user given the id', async function() {
            const userId = 13; // Example user ID, replace with a valid one for your tests
            try {
                const res = await chai.request(server)
                    .delete(`/users/${userId}`);

                res.should.have.status(204);
            } catch (error) {
                console.error('Test error:', error);
                throw error; // This will ensure the test fails with a clear message
            }
        });
    });
});
