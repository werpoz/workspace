import { StringValueObject } from 'src/context/shared/domain/value-object/StringValueObject';

class StringValueObjectMock extends StringValueObject { }

describe('StringValueObject', () => {
    it('should create a valid instance', () => {
        const vo = new StringValueObjectMock('test');
        expect(vo.value).toBe('test');
    });

    it('should be equal to another instance with same value', () => {
        const vo1 = new StringValueObjectMock('test');
        const vo2 = new StringValueObjectMock('test');
        expect(vo1.equals(vo2)).toBeTruthy();
    });
});
