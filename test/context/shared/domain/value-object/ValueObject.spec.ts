import { ValueObject } from 'src/context/shared/domain/value-object/ValueObject';
import { InvalidArgumentError } from 'src/context/shared/domain/value-object/InvalidArgumentError';

class ValueObjectMock extends ValueObject<string> { }

describe('ValueObject', () => {
    it('should be defined', () => {
        const vo = new ValueObjectMock('test');
        expect(vo).toBeDefined();
        expect(vo.value).toBe('test');
    });

    it('should throw InvalidArgumentError if value is null', () => {
        expect(() => new ValueObjectMock(null as any)).toThrow(InvalidArgumentError);
    });

    it('should throw InvalidArgumentError if value is undefined', () => {
        expect(() => new ValueObjectMock(undefined as any)).toThrow(InvalidArgumentError);
    });

    it('should be equal to another instance with same value', () => {
        const vo1 = new ValueObjectMock('test');
        const vo2 = new ValueObjectMock('test');
        expect(vo1.equals(vo2)).toBeTruthy();
    });

    it('should not be equal to another instance with different value', () => {
        const vo1 = new ValueObjectMock('test');
        const vo2 = new ValueObjectMock('other');
        expect(vo1.equals(vo2)).toBeFalsy();
    });

    it('should return string representation', () => {
        const vo = new ValueObjectMock('test');
        expect(vo.toString()).toBe('test');
    });
});
