import { InvalidArgumentError } from 'src/context/shared/domain/value-object/InvalidArgumentError';

describe('InvalidArgumentError', () => {
    it('should be an instance of Error', () => {
        const error = new InvalidArgumentError('message');
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('message');
    });
});
