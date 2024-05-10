import assert from 'assert';
import ensureLoggedIn from '../Server/index.js';

describe('ensureLoggedIn', () => {
  it('should redirect to /LogInPage.html if req.session.userId is falsy', () => {
    const req = { session: { userId: undefined } };
    const res = {
      redirect: (url) => {
        assert.strictEqual(url, '/LogInPage.html');
      }
    };
    ensureLoggedIn(req, res, () => {});
  });

  it('should call next if req.session.userId is truthy', () => {
    const req = { session: { userId: 1 } };
    const res = {
      redirect: (url) => {
        throw new Error('redirect should not be called');
      }
    };
    const next = () => {};
    ensureLoggedIn(req, res, next);
  });
})