import assert from 'assert';
import { add } from '../app';

describe('add', () => {
    it('should return the sum of two numbers', () => {
        const result = add(1, 2);
        assert.equal(result, 3);
    });
})
