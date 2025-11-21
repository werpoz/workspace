import { NumberValueObject } from 'src/context/shared/domain/value-object/NumberValueObject';

class NumberValueObjectMock extends NumberValueObject { }

describe('NumberValueObject', () => {
    it('should create a valid instance', () => {
        const vo = new NumberValueObjectMock(10);
        expect(vo.value).toBe(10);
    });

    it('should check if value is bigger than another', () => {
        const vo1 = new NumberValueObjectMock(10);
        const vo2 = new NumberValueObjectMock(5);
        expect(vo1.isBiggerThan(vo2)).toBeTruthy();
    });

    it('should check if value is not bigger than another', () => {
        const vo1 = new NumberValueObjectMock(5);
        const vo2 = new NumberValueObjectMock(10);
        expect(vo1.isBiggerThan(vo2)).toBeFalsy();
    });
});
